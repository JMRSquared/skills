# Directing a scroll story

`scroll-storytelling.md` covers what a scroll narrative is made of: beat lengths,
the rect maths, pinning that survives, DPR caps, legibility, the load. Read it
first. This is the layer above it, the architecture that turns correctly wired
beats into one continuous shot instead of an object spinning behind a sticky div.
It replaces `rotation.y = scrollProgress`: one channel, one object, no plot. It
came out of three shipped builds, a React and R3F product story with eight acts,
a Next and GSAP page with eleven scenes, and a Framer Motion site with no 3D.
React and R3F are the default, not a requirement. Worked example:
`demos/act-director/`, a four-act Vite project that runs.

## 1. The act table comes first

An act owns a stretch of scroll, one headline, one subject, and one thing that
changes. Write the whole table before any code, in a file the code imports.

```ts
export const ACTS = [
  { id: "arrive", scrollLength: 190, eyebrow: "ACT ONE", headline: "...",
    subject: { w: 0.9, h: 1.55 }, fill: 0.54 },
  { id: "open", scrollLength: 260, eyebrow: "ACT TWO", headline: "...",
    subject: { w: 0.95, h: 2.05 }, fill: 0.60 },
] as const;
```

`scrollLength` is the section height in `svh`, so it is also the beat length.
`subject` is the bounding size in scene units of what this act is about, `fill`
the share of frame it should occupy. Those two are the camera's entire brief, and
they sit next to the headline on purpose: the person choosing the words decides
how large the object reads behind them.

Floors: `scrollLength` at least 150 vh, 190 to 300 typical, because below 150 a
trackpad crosses the act in one flick; `fill` between 0.35 and 0.65, because
above 0.7 the copy has nowhere to sit on any viewport; `subject` measured, never
guessed (§7). Declare the ids once, in an `ACT_ORDER` array, so a reordered story
cannot leave the scene playing the old sequence.

**A pin is a ratio, not a height.** A sticky stage only reads as a pin if its
parent is at least **1.8x** the stage's own height, and that is what the audit
measures. A 100 svh stage inside a 150 vh act is a ratio of 1.5: it holds, it
looks pinned to you, and it does not count. Either the act grows past 180 vh or
the stage shrinks below the viewport with `top`. This is the single most common
reason a build that plainly has a working pin is told it has no pinned section.

**Acts alone will not carry the page.** Five acts at 190 to 300 vh is nine to
fifteen screens, and an act by design holds one headline, one subject and no
photographs. Run the numbers against the density floor in `density-and-devices.md`
and the story fails it every time: the acts are the sparse part of the page.
Cut bands between them that are not acts at all, and let those carry the density
a page of headlines cannot. Budget roughly **one band per act** and give each a
different job: a figures table, a horizontal rail of frames, a photographic
collage, a marquee, a specification list, a deliberate silence. They also solve
the pacing problem, because five uninterrupted pinned acts read as one long
effect rather than as five beats.

## 2. One number, not a set of observers

Every animated property is a pure function of one continuous timeline value:

```
t = actIndex + progressWithinAct        // 0 .. ACTS.length
```

`t = 2.4` means "40% through act three" and nothing else. The alternative, an
observer or a ScrollTrigger per section each holding its own state, is where
narratives break: two channels drift, a fast scroll skips a callback, a resize
invalidates half the measurements. With one number, scrolling backwards, jumping
to an anchor and resizing are the same operation, because nothing holds state to
get out of step.

`scroll-storytelling.md` §3 has the rect maths and frame-rate independent
damping. The addition: damp the timeline value itself before anything samples it,
with `damp(storyState.t, readTimeline(), 11, step)`. That one line is most of
what makes a scene feel like it has mass, because the camera keeps drifting for a
beat after the wheel stops while the clock catches up.

## 3. Keyframe tracks, one sampler

Every property that moves is a sorted list of `[t, value]` pairs.

```ts
type Key = readonly [t: number, value: number];

function sample(keys: readonly Key[], t: number): number {
  const first = keys[0]!, last = keys[keys.length - 1]!;
  if (t <= first[0]) return first[1];
  if (t >= last[0]) return last[1];
  for (let i = 1; i < keys.length; i += 1) {
    const b = keys[i]!;
    if (t > b[0]) continue;
    const a = keys[i - 1]!, span = b[0] - a[0];
    return a[1] + (b[1] - a[1]) * smoothstep(span === 0 ? 1 : (t - a[0]) / span);
  }
  return last[1];
}

const END = ACTS.length;  // four acts end at 4, not at 3

const CAM_X: Key[] = [[0, 2.6], [1, 2.4], [2, 1.9], [3, 1.9], [END, 2.6]];
const TAPE_LIFT: Key[] = [[0, 0], [1.05, 0], [1.7, 1], [2.5, 1], [2.9, 0.06], [END, 0]];
```

**Every track's last key sits at `END`.** `t` runs `0..ACTS.length`, so a
four-act film ends at 4 while the fourth act's index is 3. Author one key per act
and the last one lands at 3, `sample` clamps everything past it, and the final
act does not move: the reader scrolls a whole section while the picture holds
still. It reads as a hang. Nothing catches it. The scene renders, the console
stays clean, the camera is exactly where you put it, and the audit still finds a
canvas and a pinned section. Write the end key first, before the middle ones.

Clamped ends let an act hold a value from `t = 0` and a track end early with no
special cases. `smoothstep` between keys means one key per act has no corners at
the boundaries. Four rules, each from a track that did not work:

- **Rotation never reverses.** Spin tracks are monotonic across the whole
  timeline. One that goes up and down reads as a bug at speed.
- **Presence beats position.** To remove an object, fade it where it stands. One
  build sent an object below the floor and watched it sink through a reflective
  plane in full view.
- **Gate tracks earn their line.** A `LANDED` track reading 1 while two objects
  are stacked lets both share one spin and drop their own pointer parallax, so
  they move as one instead of sliding apart by a few degrees.
- **Keys are the retiming surface.** If retiming a beat means editing a
  component, the track is in the wrong place.

## 4. The director

One function, called once per frame, before anything reads the result.

```ts
export const storyState: StoryState = { t: 0, camX: 0, /* every channel */ };

export function updateStoryState(delta: number) {
  const step = Math.min(delta, 1 / 20);   // a restored tab returns with seconds
  storyState.elapsed += step;
  storyState.t = damp(storyState.t, readTimeline(), 11, step);
  storyState.camX = sample(CAM_X, storyState.t);   // one line per track
  storyState.pointerX = damp(storyState.pointerX, pointerTarget.x, 3.5, step);
  storyState.speed = damp(storyState.speed,
    Math.min(Math.abs(scrollStore.velocity) / 45, 1), 6, step);
}
```

`storyState` is a mutable singleton written in place: no allocation per frame, no
React. Ordering is load-bearing. In R3F, mount the component that calls this
first, because `useFrame` runs in mount order and everything else reads what it
wrote; in plain three.js it is the first line of the rAF body. Two channels are
usually missing: `elapsed`, a clamped accumulating clock, so idle motion (a
breath, an LED pulse) needs no timer of its own, and `speed`, normalised absolute
scroll velocity, the only channel that reacts to how the reader is scrolling
rather than where they are.

## 5. The store lives outside React

```ts
class ScrollStore {
  scrollY = 0; velocity = 0; viewport = 0; activeAct: ActId = "arrive";
  registerAct(id, el) { /* measure, return unregister */ }
  measure() { /* re-read every range, cache innerHeight */ }
  update(y, v) { /* notify listeners ONLY when the active act changes */ }
  actProgress(id) { /* 0..1 across this act's scrub range */ }
}
export const scrollStore = new ScrollStore();
```

Scroll and pointer update at frame rate and must never trigger a render. React
subscribes to one signal, "which act is on screen", which fires four to eight
times across a document rather than sixty times a second; acts register
themselves from a ref callback, so the map of ranges is built by the DOM:

```tsx
useSyncExternalStore((l) => scrollStore.subscribe(l), scrollStore.getActiveAct, () => "arrive");
<section id={`act-${id}`} ref={useActSection(id)} style={{ minHeight: `${scrollLength}svh` }}>
```

`measure()` runs on register, on `resize`, after `document.fonts.ready`, from a
`ResizeObserver` on `document.body`, and 300ms after `orientationchange` because
iOS resizes the visual viewport after the resize event fires. Cache
`window.innerHeight` there so the frame loop never reads layout.

**The provider owns a plain `scroll` listener, and the store never registers
one.** One owner, named here so the two files cannot disagree. The listener is
not optional and it is not a fallback: Lenis emits only for scrolls it drives, so
anchor jumps, scrollbar drags, find-in-page, keyboard paging and every
`window.scrollTo` move the document while the story sits on whatever frame it was
left at. Headless browsers scroll exactly that way, which means a build missing
this listener screenshots and audits as a page whose 3D never moves, on a machine
where it moves fine by hand.

```ts
const onNativeScroll = () => scrollStore.update(window.scrollY, 0);
window.addEventListener("scroll", onNativeScroll, { passive: true });
```

Both paths write the same field, so the later one wins and they cannot drift; the
Lenis handler only adds velocity.

A third answer avoids the question. Framer Motion's `useScroll` and `useVelocity`
track the real document scroll rather than the smoother's own events, so a build
that reads position and velocity from them never has the gap in the first place.
Take it if Framer Motion is already in the bundle; do not add it for this alone.

The GSAP build reaches the same place without a class: a `sceneBus` module with
`get` / `set` / `subscribe`, patched rather than replaced, notifying only on a
real change. Either shape passes the test: a store that imports a framework is in
the wrong file.

## 6. Wiring the smooth scroll

```ts
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const lenis = new Lenis({
  duration: reduced ? 0 : 0.9, smoothWheel: !reduced,
  touchMultiplier: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3), autoRaf: false,
});
lenis.on("scroll", ({ scroll, velocity }) => scrollStore.update(scroll, velocity));
```

Exposing `velocity` to the scene is the reason to prefer a smooth-scroll library
here: it is a signed number the browser does not otherwise give you cheaply.
Three things a first pass misses:

1. **Lenis only emits for scrolls it drives.** A scrollbar drag, find-in-page, an
   anchor jump or a programmatic `scrollTo` moves the document behind its back,
   so add a plain `window` listener alongside. With GSAP that listener also calls
   `ScrollTrigger.update()`, without which sections stay stuck pre-reveal.
2. **Under reduced motion, keep the store fed.** Do not skip the provider; set
   `duration: 0` and `smoothWheel: false`. The scene may be off, but act tracking
   and scrubbed copy still need the numbers.
3. **With GSAP, drive Lenis from `gsap.ticker` and set `lagSmoothing(0)`.** Two
   rAF loops means pins and inertia disagree by a frame, which reads as jitter.

## 7. The camera solves its own distance

The single change that most improves a scroll-driven scene. Authored tracks give
a **direction** to shoot from; the rig normalises that vector and computes the
**distance** from subject size and fill.

```ts
const perUnit = 2 * Math.tan((camera.fov * Math.PI) / 360);   // visible height per unit of distance

const fromHeight = subjectH / fillH / perUnit;
const fromWidth  = subjectW / fillW / (perUnit * aspect);
// Standing back far enough to fit the WIDTH must never shrink the subject past
// the share of frame HEIGHT at which it stops reading as the subject.
const fromMinHeight = subjectH / MIN_HEIGHT_SHARE / perUnit;   // 0.28
const distance = Math.max(fromHeight, Math.min(fromWidth, fromMinHeight)) + speed * 0.25;

// camX/camY/camZ is a DIRECTION FROM THE LOOK-AT, not a world position. Its
// length is discarded; the solver above owns the distance.
aim.set(camX * stagingScale, camY, camZ).normalize().multiplyScalar(distance);
camera.position.x = damp(camera.position.x, target.x + aim.x + parallaxX, 6, delta);
// y and z the same, then camera.lookAt(target)

const visibleW = perUnit * distance * aspect;
storyState.maxOffsetX = Math.max(0, visibleW / 2 - subjectW / 2 - 0.15);
```

`maxOffsetX` is the frame budget published back, and every object that moves
laterally clamps to it. The solver owns how much frame there is; authored staging
asks for an offset and gets whatever still fits. Without it, an object staged at
`x = 2.15` for 16:9 walks off an ultrawide and half off a phone, and looks
correct on the machine it was authored on.

**The camera keys are relative to the look-at.** Write them as a direction and
nothing else. The tempting version subtracts the target from a world position and
normalises the result, and it silently re-aims the shot every time the look-at
moves: the author changes what the camera points AT and the angle it shoots
FROM changes too, for no reason they can see.

**Height is a requirement, width is a preference.** Taking a plain `max` of the
two axes works right up until the subject is wider than it is tall, and then it
fails badly. A 3.9 x 1.46 car at 390x844 asks the rig to fit 3.9 units across a
frame 0.46 as wide as it is high; the solver obeys, retreats to 13 units, and
renders the car at **16% of frame height** — technically correct framing of an
object nobody can see. Cap the retreat at `MIN_HEIGHT_SHARE` (0.28 works) and let
the frame crop the width instead. The car lands at 28% of height and 62% of its
own length, which is what a car on a phone should look like. On a tall subject
this branch never binds, so it changes nothing:

| subject | viewport | distance | height of frame |
|---|---|---|---|
| 0.9 x 1.55 | 1440x900 | 4.17 → 4.17 | 0.540 → 0.540 |
| 0.9 x 1.55 | 390x844 | 7.17 → 7.17 | 0.314 → 0.314 |
| 3.9 x 1.46 | 1440x900 | 6.10 → 6.10 | 0.347 → 0.347 |
| 3.9 x 1.46 | 390x844 | 13.32 → **7.57** | 0.159 → **0.280** |

**Give the look-at a Z track.** An aim vector written `(camX - targetX, camY -
targetY, camZ)` has no `targetZ` term in it, and a subject only a metre deep
never exposes the omission. A car is 4.4 metres deep. Framing its front wheel
means moving the look-at *along* the object, not orbiting further round the
middle of it, and without `TARGET_Z` that shot cannot be authored at all.

**Subject tracks hold, then hand over in the last fifth**, built as
`[i, v], [i + 0.8, v]` per act, and the last act holds to `END` because it has
nobody to hand over to. Interpolating straight from one act to the next
means that halfway through act two the rig is already framing for act three, and
the object loses its head off the top of the screen.

**Measure the model before writing a number**, with
`demos/act-director/scripts/measure-model.mjs`. It runs in headless Chromium and
not by choice: `GLTFLoader` reaches for `self` and `URL.createObjectURL`, so
importing it in a plain node script fails in a way that looks like a broken
install. Pass `--scale=N` if the model is mounted under a group scale, because
the act table is in scene units and a raw file measurement is not.

A Poly Haven glTF node can carry a 90 degree X rotation, so the file's Z is the
scene's Y and the base can sit below the origin: in the demo that is a
`BASE_LIFT` of 0.666 units, without which the product stands in the ground. Frame
on the densest mesh, not the whole `Box3`.

**Confirm which way the model faces by rendering it.** A manifest that says the
nose points at -Z and a model whose nose points at +Z are indistinguishable to
every automated check there is: the scene path is still `webgl`, the mesh count
is still right, the camera still moves through four distinct attitudes, and the
audit still passes. One build authored a whole act around a front wheel and
rendered the tailgate. Look at the frame.
If the subject has a front, keep every camera azimuth on the same side of it and
the spin slow enough that the two never combine into a shot of the back.

## 7b. When there is no object to film

The act table assumes a subject. Plenty of briefs have none: a contractor, a
fabricator, a consultancy, a logistics operator. Buying a glTF of a generic
excavator is worse than having nothing, because it is visibly not theirs.

**Morph one particle buffer through one shape per act.** Side 8 Group runs a
single cloud that resolves into a terrain, a survey traverse, a pit section, a
structural frame, a network, and finally the brand mark itself. The shapes are
named `surface, survey, extract, structure, network, resolve` — the same six
names as the chapters and the same six labels on the fixed rail, so the scene
and the navigation are one piece of data rather than two that must be kept in
step.

```ts
// One deterministic cloud, one target buffer per act, built off the main thread.
const BUILDERS = [buildSurface, buildSurvey, buildExtract, buildStructure, buildNetwork, buildResolve];
export const buildShapes = (count) => BUILDERS.map((b) => b(count));
```

Three things make it work:

- **Seed the randomness.** A `mulberry32(seed)` PRNG rather than `Math.random`
  means the cloud is byte-identical on every load, so a poster render matches the
  live scene and a reload does not reshuffle the composition.
- **Build the targets in a worker and transfer them.** Six Float32Arrays at tens
  of thousands of points is a visible main-thread stall during the loader.
  `postMessage(buffers, [...buffers.map(b => b.buffer)])` hands them over
  without copying.
- **Damp a float toward the act index and piecewise-lerp everything from it.**
  `chapter = damp(chapter, snapshot.chapter, 7.5, delta)`, then sample positions,
  density, camera eye, camera target and palette between `floor(chapter)` and
  `ceil(chapter)`. This is the director of §4 with the act index itself as the
  timeline, and it ports to any renderer.

**Key the palette, not just the geometry.** Give each act a `{ low, high, accent }`
triple and lerp between them on the same number. The scene changes ground with
the story, which is a ground flip the CSS never has to make, and it stops a dark
3D page from being one colour for nine screens.

**Spend the scroll velocity.** Pass it into the shader and let it scatter:

```glsl
float turbulence = 0.06 + uVelocity * 0.5 + burst * 0.22;
gl_PointSize = clamp(size * (1.0 + uVelocity * 0.55), 0.55, 15.0 * uPixelRatio);
```

The cloud breaks up under a fast flick and settles when the reader stops. It
costs two uniforms and it is the difference between a scene that plays and a
scene that answers.

**Name the progress readout in the client's language.** That build counts
`000` to `082` down the right edge as metres of depth, against a rail reading
SURFACE / SURVEY / EXTRACT / STRUCTURE / NETWORK / RESOLVE. A percentage would
have carried the same number and meant nothing.

## 8. Keeping the DOM in step

Three levels. Use the cheapest that works.

**Level 1, state only when a discrete value changes.** A stepping callout list, a
counting number. Sample on rAF, set state on change:

```ts
const local = (scrollStore.actProgress(id) - start) / (end - start);
const next = local < 0 ? -1 : Math.min(steps - 1, Math.floor(local * steps));
setIndex((prev) => (prev === next ? prev : next));
```

A four-item list re-renders four times across a 260vh act; a CSS transition on
`.is-on` does the rest. Sample the number from the **same track the object moves
on**, via raw scroll rather than the damped `t`, so the figure in the copy stays
correct when WebGL is off and the frame loop never runs:
`Math.round(sampleTapeLift(readTimeline()) * 100)`.

**Level 2, one number per frame as a CSS custom property.** The Framer Motion
build writes one value to a section root, `--p`, and derives everything else in
CSS with no React involvement: `clamp(0, calc((var(--p) - 0.34) * 24), 1)`. Each
element picks its own window out of the shared number by offsetting the input and
choosing a rate; rate 24 resolves over `1/24` of the section, and a stagger falls
out of adding `index / 10` to the offset. The best version staggers by **domain
data** (`hit.startSec / totalSec`) rather than array index, so two visualisations
of one event are frame-locked by construction instead of by two matching delay
tables.

**Level 3, project 3D anchors into DOM labels**, for callouts that point at parts
of the object. Once per rendered frame the director projects each anchor and
publishes screen coordinates on a second bus; a DOM layer writes transforms
straight to the nodes, so the text stays crisp, selectable, readable by a screen
reader and never re-rendered.

```ts
projected.copy(localAnchor); prop.object.localToWorld(projected); projected.project(camera);
const x = (projected.x * 0.5 + 0.5) * width, y = (-projected.y * 0.5 + 0.5) * height;
node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
node.style.opacity = onStage && projected.z <= 1 ? "1" : "0";   // z > 1 is behind the camera
```

Where the copy goes is `scroll-storytelling.md` §6. One addition: on wide screens
replace the scrim with a reading gradient angled across the frame, dense under
the copy column and clear over the product. A flat scrim mutes the render, and no
scrim fails the moment the object turns a bright surface under the headline.

## 9. The phone build

Not the desktop build with the animation removed. Two things change.

**The fill fraction splits per axis, in opposite directions.** Copy stacks above
the product rather than beside it, so the subject gets more of the width and less
of the height:

```ts
const narrowness = clamp(1.6 / Math.max(aspect, 0.35) - 1, 0, 2.6);  // 0 at 16:9, ~2.5 at 390x844
const fillW = Math.min(0.92, fill * (1 + narrowness * 0.55));
const fillH = Math.max(0.26, Math.min(0.7, fill) * (1 - narrowness * 0.17));
```

Authoring one `fill` per act and splitting it here is what stops a phone becoming
a full-bleed object with the headline lying across it. In the demo `fill: 0.60`
becomes `fillW 0.92 / fillH 0.36` at 390x844.

This split alone is not enough, and on a wide subject it points the wrong way:
`fillW` grows on the axis a phone has least of. What saves it is the
`MIN_HEIGHT_SHARE` cap in §7, which stops the rig retreating to fit a width it
should be cropping. Read the two together. Every constant on this page was tuned
against a subject 0.9 wide and 1.55 tall; check yours against a wide one before
trusting any of them.

**The staging pulls back to centre and drops.** A `stagingScale` of
`clamp(aspect / 1.6, 0.16, 1)` multiplies every lateral offset, so a hero staged
hard right on a monitor centres on a phone. Then bias the look-at downward using
only frame the subject is not occupying, and clamp that bias to the room actually
below it:

```ts
const spare = Math.max(0, visibleH - subjectH);
const lift = Math.min((1 - stagingScale) * spare * 0.62, Math.max(0, spare / 2 - 0.12));
```

Dropping the look-at moves the subject down by the same amount, so an unclamped
lift walks it off the bottom of the frame. The bare `0.62` happens to fit a tall
subject with almost nothing to spare, which is why it survives until the day
someone points it at something short and wide.

DPR caps, image sequences instead of live WebGL, `svh` over `vh` and `srcset` on
stills are in `scroll-storytelling.md` §7 and `density-and-devices.md`.

## 10. Reduced motion

Release the pin, do not disable the tween. A pinned section with a dead animation
is viewport-heights of scroll that do nothing, which is worse than the animation.

```css
@media (prefers-reduced-motion: reduce) {
  .act { min-height: 0 !important; }
  .act__pin { position: static; height: auto; padding-block: clamp(5rem, 14vh, 9rem); }
  /* Put the stage back in flow. Releasing the pin collapses the document, and a
     stage left at `position: fixed; inset: 0` then covers the full viewport
     behind a page only a few screens long. */
  .stage { position: relative !important; height: 60svh; }
}
```

In the demo this collapses an 8,370px document to 2,719px, turns four acts into
four ordinary sections, and reports `scenePath = "static"` with zero canvases.

- **A CSS `transition-duration: 0.001ms` blanket does not touch Framer Motion or
  GSAP.** Both write inline styles frame by frame. One source build ships 69
  elements at `opacity: 0` in its SSR HTML behind a media query that looks like
  coverage and is none. Add `<MotionConfig reducedMotion="user">`, or check the
  query inside each primitive.
- **Do not ship the hidden state in the HTML.** Apply `opacity: 0` from the
  effect that arms the observer, and carry a timeout in that same effect
  revealing anything still hidden after a second: an anchor jump can clear a
  block in one frame and fire `leave` without ever firing `enter`.
- **Read the query live.** `useSyncExternalStore` over `matchMedia` keeps
  following a reader who changes the OS setting mid session.

## 11. The canvas, the load, the set

**One canvas for the whole document.** Fixed behind everything, `z-index: 0`,
`pointer-events: none`, `aria-hidden`, never unmounted between acts, so there is
no context to lose and nothing to re-upload. Sections scroll over it at
`z-index: 10` and paint their own ground. Never one canvas per section.

**Fade the stage where an opaque band crosses it.** The top edge of an opaque
section arrives as a hard horizontal line straight across the subject, and a line
across a rendered object reads as a rendering fault rather than as an edit.
Nobody reports it as a design decision; they report it as a bug. Give the
director a presence track and dip it under each band:

```ts
const SHOW: Key[] = [[0, 1], [0.92, 1], [1.06, 0.12], [1.3, 0.12], [1.44, 1], /* ... */ [END, 1]];
```

One dip per opaque band, not one per act. This is also the cheapest way to give
the bands somewhere to live: the stage stops competing with them for the same
pixels.

**Lazy-load it**: `lazy(() => import("./three/StageMount"))` keeps three.js, drei
and the effect chain out of the initial chunk, 1.11 MB raw and 307 KB gzipped in
the demo that first paint does not wait for. Preload the model from `<head>` at
the same time, so the fetch overlaps the bundle parse.

**Pick a quality tier once, on mount, and announce it.** Reduced motion or no
WebGL context gives the still; four cores or fewer, or a coarse pointer under
820px, gives a reduced tier; everything else gives the full scene. Then set
`document.documentElement.dataset.scenePath` (`scroll-storytelling.md` §9 owns
why). **Measure, and only ever step down**, because a system that can step back
up oscillates. The GSAP build runs a governor over 90 frame samples with a 4
second cooldown and rebuilds the stage a tier lower; the R3F build uses drei's
`PerformanceMonitor` with `bounds={() => [48, 60]}` and `flipflops={2}` to flip
one flag that drops the mirrored floor and the effect chain.

**The loader needs a floor and a ceiling.** A minimum around 520ms so a warm
cache does not flash a bar for 40ms, and a hard deadline around 8s so one 404
does not strand the reader on an empty frame.

**The load plate is static markup in `index.html`.** This follows directly from
lazy-loading the stage: a loader written as a component inside the lazy chunk
does not exist until that chunk lands, so the reader gets an empty page for the
whole download and an auditor sampling first paint finds no loader at all. Put
the plate and its styles inline in the HTML, and have the React tree drop a class
off `<html>` on mount to dismiss it.

Watch the selector when you do. `.boot` is inside `<body>`, so
`html:not(.is-booting) .boot` is correct. Two classes on the same `<html>`
element need `.a.b`, not `.a .b`, and that mistake is survivable in a way that
hides it: the descendant version still matches anything genuinely nested, so part
of the page behaves and the one element you cared about never appears.

`color-and-light.md` owns lighting; four things about the set belong to scroll.
**The key light swings with the timeline**, so each act is lit from a new angle
without a new light; set `shadow-autoUpdate={false}` and flip
`shadow.needsUpdate = true` only once it has moved past a threshold. **Material
values belong in data** when anything else renders the same scene, such as a
still renderer in a throwaway Chromium page that cannot import the module.
**Fade a multi-part object through one shared function**, turning `transparent`
back off at full opacity so the common case never pays for depth sorting and
keeping `depthWrite` on or the shell stops occluding. And **in a void set, a
floor plane and a contact-shadow plane each cost a visible edge**: a shadow
camera has finite extent and its boundary lands on a large plane as a straight
lit/unlit line, and drei's `ContactShadows` draws its own square plane whose
corners show the moment the subject does not fill it. A generated
radial-gradient sprite is cheaper and has no edge.

## 12. Adding an act, end to end

The test of the architecture is how much has to change. A fifth act between the
third and fourth touches five files and nothing else:

1. `story/acts.ts`: one row, in position.
2. `story/scrollStore.ts`: the id into the `ActId` union and `ACT_ORDER`, same
   position. The timeline now runs 0..5; subject and fill tracks rebuild
   themselves from the table.
3. `sections/ActRepair.tsx`: copy the nearest act. Its `<ActShell>` registers
   itself with the store.
4. `App.tsx`: place it between its neighbours.
5. `three/director.ts`: every key at `t = 3` for the old fourth act moves to
   `t = 4`, plus a new key at `t = 3`. One number per line. A new track is one
   line in `updateStoryState` and one field on `StoryState`.

Then scrub the handovers, `t = 2.8` to `3.2` and `3.8` to `4.2`, watching for the
object changing size before the copy changes. No component learns about the new
act, no observer is registered, no measurement is duplicated. If it touches a
sixth file, state has leaked out of the store.


## 13. What the code is defending against

Each of these shipped once. Grep for all of them.

| Symptom | Cause | Fix |
|---|---|---|
| Final act does not move at all | Last key at the last act's INDEX, not at `END` | A key at `t = ACTS.length` on every track |
| Hard horizontal line across the subject | An opaque band's top edge crossing a fixed canvas | A presence track that dips under each band |
| Subject 16% of frame height on a phone | Rig retreating to fit a wide subject's WIDTH | Cap the retreat at `MIN_HEIGHT_SHARE` |
| Roofline below the bottom of a phone | Staging lift tuned against one tall subject | Clamp the lift to `spare / 2` |
| Authored camera angle changes when the look-at moves | Aim vector built from a world position, then normalised | Author the keys as a direction from the target |
| An act frames the wrong end of a long object | No `targetZ` in the aim vector | Give the look-at a Z track |
| Wrong end of the model on screen, everything green | The manifest's forward axis disagrees with the file | Render it and look |
| Empty page until the bundle lands | Load plate inside the lazy chunk | Static markup in `index.html` |
| Fixed canvas covering a short page under reduced motion | Pin released, stage left `position: fixed` | Put the stage back in flow |
| Scene snaps in one frame after a tab restore | Unclamped delta into `damp` | `Math.min(delta, 1/20)` |
| Sections stuck pre-reveal after an anchor jump | Lenis emits only for scrolls it drives | A plain `window` listener alongside |
| Object walks off an ultrawide | Lateral offset authored for one aspect | Clamp everything to `maxOffsetX` |
| Object loses its head mid-act | Subject size interpolating act to act | Hold, hand over in the last fifth |
| Product stands in the floor | Model origin assumed to be at its base | Read the accessor min/max |
| Two stacked objects drift apart | Each reacting to the pointer alone | A `LANDED` gate that zeroes free motion |
| Copy invisible when JS fails | `opacity: 0` shipped in the HTML | Apply the hidden state from the effect |
| A block past the viewport never reveals | Observer created after the scroll | A timeout that reveals what is still hidden |
| Pinned section that does nothing under reduced motion | Tween disabled, pin kept | Release the pin |
| A straight lit/unlit line across the floor | Shadow camera frustum boundary | Widen it, or stop the floor receiving |
| Stage sticks inside a box already scrolled past | An ancestor creating a containing block | `scroll-storytelling.md` §4, `overflow-x: clip` |
| Screenshot looks right, no canvas on the page | Silent capability fallback | `dataset.scenePath` plus a `canvas.length` assertion |
