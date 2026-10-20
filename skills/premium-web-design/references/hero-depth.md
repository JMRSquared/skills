# Hero depth as baseline

For premium marketing sites, **layering is part of the baseline, not optional
polish**. A beautiful full-screen photograph with one parallax transform and
some text fades still feels flat. Design a memorable spatial relationship in
the hero from the start.

This preference applies to the hero, not to every section of every site.
Preserve the requested brand, content, framework and functionality. Honour
explicit static or simpler directions. Working surfaces such as dashboards do
not need an invented marketing hero.

`SKILL.md` §4 already covers the hero object (drawing, product UI, owner
photo) for default-mode pages. This file is the upgrade when the brief earns
a layered hero: the depth tools, the layered planes recipe, the common traps,
the mobile art direction and the visual acceptance check.

## 1. Five depth tools, used together

Depth is the axis that separates a premium page from a styled document, and
it is not one property.

1. **Shadow with offset and blur.** Real raised things cast light downward.
   A zero-offset coloured halo is decoration, not depth. Tint the shadow to
   the canvas hue; pure black shadows on a coloured ground look like dirt.
2. **Edge light.** A 1px top highlight (`--sc-edge`) sells a raised surface
   better than any amount of blur, because real lips catch light.
3. **Scale and blur as distance.** Things further away are smaller, softer,
   and lower contrast. Parallax without those reads as sliding, not depth.
4. **Overlap.** One element crossing another's boundary establishes more
   depth than any shadow. Free and underused.
5. **Grain.** A flat dark ground bands on real displays. A grain layer at
   4-5% opacity is the difference between "a dark page" and "a lit room".

Three elevation steps (`--sc-e1/2/3`) and no more. If everything is elevated,
nothing is.

## 2. Plan the depth before generating assets

Before requesting or generating any hero imagery, name the planes.

- Identify the **background**, **focal subject**, **foreground** and any
  natural **atmospheric** layers. Name what moves independently, what
  overlaps and what must stay physically connected.
- Give the visitor a clear visual payoff during a short scroll sequence:
  the camera moves into a scene, the headline recedes behind a subject, a
  second narrative beat appears, the scene hands off into the next section.
- Choose the sequence for the brand. The recipe below is an example, not a
  mandatory template.
- Layering must change perceived depth. Several stacked elements moving as
  one image do not meet this preference. Use visibly different translation
  or scale rates, occlusion and near/far relationships.
- Keep the initial composition compelling and the full headline readable.
  Do not sacrifice comprehension just to prove that a subject can cover text.

## 3. Real compositing assets, not state

For a photographic hero, prepare real compositing assets (or use
`/gltf-assets` / `/jmr-image` to source them):

1. Create a clean background plate with the extracted subject removed and the
   space behind it rebuilt. Otherwise the moving cutout exposes a duplicate
   person or an empty hole.
2. Isolate the subject and relevant foreground into genuine alpha cutouts.
   Inspect the alpha channel; a generated checkerboard or white backdrop is
   not transparency.
3. Preserve framing, scale, lighting, colour and camera perspective.
   Separately generated layers often need measured alignment even when the
   prompt requested identical placement.
4. Keep shared contact points anchored. A person on a rock, a product on its
   plinth, a wheel on the road. Shared translation and a common contact-point
   pivot can support different layer scales without making the subject float.
5. Inspect cutout edges against contrasting backgrounds and through the
   motion. Remove matte halos, jagged edges, clipped fabric and foreground
   seams using the asset workflow. Retain originals and optimise delivery
   files without losing alpha.

Atmosphere can occupy both a rear and a front plane when it supports the
scene. It should create separation, not obscure the subject or wash out the
whole image.

## 4. The layered hero recipe

A flat page moves as one sheet. A layered page is a stack of cut-out planes
that slide past each other and the eye reads that differential motion as
depth before it reads anything else. It is the single biggest difference
between a page that feels built and one that feels assembled and it is
cheap: three transparent images and a scroll multiplier each.

How to build it:

- **Plan the planes back to front.** A far ridge, a mid ridge, the product
  (a device, a bottle, a card), then a foreground plane in front of the
  product. The product sits between mid and front, so the foreground
  overtakes it as the reader scrolls. That overtaking is the move.
- **Small rate differences, not big ones.** A premium reference site lags
  the far plane about 30% behind the page, the mid plane about 15%, the
  product about 20% and the foreground and the copy travel at exactly 1x.
  Adjacent planes differ by ten to thirty percent. Anything larger stops
  reading as distance and starts reading as things sliding around. Copy
  always rides at 1x.
- **Shape the foreground for the product.** A straight-edge foreground
  covers the product's call to action within a few hundred pixels of
  scroll. Cut it so it dips where the product is and rises at the edges,
  and the reader keeps the button in view for two to three times as long.
- **Every plane is solid below its silhouette.** Cut-out art that fades to
  transparent at the bottom lets the plane behind show through under it as
  the planes separate. Fill each column solid from its first opaque pixel
  down.
- **Fade the section floor.** Planes travel past the section's bottom edge
  and get clipped there. A gradient to the page ground over the last 200
  to 300px, layered above every plane, hides the clip line at any scroll
  position.

### Mark-up skeleton

```html
<section class="hero" data-scene style="--span: 1">
  <div class="hero__stage" aria-hidden="true">
    <img class="hero__plane hero__plane--back"     src="..." alt="" />
    <img class="hero__plane hero__plane--mid"      src="..." alt="" />
    <img class="hero__plane hero__plane--subject"  src="..." alt="" />
    <img class="hero__plane hero__plane--front"    src="..." alt="" />
    <div class="hero__grain"></div>
  </div>
  <div class="hero__copy">
    <p class="hero__eyebrow">...</p>
    <h1 class="hero__headline">...</h1>
    <p class="hero__lede">...</p>
    <a class="hero__cta" href="#">...</a>
  </div>
</section>
```

```css
.hero { position: relative; min-height: 100svh; overflow: hidden; }
.hero__stage { position: absolute; inset: 0; pointer-events: none; }
.hero__plane { position: absolute; inset: 0; width: 100%; height: 100%;
               object-fit: cover; will-change: transform; }

/* Plane rates: small differences between adjacent layers. Copy stays at 0. */
.hero__plane--back    { transform: translate3d(0, calc(var(--leave, 0) * -90px), 0); }
.hero__plane--mid     { transform: translate3d(0, calc(var(--leave, 0) * -45px), 0); }
.hero__plane--subject { transform: translate3d(0, calc(var(--leave, 0) * -30px), 0)
                                   scale(calc(1 + var(--leave, 0) * 0.04)); }
.hero__plane--front   { transform: translate3d(0, calc(var(--leave, 0) *  20px), 0); }

/* Plane-specific horizontal nudge so the foreground overtakes the subject. */
.hero__plane--front   { left: -8%; width: 116%; }

@media (prefers-reduced-motion: reduce) {
  .hero__plane { transform: none !important; }
}
```

`kit/story.js` writes `--leave` on the hero because it is a `data-scene`:
0 while the hero fills the screen, 1 once it has scrolled away
(`references/scroll-story.md`). A WebGL hero takes the same value from the
R3F act director in `scroll-direction.md`. Under reduced motion the kit
leaves `--leave` unset, so every plane sits at its starting position.

## 5. Three traps that cost rounds

- A global `img { max-width: 100% }` shrinks an absolutely positioned plane to
  the viewport on phones, so the mountains never show. Planes carry
  `max-width: none` and a fixed pixel width.
- A `transition: transform` on a plane (a reveal class, usually) eases every
  per-frame scroll write over its duration. On a phone that reads as the
  product lagging a full second behind the thumb. Parallaxed elements
  transition opacity only.
- Replacing a plane's art under the same filename ships nothing to a phone
  that has the old bytes cached. New art gets a new name.

## 6. Choreograph restrained motion

- Use one coherent camera idea and purposeful transitions. Premium means
  controlled movement and good timing, not constant movement everywhere.
- Native sticky scrolling with independently transformed planes can provide
  depth without WebGL or a generated video. Choose heavier tools only when
  they improve the requested experience.
- Keep essential copy and calls to action as semantic HTML. Establish
  deliberate layer order for typography, subject, foreground, and
  atmosphere.
- Prefer composited transforms and opacity, a shared scroll progress value,
  and `requestAnimationFrame` updates. Avoid rendering the whole page again
  on every scroll tick.
- Subtle pointer response is optional. It must not be the only way to
  experience the hero. Never capture or lock the desktop cursor for this
  effect.
- Pause offscreen ambient work. Honour reduced-motion preferences and
  provide a usable static composition without extra pinned scroll space or
  hidden essential content.
- Load the required scene assets together before switching from a complete
  poster fallback. Avoid partial scenes, flashes, ghost subjects, or a
  broken hero when a layer fails.

## 7. Art-direct the phone separately

Do not merely shrink the desktop composition. Adjust crop, subject position,
contact-point pivot, type size, layer order, travel and scroll duration as
needed.

- Typography may sit above the subject on a phone even when it passes behind
  the subject on desktop. Preserve depth without hiding the headline,
  pushing the subject offscreen, or causing horizontal overflow.
- A common phone adjustment is one plane (the atmospheric foreground) flat
  behind the subject at 1.05x scale, copy stacked beneath, scroll span
  shrunk to one viewport. The desktop reads as a four-plane choreographed
  scene; the phone reads as a composed still with a clear subject. Both
  read as premium.

## 8. Visual acceptance

Use the verification tools applicable to the build. Inspect the actual
opening, an intermediate scroll position, the final hero transition and the
mobile composition. Check:
- Distinct layers visibly move at different rates.
- No duplicate subjects, holes, cutout halos, floating contact points, or
  abrupt seams appear.
- The opening headline is readable and the scroll produces a clear change
  in what the visitor sees or understands.
- The scene resolves cleanly into the next section.
- Mobile and motion-off states remain complete and usable.
- Assets load and controls still work.

A successful build or transform unit test alone does not prove the visual
effect is good. If visual verification could not be performed, state that
limit instead of claiming it was checked.