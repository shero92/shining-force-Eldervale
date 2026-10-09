# Ancient Seal native ROM preview

The current preview is a real 4 MiB Genesis ROM built from the native source.
Use the `ancient-seal-preview.bin` from the successful Ancient Seal ROM preview
GitHub Actions run for commit 65e17b15d7c28b81c6a92b9a3b7658ba43ab2de2.
The neighboring SHA-256 file identifies the matching binary.

Open the BIN in a Genesis emulator and choose New Game with fresh save data.
Enter a hero name and finish with END. Use the directional pad for movement;
Genesis C interacts/searches and Genesis A opens the menu.

Talk to Father in the Sanctuary. His repeated conversation opens church
services. Follow the east path at (31,15) through Stormwatch to Bone-Tide Shore.
At the shore, approach the sword at (22,10) and search it. Read the vision and
return west if desired. Sealed Ruins remains closed; there is no new battle yet.

Do not reuse saves from unmodified SF2 or earlier development builds.
Graphics are prototype art. This preview does not provide an hour of gameplay.
The complete church save/load restart and full-inventory pickup still need
acceptance testing.

## Reproduce input checks

The driver requires Python, numpy, Pillow, and a local Genesis Plus GX libretro
core. It writes screenshots and a state with its SRAM companion. Supply both
files when resuming a state. A --clear-sram run is a destructive reset of only
the test emulator SRAM, so use it for a disposable fresh-game test.

```sh
python tests/native/emulator_driver.py --rom build/ancient-seal-preview.bin --core /path/to/genesis_plus_gx_libretro.so --output /tmp/ancient-seal-qa --clear-sram --actions '[[600,[]],[1,[3]],[180,[]],[1,[3]],[300,[]]]'
```

Buttons use libretro IDs: Start=3, Up=4, Down=5, Left=6, Right=7,
Genesis A=1, Genesis B=0, Genesis C=8. A ROM checksum or source-check pass
alone does not establish playability; inspect the screenshots and native state.
