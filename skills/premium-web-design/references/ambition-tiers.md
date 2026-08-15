# Ambition tiers

The old skill demanded WebGL, scroll-scrubbing, and a cinematic loader on every
brief. Agents obliged, half-landed it, and shipped pages with pinned sections
that jump, canvases that stretch, and hero copy sitting unreadable on a moving
scene. **A broken Tier C page loses to a perfect Tier A page**, every time, in
front of any jury and any customer.

Pick a tier honestly, then execute it completely.

## Tier A — Editorial

Typography, real photography, composition, CSS motion. No 3D, no scroll
scrubbing, no physics.

Ships: scroll reveals, sticky columns, hover states with real easing, image
crops and overlaps, a marquee or index list, view transitions.

This tier has produced Site of the Day winners. `plomberie5etoiles.com` and
most restaurant winners are essentially Tier A with exceptional art direction.

**Choose it when ALL of these hold.** Not any. All.

- The page is **under 6 viewport heights**. A long page held at Tier A becomes a
  scroll with nothing in it.
- The brief has **no sequence**: no process, no timeline, no chapters, no
  before-and-after, no product revealed progressively. If you can write the
  offer as "first, then, then", the story has beats and beats want Tier B.
- The photography is genuinely exceptional and there is enough of it to carry
  every screen on its own.

**"It is a static site" is not a reason.** That clause used to sit in this list
and it is the reason two pages shipped from this skill with zero pinned
sections, zero scrubs and zero transitions while passing every check. Every
deliverable this skill produces is a static file, so a condition satisfied by
the output format is satisfied on every brief, forever. It said nothing about
whether the *work* deserved Tier A. GSAP is a script tag and ScrollTrigger runs
fine on a static file, so the stack never was the constraint.

The honest Tier A test is one sentence: **name the award-winning page you are
matching, and say why yours needs less motion than that one.** If the answer is
about your convenience rather than the brief, you are at the wrong tier.

**Write that sentence into the declaration.** Only the length clause can be
measured, so the fix for the other two is to make them visible:

```html
<!-- premium-web-design: tier=A because="plomberie5etoiles.com — four screens, and the photography carries every one" -->
```

Without `because=` the auditor reports `tier-a-undefended`. This closes the
successor to the old "it is a static site" loophole: a page could satisfy every
craft gate by declaring Tier A and stopping at 5.9 viewport heights — under the
ceiling, under the long-page floor, and inside SKILL.md's own "5–12 viewport
heights" composition rule the whole time. You may still take the exemption. You
may not take it silently.

**A defended Tier A page is exempt from the desktop technique floor.** A
four-screen announcement carried by photography, with no sequence and nothing to
transact, is what this tier is for — the floor exists for pages measured against
B or C. That exemption is the reason `because=` is not optional.

## Tier B — Choreographed (default)

Everything in A, plus a real timeline library driving scroll.

Ships: pinned sections, scrubbed sequences, split-text reveals, horizontal
chapters, page transitions, magnetic cursor elements, image sequence playback.

Requires: GSAP + ScrollTrigger (or Motion's scroll APIs), and a build where you
can verify pin spacing at three widths.

**Choose it when:** the story has beats — a process, a timeline, a chapter
structure, a product revealed progressively. **This is the default. A page over
6 screens is at Tier B unless you can defend Tier A against the test above.**

## Tier C — Rendered

Everything in B, plus WebGL/3D.

Ships: a real-time 3D object the scroll drives, shader backgrounds, particle
systems, physics.

Requires **all** of these, verified before you start:
- The product genuinely is an object worth rendering (a can, a device, a
  keyboard, a space) — not a service, not a clinic, not a shop.
- A credible asset exists: a real glTF model or a photogrammetry scan. Primitive
  boxes standing in for a real product fail this skill outright.
- React Three Fiber + Drei already in the stack, or you have time to integrate
  and test it.
- A defined fallback for phones and for WebGL-unavailable contexts.

**Choose it when:** the object is the story. Otherwise stay at B and spend the
budget on photography.

## Earning the tier

Before you write the first line, answer in one sentence each:

1. What tier, and why the tier below it is not enough for this brief?
2. What is the single riskiest moment in this build?
3. What ships if that moment fails?

If you cannot answer 3, drop a tier.

## Sourcing a Tier C asset

Everything here was learned by shipping one, and every item cost a rebuild.

**Render a four-angle turnaround before you commit to a model.** Front, 90, 180,
270, in the lighting you intend to use. A model can be excellent from the front
and an unresolved flat slab from the back, and a scroll that turns it through a
full revolution will parade that slab as a beat. Constrain the rotation to the
arc that holds up rather than showing the whole object because you can:

```js
// sweep front to three-quarter and back, never through the rear panel
group.rotation.y = -0.62 + Math.sin(progress * Math.PI) * 1.24;
```

**Check the model for the author's branding.** Downloaded glTF frequently carries
the maker's name baked into a shared texture, not as a separate mesh you can
hide. One model shipped a different company's wordmark across the front of the
machine, and it was only visible once rendered. There is no way to remove it
without editing the texture, so the check belongs before the download decision.

**The asset must match what the copy claims.** A model of a two-group enamelled
machine under copy describing a single-group billet-machined one is worse than
no 3D at all: every sentence argues with the picture. Either find an asset that
matches the brief, or let the asset drive the brief and rewrite the copy to
describe the object you actually have. Rewriting the copy is usually faster and
always more honest.

**Metal without an environment map is grey plastic.** Lights alone will not do
it. Pull a CC0 studio HDRI through `/gltf-assets` and run it through
`PMREMGenerator`:

```js
new RGBELoader().load('models/studio_small_09_1k.hdr', (hdr) => {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(hdr).texture;
  hdr.dispose(); pmrem.dispose();
});
```

**Copy over a lit 3D scene needs a near-opaque ground.** A 0.72 alpha scrim that
works over a photograph fails over a bright moving object. 0.94 plus a small
backdrop blur is the floor, and non-active chapter cards must go to `opacity: 0`
rather than a low alpha, or the previous card's label reads through the live
one's headline.

**Tier C cannot be audited over `file://`.** `GLTFLoader` uses fetch, which
`file://` blocks, so the model fails, the page silently takes its own fallback
path, and nothing appears in the console. Serve the directory and audit the URL:

```bash
cd <site dir> && python3 -m http.server 8899 &
node scripts/audit-page.mjs "http://localhost:8899/index.html" ./.audit
```

## Overreach failure modes

These are what actually goes wrong when an agent reaches past its tier. Check
each one against your build before claiming done.

**ScrollTrigger pinning**
- Pin without `pinSpacing` accounting → content jumps at the pin boundary.
- Pinned section taller than the viewport → the bottom is unreachable.
- Triggers created before fonts and images settle → every start/end offset is
  wrong. Call `ScrollTrigger.refresh()` after load, and on resize.
- Two pins overlapping the same scroll range → one silently wins.
- Pinning inside a container with `overflow: hidden` or a CSS `transform` →
  the pin does nothing.

**Scrubbed timelines**
- `scrub: true` with no smoothing → jitter on trackpads. Use `scrub: 0.6–1.2`.
- Animating `top`/`left`/`width` instead of `transform` → layout thrash.
- Scrub tied to an element that lazy-loads → the animation starts mid-way.

**React Three Fiber**
- Canvas with no explicit height → 0px tall, or stretched to a wrong aspect.
- Model loaded without `Suspense` → white flash or a crash on first paint.
- `useFrame` mutating React state → re-render every frame, page dies.
- No `dispose`/cleanup on unmount → memory climbs through a route change.
- DPR uncapped on retina → four times the pixels, 20fps. Cap at 1.5–2.
- Lighting left at defaults → a grey plastic object. Use an HDRI environment.
- SSR/hydration: the canvas must be client-only in Next.js.

**Text over motion**
- Copy placed over a moving scene with no scrim → unreadable half the time.
- Reveal animations that leave text at `opacity: 0` when the trigger never
  fires (short pages, reduced motion, JS error) → an invisible page. Always
  author the visible state as the default and let motion animate *from* it.

**Reduced motion**
- `prefers-reduced-motion` handled by deleting the animation and leaving the
  end state broken. The still composition must be complete on its own.

## Mobile

The phone version is not the desktop version with animations removed. It is the
same idea at a lower cost: a scrubbed 3D sequence becomes a scrubbed image
sequence; a pinned horizontal chapter becomes a vertical one; a particle field
becomes a single still with grain.

**Declare it.** `mobile=` takes any lower tier, not only the C→B case: the
pinned-chapter-to-swipe-rail move above is B→A, and without a declaration the
phone is measured against the full desktop tier and told it failed to build
something it deliberately did not build.

```html
<!-- premium-web-design: tier=C mobile=B -->   3D on desktop, scrubbed stills on the phone
<!-- premium-web-design: tier=B mobile=A -->   pinned chapter on desktop, a vertical read on the phone
```

Cap particle counts, cap DPR, and never ship a 4MB model to a phone.

Declare the step down (`tier=C mobile=B`) and paint something in the scene's
place. An empty section on the phone is reported as `tier-fallback-missing`; a
scene switched off is a hole, not a fallback.

## Announce every downgrade

Three investigations on this skill have been lost to a capability gate that
failed quietly: `GLTFLoader` blocked by `file://`, a Tier C page taking its
phone fallback on desktop, and a 3D demo rendering an image sequence with WebGL2
available. Every one of them had a clean console and a page that was not what it
claimed.

**Any gate that can degrade the experience logs the failed condition.**

```js
if (!renderer) {
  console.info('[capability] WebGL unavailable — rendering the scrubbed image sequence instead');
  return mountSequenceFallback();
}
```

One line, at the point of the decision, naming what failed. `audit-page.mjs`
collects anything logged that mentions a fallback, downgrade, unavailable or
unsupported condition, prints it under the frames, and says so in `tier-unmet`
when nothing was logged. A downgrade nobody can see costs an investigation every
time.
