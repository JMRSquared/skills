<!--
  Required on every /premium-web-design run, together with SKILL.md.
  Paths below are relative to the skill directory.
-->

# Premium web design: tools and checks

SKILL.md holds the design rules. This file holds what you need to run them.

## When this applies

**Auto-fire** on customer-facing visual surfaces: new sites, redesigns, marketing and product pages, landing pages, brand and campaign microsites.

**Do not auto-fire** on authenticated app chrome, design-system work or pure logic, API or infra edits. `/premium-web-design` applies it on demand. `/jmr-unslop` covers app screens that look generated. When `react-tsx-component` also applies, this skill owns the visual direction and that one owns component form.

**Companions:** photography → `scripts/find-photos.mjs` (no key, contact sheet) or `/jmr-image` (Unsplash then Pexels). `/jmr-image` with neither `UNSPLASH_ACCESS_KEY` nor `PEXELS_API_KEY` searches pngimg only, which is CC BY-NC and not for commercial work. Logo → `/jmr-logo-design`. Slop audit → `jmr-unslop`'s `references/signs.md`. glTF/GLB and HDRIs → `/gltf-assets`.

## Can you see your work?

Run this before anything else:

```bash
node -e "import('playwright').then(()=>console.log('SIGHTED')).catch(()=>console.log('BLIND'))"
# If it prints BLIND, try a directory that has playwright installed:
#   PW_DIR=/path/to/dir node -e "import(process.env.PW_DIR+'/node_modules/playwright/index.mjs').then(()=>console.log('SIGHTED')).catch(()=>console.log('BLIND'))"
# To install: mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install chromium
```

`PW_DIR` is the directory containing `node_modules`, and it is a command prefix. In any `.mjs` you write yourself, import playwright by absolute path.

**BLIND:** say so to the user in one line and offer the install command. Keep to one simple held scene with no WebGL, because you cannot verify what you cannot see.

## The real sites

`assets/studies/<slug>/` holds desktop and phone frames plus `data.json`. `references/site-studies/<slug>.md` holds the measurements. These are the standard to compare against. Look at the frames: the notes describe a page, and the frames are the design.

| Slug | What it is | Best for |
|---|---|---|
| `igloo-inc` | Site of the Year 2024, 3D ice-cube journey | WebGL scroll narrative |
| `lusion` | Most-awarded WebGL studio | physics, particles, pointer play |
| `activetheory` | Repeat SOTY winner | scroll-driven 3D storytelling |
| `fizzi` | Soda product landing | scroll→3D object mapping |
| `macbook-ui` | Hardware product page | product reveal beats |
| `nimbus-keyboards` | Keyboard brand | configurator, theme playground |
| `apple-iphone14` | Classic 3D + GSAP product page | canonical product scroll |
| `blindbarber` | SOTD, barber anniversary | pinned timeline, scrapbook reveals |
| `hagis-barbershop` | SOTD, barber | cinematic intro, dark editorial, transitions |
| `pizzato` | SOTD, plumbing showroom | 3D showroom, illustration depth |
| `plomberie-5-etoiles` | Nominee, local plumber | conversion-first at an award bar |
| `amrit-palace` | SOTD, restaurant | menu-as-scroll, warm editorial, review placement |
| `tripletta` | SOTD, pizza | high-energy pacing, infinite scroll, transitions |
| `planetono` | SOTD, custom three.js | toon shaders, Rive micro-interactions |
| `banzai-nudols` | SOTD + Developer Award | character-driven SKU storytelling |
| `side-8-group` | Hand-built reference, mining/construction contractor | Tier C with nothing photogenic: particle morph, drawn technical diagrams, 3 photos in 25 screens |
| `sirwali-nr` | Hand-built reference, a memorial biography (our build, source in `/Users/lavhe/CODE/sirwali-nr`) | reveal coverage: the choreography hook, drawn traverses and maps, point-cloud formation from paths and numerals |
| `230-conversations` | Hand-built reference, youth ministry | photographs that unmask from the bottom, figures at three drift rates, pinned photo strip with a counter |

Pick by what the page needs, not by industry. Take how they crop, scale and leave space. Do not rebuild one of them, and do not copy their effects without their photography.

To study a site that is not here:

```bash
PW_DIR=<dir with node_modules/playwright> STEPS=8 \
  node scripts/study-site.mjs "<url>" <slug> assets/studies
```

Sites that drive everything from wheel events (`igloo-inc`, `lusion`, `activetheory`) report one screen and read as broken in `data.json`. Trust their frames.

## The auditor

```bash
PW_DIR=<dir with node_modules/playwright> \
  node scripts/audit-page.mjs "<url or file://…/index.html>" ./.audit
```

It captures desktop, phone and reduced-motion frames, measures the rendered page and exits non-zero while any FAIL stands. Passing it does not mean the page is good. Open the JPEGs every time. Only your eyes catch a bad crop or a limp hero.

Taste checks:

| Code | Fails when | Fix |
|---|---|---|
| `too-much-text` | Over 300 words outside nav, footer and `data-reference` | Delete sentences, then sections. Do not shrink the type |
| `too-many-fonts` | More than two families rendered | One family, or two with a real contrast |
| `novelty-face` | A novelty display face, unless declared in `<meta name="brand-fonts">` | A face from `references/type.md` |
| `ai-default-face` | Space Grotesk, Instrument Serif, Fraunces and the like, unless declared | A face from `references/type.md` |
| `mono-text` | More than two mono text elements outside `code`, `pre`, `kbd` and `data-object` | The page's one typeface |
| `caps-labels` | More than two small tracked-caps labels | Delete them |
| `hard-shadow` | A hard offset shadow on any element or text | No shadow |
| `tilted-text` | Text rotated at rest, outside `data-track` and `data-object` | Straight |

The other checks catch broken pages: contrast, broken or upscaled images, sideways overflow, a hero that never paints, a face that did not load, gradient text and card grids. Each message says how to fix it. Fix each WARN, or say in one line why the design intends it.

`--ambition` also prints the older SPARSE and CRAFT notes. They ask for more media, overlap and motion. Ignore them unless you are deliberately building an effect-led page.

Capture the storyboard to check that the scroll tells its story:

```bash
PW_DIR=… node scripts/story-frames.mjs "<url>" ./.story
PW_DIR=… node scripts/story-frames.mjs "<url>" ./.story-phone 390 844
```

Each row is one scene at the start, middle and end of its scroll. If a row shows no change, fix or remove that scene.

## Before you hand over

Images are local files with `srcset`, nothing hotlinks a third-party host, there are no console errors, and the reduced-motion frame still reads. Tell the user which photos are stock and which facts are placeholders.

## Demos

`demos/scroll-story/` is the reference page: one playable object, a calm frame and few words. The owner's chosen pages in `assets/owner-references/` are the standard it answers to. The other files in `demos/` show motion mechanics only, such as pinned stages and page transitions. Their look and copy are not a standard.
