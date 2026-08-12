---
name: premium-web-design
description: Build Awwwards-caliber customer-facing websites — Site of the Day bar for design, motion, UX, and craft. Use when building or redesigning marketing sites, product sites, landing pages, brand/campaign microsites, or interactive web experiences; when the user runs /premium-web-design; or asks for premium / Awwwards / award-winning / cinematic web design. Do not auto-apply to authenticated app chrome (dashboards, settings, admin, CRUD), design-system primitives, or pure API/infra work unless explicitly invoked.
---

# Premium Interactive Website Design

## Bar (pass / fail)

This skill exists so an agent (or human following it) ships work that could **credibly compete for Awwwards Site of the Day** — not a “nice marketing site,” not a polished SaaS template, not tasteful defaults.

**Pass line:** a stranger lands, feels art direction in the first seconds, meets at least **three signature moments** worth pausing for, understands the offer without reading a wall of copy, and leaves remembering the brand.

**Fail line (any one):** inventing “premium” from memory; generic card-grid SaaS layout; Inter/Roboto/system as the display voice; flat single-color page with fade-ins only; box/Lego 3D stand-ins for real products; sections with no reference attribution; skipping the study board; “good enough” polish.

You are operating as **creative director + motion designer + front-end craftsperson** on one brief. Protect the bar. If schedule pressure appears, cut scope of pages — never cut craft on what you ship.

## Activation

**Auto-fire (Tier 2)** on customer-facing visual surfaces: new sites, redesigns, marketing and product marketing pages, landing pages, brand/campaign microsites, interactive demos, scroll-story experiences.

**Do not auto-fire** on authenticated app chrome (dashboards, settings, admin, CRUD tables), design-system / component-library work unless a marketing treatment is requested, or pure logic / API / infra edits.

**Companion:** `/premium-web-design` applies this full bar on demand — including a marketing section inside an app when invoked.

When this skill and `react-tsx-component` both apply: this skill owns visual direction, composition, motion, and asset quality; `react-tsx-component` still owns component form (`export function`, `interface Props` at bottom, Tailwind-only, handler naming).

## Hard gate (non-negotiable)

This skill fails if you invent an award look from memory or training data.

**You must:**

1. Open reference sites below in a **real browser** (WebFetch alone is not enough; scroll the live experience).
2. Extract **at least 10 concrete craft components** to ship.
3. Publish a **Reference Study Board** in the chat **before any design or code**.
4. Compose the **entire website** from those board items (reskinned to the brand). Soft inspiration is a failure mode.
5. State an **art direction one-liner** and name **≥3 signature moments** before coding.

**Very very strict:** if fewer than 10 attributed items are listed, or any shipped section cannot map to the board, stop and restudy. Do not proceed.

**Allowed adaptation:** re-skin colors, type, copy, and brand marks. Rebuild the pattern in project code.

**Forbidden:** cloning logos, copy, proprietary 3D assets, or pixel-identical layouts. Do not ship a generic SaaS template and claim the references were used.

## Workflow

Copy and track:

```
Understand → Study references (≥10 board) → Art direction + 3 signature moments → Design from board → Build board items → Interact → Test → Polish to award bar → Jury self-score → Verify board
```

1. **Understand** — product, brand, audience, constraints, conversion goal.
2. **Study references** — mine the full catalogue (benchmarks, product-page builds, cross-industry library). Mix origins. Fill the board with **≥10** items.
3. **Art direction** — one line: brand feeling, type posture, motion personality, hero thesis. Plus **≥3 signature moments** (each must map to a board row).
4. **Design** — compose exclusively from board items adapted to this brand.
5. **Build** — working UI for every board item; no mock-only stops.
6. **Interact** — hover/touch, scroll, load, transitions, demos called out on the board.
7. **Test** — mobile, tablet, desktop, touch; `prefers-reduced-motion`.
8. **Polish** — pacing, easing, crop, type rhythm, empty space, performance. Award sites feel intentional in the quiet parts too.
9. **Jury self-score** — score yourself (table below). Any category below **8/10** → revise before claiming done.
10. **Verify board** — re-paste the board with each item `SHIPPED` + file/section.

Before coding, state:

**"Reading this as: \<page kind> for \<audience>, \<vibe>, leaning \<direction>."**

Then: art direction one-liner → ≥3 signature moments → completed Reference Study Board.

## Reference Study Board (required output)

Paste this block **before coding**. Fill every row. Minimum **10** items. Prefer **≥4 different reference URLs** and **≥2 different origin groups**.

```
### Art direction
<one line>

### Signature moments (≥3)
1. <moment> ← board #
2. <moment> ← board #
3. <moment> ← board #

### Reference Study Board
| # | Source URL | Craft component / pattern observed | Where it appears on that site | How I will implement it on this project |
|---|------------|------------------------------------|-------------------------------|-----------------------------------------|
| 1 |            |                                    |                               |                                         |
| 2 |            |                                    |                               |                                         |
| … |            |                                    |                               |                                         |
|10+|            |                                    |                               |                                         |

Page composition plan (board items only):
- Load / first 3s ← board #
- Hero ← board #
- Section 2 ← board #
- Section 3 ← board #
- …
- Motion stack choices ← board #
```

### What counts as a "thing" / component

Each board row must be a **concrete, buildable craft unit** you can point to on a reference page, for example:

* Award-grade **loading / intro** sequence (brand mark, progress, sound cue, scene settle)
* Full-bleed cinematic hero with **brand as the dominant signal**
* Scroll-scrubbed product/hero object
* Sticky product stage while copy chapters pin/unpin
* Horizontal scroll gallery driven by vertical scroll
* Menu / catalogue / services **as a scroll journey** (not a static table)
* WebGL / R3F object with pointer parallax or physics
* Theme / finish / attribute playground the user can click
* Sound-linked interaction (only if product-appropriate)
* Morphing or magnetic CTA / nav; route or chapter **page transitions**
* Typography that scales, masks, splits, or reveals on scroll
* Depth stack (foreground product, mid copy, atmospheric backplane)
* Chapter wipes / clipped image / scrapbook reveals
* Pinned **timeline** storytelling
* Interactive demo that shows the product working instead of describing it
* Reduced-motion fallback that stays art-directed

Vague rows fail the gate: "nice animation", "modern layout", "good typography", "dark aesthetic", "smooth scroll", "premium feel".

### Coverage rules

* **≥10** rows, each tied to a real `Source URL` from the list below (or URLs the user attached).
* Prefer **mixing origins** across the catalogue. Do not fill the board from one industry heading because the brief matches that label.
* At least **3** rows = **interaction or motion** (scroll, hover, pointer, load, transition, demo).
* At least **2** rows = **composition / layout** (hero, sticky stage, chapter structure, catalogue-as-journey).
* At least **1** row = **product demonstration** (photo/WebGL stage, configurator, or show-don't-tell — not box proxies).
* At least **1** row = **first-impression craft** (loader, intro, or hero settle in the first seconds).
* Every major section you ship cites **≥1** board row. Orphan sections are not allowed.

## Reference sites (required study)

Visit these in a **real browser**. Scroll the full experience. Learn pacing, depth, typography, and interaction craft. **Do not guess** what award-winning looks like from training data alone.

If the user supplies additional reference URLs, treat those as **primary** and still pull enough craft from the lists below to reach ≥10 items.

**Cross-industry rule (non-negotiable):** headings below name where each site *came from*. They are **not** filters for which project may study them. A barber brief may pull menu-as-scroll, cinematic intros, pinned timelines, or 3D showrooms from restaurant / trade / food refs — then rebuild with barber assets, copy, and brand. Prefer the strongest craft for the job across the whole catalogue.

### Industry benchmarks

1. [https://igloo.inc](https://igloo.inc) — Awwwards Site of the Year 2024. 3D ice-cube scroll journey. Current "wow" benchmark.
2. [https://www.lusion.co](https://www.lusion.co) — most-awarded WebGL studio site. Scroll drives physics and particles.
3. [https://www.activetheory.net](https://www.activetheory.net) — repeat SOTY winner. Scroll-driven 3D storytelling.

### Product-page patterns (community / course builds)

Practical 3D + scroll product landings. Study how they sell a SKU with motion.

4. [https://fizzi.vercel.app](https://fizzi.vercel.app) — Community soda product landing. Scroll-driven 3D cans.
5. [https://macbook-ui.vercel.app](https://macbook-ui.vercel.app) — Community MacBook product page. Scroll storytelling + interactive 3D hardware hero.
6. [https://nimbus-keyboards1.vercel.app](https://nimbus-keyboards1.vercel.app) — Fake mechanical keyboard brand. Interactive 3D board, themes, switch playground with sound.
7. [https://apple-iphone14.vercel.app](https://apple-iphone14.vercel.app) — Community iPhone 14 landing. Classic 3D + GSAP product page.

### Cross-industry craft library (origin labels only)

Grouped by the industry that shipped the site so you can find examples fast. **Any brief may mine any group.** Board rows should often mix origins, reskinned to the product in front of you.

#### Origin: barbers

8. [https://anniversary.blindbarber.com/](https://anniversary.blindbarber.com/) — Blind Barber 10-Year. Awwwards SOTD. One-page scroll story, loading sequence, scrapbook reveals, pinned timeline.
9. [https://hagisbarbershop.de/](https://hagisbarbershop.de/) — Hagi’s Barbershop. Awwwards SOTD (7.68; animations 8.0). Cinematic film intro, dark editorial scroll, strong page transitions. Luxury brand-as-product pacing.

#### Origin: plumbers / plumbing trade

10. [https://pizzatoits.it/](https://pizzatoits.it/) — Pizzato. Awwwards SOTD. 3D showroom, scroll-driven about/showroom, illustration + WebGL-style depth.
11. [https://www.plomberie5etoiles.com/](https://www.plomberie5etoiles.com/) — Plomberie 5 Étoiles. Awwwards Nominee. Conversion-first local service site that still clears an award craft bar.

#### Origin: restaurants / food brands

12. [https://amritpalace.com/](https://amritpalace.com/) — Amrit Palace. Awwwards SOTD (Nov 2025). GSAP scroll; menu-as-scroll / catalogue-as-journey (reuse for services, SKUs, chapters — not only food).
13. [https://triplettapizza.com/](https://triplettapizza.com/) — Tripletta Pizza. Awwwards SOTD. Infinite scroll, page transitions, loading animation, GSAP. High-energy pacing.
14. [https://www.planetono.space/](https://www.planetono.space/) — Planetoño. Awwwards SOTD (7.22). Custom three.js scroll engine, toon/shader 3D, Rive micro-interactions, portal scenes. Scroll-driven 3D flow narrative.
15. [https://www.nudolsbanzai.it/](https://www.nudolsbanzai.it/) — Banzai (Nudols). Awwwards SOTD + Developer Award. Immersive 3D; attribute-as-character playground; character-driven SKU storytelling.

Study them for craft components. Rebuild for the product and brand in front of you. Do not clone layouts, copy, or brand marks.

## Motion / interaction stack

Prefer the lightest tool that still hits the award bar. Match the project's existing stack first. Choose tools that can deliver the board items — if the board needs scrubbed cinema or WebGL, do not downgrade to CSS fade-ins.

| Need | Default |
|------|---------|
| React page motion / scroll / layout | Motion (Framer Motion) |
| Complex timeline / scrub / cinematic scroll | GSAP + ScrollTrigger |
| True 3D / WebGL | React Three Fiber + Drei |
| CSS-only page (no React) | CSS scroll-driven animations + View Transitions where supported |
| Particles / light effects | Only if they serve the product story |

Do not add Three.js for a fade-in. Cap particle counts on mobile. Respect `prefers-reduced-motion` with coherent, still art-directed fallbacks.

## Design standard (award craft)

Prioritize:

* One composition in the first viewport (brand-first; not a dashboard of widgets)
* Expressive typography (no default Inter/Roboto/Arial/system as the display voice)
* Atmosphere (depth, light, texture, photo, or crafted 3D — not flat fill)
* Minimal copy; visual storytelling over paragraphs
* Spacing and crop that feel art-directed
* Meaningful micro-interactions and cinematic scroll
* Strong hierarchy; a memorable hero
* Performance that stays smooth while looking expensive

Calibrate against the references after you have scrolled them and filled the board. Compose from the board. Ship an **original brand skin** on those studied craft components.

## Signature WOW (required)

Ship **≥3 signature moments** that would make a jury stop scrolling. Each must:

* Trace to a board row
* Serve the product story
* Survive on mobile (adapted, not deleted)

Examples of valid moment types: scroll-driven storytelling, WebGL object, interactive playground, cinematic load/transition, pinned timeline, catalogue-as-journey, morphing nav/CTA, typography as spectacle, depth/parallax set pieces, scrapbook/clip reveals.

Effects without a story fail. Decoration of cards with opacity fades fail.

## UX

Extremely easy to understand. Clean interface. Show the offer — demonstrate or interact — rather than describing it. Scrolling guides; it does not decorate randomly. Conversion paths (book, buy, contact) stay obvious inside the craft.

## Mobile first

Design for mobile, tablet, desktop, and touch. Adapt heavy board items into mobile-grade versions of the **same craft idea**. Mobile must still clear the award bar.

## Visual quality + real imagery

Create or source appropriate assets. No generic stock-as-hero, repetitive AI illustration, or template chrome.

**Avoid (instant fail):** generic SaaS templates; excessive cards; excessive rounded corners; generic gradients; glassmorphism everywhere; huge text blocks; excessive copy; low-poly box/primitive stand-ins for real products/places; orphan sections with no board row.

### Real imagery hard rule (physical product / place / service)

Dominant visual = **real photography** of the product, place, craft, or honest category context (owner assets first; else high-quality royalty-free that clearly depicts the category).

WebGL/R3F (when used) must **stage, parallax, scrub, clip, or depth-layer real images/textures** — not replace the product with abstract stand-ins.

**Forbidden:** Lego/box heroes for real machines, venues, food, tools; procedural geometry kits as the main product; synthetic “stock” as the primary idea.

**Modeled 3D is appropriate** when the product is inherently a digital/SKU model (can, phone, configurator) **and** reads as the product. If you cannot ship a credible model, use real photos inside the motion/WebGL system.

At least **1** board row must name the photographic treatment when this rule applies.

## Jury self-score (required before done)

Score 1–10 against an Awwwards-style jury. **All must be ≥8** or revise:

| Category | Question |
|----------|----------|
| Design | Would a creative director call this art-directed, not templated? |
| Motion | Do signature moments feel intentional, smooth, and product-tied? |
| UX | Can a stranger get the offer and next action without confusion? |
| Creativity | Did we transfer cross-industry craft, or only copy the obvious genre template? |
| Content / assets | Do type, photo/3D, and copy feel award-site grade? |
| Mobile | Does the phone experience still feel premium? |

Paste the scored table in chat with the final `SHIPPED` board.

## Implementation

**Build it.** Do not stop at mock description.

**Understand → Study (≥10 board) → Art direction + 3 moments → Design from board → Build → Interact → Test → Polish → Jury self-score ≥8 → Verify board**

If 3D, shaders, particles, or advanced animation appear on the board and fit the product, implement them. If a board item is wrong for this product, replace it with another studied item before coding — do not freestyle.

### Done checklist (all required)

* [ ] Art direction one-liner + ≥3 signature moments posted before code
* [ ] Reference Study Board posted before code (≥10 rows; mix origins; ≥1 first-impression row)
* [ ] Coverage rules met (motion ≥3, composition ≥2, product demo ≥1)
* [ ] Every shipped section cites ≥1 board row
* [ ] Board re-posted with `SHIPPED` + file/section markers
* [ ] Jury self-score pasted; every category ≥8/10
* [ ] Mobile + reduced-motion still art-directed
* [ ] No generic SaaS / card-grid fallback
* [ ] Real photography dominates physical product/place visuals (no box-model stand-ins)

The final website must be:

**Award-credible. Beautiful. Clean. Fast. Responsive. Interactive. Reference-grounded. Memorable.**

> Never settle for "good enough." Never skip the study board. Push until a Site of the Day jury would take it seriously.
