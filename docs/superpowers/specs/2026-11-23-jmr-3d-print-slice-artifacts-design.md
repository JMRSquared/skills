# jmr-3d-print: slice stats, merged STL and colour previews

Date: 2026-11-23  
Status: approved in chat; awaiting implementation plan

## Problem

After a design or slice, agents often under-report print stats. The G-code folder also has no easy way to inspect the same design without opening a slicer: no sibling STL and no colour preview images.

## Goals

1. Every successful `slice.mjs` run writes, next to the G-code:
   - one merged `.stl` of the exact plate geometry
   - `*-plate.png` (top-down colour plate preview)
   - `*-view.png` (one angled 3D colour render)
2. Slice stdout always prints a fixed stats block (time, filament, swaps and paths). Agents paste that block into chat before offering upload.
3. After design-only work (no slice yet), the agent still reports size, colours and part list.
4. No new heavy runtime deps: Node 22 only, same as today. Pure software rasterization in `lib.mjs`.

## Non-goals

- Per-colour STL exports
- Animated previews or multi-angle galleries
- Changing how prints start (still touchscreen / user-started on SPARKX i7)
- Replacing OrcaSlicer or Moonraker flows

## Approach

Bake artifact generation into `slice.mjs` after G-code post-process succeeds. A separate preview command is out of scope so agents cannot skip it.

## Output layout

For input `…/tag.3mf` (or `.stl`) with default `--out`:

```
sliced/
  tag.gcode
  tag.stl
  tag-plate.png
  tag-view.png
  .settings/   # unchanged
```

Custom `--out <dir>` uses the same basenames in that directory.

If the input is already a single-colour STL, `tag.stl` is a copy (or rewrite) of that mesh so the folder still has a stable sibling name.

## Stats contract

### After design (no slice)

Report at least:

- Part / object names
- Overall size (W × D × H mm)
- Filament slot per part and colour hex when known (from `printer.mjs slots` or the design request)

### After slice (and after `slice.mjs check`)

Stdout prints one block with these fields, in this order:

1. G-code path
2. Merged STL path
3. Plate PNG path
4. View PNG path
5. Printer profile
6. Estimated time
7. Plastic total grams and per-filament grams with colour
8. Layers, max height, nozzle °C, bed °C, print sequence
9. Footprint on the bed
10. First filament
11. Colour swap count and each swap (filament + Z)
12. Any `TIP:` lines
13. Any `PROBLEM:` lines

`--json` includes the same fields plus `artifacts: { gcode, stl, platePng, viewPng }`.

A missing artifact after a successful slice is a hard failure (exit 1), not a warning.

## Geometry sources

| Input | Merged STL | Colour PNGs |
|-------|------------|-------------|
| Multi-part 3MF from `make-3mf.mjs` | Union of all part meshes in the 3MF's own coordinates | Parts tinted by filament colours from `--colours` or live slots |
| Plain STL | Same mesh | Single colour (filament 1 / first colour) |
| Downloaded 3MF | Parse meshes from the 3MF zip (`3D/3dmodel.model`); if extruder metadata is missing, use filament 1 colour for all | Same |

The STL and PNGs come from the **input model file** (the mesh we handed to Orca), not from a re-parse of arranged G-code. Orca `--arrange` may nudge plate positions; the previews still match the design file, which is enough to inspect shape and colour assignment.

Colours match the G-code footer colour list used today (`slotColours` / `--colours`).

## Renderer

Add pure functions in `lib.mjs` (tested in `lib.test.mjs`):

- `writeBinaryStl(triangles) → Buffer`
- `mergeMeshes(parts) → triangles` (concatenate; no boolean CSG required)
- `renderPlatePreview({ objects, bed, colours, width, height }) → PNG Buffer`
- `renderViewPreview({ objects, colours, width, height }) → PNG Buffer`

PNG encoding: minimal uncompressed or zlib-deflate PNG writer in-tree (no `sharp` / `canvas` / `puppeteer`). Target size about 800×800 for plate and view.

Plate: orthographic top-down, bed outline, objects in place, each triangle filled with its filament colour, simple depth (higher Z draws on top).

View: one fixed isometric-style camera, flat shading with a fixed light direction, same colour assignment.

## Skill text (`SKILL.md`)

Update workflow sections 4–5:

- Slice always produces G-code + STL + both PNGs.
- Before offering upload, paste the full stats block and mention the preview PNGs (agent may open/read the PNGs with the image tool when useful).
- Design-only handoffs still include size, colours and parts.

Bump skill `version` (2.0.0 → 2.1.0).

## Tests

- `writeBinaryStl` round-trips through `parseStl`
- Merged mesh triangle count equals sum of parts
- Preview PNGs: valid PNG signature, expected dimensions, non-trivial byte length
- `printSummary` / JSON report lists all four artifact paths
- Existing G-code summarize / check tests stay green

## Error handling

- Slice fails before G-code: no partial STL/PNG required; keep current Orca error behaviour.
- G-code written but STL or PNG write fails: delete incomplete siblings if any, exit 1 with the error.
- `check` on an existing G-code: print stats; do not invent STL/PNG unless those files already sit next to the G-code (then include their paths when present).

## Implementation order

1. STL write + merge helpers and tests
2. PNG rasterizers and tests
3. Wire into `slice.mjs` after G-code write
4. Extend summary / JSON
5. Update `SKILL.md` and bump version
6. Run existing script tests plus new ones

## Out of scope follow-ups

- `make-3mf.mjs` writing previews before slice
- Layer-by-layer scrub from G-code
- Uploading PNGs to the printer
