# Worlds

The art direction the whole page lives inside. Pick one, write it as a
**style preamble** that names five things, then paste the preamble verbatim
at the top of every image and video prompt. Reusing it word for word is what
makes eight separately generated assets look like one shoot. Paraphrasing it
is what makes them look like eight prompts.

The default for this skill is photographic. Soft matte low-poly clay diorama,
isometric miniature, tilt-shift toy world is **banned as a default**. It is the
house style of AI scroll sites, it announces nothing on the page is real,
and for any brand selling an actual product it actively works against the
sale. A clay render of a can does not make anyone thirsty. Use an illustrated
world only when the brand is genuinely illustrated: a children's product, a
game, a brand whose existing identity is drawn. Then commit to it properly,
matched to the brand's real illustration style.

`brand-world.md` is the design-world companion to this file (palettes, type,
sticker, button, character recipes). This file is the photography-and-imagery
companion (what to tell the camera when generating or sourcing assets).

## 1. The eight preambles

Each is a starting preamble. Tune the light, lens and grade to the brand; keep
the structure. The negative list at the end of each is not decoration. Models
drift toward rendered-looking output; the negative list is what holds them.

### Low-key cinematic (default for product, spirits, coffee, tools, apparel)

> Cinematic product photography shot on 35mm anamorphic lenses. Shallow depth
> of field, high dynamic range, true blacks, matte film grain. Low-key
> lighting: one warm key, cool ambient fill, deep falloff into shadow.
> Colour grade of deep charcoal, warm amber highlights, desaturated mid-tones.
> Photographic realism. NOT 3D render, NOT clay, NOT illustration, NOT CGI,
> no digital glow, no plastic sheen.

### High-key editorial (wellness, skincare, home goods, healthcare, calm fintech)

> Editorial still-life photography on a seamless bone-white cyclorama. Large
> soft overhead source, huge white bounce, near-shadowless with one soft
> contact shadow. High key, gentle contrast, colour grade of warm white and
> pale neutrals. Medium-format sharpness, fine grain. Photographic realism,
> no CGI.

### Natural documentary (trades, restaurants, service businesses)

> Documentary photography, available light only, handheld 35mm. Natural skin
> tones, honest imperfect surfaces, slight motion in the frame. Muted
> realistic grade, no colour cast, visible grain. Candid, unposed, nobody
> looking at camera. Absolutely not stock-photo styling, no fake smiles,
> no CGI.

### Hard-light graphic (streetwear, energy drinks, sports, youth brands)

> Studio product photography with a single hard undiffused source. Crisp
> high-contrast shadows used as graphic shapes. Saturated seamless colour
> backdrop. Punchy contrast, slight halation on specular highlights. Shot on
> digital medium format, sharp throughout. Photographic, not rendered.

### Macro texture (food, drink, materials, ingredients, craft)

> Extreme macro photography, 100mm macro lens at high magnification.
> Razor-thin plane of focus, everything else falling to soft black. Backlit
> so edges glow. Visible surface texture, condensation, grain of the
> material. Near-black negative space. Photographic realism, no CGI, no
> illustration.

### Architectural (real estate, agencies, manufacturing, B2B)

> Architectural photography, tilt-shift corrected verticals, wide 24mm. Vast
> negative space, strong linear geometry, raking daylight through structure.
> Cool neutral grade with one warm accent. Long exposure stillness.
> Photographic, no render, no CGI.

### Nocturne (nightlife, automotive, gaming, security)

> Night photography, practical light sources only: neon, sodium, screen
> glow. Wet reflective surfaces doubling every light. Deep blue-black
> shadows, warm point highlights, heavy atmosphere. Anamorphic flare,
> visible grain. Photographic, cinematic, not rendered.

### Technical drawing (engineering, hardware, complex services)

> Precise technical illustration in the style of a patent drawing or exploded
> assembly diagram. Fine consistent line weight, no fills, monochrome ink on
> warm paper ground, dimension lines and leader callouts. Orthographic
> projection. Restrained, engineered, no shading, no gradients, no 3D render.

## 2. Writing your own

Every preamble names five things. Miss one and the set drifts.

1. **Medium and lens.** "35mm anamorphic", "100mm macro", "handheld 35mm".
   This is what sets depth of field and perspective.
2. **Light.** Count the sources and place them. "One warm key, cool ambient
   fill" is directable. "Beautiful lighting" is not.
3. **Grade.** The colour story in three words. "Deep charcoal, warm amber,
   desaturated mid-tones."
4. **Texture.** Grain, halation, condensation, imperfection. This is what
   makes an image read as photographed rather than generated. Skipping it
   is the single biggest cause of the plastic AI look.
5. **The negative list.** What it must not be. "NOT 3D render, NOT clay,
   NOT illustration, no digital glow, no plastic sheen."

## 3. If the canvas is light

Every worked example above is dark. A high-key build inverts four things at
once, and getting them wrong costs a full iteration:

1. **The scrim washes toward the canvas, it does not darken.** Over footage on
   a paper ground the density has to go up, not down, or the type has
   nothing to sit on.
2. **The type over media stays ink.** Light text on a light page over a
   bright frame is unrecoverable.
3. **`--sc-edge` is an ink-tinted inset highlight tuned for a near-black
   ground.** On paper it reads as dirt along the top lip. Invert it to
   white, or drop it and carry the raise with a hairline.
4. **The `--sc-e1/2/3` shadow alphas are tuned for a near-black ground too.**
   Halve them and re-tint `--sc-shadow-color` toward the canvas hue.

The contrast direction flips with all of this: dark type fails on the
*darkest* patch under it, not the brightest. The auditor picks the
direction per line, so it grades a high-key page correctly. Re-read
`density-and-devices.md` **Contrast on the render** before shipping one.

## 4. Composition, per shot

The preamble sets the world. Each shot prompt then names the subject, the
frame and **where the empty space is**.

**Name the empty space in every scene prompt, not only in the preamble.**
This is a requirement, not advice. Seven stills across three aspect ratios
came back on-grade and cohesive with zero rerolls on the build that did it
every time. Copy sits on these images, so composition has to leave room for
it:

- "large empty shadowed space across the upper left of the frame"
- "the subject low and to the right, negative space above"
- "centred with even empty space on both sides"

Generate the space, do not crop for it later. And never ask for text in the
image: markup is selectable, translatable, sharp at every density, and
editable after the fact.

## 5. Cohesion checks

Lay every generated asset side by side and look for:

- **One light direction** across the set, or a deliberate reason it changes.
- **One grade.** If one image is cooler than the rest, reroll it rather
  than correcting it in CSS; a filter over a full-bleed image flattens it.
- **One level of realism.** A photoreal hero followed by a rendered-looking
  product shot is worse than either style used consistently.
- **The brand object identical everywhere.** Pass the real packaging, logo
  or product shot as `--ref` on every prompt that includes it. A label that
  drifts between shots is the thing a client notices first.

## 6. The asset pipeline, at a glance

Full detail in `imagery.md`. The short version for a generated build:

```bash
# 1. Generate the still
node <skill>/scripts/kie.mjs still "<style preamble>

<scene>" out/01-hero.png --ar 16:9 [--ref brand-can.png]

# 2. Generate a camera move (if the brief earns a scrub hero)
node <skill>/scripts/kie.mjs shot  "<camera move>" out/01-hero.png out/01.mp4 --dur 5
bash  <skill>/scripts/encode.sh out/01.mp4 assets/01.mp4
bash  <skill>/scripts/encode.sh out/01.mp4 assets/01-m.mp4 mobile
```

`encode.sh` sets a dense GOP because seeking walks from the previous
keyframe. A normal web encode plays perfectly and scrubs like mud. Phone
gets its own encode because phone decoders have different sweet spots.
`/gltf-assets` is the route for real 3D when a credible model exists
(Poly Haven is CC0 and needs no key).

If you have no kie.ai key, the user's own photos and footage are a
first-class route. Build from them, not from generation, when they exist.
Imagery is a gate, not a step: write down what each image depicts, then
read it against the copy that will sit beside it
(`imagery.md`, **The subject gate**).