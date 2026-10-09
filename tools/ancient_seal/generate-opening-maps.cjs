'use strict';
// Author original Genesis map tiles and native SF2 block/layout streams.
// ROM-free. Layout is always 64x64 words; visible areas are smaller.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(ROOT, 'disasm/data/maps/ancientseal/opening-generated.asm');
const {art,EXTRA}=require('./opening-art.cjs');
const PALETTE = [0,0x240,0x482,0x6C6,0xA62,0xEC4,0xCEE,0xACC,0x688,0x244,0xCA4,0x4AE,0x04A,0xEC8,0x248,0xCEE];
const TILESET_COUNT=3, BLANK_TILE=0x100+TILESET_COUNT*128-1;
class Bits {
  constructor() { this.bits = ''; }
  put(v,n) { assert(n > 0 && v >= 0 && v < 2**n); this.bits += v.toString(2).padStart(n,'0'); }
  str(s) { this.bits += s; }
  buffer() { const s = this.bits.padEnd(Math.ceil(this.bits.length/16)*16,'0'); return Buffer.from(s.match(/.{8}/g).map(b=>parseInt(b,2))); }
}
const nibbleCodes = ['00','01','100','101','110','11100','11101','11110','1111100','1111101','1111110','111111100','111111101','111111110','1111111110','1111111111'];
function stackEncode(raw) {
  assert.equal(raw.length % 8,0);
  const b = new Bits(), history = Array.from({length:16},(_,i)=>i);
  for(let i=0;i<raw.length;i+=8) {
    // Four zero command nibbles give sixteen literal words (32 bytes).
    if(i%32===0) b.str('0000');
    for(const byte of raw.subarray(i,i+8)) for(const v of [byte>>4,byte&15]) {
      const ix=history.indexOf(v); b.str(nibbleCodes[ix]); history.splice(ix,1); history.unshift(v);
    }
  }
  assert.equal(raw.length%32,0);
  b.str('1110000'); // command bitmap 1000: end copy is first command
  b.put(0,11);
  return b.buffer();
}
// Blocks: initial empty/closed/open chest definitions are provided by engine.
// 111 = new tile flags, 000 = no flips/priority, 1 = absolute 9-bit tile.
function blockEncode(blocks) {
  const b=new Bits(); b.put(blocks.length*9,14);
  for(const block of blocks) for(const tile of block) { b.str('1110001'); b.put(tile-0x100,9); }
  return b.buffer();
}
function flags(b, word) {
  if(word&0x3c00) { b.str('11'); b.put(word>>>10,6); }
  else b.str(['00','100','101','01'][word>>>14]);
}
function layoutEncode(words) {
  assert.equal(words.length,4096);
  const b=new Bits(), histories=Array.from({length:2048},()=>[]); let cursor=2;
  function save(k,w) { const h=histories[k], i=h.indexOf(w); if(i>=0)h.splice(i,1); h.unshift(w); if(h.length>4)h.pop(); }
  words.forEach((w,i)=>{
    const left=i ? words[i-1]&1023 : 0, upper=i>=64 ? words[i-64]&1023 : 0, index=w&1023;
    if(index===cursor+1) { b.str('00'); flags(b,w); cursor++; }
    else {
      assert(index<=cursor,'Blocks must first occur in ascending order');
      b.str('1'); if(histories[left].length)b.str('1'); if(histories[upper|1024].length)b.str('1');
      b.put(index,Math.floor(Math.log2(cursor))+1); flags(b,w);
    }
    save(left,w); save(upper|1024,w);
  });
  return b.buffer();
}
const TYPES = ['grass','path','water','stone','roof','lantern','cliff','flowers','arch','tree','shrub','pillar','sand','sword',...EXTRA];
const pixels=art;
function tileBytes(images) {
  const out=[];
  for(const p of images) for(let ty=0;ty<3;ty++)for(let tx=0;tx<3;tx++)
    for(let y=0;y<8;y++)for(let x=0;x<8;x+=2)out.push((p[ty*8+y][tx*8+x]<<4)|p[ty*8+y][tx*8+x+1]);
  assert(out.length < TILESET_COUNT*4096);
  while(out.length<TILESET_COUNT*4096)out.push(0); // Separate 128-tile native banks
  return Buffer.from(out);
}
function map(name) {
  const w=64,h=64, a=Array(w*h).fill(0xC005); // water outside the play area
  const put=(x,y,t,solid=false)=>a[y*64+x]=(TYPES.indexOf(t)+3)|(solid?0xC000:0);
  // Hidden first row primes the block cursor without visible debug tiles.
  TYPES.forEach((t,x)=>put(x,0,t,true));
  // A dedicated empty block keeps the foreground transparent at y=32.
  a[TYPES.length] = 0xC000|(TYPES.length+3);
  a.fill(TYPES.length+3,32*64);
  if(name==='Sanctuary') {
    for(let y=2;y<23;y++)for(let x=2;x<31;x++)put(x,y,['grass','grass2','grass3'][(x*7+y*3)%3]);
    for(let y=10;y<=16;y++)for(let x=11;x<=13;x++)put(x,y,'path');
    for(let y=10;y<=11;y++)for(let x=9;x<=15;x++)put(x,y,'path');
    for(let y=0;y<3;y++)for(let x=0;x<4;x++)put(10+x,7+y,'temple'+(y*4+x),true);
    for(let y=14;y<=15;y++)for(let x=11;x<=31;x++)put(x,y,'path');
    for(const [x,y] of [[4,4],[4,8],[24,4],[27,7],[23,20],[27,20],[5,17],[6,10],[17,10]])for(let j=0;j<2;j++)for(let i=0;i<2;i++)put(x+i,y+j,'oak'+(j*2+i),true);
    for(let x=2;x<30;x++)put(x,22,'bank',true);
    for(const [x,y] of [[5,5],[25,5],[26,8],[24,21],[6,18]])put(x,y,'shrub',true);
    for(const [x,y] of [[9,4],[15,4],[20,12],[20,18]])put(x,y,'pillar',true);
    put(9,12,'lantern',true); put(15,12,'lantern',true);
    for(const [x,y] of [[8,14],[8,15],[9,15],[15,16],[16,16],[16,17],[15,18]])put(x,y,'flowers');
    for(const [x,y] of [[7,15],[9,17],[17,16],[18,17],[20,16]])put(x,y,'shrub',true);
    for(let y=19;y<=20;y++)for(let x=4;x<=9;x++)put(x,y,'flowers');
    for(let y=2;y<23;y++)put(30,y,'cliff',true);
    for(let y=14;y<=16;y++)put(30,y,'path');
    put(31,15,'path');
  } else if(name==='Stormwatch') {
    for(let y=7;y<=13;y++)for(let x=1;x<=38;x++)put(x,y,'grass');
    for(let y=9;y<=11;y++)for(let x=1;x<=38;x++)put(x,y,'path');
    for(let x=1;x<=38;x++) { put(x,7,'cliff',true); put(x,13,'cliff',true); }
    for(let x=22;x<=27;x++)put(x,8,'flowers');
    for(const x of [3,10,25,34])for(let j=0;j<2;j++)for(let i=0;i<2;i++)put(x+i,4+j,'oak'+(j*2+i),true);
    for(let x=1;x<=38;x++)put(x,14,'bank',true);
    for(const [x,y] of [[6,8],[6,12],[18,8],[18,12],[32,8],[32,12]])put(x,y,'pillar',true);
    for(const [x,y] of [[23,12],[27,12]])put(x,y,'shrub',true);
    put(0,10,'path'); put(38,10,'path'); put(39,10,'path');
  } else {
    // Bone-Tide Shore: a compact tidal shelf with a searchable sword and sealed ruins.
    for(let y=6;y<=18;y++)for(let x=1;x<=36;x++)put(x,y,y>=14?'water':'sand',y>=15);
    for(let x=1;x<=36;x++)put(x,6,'cliff',true);
    for(let y=9;y<=11;y++)for(let x=0;x<=36;x++)put(x,y,'sand');
    for(const [x,y] of [[7,8],[11,12],[17,7],[28,12],[31,8]])put(x,y,'beachpillar',true);
    for(const [x,y] of [[5,13],[9,13],[14,13],[26,13],[32,13]])put(x,y,'beachflowers');
    for(const [x,y,t] of [[7,7,'rib0'],[8,8,'rib1'],[13,12,'rib2'],[18,7,'rib0'],[25,12,'rib1'],[31,7,'rib0']])put(x,y,t,true);
    for(let x=1;x<=36;x++)put(x,14,'coast');
    put(22,10,'sword',true);
    put(36,10,'arch',true);
  }
  // Native movement calls warp/zone handlers only on marked event blocks.
  const mark=(x,y,event)=>a[y*64+x]=(a[y*64+x]&0xC3ff)|event;
  if(name==='Sanctuary')mark(31,15,0x1000);
  if(name==='Stormwatch') {
    mark(0,10,0x1000);mark(39,10,0x1000);
    for(let y=8;y<=12;y++)if(!(a[y*64+15]&0xc000))mark(15,y,0x1400);
  }
  if(name==='BoneTide') {
    mark(0,10,0x1000);
    for(const x of [3,35])for(let y=7;y<=14;y++)if(!(a[y*64+x]&0xc000))mark(x,y,0x1400);
  }
  return a;
}
function asm(label,data) {
  let s=label+':\n';
  for(let i=0;i<data.length;i+=16) { const words=[]; for(let j=i;j<Math.min(i+16,data.length);j+=2)words.push('$'+data.readUInt16BE(j).toString(16).toUpperCase().padStart(4,'0')); s+='                dc.w '+words.join(',')+'\n'; }
  return s;
}
function build() {
  const blocks=TYPES.map((_,b)=>Array.from({length:9},(_,i)=>0x100+b*9+i));
  blocks.push(Array(9).fill(BLANK_TILE));
  const pal=Buffer.alloc(32); PALETTE.forEach((c,i)=>pal.writeUInt16BE(c,i*2));
  return '; ORIGINAL AUTHOR-DEFINED DATA. Generated by generate-opening-maps.cjs.\n; Native SF2 stack tiles, block bitstream and 64x64 layout bitstreams.\n'+
    asm('AncientSeal_OpeningPalette',pal)+Array.from({length:TILESET_COUNT},(_,i)=>asm('AncientSeal_OpeningTiles'+(i?i+1:''),stackEncode(tileBytes(TYPES.map(pixels)).subarray(i*4096,(i+1)*4096)))).join('')+
    asm('AncientSeal_OpeningBlocks',blockEncode(blocks))+
    ['Sanctuary','Stormwatch','BoneTide'].map(n=>asm('AncientSeal_'+n+'_Layout',layoutEncode(map(n)))).join('');
}
function reachable(a,from,to,occupied=[]) {
  const q=[from], seen=new Set([from.join(',')]), solid=new Set(occupied.map(p=>p.join(',')));
  for(let i=0;i<q.length;i++) { const [x,y]=q[i]; if(x===to[0]&&y===to[1])return true;
    for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) { const k=[nx,ny].join(','); if(nx>=0&&nx<64&&ny>=0&&ny<64&&!seen.has(k)&&!(a[ny*64+nx]&0xC000)&&!solid.has(k)) { seen.add(k);q.push([nx,ny]); } }
  } return false;
}
function checkRoutes() {
  const a=map('Sanctuary'),b=map('Stormwatch'),c=map('BoneTide');
  for(const [m,x,y] of [[a,31,15],[b,0,10],[b,39,10],[c,0,10]])assert.equal(m[y*64+x]&0x3c00,0x1000,'Warp block needs native event flag');
  for(const [m,x,y] of [[b,15,10],[c,3,10],[c,35,10]])assert.equal(m[y*64+x]&0x3c00,0x1400,'Zone block needs native event flag');
  assert(reachable(a,[12,14],[12,11],[[12,10]]),'Father must be reachable');
  assert(reachable(a,[12,14],[31,15],[[12,10]]),'Exit must be reachable');
  assert(reachable(b,[2,10],[0,10]),'Return warp must be reachable');
  assert(reachable(b,[2,10],[15,10]),'Storm event must be reachable');
  assert(reachable(b,[2,10],[39,10]),'Bone-Tide warp must be reachable');
  assert(reachable(c,[2,10],[21,10]),'Sword approach must be reachable');
  assert(reachable(c,[2,10],[35,10]),'Sealed Ruins approach must be reachable');
  assert(!reachable(c,[2,10],[36,10]),'Unimplemented ruins must remain blocked');
  console.log('PASS: opening routes, Bone-Tide sword approach and sealed ruins boundary reachable');
}
if(require.main===module) {
  checkRoutes(); const s=build();
  if(process.argv.includes('--check')) { assert.equal(fs.readFileSync(OUTPUT,'utf8').replace(/\r\n/g,'\n'),s,'Generated maps are stale'); console.log('PASS: deterministic original opening map data current'); }
  else fs.writeFileSync(OUTPUT,s);
}
module.exports={map,build,pixels,tileBytes,stackEncode,blockEncode,layoutEncode,PALETTE,TYPES,reachable,BLANK_TILE,TILESET_COUNT};
