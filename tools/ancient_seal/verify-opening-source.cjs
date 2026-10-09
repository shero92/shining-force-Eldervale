'use strict';
// ROM-free cross-file checks. These deliberately do not claim CPU execution.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const enums=read('disasm/sf2enums.asm'),setups=read('disasm/data/maps/ancientseal/setups.asm'),maps=read('disasm/data/maps/ancientseal/opening.asm');
const entry=read('disasm/data/maps/entries.asm'),ms=read('disasm/data/maps/mapsetups.asm');
assert.match(enums,/if \(STANDARD_BUILD=1\)\s+gamestartMap = MAP_ANCIENT_SEAL_SANCTUARY\s+gamestartSavepointX = 12\s+gamestartSavepointY = 14\s+gamestartFacing = UP/);
assert.match(entry,/dc\.l AncientSeal_Sanctuary_Map/);assert.match(entry,/dc\.l AncientSeal_Stormwatch_Map/);
assert.match(ms,/msMap MAP_ANCIENT_SEAL_SANCTUARY, AncientSeal_Sanctuary_Setup/);
assert.match(ms,/msMap MAP_ANCIENT_SEAL_STORMWATCH, AncientSeal_Stormwatch_Setup/);
assert.match(setups,/msFixedEntity 12, 10, DOWN, MAPSPRITE_ANCIENT_SEAL_FATHER, eas_Init/);
assert.match(setups,/txt ANCIENT_SEAL_TEXT_CARE\s+setFlg ANCIENT_SEAL_WAKE_COMPLETE/);
assert.match(setups,/AncientSeal_FatherServices:\s+txt ANCIENT_SEAL_TEXT_REPEAT\s+jsr j_ChurchMenu/);
assert.match(setups,/chkFlg ANCIENT_SEAL_STORM_SEEN\s+bne\.s AncientSeal_NoStormRepeat/);
assert.match(setups,/txt ANCIENT_SEAL_TEXT_STORM_WARNING\s+setFlg ANCIENT_SEAL_STORM_SEEN/);
const savepoints=read('disasm/data/maps/global/savepointmapcoords.asm');
assert.match(savepoints,/savePointMapCoordinates MAP_ANCIENT_SEAL_SANCTUARY, 12, 14, UP/);
assert.match(savepoints,/savePointMapCoordinates MAP_ANCIENT_SEAL_STORMWATCH, 2, 10, RIGHT/);
assert.equal((setups.match(/setSavedByte #MAP_ANCIENT_SEAL_SANCTUARY, EGRESS_MAP/g)||[]).length,2);
const witch=read('disasm/code/specialscreens/witch/witchstart-standard.asm');
assert.match(witch,/jsr\s+NewGame[\s\S]*?jsr\s+NameAlly/);assert.match(witch,/setFlg 399[\s\S]*?jsr\s+\(SaveGame\)\.w/);
const flags=['WAKE_COMPLETE','STORM_SEEN','SWORD_FOUND','RUINS_BATTLE_CLEARED','FATHER_BRIEFED','GATE_REACHED'];
flags.forEach((name,i)=>assert.match(enums,new RegExp('ANCIENT_SEAL_'+name+': equ '+(912+i)+'\\b')));
// Disallow collisions with literal native uses outside the new scripts.
const flagOp=/\b(?:chkFlg|setFlg|clrFlg|checkF|setF|clearF|msFlag|fbcFlag|setStoryFlag)\s+(?:#)?(?:91[2-7]|\$39[0-5])\b/ig;
function scan(dir) { for(const f of fs.readdirSync(dir,{withFileTypes:true})) {const p=path.join(dir,f.name);if(f.isDirectory())scan(p);else if(f.name.endsWith('.asm')&&!p.includes(path.join('maps','ancientseal')))assert(!flagOp.test(fs.readFileSync(p,'utf8')),'Reserved story flag collision: '+p);flagOp.lastIndex=0;} }
scan(path.join(root,'disasm'));
assert.match(enums,/MAPSETUP_TEMP_FLAGS_START: equ 256/);assert.match(enums,/MAPSETUP_TEMP_FLAGS_COUNTER: equ 127/);
assert.match(enums,/FLAG_MASK: equ 1023/);assert.match(enums,/longwordGameFlagsCounter = 31/);
// Every external enum used by the authored maps/setups must exist.
for(const symbol of (maps+'\n'+setups).match(/\b(?:MAP_|MAPSPRITE_|MUSIC_|ANCIENT_SEAL_)[A-Z0-9_]+\b/g)||[])
 assert(new RegExp('^'+symbol+':','m').test(enums),'Undefined enum: '+symbol);
const text=read('disasm/code/common/scripting/text/textfunctions_1.asm');
assert.match(text,/cmpi\.w\s+#ANCIENT_SEAL_TEXT_END,d0\s+bcc\.s\s+@OriginalTextBank/);
assert.match(text,/cmpa\.l\s+#AncientSeal_OpeningTextStart,a0/);assert.match(text,/cmpa\.l\s+#AncientSeal_OpeningTextEnd,a0/);
const {dialogue}=require('./generate-opening-dialogue.cjs');
for(const [name,line] of dialogue) {assert(!/lemon|zeon|granseal|evil father/i.test(line));assert(line.endsWith('{W1}'));for(const page of line.split('{W1}'))for(const row of page.split('{N}'))assert(row.replace('{LEADER}','ABCDEFGHIJ').length<=28,name+' line too long');}
const intro=read('disasm/data/scripting/introtext-standard.asm');let count=0;
for(const m of intro.matchAll(/dc\.b\s+(\d+),'([^']*)',0/g)) {assert(Number(m[1])+m[2].length<=32,'Intro overrun');assert(/^[A-Z0-9 ,.\-!?:]+$/.test(m[2]));count++;}
assert(count>=10);assert(intro.includes('SHINING FORCE')&&intro.includes('THE ANCIENT SEAL'));
assert.match(read('disasm/sf2patches.asm'),/SCROLLING_TEXT_INTRODUCTION:\s+equ\s+1/);
assert.match(read('disasm/code/gameflow/start-standard/gameinit.asm'),/if \(SCROLLING_TEXT_INTRODUCTION=0\)\s+clr.w\s+d0\s+jsr\s+PlayIntroOrEndCutscene/);
console.log('PASS: native start/setup/warp enums, father services, persistent flags, resume coordinates, dialogue boundaries and '+count+' intro lines');
console.log('NOTE: source contracts only; SRAM round-trip and emulator boot remain untested');
