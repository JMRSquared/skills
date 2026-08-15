# Nimbus Keyboards (Vapor75) — https://nimbus-keyboards1.vercel.app

**Captured:** 2026-08-14 · **What it is:** single-SKU mechanical-keyboard product site — hero, exploded build, feature bento, switch-sound demo, live keycap configurator, CTA · **Stack (measured):** `bundleLibs` = three, r3f, drei, gsap, ScrollTrigger, **SplitText**, shader, webgl. Next.js with Turbopack (`_next/static/chunks/turbopack-*.js`), Prismic CMS (`static.cdn.prismic.io/prismic.js?repo=nimbus-keyboard1`), Tailwind v4 (`lab()` / `oklab()` values throughout computed styles).
**Page length:** 9.1 screens (scrollHeight 8184 / viewport 900) · **Sections:** 11 · **Canvas/video/img counts:** canvas **6**, video 0, img 12, svg 51

## Art direction in one line
A pale-blue-and-orange keyboard rendered six separate times across a navy→steel gradient, with italic condensed uppercase display type that the 3D object is always allowed to overlap — plus an on-brand loader made of keycaps before a single pixel of product appears.

## First 3 seconds
`desktop-hero.jpg` caught the **loading screen**: navy→steel-blue vertical gradient, `Nimbus` in white ~36px, and a 3D keyboard-shaped progress bar whose seven caps spell `L O A D I N G`, with the current cap depressed (the `O` sits lower than its neighbours). It is a keycap-press animation used as a progress indicator.

Then `desktop-00.jpg`: the same gradient, `BUILD FOR / THE BOLD` at 96px / uppercase / italic-condensed with a hard white drop-shadow offset ~4px down-right, set in the upper-left. Behind and across it, a 75% keyboard rotated ~-15° and cropped by three edges, occupying roughly 70% of the viewport. Loose keycaps float free around it. Lower-right: `TYPING REINVENTED` at 60px, a 16px lede, and a cyan `BUY VAPOR75 >` pill. A cyan `BUY >` button and a hamburger sit fixed top-right on every frame captured.

## Palette (measured)
Tailwind v4 emits `lab()` / `oklab()`; sRGB conversions in brackets.

| Value | Approx sRGB | Count | Role |
|---|---|---|---|
| `lab(91.6229 -0.159115 -2.26791)` | ≈ `#e6e7ea` | bg ×12 | the light "marquee" band ground |
| `lab(96.1596 -0.0823438 -1.13575)` | ≈ `#f5f5f7` | bg ×6 | card / panel white |
| `rgb(1, 167, 225)` | `#01a7e1` | bg ×1 | **the only saturated CSS colour** — every CTA |
| `lab(8.11897 0.811279 -12.254)` | ≈ `#0b1424` | bg ×1, text ×2 | near-black navy, footer + display type |
| `lab(17.8299 -5.31271 -21.1584)` | ≈ `#12283f` | bg ×1 | deep navy section ground |
| `lab(13.003 29.04 16.7519)` | ≈ `#4a0f0c` | bg ×1 | Red-Max switch card |
| `lab(15.8111 20.9107 23.3752)` | ≈ `#4a1e08` | bg ×1 | Brown-Max switch card |
| `lab(85.1236 -0.612259 -3.7138)` | ≈ `#d2d5da` | bg ×1 | marquee word fill |
| `rgb(0, 0, 0)` | | text ×566 | default inherited |
| `rgb(255, 255, 255)` | | text ×159 | all display + on-navy copy |
| `oklab(0.706998 … / 0.8)` | ≈ `#9aa0a6` @ 80% | text ×36 | muted body |
| `lab(65.9269 -0.832707 -8.17473)` | ≈ `#94a0ac` | text ×22 | nav + footer links |

The orange in every frame is the *product*, not the stylesheet — keycaps and the knob. Brand colour lives in the 3D model; the CSS carries exactly one accent.

## Typography (measured)
Two families, and the display face is doing all the work.

- **`Roboto Flex`** — variable, `weight: 100 1000`, `style: oblique 0deg 10deg`. Seven `@font-face` declarations, six `unloaded` and one `loaded`: the page ships a stack of axis-specific slices and pulls only the one it needs.
- **Body is the system stack** — `ui-sans-serif, system-ui, sans-serif, …`. No webfont at all for paragraphs.

| Role | Desktop | Mobile | Weight | Case | Color |
|---|---|---|---|---|---|
| h1 `BUILD FOR` | 96px / lh 76.8 (0.80) | 60px / lh 48 | 400 | uppercase | `rgb(255,255,255)` |
| h2 `TYPING REINVENTED` | 60px / lh 60 (1.00) | 36px / lh 40 | 400 | uppercase | `rgb(255,255,255)` |
| p lede | 16px / lh 24 | 16px / lh 24 | 400 | none | `rgb(255,255,255)` |
| nav a | 14px / lh 20 | 14px | 400 | none | `lab(65.93 …)` |
| button `Buy` | 16px / lh 24 | 16px | 600 | none | `rgb(255,255,255)` |

Font census: `Roboto Flex|400` on 94 elements, system stack on 45+7+6+1. Weight stays 400 — the heavy, condensed, oblique look comes from Roboto Flex's `wdth`/`slnt` axes, not from a bold weight. `SplitText` in `bundleLibs` confirms the headlines are exploded into per-character or per-word spans.

## Structure, screen by screen
1. **Loader.** Keycap `LOADING` bar over the navy gradient. `desktop-hero.jpg`
2. **0–14% — Hero.** Angled 75% keyboard, floating keycaps, `BUILD FOR THE BOLD` upper-left, `TYPING REINVENTED` + CTA lower-right. `desktop-00.jpg`, `desktop-hover.jpg` (same beat, different rotation and keycap positions — the idle animation never stops)
3. **14–29% — Exploded build.** `desktop-01.jpg`: ground flips to white, camera drops to a near-eye-level 3/4, and ~14 caps lift off in a staggered pyramid to expose red switch stems on the PCB. Zero copy in frame. Pure product theatre.
4. **29% — Reassembled top-down.** `desktop-02.jpg`: caps back on, camera high and flat, keyboard cropped by the top edge — the transitional pose between beats 3 and 4.
5. **29–43% — `VAPOR75 FEATURES` bento.** `desktop-03.jpg`: 2-across cards on near-black with navy radial glows, each holding a macro render of a different part with `Bold label. Grey sentence.` bottom-left. Six features (aluminium case, knob system, cross-platform, hot-swap, keycap profile, e-ink screen).
6. **43–57% — Marquee band.** `desktop-04.jpg`, `desktop-05.jpg`: a `lab(91.62 …)` light strip ~250px tall running `CRAFTING JOYFUL EXPERIENCES` in ~180px italic uppercase `lab(85.12 …)` grey with the Nimbus logo mark repeated between words, scrolling horizontally opposite the page scroll.
7. **57–71% — `GOODWELL` typographic wall.** `desktop-05.jpg`: the current keycap-set name tiled as giant navy-on-navy background type behind the keyboard, so the model floats over its own product name.
8. **71–86% — Live keycap configurator.** `desktop-06.jpg`: `CUSTOM KEYCAPS` + lede on the left; a white rounded panel on the right holding six labelled swatch chips (`Goodwell`, `Dreamboard`, `Cherry Navy`, `Kick`, `Old School`, `Candy Keys`), each a miniature keyboard render. Active chip gets a pale-blue fill + blue ring; hover gets a dark ring (`Dreamboard` in-frame). The full-size 3D keyboard above re-textures in real time.
9. **Switch-sound cards** (mobile-only in this capture, `mobile-02.jpg`): full-bleed cards per switch — `RED MAX`, `BROWN MAX`, black — each with a large isometric switch render, the switch name in italic uppercase, and a **speaker icon**: tap to hear the switch.
10. **86–100% — CTA.** `desktop-07.jpg`: white ground, `Experience Peak Performance` kicker, `ORDER YOURS NOW` at ~72px italic navy, and a single enormous pill button ~1240×280px. Captured mid-animation — the fill is still a pale cyan wash and the label is grey, so the button animates in on enter (mobile shows the resolved state: saturated cyan gradient, 6px navy outline, navy label).
11. **Footer.** Black, logo left, four links right.

Eight discrete scroll beats plus a loader.

## Motion inventory

| Moment | Trigger | What moves | Est. duration / easing | Library evidence |
|---|---|---|---|---|
| Keycap loader | page load | seven caps spell `LOADING`; each depresses in turn as assets stream (`O` is down in `desktop-hero.jpg`) | ~150ms per cap, loops till ready | `r3f` scene rendered before the hero mounts |
| Headline reveal | load / scroll enter | `BUILD FOR THE BOLD` characters rise + rotate in on a stagger | ~600ms, stagger ~30ms, ease-out | **`SplitText`** in `bundleLibs` |
| Hero idle float | continuous | keyboard yaws a few degrees; ~8 loose keycaps orbit at varying depths | ~6s sine loop | `desktop-00.jpg` vs `desktop-hover.jpg` show different rotations and cap positions at the same scroll Y |
| Explode / reassemble | scroll scrub | ~14 caps lift along +Y in a staggered wave, exposing switches, then settle | scrub over ~1.5 viewports | `ScrollTrigger`; `desktop-01.jpg` → `desktop-02.jpg` |
| Camera pitch change | scroll scrub | view swings from ~35° top-down (hero) → near eye level (explode) → ~70° top-down (reassembled) | scrub | comparison of frames 00 / 01 / 02 |
| Marquee | continuous + scroll velocity | `CRAFTING JOYFUL EXPERIENCES` translates X; `desktop-04.jpg` and `desktop-05.jpg` catch it at different offsets | linear loop, velocity-coupled | `gsap`; two frames, two positions |
| Background word tile | scroll scrub | the `GOODWELL` navy-on-navy wall parallaxes slower than the keyboard | scrub | `desktop-05.jpg`, `desktop-06.jpg` |
| Keycap swatch swap | click chip | keyboard textures re-map live; chip gains pale-blue fill + ring | ~250ms cross-fade, ~150ms chip state | `desktop-06.jpg` shows one active + one hovered chip |
| Switch audio | tap speaker icon | plays the recorded switch sound | — | speaker glyphs in `mobile-02.jpg`; `counts.svg === 51` |
| CTA button build | scroll enter | pill scales up + fill saturates + label darkens | ~500ms, ease-out (back?) | `desktop-07.jpg` mid-tween vs `mobile-03.jpg` resolved |

## The 3D system
- **Six canvases, not one.** `counts.canvas === 6` on both desktop and mobile — the hero/explode stage, the keycap configurator, and the individual switch cards each own a canvas. Opposite architecture to Fizzi's single shared scene: heavier, but every module is independent and can be lazy-mounted.
- **A 3D loading screen buys the budget.** Six WebGL contexts plus a detailed keyboard model cannot appear instantly, so the site turns the wait into a branded keycap-press progress bar. Nothing of the real page paints until the scene is ready.
- **Camera pitch is the storytelling channel.** Fizzi and macbook-ui keep the camera fixed and move the object; Nimbus moves the *camera* — top-down for layout, eye-level for the explode so you look *into* the switch housings, back to top-down to close. Frames 00/01/02 are three distinct pitch angles on the same model.
- **Explode maps scroll to per-key `position.y` with a stagger.** `desktop-01.jpg` shows caps at ~6 different heights forming a pyramid centred on the caps furthest along in the stagger, with red switch stems and blue PCB standoffs exposed underneath.
- **Materials:** matte-white ABS caps with visible flat-shaded facets and no specular, against a brushed aluminium case with a soft anisotropic highlight, and one machined orange knob with a knurled band. The deliberately low-gloss caps are what let white type sit on top of the model and stay readable.
- **Text over a moving stage — the boldest of the four sites.** `desktop-00.jpg` puts a 96px headline *directly on top of* the keyboard with no scrim. It works because (a) the caps are matte and mid-value, (b) the type is pure `#fff`, and (c) it carries a hard offset drop-shadow instead of a blur — a poster technique, not a UI technique. Where value contrast cannot be guaranteed (the bento and switch cards), copy sits on a near-black card with a radial glow instead.
- **Mobile fallback: none.** canvas count stays 6 at 390×844 and `pageErrors` is empty on both viewports.

## Why it reads expensive
1. **The loader is designed.** A keycap-press `LOADING` bar in the same 3D engine as the product — the cost of the experience is turned into a brand beat.
2. **One accent colour in the whole stylesheet.** `rgb(1, 167, 225)`, count 1. Every other colour on screen is a rendered surface.
3. **Variable-font axes instead of extra weights.** All display type is `Roboto Flex` at weight **400**; the condensed-italic-heavy look comes from `wdth`/`slnt`. Six of seven declared faces stay `unloaded`.
4. **Hard offset drop-shadow on display type.** Not a soft UI blur — a screen-print offset, which is what lets white 96px type survive on top of a photo-real model.
5. **A 250px-tall marquee that says nothing product-related.** `CRAFTING JOYFUL EXPERIENCES` exists purely as rhythm between two product beats.
6. **Zero copy in the explode frame.** `desktop-01.jpg` has no heading, no caption, no CTA. The product gets a full screen alone.
7. **Sound as a spec.** Speaker icons on the switch cards — the one keyboard attribute that a screenshot cannot convey gets its own interaction.
8. **Configurator chips are real miniature renders**, not colour swatches, so the choice is legible before you click.
9. **The product name becomes the wallpaper.** `GOODWELL` tiled navy-on-navy behind the model — texture from typography, at ~4% contrast.

## Mobile adaptation
Measured at 390×844: scrollHeight 8254, 9.8 screens, same 11 sections, same 6 canvases, same 51 SVGs, same palette. Nothing removed.
- **Type steps down 1.6×:** h1 96 → 60px (lh 76.8 → 48, ratio tightens 0.80 → 0.80), h2 60 → 36px. Body and nav do not change at all (16px / 14px both viewports).
- **Hero unstacks the collision** (`mobile-00.jpg`): headline goes to the top on empty navy, the keyboard drops below it, and `TYPING REINVENTED` + CTA go beneath the model. Where desktop overlaps type and product, mobile separates them into three vertical bands — the overlap trick is explicitly not attempted at 390px.
- **Bento goes 1-up** (`mobile-01.jpg`) with the caption still bottom-left over the render; on the narrower card the white text now crosses a bright aluminium edge and partially loses contrast (`Full aluminum case.`, `Cross Platform.`). This is the failure mode of no-scrim type, and it shows up on mobile first.
- **Switch cards become the dominant beat** (`mobile-02.jpg`): full-width cards on `#4a0f0c` / `#4a1e08` grounds with the switch name in ~40px italic uppercase and the speaker glyph inline.
- **The CTA button resolves properly on mobile** (`mobile-03.jpg`): saturated cyan gradient, ~6px navy outline, navy italic label, ~85% viewport width.
- **Nav collapses to `BUY` pill + hamburger**, both scaled up ~1.6× and pinned top-right.

## Steal list

| Component | How to rebuild | Cost |
|---|---|---|
| Branded 3D loading screen | Mount a tiny R3F scene (7 keycap meshes) bound to a `useProgress()` value from `drei`; depress cap `floor(progress * 7)`. Gate the real page behind `progress === 100`. | M |
| Scroll-scrubbed explode view | Give each part a `restY` and `explodedY`; in a `ScrollTrigger({scrub:true})` set `part.position.y = lerp(rest, exploded, clamp(progress - i * 0.02))` for the stagger. Give the beat a full screen with no copy. | L |
| Camera-pitch storytelling | Keyframe `camera.position` + `lookAt` at 3 pitch angles across the timeline instead of moving the object. Top-down → eye-level → top-down reads as a documentary cut. | M |
| White display type straight on the model | `Roboto Flex` at weight 400 with `font-variation-settings: 'wdth' 75, 'slnt' -10`, uppercase, `line-height: .8`, plus a hard offset shadow (`text-shadow: 4px 4px 0 rgba(0,0,0,.35)`). Only ships if the model surface is matte and mid-value. | S |
| SplitText character reveal | `SplitText(el, {type:'chars'})` then `gsap.from(chars, {yPercent:120, rotate:6, stagger:.03, ease:'power3.out'})`. One line of setup, the entire "premium" first impression. | S |
| Live texture configurator with render chips | Six chips, each a pre-rendered thumbnail of that exact keycap set; click swaps the `map` on the full model with a ~250ms cross-fade. Active = pale fill + ring, hover = dark ring. | M |
| Velocity-coupled marquee band | ~250px light strip, ~180px italic type, logo mark between words, `x` driven by a continuous tween whose `timeScale` is modulated by `ScrollTrigger.getVelocity()`. | S |
| Product name as navy-on-navy wallpaper | Tile the current variant name at ~200px, ~4% contrast against the section ground, parallaxed slower than the model. Free texture, zero assets. | S |
| Sound-per-variant cards | One card per switch on its own tinted ground, isometric render, name in display type, speaker glyph that plays a short recorded sample on tap. | M |

## Screenshots
`assets/studies/nimbus-keyboards/` — `desktop-hero.jpg` (the keycap `LOADING` screen), `desktop-00.jpg` + `desktop-hover.jpg` (hero at two moments of the idle float), `desktop-01.jpg` (exploded switches, no copy), `desktop-02.jpg` (top-down reassembled), `desktop-03.jpg` (feature bento), `desktop-04.jpg` / `desktop-05.jpg` (marquee band + `GOODWELL` wall), `desktop-06.jpg` (keycap configurator chips), `desktop-07.jpg` (CTA mid-animation), `mobile-00.jpg` (hero unstacked), `mobile-01.jpg` (bento 1-up, contrast failure visible), `mobile-02.jpg` (switch sound cards), `mobile-03.jpg` (resolved CTA). `data.json` holds all measured values above.
