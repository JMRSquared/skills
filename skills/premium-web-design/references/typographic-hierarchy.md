# Typographic hierarchy

The standard every page built with this skill uses for type sizes, levels and
spacing. `typography.md` picks the faces. This file decides how big each piece
of text is, how many sizes a screen may show, and how far apart they sit.

A reviewer rejected a site built under the old rules as "very ugly" on text
hierarchy alone. The failure had five parts, and each rule below answers one:

1. Six or seven competing sizes in one screen, none clearly in charge
2. Tiny uppercase labels on every block, tracked wide, often in mono
3. Section titles at a different size in every section
4. Body copy at 14–15px in a mid grey
5. Headings that were one-word fragments ("Craft.", "Precision.") a reader
   could not act on

The rule set is numeric so the auditor and a reviewer can check it. Where a
number comes from a source, the source is named in brackets.

## Sources, briefly

| Source | What this standard takes from it |
|---|---|
| Butterick, *Practical Typography* | Web body 15–25px; line spacing 120–145%; line length 45–90 characters; at most three heading levels, two is better; emphasise a heading with space above and below; bold, not italic; no all-caps headings; caps get 5–12% letterspacing; paragraph space 50–100% of body size |
| Bringhurst, *Elements of Typographic Style* | Sizes come from a modular scale (a fixed ratio such as 3:4 or 2:3), not from taste per element; 45–75 characters per line, 66 the norm |
| Wathan & Schoger, *Refactoring UI* | Size, weight and colour are three separate levers; emphasise by de-emphasising the rest; the one most important element may use all three, nothing else does; labels are a last resort |
| Material 3 type scale | A small fixed set of roles (display, headline, title, body, label), each a size + line-height + weight + tracking bundle; display is reserved for short text on large screens |
| Apple HIG text styles | Body at 17pt is the reading default; every style carries its own leading and tracking; hierarchy comes from a handful of named styles |
| Utopia (utopia.fyi) | Fluid type: a base size and a ratio at a small viewport, another pair at a large one, and `clamp()` interpolating between them, in `rem + vw` so browser zoom still works |
| `better-typography` skill (jakubkrehel/skills) | Headings descend with level and a child never outranks its parent; tight leading (≈1.1) only on short text; weights under 300 only at 28px+; cap the measure |
| The corpus, measured | See the next table |

### What the corpus does

| Site | Measured | Lesson |
|---|---|---|
| Amrit Palace | h1:h2:h3 = 115 : 65 : 50px (1.78×, 1.29×), one display weight (300), tracking a constant −4% of size | Few sizes, big steps, one rule applied at every size |
| Hagi's | 150 : 65 : 11px, two families split by voice and function | Two type jobs, not seven |
| Blind Barber | One family, three cuts; display −4%, mid −2%, micro +2% tracking | Tracking is set by role, never per element |
| Tripletta | 270 : 101 : 43px (2.68×, 2.33×), one caps display face | Steps of 2× and more read as intent |
| Plomberie 5 Étoiles | h1 : h2 : h3 = 38.4 : 35.2 : 36px; headline:body 2.4:1; body 16px at weight 600 in `#555` | The counter-example. Three heading tags at one size, semibold grey body. This is what "ugly hierarchy" measures like |

Award sites also run 10–11px nav. They buy it with very little copy and a
giant display. Our pages carry a local business's real copy, so this standard
sets a higher floor and does not copy the tiny chrome.

## The six roles

Every piece of visible text on the page maps to exactly one role. A new
size is a new role, and a seventh role is not allowed.

Scale: body 17px at 390 and 18px at 1440. The ratio runs ≈1.24 on the phone
and 1.333 (Bringhurst's perfect fourth, 3:4) on desktop, with display allowed
to break out of the scale on purpose.

| Role | Element | 390 | 1440 | Weight | Line-height | Tracking | Case | Max measure | Colour |
|---|---|---|---|---|---|---|---|---|---|
| **display** | the hero `h1`, and the one second type event | 52px | 160px (retune within 6–14vw) | display face, committed: 200–300 or 800–900, or the face's only weight | 0.88–1.0 | −0.03 to −0.045em | sentence; caps only if the face is drawn for it and ≤6 words | 8–14ch, `text-wrap: balance` | `--ink`, or `--accent` on a field band |
| **title** | section `h2` | 35px | 56px | same face and weight as display | 1.0–1.1 | −0.02 to −0.03em | sentence | ≤20ch | `--ink` |
| **heading** | subsection `h3`, row names, card names | 26px | 32px | display face at display weight, or text face at 600 | 1.15–1.2 | −0.01 to −0.015em | sentence | ≤30ch | `--ink` |
| **lead** | the standfirst under display or title | 21px | 24px | text face 400 | 1.35–1.45 | 0 to −0.005em | sentence | ≤45ch | `--ink` |
| **body** | paragraphs, list items, prices in running copy, button labels | 17px | 18px | text face 400; buttons 500–600 | 1.5–1.6 (buttons 1) | 0 | sentence | 60–72ch, never over 75 | `--ink`. Never `--ink-muted` |
| **small** | meta, captions, form labels, nav links, footer, legal | 15px | 15px | text face 400; labels and nav 500 | 1.45–1.5 | 0 (caps: +0.06 to +0.1em) | sentence; caps ≤3 words | ≤60ch | `--ink-muted`, at ≥4.5:1 on its ground |

Steps between adjacent roles, desktop / phone:

| Pair | 1440 | 390 |
|---|---|---|
| display : title | 2.86× | 1.49× |
| title : heading | 1.75× | 1.35× |
| heading : lead | 1.33× | 1.24× |
| lead : body | 1.33× | 1.24× |
| body : small | 1.20× | 1.13× (colour carries the rest) |

### Ready-to-paste tokens

Utopia-style `rem + vw` clamps, interpolated linearly between 390 and 1440.
Each comment states both endpoints, so a reviewer can check the maths.

```css
:root {
  /* roles: 390px → 1440px */
  --t-display: clamp(3.25rem, 0.743rem + 10.286vw, 10rem);    /* 52 → 160 */
  --t-title:   clamp(2.1875rem, 1.7rem + 2vw, 3.5rem);         /* 35 → 56  */
  --t-heading: clamp(1.625rem, 1.486rem + 0.571vw, 2rem);      /* 26 → 32  */
  --t-lead:    clamp(1.3125rem, 1.243rem + 0.286vw, 1.5rem);   /* 21 → 24  */
  --t-body:    clamp(1.0625rem, 1.039rem + 0.095vw, 1.125rem); /* 17 → 18  */
  --t-small:   0.9375rem;                                      /* 15       */

  --lh-display: 0.92;  --lh-title: 1.04;  --lh-heading: 1.18;
  --lh-lead: 1.4;      --lh-body: 1.55;   --lh-small: 1.5;

  --tr-display: -0.04em;  --tr-title: -0.025em;  --tr-heading: -0.012em;
  --tr-caps: 0.08em;      /* small caps labels only */

  /* spacing bound to the roles (see "Space binds type to hierarchy") */
  /* multiples of BODY size, written as calc so a 32px h3 does not turn 3em into 96px */
  --sp-above-heading: calc(var(--t-body) * 3);     /* 51 → 54px */
  --sp-below-heading: calc(var(--t-body) * 0.75);  /* 13 → 14px */
  --sp-title-to-text: 1.5rem;  /* 24px; 2rem at ≥900px */
  --sp-paragraph:     0.85em;
}
@media (min-width: 900px) { :root { --sp-title-to-text: 2rem; } }

h1, .t-display { font: var(--display-weight) var(--t-display)/var(--lh-display) var(--font-display);
                 letter-spacing: var(--tr-display); text-wrap: balance; max-width: 14ch; }
h2, .t-title   { font: var(--display-weight) var(--t-title)/var(--lh-title) var(--font-display);
                 letter-spacing: var(--tr-title); text-wrap: balance; max-width: 20ch; }
h3, .t-heading { font-size: var(--t-heading); line-height: var(--lh-heading);
                 letter-spacing: var(--tr-heading); text-wrap: balance; max-width: 30ch;
                 margin-block: var(--sp-above-heading) var(--sp-below-heading); }
.t-lead        { font: 400 var(--t-lead)/var(--lh-lead) var(--font-text); max-width: 45ch; }
body, .t-body  { font: 400 var(--t-body)/var(--lh-body) var(--font-text); color: var(--ink); }
p              { max-width: 68ch; text-wrap: pretty; margin-block: 0 var(--sp-paragraph); }
.t-small       { font-size: var(--t-small); line-height: var(--lh-small); color: var(--ink-muted); }
```

Retune **display only**, and only within 6–14vw at 1440 (Tripletta runs
18.8vw as a wordmark, which is a logo, not a headline). If you change a
different role, recompute both clamp endpoints and keep every step in the table
above ≥1.2× from 20px up. Never add a role between two existing ones to fix one
element. Move the element into a role.

## Rules

### R1. Levels per screen

- **At most three levels compete in any one viewport**: one dominant (display
  or title), one supporting (heading or lead), one reading (body). The small role
  may appear as a fourth size. So: **four distinct sizes per screen, at most.**
- A section uses **lead or headings in the same screen, not both**. Title + lead
  + body, or title + headings + body.
- **Six sizes per page, at most**, one per role. Two sizes within 6% of each
  other count as one size set carelessly. Merge them.
- **One dominant per screen.** If two things are display-sized in one viewport,
  neither is dominant (`typography.md` already says this for the hero).

### R2. Minimum step between levels

- Adjacent levels at 20px and above differ by **≥1.2×**, and the design target
  is 1.25–1.33. A 38px heading next to a 36px heading is one level wearing two
  tags. That is the Plomberie measurement.
- display : body **≥5:1** at 1440 and **≥3:1** at 390.
- A child heading never renders larger than its parent (`better-typography`).

### R3. One lever per distinction

Refactoring UI's three levers, used one at a time:

| Distinction | Lever | Not |
|---|---|---|
| Between levels (title vs heading vs body) | **size** | colour, or a weight bump at the same size |
| Between roles at one size (button vs paragraph, label vs value) | **weight** (400 vs 500–600) | a new size |
| Primary vs secondary inside one block (price vs "per hour") | **colour** (`--ink` vs `--ink-muted`) | a smaller size under 15px |

Only the single most important element on a screen may use all three. Weight
contrast inside one family is 400 against 500–600, never 300 against 400; the
reader cannot see that step (Butterick, `better-typography`).

### R4. Space binds type to hierarchy

- **Space above a heading ≥ 2× the space below it.** The heading belongs to
  what follows it (Butterick on headings; Gestalt proximity). The tokens give
  54px above and 14px below at desktop: 3.9×.
- Title → first line of text: 24px phone, 32px desktop. A title floating 80px
  above its paragraph reads as a separate section.
- Paragraph spacing 0.75–1em of body size (Butterick: 50–100%). Do not use an
  empty line plus a first-line indent together.
- Label → value: 4–8px. Label above value, never beside it at the same size.
- A band opens with its title. The band's entering padding (`--band-y-in` in
  Step 3) is the space above the title. Do not add a margin on top of it.

### R5. Body is readable, full stop

- Body 17px phone, 18px desktop. **16px is the floor; nothing a reader needs is
  set under 15px.** The 13px absolute minimum is for legal lines and
  copyright only.
- Body is `--ink`. `--ink-muted` is for the small role only, and must clear
  4.5:1 on its ground. Grey paragraphs are the commonest AI tell
  (`build-loop.md`, `contrast`).
- Body weight is 400. Semibold body (Plomberie's 600) leaves the page no light
  mass.
- Line length 60–72 characters (Bringhurst 45–75, Butterick 45–90). Use `ch`
  on the text block, not on the section.

### R6. Labels are a last resort

- **No eyebrow by default.** The section title says what the section is. An
  eyebrow above a title is allowed once per three sections (`eyebrow-density`
  measures it), and only when it carries information the title cannot: a
  date, a place, a price band.
- When a label is used it is the **small** role: 15px, sentence case. If it is
  caps, it is ≤3 words, ≥14px, tracked +0.06 to +0.1em. Never 10–12px, never
  0.14em+.
- **No numbered section labels** (`01 / SERVICES`). The composition shows the
  order.
- **Mono only for real data**: prices in a table, times, dimensions, codes. One
  mono role per page, set at the small or body size. A mono face used as
  decoration is a third family doing noise.
- Middot chains (`EST. 1998 · LEEDS · MON–SAT`) stay inside
  `content-and-copy.md`'s budget, and they use the small role.
- Text drawn inside an SVG figure, such as a diagram annotation, is part of the
  image. Anything a reader needs in order to act (a price, an hour, a phone
  number) goes in a role.

### R7. One title size for every section

- Every section `h2` uses `--t-title`. No per-section `font-size` override. The
  only other size an `h2` may render at is display, for the one second type
  event. **Two `h2` sizes per page at most.**
- Every subsection `h3` uses `--t-heading`, in every section.
- Heading tags follow document structure (`h1` once, `h2` per section, `h3`
  inside). Pick the tag for structure, then the role for size. Never pick a tag
  for its default size.

### R8. Headings say something

- A title or heading names the subject and makes a claim a reader can act on:
  "Boiler repairs in Leeds, usually the same day". It does not stop at a mood
  word: "Craft.", "Precision.", "Our story", "Excellence".
- Someone reading **only the headings** down the page should understand what is
  sold, where, and how to get it.
- Display may be a short statement, but it still has to be a sentence a
  customer could repeat. The copy rules live in `content-and-copy.md`.

### R9. Case and tracking

- Sentence case everywhere. No Title Case Headings, and no caps headings unless
  the display face is a caps face (Amrit, Tripletta), and then only display.
- Tracking follows the role's own value at every size, the way Blind Barber
  holds −4% across breakpoints. Never track body. Caps always get positive
  tracking.

## Failure modes, as numbers

| What the reviewer sees | Measurable form | Ship instead |
|---|---|---|
| Many competing sizes | >4 sizes in one viewport, or >6 on the page | Map every element to a role; delete the extra sizes |
| Labels sprinkled everywhere | an eyebrow on more than one section in three; any label under 14px; caps tracking ≥0.12em | Delete them. The title carries the section |
| Mono/label noise | mono on anything that is not data; more than one mono role | Text face, small role |
| Inconsistent heading sizes | more than two `h2` sizes on a page; an `h3` larger than the `h2` above it | `--t-title` and `--t-heading`, everywhere |
| Body too small or grey | body under 16px; paragraphs in `--ink-muted`; body weight ≥600 | 17/18px, `--ink`, 400 |
| Cryptic headings | a heading under 3 words that names no subject | A sentence a customer could repeat |
| Flat hierarchy | adjacent levels ≥20px within 1.2×; display : body under 5:1 at 1440 | Use the scale's steps |

The auditor reports the first, fourth and flat-hierarchy rows as WARN
`type-levels`, the label row as WARN `eyebrow-density`, and the shape of a
cryptic `h1`/`h2` (under four words, or a verbless fragment with a full stop)
as WARN `headline-cryptic`. The rest is yours to check by eye.

## Worked example 1: a local service business section

A plumber's services band, 1440 wide. Before, as built under the old rules:

```
OUR SERVICES                 ← 12px caps, 0.14em, mono, #8A8A8A
Precision.                   ← 64px display
Boilers, leaks, bathrooms    ← 36px h3
Repairs                      ← 38px h3, a different section's override
We fix boilers fast…         ← 15px, #777, weight 400
£85 CALL-OUT · 24/7 · LEEDS  ← 11px mono chain
```

Six sizes in one screen, two headings within 6% of each other, an unreadable
label and grey body. After:

```html
<section class="services">               <!-- band opens with the title -->
  <h2 class="t-title">Boilers, leaks and new bathrooms across Leeds</h2>
  <p class="t-body">We answer the phone ourselves, 7am to 9pm, and most repairs
     are done the same day.</p>
  <ul class="rows">
    <li>
      <h3 class="t-heading">Boiler repair</h3>
      <p class="t-body">Gas Safe engineer, parts on the van for most Worcester,
         Vaillant and Ideal boilers.</p>
      <p class="t-heading price">£85 call-out</p>   <!-- text face, 500, tabular -->
      <p class="t-small">Includes the first hour. Parts quoted before we fit them.</p>
    </li>
    …
  </ul>
</section>
```

| Element | Role | 1440 | 390 |
|---|---|---|---|
| Section title | title | 56px display face, `--ink` | 35px |
| Intro | body | 18px, `--ink`, 68ch | 17px |
| Service name, price | heading | 32px; price in text face 500, `tabular-nums` | 26px |
| Description | body | 18px | 17px |
| Terms line | small | 15px, `--ink-muted` | 15px |

Four sizes in the screen (56, 32, 18, 15). Steps 1.75×, 1.78×, 1.2×. Space:
54px above each service name, 14px below. No eyebrow: "Boilers, leaks and new
bathrooms across Leeds" already says what the band is.

## Worked example 2: a marketing hero

A bakery's first screen, 1440 × 900.

```html
<section class="hero">
  <h1 class="t-display">Seven loaves, baked before seven.</h1>
  <p class="t-lead">One wood-fired oven under the Druid Street arches. When the
     shelf is empty we shut the door.</p>
  <a class="btn" href="tel:+442072310114">Ring 020 7231 0114</a>   <!-- body, 600 -->
  <p class="t-small">Open Wednesday to Sunday, 7.30 until sold out.</p>
</section>
```

| Element | Role | 1440 | 390 |
|---|---|---|---|
| Headline | display | 160px, weight 300, 0.92, −0.04em, 3 lines at 11ch | 52px, 3 lines |
| Standfirst | lead | 24px, 1.4, 45ch | 21px |
| Button label | body at 600 | 18px | 17px |
| Hours | small | 15px, `--ink-muted` | 15px |

Four sizes (160, 24, 18, 15). display : body = 8.9:1 at 1440 and 3.1:1 at
390. Space: lead sits 32px under the headline, the button 40px under the lead,
hours 16px under the button: each item nearer the thing it belongs to than to
the thing above. The nav, in the small role at 15px weight 500, is chrome
and does not count as a level. The largest type on the page is still a
later section's type event (Step 4b), also set in the display role.

## Checklist

- [ ] Role table posted in Step 3 with real families, both endpoints per role,
      weight, line-height, tracking, case, measure and colour
- [ ] Every text element maps to one of the six roles; no one-off `font-size`
- [ ] ≤4 sizes in any viewport at 1440 and at 390; ≤6 on the page
- [ ] Adjacent levels ≥20px differ by ≥1.2×; display : body ≥5:1 desktop, ≥3:1 phone
- [ ] Every section `h2` renders at one size (plus at most the one display event)
- [ ] Body 17/18px, weight 400, `--ink`, 60–72ch
- [ ] Nothing a reader needs under 15px; no caps label under 14px or tracked ≥0.12em
- [ ] Eyebrows ≤1 per 3 sections, each carrying information the title does not
- [ ] Mono used only for data, at most one mono role
- [ ] Space above every heading ≥2× the space below it
- [ ] Reading only the headings tells a stranger what is sold, where, and how to get it
- [ ] `audit-page.mjs` reports no `type-levels` and no `eyebrow-density`
