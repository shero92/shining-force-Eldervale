#!/usr/bin/env node
'use strict';
// Original Ancient Seal 4bpp concept art -> SF2 basic-compressed map sprites.
// No ROM input or dependencies. Static two-frame prototypes, not walk cycles.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const SOURCE = path.resolve(__dirname, '../../disasm/data/graphics/ancientseal/character_tiles.asm');
const OUTPUT = path.resolve(__dirname, '../../disasm/data/graphics/ancientseal/mapsprites-basic.asm');

function parseCharacter(source, name) {
  function section(label) {
    const marker = new RegExp('^AncientSeal_' + name + '_' + label + ':\\s*\\n([\\s\\S]*?)(?=^\\S|$(?![\\s\\S]))', 'm');
    const match = source.match(marker);
    if (!match) throw Error(name + ': missing ' + label + ' label');
    return match[1];
  }
  const palette = [...section('Palette').matchAll(/\$([0-9A-Fa-f]{4})\b/g)]
    .map(m => parseInt(m[1], 16));
  const rows = [...section('Tiles').matchAll(/^\s*dc\.l\s+\$([0-9A-Fa-f]{8})\s*(?:;.*)?$/gm)]
    .map(m => m[1]);
  if (palette.length !== 16 || palette[0] !== 0 || palette.some(c => (c & 0xF111) !== 0))
    throw Error(name + ': expected 16 valid Genesis CRAM colors, index 0 transparent');
  if (rows.length !== 72) throw Error(name + ': expected 9 column-major tiles x 8 rows');
  const frame = Buffer.from(rows.join(''), 'hex');
  if (frame.length !== 288) throw Error(name + ': expected 288 bytes of 4bpp tiles');
  return frame;
}

// LoadBasicCompressedData in disasm/code/common/tech/graphics/decompression.asm:
// 0 command bit = literal 16-bit word; 1 bit + zero word = end marker.
// Use 16 literal words per zero command word; no risky back-references.
function encode(raw) {
  if (raw.length % 32) throw Error('Input must contain whole 32-byte blocks');
  const chunks = [];
  for (let i = 0; i < raw.length; i += 32)
    chunks.push(Buffer.from([0, 0]), raw.subarray(i, i + 32));
  chunks.push(Buffer.from([0x80, 0, 0, 0]));
  return Buffer.concat(chunks);
}

// Nine literal blocks, then five back-references at a 288-byte distance.
// Copy 32+32+32+32+16 words to mirror frame one into frame two.
function encodeMirroredFrames(frame) {
  if (frame.length !== 288) throw Error('Expected one 288-byte 24x24 frame');
  const chunks = [];
  for (let i = 0; i < frame.length; i += 32)
    chunks.push(Buffer.from([0, 0]), frame.subarray(i, i + 32));
  const suffix = Buffer.alloc(14);
  suffix.writeUInt16BE(0xFC00, 0); // 5 copy bits followed by terminator bit
  for (let i = 0; i < 5; i++)
    suffix.writeUInt16BE(0x1200 | (i === 4 ? 17 : 1), 2 + i * 2);
  suffix.writeUInt16BE(0, 12);
  return Buffer.concat([...chunks, suffix]);
}

// Independent decoder for literals and backward-copy commands.
function decode(data) {
  const bytes = [];
  let offset = 0;
  while (offset < data.length) {
    if (offset + 2 > data.length) throw Error('Truncated command');
    const command = data.readUInt16BE(offset); offset += 2;
    for (let bit = 15; bit >= 0; bit--) {
      if (offset + 2 > data.length) throw Error('Truncated literal');
      const word = data.readUInt16BE(offset); offset += 2;
      if (command & (1 << bit)) {
        if (word === 0) {
          if (offset !== data.length) throw Error('Trailing data after end marker');
          return Buffer.from(bytes);
        }
        const distance = (word & 0xFE00) >>> 4;
        const count = 33 - (word & 31);
        if ((word & 0xFE00) <= 0x0200 || distance > bytes.length || (distance & 1))
          throw Error('Invalid backward-copy command');
        for (let i = 0; i < count * 2; i++)
          bytes.push(bytes[bytes.length - distance]);
      } else bytes.push(word >> 8, word & 255);
    }
  }
  throw Error('Missing end marker');
}

function render(name, data) {
  const lines = [
    '; ORIGINAL ' + name + ': 2 identical 24x24 frames, column-major tiles.',
    '; Basic-compressed with mirrored-frame backrefs; no facing/walk animation.',
    'AncientSeal_' + name + '_MapSprite:'
  ];
  for (let i = 0; i < data.length; i += 16) {
    const words = [];
    for (let j = i; j < Math.min(i + 16, data.length); j += 2)
      words.push('$' + data.readUInt16BE(j).toString(16).toUpperCase().padStart(4, '0'));
    lines.push('                dc.w ' + words.join(','));
  }
  return lines.join('\n');
}

function generate(source) {
  return ['Hero', 'Elder'].map(name => {
    const frame = parseCharacter(source, name);
    const expected = Buffer.concat([frame, frame]);
    const data = encodeMirroredFrames(frame);
    assert.deepEqual(decode(data), expected, name + ': compression round-trip');
    if (data.length !== 320) throw Error(name + ': unexpected encoded length');
    return render(name, data);
  }).join('\n\n') + '\n';
}

// Static source check: slots 237-239 are the unused native map-sprite slots.
// This does not establish ROM assembly, palette correctness, or animation.
function verifyNativeWiring() {
  const root = path.resolve(__dirname, '../..');
  const entries = fs.readFileSync(path.join(root, 'disasm/data/graphics/mapsprites/entries.asm'), 'utf8');
  const enums = fs.readFileSync(path.join(root, 'disasm/sf2enums.asm'), 'utf8');
  const allies = fs.readFileSync(path.join(root, 'disasm/data/stats/allies/allymapsprites.asm'), 'utf8');
  const table = entries.slice(0, entries.indexOf('Mapsprite000_0:'));
  const pointers = [...table.matchAll(/\bdc\.l\s+(\w+)/g)].map(m => m[1]);
  assert.equal(pointers.length, 720, 'Expected 240 sprites x 3 facing pointers');
  for (const [slot, name] of [[237, 'Hero'], [238, 'Hero'], [239, 'Elder']])
    for (let facing = 0; facing < 3; facing++)
      assert.equal(pointers[slot * 3 + facing], 'AncientSeal_' + name + '_MapSprite');
  assert.match(entries, /include\s+"data\/graphics\/ancientseal\/mapsprites-basic\.asm"/);
  assert.doesNotMatch(entries, /Mapsprite237_0:\s*incbin/);
  for (const [name, index] of [['HERO_BASE', 237], ['HERO_PROMO', 238], ['FATHER', 239]])
    assert.match(enums, new RegExp('MAPSPRITE_ANCIENT_SEAL_' + name + ':\\s*equ\\s+' + index + '\\b'));
  assert.match(allies, /mapsprite\s+ANCIENT_SEAL_HERO_PROMO\s*;\s*0:\s*BOWIE/);
}

function selfTest() {
  const fixture = Buffer.from(Array.from({length: 576}, (_, i) => (i * 17) & 255));
  assert.deepEqual(decode(encode(fixture)), fixture);
  assert.throws(() => decode(encode(fixture).subarray(0, -2)));
  assert.throws(() => encode(Buffer.alloc(31)));
  const frame = fixture.subarray(0, 288);
  assert.deepEqual(decode(encodeMirroredFrames(frame)), Buffer.concat([frame, frame]));
  assert.throws(() => decode(Buffer.from([0x80, 0, 0x12, 0x01])));
  assert.throws(() => encodeMirroredFrames(Buffer.alloc(287)));
  console.log('PASS: SF2 literal/mirrored-frame codecs and malformed-stream checks');
}

if (require.main === module) {
  try {
    if (process.argv.includes('--self-test')) selfTest();
    else {
      const result = generate(fs.readFileSync(SOURCE, 'utf8'));
      if (process.argv.includes('--check')) {
        assert.equal(fs.readFileSync(OUTPUT, 'utf8').replace(/\r\n/g, '\n'), result, 'Generated ASM is stale; regenerate with node tools/ancient_seal/export-map-sprites.cjs > disasm/data/graphics/ancientseal/mapsprites-basic.asm');
        verifyNativeWiring();
        console.log('PASS: original Hero/Elder 4bpp and CRAM; 2 x 320-byte SF2 map-sprite streams; native pointers and generated ASM current');
      }
      else process.stdout.write(result);
    }
  } catch (error) { console.error('FAIL: ' + error.message); process.exitCode = 1; }
}
module.exports = { parseCharacter, encode, encodeMirroredFrames, decode, generate, verifyNativeWiring };
