# Type

Typography is most of what makes a page look designed. Plain type set well beats a characterful face set badly, every time. The real sites in `assets/studies/` mostly run a plain grotesk at huge sizes with one display face at most: Satoshi, Aeonik, Neue Montreal, Monument Grotesk, Roboto Flex, Poppins and Oswald all carry award pages.

## Faces

**One family is the default.** Use two only for a real contrast, such as a light serif headline over a sans body. Three is never right. No mono unless the page shows actual code.

If the brand already has fonts, use them and stop here. Otherwise pick from this list. These are free on Google Fonts or Fontshare.

| The brief feels | Use | Set it like |
|---|---|---|
| Most things: services, products, software, trades | Inter Tight, Instrument Sans, Hanken Grotesk, Schibsted Grotesk, Geist, General Sans, Switzer | 500-700, tight tracking, sentence case |
| Loud, physical, sport, food, retail | Archivo at width 125 (800-900), Anton, Oswald, League Gothic, Big Shoulders Display | Uppercase, huge, line height about 0.9, the sans above for body |
| Hospitality, heritage, fashion, editorial | Newsreader Display, EB Garamond, Cormorant Garamond, Libre Caslon Display, Bodoni Moda | Weight 300-400, huge, tight tracking, a plain sans for body |

**Do not use** unless the brand already owns them:

- Novelty faces, which read as a costume: Shrikhand, Bungee, Chewy, Lobster, Pacifico, Fredoka, Baloo, Righteous, Abril Fatface, any stencil, script or "retro" display face.
- AI defaults, which read as generated: Space Grotesk, Instrument Serif, Fraunces, Playfair Display, DM Serif Display, Syne, Bricolage Grotesque, Clash Display.

If the brand owns one of these, add `<meta name="brand-fonts" content="Exact Family">` so the auditor accepts it.

## Scale

Three or four sizes on the whole page. Each step is a clear jump, never a nudge.

| Role | Desktop | Phone | Notes |
|---|---|---|---|
| Display | 8-18vw when type leads, 64-120px over an image | 52-96px | Fill the width on purpose. Line height 0.85-1.0, tracking -0.02em to -0.05em. Two or three lines |
| Heading | 40-72px | 32-44px | Every section heading is the same size |
| Body | 18-22px | 17-18px | Line height 1.45-1.55, 45-65 characters a line, full ink colour |
| Small | 15-16px | 15px | Nav, footer, captions. Sentence case |

Rules that do most of the work:

- **Contrast of scale is the design.** A very large line next to plain body text reads as confident. Five medium sizes read as a template.
- **Weight:** two weights at most. Do not reach for bold to fix hierarchy. Use size and space.
- **No decoration on type.** No outlines, no shadows, no gradient fill, no highlighter bar, no tilted word, no italic single word for emphasis, no coloured word in the headline.
- **No small tracked-caps labels** and no pill labels above headings. Uppercase only as the display voice of the whole page.
- **Tight display, normal body.** Negative tracking at display size, zero at body size.
- **Line breaks by hand.** Break a headline where the sentence breaks. No orphan words. Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs.
- **Alignment:** one left edge per section. Centre only a short display line over an image.
- **Space:** at least twice as much above a heading as below it. Sections breathe at 120-240px on desktop.
- **Numerals:** `font-variant-numeric: tabular-nums` in price tables.

## Loading

Self-host when the project has a build step. Otherwise Google Fonts with `display=swap`, requesting only the weights you use. Open the page and check the face actually rendered before you judge it.
