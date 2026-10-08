# Eldervale — Native Sega Genesis Build Track

## Status (work in progress)
This folder documents the **actual Shining Force II Motorola 68000 disassembly path**, separately from `eldervale/playable/` (standalone browser prototype).

### Already changed in the native disassembly
- Enabled `SCROLLING_TEXT_INTRODUCTION` in `disasm/sf2patches.asm`.
- Replaced the optional introductory text at `disasm/data/scripting/introtext-standard.asm` with the story of **Eldervale**, the island, dragons, the adoptive father, the storm and the returned sword.
- The original game title art and maps are **not yet replaced**. The original sound commands and music banks remain in the codebase; using them in a local assembled game requires the original game data and must respect the rightsholders' permissions.
- We have *not yet run an assembled ROM or emulator acceptance test*. Do not consider these changes a verified working game build.

## Build locally (Windows)
1. Clone this repository and checkout `feature/eldervale-prologue`.
2. Use a legitimately obtained original US Shining Force II ROM in **.bin**, not .smd, format; place it at `rom/sf2.bin`. **Never commit this ROM or extracted copyrighted data**.
3. Run `split/split.bat` from Windows (requires the repository's included tools and the appropriate Java/assembler prerequisites).
4. Run `build/buildstandard.bat`; see `build/output.log` if assembly fails.
5. Test the resulting `build/standardbuild-last.bin` locally in a compatible Genesis emulator.
6. Verify the optional scrolling introduction displays and the original title screen loads normally.

## Why the graphics are still unchanged
`disasm/code/specialscreens/title/title.asm` loads its title-screen tiles/layout and uses the existing `MUSIC_TITLE` command. Replacing the actual logo requires new Genesis-compatible **4bpp tiles, palettes, tile layout and compression**. The title-screen layouts are in `disasm/data/graphics/specialscreens/titlescreen/titlescreenlayouts.asm`.

Map IDs are enumerated in `disasm/data/maps/map_names.txt`; map data, setups and associated events live in `disasm/data/maps/entries/`. The first island home, beach and silent gate cannot honestly be claimed as implemented until the new assets, scripts, warps, sprite sheets and battles are assembled and playtested.

Music banks reside in `disasm/data/sound/musicbank0/`, `musicbank1/` and `sfxbank/`. We can reuse sound driver *mechanisms*, but publishing existing copyrighted music requires permission. For a redistributable release, compose new tracks and compile them into the existing driver format.

## Native implementation milestone order
1. Produce an **original Eldervale logo** in Genesis-safe tile/palette format, integrate into title resources, and verify VRAM sprite/layout limits.
2. Preserve leader-name entry (already in native game). Rework the opening game flags, initial warp and first event scripts to begin in the island sanctuary.
3. Build the Sanctuary map and Father/Barok map sprites with events.
4. Introduce storm cutscene, shore map, sword discovery and a new item.
5. Build the first battle in the native tactical battle format and the return scene.
6. Build Silent Gate map, dialogue and next battle.
7. Add original score and sound palette, final animation/art, save progression and playtest.

**Target:** a fully playable 45-minute chapter in the original game engine. **Current reality:** only the native scrolling introduction has been altered, and still requires a local ROM build and emulator testing.
