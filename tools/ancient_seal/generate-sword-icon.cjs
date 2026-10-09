#!/usr/bin/env node
'use strict';
// Original dormant Tideworn Blade, 16x24 pixels, shared menu palette indices.
// Icons are RAW 192-byte column-major tiles. They do not use sprite compression.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const OUTPUT=path.resolve(__dirname,'../../disasm/data/graphics/ancientseal/sword-icon.asm');
function pixels() {
  const grid=Array.from({length:24},()=>Array(16).fill(0));
  function dot(x,y,c) {if(x>=0&&x<16&&y>=0&&y<24)grid[y][x]=c;}
  // Salt-dark edge, ivory steel, dull blue fuller and rust near the crossguard.
  for(let y=3;y<=16;y++) {
    const x=13-Math.floor((y-3)*0.6);
    dot(x-1,y,3);dot(x,y,1);dot(x+1,y,4);
    if(y>5&&y<13)dot(x,y,6);
    if(y>13)dot(x,y,12);
  }
  for(let i=0;i<7;i++)dot(2+i,14+i,12);
  for(let i=0;i<6;i++)dot(2+i,15+i,7);
  for(let i=0;i<4;i++){dot(4-i,18+i,13);dot(5-i,18+i,12);}
  dot(1,22,7);dot(2,22,12);
  // Native LoadIcon writes highlight corners; leave their source pixels clear.
  return grid;
}
function rawPixels() {
  const g=pixels(),raw=Buffer.alloc(192);
  for(let x=0;x<16;x++)for(let y=0;y<24;y++)
    raw[(Math.floor(x/8)*3+Math.floor(y/8))*32+(y%8)*4+Math.floor(x%8/2)] |= g[y][x]<<(x%2?0:4);
  return raw;
}
function generate() {
  const raw=rawPixels(),lines=['; ORIGINAL Tideworn Blade inventory icon, 16x24, six column-major tiles.',
    '; Exactly 192 RAW bytes for LoadIcon; shared UI palette, no CRAM changes.'];
  for(let i=0;i<raw.length;i+=16)
    lines.push('                dc.l '+Array.from({length:4},(_,j)=>'$'+raw.readUInt32BE(i+j*4).toString(16).toUpperCase().padStart(8,'0')).join(','));
  return lines.join('\n')+'\n';
}
if(require.main===module) {
  const result=generate();
  if(process.argv.includes('--check')) {
    assert.equal(fs.readFileSync(OUTPUT,'utf8'),result,'Stale sword icon ASM');
    const entries=fs.readFileSync(path.resolve(__dirname,'../../disasm/data/graphics/icons/entries-standard.asm'),'utf8');
    assert.match(entries,/ItemIcon127:\s+include "data\/graphics\/ancientseal\/sword-icon\.asm"/);
    assert.equal(rawPixels().length,192);
    console.log('PASS: original Tideworn Blade raw icon (192 bytes), item 127 wiring and native icon stride');
  } else process.stdout.write(result);
}
module.exports={pixels,rawPixels,generate};
