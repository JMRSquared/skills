---
name: premium-web-design
description: Build Awwwards-caliber customer-facing websites — Site of the Day bar for design, motion, UX, and craft. Use when building or redesigning marketing sites, product sites, landing pages, brand/campaign microsites, or interactive web experiences; when the user runs /premium-web-design; or asks for premium / Awwwards / award-winning / cinematic web design. Ships measured studies of 15 award sites, a numeric art-direction contract, and a Playwright auditor that scores the rendered page. Do not auto-apply to authenticated app chrome (dashboards, settings, admin, CRUD), design-system primitives, or pure API/infra work unless explicitly invoked.
---

# Premium web design

## The bar

A stranger lands, feels art direction in the first seconds, meets three moments
worth pausing for, understands the offer without reading a wall of copy, and
leaves remembering the brand.

You are operating as creative director, motion designer, and front-end
craftsperson on one brief. Under schedule pressure, cut pages — never craft on
what ships.

## Why sites built with this skill used to come out ugly

Four mechanisms, and the fix for each. Everything below is one of these fixes.

| Failure | Mechanism | Fix |
|---|---|---|
| Imagined references | An agent told to "study award sites" recalls them from training data instead of seeing them, then builds the average of the web | **Step 2** — a measured corpus of 15 sites is on disk. Read it. |
| Adjectives with no numbers | "Expressive typography" and "art-directed spacing" carry no values, so the model emits its default: Inter at 36px, 14px grey body, 8px radius everywhere | **Step 3** — an Art Direction Contract of literal values, written before any component code |
| Never looking | Contrast, optical spacing, real type size, crops, overlaps, and broken fonts are invisible in source. A self-scored 9/10 ends the improvement loop with nothing rendered | **Step 6** — `scripts/audit-page.mjs` renders and measures the page, and you read the frames |
| Ambition past reliability | Quotas demanding WebGL and scrub on every brief produce collapsed pins, stretched canvases, and copy unreadable over motion | **Step 4** — pick a tier you can land. A broken Tier C loses to a perfect Tier A. |
| Restraint with nothing behind it | Every other rule here is a *don't*. Obey them all and you ship a page that is correct, tasteful, and forgettable: six images, the biggest type in the hero, nothing overlapping, nothing bleeding, two ground changes in nine screens | **Step 4b** — a density floor and a signature device, both measured by the auditor as SPARSE findings |

## Activation

**Auto-fire** on customer-facing visual surfaces: new sites, redesigns, marketing
and product pages, landing pages, brand and campaign microsites, interactive
demos, scroll-story experiences.

**Do not auto-fire** on authenticated app chrome, design-system work, or pure
logic/API/infra edits. `/premium-web-design` applies the full bar on demand.

**Companions:** photography → `/jmr-image` (Unsplash, commercial-safe) or
`scripts/find-photos.mjs` (no key, contact sheet). 2D cutouts →
`/pngimg-assets` (CC BY-NC). glTF/GLB + HDRIs → `/gltf-assets` (Poly Haven CC0
first). Owner photography still dominates any physical product, place, or
service hero.

`/jmr-image` with no `UNSPLASH_ACCESS_KEY` set silently searches pngimg only,
which is CC BY-NC, and still exits 0. Check the key before a commercial build.

When `react-tsx-component` also applies: this skill owns visual direction,
composition, motion, and asset quality; that one owns component form.

---

## Step 0 — Capability check

Run this before anything else:

```bash
node -e "import('playwright').then(()=>console.log('SIGHTED')).catch(()=>console.log('BLIND'))"
# If it prints BLIND, try a directory that has playwright installed:
#   PW_DIR=/path/to/dir/with/node_modules node -e "import(process.env.PW_DIR+'/node_modules/playwright/index.mjs').then(()=>console.log('SIGHTED'))"
# To install: mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install chromium
```

**SIGHTED** — Step 6 is mandatory and the audit must exit 0 before you claim done.

**BLIND** — say so to the user in one line, offer the install command, and then
work under tighter constraints: Tier A only (see Step 4), no scroll-scrubbed or
pinned sections, no WebGL. You cannot verify what you cannot see, so do not ship
techniques whose failure modes are invisible in source.

---

## Step 1 — Direction lock

Read the brief, then commit. State this block in chat before anything else. One
pick per line, no blending, no "a mix of 2 and 4".

```
Reading this as: <page kind> for <audience>, selling <the actual thing>.
Vibe:            <1–6>
Hero:            <1–6>
Section system:  <1–6>
Signature moments (exactly 3):
  1. <moment> → section, and the asset it needs
  2. <moment> → section, and the asset it needs
  3. <moment> → section, and the asset it needs
```

**Vibe** — 1 Night studio (cinematic dark) · 2 Paper warm (editorial craft) ·
3 Clinic calm (care, quiet) · 4 Ink & sand (heritage trade) · 5 Bright signal
(energetic consumer) · 6 Cold steel (technical). Palettes in
`references/color-and-light.md`.

**Hero** — 1 full-bleed statement · 2 asymmetric split · 3 editorial offset with
massive negative space · 4 image-first with the display restrained under a scrim ·
5 pinned stage, copy chapters cycling against a held subject · 6 typography
behemoth, the display *is* the hero. Shapes in `references/layout-archetypes.md`.

**Section system** — 1 index/directory rows · 2 alternating editorial blocks ·
3 poster-stacked chapters · 4 gallery-led cadence · 5 Swiss grid · 6 horizontal
chapter driven by vertical scroll.

Composition variety is mechanical, not a matter of taste:

- An 8-section page uses **≥4 different layout families**
- **Max 2 consecutive** image-left/text-right splits
- **Max 1 eyebrow label per 3 sections**
- Hero headline lands in **2–3 lines at 1440, 768, and 390** — widen the
  container before shrinking the type
- The page runs **5–12 viewport heights**. Three screens is a brochure.
- Don't reuse the display face or the vibe from your last build

---

## Step 2 — Ground it in the corpus, not in memory

Fifteen award sites were loaded in a real browser, scrolled end to end,
screenshotted at desktop and phone, and measured. The results are on disk:

- `references/site-studies/<slug>.md` — art direction, first three seconds,
  measured palette with real hex values, measured type sizes/weights/tracking,
  a section-by-section structure table, a motion inventory with library
  evidence, mobile adaptation, and a steal list of buildable components
- `assets/studies/<slug>/` — the frames themselves, plus `data.json`

| Slug | What it is | Best for |
|---|---|---|
| `igloo-inc` | Site of the Year 2024, 3D ice-cube journey | WebGL scroll narrative |
| `lusion` | Most-awarded WebGL studio | physics, particles, pointer play |
| `activetheory` | Repeat SOTY winner | scroll-driven 3D storytelling |
| `fizzi` | Soda product landing | scroll→3D object mapping |
| `macbook-ui` | Hardware product page | product reveal beats |
| `nimbus-keyboards` | Keyboard brand | configurator, theme playground |
| `apple-iphone14` | Classic 3D + GSAP product page | canonical product scroll |
| `blindbarber` | SOTD, barber anniversary | pinned timeline, scrapbook reveals |
| `hagis-barbershop` | SOTD, barber | cinematic intro, dark editorial, transitions |
| `pizzato` | SOTD, plumbing showroom | 3D showroom, illustration depth |
| `plomberie-5-etoiles` | Nominee, local plumber | conversion-first at an award bar |
| `amrit-palace` | SOTD, restaurant | menu-as-scroll, warm editorial, review placement |
| `tripletta` | SOTD, pizza | high-energy pacing, infinite scroll, transitions |
| `planetono` | SOTD, custom three.js | toon shaders, Rive micro-interactions |
| `banzai-nudols` | SOTD + Developer Award | character-driven SKU storytelling |

**The headings say where a site came from, not who may study it.** A veterinary
brief should mine the restaurant menu-as-scroll, the barber's pinned timeline,
and the plumber's booking discipline. Prefer the strongest craft for the job
across the whole catalogue.

Do this, in order:

1. Read **≥3 studies**, at least two from different origins
2. **Look at their frames** with the Read tool — the studies are measurements,
   the frames are the design
3. Name, in chat, the specific things you are taking and from where. Three to
   six lines is enough:
   ```
   Taking: hairline price rows + cursor image preview ← amrit-palace desktop-03
           pinned year rail                          ← blindbarber desktop-03
           full-bleed photo → quiet type alternation  ← hagis-barbershop
   ```

Every major section you ship traces to one of those lines or to the brief. A
section that traces to neither is a section you invented on autopilot.

To study a site not in the corpus:

```bash
PW_DIR=<dir with node_modules/playwright> STEPS=8 \
  node scripts/study-site.mjs "<url>" <slug> assets/studies
```

**Virtual-scroll sites read as broken.** `igloo-inc`, `lusion` and
`activetheory` drive everything from wheel events and never write
`window.scrollY`, so `scrollHeight` equals the viewport height and every
capture step reports `reachedY: 0`. Two of the three also render zero `<img>`
elements, because the imagery lives in WebGL. A first pass at `igloo.inc`
captured eight identical blank frames in Times and looked like a dead site; it
was a live site that had not booted yet. When a capture shows
`scrollHeight == viewportHeight` plus a fallback font plus `fontFaces` marked
`unloaded`, raise `SETTLE`, trust the wheel-stepped frames over the DOM probe,
and sample runtime colour and type from the pixels rather than from
`data.json`.

---

## Step 3 — Art Direction Contract

Emit this block, filled with literal values, **before any component code**. Every
line of CSS derives from it. If later code contradicts the contract, the contract
wins. Values and rationale: `references/typography.md`, `references/color-and-light.md`,
`references/motion.md`.

```css
/* type — 2 families. Display may never be Inter/Roboto/Arial/system/Space Grotesk/Poppins */
--font-display:   "<real family>";
--font-text:      "<real family>";
--display-size:   clamp(3.25rem, 11vw, 11rem);  /* first screen lands 6–14vw at 1440 */
--display-lh:     0.92;                          /* 0.80–1.00, never 1.25 */
--display-track:  -0.035em;                      /* −0.02 to −0.05em display, 0 on body */
--display-weight: 300;                           /* commit: 200–300 or 800–900 */
--text-size:      1.0625rem;                     /* 17px. 14px body is the AI tell */
--text-lh:        1.55;
--measure:        66ch;
/* display : body size ratio ≥ 5:1 */

/* colour — 1 dominant + 1 accent + tinted neutrals, never #000 or #fff */
--ground:     #______;   /* ≥50% of painted area */
--ground-2:   #______;
--edge:       #______;
--ink:        #______;   /* ≥4.5:1 on ground */
--ink-muted:  #______;   /* verify this one — it is the one that fails */
--accent:     #______;   /* ≤10% of area */

/* space — 4px base */
--section-y:  clamp(5rem, 12vh, 12rem);   /* 96–200px between movements */
--gutter:     clamp(1.25rem, 4vw, 5rem);
--radius-sm:  __px;  --radius-lg: __px;   /* exactly 2 radii, or 0 everywhere */

/* motion */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in:  cubic-bezier(0.7, 0, 0.84, 0);
--d-press: 120ms; --d-state: 240ms; --d-layout: 400ms; --d-enter: 700ms;
```

Measured anchors from the corpus, for calibration: Tripletta runs its display at
270px/18.8vw · Fizzi 208px/14.4vw at line-height 0.80 · Amrit Palace 115px/8vw at
**weight 300**, tracking −0.04em, with body copy at 14.4px and nav at 10.4px. The
drama lives in the display, and the scale contrast is what reads as art
direction.

---

## Step 4 — Pick an ambition tier

Full detail, entry requirements, and the failure modes to guard:
`references/ambition-tiers.md`.

| Tier | What it uses | Choose when |
|---|---|---|
| **A — Editorial** | Type, photography, composition, CSS motion | Strong photography, short timeline, plain stack, or BLIND from Step 0 |
| **B — Choreographed** (default) | GSAP/ScrollTrigger or Motion scroll: pins, scrubs, split reveals, transitions | The story has beats |
| **C — Rendered** | WebGL/R3F on top of B | The object *is* the story, and a credible model exists |

Answer three questions in one line each before building:

1. Which tier, and why is the tier below not enough here?
2. What is the riskiest moment in this build?
3. What ships if that moment fails?

No answer to 3 means drop a tier. Tier C additionally requires a real `.glb` —
primitive boxes standing in for a real product fail this skill outright. Without
a credible model, stage real photography inside the motion system instead.

---

## Step 4b — Density and the signature device

Full detail, corpus counts, CSS recipes, and worked examples for ordinary
businesses: `references/density-and-devices.md`. Read it before you write markup.

The corpus median is **23 images across 9 screens**, roughly 2.5 per screen. A
page built entirely from the restraint rules above tends to land near 0.7, and
that ratio is most of the difference between "clean" and "cheap".

Name these four before you build, the way you name the three signature moments:

```
Signature device: <the one repeating branded object>, appearing <n> times
Second type event: <what is set larger than the hero, and where>
Overlaps:  <which elements cross which boundaries>
Bleeds:    <what runs past the viewport edge>
```

| Floor | Value | Why |
|---|---|---|
| Media per screen | ≥2.0 | corpus median 2.5 |
| Largest type | **not** in the hero | true of 5 of 6 image-led studies |
| Overlaps | ≥3 | layering is what separates a design from a stack of rows |
| Edge bleeds | ≥2 | a fully contained page reads as a document |
| Ground flips | 1 per 2–3 screens | Tripletta 1.2, Hagi's 1.6, Amrit 2.8 |
| Device repeats | ≥4, changing each time | Amrit's review card, Blind Barber's year rail |

**The signature device is the thing people remember.** Amrit's saffron menu
panel. Blind Barber's pinned year rail and 902px numerals. Tripletta's die-cut
sticker. It is an object, not a colour: it carries information, it repeats at
different scales, and it is invented from the brief. A vet gets the engraved ID
disc off a collar. A garage gets the inspection stamp. A builder gets the
drawing title block.

Giant tint letterforms are part of this and they are *meant* to sit below AA:
Tripletta measures 1.55:1, Banzai 1.4:1. Mark them `aria-hidden="true"` and make
sure the word also appears somewhere as real text. The auditor exempts marks
that meet both conditions and counts them as ambition instead.

**The failure mode of this step is noise.** Density comes from real content
shown more ways, never from ornament. Every image is a real subject, every
device instance carries information, and if a mark says nothing, delete it.

---

## Step 5 — Build in this order

```
1. Type, colour, spacing on a still page      ← ~70% of perceived quality
2. Composition: crop, scale contrast, negative space
3. Real imagery at real resolution
4. Motion — last, and only what earns it
5. Audit loop until zero FAILs
```

Motion cannot rescue an ugly still page. Screenshot with animation disabled: if
that frame looks like a template, animating it produces an animated template.

Imagery is not decoration on this kind of site. For a physical product, place,
or service, the dominant visual is real photography — owner assets first, then
high-quality royalty-free that genuinely depicts the category. WebGL, when used,
stages and moves real images and textures rather than replacing the product with
abstract stand-ins.

To find it:

```bash
# default: contact sheet, no API key, choose by eye
PW_DIR=<dir with node_modules/playwright> \
  node scripts/find-photos.mjs "<specific scene>" ./photos 12

# or, when the frame is already decided or Step 0 reported BLIND
skills/jmr-image/scripts/jmr-image.sh search "<specific scene>" --limit 10
```

Then read `photos/contact-sheet.jpg` and choose by eye. Full guidance —
querying, rejection criteria, treatments, crops, resolution — in
`references/imagery.md`. Copy rules, conversion placement, and the phrases that
give a page away: `references/content-and-copy.md`.

---

## Step 6 — Audit loop (mandatory when SIGHTED)

```bash
PW_DIR=<dir with node_modules/playwright> \
  node scripts/audit-page.mjs "<url or file://…/index.html>" ./.audit
```

It captures desktop, phone, and reduced-motion frames, measures the rendered
result, prints every finding, and exits non-zero while any FAIL stands.

Every pass, do both:

1. **Read the frames** with the Read tool. The measurements catch contrast and
   sizing; only your eyes catch a bad crop, a collision, a limp hero, or a
   composition with nothing to look at.
2. **Clear the findings.** FAILs reach zero. Each WARN gets a fix or one line
   saying why the design intends it.

Two or three passes is normal. One pass means you did not look. What each
finding means and how to fix it: `references/build-loop.md`.

---

## Instant fails

Each one has a threshold the auditor measures and a named replacement. A ban with
no successor just sends you to the next-most-generic option.

| Fail | Threshold | Ship instead |
|---|---|---|
| Generic display face | Largest first-screen face matches `inter\|roboto\|arial\|helvetica\|system-ui\|-apple-system\|segoe\|open sans\|lato` | A pairing from `references/typography.md`. Not Space Grotesk or Poppins either — those are where every model goes when you ban Inter. |
| Font sprawl | >3 families rendered | 2: display + text, contrasted across an axis (serif/sans, condensed/wide) |
| Card-grid template | ≥6 rounded, bordered or shadowed, padded boxes | Index rows with hairlines · asymmetric editorial blocks · a horizontal gallery · one large statement instead of six equal ones |
| Radius chaos | >4 distinct radii | Exactly 2, or 0 everywhere. Nested: inner = outer − gap |
| Palette sprawl | >4 hue families with real area | 1 dominant + 1 accent + tinted neutrals |
| Hero type small | <4.5vw on the first screen | 6–14vw |
| Body type small | <16px | 17–18px |
| Contrast | <4.5:1 body, <3:1 for ≥24px | Darken the text, not the brand colour |
| Text over media, no scrim | No scrim, no text-shadow | `linear-gradient(to top, rgb(0 0 0 / .78), transparent 65%)` |
| Section rhythm | Half the sections under 48px breathing room | 96–200px between movements |
| Measure too wide | >92 characters per line | 60–75ch |
| Pure `#000` / `#fff` | — | Tinted off-black and off-white |
| Gradient text | Any `background-clip: text` gradient | One solid colour; emphasis by size or weight |
| Purple→blue gradient | Any gradient in the 250–290 hue band | Whatever the brief actually justifies |
| Box/primitive 3D stand-in | `<boxGeometry>` as the product | A real `.glb`, or real photography inside the motion system |
| Uniform motion | Same enter animation on ≥4 components; same hover scale on ≥3; stagger on ≥2 lists in one view | Different motion per meaning — see `references/motion.md` |
| Copy tells | "Welcome to", "Unlock the power of", "all-in-one solution", Elevate/Seamless/Unleash/Next-Gen, Acme/Nexus/Jane Doe, `99.99%`, `Scroll ↓`, `SECTION 01` on every block | Real names, real prices, real phone numbers, specific numbers (`47.2%`, `£64`), and no scroll cue |

---

## Done

Every box needs an artifact, not a claim.

- [ ] Direction lock posted before code — vibe, hero, section system, 3 moments
- [ ] ≥3 studies read, their frames viewed, and the take-list posted with sources
- [ ] Art Direction Contract posted before component code, with literal values
- [ ] Tier declared, with the answer to "what ships if the risky moment fails"
- [ ] `audit-page.mjs` exits 0 at desktop and phone
- [ ] Every desktop and phone frame read with the Read tool
- [ ] `reduced-motion.jpg` still reads as art-directed, with nothing stranded invisible
- [ ] No console errors in `audit.json`
- [ ] Composition variety rules met (≥4 layout families, ≤2 consecutive splits)
- [ ] Real photography carries any physical product, place, or service
- [ ] Signature device named, and repeating at least four times
- [ ] The largest type on the page is not in the hero
- [ ] `audit-page.mjs` reports zero SPARSE findings
- [ ] One thing named that you fixed because you looked at a frame, not because the linter flagged it

## Reference map

| Open this | When |
|---|---|
| `references/typography.md` | Choosing faces, sizes, tracking, scale |
| `references/color-and-light.md` | Palette, gradients, shadow, texture, dark mode |
| `references/layout-archetypes.md` | Page shape, section composition, grid, spacing |
| `references/motion.md` | Durations, easing, reveal patterns, reduced motion |
| `references/ambition-tiers.md` | Tier choice, GSAP and R3F landing checklists |
| `references/imagery.md` | Sourcing, choosing, treating, and cropping photography |
| `references/content-and-copy.md` | Words, conversion placement, and copy tells |
| `references/density-and-devices.md` | How much to put on the page, and the device that repeats |
| `references/build-loop.md` | The audit loop and what each finding means |
| `references/site-studies/*.md` | What real award sites actually do, measured |
| `demos/*.html` | Runnable implementations of each pattern |

## Demos

Nine self-contained pages, each a different palette and pairing, each exiting
0 from the auditor. Open the one nearest your brief and read it before you
write the pattern yourself.

| Demo | Pattern | Stack |
|---|---|---|
| `pinned-stage.html` | Archetype C — subject held while copy chapters cycle | sticky + IntersectionObserver |
| `index-list.html` | Archetype E — the card-grid replacement, cursor image preview | CSS + rAF lerp |
| `editorial-split.html` | Archetype B — sticky type column, ground shift, masked reveals | sticky + IO |
| `type-reveal.html` | Line-mask display reveal, character split on scroll | CSS + custom splitter |
| `loader-to-hero.html` | Load sequence that resolves *into* the hero, skippable | FLIP measurement |
| `cursor-index.html` | Lerped custom cursor with states, magnetic CTA | rAF, `pointer: fine` only |
| `photo-treatment.html` | Scrim, duotone, editorial crop pair, grain, with the CSS shown | SVG `feColorMatrix` |
| `horizontal-chapter.html` | Archetype D — vertical scroll drives a horizontal pan | GSAP + ScrollTrigger |
| `scrub-sequence.html` | Scroll-scrubbed canvas sequence, the Tier-B answer to WebGL | canvas, DPR capped |

`horizontal-chapter.html` is also the GSAP landing checklist in runnable form:
eleven numbered guards, each commented with what breaks without it, and a pin
that is *released* under reduced motion rather than having its tween disabled.
