# Amrit Palace — https://amritpalace.com/

**Captured:** 2026-08-14 · **Award:** Awwwards-tier restaurant site; footer credit "Made by Artemii Lebedev" (award listing unverified) · **Stack (measured):** Webflow (`amritpalace.webflow.shared.2bf50beab.min.css`, `data-wf-page`) + GSAP 3.11.3 + ScrollTrigger + Lenis 0.2.28 + SplitType + Splide 3.2.2 + Finsweet Attributes v2. Bundle sniff also matched `barba`, `video`.
**Page length:** 11.4 screens desktop (scrollHeight 10294px @ 900px viewport) · **Sections:** 9 `<section>` · **Canvas/video/img:** 1 canvas · 1 video · 69 img · 2 svg · 7 buttons

## Art direction in one line
A candlelit dining room shot at f/1.4 and printed on warm paper — near-black photography under a wide-tracked display serif, cut against a sand-colored editorial page, with one saturated saffron block reserved for the menu.

## First 3 seconds
`desktop-00.jpg`: full-bleed interior photograph of a long banquet table, candle flames as the only light source, exposed roughly 2 stops down so the wood and upholstery go to near-black. Over it, `FLAVORS / THAT STAY` in TT Ramillas Variable at **115.2px / weight 300 / line-height 92.16px (0.80) / letter-spacing −4.608px**, uppercase, colored `rgb(216, 203, 184)` — sand, not white, so it sits *inside* the photograph's warm range rather than punching a hole in it. Two 10px eyebrow labels flank the headline at its optical midline (`SERVING CENTRAL FLORIDA` left, `ESTABLISHED 1996` right), which converts a centered headline into a three-column masthead. Bottom-left, a 4-line body paragraph. Bottom-right, a Google review card (4.7/5, 3 576 reviews) on `rgb(216, 203, 184)` — the single light rectangle in the frame, so the eye lands on social proof last.

## Palette (measured)
| Role | Value | Where |
|---|---|---|
| Ink / page dark | `rgb(44, 44, 44)` `#2C2C2C` | 835 text elements; footer bg; button fills |
| Sand (primary light) | `rgb(216, 203, 184)` `#D8CBB8` | 290 text elements + 20 backgrounds; hero headline, page ground |
| Saffron accent | `rgb(212, 150, 83)` `#D49653` | 5 backgrounds only — menu panel, icon buttons, footer wordmark, star glyphs |
| Warm off-white | `rgb(223, 218, 213)` `#DFDAD5` | button label text on dark |
| Sand shade | `rgb(191, 180, 163)` `#BFB4A3` | 1 background — hover/pressed state |
| Scrims | `rgba(44, 44, 44, 0.4)`, `rgba(0, 0, 0, 0.55)` | photo overlays under hero + section titles |

Three colors carry the whole site. Saffron appears in exactly **5** background instances across 11 screens — it is a punctuation mark, never a field.

## Typography (measured)
- **Display:** `TT Ramillas Variable` (variable axis `200 900`, loaded), always weight **300**, always `text-transform: uppercase`.
  - h1 `115.2px / 92.16 lh (0.80) / −4.608 ls`
  - h2 `64.8px / 55.08 lh (0.85) / −2.592 ls`
  - h3 `50.4px / 45.36 lh (0.90) / −1.512 ls`
  - Ratio h1:h2:h3 = 1 : 0.5625 : 0.4375. Line-height tightens as size grows; tracking is a constant −4% of size.
- **Text:** `Satoshi` weights 500 (159 leaf nodes) and 700 (2). Body `14.4px / 14.4 lh (1.0) / −0.144 ls`. Nav links render at **10.368px** — genuinely tiny, which is what buys the display serif its scale contrast (11:1 between h1 and nav).
- `Bad Script` is loaded from Google Fonts (5 faces declared, 1 loaded) but appears in zero measured leaf nodes — a script accent used only in menu-page or hover contexts. `unverified` on desktop home.
- Only two families do all the work. Serif = voice; sans = information.

## Structure, screen by screen
| Frame | Screen | What happens |
|---|---|---|
| `desktop-00` | 0–1 | Hero: full-bleed photo, centered display headline, flanking eyebrows, body paragraph bottom-left, review card bottom-right. Nav bar is transparent over the photo. |
| `desktop-01` | ~1.5 | "THE SPIRIT OF INDIAN DINING" — same recipe, new photo (tandoori platter, top-cropped so the food fills the upper third and the copy sits in shadow). Bordered ghost button `About Us` on sand fill. Then the page splits into a two-column band. |
| `desktop-01/02` | 2–3 | **Signature Plates**: left column is a saffron `#D49653` panel with a stacked serif title + fork/knife icon, then a 5+ row menu list; right column is sand with a serif pitch and a dark `Reserve a Table` button. A full-bleed curry photograph occupies the top-right corner of the same band. |
| `desktop-02` | 3–4 | Catering: centered serif headline flanked by two micro-labels (`EXCEPTIONAL FOOD`, `ANYWHERE`), centered 4-line body, then a 3-up photo row — buffet brass, flame in a black kitchen, poori frying in oil. All three are different focal lengths and all three are dark. |
| `desktop-03` | 4–5 | Drinks: 50/50 split — left is a sand column with serif headline, body, `Open Menu` button, and a 6-row price list with 1px rules; right is a **full-height** cocktail photo (bartender pouring, ~1:1.2 portrait crop, subject on the right third). |
| `desktop-04` | 5–6 | Gift cards: sand ground, centered serif headline, then a floating fan of 5 gift-card sleeves photographed on a matching sand seamless with soft directional shadow — the product photo *is* the palette. |
| `desktop-05` | 6–7 | Copy + `Order Now` button, then "ROOTED IN EXPERIENCE" over a full-bleed interior shot with the headline top-left in sand. |
| `desktop-06` | 8–9 | "WHAT OUR GUESTS SAY" — review card repeats top-right; below, a horizontally-scrolling row of testimonial cards, each with star row, source tag (Yelp / Reddit / MapQuest), 3–4 line quote in the display serif at ~24px, and an `Author` micro-label at card bottom. Cards run off both edges of the viewport. |
| `desktop-07` | 10–11.4 | Footer on `#2C2C2C`: two address blocks, opening hours, phone numbers, newsletter placeholder, then four link columns, then a **full-viewport-width `AMRIT PALACE` wordmark in Satoshi 700, saffron**, then a 1-line legal bar. |

## Motion inventory
| # | Element | Motion | Evidence |
|---|---|---|---|
| 1 | Whole page | Lenis 0.2.28 smooth scroll (`cdn.jsdelivr.net/gh/studio-freight/lenis@0.2.28`) — wheel capture required 8 stepped wheel events per frame to advance | `data.json` scripts; capture behaviour |
| 2 | Display headlines | SplitType (`unpkg.com/split-type`) + GSAP — per-character/word reveal on ScrollTrigger enter | scripts list; headline is DOM text, not an image |
| 3 | Section pinning / scrub | ScrollTrigger 3.11.3 loaded and matched in bundle | scripts + `bundleLibs` |
| 4 | Hero video layer | 1 `<video>` element + `lazy-load-video@latest/custom-video.js` — hero background is a looping plate, screenshotted mid-frame | `counts.video: 1`; script list |
| 5 | Testimonial rail | Splide 3.2.2 carousel with cards bleeding past both viewport edges; auto-advance or drag | `splide.min.js` + `splide-core.min.css`; `desktop-06` shows partial cards clipped left and right |
| 6 | Nav active state | `Home` link flips from `#2C2C2C` to saffron on hover — the only color change in the nav | `desktop-hover.jpg` vs `desktop-00.jpg`, identical otherwise |
| 7 | Menu list filtering | Finsweet Attributes v2 (`@finsweet/attributes@2`) — list filter/sort on the menu items | script list |
| 8 | Footer wordmark | 1 `<canvas>` present; wordmark spans full width at footer entry | `counts.canvas: 1` (exact use `unverified`) |

## Catalogue as a journey
The menu is never a table. It is **broken into three separate appearances**, each staged differently and each ~1.5 screens apart:

1. **Signature Plates** (`desktop-01/02`) — 5 rows on a saffron panel. Each row = name (Satoshi 500, left) + price (right, same size, no leader dots) + a 2-line description below in the same weight but visually recessive because it wraps. Rows are separated by a 1px rule in a darker saffron. The panel is capped by a serif title block and floats over the dark band, so it reads as a physical menu card laid on the table, not a list on a page. It ends with a full-width `View Full Menu` dark button — the list is deliberately a *teaser* of 5, not the whole menu.
2. **Drinks** (`desktop-03`) — 6 rows, same row grammar (name / price / description) but now on sand with hairline rules and **no panel**, paired 50/50 against a full-height cocktail photograph. Changing the ground changes the register from "menu card" to "wine list".
3. **Catering** (`desktop-02`) — no list at all; three photographs instead. When the offer is a service rather than an item, the site drops rows entirely and sells with imagery + one paragraph.

Pacing: photo → list → photo → list → photo. The user never sees two lists in a row and never sees more than 6 rows at once. **This is the transferable pattern for a services list**: cap each block at 5–6 rows, give each block its own ground color, alternate it with a full-bleed image of different crop, and end each with a single button that opens the full set.

## Why it reads expensive
1. **Photography is underexposed on purpose.** Every interior/food shot sits 1.5–2 stops down with a single warm key light (candle, flame, pendant). Nothing is flat-lit. The `desktop-05` interior keeps detail in the brick and the mural while the ceiling goes to `#2C2C2C` — the same value as the site's ink color, so photograph and page share an edge.
2. **The headline color is sampled from the photo.** `#D8CBB8` is a mid-tone in the tablecloth/napkin range. A white headline would have read as an overlay; this reads as printed on the scene.
3. **Line-height under 1.0 on display type.** h1 at 0.80, h2 at 0.85. Setting a serif that tight requires uppercase + a variable weight-300 cut, and it is the single loudest signal that a typographer touched the page.
4. **Nav at 10.368px.** Almost no template ships nav that small. It creates an 11:1 size ratio against the h1 and makes the whole page feel like a printed program.
5. **Saffron is rationed to 5 uses.** One accent, five appearances, all functional (menu panel, two icon buttons, footer wordmark, star glyphs). No gradient, no tint scale, no "accent-100/500/900".
6. **Gift-card product shot matches the page ground.** The sleeves are photographed on a sand seamless identical to `#D8CBB8`, so the product floats with only its own shadow. The photo brief and the CSS variable are the same decision.
7. **Testimonial quotes are set in the display serif at ~24px, not in the sans.** Reviews get the same typographic respect as the brand headlines.
8. **Review card is repeated twice** (hero + testimonials) in identical form — a deliberate recurring object rather than a one-off badge.

## Mobile adaptation
390×844, 11.2 screens (`mobileData`), same 9 sections and same 69 images — nothing is dropped.
- h1 scales `115.2px → 62.4px` (0.54×); h2 `64.8 → 42.9`; h3 `50.4 → 35.1`. Line-height ratios hold (0.80 / 0.90 / 0.90).
- **The hero re-flows into a stack**: `FLAVORS` / `SERVING CENTRAL FLORIDA` / `THAT STAY` / `ESTABLISHED 1996`. The eyebrow labels move from flanking to *interleaved between the headline lines* — the three-column masthead becomes a four-beat vertical rhythm. Same content, restructured, not just wrapped.
- Nav collapses to a `Menu` word + 2-bar icon; the bar gains a translucent dark scrim (`mobile-01`, `mobile-02` show it as a solid band over both photo and sand grounds).
- **A persistent bottom action bar appears** (`mobile-00` through `mobile-03`, present at every scroll position): two saffron icon tiles — fork/knife `Menu` and cloche `Order Now ⌄`. On desktop these live in the top-right nav; on mobile they are pinned to the thumb zone. Buttons are 48×48 tiles with 14px labels.
- Catering headline splits `CATERING` / `EXCEPTIONAL FOOD` / `THE AMRIT WAY` — same interleave trick as the hero.
- Nav-link measured size drops to 4.68px because the desktop nav is transform-scaled off-canvas, not because it is rendered at that size — `unverified` as a real rendered value.

## Steal list
| Component | How to rebuild | Cost |
|---|---|---|
| Flanked masthead headline | CSS grid `1fr auto 1fr`; center cell holds the display headline, side cells hold 10px uppercase labels aligned to the headline's optical center via `align-self: center`. On mobile, change to a single column and reorder labels *between* headline lines with `order`. | **S** |
| Photo-sampled headline color | Pull a mid-tone hex from the hero image (here `#D8CBB8`), use it as both the headline color and the page's light ground token. One variable, two jobs. | **S** |
| Sub-1.0 line-height display serif | `font-variation-settings: 'wght' 300`, `text-transform: uppercase`, `line-height: 0.80`, `letter-spacing: -0.04em`. Requires a variable serif with a real light cut — Ramillas here; substitutes: Editorial New, PP Right Serif. | **S** |
| Rationed accent | Define exactly one accent token and cap its usage; here 5 background instances in 11 screens. Enforce by grepping the accent variable count before ship. | **S** |
| 5-row teaser list on a colored panel | Panel `background: var(--accent)`; rows `display:grid; grid-template-columns: 1fr auto` for name/price, description spans full width on row 2; `border-bottom: 1px solid` a darkened accent. Cap at 5 rows, close with a full-width dark button. | **M** |
| Alternating list/photo pacing | Section sequence: full-bleed photo → panel list → 3-up photo row → split list+photo → product-on-ground photo. Never two lists adjacent; each list gets a different ground color. | **M** |
| Persistent mobile action bar | `position: fixed; bottom: 0` bar with two 48px accent tiles (primary conversion + secondary), shown only under `max-width: 768px`; desktop keeps the same two actions in the nav's right cluster. | **M** |
| Edge-bleeding testimonial rail | Splide (or CSS `scroll-snap` + `overflow-x`) with the track wider than the container so cards clip at both viewport edges; each card = star row + source tag + quote set in the *display* serif + author micro-label pinned to card bottom. | **M** |
| Full-width footer wordmark | Brand name in the sans at weight 700, `font-size: clamp()` tuned so the string spans exactly 100vw minus gutter; accent color on the ink ground. | **S** |
| Product-on-ground shot | Brief the photographer with the site's light ground hex as the seamless backdrop; light for a single soft directional shadow. Removes all masking work and welds photo to page. | **L** (shoot cost, trivial build) |

## Screenshots
`assets/studies/amrit-palace/` — `desktop-00` … `desktop-07`, `desktop-hover`, `mobile-00` … `mobile-03`.
