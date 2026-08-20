# Imagery

Every study in `site-studies/` reaches the same conclusion from a different
direction: on sites selling a real product, place, or service, **photography is
the design**. Amrit Palace is three colours and one typeface — what makes it
expensive is a room shot two stops down with candles as the only light source.

An agent that cannot find images fills the space with gradients and icons. That
is the look people mean when they say a page seems AI-generated.

## Finding photography

Two routes. They do different jobs and the choice is not a preference.

### `/jmr-image` — the licence-aware route

```bash
SCRIPT=skills/jmr-image/scripts/jmr-image.sh
"$SCRIPT" search "swimmers lido morning light" --limit 10
"$SCRIPT" download unsplash --index 3 --out public/images
"$SCRIPT" download pexels --index 4 --out public/images
```

bash and curl only, no browser, so it works when Step 0 reported BLIND. Use it
when you already know the frame you want, or when the build has no Playwright.

**Check the keys before you trust the results.** With no `UNSPLASH_ACCESS_KEY`
and no `PEXELS_API_KEY` in the environment the script prints a warning line
per source, skips both, searches only pngimg, and still **exits 0**. pngimg is
CC BY-NC 4.0. Almost every site built with this skill is commercial, so a
silent fallback ships a licence violation into a client build and nothing
fails to tell you.

```bash
# agent shells are not login shells, so a key set in ~/.zshrc is not inherited
set -a; source ~/.zshrc; set +a
[ -n "$UNSPLASH_ACCESS_KEY" ] || echo "no Unsplash key"
[ -n "$PEXELS_API_KEY" ] || echo "no Pexels key"
```

No commercial-safe key and a commercial brief means: set a key, or use
`find-photos.mjs` below, which needs none. Never resolve it by shipping the
pngimg result.

| Destination | Unsplash | Pexels | pngimg |
|---|---|---|---|
| Client site, product, anything monetised | yes, credit it | yes, credit it | **no** |
| Internal mockup, deck, throwaway demo | yes | yes | yes, credit it |

### `scripts/find-photos.mjs` — the choose-by-eye route

```bash
PW_DIR=<dir with node_modules/playwright> \
  node scripts/find-photos.mjs "<specific scene>" ./photos 12
```

It searches Unsplash and Pexels in a real browser, needs no API key, writes
`photos/contact-sheet.jpg`, and prints full-resolution URLs with credit links.
**This is the default for a new build**, because a hero chosen from a list of
filenames is a hero chosen at random, and the contact sheet is the only way to
choose by eye.

**Read the contact sheet with the Read tool and choose by eye.** Picking from a
filename is picking at random, and one wrong hero image undoes every other
decision on the page.

Query like a photo editor, not like a search engine:

| Weak query | Strong query |
|---|---|
| `veterinary` | `veterinarian examining dog stethoscope natural light` |
| `restaurant` | `dark restaurant interior candlelight long table` |
| `plumber` | `hands copper pipe wrench workshop close up` |
| `barbershop` | `barber fade clippers backlit mirror` |

Run two or three different queries per section and compare sheets. The first
query is almost never the best one.

Owner-supplied photography always wins. Ask for it before sourcing stock, and
say plainly that stock is a placeholder if that is what shipped.

## Choosing

Reject anything with these, no matter how well it matches the brief:

- Everyone smiling directly at the camera
- A pure white studio background with a floating subject
- Visible stock watermarks, or the same face you have already used
- A subject centred with even lighting and no depth
- Obvious AI generation: warped hands, melted text, impossible reflections
- **An unrelated business's name, logo or signage in frame.** This is the one
  that makes a photograph unusable rather than merely weak, and it is invisible
  in a contact sheet. Three downloads on one build carried a `healthy Shotz`
  wall logo, an estate agent's board reading `LET AGREED`, and a shop fascia
  reading `WILLOW & WOLF`. A page for one business cannot show a different
  one's mark. Check every shortlisted frame at full resolution, not at thumbnail
  size.

  **The brand the page is for is not "another business".** Building a page about
  a real product means showing that product, with its badges, its model name and
  its own marks, in photography and in 3D. That is the subject, not an
  infringement. The rule above is about a *stranger's* sign turning up in your
  frame.

Prefer: one light source with direction, real depth of field, a subject caught
mid-action, hands doing work, an environment with texture. A photograph where
something is *happening* carries a page. A portrait of someone posing does not.

Consistency matters more than any single frame. Six photographs at different
colour temperatures read as a collage of stock; six from the same lighting
family read as a commissioned shoot. Pick a light (warm tungsten, cold daylight,
overcast) and hold it across the page — or force consistency with a treatment.

## The subject gate

Everything above is about finding a good photograph. This is about whether the
good photograph is a photograph of the right thing, and it is the check that
four pages built from this skill failed while passing every automated gate.

What shipped:

- A Sheffield espresso roaster's process section illustrated with a
  Chinese-labelled milling machine
- A steel framebuilder's hero carrying a carbon full-suspension mountain bike
- A caption reading "the green door" over a photograph of a bare brick wall
- An exhibition named after metal swarf, illustrated by a woodturning lathe
  throwing wood shavings
- Copy reading "stripped to bare metal, re-enamelled in a single colour" under a
  two-tone red-and-cream 3D model wearing a gold "Magic" medallion

No probe catches any of these. Every one is fatal in front of a person, because
a visitor who catches the page lying about its own product stops believing the
rest of it, and a jury reaches that conclusion in about ten seconds.

**Before an image lands in the repo, write one line saying what it depicts.** Not
what you want it to mean. What is in the frame. Keep the list beside the licence
lines in `CREDITS.md`:

```
hero.jpg         a lugged steel road frame, unpainted, held in a bench vice.
                 Filed lug edges visible. Nobody in frame.
process-02.jpg   a hand-held torch brazing a seat lug, silver flowing at the
                 joint. Gloved hands, workshop background out of focus.
shop-01.jpg      shopfront at dusk, green painted door, brass letters reading
                 the wrong business name. REJECTED
```

Then read each line against the copy that will sit next to it:

1. **Is the subject the thing this page sells?** A milling machine is not an
   espresso machine. A carbon full-suspension bike is not a steel frame. If the
   answer is no, the image is out, however good it is.
2. **Does the caption describe this frame?** "The green door" needs a green door
   in it.
3. **Does the material match?** Wood shavings are not metal swarf. Enamel is not
   bare metal. A two-tone finish is not "a single colour".
4. **Does a badge, model name or medallion in frame argue with the copy?** The
   rule above says a stranger's mark makes a photograph unusable. A
   *contradicting* mark on your own subject is the same failure with the copy's
   fingerprints on it.

**Refuse to ship where the hero product is not the product.** The fixes, in
order of preference:

1. Find the right frame. Two more queries costs ten minutes.
2. Recrop so the contradicting element is out of shot. A tight crop on the joint
   is better art direction than a wide shot of the wrong bike anyway.
3. Rewrite the copy to describe the object you actually have.
   `ambition-tiers.md` gives the same instruction about a Tier C model, and says
   the same thing about it: rewriting is usually faster and always more honest.
4. Ship the section with type and no image.

Shipping the wrong photograph is not on that list.

## Treatments

```css
/* scrim — mandatory under any type on a photo */
.hero::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(to top, rgb(0 0 0 / .78) 0%, rgb(0 0 0 / .30) 40%, transparent 70%);
}

/* unify mismatched stock into one palette */
.duotone { filter: grayscale(1) contrast(1.05); }
.duotone::after {
  content: ""; position: absolute; inset: 0;
  background: var(--accent); mix-blend-mode: color; opacity: .55;
}

/* warm or cool a set toward one temperature */
.warm { filter: saturate(1.05) sepia(.12) contrast(1.03); }
```

Grain over photography (see `color-and-light.md`) hides compression artefacts
and pulls stock toward film.

## Download it. Never hotlink it.

Every image the page shows must be a local file the project owns. A build that
points `src` at `images.unsplash.com` or `images.pexels.com` is one privacy
blocker, one corporate proxy, one offline train, or one rate limit away from a
page with no photographs on it. On a page carried by photography that is not a
degraded experience, it is a blank one.

Measured on a build that hotlinked all of it: with those two hosts blocked,
**0 of 38 images loaded** and the page collapsed to type on flat colour.

```bash
# pull each one down, then point src at the local copy
skills/jmr-image/scripts/jmr-image.sh get "<full-res url>" --out public/images
```

Then verify by blocking the hosts, not by trusting that they will be up:

```js
await page.route('**://images.unsplash.com/**', r => r.abort());
await page.route('**://images.pexels.com/**',   r => r.abort());
// reload: every above-the-fold image must still render
```

Record the credits in `CREDITS.md` as you go. Both licences are commercial-safe
and both ask for attribution.

## `sizes` must describe the phone, not just the desktop

`srcset` alone does nothing if `sizes` lies. A wall of thumbnails set to
`sizes="15vw"` for a desktop collage that becomes a three-column grid at 34vw on
a phone makes the browser pick the 480px source for a slot that needs 960, and
every image on the page renders upscaled at 2x. Write the breakpoint in:

```html
sizes="(max-width: 720px) 34vw, 15vw"
```

The auditor reports this as `image-upscaled`, and it reported seventeen of them
on a page whose `srcset` markup was otherwise correct.

**The rule underneath: name the widest case the element ever renders at.** One
component reused at 22vw, 30vw and 38vw across three breakpoints must claim
38vw. `sizes` is a promise the browser keeps you to before it has laid anything
out, and it cannot be conditional on which instance is on screen. Claiming the
common case and letting the widest one upscale is the same defect as claiming
the desktop case and letting the phone upscale.

## Cropping

- Crop hard. A tight crop on hands, a face at the edge of frame, or a detail at
  2× scale reads as art direction; a full uncropped landscape reads as a stock
  library.
- Use aspect ratios deliberately: 4:5 portrait for people, 16:9 or 21:9 for
  place, 1:1 for product. Mixing two ratios in one section is a composition
  decision — mixing four is an accident.
- Let one image break the grid per page: full-bleed, or overlapping the section
  boundary.
- `object-fit: cover` with `object-position` set for the subject, not left at
  `center` — that is what puts a person's forehead at the crop line.

## Resolution and delivery

- Serve at 2× the CSS display width. The auditor fails any image rendering
  larger than its source pixels; a soft hero is unrecoverable.
- Hero: 2400px wide source. Section images: 1600px. Thumbnails: 800px.
- `loading="eager"` and `fetchpriority="high"` on the hero image only;
  `loading="lazy"` on everything below the fold.
- Always set `width`/`height` or `aspect-ratio` so nothing shifts on load.
- **Ship `img { height: auto }` with them.** `width` and `height` attributes
  land as presentational hints, and a *definite* width and height makes the
  browser ignore your CSS `aspect-ratio` completely. Without `height: auto`
  every crop on the page silently reverts to the source ratio, the images all
  render at the wrong height, and the page runs long. No auditor check catches
  it. If your attribute ratio and your CSS ratio disagree, the attributes win.
- Prefer AVIF/WebP with a JPEG fallback where the stack supports it.
- **`srcset` needs alternatives.** `srcset="hero.jpg"` satisfies the attribute,
  satisfies a checklist line reading "every image has srcset", and ships one
  payload to every device — and it used to make the auditor skip the image
  entirely. Two or more candidates with real `w`/`x` descriptors, or a
  `<picture>` carrying at least one `<source>`. Anything less is not measured as
  responsive because it is not responsive.

## Drawing beats sourcing, when the subject is technical

Some briefs have nothing photogenic in them. A contractor, a fabricator, a
logistics operator, a consultancy: the stock library for those is men in hard
hats pointing at clipboards, and every one of them reads as filler. The way out
is to stop looking for a photograph and **draw the thing the business actually
knows**.

Side 8 Group carries six services on six technical section drawings rather than
six photographs. The opencast one is a hatched pit cross-section annotated
`PIT DEPTH 32 M`, `BENCH 8 M`, `HAUL RAMP 1:10`, `SECTION A-A`, with the topsoil
and overburden stockpiles drawn where they actually sit. It is the only image on
that page that could not have been used by a competitor, and it reads as
competence in a way no photograph of an excavator does.

**Normalise the stroke lengths and the draw-on becomes trivial.** `pathLength: 1`
rescales any path to a length of 1, so one progress number drives every stroke
at the same rate no matter how long each one really is:

```tsx
export const drawn = { pathLength: 1 } as const;   // spread onto every stroked element

<path d={…} {...drawn} strokeDasharray={1} strokeDashoffset={1 - p} />
```

Without it, a 40px leader line finishes while a 900px section outline is a
tenth drawn, and the group never resolves together.

**Give the drawing at least three reveal windows, in the order a person draws.**
Structure first, then datums, then annotation, each on its own slice of the same
progress number:

```ts
export const revealAt = (p, start, span = 0.2) => clamp01((p - start) / span);

const datums = revealAt(p, 0.15, 0.5);
const labels = revealAt(p, 0.5, 0.4);
```

Dashed datum lines are the exception that catches people: their dash pattern is
in user units and carries meaning, so they must NOT get `pathLength`. Fade them
instead.

**The grid is a sheet, not a background.** A blueprint grid gets no `viewBox`,
so the pattern tiles at a fixed pixel pitch whatever size the container is,
which is what a real drawing sheet does. Give it `patternUnits="userSpaceOnUse"`,
a minor pitch nested inside a major one, and `stroke="currentColor"` so it
inherits the section's ink.

**Annotate like a drawing, not like a UI.** One mono face, ~9px, tracked wide,
around 0.55 opacity, and the labels say measurable things: depths, gradients,
tolerances, section markers. `EXTRACTION` and `SECTION A-A` are drawing
furniture; `Learn more` is not. Invent nothing you cannot defend — a wrong
gradient on a haul road is a lie a client will catch.

Every one of these is an inline `<svg>`, so it costs no request, scales, inherits
colour, and animates from the same scroll number as everything else. It also
counts as a media placement for `image-density` when it clears 8000px², which
means a drawn page is not punished for having no photographs.

## 3D, when it applies

Modelled 3D belongs where the product *is* an object worth rendering — a can, a
device, a keyboard, a space. Source glTF and studio HDRIs via `/gltf-assets`,
Poly Haven CC0 first.

Primitive boxes and low-poly kits standing in for a real product fail this
skill. Without a credible model, stage real photography inside the motion
system: scrub it, mask it, parallax it, depth-layer it.

## Licensing

Unsplash and Pexels are free for commercial use with no attribution required;
credit anyway. `/jmr-image` reaches Unsplash, Pexels, and pngimg; pngimg and
`/pngimg-assets` cutouts are CC BY-NC, so mockups and non-commercial work only.
Poly Haven is CC0. Confirm the current licence before a commercial
launch, and never ship a client site on an asset whose licence you did not check.
