# Banzai Nudols — https://www.nudolsbanzai.it/

**Captured:** 2026-08-14 · **Award:** Awwwards Site of the Day + Developer Award · **Stack (measured):** **Gatsby** (`webpack-runtime-c80cc011…js`, `framework-fd71d758…js`, `app-a24384a4…js` — Gatsby's exact bundle naming) + GTM + iubenda cookie solution. Bundle sniff matched **`three`, `r3f`, `drei`, `shader`, `webgl`, `swiper`, `video`**. No `gsap`, no `lenis` in the sniff.
**Page length:** **1.1 screens** desktop (scrollHeight 986px @ 900px viewport); **1.0 screens** mobile (844px @ 844px). The root document does not scroll — all eight desktop capture steps reported `reachedY: 0`. · **Sections:** **0** `<section>` elements · **Canvas/video/img/svg:** 1 canvas at entry → **2 canvas** once a product opens · 0 `<video>` · **8 img** · 13 svg · 11 buttons
**Canvas size:** 2880 × 1800 (DPR 2 on a 1440 × 900 viewport) · **`body` background:** `rgba(0, 0, 0, 0)` — the purple is painted inside WebGL, not in CSS.

## Art direction in one line
A night-market ramen stall built as a single toon-rendered diorama floating on a black reflective plane under a violet void — soft-shadowed and *lit*, not flat-shaded — that you orbit with the mouse; clicking a hotspot swaps the whole screen for a coral-red product card where the packaging becomes the hero and a 3D teen character becomes the review.

## First 3 seconds
There is no page. There is a **loader and an audio gate**.

`mobile-00-loader.jpg`: full-bleed amber `#EFB122` — a *deeper* amber than the brand yellow used everywhere else — with `100%` centered in **Lilita One**, black, filling ~60% of the viewport width. A numeric counter, nothing else, no logo, no spinner.

Then the gate (`interact.probe.texts[0..1]`): two options, **`Start`** and **`Entra senza audio`** ("enter without audio"). The site does not merely warn you about sound the way a headphone notice does — it ships a first-class silent entrance as a peer button. `Start` is **Lilita One 400 / 21px / uppercase / `rgb(16, 24, 32)`** (measured in `data.type`). `probe.audio = 0` — there is no `<audio>` element; the bed runs through WebAudio.

`00-scene-entry.jpg`, post-gate: violet void (`rgb(41, 18, 86)` at the left edge grading to `rgb(66, 50, 112)` mid-frame), a wooden yatai stall dead center with a **glowing white `Banzai` sign** as the brightest object in frame, steam rising, a neon noodle-cup outline and red chopsticks on a pole, five customers on stools, a chef behind the counter, and the whole diorama mirrored into a wet-asphalt reflection below. A white pill reading `CLICK AND DRAG` with a mouse glyph sits at bottom-center. Six white map pins float over the geometry. Brand logo top-left (SVG, custom brushy wordmark — not Lilita One), a **76px white circular button whose icon is three noodle-wave lines**, top-right.

## Palette (measured)
| Role | Value | Where |
|---|---|---|
| Violet void | sampled from `00-scene-entry.jpg`: `rgb(41, 18, 86)` → `rgb(66, 50, 112)` | Scene sky. **Not in the CSS histogram** — painted in WebGL |
| Brand yellow | `rgb(245, 217, 63)` `#F5D93F` | Menu drawer field, cookie card, noodle divider, quote stickers, cross-sell card. 9 background nodes in the product state |
| Ink navy | `rgb(16, 24, 32)` `#101820` | All dark type. 3 backgrounds, 7–13 text nodes. Never pure `#000` for UI ink |
| Coral | `rgb(241, 90, 82)` `#F15A52` | Entire product overlay ground (2 nodes) — sampled `rgb(241, 90, 83)` across `06`–`09` |
| Coral wave tint | sampled `rgb(230, 85, 80)` in `07-product-prep.jpg` | The wave pattern behind the cup — a **4% darker tint of the same coral** |
| Watermark red | `rgb(225, 39, 30)` `#E1271E` | The giant Lilita One display type sitting *on* the coral. Ring text sampled `rgb(233, 38, 32)` |
| White | `rgb(255, 255, 255)` | 13–14 backgrounds, 37–43 text nodes |
| Loader amber | sampled `rgb(239, 177, 34)` `#EFB122` | Loader only, full bleed |
| Flavour arches | pink `rgb(215, 134, 190)`, orange `rgb(242, 148, 0)`, burnt orange `rgb(243, 128, 63)`, green `rgb(106, 190, 104)` | One per cross-sell SKU (`10-product-crosssell.jpg`) |
| Scrim | `rgba(0, 0, 0, 0.8)` | Behind the product card, over the live 3D scene |
| Hairline | `rgba(16, 24, 32, 0.05)` | Rules inside the yellow drawer |

Two observations worth copying. First, **there is no gray in the entire histogram** — the only neutral is `rgba(16, 24, 32, 0.05)`, which is navy at 5%. Second, the product overlay runs **red display type on coral ground** (`#E1271E` on `#F15A52`) — a deliberate ~1.2:1 contrast that reads as texture, never as copy, so the packaging shot in front of it is the only thing your eye can land on. Planetoño achieves the same effect by tinting *background objects*; Banzai achieves it by tinting *typography*.

## Typography (measured)
- **Display:** `Lilita One` 400 (Google, loaded). It runs across an enormous range in a single state: **10px, 16px, 21px, 25px, 28px, 38px, 51px, 176px, 200px, 432px**. Same face, same weight, ten sizes.
  - `432px` × 2 nodes, `rgb(225, 39, 30)` — the character name `ROSY`. The DOM texts array contains `"ro"` and `"sy"` as separate strings: **the name is split into two halves as markup**, for a two-part reveal.
  - `200px` × 8 nodes, `rgb(225, 39, 30)` — `MANZO`, repeated eight times. That is the marquee behind the packaging shot, one node per copy.
  - `51px` × 1 — the `Menu` drawer heading. `38px` × 4 white — the four cross-sell arch labels. `21px` — the `Start` button. `25px` — drawer `Contatti`. `10px` — micro-labels.
- **Text + UI:** `Cervo` 400 / 700 (custom-hosted condensed grotesk, `fontFaces` status `loaded`). Body `16px`. Measured in the product state: `18px white` × 20 (nutrition rows), `24px black` × 8 (prep steps), `14px white` × 8, `43px #101820` × 6, `700/18px white` × 4, and `8px` × 1 in the entry state.
- **Letter-spacing is `normal` and line-height is `normal` on every measured element.** No tracking, no leading overrides anywhere. Two families, one weight each doing the heavy lifting.
- `Times|400|16px` × 6 nodes is the **iubenda cookie iframe**, not the design. `swiper-icons` is declared but `unloaded` — the carousel arrows are custom, not the Swiper default glyphs.
- One recorded page error on the live site: `Uncaught TypeError: _iub.cs.configure is not a function`. Award-winning, still throwing.

## Structure, state by state
This site has one route and no scroll. Navigation is **orbit, hotspot, drawer, overlay**.

| Frame | State | Trigger | What is on screen |
|---|---|---|---|
| `00-scene-entry` | Diorama, front | after `Start` | Stall front-on, six white map pins over the geometry, `CLICK AND DRAG` pill bottom-center, cookie card bottom-right with a **3D fortune cookie breaking out of the card's top-left corner** and a paper slip reading `Accetta i cookie!`. Speaker toggle bottom-right. |
| `01-orbit-right` / `02-orbit-left` | Diorama, rotating | mouse drag on canvas | Same camera height, azimuth changes. Between `00` and `01` the chef's arms and a customer's pose have moved — **the characters are idle-animated independently of the camera**. Pins re-anchor to their 3D points and some drop out of view. |
| `03-orbit-rear` | Diorama, rear | continued drag | The back of the stall: two aircon units, extractor pipes, a microwave, wheelie bins, a street lamp with a visible volumetric cone. **The set is modelled all the way round** — no billboard cheats, no missing back wall. Only 2 pins survive here plus one plain white hotspot dot. |
| `04-menu-drawer` | Drawer open | noodle-wave button, top-right | A yellow `#F5D93F` panel slides in from the right at **405px / 28% of a 1440px viewport**. `Menu` in Lilita One 51px, a hairline rule, then five rows: a ~44px packaging render + the flavour name + a right-aligned `→`. `Contatti` pinned bottom-left of the panel in Lilita One 25px. The 3D scene keeps rendering, undimmed, in the remaining 72%. |
| `05-pin-state` | Diorama, hotspot | pin hover/focus | Near-identical to `00`; the chef and the lantern have shifted again. The capture harness logged `pin0 fail` / `pin3 fail` — the pins are **projected 3D anchors, not ordinary DOM links**. |
| `06-product-hero` | Product, screen 1 | click `Manzo` (drawer or pin) | A coral card, inset ~72px left and right with ~40px radius, over the live scene at `rgba(0,0,0,0.8)`. The cup render floats center at ~500px tall. **Eight ingredient cutouts orbit it at three different focus depths** — sharp beef cube and carrot in the foreground, heavily blurred leek and pea in the far plane. `MANZO` at 200px in `#E1271E` runs behind, clipped at both edges. `SCROLL` cue at the bottom. A white circular `✕` sits **dead center at the top** (720, 104) — not top-right. |
| `07-product-prep` | Product, screen 2 | scroll inside the card | Cup drops to the lower-left third. Ground gains a wave pattern in the 4% darker coral. Three prep steps run across the top in three columns of Cervo. A **wavy dashed rule** divides them from `VALORI NUTRIZIONALI` + a `+` accordion. Behind everything, `GNAM GNAM STYLE` is set **on a circular path** in `#E92620`. |
| `08-product-gnam` | Product, screen 3 | continued scroll | The circular `GNAM GNAM STYLE` ring is now full-bleed and rotated further than in `07` — **the ring spins with scroll**. Rosy's face rises into frame from the top at ~470px wide, eyes larger than the whole nutrition table was. The yellow quote sticker begins entering from the bottom-right. |
| `09-product-character` | Product, screen 4 | continued scroll | Rosy full-figure, ~600px tall, standing over her own name at 432px in `#E1271E`, with a small orange cat in a cardboard box at her feet. The quote — `BANZAI NOODLES GUSTO MANZO / È IL PASTO GUSTOSO / CHE MI SCALDA IL CUORE` — sits top-right as **three separately rotated yellow blocks (~−5°)**, black Cervo condensed caps, ragged as if hand-cut. |
| `08b-noodle-divider` | Product, transition | continued scroll | Coral → yellow, joined by an **illustrated tangle of noodles drawn as black line-art on the yellow**, ~250px tall, its silhouette forming the section edge. Not a diagonal, not a curve — a drawing. |
| `10-product-crosssell` | Product, screen 5 | continued scroll | Yellow card. `Scopri tutti i gusti` in Lilita One navy, centered. Below, a Swiper of the other four SKUs: each cup render sits on a **rounded-arch pedestal in its own flavour colour** (pink / orange / burnt orange / green) with the name in Lilita One 38px white inside the arch. The fourth item is cut by the viewport edge — the carousel advertises itself. |

## Motion inventory
| # | Moment | Trigger | What moves | Est. duration / easing | Library evidence |
|---|---|---|---|---|---|
| 1 | Loader | page load | Numeric counter to `100%` on amber, then gate | counter tied to asset progress; `unverified` duration | `mobile-00-loader.jpg`, `interact2.texts[0] = "100%"` |
| 2 | Orbit | click + drag on canvas | Camera azimuth around a fixed target; damped inertia implied by the `CLICK AND DRAG` affordance | drei `OrbitControls` default damping ≈ 0.05 | `bundleLibs: r3f, drei, three`; `00` → `01` → `02` → `03` |
| 3 | Idle character loops | none — always running | Chef's arms, customers' poses and the lantern shift between frames captured at the **same** camera angle | continuous, staggered per character | `00-scene-entry` vs `05-pin-state` (identical camera, different poses) |
| 4 | Steam | none | Volumetric plume from the stall chimney, different shape in `00`, `02`, `03` | looping shader / sprite sheet | `bundleLibs: shader`; three frames |
| 5 | Hotspot pins | camera movement | Six pins re-project as the camera orbits; several occlude behind geometry and disappear (5 visible front, 2 visible rear) | per-frame projection, no tween | `00` vs `03`; harness `pin0 fail` (not a plain DOM anchor) |
| 6 | Drawer | noodle-wave button | Yellow panel translates in from the right edge, 405px wide; scene stays live behind it | slide-in, `unverified` duration | `04-menu-drawer.jpg` |
| 7 | Product open | click a flavour | Scrim to `rgba(0,0,0,0.8)`, coral card scales/slides up over the still-rendering scene; a **second canvas mounts** for the product | `unverified` | `interact3.canvas = 2` vs `interact.probe.canvas = 1` |
| 8 | Marquee | scroll inside card | `MANZO` × 8 nodes at 200px translating horizontally, clipped both edges | linear, infinite | `interact3.fonts`: 8 nodes at `Lilita One 200px #E1271E`; `06` shows it clipped left and right |
| 9 | Ring text | scroll inside card | `GNAM GNAM STYLE` set on a circular path, rotation driven by scroll progress | scrubbed, linear | `07` vs `08` — same ring, different rotation |
| 10 | Character entrance | scroll inside card | Rosy rises from below the fold face-first, then resolves to full figure, while her name reveals as two nodes (`ro` + `sy`) at 432px | scrubbed | `08` → `09`; `interact2.texts` contains `"rosy"`, `"ro"`, `"sy"` |
| 11 | Quote sticker | scroll inside card | Three rotated yellow blocks enter bottom-right and settle top-right | scrubbed, staggered | `08` (entering) vs `09` (settled) |
| 12 | Cross-sell carousel | drag / arrows | Horizontal SKU slider, fourth item deliberately clipped | Swiper | `bundleLibs: swiper`; `fontFaces` includes `swiper-icons`; `10` |
| 13 | Hint copy | device class | Desktop reads `Click and drag`, mobile reads `Tap and drag` — **both strings ship** | n/a | `interact2.texts` contains both |

Notably absent: `gsap`, `ScrollTrigger` and `lenis` all failed the bundle sniff. The scroll scrubbing inside the product card is done in R3F's own frame loop against a scroll container, which is why the root `scrollHeight` never moves off 986px.

## Catalogue as a journey
Five SKUs. The site gives each one **a named 3D character, a colour, and five screens of its own**, and refuses to show them as a grid until the very end.

1. **The catalogue is the diorama.** Six map pins are dropped onto the stall geometry — on the menu board, on the lanterns, on the poster. They are the primary way in. There is no product grid on entry, no "Our Products" heading, no hero CTA. You find the menu by looking at the restaurant.
2. **The drawer is the fallback, and it is honest about it.** 405px of yellow, five rows, each row a real packaging render at ~44px next to the flavour name. It behaves like a takeaway menu clipped to the side of the screen, and it leaves the 3D scene running and visible in the other 72%.
3. **Each SKU gets a five-screen story, not a detail page.** Measured order: packaging hero with orbiting ingredients → preparation in three steps + nutrition accordion → `GNAM GNAM STYLE` ring + character face → character full-figure with quote → cross-sell. The same five beats for every flavour.
4. **Each SKU has a person.** `interact2.texts` captured five names — **Veronika, Yaki, Rosy, Spike, Paul**. Clicking `Manzo` produced Rosy. One character per flavour, and the character delivers the product claim as a first-person quote (`È IL PASTO GUSTOSO / CHE MI SCALDA IL CUORE`) rather than the brand asserting it.
5. **The grid arrives last, as an exit.** `Scopri tutti i gusti` with four arch-mounted cups is the *end* of a product story, positioned as "what next", not as the landing page.
6. **The nutrition table is not hidden and not styled down.** `VALORI NUTRIZIONALI` gets a `+` accordion, real rows (`di cui acidi grassi saturi 1.7 g / 5.9 g / 30%`), and Cervo 18px white on coral. The regulatory content sits inside the cinematic layout instead of being exiled to a footer PDF.

Transferable to a services list: put the entry points *inside* the illustration as projected hotspots and keep the side drawer as the accessible fallback; give every service the same five-beat story so the template is invisible; attach a named character or a named client to each one and let them make the claim; end each story with a colour-coded carousel of the others; and keep the boring compliance table styled like everything else.

## Why it reads expensive
1. **The set is modelled all the way round.** `03-orbit-rear` shows aircon units, extractor pipes, a microwave, bins and a cabled street lamp behind a stall nobody was required to build the back of. That single frame is the Developer Award.
2. **It is lit, not flat.** Unlike the toon-shaded flat-fill approach, Banzai uses real soft shadows, a volumetric cone under the street lamp, an emissive `Banzai` sign as the frame's brightest object, and a mirrored wet-asphalt floor. The violet void gives every warm light source somewhere to be warm against.
3. **The idle animation is decoupled from the camera.** `00` and `05` are the same shot with different poses. The stall keeps working whether or not you touch it, so the scene reads as a place rather than a model.
4. **Saturation is rationed by state, not sprinkled.** The 3D scene is almost entirely violet + warm-light; the yellow, coral and red only appear inside 2D surfaces (drawer, cookie card, product overlay). No state carries more than one saturated field at a time. The cross-sell screen is the single exception, and there the four flavour colours are the content.
5. **The cookie banner is art-directed.** A rendered 3D fortune cookie breaks the top-left corner of the yellow card and holds a paper slip reading `Accetta i cookie!`. Most award sites let the consent layer ruin the first frame; this one made it part of the world.
6. **Display type spans 10px to 432px in one typeface at one weight.** No second display face, no weight ladder, no tracking. The scale does all the work.
7. **Red display type on coral ground.** `#E1271E` on `#F15A52` is a ~1.2:1 ratio — legally invisible, and that is the point. It gives the packaging shot a textured field to sit on without a single competing edge.
8. **The `✕` is centered at the top, not tucked in a corner.** Same position (720, 104) in all five product frames. It reads as a deliberate exit from a room rather than a dismissed modal.
9. **Only 8 `<img>` and 0 `<video>` on the whole site.** Five of those images are the packaging PNGs. Everything else you see is WebGL or SVG.
10. **Zero `<section>` elements and no root scroll.** The whole experience runs at 1.1 screens. The site never asks you to scroll a page; it asks you to move a camera.

## Keeping copy legible over a live 3D scene
1. **Copy never sits on the canvas.** In every frame the type lives in a card, a pill, a drawer or a sticker with its own opaque ground. The only text touching the 3D is the `Banzai` logo top-left, which sits over the darkest region of the void.
2. **The scene's own brightness is centered and the UI is at the corners.** The emissive sign occupies the middle third; the logo, the noodle-wave button, the social row and the speaker toggle all sit in the four corners, where the void is `rgb(3, 2, 8)`.
3. **UI floats on white pills with full opacity.** `CLICK AND DRAG` and the two circular buttons are solid white — no frosted glass, no 60% black scrim.
4. **Opening a product does not pause the scene, it buries it** under `rgba(0, 0, 0, 0.8)` at 72px inset, so a sliver of the world stays visible at the frame edge and the return path is obvious.

## Mobile adaptation
390 × 844, **1.0 screens** — identical DOM (`html` 138726 bytes vs 138729 on desktop), identical counts: 1 canvas, 8 img, 13 svg, 11 buttons. **Nothing is removed and no fallback image is served.** The full R3F scene ships to phones.
- Loader is unchanged: full-bleed `#EFB122`, `100%` in Lilita One.
- **The camera pushes in.** `mobile-01-scene.jpg` is not the desktop framing letterboxed — the stall fills the full width, the counter customers are cropped at both edges, and the `Banzai` sign runs off the right side. The site reframes the shot for portrait instead of scaling it down.
- Logo and the noodle-wave button both grow relative to the viewport (~55 CSS px circle on a 390px width vs 76px on 1440px) and stay in the same two corners.
- Hotspot pins survive and remain tappable; six are still projected.
- The cookie card becomes a **bottom sheet** running the full width, with the fortune cookie now breaking out of its top-**left** at roughly 2× the desktop scale and the noodle-scallop divider running along its base.
- The hint string swaps to `Tap and drag` — both variants are in the DOM.
- Type does not shrink: the cookie body copy renders at the same measured 16px Cervo, so the sheet takes ~30% of the viewport.

## Steal list
| Component | How to rebuild | Cost |
|---|---|---|
| Numeric-only loader | Full-bleed brand colour, one counter in the display face at ~40% of viewport width, no logo and no spinner. Then a gate with **two** peer buttons — `Start` and a silent entrance — instead of a headphone warning. | **S** |
| Orbitable diorama as the whole site | One R3F scene, drei `OrbitControls` with damping, camera target locked to the model centre, polar angle clamped so you never see under the floor. Root document stays at 1.0 screens. | **L** |
| Model the back of the set | Budget geometry for the rear 40% of the object even though the default camera never shows it. Aircon units and bins cost nothing and are the entire "developer award" impression. | **M** |
| Projected hotspot pins | Anchor `<Html>`/projected divs to named mesh points; re-project each frame and occlude behind geometry with a depth test. Keep a DOM drawer as the accessible mirror of the same list. | **M** |
| Side drawer that does not dim | Panel at 28% viewport width in a saturated field colour, `Menu` in the display face, rows = product render + name + `→`, hairline at `rgba(ink, 0.05)`. Leave the canvas rendering at full brightness beside it. | **S** |
| Tinted display marquee behind the product | Repeat the product name 8× at ~200px in a colour ~1.2:1 against its own ground (`#E1271E` on `#F15A52`), clipped at both edges, translating horizontally. Instant texture, zero competing edges. | **S** |
| Split-name reveal | Ship the character name as two DOM nodes (`ro` + `sy`) at 432px and animate the halves apart around the figure. Two spans; reads bespoke. | **S** |
| Ingredient cutouts at three focus depths | Scatter 6–10 PNG cutouts around the hero product across three z-planes with real blur on the far ones. Turns a packshot into a scene without a second render. | **S** |
| Character-as-testimonial | One named 3D character per SKU, standing full-figure over their own name, delivering the product claim in first person on rotated hand-cut stickers (three separate blocks, ~−5° each). Replaces a star rating. | **L** |
| Illustrated section divider | Draw the transition edge — a tangle of noodles in black line-art on the incoming yellow, ~250px tall — instead of a diagonal, a curve or a gradient. One SVG per brand. | **S** |
| Circular-path ring type | Set a short brand phrase on a circle behind the content and scrub its rotation from scroll progress. Fills negative space without adding a word of new copy. | **M** |
| Arch-pedestal product tiles | Each cross-sell item = packshot on a rounded-arch block in that SKU's own colour, label in the display face reversed out inside the arch. Clip the last tile at the viewport edge so the carousel advertises itself. | **S** |
| Art-directed consent card | Render one brand object breaking out of the banner's corner (fortune cookie + paper slip here). The consent layer is in your first frame whether you designed it or not. | **S** |
| Compliance content, styled up | Put the nutrition/spec table inside the cinematic layout behind a `+` accordion, in the same type and colours as everything else. It signals a real product, not a concept. | **S** |

## Screenshots
`assets/studies/banzai-nudols/` — `00-scene-entry`, `01-orbit-right`, `02-orbit-left`, `03-orbit-rear` (rear of the set), `04-menu-drawer`, `05-pin-state`, `06-product-hero`, `07-product-prep`, `08-product-gnam`, `08b-noodle-divider`, `09-product-character`, `10-product-crosssell`, `mobile-00-loader`, `mobile-01-scene`. Data: `data.json`, `interact.json` (entry state), `interact2.json` / `interact3.json` (product state).
