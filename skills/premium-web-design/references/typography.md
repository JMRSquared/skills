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

Set every pairing in sentence case, rows 5 and 6 included. A heavy wide face
reads as poster energy through weight and width; it does not need capitals.
The role table in `typographic-hierarchy.md` governs sizes for all twelve.

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

## Scale and hierarchy

**The scale lives in `references/typographic-hierarchy.md`, and it is the
standard.** Six roles (display, title, heading, lead, body, small), each with a
`rem + vw` clamp between 390 and 1440, a weight, a line-height, tracking, case,
measure and colour. It also sets the rules for how many sizes a screen may
show, the minimum step between levels, and how space binds a heading to its
text. Paste its token block; do not rebuild a scale here.

The old `--step-*` scale that used to sit in this section is retired. It had
eight steps, so a screen could show seven sizes, and it shipped a 12px
uppercase label tracked to 0.14em that ended up on every block of every page.

The three rules that used to live here still hold, and the standard now gives
each a number:

- **Body copy is 17–18px.** 16px is a floor, not a target, and body is never
  set in `--ink-muted`.
- **Jump hard between levels.** Adjacent levels at 20px and above differ by at
  least 1.2×; display to body is at least 5:1 at 1440.
- **One hero statement per page.** If two things are hero-sized in one
  viewport, neither is.

## Optical settings

```css
.display {
  font-size: var(--t-display);
  line-height: 0.92;            /* display type tightens; 1.2 looks limp */
  letter-spacing: -0.035em;     /* -0.03 to -0.045 at display sizes */
  text-wrap: balance;           /* kills widows */
}
.body {
  font-size: var(--t-body);
  line-height: 1.55;            /* 1.5–1.6 */
  letter-spacing: 0;            /* never track out body text */
  max-width: 68ch;              /* 60–72ch */
  text-wrap: pretty;
}
.label {                        /* the small role. Use sparingly: labels are a last resort */
  font-size: var(--t-small);    /* 15px. Never 10–12px */
  font-weight: 500;
  /* sentence case. If caps: ≤3 words, ≥14px, letter-spacing 0.06–0.1em */
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
.line{display:block;width:max-content;overflow:hidden;padding-block:16px;margin-block:-16px}
.js .line span{transform:translateY(160%)}   /* not 102% — the box is taller now */
```

`width: max-content` is doing as much work as the padding. `overflow: hidden`
clips **both** axes, so the moment one word runs wider than the clip box the
line loses its last letters: "HUNDRED" shipped as "HUNDRE". It looks exactly
like a broken webfont, it survives every check, and it is invisible until a
headline gets long enough or a viewport gets narrow enough.

The padding is a fixed `16px` and not `.18em` for a reason this skill measures
itself: an em-relative value resolves to a different fractional pixel at every
display size, so two display sizes produce four repeated off-grid values and
`spacing-off-grid` fires above three. A fixed pixel value does the same job and
costs nothing.

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
| Hero at 36–48px | A blog post pretending to be a brand site | `--t-display`, 6–14vw |
| 14px gray body | Terms-of-service energy | 17–18px in `--ink` |
| Seven sizes on one screen | Nothing is in charge | Six roles, four sizes per screen at most (`typographic-hierarchy.md`) |
| Tiny caps label on every block | Furniture announcing structure | Delete it; the title says what the section is |
| Section titles at different sizes | Every section looks like a different site | `--t-title` on every section `h2` |
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
