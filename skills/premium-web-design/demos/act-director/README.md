# act-director

A four-act scroll-driven 3D story, wired the way `references/scroll-direction.md`
describes it. Small enough to read in one sitting, complete enough to run.

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # -> dist/, static, serve from anywhere
npm run preview        # http://localhost:4173
```

`dist/` is 2.5 MB, of which 944 KB is the model. No server, no environment
variables, no API keys.

## What it demonstrates

| Idea | File |
|---|---|
| The act table, written before any code | `src/story/acts.ts` |
| Scroll state on a module singleton, mutated in place, outside React | `src/story/scrollStore.ts` |
| Lenis, one rAF loop, act registration and re-measurement | `src/story/ScrollProvider.tsx` |
| DOM scrubbing that sets state only when a discrete value changes | `src/story/useActScrub.ts` |
| Keyframe tracks, one sampler, one continuous timeline `t = act + progress` | `src/three/director.ts` |
| The camera solving its distance from subject size and frame fill | `src/three/Scene.tsx` (`Rig`) |
| One canvas for the whole document, quality tiers, load sequence, fallback | `src/three/Stage.tsx` |
| Model loading, per-node animation, grouped fades | `src/three/Product.tsx` |
| Sticky act shell, reveal that survives a failed bundle | `src/components/ActShell.tsx` |
| Reduced motion releasing the pin instead of killing the tween | `src/index.css` |

## What to copy

Take these four files close to verbatim. They are the architecture and they are
not project-specific:

- `src/story/scrollStore.ts`
- `src/story/ScrollProvider.tsx`
- `src/story/useActScrub.ts`
- the `sample()` function, the `StoryState` shape and `updateStoryState()` from
  `src/three/director.ts`

`scrollStore.ts` and the sampler import neither React nor three.js. Point a plain
three.js render loop, a GSAP timeline or a 2D canvas at `storyState` and the rest
of the architecture is unchanged.

Take `Rig` in `src/three/Scene.tsx` as well. The camera solve is the single
change that most improves a scroll-driven scene, and the per-axis fill split is
what makes a phone work.

## What to change

Everything below is content, not architecture:

1. **`src/story/acts.ts`**. Your acts: ids, scroll lengths, copy, subject sizes,
   fill fractions. Adding an act means adding a row here, adding the id to
   `ACT_ORDER` in `scrollStore.ts`, adding a section component, and extending
   each keyframe track by one key. Nothing else.
2. **The tracks in `src/three/director.ts`**. Camera poses, staging, and one
   track per thing that moves. Delete `TAPE_LIFT` and `TAPE_SPIN`; they are
   specific to this model.
3. **`src/three/Product.tsx`**. Your model. Measure its bounding box before you
   write a single number, with `scripts/measure-model.mjs`:

   ```sh
   PW_DIR=<dir with node_modules/playwright> \
     node scripts/measure-model.mjs public/models/thing.glb --scale=6
   ```

   It runs in headless Chromium because `GLTFLoader` needs `self` and
   `URL.createObjectURL`; importing it in a plain node script fails in a way
   that looks like a broken install. Pass `--scale=N` to match the group scale
   the model is mounted under, since the act table is in scene units and a raw
   file measurement is not. This file's `BASE_LIFT` exists because the Poly
   Haven nodes carry a 90 degree rotation and the object's base sits below its
   origin. Guessing that puts the product in the ground.
4. **`src/index.css`**. The whole visual system. Swap it for Tailwind, CSS
   modules, anything. No other file reads a class name from it.
5. **`src/three/poster.jpg`**. The still. Re-render it from your own scene with
   `npm run poster` (see the header of `scripts/render-poster.mjs`). Never
   art-direct it separately; the two paths drift within a week.

## Deliberate omissions

- **No GSAP.** The whole timeline is 30 lines of keyframe sampling. Reach for
  ScrollTrigger when a beat is a timeline with offsets and overlaps.
- **No image-sequence fallback.** A real product page should ship one for phones;
  `references/scroll-storytelling.md` §7 covers it.
- **No `manualChunks`.** The 3D bundle is one lazy chunk on purpose, so you can
  see in the build output exactly what the canvas costs (1.1 MB raw, 308 KB
  gzipped) rather than having it spread across five files.

## Verified

Built and checked in headless Chromium at 1440x900 and 390x844:

- `document.querySelectorAll('canvas').length === 1`, context type `webgl2`
- `document.documentElement.dataset.scenePath === 'webgl'`
- document height 8,370px at 1440x900, which is 9.3 screens across four acts
- the timeline reaches `t = 4`, and the camera keeps moving through the final
  act: camX 1.9 to 2.6, camY 1.0 to 1.15, camZ 4.0 to 4.3, spin 1.05 to 1.5
- the load plate in `index.html` is painted at 120ms, before the stage chunk
  lands, and is hidden once the scene mounts
- reduced motion: 0 canvases, `scenePath === 'static'`, document collapses to
  2,719px, the stage back in flow, copy at `opacity: 1`
- phone: `devicePixelRatio` 3 against the `low` tier's 1.25 cap. Desktop runs
  the `high` tier at 1.6; the two caps are per tier, not one number
- no console errors at any scroll position

## Licence

The model is CC0. See `CREDITS.md`.
