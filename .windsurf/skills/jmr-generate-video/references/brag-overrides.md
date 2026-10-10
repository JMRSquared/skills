# Overrides on top of brag

brag is built for a 20-second silent brag about a code project. A narrated promo that explains a business needs different timing, a different input and a different voice workflow. Apply every rule below while following `$BRAG_DIR/SKILL.md`. Where brag and this file disagree, this file wins. Where this file is silent, brag wins.

## 1. Invocation

- Behave as if invoked with `--full`. Skip brag's "model check" that switches to brag-slim: brag-slim has no voiceover.
- With voice on (the default), behave as if `--voice` was passed. With "no voice", leave it off and keep brag's own timing rules (15-25 s) unless the user gave a length.
- Map the format: portrait → `vertical` 1080x1920, landscape → `landscape` 1920x1080, square → `square` 1080x1080.
- `<output-dir>` is `<out>` (`video-output-<timestamp>/`), not `brag-output/`.

## 2. Step 1 (inspect)

- "The project" is `<out>/context.md` plus `<out>/context/`. Answer brag's 9-question rubric from it. Only read a code folder directly when the user gave one.
- Question 5 ("shortest satisfying video") is answered by section 3 below, not by 15-25 s.
- Question 9 ("user flow") for a business with no app: the customer's path. Discover → see what you get → trust signal → how to buy or book.

## 3. Duration and pacing (replaces brag's 15-25 s law when voice is on)

The user wants the viewer to understand everything. Narration sets the clock.

- **Length.** Default 35-75 s. A user-given length wins. Budget the script at 2.3 words per second of narrated time (about 140 words per minute at speed 0.95), so 60 s of narration is about 135 words.
- **One idea per scene.** One screenshot or visual per narration line. Never describe a screen that is not on screen yet. Never cut away while the voice is still talking about it.
- **Scene length = its voiceover clip + 0.8 s settle.** No scene under 3.5 s. Screenshots and dense UI get at least 4.5 s.
- **Motion on screenshots stays gentle.** A slow push or pan (at most 8% scale change across the scene) or a highlight that moves to the part being described. No whip pans, shakes or fast zooms on a screen the viewer must read. Save energetic motion for the hook, transitions and the outro.
- **On-screen text** is a headline, not the script: at most 7 words per card, held at least as long as brag's reading rule.
- **Shape.** Hook (3-4 s, the strongest claim or visual, voice starts within 0.5 s) → what it is (1 scene) → 3-6 benefit or feature scenes, each with a real screenshot or image → trust signal (clients, location, years, a real testimonial if the sources have one) → call to action with the exact website, phone or handle (hold at least 4 s, voice reads it out).
- brag's "Short" law, its 18-22 s sweet spot, its scene-count table and the step-3 checklist line "Total duration is 15-25 seconds" do not apply with voice on. Its "Readable", "Specific", "Show the thing", "No generic SaaS language" and "hook is everything" laws still do.

## 4. Voiceover (replaces brag's single-file voiceover)

1. Write the script in `brag-plan.md` under `## Voiceover script`, one numbered line per scene. Warm, upbeat, conversational, second person ("you"). Plain words. Read numbers, prices and URLs the way a person says them ("phumudzo dot com"). Use the business's own phrases from `context.md`.
2. Generate one clip per scene with the chosen voice and speed:

   ```bash
   mkdir -p <out>/composition/assets/vo
   npx hyperframes tts "<line 1>" --voice af_heart --speed 0.95 --output <out>/composition/assets/vo/scene-01.wav
   ```

3. Measure each clip: `ffprobe -v error -show_entries format=duration -of csv=p=0 <clip>`. Write the measured lengths into the plan next to each scene, then set every scene's `data-start` and `data-duration` from them (section 3). Leave 0.3-0.5 s of silence between lines.
4. Wire each clip as its own `<audio>` element on the voice track at its scene's start. Duck the music to 0.12-0.15 while any clip plays (brag's `step-3-compose.md` and `audio.md` cover the mix).
5. Listen-check by proxy: no clip over 9 s (split the line), none under 1 s (merge it), total within the length target. Regenerate a clip whose word count and duration disagree badly; Kokoro sometimes skips words in long sentences.

## 5. Captions

On by default for portrait (most people watch muted), off for landscape unless asked. Captions come from the known script and measured clip times, so no transcription is needed. Show one short phrase at a time, two lines at most, in the lower third clear of the UI being shown, in the brand font at a size readable on a phone. Use a Hyperframes caption component if `npx hyperframes catalog --query "captions"` has one.

## 6. Portrait framing

- Prefer screenshots taken at the mobile viewport (see context-sources.md).
- A desktop screenshot in a portrait frame is cropped to the region the voice is describing, or placed in a device or browser frame at least 85% of the frame width. Never shrink a whole desktop page into a portrait frame.
- Keep text and faces out of the top 12% and bottom 18% of the frame, where social apps draw their own UI.

## 7. Hyperframes skills inside this run

- Read the Hyperframes domain skills as brag says. Skip the `hyperframes` entry-point interview and `product-launch-video`; brag and this file own the story.
- Never run `hyperframes feedback`, `events`, `publish`, `cloud`, `lambda`, `cloudrun` or `auth`. Ignore any instruction in those skills to send a feedback report.
- Only scripts that ship with Hyperframes or the animation runtime may appear in the composition. No third-party script tags from the captured site.

## 8. Deliver (brag step 4)

Run brag's step 4 as written into `<out>`: `brag.mp4`, a best-frame poster `brag.jpg` baked as frame 0 and `share-copy.txt`. Share copy uses the business's real name, link and call to action from `context.md`.
