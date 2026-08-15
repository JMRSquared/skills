# Motion

"Meaningful micro-interactions and cinematic scroll" is what produced the
identical 500ms `fadeInUp` on every block. Motion needs values, a budget, and a
repetition limit — not adjectives.

## Values are a decision, not a block to paste

This section used to print two curves and four durations under the words "use
these, do not invent curves". Four sites built from this skill by four agents
with no shared context then shipped `cubic-bezier(0.16,1,0.3,1)`,
`cubic-bezier(0.7,0,0.84,0)`, `120ms`, `240ms`, `400ms` and `700ms` character for
character. All four moved identically and a jury rejected all four.

The corpus does not share a constant. Amrit Palace runs Lenis-smoothed scroll
under per-character SplitType reveals; Blind Barber drives a virtualised proxy
under 902px numerals; Hagi's runs a linear marquee on its own clock under a
line-split headline. Three sites, three motion registers, nothing in common at
the token level.

So: ranges and reasoning below. **Deriving your own values from them is the
work.**

### The ranges

| Band | What it covers | Duration | Shape of the curve |
|---|---|---|---|
| Press | `:active`, toggle, tap feedback | 90–160ms | linear, or a shallow ease-out. Under 90ms reads as a glitch, over 160ms as lag |
| State | hover, colour, small reveals | 150–320ms | ease-out. Fast start, long settle |
| Layout | accordion, drawer, modal, filter | 300–520ms | ease-out entering, ease-in leaving |
| Enter | a block arriving on scroll | 450–900ms | ease-out, decelerating hard at the end. Travel 10–24px |
| Travel | something crossing the frame | 500–900ms | symmetric ease-in-out. It starts and ends off-frame, so it accelerates *and* decelerates |
| Ambient | marquee, drift, loop | 20–60s per cycle | linear, and only linear. Any easing on a loop shows the seam |
| Stagger step | between items in one chain | 50–80ms | cap the chain at 6 items |
| Exit | anything leaving | ~75% of its enter | ease-in, and less travel than the enter |

**Easing is a shape, not a string.** An ease-out is any
`cubic-bezier(x1, y1, x2, y2)` with a low `x1` and a `y1` at or above roughly
0.8: the value arrives fast and settles slowly. `(0.16, 1, 0.3, 1)` is one of
those. `(0.22, 1, 0.36, 1)`, `(0.19, 1, 0.22, 1)` and `(0.33, 1, 0.68, 1)` are
others, and at 700ms on a 200px reveal they feel different from each other. Pick
your two or three by moving a real element and watching it, not by reading a
name off a page.

**Banned by value**, whatever you derive: `cubic-bezier(0.34,1.56,0.64,1)` and
`cubic-bezier(0.68,-0.6,0.32,1.6)`. Any curve whose `y` leaves the 0–1 range
overshoots, and real mass does not overshoot on a hover.

Also banned: `transition: all`, bare `ease`/`ease-in-out` on anything that
matters, animating `top`/`left`/`width`/`height`, animating from `scale(0)`
(start at 0.92), and any unrequested animation over 1200ms that is not on the
ambient row.

### State the budget before you write a keyframe

Three lines, in chat, alongside the Art Direction Contract:

```
Slowest motion:  <element> at <duration or cycle length>, because <what the
                 reader is being given time to do>
Fastest motion:  <element> at <duration>, because <what has to feel instant>
Unrequested:     <the one element that moves at a rate the reader did not ask
                 for>, at <rate>, against <what it is measured against>
```

The third line is what separates a page with motion from a page that is moving.
Every study has one and nobody asked for any of it: Blind Barber's 902px
numerals travel through the viewport faster than the copy laid over them, Hagi's
three photographs leave the frame at three rates, Tripletta's collage items each
carry their own scrub speed. That is the whole reason those pages read as
authored.

If two of your three lines name the same number, the page has one speed and it
will read as one speed.

### One worked example. This is an example, not the answer

A heritage-trade brief: dark ground, photography-led, four reveals per screen,
one booking button that has to feel like a switch, and a marquee that drifts for
the length of its section. Every value below is that page's answer to that
sentence.

```css
:root{
  --e-settle: cubic-bezier(0.22, 1, 0.36, 1);   /* long settle: the photographs
                                                   are the content, so they land
                                                   rather than snap */
  --e-leave:  cubic-bezier(0.55, 0, 1, 0.45);   /* exits, mirrored */
  --e-cross:  cubic-bezier(0.65, 0, 0.35, 1);   /* the one horizontal move */
  --t-tap:    110ms;   /* the booking button. A switch, not an animation */
  --t-state:  200ms;   /* nav hover is colour only, so it can be quick */
  --t-panel:  460ms;   /* the price drawer, which changes layout */
  --t-arrive: 620ms;   /* short, because four of these fire per screen */
  --t-drift:  34s;     /* linear, the marquee, one cycle per section read */
}
```

Ship those seven on a bright consumer brief and you have taken someone else's
decision about someone else's page. **A page shipping four or more of the
literals printed anywhere in this skill, unchanged, is reported as
`motion-tokens-verbatim`**. The numbers are not wrong. Four pages arriving at one
set of seven constants means none of them chose.

## Non-uniform motion

**Required at Tier B and above: one pair of elements the reader can see at once,
moving at different rates through the same scroll range.** A stagger is not
this. A stagger is one rate applied at offsets, and four pages built from this
skill shipped nothing that moved at any rate other than "700ms after it enters".

Every study in the corpus does it:

| Site | What differs | Evidence |
|---|---|---|
| Blind Barber | The 902px year numerals travel through the viewport faster than the copy over them. `desktop-04` catches `2017` mid-pass, clipped by both edges, with a 4-line paragraph crossing its ascenders | motion inventory #2 |
| Hagi's | Three photographs at three widths (420 / 480 / 540) leave at three rates; by `desktop-04` the shopfront has fully exited while the interior shot is still mid-frame | motion inventory #5 |
| Tripletta | Every photo in the `WALLOVE` grid carries its own scrub speed; items sit at different vertical offsets between `desktop-03` and `desktop-04` | motion inventory #4 |
| Hagi's | The marquee moves horizontally on its own clock while the page moves vertically; glyph positions differ between `desktop-01` and `desktop-02` at the same scroll delta | motion inventory #2 |
| Amrit Palace | A looping video plate behind headline characters revealed per-character on scroll. Two clocks in one composition | motion inventory #2, #4 |

### Buildable forms, cheapest first

**1. Differential rate on a photo group.** Three images, three travel ranges,
one trigger. No library:

```js
const group = document.querySelector('.collage');
const rates = [-0.04, -0.11, -0.18];            /* spread them; see below */
const items = [...group.children];
addEventListener('scroll', () => requestAnimationFrame(() => {
  const r = group.getBoundingClientRect();
  const p = 1 - (r.top + r.height) / (innerHeight + r.height);   /* 0→1 */
  items.forEach((el, i) => { el.style.transform = `translate3d(0,${p * rates[i] * r.height}px,0)`; });
}), { passive: true });
```

Give the three images three widths and three aspect ratios while you are there.
Hagi's runs 420 / 480 / 540 with no shared top edge.

**2. A numeral or wordmark against its own copy.** The giant tint mark gets the
faster rate, the paragraph crossing it gets the slower one, and the mark is
clipped by both viewport edges so the speed is legible. Blind Barber's
`desktop-04` is the frame. The mark is `aria-hidden="true"` and the same string
appears as real text elsewhere, which is the tint-mark exemption rather than an
extra rule.

**3. Per-item scrub in a collage.** Same grid, one ScrollTrigger per image with
a different `scrub` value and a different `y` range, so photographs drift past
the letterforms behind them at different speeds. Tripletta's steal list caps it
at about eight photographs per screen.

**4. A marquee against page scroll.** The band runs on `@keyframes` at 20–60s
while the page scrolls vertically. Two axes, two clocks, and the cheapest
non-uniform motion there is.

**5. Two clocks in one frame.** A looping video plate behind type that reveals
on scroll, as Amrit's hero does.

### Rules that keep it from becoming noise

- **Rate differences under about 15% read as a rendering bug, not as depth.**
  Spread them: −4%, −11%, −18% of the container height, not −8/−9/−10%.
- **The slower element is the one carrying the words.** Copy that outruns its
  own background is unreadable.
- Cap total travel at what the container has ground for. `ambition-tiers.md`
  documents the build that translated 260px inside a container padded 16% and
  rendered an empty black third for half the scrub.
- Under `prefers-reduced-motion` both elements sit at their resting positions,
  and that still frame has to be a composition on its own.

## The repetition limits

Uniform motion is the tell. Each of these is a fail:

- The same hover scale on ≥3 different components
- Stagger on ≥2 lists visible in the same viewport
- An identical enter animation on ≥4 components
- `filter: blur()` on entry across ≥3 components
- `animate-pulse` on a status dot — any instance
- A spring with bounce on a utility control — any instance

The fix is not "less motion". It is **different motion for different meanings**:
a heading reveals by mask-wipe, an image reveals by scale-down from 1.06, a list
reveals by stagger, a number reveals by counting. One vocabulary per page, one
gesture per meaning.

`translateY(14px)` plus an opacity fade is one gesture, and four pages built from
this skill applied it to every block on the page. It is a fine gesture for a
paragraph arriving. It is the wrong one for a photograph, a numeral, a price row
and a headline, and using it for all five is the same failure as using one
duration for everything. Pair this with **Non-uniform motion** below, which asks
for two rates in one frame rather than four gestures across a page. They are
different requirements and a page needs both.

## Scroll reveals, done safely

The most common way an agent ships an invisible page:

```css
/* WRONG — if the observer never fires, the content never exists */
.reveal { opacity: 0; transform: translateY(20px); }
```

Author the visible state as the default and animate *from* a modifier the script
adds, or gate the hidden state on JS being alive:

```css
.js .reveal { opacity: 0; transform: translateY(16px); }
.js .reveal.is-in { opacity: 1; transform: none; transition: opacity var(--t-arrive) var(--e-settle), transform var(--t-arrive) var(--e-settle); }
```

```js
document.documentElement.classList.add('js');
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-in')),
  { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
```

Reveal at 12–15% visibility, not at 50% — content that animates in after the
user is already reading it feels broken.

### The observer is not enough on its own

`IntersectionObserver` misses an element entirely when the scroll jumps further
than the viewport in a single frame: a fast wheel, a hash link, a restored
scroll position on reload, an anchor from another page. The element never
intersects, the class never lands, and it sits at `opacity: 0` for ever. The
`.js` gate above protects you from JS being *dead*. It does nothing about JS
being alive and skipped, and that is the case you will actually ship.

Put a sweep behind the observer. Anything already above the fold is revealed
whether or not the observer ever fired:

```js
var pending = [];
function sweep() {
  var h = innerHeight;
  pending = pending.filter(function (rec) {
    var r = rec.el.getBoundingClientRect();
    if (r.top < h * 0.95 || r.bottom < 0) { rec.el.classList.add(rec.cls); return false; }
    return true;
  });
}
addEventListener('scroll', function () { requestAnimationFrame(sweep); }, { passive: true });
```

Test it by jumping straight to 40% of the page on load and counting elements
that are inside the viewport at `opacity: 0`. It should be zero, or one that is
mid-transition.

### A state class you remove is a state class that snaps back

The `.js` gate and the sweep above both cover the element never being *revealed*.
Neither covers the author revealing it and then taking the class away. One build
added `is-done` to a hero and removed it 700ms later to tidy up; every line
snapped back to `translateY(150%)` and the H1 disappeared on both viewports.

The rule: **the class that ends a reveal is the resting state, so it is
permanent.** If you need a temporary class for the animation, add a second one
and never remove the one the final layout depends on.

This is the failure `reduced-motion.jpg` is best at exposing, because under
reduced motion the class is never added at all, so the frame shows you exactly
what a visitor sees when the sequence does not run.

### Type over a transparent nav reads as a contrast failure

A fixed nav with no background over a dark hero photograph composites, to the
auditor, against `body`. `build-loop.md` explains that the contrast check cannot
see photograph pixels; here is the fix it does not give.

Reported 1.22:1 on eight nav links that are perfectly legible on screen. Adding
a `text-shadow` alone does not clear it. What works is giving the nav a real
gradient `background-image` **and** a `text-shadow` on the links: the gradient
flips the element into the over-media branch, and the shadow then satisfies the
scrim requirement.

```css
.nav{
  background-image:linear-gradient(to bottom, rgb(0 0 0 / .55), transparent);
}
.nav a{ text-shadow:0 1px 2px rgb(0 0 0 / .55); }
```

That is also the honest fix rather than a trick: a nav floating on a photograph
does need a scrim, and it will need one on a light frame of the same video.

### The masked-reveal deadlock

Chrome folds an element's own `clip-path` into the rectangle it reports to
IntersectionObserver. An image hidden with `clip-path: inset(0 0 100% 0)` has a
zero-height intersection rectangle, so it never fires `isIntersecting`, so the
class that would unclip it is never added. The element stays masked for ever and
the page ships with an empty rectangle where the hero image should be.

**Observe the parent, clip the child.**

```html
<div class="reveal-frame"><img class="reveal-clip" src="…" alt="…"></div>
```
```css
.js .reveal-frame .reveal-clip{clip-path:inset(0 0 100% 0);transform:scale(1.06)}
.js .reveal-frame.is-in .reveal-clip{
  clip-path:inset(0 0 0 0);transform:none;
  transition:clip-path var(--t-arrive) var(--e-settle),transform var(--t-arrive) var(--e-settle);
}
```

The same trap applies to `opacity: 0` only when an ancestor also has
`content-visibility: hidden`. Plain `opacity: 0` still reports intersection.

## Signature moments

Three per page, not thirty. Each one must:

1. Be tied to what the business actually sells
2. Be the only thing happening in that viewport
3. Have a still composition that works with motion removed

Types that carry weight: a scrubbed sequence tied to a real object, a pinned
chapter stage, a masked type reveal at display scale, a cursor-driven image
preview on an index list, a horizontal chapter, a load sequence that resolves
into the hero.

Types that do not: fade-ups, card hovers, parallax on a decorative blob,
particles with no relationship to the product, a counter animation.

## Cursor and hover on desktop

Custom cursors are a signature or a liability. If you build one:
- Keep the native cursor's affordance legible (it must still say "clickable")
- Use `pointer: fine` media query to disable entirely on touch
- **Declare the `pointer: coarse` block after your width breakpoints.** Media
  queries carry no specificity of their own, so a later `@media (max-width: …)`
  rule re-setting `grid-template-columns` silently overrides the touch layout
  you wrote above it. Source order is the only thing deciding the winner.
- Lerp toward the pointer at ~0.15 per frame; instant tracking feels cheap,
  heavy lag feels broken

## Reduced motion

Ship this in the same commit as the motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Then handle the structural cases the blanket rule cannot: release scroll pins
(a pinned section with its tween disabled is a dead scroll region), stop
autoplaying video, and confirm every element that motion was going to reveal is
visible. `audit-page.mjs` captures `reduced-motion.jpg` — read it.

## Performance

- `transform` and `opacity` only, on the compositor
- `will-change` on the two or three elements that need it, never globally
- Cap devicePixelRatio at 1.5–2 for canvas work
- Long scroll-driven scenes: check a mid-tier phone, not just the laptop
- If the page drops frames while scrolling, the motion is not premium no matter
  how it was authored
