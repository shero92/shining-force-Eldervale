'use strict';
// Independent compatibility check: the repository's existing SF2MapCreator
// Java decoders must reproduce every generated tile, block, and layout word.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const g=require('./generate-opening-maps.cjs'),root=path.resolve(__dirname,'../..');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ancient-seal-maps-'));
try {
 const raw=g.tileBytes(g.TYPES.map(g.pixels));
 fs.writeFileSync(path.join(dir,'tiles.bin'),g.stackEncode(raw));fs.writeFileSync(path.join(dir,'tiles-expected.bin'),raw);
 const pal=Buffer.alloc(32);g.PALETTE.forEach((v,i)=>pal.writeUInt16BE(v,i*2));fs.writeFileSync(path.join(dir,'palette.bin'),pal);
 const blocks=g.TYPES.map((_,b)=>Array.from({length:9},(_,i)=>256+b*9+i));
 fs.writeFileSync(path.join(dir,'blocks.bin'),g.blockEncode(blocks));
 const blockWords=Buffer.alloc(blocks.length*18);blocks.flat().forEach((v,i)=>blockWords.writeUInt16BE(v,i*2));fs.writeFileSync(path.join(dir,'blocks-expected.bin'),blockWords);
 for(const n of ['Sanctuary','Stormwatch']) {
  fs.writeFileSync(path.join(dir,n+'.bin'),g.layoutEncode(g.map(n)));const b=Buffer.alloc(8192);g.map(n).forEach((v,i)=>b.writeUInt16BE(v,i*2));fs.writeFileSync(path.join(dir,n+'-expected.bin'),b);
 }
 const result=spawnSync('java',['-Djava.awt.headless=true','-cp',path.join(root,'disasm/data/maps/SF2MapCreator-1.2.1.jar'),path.join(__dirname,'VerifyOpeningMaps.java'),dir],{encoding:'utf8'});
 process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
 if(result.error)throw result.error;
 if(result.status!==0)throw Error('SF2 decoder compatibility failed: '+result.status);
 console.log('NOTE: data decoder tests only; no ROM assembly or emulator test performed');
} finally {fs.rmSync(dir,{recursive:true,force:true});}
