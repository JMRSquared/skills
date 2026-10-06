# Drawn lines and formations

Read this before you build a diagram, a map, a timeline, a process, a rule that
draws, or any dot effect. The three reference sites the owner keeps pointing at
(side8group.com, 230-conversations.pages.dev, sirwali-nr.pages.dev) carry most of
their "wow" in two devices: **lines that draw themselves** as you scroll, and a
**point cloud that forms a recognisable shape**. A page built from this skill
without either (tshemolo-media.pages.dev, measured 2026-10-03) passed the auditor
with FAIL 0 / CRAFT 0, and its owner still said it had no wow and no reveal on
scroll. The research and frames: `site-studies/side-8-group.md`,
`site-studies/sirwali-nr.md`, `site-studies/230-conversations.md`.

## The owner's rule for dots

> "i want dot effects seperate from images" (the owner, 2026-10-03)

Dot effects are wanted. They live on their own ground, as their own graphic,
next to photographs and never on or out of them.

| Allowed | Banned |
|---|---|
| A point cloud forming a silhouette drawn from SVG paths (a country outline, a hut, a book, a pit section, a nurse's cap) | Sampling a dot cloud from a photograph, in any form |
| A cloud forming a numeral or a word (`maskFromText`) | A photograph that assembles from dots, or dissolves into dots |
| Map dots: towns, clinics, stations placed on a drawn map | Dots laid over a photograph, as texture, halftone or "particles" |
| Station dots on a traverse, filling as the line reaches them | A dot-matrix or LED grid of any kind: a dot-grid billboard, an LED-panel headline, a hero built from a regular lattice of dots |
| Dots that sink into a line and rise from it into the next shape (sirwali's `line` transition) | Images that appear on hover or follow the cursor (the standing hover ban, FAIL `hover-image`) |

The LED ban comes from a hero the owner called "very very ugly": a billboard
subject rendered as a regular dot lattice. A lattice reads as a cheap LED panel
whatever the colours are. Every allowed form above is **organic**: random
placement, varied dot size, no rows and no columns.

sirwali-nr's own Journey opens on a portrait sampled from a photograph
(`{ kind: 'image', src: … }`). Under this rule that beat is the one part of
sirwali not to copy. Take its `paths`, `text` and `scatter` beats.

---

## Part 1: lines that draw themselves

### When to use

| Subject | Form | Reference |
|---|---|---|
| Nothing photogenic to shoot (a contractor, an engineer, a utility) | Technical drawing per service: section, elevation, layers, labels | side8: six discipline drawings, ~600px of pinned scroll each (`side8-1440/d057`, `d093`) |
| A sequence: a life, a process, a booking flow, a project's stages | Traverse: a line with stations that fill as the line reaches them | side8 process (`STAGE 05 / 07`), sirwali life spine and survey strip |
| A place, a reach, a district | Schematic map drawn in stages, figures counting beside it | sirwali district platform (boundary, hospitals, 123 clinic ticks, routes) |
| A list, a ledger, a form, a footer | Rules that draw between rows | sirwali `data-rule` |
| A long section with steps down its length | A spine that draws top to bottom, a ring per step | sirwali `data-spine`, side8 checklist |
| A set of services or formats | One 40×40 glyph per item, reused in the nav, the hero and the footer | sirwali `glyphs.ts` |

A drawing is evidence, the same as a photograph. Draw only the places, parts and
stages the brief names. No invented dimensions, site counts or towns.

### The mechanism: one number draws the sheet

Every stroked element carries `pathLength="1"`. The group carries
`stroke-dasharray: 1` and `stroke-dashoffset: 1 - progress`. At 0 nothing is
drawn; at 1 everything is. No `getTotalLength()`, no per-path lengths.

```html
<svg data-draw viewBox="0 0 600 400" aria-hidden="true">
  <g fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round">
    <path pathLength="1" d="M40 320 L560 320" />
    <path pathLength="1" d="M120 320 L120 80 L480 80 L480 320" />
    <path pathLength="1" class="accent" d="M120 80 L480 80" />
  </g>
</svg>
```

```js
// GSAP. Strokes ink in order, scrubbed, reversing on the way back up.
gsap.fromTo(svg.querySelectorAll('path, line, circle, rect, polyline'),
  { strokeDasharray: 1, strokeDashoffset: 1 },
  { strokeDashoffset: 0, ease: 'none', stagger: 0.08, immediateRender: true,
    scrollTrigger: { trigger: svg, start: 'top 92%', end: 'top 55%', scrub: 0.5, invalidateOnRefresh: true } });
```

React, from sirwali-nr `src/domains/diagrams/drawing.ts`:

```tsx
export const drawn = { pathLength: 1 } as const;
export const inkStroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeOpacity: 0.9,
  strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
export function revealAt(progress: number, start: number, span = 0.2) {
  return clamp01((progress - start) / span);   // stage one part of the drawing
}
// useDrawProgress(ref, { start: 'top 92%', end: 'center 60%', scrub: 0.5 }) → 0..1,
// quantised to 40 steps so React re-renders a bounded number of times, pinned at 1
// under reduced motion.

const p = useDrawProgress(ref);
<g {...inkStroke} strokeDasharray={1} strokeDashoffset={1 - p}>
  <path {...drawn} d={outline} />
</g>
```

### Stage it like a draughtsman

A drawing where every stroke starts and stops together reads as a fade. Order
the strokes the way a person would draw them, and give each stage its own slice
of progress with `revealAt`:

```ts
// sirwali-nr DistrictPlatform.tsx
const boundary  = revealAt(p, 0,    0.22);   // the outline first
const hospitals = revealAt(p, 0.16, 0.16);   // overlaps the outline's end
const clinics   = revealAt(p, 0.28, 0.26);   // 123 ticks: tick i shows when clinics * 123 > i
const routes    = revealAt(p, 0.46, 0.2);    // inks solid, then swaps to dashes at 0.9
const callouts  = revealAt(p, 0.62, 0.06);   // labels last, one row every 0.06
```

- Base ink first, the one accent stroke last (side8 draws orange last on every
  drawing).
- Labels and hatches fade in after the strokes they name, from about 0.6.
- A dashed line cannot draw with `stroke-dasharray: 1`, because the reveal owns
  the dash. Draw it solid, then cross-fade to the dashed version between 0.9
  and 1.0.
- Counts ride with the drawing: a figure beside the map counts `0 → n` over the
  same window (`data-count`), so the number and the ticks arrive together.

### Traverses: stations wake as the line passes

```ts
// sirwali-nr Traverse.tsx. station.t is the station's 0..1 position along the line.
const reveal = clamp01((p - station.t * 0.9) / 0.06);
const rise = (1 - reveal) * 8;                       // the station lifts 8px as it inks
<g opacity={reveal} transform={`translate(0 ${rise})`}>
  <g {...inkStroke} strokeDasharray={1} strokeDashoffset={1 - reveal}>
    <StationMarker reached={reveal > 0.9} />
  </g>
</g>
```

Put a counter in the client's own unit beside it (`STAGE 05 / 07`, `01 / 06`,
side8's depth readout `002 … 082`). A percentage is the same number and means
nothing.

### Ranges

| Drawing | Window | Why |
|---|---|---|
| A rule under a row | `top 94% → top 64%` (30% of the viewport) | sirwali `data-rule` |
| A glyph or small drawing | `top 92% → top 55%` (37%) | sirwali `data-draw` |
| A drawing that carries a section | `top 85% → center 45%`, or a pinned stage of ~600px per drawing | side8 capabilities stage |
| A map with stages | a pin of 100–150vh on desktop; its own entry `top 85% → bottom 60%` on phones | sirwali district, Tshemolo plan |

No drawing finishes in under 35% of the viewport. A line that inks in two wheel
ticks reads as a flicker.

### Look

- 1px ink (`currentColor`), stroke opacity about 0.9, round caps. One accent
  colour on one stroke per drawing.
- Labels in the page's **small** role. A label a reader needs is never under
  15px; sirwali and side8 set mono annotation at 9–13px, so on a page held to
  this skill's type standard, put needed labels in HTML beside or below the
  drawing (sirwali does this for its district counts on phones) and keep only
  tick marks and part names inside the SVG.
- The drawing sits on the page ground or its own panel, at a scale where a 1px
  stroke still reads at 390px. Test the phone frame.

### Phone

No pins. Each drawing draws over its own entry at full width. Labels move into
an HTML list under the drawing. The traverse turns vertical (sirwali
`orientation="vertical"`), with a ring per station.

### Reduced motion

Progress is 1. Every drawing renders complete, every count shows its final
number. A drawing that waits for scroll that never animates is a blank box.

### Failure modes

| Failure | Fix |
|---|---|
| Stroke icons from an icon set standing in for drawings | Draw the subject: its parts, in elevation or section, labelled with real names |
| Every stroke draws at once | Stagger 0.06–0.08 or stage with `revealAt` |
| Dashed lines snap from solid to dashes mid-draw | Draw solid, cross-fade to dashes at 0.9 |
| Invented content (dimensions, depots, routes the brief never names) | Draw only what the brief says. Mark schematic maps `SCHEMATIC · NOT TO SCALE` |
| A drawing finishes in a quarter screen | Widen the window to ≥35% of the viewport, or pin it |
| Labels at 9px that the reader needs | Small role in HTML, beside the drawing |
| Reduced motion shows an empty frame | Pin progress at 1 |

---

## Part 2: point-cloud formations

### What it is

Between 12 000 and 30 000 fine dots on one WebGL `Points` buffer. A pinned
track drives one progress value; each beat is a target shape; between beats every
dot travels to its place in the next shape, loosening mid-flight and landing
exactly on form while the beat holds. sirwali-nr runs nine beats at 90svh each;
side8 runs six targets named after its six chapters (`surface, survey, extract,
structure, network, resolve`), the same six names as its right rail.

### When to use it

- The subject can be drawn as a silhouette, and the story has beats: a life in
  chapters, terrain to pit to frame, a country to a province to a town.
- The page has little worth photographing (side8), or the formation sits on a
  separate stage from the photographs (sirwali's pinned sheet, with the album
  strip later on the page).

Do not use it:

- To decorate photographs, or to make a photograph (the owner's rule above).
- For a billboard, screen or signage subject. Dots near a display subject read
  as an LED panel however irregular they are.
- When the business's real photographs are the proof. Tshemolo's research
  rejected a formation for exactly this: the campaign photographs carry the
  sale, and a dot stage competes with them.

### Targets

| Beat kind | Source | sirwali-nr call |
|---|---|---|
| Line art | SVG `d` strings in a 0..100 box | `fromPaths(count, paths, seed, jitter)`, keep `share` 0.3 of the dots on the strokes and send the rest to an invisible loose cloud (`thin`), jitter 0.0035 of the box |
| A numeral or word | Text drawn to a canvas, read back as a darkness mask | `maskFromText(text, font, w, h)` then `fromMask` |
| Between shapes | A loose cloud | `scatter(count, seed, spread)` |
| ~~A photograph~~ | ~~`maskFromImage`~~ | Banned. Draw the subject's outline as paths instead |

Keep it organic. These are what stop a cloud reading as a grid:

- Random placement from a seeded PRNG (`mulberry32`), plus gaussian jitter so a
  stroke has body.
- Size varies per dot: 0.55–1.0 of the base along strokes, and the dot diameter
  is set from the mean spacing, clamped to 1.4–11px.
- `shuffle` the target order, or the morph shows streaks where path order lines up.
- Each dot runs slightly ahead of or behind the mix (`(seed - 0.5) * 0.4`), so the
  mass arrives out of phase.
- A held shape breathes by 0.35px. It never sits dead still and never shimmers.

### Scroll drive

```ts
// sirwali-nr use-formation-progress.ts: the pinned track's scroll becomes 0..beats-1.
gsap.to(proxy, { p: beats - 1, ease: 'none',
  scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
  onUpdate: () => { progressRef.current = proxy.p; } });

// progress.ts: each beat holds still for 24% of its travel on either side.
export const HOLD = 0.24;
export function splitProgress(value, beats, hold = HOLD) {
  const from = Math.min(beats - 2, Math.floor(value));
  return { from, to: from + 1, mix: smoothstep((value - from - hold) / (1 - hold * 2)) };
}
```

The canvas reads `progressRef` every frame. No React render per scroll event.
Captions step with `nearestBeat(p)`, so a caption changes once per beat.

Two transitions: `morph` (every dot travels and loosens mid-flight) or `line`
(the old shape sinks into a horizontal line and the new one rises from it, which
reads as new dots arriving). Both are scrubbed and reverse on the way up.

### Pointer push and trail

Desktop and touch both get it. Dots within a radius of 0.22 of the stage (0.26
for touch) push away by 0.28 of that radius and grow up to 1.5×, and a velocity
trail of 32px per px/ms, capped at 40px, drags them in the pointer's wake. It
releases over a short ease when the pointer leaves. This is allowed because the
dots are the graphic and nothing appears that was not already there. It is never
the only way to see something.

### Ground and placement

- Ink dots on the paper ground, or paper dots on an ink panel. One colour.
- Its own stage: a pinned sheet or panel, with the caption beside it, never over
  a photograph and never with a photograph behind it.
- One formation stage per page. A second turns a device into wallpaper.

### Performance and fallbacks

| Case | Do |
|---|---|
| First paint | Lazy-load three.js (about 150 KB gzip). Paint an SVG of the first beat's line art underneath so the section is never empty and LCP does not wait for WebGL |
| Phone | Fewer dots (sirwali: 14 000 under 768px, 30 000 above), DPR capped at 1.5–2 |
| No WebGL | Render the SVG line art of each beat, and log it: `console.info('[capability] WebGL unavailable, formation stage skipped')` |
| Reduced motion | Show the last beat (or the first) as a still, with the captions as a list |
| Target fails to build | Log it and fall back to the line art, never to a blank canvas |

### Failure modes

| Failure | Fix |
|---|---|
| Rows and columns of dots, an LED or dot-matrix look | Random placement, varied size, jitter. Never a lattice |
| A photograph assembling from or dissolving into dots | Banned. Use path or text beats, and put the photograph somewhere else on the page |
| Dots over a photograph | Banned. Give the cloud its own ground |
| A silhouette nobody can name | Fewer, bolder strokes; test the held frame at 390px |
| Shapes that never hold | `HOLD` of about 0.24 per side, so each shape sits for a stretch of scroll |
| A formation that adds a caption system (years, labels) the type standard has no role for | Captions in the existing small or heading role, or none |
| A blank canvas on a phone or with WebGL off | The SVG line-art fallback, announced with `console.info` |

---

## Choosing

| Brief | Take |
|---|---|
| Real photographs carry the sale (an agency, a restaurant, a salon) | Drawn lines only: rules, a traverse, one glyph per service, a map. Photographs unmask. No formation |
| Nothing photogenic (a contractor, an engineer, a utility) | Technical drawings per service, plus a formation if the story has beats |
| A person's life, a history, a campaign | A formation on its own pinned stage for the chapters, a traverse to navigate them, photographs on a separate strip |
| A place-led business | A drawn map in stages with counts, ending in a station at the real address |

Either device needs the reveal-coverage standard in `motion.md` around it. A
signature drawing in one section does not excuse ten static ones.
