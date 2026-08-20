# Hagi's Barber Shop — https://hagisbarbershop.de/

**Captured:** 2026-08-14 · **Award:** Awwwards Site of the Day + Developer Award, 7 Oct 2021 (verified via awwwards listing for `hagisbarbershop`). Footer credit in-frame: `WEBSITE BY NUMBERED STUDIO`, `© 2026 HAGI'S`.
**Stack (measured):** WordPress. Assets served from a second origin, `hagisbarbering.com/wp-content/themes/hagis/` — exactly **two JS files** (`library/js/vendor.js`, `library/js/main.js`) and **one CSS file** (`library/css/style.css`). Plus `player.vimeo.com/api/player.js`. Runtime globals detected: `gsap`, `Swiper`, `Splitting/SplitText`. Bundle sniff also matched `three` and `webgl` — but `counts.canvas: 0`, so **no WebGL renders on the homepage**; treat three.js as shipped-and-unused (`unverified` elsewhere).
**Page length:** 4.7 screens desktop (scrollHeight **4 256px** @ 900px viewport) · 2.6 screens mobile · **Sections:** 6 `<section>` · **Canvas/video/img/svg:** 0 canvas · **1 video** (Vimeo `526251916`) · 14 img · 7 svg · **4 buttons**

## Art direction in one line
A high-fashion editorial masthead applied to a two-branch German barbershop: one ultra-contrasty didone serif on `#F5F5F0` bone, one 11px sans for everything functional, and a hand-signature logotype — the whole homepage is six sections and fourteen images.

## First 3 seconds
`desktop-hero.jpg`: bone-white field, absolutely empty for the first 300px. Top-left, a **hand-drawn signature logotype** ("Hagi's") in near-black, ~60px tall, angled ~8°. Centre-top, six nav links at **11px / uppercase / GT sans / letter-spacing normal / line-height 17.6px**. Top-right, three words with no separators: `BOOKING  ALTSTADT  STADTMITTE` — `BOOKING` set in grey as a label, the two branch names in near-black as the actual links. Dead centre of the viewport, four lines of **Roxborough-light at 65px / line-height 65px (1.00) / uppercase**, centred, `rgb(21, 21, 21)`: `AN / ODYSSEY / TO BEDOUIN / HERITAGE`. Directly under it, one solid `#151515` rectangle, ~224×43px, containing `SUBSCRIBE NOW` at ~13px.

Nothing else. No photograph, no video, no scroll cue. Type contrast headline:nav = **65 : 11 = 5.9 : 1**.

Then (`desktop-00.jpg`, same scroll position, ~1s later) a **300×130px video panel fades in behind the headline** — a warm, low-lit interior clip — so the serif goes from black-on-bone to cream-on-video mid-letterform, and the same glyphs are read in two colours at once.

## Palette (measured)
| Role | Value | Where |
|---|---|---|
| Ink | `rgb(21, 21, 21)` `#151515` | 87 text elements + **6 backgrounds** — headline, CTA fill, the inverted bands |
| Cream | `rgb(255, 253, 237)` `#FFFDED` | 67 text elements — all type on the dark bands. **Not white** — 2 points warm |
| Bone (page) | `rgb(245, 245, 240)` `#F5F5F0` | 3 backgrounds — the default ground |
| Pure black | `rgb(0, 0, 0)` | 36 text elements + 3 backgrounds — video letterbox and full-bleed sections |
| Footer ink | `rgb(41, 42, 40)` `#292A28` | 19 elements — footer copy, one step softer than the headline ink |
| Video-overlay white | `rgba(255, 255, 255, 0.745)` | 16 elements — player controls over the film |
| Hairline grey | `rgb(79, 79, 79)` | 2 elements — inactive/hover nav |

Seven values, four of which are near-neutrals within 20 units of each other. **The only saturated colour in the entire homepage is a small yellow sticker** that rides on top of the film section (visible in `desktop-05`/`desktop-06`) — it is the site's single accent and it is a raster asset, not a CSS colour.

## Typography (measured)
- **Display / everything voiced:** `Roxborough-light` @ weight 300 — a high-contrast didone. **It is also the `body` font-family**, which is unusual and is the reason the whole page feels like a magazine rather than a website.
  - h1 `65px / 65px lh (1.00) / uppercase / #151515`
  - h2 `150px / 150px lh (1.00) / sentence case / #FFFDED` — used for the marquee band and the film title
  - footer copy `14px / 14px lh (1.00) / uppercase / #292A28`
- **Functional / sans:** `GT` @ 400, 24 leaf nodes, `11px / 17.6px lh / uppercase`. Nav, footer links, legal.
- **Declared but never loaded:** `Roxborough-thin` (100) and `GT-condensed` — both `status: unloaded`. They ship the weights and use only two.
- **Ratio:** h2 : h1 : nav = 150 : 65 : 11 = **13.6 : 5.9 : 1**.
- **Line-height is 1.00 everywhere** — display, headline, footer. There is no leading system; there is only size.
- Mobile: h1 `33.28px / 35.2768px (1.06)`, h2 `40.625px / 40.625px`, **nav `20.8px / 46.8px`** — the nav goes from 11px to 20.8px because it moves into a full-screen drawer.

Rule extracted: **serif for voice, at 1.00 leading, uppercase, centred; sans at 11px for everything you must be able to click.** Only two families, and the split is voice-vs-function, not heading-vs-body.

## Structure, screen by screen
| Frame | Scroll | What happens |
|---|---|---|
| `desktop-hero` / `desktop-00` | 0% | Empty bone field, signature logotype, 6-item nav, branch-split booking, centred 4-line 65px serif headline, one black `SUBSCRIBE NOW` block. A 300×130 video panel fades in behind the type. |
| `desktop-01` | 14% | Headline scrolls up **behind the fixed nav** (no scrim, letters pass under the links). Below it the page cuts to `#151515` and a **marquee band** begins: `SELF-CARE AS IDENTITY. RITUAL AS EXPRESSION.` in 150px cream Roxborough, two lines, running horizontally off both edges. |
| `desktop-02` | 29% | Marquee still moving (text position differs from `01` at the same scroll delta — proof of independent horizontal motion). A **portrait photograph of the shopfront** (brick, cobbles, gas lamp, `HAGI'S BARBER SHOP` gold signage, and a chalk A-board reading `WELCOME TO THE HOUSE OF HANDSOME`) sits centred, ~540×620px, overlapping the marquee's baseline. |
| `desktop-03` | 43% | Three photographs, three different scales, **no grid**: shopfront (top-centre, now partly out of frame), a styled portrait of the master barber with a client in a leather chair (left, ~420×560), and a wide interior of the shop floor with 4 chairs, pendant lamps and 6 staff (right, ~480×620, bleeding off the right edge). All on `#151515`. |
| `desktop-04` | 57% | The collage clears upward, leaving ~450px of pure black — an intentional empty beat — before the next section arrives. |
| `desktop-05` | 71% | **Full-bleed Vimeo film** (`526251916`), a desk of Phaidon books, Condé Nast College material and shop flyers. Overlaid centred: `Designing Hagi's™` in ~150px cream serif with `Play the Film` beneath at ~40px. Type sits directly on the footage at ~35% opacity until hover (`unverified` on the exact hover value). |
| `desktop-06` | 86% | Film section ends; bone returns. Centred: `Next` in ~34px serif, then `ABOUT US` at ~150px. A single-link pagination to the next page, styled bigger than any CTA on the site. |
| `desktop-07` | 100% | Footer on bone. Left: a 4-line 26px serif consent sentence, then an inline form — bordered email field ~240×48 with an `OK` button welded to its right edge, sharing one 1px border. Right: three link columns (6 site links / Instagram+YouTube / Impressum & Datenschutz). Bottom rule: `© 2026 HAGI'S. ALL RIGHTS RESERVED.` left, `WEBSITE BY NUMBERED STUDIO` right. |

Ground rhythm: bone → **ink** → ink → ink → **black film** → bone → bone. One long dark passage in the middle, bookended by light.

## Motion inventory
| # | Element | Motion | Evidence |
|---|---|---|---|
| 1 | Hero video reveal | A 300×130 video panel fades in *behind* the headline at scroll 0, after ~1s | `desktop-hero` (no panel) vs `desktop-00` (panel present, identical scroll) |
| 2 | Marquee band | `SELF-CARE AS IDENTITY. RITUAL AS EXPRESSION.` translates horizontally, independent of scroll — string offset differs between `desktop-01` and `desktop-02` | two frames, ~480px scroll apart, different glyph positions |
| 3 | Headline split reveal | `Splitting`/`SplitText` global present; h1 markup in source repeats as `An / Odyssey / to Bedouin / Heritage` — pre-split into 4 line spans | `data.json libs.splitting: true`; h1 `textContent` shows the string twice (plain + split copy) |
| 4 | Scroll-through nav | Headline glyphs pass *under* the fixed nav links with no background plate — nav stays legible only because it is 11px and the serif is thin | `desktop-01`, `desktop-02` |
| 5 | Collage parallax | The three photographs in `desktop-03` move at different rates — by `desktop-04` the shopfront has fully exited while the interior shot is still mid-frame | `desktop-03` → `desktop-04` |
| 6 | Film section | Vimeo player embedded full-bleed with custom `PausePlay` control at `rgba(255,255,255,0.745)`; title/CTA composited over live footage | `counts.video: 1`; `player.vimeo.com/api/player.js`; button computed style |
| 7 | Nav hover | `SHOP` shifts from `#151515` to grey `rgb(79,79,79)` on hover; no underline, no movement | `desktop-hover.jpg` vs `desktop-hero.jpg` — only that one word differs |
| 8 | Carousel | `Swiper` global present; not exercised on the homepage (`unverified` which section uses it) | `libs.swiper: true` |
| 9 | Sticky logotype | Signature logotype and nav remain fixed at y=0 through 100% of the page | all 8 desktop frames |

## How it sells a LOCAL SERVICE
This is the reference build for **"cinematic brand site that still books appointments."**

- **Booking is permanently in the top-right and it is branch-split.** The header reads `BOOKING · ALTSTADT · STADTMITTE` — the word `BOOKING` is a grey *label*, and the two clickable items are the two shop locations. Both point at `booking.termin2go.com` (a third-party German appointment SaaS, found in page source). The user picks a branch before they pick a time, which is the correct first question for a two-location service.
- **CTA appears on every one of 8 desktop frames** because the header never unpins. The hero's own black CTA block is *not* booking — it is `SUBSCRIBE NOW`. They deliberately refuse to duplicate booking into the hero, because booking already lives 40px away and never leaves.
- **Total buttons on the page: 4.** Compare with a conventional trade site (Plomberie ships 33). Restraint is possible because the persistent header does all the work.
- **Trust is built with four devices, none of them a badge:**
  1. *Faces.* The master barber (red beret, white beard, apron, tattoos) appears twice — once in a styled portrait with a laughing client, once working the floor. You know who will cut your hair.
  2. *Premises.* A full portrait of the actual shopfront with its street, its cobbles, its gas lamp and its hand-chalked A-board. Location proof without a map.
  3. *Team scale.* The interior shot shows 4 chairs and 6 staff working simultaneously — capacity, communicated visually.
  4. *Press-adjacency.* The film section is a desk of Phaidon books and Condé Nast College material — the shop is positioned inside design culture, not below it.
- **What is deliberately absent:** no prices, no star ratings, no review carousel, no opening hours on the homepage. Those live behind `TREATMENTS` and `LOCATIONS`. The homepage's only job is *taste + branch choice*.
- **How it survives the art direction:** the functional layer is set at 11px in a neutral sans and never grows, so it reads as a magazine's masthead rather than as a nav bar. The art direction owns 100% of the visual field; the conversion path owns ~1% of it and is still always visible.

## Why it reads expensive
1. **A didone at 65px, weight 300, on bone with 1.00 leading.** High-contrast serifs at light weights are the single most expensive-looking type move available, and it works here because the ground is `#F5F5F0`, not white — hairline strokes survive.
2. **Cream `#FFFDED`, never white.** Every reversed word on the dark bands is warm. Pure white would read as a UI; this reads as ink on stock.
3. **A 450px empty black beat** between the collage and the film (`desktop-04`). Paying an entire half-screen for nothing.
4. **Non-grid photo collage at three different scales, with edge bleed.** No two images share a width, a top edge, or an aspect ratio.
5. **The pagination `Next / ABOUT US` is set at ~150px — larger than any CTA.** They spend the biggest type on the next chapter, not on the sell.
6. **Fourteen images total.** Not fourteen per section. Fourteen. Every one earns its place.
7. **The email field and its `OK` button share a single 1px border**, welded into one rectangle. A two-second detail that separates hand-built from plugin.
8. **A signature logotype, drawn once, used at exactly one size**, never scaled, never given a hover.

## Mobile adaptation
- 2.6 screens vs 4.7 on desktop — the mobile build is **shorter**, not just narrower. Sections are compressed rather than re-stacked.
- Nav collapses to a hamburger (top-left) with the signature logotype centred; nav links jump **11px → 20.8px / 46.8px line-height** in the drawer, and `BOOKING ALTSTADT STADTMITTE` presumably moves into that drawer (`unverified` — drawer not opened during capture).
- h1 `65px → 33.28px` (0.51×), h2 `150px → 40.625px` (0.27×). The display type takes the bigger cut because the marquee needs to still read as a marquee inside 390px.
- The marquee **keeps its overflow** on mobile: `mobile-00` shows `AL AS EXPRESS…` / `RESSION. SELF-` clipped at both edges. They did not shrink the text to fit — the clipping is the effect.
- Hero CTA goes from a 224px inline block to a **full-bleed 466×100px black bar** with 24px type. The one CTA that exists gets a thumb-sized target.
- The 3-photo collage restacks as **overlapping half-width cards** (`mobile-01`): shopfront right-aligned, barber portrait bleeding off the *left* edge, interior shot bleeding off the right. Asymmetry preserved.
- Footer inverts to a single column: 26px consent sentence → full-width email field with `OK` welded right → 2-column link list → credits. Field height ~110px.

## Steal list
| Component | How to rebuild | Cost |
|---|---|---|
| **Branch-split booking in the header** | `<span class="label">BOOKING</span>` in grey + one link per location in ink, no separators, `position: fixed` top-right, 11px uppercase. Point each at your booking SaaS with the branch pre-selected. Solves multi-location routing in one line of chrome. | **S** |
| **Voice/function type split** | One high-contrast serif at weight 300 for *everything voiced* (including `body`), one neutral sans locked at 11px uppercase for *everything clickable*. Never let the sans exceed 11px on desktop. | **S** |
| **Cream, not white** | Set reversed text to `#FFFDED` and the light ground to `#F5F5F0`. Two-line change; removes the "web app" tell instantly. | **S** |
| **Welded input + button** | Wrap field and button in one `display: flex` box with a single `1px solid` border; give the button a left border only. ~10 lines of CSS. | **S** |
| **Oversized `Next →` pagination** | End every page with `Next` at ~34px over the destination name at ~150px, centred, on the light ground. Turns a nav link into a section. | **S** |
| **The empty beat** | One section with `min-height: 50vh; background: #151515;` and no content, placed between your photo collage and your video. Resist filling it. | **S** |
| **Nav-hover = colour only** | `#151515 → #4F4F4F` on hover. No underline, no transform, no transition beyond ~150ms. | **S** |
| **Overflowing marquee band** | 150px cream serif on `#151515`, two rows, duplicated string, `transform: translateX()` on a linear loop, `overflow: hidden` on the band. Keep it clipping on mobile — do not shrink to fit. | **M** |
| **Non-grid photo collage** | 3 images, 3 different widths (e.g. 420 / 480 / 540), 3 different aspect ratios, absolute-positioned with two of them bleeding past a viewport edge, each on its own parallax rate. | **M** |
| **Hero video behind the headline** | A small (~300×130) muted loop, `position: absolute`, `z-index` *below* the h1, fading in ~1s after paint. The headline reads black-on-bone and cream-on-video simultaneously. | **M** |
| **Full-bleed film with composited title** | Vimeo (or `<video>`) at 100vw/100vh, title in ~150px serif + `Play the Film` at ~40px centred on top, custom `PausePlay` control at `rgba(255,255,255,0.745)`. | **M** |
| **Six-section homepage** | Hard constraint: 6 `<section>`, 14 images, 4 buttons, 1 video, ~4.7 screens. Budget the page before designing it. | **L** (discipline, not code) |

## Screenshots
`assets/studies/hagis-barbershop/` — `desktop-hero.jpg` (headline before video), `desktop-00.jpg` (video panel revealed), `desktop-01.jpg` … `desktop-07.jpg`, `desktop-hover.jpg` (nav hover on `SHOP`), `mobile-00.jpg` … `mobile-03.jpg`, `data.json`.
