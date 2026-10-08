# Shining Force: The Ancient Seal — Prologue Design

## Non-negotiable story rules
- The player's first 10–15 minutes lead to the storm-washed sword. Do not expand this into a lengthy peaceful prologue.
- The hero is a human swordsman, around 20–22, with wild dark-brown hair, sage/turquoise handmade shoulder cape and subtle enigmatic blue markings.
- His adoptive father is a genuinely affectionate nonhuman elder, knowledgeable but never omniscient, a traitor, or a secret villain.
- The sword's link to Lemon must **not** be disclosed in the prologue.
- Ancient creatures are not automatically hostile; the island is wistful and beautiful, not grimdark.
- Keep the origins of the hero's marks and the island's three historical layers open.

## 45-minute chapter timing (design target, not yet implemented)

| Minutes | Sequence | Player interaction | Native work needed |
| --- | --- | --- | --- |
| 00–04 | Wake in the sea-cliff sanctuary; elder checks on the hero | Walk, talk, inspect a lantern | Custom map / father sprite / event |
| 04–08 | Friendly creature Barok offers a quick practice | Movement and one short practice encounter (not first full battle) | Brief field interaction |
| 08–11 | Dragons fly against the wind; sudden storm | Walk to overlooking ruins | Storm events / sound / weather tiles |
| 11–15 | Tide leaves an ancient scarred sword on the beach | Inspect blade, receive vision, acquire quest flag | Shore map / item / cutscene |
| 15–28 | Ruins intruders emerge; fight with Barok | First tactical battle; escape through forest exit | New battle definition and exit check |
| 28–35 | Return to father; he studies but cannot name the sword | Character dialogue; no exposition dump | Return warp / dialogue / flags |
| 35–45 | Discover the first silent gate marker | Explore forest approach; gate reacts to blade | Forest and gate maps / event flags |

## Tactical encounter 1 — The Ruins Stir
- Allies: hero and Barok. Monster companion is an ally, not a hostile tutorial target.
- Enemies: five anomalous intruders from sealed ruins; no friendly island wildlife as enemies.
- Win condition: reach designated forest escape tile. Eliminating all hostiles should not be mandatory.
- Mechanics taught: positioning, movement cost, terrain defense, attack range and a movement-based objective.
- One hostile diverts toward the sword location, giving clues without exposition.
- Exit event: a large figure touches the stone; faint lines flare; an ancient gate falls silent.

## Local testing gates
1. Native ROM assembles after every ASM edit.
2. Verify emulator boot, audio, scrolling intro, title navigation, name entry and saving.
3. Confirm map transitions and event flags persist correctly.
4. Verify battle win / loss / egress / reload paths and a timed 45-minute playtest.
5. Never mark any gameplay milestone complete based on design text alone.
