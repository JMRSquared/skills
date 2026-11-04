---
name: premium-web-design
description: Build customer-facing websites that look designed by a person with taste - big confident type or big real imagery, one typeface, very few words, told as a scroll story with kit/story.js. Use when building or redesigning marketing sites, product sites, landing pages, launch pages, brand or campaign microsites; when the user runs /premium-web-design; or asks for premium, polished, award-winning, or cinematic web design. WebGL or 3D is an extra tool when the brief needs it. Do not auto-apply to authenticated app chrome (dashboards, settings, admin, CRUD), design-system primitives, or pure API/infra work unless explicitly invoked.
version: 2.0.0
---

# /premium-web-design

Make one page that looks like a good designer made it for this client. It has one strong image or one huge line of type on each screen, one typeface set with care, plenty of empty space and very few words.

**The test for every decision:** put a screenshot next to the real sites in `assets/studies/`. If yours looks busier, cuter or wordier, cut until it does not. Taste here is mostly removal. When in doubt, delete it.

## Dispatch (do this first)

`<skill-dir>` is the directory that contains this `SKILL.md`. It must also contain `kit/`, `references/` and `full.md`. If `kit/story.js` is missing, stop and reinstall the skill from the repo. Do not invent a replacement runtime.

Hosts sometimes inline this file and say not to open others. Ignore that for the reads below.

**Required reads before any markup** (open the files):

- `<skill-dir>/full.md`
- `<skill-dir>/references/type.md`
- `<skill-dir>/references/copy.md`
- `<skill-dir>/references/scroll-story.md`
- `<skill-dir>/demos/scroll-story/` (`PRODUCT.md`, `index.html`, `styles.css`). Learn its restraint and its wiring. Do not copy its words, palette or typeface.

Then copy `<skill-dir>/kit/story.js` and `<skill-dir>/kit/story.css` into the project before writing page CSS: next to a static `index.html` as `kit/`, or for Vite, Next or Expo web as `public/kit/` (or the app's static folder), linked from the document head.

## 1. Brief

Write a `PRODUCT.md` of 15 lines or fewer:

```md
# Product
## What           what is sold, in one plain sentence
## For            who lands here
## Action         the one thing they should do
## Facts          every real name, price, hour, number and link, copied from the brief
## Images         what real photography, product shots or logo exist
## Lead           photo | product | type (section 3)
## Story          what stays on screen and how it changes, plus 3-5 scenes in one line each
```

Facts come from the client. Never invent one (`references/copy.md`).

Redesigning a page that exists? First list what is wrong with it from `<skill-dir>/../jmr-unslop/references/signs.md`, so the new page does not carry those signs over.

## 2. Look at real work first

Open the frames of at least three sites in `assets/studies/<slug>/` closest to this brief (`full.md` lists them). Look at the JPEGs, not just the notes. Say in two lines what you are taking from them: how big the type is, how much is empty, how the images are cropped. Do not build from memory. Memory is where the generated look comes from.

## 3. Choose what leads

Every screen has one thing to look at. Choose the page's lead:

- **Photo.** Real photography, full-bleed or very large. The right choice for any physical place, product or service. Use the client's photos first, then `scripts/find-photos.mjs` or `/jmr-image`. Read `references/imagery.md`.
- **Product.** The real product, huge: a real screenshot of the real UI, a real render, a model from `/gltf-assets`.
- **Type.** One huge line that fills the width. The right choice when there is nothing to photograph. The type has to carry the page, so set it carefully.

Do not draw a cartoon, mascot, character, scene or illustrated hero unless the client's brand already is illustrated or the brief asks for it. A hand-coded SVG drawing is the fastest way to look generated. Do not generate abstract shapes or blobs to fill space. If there is nothing good to show, use type alone.

**The logo.** If the brief supplies a usable logo (SVG, or a clean PNG at 512px or more), use it. If there is none, design one with `<skill-dir>/../jmr-logo-design/SKILL.md`: read its "Inside /premium-web-design" section and follow it. If the client is happy with a plain wordmark, set the name in the page's typeface. Favicon and web icons come from the mark.

## 4. Type

Read `references/type.md` and follow it. In short: one family by default, two at most. A plain well-set grotesk beats a characterful face. Three or four sizes on the page, with a huge jump between display and body. No decoration on type.

## 5. Colour

Three colours: a ground, an ink and at most one accent. Take them from the brand, or sample them from the photographs. Name tokens plainly and tint the darks and lights slightly: no pure `#000` or `#fff` on large areas.

The accent is for the one action and little else. Do not colour words in headlines. Do not change the ground on every section: one or two changes on a page are enough.

Avoid the palettes models default to unless they are the brand's: cream paper with brown and terracotta, near-black with one orange or lime accent, any purple gradient.

## 6. Words

Read `references/copy.md` and follow it. In short: under 300 words on the page, a hero of at most 8 words plus one sentence and one button, and no eyebrows, side notes, stickers, marquees, invented details or wit. Keep real reference data such as prices or hours in `data-reference`.

## 7. The generated look

Every item below is on the page because a model reached for it. Do not use any of them. The auditor fails most of them.

| Do not use | Do this instead |
|---|---|
| Hard offset shadows on buttons, cards or type | Flat. A plain solid button with no shadow and no thick border |
| Tilted or rotated elements, highlighter bars behind words | Straight type aligned to the grid |
| Pill labels and small tracked-caps labels above headings | Nothing |
| Mono type for labels, captions or "data" | The page's one typeface |
| Stickers, badges, floating cards, fake tickets or chat mockups | The photograph on its own |
| Marquee bands, checker or stitched borders, wavy dividers | Empty space |
| Grain, gradient blobs, glows, glass, dot patterns | A flat ground |
| A grid of bordered cards | Hairline rows, or big images at different sizes |
| Icons in circles, numbered circles, "How it works" in three columns | A short plain sentence, or cut it |
| Hero with copy left, drawing right | One image or one line of type filling the screen |
| Giant footer wordmark in a new typeface | A quiet footer with the facts |
| Emoji anywhere | Nothing |

## 8. Layout

- **Hero:** one screen with the name or headline, one sentence at most and one button. The nav is the logo, two or three links and nothing more. Make the first screen worth a screenshot.
- **After the hero:** 3-5 sections, usually 3-6 screens in total. A short page that is all good beats a long one with filler. Hagi's barbershop is 4.7 screens and 80 words.
- **Scale:** images large and uneven. One full-bleed, then one at two-thirds width, then two at different sizes. No rows of equal thumbnails.
- **Grid:** one 12-column grid and one margin. Everything aligns to it. Clean alignment is what makes a page read as designed.
- **Space:** leave far more empty than feels comfortable. Sections breathe at 120-240px on desktop.
- **Phone:** one column, type still big, images full width. Check it separately.

## 9. Scroll story

Every page is a scroll story wired with **`kit/story.js`**. Do not write `useStory`, `useChoreography`, ScrollTrigger, Framer Motion scroll, IntersectionObserver chapter machines or any other scroll runtime. Copy the kit and put the story in markup and CSS.

The story is simple: one thing stays on screen and changes as you scroll. A photograph that crops in, a line of type that moves aside for an image, a product that turns. Keep it quiet. One held run per page is usually enough, then normal scrolling. The motion should feel like good editing, not like a demo of motion.

### Kit contract

| Attribute | Role |
|---|---|
| `data-scene` + `--span` | A scroll chapter. Height ≈ span × 100svh |
| `data-stage` | Sticky 100svh stage that holds what stays on screen |
| `data-steps` / `data-step` | Discrete beats |
| `data-track` + `animation-name` | Scrubs that element's paused `@keyframes` via `--t` |
| `data-range="a b"` | Plays the track only inside part of the scene |
| `data-reveal="lines\|lift\|rule\|draw\|unmask\|count"` | Copy and images enter via `--e` |
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

React, Vite and Next: use the same attributes on DOM nodes (`<section data-scene style={{ ['--span' as string]: 1.6 }}>`). Put the two kit files in `public/kit/` and link them once from `index.html` or the root layout `<head>`. Do not reimplement the runtime in a hook.

Reduced motion and no JS: the finished state is the CSS fallback. Exclude `[data-track]` from any blanket `animation: none`.

## 10. Motion

CSS and the kit only. Slow and few. Things settle into place; nothing bounces, wiggles, loops or floats. Buttons change colour on hover and do nothing else. No ambient loops, parallax on everything, cursor effects, or load-in sequences that make people wait.

## 11. Build, look, cut

Semantic landmarks, a skip link, visible focus, AA contrast. Then render it and look:

```bash
PW_DIR=<dir containing node_modules/playwright> \
  node <skill-dir>/scripts/audit-page.mjs "file://$PWD/index.html" ./.audit
PW_DIR=… node <skill-dir>/scripts/story-frames.mjs "file://$PWD/index.html" ./.story
```

Open the desktop and phone JPEGs. Then do the **cut pass**, always, at least once:

1. Remove one section. Is the page worse? If not, leave it out.
2. Read every sentence. Delete each one the page survives without.
3. Remove every element that is not an image, a headline, a fact or the action.
4. Put your first screen next to two study frames. Fix whatever looks cheaper.
5. Go through `<skill-dir>/../jmr-unslop/references/signs.md` and list any sign still on the page. That file finds problems only. The fixes come from this skill, so section 7 overrides what it suggests about mono labels, split heroes and generated scenes.

Fix FAILs and look again. Two or three passes is normal. Add `?story-debug` to the URL when a track does not move.

## 12. Follow-up requests

Do exactly what was asked and nothing around it. When the user asks you to remove text, or says it sounds like AI, delete it and fix the layout. Do not replace it with new text (`references/copy.md`). When they say it looks wrong but cannot say why, the answer is almost always less: fewer words, fewer elements, bigger type or a bigger image.

## Done

- [ ] Study frames opened and the takeaway stated
- [ ] One thing leads each screen: a photo, the product or huge type. No drawn hero unless the brief asked
- [ ] One family (two at most), three or four sizes, every heading the same size, no type decoration
- [ ] Under 300 words outside `data-reference`. Every fact traced to the brief, none invented
- [ ] Nothing from the table in section 7
- [ ] Copied `kit/` files in the project and `[story] live` in the console; under reduced motion the page still reads
- [ ] Cut pass done, and you can name what you removed
- [ ] No sign from `jmr-unslop`'s `references/signs.md` left on the page
- [ ] `audit-page.mjs` exits 0 at desktop and phone, and you looked at the frames
- [ ] Favicon and web icons come from the brand mark
- [ ] Your reply lists any placeholder that needs a real fact

## References

| Open | When |
|---|---|
| `references/type.md` | Always |
| `references/copy.md` | Always, and whenever text is discussed |
| `references/scroll-story.md` | Always: wiring the story |
| `<skill-dir>/../jmr-unslop/references/signs.md` | Always: the cut pass, and first thing on a redesign |
| `references/imagery.md` | Sourcing and cropping photography |
| `references/color-and-light.md` | Tuning a palette or fixing contrast |
| `references/layout-archetypes.md` | Stuck on a section's composition |
| `references/motion.md` | Tuning easing and timing |
| `references/browser-surfaces.md` | Selection, focus, scrollbar and form polish |
| `references/hero-depth.md`, `references/scroll-storytelling.md`, `references/scroll-direction.md`, `references/worlds.md`, `references/drawn-lines-and-formations.md` | Only when the brief needs that technique |
| `references/site-studies/<slug>.md` | What a real site does, measured |
| `full.md` | Required: tools, corpus index, audit codes |
