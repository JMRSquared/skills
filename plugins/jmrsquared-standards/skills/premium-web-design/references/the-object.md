# The object

This is the idea the rest of the skill serves. The owner picked seven pages as the standard. Their frames are in `assets/owner-references/`. Open them before you design.

**A great page is one thing you want to touch.** Pick the physical thing this business would be if you could hold it. Build it so it behaves like the real thing and let it carry the page. Everything else stays quiet.

## What the owner chose and why

| Page | The object | Owner's words | Frames |
|---|---|---|---|
| Product Rail Gallery | Real garment photos on hangers on a rail. Hover turns a piece toward you, dragging one pushes its neighbours, released pieces swing and settle | "clean and slick, no bloat, a wow concept" | `product-rail.jpg` |
| Sushi Conveyor Menu | A kaiten belt that keeps turning. Hover stops it and lifts a plate with its name and price. Flick spins it with inertia. A picked plate flies into a dialog | "clean and functional, fluid and interactive" | `sushi-belt.jpg`, `sushi-belt-opened.jpg` |
| Ink Orbit Features | Live diagrams: edits flow through a hub into reports, one integration syncs at a time, a forecast you can scrub | "minimal, clear visualisation of what is going on" | `ink-orbit.jpg` |
| Testimonial Globe | Customers pinned on a globe where they live. Hover a face to feature the review, click to turn that city to the front, drag to spin | "interactive, looks very nice visually" | `testimonial-globe.jpg` |
| Agentic Factory | The product's whole process as one lit 3D machine on a plinth: order, script, video, post, payment. Modes (assembled, cutaway, stations, one order) and cameras | "the type of 3D I expect" | `agentic-factory.jpg` |
| Elsewhere | A photoreal generated scene as full-screen video with a slow drift. One switch turns day to night. The headline sits in the calm sky | "clean and realistic, connects with the content" | `elsewhere-day.jpg`, `elsewhere-night.jpg` |
| Curtain Split Hero | A stack of photos that splits into two curved wings on scroll or click, revealing the title between them | "mind-blowing" | `curtain-closed.jpg`, `curtain-open.jpg` |

Copy the thinking, never the object. A bike shop gets no clothing rail.

## Finding the object

Write five candidates in `PRODUCT.md`, then choose. Start from what the customer handles, watches or moves.

| Business | Possible object |
|---|---|
| Bike repair | A wheel you flick. Each repair and its price comes to the top as it slows |
| Bakery | A tray of loaves. Pick one up and it turns to show the crust, its price and bake time |
| Accounting software | A pile of receipts you drag into a ledger, which sorts itself into the real report |
| Logistics | A live map where one parcel travels. Scrub it to see each handover |
| Law firm | A case file you open. Pages fan out, one for each area of practice |
| Software with a pipeline | The pipeline as a lit 3D machine, one job travelling through it |

Test each one:

- **Does it explain the business?** A stranger with the sound off should know what is sold within five seconds of playing with it. A spinning abstract shape fails. Decoration is not a concept.
- **Does the information live in it?** The rail shows prices, the belt shows the menu, the globe shows the reviews. It replaces a section of copy.
- **Would you show it to a friend?** If not, keep looking.
- **Can you actually build it to look real** with the assets available? If not, choose a simpler object.

## How it behaves

- **Physics, not tweens.** Inertia after a flick, springs that settle, neighbours that push. Ease-in-out on a click reads as a slideshow. Use a small loop that integrates velocity, with critically damped springs so things settle without bouncing around.
- **It answers immediately.** Hover responds on the same frame. Hover stops or slows what was moving, so the thing you reach for holds still.
- **Three depths of attention.** It idles on its own, responds to hover and opens on click: the plate flies into a dialog by morphing from where it was, never by a cut.
- **Details on demand.** A name and price appear on hover or focus. This is how a page stays near 50 words and still does its job. The object's data lives in a typed array, so real prices drop straight in.
- **It works for everyone.** A real `button` per item or a roving tabindex, arrow keys, a visible pause control, a focus-trapped dialog closed by Escape. Under `prefers-reduced-motion` it stops idling and steps item by item. On touch, drag replaces hover.
- **It sleeps.** Stop the animation loop when nothing is moving or it is off screen. Restart it on input. A loop that never sleeps drains batteries and hangs slow machines and the auditor.
- **It degrades.** Measure frame time. After a few frames over 100ms, drop pixel ratio and moving shadows and jump to rest, because physics on a slow GPU turns into slow motion. `demos/scroll-story/wheel.js` shows how. Keep the same information in plain HTML further down the page for when WebGL is missing.

## How it looks real

Realism is what separates this from a toy. Hand-coded flat SVG is not realistic.

- **Cutout photography:** real or generated product photos as transparent WebP, with a soft contact shadow and a lighter shadow that moves with the object. Supply front, back and side when the object turns.
- **3D:** three.js with `ACESFilmicToneMapping`, a soft key light with real shadow maps, a low fill, an environment map for reflections and `MeshPhysicalMaterial` or `MeshStandardMaterial` with believable roughness. Add fog so the far edge falls away. Rounded edges on everything: a sharp box looks like a placeholder. Prefer a real model from `/gltf-assets`, then careful procedural geometry. Orbit limits keep the camera on good angles.
- **Generated scene or video:** when a place or a mood is the object. Generate one photoreal still with calm space for the headline, then a 5-10 second seamless loop with only slow camera drift and small natural motion. One state switch (day and night, before and after) earns more than a long film. Use the image and video tools this session has. If it has none, say so and ask for a provider. Never ship a stock clip or a stretched photo as if it were the same thing.
- **Live diagrams:** when the product is invisible software. Real nodes, thin lines, one pulse travelling along them and one chart you can scrub. Show the process actually working, with the product's real nouns.

## The frame around it

The object is loud, so everything else whispers.

- A calm ground: white, off-white or near-black, with one soft shadow under the object.
- One plain sans (`references/type.md`). A headline of one or two lines at 40-80px beside the object, larger only over a full-screen scene.
- 20-60 words on the first screen. One button. At most one small label.
- Two common layouts: copy on the left with the object filling the right two-thirds, or a small centred headline above an object that spans the full width.

## Scroll

The object can be the scroll story. The curtain opens on scroll, a rail can slide past as you scroll and a wheel can roll in. Drive it from the kit's scene variable `--p`. Hand back to the pointer when the user touches it. Scroll must never trap the visitor: the page keeps scrolling past the object.

## After the first screen

Most pages need very little more: 2-4 quiet sections with real photographs, the facts and the action. A second object is fine only if it explains something the first cannot.
