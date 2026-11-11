# The bar: films people want to watch

Every film this skill makes must be amazing to watch, detailed and full of excellent graphics and animation. A film that passes every check and still looks like a slideshow has failed. This file wins over Hyperframes and over every other file in this skill on how a film looks and moves. Only `jmr-plain-language` limits it, on wording alone.

This standard comes from reading the source of HeyGen's launch films and measuring them against two reels that the owner rejected. Those reels passed every check we had. They were stock photos with boxes of text on top. Nothing happened in them.

## 1. Generate the picture

Build the picture in the composition. This is the default for every film and every kind of project, so never make a person's footage or a stock library the plan. But know what code can draw well and what it can't.

**Code draws systems well:** type, interface, charts, counters, maps from real geometry, diagrams of lines and grids, particles, shaders, light, gauges and instruments. Build these in SVG, canvas, CSS 3D, WebGL or Lottie.

**Code can't draw a real object.** An agent typing SVG coordinates for a car, a person, an animal, a building, food, a device, a tool, a tree or the sun gets a child's drawing. `goc-unpopular-opinions` drew each car as one 9-point polygon with two circles for wheels, plus a sun with rays, a pencil and a magnifier. The owner said they looked drawn by a 2-year-old. HeyGen's films and brag never hand-draw an object either. They show the real product, a 3D model, type or abstract light.

Work down this list and stop at the first that can carry the shot:

1. **The real product acting.** Its real components, screens and animations, when the project has them (`hyperframes-overrides.md` section 3).
2. **The real object, made real.** A 3D model lit in Three.js with an HDRI, from `gltf-assets` (Poly Haven is CC0 and needs no key, while Sketchfab needs `SKETCHFAB_TOKEN` and its CC-BY credit goes in `CREDITS.md`). Or a photo cut out with `"$SCRIPT" cutout`, then placed on a lit ground with a soft contact shadow, its own light and parallax. With either one, the object can turn, explode into parts, get labels on the right parts or drive through the scene.
3. **A system that acts.** The idea as type, data, a diagram, particles or a shader: a road as a line of light the car's cutout drives along, fuel spray as a particle field over a photo of the engine, a city made of the product's own data.
4. **Type as the picture.** Very large words that build, roll, break apart or become the next object.

A registry block is a starting point, so restyle it until it belongs to this film. Search with `"$HF" catalog --query "<idea>" --json`, or by tag: `shader`, `3d`, `transition`, `camera`, `data`, `typography`, `background`, `motion-primitive`. Check that the block renders in headless Chrome before you rely on it, because some WebGPU blocks may not.

For each story beat, ask what the idea looks like as a working object, then get that object from a real source. "The Fortuner is a Hilux in a suit" is both cutouts on the same lit floor, with the Fortuner's body lifting off to show the shared ladder frame. "One pothole and that rim is gone" is a cutout of a real low-profile wheel dropping into a cutout of a real pothole.

## 2. How the picture must look

Every frame must look like a motion studio made it. Hold each style frame and the finished sheets to these:

- **Nothing looks like clip art.** No flat fill with one stroke weight standing in for a real thing. No doodles that stand for an idea: sun with rays, pencil, magnifier, lightbulb, heart, thumbs up, trophy, rocket. If a thing needs showing, show the real thing. If it only needs naming, set the word.
- **Light and depth.** Each shot has a light source. The ground is lit unevenly, objects throw contact shadows and there are at least three layers: background, subject and foreground. Something in the foreground or background moves at a different speed from the subject.
- **Material.** Surfaces carry texture, grain, gloss or a gradient that comes from the light. One flat colour across the whole frame reads as a worksheet.
- **Fill the frame.** The hero fills at least 40% of the frame and may bleed off the edges. In portrait, a small drawing in the middle of an empty field is a failure.
- **Detail you catch on a second look.** Fine tick marks, a secondary label in a lighter weight, hairlines, reflections and a second layer moving behind the first.
- **One world per section, not one flat ground for the whole film.** A film can keep one palette and still change the light, the scale and the camera between sections.
- **Photos for cutouts.** Pick a photo where the object is whole, alone and seen from the angle the shot needs. Run `cutout`, then open the PNG at full size. When it kept a neighbour, cut a limb or left a fringe, pick another photo.
- **On the ground.** A cutout stands where the plate's ground is. Every wheel or foot that should touch the ground touches it, with a dark contact shadow under each. The camera height and angle of the cutout photo match the plate: a car shot side-on goes on a road seen side-on, never across a road that runs into the distance. Its scale fits the road's lanes or the nearest object. Never tilt or float a car for energy. It may lift only for a cause on screen, pivoting on a wheel that stays down (a jack, a bump). Move the camera or the plate for energy instead.
- **One photo per background.** A portrait background is one photo: a portrait original or a crop of a photo at least 1920 px tall in the crop. Never stack two photos, or a photo over a blurred copy of itself, to fill the height. When no photo is tall enough, build the ground in 3D or set the shot on a lit studio floor.
- **Labels tell the truth.** A label names what it points at and its line ends on that thing. It is set in the film's own type face, never monospace for decoration. A label that is not true of the picture ("gravel road" over tar) is worse than none.
- **Nothing covers the words.** A logo, a car or another title never sits over a headline or a caption, even for a moment in a transition. `data-layout-allow-overlap` and `data-layout-allow-occlusion` are for one deliberate layer, such as a giant number behind a car. Put `data-layout-ignore` on texture such as grain. `"$SCRIPT" slop` lists every waiver and `REVIEW.md` names each with its reason.

The check is simple: put a style frame beside a frame from the reference film. If a viewer could tell which one an agent drew, it isn't done.

## 3. The failed template

If a shot matches any line here, redesign it. Fixing the details won't save it.

- A stock photo with a dark gradient, a headline on top and a card or sticker floating on it.
- A number in a box where the number should come from something moving on screen.
- A coloured progress bar standing in for a real thing such as heat, speed or wear.
- The same layout twice in a row: logo, headline, card, source line, caption in the same places.
- A headline that stays up across several spoken ideas.
- A black or empty lower third. The platform's buttons may cover that area, so text stays out of it, but the world must carry on underneath.
- A flat vector panel dropped between photos, because it reads as a placeholder.
- A small logo docked in a corner of every shot, unless the user asks for it. Make the logo an event in the opening or the end.
- A source line floating over the picture in every scene. Sources go in `context.md` and `share-copy.txt`. If a claim needs one on screen, it is part of the graphic it supports, at 28 px or larger.
- An end card that freezes. Something keeps acting while the last line holds.
- Words shown and spoken and captioned at once, three times over.

## 4. Numbers to hit

Measured from the HeyGen films. The graphic films (`k3-promo`, Anduril, Polymarket, Linear) measure one new picture every 1.2 to 1.3 s and are almost never still. The launch film measures 1.7 s. The rejected reels measured 4.5 to 4.9 s, with 13 to 25% of the film sitting still.

| What | Target |
|---|---|
| A new picture | every 1.5 to 3 s. `look` fails above 3 s |
| The same picture sitting still | never above 4 s, in under 8% of the film |
| Shot length in portrait | mostly 1 to 2 s. A longer hold is fine while the object keeps acting |
| Animated moves in the film | about 4 to 8 tweens a second (measured 5.0 launch film, 5.5 SpaceX, 8.2 Kimi K3) |
| Scenes | one sub-composition per beat. The launch film has 16 in 50 s |
| Hero size | fills at least 40% of the frame |
| Length | usually 30 to 60 s. Each extra 10 s needs about 5 new pictures, so never stretch a beat to fit the voice |
| Words spoken | about 100 in 50 s in the launch film, against about 165 in 63 s in the rejected reels. Cut words before you slow the picture |

## 5. What every film must contain

Write how each is met in `SPEC.md` before you build. A film missing one is not finished.

- **A frame 0 worth stopping for.** The hook is already on screen as a designed picture, with the surprising number, the result or the question. The viewer decides in about a second and may be watching muted.
- **Two showpiece moments at least.** Shots that took real building: a simulation, a 3D move, a shader world or a machine that works. Someone should want to pause them.
- **An object that explains.** The film's main claim is shown by something working, with its numbers coming from that object.
- **Three to five kinds of transition,** each caused by something on screen, as in Hyperframes' `motion.md`. At least one object becomes the next world. At most a third of the seams between beats are hard cuts.
- **Different worlds or layouts.** No two shots in a row share a layout: the hero's place and size, where the type sits and what the ground is. A new car in the same spot over the same giant number is the same layout. Check it on the shot sheet `look` writes, where every shot sits beside the next. The type moves around the frame. A big film can give each section its own palette and type, as the launch film does.
- **Contrast in speed.** Fast montage, then a held moment where one thing acts. Hold 0.3 to 0.75 s before the payoff. Then let the payoff land big, with sound.
- **A payoff the film builds to.** The viewer should see it coming and still enjoy it.
- **Detail you only catch on a second look.** Small labels on a machine, tick marks, texture, a second layer moving behind the first. Empty space is a choice, not what is left over.
- **A sound arc.** Music is already playing on frame 0, rises through the showpiece, drops almost to nothing before the payoff and resolves on the last line (`hyperframes-overrides.md` section 6).

Four rules from brag still apply: every frame could be posted, the film is clear to a stranger after one viewing, it is specific to this project and its humour comes from what the project really does.

## 6. How to build it

Follow this order. Skipping step 3 is how the rejected reels happened.

1. **Pick one reference film.** Use the one the user named. Otherwise pick from the table below by tone. Run `"$SCRIPT" refs` to get the source of HeyGen's films, read the matching project and write its grammar into `SPEC.md`: shot lengths, how titles enter and leave, transitions, palette roles and type scale. Take its grammar, never its content. The source is reading material, so don't run its scripts. Its media, logos and fonts are not licensed for reuse.
2. **Write the shots with their technique.** Each line of `SHOTS` in `SPEC.md` names what is built, how it is built and where each real object comes from: "cutout of a real fuel injector photo on a lit dark bench, fuel spray from a seeded canvas particle field, spray stops on the word cut". A line that says "photo with a card" or "SVG car" is not allowed.
3. **Build three style frames first.** Build the hook, the hardest showpiece and the payoff before anything else. Snapshot them at full size. Put each beside the reference with `"$HF" snapshot --at <t> --against <ref.mp4>` if you downloaded it, or beside its stills. Go through section 2 line by line. Ask whether they could sit in the same film. Keep working until they could. Only then build the other scenes.
4. **Build scene by scene,** one sub-composition per beat, with motion from `motion.md` and varied title entrances. Use `data-motion-blur="on"` when the film moves fast. A scene that goes black near its end has a timeline shorter than its slot: pad it with `tl.to({}, { duration: <slot> }, 0)`.
5. **Review as a harsh motion director.** Render, run `"$SCRIPT" look <out>/video.mp4` and go through Hyperframes' `review.md`. `look` writes two kinds of sheet to `<out>/qa/look/`: `cuts-NN.jpg` shows every cut at 10 frames a second and `shots.jpg` shows one frame per shot in order. Stills of steady shots hide what goes wrong in motion, so the review is done on these sheets. On the cut sheets, any frame that is empty, half blank, all blur or shows the hero cut off with nothing else on screen is a P0. On the shot sheet, two neighbours with the same layout are a P0. On every sheet, a car that floats, tilts or sits at a different angle from its road is a P0. When the host can start a helper, a fresh one reviews the sheets with no knowledge of the plan and gives P0 and P1 notes. Give it section 2 and ask it first: does any object look hand-drawn, like clip art or like a child drew it? Each yes is a P0. Fix them. Ask of every beat: would a stranger stop scrolling for this? If not, rebuild that beat.

| Reference (in `"$SCRIPT" refs`) | Good for | Grammar |
|---|---|---|
| `k3-promo` | technical, serious, data | Black ground, particle and grid fields, type in brackets that glows on the payoff. One continuous world |
| `hyperframes-launch` | a big launch with range | Warm home ground, then hard cuts between very different worlds. Shader, type and diagram moments |
| `spacex-launch` | a product used start to finish | One flow: a connector morphs into a chat, the answer arrives and a result card counts up. Heavy use of SVG |
| `liquid-brand-refraction` | premium, brand | Shaders and a liquid surface carrying the brand |
| `sfx-music-launch` | playful, built on a joke | Cream paper and giant serif type. The film starts in silence and gains sound as the story adds it. Its paper works because the type and real interface carry it. It never draws an object, so a paper film of hand-drawn cars fails |
| `heygen-apple-motion` | short stings, app store | Four single-file motion pieces: a UI sting, bouncy UI, a message sting and a generated reel |

These are all widescreen software films. A portrait film takes their grammar and is rebuilt as a vertical sequence (`types/vertical.md`). A comedy film keeps this craft and gets its energy from the joke.

## 7. How this fits the other rules

- **Plain words.** Voiceover, captions and any on-screen sentence stay whole and plain (`hyperframes-overrides.md` section 8). A sentence can build across several beats with big type. A label on an object can be a plain noun. Use fewer on-screen words so the picture and the voice do more.
- **Captions** on a portrait film are at least 60 px at 1080 wide, in short groups with no box behind each word. Read them on the phone sheet. Place them so they don't cover the hero.
- **True claims.** Every number still comes from the project or `context.md`. A graphic that looks like data must be data, so a gauge with no source is a drawing and must not carry a source line.
- **Effects.** `no-slop-video.md` says when a glow, gradient or particle field belongs in a film.
