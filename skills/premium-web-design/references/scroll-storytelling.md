# Scroll storytelling and 3D

Seven of this skill's fifteen studies are 3D or product pages and none of them
told you how the thing was wired. This file is the wiring. Every number was
measured in a real browser on 2026-08-15 at 1440x900, or it is marked
`unverified`. The studies stay the source for what those pages look like; this
file does not repeat their type sizes or scrim ladders.

## 1. The beat sheet, before any code

A scroll narrative is a list of beats, each with a length in viewport heights
and exactly one thing that changes. Write the table before you open an editor.
A beat with two things changing is two beats, or it is noise.

| Site | Page length | Beats | Length per beat |
|---|---|---|---|
| fizzi.app | 10.5 screens | 6 | 1.5, 1.5, 2.0, 2.0, 2.0, 1.5 vh |
| apple.com/iphone-17-pro | 35.65 screens | many | the scrubbed one is **exactly 2.00 vh** |
| apple.com/iphone-14 (2022) | 13.3 screens | 7 | several at 1.0 vh, which its study calls the page's weakest property |

Apple's current page holds thirteen `position: sticky` elements whose
containers measure 1.02, 1.44, 2.00, 2.69, 4.41 and 10.33 viewport heights. The
one carrying the WebGL product viewer is the 2.00: an 1800px container with a
900px sticky child, so exactly one viewport of scrub travel.

**The floor is 1.2 viewport heights per beat.** Below that a trackpad crosses
the whole beat in one flick and it reads as a twitch. `demos/three-scroll-scene.html`
runs 3 beats x 1.5 vh plus 1.0 vh of stage: a 5.5-screen track in a 7.5-screen page.

## 2. What drives the scene

| Mechanism | Measured on | `document.scrollHeight` | Cost |
|---|---|---|---|
| Native scroll + CSS `position: sticky` | apple.com/iphone-17-pro | 32,082px, real | Lowest. No library. |
| Native scroll + GSAP ScrollTrigger pin | fizzi.app (2 `.pin-spacer` elements) | 9,450px, real | +70KB and every guard in `ambition-tiers.md` |
| Wheel proxy (virtual scroll) | igloo.inc, activetheory.net, lusion.co | **equals the viewport height, always** | You now own scrolling |
| Smooth-scroll library (Lenis, Locomotive) | none of the five | real | Between the two |

The wheel-proxy sites are unambiguous about the cost. On igloo.inc and
activetheory.net `scrollHeight` equals `innerHeight` (900 = 900) and `scrollY`
stays 0 across 19,200 units of wheel delta, with `touch-action: none` on
`<body>`. lusion.co shows the trade most clearly: its document is 900px tall
and its `#ui` element, `position: fixed`, holds **50,973px** of content, 56.6
viewport heights the scrollbar knows nothing about. Taking that on means
re-implementing keyboard paging, touch momentum, rubber-band, find-in-page,
anchor links and scroll restoration. Three Site of the Year winners did it.
Do not start there.

**Default to native scroll plus sticky.** Reach for ScrollTrigger when a beat
is a timeline rather than a single mapped value. Reach for a wheel proxy only
when the whole page is one continuous camera move with no document under it.

## 3. Scroll to value: the maths

Read progress from a rect, never from an offset. `scrollY - track.offsetTop`
needs an offset that is wrong the moment a web font swaps in above the track.
A rect is correct on the first frame, after a reload that restores scroll
position, after a hash jump, and inside any scroller.

```js
function progressOf(track) {
  const r = track.getBoundingClientRect();
  const travel = r.height - window.innerHeight;   // the scrubbable part
  return travel <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / travel));
}

function beatOf(p, n) {                            // global 0..1 -> beat + local 0..1
  const b = p * n;
  const i = Math.min(n - 1, Math.floor(b));
  return { i, local: Math.min(1, Math.max(0, b - i)) };
}
```

Every animated channel is then a pure function of `(i, local)`. Nothing holds
its own state, so scrolling backwards, jumping or resizing cannot leave one
channel out of step with another. Fizzi does exactly this: beat 3's progress
drives both `can.rotation.y` and an index into a three-word array.

Damping has to be frame-rate independent:

```js
// WRONG: twice as fast at 120Hz as at 60Hz, and gone entirely on a dropped frame
cur += (target - cur) * 0.1;

// RIGHT: converges at the same rate per SECOND whatever the frame rate did
const dt = Math.min(0.05, (now - last) / 1000);
cur += (target - cur) * (1 - Math.exp(-LAMBDA * dt));
```

`LAMBDA = 6` closes about 63% of the remaining distance every 1/6 second, the
numeric equivalent of GSAP's `scrub: 0.6` to `1.2` that `motion.md` already
requires instead of `scrub: true`. The `dt` clamp matters: without it a
backgrounded tab returns a `dt` of several seconds and the scene snaps in one
frame, which is the "it jumps when I come back" report.

Ease inside a beat, but not on the channel the reader is holding. Rotation the
reader is turning by hand should track the hand linearly; easing it reads as
lag, not weight. Camera moves have mass and want `smoothstep(t) = t*t*(3-2*t)`.
`demos/three-scroll-scene.html` runs yaw linear and camera position eased in
the same beat.

For an image or video sequence, `frame = Math.round(p * (FRAMES - 1))`. Round,
do not floor: flooring holds the last frame for one step and drops the first.
`demos/scrub-sequence.html` is the canvas implementation.

Note what Apple does **not** do. Its seventeen `<video>` elements are not
scrubbed: `performance-hero` runs `currentTime` 0.35 to 7.58 while `scrollY`
goes 14,000 to 25,200 with `paused === false`. It is playing, gated by an
intersection observer, and paused again on exit (`smart-group-selfie` freezes
at 0.45 and stays there). Scrubbing video is the expensive option, and Apple
only spends it on the WebGL viewer.

## 4. Pinning that survives

`ambition-tiers.md` lists the five ways a ScrollTrigger pin breaks and the
three ways a scrub breaks. Do not re-derive them. Add these.

**Sticky fails the same way, and more quietly.** An ancestor with
`overflow: hidden`, `overflow: auto`, `contain: paint` or any `transform`
becomes the containing block, so the stage sticks inside a box that has already
scrolled past. There is no error. Assert it at runtime:

```js
for (let el = stage.parentElement; el && el !== document.documentElement; el = el.parentElement) {
  const s = getComputedStyle(el);
  if (s.transform !== 'none' || s.filter !== 'none' || s.perspective !== 'none' ||
      /paint|strict|content/.test(s.contain) ||
      (s.overflowY !== 'visible' && s.overflowY !== 'clip')) { warn(el); break; }
}
```

Use `overflow-x: clip`, never `overflow-x: hidden`, around a pin or a sticky
stage: `hidden` forces the other axis to `auto` and creates a scroll container.

The landing checklist, in order:

1. Beat length lives in the CSS as one number (`--track-h`), and the script
   counts beats from the DOM instead of repeating it.
2. `ScrollTrigger.refresh()` after `document.fonts.ready`, after every image
   `decode()`, and 300ms after `orientationchange` (iOS resizes the viewport
   after the resize event fires).
3. `invalidateOnRefresh: true`, and every distance read inside a function.
4. Everything inside `gsap.context()`, so one `revert()` removes the tween, the
   trigger, the pin spacer and the inline styles together.
5. `pinSpacing` left on unless you have measured what replaces it.
6. Reduced motion releases the pin rather than disabling the tween. A pinned
   section with a dead tween is viewport-heights of scroll that do nothing.
7. Verified at 1440, 1024 and 390 with the auditor, and by hand from the
   bottom of the page upward.

## 5. The same beat, three ways

One beat: an object turns 180 degrees while a caption changes.

**CSS sticky.** A `height: 250vh` track with a `position: sticky; top: 0;
height: 100svh` child and one rAF loop reading `progressOf()`. Cost: no
libraries, about 60 lines. Failure mode: the sticky ancestor trap above, and
`100vh` on iOS being taller than the visible viewport so the bottom of the
stage is unreachable. Use `svh`. Choose it for anything that is one mapped
value. This is Apple's construction.

**GSAP scrub.** `ScrollTrigger` with `pin`, `scrub: 0.8`, `invalidateOnRefresh`.
Cost: about 70KB and the checklist above. Failure mode: pin spacing, stale
measurements, two pins fighting over one range. Choose it when the beat is a
timeline with offsets and overlaps, which is painful to hand-roll.
`demos/horizontal-chapter.html` is the worked example.

**A real 3D scene.** One canvas, the pose a pure function of progress. Cost:
150KB of library, the model, and every guard in `ambition-tiers.md`. Failure
mode: grey plastic lighting, uncapped DPR, a context never disposed, and no
answer when WebGL is missing. Choose it only when the object is the story and a
credible model exists. `demos/three-scroll-scene.html` is the worked example.

Measured DPR caps, backing store over CSS box at `devicePixelRatio 2`:

| Site | Backing store | CSS box | Cap |
|---|---|---|---|
| apple.com/iphone-17-pro | 3456x1824 | 1728x912 | **2.00** |
| activetheory.net | 2880x1800 | 1440x900 | **2.00** |
| fizzi.app (R3F) | 2160x1350 | 1440x900 | **1.50** |
| lusion.co | 2160x1350 | 1440x900 | **1.50** |

Nobody ships uncapped. 1.5 for a full-frame scene with normal maps, 2.0 for a
small canvas or flat shading.

Three more things worth copying. Apple's canvas is **absent from the DOM at
`scrollY` 0** and mounted by `scrollY` 1400, so the first screen never pays for
it. Fizzi runs **one** canvas for a 10.5-screen document, held by
`position: sticky; top: 0`, with each section registering its own trigger
against the shared scene; never mount a canvas per section. And for lighting
without an HDRI file, `PMREMGenerator.fromScene(new RoomEnvironment(), 0.04)`
ships inside three.js and gives metal and roughness something to reflect.
Fizzi loads real files (`hdr/lobby.hdr`, `hdr/field.hdr`), which is the right
call when the product colour has to be exact.

One framing trap, found by looking at a rendered frame. Normalising an imported
model on its own `Box3` puts the product at about 10% of frame width whenever
the asset ships an accessory: Poly Haven's Camera 01 includes a strap laid out
roughly three times the size of the body. Frame on the densest mesh (vertex
count is a good proxy for "the thing the model is of") and let the accessory
run off the edge of the frame.

## 6. Legibility over motion

Four solved patterns and one recorded failure. Pick by what is behind the
words, not by taste.

| Behind the copy | Use | Recorded in |
|---|---|---|
| Anything, and you control the layout | **Column separation.** Copy in one third, object in the other two, object cropped by the frame edge so it cannot drift under the text | fizzi.md |
| A busy scene, copy must sit on it | **A scrim ladder sized to the text block**, `rgba(0,0,0,0.2 / 0.333 / 0.5 / 0.8)`, never sized to the section | activetheory.md |
| A dark scene with a light empty centre | **Four-corner pinning**, copy in the corners, optical centre left empty | igloo-inc.md |
| A scene whose value swings under the copy | **Animate the copy's opacity** with the camera rather than adding a plate | lusion.md |
| Copy crossing a mid-value product | Nothing works. This is the failure: 90px headlines through a phone on white | apple-iphone14.md |

Measure it rather than eyeballing it. At three scroll positions inside the
beat, sample the rendered pixels under the text block and compute the ratio
against the text colour: **4.5:1 at the worst of the three, or 3:1 for type at
24px and above**. A scrim that passes at the start of a beat and fails at the
end is the normal outcome of not checking. `scripts/audit-page.mjs` reports
`text-over-media` for the no-scrim case and `contrast` for the rest.

Safe area: hold the copy block at least 8% of the viewport in from every edge,
and out of the object's silhouette in **every** frame of the beat, not the
first one. Igloo's copy never overlaps its object in any of twelve states.

## 7. The phone version

Not the desktop build with animation removed. The same beats, at a fraction of
the cost:

- The scrubbed 3D scene becomes a scrubbed image sequence, rendered from that
  same scene at the centre of each beat so the two paths agree.
- The stage is `100svh`, never `100vh`. On iOS `vh` is the address-bar-expanded
  height, so a `100vh` sticky stage is taller than the visible area and its
  bottom edge is unreachable.
- The pinned horizontal chapter becomes a vertical stack.
- Every still ships `srcset` and a `sizes` that matches the real column width.
  An 1848px render decoding into a 342px box is a payload the phone pays for
  and never sees.
- Declare it: `<!-- premium-web-design: tier=C mobile=B -->`. A phone build one
  tier below the desktop is a decision, and the auditor checks the claim.

All four WebGL sites ship the full scene to a phone and reframe the camera
rather than simplifying it. That is defensible for a studio portfolio and wrong
for a product page with a conversion goal.

## 8. The load, into the first beat

1. **A deadline.** Release the loader on a timer no matter what. One 404, and a
   loader with no upper bound leaves the reader watching an empty frame for ever.
2. **A minimum display time, around 550ms.** `demos/three-scroll-scene.html` is
   ready in about 45ms on a warm cache, and a bar that appears and vanishes
   inside 45ms is not read as loading, it is read as a flicker. Anything slower
   than the minimum releases the instant it is ready.
3. **Resolve into the scene rather than covering it.** Hold the frame's
   contents at opacity 0 and fade them up over `--d-enter` once the object is
   in the scene graph. Active Theory's version is to hold pure black until the
   scene can paint, with no loader at all.

## 9. Say it out loud when you downgrade

Every capability gate that can serve a cheaper experience must announce which
path ran. This is the most expensive bug class here: the fallback is a correct
page, so the screenshot looks right, the console is empty, and nobody finds out.

```js
document.documentElement.dataset.scenePath = reason ? 'sequence' : 'webgl';
console.info('[scene] ' + (reason || 'webgl') + ' · renderer="' + renderer + '"');
```

Assert on the attribute, never on a screenshot:

```js
await page.evaluate(() => document.documentElement.dataset.scenePath);  // 'webgl'
await page.evaluate(() => document.querySelectorAll('canvas').length);  // > 0
```

Two corollaries. A software rasteriser (SwiftShader, llvmpipe) is a reason to
spend less, not to refuse: cap DPR at 1 and render anyway, or every headless
browser that checks your page sees the fallback. And do not gate your own
instrumentation on finding a `<canvas>`. igloo.inc attaches exactly one shadow
root with `mode: "closed"` and creates its canvas inside it, so
`document.getElementsByTagName('canvas').length` is **0** on a page drawing a
full WebGL scene. Its context, captured by patching
`HTMLCanvasElement.prototype.getContext` before the bundle ran:

```
webgl2 { alpha: true, depth: false, stencil: false, antialias: false,
         premultipliedAlpha: true, preserveDrawingBuffer: false }
```

No depth buffer and no MSAA. The Site of the Year does its own antialiasing in
post and never needs a depth test.

## 10. When not to

`ambition-tiers.md` owns this gate; this only reinforces it.

Do not build a scroll narrative when the page has no beats. A service, a
clinic, a restaurant and a shop have a story with parts, not a story with
movements. Tier A with real photography beats a half-landed pinned section in
front of any jury.

Do not build Tier C without a credible model. A primitive box standing in for a
real product fails this skill outright. Source one with `/gltf-assets` (Poly
Haven is CC0 and needs no key) or stay at Tier B.

And do not add a beat because the page feels short. Three beats that each
change one thing beat six that each change nothing.
