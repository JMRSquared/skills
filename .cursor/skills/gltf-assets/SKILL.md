---
name: gltf-assets
description: Search and download glTF/GLB models and HDRIs for React Three Fiber and /premium-web-design. Poly Haven (photoreal CC0, no key) plus Sketchfab (broad CC catalogue, SKETCHFAB_TOKEN to download). Triggers on "find a 3d model", "download a gltf", "sketchfab", "polyhaven", "hdri", useGLTF, or /gltf-assets. Companion to pngimg-assets (2D cutouts).
---

# glTF / GLB Asset Search + Download

**Companion:** `/gltf-assets`

Pairs with `/pngimg-assets` (2D PNG cutouts) and `/premium-web-design`. Two sources, one script:

| Source | What | Auth | Licence |
|--------|------|------|---------|
| **Poly Haven** | Photoreal models + HDRIs. Prefer this for award lighting and props | None | CC0, commercial OK |
| **Sketchfab** | Broad downloadable catalogue when Poly Haven has no match | `SKETCHFAB_TOKEN` for **download** (search is public) | Per model. Default filter = CC0 / CC-BY / CC-BY-SA only |

## Token (Sketchfab)

Sketchfab **download** uses the `SKETCHFAB_TOKEN` environment variable. Search and Poly Haven HDRIs do not need it.

## Licence gate (Sketchfab)

Default download filter **blocks** NonCommercial, NoDerivs, and Sketchfab “Free Standard”.

| Target | Allowed Sketchfab licences |
|--------|----------------------------|
| Client work, SaaS, paid product | CC0, CC-BY, CC-BY-SA only |
| Internal mockup / non-commercial | `--allow-nc` after you say so |

CC-BY / CC-BY-SA require a visible credit: author + Sketchfab model URL. Put every shipped file in `CREDITS.md`.

Poly Haven assets are CC0. Still record the slug URL so the team can trace the file.

## Award bar (hard)

`/premium-web-design` forbids low-poly toys as the hero of a real product/place.

- **Prefer Poly Haven** for photoreal props and studio HDRIs.
- **Sketchfab** fills nouns Poly Haven does not have. Skip tagged low-poly / voxel / lego (script does this unless `--allow-lowpoly`).
- Do not swap the client's product for a lookalike model. Atmosphere and supporting objects only, unless the brief *is* that object.
- If neither source has a credible match, use photography inside the WebGL system. Do not "fill the gap" with a toy mesh.

Default Poly Haven resolution is **1k**. Use `--res 2k` for a close-up hero. Sketchfab GLBs over 40 MB are rejected unless `--force`.

## Script

`scripts/gltf.py` — Python 3 stdlib only. Executable (`chmod +x`).

```bash
SCRIPT=skills/gltf-assets/scripts/gltf.py

# Auto: Poly Haven first, then Sketchfab commercial CC to fill the list.
python3 "$SCRIPT" search "chair" --limit 10

# Sketchfab only (search needs no token).
python3 "$SCRIPT" search "bottle" --source sketchfab --limit 10

# Download one row from that numbered list.
python3 "$SCRIPT" download "bottle" --source sketchfab --index 2 --out public/models

# Known ids.
python3 "$SCRIPT" get ArmChair_01 --source polyhaven --out public/models
python3 "$SCRIPT" get e524887ea65145cc9d07f03092118a0a --source sketchfab --out public/models

# HDRI for R3F <Environment files="…"> (Poly Haven only).
python3 "$SCRIPT" search "studio" --type hdris --limit 8
python3 "$SCRIPT" download "studio" --type hdris --index 1 --res 1k --out public/hdris
```

Options: `--source auto|polyhaven|sketchfab` (default `auto`), `--type models|hdris`, `--limit N`, `--res 1k|2k|4k` (Poly Haven), `--out DIR`, `--index N`, `--all`, `--allow-nc`, `--allow-lowpoly`, `--force`.

Poly Haven models unpack to `public/models/<slug>/` (`.gltf` + `.bin` + `textures/`). Sketchfab saves a single `.glb`. Point `useGLTF` at the file, not the folder.

## Workflow

1. Confirm the 3D role: SKU, supporting prop, or lighting HDRI.
2. Search first. Show the numbered list (source + licence + tris). Let the user pick.
3. Query like a noun (`"bottle"`, `"studio small"`).
4. Sketchfab download uses `SKETCHFAB_TOKEN`.
5. Put files under `public/models` or `public/hdris`, never the repo root.
6. Record source URL, author, and licence in `CREDITS.md`.
7. Load with R3F, not a PNG thumbnail of the model.

## R3F load

```tsx
import { useGLTF, Environment } from "@react-three/drei";

const { scene } = useGLTF("/models/ArmChair_01/ArmChair_01_1k.gltf");
// or: useGLTF("/models/silver-cup-e524887e.glb")

<Environment files="/hdris/studio_small_03_1k.hdr" />
<primitive object={scene} />
```

Preload. Cap mobile at 1k / modest GLB size, `dpr={[1, 1.5]}`. Honour `prefers-reduced-motion` with a still frame of the same scene.

## Variety rule

Do not reuse one mesh in every section. Map each file to a placement. One hero file stamped across the page is a fail.

## Done check

- [ ] Role of the 3D confirmed; not a fake client product
- [ ] Licence gate passed (or NC blocked on commercial work)
- [ ] User saw numbered results and chose an index
- [ ] Sketchfab download used `SKETCHFAB_TOKEN`
- [ ] Real glTF/GLB/HDR under a project asset directory
- [ ] Loaded via `useGLTF` / `Environment`
- [ ] `CREDITS.md` has URL + author + licence
- [ ] No low-poly kit used as the award hero
