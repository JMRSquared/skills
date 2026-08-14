# Blind Barber 13 Year Anniversary — https://anniversary.blindbarber.com/

**Captured:** 2026-08-14 · **Award:** Awwwards Site of the Day + Developer Award, 15 Oct 2020, for the *10-Year* edition of this same subdomain by Mouthwash Studio (award listing verified via awwwards search; the build captured here reads "13 Years" and its own award status is `unverified`). Footer credit in-frame: `WEBSITE BY MOUTHWASH STUDIO + HERSON RODRIGUEZ`, `BROUGHT TO YOU BY DYSON`.
**Stack (measured):** hand-rolled single bundle — `assets/js/main.1b4530c32ed6b1dc3545.js` + `assets/css/main.8eb774bff16245b615e5.css`. Bundle sniff: `gsap`, `ScrollTrigger`, `swiper`, `video`. No framework, no `#__next`, no Webflow attributes. GA + GTM only. Zero `window.gsap` global (fully bundled/scoped).
**Page length:** 162.1 screens desktop (scrollHeight **145 866px** @ 900px viewport) · 112 screens mobile · **Sections:** 73 `<section>` · **Canvas/video/img/svg:** 1 canvas · **26 video** · **251 img** · 1 svg · 18 buttons

## Art direction in one line
A 13-year photo archive printed on newsprint-grey `#F1F1F1`, where the only graphic device is the year itself set at 902px — the entire site is one typeface, one grey, one black, and 251 real photographs of a barbershop that also runs a bar.

## First 3 seconds
`desktop-hero.jpg`: no loader, no video, no gradient. A flat `#F1F1F1` field with **12 photographs scattered at unequal sizes** (smallest ~128×88px bottom-left, largest ~130×195px), none aligned to a shared grid, several bleeding off the left and right edges. Centred over them, `Celebrating 13 Years / With Blind Barber` in MonumentGrotesk 500 at roughly 120px across two lines, `rgb(20, 20, 20)`. Top-left `BLIND BARBER 13 YEAR ANNIVERSARY` at **11.25px / weight 500 / letter-spacing 0.225px / uppercase**; top-right a single word, `BB LIVE`. Bottom-left, a 3-line 11px paragraph: *"BLIND BARBER WAS FOUNDED IN 2010. TO CELEBRATE 13 YEARS, WE'RE TAKING A LOOK AT THE LAST DECADE THROUGH LOVE, OPENINGS, CELEBRATIONS AND EVERYTHING IN BETWEEN."* Dead centre bottom, a bare chevron. The photographs are the loader — you are looking at the archive before you have read a word.

Type contrast at first paint: headline ≈ 120px against 11.25px nav = **10.6:1**.

## Palette (measured)
| Role | Value | Where |
|---|---|---|
| Ink | `rgb(20, 20, 20)` `#141414` | 1804 text elements + 26 backgrounds — headlines, body, the inverted dark sections |
| Pure black | `rgb(0, 0, 0)` `#000000` | 494 text elements |
| Paper | `rgb(241, 241, 241)` `#F1F1F1` | 66 backgrounds + 111 text elements (the reverse, on dark sections) |
| Soft ink | `rgb(40, 40, 40)` `#282828` | 6 elements — inactive year labels |
| Grey mid | `rgb(68, 68, 68)` `#444444` | 4 backgrounds — video poster/placeholder fills |
| White | `rgb(255, 255, 255)` | 3 elements only — nav links when the header sits over a dark section |

Everything else in the frames is photographic. The four bracket swatches the probe picked up — `rgb(190, 178, 166)`, `rgb(141, 128, 101)`, `rgb(190, 149, 97)`, `rgb(58, 43, 29)`, `rgb(196, 184, 166)` — are 2 backgrounds each, i.e. per-image tint blocks sampled from the photograph they sit behind. **The site has no brand colour.** Colour is delegated entirely to the archive.

## Typography (measured)
- **One family, three cuts:** `MonumentGrotesk` 500 (572 leaf nodes), `MonumentGrotesk` 400 (279), `MonumentGrotesk-Mono` 400 (76). 5 `@font-face` records, all `loaded`. Fallback stack `Helvetica, Arial, sans-serif`.
- **Year display (h2):** `902.25px / line-height 793.078px (0.879) / letter-spacing −36.09px (−4.0%) / weight 500`. On mobile: `241.28px / 197.85px lh (0.82) / −9.6512px ls` — the tracking stays at exactly −4.0% of size across breakpoints.
- **Pull-quote (h3):** `36px / 36px lh (1.00) / −0.72px ls / weight 500`.
- **Body (p):** `24.75px / 24.75px lh (1.00) / −0.2475px ls / weight 400`. Line-height 1.0 on a 24.75px paragraph is aggressive and only survives because paragraphs are capped at ~4 lines and centred.
- **Nav / eyebrow:** `11.25px / 12.7575px lh / +0.225px ls / weight 500 / uppercase`.
- **Mono:** used exclusively for dates (`JULY 2011`, `AUGUST 2014`, `FEBRUARY 2020`) and legal lines — 76 nodes. The mono cut is the site's entire "label" system.
- **Mobile collapse:** h3 and p both drop to `15px / 15px / −0.3px` — headline and body become the same size, and hierarchy is carried purely by the 241px year behind them.

Rule extracted: **letter-spacing is a fixed −4% of font-size on display, −2% on mid, +2% on micro.** One family, three tracking regimes.

## Structure, screen by screen
| Frame | Where | What happens |
|---|---|---|
| `desktop-hero` | 0 | Scattered 12-photo field + centred 2-line headline + chevron. |
| `desktop-01` | 2011 chapter | Header band goes to `#141414` for ~170px, then paper resumes. **Left rail appears: a vertical list `2010 … 2024`, 15 rows, 30px pitch**, active year in `#141414`, the rest in `#282828`/grey. Centre: mono date `JULY 2011`, then a 4-line 36px pull-quote, then a **3-up photo row with unequal top offsets** (left card starts 6px higher than centre, right card 12px higher) — a deliberate broken baseline. |
| `desktop-02` | 2013 | Full inversion to `#141414`. Left rail persists, now knocked back into the dark and **partially occluded by a full-bleed black-and-white boxing photograph** that runs under it. A 3-up B&W row, edge-bleeding right. Zero copy on screen — one screen of pure image. |
| `desktop-03` | 2014 | Dark still. A **video** (clippers, scissors, comb on a towel — `counts.video: 26` across the page) at ~640×355 left; right column carries mono date + two 24px paragraphs and an inline underlined `FULL VIDEO` link at the end of a sentence. Bottom of frame: the next year's numerals already rising into view. |
| `desktop-04` | 2017 | Paper. The year `2017` set at **902px, cropped by both viewport edges** — you never see the whole numeral. A 4-line 24px paragraph sits top-centre, overlapping the numeral's ascenders. The left rail sits *on top of* the giant numeral. |
| `desktop-05` | 2018 | Product still-life (dry shampoo, hair clay) floating with a soft cast shadow on paper — the only styled/studio image in the run, deliberately different from the reportage. Below it a full-bleed shop-interior video takes over the bottom third. |
| `mobile-03` | end | Footer: a **wall of ~350 supporter names** in 11px caps, ragged multi-column, filling ~1.5 screens on `#141414`; then `TWITTER / INSTAGRAM / WEBSITE` at ~28px underlined, the Blind Barber blindfolded-man logomark, `COPYRIGHT 2020 ALL RIGHTS RESERVED`, `BROUGHT TO YOU BY DYSON`, `WEBSITE BY MOUTHWASH STUDIO + HERSON RODRIGUEZ`. |

Rhythm across 15 chapters: paper → paper → **dark** → dark → paper → paper → **dark**. Ground colour flips roughly every 2 chapters, and every flip coincides with a change of photographic register (colour reportage ↔ black-and-white ↔ video ↔ studio still-life).

## Motion inventory
| # | Element | Motion | Evidence |
|---|---|---|---|
| 1 | Page scroll | **Virtualised.** `window.scrollY` stayed at **0 through all 6 desktop capture steps** while the rendered frame advanced from 2010 to 2018. Native scroll position is never written; a JS proxy drives transforms. | `data.json` desktop shots: every `reachedY: 0`, `pct: 0`, yet frames differ |
| 2 | Year numerals | 902px numerals translate through the viewport faster than the surrounding copy (parallax) — `desktop-04` catches `2017` mid-pass, clipped left and right | frame + `ScrollTrigger` in `bundleLibs` |
| 3 | Year rail | 15-row rail is pinned for the full 145 866px page; the active row swaps ink weight as each chapter enters | rail identical position in `desktop-01`…`desktop-05` at different chapters |
| 4 | Mobile year readout | The top-right nav slot prints the current year and **updates while scrolling** — `2010` → `2014` → `2020` across `mobile-00/01/02` | three mobile frames, same slot, three values |
| 5 | Video chapters | 26 `<video>` elements, autoplaying inline, some full-bleed (`desktop-05` bottom third), some framed (`desktop-03`). One frame catches a video mid-load as a flat green rectangle (`mobile-02`) | `counts.video: 26`; frames |
| 6 | Photo entrance | The 3-up rows enter with **staggered vertical offsets** (6/12px) still visible at rest — the offset is the animation's resting state, not a grid error | `desktop-01` |
| 7 | Carousel | `swiper` present in bundle; the edge-bleeding B&W row in `desktop-02` runs past both viewport edges | `bundleLibs`; frame |
| 8 | Hover | No hover state detected on the first CTA — hover frame was pixel-identical to rest state | `desktop-hover.jpg` was a duplicate of `desktop-05` and was deleted |

## Chapter grammar (the repeating unit)
Fifteen chapters, one shell. Learning this is most of the value of the study:

```
[ ground: #F1F1F1 or #141414, flipped every ~2 chapters ]

  2010            <- pinned rail, 15 rows, 30px pitch,
  2011               active #141414 / rest #282828
> 2012
  2013
  …                        JULY 2011                <- MonumentGrotesk-Mono 11px caps
  2024
                  36px pull-quote, max 4 lines,
                  line-height 1.00, centred, -0.72px ls

         [ img ]     [ img ]     [ img ]            <- translateY -6 / 0 / -12px
                                                       widths NOT equal

              [ 902px year numeral, cropped by both viewport edges ]
```

Variants observed across the five captured chapters:
| Variant | Frame | Change from the shell |
|---|---|---|
| Quote + 3-up | `desktop-01` | The default. Copy above, images below. |
| Image-only | `desktop-02` | No copy at all. One screen of black-and-white reportage, one image bleeding right. |
| Video + column | `desktop-03` | 640×355 video left, mono date + two 24px paragraphs right, inline underlined `FULL VIDEO` link. |
| Numeral-dominant | `desktop-04` | 902px year owns the frame; a single 4-line paragraph overlaps its ascenders. |
| Still-life + bleed | `desktop-05` | Studio product shot on paper with a cast shadow, then a full-bleed interior video takes the bottom third. |

Rule: **no two consecutive chapters use the same variant**, and every chapter contains exactly one mono date. The copy budget per chapter is 4 lines of quote or 2 short paragraphs — never both.

## How it sells a LOCAL SERVICE
This is the honest edge case in the set: **it is a brand microsite, not a booking funnel** — and it is worth studying precisely because it shows what a local business does with the *other* half of its site budget.

- **CTA count: 1.** The persistent header carries exactly two labels — the site title (left) and `BB LIVE` (right). There is no "Book", no phone number, no price anywhere in 162 screens. `counts.buttons: 18` are chapter/video controls, not conversions.
- **The conversion link is in the footer, third in a list of three:** `TWITTER / INSTAGRAM / WEBSITE`. "WEBSITE" is the hand-off back to blindbarber.com where booking actually lives.
- **Trust is built entirely by receipts.** Instead of stars and badges: 251 photographs of real shops, real barbers, real customers; dated mono captions (`MARCH 2014`, `FEBRUARY 2020`) that anchor every claim to a month; named third parties (Dockers campaign shot by Cass Bird, Movember partnership, Zion Williamson at the Chicago shop for NBA All-Star Weekend); and a failure told out loud — *"after 4 hard-but-fun-but-kinda-stressful years, Brooklyn inevitably met its downfall and closed up shop."* Admitting a closed location is the single most credible sentence on the site.
- **Locations are narrative, not a list.** East Village 2010, Williamsburg 2014 (with the detail that it was the same café where the business plan was written), Culver City, Chicago. Each shop arrives as a story with a photo of its front door, not as a row in a "Find us" table.
- **Staff faces are everywhere and never captioned as staff.** Barbers appear mid-cut, at parties, in the ring. The people-photography does the "who will touch my hair" job without a team grid.
- **How it survives the art direction:** because the art direction *is* the proof. There is no tension between "cinematic" and "credible" here — the cinematic device (giant year + archive photo) is a filing system for evidence. A vet clinic or garage can run this exact structure as a "Since 2009" chapter page hanging off the booking site.

## Why it reads expensive
1. **251 images and not one stock photo.** Grain, flash falloff, mixed white balance, cropped heads. `desktop-02` uses a genuine B&W boxing-match press photo; `mobile-01` uses an available-light shopfront at dusk with the barber pole blown out. The inconsistency between images is the luxury signal.
2. **902px type with −36px tracking that gets cropped.** The numeral is never fully visible on desktop (`desktop-04`) — confidence to cut your own headline in half.
3. **Line-height 1.00 on 24.75px body copy.** Almost nobody does this because it breaks at 5+ lines. They cap paragraphs at 4 lines instead of loosening the leading.
4. **The 11.25px header never grows.** Across 162 screens the chrome stays at 11.25px with +0.225px tracking. A brand-new visitor never sees the interface compete with the archive.
5. **Ground-colour inversion carries the chapter break** — no dividers, no section headers, no rules. `#F1F1F1` → `#141414` is the only transition device, used ~7 times.
6. **A mono cut reserved for dates only.** 76 nodes of MonumentGrotesk-Mono, every one a timestamp or legal line. One typeface doing one job perfectly.
7. **The footer thanks ~350 named people** in 11px caps over 1.5 screens. Nobody scrolls it. That is the point.

## Mobile adaptation
- 112 screens at 390×844 — barely shorter than desktop, so the archive is **not** truncated for phones.
- The 15-row year rail is **dropped entirely**; its job moves into the header, which becomes three slots: title / `BB LIVE` / **live year readout, underlined** (`mobile-00` = 2010, `mobile-01` = 2014, `mobile-02` = 2020). This is the strongest single idea in the study: a persistent chapter index compressed into one word.
- Display year drops from 902.25px → **241.28px** (0.267×) while tracking stays proportional at −4%.
- h3 and p both collapse to `15px / 15px lh`. The pull-quote loses its size advantage and instead gets isolation — one quote per screen, huge margins.
- Scattered hero photos re-lay as a looser vertical drift, still non-grid, still bleeding off the left edge (`mobile-00`).
- Photo rows go from 3-up to 1-up-with-overlap: in `mobile-01` a portrait card is dropped 40% over the shopfront photo below it, keeping the collage feel instead of stacking cleanly.
- Copy that was a right-hand column on desktop becomes a right-aligned half-width block on mobile (`mobile-01`) — they keep the asymmetry rather than centring everything.

## Steal list
| Component | How to rebuild | Cost |
|---|---|---|
| **Live chapter readout in the header** | One `position: fixed` slot, 11px uppercase, underlined. IntersectionObserver on each chapter section writes its label into the slot. Replaces a whole mobile nav. | **S** |
| **Pinned year/section rail (desktop)** | `position: sticky; top: 26%` list, 15 rows at 30px pitch, `color: #282828` default / `#141414` active, toggled by the same observer. No scroll library needed. | **S** |
| **Ground-flip chapter breaks** | Two classes, `--paper (#F1F1F1)` and `--ink (#141414)`, alternating every ~2 sections; invert text colour and nothing else. Delete all dividers and section headings. | **S** |
| **Cropped display numeral** | `font-size: clamp(240px, 62vw, 902px); letter-spacing: -0.04em; line-height: 0.88; white-space: nowrap; overflow: visible` inside an `overflow-x: clip` section. Let it exceed the viewport on both sides. | **S** |
| **Mono-only date labels** | Load one mono cut at 11–12px, `letter-spacing: +0.02em`, uppercase, and use it for *nothing* but dates and legal. Instant editorial credibility for a "since / history / hours" block. | **S** |
| **Broken-baseline 3-up photo row** | CSS grid, 3 columns, then `transform: translateY()` of −6px / 0 / −12px on the children. Costs nothing, kills the template look. | **S** |
| **Dated archive chapters** | One section per year: mono date → 36px pull-quote (max 4 lines, `line-height: 1.0`) → 3-up photo row → occasional full-bleed video. Repeat 10–15 times. This is the entire site. | **M** |
| **Duotone-free photo wall as loader** | 10–14 real photos at randomised sizes/offsets on a flat ground, headline centred on top. No skeleton, no spinner — the images *are* the entrance. | **M** |
| **Inline video chapters** | 26 muted autoplay loops, some framed at ~640×355 with a right-hand copy column, some full-bleed at one-third viewport height. Use `#444444` as the poster fill so an unloaded video reads as a designed block. | **M** |
| **Supporter name wall** | 300+ names, 11px caps, 4-ish ragged columns, on inverted ground above the footer links. For a clinic/garage: every customer who left a review, by name, with permission. | **M** |
| **Virtualised scroll with pinned chapters** | Only if you already ship GSAP + ScrollTrigger. Native `scrollY` stays 0; a proxy drives transforms. High risk (breaks anchor links, back-button restore, accessibility). Take the *look* with sticky sections instead. | **L** |

## Screenshots
`assets/studies/blindbarber/` — `desktop-hero.jpg`, `desktop-01.jpg` … `desktop-05.jpg`, `mobile-00.jpg` … `mobile-03.jpg`, `data.json`. (`desktop-00.jpg` and `desktop-hover.jpg` were pixel-duplicates of `desktop-hero` and `desktop-05` and were deleted.)
