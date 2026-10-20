# Scroll story

A scroll story reads as a story when one subject stays on screen and changes
one thing per beat. Every section boundary carries something across.
Pages built from sections that each fade in their own content read as a
deck of slides, however good each slide is. This file is the authoring
guide: the storyboard you write first, the scene and transition vocabulary,
the pacing numbers, the runtime in `kit/` and the check that proves the
story reads.

Worked example: `demos/scroll-story/` (Kettle & Coil, one bike repaired over
one morning). Read its `PRODUCT.md` before writing your own storyboard.

## Why stories came out poor

The failures this file exists to stop, all seen in earlier builds:

1. **No protagonist.** Every section introduced a new picture, so nothing
   changed. Change needs a subject that persists.
2. **Reveals mistaken for story.** Headings sliding up on enter is a reveal.
   A story needs the subject to change state because of what the copy says.
3. **Non-sequitur boundaries.** Section N ended, section N+1 faded in
   unrelated content. McCloud calls this panel transition a non-sequitur and
   comics almost never use it.
4. **No pacing.** Every section was one screen tall, so nothing held and
   nothing built to a peak.
5. **Dead engine references.** Docs cited attributes no runtime read, so
   authors wired motion that never ran.

## 1. Write the storyboard first

Before markup, add a `## Story` block and a scene table to `PRODUCT.md`.
SavoirFaire wrote "a synopsis, structured a three-act arc, and built a
storyboard before anything else. Each scroll section became a scene" for
Inkwell (Awwwards, 2025). Do the same.

```md
## Story
Protagonist  The one subject that stays on screen (product, object, number, character)
Change       Its state at the top of the page and at the bottom, in one line
Spine        The device that shows progress (ticket, rail, odometer, timeline)
Peak         The sentence a visitor says to a friend about the best moment
Ending       How the opening motif pays off; the one action left behind

| # | Scene | Pattern | Span | The one change | Copy beat | Into the next |
```

Rules for the table:

- **One change per scene**, written as subject + verb: "bike lifts onto the
  stand", never "show the repair process". Two changes in one scene go in
  separate scroll ranges (Heer and Robertson found staged transitions beat
  simultaneous ones).
- **The copy beat causes the change.** The heading says the tyre gets a new
  tube; the tyre fills while it is on screen.
- **Every row names its transition** (section 3). A blank cell is a
  non-sequitur.
- **Shape:** three acts (setup, escalation, resolution), or kishōtenketsu
  (introduce, develop, a turn that reframes, reconcile). Name the turn.
- **Facts stay in plain text.** Studies agree scrollytelling lifts
  engagement, not recall (CHI 2026, N=454; KTH 2024). Prices, hours and
  steps are readable copy with or without the motion.

## 2. Scene patterns

From the taxonomy of Oesch, Renner and Roth ("Scrolling into the Newsroom",
2022), renamed for product pages. Pick one per scene and write it in the
table.

| Pattern | What happens | Use for | Wiring |
|---|---|---|---|
| hold | The subject stays fixed while copy scrolls over it | Establishing shot, explanation | `data-stage` + chapters or `data-steps` |
| transform | The subject changes state, scrubbed by scroll | The core chapters: build, fix, assemble, fill | `data-track` on the subject's parts |
| travel | The subject or camera moves through space | Journeys, maps, the ending exit | `data-track` with `translate` keyframes |
| zoom | Push in to a detail, or pull out to context | Material close-ups, "and here is where it lives" | `data-track` on scale or a clip-path |
| explode | The subject comes apart into labelled parts, then goes back together | "What is inside", modules, ingredients, the parts list | One track per part on `translate`; leader lines with `data-reveal="draw"` |
| play | Discrete states, one per step | Chat threads, UI flows, numbered steps | `data-steps` + `data-current` selectors |
| breathe | Normal scrolling content, short reveals only | Prices, specs, proof between acts | `data-reveal` |

Every story page needs at least one **hold** with a **transform** inside it:
that is the protagonist on screen while it changes. Put a **breathe** scene
between long held runs. Bostock: "If nothing moves when the reader
scrolls… the page will feel laggy." NN/g found long locked sections
disorient readers.

## 3. Transitions at every boundary

Scott McCloud sorts panel transitions into six types. Map each boundary to
one, then to a technique:

| Name in the table | McCloud type | What crosses the boundary | Technique |
|---|---|---|---|
| carry | action-to-action | The subject itself, in a new state | Nested scenes share one `data-stage`; the subject never leaves |
| match cut | subject-to-subject | A shape in the same place and size (Kubrick's bone becomes a spaceship) | End scene N with the shape at X; start N+1 with a new object at X |
| ground wipe | scene-to-scene | The page colour, as a chapter break | Section grounds change; a band or edge pattern draws the line |
| push-in | aspect-to-aspect | The camera, from whole to detail | A zoom track that ends where the next scene starts |
| line hand-off | subject-to-subject | A drawn line or the spine | The route line or rail continues from one section into the next |
| ending | (payoff) | The opening motif, changed | The hero subject returns in its final state |

Rules:

- Default to **carry**. American comics are about 70% action-to-action.
- **Use one site-wide grammar for chapter breaks.** Igloo Inc (Site of the
  Year 2024) uses the same ice-crack wipe at every boundary, so the reader
  learns that the wipe means a new chapter.
- **No non-sequiturs.** If you cannot name what crosses a boundary, the two
  scenes are in the wrong order or one of them should go.
- **Pay off the opening.** Whatever the hero shows (an object, a number, a
  motif) comes back changed at the end. The demo's flat bike rides home.
  Then open into the one action, as in Segel and Heer's martini glass: the
  author drives the stem and the reader takes over at the end.

## 4. Continuity devices

- **Frame.** A persistent container (a dial, a device, a window, a plate)
  that stays put while what is inside it changes. Segel and Heer call this a
  "consistent visual platform". On animejs.com the hero ring becomes a dial
  that frames every feature demo in turn.
- **Chapter colour.** Each chapter owns one colour, used in its heading, its
  part of the frame and its row in any legend. The runtime marks the active
  scene on `<html>`, so one rule per chapter does it:
  `html[data-active-scene="patch"] { --chapter: var(--tomato); }`.

- **Protagonist on a stage.** One drawing or product frame in a sticky
  `data-stage`, constant size within a run. Parts of it are tracks.
- **Spine.** A ticket, rail, odometer or progress line that records each
  chapter (the demo's ticket stamps one line per chapter). It answers
  Kosara's "no sense of length" complaint.
- **Readout.** A number the subject's state drives (wobble mm, litres,
  altitude). Numbers moving with the drawing prove the change is real.
- **Chapters nav.** `data-chapters` on the nav gives jump links that mark the
  current scene with `aria-current="step"` (Resn's Tracing Art keeps a
  progress bar and chapter menu for the same reason).

### Scrub or trigger

anime.js names two ways to tie motion to scroll: sync the animation's
progress to scroll, or play, pause and reverse it when thresholds are
crossed. Use both, for different jobs:

- **Scrub the subject's change** (`data-track`). The reader controls the
  tyre filling; scrolling back un-fills it.
- **Trigger the chrome** (headings, plates, frames). Transition on
  `data-state` or `data-current` with a 250 to 350ms cross-fade (Bostock's
  time-based threshold; animejs.com fades its fixed sections in 350ms). CSS
  transitions reverse when the selector stops matching, so scrolling back
  works for free.

A reader who stops halfway through a trigger should never be left with a
half-faded heading. A reader who stops halfway through a scrub should see a
half-changed subject; that is the point.

## 5. Pacing

| Number | Value | Why |
|---|---|---|
| Hero span | 1.2 to 1.6 screens | The establishing shot holds long enough to read, then hands off |
| Transform span | 1.5 to 2.5 screens | About 1 s of attention per stage at reading speed (Heer and Robertson tested 1.25 to 2 s) |
| Step height | 70 to 90svh | About one screen per discrete state; the trigger sits at the middle of the viewport (Scrollama's default) |
| Held run total | 4 to 7 screens | Longer runs feel like a page-length scrolljack, which NN/g's readers took for a bug |
| Breathe between runs | at least 1 screen | Content that scrolls normally resets the reader |
| Scenes on the page | 5 to 8 | Seyser and Zeiller saw 3 to 7 media modes per story |
| Peak placement | 55 to 75% of the page | After the setup has paid for it, before the close |

Never change scroll speed or direction. The runtime uses native scroll and
only smooths the values it writes, so the scrollbar, keyboard and find in
page keep working.

## 6. Legibility and phone

- Copy over a held subject sits on an opaque plate (a card), never directly
  over the drawing. One plate on screen at a time.
- On phone, stack: subject in the bottom half of the stage, plates in the
  top half. Make discrete steps into sticky plates (`position: sticky; top:
  56svh` in the demo) so a step never covers the chat it drives.
- Keep the scroll story on phone only when the change is meaningful (The
  Pudding). Otherwise drop the spine and side stickers and keep the
  protagonist.
- Use `svh` for spans and stage heights. It ignores the mobile toolbar, so
  trigger lines do not jump when it hides.
- Hide nothing that matters behind hover.

## 7. Reduced motion and no JS

WCAG 2.3.3 asks that scroll-driven movement can be turned off. The runtime
does this for you: under `prefers-reduced-motion` or without JS,
`html[data-story]` is `static`, pins release, scenes flow as normal sections
and every track and reveal shows its finished state.

That only works if the finished state is the CSS fallback. Two traps:

- A blanket reduced-motion rule like `* { animation: none !important }`
  removes the negative delay that parks a track at `--rest`. Exclude
  `[data-track]` from it, or make the element's base style equal its rest
  state.
- Tracks whose finished state is off screen (a bike that rides out) need
  `--rest` set to a frame where the subject is visible (`--rest: 0.5`).

Opacity and colour changes do not count as motion, so cross-fades are a
safe reduced-motion swap for moves and zooms.

## 8. The runtime (`kit/`)

Set the mode before first paint so nothing jumps, then link the kit
before your own stylesheet:

```html
<script>
  document.documentElement.dataset.story =
    matchMedia('(prefers-reduced-motion: reduce)').matches ? 'static' : 'live';
</script>
<link rel="stylesheet" href="kit/story.css">
<link rel="stylesheet" href="styles.css">
<script src="kit/story.js" defer></script>
```

Copy `kit/story.js` and `kit/story.css` next to the page when you ship it.
There are no dependencies. The script is classic, so it runs from `file://`.

Why a runtime and not CSS `animation-timeline: view()`: Firefox has not
shipped scroll-driven animations in a release build as of October 2026, and
`animation-range` is unsupported even behind its flag. The runtime writes
custom properties, so the motion itself is still CSS.

### Markup

| Attribute | On | Effect |
|---|---|---|
| `data-scene` | A section | Becomes a scene. Height is `--span` screens (default 2.5). Scenes nest: an outer run holds inner chapters |
| `data-stage` | First child of a scene | Sticky, 100svh, clipped. The next sibling is pulled up to scroll over it |
| `data-steps` | A sibling after the stage | Container for discrete steps; adds top and bottom padding |
| `data-step` | Each step | Min height `--step` (85svh). The active one gets `.is-active` |
| `data-track` | Any element with `animation-name` | Scrubs that animation. Value: empty (closest scene), `#id` (a named scene), `page` or `story` |
| `data-range="a b"` | A track | Plays the whole animation inside part of the source's progress, for example `0.45 0.95` |
| `data-reveal` | Copy or art | One of `lines`, `lift`, `rule`, `draw`, `unmask`, `count` |
| `data-chapters` | The nav | Its `#hash` links get `aria-current="step"` for the active scene |
| `data-stagger` | A container | Each child gets `--d`, its distance from the origin (0 to 1). Value: `first` (default), `center` or `last` |
| `data-grid="cols rows"` | A staggered container | Measures `--d` in 2D, so `center` ripples out from the middle cell |

### What it writes

| Where | Property | Range |
|---|---|---|
| `<html>` | `data-story` | `live` or `static` |
| `<html>` | `data-active-scene` | The id of the scene under the middle of the viewport |
| `<html>` | `--page`, `--v` | Page progress; how far the smoothed scroll lags the real one, in screens (a speed signal for blur or lean) |
| `[data-scene]` | `--p` | 0 when the scene's top hits the viewport top, 1 when its bottom hits the viewport bottom |
| `[data-scene]` | `--enter`, `--leave` | The screen before `--p` starts; the screen after it ends |
| `[data-scene]` | `data-state` | `before`, `active` or `after` |
| `[data-scene]` | `data-current` | Index of the active step, `-1` before the first |
| `[data-track]` | `--t` | 0 to 1 within its range |
| `[data-reveal]` | `--e` | 0 when the element's top is at 92% of the viewport, 1 at 56% |
| `[data-stagger] > *` | `--d` | Written in both modes, so value staggers hold without motion |
| `[data-reveal][data-stagger] > *` | `--e` | Each child's reveal, delayed by up to 0.18 of a screen for `--d: 1` |

### Reveal presets

| Value | Markup | Result |
|---|---|---|
| `lines` | `<h2 data-reveal="lines"><span class="line"><span>Word word</span></span>…</h2>` | Each line rises out of a mask, staggered |
| `lift` | Any block | Fades and rises 2.25rem |
| `rule` | A divider | Draws left to right |
| `draw` | An SVG; every stroke has `pathLength="1"` | Strokes draw on |
| `unmask` | A figure with an `img` | Clips open from the top while the image settles from 115% |
| `count` | Text holding one number | Counts from 0, keeping the decimals and digit grouping |

### Tracks

A track is a normal `@keyframes` animation that the runtime parks at
`--t`. Write the keyframes for the whole change, from 0 to 1:

```css
.tyre { transform-origin: 0 84px; animation-name: inflate; }
@keyframes inflate { from { transform: translateY(6px) scale(1.06, 0.86); } to { transform: none; } }
```

```html
<g class="tyre" data-track="#patch" data-range="0.45 0.95">…</g>
```

Gotchas:

- Set `animation-name` only. The `animation` shorthand resets the delay the
  runtime uses to scrub.
- One element, one owner of `transform`. If a reveal and a track both need
  to move an element, wrap it, or tilt with the `rotate` and `translate`
  properties, which stack with `transform`.
- Elements with a `transform` transition (hover lifts on buttons) lag behind
  a scrub. Do not put reveals on them.
- To count a readout from a track, register an integer and print it with a
  counter:

```css
@property --wob { syntax: "<integer>"; inherits: false; initial-value: 0; }
.readout { animation-name: wobble-count; counter-reset: wob var(--wob); }
.readout::before { content: "Wobble 0." counter(wob) " mm"; }
@keyframes wobble-count { from { --wob: 4; } to { --wob: 0; } }
```

- Show discrete states with selectors, not JS:
  `.booking[data-current="1"] .m3 { opacity: 1 }` or
  `.run:has(#patch:not([data-state="before"])) .t-patch { display: block }`.
- Holds inside a track are flat keyframe segments (`40%, 60% { … }`).

### Stagger

`data-stagger` is the anime.js `stagger()` idea without the library. Time
staggers come free on reveals: `<ul data-reveal="lift" data-stagger>` lifts
its items one after another. Value staggers read `--d` in CSS:

```css
.dots { display: grid; grid-template-columns: repeat(13, 1fr); }
.dots > * { scale: calc(1.1 - var(--d, 0) * 0.35); }
```

```html
<div class="dots" data-stagger="center" data-grid="13 13">…169 dots…</div>
```

To stagger a scrubbed track across children, give each child its own
keyframes and offset its clock by `--d`. The parent carries `data-track`
for `--t`; the children inherit it:

```css
.dots > * {
  animation: pop 1s linear both paused;
  animation-delay: calc(clamp(0, var(--t, 1) * 1.4 - var(--d, 0) * 0.4, 1) * -1s);
}
```

Use the shorthand here only because the child is not itself a
`data-track`.

### Debug

Add `?story-debug` to the URL (or `data-story-debug` to `<html>`) for a
panel listing every scene with its `--p`, state and active step, the same
job as anime.js's `debug: true`. Use it when a track does not move: a scene
stuck at `p 0.00` is too short (`--span`) or not where you think it is.

## 9. Lessons from animejs.com

The anime.js landing page (captured October 2026) is one of the clearest
product scroll stories on the web. What it does, in this file's terms:

1. **Establishing shot.** The hero is the brand mark: a ring with one arc
   per module colour, a demo playing inside it.
2. **Push-in.** The camera moves through the ring into a 3D engine, the
   protagonist.
3. **Ground wipe and explode.** The ground flips from dark to a light
   blueprint. The engine turns into a line drawing and comes apart, each
   module labelled with a leader line (`timer`, `stagger`, `svg`).
4. **Frame and chapter colour.** The ground goes dark again and the ring
   returns as a dial. Each feature chapter plays its demo inside the dial
   and lights the dial arc in its own colour. Its heading, demo and code
   card share that colour. The code on screen is the code running.
5. **Spine.** A tick-mark rail at the bottom right shows progress and
   jumps to chapters.
6. **Payoff.** The engine explodes once more to show bundle size per module,
   then the dial frames the closing grid of documentation links.

Take four things: the brand mark as the frame, one colour per chapter
carried through every surface, an explode scene for "what is inside" and
the demo beside the code that makes it (for any product: the input beside
the output).

Do not copy: at 390px the first frame painted the next chapter's heading
over the hero headline before the page settled. Check the phone storyboard
at scroll 0 for exactly this.

When the page needs what CSS cannot do (shape morphing, motion
along a path, springs, dragging), anime.js v4 is MIT licensed and modular
(about 24.5 KB for everything, less when you import only `animate` and
`onScroll`). Its `onScroll({ sync: 0.25 })` smooths the same way the kit
does. Give anime.js the one element that needs it and keep `kit/story.js`
for the scenes, steps and reveals around it.

## 10. The story check

Run after every build, then look at the frames:

```bash
PW_DIR=<dir containing node_modules/playwright> \
  node <skill-dir>/scripts/story-frames.mjs "file://$PWD/index.html" ./.story
PW_DIR=… node <skill-dir>/scripts/story-frames.mjs "file://$PWD/index.html" ./.story-phone 390 844
```

It captures every scene at the start, middle and end of its travel and
writes `storyboard.jpg`, one row per scene. It prints the runtime's
`[story] live: N scenes, N tracks, N reveals` line; no line means the kit
did not load.

Read the storyboard and answer:

1. **Mute test.** Cover the copy. Can you tell what happened from the
   pictures alone? Each row should differ from its left neighbour by the
   change the table names.
2. **Cut test.** Look across each boundary. Can you name what carried over?
3. **Collision test.** On desktop and phone, does any plate cover the subject
   it describes, or any line of copy sit on the drawing?
4. **Peak test.** Does the peak frame match the sentence in `## Story`?
5. **Static test.** Open the audit's `reduced-motion.jpg`. Every scene
   should read as a finished section.

The full auditor (`scripts/audit-page.mjs`) also checks that pinned stages
hold for at least 1.8 screens and samples reveal coverage. Reveals that
finish before the auditor's sample points can read as "static" there;
trust the storyboard for the story.

## Sources

- Oesch, Renner and Roth, "Scrolling into the Newsroom", Information Design Journal (2022). https://doi.org/10.1075/idj.22005.oes
- Seyser and Zeiller, "Scrollytelling: An Analysis of Visual Storytelling in Online Journalism", IV (2018). https://doi.org/10.1109/iv.2018.00075
- McKenna et al., "Visual Narrative Flow", EuroVis (2017). https://narrative-flow.github.io/paper/visual-narrative-flow.pdf
- Segel and Heer, "Narrative Visualization", InfoVis (2010). http://vis.stanford.edu/files/2010-Narrative-InfoVis.pdf
- Heer and Robertson, "Animated Transitions in Statistical Data Graphics", InfoVis (2007). http://jheer.org/publications/2007-AnimatedTrans-InfoVis.pdf
- Mike Bostock, "How to Scroll" (2014). https://bost.ocks.org/mike/scroll/
- The Pudding, responsive and sticky scrollytelling. https://pudding.cool/process/responsive-scrollytelling/ and https://pudding.cool/process/scrollytelling-sticky/
- Scrollama. https://github.com/russellsamora/scrollama
- NN/g, "Scrolljacking 101" (2023). https://www.nngroup.com/articles/scrolljacking-101/
- Robert Kosara, "The scrollytelling scourge" (2016). https://eagereyes.org/blog/2016/the-scrollytelling-scourge
- Awwwards case studies: Inkwell (https://www.awwwards.com/inkwell-a-scroll-driven-narrative-for-ais-most-stealth-player.html), Igloo Inc (https://www.awwwards.com/igloo-inc-case-study.html), Tracing Art (https://www.awwwards.com/tracing-art.html)
- Scott McCloud, Understanding Comics (1993), chapter 3.
- NYT, "How we made Snow Fall". https://source.opennews.org/articles/how-we-made-snow-fall/
- WCAG 2.2, Understanding 2.3.3 Animation from Interactions. https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- Scroll-driven animations support. https://web-platform-dx.github.io/web-features-explorer/features/scroll-driven-animations/
- anime.js landing page and documentation: onScroll synchronisation modes, stagger. https://animejs.com/ and https://animejs.com/documentation/events/onscroll/scrollobserver-synchronisation-modes and https://animejs.com/documentation/utilities/stagger
