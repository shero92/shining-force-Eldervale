# Native progress / next run

Updated 2026-10-09. Active branch: `feature/ancient-seal-prologue`.
Goal: one hour of genuinely playable original Genesis content, without filler.
**Goal not met; no timed emulator playthrough has occurred.**

## Current source implementation
- STANDARD_BUILD New Game retains `NameAlly` and the existing SRAM save menu;
  starts in Tidewatch Sanctuary (map slot 43), `(12,14)`, facing up.
- Original Sanctuary, Stormwatch (slot 45), and Bone-Tide Shore (slot 50) use a
  shared 128-tile 4bpp tileset, one original CRAM palette, 14 original 3x3
  blocks and native 64x64 layouts.
  Trees, shrubs, ivory pillars, lanterns, cliff edges and water are preliminary
  tile art, not a finished reproduction of the approved concept references.
- Father NPC at `(12,10)` uses existing original sprite slot 239.
  First talk welcomes the named hero and gives directions; repeat talk opens
  the original ChurchMenu for saving/healing. Father remains affectionate.
- Warp `(31,15)` -> Stormwatch `(2,10)`; its west return reaches Sanctuary and
  its east exit `(39,10)` reaches Bone-Tide `(2,10)`. Bone-Tide's west exit
  returns to Stormwatch `(37,10)`.
- Stormwatch crossing x=15 shows original dialogue once, using saved flag 913.
  Dragon/weather animation and audio effects are NOT implemented.
- Bone-Tide includes authored sand, tide, wreck-bone shapes and sword tile art.
  Searching the sword at `(22,10)` uses the engine's mandatory-item path, so a
  full inventory invokes its discard flow. It grants item 127, `Tideworn
  Blade`, as a rare unsellable dormant story item, then plays a once-only
  five-beat vision and saves flag 914. No previous owner or Lemon link is named.
  The sword block is replaced immediately and again on reload through a flag
  block event. The Sealed Ruins approach is reachable but remains closed.
- Flags 912..917 are reserved, cataloged and source-audited. Only 912/913 are
  currently set. Temporary flags are 256..383 and cannot clear these flags.
- New Game sets flag 399 before its initial save so loading uses per-map
  savepoints before the first tactical battle. Egress goes to Sanctuary.
- Original dialogue occupies IDs $1100..$110F, outside the original 17 text
  banks. DisplayText/GetNextTextSymbol use bounded original decoded-symbol
  entries while retaining the existing name, line, wait and window behavior.
- STANDARD_BUILD with scrolling intro enabled skips the original SF2 intro
  cutscene. Title art remains the original local resource.

## Validation performed
- Deterministic generated ASM checks for maps, dialogue and map sprites.
- Existing SF2MapCreator Java decoders recovered all 4096 tileset bytes,
  14 authored blocks, and all 4096 block/flag words in all three maps.
- Source checks: spawn/setup wiring, enums, flag allocation, savepoint routing,
  name entry, dialogue bounds, mystery preservation, and 16 intro lines.
- Route search: spawn -> father approach -> east exit; Stormwatch -> return,
  storm event and Bone-Tide exit; shore spawn -> sword and Sealed Ruins
  approaches. The unfinished ruins interior remains blocked.
- Sprite literal/back-reference round-trip and malformed-stream tests pass.

**Not tested:** ROM assembly, 68000 execution, emulator boot, input, church
menus, SRAM round-trip, actual warps, sprite colors/facing/animation and timing.
There is no local lawful `rom/sf2.bin`; extracted base resources are absent.
The Windows assembler is also not runnable in this Linux environment as-is.
Do not turn source/data test success into a ROM/playability claim.

## Resume priorities
1. Inspect this file and remote branch before editing; check for a supplied
   lawful local ROM and build/emulator tools. Never commit a ROM or its splits.
2. Build the new start route and test fresh naming, movement, father talk,
   repeat services, both warps, storm replay prevention, save/load and egress.
   Old original-SF2 saves are not compatible with repurposed map slots.
3. Correct/finish Hero/Father directional walk cycles and palette integration;
   existing sprites are static prototypes and their dedicated palettes have
   not been connected to the native shared UI/mapsprite palette.
4. Add Barok and Sealed Ruins battle (five intruders), escape-tile win plus
   all-enemies-defeated fallback, loss/egress checkpoints, then return to father
   and Silent Gate Forest. No browser prototype work is needed.
5. Replace the shared placeholder icon for item 127 with original compressed
   Genesis icon data after the local split assets/toolchain are available.
6. Finish art/audio, then run a genuinely timed fresh-save hour acceptance
   playthrough. Add meaningful content if short; never artificial delays.

## Repeatable source commands (Node 22+, Java 17+)
```
node tools/ancient_seal/export-map-sprites.cjs --self-test
node tools/ancient_seal/export-map-sprites.cjs --check
node tools/ancient_seal/generate-opening-maps.cjs --check
node tools/ancient_seal/generate-opening-dialogue.cjs --check
node tools/ancient_seal/verify-opening-source.cjs
node tools/ancient_seal/verify-opening-maps.cjs
```
The Java test uses the repository's existing SF2MapCreator jar and only
original generated fixtures in a disposable temp directory; no ROM input.
