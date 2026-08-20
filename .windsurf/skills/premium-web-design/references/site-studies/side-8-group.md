# Side 8 Group — engineering & construction (hand-built reference)

**Captured:** 2026-08-16 · **Provenance:** built by hand by the author of this skill, not an award listing. It is in the corpus because it solves a problem none of the award sites do: a Tier C scroll story for a business with **nothing photogenic to shoot**.
**Stack (measured):** Vite 8 + React 19 + TypeScript + Tailwind 3. `three@0.183` used **directly**, not through React Three Fiber. `framer-motion@12` for DOM motion and for scroll position/velocity. `lenis@1.3` for smoothing. A web worker builds the particle morph targets.
**Page length:** 25.2 screens desktop (scrollHeight **22 721px** @ 900px viewport) · **10 sections** · **2 canvas** · **8 svg** · **3 img** · **0 video**

## The one number that matters

**Three photographs across twenty-five screens.** The page is carried by one
particle canvas, one WebGL gallery, and eight inline SVG technical drawings. The
density floor is met without a photo library, which is the whole point: the
stock library for an opencast mining contractor is men in hard hats pointing at
clipboards, and every one of those images reads as filler.

## Art direction in one line

A drawing-office sheet rendered at night: near-black ground, bone ink, one hazard
orange, mono annotation everywhere, and a particle cloud that resolves into the
thing each chapter is about.

## Palette (measured)

| Role | Value | Where |
|---|---|---|
| Ground | `rgb(10, 12, 17)` `#0A0C11` | the page, held for all 25 screens |
| Ink | `rgb(242, 239, 233)` `#F2EFE9` | 101 elements — display and primary copy |
| Mid | `rgb(139, 135, 126)` `#8B877E` | 137 elements — the most-used colour on the page, all secondary copy |
| Quiet | `rgb(200, 195, 184)` `#C8C3B8` | 76 elements |
| Accent | `rgb(255, 122, 24)` `#FF7A18` | 47 elements, plus a 0.2-alpha variant on 14 more |

Five values. The accent appears on 47 of roughly 400 text elements, and it is
never used for a heading — only for indices, active states, and the one rule
under the live chapter.

## Typography (measured)

Three families, each with one job: **Archivo** display (84px common, 180px on a
pulled quote mark), **Inter Tight** body (17px), **JetBrains Mono** annotation
(9 / 12 / 13px, tracked wide). The mono is not decoration — it carries the
drawing labels, the credential strip, the depth readout and the stage counters,
which is what makes the page read as a document rather than a brochure.

## The devices worth stealing

**One particle buffer, six morph targets, named after the chapters.** The shapes
are `surface, survey, extract, structure, network, resolve` — the same six names
as the fixed rail down the right edge. The scene and the navigation are one
piece of data, so they cannot drift. The cloud opens as terrain, becomes a
survey traverse, a pit section, a structural frame, a network, and finally the
brand mark itself. Full mechanism in `scroll-direction.md` §7b.

**Technical section drawings instead of photographs.** Six services, six drawn
SVGs. The opencast one is a hatched pit cross-section annotated `PIT DEPTH 32 M`,
`BENCH 8 M`, `HAUL RAMP 1:10`, `SECTION A-A`, with topsoil and overburden
stockpiles drawn where they actually sit. Mechanism in `imagery.md`, "Drawing
beats sourcing".

**A progress readout in the client's own units.** The right rail counts `000` to
`082` as metres of depth against the six chapter labels. A percentage would have
been the same number and meant nothing.

**Credentials as a marquee.** `B-BBEE LEVEL 1 CONTRIBUTOR · REG 2018/270599/07 ·
ZERO HARM · RUSTENBURG, 0300 · CIDB 4CE · CIDB 6GB` running as a band. For a
contractor these registrations are the entire buying decision, and putting them
in a footer would have buried them.

**Scroll velocity spent in the shader.** Turbulence and point size both scale
with velocity, so the cloud breaks up under a fast flick and settles when the
reader stops.

## Copy

Plain, specific, and load-bearing. `A machine that is on site but down is worth
exactly as much as one that never arrived.` `We take the scope and the drawings
and say plainly what is in and what is out before anyone signs.` `Haul road
gradient. Get it wrong and every cycle time on the pit is wrong with it.` Every
one of those is a sentence only somebody who has run a site would write.

## Where it would not pass this skill's own audit

Recorded honestly, because a corpus entry that reads as flawless teaches nothing.

- **`ground flips 0` on desktop.** The palette does shift per chapter, but it
  shifts inside the shader between values that are all very dark, so no pair
  clears the 36-delta threshold. Twenty-five screens on one ground is the single
  biggest thing this page could fix, and the fix is already half-built: widen
  the per-chapter palette spread rather than adding CSS sections.
- **`hero-type-small`.** The hero wordmark is artwork, so the largest *text* on
  the first screen is 17px. Defensible, and it still costs the page the check.
- **`section-metronome`.** Band padding is symmetric across most sections.
- **`conversion-incomplete` and `img-not-responsive`.** Three images, none with
  a `srcset`.

## What it proves

A brief with no product, no premises worth photographing and no people willing
to be photographed can still reach Tier C. The answer is not to buy a generic
3D model of an excavator, which reads as visibly not theirs. It is to build the
subject out of the domain: the terrain, the pit section, the firing order, the
depth in metres.
