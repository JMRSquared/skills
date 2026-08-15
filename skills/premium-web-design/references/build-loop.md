# The build loop

Read this when you are about to write code for a premium site.

The old version of this skill asked you to score yourself 8/10 against a jury.
You cannot score a page you have never seen. This file replaces that with a
loop you can actually run.

## Order of work (do not reorder)

```
1. Type + color + spacing on a still page      ← 70% of perceived quality
2. Composition: crop, scale contrast, negative space
3. Real imagery in place at real resolution
4. Motion                                       ← last, and only what earns it
5. Audit loop until zero FAILs
```

**Motion cannot rescue an ugly still page.** If you screenshot the page with
all animation disabled and it looks like a template, animating it produces an
animated template. Every reference study in `site-studies/` holds up as a still
frame first. Check yours the same way: the reduced-motion screenshot the
auditor captures is that test.

Agents get this backwards constantly — they reach for GSAP in the first ten
minutes and never fix the 16px body text on a 1440px canvas.

## The loop

```bash
# from the repo that holds this skill
SKILL=<path to skills/premium-web-design>
PW_DIR=<dir containing node_modules/playwright> \
  node $SKILL/scripts/audit-page.mjs <url-or-file://path> ./.audit
```

It writes `./.audit/desktop-*.jpg`, `mobile-*.jpg`, `reduced-motion.jpg`, and
`audit.json`, prints every finding, and exits non-zero while any FAIL stands.

**Tier C cannot be audited over `file://`.** GLTFLoader fetches, and `file://`
blocks fetch, so the model never arrives, the page takes its own WebGL-missing
fallback path, and the auditor reports a still where you built a scene — with no
console error to explain it. Serve the directory and audit the URL:

```bash
(cd <site-dir> && python3 -m http.server 8899 &)
PW_DIR=<…> node $SKILL/scripts/audit-page.mjs http://localhost:8899/index.html ./.audit
```

Anything loading a model, a texture, a worker or a module over fetch has the same
problem. `file://` is fine for Tier A and Tier B pages that ship no such assets.

Then, every pass, both of these:

1. **Read the frames.** Use the Read tool on the desktop and mobile JPEGs. Look
   at them the way a stranger would. This is not optional — the measurements
   catch contrast and sizing, but only your eyes catch a bad crop, a collision,
   a hero that reads as empty, or type that is technically fine and visually
   limp.
2. **Clear the findings.** FAIL count must reach zero. WARNs need either a fix
   or one line saying why the design intends it.

Repeat until the frames look like something you would show a client and the
auditor is silent. Three passes is normal. One pass means you did not look.

## What each finding actually means

| Code | What went wrong | The fix |
|---|---|---|
| `display-font-generic` | Largest type on screen 1 is Inter/Roboto/system. The biggest word on the page is the brand's voice, and you gave it the browser default. | Pick the display face from your direction kit. Load it properly (`@font-face` with `font-display: swap`, or `next/font`). Body text may stay neutral; the display face may not. |
| `contrast` | Text fails WCAG AA against its own composited background. **The check walks the DOM for the nearest painted background colour — it cannot see the pixels of a photograph.** Over imagery it reports the section's ground and is close to meaningless: it will pass an eyebrow that has vanished into a lit lamp, and fail hero copy that is perfectly legible on a dark plate. Judge type-on-photo from the frame, not from this finding. **Tint marks are exempt:** a giant `aria-hidden="true"` letterform set a shade off its own ground is a deliberate device — tripletta's `WALLOVE` in sage, banzai's 1.2:1 marquee, blindbarber's year numerals — and the auditor skips it, counting it on the `ambition:` line as `tint marks n` instead. The exemption only applies when the same string also appears elsewhere as real readable content, so you cannot hide information inside an unreadable mark. | Darken/lighten the text, not the brand color. Gray-on-gray body copy (`#9ca3af` on white) is the single most common tell of an AI-built page. |
| `text-over-media` | Copy sits on a photo or gradient with no scrim. | Add a real gradient scrim (`linear-gradient(to top, rgb(0 0 0 / .75), transparent 60%)`) or move the text off the busy region. Never rely on the image being dark enough today. |
| `card-grid-template` | Six or more rounded, bordered, padded boxes. | This is the shape of every SaaS template. Replace with editorial layout: full-bleed imagery, asymmetric columns, type-led rows, overlap. If content genuinely is a list, set it as a list — numbered rows with rules — not as cards. |
| `hero-type-small` | Hero type under ~4.5vw. | Award heroes run 6–14vw. Small hero type reads as a document, not a brand. |
| `image-upscaled` / `image-broken` | Source pixels below display size, or a real 404. `image-broken` only fires when the browser attempted the request and got nothing (`complete && naturalWidth === 0`). | Ship 2× assets. A soft hero image undoes every other decision on the page. |
| `image-never-loaded` (WARN) | A `loading="lazy"` image sits off the vertical scroll path — inside a horizontal rail, or in the cloned half of a marquee track — so the browser never requested it and the auditor cannot measure it. **This is not a broken image.** | Usually nothing. Open one URL yourself to confirm it resolves. If a rail image genuinely must be measured, drop `loading="lazy"` on the first few. |
| `palette-sprawl` | More than four hue families carry real area. | One dominant, one accent, neutrals. Colour restraint is what separates art direction from decoration. |
| `radius-chaos` | More than four distinct corner radii. | Two values, held everywhere. Mixed radii read as unfinished. |
| `spacing-off-grid` | Repeated spacing values off the 4px grid. | Snap to your scale. Optical alignment is felt even when it is not seen. |
| `section-rhythm` | Sections under 48px of breathing room. | Award pages run 96–200px between movements. Cramped vertical rhythm is the cheapest-looking mistake there is. |
| `measure-too-wide` | Body lines over ~92 characters. | Cap at 60–75ch. |
| `mobile-viewport-blown` | A fixed-width child forced the phone to zoom out. | Find the offender (usually a fixed-width image, table, or canvas) and constrain it. Everything on the page is now too small. |
| `no-motion` | Nothing declares a transition. | At minimum: hover states, scroll reveals with a real easing curve, and one signature moment. |
| `tap-targets` | Interactive elements under 40px on phone. | 44px minimum. |
| `overflow-x` | Page scrolls sideways. | Always a bug. Never a style. |

## SPARSE — the ambition block

`FAIL` and `WARN` measure restraint: what you did wrong. They can all be silent on a
page that is merely tasteful. The `SPARSE` block measures ambition: what you never
attempted. **SPARSE never changes the exit code** — absence is a design note, not a
bug — but a page carrying three of them is a template with good manners.

Thresholds come from the study corpus, re-measured live rather than read off
`counts.img` — that field is a raw tag count and it lies. Amrit Palace ships 69
`<img>` tags and renders exactly **10** photographs; the other 59 are 16-33px
icons and repeated star glyphs. Rendered media over 8000px², across the ten
studies longer than five screens:

`fizzi 1 · apple-iphone14 7 · pizzato 7 · amrit-palace 10 · planetono 10 · nimbus 12 · macbook-ui 17 · plomberie 17 · tripletta 47 · blindbarber 254` — median **11**.

| Code | What is missing | The fix |
|---|---|---|
| `image-density` | Under 8 rendered images (`img` + CSS `background-image` + `video` + `canvas`, each over 8000px²) on a page longer than 5 screens. Skipped when a `canvas` or `video` covers half the viewport — fizzi and apple-iphone14 carry whole pages on one WebGL stage, so counting files is the wrong question. | Shoot or source more. A long page carried by type and whitespace alone reads as a template. Photography is the cheapest way to stop looking generic — see `references/imagery.md`. |
| `hero-is-the-peak` | Nothing below the first screen reaches 80% of the hero's type size. | Every study has a second type event at or above hero scale: blindbarber's 902px year numeral, tripletta's 270px wordmark, amrit's full-width footer wordmark. One peak in screen one and a decline after it is a brochure. |
| `no-overlap` | Zero partially-overlapping content pairs. Nav chrome and text-inside-a-hero-photo are excluded — both are free, every page has them. | Let something cut across something else: copy over a numeral, a photo dropped across a caption, a sticky rail crossing an image. Layering is what separates a designed page from a stack of rows. |
| `no-bleed` | Nothing crosses the viewport edge (while the page does not scroll horizontally). | Run a photo row, a marquee or a wordmark past the edge so the frame reads as a window onto something larger, not as a box with margins. |
| `ground-flips` | Fewer than 3 ground-colour changes on a page over 6 screens, sampled at 12 scroll positions. | Blind Barber flips paper `#F1F1F1` to ink `#141414` every ~2 chapters and deletes every divider. Amrit runs sand, dark photo, saffron panel, sand. One ground for a whole page makes the scroll feel like one long section. |
| `motion-vocabulary` | Fewer than 4 *distinct* transition/animation declarations (unique property + duration + easing) on a page over 6 screens, with no JS motion runtime present. | One easing curve repeated everywhere is a default, not a vocabulary. Want four registers: a state change, an enter, a scroll-linked move, one slow ambient one. See `references/motion.md`. |

## CRAFT — the ambition you claimed

`SPARSE` asks what the composition never attempted. `CRAFT` asks whether the
**tier** was built. Every check above it can be satisfied by a well-set static
document, which is how two pages shipped from this skill with zero pins, zero
scrubs, zero transitions and zero canvas while passing everything. **CRAFT never
changes the exit code either** — but a CRAFT finding is work that was promised
and not done, not a matter of taste.

Declare the tier in the page, at the top of `<head>`, so the claim can be
checked against what shipped:

```html
<!-- premium-web-design: tier=B -->
<!-- premium-web-design: tier=C mobile=B -->   <!-- phone build is deliberately a tier lower -->
```

`mobile=` is the Tier C phone-fallback requirement written down. It is not a
let-off: on the phone pass the auditor resolves the section that carries the
canvas on desktop and checks that something real is painted there instead.

| Code | What it means | The fix |
|---|---|---|
| `tier-undeclared` | No `premium-web-design: tier=…` in the source. The page is measured against Tier B, the documented default. | Declare it. If it is Tier A, say so and meet the entry clause. |
| `tier-unmet` | The declared tier's evidence is not on the page. Tier B wants a scroll-driven pin, a scrubbed transform/canvas/video, a split or masked type reveal, or a page transition. Tier C wants a `<canvas>` holding a WebGL context, or three/R3F. | Build the tier, or drop the declaration to the tier you built. Both are honest; the label without the work is not. |
| `tier-floor` | `tier=A` on a page over 6 viewport heights. | `ambition-tiers.md` puts the Tier A ceiling at 6 screens. Cut the page or move to Tier B. |
| `tier-fallback-missing` | `mobile=` declares a step down, and the section holding the desktop scene paints nothing in its place on the phone. | Art-direct a still into the same section. A scene switched off is a hole, not a fallback. |
| `motion-techniques` | Fewer than 3 distinct weight-carrying techniques on a page over 6 screens, out of: scroll-pinned section, scrubbed sequence, split/masked type reveal at display scale, cursor-driven preview, horizontal chapter, loader into hero, page transition, magnetic element, canvas/3D scene. | Pick the two or three the brief actually wants and build them completely. Scroll-reveal fades and hover states are the floor, not techniques. |
| `no-loader` | Nothing runs before or into the first paint on a page over 6 screens. | `demos/loader-to-hero.html` builds one that resolves into the hero, skips on any input, and has a watchdog. |
| `img-not-responsive` | An `<img>` with no `srcset` and no `<picture>` decoding at over 2.5× its rendered CSS width. | `imagery.md` asks for 2× display width. 2.5× is the flag so a correct retina asset never trips it; a 6× payload always does. |
| `conversion-incomplete` | A page with a `tel:` link missing any of: a bottom-pinned mobile action bar, what-happens-next copy within 200 characters after a CTA, an FAQ/objection block, a named person who is not a reviewer. | All four are S-cost components from the Plomberie and Amrit steal lists with a direct line to booked work. |
| `rating-unsourced` | A 3.0–5.0 rating near the word review/star/rating with no link in or beside it. | `content-and-copy.md` bans star ratings with no source. Link it to the Google or Trustpilot listing. |

## Reading your own frames

Ask these in order, out loud, per frame:

1. If I saw this in a portfolio, would I believe a designer made it?
2. What is the single loudest thing on this screen? Is that the thing that should be loudest?
3. Where does my eye go second? Is there a second at all, or is everything the same weight?
4. Is there anywhere my eye can rest, or is every pixel occupied?
5. Would this frame survive being printed in a magazine, motion removed?
6. What is the ugliest 200px of this frame? Fix that before anything else.

If the honest answer to #1 is no, stop adding features and fix the page.

## Before you claim done

- [ ] `audit-page.mjs` exits 0 on desktop and mobile
- [ ] You read every desktop frame and every mobile frame with the Read tool
- [ ] `reduced-motion.jpg` still looks art-directed
- [ ] No console errors in `audit.json`
- [ ] You named the one thing you fixed on the last pass because you looked at it, not because the linter said so
