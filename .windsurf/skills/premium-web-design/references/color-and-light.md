# Colour, light, and surface

Ugly pages are usually not badly composed. They are badly coloured: a purple
gradient, six accent hues, pure black on pure white, and a drop shadow on
everything.

## The formula

A premium page runs on **five values**, not a palette generator's ten:

| Role | What it does | How much of the page |
|---|---|---|
| **Ground** | The surface everything sits on | 70–85% |
| **Ink** | Primary text | — |
| **Ink-muted** | Secondary text, still AA-legible | — |
| **Accent** | One colour, used rarely, always meaningful | 2–8% |
| **Edge** | Hairlines, dividers, subtle surfaces | — |

One dominant hue family, one accent, neutrals. When the auditor reports more
than four hue families carrying real area, the page has lost its art direction.

**Never pure black on pure white.** `#000` on `#fff` is a 21:1 glare that no
designer ships. Tint your neutrals — a ground of `#0B0B0D` or `#F7F5F2` reads
as considered; `#000`/`#fff` reads as unstyled.

## Six grounded palettes

Copy one whole. Do not mix rows.

### 1. Night studio (cinematic dark, default for product/3D work)
```css
--ground: #0B0B0D;  --ground-2: #141417;  --edge: #24242A;
--ink: #F4F3F1;     --ink-muted: #A2A2AC;  --accent: #E8FF4A;
```

### 2. Paper warm (editorial, craft, hospitality)
```css
--ground: #F6F2EA;  --ground-2: #EDE6DA;  --edge: #DCD2C2;
--ink: #1A1713;     --ink-muted: #6B6155;  --accent: #B4401F;
```

### 3. Clinic calm (care, medical, veterinary, wellness)
```css
--ground: #FBFAF7;  --ground-2: #EEF3EF;  --edge: #DDE5DE;
--ink: #14201A;     --ink-muted: #5B6B62;  --accent: #1F7A5A;
```

### 4. Ink & sand (heritage trade, workshop, legal)
```css
--ground: #12151A;  --ground-2: #1B1F26;  --edge: #2C323C;
--ink: #F2EFE9;     --ink-muted: #9AA1AC;  --accent: #C89B4A;
```

### 5. Bright signal (energetic consumer, food, sport)
```css
--ground: #FFFDF9;  --ground-2: #FFF0D6;  --edge: #F0E2C6;
--ink: #17130C;     --ink-muted: #6A5F4E;  --accent: #FF4A17;
```

### 6. Cold steel (technical, hardware, developer)
```css
--ground: #08090A;  --ground-2: #101214;  --edge: #1E2126;
--ink: #EDEFF2;     --ink-muted: #8B929C;  --accent: #4AA8FF;
```

### Measured contrast (checked 2026-08-14)

| Palette | ink / ground | ink-muted / ground | ink-muted / ground-2 | accent / ground |
|---|---|---|---|---|
| Night studio | 17.73 | 7.77 | 7.27 | 17.64 |
| Paper warm | 15.99 | 5.43 | 4.88 | 5.09 |
| Clinic calm | 16.08 | 5.40 | 5.02 | 5.04 |
| Ink & sand | 15.94 | 7.03 | 6.35 | 7.18 |
| Bright signal | 18.21 | 6.15 | 5.56 | **3.31** |
| Cold steel | 17.30 | 6.35 | 5.98 | 7.91 |

Every pairing clears AA for body text except Bright signal's accent: at 3.31:1
that orange is a fill and a large-type colour only — never small text.

Check every text/ground pairing you invent hits 4.5:1 (3:1 for type ≥24px).
`--ink-muted` is the one that usually fails — verify it, do not assume it.

## Gradients

Allowed, in three forms only:

1. **Scrim** — the workhorse. Keeps text legible over imagery.
   ```css
   background-image: linear-gradient(to top, rgb(0 0 0 / .78) 0%, rgb(0 0 0 / .35) 35%, transparent 65%);
   ```
2. **Atmospheric glow** — a single soft radial, low opacity, behind content.
   ```css
   background-image: radial-gradient(60% 50% at 50% 0%, rgb(232 255 74 / .10), transparent 70%);
   ```
3. **Duotone on imagery** — a photo mapped into two brand values via
   `mix-blend-mode: color` or an SVG `feColorMatrix`.

Banned: the purple→blue diagonal, rainbow multi-stop, gradient body text,
gradient borders on cards, gradient buttons with a second gradient on hover.
Those are the visual signature of a generated page.

## Shadow and elevation

Pick one system and hold it:

**Flat/editorial (default for award work)** — no shadows at all. Separation
comes from spacing, hairlines (`1px solid var(--edge)`), and ground shifts.

**Physical** — layered, tinted with the ground hue, never pure black:
```css
--shadow-sm: 0 1px 2px rgb(8 9 10 / .28);
--shadow-md: 0 4px 12px -2px rgb(8 9 10 / .30), 0 2px 4px -2px rgb(8 9 10 / .20);
--shadow-lg: 0 24px 48px -12px rgb(8 9 10 / .45), 0 8px 16px -8px rgb(8 9 10 / .30);
```
One light source for the whole page. If a card's shadow falls down-right, every
shadow falls down-right, including the ones drawn inside your 3D scene.

Never: `box-shadow: 0 0 20px rgba(0,0,0,0.1)` on everything. Ambient glow with
no direction is the cheapest-looking effect on the web.

## Surface texture

Flat fill is what "AI-generated" looks like. Add one, not three:

```css
/* film grain — 1 SVG, no image request */
.grain::after {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 1;
  opacity: .05; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

Other single choices: a paper or concrete photo at 4–8% opacity; a 1px hairline
grid at 3% opacity; a very slight vignette. Pick one per site.

## Dark mode

Do not invert. A dark variant is a separate composition: raise `--ink-muted`
luminance, drop image brightness ~8%, thin your hairlines, and reduce accent
saturation ~10% so it does not vibrate on a dark ground.

## Colour and meaning

The accent means one thing on the whole site — usually "act here". If the
accent appears on a heading, a badge, a link, a border, and a background, it
has stopped meaning anything and the page reads as noisy.
