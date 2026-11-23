# Creality SPARKX i7 with CFS-lite

Profile: `profiles/sparkx-i7-0.4`. Flattened from Creality Print 7.3.2 (`SPARKX i7 0.4 nozzle`, the `@SPARKX i7 0.4 nozzle` process presets, `CR-PLA @SPARKX i7 0.4 nozzle`) and patched for OrcaSlicer 2.5.1.

Prints so far, all from the same LAN machine in November 2026:

| Job | How it started | Result |
|---|---|---|
| 4-colour tag, no multicolour flag | Moonraker API | Printed fully, but all in black: the firmware ignored every swap |
| 4 bag clips, flag set | Moonraker API | Start routine looped three times; cancelled before layer 1 |
| 4 bag clips, flag set, by object | Touchscreen | Completed in 56 min, swaps worked |
| Waste bin, one colour, flag set | Touchscreen | Printed in orange through the screen's slot mapping |

## The printer

- Creality's Klipper build on OpenWrt, 2-core ARMv7. Moonraker on port 7125 (no login on the LAN), Fluidd on 4408, camera on 8000.
- The camera serves WebRTC only (`/server/webcams/list` is empty), so there are no snapshots. A Wi-Fi drop can freeze an open camera view while the camera keeps running; reloading the page fixes it.
- It does not answer ping. Probe port 7125 to find it.
- Bed 260 x 260 mm, height 255 mm, 0.4 mm hardened nozzle. PLA runs at 220 °C nozzle and 55 °C bed.
- SSH runs as root with a factory password shown on the printer's screen. Don't store it. Recommend the user change it.
- Firmware: a third-party article (printer-hub.com, May 2026) reports that firmware 1.1.2.4 turns off root at boot, which also locks SSH and Fluidd. This printer still has both. Don't update the firmware without the user knowing it may cut off this skill.

## Filament box (CFS-lite)

- Moonraker object `box`. `box.T1` is the first box with four slots, A to D, which are slicer filaments 1 to 4 and tools T0 to T3. Absent boxes T2 to T4 report `state: "-1"`.
- `box.T1.filament` is the letter of the slot feeding the toolhead. `box.map` is the filament-to-slot mapping the touchscreen saved at the last start, for example `{"T1A": "T1C"}` sends file filament 1 to slot C.
- Colours come as `0RRGGBB` in `color_value`. Material `001001` is PLA. Spools without a Creality RFID tag show brand `unknown` and a placeholder length (`666666`), so the printer can't tell how much is left. The box can't tell whether a slot's filament is seated up to the feeder; the user loads slots from the screen.
- `filament_switch_sensor filament_sensor` reports whether the toolhead holds filament. After a job the last colour stays loaded.
- G-code: `M8200 P S<n>` prepares slot n, `M8200 C S0` cuts, `M8200 L I<n>` loads slot n and `M8200 O` finishes the swap. A swap parks the head on the right, cuts, retracts 28 mm, loads, purges into the waste chute and wipes.

## Multicolour flag and starting prints

- The firmware skips every `M8200 P` to `M8200 O` swap block unless the G-code header has `; multicolor_method = 1 `. Its log then says "Ignoring M8200 P (non-multicolor_method model)". Creality Print writes the line; OrcaSlicer does not. The `multicolour-header` post-process adds it to every file, single colour included, because the screen's slot mapping also depends on it.
- With the flag set, a start through Moonraker (`/printer/print/start` or `SDCARD_PRINT_FILE`) reran START_PRINT about every 4 minutes (home, probe, load, purge about 100 mm, clean nozzle, restart). The cause is in Creality's compiled box code. Each loop leaves a purge strip along the front edge of the bed (X 95 to 150, Y 0); peel them off before the next start.
- Starting from the touchscreen works. The screen runs G28, a filament conflict check and `PRINT_PREPARE_LOAD_MATERIAL` before the file. It also asks the user to map each file colour to a slot. That is why the profile sets `"start": "screen"`.
- The screen proposes the mapping from the footer's `filament_colour` line. OrcaSlicer writes placeholder colours there, so the `slot-colours` post-process writes the slot colours. A file with placeholder colours showed one orange and three whites on the screen.
- Jobs started over the API end with Creality's CANCEL_PRINT path, so Moonraker's history records them as cancelled even when they ran to the end. Screen starts record `completed`.
- While an API-started job runs, `print_stats.state` stays `standby`; screen-started jobs show `printing`. `printState` uses `virtual_sdcard.is_active` so both read as printing.
- START_PRINT writes `// multicolor_method` (or `// non multicolor_method`) to the console once per run. Two of those for one job means the loop above; `watch` exits 4.

## Slicing quirks (OrcaSlicer 2.5.1)

Creality Print's Linux app has the official profile but its command line exits without slicing. OrcaSlicer slices headless. Fixes in `patchForOrca`, `stripStartToolchange` and `slice.mjs`:

1. Orca caps `retraction_distances_when_cut` at 18 mm and rejects Creality's 28. The patch writes `M8200 R E-28` and the matching reload into `change_filament_gcode` and sets the value to 18 so Orca accepts it.
2. Creality's swap code uses `flush_length_5`, which Orca does not define. The patch replaces it with 0.
3. Prime tower off: purges go to the chute.
4. Orca emits one cut and reload of the first filament between the start code and layer 1. The start routine has already loaded it, so `strip-start-toolchange` removes that block.
5. Orca reads the 3MF placement with a 30 mm offset, so `slice.mjs` passes `--arrange 1`. That centres one model and spaces several apart with the toolhead clearance (64 mm radius) when printing by object.
6. Each slot gets its own filament file with the slot's colour. Orca then sizes each purge from the colour pair (the tag's black to white purge grew, so it came to 4.1 g where placeholder colours gave 3.7 g).
7. Single-colour slices repeat `T0` after the start code with no swap code. The summary does not count it as a swap.
8. Orca warns `timelapse_type -1 is not valid, using 0` and, for Creality 3MFs, `filament_map_mode AutoForSaving is not valid`. Both are harmless.

## Times measured

- Each colour swap adds about 1.3 minutes (the tag sliced to 9 min in one colour, 13 to 14 min with 3 swaps).
- Before layer 1 the printer homes, runs its pressure-sensor test (`Swap Test Success` in the console), loads, purges, cleans the nozzle, probes a bed mesh and heats. That took about 2 minutes after an API start; a screen start adds its own homing and load.
- The slicer's time estimates matched the real prints within a minute (bag clips 55.5 min estimated, 56 min printed).

## Known issues reported online

From printer-hub.com and makers101.com, single sources unless noted. Use them as leads, not facts.

- The cutter blade wears after roughly 200 to 400 colour changes; layer shifts after swaps can come from a jagged cut.
- On older firmware the box could keep feeding into the waste bin after "Done"; only a power-off stopped it. Fixed in 1.1.2.4.
- Error FO0528 ("printing without extrusion") about 1 min 45 s into a print usually means a clog or a slipping drive gear.
- The camera misses roughly the bottom 30% of the bed.
- Clean the PEI plate with warm water and dish soap; isopropyl alcohol can smear the release agent.
