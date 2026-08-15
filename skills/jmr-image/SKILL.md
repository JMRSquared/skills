---
name: jmr-image
description: Search and download images from Unsplash and pngimg.com. Favours Unsplash — the more permissive source — and falls back to pngimg for transparent cutouts when needed. Triggers on "find an image of X", "download a photo", "get an image", "jmr-image", "/jmr-image". Requires no API key for pngimg; Unsplash uses the UNSPLASH_ACCESS_KEY env var.
---

# jmr-image — Unified Image Asset Skill

Search two sources, prefer one.

| Source | URL | Licence | Commercial |
|--------|-----|---------|------------|
| Unsplash | https://unsplash.com | Unsplash License | ✅ Yes, attribution required |
| pngimg | https://pngimg.com | CC BY-NC 4.0 | ❌ Non-commercial only |

The script searches **Unsplash first**. If results are empty or the user asks for a transparent cutout, it searches **pngimg**.

## Licence gate

### Unsplash — always allowed
The Unsplash License permits commercial use with attribution. Before committing the asset, add a `CREDITS.md` entry or a visible attribution line.

### pngimg — gate check
Before downloading from pngimg, confirm the destination:

| Destination | Allowed |
|-------------|---------|
| Internal mockups, decks, prototypes, throwaway demos | ✅ |
| Personal / non-monetised site or app | ✅ with attribution |
| Client work, SaaS, paid product, anything monetised | ❌ — stop, offer Unsplash instead |

## Script

`scripts/jmr-image.sh` — bash + curl only. Executable (`chmod +x`).

From this skill directory (or any synced copy):

```bash
SCRIPT=skills/jmr-image/scripts/jmr-image.sh

# 1. Search — searches Unsplash first, then pngimg if empty.
"$SCRIPT" search "mountain sunrise" --limit 10

# 2. Download by index from a specific source (use after search).
"$SCRIPT" download unsplash --index 2 --out public/images
"$SCRIPT" download pngimg --index 1 --out public/images

# 3. Download the full result set (only after user approves).
"$SCRIPT" download unsplash --all --out public/images

# 4. Download a known URL directly.
"$SCRIPT" get https://unsplash.com/photos/xxx/download --out public/images
"$SCRIPT" get https://pngimg.com/uploads/cat/cat_PNG50483.png --out public/images

# 5. Force pngimg search (e.g. for a transparent cutout).
"$SCRIPT" search "transparent batman logo" --source pngimg --limit 10
```

Options: `--source unsplash|pngimg|auto` (default auto), `--page N`, `--limit N`, `--out DIR` (default cwd).

## Workflow

1. **Confirm the use case.** If commercial, Unsplash is always safe. If non-commercial and a cutout is needed, pngimg is an option.
2. **Search first.** Run `search`. Results are numbered by source. Unsplash results appear first.
3. **Let the user pick.** Use `download <source> --index N` for a specific choice. Do not blind-download `--all` on an open-ended query.
4. **Check what arrived.** `file <path>` — verify dimensions and format. pngimg sometimes returns tiny thumbnails mixed in.
5. **Place it well.** Project asset directory (`public/images`, `assets/`, `static/`). Never the repo root.
6. **Attribute Unsplash.** Add a credit to `CREDITS.md` or the UI if publicly visible.
7. **Attribute pngimg** if applicable.
8. **Optimise** before committing — 5–20 MB photos are common from Unsplash.

## API keys

- **pngimg:** none needed.
- **Unsplash:** requires one of `UNSPLASH_ACCESS_KEY`, `UNSPLASH_APPLICATION_ID`, or `UNSPLASH_SECRET_KEY` in the environment. If missing, the script skips Unsplash and falls back to pngimg silently.

## Done check

- [ ] Use case confirmed (Unsplash always safe; pngimg only for non-commercial)
- [ ] User saw search results and chose an index (or approved `--all`)
- [ ] `file <path>` shows a real image at usable dimensions
- [ ] Asset lives under a project asset directory
- [ ] Attribution recorded in `CREDITS.md` or visible in the product
