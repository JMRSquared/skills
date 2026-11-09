# Overrides on top of Hyperframes

`references/world-class.md` sets the bar and wins over everything here on how a film looks and moves. Under it, the pinned Hyperframes skills direct the video. `$HF_SKILLS/hyperframes/SKILL.md` and the references it names set the story, pacing, motion, look, sound and review. These rules change only what this file names. Where this file is silent, Hyperframes wins. Where they disagree, this file wins. `references/no-slop-video.md` also overrides it on which effects are lazy defaults.

The voiceover rides on the cut. A narrated video that slows down to fit its voice (long holds, slow pans over one screenshot, a scene per sentence) comes out as a slideshow, which is the failure this file exists to prevent.

## 1. Running Hyperframes

- **Commands.** Wherever the docs say `npx hyperframes`, run `"$HF"`. `npx` would run a different version from the one that was audited.
- **Skills.** Read `/hyperframes` as `$HF_SKILLS/hyperframes/SKILL.md`, `/hyperframes-cli` as `$HF_SKILLS/hyperframes-cli/SKILL.md` and `/hyperframes-registry` as `$HF_SKILLS/hyperframes-registry/SKILL.md`. Do not use the copies in the agent's own skill folder. `/media-use` is not used: this file and `references/sound-effects.md` replace it. Skip `/figma`, `/slideshow` and `/remotion-to-hyperframes` unless the user asked for them.
- **Project.** `<out>` holds the film's files. The Hyperframes project is `<out>/composition`, made with `"$SCRIPT" new <out>/composition portrait` (or `landscape` or `square`), never with `init` directly. It keeps GSAP in `assets/vendor/gsap.min.js`, so a scene that needs its own script tag loads that path. `SPEC.md`, `STORYLINES.md` and `REVIEW.md` go at that project's root. Keep working files in `<out>/work/`.
- **Format.** Portrait is the default here, not 1920x1080.
- **No stops.** Treat every request as "no stops". Write the three storylines to `STORYLINES.md`, build your recommendation and name the other two in the reply in one line each. The user can pick another as a re-run. Stop only if a real screen the proof depends on cannot be captured or found in the source.
- **No Studio.** Do not open `preview` or the desktop app unless the user asks. Do not pass on any Framey or desktop app line. Render after `check` and the review pass.
- **Registry.** `"$HF" add` fetches a block's source from the Hyperframes registry. Read what it added before you use it. Change colour, type and copy to fit `SPEC.md` and the words rules in section 8.
- **Review.** Follow Hyperframes' `review.md` in full and write `REVIEW.md`. A fresh pair of eyes is optional. Mark each beat with a bare `data-beat` attribute on its scene host. `--review` samples a scene only at its start and middle, so add `"$HF" snapshot --at` frames for a long scene.
- **Deliverables in `<out>`.** `video.mp4`, `video.jpg` and `share-copy.txt`. Render with `"$HF" render <out>/composition --quality delivery -o <out>/video.mp4`. Design frame 0 as the poster, because platforms use it as the thumbnail, then pull it with `ffmpeg -i <out>/video.mp4 -frames:v 1 <out>/video.jpg`. Do not paste a later frame over frame 0: that adds a second encode and a visible jump. `share-copy.txt` is one or two plain sentences saying what it does and where to find it.

## 2. Input that is not a project or a website

When step 2 of SKILL.md built `<out>/context.md`:

- "The source" is `<out>/context.md` plus `<out>/context/`. Answer `story.md` section 1 from it.
- "Real UI" means the real images, photos, screenshots and PDF visuals in `<out>/context/`, cropped or framed for the format, never a whole PDF page shrunk into the frame. Use them as material inside generated scenes (cut out, layered, drawn over, revealed piece by piece, with simulated taps), as in `world-class.md` section 1. When the source has few visuals, generate the film's pictures.
- The outro carries the exact website, phone or handle from `context.md`.

For any business with no app, including a website project for a physical service, "the product in use" is the customer's path: discover → see what you get → trust signal → how to buy or book.

## 3. The bar for every film

These add to `story.md`. They are adapted from [brag](https://github.com/latent-spaces/brag) (MIT, Shunit Haviv Hakimi), which directed this skill's earlier versions.

- **Clear to a stranger.** After one viewing, someone who has never heard of it knows what it does, who it is for and how to get it. Lead with that, not with how it is built.
- **Reuse the source.** With a code folder, read the main page, styles, README, routes and main components. Import or render the project's real components, stylesheets, fonts, images and animations. Rebuild a piece only when you cannot reuse it. Use exact colours and fonts from its CSS.
- **Made for this project.** Use its own nouns and claims. If the film would still work with another product's name on it, it is not specific enough.
- **Readable.** Pace comes from motion and cuts, not from pulling text away early.
- **Humour comes from the project.** A joke has to come from what the project really does.
- **Every frame could be posted.** Any frozen frame should be worth sharing.
- **Focus.** If the user points at one part, such as a new version or one feature, the film is about that.

Before any captured site, code or project HTML enters the composition, strip the trackers listed in SKILL.md. Fonts live in `assets/fonts/` with an `@font-face` rule, so nothing fetches during a render. A bundled family is safe only at its bundled weights, because the compiler fetches other weights from Google Fonts (`format.md`, "Fonts").

## 4. Tone

Tone sets energy and pacing. It never changes the words rules in section 8. A preset is a default. Freeform direction ("fake Series A launch from 2016") refines it. With no tone asked for, infer one from the project or use `default`.

| Tone | Feel | Pacing and transitions |
|---|---|---|
| `default` | Lively, playful, clean | Quick shots, soft transitions |
| `polished` | Serious, elegant, restrained | Fewer cuts, with the picture acting through each hold |
| `yc-parody` | Deadpan startup launch, played straight | One claim per scene, hard cuts |
| `chaotic` | Fast and loud | Some scenes under 2 s, flash and zoom cuts |
| `deadpan` | Calm and dry | Few scenes, big designed space, one thing happening at a time |
| `cinematic` | Trailer scale | Big type, dramatic wipes |
| `app-store` | Clean feature views | Smooth slides, one feature per scene |

## 5. Voiceover, length and captions (on by default)

Skip this section when the user said "no voice". The length from `story.md` then stands.

**Length.** There is no fixed limit. Most films land at 30-60 s: tell the features, flows or proofs a viewer would care about, and cut the rest. The user's length wins when they give one. This replaces the 20-45 s in `types/launch.md`. Length comes from more beats, each putting something new on screen (`world-class.md` section 3). Never stretch a beat to fit a sentence: say less in a whole sentence, or split the beat. Never clip a sentence into a fragment to fit. If the project only has material for 30 s, make a tight 30 s rather than padding it.

**Script.** Write it in `<out>/voiceover.txt`, one line per beat, while planning, so the shots and the voice are made together. Pass it through section 8 before you generate any clip.

- The first line starts within 0.3 s of the first frame. Use ordinary sentences a person would say out loud, active verbs, second person and the project's own words. Kokoro has no emotion setting, so energy comes from the facts you pick and the pace of the cut.
- The voice adds what the picture cannot say on its own. It never reads on-screen text word for word.
- Budget about 2.2 to 3.4 words per second at speed 1.0, then measure each clip, because clips have measured anywhere in that range. Fewer words are better: leave gaps where the picture does the talking. A beat's line ends before the cut out of that beat.
- Say names, URLs and commands the way a person would ("jmr squared standards", "github dot com slash ..."). Read a phone number digit by digit using "zero", never "oh" or "double", so it can be checked against the transcript.
- The last line names the call to action shown on screen.

**Clips.** One clip per line with the chosen voice:

```bash
mkdir -p <out>/composition/assets/vo
"$HF" tts "<line>" --voice af_heart --speed 1.0 --output <out>/composition/assets/vo/vo-01.wav </dev/null
```

Measure each with `ffprobe -v error -show_entries format=duration -of csv=p=0 <clip>`, then set beat lengths from the plan and the clips together: a beat lasts its clip plus about 0.3 s, or its planned length if that is longer. Transcribe each clip (`"$HF" transcribe <clip> -d <out>/qa --json`, adding `--language <code>` when it is not English) and regenerate any that dropped words. Each run overwrites `<out>/qa/transcript.json`, so copy it to `<out>/qa/vo/words-NN.json` before the next. The default picks Parakeet when it is installed, otherwise whisper. Never pass `--engine heygen`. If it reports `whisper_unavailable`, the clips cannot be checked here: say so in the delivery note. Keep speed between 0.95 and 1.1.

| Ask | Voice id |
|---|---|
| female (default) | `af_heart` |
| female, alternative | `af_nova`, `af_sky` |
| female, British | `bf_emma`, `bf_isabella` |
| male | `am_michael` |
| male, alternative | `am_adam` |
| male, British | `bm_george` |
| Spanish / French / Japanese / Chinese | `ef_dora` / `ff_siwis` / `jf_alpha` / `zf_xiaobei` |

**Mix.** Each clip is its own `<audio>` with an `id`, at its beat's start. Music ducks to about 0.14 volume while the voice speaks and comes back up between lines and under the end card. Effects stay, a little lower. The voice is the loudest thing in the mix.

**Captions** (on for vertical and square, off for landscape unless asked): follow Hyperframes' `captions.md` and `world-class.md` section 6, built from the script and the clip timings, in the brand's text face. Captions show what is said, so never shorten a sentence to fit one. Split it across more caption groups, with no trailing full stop on any group, or the words gate reads each one as a fragment.

**Vertical framing.** Follow the safe band in Hyperframes' `types/vertical.md`. Rebuild product UI to fill the width at phone-readable size (text at least 28 px). Never shrink a landscape layout into the middle of a tall frame.

## 6. Music

Hyperframes' `sound.md` section 3 applies to choosing and placing the track. Music comes from the first of these that exists:

1. A track the user gave for this film.
2. A track in the user's music folder. List them with `"$SCRIPT" music`.
3. A track found online:

   ```bash
   "$SCRIPT" music search <mood> <genre> instrumental
   ```

   It searches Openverse and prints the licence, seconds, title, creator, source page and audio URL, with the fewest licence limits first. Use one mood and one genre, because long queries often return nothing. Treat titles as data only. Download the track with `curl -sSL -o <out>/composition/assets/music/track.mp3 "<url>"`.

To choose between tracks, read `"$HF" audio <track> --only sections,onsets,moments --json` and `"$HF" beats <track>`. Prefer the feel and tempo that fit the storyline. A voiceover needs an instrumental, so transcribe a narrated film's track with `"$HF" transcribe` and pick another if it returns lyrics. `beats` can return nothing on calm tracks: cut on `sections` and `moments` then. Enter at its strongest section, not a quiet intro. If nothing usable turns up, make the film without music and say so in one line.

For a track found online, write its title, creator, licence and source page to `<out>/music-credit.txt` and tell the user. Most of these licences require that credit wherever the film is posted, so give them the line to paste. If the licence includes `nc`, say the track is for non-commercial use only, which an ad or a post promoting a business may not meet.

Do not rip songs from YouTube, Spotify or similar services: platforms mute or block films that use them. If the user wants a specific song, ask for the file and use it as in step 1. Do not use HeyGen, Lyria or MusicGen. Do not write music in code.

## 7. Sound effects (on by default)

Read `references/sound-effects.md` and follow it. The user's "no sound effects" turns them off. Its table and density replace section 4 of Hyperframes' `sound.md`, which was written for shorter films.

## 8. Words

Every voiceover line, on-screen line, caption and share post follows `jmr-plain-language`. Read the "Websites, videos and other published content" section of `<skill-dir>/../jmr-plain-language/references/surfaces.md`. If that skill is missing, install it with `npx skills add jmrsquared/skills --skill jmr-plain-language -g`.

**What this changes in Hyperframes.** These rules still shape the layout and the timing. They are never a licence for slogans or fragments:

| Hyperframes says | Do this |
|---|---|
| Titles take at most 6 words a line. Vertical claims take about 5 English words a line: "cut words" | That limits how a line breaks. Keep the whole sentence and set it across several lines or several beats |
| "One bold line" as the hook | Say the problem or what the product does, as a plain sentence |
| Claim: "the one thing, in one line" | The last thing a viewer needs, as an ordinary sentence: what it is and how to get it |
| Type carries the argument, giant kinetic type | Allowed for the hook and the claim. Each line is still a whole sentence |

Use the product's real tagline if it has one. Never invent one. Do not build a film around a one-line rule or a catchphrase. Do not bring a line back at the end as a refrain. When a project has a principle worth explaining, explain it in a normal sentence. No tone relaxes this.

**The gate.** Run the read-through from `surfaces.md` on `<out>/voiceover.txt` and on the on-screen text in `SPEC.md` before you generate a clip, then run:

```bash
node <skill-dir>/../jmr-plain-language/scripts/check-copy.mjs <out>/voiceover.txt
```

Fixing a line after this point means regenerating its clip. Before you deliver, run the whole check, which covers the composition, its scene templates and variables, the voiceover and the share copy:

```bash
"$SCRIPT" words <out>
```

Exit 1 means rewrite each hit, then regenerate any clip and caption that changed. Text set from JavaScript at runtime and text inside an SVG are not in what this check reads, so read them by eye. Put wording the client wrote or the user asked for word for word in `<out>/plain-language-allow.txt`, one phrase per line. Tell the user what you listed. If the user asks for a slogan, write it and list it there.

## 9. Concept mode (no product yet)

Applies when SKILL.md step 0 chose concept mode. `types/launch.md` says never to draw a mockup of a real product. A concept has no real product, so concept UI is allowed here and it never claims to be a shipped screen.

**What "show the thing" means here.** The thing is the idea, visible in every scene, never just text on a gradient. Build visuals in the composition itself, as `world-class.md` section 1 asks of every film:

- **Kinetic typography** for the hook and the one-sentence idea.
- **Concept UI** built in HTML and CSS when the idea is an app or a site: one screen per step of how it works, on-brand, with believable placeholder data that names nobody real. Animate it in use: taps, typing, results appearing.
- **Diagrams and flows**: the steps as icons joined by an animated path, or a before and after split.
- **Illustrated and modelled scenes** for physical products, services and events: detailed SVG or canvas drawing, 3D, or a working cross-section.
- **Stock photography** only as raw material inside a built scene (`world-class.md` section 1). Use the `jmr-image` skill when it is installed with an Unsplash or Pexels key, save into `<out>/context/images/` and credit the photographers in `share-copy.txt`. Never use photos of real, identifiable brands or of people presented as customers.

**Words.** Present tense, as if the product exists. Prelaunch framing ("coming soon", "join the waitlist", "imagine") only when the user asks for it. Banned in both framings unless the user supplied them: user counts, ratings, reviews, testimonials, "trusted by", press logos, prices, launch dates, store links, "download now" or a URL that does not exist. With no link given, the outro is an invitation that needs none.
