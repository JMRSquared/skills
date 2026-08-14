# Imagery

Every study in `site-studies/` reaches the same conclusion from a different
direction: on sites selling a real product, place, or service, **photography is
the design**. Amrit Palace is three colours and one typeface — what makes it
expensive is a room shot two stops down with candles as the only light source.

An agent that cannot find images fills the space with gradients and icons. That
is the look people mean when they say a page seems AI-generated.

## Finding photography

```bash
PW_DIR=<dir with node_modules/playwright> \
  node scripts/find-photos.mjs "<specific scene>" ./photos 12
```

It searches Unsplash and Pexels in a real browser, writes `photos/contact-sheet.jpg`,
and prints full-resolution URLs with credit links.

**Read the contact sheet with the Read tool and choose by eye.** Picking from a
filename is picking at random, and one wrong hero image undoes every other
decision on the page.

Query like a photo editor, not like a search engine:

| Weak query | Strong query |
|---|---|
| `veterinary` | `veterinarian examining dog stethoscope natural light` |
| `restaurant` | `dark restaurant interior candlelight long table` |
| `plumber` | `hands copper pipe wrench workshop close up` |
| `barbershop` | `barber fade clippers backlit mirror` |

Run two or three different queries per section and compare sheets. The first
query is almost never the best one.

Owner-supplied photography always wins. Ask for it before sourcing stock, and
say plainly that stock is a placeholder if that is what shipped.

## Choosing

Reject anything with these, no matter how well it matches the brief:

- Everyone smiling directly at the camera
- A pure white studio background with a floating subject
- Visible stock watermarks, or the same face you have already used
- A subject centred with even lighting and no depth
- Obvious AI generation: warped hands, melted text, impossible reflections

Prefer: one light source with direction, real depth of field, a subject caught
mid-action, hands doing work, an environment with texture. A photograph where
something is *happening* carries a page. A portrait of someone posing does not.

Consistency matters more than any single frame. Six photographs at different
colour temperatures read as a collage of stock; six from the same lighting
family read as a commissioned shoot. Pick a light (warm tungsten, cold daylight,
overcast) and hold it across the page — or force consistency with a treatment.

## Treatments

```css
/* scrim — mandatory under any type on a photo */
.hero::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(to top, rgb(0 0 0 / .78) 0%, rgb(0 0 0 / .30) 40%, transparent 70%);
}

/* unify mismatched stock into one palette */
.duotone { filter: grayscale(1) contrast(1.05); }
.duotone::after {
  content: ""; position: absolute; inset: 0;
  background: var(--accent); mix-blend-mode: color; opacity: .55;
}

/* warm or cool a set toward one temperature */
.warm { filter: saturate(1.05) sepia(.12) contrast(1.03); }
```

Grain over photography (see `color-and-light.md`) hides compression artefacts
and pulls stock toward film.

## Cropping

- Crop hard. A tight crop on hands, a face at the edge of frame, or a detail at
  2× scale reads as art direction; a full uncropped landscape reads as a stock
  library.
- Use aspect ratios deliberately: 4:5 portrait for people, 16:9 or 21:9 for
  place, 1:1 for product. Mixing two ratios in one section is a composition
  decision — mixing four is an accident.
- Let one image break the grid per page: full-bleed, or overlapping the section
  boundary.
- `object-fit: cover` with `object-position` set for the subject, not left at
  `center` — that is what puts a person's forehead at the crop line.

## Resolution and delivery

- Serve at 2× the CSS display width. The auditor fails any image rendering
  larger than its source pixels; a soft hero is unrecoverable.
- Hero: 2400px wide source. Section images: 1600px. Thumbnails: 800px.
- `loading="eager"` and `fetchpriority="high"` on the hero image only;
  `loading="lazy"` on everything below the fold.
- Always set `width`/`height` or `aspect-ratio` so nothing shifts on load.
- Prefer AVIF/WebP with a JPEG fallback where the stack supports it.

## 3D, when it applies

Modelled 3D belongs where the product *is* an object worth rendering — a can, a
device, a keyboard, a space. Source glTF and studio HDRIs via `/gltf-assets`,
Poly Haven CC0 first.

Primitive boxes and low-poly kits standing in for a real product fail this
skill. Without a credible model, stage real photography inside the motion
system: scrub it, mask it, parallax it, depth-layer it.

## Licensing

Unsplash and Pexels are free for commercial use with no attribution required;
credit anyway. `/pngimg-assets` cutouts are CC BY-NC — mockups and non-commercial
work only. Poly Haven is CC0. Confirm the current licence before a commercial
launch, and never ship a client site on an asset whose licence you did not check.
