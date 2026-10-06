# 2:30 Conversations, a youth ministry in Gauteng (hand-built reference)

**Captured:** 2026-10-03 · **URL:** https://230-conversations.pages.dev · **Provenance:** a hand-built site for a Seventh-day Adventist youth ministry that films conversations and runs food and clothing drives in Ekurhuleni and Midrand. The owner names it as one of the sites with the reveal on scroll a later build lacked.
**Stack (measured):** React, a custom scroll driver (no Lenis, no GSAP globals), three.js through React Three Fiber for one point-cloud canvas. Bundle sniff matched `r3f, shader, three, webgl`.
**Page length:** 13.6 screens desktop (scrollHeight **12 208px** @ 900px) · 15.6 screens on a 390×844 phone · **9 sections** · **1 canvas** · **26 img** · **11 svg** · 0 video

## The one number that matters

**187 unmask readings.** The research probe (one DOM read every 72px of scroll)
caught photo frames mid-way through `clip-path: inset(0 0 100%) → inset(0)` 187
times across the page, each followed by a 1.06 → 1.0 settle inside. The
photographs appear; they do not just slide past. The static study frames show
the cost of that choice too: `desktop-02`, `desktop-06` and `desktop-08` each catch a band where a
photograph has not opened yet, so the page needs its reduced-motion still to be
a composition on its own.

## Art direction in one line

A night service in a hall: near-black ground, one warm gold, a hairline display
serif, and a gold point cloud that forms a microphone, then the figure `2:30`,
while the headline beside it changes three times.

## First 3 seconds

`desktop-00.jpg`: logo lockup top left (microphone glyph, `2:30`, speech-bubble
glyph). Left column: a gold rule and `THE ROOM`, then `Conversations / the church
/ keeps quiet.` in Melodrama 300 at 72px over three lines, a two-sentence lead
naming the subjects (femicide, trafficking, incarceration, marriage), and two
actions: a solid gold `GIVE TO THE NEXT DRIVE` and an underlined `See what the
last one moved`. Right: a microphone formed from a few thousand soft gold dots
on the dark ground, with the ministry's one-line statement set beside its base.

## Palette (measured)

| Role | Value | Where |
|---|---|---|
| Night ground | `rgb(11, 10, 8)` `#0B0A08` | hero, strip, drives, footer |
| Paper text | `rgb(242, 237, 227)` `#F2EDE3` | 300 text elements on the dark ground |
| Paper ground | `rgb(237, 230, 216)` `#EDE6D8`, `rgb(226, 217, 200)` `#E2D9C8` | the figures band, the services list, the give band |
| Ink on paper | `rgb(22, 19, 14)` `#16130E` | 93 text elements |
| Gold | `rgb(199, 154, 62)` `#C79A3E` | 43 text elements, 5 grounds: the primary button, the dots, kickers, the strip's progress rule |
| Deep gold | `rgb(111, 82, 16)` `#6F5210` | kickers on paper |
| Muted | `rgb(138, 128, 113)` `#8A8071` | secondary copy, captions |

Rationed accent on a field of two grounds. The page flips night → paper → night
→ paper four times in 13.6 screens.

## Typography (measured)

Two families. **Melodrama** 300 for every heading (h1 72px, h2 54px, h3 40px,
tracking −0.03em) and for every figure, so `1 000`, `500`, `7 051` read as
display type. **Cabinet Grotesk** 400 for body at 17px, line-height 1.6; the
same face in caps at 11px tracked 0.28em for kickers and captions. The kickers
sit under the 15px floor this skill sets for text a reader needs.

## Structure, screen by screen

| Frame | Section | What happens |
|---|---|---|
| `desktop-00`–`01` | Hero, pinned ~185dvh | The cloud re-forms (microphone → crowd → `2:30`) while the headline swaps: `Conversations the church keeps quiet.` → `Then we take it outside.` → `One Saturday fed a thousand people.` Research sheet `c230-d000` |
| `desktop-01`–`02` | What one Saturday moved | Paper ground. Dateline kicker, title, a photograph unmasking from the bottom, then figures `1 000`, `1 000+`, `500`, `300`, `250`, `4`, each column drifting at its own rate |
| `desktop-03` | On the ground, pinned horizontal | Sixteen photographs on one strip, each at its own vertical offset, a `10 / 16` counter and a gold progress rule that fills with the pan. Research sheet `c230-d032` |
| `desktop-04` | Where we have been | Seven drives as index rows: year, place in display type, one line. Each row wipes in from the left |
| `desktop-05` | Drive photographs | Two photographs, one bleeding off the left edge, rising as they unmask |
| `desktop-06` | Five things, one ministry | Rows numbered inside speech-bubble glyphs (`04`, `05`), each with one action on the right |
| `desktop-07`–`08` | Videos, give, questions | `Five of our hundred and twenty-one`, a give band with a photograph bleeding right, then `What people ask first.` |
| `desktop-09` | Footer | A marquee of the drive's figures (`300 FOOD PARCELS · 500 LOAVES · 1 000 FED …`), the logo lockups, where they publish, audience figures in display type, and a giant outline `2:30` in tint behind |

## Motion inventory

| # | Element | Motion | Scrub | Evidence |
|---|---|---|---|---|
| 1 | Hero cloud | Gold dots re-form between shapes over a pinned 185dvh | yes, reverses | sheet `c230-d000`, `c230-1440/d014-y1008` |
| 2 | Hero headline | Three headlines swap as the cloud changes beat | yes | sheet `c230-d000` |
| 3 | Every photograph | `clip-path: inset(0 0 100%) → inset(0)`, then scale 1.06 → 1.0 | yes | probe `div.h-full.w-full`, `c230-1440/d079-y5688` |
| 4 | Figure columns | `1 000`, `1 000+`, `500` travel −53 → +53, −23 → +23, −10 → +10px across the same range | yes | probe `y1080–2736`, `d022-y1584` |
| 5 | Photo strip | `ul` translateX −241 → −3 857px under a pin; photos at ±12px offsets; counter and gold rule step with it | yes | sheet `c230-d032` |
| 6 | Index rows | `clip-path: inset(0 100% 0 0) → inset(0)` per row | one-shot | probe `li.reveal-row`, `d068-y4896` |
| 7 | Footer | Marquee on its own clock; outline wordmark | marquee yes | sheet `c230-d112` |

## Steal list

1. **The scrubbed unmask on every photograph.** Clip from the bottom, settle the
   image inside from 1.06. It is the gesture that turns a photograph into
   something that appears. Code in `motion.md` **Reveal coverage**
   (`data-unmask`).
2. **Figures at three drift rates in one band.** The non-uniform pair, built
   from the page's own numbers.
3. **A pinned photo strip with a counter in the page's own unit** (`10 / 16`)
   and a gold rule that fills with it.

## Do not copy

- **The row wipe as a one-shot.** It plays once and stays. Scrub it so it
  reverses, as the standard in `motion.md` asks.
- **Dot beats sampled from photographs.** The research names a portrait and a
  crowd among the hero's beats. If those are sampled from photographs they fall
  under the owner's rule: dot effects stay separate from images
  (`drawn-lines-and-formations.md`). The microphone and the `2:30` figure are
  the allowed kind.
- **Soft glowing dots on a billboard or screen subject.** They read as an LED
  panel there.

## Where it would not pass this skill's own audit

- **`reveal-coverage`, 2 of 9 sampled sections** on both widths (2026-10-03).
  The figures band and the photo strip scrub. The drives list wipes once and
  stays (`static` by the time it is read), `What we actually do` and the
  questions never move, the library finishes inside a quarter screen, and the
  sabbath and give bands only drift their photographs (`parallax only`). The
  hero is a canvas and is not sampled. The owner points to this site for its
  photographs and its hero; the rest of the page is under the standard.
- **11px caps kickers** under the 15px floor for readable text.
- **No smooth scroll.** Scrubs step with each wheel tick.
- **Empty bands in any static capture**, where a photograph has not unmasked
  yet. Check `reduced-motion.jpg` for the same holes.

## What it proves

A small ministry with phone photographs and a list of drives reads as authored
because every photograph and every figure arrives as the reader scrolls, at more
than one rate, and the one dot device on the page forms the ministry's own
symbols on its own dark ground.
