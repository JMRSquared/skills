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

**Choose it when:** the photography is strong, the timeline is short, the stack
is plain HTML/CSS or a static site, or the audience is on mid-range phones.

## Tier B — Choreographed (default)

Everything in A, plus a real timeline library driving scroll.

Ships: pinned sections, scrubbed sequences, split-text reveals, horizontal
chapters, page transitions, magnetic cursor elements, image sequence playback.

Requires: GSAP + ScrollTrigger (or Motion's scroll APIs), and a build where you
can verify pin spacing at three widths.

**Choose it when:** the story has beats — a process, a timeline, a chapter
structure, a product revealed progressively.

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

Cap particle counts, cap DPR, and never ship a 4MB model to a phone.
