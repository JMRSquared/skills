# Density and devices

Every other rule in this skill is a restraint. A page can satisfy all of them and
still be forgettable, because restraint tells you what to remove and nothing
tells you what to put on the screen.

This file is the other half: how much, which repeating object, where the biggest
type goes, what overlaps what, what gets clipped, how often the ground changes.
Read it with `layout-archetypes.md` (which shape) and `typography.md` (which
sizes).

## 1. The density floor

Measured from `assets/studies/*/data.json`.

| Site | img | svg | video | canvas | screens | img/screen |
|---|---|---|---|---|---|---|
| Blind Barber | 251 | 1 | 26 | 1 | 162.1 | 1.5 |
| Tripletta | 137 | 206 | 0 | 0 | 7.0 | 19.6 |
| Amrit Palace | 69 | 2 | 1 | 1 | 11.4 | 6.1 |
| Plomberie 5 Étoiles | 38 | 50 | 0 | 0 | 12.3 | 3.1 |
| Planetoño | 24 | 39 | 0 | 10 | 9.9 | 2.4 |
| MacBook UI | 22 | 0 | 2 | 2 | 8.8 | 2.5 |
| Hagi's Barber Shop | 14 | 7 | 1 | 0 | 4.7 | 3.0 |
| Nimbus Keyboards | 12 | 51 | 0 | 6 | 9.1 | 1.3 |
| Banzai Nudols | 8 | 13 | 0 | 1 | 1.1 | 7.3 |
| Pizzato | 3 | 6 | 4 | 0 | 5.6 | 0.5 |

Median 23 images over 9.0 screens: **2.5 images per screen**, the floor. A
9-screen page carrying 6 images sits at 0.7 and reads as a document however good
the type is. Hagi's is the honest minimum: 14 images, 6 sections, 4 buttons, 4.7
screens, and an Awwwards SOTD. Below 14 placements on a page over 4 screens, get
more content before writing more CSS.

| Brief | Screens | Image placements | Device appearances |
|---|---|---|---|
| One-location service (barber, clinic, garage) | 5 to 7 | 14 to 30 | 4 to 6 |
| Menu-led or multi-location hospitality | 8 to 12 | 45 to 80 | 6 to 10 |
| Archive, history or campaign microsite | 12+ | 80+ | one per chapter |
| Product with a real object to render | 6 to 10 | 8 to 25, plus canvas | 4 to 8 |

### When the client has four photographs

Count placements, not files. Four originals honestly make 14 to 16.

1. **Crop each one three or four ways.** A 21:9 establishing crop, a 4:5 portrait
   at 2x on a face, a 1:1 on hands and a 128px rail thumbnail are four pictures.
2. **Vary scale 4x between placements of the same photo.** Blind Barber's hero
   runs 128x88 to 130x195 on no shared grid; Hagi's collage runs 420, 480 and 540
   wide at three aspect ratios with no shared top edge.
3. **Repeat on purpose.** Amrit's review card appears twice in identical form.
   Tripletta renders its whole hero again at page end in the next theme.
4. **Use a photo as a glyph.** Tripletta drops a plate at cap height between two
   city names, twice: `img { height: .78em; vertical-align: baseline }`.
5. **Ask for four more.** Interior wide, hands at work, one face, one detail at
   2x. A twenty-minute phone shoot doubles the page.

Gradient meshes, colour blobs, glass panels, icon sets and particle fields are
not density. They are what an agent reaches for when it runs out of pictures.

## 2. The signature device

Every site in the corpus has one repeating branded object, and it is the thing
people describe when they describe the site.

| Site | Device | Appearances | What changes |
|---|---|---|---|
| Amrit Palace | Saffron menu panel, plus the Google review card | Saffron on exactly 5 backgrounds; card twice | Panel ground and position; the card is identical both times |
| Blind Barber | Pinned 15-row year rail, plus the year numeral | Rail on every chapter; numeral 15 times | Active row; numeral value, crop, ground |
| Tripletta | `MON RESTAURANT` die-cut sticker | 6 across 7 screens (`desktop-00`, `01`, `02`, `05`, `06`, `07`) | Theme colour, rotation, scale, sunburst variant |
| Hagi's | Signature logotype, plus branch-split `BOOKING ALTSTADT STADTMITTE` | Both on all 8 desktop frames | Nothing. One size, one position, no hover |
| Planetoño | Comic starburst badge, kana over English | One per carousel slide, plus the 4-point star as the Ñ tilde | Badge copy, star scale |
| Banzai Nudols | Noodle-wave motif | 76px button icon, 250px divider, quote stickers | Scale across a 3x range |

Four tests, all of them:

1. **One drawable object.** If you cannot sketch it from memory in five seconds it
   is a texture.
2. **It carries information.** The review card carries 4.7/5 and 3 576 reviews;
   the rail carries which of 15 chapters you are in. A shape carrying nothing is
   ornament.
3. **It appears 4+ times and changes each time** in colour, scale, rotation or
   position. Four identical placements read as a watermark.
4. **It is not the logo, an icon set, or a section divider.** Hagi's fixes its
   logotype at one size forever and pays for that with a second device.

To invent one: name the physical object the trade touches every working day, that
a customer recognises, and that has a number or a word stamped on it. Draw it once
as SVG with `fill: currentColor` so it inherits every ground flip, size it
`width: 1em` so `font-size` scales it, then place it at four scales.

### Worked examples

**Vet practice: the ID disc.** The engraved aluminium tag off a collar: circle,
off-centre split-ring hole, one line of text. It carries the service number and,
in the footer, the phone number. Six appearances: hung over the hero headline's
descender at 96px; one per service row at 28px reading `01` to `05`; a 44px name
tag on each team portrait; 62vw behind the opening-hours block in a 1.4:1 tint;
on the map pin; embossed at 120px in the footer.

**Independent garage: the inspection stamp.** The double-ruled rubber-stamped
rectangle off an MOT pass, rotated a few degrees, ink broken. It carries the real
date each job type was last inspected and the pass state, replacing a star
rating. Five appearances: stamped across the bottom-right corner of each of the
four service photographs, and once at 44vw behind the warranty copy in a 1.3:1
tint. Rotation varies (-4°, +2°, -1°, +3°) and every date is real; a placeholder
date is worse than no stamp. One `<symbol>` with an `feTurbulence` displacement
for the broken ink, reused via `<use>`.

**Dentist: the shade tab.** The ceramic shade-guide tab held against a tooth, a
rounded-top rectangle on a stem lettered `A1`, `B2`, `D3`. Let those codes name
the page's grounds, lightest to darkest, and the tab in each section corner
becomes a working section index disguised as a trade object. Seven appearances:
one per section corner at 56px; the full fan of six spread 8° apart at 70vh
behind the whitening section; one at 24px beside each price row. Each tab is
`fill: var(--ground)` with a 1.5px `stroke: var(--ink)`, so the device recolours
itself six times without one extra token.

**Builder: the drawing title block.** The boxed corner block off an architectural
drawing: project, drawing number, revision letter, scale. It carries which job,
which stage and what size, which is a case study without a case-study page. A
~180px block sits bottom-right of every project photograph, a 1:20 scale bar
under every photograph serves as the caption, and a setting-out grid of 1px rules
on a 5-column pitch runs behind the whole page and past every image on all four
sides, exactly as Tripletta draws it in `desktop-03`. Pitch tightens to 2 columns
on phone.

## 3. The second type event

In five of six studies the largest type on the page is not in the hero.

| Site | Hero display | Largest on the page | Where | Ratio |
|---|---|---|---|---|
| Blind Barber | ~120px | 902.25px year numeral | chapter 4 of 15 | 7.5x |
| Hagi's | 65px h1 | 150px marquee, and the `ABOUT US` pagination | screens 1.0 and 4.0 | 2.3x |
| Tripletta | 270px wordmark, a tint behind a 500px ink drawing | ~400px `WALLOVE` | screens 3.5 to 5 | 1.5x |
| Amrit Palace | 115.2px | footer wordmark sized to span 100vw | screens 10 to 11.4 | full width |
| Banzai Nudols | none in the entry state | 432px `ROSY` | product state, screen 4 of 5 | n/a |

Hagi's spends its biggest type on the link to the next page. Amrit spends it on
the brand name in the footer, after the reader has decided. Pick **one** of these.
Two hero-sized events cancel each other the way two heroes do.

**a. Cropped display numeral.** Blind Barber `desktop-04`: `2017` at 902px in
full-contrast ink, clipped by both viewport edges and by the section's bottom
edge, with the year rail on top of it and a 4-line paragraph crossing its
ascenders. Reserve it for a number the page needs anyway: founding year, count,
price, distance.

**b. Full-viewport wordmark.** Amrit's footer: brand name in the text face at
weight 700, `font-size` tuned so the string spans exactly `100vw` minus the
gutter, accent on the ink ground, last thing on the page.

**c. Giant tinted brand word behind content.** Tripletta's `TRIPLETTA` and
`WALLOVE`, Banzai's `MANZO` repeated 8 times. Colour it 1.2:1 to 1.6:1 against
its own ground (Banzai runs `#E1271E` on `#F15A52`), mark it `aria-hidden`, and
put real content on top overlapping the letterforms. It must never be the only
place that word appears.

## 4. Overlap and layering

**Type crossing an image boundary.** Hagi's `desktop-01`: `HERITAGE` reads
ink-on-bone on its left half and cream-on-video on its right.

```css
.crossing { display: grid; place-items: center; }
.crossing > * { grid-area: 1 / 1; }           /* stack in one cell */
.crossing video { width: min(46%, 34rem); }   /* narrower than the headline */
.crossing h2 { z-index: 1; font-size: clamp(3rem, 8vw, 7.5rem); line-height: .92; }
```

The media must be narrower than the line or nothing crosses. The auditor fails
text over media without a scrim, so scrim the media, or arrange it so only a
minority of one line lands on it and that media is near-black.

**A photo breaking a section edge.**

```css
.section-b { margin-block-start: -7vw; position: relative; z-index: 1;
             background: var(--ground-b); }
.section-a figure { margin-block-end: -9vw; position: relative; z-index: 2; }
```

Neither section may carry `overflow: hidden`. Use `overflow-x: clip` for
horizontal control: it makes no scroll container and does not break
`position: sticky` on an ancestor. Negative margins only pay off across a ground
flip; between two sections of one colour the overlap is invisible.

**A numeral behind content**, plus the broken-baseline row Blind Barber leaves
offset at rest in `desktop-01`.

```css
.chapter { position: relative; overflow-x: clip; isolation: isolate; }
.chapter__numeral {                    /* isolate stops z-index:-1 dropping */
  position: absolute; inset-block-start: 34%; inset-inline-start: -6vw;
  z-index: -1; pointer-events: none; white-space: nowrap;
  font-size: clamp(14rem, 62vw, 56rem); line-height: .88; letter-spacing: -.04em;
}
.row { display: grid; grid-template-columns: 1.15fr .8fr 1fr; align-items: start; }
.row > :nth-child(1) { transform: translateY(-6px); }
.row > :nth-child(3) { transform: translateY(-12px); }
```

Unequal `fr` values matter. Equal columns with unequal offsets read as a bug.

Three overlaps per page is the working minimum: one type-over-media, one
media-over-section-edge, one content-over-giant-type.

## 5. Edge bleed

Clipped in the corpus: Amrit's testimonial rail cuts cards mid-word at both edges
(`desktop-06`); Tripletta's marquee reads `SAILLES … MONTROU` and `ROUGE …
RENNES` and its 4-up photo strip runs 0 to 1440 with zero gutter; Hagi's marquee
reads `ITY. RITUAL AS EXPRESSION`; Blind Barber's `2017` and its black-and-white
photo row both run past the frame; Banzai clips the fourth cross-sell tile so the
carousel advertises itself.

A page where everything stops politely inside a container reads as a document.
Two bleeds minimum: one rail or marquee clipped on both sides, one image past one
edge.

```css
.rail { display: grid; grid-auto-flow: column;
        grid-auto-columns: minmax(18rem, 24rem); gap: clamp(1rem, 2vw, 2rem);
        overflow-x: auto; scroll-snap-type: x proximity;
        margin-inline: calc(var(--gutter) * -1);   /* this is the bleed */
        scrollbar-width: none; }
.marquee { overflow: hidden; }
.marquee__track { display: flex; width: max-content;
                  animation: slide 38s linear infinite; }
@keyframes slide { to { transform: translateX(-50%); } }
```

Duplicate the track's items exactly twice. Put the rail outside `.wrap` or the
negative margin has nothing to escape. Under `prefers-reduced-motion` pause the
marquee and keep the clipping, since the clip is the composition.

## 6. Ground flips

| Site | Flips | Screens | One flip every |
|---|---|---|---|
| Tripletta | 6+ | 7.0 | 1.2 screens |
| Hagi's | 3 | 4.7 | 1.6 screens |
| Amrit Palace | ~4 | 11.4 | 2.8 screens |
| Blind Barber | ~7 | 15 chapters | 2 chapters |

Floor: one flip every 2 to 3 screens, at least 3 on any page over 6 screens. Two
flips across nine screens is half the floor.

```css
:root { --paper: #F4F1EA; --ink: #14140F; }
[data-ground="paper"] { background: var(--paper); color: var(--ink); }
[data-ground="ink"]   { background: var(--ink);   color: var(--paper); }
[data-ground] hr, [data-ground] .rule { border-color: currentColor; }
```

Everything inside inherits `currentColor`. No per-section overrides, no divider
rules, no headings announcing the change: the flip is the divider, and Blind
Barber uses it as its only transition device across 162 screens. Pair each flip
with a change of photographic register (colour to black-and-white, reportage to
studio, still to video) so it means something.

## 7. Density is content, not ornament

- **Delete the device and ask what the reader can no longer find out.** If the
  answer is nothing, it was ornament. Cut it.
- **Density is the same real content shown more ways.** Tripletta's 137 images
  cover four subjects: the shop, the street, the staff, the food. Blind Barber's
  251 are one archive.
- **The corpus's non-photographic vocabulary is tiny.** Amrit ships 2 svg, Blind
  Barber 1, Hagi's 7. Where a site carries a lot of vector (Tripletta 206, Nimbus
  51, Plomberie 50) it is one drawn system repeated at many scales.
- **Emptiness is a move, once the page is dense.** Hagi's pays 450px of black for
  one empty beat between the collage and the film. That reads as confidence only
  when the rest of the page has earned it.

## Self-check

Run this against the rendered frames. None of it is visible in source.

```
image placements           >= 2.5 x screens     (9 screens -> 23)
distinct source photos     >= 6, each cropped >= 2 ways
largest type on the page   NOT in the first viewport
ratio largest : hero       >= 1.5x
overlaps                   >= 3   type/media, media/section-edge, content/giant-type
edge bleeds                >= 2   one clipped both sides, one past one edge
ground flips               >= 1 per 3 screens, and >= 3 total
signature device           nameable in one noun, appears >= 4x, changes each time
that device carries        a number, a word or a state the reader needs
elements carrying nothing  0
```

Name the device out loud before you write markup. A page that cannot answer "what
is the repeating object and where does it appear" has not been art-directed,
whatever the auditor says.
