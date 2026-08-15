# Typography

Type carries more perceived quality than any other decision on the page. An
agent that gets type right and everything else average ships something people
call beautiful. The reverse never happens.

Every face listed here was checked live (Google Fonts CSS2 API / Fontshare v2,
2026-08-14) and returns 200. Use these names verbatim.

## The rule that fixes most ugly pages

**The display face may never be Inter, Roboto, Arial, Helvetica, system-ui, or
the framework default.** Body text may be neutral. The largest words on the
page are the brand's voice, and a default face there is the single loudest
signal that nobody art-directed this.

Two families. Three only when a mono is doing real work (specs, timestamps,
labels). Never four.

The ban list is wider than the six names above: Georgia, Times New Roman,
Verdana, Tahoma, Trebuchet, Courier, Palatino and Impact are all faces a browser
already has, and the auditor now reads them as default voices too. Naming a face
that does not exist is worse than either — `font-family: "Awwwards Display"`
renders as the browser default and every font check reads the string you typed,
which is why `display-font-unavailable` exists.

There is a second trap. Ban Inter and a model reaches for the next most likely
face — Space Grotesk, Poppins, Montserrat — which now signals "generated" just
as loudly. Pick from the table below, and do not use the same display face on
two consecutive projects.

## Verified pairings

Pick one row. Do not assemble your own pairing from memory — that is where
clashes come from.

| # | Feeling | Display | Body | Source |
|---|---|---|---|---|
| 1 | Editorial luxury, quiet confidence | **Instrument Serif** | **Instrument Sans** | Google |
| 2 | Fashion / high contrast / gallery | **Bodoni Moda** | **Switzer** | Google + Fontshare |
| 3 | Warm craft, human, hospitality | **Fraunces** (opsz 144, `SOFT` 40) | **Satoshi** | Google + Fontshare |
| 4 | Modern brand, confident sans | **Clash Display** | **General Sans** | Fontshare |
| 5 | Bold statement, poster energy | **Anton** or **Archivo** (wdth 125, wght 800) | **Work Sans** | Google |
| 6 | Technical premium, product/hardware | **Technor** or **Archivo** (wdth 112, wght 700) | **Geist** + **Geist Mono** | Fontshare + Google |
| 7 | Contemporary editorial, magazine | **Newsreader** (opsz 72) | **Schibsted Grotesk** | Google |
| 8 | Playful but expensive | **Bricolage Grotesque** (wdth 75–100) | **Manrope** | Google |
| 9 | Classic authority, heritage trade | **Libre Caslon Display** | **Karla** | Google |
| 10 | Soft premium, care / wellness / clinic | **Gambetta** | **Supreme** | Fontshare |
| 11 | Cinematic dark, night mood | **Melodrama** | **Cabinet Grotesk** | Fontshare |
| 12 | Structural, architectural | **Familjen Grotesk** | **Sentient** | Google + Fontshare |

Loading:

```html
<!-- Google -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">

<!-- Fontshare -->
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600&f[]=general-sans@400,500,600&display=swap" rel="stylesheet">
```

Next.js: use `next/font/google` for the Google rows and `next/font/local` with
downloaded Fontshare `.woff2` for the rest. Never `@import` inside a CSS file
you also render above the fold — it blocks.

## Scale

One fluid scale, held everywhere. These clamps are tuned for a 1440px canvas
and a 390px phone.

```css
:root {
  /* display */
  --step-hero:  clamp(3.25rem, 11vw, 11rem);    /* the one big statement */
  --step-h1:    clamp(2.5rem, 6.5vw, 6rem);
  --step-h2:    clamp(1.875rem, 3.6vw, 3.25rem);
  --step-h3:    clamp(1.375rem, 2.2vw, 2rem);
  /* text */
  --step-lead:  clamp(1.125rem, 1.5vw, 1.5rem);  /* standfirst under a hero */
  --step-body:  clamp(1rem, 1.05vw, 1.125rem);   /* 17–18px, never 14 */
  --step-small: 0.9375rem;
  --step-label: 0.75rem;                          /* uppercase, tracked out */
}
```

Rules that come with the scale:

- **Body copy is 17–18px on desktop.** 14px body is the most reliable tell of
  an AI-built page. 16px is a floor, not a target.
- **Jump hard between levels.** A hero at 96px next to a lead at 18px reads
  art-directed. A hero at 40px next to body at 18px reads like a document. If
  your largest and smallest type differ by less than 4×, there is no hierarchy.
- **One hero statement per page.** If two things are hero-sized, neither is.

## Optical settings

```css
.display {
  font-size: var(--step-hero);
  line-height: 0.92;            /* display type tightens; 1.2 looks limp */
  letter-spacing: -0.035em;     /* -0.02 to -0.045 at display sizes */
  text-wrap: balance;           /* kills widows */
}
.body {
  line-height: 1.55;            /* 1.5–1.65 */
  letter-spacing: 0;            /* never track out body text */
  max-width: 68ch;              /* 60–75ch */
  text-wrap: pretty;
}
.label {
  font-size: var(--step-label);
  text-transform: uppercase;
  letter-spacing: 0.14em;       /* uppercase needs 0.08–0.16em or it clots */
  font-weight: 500;
}
.stat { font-variant-numeric: tabular-nums; }
```

### Clipping a line-masked reveal

`line-height: 0.92` makes the line box **shorter than the glyph extents**. Put
`overflow: hidden` on that line and the clip shaves the tops of caps and the
tails of descenders. It looks like a broken webfont, no auditor checks for it,
and it only shows up when you look at a rendered frame.

Clip the padding box instead, and raise the hidden travel so the glyph still
starts fully outside it:

```css
.line{display:block;overflow:hidden;padding-block:.18em;margin-block:-.18em}
.js .line span{transform:translateY(160%)}   /* not 102% — the box is taller now */
```

Two things that bite in the same place: split the text **after**
`document.fonts.ready`, or the measured line breaks belong to the fallback face
and re-wrap inside their own clip boxes when the webfont swaps in. And if you
set the split container to `display: flex`, every measurement span becomes a
flex item and the heading wraps one word per line.

Serif display faces need tighter tracking than sans at the same size. Uppercase
always needs positive tracking. Lowercase display below 0 tracking; above 72px
push to −0.04em.

## Weight strategy

Two weights per family, three at most. Get contrast from **size and colour**,
not from stacking 300/400/500/600/700/800 — a page using five weights of one
family looks unresolved.

Never use weight 100–300 for anything a person has to read. Never set body copy
in the display face.

**Step 3's contract says "commit: 200–300 or 800–900". Several pairings here
cannot.** Libre Caslon Display, the row labelled heritage trade, ships weight
400 only. So does Instrument Serif. Familjen Grotesk stops at 700. The rule is
about *committing to an extreme rather than sitting in the middle of a family's
range*, so read it against the range the family actually offers: take the
lightest or the heaviest cut it has, and do not mix three weights from the
middle. A 400-only face is already committed, because it has nothing else.

## Where agents go wrong

| Mistake | What it looks like | Fix |
|---|---|---|
| Hero at 36–48px | A blog post pretending to be a brand site | `--step-hero`, 6–14vw |
| 14px gray body | Terms-of-service energy | 17–18px, and darken the grey |
| Five weights | Nothing feels deliberate | Two weights |
| Tracking body copy out | "Designed" in the worst way | `letter-spacing: 0` |
| Centering everything | No structure, no tension | Centre the hero if you like; set the rest on a left axis |
| Display face for paragraphs | Unreadable, amateur | Body face for anything over one line |
| Default line-height on huge type | Floating, disconnected words | 0.88–1.0 on display |
| Both faces sans, similar width | Reads as one font used badly | Contrast the categories: serif/sans, or wide/narrow |

## Localisation

Check glyph coverage before shipping a non-Latin locale. Fontshare faces are
Latin-only. For accented Latin (French, Vietnamese) confirm the subset in the
CSS URL (`&subset=latin-ext`).
