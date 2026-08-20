---
name: pngimg-assets
description: Search and download transparent PNG cutouts from pngimg.com for mockups, decks, prototypes, or non-commercial sites. Triggers on "find a png of X", "download a transparent png", "get a cutout image", "pngimg", or /pngimg-assets. Enforces the CC BY-NC 4.0 licence gate before any asset lands in a repo.
---

# pngimg.com Asset Search + Download

**Companion:** `/pngimg-assets`

Search https://pngimg.com and pull full-resolution transparent PNGs from the terminal. No API key, no browser.

For **3D** (glTF/GLB + HDRI, R3F / `/premium-web-design`), use `/gltf-assets` instead.

## Licence gate (check before downloading)

pngimg.com content is **CC BY-NC 4.0** — attribution required, **non-commercial only**.

Before writing any asset into a project, confirm the target use:

| Target | Allowed |
|--------|---------|
| Internal mockups, decks, prototypes, throwaway demos | Yes |
| Personal / non-monetised site or app | Yes, with visible attribution |
| Client work, SaaS marketing site, paid product, anything monetised | **No** — stop and say so |

If the destination is commercial, do not download. Say the licence blocks it and offer alternatives: a licensed stock source, a generated asset, or a background-removed image the user already owns.

When the use is allowed and the asset ships publicly, add attribution — a credit line or a `CREDITS.md` entry pointing at `https://pngimg.com` and the source URL.

## Script

`scripts/pngimg.sh` — bash + curl only, no dependencies. Executable (`chmod +x`).

From this skill directory (or any synced copy under `.cursor/skills/pngimg-assets/`, etc.):

```bash
SCRIPT=skills/pngimg-assets/scripts/pngimg.sh

# 1. Search. Prints numbered results with titles and full-resolution URLs.
"$SCRIPT" search "red apple" --limit 10

# 2. Download one result by its number from that list.
"$SCRIPT" download "red apple" --index 2 --out public/images

# 3. Download the whole result set (only after the user approves the list).
"$SCRIPT" download "batman logo" --all --limit 5 --out public/images

# 4. Download a known URL directly.
"$SCRIPT" get https://pngimg.com/uploads/cat/cat_PNG50483.png --out public/images
```

Options: `--page N` (default 1), `--limit N` (default 20), `--out DIR` (default cwd).

The script rejects anything that is not a real PNG, so an HTML error page never lands as a `.png` file.

## Workflow

1. **Confirm the use case** against the licence gate above. Blocked → stop there.
2. **Search first, download second.** Run `search`, show the user the numbered titles, let them pick. Do not blind-download `--all` on a vague query — pngimg mixes near-duplicates and off-topic hits into one result page.
3. **Query like a filename, not a sentence.** `"batman logo"` works; `"a cool batman logo with a dark background"` returns nothing. Two or three nouns. If the search comes back empty, retry with the single strongest noun.
4. **Check what arrived.** Run `file <path>` — pngimg mixes small and huge assets under the same query. Reject anything too small for its placement.
5. **Put it in the right place.** Project-relative asset directory (`public/images`, `assets/`, `static/`), never the repo root, never a temp path referenced from committed code.
6. **Record attribution** if the asset ships.
7. **Optimise** before committing to a web project (1–5 MB sources are common).

## Variety rule (hard)

For **category subjects** that exist in many variants on pngimg (pets, food, furniture, tools, people poses), do **not** ship a single cutout reused on every section.

Minimum for a customer-facing demo in that case:

1. Search with `--limit` high enough to see options (often 10–12).
2. Download a **set** — prefer **≥3** distinct subjects, **≥6** when the brand story is a waiting-room / menu / catalogue of that category.
3. Map each asset to a concrete placement (hero, chapter, service panel, gallery strip). Repeating one hero file across the page is a fail.
4. Reject undersized thumbs (`file` check). Skip near-duplicates if a clearer pose exists.
5. Credit **every** shipped file in `CREDITS.md`.

Single-cutout is only acceptable when pngimg truly has one usable asset for that noun, or the subject is a unique mark (one logo, one specific product SKU). Say so in `CREDITS.md` if that happens.

Bad: one dog PNG on the hero, journey, services, and canvas.  
Good: several dogs and cats assigned across hero, journey chapters, care modes, services, and a companions strip.

## Notes

- Search endpoint is `https://pngimg.com/search_image/?search_image=<query>&page=<n>`. Result pages carry Shutterstock affiliate ads; the script filters to `pngimg.com/uploads/` only, so paid stock never leaks into the results.
- Thumbnail URLs contain `/small/`; the script strips that segment to get the full-resolution file.
- Rate-limit yourself. Sequential downloads only, no parallel fan-out across dozens of URLs.

## Done check

- [ ] Licence gate confirmed for this destination (or download aborted)
- [ ] User saw search results and chose an index (or approved `--all`)
- [ ] `file <path>` shows a real PNG at usable dimensions
- [ ] Asset lives under a project asset directory
- [ ] Attribution recorded if the asset ships publicly
- [ ] Category subjects use a set (≥3) mapped to placements, not one file repeated
