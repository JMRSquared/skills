---
name: jmr-design-taste
description: Builds and checks professional company websites with tasteskill (Leonxlnx/taste-skill, MIT) pinned to one read commit. It lends its tools to /premium-web-design and /jmr-generate-video. Gives a page plan by kind of business (software, gaming, hardware, product, service, place), dealt palettes and type pairings that differ between runs, real full-colour brand icons, licensed Wikimedia Commons stand-in photographs with credits, a copy linter for model-written tells, a performance budget and browser checkers with a finish gate. Use when the user runs /jmr-design-taste, names tasteskill or taste-skill, or asks for a conventional company site led by photographs and sections (a cafe, clinic, studio, shop or SaaS) instead of one playable object. /premium-web-design and /jmr-generate-video call it themselves for palettes, icons, photographs, copy-lint and perf.
version: 1.0.0
---

# /jmr-design-taste

[tasteskill](https://github.com/Leonxlnx/taste-skill) by Leonxlnx (MIT, `LICENSE`, [tasteskill.dev](https://tasteskill.dev)) builds the site a good company would ship: plain copy, one design system, one section per screen, real photographs and real product UI, enforced by checkers in a real browser. This skill pins it to one commit that was read line by line, keeps it out of the agent folders and says how the other JMR skills use it.

`<skill-dir>` is the folder holding this file. `taste.sh` is `<skill-dir>/scripts/taste.sh`.

## Setup

```bash
T="$(<skill-dir>/scripts/taste.sh path)"   # fetches once into ~/.cache/jmr-design-taste, then only prints the path
<skill-dir>/scripts/taste.sh chrome         # the browser its checkers will use
```

`$T` is the upstream skill folder. Its own docs call it `<skill>`. Run every tool through the wrapper so the pinned copy and a browser are used:

```bash
<skill-dir>/scripts/taste.sh run <tool> [args]
```

Tools: `copy-lint`, `perf`, `consistency`, `shoot`, `photos`, `icons`, `start`, `moments`, `effects`, `gate`, `layout-check` (`assets/layout/check.mjs`) and `hero-deal` (`assets/layout/deal.mjs`). Needs Node 22+, git and Chrome or Chromium. With neither installed, `npx playwright install chromium` gives the wrapper one to find.

- The cache is checked on every call. A checkout with local edits or another commit stops the run. Never edit the kit to clear a check: waive a false FAIL in the project's `.taste-skill/waivers.json` with its reason, as `$T/references/gate.md` says.
- The tools write a `.taste-skill/` folder (history, found photographs, Chrome profiles) in the project. Add `.taste-skill/` to the project's `.gitignore`, except `history.json` and `layout-history.json` when the owner wants later pages to keep differing.
- Network: `photos` reaches Wikimedia Commons, `icons` reaches jsDelivr at pinned versions and the pages it builds load Google Fonts. Nothing else leaves the machine and there is no telemetry.
- To move to a newer tasteskill, read the upstream diff of `scripts/` and `assets/` for new hosts, child processes and install steps first, then change `COMMIT` in `taste.sh`.

## Run on its own

Read `$T/SKILL.md` and follow its run (sections 1 to 7) with these overrides. They win over upstream.

1. **Words.** Every word on the page also goes through `jmr-plain-language`. `copy-lint` is a second check and never replaces it. Where the two disagree, plain language wins on wording and tasteskill on page structure.
2. **The gate.** Upstream installs `gate.mjs` as a Claude Code Stop hook. This skill does not. Run `taste.sh run gate index.html` yourself before you report. Put its `GATE:` line first in the report.
3. **Facts.** Upstream lets a place page assume hours and prices marked `data-assumed`. Ask the user for them instead. If they say to go ahead without, mark them as upstream says and list each one in the reply.
4. **Stack.** In a project with `package.json`, the JMR build/test/lint gate still applies after the page passes the taste gate.
5. **Standing rules.** No deploy, no commit and no merge without the user's confirmation, as always.

Choose this skill or `/premium-web-design` by the brief: a page led by photographs and sections (a bakery, a clinic, a SaaS with real screens) runs here; a page built around one playable object that is the product's metaphor runs in `/premium-web-design`. When the user did not say and the brief fits both, ask once.

## Inside /premium-web-design

`/premium-web-design` keeps its own direction: one object, one typeface, very few words and scroll through `kit/story.js`. tasteskill's page system argues against that (one section per screen, an object that never carries the page, hover lifts, dealt moments), so take its tools and never its page plan.

| Use | How | Notes |
|---|---|---|
| Palette | `taste.sh run start deal --page <kind> --trade "<trade>" --history .taste-skill/history.json` | Take the first palette that passes `/premium-web-design` section 5. Skip near-black with a lime or orange accent and anything violet. Use one face from the pairing at most; ignore its mono. Do not run `start css`: write the tokens by hand |
| Real brand icons | `taste.sh run icons find <name>`, then `fetch <ids> --out assets/icons` | Only for tools the product really works with, shown inside the object or a quiet row. Ship `icons-credits.json` and the trademark line from `$T/references/icons.md` |
| Stand-in photographs | `taste.sh run photos search "<subject>" --out .`, look at each full size, then `fetch <ids> --out .` and `credits` | Licensed Commons frames when the client has none and `scripts/find-photos.mjs` finds nothing better. List every stand-in in the reply with the photograph to shoot instead |
| Copy check | `taste.sh run copy-lint index.html` during the cut pass | Fix every FAIL. A WARN stays only with a reason in the reply |
| Copy tells | `$T/references/copy-tells.md` | Read during the cut pass with `jmr-plain-language` |
| Performance | `taste.sh run perf index.html --profile .taste-skill/chrome-perf` | Fix every FAIL. A JS-parsed FAIL from the object's own 3D library may stay when the bundle is already split and lazy, said in the reply |

Never use from tasteskill inside `/premium-web-design`: `starter.html`, `system.css`, `system.js`, the hero layouts, the moments, scenes and effect grounds, the motion layer, `layout-check`, `consistency` and `gate`. Those checkers expect tasteskill's own markup (`main > section > .wrap`, one section per screen): `layout-check` stops with an error on `/premium-web-design`'s scroll-story demo.

## Inside /jmr-generate-video

Hyperframes still directs the film and `jmr-generate-video/references/world-class.md` still sets the bar. tasteskill adds the four things below.

1. **A look that changes between films.** When the brand has no colours or type of its own, deal them: `taste.sh run start deal --page <kind> --trade "<trade>" --history ~/.cache/jmr-design-taste/video-history.json`. The shared history makes each film's look differ from the last. Take the first palette that passes `no-slop-video.md` section 1 and the first pairing. Download the font files into the composition, since nothing may fetch during a render. Write the palette id and pairing into `SPEC.md`.
2. **Shader grounds as raw material.** `$T/assets/effects/` holds 25 seeded WebGL grounds (caustics, god rays, contour lines, silk folds, a dotted globe and more) that take their colours from the palette. Copy `fx.js` and the effect folders you use into the composition. Drive them from the film's clock under Hyperframes' seek protocol (`$HF_SKILLS/hyperframes/references/runtimes.md`), never their own: set `fx.config.adaptive = false`, give every `[data-fx]` a `data-fx-seed`, register the mount as `window.__hf.buildReady["fx"] = fx.mountAll(scene, palette)` (it is async) and call `fx.setClock(e.detail.time)` in an `hf-seek` listener. Snapshot two different times and the same time twice: the two times must differ and the repeat must match. A blank ground means the effect was off screen when it mounted, so mount it with the scene visible. A ground is a world for type, interface and real objects to act in. It is never the whole shot (`no-slop-video.md` section 2).
3. **Real brand icons.** When the film names tools the product works with, `taste.sh run icons fetch <ids> --out <out>/composition/assets/icons` writes local SVGs in the brands' own colours. Never redraw a logo. Credit them in `CREDITS.md`.
4. **A second words check.** After `"$SCRIPT" words <out>` passes, run `taste.sh run copy-lint` on `<out>/voiceover.txt` and `<out>/share-copy.txt` (those that exist) and fix every FAIL. It counts tells plain language does not (stock lines, two-fragment headings, repeated devices).

`taste.sh run photos search` may also supply licensed Commons photographs as raw material for cutouts, which `world-class.md` section 1 allows. Credit each in `CREDITS.md`. Never use its moments, scenes or page checkers in a film: they are built for scrolling pages.

## What tasteskill holds

For finding the right file in `$T`:

- `SKILL.md`: house rules, the kind table, the run and the checklist.
- `references/`: `copy.md`, `copy-voice.md`, `copy-tells.md`, `copy-registers.md`, `copy-moves.md` (words); `system.md`, `layout-v4.md`, `sections.md`, `sections-library.md`, `cards.md` (structure); `photos.md`, `icons.md`, `diagrams.md`, `backgrounds.md` (pictures); `motion.md`, `moments.md`, `scenes.md`, `effects-usage.md`, `effects-creative.md`, `effects-objects.md` (motion and effects); `perf.md`, `gate.md` (checks).
- `library/palettes.json` and `library/type.json`: the palettes and pairings the dealer draws from.
- `assets/`: the starter page, design system, hero layouts, UI fragments, diagrams, CSS grounds, shader effects, objects, moments, scenes and a vetted photo library.
