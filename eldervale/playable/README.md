# Eldervale — Playable Browser Prototype

**Start here:** `eldervale/playable/index.html`

## How to play
1. Open [index.html on GitHub](https://github.com/shero92/shining-force-Eldervale/blob/feature/eldervale-prologue/eldervale/playable/index.html).
2. Click **Download raw file**, then open the downloaded `index.html` in a modern desktop browser. No installation or external assets required.
3. Click **NEW ADVENTURE**, enter a name for the protagonist, then **BEGIN THE STORY**.
4. Walk with arrow keys or WASD. Press **E** near NPCs, locations and objects. Press **Enter** or click through dialogue. During battles **click ally → destination tile → adjacent enemy**, then **Enter** to end turn.
5. Press **M** to toggle synthesized sound. **F** toggles fullscreen. Autosave uses the browser's local storage; **CONTINUE** reloads the last story checkpoint.

## Currently implemented
- Original title screen, character naming, autosave/continue.
- Tile-based overworld: Sanctuary, Beach, Forest, Silent Ruins.
- Father, Barok, Miro, Naro and short dialogue sequences.
- Short tutorial battle, approaching storm, sword discovery and vision.
- First tactical battle against ruins creatures with an **escape objective** (both allies must reach the marked exit).
- Return to father, forest marker mystery and second ruins tactical battle.
- Original placeholder pixel visuals drawn in-browser using shapes; procedurally synthesized sound effects.
- Initial ending of the available prototype.

## Important limitations
This is **not yet a finished 45-minute chapter** and has **not yet been playtested end-to-end in a real browser**. Completion time varies widely, and the game still needs stronger scene art, music, battle AI/pathfinding, real tactical range visualization, accessibility, balancing, more exploration, extra encounters, story scripting, and browser acceptance tests. This is a playable *vertical slice* foundation, not a full ROM hack. Its mechanics are new JavaScript code and do not depend on or reproduce the disassembled ROM assets.

The `build/standard` Sega Genesis disassembly remains intact. The browser prototype resides in a separate folder so the team can prototype the first 45 minutes rapidly before choosing how to integrate content with the ROM project.

## Non-commercial fan project
This project has unofficial links to **Shining Force II**, **Lemon**, and other third-party intellectual property. The parent disassembly is **CC BY-NC 4.0**. Do not redistribute commercial products or unauthorized original game ROMs or extracted assets. Replace protected elements or secure permission before commercial distribution.

## Next engineering steps
1. Playtest every quest transition, battle victory and defeat, and save/reload scenario.
2. Fix player movement and obstacle handling; add pathfinding, animation frames, inventory and UI focus.
3. Add commissioned/original sprite sheets for hero, Father, Barok and enemies, plus island tilesets.
4. Expand to a verified 45-minute chapter: optional dialogue, monster friends, 2–3 more encounter maps, puzzles, gate cutscene, battle balancing.
5. Decide distribution: GitHub Pages browser demo versus Genesis ROM hack, with separate technical plans.
