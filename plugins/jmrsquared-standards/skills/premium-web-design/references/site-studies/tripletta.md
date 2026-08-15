# Tripletta — https://triplettapizza.com/

**Captured:** 2026-08-14 · **Award:** Awwwards-tier French pizzeria chain site (specific award listing `unverified`) · **Stack (measured):** Webflow (`tripletta.webflow.shared.b801c94e2.min.css`, `data-wf-page`) + a custom Netlify-hosted bundle (`https://tripletta.netlify.app//main.js`) + jQuery 3.5.1 + Stripe.js v3. Bundle sniff matched `gsap`, `ScrollTrigger`, `lenis`, `barba`, `swiper`, `r3f`. No canvas, no video element.
**Page length:** 7.0 screens desktop (scrollHeight 6304px @ 900px viewport); **10.7 screens mobile** · **Sections:** 8 · **Canvas/video/img/svg:** 0 canvas · 0 video · **137 img** · **206 svg** · 1 `<button>`

## Art direction in one line
A tattoo-flash pizzeria poster that repaints itself: one flame-haired mascot line drawing, city names set 100px tall, snapshot photography pinned to a visible grid — and a full brand palette that swaps out from section to section and from load to load.

## First 3 seconds
`desktop-00.jpg`: a full-viewport cream field. `TRIPLETTA` set in **Oswald 700 at 270px / line-height 324px**, uppercase, in a *low-contrast tint* of the section's accent — the wordmark is a background texture, not a headline. Centered on top of it, the mascot: a hand-inked woman with flame hair biting a pizza slice, drawn in a single dark stroke, ~500px tall, with no drop shadow or container. Bottom bar carries three text links (`Recrutement ›`, `Privatisation ›`) in Merriweather 300 and three social glyphs. Right side: a `MON RESTAURANT` sticker rendered as a die-cut with a real drop shadow, rotated ~2°. No photograph, no CTA button, no scroll indicator. The pitch is entirely the mark.

## Palette (measured)
This site does **not** have one palette. It has a rotating set, applied per section band. Three complete themes were captured in a single session:

| Theme | Ground | Field / tint | Accent (text + fills) | Frame evidence |
|---|---|---|---|---|
| **Green** (desktop load) | cream `rgb(254, 248, 221)` `#FEF8DD` | sage `rgb(189, 208, 160)` `#BDD0A0` | forest `rgb(0, 70, 50)` `#004632` | `desktop-00` … `desktop-05` |
| **Teal** | butter `rgb(255, 238, 178)` `#FFEEB2` | ice `rgb(206, 233, 235)` `#CEE9EB` | teal `rgb(0, 119, 125)` `#00777D` | `desktop-06`, `mobile-03` |
| **Orange** | butter `#FFEEB2` | butter | orange `rgb(255, 106, 0)` `#FF6A00` | `desktop-07`, `desktop-hover` |

Measured extremes: desktop probe reported `rgb(255, 106, 0)` on **2413** text elements over `rgb(255, 238, 178)` on **150** backgrounds; the mobile probe of the same URL reported teal `rgb(0, 119, 125)` and ice `rgb(206, 233, 235)`. Also present in the token set: pink `rgb(249, 206, 225)` `#F9CEE1`, red `rgb(180, 35, 24)` `#B42318` / `rgb(199, 54, 28)`, blue `rgb(49, 75, 152)` `#314B98`. That is **six-plus brand colors**, every one fully saturated, and every one used at full field strength on a background — not a 10% tint.

The discipline underneath the loudness: within any one band there are exactly **three** values — a light ground, a mid tint for the giant type, and one saturated accent doing all text and all fills. Contrast is never white-on-color; it is always saturated-on-light, so the accent reads as ink.

## Typography (measured)
- **Display + UI:** `Oswald` 700, uppercase, everywhere. h1 `270px / 324px lh (1.20) / normal ls`. h2 `100.8px / 110.88 lh`. h3 `43.2px / 51.84 lh`. Body/UI `14.4px / 17.28 lh`, weight 700, uppercase. 207 leaf nodes at weight 700, 90 at weight 300.
- **Text serif:** `Merriweather` 300 only (all four weights 300/400/700/900 declared and loaded, only 300 rendered) — nav links `20.016px / 24.02 lh`, body paragraphs `14.4px / 17.28 lh`. 10 leaf nodes. Merriweather 300 against Oswald 700 is a deliberate weight inversion: the *serif* is the light one.
- Letter-spacing is `normal` on every measured element. No tracking games at all — the condensed grotesk does the compression.
- Mobile pushes h1 **up**, not down: `270px → 300px`. The wordmark is sized to overflow the viewport on purpose at both breakpoints.

## Structure, screen by screen
| Frame | Screen | What happens |
|---|---|---|
| `desktop-00` | 0–1 | Mascot hero on cream, giant tinted wordmark behind it, `MON RESTAURANT` die-cut sticker right, link bar bottom. |
| `desktop-01` | 1–1.5 | **4-up photo strip, edge to edge, zero gutter** — scooter rear wheel, sneakers on a skateboard outside the shop, a girl laughing over a drink, two staff in branded sweatshirts. Different focal lengths, all handheld, all daylight or shop-light. Immediately below: a full-bleed forest-green band carrying a **horizontal marquee of city names** (`…SAILLES ● MONTROU…`) in Oswald 700 at ~130px, with a photographed burrata plate dropped *inline between two words* as if it were a glyph. |
| `desktop-01/02` | 1.5–2.5 | On the same green band: a 10-line manifesto in Oswald 700 sage, left-aligned, ragged right, filling 65% width. Right: the `MON RESTAURANT` sticker again, now inside a hand-drawn sunburst. |
| `desktop-02/03` | 2.5–3.5 | Merch block: left is a photo of two staff at the pass in branded sweats, framed by **visible 1px grid lines that extend past the image on all four sides**; right is a Merriweather paragraph + a single sage `LA BOUTIQUE` button (the site's only `<button>`). |
| `desktop-03/04` | 3.5–5 | **The signature block.** A 5-column × N-row 1px grid is drawn across the full viewport. `WALLOVE` is set across it at ~400px in the sage tint. Photographs — dough being folded, a woman under a canopy of raised coupes, a bowl of pasta, a delivery rider with a stack of boxes, a tattooed shoulder — are pinned at *different scales and different grid offsets*, each with a thin cream border and a slight shadow, several overlapping the giant letterforms. Nothing is aligned to a common baseline; everything is aligned to the grid. |
| `desktop-05` | 5–6 | Sage band: `LA VIE D'UN QUARTIER / AVEC SUPPLÉMENT D'ÂME` centered, Oswald 700 forest, ~64px, two lines. Sticker top-left, rotated. |
| `desktop-05/06` | 6–6.5 | Footer link row (`Recrutement`, `Fidélité`, `CGU/CGV`, `Contact`) in Merriweather 300 on the accent band, then a second **city-name marquee** — this time in the teal theme — with a photographed plate inline again. |
| `desktop-06/07` | 6.5–7 | The mascot hero **repeats at page end**, in whichever theme the cycle has reached. The page loops back to its own opening image. |

## Motion inventory
| # | Element | Motion | Evidence |
|---|---|---|---|
| 1 | Palette | Theme swaps between bands and between loads — desktop probe measured orange/butter, mobile probe measured teal/ice on the same URL; `desktop-05` (sage) → `desktop-06` (teal) → `desktop-07` (orange) within one scroll | `data.json` vs `mobileData` topTextColors/topBackgrounds; three frames |
| 2 | City-name band | Infinite horizontal marquee — text is clipped mid-word at both viewport edges in every frame (`SAILLES`/`MONTROU`, `ROUGE`/`RENNES`) and the clip position differs per frame | `desktop-01` vs `desktop-06` |
| 3 | Whole page | Lenis smooth scroll — wheel capture needed repeated stepped events; final step overshot backwards (reachedY 4701 → 3481) which is the signature of a scroll-linked loop or a snap-back | `bundleLibs: lenis`; `desktop` step array |
| 4 | Scroll-scrubbed collage | ScrollTrigger + GSAP; photos in the `WALLOVE` grid sit at different vertical offsets between frames 03/04, indicating per-item parallax speed | `bundleLibs`; `desktop-03` vs `desktop-04` |
| 5 | Mascot | Ink droplets float free above the mascot's flames and change position between frames — a looping particle/float animation on decorative SVG | `desktop-00` vs `desktop-hover` vs `desktop-06` droplet positions |
| 6 | Sticker | `MON RESTAURANT` die-cut is rotated a few degrees and carries a real offset shadow; it recolors with the theme | `desktop-00` (green) vs `desktop-hover` (orange) vs `desktop-06` (teal) |
| 7 | Carousel | Swiper matched in bundle — city/location slider `unverified` on the home route | `bundleLibs: swiper` |
| 8 | Page transitions | Barba matched in bundle — SPA route transition to `/boutique`, `/recrutement` | `bundleLibs: barba` |
| 9 | Checkout | Stripe.js v3 loaded on the home route — merch purchase happens in-site | `data.scripts` |

Recorded page errors (real, on the live site): `TypeError: Cannot read properties of null (reading 'cloneNode')`, `SyntaxError: Identifier 'track' has already been declared`, `TypeError: Cannot set properties of null (setting 'textContent')`. Award-winning does not mean error-free.

## Catalogue as a journey
Tripletta has **no menu list and no price anywhere on the home page**. The catalogue it presents is the *estate* — which city you can eat in — and it presents it as typography in motion.

- The list of locations is a **marquee of city names at 100–130px**, running horizontally across a saturated band, clipped at both edges so you never see the whole list at once. Reading it requires waiting, which turns a directory into a ticker.
- Between city names sits a **photographed dish used as a punctuation glyph** — a plate of burrata between `SAILLES` and `MONTROU`, a plate of gnocchi between `ROUGE` and `RENNES`. The food is scaled to cap-height. It is not a menu item; it is a comma.
- The marquee appears **twice**, in two different themes, at 1.5 screens and 6.5 screens — bookending the page.
- The one thing you can actually buy on-site (merch) gets the site's **only `<button>`**, one sage rectangle labelled `LA BOUTIQUE`, after a photo and a four-line paragraph. Everything else is a text link with a `›`.
- The `WALLOVE` collage does the work a product grid would do: **137 images and 206 SVGs** on one page, staged as a scroll-scrubbed wall rather than a gallery.

Transferable to a services list: set the service names at display scale in a marquee band; drop one photograph inline at cap-height between two names as the separator; repeat the band at two different points in two different themes; give the page exactly one button.

## Why it reads expensive
1. **The wordmark is used as a tint, not a headline.** `TRIPLETTA` at 270px sits in a low-contrast tint of the accent, behind the mascot. Treating your own brand name as background texture is a confidence signal no template makes.
2. **Photographs are pinned to a visible grid and deliberately misaligned within it.** The 1px rules extend past the images on all sides (`desktop-03`, `desktop-04`), so the grid reads as a drafting surface. Images sit at four different scales with no shared baseline.
3. **Full-saturation color as a field.** Forest `#004632`, teal `#00777D` and orange `#FF6A00` are used at 100% across whole viewport-width bands. Most sites tint an accent to 8% for a "section background"; this one commits.
4. **Zero-gutter photo strip.** The 4-up in `desktop-01` has no gaps, no rounded corners, no captions. It reads as a contact sheet.
5. **Snapshot photography, not food photography.** A scooter wheel, sneakers on a board, a laughing customer mid-drink, a tattoo. Only two frames in the whole page are of food, and both are overhead plate shots used as typographic glyphs. The brand sells the street, not the pizza.
6. **Serif at weight 300 against grotesk at 700.** Merriweather Light for body under Oswald Bold for everything else — an inversion of the usual "bold serif headline / light sans body".
7. **Letter-spacing left at `normal` on all measured elements.** No tracking tricks; the condensed face carries it.
8. **The mascot is a single-weight ink drawing with no container, no shadow, no gradient.** It could be screen-printed on a shirt tomorrow — and, per `desktop-01`/`mobile-01`, it already is.

## Mobile adaptation
390×844, **10.7 screens** vs 7.0 on desktop — the page gets 53% longer rather than dropping content. All 137 images and 206 SVGs survive.
- h1 goes **up**: `270px → 300px`, line-height `324 → 360`. The wordmark still overflows the viewport horizontally; the mascot still sits on top of it (`mobile-00`, `mobile-03`).
- h2 `100.8 → 48px`, h3 `43.2 → 20.8px`, body/nav `14.4 → 16px`. Only the display wordmark grows; every other level shrinks.
- The `WALLOVE` collage **degrades to a single-column stack** of full-width bordered photos separated by the same visible grid rules (`mobile-02`) — the grid survives, the collage does not.
- `LA BOUTIQUE` becomes a **full-width `SHOP ›` band** in the sage tint with a large right-arrow (`mobile-01`), sitting between two full-bleed photos. The site's one button becomes the site's one banner.
- The city marquee still runs at full display size, clipped (`VERSAIL…` in `mobile-01`).
- Footer links stack vertically, centered, still Merriweather 300 (`mobile-00`, `mobile-03`).
- The theme differs between the desktop and mobile probes of the same URL — mobile landed teal/ice, desktop landed green then orange.

## Steal list
| Component | How to rebuild | Cost |
|---|---|---|
| Rotating theme bands | Define 4–6 complete `{ground, tint, accent}` triples as CSS custom-property sets. Assign one per section via a `data-theme` attribute, cycling in order; optionally offset the starting index per page load. Only ever 3 values live at once. | **M** |
| Wordmark-as-tint | Brand name in the display face at 250–300px, absolutely positioned, `z-index` below content, colored with the section's *tint* not its accent. Let it overflow the viewport on both breakpoints. | **S** |
| Display marquee with inline photo glyph | `overflow: hidden` band + CSS `@keyframes translateX(-50%)` on a duplicated track; items are `<span>` names in the display face plus `<img>` plates sized `height: 1em; vertical-align: baseline`. Clip at both edges so the list is never fully visible. | **M** |
| Visible drafting grid | Absolutely-positioned 1px column and row rules spanning the full section, drawn *behind* content and extending past every image on all four sides. Photos are placed at grid offsets with `border: 6px solid var(--ground)`. | **M** |
| Scroll-scrubbed collage | Same grid; each `<img>` gets a ScrollTrigger with a different `scrub` speed and `y` range so items drift past the giant letterforms at different rates. Cap at ~8 photos per screen. | **L** |
| Zero-gutter photo strip | `display: grid; grid-template-columns: repeat(4, 1fr); gap: 0`, images `object-fit: cover`, no radius, no caption. Brief four *different* focal lengths (detail, wide, portrait, over-shoulder). | **S** |
| Weight-inverted type pair | Condensed grotesk at 700 uppercase for display **and** UI; a serif at **300** for body and nav. Letter-spacing `normal` throughout. (Oswald 700 / Merriweather 300 here; substitutes: Anton / Newsreader Light.) | **S** |
| Die-cut sticker element | A rotated (1–3°) PNG/SVG badge with a real offset shadow, recolored per theme, dropped at inconsistent positions across sections so it reads as physically applied. | **S** |
| One-button page | Every secondary action is a text link with a `›` glyph; exactly one filled button on the whole page, for the one thing the user can transact. On mobile it becomes a full-width band. | **S** |
| Bookended hero | Render the hero component again at the very bottom of the page in the next theme, so the scroll ends where it began in a different color. | **S** |

## Screenshots
`assets/studies/tripletta/` — `desktop-00` … `desktop-07`, `desktop-hover` (orange theme + mascot), `mobile-00` … `mobile-03`.
