# Planetoño — https://www.planetono.space/

**Captured:** 2026-08-14 · **Award:** Awwwards-tier concept site; self-described in the footer as "just a delicious concept **by TUBIK**" (specific award listing `unverified`) · **Stack (measured):** **Nuxt** (`/_nuxt/CJbJqNFW.js`, per-component CSS chunks `SectionHero`, `SectionProcess`, `SectionLocation`, `SectionContacts`, `Three`) + Vercel Analytics. Bundle sniff matched `three`, `webgl`, `shader`, `gsap`, `ScrollTrigger`, `SplitText`, `lenis`, `swiper`, **`rive`**.
**Page length:** 9.9 screens desktop (scrollHeight 8948px @ 900px viewport); 9.8 screens mobile · **Sections:** 4 `<section>` · **Canvas/video/img/svg:** **10 canvas** · 0 video · 24 img · 39 svg · 10 buttons

## Art direction in one line
A Saturday-morning cartoon rendered as toon-shaded 3D: pure flat fills, a hard black contour on every object, no soft shadow anywhere, staged on two saturated grounds (marigold, then tomato red) with a hand-lettered display face and Japanese kana as a secondary voice.

## First 3 seconds
An **audio gate**, not a hero. `mobile-00`/`mobile-01`: full-bleed tomato `rgb(235, 51, 34)`, the `PLANETOÑO` wordmark centered — cream fill, ~4px black contour, a hard black offset shadow, with the Ñ tilde as a floating 4-point star and `惑星ちゃん` in yellow beneath it. Bottom of screen: `Immersive sound ahead. Use headphones for best effect` + a headphone icon. A `START` button (cream fill, black stroke, hard offset shadow) fades in after the WebGL scenes preload — measured at **>14s** on a cold mobile load. Nothing renders until you click.

After the gate (`desktop-hero`, `desktop-00`): marigold ground. A purple isometric meal tray with burger/fries/donut/character, drawn in flat fills with black outlines, floats over a purple ellipse "shadow". Top-left, a comic starburst badge — white with a jagged black edge — carrying `銀河バイト / GALAXY BITE` in red. Right column: `BIGGER / THAN HUNGER. / SMALLER THAN / A PLANET` in **Futura Passata 700 at 60px / 60px line-height / −2.4px letter-spacing**, black on marigold, plus two 16px Poppins descriptions in a 2-column split. Below them, a **prev/arrow pair plus a progress bar with dots** — the hero is a carousel of meal sets, not a static shot.

## Palette (measured)
| Role | Value | Where |
|---|---|---|
| Tomato (primary ground) | `rgb(235, 51, 34)` `#EB3322` | Gate, and every section from "How it works" to the footer |
| Marigold (hero ground) | not in the CSS histogram — it is **painted inside the WebGL canvas**, sampled from `desktop-hero` as approx `#F6B21A` | Hero only |
| Cream (ink on color) | `rgb(247, 242, 229)` `#F7F2E5` | **1161** text elements — the dominant type color |
| Black (ink on light) | `rgb(0, 0, 0)` | 407 text elements + 3 backgrounds; every contour line |
| Purple | `rgb(119, 33, 199)` `#7721C7` | 1 background; hero tray + donut icing + character trousers |
| Yellow | sampled from frames (kana, star glyphs, "TUBIK" heart) | accents only |

Only **two** grounds carry the entire 10-screen page, and both are fully saturated. There is no neutral gray anywhere in the histogram — not one. Every 3D object is built from 3–5 flat fills plus a black contour; there is no gradient in the shading and no cast shadow on the ground plane.

## Typography (measured)
- **Display:** `Futura Passata` 700 — a heavy geometric with irregular baselines. h2 `60px / 60px lh (1.0) / −2.4px ls (−4%)`. Rendered with a **hard black offset shadow on cream fills** over the red sections (`GIFT IT TO A FRIEND`, `WHERE TO FIND US`, `HOW IT WORKS`) and as flat black on the marigold hero. 31 leaf nodes.
- **Text:** `Poppins` 400 / 500 / 700. Body `16px / 20px lh (1.25)`. Nav links `21px / 26.25 lh`, weight 700. 41 leaf nodes at 400, 21 at 500.
- The site's copy is deliberately mixed-case at the letterform level — the DOM text reads `BiGgerthan hunger.SMALler thanA plAnet` — so the display face renders with alternating cap heights. That bounce is written into the content, not into CSS.
- Japanese kana (`惑星ちゃん`, `銀河バイト`, `ハイパーホットドッグミール`) sits above every English display line as a smaller yellow or red secondary line. It is a texture layer, not a translation.
- Only two families. `Futura Passata` shouts, `Poppins` explains.

## Structure, screen by screen
| Frame | Screen | What happens |
|---|---|---|
| gate | — | Red field, wordmark, headphone warning, `START`. Scroll is locked until clicked. |
| `desktop-hero` / `desktop-00` | 0–1 | Marigold. Carousel of meal sets. Each slide = an isometric tray (color varies per slide: red, purple, blue), a comic starburst badge with kana + English name (`GALAXY BITE`, `HYPERDOG MEAL`, `PIZZANAUT SET`), a 4-line Futura Passata headline, a 2-column Poppins description, and arrow/dot controls. A chevron scroll cue sits at the bottom center. |
| `desktop-01` | 1–2 | **Ground flips marigold → tomato.** A pinned WebGL scene: a burger orbits over a ringed planet, fries float beside it, a cratered moon and cartoon stars fill the field. All background objects are painted in *darker tints of the same red* — the scene is monochrome-plus-hero-object. `HOW IT WORKS` in cream with black offset shadow, bottom-left; below it a **4-step pill stepper** where the active step expands into a labelled pill (`Size your fries`) and the inactive steps stay as numbered circles. |
| `desktop-03` | 3–4 | Same pinned camera, further along the scroll: the burger has descended, a donut has joined, and the camera is now looking into a cream take-out box that has risen from below. The stepper has advanced to `4 — Claim your toy`. |
| `desktop-04` | 4–5 | The box fills the lower half; the character (a helmeted cat/bear astronaut) walks along its rim. Same stepper. |
| `desktop-05` | 5–6 | The box closes and rotates away — pure red field below it. `GIFT IT TO A FRIEND / OR KEEP IT ALL TO / YOURSELF` centered in cream with black offset shadow, with a 16px Poppins line under it: `We won't judge 😏`. |
| `desktop-06` | 6–7 | `WHERE TO FIND US` + `May the coordinates be ever in your favor`. Below: **two full star charts** (northern + southern celestial hemispheres) drawn as cream line-work on red, with real constellation names, hour markers around a ratcheted rim, and the Milky Way as a translucent cream wash. Locations are **map pins containing a yellow 4-point star** dropped onto constellations. |
| `desktop-07` | 8–9.9 | Star charts scroll out. The Tubik dog logotype in cream. `WE TRIED MAKING THIS REAL. NASA SAID NO. / SO FOR NOW, IT'S JUST A DELICIOUS CONCEPT / BY TUBIK 💛` in Futura Passata cream, centered, ~3 lines. `© 2026`. |

## Motion inventory
| # | Element | Motion | Evidence |
|---|---|---|---|
| 1 | Entry | Audio gate — WebGL + audio preload behind a `START` button; scroll locked (`reachedY: 0` on every pre-gate step, `scrollHeight` reported 8948 but unreachable) | first capture pass `data.json` desktop array; `mobile-gate.jpg` |
| 2 | Hero carousel | Prev/next arrows + a segmented progress bar with dots; each slide swaps the tray color, the badge kana, the headline and the 2-col description | `desktop-hero` (GALAXY BITE, red tray) vs `desktop-00` (HYPERDOG MEAL, purple tray) vs `mobile-00` (PIZZANAUT SET, blue tray) |
| 3 | Ground transition | Marigold → tomato between screen 1 and 2, executed inside the canvas rather than as a CSS background swap | `desktop-hero` → `desktop-01`; marigold absent from the CSS color histogram |
| 4 | Pinned 3D scroll sequence | One continuous camera move from orbiting burger → descending into the box → box closing, held across ~4 screens with the `HOW IT WORKS` label pinned bottom-left throughout | `desktop-01`, `desktop-03`, `desktop-04`, `desktop-05` share label position, differ entirely in scene |
| 5 | Stepper | 4 numbered pills; the active one expands to reveal its label and the others collapse to circles, advancing with scroll progress | `desktop-01` (`2 Size your fries`) vs `desktop-03`/`04` (`4 Claim your toy`) |
| 6 | Headline reveal | GSAP + **SplitText** matched in bundle — per-character entrance on the Futura Passata lines | `bundleLibs: ['SplitText','gsap','ScrollTrigger']` |
| 7 | Smooth scroll | Lenis matched in bundle; wheel capture advanced in ~1000–1400px steps per settle | `bundleLibs: lenis`; `desktop` step array |
| 8 | Rive | `rive` matched in the bundle — a vector state-machine animation is loaded (likely the wordmark, the star glyphs, or the sound toggle) | `bundleLibs: rive`; exact target `unverified` |
| 9 | Custom cursor | A cream 4-point-star / triangle "play" cursor with a black contour replaces the system cursor over the canvas, and becomes a pointing hand over nav links | cursor visible at (735, 467) in `desktop-01`…`desktop-07`; hand + link underline in `desktop-hover` |
| 10 | Audio | `Sound on 🔊` toggle pinned top-right of the nav on every frame; a spatial audio bed runs the whole experience | nav in all desktop frames; gate copy |
| 11 | Idle float | Stars, sparkles and the character drift between frames at the same scroll position | sparkle positions differ across `desktop-03` / `desktop-04` |

## Catalogue as a journey
The menu is **three meal sets**, and the site refuses to show them as a list.

1. **Screen 0 is the whole catalogue** — a hero carousel where each of the three sets gets a full viewport. One set = one isometric tray + one comic starburst badge (kana over English) + one 4-line Futura Passata headline + two short Poppins descriptions in a 2-column split + arrow/dot controls. The user browses the entire product range without scrolling once. Measured slides: `GALAXY BITE` (red tray), `HYPERDOG MEAL` (purple tray), `PIZZANAUT SET` (blue tray).
2. **Each set is color-coded by its tray**, so the carousel reads as three products even in peripheral vision.
3. **The ordering flow is then dramatised as a 4-screen 3D sequence** rather than described. `HOW IT WORKS` steps 1–4 (`Size your fries` … `Claim your toy`) are not four cards; they are four positions in one continuous camera move that literally descends into the take-out box. The stepper is the only UI; the scene is the content.
4. **Locations are a star chart.** Instead of an address list or a Google Map embed, two celestial hemispheres with real constellation names carry map pins. Reading it is a game.
5. There is **no price and no cart** — this is a concept, and the site is honest about it in the footer.

Transferable to a services list: give each service a full-viewport carousel slide with its own accent color and its own hero object; render the *process* as one pinned scroll-scrubbed scene with a 4-step expanding-pill stepper rather than four feature cards; replace a locations table with an illustrated map whose pins are branded glyphs.

## Keeping a toon-3D scene legible behind copy
The measurable rules this site follows — the reason 60px black type survives on top of a live WebGL burger:

1. **Copy never overlaps the hero object.** In every frame the headline occupies a column the 3D object does not enter — right third on the hero, bottom-left corner during the pinned sequence, dead center only when the scene has cleared the lower half (`desktop-05`).
2. **Background objects are painted in tints of the ground.** The planets, moon, stars and rings in `desktop-01`/`desktop-03` are all darker or lighter reds. Only the hero food object carries out-of-palette color. The background therefore has near-zero luminance variance behind text.
3. **Every object has a hard black contour, and so does the type.** Cream text over red uses a hard black offset shadow (not a blur); the object outlines are the same black at a similar weight. Text and geometry belong to the same drawing.
4. **No soft shadows, no ambient occlusion, no specular.** Flat fills only. Nothing in the render competes with type for edge contrast.
5. **The camera is locked.** Scroll moves objects through a fixed frame; the horizon never tilts, so the copy's anchor points stay valid for the whole pinned sequence.
6. **Ground color changes once, at a section boundary** (marigold → tomato), and the text color changes with it (black → cream + shadow). One rule per ground.

## Mobile adaptation
390×844, 9.8 screens — the same 10 canvases, 24 images and 4 sections. Nothing is cut.
- The gate is unchanged; `START` still appears only after preload (>14s cold, measured).
- **Nav becomes a floating red pill** with a black stroke and hard offset shadow: wordmark left, sound toggle center, `MENU` button right. It is fixed at every scroll position (`mobile-00` … `mobile-04`).
- The hero **restacks vertically**: tray + starburst badge on top, headline below, then the arrow/progress controls pinned near the bottom edge — thumb-reachable.
- The pinned 3D sequence keeps the same camera language; `HOW IT WORKS` + the 4-pill stepper move to the bottom of the viewport, in the thumb zone (`mobile-02`).
- The two star charts stack to one per screen (`mobile-04`), keeping full constellation labelling.
- Desktop's inline `Contact` / `Sound on` nav items collapse into the `MENU` button.
- Type holds at h2 60px on both breakpoints — the display face is not scaled down.

## Steal list
| Component | How to rebuild | Cost |
|---|---|---|
| Audio gate as the loader | Full-bleed brand color + wordmark + a one-line headphone notice; reveal a single `START` button only after WebGL/audio assets resolve; lock `body` scroll until click. Turns a 14s load into an invitation. | **S** |
| Toon shader kit | Flat `MeshBasicMaterial` fills + an inverted-hull black outline pass. No lights, no shadows, no env map. Cheap to render and it never fights type. | **M** |
| Ground-tinted background objects | Author every non-hero prop in 2–3 tints of the section's ground color; reserve out-of-palette color for the single hero object. Keeps luminance behind copy near-flat. | **S** |
| Hard-offset text shadow | `text-shadow: 4px 4px 0 #000` on cream display type over saturated color, matched to the outline weight of the 3D objects. No blur radius, ever. | **S** |
| Product carousel as the whole hero | One full-viewport slide per product: hero object + comic starburst badge + display headline + 2-column short description + arrow/dot controls. Color-code each slide by its object. | **M** |
| Comic starburst badge | Jagged-edge SVG polygon, white fill, black stroke; secondary-script line small on top, product name large below in the accent color. Rotate 1–3°. | **S** |
| Expanding-pill stepper | N numbered circles; the active one animates `width` to reveal its label while the rest collapse. Drive `activeIndex` from the pinned section's ScrollTrigger progress. | **M** |
| Pinned scroll-scrubbed camera | One `ScrollTrigger` with `pin: true` and `scrub`, mapping progress to a single camera/object timeline held across ~4 screens. One label element stays pinned in a corner the geometry never enters. | **L** |
| Illustrated locations map | Replace the map embed with a branded illustration (star chart here) and drop branded pin glyphs on it. Line-work in the ink color on the ground color. | **M** |
| Secondary-script texture line | A short line in a second script (kana here) above every display headline, in an accent color at ~25% of the headline size. Adds density without adding words. | **S** |
| Custom cursor | Replace the system cursor over the canvas with an SVG that shares the scene's outline weight and fill; swap to a pointing-hand variant over links. | **S** |
| Honest footer | State what the thing actually is in the display face — here, that it is a concept and NASA said no. Reads as confidence, not a disclaimer. | **S** |

## Screenshots
`assets/studies/planetono/` — `desktop-hero` (GALAXY BITE slide), `desktop-00` (HYPERDOG MEAL slide), `desktop-01`, `desktop-03` … `desktop-07`, `desktop-hover` (custom cursor + nav underline), `mobile-gate`, `mobile-00` (PIZZANAUT slide) … `mobile-04`.
