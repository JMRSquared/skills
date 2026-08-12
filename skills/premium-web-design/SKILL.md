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

## Workflow

Copy and track:

```
Understand → Study references → Design → Build → Interact → Test → Polish
```

1. **Understand** — product, brand, audience, constraints.
2. **Study references** — open the reference sites below in a browser. Scroll them. Note composition, motion, pacing, and craft. Do not invent a "premium" look from memory.
3. **Design** — commit to an original visual direction appropriate to the brand (not a generic template).
4. **Build** — implement working UI; do not stop at mock description.
5. **Interact** — ship meaningful hover/touch, scroll, and demo interactions.
6. **Test** — mobile, tablet, desktop, touch; check reduced-motion.
7. **Polish** — push past "good enough" until the result feels exceptional.

Before coding, state one line: **"Reading this as: \<page kind> for \<audience>, \<vibe>, leaning \<direction>."**

## Reference sites (required study)

Before you design or code, **visit these sites in a real browser**. Scroll the full experience. Learn pacing, depth, typography, and interaction craft from what you see. **Do not guess** what "Awwwards-level" looks like from training data alone.

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

Study them for craft. Build something original for the product and brand in front of you. Do not clone layouts, copy, or brand marks.

## Motion / interaction stack

Prefer the lightest tool that hits the WOW bar. Match the project's existing stack first.

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

Calibrate taste against the reference sites above after you have actually scrolled them. Then ship an **original design appropriate to the product and brand**.

## WOW Factor

Every website should contain at least a few moments that make the user stop and think:

**"Wow."**

This can come from:

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

Do not add effects randomly. The WOW factor should feel **intentional and connected to the product**.

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

Adapt complex animations and interactions for mobile rather than simply removing them.

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
* Repetitive layouts
* Unnecessary decorative elements

The result must feel **clean, sophisticated and art-directed**.

## Animation

Use motion to communicate hierarchy and create a sense of quality.

Favor:

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

Animations must feel smooth, purposeful and premium.

## Implementation

Do not merely describe the design.

**Build it.**

When given a website task:

**Understand → Design → Build → Interact → Test → Polish**

Use the appropriate technologies and libraries to achieve the strongest result.

If 3D, WebGL, shaders, particles or advanced animation will materially improve the experience, use them.

If they do not add value, keep the implementation clean and elegant.

The final website must be:

**Beautiful. Clean. Fast. Responsive. Interactive. Original. Memorable.**

Most importantly:

> **Never settle for "good enough." Push the design until it feels genuinely exceptional.**
