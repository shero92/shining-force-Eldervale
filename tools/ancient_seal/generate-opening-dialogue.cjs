'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),output=path.join(root,'disasm/data/maps/ancientseal/dialogue-generated.asm');
// Keep names dynamic and lore unrevealed. These are original, decoded SF2 symbols.
const dialogue=[
 ['WELCOME','Good morning, {LEADER}.{N}Did you sleep well?{W1}'],
 ['GUIDANCE','The sea wind is gentle.{N}Take the east terrace{N}to Stormwatch Path.{W1}'],
 ['CARE','Stay close to the ridge.{N}Come home if the weather{N}turns. I will be here.{W1}'],
 ['REPEAT','Welcome home, {LEADER}.{N}Let me tend your wounds{N}and keep our record.{W1}'],
 ['STORM','A dragon circles above.{N}The wind suddenly falls{N}silent.{W1}'],
 ['STORM_WARNING','Thunder rolls over the sea.{N}Something glints below{N}on Bone-Tide Shore.{W1}'],
 ['SHORE_PENDING','The cliff trail breaks here.{N}The terrace road leads{N}back home.{W1}']
];
function generate() {
 const s=fs.readFileSync(path.join(root,'disasm/data/scripting/text/asciitotextsymbolmap.asm'),'utf8');
 const symbols=[...s.matchAll(/dc\.b\s+(\d+)\s*;/g)].map(m=>Number(m[1])); assert.equal(symbols.length,256);
 const tags={LEADER:0xF3,N:0xEF,W1:0xFA};
 let out='; ORIGINAL opening dialogue; SF2 symbol bytes, no commercial text bank.\nAncientSeal_OpeningTextPointers:\n';
 for(const [name] of dialogue)out+='                dc.l AncientSeal_Text_'+name+'\n';
 out+='AncientSeal_OpeningTextStart:\n';
 for(const [name,text] of dialogue) {
  const bytes=[2]; // nonempty sentinel for existing DisplayText setup
  for(const token of text.match(/\{[^}]+\}|./g)) {
   if(token.startsWith('{')) {const tag=token.slice(1,-1);assert(tag in tags);bytes.push(tags[tag]);}
   else { assert(symbols[token.charCodeAt(0)]!==1||token===' ','Unsupported glyph');bytes.push(symbols[token.charCodeAt(0)]); }
  }
  bytes.push(0xFE); out+='AncientSeal_Text_'+name+':\n';
  for(let i=0;i<bytes.length;i+=16)out+='                dc.b '+bytes.slice(i,i+16).map(b=>'$'+b.toString(16).toUpperCase().padStart(2,'0')).join(',')+'\n';
 }
 return out+'AncientSeal_OpeningTextEnd:\n                align\n';
}
if(require.main===module) {const s=generate();if(process.argv.includes('--check'))assert.equal(fs.readFileSync(output,'utf8').replace(/\r\n/g,'\n'),s);else fs.writeFileSync(output,s);console.log('PASS: seven original dialogue entries; dynamic leader name and native controls');}
module.exports={generate,dialogue};
