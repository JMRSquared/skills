# Igloo Inc. — https://igloo.inc

**Captured:** 2026-08-14 · **Award:** Awwwards Site of the Year 2024 (as listed in this skill's `SKILL.md`; the award page itself was not re-fetched in this capture — treat the citation as `unverified`) · **Stack (measured):** one Vite-built ES module, `https://www.igloo.inc/assets/index-2eb69c09.js`. Zero stylesheets. Bundle sniff matched `three`, `webgl`, `shader`, `gsap`, `ScrollTrigger`. Two declared `@font-face` families, both IBM Plex Mono (`IBMPlexMono-Regular`, `IBMPlexMono-Medium`).
**Page length:** **1.0 screen** — `scrollHeight` 900 = `viewportHeight` 900. There is no document scroll. · **Sections:** 0 `<section>` · **Canvas/video/img/svg:** the DOM probe at t≈1.4s reported 0 of everything and a single inline style block declaring `div#webgl { display: block; position: a…` — the WebGL canvas is injected after boot, so all runtime counts are `unverified`. Everything below the fold in this study comes from the 12-frame wheel capture, which did boot.

## The capture caveat, stated up front
This site defeats a naive DOM probe. `scrollHeight` never exceeds the viewport, `document.fonts` reports both Plex Mono faces as `unloaded`, `getComputedStyle(body).fontFamily` falls back to `Times`, and every element-level color histogram returns `rgb(0, 0, 0)` ×27 over one background, `rgb(160, 165, 177)`. A first pass recorded exactly that and concluded the site was dead. It is not. The site is a **virtual scroll**: wheel events are captured and fed to a camera rig, `window.scrollY` stays pinned at 0 forever, and every pixel is drawn by three.js. The wheel capture (`scroll.json`, `wheelSteps` 0 → 19250 across 12 states, `scrollY: 0` in all of them) is the only instrument that sees it.

That is itself the first finding: **a site can be a Site-of-the-Year winner and be structurally invisible to every automated audit, SEO crawler and accessibility tree in the industry.** The one measured value the probe got right — `rgb(160, 165, 177)` `#A0A5B1` — is the loader ground, and it turns out to be the whole brand.

## How it is actually built, measured

The capture caveat above said the runtime counts were `unverified` because the
DOM probe saw nothing. They are now verified, by patching prototypes before the
bundle ran rather than by querying the DOM after it.

| What | Measured |
|---|---|
| `attachShadow` calls | exactly one, `{ mode: "closed" }` |
| Canvases created | one, inside that closed root |
| Context requested | `getContext('webgl2', { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: false })` |
| `document.getElementsByTagName('canvas').length` | **0**, while a full WebGL scene is drawing |
| Body | `touch-action: none` |
| Scroll | `scrollHeight === innerHeight` across 19,200 of wheel delta |

**A closed shadow root cannot be traversed from outside.** No DOM query finds
that canvas, which is why the first capture of this site produced a blank page
in Times and why any tool that counts `document` canvases will report this page
as shipping no WebGL. The only way to see it is to patch
`HTMLCanvasElement.prototype.getContext` in an init script that runs before page
scripts, and record the request.

Two things worth stealing from that shape, and one worth not:

- `depth: false, stencil: false, antialias: false` on a scene that is composited
  rather than depth-sorted is a real saving, and `preserveDrawingBuffer: false`
  is the default you want unless you need to read pixels back.
- `touch-action: none` plus a virtualised scroll is what lets the wheel drive a
  narrative that is not a document.
- The closed root buys nothing an open one would not, and it costs every
  accessibility tool, every extension and every auditor the ability to see the
  page. Use `{ mode: "open" }`.

## Art direction in one line
A cold-storage scientific survey of one object: a single arctic-grey world, one glowing igloo, and every word on screen set in 12px mono like an instrument readout — the copy behaves as telemetry printed over the render, never as a headline.

## First 3 seconds
`desktop-hero.jpg` is the loader and it is nine characters wide. A flat field of `#A2A4B3` (sampled; the DOM reported the token as `rgb(160, 165, 177)`), dead centre, with `+++===----` in white monospace at roughly 12px. No logo. No percentage. No spinner, no ring, no brand. The `+`/`=`/`-` glyphs are a **three-state character progress bar** — filled, mid, empty — drawn in text, so it costs nothing and boots before the renderer does.

Then the scene fades up (`desktop-00`): an arctic valley in overcast light, and one igloo built of glowing ice bricks, mid-assembly, floating apart at the top. Interface arrives at the four corners simultaneously — wordmark and legal top-left, manifesto top-right, scroll hint and sound toggle bottom-left. Nothing is centred except the object.

## Palette (measured)
Sampled from frames at 160×100 downscale; the probe's single pre-boot value is included for provenance.

| Role | Value | Where |
|---|---|---|
| Loader ground | `rgb(160, 165, 177)` `#A0A5B1` (probe) / `rgb(162, 164, 179)` `#A2A4B3` (sampled) | `desktop-hero` — the only value the DOM probe returned |
| Landscape mid-tone | `rgb(178, 180, 192)` `#B2B4C0` | `desktop-00`, `desktop-01` — snow in overcast light |
| Void grey (portfolio chapter) | `rgb(105, 111, 125)` `#696F7D` | `desktop-02`–`desktop-04`, the flat non-place the ice cubes float in |
| Studio grey (mark + mascot chapter) | `rgb(138, 144, 158)` `#8A909E` → `rgb(140, 146, 160)` `#8C92A0` | `desktop-05`–`desktop-10` |
| Type / UI | `rgb(255, 255, 251)` `#FFFFFB` (wordmark), `rgb(207, 210, 219)` `#CFD2DB` (secondary label) | sampled `desktop-00` |
| Emissive ice | blown-out white, no hue | `desktop-05`, `desktop-06` ring core |

**The entire site is one hue.** Every sampled value sits between `#696F7D` and `#B2B4C0` — a blue-grey ramp roughly 100–180 in luminance with a constant ~12-point blue lift over red. There is no accent color anywhere in twelve frames. The only saturation on the page is **dispersion**: prismatic rainbow fringing on refractive ice edges (`desktop-01` bottom-left snow, `desktop-10` glitch bands), which is a shader artifact, not a swatch. Chromatic aberration is doing the job a brand color usually does.

## Typography (measured)
One family. `IBMPlexMono-Regular` and `IBMPlexMono-Medium` are the only two `@font-face` declarations on the site — there is no display face, no serif, no second sans.

| Element | Family | Size | Weight | Tracking | Case | Notes |
|---|---|---|---|---|---|---|
| `IGLOO` wordmark | custom logotype, not a font | ≈159×25px on 1440×900 (frame-measured) | — | — | — | Rounded heavy geometric with a dotted `i`; drawn asset |
| Legal block | IBM Plex Mono | ≈12px (frame-measured) | Regular | normal | sentence | `// Copyright © 2026` then `Igloo, Inc. / All Rights Reserved.` |
| Manifesto | IBM Plex Mono | ≈12px | Regular | normal | sentence | Right-aligned, ragged **left**, 6 lines, ~30ch measure |
| Section labels | IBM Plex Mono | ≈12px | Medium | normal | UPPER | `PORTFOLIO_CO_02`, `OVERPASS`, `CLICK TO EXPLORE` |
| Telemetry | IBM Plex Mono | ≈12px | Regular | normal | UPPER | `TEMP 29.34 / -01.48`, `D 06.01.2023`, bare integers `45 44 38 22 30` |
| Hero display | **none exists** | — | — | — | — | There is no h1-scale text anywhere in 12 frames |

**The type scale ratio is 1.0.** Every word on this site is the same size. The hierarchy is carried entirely by position (four corners), alignment (left block vs right block vs leader-line callout) and weight (Regular vs Medium). A site that wins Site of the Year with a single 12px mono size is the strongest possible argument against the reflex to reach for `clamp(3rem, 8vw, 9rem)`.

Two typographic devices carry all the character:
- **Leader lines.** Numbers (`45`, `44`, `38`, `22`, `30` in `desktop-00`; `42`, `22`, `22`, `10`, `17` in `desktop-11`) sit at the end of 1px hairlines that connect to points on the 3D model, with a `+` crosshair at the anchor. The values differ between the two frames, so they are live measurements of the model's current state, not decoration.
- **Text scramble.** `desktop-02` shows `PORTFPMJP`EIa*3 / KXGB^ LAJDRNK` where `desktop-03` shows `PORTFOLIO_CO_02 / OVERPASS`. `desktop-08` shows `LiomhhM` where `desktop-09` shows `LinkedIn`. Mono is chosen so scrambling never reflows the box.

## Structure, screen by screen
No frame is a "section". Each is a camera state on a continuous scroll-driven timeline; percentages are wheel-progress, not document position.

- **desktop-hero (pre-boot)** — loader. `#A2A4B3` field, `+++===----` centred, 9 glyphs, nothing else.
- **desktop-00 (0%)** — Hero. Igloo centred and mid-assembly, top bricks floating free, interior glowing. Four-corner UI: wordmark + legal top-left, `////// Manifesto` + 6-line right-aligned mission top-right, `Scroll down to discover.` + `Sound: Off` bottom-left. Five numeric callouts on the model. Horizon at 45% height; the object occupies the centre 40% of width and sits on the lower third.
- **desktop-01 (9%)** — Same valley, camera lowered and pulled back, igloo now fully assembled and smaller in frame. `Scroll down` and the callouts have gone; wordmark, legal and manifesto persist. Prismatic dispersion streaks across the snow in the bottom-left quadrant.
- **desktop-02 (18%)** — Hard cut to a **void**: flat `#696F7D` with a faint dot grid and blurred ghost text drifting in the background layer. A refractive ice cube floats slightly right of centre, containing a frozen figure. Labels scrambled mid-transition. `D 01.02.2020 / CLICK TO EXPLORE` sits bottom-right of the object with a hairline rule under it.
- **desktop-03 (27%)** — `PORTFOLIO_CO_02 / OVERPASS`, cube 2, an ice-encased sign. Labels resolved. `TEMP 29.34 / -01.48`, `D 06.01.2023`. Identical layout to 02 — the label positions are a fixed template the objects swap through.
- **desktop-04 (36%)** — `PORTFOLIO_CO_03 / ABSTRACT`, cube 3, flatter and wider. `TEMP 24.54 / -04.14`, `D 06.28.2024`.
- **desktop-05 (45%)** — All copy drops except wordmark and sound toggle. A giant ice ring — the brand mark as a physical torus — fills 70% of viewport height, lit from an emissive inner band. Off-centre left.
- **desktop-06 (55%)** — Same ring rotated to face camera, dead-centred, inner core blown to pure white, a wireframe mesh visible through the ice.
- **desktop-07 (64%)** — Camera looking straight down a snow funnel. Concentric ridge rings, a small glowing crystal at the vanishing point. The only frame with radial symmetry.
- **desktop-08 (73%)** — A point-cloud figure materialising above a circular plinth, particles still unresolved. A horizontal item row appears at the plinth base, mid-scramble (`LiomhhM`), flanked by `[` `]` corner brackets and left/right chevrons.
- **desktop-09 (82%)** — The figure resolves: a penguin mascot in headphones, rendered as dense particles, on a lit plinth under a ring light. The row below reads `…edium | LinkedIn | X / Twit` — a **social carousel** where the active item sits inside the corner brackets and the neighbours bleed off both edges.
- **desktop-10 (91%)** — Datamosh transition. The plinth and horizon shear into horizontal RGB-split blocks; the mascot smears upward into a hair-like stretch. Rainbow lens ghosts bottom-left and bottom-right.
- **desktop-11 (100%)** — **The scroll loops.** Back to the igloo hero, but a different assembly state (bricks higher, callouts now `42 / 22 / 22 / 10 / 17`), and the manifesto block is back. The experience is a closed ring, not a page with an end.

## Motion inventory
| # | Moment | Trigger | What moves | Est. duration / easing | Library evidence |
|---|---|---|---|---|---|
| 1 | Loader | page load | 9 mono glyphs step `-` → `=` → `+` left to right | discrete steps, no easing | `desktop-hero`; text-only bar boots before the renderer |
| 2 | Whole experience | wheel, not scroll | camera dolly/orbit through 12 states over 19250 wheel-delta | scrubbed, ~1600 delta per state | `scroll.json` `wheelSteps` 0→19250 with `scrollY: 0` in every entry |
| 3 | Igloo assembly | scroll position | ice bricks lerp between exploded and seated; top ring floats free at 0%, settles by 9%, re-explodes at 100% | scrubbed both directions | `desktop-00` vs `desktop-01` vs `desktop-11` brick positions |
| 4 | Callout numerals | continuous | leader-line values change between visits to the same camera state (`45 44 38 22 30` → `42 22 22 10 17`) | live per-frame | `desktop-00` vs `desktop-11` |
| 5 | Label scramble | chapter change | section labels cycle random glyphs then resolve to the real string | ≈0.4–0.8s, char-staggered | `desktop-02` (`PORTFPMJP\`EIa*3`) → `desktop-03` (`PORTFOLIO_CO_02`) |
| 6 | Chapter cut | scroll threshold | background swaps `#B2B4C0` valley → `#696F7D` void with no crossfade | instant | `desktop-01` → `desktop-02` |
| 7 | Datamosh transition | scroll threshold | horizontal RGB-split shear across the lower half + rainbow lens ghosts | ~0.3s, scrubbed | `desktop-10`; `bundleLibs: shader` |
| 8 | Particle materialisation | scroll | mascot assembles from a loose point cloud to a dense one | scrubbed | `desktop-08` → `desktop-09` |
| 9 | Social carousel | scroll (shares the same wheel axis) | items translate horizontally through fixed corner brackets, scrambling as they move | scrubbed | `desktop-08` vs `desktop-09` row content |
| 10 | Dispersion | continuous | prismatic fringing crawls along refractive edges | continuous | `desktop-01`, `desktop-10`; `bundleLibs: shader, webgl` |
| 11 | Sound | user toggle | `Sound: Off` with a muted-speaker glyph, persistent bottom-left in all 12 frames | — | every desktop frame |
| 12 | Interstitial timeline | `gsap` + `ScrollTrigger` in bundle | orchestration of the above; no ScrollTrigger DOM markers observable because there is no scrollable DOM | — | `bundleLibs: ScrollTrigger, gsap` |

## Why it reads expensive
1. **The loader is nine monospace characters and no brand.** `+++===----` on a flat field. It ships before the bundle, weighs nothing, and sets the instrument-readout tone in the first 200ms. Compare to the industry default of a centred logo with a sweeping arc.
2. **One hue, twelve frames.** Every sampled color falls in a blue-grey band from `#696F7D` to `#B2B4C0`. No accent, no second brand color, no gradient stop that isn't grey. Confidence here reads as restraint, and it costs nothing to copy.
3. **The type scale ratio is 1.0.** Approximately 12px mono for every word on the site — legal, manifesto, section labels, telemetry, CTA. Hierarchy comes from corner placement and Regular-vs-Medium alone.
4. **Copy is set as telemetry, not as marketing.** `TEMP 29.34 / -01.48`, `D 06.28.2024`, bare integers on leader lines with `+` crosshairs. The words behave like an instrument overlaying a specimen, which is why 12px copy over a busy render still reads as deliberate rather than small.
5. **The manifesto is right-aligned with a ragged left edge.** Six lines, ~30 characters, hard against the top-right corner. Ragged-left is rare enough that it registers as a decision.
6. **Nothing is centred except the subject.** All four text blocks are corner-pinned; the 3D object owns the entire optical centre. Copy never overlaps the object's silhouette in any of the 12 frames.
7. **The scroll is a closed loop.** Frame 11 returns to frame 0 in a different assembly state. There is no footer, no end, no "back to top".
8. **The brand mark exists as a physical object.** `desktop-05`/`desktop-06` render the logo as a lit ice torus you orbit, not as an SVG in a corner. The wordmark in the corner and the sculpture in the scene are the same mark at two levels of reality.
9. **Chromatic aberration replaces the accent color.** The only saturation in the whole site is prismatic dispersion on refractive edges. The palette stays monochrome and the page still has color moments.
10. **Portfolio items are objects, not cards.** Each project is an ice cube containing a frozen artifact, with the label template held constant across all three so only the contents change (`desktop-02`/`03`/`04`).

## Mobile adaptation
390×844 (`viewportHeight` 844, `scrollHeight` 844 — the virtual scroll is identical). Nothing is replaced with a static fallback: **the full three.js scene ships to phones.**

- **The wordmark grows hard.** Frame-measured, `IGLOO` goes from ≈159px wide on a 1440 viewport (11% of width) to ≈285px on a 780 capture (36% of width). It is the single element that gets a bigger share of the screen.
- **Corner UI collapses to a two-column header.** `mobile-00`: legal block left, manifesto right, both at the top, both still ≈12px mono, manifesto still right-aligned ragged-left. The bottom-left pair (`Scroll down to discover.`, `Sound: Off`) survives unchanged.
- **The camera reframes, the scene does not simplify.** `mobile-01` shows the assembled igloo smaller and lower with far more sky — portrait gets more negative space, not a tighter crop.
- **Portfolio labels degrade first.** `mobile-02` shows `IPSVHINLJYFJZ,5 / LQAD_` and `VGPK 79~`; `mobile-03` shows `LKVXCLI` and a bare `Q`. The scramble animation is running but the strings never fully resolve in the capture window, and the `CLICK TO EXPLORE` line and its rule are gone — the telemetry cluster is thinned to one label and one short code.
- **What is deleted:** the numeric leader-line callouts on the igloo persist on `mobile-00` (`52 51 46 23 30`) but the dense telemetry stack around the portfolio cubes does not.

## Steal list (buildable rows)
| # | Craft component | How to rebuild it (stack + approach) | Cost |
|---|---|---|---|
| 1 | Character-cell progress bar | A `<div>` of N monospace glyphs, `-`/`=`/`+` swapped by index as `loaded/total` advances. Inline it in `<head>` so it paints before any bundle. No SVG, no CSS animation, no logo. | **S** |
| 2 | Single-size mono interface | Set the entire UI at one size (~12px) in one mono family; carry hierarchy with corner placement and a Regular/Medium weight pair only. Ban a second size until the layout demonstrably fails. | **S** |
| 3 | Telemetry copy register | Rewrite labels as instrument output: `TEMP 29.34 / -01.48`, `D 06.28.2024`, `PORTFOLIO_CO_02`. Uppercase, underscored, mono, no articles or verbs. | **S** |
| 4 | Leader-line callouts | Absolutely-positioned 1px SVG polylines from a `+` crosshair on the subject to a numeric label. Recompute anchors from the model's projected screen positions each frame so the numbers drift with the object. | **M** |
| 5 | Text-scramble resolve | On chapter change, replace each character with a random glyph from a fixed set, then resolve left-to-right on a per-char stagger (~30ms). Monospace guarantees zero layout shift. | **S** |
| 6 | Four-corner UI, empty centre | Pin every text block to a viewport corner; leave the optical centre entirely to the subject. Enforce it as a layout rule — no centred hero copy at all. | **S** |
| 7 | Virtual wheel scroll | Capture `wheel`, accumulate delta into a normalised 0–1 progress value, drive a camera/GSAP timeline from it, and never move the document. Budget ~1600 delta per narrative state. Ship a keyboard and touch equivalent, and accept that crawlers see one screen. | **L** |
| 8 | Monochrome-plus-dispersion | Build the whole palette from one hue ramp (here ~100–180 luminance, +12 blue over red) and get all color from a chromatic-aberration / dispersion shader pass on refractive edges. | **M** |
| 9 | Fixed label template, swapped objects | Lock the positions of title, sub-label, telemetry pair and CTA once; move only the 3D object between portfolio states. Consistency across items is what makes them read as a catalogue. | **S** |
| 10 | Brand mark as physical object | Extrude the logo, give it an emissive core and an ice/glass material, and make one chapter of the scroll an orbit around it. Keep the flat corner wordmark simultaneously. | **L** |
| 11 | Bracketed carousel | A horizontal row that translates behind two fixed `[` `]` corner marks; neighbours bleed off both edges; entering items scramble and resolve. Works for social links, filters or project names. | **M** |
| 12 | Looped scroll | Make the last narrative state return to the first in a mutated form (different assembly, different numbers) instead of a footer. No end, no back-to-top. | **M** |

## Screenshots
| File | Caption |
|---|---|
| `desktop-hero.jpg` | Loader: `+++===----` in mono on `#A2A4B3`, no logo, no percentage |
| `desktop-00.jpg` | Hero, igloo mid-assembly, four-corner UI, five numeric leader-line callouts |
| `desktop-01.jpg` | Igloo seated, camera lowered, dispersion fringing across the snow |
| `desktop-02.jpg` | Portfolio cube 1 in the `#696F7D` void, labels mid-scramble |
| `desktop-03.jpg` | `PORTFOLIO_CO_02 / OVERPASS` — labels resolved, telemetry pair visible |
| `desktop-04.jpg` | `PORTFOLIO_CO_03 / ABSTRACT` — same template, third object |
| `desktop-05.jpg` | Brand mark as a lit ice torus, all copy dropped |
| `desktop-06.jpg` | Same torus face-on, emissive core blown out, wireframe visible through the ice |
| `desktop-07.jpg` | Top-down snow funnel, the only radially symmetric frame |
| `desktop-08.jpg` | Point-cloud mascot materialising; carousel row mid-scramble (`LiomhhM`) |
| `desktop-09.jpg` | Mascot resolved on a lit plinth; carousel reads `LinkedIn` inside corner brackets |
| `desktop-10.jpg` | Datamosh transition — horizontal RGB shear and rainbow lens ghosts |
| `desktop-11.jpg` | Loop closes: hero returns with new assembly state and new callout values |
| `mobile-00.jpg` | Two-column header, wordmark at ~36% of viewport width, callouts retained |
| `mobile-01.jpg` | Portrait reframe — same scene, more sky, no simplification |
| `mobile-02.jpg` | Portfolio cube with telemetry thinned to two unresolved scramble strings |
| `mobile-03.jpg` | Second cube, `CLICK TO EXPLORE` and its rule deleted |
