# Overrides on top of brag

brag directs the video. These rules change only where its output goes, what it reads when the input is not code or a website and two modes the user must ask for. Where this file is silent, brag wins. That covers every rule on length, pacing, hook, tone, motion, visuals, music and sound.

Do not add a voiceover, a longer length or slow pans over screenshots unless the user asks (section 3). Forced on every run, they turn brag's cut into a slow narrated slideshow.

## 1. Invocation and output

- Follow brag's invocation dispatch as written, including its model check. Do not add `--full` or `--voice` unless the user asked for them.
- `<output-dir>` is `<out>` (`video-output-<timestamp>/`), not `brag-output/`. brag-slim's `work/` folder goes inside `<out>`.

## 2. Input that is not a project or a website

When step 2 of SKILL.md built `<out>/context.md`:

- "The project" is `<out>/context.md` plus `<out>/context/`. Answer brag's planning questions from it (full brag: the 9-question rubric in `step-1-inspect.md`; brag-slim: the questions at the end of its section 1).
- "Show the thing" means the real images, photos, screenshots and PDF visuals in `<out>/context/`, cropped or framed for the format, never a whole PDF page shrunk into the frame. Build them into live, moving scenes (layered, revealed piece by piece, with simulated taps and highlights), not static slides.
- For a business with no app, "the product in use" is the customer's path: discover → see what you get → trust signal → how to buy or book.
- The outro carries the exact website, phone or handle from `context.md`.

## 3. Voice and explainer (only when the user asks)

**Voice on, no explainer.** Pass `--voice` to brag and let it write and time the narration inside its normal length. brag-slim has no voiceover, so with voice on brag's model check keeps the full workflow. Map voice requests to Kokoro ids:

| Ask | Voice id |
|---|---|
| female (default) | `af_heart` |
| female, alternative | `af_nova`, `af_sky` |
| female, British | `bf_emma`, `bf_isabella` |
| male (default) | `am_michael` |
| male, alternative | `am_adam` |
| male, British | `bm_george` |
| Spanish / French / Japanese / Chinese | `ef_dora` / `ff_siwis` / `jf_alpha` / `zf_xiaobei` |

Kokoro has no emotion setting: energy comes from the script (short lines, active verbs, a real hook). Keep speed between 0.9 and 1.05.

**Explainer** (the user asked to explain everything, walk through features, or gave a length over 30 s with a voice). This replaces brag's 15-25 s window only:

- Length is what the user gave, or 35-60 s. Budget about 2.6 words per second of speech.
- One idea per scene. Never cut away while the voice is still talking about what is on screen. A scene lasts at least as long as its line plus a short settle.
- Everything else stays brag's: the hook in the first 2 seconds, motion and cuts that keep the pace, real UI doing its job, music under the voice (ducked to about 0.12-0.15 while it speaks).
- Write one numbered voiceover line per scene in `brag-plan.md`, generate one clip per line (`npx hyperframes tts "<line>" --voice <id> --speed 0.95 --output <out>/composition/assets/vo/scene-01.wav </dev/null`), measure each with `ffprobe` and set scene timings from the measured lengths. Regenerate any clip whose transcript drops words.
- Captions are on for vertical, off for landscape unless asked: one short phrase at a time, in the lower third, clear of the UI being shown.
- Vertical framing: keep text and faces out of the top 12% and bottom 18% of the frame.

## 4. Concept mode (no product yet)

Applies when SKILL.md step 0 chose concept mode.

**What "show the thing" means here.** The thing is the idea, visible in every scene, never just text on a gradient. Build visuals in the composition itself:

- **Kinetic typography** for the hook and the one-line idea.
- **Concept UI** built in HTML/CSS when the idea is an app or a site: one screen per step of how it works, on-brand, with believable placeholder data that names nobody real. Animate it in use: taps, typing, results appearing.
- **Diagrams and flows**: the steps as icons joined by an animated path, or a before/after split.
- **Illustrated scenes** from simple shapes and icons for physical products, services and events.
- **Stock photography** only when a real-world scene carries the message better. Use the `jmr-image` skill when it is installed with an Unsplash or Pexels key, save into `<out>/context/images/` and credit the photographers in `share-copy.txt`. Never use photos of real, identifiable brands or of people presented as customers.

**Words.** Present tense, as if the product exists. Prelaunch framing ("coming soon", "join the waitlist", "imagine") only when the user asks for it. Banned in both framings unless the user supplied them: user counts, ratings, reviews, testimonials, "trusted by", press logos, prices, launch dates, store links, "download now" or a URL that does not exist. With no link given, the outro is an invitation that needs none.
