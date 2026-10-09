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
- Father NPC at `(12,10)` uses original sprite slot 239.
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
- Flags 912..917 are reserved, cataloged and source-audited. 912, 913 and 914 are
  currently set. Temporary flags are 256..383 and cannot clear these flags.
- New Game sets flag 399 before its initial save so loading uses per-map
  savepoints before the first tactical battle. Egress goes to Sanctuary.
- Hero and Father now have authored Up/Side/Down silhouettes, two distinct
  walk frames each, and remapped color indices for the native shared UI palette.
  Engine horizontal mirroring supplies the opposite side. These remain coarse
  prototype pixel art, not finished approved-reference character animation.
- Item 127 now has an original 16x24, 192-byte RAW icon in STANDARD_BUILD.
  The native icon loader uses fixed strides, not sprite compression.
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
- Sprite literal/back-reference/RLE round-trips and malformed-stream tests pass.
  Fixed the JS decoder distance mask to retain bits 5..8 used by short copies.
- SF2MapSpriteManager independently decoded all six directional streams into
  576 bytes / 18 tiles apiece, matching both authored walk frames.
- Executed the repository's actual 68000 LoadBasicCompressedData, including
  short-distance copies and word RLE, in Genesis Plus GX using an isolated
  test ROM generated from source (NO original ROM input). All six 576-byte
  outputs and returned lengths matched. This does not test the full game.
- Inspected rendered character directions and sword icon using the locally
  supplied shared palette; no replacement of UI CRAM or extracted art committed.

**Not tested:** full-game ROM assembly/execution, emulator boot, input, church
menus, SRAM round-trip, actual warps, sprite colors/facing/animation and timing.
The user-provided `rom/sf2.bin` is present and 1748 resources were extracted.
Local build is blocked by 32-bit Wine Exec format error and wineserver socket
restrictions. Direct vasm assembly is incompatible with the ASM68K directives.
A Windows GitHub Actions workflow now builds the sound banks and STANDARD_BUILD,
verifies the ROM header/checksum, and uploads the preview and diagnostics.
The user explicitly confirmed publication of the base ROM and build workflow
on 2026-10-09. Git CLI has no write credentials; publication uses the connected
GitHub API. No full preview has been assembled or emulator-tested yet.
Do not turn source/data test success into a ROM/playability claim.

## Resume priorities
1. Inspect this file and remote branch before editing; check for a supplied
   lawful local ROM and build/emulator tools. The user explicitly authorized
   publishing the supplied base ROM. Do not commit extracted splits.
   Preserve the latest remote directional-character and sword-icon changes.
2. Build the new start route and test fresh naming, movement, father talk,
   repeat services, both warps, storm replay prevention, save/load and egress.
   Old original-SF2 saves are not compatible with repurposed map slots.
3. Validate/refine Hero/Father directions, shared-palette appearance and gait
   in the assembled game. Source/data/isolated-decoder tests now pass, but
   native mirroring, on-map timing and visual integration remain untested.
4. Add Barok and Sealed Ruins battle (five intruders), escape-tile win plus
   all-enemies-defeated fallback, loss/egress checkpoints, then return to father
   and Silent Gate Forest. No browser prototype work is needed.
5. Test the new original RAW icon for item 127 in inventory, receiving-item,
   discard and church/deals menus; it must stay unsellable and unequippable.
6. Finish art/audio, then run a genuinely timed fresh-save hour acceptance
   playthrough. Add meaningful content if short; never artificial delays.

## Repeatable source commands (Node 22+, Java 17+)
```
node tools/ancient_seal/export-map-sprites.cjs --self-test
node tools/ancient_seal/export-map-sprites.cjs --check
node tools/ancient_seal/verify-character-sprites.cjs
node tools/ancient_seal/generate-sword-icon.cjs --check
node tools/ancient_seal/generate-opening-maps.cjs --check
node tools/ancient_seal/generate-opening-dialogue.cjs --check
node tools/ancient_seal/verify-opening-source.cjs
node tools/ancient_seal/verify-opening-maps.cjs
```
The Java test uses the repository's existing SF2MapCreator jar and only
original generated fixtures in a disposable temp directory; no ROM input.

Optional actual-CPU decoder check (Python 3, local external tools):
```
python tools/ancient_seal/verify-sprite-68000.py --assembler /path/to/vasmm68k_mot --core /path/to/genesis_plus_gx_libretro.so
```
No full-game ROM or SRAM result follows from this isolated test. No timed
chapter acceptance has occurred. The next gameplay milestone remains the
Sealed Ruins encounter with Barok, five intruders and escape victory.
