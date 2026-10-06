# Brand world recipes

Recipes for the default mode of `/premium-web-design`. Each one is taken from the
example sites in [latent-spaces/brag](https://github.com/latent-spaces/brag)
(MIT, © 2026 Shunit Haviv Hakimi), measured from their CSS. Retune values to
your world; copy the structure.

## Worlds that shipped

| Site | World sentence | Display · text · mono |
|---|---|---|
| /brag launch | One burnt-orange field, lowercase black type at 200px, one word knocked out of an ink block | Geist 900 · Geist · Geist Mono |
| Taxi for Taxis | A city at 2:47 a.m.: night navy, checker-cab yellow, neon pink route line, Bungee on the signs | Bungee · Space Grotesk · JetBrains Mono |
| Horse Tinder | A 1970s dating app: cream paper, sunset stripes, chocolate ink, hot pink | Shrikhand · Figtree |
| Fish Flight School | An aviation academy on a clear morning: sky blue, safety orange, navy stencil | Big Shoulders Stencil Display · Hanken Grotesk · DM Mono |

## Pairings by world

Pick by the world, then check the face renders. Display faces with character:

| World | Display | Text | Mono |
|---|---|---|---|
| Signage, city, transit, arcade | Bungee, Bungee Shade | Space Grotesk | JetBrains Mono |
| Retro romance, food, 70s warmth | Shrikhand, Fraunces 900 italic | Figtree | DM Mono |
| Industrial, aviation, military, sport | Big Shoulders Stencil Display, Barlow Condensed 800 | Hanken Grotesk | DM Mono |
| Dev tool, launch, manifesto | Geist 900 lowercase, Archivo Black | Geist | Geist Mono |
| Editorial, craft, heritage | EB Garamond italic, Libre Baskerville 700 | Hanken Grotesk | IBM Plex Mono |
| Playful consumer, kids, pets | Bricolage Grotesque 800 (opsz 96), Chewy | Figtree | Space Mono |
| Luxury, hospitality | Cormorant 300, Italiana | Manrope | none |

## Palette shape

```css
--ground, --ground-2      /* 50%+ of the area; two steps of the same hue */
--ink, --ink-soft         /* dark text, tinted toward the ground: #3b1d12 on cream, #141833 navy */
--accent, --accent-soft   /* the loud one: pink, safety orange, cab yellow */
--support-1, --support-2  /* scenery: grass, sky, sunset bands, cyan */
```

Single-hue field, the brag launch site's approach:

```css
:root { --hue: 35; }
--hero-bg:  oklch(64% 0.22 var(--hue));
--hero-ink: oklch(16% 0.06 var(--hue));
--ink-soft: oklch(28% 0.06 var(--hue));
--dark-bg:  oklch(14% 0.03 var(--hue));
```

## Highlighted word

Pick one per page.

```css
/* Knocked out of an ink block (brag) */
.emph { font-style: italic; background: var(--ink); color: var(--ground); padding: 0 0.06em; }

/* Tilted accent bar with glow (Taxi) */
.hl { color: var(--ink); background: var(--accent); padding: 0 0.12em;
      display: inline-block; transform: rotate(-2deg);
      box-shadow: 0 0 40px oklch(from var(--accent) l c h / 0.45); }

/* Stroked fill with a hard offset shadow (Horse Tinder). The auditor reads
   the fill colour against the ground, so the fill alone needs 3:1 there. */
.word { color: var(--accent); -webkit-text-stroke: 3px var(--ink);
        paint-order: stroke fill; text-shadow: 6px 6px 0 var(--ink); }

/* Accent block with offset ink shadow (Fish) */
.fly { background: var(--accent); padding: 0 0.1em; display: inline-block;
       transform: rotate(-1.5deg); box-shadow: 8px 8px 0 var(--ink); }
```

## Sticker

```css
.sticker { position: absolute; display: grid; gap: 2px;
  background: var(--white); color: var(--ink);
  border: 3px solid var(--ink); border-radius: 16px; padding: 10px 16px;
  box-shadow: 6px 6px 0 var(--accent); transform: rotate(-3deg); }
.sticker-label { font: 500 11px/1 var(--mono); letter-spacing: 0.14em; text-transform: uppercase; }
.sticker-value { font: 400 40px/1 var(--display); }
.sticker-note  { font: 400 11px var(--mono); }
```

```html
<div class="sticker"><span class="sticker-label">ETA</span>
  <span class="sticker-value">3:08</span><span class="sticker-note">#2207 accepted #4821</span></div>
```

Small tags work the same way at pill size: `#4821 · requested pickup` in mono on
ink, `2.4 mi away` on the photo corner.

## Buttons

```css
.btn { display: inline-flex; align-items: center; min-height: 54px; padding: 0 26px;
  border-radius: 999px; font-weight: 700; font-size: 17px; text-decoration: none;
  transition: transform 200ms var(--ease), box-shadow 200ms var(--ease); }
.btn-primary { background: var(--accent); color: var(--ink); border: 3px solid var(--ink);
  box-shadow: 5px 5px 0 var(--ink); }
.btn-primary:hover { transform: translate(-2px, -2px); box-shadow: 7px 7px 0 var(--ink); }
.btn-ghost { border: 3px solid var(--ink); background: transparent; }
.btn:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
```

Put a mono side note next to the primary button: `No surge for tired vehicles.`
It answers the objection before the click.

## Drawn character

One `<symbol>`, many instances. Parts get classes; colours and states come from
custom properties on the instance.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <!-- --tired: 1 lowers the lid and flattens the mouth; 0 wakes it up -->
  <symbol id="cab" viewBox="0 0 340 210">
    <path class="c-shadow" d="M30 196h280"/>
    <path class="c-body" d="M22 128c0-20 14-36 34-36h212c26 0 46 16 50 38l4 22c2 12-6 22-18 22H40c-10 0-18-8-18-18z"/>
    <!-- …windows, sign, wheels, eye: white + pupil + glint, lid, mouth… -->
  </symbol>
</defs></svg>

<svg class="cab tired" role="img" aria-label="A tired taxi"><use href="#cab"/></svg>
<svg class="cab awake" role="img" aria-label="A taxi on the way"><use href="#cab"/></svg>
```

```css
.cab { --paint: var(--yellow); }
.cab.awake { --tired: 0; --paint: #ffd23f; }
.c-body { fill: var(--paint); stroke: var(--ink); stroke-width: 5; stroke-linejoin: round; }
.c-lid  { opacity: var(--tired, 1); }
.c-smile { opacity: calc(1 - var(--tired, 1)); }
.c-shadow { stroke: rgb(0 0 0 / 0.35); stroke-width: 10; stroke-linecap: round; }
```

Drawing rules that keep it from reading as clip art:

- One stroke weight for outlines (4–5px at a 300–400 unit viewBox), 3px for
  inner detail. Round joins and caps everywhere.
- Flat fills from the palette only. One highlight shape per big form, no gradients
  inside the drawing.
- Eyes: white ellipse, ink pupil, small white glint. Off-centre pupils give a
  look direction; aim it at the headline or the CTA.
- A ground shadow under anything that stands, so it sits in the scene.
- Build from big simple shapes first, render, then add details. Look at it at
  phone size; anything under 2px vanishes.

## Scenery

Absolute layers behind the hero, `pointer-events: none`, `aria-hidden`.

```css
/* Sunset arches (Horse Tinder) */
.sunset span { position: absolute; bottom: 0; border-radius: 50% 50% 0 0; }
/* stack 4 spans, each smaller, each a palette step */

/* Hill with an ink rim */
.hill { position: absolute; left: -10%; right: -10%; bottom: 0; height: 190px;
  background: var(--grass); border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  border-top: 5px solid var(--ink); }

/* Flowing dotted route between two objects (Taxi) */
.route path { fill: none; stroke: var(--pink); stroke-width: 6; stroke-linecap: round;
  stroke-dasharray: 2 16; filter: drop-shadow(0 0 8px var(--pink));
  animation: dash 1.4s linear infinite; }
@keyframes dash { to { stroke-dashoffset: -36; } }
```

Other grounds: a street grid SVG at 75% opacity, clouds from three circles, a
wave path, a cutting mat grid, a ticket stub edge.

## Band

```css
.band { background: var(--accent); color: var(--ink); overflow: hidden;
  border-block: 12px solid transparent;
  border-image: repeating-linear-gradient(90deg, var(--ink) 0 12px, var(--white) 12px 24px) 12; }
.band-track { display: flex; width: max-content; animation: band 30s linear infinite;
  font-family: var(--display); font-size: 20px; }
.band-track span { padding: 14px 30px; white-space: nowrap; }
@keyframes band { to { transform: translateX(-50%); } }
```

Duplicate the item list once inside the track so the loop is seamless. Items are
the page's best facts, not slogans.

## Ambient motion

```css
@keyframes rise   { from { opacity: 0; transform: translateY(40px) rotate(-2deg); } }
@keyframes idle   { to { transform: translateY(-3px); } }        /* 0.5s alternate */
@keyframes float  { 50% { transform: translateY(-8px); opacity: 0.6; } } /* 2.4s */
@keyframes twinkle { 50% { opacity: 0.2; } }                     /* 3s, staggered delays */
@keyframes ping { 70% { box-shadow: 0 0 0 10px transparent; } }  /* live dot */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

## Phone

Hero stacks at 900px. Keep the headline at 2–4 lines, put the hero object under
the copy at 80–90% width, drop at most one sticker, and keep the band.
