# Active Theory — https://www.activetheory.net

**Captured:** 2026-08-14 · **Award:** repeat Awwwards Site of the Year winner (specific listing `unverified` — not re-fetched in this capture) · **Stack (measured):** hand-rolled, versioned by build timestamp: `assets/js/app.1780406240914.js` + `assets/js/modules.1780406240914.js`, plus GA4. No framework signature (`react`, `next`, `webflow` all false). Bundle sniff matched `three`, `webgl`, `shader`, `video`. One `@font-face` family: `nbarchitekt` at 400 (loaded), 700 (loaded), 300 (declared, **unloaded**).
**Page length:** virtual — `scrollHeight` 844/900 = `viewportHeight`, `scrollY` pinned at 0 across 19250 wheel-delta. · **Sections:** 0 `<section>` · **Canvas/video/img/svg:** **1 canvas** · **2 `<video>`** · **0 `<img>`** · **0 svg** · 4 buttons. Mobile: 1 canvas, 2 video, 2 buttons. **A whole portfolio site with zero images and zero SVG.**

## Art direction in one line
An abandoned deep-sea research station at night, lit only by what is on screen — every project is a glass slab hanging in black water, and the interface is one mono terminal column in the bottom-left corner that never moves.

## First 3 seconds
`desktop-hero.jpg`, taken at the default ~1.4s settle, is **pure black. Every pixel.** No logo, no bar, no counter, no percentage. Active Theory's answer to the loader is to not have one — the page is black until the WebGL scene is ready to paint, and the only thing that arrives before it is the DOM cookie button (`Accept Cookies`, Arial 13.33px, the one unstyled element on the site).

By `desktop-00` the scene has faded up: near-black `rgb(12, 13, 18)` with a **teal-green rim glow bleeding in from the top-left and top-right corners only**. Dead centre, the Active Theory `a` mark rendered as a refractive glass ring, iridescent pink-and-teal, hanging from a thin looping ribbon that crosses itself below and runs off the bottom of the frame. `SCROLL DOWN` sits above it in mono at very low opacity — barely legible on purpose. Top-right, the site's only nav: a **pill-shaped capsule** containing `WORK ——— CONTACT` with a thin rule between the two words and a green glow bleeding out of its bottom edge.

Nothing else. No headline for two full scroll states.

## Palette (measured)
DOM values from `data.json`; scene values sampled from frames at 160×100.

| Role | Value | Where |
|---|---|---|
| **Ground** | `rgb(0, 0, 0)` (DOM, 4 backgrounds) / sampled `rgb(12, 13, 18)` `#0C0D12` and `rgb(13, 16, 21)` `#0D1015` | Every frame. Not black — black with a ~6-point blue lift |
| Primary text | `rgb(244, 244, 244)` `#F4F4F4` | `WHAT ARE YOU LOOKING FOR?`, all body mono |
| Pure white | `rgb(255, 255, 255)` — 9 elements | `CREATIVE DIGITAL EXPERIENCES` display type |
| Muted text | `rgb(198, 198, 198)` `#C6C6C6` — 6 elements | Secondary labels |
| Dim text | `rgba(255, 255, 255, 0.7)` | `SCROLL DOWN`, `ASK ME ANYTHING...` |
| **Cyan** | `rgb(0, 255, 255)` `#00FFFF` — 1 text, 1 background | Single-use accent |
| **Lavender** | `rgba(156, 165, 255, 0.333)` (DOM) / sampled `rgb(156, 144, 206)` `#9C90CE` | The `-> WEBSITES / INSTALLATIONS / …` link column |
| Panel scrims | `rgba(0, 0, 0, 0.2)`, `rgba(0, 0, 0, 0.333)`, `rgba(0, 0, 0, 0.5)`, `rgba(0, 0, 0, 0.8)` | Four discrete black-alpha steps |
| Hairline | `rgba(255, 255, 255, 0.1)` — 2 backgrounds | Nav capsule border, `ASK ME ANYTHING...` pill border |

**The interface palette is one colour: white at four opacities** (1.0 / 0.7 / `#C6C6C6` / `#00FFFF` for the single accent), plus lavender for the one link column. Every other colour on screen — the pink-magenta of `desktop-01`, the acid greens of `desktop-04`, the gold and violet particle clouds of `desktop-06`, the sodium-orange of `desktop-10` — is **emitted by the 3D scene**, not declared in CSS. The chrome contributes nothing but white.

The four `rgba(0, 0, 0, …)` steps are the whole legibility system. That is how mono copy at 14px survives on top of a saturated particle storm: a scrim ladder, not a palette change.

## Typography (measured)
**One family, one size, essentially.** `nbarchitekt` — a squarish monospace with flat terminals and a distinctive slab-cornered `R`/`G`. 10 leaf nodes at weight 400, 3 at weight 700. The 300 weight is declared and never loads.

| Element | Family | Size | Weight | Line-height | Tracking | Case | Notes |
|---|---|---|---|---|---|---|---|
| Body / all UI | `nbarchitekt, monospace` | **14px** | 400 | **21px (1.50)** | normal | UPPER | `WHAT ARE YOU LOOKING FOR?`, all link rows, all captions |
| Display | `nbarchitekt` | ≈68px cap on a 900 frame (frame-measured) | 400 | ≈1.15 | wide by design of the face | UPPER | `CREATIVE / DIGITAL / EXPERIENCES` |
| Emphasis | `nbarchitekt` | 14px | **700** | 21px | normal | UPPER | 3 nodes only |
| Cookie button | **Arial** | 13.3333px | 400 | normal | normal | sentence | The single un-designed element; `rgb(0, 0, 0)` on white |
| `body` fallback | `Times` 16px | — | — | — | — | — | The page never uses it — body holds only a raw string |

- **The type scale is two steps: 14px and ≈68px.** Nothing in between. No h1/h2/h3 elements exist in the DOM at all — the probe found only a `<p>` and a `<button>`.
- **Line-height 1.50 on 14px mono** is unusually loose and it is doing real work: the link column `-> WEBSITES / -> INSTALLATIONS / -> XR / VR / AI / -> MULTIPLAYER / -> GAMES` reads as a terminal listing precisely because the leading is generous.
- **`->` is the bullet.** Every link in the column is prefixed with a literal ASCII arrow, not an icon, not a `•`.
- **The display line is set to overlap the 3D object, not clear it.** In `desktop-02` the glass pill passes straight through the `C` of `EXPERIENCES` and through `DIGITAL`. On `mobile-01` the ring sits on top of `DIGITAL` and swallows two whole words of the body copy. Legibility is traded for depth deliberately — the type is *behind* nothing and *in front of* nothing consistently, it interleaves.

## Structure, screen by screen
Percentages are wheel-progress; `scrollY` is 0 in all of them.

- **desktop-hero (pre-boot)** — Solid `#000000`. Nothing. No loader of any kind.
- **desktop-00 (0%)** — Logo state. Glass `a` mark centred on the ribbon loop, teal rim glow at both top corners, `SCROLL DOWN` at ~0.7 opacity above it, `WORK ——— CONTACT` capsule top-right. A small pink jellyfish drifts in the lower-left third.
- **desktop-01 (9%)** — Same mark, camera closer and rotated; a comet trail of light streaks enters from the upper right and a magenta ridge of terrain rises across the bottom. Still no headline. Two frames of pure atmosphere before a single sales word.
- **desktop-02 (18%)** — The one statement in the whole site. `CREATIVE / DIGITAL / EXPERIENCES` at ≈68px, left-aligned to a ~168px margin, three lines, uppercase, white. A tall iridescent glass pill descends from a burning red-hot horizon line and passes *through* the letterforms. Right column, at ~62% width: three mono paragraphs at 14px/21px — `FOUNDED IN 2012`, then a 2-line and a 3-line block. **The whole "about" section is 40 words.**
- **desktop-03 (27%)** — Work chapter opens. Rounded-corner glass slabs hang in space at aggressive perspective angles, each carrying a case-study video (`adidas / CHILE 20`). Particle clouds in violet and magenta pour down the centre behind them. Bottom-left, the **persistent terminal column** arrives and never leaves: `WHAT ARE YOU LOOKING FOR?` then five `->` links then an outlined `ASK ME ANYTHING...` pill.
- **desktop-04 (36%)** — Two slabs, green and teal (`SECRET SKY`), titles caught mid-scramble (`SSBEICRET SSIKY` — doubled and offset glyphs). A chain of chrome vertebrae runs down the centre with a pink-gold particle column around it.
- **desktop-05 (45%)** — `FRONTIER WITHIN` on a large centred slab, six more slabs at varying depths and angles around it. Terminal column unchanged.
- **desktop-06 (55%)** — Slabs in gold and lilac, titles heavily scrambled (`PPAAPPEER / PPLLAANNES`, `FRRACNOEDERR`). Both left and right slabs are cropped by the viewport edge.
- **desktop-07 (64%)** — `E.C.H.O.` on a large slab with a US Air Force mark above the title; a slab bottom-right reads `…SSION`. Chain and particles continue.
- **desktop-08 (73%)** — Chapter change: the slabs are gone. A dark rig — pillars, cables, a circular basin, a suspended platform shedding glowing flakes — occupies the whole frame. Almost no light. The terminal column has also gone.
- **desktop-09 (82%)** — Above a waterline, a bright shattered ring; below it, a hexagon-tiled wall carrying `// THE LAB ->` beside a circular emblem and a 3-line 14px caption: `OUR HOME FOR INNOVATION, / WHERE PROTOTYPES TURN INTO / PRODUCTION PROJECTS`. The frame is split by a hard horizontal waterline at 40% height.
- **desktop-10 (91%)** — Sodium-orange and moss-green particle field, a blown-out light source right of centre, the `a` mark small and dark against it, a red-capped mushroom bottom-left. The scene has gone from ocean to forest floor.
- **desktop-11 (100%)** — Return to the `a` mark on its ribbon, now surrounded by a slow-drifting cloud of olive and lilac spheres, with thin light trails falling from it. The journey ends where it began, in a different biome.

## Motion inventory
| # | Moment | Trigger | What moves | Est. duration / easing | Library evidence |
|---|---|---|---|---|---|
| 1 | Boot | load | nothing — the page holds pure black until the scene can paint, then fades up | ≥1.4s of black | `desktop-hero` is 100% black at the default settle |
| 2 | Whole experience | wheel | camera flies a continuous path through 12 states over 19250 wheel-delta; `scrollY` never moves | scrubbed, ~1600 delta per state | `scroll.json` |
| 3 | Title scramble | slab enters frame | project titles resolve from doubled/offset glyph noise (`SSBEICRET SSIKY`, `PPAAPPEER`) to clean strings | ~0.5s, per-character | `desktop-04`, `desktop-06` vs the resolved `E.C.H.O.` in `desktop-07` |
| 4 | Slab drift | scroll | glass panels translate and re-angle in 3D; the same slab appears at different depths and rotations across consecutive frames | scrubbed | `desktop-03` → `desktop-05` → `desktop-07` |
| 5 | Video-in-slab | continuous | each slab plays a case-study loop as a texture — the DOM has **2 `<video>` and 0 `<img>`**, so the slab content is video mapped to geometry | continuous | `data.json` counts vs 6+ distinct moving stills across frames |
| 6 | Particle column | continuous | violet/gold/magenta point clouds pour down the centre behind the slabs, changing density and hue per chapter | continuous | `desktop-03` vs `desktop-06` vs `desktop-10` |
| 7 | Nav capsule glow | continuous | the green bloom under `WORK ——— CONTACT` shifts hue and intensity between frames — teal in `desktop-00`, violet in `desktop-05`, cyan in `desktop-08` | slow continuous | six frames, same element, different glow |
| 8 | Biome transition | scroll threshold | ocean → rig → waterline → forest floor with no cut; `desktop-08` is the dark transition | scrubbed | `desktop-07` → `desktop-08` → `desktop-10` |
| 9 | Refraction / dispersion | continuous | the glass `a` mark and the hero pill show iridescent edge dispersion that crawls as the camera moves | continuous | `desktop-00`, `desktop-02`, `mobile-01`; `bundleLibs: shader` |
| 10 | Terminal column persistence | scroll | the bottom-left column is fixed for the entire work chapter, then removed for the lab chapter | — | present `desktop-03`–`desktop-07`, absent `desktop-08`–`desktop-11` |
| 11 | Loop close | scroll end | final state returns to the opening `a` mark composition in a different particle biome | — | `desktop-00` vs `desktop-11` |
| 12 | Hover | pointer | **`unverified`** — the hover capture timed out (`locator('a, button')` never resolved within 4000ms) because the page has 4 DOM buttons and no matching text anchors; no `desktop-hover.jpg` exists in the capture directory | — | `data.json.errors` |

## Why it reads expensive
1. **The loader is the absence of a loader.** Pure `#000000` for over 1.4 seconds, then the scene fades in. No spinner, no percentage, no logo reveal. The site refuses to show you a substitute for itself.
2. **Two type sizes exist: 14px and ≈68px.** No h1/h2/h3 elements in the DOM at all. Everything between those two steps is negative space and 3D.
3. **Zero images, zero SVG.** 1 canvas, 2 videos, and a monospace font. A studio portfolio where the entire visual output is generated at runtime is the flex.
4. **The ground is `#0C0D12`, not `#000`.** Sampled across four frames. A ~6-point blue lift over pure black keeps the near-black shadows in the scene readable instead of crushing to the same value as the page.
5. **Legibility is solved with a four-step black-alpha ladder**, not with palette changes: `rgba(0,0,0,0.2 / 0.333 / 0.5 / 0.8)`. Mono copy at 14px survives on top of a magenta particle storm because there is a scrim under it, sized to the copy block.
6. **The 3D object is allowed to pass through the headline.** In `desktop-02` the glass pill crosses `EXPERIENCES` and `DIGITAL`; on `mobile-01` the ring occludes two words of body copy outright. Interleaving type and geometry is the depth cue; clearing them apart would flatten it.
7. **The whole "about us" is 40 words in 14px mono**, set in a right-hand column at 62% width while the display line owns the left.
8. **The nav is one capsule with two words.** `WORK ——— CONTACT`, with an em-rule between them, glowing green from below. There is no menu, no burger, no logo in the nav.
9. **`->` is used as the list bullet.** ASCII, not an icon, at 14px/21px, five rows, in the site's one non-white colour (`rgba(156, 165, 255, 0.333)`).
10. **Titles arrive scrambled and doubled.** `SSBEICRET SSIKY` in `desktop-04` is two offset copies of `SECRET SKY` resolving toward each other — a chromatic-split text transition rather than a fade.
11. **Two full screens of atmosphere before a single word of pitch.** `desktop-00` and `desktop-01` sell nothing.
12. **The scroll is a closed loop through four biomes** — ocean, rig, waterline, forest — with no cuts and no footer.

## Mobile adaptation
390×844. DOM: **1 canvas, 2 video, 0 img, 0 svg, 2 buttons** — the desktop scene ships intact; only the button count drops from 4 to 2.

- **The nav capsule survives whole** and grows: `WORK ——— CONTACT` sits at the top-right on every mobile frame at roughly 2× its desktop pixel size, still with the green under-bloom (`mobile-00`–`mobile-03`).
- **The display type stays at three lines and gets *tighter* to the edges** (`mobile-01`): `CREATIVE / DIGITAL / EXPERIENCES` now runs nearly the full 390px width with a ~24px margin. It is not reduced to fit — the margin is reduced instead.
- **The two-column about becomes one column, in place** (`mobile-01`): the three mono paragraphs move directly under the display lines at the same 14px, and the glass ring is repositioned to sit *on top of both*, swallowing `IN 2012`, `STORY`, `TECHNOLOGY` and `PASSIONATE`. The overlap is worse than desktop and shipped anyway.
- **The terminal column moves from bottom-left corner to bottom-left third** (`mobile-02`, `mobile-03`) with the same `WHAT ARE YOU LOOKING FOR?` header, the same five `->` rows, and the same outlined `ASK ME ANYTHING...` pill. Nothing is cut from it.
- **Slabs reframe rather than restack.** `mobile-02` shows a Harry Potter slab cropped hard by the left viewport edge with its title losing two characters (`COME TO / GWARTS`), and a second slab entering from the right. `mobile-03` centres a single `DISCOVER YOUR PATRONUS` slab at ~80% width. The 3D layout is re-composed for portrait, not converted to a stack of cards.
- **The particle density looks unreduced** — `mobile-02` and `mobile-03` are the two heaviest frames in the entire capture by file size (194KB and 217KB vs a desktop max of 151KB).
- **What is deleted:** two of the four buttons, and nothing else observable.

## Steal list (buildable rows)
| # | Craft component | How to rebuild it (stack + approach) | Cost |
|---|---|---|---|
| 1 | Black-alpha scrim ladder | Define exactly four overlay steps — `rgba(0,0,0,.2/.333/.5/.8)` — and pick one per copy block based on the busyness of what is behind it. Size the scrim to the text block, never to the section. This is the whole legibility system. | **S** |
| 2 | Two-step type scale | Ship one body size (14px/21px mono, uppercase) and one display size (~68px). Delete every intermediate level and let negative space carry the gap. | **S** |
| 3 | Persistent terminal column | A fixed bottom-left block: one 14px uppercase question, five `->`-prefixed links at 1.5 line-height in a single tinted colour, one outlined pill. Mount it for one chapter of the scroll and unmount it for the next. | **S** |
| 4 | Two-word capsule nav | A single pill with `WORK ——— CONTACT`, a `rgba(255,255,255,0.1)` hairline border, and a coloured bloom bleeding from its lower edge that hue-shifts with the scene. No logo, no burger, no menu. | **S** |
| 5 | No-loader boot | Hold a solid ground colour with zero UI until the first scene frame is ready, then cross-fade. Requires the first paint to be genuinely fast; the payoff is that users never see a substitute for your product. | **M** |
| 6 | Chromatic-split scramble | Resolve titles from two horizontally offset copies of the string converging, with per-character noise — not a fade and not a single-layer scramble. Monospace keeps the box stable. | **M** |
| 7 | Geometry through type | Place the 3D object on the same z-band as the headline so it crosses letterforms. Pick a display face with open counters and heavy strokes so partial occlusion stays readable. | **M** |
| 8 | Video-textured slabs | Rounded-corner planes in three.js with `VideoTexture` from a small pool of `<video>` elements, arranged at varying depths and Y-rotations, cropped by the viewport on both sides. Zero `<img>` in the DOM. | **L** |
| 9 | Biome chapters | Change the entire scene environment — lighting, particle hue, geometry — three or four times across one scroll with no cuts, using a near-black low-light frame as the transition between them. | **L** |
| 10 | Near-black ground | Use `#0C0D12` rather than `#000` so scene shadows stay distinguishable from the page. A ~6-point blue lift is enough. | **S** |
| 11 | ASCII affordances | `->` for list bullets, `//` for section prefixes (`// THE LAB ->`), `...` for pending actions (`ASK ME ANYTHING...`). Costs nothing, reads as a terminal. | **S** |
| 12 | 40-word about | Cap the entire company statement at three mono paragraphs in a side column: founding year, what you are, what you deliver. Let the display line and the scene carry the rest. | **S** |
| 13 | Atmosphere before pitch | Give the first two scroll states no headline and no CTA at all — logo, motion and light only. | **M** |
| 14 | Portrait recompose, not restack | On mobile, re-aim the camera and re-place the 3D objects for a 9:19 frame rather than converting them to stacked DOM cards. Reduce page margins before reducing display type. | **M** |

## Screenshots
| File | Caption |
|---|---|
| `desktop-hero.jpg` | Pure `#000000` at 1.4s — the site has no loader at all |
| `desktop-00.jpg` | Glass `a` mark on its ribbon, teal corner glow, `SCROLL DOWN` at 0.7 opacity |
| `desktop-01.jpg` | Second atmosphere state — comet streaks, magenta ridge, still no headline |
| `desktop-02.jpg` | The only statement: `CREATIVE / DIGITAL / EXPERIENCES` with the glass pill passing through it |
| `desktop-03.jpg` | Work chapter opens; terminal column arrives bottom-left; `adidas / CHILE 20` slab |
| `desktop-04.jpg` | `SECRET SKY` titles caught mid chromatic-split scramble |
| `desktop-05.jpg` | `FRONTIER WITHIN` centred among six slabs at varying depths |
| `desktop-06.jpg` | Gold/lilac slabs, both cropped by the viewport edges, titles scrambled |
| `desktop-07.jpg` | `E.C.H.O.` with a client mark above the title |
| `desktop-08.jpg` | Dark rig transition — slabs and terminal column both removed |
| `desktop-09.jpg` | Hard waterline split; `// THE LAB ->` on a hex-tiled wall with a 3-line caption |
| `desktop-10.jpg` | Forest-floor biome — sodium and moss particles, mark small and dark |
| `desktop-11.jpg` | Loop closes on the `a` mark inside a drifting sphere cloud |
| `mobile-00.jpg` | Nav capsule at ~2× scale; mark and ribbon reframed for portrait |
| `mobile-01.jpg` | Display type to a ~24px margin; ring occludes four words of body copy |
| `mobile-02.jpg` | Slab cropped hard by the left edge; terminal column intact |
| `mobile-03.jpg` | Single centred slab at ~80% width; heaviest particle frame in the capture |
