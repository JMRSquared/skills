# Lusion — https://www.lusion.co

**Captured:** 2026-08-14 · **Award:** one of the most-awarded WebGL studios on Awwwards (repeat SOTD/SOTM; specific award listing `unverified` — not re-fetched in this capture) · **Stack (measured):** **Astro** (`https://lusion.co/_astro/hoisted.CUO_IjfL.js`) + GA4. Bundle sniff matched `three`, `webgl`, `shader`, `video`, `SplitText`. Six loaded `@font-face` entries: `Aeonik` 400/500/400-italic, `IBMPlexMono` 400/500, `LusionMono` 400.
**Page length:** virtual — `scrollHeight` 900 = `viewportHeight` 900, `scrollY` pinned at 0 across all 19250 wheel-delta of the capture. The DOM is real and fully measurable, but the scroll is hijacked. · **Sections:** 0 `<section>` (semantic sectioning not used) · **Canvas/video/img/svg:** **3 canvas** · 0 `<video>` · **0 `<img>`** · 41 svg · 12 buttons. Zero `<img>` elements with a page full of photography and case-study stills means **every image on this site is a WebGL texture**.

## Art direction in one line
A near-white lavender gallery wall with one dark rounded window cut into it — everything expensive happens inside the window, and the page around it stays as plain as a printed portfolio.

## First 3 seconds
`desktop-00.jpg` and `desktop-02.jpg` are both loader frames and they show the whole intro.

Pure black, full bleed. Dead centre, a single **210×36px horizontal bar**, unfilled portion `#333`, filled portion pure white, filling left to right. Bottom-left, hard against the corner with **no margin at all** — the digits are clipped by the viewport edge on the left and bottom — a counter at roughly **90px** in Aeonik 400: `006` at 6%, `075` at 75%. In `desktop-02` the counter glyphs are caught mid-transition with two digits overlapping vertically (`07` over a rising `5`), which is an **odometer roll**, not a text swap.

Two frames later (`desktop-hero.jpg`) the ground has flipped from black to `rgb(240, 241, 250)`, the LUSION wordmark sits top-left, three pill controls sit top-right, and the hero statement is **mid-flight**: `We create 3D visual storytelling` is fully arrived while `and inter…` below it is still rising and half-clipped by its own mask. That is a **SplitText line-mask reveal** caught in the act — the line above lands before the line below starts, and each line is clipped by an `overflow: hidden` wrapper.

Under it, the piece: a dark rounded-corner panel (radius ≈16px, insets ≈72px left/right) holding a tumbling pile of jack-shaped 3D primitives in white, mid-grey, blue and black. Bottom strip: five `+` tick marks across the width and `SCROLL TO EXPLORE` centred, with `SCROLL TO` in near-black and `EXPLORE` a step lighter.

## Palette (measured)
From `data.json` `topBackgrounds` / `topTextColors`, cross-checked against sampled pixels.

| Role | Value | Where |
|---|---|---|
| **Page ground** | `rgb(240, 241, 250)` `#F0F1FA` (sampled `#F1F1FB`) | Every non-loader frame. A lavender-tinted white, not `#FFF` |
| Ink | `rgb(0, 0, 0)` — **1222 elements** | All headlines, all body, all labels |
| White | `rgb(255, 255, 255)` — 85 elements, 14 backgrounds | Pill fills, `OUR APPROACH` / `SEE ALL PROJECTS` buttons, play button |
| Black field | `rgb(0, 0, 0)` — 13 backgrounds | Loader, hero canvas panel, `desktop-11` immersive chapter |
| **Accent blue (fill)** | `rgb(0, 22, 236)` `#0016EC` — 4 backgrounds | `LET'S TALK` pill **on hover only** (sampled `desktop-hover` at `rgb(1, 16, 231)`) |
| Accent blue (text) | `rgb(26, 47, 251)` `#1A2FFB` — 6 elements, 1 background | Painted brushstroke behind `Bold Ideas`, link states |
| Dark pill / card | `rgb(43, 46, 58)` `#2B2E3A` | `LET'S TALK` pill at rest |
| Near-black surface | `rgb(18, 20, 22)` `#121416` | Hero canvas panel ground |
| Light chip | `rgb(228, 230, 239)` `#E4E6EF` | Menu pill, minimise pill |
| Body-on-dark | `rgb(240, 241, 250)` | `body` computed color — the same lavender doubles as text on dark |

**Four values carry the entire site**: lavender-white ground, black ink, white fills, one blue. Everything else in the frames — Coca-Cola red (`desktop-05`), cyan (`desktop-10`), the purples and greens of the project grid — is **client artwork inside the windows**, never chrome. The page palette never borrows from the work it displays. That separation is the trick: a portfolio full of maximalist client colour reads as calm because the frame around it holds four values.

`desktop-10` shows the one exception and it proves the rule: a fat cyan brushstroke spans the section behind `Where Creative Ideas Become Immersive Experiences`. Its sibling in `desktop-04` is blue. Same stroke, recoloured per section — the accent rotates, the ground never does.

## Typography (measured)
One family. `Aeonik` at 400 and 500, plus a 400 italic that never rendered. `IBMPlexMono` and `LusionMono` are loaded but appear on **1** measured leaf node — a fallback stack. **145 leaf nodes are Aeonik 400; 9 are Aeonik 500.**

| Element | Family | Size | Weight | Line-height | Tracking | Case | Notes |
|---|---|---|---|---|---|---|---|
| `h1` (hero statement) | Aeonik | **36px** | 400 | 39.6px (**1.10**) | normal | sentence | The hero line is *small*. Three lines, ~48ch |
| Section display (`Bold Ideas,` / `Featured Work`) | Aeonik | ≈112px cap on 900 frame (frame-measured; not the DOM `h2`) | 400 | ≈1.05 | normal | sentence | The real display level |
| `h2` | Aeonik | 21.6px | 400 | 30.24px (1.40) | normal | sentence | Intro paragraph beside the display line |
| `h3` | Aeonik | 38px | 400 | 43.7px (1.15) | normal | sentence | `Subscribe to our newsletter` |
| `p` / `button` | Aeonik | 14px | **500** | 16.1px (1.15) | normal | **UPPER** | Every label, every tag, every button |
| Project titles | Aeonik | ≈44px (frame) | 400 | — | normal | sentence | `Oryzo AI`, `Porsche: Dream Machine` |
| Project tags | Aeonik | 14px | 500 | — | normal | UPPER | `WEB • DESIGN • DEVELOPMENT • 3D`, `•` separated |

Two observations worth stealing:
- **Everything is weight 400 except the 14px UI, which is 500.** The scale runs ≈112 / 44 / 38 / 36 / 21.6 / 14 — roughly a 1.25–1.3 ratio in the middle, with a huge jump to display. There is no bold headline anywhere on the site.
- **Line-height inverts with size.** 1.05–1.10 on display and h1; 1.40 on the 21.6px body paragraph. Tight where it's big, loose where it's read.
- **Letter-spacing is `normal` on every measured element.** No tracking on the 14px uppercase labels either, which is the usual reflex.
- The hero statement at **36px** is the strongest anti-pattern lesson here: the most-awarded WebGL studio does not set its hero at 8vw. The 112px display type arrives *after* the fold, on a plain lavender ground, with no canvas behind it.

## Structure, screen by screen
Percentages are wheel-progress. `desktop-01` is absent from the capture directory (a third loader frame, culled before this study).

- **desktop-00 (0%)** — Loader at 6%. Black, centred 210×36 bar, `006` at ~90px clipped by the bottom-left corner.
- **desktop-02 (18%)** — Loader at 75%. Bar nearly full; counter caught mid-odometer-roll.
- **desktop-hero (post-load)** — Hero mid-reveal. Wordmark top-left; `— | LET'S TALK • | MENU ••` pill cluster top-right; h1 rising line by line; dark rounded canvas panel with the jack pile; `+ + + + +` tick row and `SCROLL TO EXPLORE` at the base.
- **desktop-03 (27%)** — Hero settled, all copy gone except the wordmark. The canvas panel is now the entire composition, jacks re-tumbled to a new arrangement. **The hero's resting state has no words at all.**
- **desktop-04 (36%)** — The canvas panel scrolls up and off. Below it, `Bold Ideas,` / `Brought to Life` at ≈112px, left-aligned to a ~70px margin, in two lines that break mid-phrase, with a **blue painted brushstroke** entering from off-canvas left and passing *behind* the letterforms. Below-left: a purple-blue video tile. Below-right: the 21.6px paragraph at ~48ch and a white `● OUR APPROACH` pill. Asymmetric two-column, image left, text right, no vertical alignment between them.
- **desktop-05 (45%)** — Full-bleed red panel (client artwork) with three phone frames showing an AR bottle experience. `PLAY REEL` set ≈80px in white **behind** the centred white play circle, so the middle of the word is occluded by the button. Five `+` ticks above and below the panel.
- **desktop-06 (55%)** — A case-study video plays out at the top, then `Featured Work` at ≈112px left, with a 3-line 14px uppercase caption right-aligned in the far-right column at ~44ch. Two-up project grid begins.
- **desktop-07 (64%)** — Grid rhythm established: 2 columns, ~26px gutter, each cell = 16:9 rounded image, then a 14px uppercase tag row, then a ≈44px project title. `Oryzo AI`, `Of The Oak`, `Devin AI`, `Porsche: Dream Machine`.
- **desktop-08 (73%)** — `Synthetic Human`, `Meta: Spatial Fusion`, `Spaace – NFT Marketplace`, `DDD 2024`. Same rhythm, no variation in cell size.
- **desktop-09 (82%)** — Grid closes with `Choo Choo World` / `Soda Experience`, then a generous empty band, then one centred white `● SEE ALL PROJECTS` pill, then the next display line begins rising into frame from below.
- **desktop-10 (91%)** — `Where Creative Ideas Become Immersive Experiences` in three ≈112px lines, left-aligned, with a **cyan brushstroke** looping behind and around the last two lines. Below-left: a tablet mockup with an astronaut render bleeding off the bottom edge. Below-right: two paragraphs at ≈20px, ~44ch, top-aligned to the tablet's upper third.
- **desktop-11 (100%)** — Chapter flip to black. Full-viewport dark scene, an astronaut model centred, and `STEP INTO A NEW WORLD AND LET YOUR IMAGINATION RUN WILD` in three centred uppercase lines at ≈54px. In this frame the type is rendered at **very low opacity behind the model** — the copy and the model share the same space and the model wins.
- **desktop-hover** — Same frame, cursor on the pill cluster. Two things change: the type has **animated to full white opacity** and now reads cleanly over the black; and `LET'S TALK` has flipped from `#2B2E3A` to `rgb(0, 22, 236)` with a `→` glyph sliding in from the left of the label.

## Motion inventory
| # | Moment | Trigger | What moves | Est. duration / easing | Library evidence |
|---|---|---|---|---|---|
| 1 | Loader bar | load | 210×36 bar fills white left-to-right | tied to asset progress | `desktop-00` (6%) vs `desktop-02` (75%) |
| 2 | Loader counter | load | ≈90px digits roll vertically like an odometer, clipped by the bottom-left corner | ~0.3s per digit | `desktop-02` shows `07` over a rising `5` |
| 3 | Hero statement reveal | load complete | Aeonik 36px lines rise into `overflow: hidden` masks, staggered top to bottom | ~0.6s/line, ~0.1s stagger | `desktop-hero` — line 1 landed, line 2 mid-rise and clipped; `bundleLibs: SplitText` |
| 4 | Hero canvas | continuous + pointer | jack primitives tumble under physics; the arrangement differs in every frame that shows them | continuous loop | `desktop-hero` vs `desktop-03` vs `mobile-00`; `bundleLibs: three, webgl` |
| 5 | Whole page | wheel | smooth virtual scroll, `scrollY` never leaves 0 across 19250 delta | scrubbed | `scroll.json` |
| 6 | Header pinning | scroll | wordmark and pill cluster stay fixed while content passes **behind and through** them — `LUSION` is half-occluded by dark panels in `desktop-06`/`08`/`09` with no backdrop plate | — | `desktop-06`, `desktop-08`, `desktop-09` |
| 7 | Brushstroke | scroll | a painted stroke sweeps in from off-canvas and settles behind display type; blue in `desktop-04`, cyan in `desktop-10` | scrubbed, ~1 screen | two frames, two colours |
| 8 | CTA hover | pointer | `LET'S TALK` fill `#2B2E3A` → `rgb(0, 22, 236)`; a `→` slides in from the left and pushes the label right | ~0.2–0.3s | `desktop-hero` vs `desktop-hover` |
| 9 | Copy-over-3D legibility | pointer / idle | headline opacity lifts from near-invisible to full white on the same frame | ~0.3s | `desktop-11` vs `desktop-hover` — identical camera, different text opacity |
| 10 | Marquee (mobile) | continuous | `PLAY REEL ▶▶▶ PLAY REEL ▶▶▶` runs horizontally above and below the reel panel | continuous | `mobile-02` — the strip is absent on desktop, where the words sit static behind the play button |
| 11 | Video-in-texture | scroll | case-study stills are animated WebGL textures, not `<video>` or `<img>` — the DOM has **0 img, 0 video, 3 canvas** | — | `data.json` counts vs the photographic content in `desktop-06`–`desktop-09` |
| 12 | Project row arrow (mobile) | — | a `→` glyph is added to the left of every project title on mobile and is absent on desktop | — | `mobile-03` vs `desktop-07` |

## Why it reads expensive
1. **The hero headline is 36px.** Measured, not estimated. The studio with the deepest WebGL bench on Awwwards sets its opening statement at 36/39.6 and puts the spectacle in a panel below it.
2. **The ground is `rgb(240, 241, 250)`, not white.** A lavender-shifted off-white. It reads as gallery lighting rather than a blank page, and it lets pure white pill buttons sit on it as a distinct surface.
3. **Four brand values total.** Lavender-white, black, white, one blue. Every other colour in twelve frames belongs to a client and is confined inside a rounded window.
4. **Zero `<img>` elements.** 3 canvases, 41 SVGs, no images and no videos in the DOM. All photography is uploaded as GPU texture, which is why the grid can crossfade and warp without layout thrash.
5. **The hero's resting state is wordless.** `desktop-03` is the canvas panel and the wordmark. The copy that appeared during load has been scrolled away rather than pinned.
6. **The fixed header has no backdrop plate.** `LUSION` sits at the same coordinates through the whole scroll and is happily half-swallowed by dark panels passing behind it (`desktop-06`, `desktop-08`). No blur, no scrim, no shrink-on-scroll.
7. **Display type is weight 400.** ≈112px Aeonik Regular. The site has no bold headline anywhere; only the 14px uppercase UI is 500.
8. **Line-height inverts with size** — 1.05–1.10 on display, 1.40 on the 21.6px reading paragraph. Most templates ship one ratio everywhere.
9. **`PLAY REEL` is deliberately occluded.** The word runs behind the play button so its centre is covered (`desktop-05`). Legibility is sacrificed on purpose because the shape is already legible.
10. **The `+` tick row.** Five bare `+` glyphs above and below each full-width panel, at the same x-positions every time. It costs one line of CSS and turns a rounded rectangle into a registered plate on a grid.
11. **One brushstroke, recoloured.** The same hand-painted asset appears in blue and cyan behind two different display headlines and passes *behind* the letterforms, so it never fights legibility.
12. **Copy over 3D is solved by animating opacity, not by adding a scrim.** `desktop-11` vs `desktop-hover` shows the same frame with the headline at two opacities. No gradient overlay, no dark box.

## Mobile adaptation
390×844. The DOM is byte-for-byte comparable: **canvas 3, video 0, img 0, svg 41, buttons 12** — identical to desktop. The full WebGL build ships to phones.

- **Type shrinks, hard.** `h1` 36 → **23.4px** (0.65×); `h2` 21.6 → 16px. `h3` holds at **38px** and `p`/`button` hold at **14px/500/uppercase**. So the newsletter heading is now larger than the hero statement, and the UI label size never changes across breakpoints.
- **The hero canvas becomes a portrait window** (`mobile-00`): same rounded panel, same jacks, reframed 3:5 with the wordmark alone above it. Nothing is replaced with a poster image.
- **Display type stays huge and rewraps to four lines** (`mobile-01`): `Bold / Ideas, / Brought to / Life` at ≈78px, ~5 characters per line, with the blue brushstroke still entering from off-canvas left. The site would rather break a phrase across four lines than reduce the display size.
- **Two-column becomes one, in reading order** — display line, then paragraph, then `● OUR APPROACH` pill, all left-aligned to a ~28px margin (`mobile-01`).
- **The reel gains a marquee** (`mobile-02`): `PLAY REEL ▶▶▶` strips run above and below the red panel, which do not exist on desktop. Motion is *added* on mobile to replace the hover affordance.
- **The pill cluster collapses to one `••` circle** (`mobile-01`–`mobile-03`). `LET'S TALK` and `MENU` are deleted from the header; the hover-blue CTA has no mobile equivalent in these frames.
- **The 2-up project grid becomes 1-up, and every title gains a `→`** (`mobile-03`). `→ Oryzo AI`, `→ Of The Oak` — the arrow that appears on desktop only via hover is made permanent on touch.
- The header wordmark still refuses a backdrop and is still occluded by passing panels (`mobile-02`, `mobile-03`).

## Steal list (buildable rows)
| # | Craft component | How to rebuild it (stack + approach) | Cost |
|---|---|---|---|
| 1 | Lavender-white ground | Replace `#FFF` with `rgb(240, 241, 250)` as `--ground` and keep pure white for raised surfaces only (pills, buttons, cards). Instant depth with no shadows. | **S** |
| 2 | Corner-clipped loader counter | Digits at ~90px in the display face, absolutely positioned at `left: 0; bottom: 0` with **no padding**, inside `overflow: hidden`; roll them vertically per digit with `transform: translateY()`. Pair with a bare 210×36 fill bar centred. | **S** |
| 3 | SplitText line-mask reveal | Wrap each headline line in `overflow: hidden`, translate the inner span from `100%` to `0` on a ~0.1s per-line stagger, ~0.6s each. Land line 1 before line 2 starts. | **S** |
| 4 | Small hero, big second act | Set the hero statement at 36px/1.10 and put the ≈110px display type in the *second* section on a plain ground. Resist putting large type over the canvas. | **S** |
| 5 | The rounded window | One `border-radius: 16px` dark panel with ~72px side insets holds the entire 3D scene. Page chrome stays outside it and stays plain. All client colour is confined inside. | **S** |
| 6 | `+` registration ticks | Five `+` glyphs at fixed x-positions above and below every full-width panel, same coordinates on every panel. Absolute positioning, one class. | **S** |
| 7 | Brushstroke behind display type | One PNG/SVG painted stroke, `z-index` below the headline, entering from outside the viewport, recoloured per section via `filter: hue-rotate()` or duplicate assets. Never let it cross a letterform in front. | **S** |
| 8 | Header with no scrim | Fix the wordmark and pill cluster; let content pass behind them with no blur, plate or shrink. Choose a wordmark shape that survives being half-occluded. | **S** |
| 9 | Hover: fill + arrow insert | On hover, animate the pill background to the accent and slide a `→` in from the left, pushing the label right. ~0.25s. On touch, make the arrow permanent instead. | **S** |
| 10 | Type-over-3D by opacity | Render the headline in the same space as the model and animate its opacity from near-zero to full on entry/hover rather than adding a gradient scrim. Requires a dark, low-contrast scene behind it. | **M** |
| 11 | Occluded wordmark as art | Set a word (`PLAY REEL`) at ≈80px behind a centred control so the control covers its middle. Only works when the word is short and the shape is guessable. | **S** |
| 12 | Zero-`<img>` media layer | Upload every case-study still and loop as a WebGL texture on a shared canvas; drive crossfades and warps in a shader. Ship `<img>` fallbacks behind a `noscript`/reduced-motion branch. | **L** |
| 13 | Uniform 2-up project grid | 2 columns, ~26px gutter, no cell-size variation, no masonry. Each cell: 16:9 rounded image → 14px/500 uppercase `•`-separated tag row → ≈44px title in weight 400. Repetition is the luxury signal. | **S** |
| 14 | Mobile adds motion | Where desktop uses hover, mobile gets a marquee or a permanent arrow. Budget the swap explicitly rather than letting the interaction vanish. | **S** |

## Screenshots
| File | Caption |
|---|---|
| `desktop-00.jpg` | Loader at 6% — centred fill bar, `006` clipped by the bottom-left corner |
| `desktop-02.jpg` | Loader at 75% — counter caught mid-odometer-roll |
| `desktop-hero.jpg` | Hero mid-reveal: h1 lines rising into masks, jack pile in the rounded window |
| `desktop-03.jpg` | Hero at rest — canvas panel and wordmark only, no copy |
| `desktop-04.jpg` | `Bold Ideas, Brought to Life` at ≈112px with the blue brushstroke behind |
| `desktop-05.jpg` | Reel panel: `PLAY REEL` occluded by the centred play button, `+` ticks above and below |
| `desktop-06.jpg` | `Featured Work` left, 14px uppercase caption far right, grid begins |
| `desktop-07.jpg` | 2-up grid rhythm: image → tag row → ≈44px title |
| `desktop-08.jpg` | Grid continues — four more cells, zero size variation |
| `desktop-09.jpg` | Grid closes, empty band, one centred `● SEE ALL PROJECTS` pill |
| `desktop-10.jpg` | Cyan brushstroke behind a three-line ≈112px headline; tablet mockup bleeding off-edge |
| `desktop-11.jpg` | Black chapter — astronaut model, headline at low opacity behind it |
| `desktop-hover.jpg` | Same frame: headline animated to full white, `LET'S TALK` flipped to `rgb(0, 22, 236)` with a `→` |
| `mobile-00.jpg` | Portrait canvas window, wordmark alone above it |
| `mobile-01.jpg` | Display type rewrapped to four lines at ≈78px rather than shrunk |
| `mobile-02.jpg` | `PLAY REEL ▶▶▶` marquee strips — motion added where hover is unavailable |
| `mobile-03.jpg` | 1-up project rows, every title prefixed with a permanent `→` |
