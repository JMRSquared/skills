# Overrides on top of brag

brag directs the video. These rules change only seven things: where its output goes, what it reads when the input is not code or a website, the voiceover (with the length and captions it brings), sound effects, the AI look, concept mode and the words. Where this file is silent, brag wins. That covers every rule on hook, pacing, energy, music and sound. `references/no-slop-video.md` overrides brag and its tone presets on how frames and motion may look. A loud tone relaxes only what that file says it does. Section 6 overrides brag and every tone preset on how the words are written. No tone relaxes it.

The voiceover rides on brag's cut. A narrated video that slows down to fit its voice (long holds, slow pans over one screenshot, a scene per sentence) comes out as a slideshow, which is the failure this file exists to prevent.

## 1. Invocation and output

- Follow brag's invocation dispatch as written, including its model check, but never pass `--voice` (this skill adds the voice in section 3) and never add `--full` unless the user asked for it. On Opus 5.5 that runs brag-slim.
- `<output-dir>` is `<out>` (`video-output-<timestamp>/`), not `brag-output/`. brag-slim's `work/` folder goes inside `<out>`.

## 2. Input that is not a project or a website

When step 2 of SKILL.md built `<out>/context.md`:

- "The project" is `<out>/context.md` plus `<out>/context/`. Answer brag's planning questions from it (full brag: the 9-question rubric in `step-1-inspect.md`; brag-slim: the questions at the end of its section 1).
- "Show the thing" means the real images, photos, screenshots and PDF visuals in `<out>/context/`, cropped or framed for the format, never a whole PDF page shrunk into the frame. Build them into live, moving scenes (layered, revealed piece by piece, with simulated taps and highlights), not static slides.
- For a business with no app, "the product in use" is the customer's path: discover → see what you get → trust signal → how to buy or book.
- The outro carries the exact website, phone or handle from `context.md`.

## 3. Voiceover, length and captions (on by default)

Skip this section when the user said "no voice"; brag's own length and timing then stand.

**Length.** There is no fixed limit. Aim for 45-90 s: tell every feature, flow or proof the project has that a viewer would care about. The user's length wins when they give one. This replaces brag's 15-25 s window, while every other brag law stays. Length comes from more beats, each putting something new on screen. Never stretch a beat to fit a sentence: say less in a whole sentence, or split the beat. Never clip a sentence into a fragment to fit. If the project only has material for 30 s, make a tight 30 s rather than padding it.

**Script.** Write it in `<out>/voiceover.txt`, one line per storyboard beat, while planning, so the storyboard and the voice are made together. Put a copy in `brag-plan.md` under `## Voiceover` if brag's plan needs it. Pass it through section 6 before you generate any clip:

- The hook line starts within 0.3 s of the first frame. Ordinary sentences a person would say out loud; active verbs; second person; the project's own words. Kokoro has no emotion setting, so energy comes from the facts you pick and the pace of the cut.
- The voice adds what the picture cannot say on its own. It never reads on-screen text word for word.
- Budget about 2.8 words per second at speed 1.0. A beat's line ends before the cut out of that beat.
- Say names, URLs and commands the way a person would ("jmr squared standards", "github dot com slash ...").
- The outro line names the call to action shown on screen.

**Clips.** One clip per line with the chosen voice:

```bash
mkdir -p <out>/composition/assets/vo
npx hyperframes tts "<line>" --voice af_heart --speed 1.0 --output <out>/composition/assets/vo/vo-01.wav </dev/null
```

Measure each with `ffprobe -v error -show_entries format=duration -of csv=p=0 <clip>`, then set beat lengths from brag's plan and the clips together: a beat lasts its clip plus about 0.3 s, or brag's planned length if that is longer. Transcribe each clip (`npx hyperframes transcribe <clip> -d <out>/qa -m base.en`) and regenerate any that dropped words. Keep speed between 0.95 and 1.1.

| Ask | Voice id |
|---|---|
| female (default) | `af_heart` |
| female, alternative | `af_nova`, `af_sky` |
| female, British | `bf_emma`, `bf_isabella` |
| male | `am_michael` |
| male, alternative | `am_adam` |
| male, British | `bm_george` |
| Spanish / French / Japanese / Chinese | `ef_dora` / `ff_siwis` / `jf_alpha` / `zf_xiaobei` |

**Mix.** Each clip is its own `<audio>` with an `id`, on the voice track at its beat's start. The music ducks to about 0.15 of its level while the voice speaks and comes back up between lines and under the end card; effects stay, a little lower. The voice is the loudest thing in the mix.

**Captions** (on for vertical and square, off for landscape unless asked): built from the script and the clip timings, one short phrase at a time, at most two lines, in the brand's text face, placed in the lower third clear of the UI being shown. The words light up as they are spoken when the transcript has word timings.

**Vertical framing.** The canvas is 1080x1920. Keep text and faces out of the top 12% and bottom 18%, where apps draw their own UI. Rebuild product UI to fill the width at phone-readable size (text at least 28 px); never shrink a landscape layout into the middle of a tall frame.

## 4. Sound effects (on by default)

Read `references/sound-effects.md` and follow it, on brag-slim and full brag alike. It adds to brag's guidance in `audio.md`: use brag's CC0 library for clicks, impacts and keys. Use `scripts/make-sfx.py` for the whooshes, risers and hits brag lacks. Brag's `--no-sfx` applies when the user says "no sound effects". The density in that file replaces brag's "3-5 SFX" count, which was written for a 20-second film.

## 5. Concept mode (no product yet)

Applies when SKILL.md step 0 chose concept mode.

**What "show the thing" means here.** The thing is the idea, visible in every scene, never just text on a gradient. Build visuals in the composition itself:

- **Kinetic typography** for the hook and the one-line idea.
- **Concept UI** built in HTML/CSS when the idea is an app or a site: one screen per step of how it works, on-brand, with believable placeholder data that names nobody real. Animate it in use: taps, typing, results appearing.
- **Diagrams and flows**: the steps as icons joined by an animated path, or a before/after split.
- **Illustrated scenes** from simple shapes and icons for physical products, services and events.
- **Stock photography** only when a real-world scene carries the message better. Use the `jmr-image` skill when it is installed with an Unsplash or Pexels key, save into `<out>/context/images/` and credit the photographers in `share-copy.txt`. Never use photos of real, identifiable brands or of people presented as customers.

**Words.** Present tense, as if the product exists. Prelaunch framing ("coming soon", "join the waitlist", "imagine") only when the user asks for it. Banned in both framings unless the user supplied them: user counts, ratings, reviews, testimonials, "trusted by", press logos, prices, launch dates, store links, "download now" or a URL that does not exist. With no link given, the outro is an invitation that needs none.

## 6. Words

Every voiceover line, on-screen line, caption and share post follows `jmr-plain-language`, on brag-slim and full brag alike. Read the "Websites, videos and other published content" section of `<skill-dir>/../jmr-plain-language/references/surfaces.md`. If that skill is missing, install it with `npx skills add jmrsquared/skills --skill jmr-plain-language -g`.

**What this changes in brag.** These words in brag and its tone presets set energy and pacing. They are never a licence for slogans:

| brag says | Do this |
|---|---|
| Hook | Say the problem or what the product does, as a plain sentence |
| Punchline, the final line, how it lands | The last thing a viewer needs: what it is and how to get it |
| Tagline | Use the product's real tagline if it has one. Never invent one |
| Punchy share copy | One or two plain sentences saying what it does and where to find it |
| `cinematic`: short declarative sentences. `chaotic`: short words, one word per beat. `deadpan`: minimal | Keep the cut, the type and the energy of the tone. Each line is still a whole, ordinary sentence |

Do not build a film around a one-line rule or a catchphrase. Do not bring a line back at the end as a refrain. When a project has a principle worth explaining, explain it in a normal sentence.

**The gate.** Run the read-through from `surfaces.md` on `<out>/voiceover.txt` and on the storyboard's on-screen text before you generate a clip, then run:

```bash
node <skill-dir>/../jmr-plain-language/scripts/check-copy.mjs <out>/voiceover.txt
```

Fixing a line after this point means regenerating its clip. Before you deliver, run the whole check, which covers the composition, the voiceover and the share copy:

```bash
"$SCRIPT" words <out>
```

Exit 1 means rewrite each hit, then regenerate any clip and caption that changed. Text set from JavaScript at runtime is not in the HTML this check reads, so read it by eye. Put wording the client wrote or the user asked for word for word in `<out>/plain-language-allow.txt`, one phrase per line. Tell the user what you listed. If the user asks for a slogan, write it and list it there.
