---
name: jmr-3d-print
description: Design, find, slice and print models on the user's 3D printer over the local network. Models parts as STL or 3MF (one part or object per colour on a multi-colour box), downloads models from Printables with their licence, slices headless with OrcaSlicer using the printer's official profile and quality presets, checks the G-code (time, grams, colour swaps, fit on the bed) and talks to a Klipper printer through Moonraker (status, filament slots, upload, job history, pause, resume, cancel, watch). Ships a tested profile for the Creality SPARKX i7 with CFS-lite, whose prints the user starts on the touchscreen. Use when the user asks to print something, make or design a printable part, find or download a model, estimate print time, slice a model, check or watch the printer, see which filament is loaded, or pause or cancel a print.
version: 2.0.0
---

# jmr-3d-print

Takes an idea, a Printables link or a model file to a finished print on the user's own printer. The scripts need only Node 22, plus OrcaSlicer for slicing.

```bash
S=<this skill's directory>/scripts
node $S/printer.mjs status                 # what the printer is doing
node $S/printer.mjs slots                  # filament in each slot and in the toolhead
node $S/fetch-model.mjs <printables-url>   # files and licence; add --file <name> to download
node $S/make-3mf.mjs --out part.3mf --part base.stl:1 --part text.stl:2
node $S/slice.mjs part.3mf                 # writes sliced/part.gcode and prints a summary
node $S/printer.mjs upload sliced/part.gcode
node $S/printer.mjs watch --wait 10        # background; exits when the job ends
```

## Safety rules

A print is a physical job that runs for minutes to hours with a nozzle near 220 °C, so these rules work like the deploy rule.

1. **The user starts every print.** On the SPARKX i7 profile (`"start": "screen"`) the user starts the file on the touchscreen and `printer.mjs start` refuses. That is the only start method that works there. It also means a person is at the printer and sees the bed. On printers whose profile allows API starts, start only when the user asked for this print in their current message and pass `--yes`. An earlier request, a plan or "go ahead with the design" does not count.
2. **Show the slice summary before the user starts**: size, estimated time, grams of plastic, which colour goes in which slot, every colour swap with its height and the print order. Compare the colours with `printer.mjs slots` and say so if a colour the model needs is not loaded.
3. **Ask the user to check the bed is empty and clean.** The SPARKX i7 camera only streams video to a browser, so the scripts can't take a picture of the bed. A part left on the bed, or purge strips from an earlier start, will catch the nozzle.
4. Reading status, listing slots, downloading, slicing and uploading are always fine. Uploading does not start anything.
5. Pause or cancel at once if `watch` or `status` shows something wrong (an unexpected pause, a start routine that repeats, temperatures far off target, an error), then tell the user what you saw. Never resume a paused print without asking: it may have paused for a runout, a tangle or a clog the user has to clear.
6. Never edit `printer.cfg`, macros or firmware, never send raw G-code beyond what these scripts send and never SSH into the printer unless the user asks for that specific change. Reading files over SSH to debug also needs the user's go-ahead. Never store the root password anywhere. Never install firmware updates: on the SPARKX i7 an update can turn off root access and the network API this skill depends on.
7. Keep the printer off the public internet. Moonraker has no login on the LAN. For remote access, recommend a VPN such as Tailscale, never a port forward.
8. Run `printer.mjs watch` as a background command. Do not loop `sleep` in the foreground.

## Setup on a new machine

`printer.mjs` reads `~/.config/jmr-3d-print/printer.json` (or `$XDG_CONFIG_HOME/jmr-3d-print/printer.json`):

```json
{ "name": "Sparkx i7", "url": "http://<printer-ip>:7125", "profile": "sparkx-i7-0.4" }
```

`JMR_PRINTER_URL` and `JMR_PRINTER_PROFILE` override the file. The address stays out of the repo because every install has its own printer. To find it, read the IP on the printer's screen (Settings, Network) and check `curl http://<ip>:7125/printer/info`. Many printers ignore ping, so probe the port, not the host.

OrcaSlicer: `slice.mjs` uses `orca-slicer` from `PATH`, then `$JMR_ORCA`, then the Flathub app `com.orcaslicer.OrcaSlicer`. The Flathub app runs on older distributions because it brings its own libraries. If none is installed, ask the user before installing it, since it is about 1 GB: `flatpak --user install -y flathub com.orcaslicer.OrcaSlicer`.

## Workflow

### 1. Find or design the model

**An existing model.** For a Printables link, run `fetch-model.mjs <url>` to list the files and licence, then `--file <name>` to download one. Tell the user the licence. Personal prints are fine under any licence; selling prints needs a licence that allows commercial use. A 3MF from Printables often carries the designer's settings (layer height, infill, supports); mention them, but slice with this printer's profile. For other sites, ask the user to download the file or use `gltf-assets`.

**A new design.** Ask what the part is for, its size and which colours, unless the request already says. Check `printer.mjs slots` first so the design uses loaded colours. Build each colour as its own closed STL with OpenSCAD (`openscad -o part.stl part.scad`) or CadQuery if installed, or a short script that writes the mesh. Ask before installing a CAD tool.

Design rules for FDM with a 0.4 mm nozzle, from the usual design guides:

- Walls at least 0.8 mm (two lines). Make wall thickness a multiple of about 0.45 mm.
- Overhangs up to 45° print without supports. Steeper faces need supports (`--set enable_support=1`) or a chamfer instead of a flat ceiling.
- Add a 0.5 mm 45° chamfer to edges that touch the bed. The first layer squashes outwards ("elephant's foot").
- For parts that fit together, start with 0.3 to 0.4 mm clearance per side and print a small test piece first. No single number fits every printer.
- Raised or sunk text: at least 0.6 mm deep and 1 mm stroke width. Text on top faces prints cleaner than text on walls.
- Lay the part on its largest flat face. Layers are weakest when pulled apart, so put loads along the layers, not across them.
- `make-3mf.mjs` warns about open edges and inside-out normals. Fix those in the model; slicers guess when they repair a mesh.

### 2. Plan the colours

On a single-nozzle box every colour change is a cut, a reload and a purge into the waste chute: about 1.3 minutes and 40 to 70 mm of filament each on the SPARKX i7, more for dark to light. Fewer swaps save the most time and plastic.

- **One colour per object:** put each colour on its own object and print by object (`--set "print_sequence=by object"`). Four bag clips in four colours took 56 minutes with 3 swaps this way. Printing the same plate layer by layer needed 150 swaps, 3 h 57 min and 2.6 times the plastic. Objects printed one after another must be no taller than the clearance to the gantry (`extruder_clearance_height_to_rod`, 40 mm on the i7) and need space around them. OrcaSlicer arranges them with that clearance.
- **Several colours in one object:** give each colour its own height band (base, then face, then raised text) so the printer swaps once per colour. Colours that share a layer swap on every layer of that band.
- OrcaSlicer sets each purge length from the two colours. Light after dark needs the most, so order bands dark to light where the design allows.

### 3. Pack the colours

```bash
node $S/make-3mf.mjs --out tag.3mf --part base.stl:1 --part text.stl:4                 # one object, two colours
node $S/make-3mf.mjs --out clips.3mf --part clip.stl:1:black --part clip.stl:2:white   # two objects
```

`--part <file.stl>:<filament>[:<object>]`. The filament is the slot number (1 to 4 is T1A to T1D on the first box). Parts with the same object name stay together as one object. OrcaSlicer ignores per-object colours in a plain multi-object 3MF and slices everything in filament 1. `make-3mf.mjs` writes the layout that keeps them. A single-colour STL or a downloaded 3MF can go straight to `slice.mjs`.

### 4. Slice and check

```bash
node $S/slice.mjs model.3mf [--quality 0.16mm-standard] [--set key=value]... [--colours "#000000,#FFFFFF"] [--out <dir>] [--json]
node $S/slice.mjs check <file.gcode>
```

- `--quality` picks one of the printer's official presets from `profiles/<printer>/processes/`. The SPARKX i7 has 0.12mm-fine, 0.16mm-standard, 0.20mm-standard (default), 0.20mm-strength, 0.24mm-standard, 0.28mm-extra-draft and 0.20mm-spiral-vase. Finer layers look smoother but take much longer: the waste bin sliced to 8 h at 0.16 mm and 5 h 45 min at 0.20 mm. Offer the trade-off for prints over about 2 hours.
- `--set` changes any setting the profile defines, for example `sparse_infill_density=25%`, `wall_loops=3`, `enable_support=1` or `print_sequence=by object`. An unknown name is an error, so typos can't slip through.
- Colours come from `--colours`, else from the slots loaded right now. They go into the file so the touchscreen proposes the right slot for each colour.
- A `PROBLEM:` line or exit code 2 means the G-code fails a check (off the bed, too tall, empty or missing the multicolour flag). Fix it; never upload it anyway. Exit code 1 is a slicer error with its log. `TIP:` lines suggest a cheaper way to print.

### 5. Offer the print

Give the user the summary in plain words, for example: "The tag is 58 x 30 x 3.6 mm and takes about 14 minutes and 4.1 g of PLA. It prints black from slot A, then swaps to white at 1.4 mm, orange at 2.2 mm and blue at 2.8 mm. Shall I put it on the printer?" Then wait.

### 6. Upload, start and watch

```bash
node $S/printer.mjs upload sliced/tag.gcode   # refuses a file this printer would print in one colour
node $S/printer.mjs watch --wait 10            # background
```

After the upload, tell the user how to start it on the touchscreen (the upload prints the steps): check the bed, pick the file, match each file colour to its slot on the colour screen, start. Then run `watch --wait 10` in the background.

`watch` exits 0 when the job completes, 2 when it pauses, 3 on an error or cancel and 4 when the start routine runs twice for one job (the firmware restarting the file by itself; cancel it). Tell the user when the print gets past the first layer, when to look at the first colour swap and when it finishes. `history` lists recent jobs with how they ended. `console` shows the printer's last messages.

## Printer care to mention when it matters

- Clean the PEI plate with warm water and dish soap when prints stop sticking. Isopropyl alcohol can smear the release agent instead of removing it. Handle the plate by its edges.
- Keep PLA in the box's desiccant slots or a dry box. PETG and TPU need drying in humid weather. The CFS-lite has no heater.
- The CFS-lite takes PLA, PETG and TPU of 64D hardness or harder. Softer TPU feeds from the printer's own spool holder. Creality does not recommend ABS, ASA, PA or PC on this printer.
- Never plug or unplug the cable between the box and the printer while it is powered.

## Adding another printer

1. Install the vendor's slicer or OrcaSlicer and find its profile folder (for example `profiles/Creality` inside the app).
2. `node $S/slice.mjs profile --from <vendor-folder> --name <printer>-<nozzle> --machine "<machine profile>" --process "<default process>" --filament "<filament profile>" [--extra-process "<other process>"]...`. This writes complete OrcaSlicer settings to `profiles/<name>/` with the inherits chain merged.
3. Edit `profiles/<name>/profile.json`: `slots`, `postprocess`, `start` (`"screen"` or `"api"`) and `prepareMacro`. Slice a small test part and compare its start and swap code with a file the vendor's own slicer made for the same printer. Ask the user to watch the first print.
4. Write what you learned in `references/<printer>.md`.

Printer notes: `references/sparkx-i7.md` (Creality SPARKX i7 with CFS-lite).
