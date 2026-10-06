---
name: premium-web-design
description: Build customer-facing websites with a strong art direction, fast. Default mode builds one committed brand world in a single page: a characterful display face, a highlighted headline word, a drawn or product hero object, sticker callouts carrying in-world details, plain HTML and CSS. `--full` runs the Awwwards workflow (measured site studies, art-direction contract, scroll choreography, WebGL tiers, Playwright auditor). Use when building or redesigning marketing sites, product sites, landing pages, launch pages, brand or campaign microsites; when the user runs /premium-web-design; or asks for premium, polished, award-winning, or cinematic web design. Do not auto-apply to authenticated app chrome (dashboards, settings, admin, CRUD), design-system primitives, or pure API/infra work unless explicitly invoked.
---

# /premium-web-design

You build one page that looks like a studio made it for this brand alone. Pick
a world, commit to it in every token, draw the thing, and let the details carry
the personality. Any frozen frame of the page should be worth posting.

## Dispatch (do this first)

Read `<skill-dir>/full.md` and follow it **instead of this file** when any of
these hold:

- the invocation says `--full`, "full workflow", Awwwards, Site of the Day, or cinematic
- the brief asks for scroll storytelling, pinned chapters, scrubbed sequences, WebGL or 3D
- the user names a site from `references/site-studies/` as the target

Otherwise stay here. Tell the user in one line which mode you took and that
`--full` switches. `<skill-dir>` is the directory holding this file.

## 1. Brief

If the project has no `PRODUCT.md`, write one before any markup. Keep it under
30 lines:

```md
# Product
## Register        brand | product
## Users           who lands here, and what they need in the first 5 seconds
## Purpose         what the page must get a visitor to do
## Personality     three words
## Anti-references what this must not look like, named concretely
## Principles      3–5 rules specific to this brand
```

Anti-references matter most. "Not a generic pink dating app" or "no AI gradient
blobs, no hero plus three feature cards" closes the default exits before you
reach them.

## 2. The world

Write one sentence that names a place and a moment, the palette by the objects
it comes from, the display face, and the drawn hero object. Put it at the top
of the stylesheet as a comment. Every later decision traces back to it.

```css
/* Taxi for Taxis
   A city at 2:47 a.m.: night navy, checker-cab yellow, a neon pink
   route line, Bungee on the signs. The cabs are drawn, and one drawing
   plays both the tired cab and the one coming for it. */
```

Other worlds that shipped well: "A 1970s dating app: cream paper, sunset
stripes, chocolate ink and hot pink, Shrikhand for the romance." "An aviation
academy on a clear morning: sky blue, safety orange, navy stencil type,
altitude readouts."

A world is concrete. "Modern and clean" is not a world. "A launch site that
brags: one burnt-orange field, 200px lowercase black type, one word knocked out
of a dark block" is.

## 3. Tokens

One `:root` block. Name colours after things in the world, never `--primary`.

```css
:root {
  --night: #141833;  --night-2: #1f2550;  --night-3: #2c3470;
  --yellow: #ffc41f; --yellow-soft: #fff1b8;
  --pink: #ff4fa3;   --cyan: #56e0e6;
  --ink: #111;       --white: #f7f5ee;  --muted: #a9aed6;

  --display: "Bungee", Impact, sans-serif;
  --sans: "Space Grotesk", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, monospace;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}
```

- **Palette.** One ground, one dark ink tinted toward the ground's hue, one loud
  accent, one or two support colours, soft tints of each. 6–10 tokens. No pure
  `#000` or `#fff` on large areas. OKLCH with a shared `--hue` works well for a
  single-hue field (brag's own site runs everything off `--hue: 35`).
- **Three faces, three jobs.** A display face with character that belongs to the
  world. A friendly text sans. A mono for data, labels and side notes.
  Pairings in `references/brand-world.md`.
- **Never as display:** Inter, Roboto, Arial, system-ui, Space Grotesk, Poppins,
  Montserrat, DM Sans, Outfit, Sora, Figtree. Several of those make good text
  faces.

## 4. Hero

The hero fills one screen and does five things: names the product, lands the
personality, shows the product or its world, gives one action, and makes the
frame postable.

```
nav:   brand mark (a small drawn badge or logo) · 2 links · pill CTA
left:  mono eyebrow with one specific fact    CAB-TO-CAB DISPATCH · LIVE IN 12 METROS
       display headline, 2–3 lines            WHEN YOUR TAXI NEEDS A [TAXI.]
       lede, 1–3 short sentences, 30–36ch     We route the nearest cab to your tired cab. Yes, really.
       primary button + mono side note        [Request a pickup]  No surge for tired vehicles.
right: the hero object, plus 1–3 stickers
back:  scenery layer (map grid, hills, arches, sky, waves)
```

**The highlighted word.** One word of the headline gets a treatment: knocked out
of an ink block, set in the accent on a tilted bar, or recoloured with a hard
offset shadow. One word, never two. This one move does more for perceived
design than anything else in this file. Recipes in `references/brand-world.md`.

**The headline names the offer.** A stranger reading only the `h1` knows what
is sold, and where or for whom: "Same-day puncture fixes in Woodstock". Wordplay
is fine when the line still decodes alone; otherwise the cheek moves to the
stickers, side notes and the drawing's face.

**Headline size.** `clamp(52px, 6.4vw, 104px)` beside a hero object;
`clamp(64px, 13vw, 200px)` when type is the hero. Wide faces (Shrikhand, Bungee)
drop to about `clamp(48px, 5.6vw, 88px)`. Aim for 2–3 lines: widen the copy
column and shorten the line before you shrink the type. Line height 0.86–1.0,
tight tracking for heavy faces, `text-wrap: balance`.

**The hero object** is the product or its world, made for this page. Pick one:

1. **A drawing.** Inline SVG, flat fills from the palette, one ink stroke weight
   (3–5px, round joins), a ground shadow. Characters get eyes with a white glint.
   Reuse one drawing for variants by driving fills with CSS custom properties.
2. **The product UI** in a device frame, built in HTML with real-looking
   in-world content (a profile card, a feed, an ETA).
3. **Owner photography** in a shaped frame, when the business is a real place or
   physical product and photos exist. The stickers and highlight still apply.

**Stickers.** 1–3 small cards pinned to the hero object, each carrying one
in-world datum: `ETA 3:08 · #2207 accepted #4821`, `ALTITUDE 14,200 ft`,
`2.4 mi away`. 3px ink border, hard offset shadow in the accent, rotated 2–4°.
The details sell the world. Invented numbers, names and quotes are fine for a
fictional product; for a real business, every number comes from the brief.
Keep stickers off the drawing's face.

## 5. Sections

Four to six after the hero. The page runs 4–7 screens. Each section reveals a
new layer of the same world rather than a new template block.

| Section | What it holds | Make it this brand's |
|---|---|---|
| Band | A marquee strip between hero and body | Border from the world: checker, stitching, film sprocket, ticket perforation |
| How it works | Three steps | Each step gets its own small drawing, not an icon in a box |
| Product in use | The thing doing its job | A live feed, a match screen, a schedule, a receipt |
| Proof | One quote or 3 figures | A named person or character, set big |
| Character | The mascot, founder or instructor | The hero drawing reused in a new pose or colour |
| Close | One CTA | Reprise the hero line with a twist ("Your soulmare is waiting.") |

Ground changes between sections (cream to blush to ink) keep a short page from
reading as one long sheet. Two section layouts may not repeat back to back.
Fewer than six bordered boxes that hold only text on the whole page, stickers
included: give steps and prices a drawing, a photo or a hairline row instead.

## 6. Motion

Plain CSS, no libraries. Motion belongs to the world:

- **One load-in** on the hero object: rise and settle, 700–900ms, ease-out-expo.
- **Ambient loops tied to objects:** stars twinkle, the route line's dashes flow,
  the waiting cab idles 3px, the Zzz floats, the band scrolls. Loops run
  0.5–30s, no two at the same duration.
- **Hover and press:** buttons lift 2px and the shadow grows, then press flat;
  links underline. Nothing else moves on hover.
- `@media (prefers-reduced-motion: reduce)` stops every animation.

Scroll-scrubbed choreography belongs to `--full`.

## 7. Copy

- Sincere, specific, in-world. The layout plays it straight and the humour
  lives in details: "Download on the Hay Store." "No surge for tired vehicles."
- Every heading tells a stranger what the section covers.
- Button text is a verb and an object: "Request a pickup", "Enroll for the spring cohort".
- Banned: elevate, seamless, unlock, supercharge, streamline, next-gen,
  "Welcome to", "where X meets Y", lorem ipsum, em dashes. Use the banned
  lists and the decode test in `references/no-slop.md`; skip its scorecard and
  the `full.md` steps it cites.
- Real business: trace every number, name and claim to the brief, or cut it.

## 8. Build and look

Files: `index.html` (120–220 lines) and `styles.css` (300–550 lines). Fonts from
Google Fonts with `display=swap`. Semantic landmarks, a skip link, visible focus
rings in the accent, AA contrast on all body text. Hero stacks to one column
under 900px; the hero object moves below the copy and stays big.

Then render it and look. With Playwright available:

```bash
PW_DIR=<dir containing node_modules/playwright> \
  node <skill-dir>/scripts/audit-page.mjs "file://$PWD/index.html" ./.audit
```

Declare `<!-- premium-web-design: tier=A kind=world because="<one line>" -->`
in `<head>`. `kind=world` tells the auditor this is default mode. Clear every
**FAIL**. SPARSE, CRAFT, and WARNs that cite `typographic-hierarchy.md` or tier
rules measure the `--full` bar; read them, act on any that point at a real
flaw, and move on. If a FAIL is the auditor's mistake, say so in one line with
the measured evidence rather than redesigning around it. Then read the desktop and phone frames with the Read
tool and fix what you see: collisions, a headline breaking into four lines, a
sticker covering the face of the drawing, a drawing that reads as clip art.
Two passes is normal.

Without Playwright, say so in one line and offer the install:
`mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install chromium`.

## Done

- [ ] `PRODUCT.md` exists, with anti-references
- [ ] World sentence heads the stylesheet, and the palette, faces and object trace to it
- [ ] Display face has character; text and mono faces each do one job
- [ ] One highlighted word in the headline
- [ ] Hero object made for this page: drawing, product UI, or owner photo, plus stickers carrying in-world data
- [ ] Every section reveals a new layer of the world; no two layouts repeat back to back
- [ ] Motion is CSS, tied to objects, off under reduced motion
- [ ] No banned words; every claim about a real business traced to the brief
- [ ] Desktop and phone frames read with your own eyes, and one thing fixed because you looked

## References

| Open | When |
|---|---|
| `references/brand-world.md` | Pairings, highlight-word, sticker, button, band and SVG-character recipes |
| `demos/brand-world/` | A finished default-mode page (fictional Cape Town bike shop): PRODUCT.md, index.html, styles.css. Read it before your first build |
| `references/no-slop.md` | Writing any visible string |
| `references/imagery.md` | Sourcing and cropping owner or stock photography |
| `references/color-and-light.md` | More palettes and contrast fixes |
| `full.md` | The Awwwards workflow: studies, contract, tiers, scroll choreography, full audit |
