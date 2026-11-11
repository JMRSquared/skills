# Keeping the video from looking AI-made

A video can carry every tell a generated web page has. Motion adds its own. This file applies `jmr-unslop` to video. Its full list is `<skill-dir>/../jmr-unslop/references/signs.md`. Read that too when it is installed. If it is missing, install it with `npx skills add jmrsquared/skills --skill jmr-unslop -g` or work from this file alone.

`world-class.md` sets the bar and wins over this file. This file's job is to stop lazy defaults. It must never make a film plainer. An earlier version banned glows, gradients, heavy type and most transitions. The films came out flat. The best reference films use all of those, on purpose.

## 1. Write the direction first

Before the shots, put five lines at the top of `SPEC.md`. Derive them from the product, never from what is trending.

- **Product.** What it does and for whom, in one plain sentence.
- **Character.** Two or three concrete words of your own about how the product looks and behaves. Clean, modern, sleek, minimal and premium are not allowed, because they describe every template. Character sets the picture. It does not change how sentences are written (`hyperframes-overrides.md` section 8).
- **World.** The place or material the product belongs to. It sets the ground, the accent and the visuals.
- **Showpieces.** The moments that get the most building, taken from the story (`world-class.md` section 5). The rest of the film is still detailed and moving.
- **Signature.** One small detail only this product would have, used consistently.

A real brand's logo, colours and fonts stay, unless they are slop themselves. Do not reuse the look of the last video this skill made. A near-black ground with one orange accent is a template, not a direction.

**Devices.** Under the direction, add a `## Devices` section to `SPEC.md` with one line each for `opening`, `captions`, `end card`, `call to action` and `transitions`, such as `- end card: the two trucks swap sides on a split ground`. Then run `"$SCRIPT" series <out>`. It compares them with the last five films for the same client (films whose output folders share a parent folder) and fails when one repeats. A series of reels each ending on the same fake comment box is a template, even when every reel passes on its own. Something the client fixed, such as the opener their presenter always says, is written `fixed: ...` and is not compared.

## 2. Effects: the test is whether they belong

An effect belongs when it is part of the world or does a job in the shot. A glow on a hot brake disc is heat. A particle field that is fuel spray is the subject. The same glow on a button, or the same particles drifting behind a title, is decoration. Reach for rich effects often and make each one mean something.

| Fine when it belongs | Slop when it is |
|---|---|
| Glow, bloom, light leaks | Stuck on badges, buttons and logos to look expensive |
| Gradients, shaders, liquid surfaces, grain | Purple to blue because nothing was decided, or a wash behind empty space |
| Particles, grids, dot fields | Floating behind a title with no connection to the story |
| Glass and refraction | Every card in the film being the same frosted panel |
| Heavy type at any weight | Every headline the same weight and size, in the same place |
| Overshoot and springs | On UI that should be still, or on opacity and colour |
| 3D, chrome, orbs | Generic tech symbols with no link to the product, such as glowing brains, robots or rockets |

These stay out unless the user or the brand asks for them:

| Default | Do this instead |
|---|---|
| Gradient text | Solid text, lit by what is around it |
| Small uppercase labels with wide tracking | Sentence case, or labels placed on the part they name |
| Emoji, sparkles, `New` and `Beta` badges | A plain line icon, or nothing |
| Three equal cards in a row | One large thing with detail around it |
| Everything stacked and centred on every shot | Vary it: asymmetric splits, tight crops, type that fills the width |
| Fake stat counters, star ratings, "Trusted by 10,000+" | Real figures from the brief, or leave them out |
| Mismatched number formats | One format, tabular figures |

## 3. Motion: what to remove

Video makes these worse, because the viewer cannot look away.

| Sign | Do this instead |
|---|---|
| Every element fading and sliding up | Vary entrances, as in Hyperframes' `motion.md` |
| Everything moving at once on one curve | One hero move per shot, the rest following 100 to 200 ms later |
| The same transition on every cut | Three to five kinds, each with a cause on screen |
| Pulsing, breathing and shimmering loops on things that are not live | Let the world or the camera carry the motion |
| A landed title that keeps drifting | Land it dead still and move something else |
| A slow push on a flat screenshot or photo | Rebuild the piece in code and let it act |
| Glitch, RGB split and screen shake on every cut | Use them where the tone or world earns them, each time differently |

## 4. Motion: what works

The `jmr-unslop` story video went viral on these. They apply to any film:

- **Things morph.** One object stays on stage while its values change, so the number climbs or the part opens. A morph reads as the thing working.
- **A wave.** Elements start a few dozen milliseconds apart, so a change runs across the screen.
- **Text rolls.** Changing words blur out and new ones rise in letter by letter.
- **Close crops.** Crop tight on the part that changes, so it reads on a phone. Never show a small window in the middle of an empty frame.
- **Before and after.** If the product fixes something, show the problem marked in place first, then let it resolve on the same screen.

## 5. Visuals

- Show something true: the real product, a working model of the idea, or a concrete subject from the world.
- Write a generated scene as one plain sentence first. If it takes two, it is not clear yet. `jmr-unslop`'s `references/visuals.md` has styles that work.
- A real object comes from a real source: a lit 3D model or a photo cut out with `"$SCRIPT" cutout`. Never hand-draw it in SVG or canvas, because an agent's drawing of a car or a sun reads as a child's (`world-class.md` section 2).
- Clip-art doodles are slop: a sun with rays, a pencil, a magnifier, a lightbulb, a heart, a thumbs up, a trophy or a rocket standing in for an idea. Set the word or show the real thing.
- No text, fake buttons or fake logos baked into an image. Type is set in the composition.
- The logo is the product's name plus a flat mark if it has one. Never redraw a real logo.

## 6. Words

This covers on-screen text and the voiceover script. `jmr-plain-language` governs all of it. `hyperframes-overrides.md` section 8 is the gate.

- Say what the product does for whom, using its own nouns, in sentences a person would say out loud.
- No slogans, clipped fragments, catchphrases or refrains. A heading is a plain label or a whole sentence.
- No hype words: supercharge, seamless, unlock, magic, revolutionize, game-changing, `AI-powered` on everything.
- No exclamation marks. On-screen headlines and labels have no trailing period.
- No claims that cannot be checked. Do not invent features, figures or customers. Demo data looks real and names nobody real.

## 7. Check before you render

```bash
"$SCRIPT" slop <out>/composition
```

It scans the composition for signs a search can catch, including monospace labels and every layout waiver that hides a collision from `"$HF" check`. Exit 1 means fix each hit, or say in one line why the brand or tone calls for it. It cannot judge taste, so then open stills from every scene and go through sections 2 and 3 by eye.

Finish with the **swap test:** put another product's name on the shot list. If the film still fits, push the direction harder in the visuals and the words.
