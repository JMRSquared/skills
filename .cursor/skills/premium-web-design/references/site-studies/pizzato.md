# Pizzato — https://pizzatoits.it/

**Captured:** 2026-08-14 · **Award:** Awwwards Site of the Day, 8 Jan 2024; built by ET Studio (verified via awwwards listing for `pizzato`).
**Stack (measured):** Nuxt — 10 hashed chunks under `pizzatoits.it/_nuxt/*.js`, **zero `<link rel=stylesheet>`** (CSS is fully JS-injected). Bundle sniff: `gsap`, `ScrollTrigger`, `lenis`, `video`. Third party: iubenda cookie solution (4 scripts). No analytics detected at capture time.
**Page length:** 5.6 screens desktop (scrollHeight **5 078px** @ 900px viewport) · 4.1 screens mobile · **Sections:** 5 `<section>` · **Canvas/video/img/svg:** **0 canvas** · **4 video** · **3 img** · 6 svg · 10 buttons

## Art direction in one line
A plumbing-supplies wholesaler rendered as a Swiss poster: exactly two colours — Klein blue `#184DC4` and cream `#F2F1E4` — one Druk word per section scrubbing horizontally across the screen, and every "3D product ring" is a pre-rendered video loop, not WebGL.

## First 3 seconds
`desktop-hero.jpg`: cream `#F2F1E4` field. Top-left a pill button, 1px blue stroke, radius 999, reading `Menu`. Top-right an identical pill reading `Contatti`. Between them, centred, two lines of 14.5px blue caps: `FORNITURE IDRAULICHE E TERMOSANITARIE. / ARREDOBAGNO.` — the company's entire category positioning, above the logo. A 1px blue rule runs the full width beneath the header.

Then `PIZZATO` in **Druk, ~165px cap-height, spanning 1 356 of 1 440px** — 94% of the viewport width, in `rgb(24, 77, 196)`. Below it, three bathroom photographs, all pushed into a **blue duotone** so they read as tinted plates rather than photos, at three different heights with the centre one dropped ~130px lower than its neighbours.

No headline sentence. No CTA. No scroll cue. The wordmark, the category line, and three tinted plates.

**Hover (`desktop-00.jpg`, same scroll position, cursor at centre):** the hovered photograph snaps from blue duotone to **full natural colour** (you can see the teal cabinet, the wicker basket, the white shelf), and a small blue pill follows the cursor reading `Click`. The custom cursor is the same pill component as the header buttons.

## Palette (measured)
| Role | Value | Where |
|---|---|---|
| Klein blue | `rgb(24, 77, 196)` `#184DC4` | **278 text elements + 17 backgrounds** — wordmarks, all copy, all rules, all pill strokes, the duotone tint |
| Cream | `rgb(242, 241, 228)` `#F2F1E4` | 74 text elements + 2 backgrounds — the page ground, and reversed type on blue |
| Black | `rgb(0, 0, 0)` | 46 text elements + 3 backgrounds — the iubenda cookie sheet only |
| White | `rgb(255, 255, 255)` | 22 elements — cookie sheet copy |
| Grey | `rgb(128, 128, 128)` | 9 elements — cookie sheet secondary |
| Scrims | `rgba(255,255,255,0.7)`, `rgba(255,255,255,0.2)`, `rgba(255,255,255,0.3)` | pill fills over moving type |

**Two brand colours. That is the entire system.** Every third value in the histogram belongs to the cookie banner, i.e. to code the studio did not write. The photographs are forced into the blue by duotone so that even the imagery cannot introduce a third hue — until you hover, at which point full colour becomes a *reward*.

## Typography (measured)
- **Display:** `Druk` @ 400 — 12 leaf nodes. Extreme-width grotesque, used only for the wordmark and the five section words (`ARREDOBAGNO`, `COMFORT AMBIENTE`, `TRATTAMENTO ACQUA`, `IMPIANTISTICA`). Set at a size where a single word exceeds the viewport width, e.g. `COMFORT AMBIENTE` spans well over 1 440px and is only ever seen in fragments (`MFORT`, `RT AMBIEN`).
- **Text:** `NeueMontreal-Regular` @ 400 — 92 leaf nodes, the entire remainder of the site.
  - body / footer `14.5px / 14.5px lh (1.00)`
  - h3 (marquee item) `16.9651px / 16.9651px lh (1.00)` — a non-integer size, i.e. fluid `vw`-based sizing, not a step scale
  - `Menu` button `19.5px`
  - the intro paragraph renders at roughly 52px across 6 lines (`desktop-01`)
- **Declared but unloaded:** `NeueMontreal-Bold`. **The site never uses a bold weight.** Emphasis is size and colour only.
- **Line-height is 1.00 on every measured node.**
- Mobile: body/footer `12.0513px`, h3 `14.1px`, `Menu` `12.0513px` — non-integer again; a single `clamp()`/`vw` expression drives all of it.

Ratio: Druk section word (≥165px) : intro paragraph (~52px) : body (14.5px) ≈ **11 : 3.6 : 1**.

## Structure, screen by screen
Every section shares one repeated chrome, and learning it is the point of this study:

```
──────────────────────────── 1px blue rule ────────────────────────────
Arredobagno              001                              Arredobagno
        [ giant Druk word scrubbing horizontally ]
        [ pinned pill label, vertical centre of viewport ]
        [ video: product parts rotating in a ring ]
```

| Frame | Scroll | What happens |
|---|---|---|
| `desktop-hero` / `desktop-00` | 0% | Header pills + category line + 1px rule. `PIZZATO` at 94% viewport width. Three duotone photographs at broken heights. Hover un-tints one and shows a `Click` cursor pill. |
| `desktop-01` | 24% | A **6-line, ~52px blue paragraph** — the only prose on the homepage — running to ~1 260px measure. Then the section chrome: rule, `Arredobagno` left / `001` centre / `Arredobagno` right, and the Druk word entering from the right (`O — AR`). A pill reading `Arredobagno` is pinned dead centre. |
| `desktop-02` | 30% | Same scroll band, word advanced to `ARRED` — the word scrubs horizontally as you scroll vertically. A **radial ring of ~14 translucent shower heads and mixer taps** in light blue floats behind the type. |
| `desktop-03` | 47% | Ring rotates and rises out of frame. Section `002 / Comfort Ambiente` begins; the pinned pill's text has swapped from `Arredobagno` to `Comfort Ambiente`. Word fragment reads `MFORT`. |
| `desktop-04` | 57% | `RT AMBIEN` fragment; new product ring — boiler/radiator-valve bodies, same translucent blue treatment, same radial arrangement. |
| `desktop-05` | 74% | `003 / Trattamento Acqua`. Ring of water-treatment cartridges. Fragment `O ACQU`. |
| `desktop-06` | 87% | `QUA — TR` — the word and its own repeat collide mid-viewport. New ring: filter housings + valves. |
| `desktop-07` | 100% | `004 / Impiantistica`, fragment `IMPIA`, ring of pipe fittings and press valves. |
| `mobile-03` | end | Footer: `RECAP` label, then `About / Showroom / Contatti` at ~44px, then `SERVIZI` label over the four service names. Same two colours. |

Four services, four identical section shells, four different product rings. **The template is the design.**

## Motion inventory
| # | Element | Motion | Evidence |
|---|---|---|---|
| 1 | Page scroll | Lenis smooth scroll — wheel capture advanced in uneven increments (0 → 835 → 1 028 → 1 604 → 1 961 → 2 531 → 2 985 → 3 541) and overshot to **103%** on the final step | `bundleLibs: lenis`; `data.json` desktop `pct` values |
| 2 | Section wordmark | Giant Druk word translates **horizontally** while the page scrolls vertically; `desktop-01` and `desktop-02` are 193px of scroll apart and show completely different fragments of the same word | two frames, same section |
| 3 | Product rings | ~14 translucent parts arranged radially, rotating and rising. **These are `<video>` elements, not canvas** — `counts.canvas: 0`, `counts.video: 4`, one loop per service | `data.json counts` |
| 4 | Pinned centre pill | A pill label stays fixed at the exact vertical centre of the viewport across `desktop-01`…`desktop-07` (y ≈ 446px in every frame) and **swaps its text at section boundaries** (`Arredobagno` → `Comfort Ambiente` → `Trattamento Acqua`) | 7 frames, identical y-coordinate, changing string |
| 5 | Custom cursor | The same pill component follows the pointer and prints `Click` when over an interactive photograph | `desktop-00` vs `desktop-hero` |
| 6 | Photo duotone → colour | Hovered image transitions from `#184DC4` duotone to full natural colour | `desktop-00` centre image vs `desktop-hero` |
| 7 | Side labels | The section name is printed three times per band (left / centre index / right) and holds position while the giant word passes behind it | all section frames |
| 8 | Loader | `document.body.textContent` begins `001 Home Loading` — a numbered loading state that shares the `001/002/003` counter language of the sections | `data.json body.text` |
| 9 | Scroll pinning | `ScrollTrigger` present; each section holds the viewport while its word scrubs | `bundleLibs`; frames |

## How it sells a LOCAL SERVICE
Pizzato is a **trade showroom + warehouse** — the closest analogue in this set to a garage or a supplier with a counter.

- **`Contatti` is pinned top-right in every one of the 8 desktop frames and both mobile frames.** It is one of only two header elements. There is no phone number, no address and no hours on the homepage — the entire conversion path is one word, always present.
- **CTA count on the homepage: 2** (`Menu`, `Contatti`) plus the footer `RECAP` block repeating `About / Showroom / Contatti`. So the contact CTA appears **3 times** in 5.6 screens, and one of those is permanent.
- **The trust work is quarantined on `/contact`** (fetched from page source, not from a frame):
  - Address `Via IV Novembre, 100 . 37057 . San Giovanni Lupatoto . Verona`
  - Phone `045 545063`, email `pizzatoits@pizzatoits.it`
  - **Two separate opening-hours tables** — `Orari Showroom` (Mon: *closed mornings*, 14.30–18.30; Tue–Fri 08.30–12.00 / 14.30–18.30; Sat 08.30–12.30) and `Orari Magazzino` (Mon–Fri 08.00–12.00 / 13.30–18.30; Sat 08.00–12.00)
  - A dedicated `Appuntamenti` section
  - This is the transferable move: **the art-directed homepage carries none of the operational detail, and the contact page carries all of it, including the awkward truth that the showroom is shut on Monday mornings.**
- **Credibility on the homepage is carried by product knowledge, not badges.** Four correctly-named service categories in the trade's own language (`Arredobagno`, `Comfort Ambiente`, `Trattamento Acqua`, `Impiantistica`), and rings of accurately-modelled real parts — press-fit valves, filter housings, mixer bodies. A plumber recognises the specific fittings. That *is* the trust signal.
- **The one paragraph of prose** (`desktop-01`) does the whole positioning job in six lines: *"…negli anni siamo diventati il punto di riferimento per privati e professionisti che cercano soluzioni personalizzate affidabili per l'ambiente domestico e aziendale."* Both audiences (consumers and trade) named in one sentence.
- **Craft failure worth recording:** the iubenda cookie sheet occupies **450×410px of the lower-right desktop viewport in all 8 frames**, and on mobile it covers the **entire lower half of every screen**. It is black-on-white with system-font copy — the only place on the site where a third colour, a third typeface and a rounded-rect UI appear. A Site of the Day build let a compliance widget dominate half the mobile experience. Style the consent layer, or you have art-directed 60% of a page.

## Why it reads expensive
1. **Two colours, enforced against the photography.** The duotone is not a mood filter — it exists so that images cannot break the palette. Colour is then spent as an interaction reward on hover.
2. **A single word at 94% viewport width, seen only in fragments.** You never read `COMFORT AMBIENTE` in full on desktop; you read `MFORT`, then `RT AMBIEN`. Confidence to make the headline unreadable.
3. **No bold weight exists.** `NeueMontreal-Bold` is declared and never loaded. Hierarchy is size, colour and space only.
4. **Non-integer type sizes** (16.9651px, 12.0513px) prove a single fluid expression drives the whole scale — nothing is hand-set per breakpoint.
5. **Zero canvas.** The "3D" is four pre-rendered video loops. It looks like a WebGL budget and costs four `.mp4`s. This is the single highest leverage idea in the whole reference set.
6. **The pill is one component used four ways** — header button, section label, pinned scroll indicator, and custom cursor. One shape, one stroke, four jobs.
7. **`001 / 002 / 003 / 004` counters** printed at the centre of each rule, matching the `001 Home Loading` loader. The numbering system is the navigation.
8. **Three images on the entire homepage.** Everything else is type, rule, and video.

## Mobile adaptation
- 4.1 screens vs 5.6 desktop — proportionally similar, so the concept survives rather than being replaced.
- The header pills are **dropped**; only the centred two-line category label and the 1px rule remain at the top (`mobile-00`). `Contatti` moves into the `Menu` drawer (`unverified` — drawer not opened).
- `PIZZATO` still spans ~94% of the 390px viewport. The wordmark's proportion is the constant across breakpoints, not its size.
- The three hero photographs become a **horizontally-scrolling row bleeding off the right edge** rather than a stacked column — the broken-height composition is preserved as a horizontal one.
- Section chrome survives intact: rule + `Trattamento Acqua` left / `003` centre / `Trattamento Acqua` right at 12.05px. It gets *tighter*, not simplified.
- The giant Druk word still overflows on both edges (`ENTO ACQ`, `RREDOBA`) — no shrink-to-fit.
- Product-ring videos remain full-width and are the dominant element of each mobile screen.
- Footer stacks to `RECAP` → `About / Showroom / Contatti` at ~44px → `SERVIZI` → four service names.
- **The cookie sheet covers ~55% of every mobile frame captured**, which is the mobile experience for any first-time visitor until they dismiss it.

## Steal list
| Component | How to rebuild | Cost |
|---|---|---|
| **Pre-rendered "3D" as video** | Model/borrow the products once, render a 6–10s rotating radial-ring loop per service to `.mp4`/`.webm`, ship as muted autoplay `<video>`. Four loops replaced an entire WebGL build. Works for tools, parts, instruments, dental kit. | **M** (asset), **S** (code) |
| **One pill component, four jobs** | `border: 1px solid var(--blue); border-radius: 999px; padding: .6em 1.4em` — use it as header button, section label, sticky scroll indicator, and custom cursor. Cursor = the same element following `pointermove`. | **S** |
| **Duotone → colour on hover** | `filter: url(#duotone)` or a `mix-blend-mode: multiply` blue overlay at rest; remove on hover with a 300ms transition. Locks your palette *and* creates the interaction reward. | **S** |
| **Two-colour lock** | Pick exactly two values. Force imagery into one of them. If a third colour appears, it is either a bug or a third-party widget. | **S** |
| **Section chrome band** | 1px rule + `label left / 00N centre / label right` at 12–15px. Repeat verbatim for every service. It is the cheapest possible way to make five sections read as one system. | **S** |
| **Category line above the logo** | Two lines of 14.5px caps stating literally what you sell, centred in the header above the wordmark. Replaces a tagline and doubles as SEO-honest copy. | **S** |
| **Pinned centre label that swaps text** | `position: fixed; top: 50%` pill; IntersectionObserver writes the entering section's name into it. Doubles as a table of contents that costs one element. | **S** |
| **Horizontally-scrubbing section word** | Giant `Druk`-class grotesque, `white-space: nowrap`, `font-size: ~11vw`, inside `overflow: clip`; `gsap.to(el, {x: -N, scrollTrigger: {scrub: true}})`. Let it exceed the viewport at every breakpoint. | **M** |
| **Numbered loader matching section counters** | Loading state prints `001 Home Loading`; sections then print `001…004`. One counter language from first paint to footer. | **S** |
| **Operational detail quarantine** | Homepage carries zero hours/address/phone. `/contact` carries two hours tables (showroom + warehouse), address, phone, email, and an appointments block. Ship the awkward truths (closed Monday mornings) — they read as honesty. | **S** |
| **Bold-free hierarchy** | Delete the bold weight from your build. Force yourself to differentiate with size, colour and whitespace. | **S** |
| **Styled consent layer** | Learn the *inverse* lesson: override your CMP's CSS to your two colours and your typeface, and cap it at ≤25% of the mobile viewport. Pizzato did not, and it is the one visibly cheap element on an SOTD site. | **S** |

## Screenshots
`assets/studies/pizzato/` — `desktop-hero.jpg` (all-duotone rest state), `desktop-00.jpg` (hover: colour reveal + `Click` cursor pill), `desktop-01.jpg` … `desktop-07.jpg`, `mobile-00.jpg` … `mobile-03.jpg`, `data.json`.
