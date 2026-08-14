# Apple iPhone 14 Pro Max (apple-iphone14) — https://apple-iphone14.vercel.app

**Captured:** 2026-08-14 · **Status:** LIVE on desktop, **mobile scroll is broken** (see Mobile adaptation) · **What it is:** an iPhone 14 Pro Max product page — quote intro, durability pin, display beat, chip beat, four colourway panels, camera video, 360° configurator · **Stack (measured):** `bundleLibs` = three, r3f, drei, gsap, ScrollTrigger, shader, webgl, video. `libs.react === true`; Create-React-App build (`/static/js/main.883dc842.js`, `/static/css/main.e6c13ad2.css`) — the only CRA site of the four, and the only one with no CMS.
**Page length:** 13.3 screens (scrollHeight 11940 / viewport 900) — the longest of the four · **Sections:** 8 · **Canvas/video/img counts:** canvas 3, video 3, img 1, svg 0

## Art direction in one line
Black cinema with a colour intermission: eleven-and-a-half screens of an unlit phone lit only by its own display, interrupted by four full-bleed colourway panels that each take over the entire viewport with a single flat brand colour.

## First 3 seconds
`desktop-hero.jpg`: pure `rgb(0,0,0)`, no nav, no logo, no product. A five-line Steve Jobs quote sits left-of-centre at 31px, each line tinted a different pastel along a blue→pink ramp (`You can't connect the dots looking forward;` in pale blue, `— Steve Jobs` in pink). Nothing else in frame for ~1.5 screens. The page opens on a title card, not on a product.

## Palette (measured)
Neutrals in CSS, colourways as full-viewport grounds.

| Value | Count | Role |
|---|---|---|
| `rgb(0, 0, 0)` | bg ×9, text ×76 | page ground for ~9 of 13.3 screens |
| `rgb(255, 255, 255)` | bg ×5, text ×26 | colourway split panels + on-black copy |
| `rgb(155, 181, 206)` | bg ×1 | **Sierra Blue** colourway ground |
| `rgb(249, 229, 201)` | bg ×1 | **Gold** colourway ground |
| `rgb(80, 95, 78)` | bg ×1 | **Alpine Green** colourway ground |
| `rgb(87, 79, 111)` | bg ×1 | **Deep Purple** colourway ground |
| `rgba(33, 94, 124, 0.4)` ×2, `rgba(33, 94, 124, 0.8)` ×1 | bg | translucent teal — the only scrim on the page, over the underwater video |
| `rgb(33, 94, 124)` | text ×1 | matching teal label |
| `rgb(151, 151, 151)` | text ×6 | h1 / secondary grey |
| `rgb(0, 113, 227)` | text ×1 | the single link/CTA blue |

The four colourway hexes are the product's marketing palette lifted straight into `background-color`. The gradient text in the intro and in `Fastest Processor` is a `background-clip` ramp, not a listed colour.

## Typography (measured)
One family in two files, and a much smaller scale than the other three sites.

- `Source Sans Pro` (loaded) and `Source Sans Pro light` (loaded) — declared as two separate families rather than two weights.
- `Times|400` appears on 2 elements — an unstyled fallback leaking through.
- The `<button>` renders at `Arial` **13.3333px** — a bare `<input type="button">` that never received a style. Two measurable type bugs on a page that otherwise looks composed.

| Role | Desktop | Mobile | Weight | Color |
|---|---|---|---|---|
| h1 `iPhone 14 Pro Max` | 31px | 22px | 700 | `rgb(151,151,151)` desktop / `rgb(255,255,255)` mobile |
| h2 `iPhone` | 22px | 22px | 700 | `rgb(0,0,0)` |
| p (the Jobs quote) | 31px | 16px | 400 | `rgb(255,255,255)` + per-line gradient |
| button `Buy` | 13.3333px | 13.3333px | 400 | `rgb(255,255,255)` |

Font census: `Source Sans Pro, sans-serif|400` ×10, `|700` ×5, `Source Sans Pro light|400` ×4 and `|700` ×4 — asking a *light* face to render at weight 700, which the browser synthesises. `lineHeight` is `normal` on every measured element: no leading system at all. Peak display size on this page is ~90px (the `Flaw-Less Design With Strong Durability.` headline in `desktop-01.jpg`) against 31px body — roughly 3:1, where Fizzi runs 13:1.

## Structure, screen by screen
1. **0–8% — Quote card.** Black, five gradient lines, attribution. `desktop-hero.jpg`
2. **8–22% — Durability pin.** `desktop-01.jpg`: ground flips to white; a Sierra-Blue phone renders at ~55% viewport height dead centre while ~90px black headlines slide horizontally *through* it — `Flaw-Less Design With Strong Durability.` crossing the phone body, `Flat-Edge Design With Toughest Scratch-Free Glass` arriving from below. Copy and product occupy the same pixels with no scrim and no z-separation; the frame shows the phone reading through the letterforms of `Design`.
3. **22–36% — Display beat.** `desktop-02.jpg`: back to black. The phone lies at ~-35° in the centre, its screen the only lit object, showing the blue Apple wallpaper. Two caption blocks in opposite corners: `Big is better` (left, ~22px white) and `Super Ratine XDR Display` (right-aligned, ~22px). Below, a huge gradient headline (`…r then ever!` / `…atters.`) rotated ~-20° and cropped by the bottom edge.
4. **36–43% — Chip beat.** `desktop-03.jpg`: an A15 die diagram drawn as a cyan wireframe with a green Apple mark, glowing on black; the phone stands upright in front of it, overlapping the die; `Fastest Processor` at ~64px in a violet→pink gradient sits behind the phone; two lorem paragraphs at ~16px grey in the left margin.
5. **43–71% — Four colourway panels.** `desktop-04.jpg` (Sierra Blue), `desktop-05.jpg` (RED). Each panel is one screen: the viewport splits into two vertical fields of the same hue at two lightnesses, a small full-body phone on the left, a giant camera-module crop bleeding off the right edge, and the colour name set vertically in the seam at ~22px, tinted a darker shade of the panel colour. Same layout, four grounds — `rgb(155,181,206)`, `rgb(249,229,201)`, `rgb(80,95,78)`, `rgb(87,79,111)`.
6. **71–86% — Camera video.** `desktop-06.jpg`: full-bleed underwater scuba footage with a teal scrim (`rgba(33,94,124,0.4)` / `0.8`) and a strip of solid teal swatches above it — the only place on the page where copy sits on a scrim rather than on black.
7. **86–100% — 360° configurator.** `desktop-07.jpg`: pale `rgb(155,181,206)` ground, a `360° ↻` affordance label centred at the top, the phone standing at ~500px tall, a vertical rail of six circular colour swatches at the left (the four colourways plus red and a deeper blue), then `iPhone` / `14 Pro Max` / `From $1099*` centred beneath, a blue `Buy` pill and a `Learn More →` link. `desktop-hover.jpg` is the same frame with the `Buy` pill in its lighter hover state.
8. **Footer** — not reached in the 8-step capture.

Seven discrete beats. The intro quote and the durability section are the pinned ones; the colourway panels are conventional full-height sections.

## Motion inventory

| Moment | Trigger | What moves | Est. duration / easing | Library evidence |
|---|---|---|---|---|
| Quote reveal | load | five lines fade/rise on a stagger, each landing on its own gradient stop | ~400ms per line, ~200ms stagger, ease-out | `gsap` |
| Headline sweep through product | scroll scrub, pinned | two ~90px headlines translate horizontally across the pinned phone at different rates | scrub over ~1.5 viewports | `ScrollTrigger`; `desktop-01.jpg` catches both mid-travel |
| Phone tilt to display beat | scroll scrub | phone rotates from upright to ~-35° and scales up ~1.6× | scrub | `r3f`; `desktop-01.jpg` → `desktop-02.jpg` |
| Rotated gradient headline | scroll scrub | ~120px type rotated ~-20° parallaxes up from below the fold | scrub | `desktop-02.jpg` |
| Chip wireframe glow | scroll enter | cyan A15 die fades in with a bloom, phone slides in front of it | ~800ms ease-out | `shader` + `webgl` in bundleLibs |
| Colourway panel cuts | scroll (section snap) | four identical layouts swap ground colour and model material screen by screen | per-section, ~1 viewport each | four grounds in `topBackgrounds`; `desktop-04.jpg` vs `desktop-05.jpg` |
| Camera video + scrim | scroll enter, autoplay | full-bleed underwater loop under a `rgba(33,94,124,0.4→0.8)` wash | continuous | `video` in bundleLibs, `counts.video === 3` |
| 360° drag | pointer drag on the model | phone spins on `rotation.y`; the `360° ↻` label advertises the affordance | user-driven, damped | `desktop-07.jpg` |
| Swatch colour change | click swatch rail | phone material re-tints; ground stays put | ~300ms | six swatches in `desktop-07.jpg` |
| Buy hover | pointer over pill | `rgb(0,113,227)` lightens | ~150ms | `desktop-hover.jpg` vs `desktop-07.jpg` |

## The 3D system
- **Three canvases + three videos + exactly one `<img>` and zero SVGs.** The phone, the A15 die and the configurator each get a canvas; the camera-sample footage is video. Every glyph-looking thing on this page — colour swatches, the `360° ↻` mark, the Apple logo on the phone back — is either DOM text or rendered geometry.
- **Camera fixed, phone posed.** Upright (durability) → ~-35° laid back (display) → upright (chip) → flat front (colourways) → free-spin (configurator). The horizon never moves.
- **Lighting is display-first.** In `desktop-02.jpg` the chassis is barely above the black ground and the screen wallpaper carries the whole read — the same trick as macbook-ui, applied to a smaller object. In the colourway panels the lighting flattens out completely: no specular, no shadow, just filled silhouettes on a matching ground, so the panel reads as a flat vector illustration even though it is rendered.
- **Scroll → transform mapping** is one channel per beat, mostly `rotation.z`/`rotation.y` plus `scale` and `position.y`, with headline `translateX` running on its own scrub in the opposite direction so the two layers separate visually.
- **Text over a moving stage — this is where the page loses.** `desktop-01.jpg` runs ~90px black headlines straight through a mid-value phone body on white with no scrim, no blur, no outline: `Design` and `Durability` are partly unreadable where the letterforms cross the chassis. Compare Nimbus, which solved the same overlap with a hard offset shadow, and Fizzi, which refuses the overlap and uses columns. The only scrim on the entire page is the teal wash over the video (`rgba(33,94,124,0.4)`), applied where the background is *busiest* — the right instinct, just not applied where the collision actually happens.
- **Mobile fallback:** the 3D reports as present (canvas 3, video 3 at 390px) but is never reached — see below.

## Why it reads expensive
1. **It opens on a quote, not a product.** Roughly 1.5 screens of black before the phone appears — an editorial title card ahead of the sell.
2. **Per-line gradient tinting.** Five quote lines on a blue→pink ramp, one stop per line, so the ramp reads as a timeline rather than as decoration.
3. **The colourway system is four full-viewport panels**, one per finish, all identical in layout — repetition as rhythm, and the four grounds are lifted verbatim from the product's marketing palette.
4. **A giant camera-module crop bleeding off the right edge** in every colourway panel: the macro is 3× the size of the full-body render beside it, which is the whole argument of a Pro phone.
5. **Vertical colour names in the seam** between the two panel fields, set in a darker tint of the panel's own colour — a label that only appears if you look for it.
6. **Headlines that pass behind and in front of the product** instead of sitting above it.
7. **Real footage for the camera claim.** Underwater scuba video full-bleed, not a still.
8. **One CTA colour**, `rgb(0, 113, 227)`, count 1 in text and 1 as fill.

## What is measurably broken
Worth recording, because this page looks award-caliber in stills and fails on the two things that matter most.

- **Mobile does not scroll at all.** At 390×844 the probe reports `scrollHeight: 10330` (12.2 screens) but all four scroll steps computed `targetY: 0` and every frame returned `reachedY: 0`. `mobile-00`–`mobile-03` were byte-identical (md5 `e805c937…` ×3). The whole page below the quote card is unreachable on a phone. The other three sites reached their full scroll height on the same probe. Deleted the three duplicate mobile frames; `mobile-00.jpg` is the only mobile evidence and it is the intro quote.
- **Type over product is unreadable** at the durability beat (`desktop-01.jpg`).
- **Two unstyled type leaks:** `Times|400` on 2 elements and the `Buy` control rendering at `Arial 13.3333px` — a browser default that survived to production.
- No `<title>` worth the name: `React App`.

## Mobile adaptation
There isn't one, functionally. The measured breakpoint work exists in CSS — h1 31 → 22px, quote 31 → 16px, h1 colour flipping from `rgb(151,151,151)` to `rgb(255,255,255)` for the black ground, section and canvas counts identical to desktop — but scroll never advances past y=0 at 390px width, so none of it is reachable. Treat this site as a desktop-only reference and as the cautionary example: a scroll-driven 3D story with a scroll lock on mobile delivers exactly one screen of content to the majority of its traffic.

## Steal list

| Component | How to rebuild | Cost |
|---|---|---|
| Quote-card cold open | Full-viewport black, one editorial quote, per-line gradient stops via `background-clip: text` on each line, staggered fade+rise. Hold the product back ~1.5 screens. | S |
| Four-panel colourway system | One full-height section per finish; `background-color` = the marketing hex; split the viewport into two vertical fields of the same hue at two lightnesses; full-body render left, 3× camera-module crop bleeding off the right; finish name set vertically in the seam in a darker tint. | M |
| Oversized detail crop as the argument | Render the same object twice in one frame at ~1× and ~3×, letting the large one bleed off an edge. Costs nothing extra and does the persuading. | S |
| Headline that crosses the product | Two `ScrollTrigger` scrubs running opposite directions — headline `translateX`, product `rotation` — over a pinned section. **Add what this site omitted:** a hard offset shadow or an outline stroke on the type, or keep the product's value range away from the text colour. | M |
| Emissive-screen-only lighting | Kill ambient, make the display an emissive plane with a real wallpaper texture, leave the chassis at near-ground luminance. The lit screen carries the whole read on black. | M |
| Wireframe die + bloom | Draw the chip as a cyan line diagram, add a bloom pass, place the product in front so it occludes part of the graphic. Sells "engineering" without a photograph. | M |
| Drag-to-spin configurator with affordance label | R3F + pointer-drag on `rotation.y` with damping, a `360° ↻` label above the model, and a vertical rail of circular swatches that re-tint the material. The label is what makes the interaction discoverable. | M |
| Video-with-tinted-scrim proof section | Full-bleed muted loop under `rgba(<brand>, 0.4)` rising to `0.8` behind copy. The only place on this page copy is guaranteed readable — apply the same discipline anywhere copy meets imagery. | S |

## Screenshots
`assets/studies/apple-iphone14/` — `desktop-hero.jpg` (quote cold open), `desktop-01.jpg` (headlines crossing the phone — the readability failure), `desktop-02.jpg` (display beat, emissive screen on black), `desktop-03.jpg` (A15 wireframe + gradient headline), `desktop-04.jpg` / `desktop-05.jpg` (Sierra Blue and RED colourway panels), `desktop-06.jpg` (underwater video + teal scrim), `desktop-07.jpg` (360° configurator + swatch rail), `desktop-hover.jpg` (Buy pill hover state), `mobile-00.jpg` (the only screen mobile can reach). `data.json` holds all measured values above, including the `reachedY: 0` mobile scroll record.
