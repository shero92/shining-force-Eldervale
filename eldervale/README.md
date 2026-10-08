# Shining Force: The Ancient Seal

Unofficial, non-commercial Shining Force II fan sequel under development in the original Motorola 68000 Sega Genesis disassembly. Not affiliated with Sega or endorsed by rightsholders.

> **Current native status:** The scrolling introductory text is integrated into the actual disassembly; an assembled ROM was reported successful locally on 2026-10-09, but emulator gameplay acceptance testing has not yet been reported. The custom opening maps, sprites, dialogue events and tactical battles are **not implemented yet**.

## Narrative foundation

Years after Zeon's defeat, a young human swordsman (approximately 21 years old) lives among friendly creatures on an isolated island of ivory ruins, dragon bones, ancient gates, waterfalls and sea cliffs.

His adoptive father is a loving, ancient, nonhuman guardian with branching horns, a long ivory mask-like face, foliage robes and an amber lantern staff. He is neither an enemy nor omniscient.

A storm delivers a weathered sword to shore. Touching it triggers a vision of a warrior, fire, an ominous portal and the warning: “The seal weakens. Seek the heirs of power.” The blade's previous owner's identity is **concealed** from players at this point.

The island's history has three **unresolved, distinct layers**: primordial beings, possible traces of the Ancients and arrivals from dimensional rifts. The protagonist's blue markings are likewise not yet explained.

## Prologue scope

Target: a genuine 45-minute opening in the native Sega Genesis game. The sword must appear by minute 10–15; the first true tactical battle follows immediately and involves strange intruders from sealed ruins, not the island's peaceful creatures.

- [x] Native build path documented
- [x] Scrolling intro replaced in native ASM
- [x] First locally assembled native ROM reported successful (emulator test still pending)
- [ ] Custom title art and Genesis-format assets
- [ ] Hero and father mapsprites, portraits and animations
- [ ] Home / shore / forest / gate maps and warps
- [ ] Sword pickup, vision and event flags
- [ ] Native battle 1, Barok ally, escape victory, and battle exit cutscene
- [ ] Full ~45-minute emulator playtest

## Repository conventions

Active branch: `feature/ancient-seal-prologue`. Original engine baseline: `build/standard`. Do not commit original ROMs, extracted original copyrighted resources or assembled ROM outputs.

Documentation is currently retained in `eldervale/` to avoid breaking existing paths; its name is historical, **not** the title of the game.

See [PROLOGUE.md](PROLOGUE.md), [NATIVE_BUILD.md](NATIVE_BUILD.md), and [NATIVE_IMPLEMENTATION.md](NATIVE_IMPLEMENTATION.md).
