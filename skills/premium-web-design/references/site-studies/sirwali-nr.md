# Sirwali NR, a life of service (hand-built reference)

**Captured:** 2026-10-03 · **URL:** https://sirwali-nr.pages.dev · **Provenance:** built by this skill's author for the family of Robert N. S. Sirwali, a district health manager in Vhembe, Limpopo. Source on disk at `/Users/lavhe/CODE/sirwali-nr`. It is in the corpus because the owner names it as one of the sites that has the "reveal on scroll" a later build lacked, and because its motion code is reusable as-is.
**Stack (measured):** Vite + React 19 + TypeScript + Tailwind. GSAP + ScrollTrigger + SplitText, Lenis smooth scroll, three.js through React Three Fiber for the point-cloud stage. Bundle sniff matched `ScrollTrigger, SplitText, gsap, lenis, r3f, shader, three, webgl`.
**Page length:** 32 screens desktop (scrollHeight **28 826px** @ 900px) · 36 screens on a 390×844 phone · **7 sections** · **2 canvas** · **15 svg** · **17 img** · 0 video

## The one number that matters

**Something answers the scroll on every screen of the story.** The research
capture (wheel steps of 72px, a DOM probe at every step) logged state changes
from the front page to the closing letter on the way down, and the same changes
in reverse on the way up: the formation re-forms, the traverse inks, stations
wake, figures count, headlines rise line by line, rules draw. The masthead and
the footer are the only parts that arrive finished.

## Art direction in one line

A broadsheet special edition: blackletter masthead held at the top of every
screen, paper ground flipping to an ink ground for the life story, gold for one
rule and one station at a time, and a field of dots that keeps re-forming into
the next chapter of a man's life.

## First 3 seconds

`desktop-00.jpg`: `The Sirwali Times` in UnifrakturCook 700 at 102px, centred,
over a ruled dateline (`SPECIAL EDITION · ✦ VHEMBE DISTRICT, LIMPOPO ✦ · A
BIOGRAPHY`). Left: the headline `A legacy of leadership. / A journey of
purpose.` in Newsreader 500 at 63px, four lines, then a short gold rule, one line
of lead, and `BEGIN AT 1961 ↓`. Right: the subject's portrait as a point cloud.
That portrait is sampled from a photograph, which the owner has since ruled out
(see "Do not copy" below).

## Palette (measured)

| Role | Value | Where |
|---|---|---|
| Paper ground | `rgb(243, 237, 224)` `#F3EDE0` | front page, album, community, write |
| Ink ground | `rgb(20, 18, 16)` `#141210` | the pinned life-story sheet and the district platform |
| Ink | `rgb(22, 20, 18)` `#161412` | 338 text elements on paper, and the dots on paper |
| Paper on ink | `rgb(239, 231, 214)` `#EFE7D6` | 1 193 text elements, the survey strip and the dots on ink |
| Gold | `rgb(184, 146, 46)` `#B8922E` | 13 elements: one rule per headline, the active station ring, accent strokes |
| Deep gold | `rgb(125, 95, 22)` `#7D5F16` | the small caps kicker on paper |
| Muted | `rgb(90, 84, 75)`, `rgb(183, 173, 153)` | stations not yet reached, captions |

Rationed accent. Gold never paints a ground; it marks where the reader is.

## Typography (measured)

Four families, each with one job: **UnifrakturCook** 700 for the masthead only
(102px), **Newsreader** 400/500 for display and story copy (63px h2, year
numerals far larger as dot formations), **Schibsted Grotesk** 400 for body (17px,
line-height 1.55), **IBM Plex Mono** 400 for kickers, captions and drawing labels
(11px, tracked 0.14em, uppercase). The mono carries 97 leaf nodes, more than any
other face. Mono labels at 11px sit under this skill's 15px floor for text a
reader needs; on a page held to the type standard, keep them to tick labels and
put the readable version in HTML.

## Structure, screen by screen

| Frame | Section | What happens |
|---|---|---|
| `desktop-00` | Front page | Masthead, dateline, four-line headline, point-cloud portrait |
| `desktop-01` | Journey (pinned) | The sheet turns paper. `1993` at display size, a one-line chapter, and the cloud re-formed as a line drawing of a mobile clinic. At the foot, the life traverse inks left to right and each station (`Luonde 1961`, `Khwevha 1981`, `The nurse 1987`, `Into the villages 1993`) wakes as the line reaches it |
| `desktop-02`–`03` | Survey strip (pinned, horizontal) | Ink ground. A horizontal spine pans; the line inks left to right; a glyph per station (book, shoe, nurse's cap) inks over the approach; the next note sits dim until reached. The cloud hangs loose between beats |
| `desktop-05`–`06` | Survey years | The cloud forms each year as numerals (`2004`, `2026`), glyphs and notes below on the same spine |
| research `sirwali-d276` | District platform | A schematic of the district draws in stages: boundary, hospitals, 123 clinic ticks, routes. Beside it `4 / 40 / 3 / 0` counts up to `8 / 123 / 18 / 10`, later rows dimmer |
| `desktop-07` | Family album | Paper ground. Twelve unframed photographs at three drift rates, mono captions, giant tint years (`2016`, `2018`) behind them at a fourth rate |
| `desktop-08` | Community | Ruled dateline again, a full-height photograph bleeding off the left edge, `The clinic closed at four. / The work did not.` rising line by line, rows of roles below each lifting with its own rule |
| `desktop-09` | Write / closing | A letter form and the share dock. On phones the dock is a fixed bottom bar: `Write to Mr Sirwali` / `Share` (`mobile-01`) |

## Motion inventory

| # | Element | Motion | Scrub | Evidence |
|---|---|---|---|---|
| 1 | Whole page | Lenis `lerp: 0.09`, ticked from `gsap.ticker`, `lagSmoothing(0)` | n/a | `src/shared/scroll/lenis.ts`; logs `[scroll] lenis smoothing on` |
| 2 | Point-cloud formation | 30 000 dots on desktop, 14 000 on phones, re-form per beat; each beat holds 24% of its travel on either side; dissolves between | yes, reverses | `src/domains/formation/`, research sheet `sirwali-d000` |
| 3 | Life traverse | Line inks with the pin; station reveal `clamp01((p - t * 0.9) / 0.06)`, lifts 8px | yes | `Traverse.tsx`, `desktop-01` foot |
| 4 | Survey strip | Horizontal pan, line inks, glyph per station inks over its approach | yes | research `sirwali-1440/d118-y8490` (line stops at x≈405, megaphone half drawn) |
| 5 | District schematic + counts | Staged with `revealAt`: boundary `[0, .22]`, hospitals `[.16, .16]`, clinics `[.28, .26]`, routes `[.46, .2]` (solid, then dashed at 0.9), callouts from `.62` | yes | `DistrictPlatform.tsx`, research `d279-y20081` |
| 6 | Headlines | Each line in its own mask, `yPercent 108 → 0`, stagger 0.12, `top 96% → top 68%` | yes | `use-choreography.ts`, `Lines.tsx` |
| 7 | Rules, rows, spine | `scaleX 0 → 1` per rule (`top 94% → top 64%`); rows `y 36 → 0` with opacity; vertical spine `scaleY 0 → 1` across its section | yes | `use-choreography.ts` |
| 8 | Album | Photos at three `data-speed` rates, tint years at a fourth | yes | research sheet `sirwali-d276` |
| 9 | Front page load | Headline lines rise once over ~1.1s, stagger 0.14. The only time-based reveal | no | `Journey.tsx` |

The whole vocabulary lives in one hook wired once from `App`
(`src/shared/motion/use-choreography.ts`): `data-reveal`, `data-lift`,
`data-rule`, `data-spine`, `data-draw`, `data-count`, `data-speed`, `data-ink`.
Code excerpts are in `motion.md` **Reveal coverage** and
`drawn-lines-and-formations.md`.

## Steal list

1. **The choreography hook.** One file, eight data attributes, one scrubbed
   ScrollTrigger each, nothing built under reduced motion. Widen its line
   window to `top 92% → top 58%` (35%+ of the viewport) when you copy it.
2. **One number draws a sheet.** `pathLength=1` on every stroke,
   `strokeDashoffset = 1 - progress` on the group, `revealAt` to stage parts.
3. **A traverse whose stations wake as the line passes.** Life events, project
   stages, booking steps.
4. **Figures that count beside a drawing that inks.** The number and the ticks
   arrive together, so the figure reads as evidence.
5. **A formation built from paths and numerals** on its own ground, with the
   caption system stepping once per beat.

## Do not copy

- **The front-page portrait and any `kind: 'image'` beat.** The cloud samples
  the subject's photograph. The owner has since ruled: "i want dot effects
  seperate from images". No dot cloud sampled from a photograph, no photograph
  assembling from or dissolving into dots, no dots over photographs. Use the
  `paths`, `text` and `scatter` beats.
- Mono captions at 11px for anything a reader needs.

## Where it would not pass this skill's own audit

- **`reveal-coverage`, 3 of 4 sampled sections on desktop, 1 of 4 on the
  phone** (2026-10-03). The journey and district sections hold canvases and are
  not sampled. The album scrubs while pinned on desktop and sits still on the
  phone; the footer never moves; on the phone the community headline finishes
  inside a quarter screen. The fix in each case is one more scrubbed reveal,
  which is the standard this page set.
- **Four families** (`font-sprawl`). The masthead face does one job.
- **11px mono** under the 15px readable floor.

## What it proves

A memorial for one man, with seventeen family photographs and no product, can
carry 32 screens because every screen gives the reader something that happens
only when they scroll: a shape forming, a line reaching the next year, a number
arriving. The photographs sit in their own album, where they are the subject.
