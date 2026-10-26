---
name: premium-web-design
description: Build customer-facing websites with a strong art direction. Every run uses the whole skill: a committed brand world, a scroll story (storyboard, held protagonist, kit/story.js), highlighted headline, drawn or product hero, stickers, copy rules, and the audit in full.md (studies, art-direction contract, Playwright). WebGL or 3D is an extra tool inside that same workflow when the brief needs it. Use when building or redesigning marketing sites, product sites, landing pages, launch pages, brand or campaign microsites; when the user runs /premium-web-design; or asks for premium, polished, award-winning, or cinematic web design. Do not auto-apply to authenticated app chrome (dashboards, settings, admin, CRUD), design-system primitives, or pure API/infra work unless explicitly invoked.
version: 1.2.0
---

# /premium-web-design

You build one page that looks like a studio made it for this brand alone. Pick
a world, commit to it in every token, draw the thing, and let the details carry
the personality. Then tell its story with the scroll: the thing you drew stays
on screen and changes, one beat at a time. Any frozen frame of the page should
be worth posting. The frames in order should tell the story.

There is one workflow. A page of sections that only fade in is a fail. WebGL,
3D and photo or video frame sequences are extra tools inside this same workflow
when the brief needs them. They are not a second mode.

## Dispatch (do this first)

`<skill-dir>` is the directory that contains this `SKILL.md`. That is true for
Claude Code, Cursor, Windsurf, Cline, Copilot, Codex, Gemini CLI, OpenCode and
any host that installs from `jmrsquared/skills`. It must also contain `kit/`,
`references/` and `full.md`. If `kit/story.js` is missing, stop and reinstall
the skill from the repo. Do not invent a replacement runtime.

Hosts sometimes inline this file and say not to open others. Ignore that for
the reads below. This file and `full.md` apply together. Do not follow one and
skip the other.

**Required reads before any markup** (open the files; do not rely on memory):

- `<skill-dir>/full.md`
- `<skill-dir>/references/scroll-story.md`
- `<skill-dir>/references/brand-world.md`
- `<skill-dir>/references/no-slop.md`
- `<skill-dir>/references/hero-depth.md`
- `<skill-dir>/demos/scroll-story/PRODUCT.md`
- `<skill-dir>/demos/scroll-story/index.html`
- `<skill-dir>/demos/brand-world/index.html`

Then copy `<skill-dir>/kit/story.js` and `<skill-dir>/kit/story.css` into the
project before writing page CSS. Paths: next to a static `index.html` as
`kit/`, or for Vite/Next/Expo-web as `public/kit/` (or the app's static
folder) and link them from the document head. Only then write `PRODUCT.md`
and markup.

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

Then add the **storyboard** to `PRODUCT.md`, before any markup: a `## Story`
block naming the protagonist, its change from top to bottom of the page, the
spine, the peak and the ending, plus a scene table with one row per scene
(pattern, span, the one change, the copy beat and the transition into the
next). Finish with a **feeling curve**: one line per scene, the emotion, then
what on screen causes it. The format, the vocabulary and a worked example are
in `references/scroll-story.md` and `demos/scroll-story/PRODUCT.md`;
`references/feeling-curve.md` carries the peak-end rule and the feel check.

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

**The brand mark.** The nav, the favicon and often the close carry the mark, so
settle it here, before tokens. If the brief supplies a usable logo (SVG, or a
clean PNG at 512px or more), use it and trace its colours into the palette. If
there is none, or only a placeholder, an unmodified stock-font monogram or clip
art, design one with `<skill-dir>/../jmr-logo-design/SKILL.md`: read its
"Inside /premium-web-design" section and follow it. It takes the brief from
`PRODUCT.md` and the world sentence, stops once to show three concepts and
writes the chosen mark to `brand/`. A mark drawn from scratch in the nav
without that skill's tests is a fail.

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

For premium marketing sites, **layering is part of the baseline, not optional
polish**. A beautiful photograph with one parallax transform still reads flat.
Plan independent background, subject, foreground, and atmospheric planes
before requesting any assets, with each plane moving at a slightly different
rate. The full recipe, traps and the phone art-direction pass live in
`references/hero-depth.md`.

```
nav:   brand mark (supplied, or from jmr-logo-design) · 2 links · pill CTA
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

Four to six after the hero. Each section reveals a new layer of the same world
rather than a new template block. The sections are the scenes of the
storyboard: the held ones carry the protagonist, the rest breathe between
them (section 6).

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

## 6. Scroll story (mandatory, non-negotiable)

Every page is a scroll story wired with **`kit/story.js`**. Do
not write `useStory`, `useChoreography`, ScrollTrigger, Framer Motion scroll,
IntersectionObserver chapter machines, or any other scroll runtime. Copy the
kit; put story in markup and CSS.

### Kit contract (enough to wire without the reference)

| Attribute | Role |
|---|---|
| `data-scene` + `--span` | A scroll chapter. Height ≈ span × 100svh |
| `data-stage` | Sticky 100svh stage that holds the protagonist |
| `data-steps` / `data-step` | Discrete beats (chat messages, numbered steps) |
| `data-track` + `animation-name` | Scrubs that element's paused `@keyframes` via `--t` |
| `data-range="a b"` | Plays the track only inside part of the scene |
| `data-reveal="lines\|lift\|rule\|draw\|unmask\|count"` | Copy/art enters via `--e` |
| `data-chapters` | Nav links get `aria-current` for the active scene |

Head (static HTML or the app shell's document):

```html
<script>
  document.documentElement.dataset.story =
    matchMedia('(prefers-reduced-motion: reduce)').matches ? 'static' : 'live';
</script>
<link rel="stylesheet" href="/kit/story.css">
<script src="/kit/story.js" defer></script>
```

React/Vite/Next: still use those attributes on DOM nodes (`<section data-scene
style={{ ['--span' as string]: 1.6 }}>`). Put the two kit files in `public/kit/`
and link them once from `index.html` (Vite) or the root layout `<head>` (Next).
Do not reimplement the runtime in a hook.

Ship checklist for this section (abort and fix if any fail):

- [ ] `PRODUCT.md` has `## Story` with protagonist, change, spine, peak, ending and a scene table
- [ ] Project contains the copied `kit/story.js` and `kit/story.css` (not a rewritten clone)
- [ ] Markup has at least one held run: outer `data-scene` → `data-stage` → nested chapter `data-scene`s
- [ ] At least two `data-track` elements change the protagonist across chapters
- [ ] Console shows `[story] live: …` after load (or `static` under reduced motion)

Story rules:

- **The protagonist is the hero object.** Sticky on the stage across 2–4 chapter
  scenes. Each chapter changes one thing about it with a `data-track`.
- **Name every transition** in the scene table (carry, match cut, ground wipe,
  push-in, line hand-off, ending). One wipe grammar for every chapter break.
  A section that only fades in its own content is a non-sequitur; cut it.
- **Breathe between held runs** with normal scroll + `data-reveal`.
- **Spine** (ticket, rail, odometer) + `data-chapters` on the nav.
- **Pay off the opening** at the close, next to the one action.
- **Phone:** subject bottom half, opaque plates top half.
- **Reduced motion / no JS:** finished state is the CSS fallback. Exclude
  `[data-track]` from blanket `animation: none`.

## 7. Motion

CSS, no libraries beyond the kit. Motion belongs to the world:

- **One load-in** on the hero object: rise and settle, 700–900ms, ease-out-expo.
- **Ambient loops tied to objects:** stars twinkle, the route line's dashes flow,
  the waiting cab idles 3px, the Zzz floats, the band scrolls. Loops run
  0.5–30s, no two at the same duration.
- **Hover and press:** buttons lift 2px and the shadow grows, then press flat;
  links underline. Nothing else moves on hover.
- `@media (prefers-reduced-motion: reduce)` stops every animation. Exclude
  `[data-track]` from any blanket `animation: none` rule; the kit already
  parks tracks at their rest state.

## 8. Copy

- Sincere, specific, in-world. The layout plays it straight and the humour
  lives in details: "Download on the Hay Store." "No surge for tired vehicles."
- Every heading tells a stranger what the section covers.
- Button text is a verb and an object: "Request a pickup", "Enroll for the spring cohort".
- Banned: elevate, seamless, unlock, supercharge, streamline, next-gen,
  "Welcome to", "where X meets Y", lorem ipsum, em dashes. Use the banned
  lists and the decode test in `references/no-slop.md`; skip its scorecard and
  the `full.md` steps it cites.
- Real business: trace every number, name and claim to the brief, or cut it.

## 9. Build and look

Files: page markup (140–260 lines for a static `index.html`), `styles.css`
(300–600 lines) and the two **copied** kit files from section 6. Link the kit
in `<head>` before your stylesheet (snippet in §6). Do not ship without
`[story] live` in the console.

Fonts from
Google Fonts with `display=swap`. Semantic landmarks, a skip link, visible focus
rings in the accent, AA contrast on all body text. Hero stacks to one column
under 900px; the hero object moves below the copy and stays big.

Then render it and look. With Playwright available:

```bash
PW_DIR=<dir containing node_modules/playwright> \
  node <skill-dir>/scripts/audit-page.mjs "file://$PWD/index.html" ./.audit
PW_DIR=… node <skill-dir>/scripts/story-frames.mjs "file://$PWD/index.html" ./.story
PW_DIR=… node <skill-dir>/scripts/story-frames.mjs "file://$PWD/index.html" ./.story-phone 390 844
```

`story-frames.mjs` writes `storyboard.jpg`: every scene at the start, middle
and end of its scroll, one row per scene. Cover the copy and read it as a
comic strip. If the pictures alone do not tell the story, the page does not
either. Add `?story-debug` to the URL when a track does not move.

Declare `<!-- premium-web-design: tier=B because="<one line>" -->` in `<head>`.
Do not add `kind=world`. Clear every **FAIL**, and do not stop while SPARSE or
CRAFT findings remain. If a finding is the auditor's mistake, say so in one
line with the measured evidence. Then open the desktop and phone JPEGs and fix
what you see: collisions, a headline breaking into four lines, a sticker
covering the face of the drawing, a drawing that reads as clip art, a plate
covering the subject it describes. Two passes is normal.

Without Playwright, say so in one line and offer the install:
`mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install chromium`.

## Done

- [ ] `PRODUCT.md` exists, with anti-references
- [ ] World sentence heads the stylesheet, and the palette, faces and object trace to it
- [ ] Brand mark is the supplied logo or a `jmr-logo-design` mark the user picked; favicon and web icons come from it
- [ ] Display face has character; text and mono faces each do one job
- [ ] One highlighted word in the headline
- [ ] Hero object made for this page: drawing, product UI, or owner photo, plus stickers carrying in-world data
- [ ] Hero has independent depth planes (background, subject, foreground) that move at visibly different rates
- [ ] Every section reveals a new layer of the world; no two layouts repeat back to back
- [ ] Required reads done: `full.md`, scroll-story, brand-world, no-slop, hero-depth, both demos
- [ ] `PRODUCT.md` has the storyboard: protagonist, change, spine, peak, ending, scene table, feeling curve
- [ ] Copied `kit/story.js` + `kit/story.css` are in the project; no custom scroll runtime
- [ ] Markup uses `data-scene` / `data-stage` / `data-track`; console shows `[story] live`
- [ ] The hero object is held on a stage through at least one run and changes once per chapter
- [ ] Every scene boundary names what carries across; one wipe for every chapter break
- [ ] The close pays off the opening, next to the one action
- [ ] `storyboard.jpg` read on desktop and phone with the copy covered; the pictures tell the story
- [ ] Motion is CSS + kit; under reduced motion every scene shows its finished state
- [ ] No banned words; every claim about a real business traced to the brief
- [ ] Auditor reports zero FAIL, zero SPARSE and zero CRAFT, or each leftover is named with measured evidence
- [ ] Desktop and phone frames read with your own eyes, and one thing fixed because you looked

## References

| Open | When |
|---|---|
| `references/scroll-story.md` | Storyboard format, scene patterns, transitions, pacing, the `kit/` API and the story check. Read before wiring any scroll |
| `demos/scroll-story/` | The bike shop told as one morning on the workstand: storyboard in PRODUCT.md, held run, tracks, steps, stagger. Read it before your first build |
| `references/brand-world.md` | Pairings, highlight-word, sticker, button, band and SVG-character recipes |
| `demos/brand-world/` | The same bike shop as a static world page: tokens, stickers, band, prices. The scroll-story demo builds on its stylesheet |
| `references/no-slop.md` | Writing any visible string |
| `../jmr-logo-design/SKILL.md` | The brand has no usable logo: design the mark, favicon and web icons (section 2) |
| `references/imagery.md` | Sourcing and cropping owner or stock photography |
| `references/color-and-light.md` | More palettes and contrast fixes |
| `references/hero-depth.md` | Layered hero recipe, five depth tools, phone art direction |
| `references/feeling-curve.md` | Feeling curve, engineered peak, feel check |
| `references/structure-axis.md` | Page grammars, signature move, fingerprint gate (read when the brief has a clear structure) |
| `references/worlds.md` | Eight photography preambles, the high-key canvas flips, composition rules, cohesion checks |
| `references/browser-surfaces.md` | Selection, caret, focus, scrollbar, underline, tabular numerals, the squint test |
| `full.md` | Required on every run: studies, contract, tiers, audit, Done list |
