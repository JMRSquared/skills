# MacBook Pro (macbook-ui) — https://macbook-ui.vercel.app

**Captured:** 2026-08-14 · **What it is:** an Apple product-page clone — hero, configurator, chip story, feature reel, spec bento, footer. Title string names its own stack: `MacBook Pro Landing Page — React, Vite, TypeScript, Tailwind CSS, GSAP & Three.js Demo` · **Stack (measured):** `bundleLibs` = three, r3f, drei, gsap, ScrollTrigger, shader, webgl, video. `libs.react === true`. Single Vite bundle `assets/index-BF1e6fWR.js`; Tailwind confirmed by `oklch()` values in `topBackgrounds`.
**Page length:** 8.8 screens (scrollHeight 7889 / viewport 900) · **Sections:** 6 · **Canvas/video/img counts:** canvas 2, video 2, img 22, svg 0

## Art direction in one line
Pure `rgb(0,0,0)` from first pixel to last, with light used as the only pigment — a neon-gradient headline, an RGB keyboard glow, and a matte-black laptop that is legible purely from its rim highlights.

## First 3 seconds
`desktop-hero.jpg`: black page. `MacBook Pro` at 30px/white, dead centre, top. Under it `Built for Apple Intelligence.` at ~60px, filled with a cyan→violet→magenta→amber gradient and wrapped in a wide colored bloom that spills ~60px past the glyphs. Below, a MacBook shot from a low front angle, lid nearly closed, the only bright thing in the image being the RGB-lit keyboard bed and a 1px rim light along the display edge. Then a `rgb(0, 113, 227)` pill `Buy Now`, then `From $1599 or $133/mo for 12 months` in `rgb(134, 134, 139)`. Roughly 55% of the hero viewport is empty black.

## Palette (measured)
Three greys, one blue, nothing else in CSS.

| Value | Count | Role |
|---|---|---|
| `rgb(0, 0, 0)` | bg ×5 | page ground, every section |
| `rgb(29, 29, 31)` | bg ×3 | bento card fill (Apple's `--dark-grey`) |
| `oklch(0.269 0 0)` ×2, `oklch(0.205 0 0)`, `oklch(0.87 0 0)` | bg | Tailwind neutral-800/900/300 utilities |
| `rgb(0, 113, 227)` | bg ×1, text ×1 | the single CTA blue, also `Learn more` links |
| `rgb(134, 134, 139)` | text ×119 | body — the most-used color on the page |
| `rgb(255, 255, 255)` | text ×81 | headings and emphasised clauses |
| `rgb(245, 245, 247)` | text ×21 | secondary light |

Every other color on screen — the hero gradient, the battery green, the Apple-Intelligence card's rainbow border, the app-window screenshots — arrives as pixels (video, `<img>`, WebGL), never as a CSS color. The stylesheet is monochrome plus one blue.

## Typography (measured)
Self-hosted SF-alike, split one file per weight rather than a variable font: `@font-face` families literally named `Regular` (loaded), `Medium` (loaded), `SemiBold` (loaded), `Bold` (**unloaded** — declared and never used). All 44 top elements render `SemiBold|400`; `Regular|400` on 6.

| Role | Desktop | Mobile | Color |
|---|---|---|---|
| h1 `MacBook Pro` | 30px / lh 36 | 16px / lh 24 | `rgb(255,255,255)` |
| h2 `Take a closer look.` | 60px / lh 60 (1.00) | 30px / lh 36 | `rgb(255,255,255)` |
| h3 `4x faster` | 48px / lh 48 (1.00) | 20px / lh 28 | `rgb(255,255,255)` |
| p `From $1599…` | 20px / lh 28 | 16px / lh 24 | `rgb(134,134,139)` |
| nav / button / footer | 16px / lh 24 | 16px | `rgb(134,134,139)` |

Note the inversion: the h1 (30px) is *smaller* than the h2 (60px) and h3 (48px). The product name is a label; the marketing claims are the display type. `letterSpacing: normal` and `textTransform: none` on every single row — no uppercase, no tracking anywhere on the page.

## Structure, screen by screen
1. **0–14% — Hero.** Gradient headline + glow, closed MacBook, blue pill, price. `desktop-hero.jpg`
2. **14–29% — Configurator.** `desktop-01.jpg`: the laptop is now a lid-closed 3/4 top view rendered so dark that only the rim light and the Apple logo separate it from the ground. Two pill toggles sit centred at the bottom: a colour switch (silver / space-black dots) and a `14" | 16"` size switch with the active option in a white capsule. This is the WebGL model — swap colour and size and the object re-renders.
3. **29–43% — Full-bleed video.** `desktop-02.jpg`: an Assassin's-Creed-style game capture running edge-to-edge under a transparent sticky nav, black letterbox below. This is the "console-level graphics" proof.
4. **43–50% — Chip story with overlapping pinned layers.** `desktop-03.jpg` caught two pinned timelines mid-scrub: `Next-level graphics performance. Game on.` (centre, white, ~60px) sits over `Rocket Chip` and `Introducing M4…`, while a scattered mosaic of ~12 app-window screenshots flies through frame at different scales. `desktop-04.jpg` resolves it: a centred ~440px-wide paragraph in `rgb(134,134,139)` with exactly one clause promoted to white (`gaming feels more immersive and realistic than ever.`), then the next headline `See it all in a new light.` The overlap in 03 is a scrub artifact, not a bug you would see at reading speed — but it proves the section pins and cross-fades rather than scrolling normally.
5. **50–86% — Apple Intelligence feature reel.** `desktop-05.jpg`, `desktop-06.jpg`: the laptop opens and rotates through a sequence of poses (lid at ~110° facing left, then near-front with the screen filled by a document) while short `Bold label. Grey sentence.` blocks fade in at alternating left and right margins. Screen content is a live texture — a photo editor in 05, a research doc with a pull-quote in 06.
6. **86–100% — Spec bento + footer.** `desktop-07.jpg`: 2×2 asymmetric grid on `rgb(29,29,31)` cards with ~20px radii. One card is a photo with copy over it (`Fly through demanding tasks up to 9.8x faster.`), one is icon+text, one carries a 2px animated rainbow border around `Built for Apple Intelligence.`, one holds a green gradient battery glyph. Footer: legal line, hairline rule, 5 links.

Six beats. Two of them (4 and 5) are pinned/scrubbed; the rest scroll conventionally.

## Motion inventory

| Moment | Trigger | What moves | Est. duration / easing | Library evidence |
|---|---|---|---|---|
| Hero headline bloom | load | gradient text scales up from ~0.94 with the glow blurring in behind it | ~1200ms, ease-out | `gsap`; glow is a separate blurred layer, not `text-shadow` |
| Hero laptop reveal | load | lid rises a few degrees; the RGB keyboard glow ramps up | ~1500ms scrub-free | video (`counts.video === 2`) |
| Config colour / size swap | click pill toggle | model material + geometry swap; active option slides into a white capsule | ~300ms material, ~200ms capsule slide | `r3f` + `drei`; `desktop-01.jpg` |
| Game video section | scroll enter, autoplay | full-bleed muted loop plays; nav stays transparent over it | continuous | `video` in bundleLibs, `counts.video === 2` |
| Chip mosaic fly-through | scroll scrub, pinned | ~12 app-window images travel at 3+ different scales/speeds past a pinned headline | scrub over ~1.5 viewports | `ScrollTrigger` pin; `desktop-03.jpg` shows two pinned layers coexisting |
| Word-by-word paragraph highlight | scroll scrub | body paragraph starts at `rgb(134,134,139)`; each clause flips to `rgb(255,255,255)` as it reaches the scrub point | scrub, per-clause | `desktop-04.jpg` shows exactly one clause white mid-scroll |
| Laptop open + orbit | scroll scrub | lid angle and `rotation.y` are both driven by progress; laptop travels from left third to centre across ~3 viewports | scrub | `desktop-05.jpg` vs `desktop-06.jpg` |
| Feature-caption fade | scroll enter | `Bold label. Grey body.` blocks fade+rise at alternating margins, timed to the laptop pose | ~400ms ease-out, staggered | `gsap` |
| Bento rainbow border | continuous | 2px conic gradient border rotates around one card | ~4s linear loop | `desktop-07.jpg` |

## The 3D system
- **Two canvases, two videos, and 22 images — a hybrid, not a pure WebGL page.** The hero and the opening reveal are *video*; the configurator and the feature reel are *canvas*. The page uses whichever is cheaper for the shot and the seam is invisible because everything sits on the same `rgb(0,0,0)`.
- **Black-on-black is only solvable with lighting.** The model reads as a silhouette plus three light events: a 1px rim highlight along the display edge, the RGB keyboard bed, and the screen texture. There is no ambient fill — `desktop-01.jpg` is ~92% near-black pixels and still reads unambiguously as a MacBook.
- **The screen is a texture, and it is the only bright thing in frame.** `desktop-05.jpg` and `desktop-06.jpg` put a photo editor and a research document on the panel; the surrounding chassis stays under ~8% luminance. Attention lands on the UI, which is what a laptop ad is selling.
- **Scroll → transform mapping.** In the feature reel, progress drives three channels at once: lid angle (~0° → ~110°), `rotation.y` (3/4 left → near-front), and `position.x` (left third → centre). Camera position appears fixed; the pose changes.
- **Configurator is click-driven, not scroll-driven.** Colour and size are UI state, deliberately outside the scroll timeline so a user can stop and play. That is the one interactive moment on an otherwise linear page.
- **Readability over the moving stage:** the laptop is kept in the *centre* column and captions sit in the left/right margins (`desktop-05.jpg`, `desktop-06.jpg`) — no scrim, no blur backdrop anywhere in `topBackgrounds`. Where copy has to sit over pixels (the bento photo card, the game section), it moves to a bento card with a solid `rgb(29,29,31)` fill or a hard bottom-left anchor.
- **Mobile fallback: none needed — both canvases survive.** `mobileData.counts` is identical to desktop: canvas 2, video 2, img 22.

## Why it reads expensive
1. **One CTA color on the entire page.** `rgb(0, 113, 227)` appears exactly twice in the computed styles (one background, one text). Everything else is grey.
2. **Grey body text outnumbers white 119:81.** The page defaults to low-contrast `rgb(134,134,139)` and spends white only on the claims that matter — including mid-paragraph, one clause at a time.
3. **Hero is 55% empty.** No feature strip, no logo wall, no scroll cue. Headline, product, one button, one price.
4. **A declared-and-unused `Bold` face.** The type system was scoped, then trimmed to three weights — restraint left in the artifacts.
5. **h1 smaller than h2 and h3.** 30px product name against a 60px claim. Hierarchy set by argument, not by DOM level.
6. **No uppercase, no letter-spacing, no text-transform on any measured element.** Nothing decorative is asked of the type.
7. **1.00 line-height on both display sizes** (60/60, 48/48) — headlines set as tight blocks, matching Apple's own optical leading.
8. **Colour arrives only as light.** Gradients, glows and rainbows are pixels from video/WebGL/images; the CSS palette stays monochrome, so nothing can drift out of brand.

## Mobile adaptation
Measured at 390×844: scrollHeight 7938, 9.4 screens, same 6 sections, same 2 canvases + 2 videos + 22 images, same `topBackgrounds` list. Nothing is dropped.
- **Type collapses hard.** h1 30 → 16px, h2 60 → 30px, h3 48 → 20px, p 20 → 16px. The h1 lands at body size — on mobile the product name is genuinely just a kicker.
- **Hero recomposes vertically** (`mobile-00.jpg`): headline shrinks to a single ~26px line so the gradient still fits on one line, the laptop drops to ~40% of viewport width, and the `Buy Now` pill grows to ~55% width with 24px type — thumb-sized while the desktop pill is small.
- **Two-column feature rows become one column** (`mobile-01.jpg`): left caption and right stat stack into a single left-aligned run, with generous vertical gaps standing in for horizontal separation.
- **The laptop is pushed to the bottom half** (`mobile-02.jpg`): caption occupies the top third, the model enters from the bottom-left corner and is allowed to be cropped by two edges rather than shrunk to fit.
- **Bento goes 1-up** (`mobile-03.jpg`): the rainbow-bordered card and the battery card become full-width, radius and 2px border preserved at scale; the footer link row becomes a vertical list.

## Steal list

| Component | How to rebuild | Cost |
|---|---|---|
| Bloomed gradient headline | `background: linear-gradient(90deg, #22d3ee, #a855f7, #f97316); -webkit-background-clip: text; color: transparent`, plus a duplicate copy behind it at `filter: blur(40px); opacity: .7`. Do not use `text-shadow` — it will not bloom this wide. | S |
| Scroll-scrubbed clause highlight | Split the paragraph into `<span>`s, `ScrollTrigger` with `scrub: true` over the section, tween each span `color: #86868b → #fff` on a stagger. Reads as reading. | S |
| Click-driven WebGL configurator | Two pill toggles bound to React state → material swap + geometry swap on the R3F model. Keep it off the scroll timeline so the user can dwell. | M |
| Black-on-black product lighting | Kill ambient. One thin rim light along the silhouette + one emissive plane for the screen + one emissive strip for the keyboard. Contrast comes from the three lights, not from the base colour. | M |
| Emissive screen as attention anchor | Map a real UI screenshot to the panel as an emissive texture and keep every other surface under ~8% luminance. The eye lands where you want it with no arrow. | S |
| Hybrid video-in-hero, canvas-in-body | Pre-render the load-time hero animation to a muted looping `<video>`; reserve live WebGL for the moments the user can steer. Both on the same black ground so the swap is invisible. | M |
| Asymmetric spec bento | 2×2 grid, `rgb(29,29,31)` fills, ~20px radii, mixed card types (photo+copy / icon+copy / animated-border / gradient glyph). One card gets the conic-gradient rotating border; the rest stay flat. | S |
| One-blue rule | Allow exactly one saturated CSS colour, used only for CTA fill and links. Everything expressive comes from imagery. Enforceable as a lint rule. | S |

## Screenshots
`assets/studies/macbook-ui/` — `desktop-hero.jpg` (gradient headline + glowing keyboard), `desktop-01.jpg` (configurator toggles, black-on-black lighting), `desktop-02.jpg` (full-bleed game video), `desktop-03.jpg` (two pinned layers mid-scrub), `desktop-04.jpg` (single white clause in a grey paragraph), `desktop-05.jpg` / `desktop-06.jpg` (laptop opening + margin captions), `desktop-07.jpg` (bento + footer), `mobile-00.jpg`–`mobile-03.jpg` (vertical recomposition). `data.json` holds all measured values above.
