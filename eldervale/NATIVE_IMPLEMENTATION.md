# The Ancient Seal — Native Genesis Implementation Contract

**Scope:** first fully playable 45-minute chapter in SF2DISASM's original Motorola 68000 engine. This is a technical implementation plan, **not** a statement of completed gameplay.

## Source anchors already verified
| Purpose | Native source path | Required edit |
| --- | --- | --- |
| Configuration of intro | `disasm/sf2patches.asm` | Keep `SCROLLING_TEXT_INTRODUCTION: equ 1` |
| Opening text | `disasm/data/scripting/introtext-standard.asm` | Done: Ancient Seal intro; previous sword owner unrevealed |
| Game intro / title dispatch | `disasm/code/gameflow/start/gameintro.asm` | Currently dispatches original intro and `StartTitleScreen` |
| Title engine | `disasm/code/specialscreens/title/title.asm` | Original `tiles_TitleScreen`, layouts and `MUSIC_TITLE` |
| Title graphics layout | `disasm/data/graphics/specialscreens/titlescreen/titlescreenlayouts.asm` | Replace only after Genesis-safe logo conversion |
| Map index | `disasm/data/maps/map_names.txt` | Select existing placeholder/replacement map IDs |
| Map contents and events | `disasm/data/maps/entries/` | Wire actual map, event, NPC and warp data |
| Audio | `disasm/data/sound/musicbank0/`, `musicbank1/`, `sfxbank/` | Preserve existing engine interface; plan original tracks |

## Native progression flags (symbolic names until mapped to actual free SF2 flags)
- `ANCIENT_SEAL_WAKE_COMPLETE`: sanctuary wake interaction completed.
- `ANCIENT_SEAL_STORM_SEEN`: dragons and storm cutscene witnessed.
- `ANCIENT_SEAL_SWORD_FOUND`: item and vision obtained together.
- `ANCIENT_SEAL_RUINS_BATTLE_CLEARED`: first tactical encounter escape success.
- `ANCIENT_SEAL_FATHER_BRIEFED`: loving father's post-battle conversation.
- `ANCIENT_SEAL_GATE_REACHED`: silent gate reaction, end of chapter.

**Do not add these as raw ASM constants until a free flag range is verified.** Confirm all loads, saves, resumes and egress logic against real engine behavior.

## Map specifications (new art required, not implemented)
### A: Tidewatch Sanctuary — 00–08 min
- Cliffside home carved into pale ruins, amber lanterns, open sky, warm, lived-in details.
- NPC: adoptive father, two nonhostile creatures; Barok waits outdoors.
- Exits: home -> terrace -> overlooking footpath.
- Entry event: father checks on hero (affectionate, never cryptic exposition).
- Field tutorial: move, interact and equip; allow skipping repeat guidance.

### B: Stormwatch Path — 08–11 min
- Short ridge with wide dragon silhouette overhead, sudden wind and darkening sky.
- Event triggers only once, then grants shore access.
- No first full tactical combat here.

### C: Bone-Tide Shore — 11–15 min
- Sea cave edge, giant ancient bones, bright surf after the storm, a single worn blade.
- Search/inspect triggers sword vision of lone warrior + flames + portal, with voice:
  `THE SEAL WEAKENS. SEEK THE HEIRS OF POWER.`
- Do not show or name Lemon; do not explain markings.

### D: Sealed Ruins Approach — 15–28 min
- Tactical grid: old arch, broken columns, five intruders, forest exit tile.
- Player party: hero + Barok.
- Primary victory: hero reaches escape tile (not kill-all).
- Must handle all-enemies-defeated path as alternate victory or remain safely completable.
- Defeat and egress return to appropriate checkpoint without replaying item acquisition.

### E: Forest Marker / Silent Gate — 28–45 min
- Backtrack to father, then branch into tranquil forest marked by white stones.
- Gate scene unlocks after the battle, with an ominous response from the sword.
- Fade-out chapter-end event, preserve player control and save state.

## Hero and father assets
- Hero: human, 20–22, athletic, wild dark brown hair, worn sage/turquoise shoulder cape, feather/shell details, subtle blue marks. Requires map sprite, battle sprite, portrait, and palette validation.
- Father: old loving nonhuman sage, elongated ivory mask-face, branch-like antlers, patched foliage robe and amber lantern staff. Requires map sprite and portrait; not a secretly evil NPC.
- Barok: monster ally with visually friendly silhouette, readable tactical class and starting moves. Final species/name/art still design choices.
- Enemy silhouettes must contrast with friendly creatures; do not assign their origin yet.

## Actual engineering milestones
1. Preserve a known-good ROM build and build log.
2. Change scrolling intro, rebuild and capture emulator video/screenshot proof.
3. Choose map IDs after auditing `map_names.txt`; copy/replace map content only with compatible event + tileset connections.
4. Wire starting map and hero spawn through the real game initialization path.
5. Implement each area in dependency order: sanctuary -> ridge -> shore -> battle -> return -> gate.
6. Implement sprite sheets/portraits and tile data in Genesis-safe palette/tile formats.
7. Integrate item, flags and victory script; check resume, lose, egress and save.
8. Full timed test; target 45 minutes without filler.

## ROM acceptance checklist
- [ ] ROM boots and audio plays on a Genesis emulator.
- [ ] New scrolling intro text reads correctly with no overrun.
- [ ] Title screen and New Game route work.
- [ ] Save + reload return to correct scene.
- [ ] No unknown character identity leaks.
- [ ] First battle can be escaped and cannot softlock.
- [ ] Chapter can be completed in ~45 minutes on a fresh save.

**Copyright:** Never upload base `sf2.bin`, unmodified ROM data chunks extracted by the split tool, compiled game ROMs, or other original copyrighted assets to GitHub. The original game's graphics/music may only be used locally consistent with ownership and applicable rights.
