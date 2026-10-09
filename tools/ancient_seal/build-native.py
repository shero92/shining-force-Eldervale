#!/usr/bin/env python3
"""Build the native prologue using the included assemblers on Windows or Wine."""
import os
from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]


def main():
    if os.name != 'nt' and not shutil.which('wine'):
        raise SystemExit('Install Wine with 32-bit support before building.')
    rom = (ROOT / 'rom/sf2.bin').read_bytes()
    if len(rom) != 0x200000 or rom[0x100:0x104] != b'SEGA':
        raise SystemExit('Expected the original 2 MiB US Genesis ROM in BIN format.')
    count = 0
    for line in (ROOT / 'split/sf2splits.txt').read_text().splitlines():
        entry = re.fullmatch(r'#split\s+(0x[\da-fA-F]+),(0x[\da-fA-F]+),(.+)', line)
        if not entry:
            continue
        start, end = int(entry[1], 16), int(entry[2], 16)
        if not 0 <= start <= end <= len(rom):
            raise SystemExit(f'Invalid ROM split: {line}')
        target = ROOT / 'disasm' / entry[3].strip().replace('\\', '/')
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(rom[start:end])
        count += 1
    print(f'Extracted {count} base resources.', flush=True)
    env = dict(os.environ, WINEDEBUG='-all')
    env.setdefault('WINEPREFIX', str(ROOT.parent / 'wine-prefix'))
    env.setdefault('WINEARCH', 'win32')

    def run(args, cwd):
        def windows_arg(arg):
            value = str(arg)
            return 'Z:' + value.replace('/', '\\') if value.startswith('/') and len(value) > 3 else value
        command = [str(arg) for arg in args] if os.name == 'nt' else [
            'wine', str(args[0]), *[windows_arg(arg) for arg in args[1:]]]
        subprocess.run(command, cwd=cwd, env=env, check=True)

    jobs = [
        ('code/common/tech/sound/cubewiz', 'cubewiz', '0000', '1fff'),
        ('data/sound/musicbank0', 'musicbank0', '8000', 'ffff'),
        ('data/sound/musicbank1', 'musicbank1', '8000', 'ffff'),
        ('data/sound/sfxbank', 'sfxbank', 'E000', 'ffff'),
    ]
    for directory, name, start, end in jobs:
        cwd = ROOT / 'disasm' / directory
        run([ROOT / 'tools/asw/asw.exe', f'{name}.asm'], cwd)
        run([ROOT / 'tools/asw/p2bin.exe', f'{name}.p',
             ROOT / f'disasm/data/sound/{name}.bin', '-k', '-r', f'${start}-${end}'], cwd)
    output = ROOT / 'build/ancient-seal-preview.bin'
    output.unlink(missing_ok=True)
    run([ROOT / 'tools/ASM68K.EXE', '/e', 'VANILLA_BUILD=0',
         '/e', 'STANDARD_BUILD=1', '/e', 'TEST_BUILD=0', '/k', '/m',
         '/o', 'ae-,e+,w+', '/p',
         'sf2.asm,../build/ancient-seal-preview.bin,../build/ancient-seal-preview.sym,../build/ancient-seal-preview.lst'],
        ROOT / 'disasm')
    if not output.is_file() or not 0x200000 <= output.stat().st_size <= 0x400000:
        raise SystemExit('Assembly did not produce a valid-sized ROM.')
    run([ROOT / 'tools/fixheader.exe', output], ROOT)
    built = output.read_bytes()
    checksum = sum(int.from_bytes(built[i:i+2], 'big')
                   for i in range(0x200, len(built), 2)) & 0xffff
    if built[0x100:0x104] != b'SEGA' or int.from_bytes(built[0x18e:0x190], 'big') != checksum:
        raise SystemExit('ROM header/checksum verification failed.')
    import hashlib
    digest = hashlib.sha256(built).hexdigest()
    output.with_suffix('.sha256').write_text(f'{digest}  {output.name}\n')
    print(f'Built {output} ({len(built)} bytes, SHA-256 {digest})', flush=True)


if __name__ == '__main__':
    main()
