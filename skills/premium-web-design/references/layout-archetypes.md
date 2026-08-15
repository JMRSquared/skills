# Layout archetypes

An agent with no layout plan produces the same page every time: centred hero,
three cards, testimonial row, CTA band. Pick an archetype before you write
markup, and pick section compositions from the second list instead of reaching
for cards.

## Page archetypes

Choose one. The choice is the art direction decision that everything else
follows from.

### A. Full-bleed statement
```
┌──────────────────────────────────────┐
│  ▓▓▓▓▓▓▓ image / video / 3D ▓▓▓▓▓▓▓  │  100vh, no chrome
│        ONE WORD OR FIVE              │  hero type 10–14vw, bottom-left
│  ─────────────────────────────────   │
├──────────────────────────────────────┤
│  chapter 01   │  standfirst copy     │  asymmetric 1:2
```
For brands where the product is a feeling. Needs one exceptional image.

### B. Editorial split
```
┌──────────────┬───────────────────────┐
│  sticky      │  scrolling content    │
│  type block  │  images, chapters     │
│  (40%)       │  (60%)                │
```
For services, menus, catalogues. `position: sticky` left column, content
scrolls past. Reads expensive, cheap to build, works on any stack.

### C. Pinned stage
```
┌──────────────────────────────────────┐
│      [ product held centre ]         │  pinned while copy
│  copy chapter 1 → 2 → 3 scroll by    │  chapters cycle
```
For a single hero object (a product, a machine, a dish). GSAP ScrollTrigger
pin, or `position: sticky` + IntersectionObserver for the cheap version.

### D. Horizontal chapter
```
scrolls down → moves sideways
[ 01 ][ 02 ][ 03 ][ 04 ]
```
For timelines, galleries, process. Expensive to get right on touch; give phones
a vertical version of the same content.

### E. Index / directory
```
┌──────────────────────────────────────┐
│  01  SERVICE NAME        £45    →     │  full-width rows,
│  ────────────────────────────────     │  hairline rules,
│  02  SERVICE NAME        £60    →     │  image on hover
```
The best replacement for a card grid. Rows, numbers, hairlines, price on the
right, a preview image that follows the cursor. Amrit Palace and most menu-led
award sites are variations of this.

### F. Poster stack
```
┌──────────────────────────────────────┐
│  huge type overlapping an image      │
│  next section overlaps the last      │
```
Layered z-index, negative margins, type crossing image boundaries. High risk,
high reward — needs real photography.

### G. Documentary scroll
```
[full-bleed photo] → [quiet type] → [full-bleed photo] → [quiet type]
```
Alternating 100vh imagery and generously-set text. Almost impossible to make
ugly if the photography is good. The safest route to a premium result.

**A "layout family" is one row of the table below**, or one of the seven page
archetypes above used as a section shape. Step 1 asks an 8-section page for four
of them. Six variations on "full-width row with a headline on the left" is one
family six times, whatever the background colour does. Nothing measures this —
count them yourself before you claim the rule.

## Section compositions (use instead of cards)

| Instead of | Build |
|---|---|
| 3 feature cards | Three full-width rows: oversized number, headline on the left axis, one line of copy, hairline between |
| Testimonial cards | One quote at 3–4vw, attributed small, alone on a ground shift |
| Team card grid | Full-bleed portrait strip, names as a horizontally-scrolled index below |
| Pricing cards | A table with real typographic hierarchy, or one recommended plan large and the others as rows |
| Icon + title + text ×6 | An index list (archetype E), or two large images with copy set against them |
| Logo cloud | A single line of marks at low opacity, or one sentence naming clients |
| Stat cards | Four numbers at 6vw on one line, labels beneath in the label style |

Cards are not banned because cards are evil. They are banned because they are
what an agent reaches for when it has not decided what matters, and a grid of
equal boxes says nothing is more important than anything else.

## Grid and spacing

```css
:root {
  --gutter: clamp(1.25rem, 4vw, 5rem);
  --measure: 68ch;
  --section-y: clamp(5rem, 12vh, 12rem);   /* 80–190px between movements */
}
.wrap { width: min(100% - var(--gutter) * 2, 90rem); margin-inline: auto; }
```

- 12 columns on desktop, 4 on phone. Break the grid deliberately once or twice
  per page — never accidentally.
- **Asymmetry beats symmetry.** A 5/7 split reads designed; a 6/6 split reads
  default. Centre only the hero, and only if the hero is a statement.
- Vertical rhythm between sections: 96–200px desktop, 64–96px phone. Cramped
  section spacing is the most common single cause of a cheap-looking page.
- Give one element per screen permission to be much larger than everything
  else. Scale contrast is what makes a composition read as art direction.

## First viewport

- One composition, not a dashboard of widgets.
- The brand is the dominant signal — name, one statement, one image.
- At most one primary action, one secondary.
- Nothing below-the-fold peeking as a "scroll hint" strip of a card.
- Navigation is small. A big nav bar with eight links eats the frame that is
  meant to sell the brand.

## Breaking points

Design at 1440 and 390. Check 768 and 1920. If a layout only works at one
width, it is not a layout.
