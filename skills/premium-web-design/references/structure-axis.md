# Structure axis: grammar, signature move, fingerprint gate

The aesthetic axis (palette, faces, motion, density) decides how a page **looks**.
The grammar axis decides what a page **is**. Two pages in the same grammar
feel related no matter how far apart their palettes are. A build that only
changes the palette reaches for the same skeleton every time, and four sites
in a row end up looking like the same site with the photos swapped.

Three things, in this order, before any markup: pick a **grammar**, invent one
**signature move**, pass the **fingerprint gate**.

`full.md` Step 1 sets the aesthetic direction (vibe, hero, section system, three
signature moments). This file sets the structure. Read both, then pick the
grammar that fits the brief.

## 1. Page grammars

A grammar is the page's organising logic: what a section is, what the chrome
is for, how the visitor knows where they are and what the ending is. Pick one
and obey its **forbids**. The forbids are the point: they stop a build drifting
back to the default halfway through.

### Filmic one-shot

The original skeleton, now one choice among eight rather than the house style.

- **Fits:** a single linear argument with one emotional arc. Consumer
  products, launches, anything where the visitor should feel carried rather
  than navigating.
- **Scrolls like:** a film you push through. Continuous, no seams, each act
  handing off before the last has left.
- **Forbids:** visible sequence (chapter numbers, an index, a progress
  readout), hard cuts between grounds, chrome that implies the page is a tool,
  more than one entry point. If the visitor can jump, it is not one shot.
- **Nav, hero, close:** fixed minimal bar (wordmark + one CTA). Full-bleed scrub
  hero with corner-anchored kinetic headline. Pinned close with a spotlight and
  a magnetic CTA.
- **Leans on:** scrub, pin, drift, kinetic.
- **Use it when the brief earns it.** The first four builds of any similar
  workflow reached for this grammar by default, which is exactly why it now
  carries a burden of proof the others do not. Say in the report why the other
  seven did not fit.

### Chaptered editorial

The page is a printed feature. Chapters are the unit, not acts.

- **Fits:** long-form substance. A method, a manifesto, a founder story,
  research-backed products, anything where the visitor should feel they read
  something rather than watched something.
- **Scrolls like:** turning pages. Full-stop intertitles between chapters, then
  dense asymmetric spreads. Hard cuts, not crossfades.
- **Forbids:** drift as a continuous gradient (each chapter is a hard change of
  ground), the full-bleed scrub hero, pinned crossfade type acts, magnetic CTA,
  centred hero copy. Media sits in its own column with a caption; nothing bleeds
  under type.
- **Nav, hero, close:** no fixed bar. A folio in the margin with chapter number
  and title, updating as chapters pass. The hero is a **title page**: type on
  paper ground, no media above the fold. The close is a colophon or masthead
  plate, small type, the CTA set as a line of running text rather than a
  button island.
- **Leans on:** flow + in, reveal at chapter boundaries, parallax inside a
  media column, count for real figures inside prose.

### Live surface

The page behaves like the product. Not a screenshot of it and not a
div-built fake: the actual surface, running, with scroll driving its state.

- **Fits:** software, tools, dashboards, editors, anything where the demo is
  the argument.
- **Scrolls like:** operating something. Panels populate, a log fills, a graph
  advances, a selection moves. The visitor is inside the thing.
- **Forbids:** marketing chrome of any kind. No wordmark-plus-CTA bar, no
  scrims, no full-bleed photography, no kinetic headline stacks, no hero claim
  laid over footage. Copy lives in the surface's own idiom: labels, tooltips,
  empty states, status lines, a help panel. A section heading in display type
  breaks this grammar instantly.
- **Nav, hero, close:** app chrome replaces nav. A sidebar, a tab strip, a
  status bar, whatever the real product would have and real enough to be the
  navigation. The hero is the surface already in a state, not a title. The
  close is an **actual input**: a command line, a field, a first-run step,
  something the visitor puts a cursor in. A magnetic button is the wrong
  ending for a page that spent its whole length being a tool.
- **Leans on:** pin (the surface holds while state advances), count on real
  telemetry, pointer devices where the real product would have them.
- **The honesty rule.** The page has to be real markup running real logic on
  real or clearly-labelled sample data. Div-built fake dashboards, fake
  terminals and screenshots of surfaces all fail this grammar. If the panels
  cannot actually compute, the grammar is unavailable. Pick another.

### Continuous world

One canvas, fixed for the entire scroll and the page travels through it.
Waypoints, not sections.

- **Fits:** a journey with real geography. A supply chain, a process with
  physical stages, a place, a build, anything where "where you are" matters.
- **Scrolls like:** moving through a single space that never cuts. The visitor
  never leaves the frame.
- **Forbids:** section boundaries of any kind. No act blocks, no second stage,
  no drift steps. The only element in document flow is the spacer. Nothing
  may scroll over the canvas: copy arrives inside it, at waypoints, in the
  fixed copy layer.
- **Nav, hero, close:** the nav is a **map**. A waypoint list, a depth readout,
  a position marker and it is clickable, because a world you cannot skip
  around in is a video. The hero is an establishing position inside the world.
  The close is arrival at a place in the same canvas and the CTA is an object
  in that place.
- **Leans on:** worldflight legs with linger, copy windows against the whole
  track.
- **This is the expensive one.** A single unbroken camera flight is the most
  fragile thing you can build and it exists only to hide cuts between scenes.
  Choose it only when the brief is literally about travel through a place, and
  budget for the reroll.

### Typographic poster

Type is the imagery. Media is minimal or absent and scale contrast does every
job that photography would have done.

- **Fits:** a brand whose asset is a sentence. Manifestos, agencies with strong
  verbal identity, launches with one claim, anything where a stock-looking
  image would weaken the page. Also the right answer when there are no good
  assets and generating them would produce eight plausible, forgettable frames.
- **Scrolls like:** words arriving at wildly different weights. A word at 40vw,
  then a paragraph at 16px, then silence. Rhythm comes from scale, not motion.
- **Forbids:** photographic ground, scrub, scrims (nothing to scrim), cards of
  any kind, decorative motion. If a device is doing the work instead of the
  typography, the grammar has already failed.
- **Nav, hero, close:** the wordmark is set as part of the composition, at
  composition scale, not as a 14px bar item. There may be no persistent nav at
  all. The hero is a single word or one line at extreme scale, filling the
  viewport, with a real `<h1>` behind it. The close inverts the whole page:
  the smallest type on the site, the CTA as a plain underlined link, quiet
  after all that volume.
- **Leans on:** kinetic (this is the one grammar where character splitting can
  be right), pin with scale driven from `--sc-p`, reveal as a wipe across
  letterforms, drift doing heavy lifting because the ground is most of the
  frame.

### Gallery / catalog

Objects in a walkable collection. Museum labels, not marketing copy.

- **Fits:** a range. Products with variants, a portfolio, a menu, a materials
  library, case studies, anything where the visitor's real question is "what
  are the options" rather than "should I believe you".
- **Scrolls like:** walking a room. Lateral drift with vertical scroll,
  objects entering and leaving at their own pace, each one labelled with fact
  rather than pitch.
- **Forbids:** the argument-shaped pinned type act, a single hero claim, scrim
  copy over media, persuasion in the object labels. A label reads `Cedar.
  Air-dried 18 months. Kiln-finished.` and not `Craftsmanship you can feel.`
  Every object gets the same label schema, no exceptions, because the schema
  is what makes it a collection instead of a grid.
- **Nav, hero, close:** the nav is an **index of objects** and it jumps. The
  hero is object one, already in view, already labelled, with no separate
  title treatment: the collection starts at the top of the page. The close is
  either the last object or an inquiry plate typeset exactly like a label.
- **Leans on:** pan as the spine rather than as one act, reveal per object,
  tilt on objects the visitor would pick up, count for real specs.

### Split stage

Two columns held in tension for the whole page, resolved by scroll.

- **Fits:** any argument with two sides. Before and after, cost and saving,
  manual and automated, what you have and what you would have. The comparison
  is the product.
- **Scrolls like:** watching a balance tip. Both halves are always present,
  both move and the page is going somewhere specific: the moment one side
  wins.
- **Forbids:** full-bleed anything before the resolve, centred copy, the
  corner-anchored hero, a symmetric close. Neither column may be decorative;
  both carry real content the whole way down. The instant one side becomes a
  caption for the other, this collapses into a zigzag layout with extra steps.
- **Nav, hero, close:** no bar. The **divider is the chrome** and it carries
  the labels for both sides plus the progress of the argument. The hero
  establishes the split at 50/50 on the first screen, with both headlines
  readable at once. The close is the **collapse**: the divider travels to one
  edge, one column takes the full width and the CTA lives in the winning
  column. That collapse is the ending and it should be the single most
  satisfying moment on the page.
- **Leans on:** pin with divider position driven from `--sc-p`, reveal per
  side, count for the comparison figures if they are real.

### Rhythmic cutlist

Short hard-cut acts at speed. No pinning, no dwell, no crossfades.

- **Fits:** energy brands. Streetwear, sport, events, music, drinks, youth
  products, anything where the visitor should feel a pulse rather than follow
  an argument.
- **Scrolls like:** a cut every second. Twelve to twenty short sections rather
  than six long ones, each one landing whole and gone. Total page length stays
  inside the 8 to 14 viewport-height budget precisely because nothing is held.
- **Forbids:** any act over ~1.4 viewport-heights, dwell above 0.1, pin
  entirely, overlapping cue windows, slow easing. This grammar is the exact
  inverse of the filmic one-shot: where that one hides its seams, this one is
  made of them.
- **Nav, hero, close:** the bar is loud, not minimal. Full-width, high-contrast,
  possibly a marquee, possibly the CTA at the same weight as the wordmark. The
  hero is one screen that cuts to the next in under a viewport, so there is no
  settling shot and no greet-and-hold. The close is abrupt: the last cut is
  the CTA, at full bleed, no spotlight, no drift-down.
- **Leans on:** flow + in at short stagger, reveal on nearly every section,
  count if the figures are real, hard drift steps between adjacent grounds.
- **The peak problem and how to resolve it.** This grammar bans pin and dwell
  outright while `feeling-curve.md` insists the peak gets the most scroll room
  and the biggest hold. Those pull in opposite directions. Hold in the fixed
  chrome layer instead and keep every act short and unpinned. The bar this
  grammar already asks for is a persistent element that does not belong to any
  act, so it can unfurl, run a long choreography and hold as long as the peak
  needs while the acts underneath keep cutting at full speed. Drive it from
  page scroll rather than from an act's progress. The general form: **when a
  grammar bans the device your peak wants, move the peak out of the act stack
  rather than breaking the grammar.**

## 2. The signature move

Every build must invent **one bespoke interaction that exists on that site
alone**. Not in the device kit, not in any prior build, not a parameter change.
Coded in the page, with `data-sc-*` attributes of your own naming or plain
inline JS reading `--sc-p`. The engine stays untouched.

This is the thing that makes a page memorable after the visitor closes the tab,
and it is the only part of a build that cannot be arrived at by following rules.

### What counts

- **Scroll-as-playhead over a persistent trace rail.** A thin horizontal trace
  fixed at the bottom edge, present the whole page, drawing a real waveform or
  route or timeline. Scroll position is the playhead. Passing an act stamps a
  marker on the trace that stays. By the footer the trace is a complete record
  of what the visitor just went through and it doubles as navigation.
- **A wordmark the pointer can pull apart.** The letters follow the cursor
  with different masses, separate under a drag and settle back into perfect
  lockup when released. Only on the hero, only once and the settle has to be
  exact.
- **A line drawing that builds itself.** An SVG technical illustration whose
  `stroke-dashoffset` is driven from `--sc-p`, so scrolling literally draws
  the object, then the dimension lines arrive, then the callouts. Pairs with
  the drawing worlds in `brand-world.md`.
- **A running receipt.** A small fixed panel that accumulates a line every
  time the visitor passes a claim, with real numbers, so the close arrives
  with a totalled ledger of the argument they just read. Only works with real
  figures.
- **One control that regrades the whole page.** A time-of-day handle, a
  temperature, a load level: one input and every image, ground and accent on
  the page shifts together. It has to affect everything at once or it is a
  widget.

### What does not count

- A recoloured spotlight. A spotlight at a different radius. Two spotlights.
- `data-sc-tilt="9"` instead of `6`. Any parameter change to any kit device.
- A different easing curve on kinetic lines.
- Five cards in the rail instead of three, or the rail scrolling the other
  way.
- A third scrub act. More of a device is not a new device.
- Something the engine already does, given a project-specific class name.

**The test:** describe the move to someone who has seen the other builds. If
they cannot tell it apart from something the kit already does, it is not a
signature move. Reaching for a kit parameter here is the same failure as
reaching for the filmic default, one level down.

## 3. The fingerprint gate

The registry lives in a `FINGERPRINTS.md` at the project root (or wherever
the agent keeps its build log). It starts **empty**: the gate is about not
repeating yourself, so your first build has nothing to clear and every build
after it does.

Before building, read it. Every row is a shape that is now taken.

Before writing markup, check the planned build against every existing row on
these six dimensions:

| # | Dimension | What it records |
|---|---|---|
| 1 | Grammar | Which of §1, or a named new one |
| 2 | Nav treatment | What the chrome is and what it is for |
| 3 | Hero device | What the first screen does |
| 4 | Act-sequence shape | The device order, act count, total viewport-heights |
| 5 | Close pattern | How the last screen behaves and what the CTA sits in |
| 6 | Signature move | The one bespoke interaction, in a phrase |

**The gate: a new build must differ from EVERY existing row on at least 4 of
the 6.** Not 4 of 6 on average across the table. Four against each row,
individually.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, against each row,
and a build that changes only grammar and world will fail it.

If the planned build fails the gate, **change the plan, not the log**.
Rewriting a fingerprint row to make a new build fit is the one thing that
makes the file worthless. It is a record of what exists, not a description of
what you wish existed.

After shipping, append one row. Fill all six dimensions plus world and port.
Say plainly what it shares with prior rows, because the shared columns are what
the next build has to avoid.

## 4. Aesthetic range

Premium-minimal is a choice, not the default costume this skill wears. When
the brief asks for it, take it. When it does not, go where the brief points.

| Family | Reads as | Earned by |
|---|---|---|
| Brutalist | Blunt, structural, unstyled on purpose | Tools, infrastructure, anything anti-marketing |
| Maximalist | Dense, layered, loud, generous | Culture brands, events, food, anything abundant |
| Playful | Bouncy, coloured, informal | Kids, games, consumer apps, community |
| Retro | Specific to a decade, not vaguely nostalgic | Heritage brands, music, anything with a real lineage |
| Dense | Information-forward, small type, high count | Data products, catalogues, reference, finance |
| Editorial | Paper, folios, measure, restraint | Long-form substance |
| Premium-minimal | Quiet, dark, one accent, air | Luxury and only when asked for |

**What does not flex:** the taste floor. Spacing scale and rhythm, type metrics
and measure, contrast ratios measured on the render, motion built from
`transform` and `opacity`, focus-visible on everything, reduced motion that
keeps meaning, real copy and real numbers. Every item in `density-and-devices.md`
and `motion.md` holds in every aesthetic family. A brutalist page still needs
4.5:1 body contrast. A maximalist page still needs a spacing scale and needs
it more, because density without rhythm is just noise. A playful page still
cannot animate `top`. **The floor is what separates a chosen aesthetic from a
sloppy one** and it is the reason range is safe to offer at all.

Two specific traps stay banned in every family, because they are not
aesthetics, they are defaults with a look: the cream-and-brass artisan palette
(softer than every craft brand deserves, see `color-and-light.md`) and
violet-to-blue AI gradients. Both are what a page reaches for when nobody
chose.