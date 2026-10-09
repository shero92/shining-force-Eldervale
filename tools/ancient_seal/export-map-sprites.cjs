#!/usr/bin/env node
'use strict';
// Original Ancient Seal 4bpp concept art -> SF2 basic-compressed map sprites.
// No ROM input or dependencies. Three facings, two native walk frames each.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const SOURCE = path.resolve(__dirname, '../../disasm/data/graphics/ancientseal/character_tiles.asm');
const OUTPUT = path.resolve(__dirname, '../../disasm/data/graphics/ancientseal/mapsprites-basic.asm');

function parseCharacter(source, name, facing = 'Down') {
  function section(label) {
    const marker = new RegExp('^AncientSeal_' + name + '_' + label + ':\\s*\\n([\\s\\S]*?)(?=^\\S|$(?![\\s\\S]))', 'm');
    const match = source.match(marker);
    if (!match) throw Error(name + ': missing ' + label + ' label');
    return match[1];
  }
  const palette = [...section('Palette').matchAll(/\$([0-9A-Fa-f]{4})\b/g)]
    .map(m => parseInt(m[1], 16));
  const rows = [...section(facing === 'Down' ? 'Tiles' : facing + '_Tiles').matchAll(/^\s*dc\.l\s+\$([0-9A-Fa-f]{8})\s*(?:;.*)?$/gm)]
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
        const distance = (word & 0xFFE0) >>> 4;
        const count = 33 - (word & 31);
        if (distance < 2 || distance > bytes.length || (distance & 1))
          throw Error('Invalid backward-copy command');
        for (let i = 0; i < count * 2; i++)
          bytes.push(bytes[bytes.length - distance]);
      } else bytes.push(word >> 8, word & 255);
    }
  }
  throw Error('Missing end marker');
}

function render(name, facing, data) {
  const lines = [
    '; ORIGINAL ' + name + ' ' + facing + ': 2 walk frames, 24x24, column-major tiles.',
    '; Shared UI/mapsprite palette indices; SF2 basic compression.',
    'AncientSeal_' + name + '_' + facing + '_MapSprite:'
  ];
  for (let i = 0; i < data.length; i += 16) {
    const words = [];
    for (let j = i; j < Math.min(i + 16, data.length); j += 2)
      words.push('$' + data.readUInt16BE(j).toString(16).toUpperCase().padStart(4, '0'));
    lines.push('                dc.w ' + words.join(','));
  }
  return lines.join('\n');
}

// Native mapsprites always use palette 3, shared with text, menus and icons.
// These are color-index mappings, not a replacement for the game's UI palette.
const COLOR_MAP = {
  Hero:  Array.from({length:16},(_,i)=>i),
  Elder: Array.from({length:16},(_,i)=>i)
};

function pixels(frame) {
  return Array.from({length:24}, (_,y) => Array.from({length:24}, (_,x) => {
    const byte = frame[(Math.floor(x/8)*3+Math.floor(y/8))*32+(y%8)*4+Math.floor((x%8)/2)];
    return (byte >> (x%2 ? 0 : 4)) & 15;
  }));
}
function pack(grid) {
  const raw=Buffer.alloc(288);
  for(let y=0;y<24;y++) for(let x=0;x<24;x++)
    raw[(Math.floor(x/8)*3+Math.floor(y/8))*32+(y%8)*4+Math.floor((x%8)/2)] |= grid[y][x] << (x%2 ? 0 : 4);
  return raw;
}
function walkFrames(source,name,facing) {
  const grid=pixels(parseCharacter(source,name,facing));
  const next=grid.map(row=>row.slice());
  // Move only the hem/feet. Head, horns, staff and blade do not jitter.
  const left=facing==='Side' ? [9,11] : [7,10];
  const right=facing==='Side' ? [12,name==='Hero' ? 14 : 15] : [13,16];
  for(const [bounds,delta] of [[left,-1],[right,1]]) {
    for(let y=19;y<=22;y++) for(let x=bounds[0];x<=bounds[1];x++) next[y][x]=0;
    for(let y=19;y<=22;y++) for(let x=bounds[0];x<=bounds[1];x++) {
      const target=y+delta;
      if(target>=18 && target<=22) next[target][x]=grid[y][x];
    }
  }
  const remap=g=>g.map(row=>row.map(index=>COLOR_MAP[name][index]));
  return Buffer.concat([pack(remap(grid)),pack(remap(next))]);
}

// Word back-references use an even byte distance in bits 15..5 and a
// 33-minus-word-count field in bits 4..0. A distance of 2 is native word RLE.
function compress(raw) {
  if(raw.length%2) throw Error('Expected whole words');
  if(!raw.length) return Buffer.from([0x80,0,0,0]);
  const result=[];let pos=0;
  for(;;) {
    const commands=[];let bits=0;
    for(let bit=15;bit>=0;bit--) {
      if(pos===raw.length) {bits|=1<<bit;commands.push(0);break;}
      let bestCount=0,bestDistance=0;
      for(let distance=2;distance<=Math.min(pos,4094);distance+=2) {
        let count=0;
        while(count<33 && pos+count*2+1<raw.length &&
          raw[pos+count*2]===raw[pos+count*2-distance] &&
          raw[pos+count*2+1]===raw[pos+count*2+1-distance]) count++;
        if(count>bestCount) {bestCount=count;bestDistance=distance;}
      }
      if(bestCount>=2) {
        bits|=1<<bit;commands.push((bestDistance<<4)|(33-bestCount));pos+=bestCount*2;
      } else {commands.push(raw.readUInt16BE(pos));pos+=2;}
    }
    result.push(bits,...commands);
    if(commands.at(-1)===0 && bits&(1<<(16-commands.length))) break;
  }
  // If the last group used all 16 bits for data, it still needs a terminator.
  const data=Buffer.alloc(result.length*2);result.forEach((v,i)=>data.writeUInt16BE(v,i*2));
  if(pos!==raw.length) throw Error('Compression incomplete');
  return data;
}

function generate(source) {
  return ['Hero', 'Elder'].flatMap(name => ['Up','Side','Down'].map(facing => {
    const expected=walkFrames(source,name,facing);
    assert.notDeepEqual(expected.subarray(0,288),expected.subarray(288),name+': distinct walk frames');
    const data = compress(expected);
    assert.deepEqual(decode(data), expected, name + ': compression round-trip');
    return render(name, facing, data);
  })).join('\n\n') + '\n';
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
      assert.equal(pointers[slot * 3 + facing], 'AncientSeal_' + name + '_' + ['Up','Side','Down'][facing] + '_MapSprite');
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
  for(const raw of [fixture,Buffer.alloc(576),Buffer.from('1234123412341234'), Buffer.alloc(64,255)])
    assert.deepEqual(decode(compress(raw)),raw);
  assert.deepEqual(decode(compress(Buffer.alloc(0))),Buffer.alloc(0));
  assert.throws(()=>compress(Buffer.alloc(1)));
  // A 4-byte distance and a 2-byte RLE command exercise the native decoder's
  // low distance bits, which the old mirror-only JS decoder discarded.
  assert.deepEqual(decode(Buffer.from([0x30,0,0x12,0x34,0x56,0x78,0,0x5F,0,0])),Buffer.from('1234567812345678','hex'));
  assert.throws(()=>decode(Buffer.from([0x80,0,0,0x5F])));
  const source=fs.readFileSync(SOURCE,'utf8');
  for(const name of ['Hero','Elder']) {
    assert.equal(COLOR_MAP[name][0],0,'Transparent index must remain transparent');
    assert(COLOR_MAP[name].slice(1).every(x=>x>0&&x<16),'Opaque colors must remain opaque');
    for(const facing of ['Up','Side','Down']) {
      const frames=walkFrames(source,name,facing),a=pixels(frames.subarray(0,288)),b=pixels(frames.subarray(288));
      assert.deepEqual(a.slice(0,18),b.slice(0,18),'Upper-body silhouette must stay fixed');
      if(name==='Hero'&&facing==='Side') for(let y=18;y<21;y++) assert.equal(a[y][15],b[y][15],'Blade must stay fixed');
      if(name==='Elder') for(let y=0;y<24;y++) assert.deepEqual(a[y].slice(19),b[y].slice(19),'Lantern staff must stay fixed');
    }
  }
  console.log('PASS: SF2 literal/copy/RLE codecs, two-frame streams and malformed-stream checks');
}

if (require.main === module) {
  try {
    if (process.argv.includes('--self-test')) selfTest();
    else {
      const result = generate(fs.readFileSync(SOURCE, 'utf8'));
      if (process.argv.includes('--check')) {
        assert.equal(fs.readFileSync(OUTPUT, 'utf8').replace(/\r\n/g, '\n'), result, 'Generated ASM is stale; regenerate with node tools/ancient_seal/export-map-sprites.cjs > disasm/data/graphics/ancientseal/mapsprites-basic.asm');
        verifyNativeWiring();
        console.log('PASS: original Hero/Elder 4bpp; 6 directional walk streams; shared palette indices; native pointers and generated ASM current');
      }
      else process.stdout.write(result);
    }
  } catch (error) { console.error('FAIL: ' + error.message); process.exitCode = 1; }
}
module.exports = { parseCharacter, encode, encodeMirroredFrames, decode, compress, walkFrames, pixels, pack, COLOR_MAP, generate, verifyNativeWiring };
