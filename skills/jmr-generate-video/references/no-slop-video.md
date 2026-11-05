# Keeping the video from looking AI-made

A video can carry every tell a generated web page has. Motion adds its own. This file applies `jmr-unslop` to video. Its full list is `<skill-dir>/../jmr-unslop/references/signs.md`. Read that too when it is installed. If it is missing, install it with `npx skills add jmrsquared/skills --skill jmr-unslop -g` or work from this file alone.

Brag still directs story and pacing. This file decides what the frames may look like.

## 1. Write the direction first

Before the storyboard, put five lines at the top of `brag-plan.md`. Derive them from the product, never from what is trending.

- **Product.** What it does and for whom, in one plain sentence.
- **Character.** Two or three concrete words of your own about how the product looks and behaves. Clean, modern, sleek, minimal and premium are not allowed, because they describe every template. Character sets the picture. It does not change how sentences are written (`brag-overrides.md` section 6).
- **World.** The place or material the product belongs to. It sets the tint of the ground, the accent and the visuals.
- **Moments.** One or two shots that get rich colour, material and detail, taken from what the product shows. Everything else stays quiet.
- **Signature.** One small detail only this product would have, used consistently. One, not five.

A real brand's logo, colours and fonts stay, unless they are slop themselves. Do not reuse the look of the last video this skill made. A near-black ground with one orange accent is a template, not a direction.

## 2. Frames: what to remove

| Sign | Do this instead |
|---|---|
| Purple to blue gradients, gradient text | One tinted ground and solid text |
| Coloured glows on badges, buttons, logos or text | Depth from surface steps and hairlines |
| Radial colour washes, blurred blobs, floating orbs, grids behind the content | A plain ground or the real product |
| Glass cards, neon borders | A plain raised surface with a faint hairline |
| Headings at weight 700-900 | Weight 400-600 and size for hierarchy. Go heavy only when the brand does or the tone is loud |
| One line of every headline in the accent colour | Solid ink. One accent, once or twice in a shot, where it means something |
| Small uppercase labels with wide tracking | Sentence case, or nothing |
| Emoji, sparkles, `New` and `Beta` badges | A plain line icon, or nothing |
| Three equal cards in a row | One large thing with quiet details beside it |
| Everything stacked and centred on every shot | Vary it: asymmetric splits, text beside a large product view, tight crops |
| Fake stat counters, star ratings, "Trusted by 10,000+" | Real figures from the brief, or leave them out |
| Mismatched number formats | One format, tabular figures |

## 3. Motion: what to remove

Video makes these worse, because the viewer cannot look away.

| Sign | Do this instead |
|---|---|
| Everything flying in from different directions | One entrance per shot: a short rise with a small stagger |
| Bouncy overshoot on text and cards | One ease-out family. A little overshoot only on a physical object landing |
| Full-frame colour flashes on every cut | Plain cuts. At most one soft flash, on the biggest hit |
| Glitch, RGB split, screen shake and VHS overlays | Only when the tone is `chaotic` or the world is literally that |
| Pulsing, breathing and shimmering loops on things that are not live | Still |
| The same transition on every cut | Two or three kinds, each with a cause on screen |
| Slow push on a flat screenshot | Rebuild the piece in code and let it act |
| Kinetic type on every line | Reserve it for the hook and the claim |

## 4. Motion: what works

The `jmr-unslop` story video went viral on these. They apply to any product demo:

- **Nothing is swapped, everything morphs.** One screen stays on stage and its values tween in place, so the spacing opens up or the number climbs. A morph reads as the product working. A cut reads as a slideshow.
- **A wave.** Elements start a few dozen milliseconds apart, from the top left down, so a change runs across the screen.
- **Text rolls.** Changing words blur out and the new ones rise in letter by letter. Use this at most eight times in a film.
- **Close crops.** Crop tight on the part that changes, so it reads on a phone. Never show a small window in the middle of an empty frame.
- **Before and after.** If the product fixes something, show the problem marked in place first, then let it resolve on the same screen.

## 5. Visuals

- Show something true: the real product, one moment that proves the claim, or one concrete subject from the world.
- Write a generated scene as one plain sentence first. If it takes two, it is not clear yet. `jmr-unslop`'s `references/visuals.md` has the styles that work.
- No glossy blobs, chrome liquid, nebulas, floating cubes, neon circuits, holograms, glowing brains, robots or rockets, unless the product is literally about them.
- No text, fake buttons or fake logos baked into an image. Type is set in the composition.
- The logo is the product's name plus a flat mark if it has one. Never redraw a real logo.

## 6. Words

This covers on-screen text and the voiceover script. `jmr-plain-language` governs all of it. `brag-overrides.md` section 6 is the gate.

- Say what the product does for whom, using its own nouns, in sentences a person would say out loud.
- No slogans, clipped fragments, catchphrases or refrains. A heading is a plain label or a whole sentence.
- No hype words: supercharge, seamless, unlock, magic, revolutionize, game-changing, `AI-powered` on everything.
- No exclamation marks. On-screen headlines and labels have no trailing period.
- No claims that cannot be checked. Do not invent features, figures or customers. Demo data looks real and names nobody real.

## 7. Check before you render

```bash
"$SCRIPT" slop <out>/composition
```

It scans the composition for signs a search can catch. Exit 1 means fix each hit, or say in one line why the brand or tone calls for it. It cannot judge taste, so then open stills from every scene and go through sections 2 and 3 by eye.

Finish with the **swap test:** put another product's name on the storyboard. If the film still fits, push the direction harder in the visuals and the words.
