---
name: jmr-image
description: Search and download images from Unsplash, Pexels, and pngimg.com. Favours Unsplash then Pexels (commercial-safe) and falls back to pngimg for transparent cutouts. Triggers on "find an image of X", "download a photo", "get an image", "jmr-image", "/jmr-image". Unsplash uses UNSPLASH_ACCESS_KEY; Pexels uses PEXELS_API_KEY; pngimg needs no key.
---

# jmr-image — Unified Image Asset Skill

Search three sources, prefer the commercial-safe ones.

| Source | URL | Licence | Commercial |
|--------|-----|---------|------------|
| Unsplash | https://unsplash.com | Unsplash License | ✅ Yes, attribution required |
| Pexels | https://pexels.com | Pexels License | ✅ Yes, attribution appreciated |
| pngimg | https://pngimg.com | CC BY-NC 4.0 | ❌ Non-commercial only |

The script searches **Unsplash first**, then **Pexels**. If both are empty or the user asks for a transparent cutout, it searches **pngimg**.

## Licence gate

### Unsplash and Pexels — always allowed
Both licences permit commercial use. Credit Unsplash (required). Credit Pexels anyway. Before committing the asset, add a `CREDITS.md` entry or a visible attribution line.

### pngimg — gate check
Before downloading from pngimg, confirm the destination:

| Destination | Allowed |
|-------------|---------|
| Internal mockups, decks, prototypes, throwaway demos | ✅ |
| Personal / non-monetised site or app | ✅ with attribution |
| Client work, SaaS, paid product, anything monetised | ❌ — stop, offer Unsplash or Pexels instead |

## Script

`scripts/jmr-image.sh` — bash + curl + jq. Executable (`chmod +x`).

From this skill directory (or any synced copy):

```bash
SCRIPT=skills/jmr-image/scripts/jmr-image.sh

# 1. Search — Unsplash, then Pexels, then pngimg if empty / requested.
"$SCRIPT" search "mountain sunrise" --limit 10

# 2. Download by index from a specific source (use after search).
"$SCRIPT" download unsplash --index 2 --out public/images
"$SCRIPT" download pexels --index 4 --out public/images
"$SCRIPT" download pngimg --index 1 --out public/images

# 3. Download the full result set (only after user approves).
"$SCRIPT" download unsplash --all --out public/images

# 4. Download a known URL directly.
"$SCRIPT" get https://unsplash.com/photos/xxx/download --out public/images
"$SCRIPT" get https://www.pexels.com/photo/brown-rocks-2014422/ --out public/images
"$SCRIPT" get https://pngimg.com/uploads/cat/cat_PNG50483.png --out public/images

# 5. Force one source (e.g. Pexels, or pngimg for a transparent cutout).
"$SCRIPT" search "office desk" --source pexels --limit 10
"$SCRIPT" search "transparent batman logo" --source pngimg --limit 10
```

Options: `--source unsplash|pexels|pngimg|auto` (default auto), `--page N`, `--limit N`, `--out DIR` (default cwd).

## Workflow

1. **Confirm the use case.** If commercial, Unsplash and Pexels are safe. If non-commercial and a cutout is needed, pngimg is an option.
2. **Search first.** Run `search`. Results are numbered by source. Unsplash, then Pexels, then pngimg.
3. **Let the user pick.** Use `download <source> --index N` for a specific choice. Do not blind-download `--all` on an open-ended query.
4. **Check what arrived.** `file <path>` — verify dimensions and format. pngimg sometimes returns tiny thumbnails mixed in.
5. **Place it well.** Project asset directory (`public/images`, `assets/`, `static/`). Never the repo root.
6. **Attribute Unsplash** (required) and Pexels (do it anyway) in `CREDITS.md` or the UI if publicly visible.
7. **Attribute pngimg** if applicable.
8. **Optimise** before committing — 5–20 MB photos are common from Unsplash and Pexels originals.

## API keys

Agent shells are not login shells. Keys in `~/.zshrc` are not inherited automatically. The script reads `PEXELS_API_KEY` / `UNSPLASH_ACCESS_KEY` from the environment, and if missing it parses `export NAME=...` lines from `~/.zshrc`.

- **pngimg:** none needed.
- **Unsplash:** `UNSPLASH_ACCESS_KEY` (or `UNSPLASH_APPLICATION_ID` / `UNSPLASH_SECRET_KEY`). If missing, skip Unsplash.
- **Pexels:** `PEXELS_API_KEY`. If missing, skip Pexels.

If both keys are missing, the script falls back to pngimg only.

```bash
# if a Cursor/agent shell still cannot see the key:
set -a; source ~/.zshrc; set +a
```

## Done check

- [ ] Use case confirmed (Unsplash/Pexels always safe; pngimg only for non-commercial)
- [ ] User saw search results and chose an index (or approved `--all`)
- [ ] `file <path>` shows a real image at usable dimensions
- [ ] Asset lives under a project asset directory
- [ ] Attribution recorded in `CREDITS.md` or visible in the product
