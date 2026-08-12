---
name: premium-web-design
description: Create exceptionally beautiful, clean, modern, memorable customer-facing websites with strong visual identity, excellent UX, and intentional WOW factor (scroll storytelling, motion, optional WebGL). Use when building or redesigning marketing sites, product sites, landing pages, brand/campaign microsites, or interactive web experiences; when the user runs /premium-web-design; or asks for premium / Awwwards-level / cinematic web design. Do not auto-apply to authenticated app chrome (dashboards, settings, admin, CRUD), design-system primitives, or pure API/infra work unless explicitly invoked.
---

# Premium Interactive Website Design

## Activation

**Auto-fire (Tier 2)** on customer-facing visual surfaces: new sites, redesigns, marketing and product marketing pages, landing pages, brand/campaign microsites, interactive demos, scroll-story experiences.

**Do not auto-fire** on authenticated app chrome (dashboards, settings, admin, CRUD tables), design-system / component-library work unless a marketing treatment is requested, or pure logic / API / infra edits.

**Companion:** `/premium-web-design` applies this full bar on demand — including a marketing section inside an app when invoked.

When this skill and `react-tsx-component` both apply: this skill owns visual direction, composition, motion, and asset quality; `react-tsx-component` still owns component form (`export function`, `interface Props` at bottom, Tailwind-only, handler naming).

## Hard gate (non-negotiable)

This skill fails if you invent a "premium" look from memory or training data.

**You must:**

1. Open the reference sites below in a **real browser** (WebFetch alone is not enough; scroll the live experience).
2. Go through the reference websites and **pick at least 10 things** to include while developing.
3. Publish a **Reference Study Board** in the chat **before any design or code**.
4. Build so the **entire website** is composed from those studied craft components / patterns (mapped onto the product brand). Soft inspiration is a failure mode.

**Very very strict:** if fewer than 10 attributed items are listed, or any shipped section cannot map to the board, stop and restudy. Do not proceed.

**Allowed adaptation:** re-skin colors, type, copy, and brand marks for the product. Rebuild the pattern in project code.

**Forbidden:** cloning logos, copy, proprietary 3D assets, or pixel-identical layouts. Do not ship a generic SaaS template and claim the references were used.

## Workflow

Copy and track:

```
Understand → Study references (≥10 board) → Design from board → Build board items → Interact → Test → Polish → Verify board
```

1. **Understand** — product, brand, audience, constraints.
2. **Study references** — visit every listed site (or the user-supplied set). Scroll full pages. Extract craft. Fill the Reference Study Board with **≥10** items.
3. **Design** — compose the page exclusively from board items adapted to this brand.
4. **Build** — implement working UI for every board item; do not stop at mock description.
5. **Interact** — ship meaningful hover/touch, scroll, and demo interactions called out on the board.
6. **Test** — mobile, tablet, desktop, touch; check reduced-motion.
7. **Polish** — push past "good enough" until the result feels exceptional.
8. **Verify board** — paste the board again with each item marked `SHIPPED` and the file/section where it lives.

Before coding, state one line: **"Reading this as: \<page kind> for \<audience>, \<vibe>, leaning \<direction>."** Then paste the completed Reference Study Board.

## Reference Study Board (required output)

Paste this block **before coding**. Fill every row. Minimum **10** items. Prefer covering **at least 4 different reference URLs**.

```
### Reference Study Board
| # | Source URL | Craft component / pattern observed | Where it appears on that site | How I will implement it on this project |
|---|------------|------------------------------------|-------------------------------|-----------------------------------------|
| 1 |            |                                    |                               |                                         |
| 2 |            |                                    |                               |                                         |
| … |            |                                    |                               |                                         |
|10+|            |                                    |                               |                                         |

Page composition plan (must use board items only):
- Hero ← board #
- Section 2 ← board #
- Section 3 ← board #
- …
- Motion stack choices ← board #
```

### What counts as a "thing" / component

Each board row must be a **concrete, buildable craft unit** you can point to on a reference page, for example:

* Scroll-scrubbed product/hero object (can, device, cube, board)
* Full-bleed cinematic hero with brand as the dominant signal
* Sticky product stage while copy chapters pin/unpin
* Horizontal scroll gallery driven by vertical scroll
* WebGL / R3F object with pointer parallax or physics
* Theme / finish / colorway playground the user can click
* Sound-linked interaction (only if product-appropriate)
* Morphing or magnetic CTA / nav treatment
* Typography that scales, masks, or reveals on scroll
* Depth stack (foreground product, mid copy, atmospheric backplane)
* Chapter wipes / clipped image reveals
* Interactive demo that shows the product working instead of describing it
* Reduced-motion fallback that stays art-directed

Vague rows fail the gate: "nice animation", "modern layout", "good typography", "dark aesthetic", "smooth scroll".

### Coverage rules

* **≥10** rows, each tied to a real `Source URL` from the list below (or URLs the user attached).
* At least **3** rows must be **interaction or motion** patterns (scroll, hover, pointer, demo).
* At least **2** rows must be **composition / layout** patterns (hero treatment, sticky stage, chapter structure).
* At least **1** row must be a **product demonstration** pattern (real product/photo WebGL stage, interactive configurator, or equivalent show-don't-tell block — not box proxies for physical goods).
* Every major section you ship must cite **≥1** board row. Orphan sections (invented without a reference) are not allowed.

## Reference sites (required study)

Before you design or code, **visit these sites in a real browser**. Scroll the full experience. Learn pacing, depth, typography, and interaction craft from what you see. **Do not guess** what "Awwwards-level" looks like from training data alone.

If the user supplies additional reference URLs, treat those as **primary** and still pull enough craft from the lists below to reach ≥10 items. When the brief matches a **category / trade vertical** section below, prioritize those URLs the same way.

### Industry benchmarks

1. [https://igloo.inc](https://igloo.inc) — Awwwards Site of the Year 2024. 3D ice-cube scroll journey. Current "wow" benchmark.
2. [https://www.lusion.co](https://www.lusion.co) — most-awarded WebGL studio site. Scroll drives physics and particles.
3. [https://www.activetheory.net](https://www.activetheory.net) — repeat SOTY winner. Scroll-driven 3D storytelling.

### Product-page patterns (community / course builds)

Practical 3D + scroll product landings. Study how they sell a SKU with motion, not how they look as finished brands.

4. [https://fizzi.vercel.app](https://fizzi.vercel.app) — Community soda product landing (Prismic/JS course build). Scroll-driven 3D cans selling a fake SKU.
5. [https://macbook-ui.vercel.app](https://macbook-ui.vercel.app) — Community MacBook product page. Scroll storytelling + interactive 3D hardware hero.
6. [https://nimbus-keyboards1.vercel.app](https://nimbus-keyboards1.vercel.app) — Fake mechanical keyboard brand. Interactive 3D board, keycap themes, switch playground with sound.
7. [https://apple-iphone14.vercel.app](https://apple-iphone14.vercel.app) — Codebucks community iPhone 14 landing. Classic course-style 3D + GSAP product page.

### Category / trade verticals

When the product matches a vertical below, treat those URLs as **primary** study sources (still fill ≥10 board rows; pull remaining craft from the benchmarks above if needed).

#### Barbers

8. [https://anniversary.blindbarber.com/](https://anniversary.blindbarber.com/) — Blind Barber 10-Year. Awwwards Site of the Day. One-page scroll story, big loading sequence, scrapbook-style reveals. Study the pinned timeline storytelling.
9. [https://hagisbarbershop.de/](https://hagisbarbershop.de/) — Hagi’s Barbershop. Awwwards Site of the Day (7.68; animations 8.0). Cinematic film intro, dark editorial scroll, strong page transitions. Closest “barber brand as luxury product” feel.

#### Plumbers / plumbing trade

True service-plumber sites rarely win SOTD for motion. These are the best award-backed picks in-category:

10. [https://pizzatoits.it/](https://pizzatoits.it/) — Pizzato. Awwwards Site of the Day (plumbing / heating / bathroom fittings). 3D showroom, scroll-driven about/showroom sections, illustration + WebGL-style depth. Best “trade + award motion” reference available.
11. [https://www.plomberie5etoiles.com/](https://www.plomberie5etoiles.com/) — Plomberie 5 Étoiles (Montreal Plumber). Awwwards Nominee. Real local plumber site that got nominated. More conversion-first than Pizzato; useful bar for how far a service plumber can push craft.

#### Restaurants / food brands

12. [https://amritpalace.com/](https://amritpalace.com/) — Amrit Palace. Awwwards Site of the Day (Nov 2025). GSAP scroll on home, story, and menu. Menu-as-scroll experience is the standout.
13. [https://triplettapizza.com/](https://triplettapizza.com/) — Tripletta Pizza. Awwwards Site of the Day. Infinite scroll, page transitions, loading animation, GSAP throughout. Highest-energy restaurant of the vertical set.
14. [https://www.planetono.space/](https://www.planetono.space/) — Planetoño. Awwwards Site of the Day (7.22). Fictional space-food order flow by Tubik. Custom three.js scroll engine, toon/shader 3D scenes, Rive micro-interactions, portal-style scene navigation. Study scroll-driven 3D ordering narrative.
15. [https://www.nudolsbanzai.it/](https://www.nudolsbanzai.it/) — Banzai (Nudols) izakaya experience. Awwwards Site of the Day + Developer Award. Instant-noodle brand: immersive 3D, flavor-as-character (manga / game culture). Study product-flavor playground and character-driven SKU storytelling.

Study them for craft components. Rebuild those components for the product and brand in front of you. Do not clone layouts, copy, or brand marks.

## Motion / interaction stack

Prefer the lightest tool that hits the WOW bar. Match the project's existing stack first. Choose tools that can actually deliver the board items.

| Need | Default |
|------|---------|
| React page motion / scroll / layout | Motion (Framer Motion) |
| Complex timeline / scrub / cinematic scroll | GSAP + ScrollTrigger |
| True 3D / WebGL | React Three Fiber + Drei |
| CSS-only page (no React) | CSS scroll-driven animations + View Transitions where supported |
| Particles / light effects | Only if they serve the product story |

Do not add Three.js for a fade-in. Cap particle counts on mobile. Respect `prefers-reduced-motion` with coherent fallbacks (static layout, simpler transitions — still polished).

## Purpose

Create **exceptionally beautiful, clean, modern and memorable websites** with a strong visual identity, excellent UX and a genuine **WOW factor**.

This skill applies equally to:

* Brand-new websites
* Existing website redesigns
* Product websites
* Marketing websites
* Web apps
* Interactive experiences
* Landing pages

## Design Standard

Every website should feel **premium, intentional and human-designed**.

Prioritize:

* Exceptional visual composition
* Clean, modern UI
* Strong typography
* Excellent spacing
* Minimal but impactful content
* Beautiful imagery and visual assets
* Smooth transitions
* Meaningful micro-interactions
* Cinematic scroll animations
* Interactive elements
* Depth and subtle motion
* Strong visual hierarchy
* A memorable hero experience

The design should feel like it was produced by a **top-tier product designer, creative director and motion designer working together**.

Calibrate taste against the reference sites after you have scrolled them and filled the board. Compose the page from the board. Ship an **original brand skin** on top of those studied craft components.

## WOW Factor

Every website should contain at least a few moments that make the user stop and think:

**"Wow."**

Pull WOW moments from the board (which itself comes from the references), for example:

* Scroll-driven storytelling
* 3D/WebGL
* Interactive objects
* Cinematic transitions
* Parallax and depth
* Particle effects
* Creative navigation
* Morphing elements
* Interactive demonstrations
* Dynamic typography
* Unexpected interactions
* Beautiful visual reveals

Do not add effects randomly. The WOW factor must trace to board rows and stay connected to the product.

## UX

The website must be extremely easy to understand and navigate.

Keep the interface clean and avoid unnecessary UI.

Use visual storytelling wherever possible instead of long explanations.

Core features should be **shown, demonstrated or interacted with** rather than simply described.

Scrolling should feel smooth and purposeful, with animations that guide the user through the experience.

## Mobile First

The website must be genuinely **mobile-friendly**, not merely a desktop website scaled down.

Design and test for:

* Mobile
* Tablet
* Desktop
* Touch interaction
* Different screen sizes

Adapt complex animations and interactions for mobile rather than simply removing them. If a board item is too heavy for mobile, ship a mobile-grade version of the same craft idea — do not delete the idea.

Mobile should still retain the **WOW factor**.

## Visual Quality

Create or generate appropriate visual assets when required.

Do not rely on generic stock imagery, generic illustrations or repetitive AI-generated design patterns.

Avoid:

* Generic SaaS templates
* Excessive cards
* Excessive rounded corners
* Generic gradients
* Glassmorphism everywhere
* Huge text blocks
* Excessive copy
* Generic AI illustrations
* Low-poly box/primitive stand-ins for real physical products or places
* Repetitive layouts
* Unnecessary decorative elements
* Any section that cannot cite a board row

The result must feel **clean, sophisticated and art-directed**.

## Real imagery hard rule (product / place / service sites)

For businesses whose offer is physical (plant hire, clinics, trades, venues, food, vehicles, yards), the **dominant visual must be real photography** of the product, place, craft, or honest category context.

### Required

* Hero and product/fleet/service showcases use **real photographs** (owner assets first; if missing, high-quality royalty-free photos that clearly depict the real category).
* WebGL / R3F remains mandatory where the stack already includes it, but it must **stage, parallax, scrub, clip, or depth-layer real images/textures** — not replace the product with abstract stand-ins.
* Image `alt` text describes what is shown. Credit stock sources in code comments or a small credits note when required by the license.

### Forbidden (instant fail for physical-product sites)

* Low-poly **box / cylinder / primitive “Lego” models** standing in for real machines, vehicles, tools, buildings, food, or devices
* Procedural geometry kits (icosahedrons, torus rings, stacked boxes) as the main product hero when photography is the honest medium
* AI-generated illustrations or repetitive synthetic “stock” as the primary visual idea
* Claiming WOW from abstract 3D when the brand story is a real yard, fleet, room, or SKU that should be photographed

### When modeled 3D *is* appropriate

Keep true product 3D when the reference craft and product are inherently digital/SKU-modeled (e.g. soda can, phone, keyboard configurator) **and** the model reads as the product, not as placeholder blocks. If you cannot ship a credible product model, use real photos inside the WebGL/scroll system instead of box proxies.

### Board + done checks (additions)

* At least **1** board row must name the **photographic treatment** (full-bleed photo hero, scroll-scrubbed image plane, clipped photo reveal, photo depth stack, etc.).
* Done checklist addition: real photography is the dominant product/place visual; no box-model product stand-ins shipped.

## Animation

Use motion to communicate hierarchy and create a sense of quality.

Favor patterns you actually observed on the references:

* Smooth scroll animations
* Parallax
* Depth
* Transformations
* Reveals
* Morphing
* Camera movement
* Subtle physics
* Interactive hover/touch states
* Seamless transitions

Animations must feel smooth, purposeful and premium — and must match board commitments.

## Implementation

Do not merely describe the design.

**Build it.**

When given a website task:

**Understand → Study references (≥10 board) → Design from board → Build board items → Interact → Test → Polish → Verify board**

Use the appropriate technologies and libraries to achieve the strongest result for the board.

If 3D, WebGL, shaders, particles or advanced animation appear on the board and fit the product, implement them.

If a board item does not add value for this product, replace it with another studied item before coding — do not freestyle.

### Done checklist (all required)

* [ ] Reference Study Board posted before code (≥10 rows, ≥4 source URLs preferred)
* [ ] Coverage rules met (motion ≥3, composition ≥2, product demo ≥1)
* [ ] Every shipped section cites ≥1 board row
* [ ] Board re-posted at the end with `SHIPPED` + file/section markers
* [ ] Mobile + reduced-motion still feel intentional
* [ ] No generic SaaS / card-grid fallback substituted for missing study
* [ ] Real photography dominates product/place visuals (no box-model stand-ins for physical offers)

The final website must be:

**Beautiful. Clean. Fast. Responsive. Interactive. Reference-grounded. Memorable.**

Most importantly:

> **Never settle for "good enough." Never skip the study board. Push the design until it feels genuinely exceptional.**
