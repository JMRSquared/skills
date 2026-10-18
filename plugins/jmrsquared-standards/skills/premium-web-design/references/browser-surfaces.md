# Browser surfaces

The parts of the page you did not draw still carry the design. A page that
gets every component right and leaves the browser chrome at default reads as
half-finished and it is the cheapest signal that a page was built rather
than assembled. It is also the step that gets skipped most reliably.

Audit these once, near the end of `Step 5`. Read each visible state with the
Read tool after the change.

## 1. Selection

Default text selection is the accent colour of the OS, which fights every
brand. Theme it to the accent on every brand ground the page uses, including
its inverse ground.

```css
:root {
  --sc-accent: #FF5A3D;
  --sc-accent-ink: #15110F;
  --sc-selection-bg: var(--sc-accent);
  --sc-selection-ink: var(--sc-accent-ink);
}
::selection { background: var(--sc-selection-bg); color: var(--sc-selection-ink); }
::-moz-selection { background: var(--sc-selection-bg); color: var(--sc-selection-ink); }

/* Inverse ground re-statement: see color-and-light.md "subtree ink trap" */
.section--inverse::selection { background: var(--sc-accent);
                               color: var(--sc-accent-ink); }
```

## 2. Caret colour

The text-input caret inherits `color` from the input. Theme it to the accent
so a focused field is immediately identifiable without the focus ring alone.

```css
input, textarea, select, [contenteditable="true"] { caret-color: var(--sc-accent); }
```

## 3. Focus ring

The default outline is a thin black ring that vanishes on a near-black
ground and fights every brand ground. Use `:focus-visible` (not `:focus`) so
keyboard users see it and mouse clicks do not flash it, theme it to the
accent, give it an offset and make it thicker than the default.

```css
:focus { outline: none; }
:focus-visible {
  outline: 2px solid var(--sc-accent);
  outline-offset: 3px;
  border-radius: inherit;
}
```

Every interactive element gets focus-visible, not just inputs. A page with no
visible focus on its links, buttons, accordions or custom controls fails
`keyboard` review in five seconds.

## 4. Scrollbar

The default scrollbar is OS grey on a near-black ground and reads as a smear.
Two routes, one decision:

- **Tinted thin bar.** Theme the scrollbar to the muted ink on the ground, keep
  the standard hit area. Works on desktop WebKit and Firefox.
- **Floating overlay bar.** Hide the bar entirely on desktop and reveal a thin
  accent-tinted overlay on scroll. Pairs with a fixed nav and an oversized
  hero.

```css
/* Tinted thin bar */
:root { color-scheme: dark; }              /* on dark pages: declare scheme */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--sc-ground); }
::-webkit-scrollbar-thumb { background: var(--sc-ink-muted); border-radius: 0; }
::-webkit-scrollbar-thumb:hover { background: var(--sc-ink); }
* { scrollbar-width: thin; scrollbar-color: var(--sc-ink-muted) var(--sc-ground); }
```

Declare `color-scheme: dark` (or `light`) at `:root` on a non-default page.
The browser uses it for form controls, scrollbars and the canvas default, and
it saves a dozen per-component overrides.

## 5. Underline offset and thickness

Default underlines sit two pixels under the baseline and render one CSS pixel
thick. That is too close and too thin on a display face and too heavy on a
mono. Set offset and thickness per face.

```css
:root {
  --sc-underline-offset: 0.18em;   /* sits below descenders */
  --sc-underline-thickness: 0.06em;
}
a { text-decoration: underline var(--sc-underline-thickness) var(--sc-ink);
    text-underline-offset: var(--sc-underline-offset); }

/* Inverse ground: same rule, recoloured text */
.section--inverse a { text-decoration-color: var(--sc-ink-on-inverse); }
```

## 6. Tabular numerals

Any number that counts, tabulates or is otherwise read across rows should
use `font-variant-numeric: tabular-nums`. Counters, prices, statistics,
spec rows, table cells and `--sc-nums` scrubbed counters all qualify.

```css
.sc-nums, td, .price, .stat { font-variant-numeric: tabular-nums; }
```

Why: a proportional `4` is narrower than a proportional `8` and a counter
that ticks through them reflows the row by a few pixels per tick. Tabular
fixes the width and the row stays still while the digits change.

## 7. Reduced motion

`prefers-reduced-motion: reduce` should override page motion. The cheapest
test: scroll the page with the OS setting on and confirm nothing animates,
nothing scrubs, no autoplay video runs and the page is fully usable.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
  video { display: none; }                       /* or fall back to poster */
}
```

The auditor shoots a reduced-motion pass and reports findings there. The
override above clears most of them.

## 8. Form and button resets

A premium page ships with these defaults tightened, otherwise the browser's
form chrome advertises a different design:

```css
button { background: none; border: none; color: inherit; font: inherit; cursor: pointer; }
input, textarea, select { font: inherit; color: inherit; background: none; border: none; }
input::placeholder, textarea::placeholder { color: var(--sc-ink-muted); opacity: 1; }
```

Then re-draw the elements you want visible (border, background, focus ring)
with the brand tokens. Skipping the reset means the OS picks colours that
fight the page.

## 9. The squint test

Once everything is themed, blur the page until detail is gone. You should
still be able to name the primary element, the secondary element and the
major groups, in that order.

If everything greys into one even field, the problem is hierarchy and no
amount of shadow, gradient or motion will fix it. This is the fastest
sanity check on the visual weight of the page and it takes ten seconds.

## 10. What the auditor reads vs what it cannot

The auditor measures the things above at a structural level: tab order,
focus visibility, srcset discipline, reduced-motion compliance. It does not
measure taste. Theme each of these by hand, then read the page cold once
more before claiming done.