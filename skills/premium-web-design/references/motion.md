# Motion

"Meaningful micro-interactions and cinematic scroll" is what produced the
identical 500ms `fadeInUp` on every block. Motion needs values, a budget, and a
repetition limit — not adjectives.

## Values

Use these. Do not invent curves.

```css
:root {
  --ease-out:  cubic-bezier(0.16, 1, 0.3, 1);    /* the workhorse: enters, hovers */
  --ease-in:   cubic-bezier(0.7, 0, 0.84, 0);    /* exits */
  --ease-move: cubic-bezier(0.65, 0, 0.35, 1);   /* things travelling across the screen */
  --d-press:  120ms;
  --d-state:  240ms;
  --d-layout: 400ms;
  --d-enter:  700ms;
}
```

| Interaction | Duration | Easing | Travel |
|---|---|---|---|
| Press / toggle | 100–150ms | linear or `--ease-out` | `scale(0.97)` on `:active` |
| Hover, state change | 150–300ms | `--ease-out` | 2–6px, or a colour shift alone |
| Accordion, modal, drawer | 300–500ms | in `--ease-out`, out `--ease-in` | height/opacity |
| Scroll entry | 600–800ms | `--ease-out` | `translateY(12–20px)`, opacity 0→1 |
| Stagger step | 50–80ms per item | — | cap the chain at 6 items |
| Exit | ~75% of its enter | `--ease-in` | shorter travel than the enter |
| Page transition | 500–900ms | `--ease-move` | a wipe, a mask, or a held element |

**Banned by value:** `cubic-bezier(0.34,1.56,0.64,1)` and
`cubic-bezier(0.68,-0.6,0.32,1.6)` — bounce and elastic. Real mass decelerates;
it does not overshoot on a hover.

Also banned: `transition: all`, bare `ease`/`ease-in-out`, animating
`top`/`left`/`width`/`height`, animating from `scale(0)` (start at 0.92), and
any animation over 1200ms that the user did not ask for.

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
.js .reveal.is-in { opacity: 1; transform: none; transition: opacity var(--d-enter) var(--ease-out), transform var(--d-enter) var(--ease-out); }
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
  transition:clip-path var(--d-enter) var(--ease-out),transform var(--d-enter) var(--ease-out);
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
