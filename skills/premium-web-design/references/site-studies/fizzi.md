# Fizzi — https://fizzi.vercel.app

**Captured:** 2026-08-14 · **What it is:** DTC prebiotic-soda brand site; one product line, five flavors, one CTA (`Shop Now`) · **Stack (measured):** `bundleLibs` = three, r3f, drei, gsap, ScrollTrigger, shader, webgl. Next.js App Router (`/_next/static/chunks/app/page-*.js`), Prismic CMS (`static.cdn.prismic.io/prismic.js?repo=fizzi`). One `<canvas>` serves the entire page.
**Page length:** 10.5 screens (scrollHeight 9450 / viewport 900) · **Sections:** 5 · **Canvas/video/img counts:** canvas 1, video 0, img 1, svg 6

## Art direction in one line
A single WebGL soda can floats through a page whose *background color* is the section divider — no cards, no borders, no shadows, just saturated flat color fields and 208px display type that the 3D product physically passes in front of and behind.

## First 3 seconds
`desktop-hero.jpg`: full-bleed yellow `rgb(254, 232, 50)`. Wordmark centred at top. Two 3D cans (Black Cherry, Lemon Lime) tilted ~20° in from left and right edges, cropped by the viewport. Between them, `LIVE GUTSY` at 208px / 900 weight / uppercase / line-height 166.4px (0.8 ratio — lines overlap-tight) in orange `rgb(249, 115, 22)`. Sub-line `Soda Perfected` at 60px/600 in navy `rgb(8, 47, 73)`, then a 16px spec line, then a solid orange pill button. Pale yellow spheres (bubbles) drift across the field at multiple depths — visible at different positions in `desktop-hero.jpg` vs `desktop-hover.jpg`, so they animate continuously, not on scroll. No hero image file: the cans are canvas.

## Palette (measured)
Backgrounds, from `topBackgrounds` — every one a full-bleed section ground, count 1 each:
- `rgb(254, 232, 50)` yellow — hero + closer band
- `rgb(203, 239, 154)` pale lime — "Try all five flavors", "Naturally Refreshing"
- `rgb(192, 240, 245)` ice blue — the pinned "INTO / THE / FUTURE" beat
- `rgb(113, 5, 35)` deep wine — carousel stage (also used as a text color, count 3)
- `rgb(254, 99, 52)` vermilion — "SODA THAT MAKES YOU SMILE" closer
- `rgb(234, 88, 12)` burnt orange — button fill
- `rgb(255, 255, 255)` white
- `rgba(255, 255, 255, 0.1)` — the only translucent surface on desktop (×2)

Text, from `topTextColors`: `rgb(8, 47, 73)` navy (52) is the body/heading workhorse; `rgb(254, 99, 52)` (24) and `rgb(249, 115, 22)` (13) carry the display type; `rgb(255, 255, 255)` (19) on the wine and vermilion grounds; `rgb(7, 89, 133)` (17) mid-blue.

The hero ground is not fixed: `desktop-hero.jpg` renders it yellow, `desktop-hover.jpg` renders the identical hero on pale lime. Both hexes are in `topBackgrounds`. The hero background tweens between flavor colors.

## Typography (measured)
One family, one file: `__alpino_5a83fb`, variable, `weight: 100 900`, status `loaded`. No serif, no mono, no second family anywhere on the page.

| Role | Size | Weight | Line-height | Case | Color |
|---|---|---|---|---|---|
| h1 `Live Gutsy` | 208px | 900 | 166.4px (0.80) | uppercase | `rgb(249, 115, 22)` |
| h2 `Try all five flavors` | 96px | 900 | 96px (1.00) | uppercase | `rgb(8, 47, 73)` |
| p (lede) `Soda Perfected` | 60px | 600 | 60px (1.00) | none | `rgb(8, 47, 73)` |
| body / button | 16px | 400 | 24px (1.50) | none | inherits |

Weight census: 400 (28 elements), 700 (5), 900 (5), 600 (1), 500 (1). letterSpacing is `normal` everywhere — no tracking tricks. The whole hierarchy is size + weight + case, 13:1 between display and body.

## Structure, screen by screen
1. **0–14% — Hero.** Two cans, 208px headline between them, CTA. `desktop-hero.jpg`
2. **14–29% — "TRY ALL FIVE FLAVORS".** Ground flips to pale lime. Copy block left-aligned in the left third; five cans clustered as a 3D bouquet in the right half, cropped by the right edge. Headline top-cropped in-frame, so the section is taller than one viewport. `desktop-02.jpg`
3. **29–50% — Pinned "INTO / THE / FUTURE".** Ice-blue ground. One can, back label facing camera, tumbling slowly while giant orange words cycle behind it one at a time. `desktop-01.jpg` catches `INTO`; `mobile-01.jpg` catches `TH…`. Deleted frame `desktop-03` (43%) was flat `#C6EFF5` with nothing in it — mid-cycle, both word and can off-frame. The beat has dead air by design.
4. **50–71% — Flavor carousel.** Wine ground with an organic blob shape behind the can. Prev/next chevrons in 1px white circles at ±355px from centre. `Black Cherry` 12 cans – $35.99. `desktop-04.jpg`
5. **71–86% — Alternating benefit rows.** Yellow then lime grounds, can pinned to the opposite side of the copy each time: `Gut-Friendly Goodness` (text left / can centre), `Light Calories, Big Flavor`, `Naturally Refreshing` (text left / can right). `desktop-05.jpg`, `desktop-06.jpg`
6. **86–100% — Closer.** Vermilion ground, `SODA THAT MAKES YOU SMILE` set so large it bleeds off all four edges, a rotating `Love your gut · Love your life` circular badge, wordmark on a yellow footer strip. `desktop-07.jpg`

Six discrete scroll beats. Only one of them (beat 3) is pinned.

## Motion inventory

| Moment | Trigger | What moves | Est. duration / easing | Library evidence |
|---|---|---|---|---|
| Hero bubbles | autoplay, continuous | ~12 pale spheres drift up at 3 depth layers; positions differ between `desktop-hero.jpg` and `desktop-hover.jpg` | perpetual loop, linear drift | `three` + `r3f` in bundleLibs; canvas=1 |
| Hero can float | autoplay, continuous | both cans bob and yaw a few degrees; tilt differs across the two hero frames | ~4–6s loop, sine ease-in-out | `r3f`, `drei` (Float) |
| Hero ground tween | unverified trigger (flavor state) | full-viewport background yellow → pale lime | ~600ms, ease | both hexes present in `topBackgrounds` |
| Five-can cluster reveal | scroll enter | cans fan from a stack into a staggered bouquet as the copy fades up | scrub, ~1 viewport | `gsap` + `ScrollTrigger` |
| Pinned word cycle | scroll scrub, pinned ~2 viewports | `INTO` → `THE` → `FUTURE` swap in behind the can while the can rotates ~180° to show its back label | scrub-linked, no fixed duration | `ScrollTrigger` pin; frames 01 + mobile-01 show two different words at two scroll positions |
| Carousel flavor change | click chevron | can swaps model + the wine ground and blob shape recolor together | ~500ms, ease-out | 5 flavor grounds in palette; buttons labelled `Previous Flavor` |
| Alternating-row can moves | scroll scrub | can translates left↔right and rescales between the three benefit rows | scrub across ~3 viewports | `desktop-05` vs `desktop-06` show the same can at opposite sides |
| Badge spin | autoplay | circular `Love your gut · Love your life` lockup rotates | ~8s linear loop | visible in `desktop-07.jpg` and `mobile-03.jpg` at different angles |

## The 3D system
- **One canvas for the whole document.** `counts.canvas === 1` at 1440×900 and at 390×844. Every can on every screen is the same persistent R3F scene; sections are HTML laid over it. That is why there is exactly 1 `<img>` on the entire page.
- **Camera stays put; objects move.** Across all six beats the horizon and perspective never shift — the cans change position, rotation and scale instead. Cheaper and far more stable than animating a camera path.
- **Lighting.** Soft key from upper-left, broad fill, no visible cast shadows and no floor plane — cans sit on flat color with only a contact-free ambient occlusion around the base. Specular highlight runs as a hard vertical band down the can body (`desktop-06.jpg`), which reads as anodized aluminium.
- **Materials.** Label art is a full-wrap albedo texture at high enough resolution to read `Nutrition Facts` body copy at 40% of viewport height (`desktop-01.jpg`, `mobile-01.jpg`). Metal lid and base use a separate low-roughness material; the wrap has slight vertical banding baked into the texture, not the shader.
- **Scroll → transform mapping.** Beat 3 is the only pin. Scroll progress there drives (a) can `rotation.y` through roughly a half-turn so the front label leaves and the back label arrives, and (b) an index into a 3-word array. Beats 2, 5 map scroll to `position.x` / `scale` with no pin — the can simply parallaxes at a different rate than the copy.
- **Readability over a moving stage.** Desktop never overlaps body copy with the can. It uses column separation: copy in one third, can in the other two thirds, with the can cropped by the viewport edge so it never drifts under the text. The 208px hero headline *is* allowed to overlap, because the cans are pushed to the outer 25% and the headline occupies the centre.
- **Mobile fallback: none — the 3D still runs.** canvas count is still 1 at 390px. `mobile-01.jpg` shows the same tumbling can at full quality.

## Why it reads expensive
1. **Type scale of 13:1.** 208px display against 16px body, in the same single family. No mid-sizes cluttering the ladder.
2. **Line-height 0.80 on the h1.** 208px type on 166.4px leading — the two words of `LIVE GUTSY` interlock as one shape. Nobody ships this by accident.
3. **Zero decoration.** No shadows, no borders, no gradients, no cards. `topBackgrounds` contains 8 entries and 7 are opaque flat fills. The only translucency on desktop is `rgba(255,255,255,0.1)`.
4. **Color changes carry the section rhythm.** Six full-viewport ground colors doing the job that dividers and cards do on a normal site.
5. **The product is never a flat photo.** 1 `<img>` on a 10.5-screen page. Every product view is live geometry, so it is lit consistently across every beat.
6. **Willingness to leave a frame empty.** The deleted 43% frame was a flat ice-blue field with nothing in it. The pinned beat has breathing room between words.
7. **Copy is cropped on purpose.** In `desktop-02.jpg` the h2 is top-cropped and in `desktop-07.jpg` the closer bleeds off all four edges — the type is treated as artwork, not as a box to fit.

## Mobile adaptation
Measured at 390×844: scrollHeight 8959, 10.6 screens, same 5 sections, same canvas count. The story is not truncated.
- **Type steps down ~3.5×, not proportionally.** h1 208 → 72px (line-height 57.6, keeping the same 0.80 ratio), h2 96 → 60px, lede 60 → 48px. Body stays 16px, so the display:body ratio compresses from 13:1 to 4.5:1.
- **The hero loses its cans.** `mobile-00.jpg` is wordmark + headline + CTA on empty yellow. The cans are positioned outside the 390px frustum. The mobile hero is a type poster; the 3D re-enters at beat 3.
- **New scrim only on mobile.** `mobileData.topBackgrounds` adds `rgba(255, 255, 255, 0.3)` ×3, absent from desktop. `mobile-02.jpg` shows it: where narrow columns force copy on top of the can, a soft-cornered 30%-white panel sits behind the text block. That is the readability fix — a translucent plate, applied only where the layout collapses.
- **Alternating rows become stacked overlays**, copy centred over the can rather than beside it.

## Steal list

| Component | How to rebuild | Cost |
|---|---|---|
| One persistent canvas, many sections | Mount a single `<Canvas>` fixed behind the document; each section registers a ScrollTrigger that tweens the shared object's `position`/`rotation`/`scale`. Never mount a canvas per section. | M |
| Ground-color as the section divider | 6 full-bleed opaque backgrounds, no dividers/cards/shadows. Tween `body` or a fixed backdrop `background-color` on section enter, ~600ms ease. | S |
| 0.80 line-height display lockup | `font-size: clamp(72px, 14vw, 208px); line-height: 0.8; font-weight: 900; text-transform: uppercase` on a variable font with a real 900 master. | S |
| Pinned word-cycle over a rotating object | `ScrollTrigger` with `pin: true, scrub: true` over ~2 viewports; map `progress` to both `object.rotation.y = progress * Math.PI` and `wordIndex = floor(progress * words.length)`. | M |
| Translucent copy plate for narrow viewports | Under your mobile breakpoint only, wrap text in a `rgba(255,255,255,0.3)` rounded panel. Desktop keeps zero scrim by separating columns instead. | S |
| Product-configurator carousel with ground recolor | Prev/next buttons swap the 3D model *and* tween the section background + blob shape colour in the same timeline, ~500ms ease-out. | M |
| Continuous bubble field at 3 depths | Instanced spheres, per-instance random y-velocity and z-depth, translucent unlit material, wrapped upward — runs off the render loop, never off scroll. | M |
| Rotating circular badge lockup | Text on an SVG `textPath` circle, `animation: spin 8s linear infinite`. Uses the brand line as ornament, no image needed. | S |

## Screenshots
`assets/studies/fizzi/` — `desktop-hero.jpg` (yellow hero), `desktop-hover.jpg` (same hero on lime — the ground tween), `desktop-01.jpg` (pinned `INTO` beat, can showing back label), `desktop-02.jpg` (five-can bouquet), `desktop-04.jpg` (wine carousel), `desktop-05.jpg` / `desktop-06.jpg` (alternating benefit rows), `desktop-07.jpg` (bleeding closer + badge), `mobile-00.jpg` (canless type hero), `mobile-01.jpg` (3D intact on mobile), `mobile-02.jpg` (the 30%-white copy plate), `mobile-03.jpg` (closer). `data.json` holds all measured values above.
