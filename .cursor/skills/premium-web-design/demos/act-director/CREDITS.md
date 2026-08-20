# Credits

## 3D model

**Cassette Player** — `public/models/cassette_player/`

- Source: https://polyhaven.com/a/cassette_player
- Author: Oday Abuzaeed
- Licence: **CC0** (public domain, commercial use allowed, no attribution required)
- Resolution: 1k textures, 4,830 triangles, 944 KB on disk
- Downloaded with `/gltf-assets`:
  `python3 skills/gltf-assets/scripts/gltf.py get cassette_player --source polyhaven --res 1k --out public/models`

CC0 needs no credit. It is recorded here anyway so the next person can trace the
file, check the licence, and re-download it at a different resolution.

## Lighting

No HDRI. The environment is built from drei `<Lightformer>` rectangles baked into
a 256px cubemap on the first frame, so there is no map to download.

To use a real room instead, take a CC0 HDRI from the same tool and add its row
here:

```bash
python3 skills/gltf-assets/scripts/gltf.py download "studio" --type hdris --index 1 --res 1k --out public/hdris
```

```tsx
<Environment files="./hdris/studio_small_03_1k.hdr" />
```

## Fonts

System stack only (`ui-sans-serif`, `ui-monospace`). Nothing is downloaded.
A real build should self-host a variable font and re-measure after
`document.fonts.ready`, which `ScrollProvider` already listens for.
