#!/usr/bin/env python3
"""Execute the repository's actual 68000 sprite decoder in a tiny test ROM.

Requires a local vasm Motorola assembler and Genesis Plus GX libretro core.
No original ROM is read; neither the test ROM nor external tools are committed.
This is a decoder execution test, NOT an assembled-game/playthrough test.
"""
import argparse
import ctypes as C
import json
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]


def fixtures():
    script = """
const fs=require('fs'),g=require('./tools/ancient_seal/export-map-sprites.cjs');
const source=fs.readFileSync('disasm/data/graphics/ancientseal/character_tiles.asm','utf8');
const rows=[];
for(const name of ['Hero','Elder'])for(const facing of ['Up','Side','Down']) {
 const raw=g.walkFrames(source,name,facing);
 rows.push({name:name+'-'+facing,raw:raw.toString('hex'),encoded:g.compress(raw).toString('hex')});
}
process.stdout.write(JSON.stringify(rows));
"""
    return json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT))


def build_test(rows, directory, assembler):
    source = (ROOT / 'disasm/code/common/tech/graphics/decompression.asm').read_text()
    # Keep the complete native basic decoder, through its word-RLE path.
    decoder = source[source.index('LoadBasicCompressedData:'):source.index('                movem.l d0-a2/a5,-(sp)')]
    lines = ['    org 0', '    dc.l $FFFF00,Start', '    dcb.l 62,Hang',
             "    dc.b 'SEGA GENESIS    '", '    dcb.b 240,0', 'Start:', '    move.w #$2700,sr']
    for i, row in enumerate(rows):
        lines += [f'    lea Stream{i},a0', f'    lea ${0xFF0000+i*1024:06X},a1',
                  '    jsr LoadBasicCompressedData', f'    move.w d0,${0xFF7000+i*2:06X}']
    lines += ['    move.l #$53463221,$FF7100', 'Hang:', '    bra.s Hang', decoder]
    for i, row in enumerate(rows):
        data = bytes.fromhex(row['encoded'])
        (directory / f'stream{i}.bin').write_bytes(data)
        lines += [f'Stream{i}:', f'    incbin "stream{i}.bin"']
    lines += ['    dcb.b $10000-*,0']
    (directory / 'probe.asm').write_text('\n'.join(lines) + '\n')
    subprocess.run([str(assembler), '-m68000', '-Fbin', '-quiet', '-o', 'probe.bin', 'probe.asm'],
                   cwd=directory, check=True)
    return (directory / 'probe.bin').read_bytes()


def execute(core_path, rom, rows, folder):
    class GameInfo(C.Structure):
        _fields_ = [('path', C.c_char_p), ('data', C.c_void_p), ('size', C.c_size_t), ('meta', C.c_char_p)]
    ENV = C.CFUNCTYPE(C.c_bool, C.c_uint, C.c_void_p)
    VIDEO = C.CFUNCTYPE(None, C.c_void_p, C.c_uint, C.c_uint, C.c_size_t)
    AUDIO = C.CFUNCTYPE(None, C.c_int16, C.c_int16)
    BATCH = C.CFUNCTYPE(C.c_size_t, C.POINTER(C.c_int16), C.c_size_t)
    POLL = C.CFUNCTYPE(None)
    INPUT = C.CFUNCTYPE(C.c_int16, C.c_uint, C.c_uint, C.c_uint, C.c_uint)
    core = C.CDLL(str(core_path))
    location = str(folder).encode()

    def environment(command, data):
        if command in (9, 30, 31):
            C.cast(data, C.POINTER(C.c_char_p))[0] = location
            return True
        if command == 3:
            C.cast(data, C.POINTER(C.c_bool))[0] = True
            return True
        return command in (10, 16, 18)

    # Retain callbacks for the entire native execution lifetime.
    callbacks = [('environment', ENV(environment)),
                 ('video_refresh', VIDEO(lambda *args: None)),
                 ('audio_sample', AUDIO(lambda *args: None)),
                 ('audio_sample_batch', BATCH(lambda data, count: count)),
                 ('input_poll', POLL(lambda: None)),
                 ('input_state', INPUT(lambda *args: 0))]
    for name, callback in callbacks:
        getattr(core, 'retro_set_' + name)(callback)
    core.retro_init()
    core.retro_load_game.argtypes = [C.POINTER(GameInfo)]
    core.retro_load_game.restype = C.c_bool
    buffer = C.create_string_buffer(rom)
    info = GameInfo(str(folder / 'probe.bin').encode(), C.cast(buffer, C.c_void_p), len(rom), None)
    if not core.retro_load_game(C.byref(info)):
        raise RuntimeError('Core could not load the decoder test ROM')
    try:
        for _ in range(10):
            core.retro_run()
        core.retro_get_memory_data.argtypes = [C.c_uint]
        core.retro_get_memory_data.restype = C.c_void_p
        core.retro_get_memory_size.argtypes = [C.c_uint]
        core.retro_get_memory_size.restype = C.c_size_t
        size = core.retro_get_memory_size(2)  # RETRO_MEMORY_SYSTEM_RAM
        if size != 65536:
            raise RuntimeError(f'Unexpected Genesis RAM size: {size}')
        ram = C.string_at(core.retro_get_memory_data(2), size)
        # GX exposes host-endian 16-bit RAM words on little-endian hosts.
        if ram[0x7100:0x7104] == b'FS!2':
            normalized = bytearray(size)
            normalized[0::2], normalized[1::2] = ram[1::2], ram[0::2]
            ram = bytes(normalized)
        if ram[0x7100:0x7104] != b'SF2!':
            raise AssertionError('68000 decoder did not reach the completion marker: ' + ram[0x7000:0x7010].hex() + '/' + ram[0x7100:0x7104].hex())
        for i, row in enumerate(rows):
            expected = bytes.fromhex(row['raw'])
            if ram[i*1024:i*1024+576] != expected:
                raise AssertionError(row['name'] + ': 68000 output differs')
            if int.from_bytes(ram[0x7000+i*2:0x7002+i*2], 'big') != 576:
                raise AssertionError(row['name'] + ': native output byte count differs')
            print('PASS: actual 68000 LoadBasicCompressedData decoded ' + row['name'] + ' (576 bytes)')
    finally:
        core.retro_unload_game()
        core.retro_deinit()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--assembler', required=True, type=Path)
    parser.add_argument('--core', required=True, type=Path)
    args = parser.parse_args()
    rows = fixtures()
    with tempfile.TemporaryDirectory(prefix='ancient-seal-68000-') as temporary:
        directory = Path(temporary)
        execute(args.core.resolve(), build_test(rows, directory, args.assembler.resolve()), rows, directory)
    print('NOTE: isolated decoder execution only; full game build, SRAM, movement and timing remain untested.')


if __name__ == '__main__':
    main()
