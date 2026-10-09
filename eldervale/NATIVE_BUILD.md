# Shining Force: The Ancient Seal — Native Sega Genesis Build Track

## Status (work in progress)
This folder documents the **actual Shining Force II Motorola 68000 disassembly path**, separately from `eldervale/playable/` (standalone browser prototype).

### Current source state
- Scrolling Ancient Seal intro replaces the original intro cutscene in STANDARD_BUILD.
- New Game retains hero naming and SRAM, and routes to original Sanctuary data.
- Original Sanctuary / Stormwatch / Bone-Tide Shore tiles, blocks, collision,
  father dialogue, source warps, storm event, sword pickup and once-only vision
  are integrated. Sealed Ruins remains a closed boundary pending its battle.
- Hero/Father have three authored facings and two walk frames per facing,
  mapped to the shared native UI palette. Art remains preliminary.
- Item 127 has an original fixed-size 192-byte raw inventory icon.
- The original title and local soundtrack resources remain placeholders.
- A supplied lawful base ROM is now present locally. Full assembly still
  fails at the Wine/toolchain prerequisite in this execution environment.
- Native 68000 sprite decompression passes in an isolated Genesis Plus GX
  test. The FULL GAME has NOT been assembled, booted or played. An earlier
  build report or isolated decoder test does not validate the current game.

See [NATIVE_PROGRESS.md](NATIVE_PROGRESS.md) for resumption and validation details.

## Build locally (Windows)
1. Clone this repository and checkout `feature/ancient-seal-prologue`.
2. Use a legitimately obtained original US Shining Force II ROM in **.bin**, not .smd, format; place it at `rom/sf2.bin`. **Never commit this ROM or extracted copyrighted data**.
3. Run `split/split.bat` from Windows (requires the repository's included tools and the appropriate Java/assembler prerequisites).
4. Run `build/buildstandard.bat`; see `build/output.log` if assembly fails.
5. Test the resulting `build/standardbuild-last.bin` locally in a compatible Genesis emulator.
6. Verify the optional scrolling introduction displays and the original title screen loads normally.

## Why the graphics are still unchanged
`disasm/code/specialscreens/title/title.asm` loads its title-screen tiles/layout and uses the existing `MUSIC_TITLE` command. Replacing the actual logo requires new Genesis-compatible **4bpp tiles, palettes, tile layout and compression**. The title-screen layouts are in `disasm/data/graphics/specialscreens/titlescreen/titlescreenlayouts.asm`.

Map IDs are enumerated in `disasm/data/maps/map_names.txt`. STANDARD_BUILD
repurposes slots 43, 45 and 50 through pointer overrides; vanilla definitions are
retained. Original map data and setups live in `disasm/data/maps/ancientseal/`.
Runtime boot, dialogue, movement, warps and SRAM still require a local build.


Music banks reside in `disasm/data/sound/musicbank0/`, `musicbank1/` and `sfxbank/`. We can reuse sound driver *mechanisms*, but publishing existing copyrighted music requires permission. For a redistributable release, compose new tracks and compile them into the existing driver format.

## Native implementation milestone order
1. Produce an **original Ancient Seal logo** in Genesis-safe tile/palette format, integrate into title resources, and verify VRAM sprite/layout limits.
2. Verify the source-wired leader naming, sanctuary spawn, flags and SRAM in a local ROM.
3. Verify/refine the original Sanctuary/Stormwatch maps and Father events; finish sprites and add Barok.
4. Finish the storm presentation and original Tideworn Blade item icon.
5. Build the Sealed Ruins battle in the native tactical format and the return scene.
6. Build Silent Gate map, dialogue and next battle.
7. Add original score and sound palette, final animation/art, save progression and playtest.

**Target:** one fully playable hour in the original engine, without filler.
**Current reality:** the first three areas are integrated in source and their
native compressed data passes independent decoder tests; the character streams also pass an
isolated actual-68000 decoder test. Full-game runtime and timed acceptance
have not been completed.

## Repeatable validation
- On a Windows computer, run `powershell -ExecutionPolicy Bypass -File .\eldervale\verify-intro-source.ps1` from the repository root to check the native intro's text width, title and enabled patch (no ROM needed).
- Then assemble with local, legally owned `rom/sf2.bin` and run `powershell -ExecutionPolicy Bypass -File .\eldervale\verify-native-build.ps1`.
- CI runs source checks without ROM content via `.github/workflows/ancient-seal-source-checks.yml`; passing CI **does not** prove an assembled ROM or completed playable prologue.
