'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process'),g=require('./export-map-sprites.cjs');
const root=path.resolve(__dirname,'../..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'ancient-seal-sprites-'));
try {
  const source=fs.readFileSync(path.join(root,'disasm/data/graphics/ancientseal/character_tiles.asm'),'utf8');
  for(const name of ['Hero','Elder']) for(const facing of ['Up','Side','Down']) {
    const raw=g.walkFrames(source,name,facing),id=name+'-'+facing;
    fs.writeFileSync(path.join(dir,id+'.bin'),g.compress(raw));
    fs.writeFileSync(path.join(dir,id+'-expected.bin'),raw);
  }
  const r=spawnSync('java',['-Djava.awt.headless=true','-cp',
    path.join(root,'disasm/data/graphics/mapsprites/SF2MapSpriteManager.jar'),
    path.join(__dirname,'VerifyCharacterSprites.java'),dir],{encoding:'utf8'});
  process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');
  if(r.error) throw r.error;
  if(r.status!==0) throw Error('Independent sprite decoder failed: '+r.status);
  console.log('NOTE: decoder compatibility only; assembled game and movement remain untested.');
} finally { fs.rmSync(dir,{recursive:true,force:true}); }
