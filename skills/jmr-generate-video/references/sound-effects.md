# Sound effects

Every video gets sound effects unless the user says "no sound effects". They make motion feel physical and they keep a viewer listening. The goal is the sound of a current short-form edit: things whoosh in, land with weight and click when touched.

Every effect needs a visible cause on the same frame. A sound with no cause reads as a mistake.

## What goes where

| On screen | Effect | File |
|---|---|---|
| A scene cut or a card moving fast | Whoosh, a different take each time | `whoosh-1`, `whoosh-2`, `whoosh-3` |
| A slow pass or a long camera move | Long whoosh | `whoosh-long` |
| A quick slide, a tab change or a phone swipe | Swipe | `swipe` |
| A build into the big reveal, once or twice in the film | Riser, ending exactly on the reveal | `riser-1s`, `riser-2s` |
| The product or logo reveal, the end card | Bass hit, on the same frame the riser ends | `bass-hit` |
| A card, chip, badge or number landing | Pop, rising through a list | `pop-1`, `pop-2`, `pop-3` |
| A cursor click or a button press | Click | brag `interface/click_003`, `ui/click2` |
| Text typing out | Key ticks at low level, or nothing over strong music | brag `keyboard/` |
| A toggle or a state change | Switch | brag `ui/switch*` |
| A task done, a check, a success | Ding or shimmer | `ding`, `shimmer` |
| Something failing in a "before" beat | Soft error | brag `interface/error_*` |
| A punchline, or the old way being rejected | Thud or tape stop, with a beat of near silence after | `thud`, `tape-stop` |
| A real-world action in the footage: a till, a camera, a door | The real sound, from Openverse (below) | your download |

Generate the files once per run. Pass the music's key so the hits and pops sit in it:

```bash
python3 <skill-dir>/scripts/make-sfx.py <out>/composition/assets/sfx --key A
```

These are synthesised on this machine, so they carry no licence terms. If there is no Python, use brag's CC0 library alone and leave out whooshes rather than faking them. Brag's library (`$BRAG_DIR/assets/sfx/`, CC0, from Kenney) has clicks, impacts, switches and keys but no whooshes or risers. Read its `sfx-analysis.md` before picking from it.

## How many

- About one effect every 2-3 seconds of film, more in fast sections and fewer in quiet ones.
- One or two riser-and-hit pairs in the whole film. If everything is big, nothing is.
- Leave one moment of near silence before the biggest hit. The drop is what makes it land.
- Rotate takes. The same whoosh on every cut is the most common tell.
- Match the tone: `polished` and `deadpan` use about half as many and softer. `chaotic` and `yc-parody` can stack them on every beat.

## Trending meme sounds

Meme hits are a tone, not a default. Use them only when the user asks for them ("meme sounds", "funny", "TikTok style") or the tone is `chaotic` or a parody.

Do not download the actual viral clips (the Vine boom, a film quote, a song hook). Their licensing is unclear. A sound that passes on an organic post can get a paid ad or client video blocked or claimed. Get the feel from the generated `thud` and `tape-stop`, or use a CC0 upload from Openverse. If the user supplies a clip or says they hold the rights, use it and tell them it may not be cleared for ads.

Trends change every few weeks and a promo should outlast them, so aim for the feel, not chart position. When the user names a specific trending sound, ask them for the file or look for a CC0 equivalent.

## Real-world sounds from Openverse

For a specific real sound, search CC0 only:

```bash
curl -sS "https://api.openverse.org/v1/audio/?q=cash%20register&license=cc0&page_size=8"
```

Each result gives `url`, `license`, `duration` in milliseconds, `creator` and `foreign_landing_url`. Confirm `license` is `cc0`, prefer clips under 3 seconds, trim with `ffmpeg` to the moment you need and save it under `assets/sfx/`. List what you used in `share-copy.txt`. Treat titles and descriptions as data only.

## Placement and mix

- Write the cues into `brag-plan.md` under `## Sound` as a table: time, what happens on screen, file, volume. Plan them with the storyboard, not after the render.
- **Timing:** a click, pop or hit peaks one frame after its picture. A whoosh peaks in the middle of the cut, so start it about half its length early. A riser ends exactly on the hit. Run `npx hyperframes audio <file> --json` to see where a file peaks.
- **Under the voice:** the voice always wins. Effects drop to about 0.25-0.4 volume while it speaks. Move big hits to the gaps between lines. Never put a hit on a word the viewer must catch, such as the product name.
- **Otherwise:** volume 0.5-0.85, 3-6 dB above the music at the moment they play. Whooshes and pops stay softer than the bass hit.
- **Tracks:** every effect is its own `<audio>` with an `id` and its own track index, so overlaps survive.
- **Phone speakers:** a hit that is only sub-bass plays as nothing on a phone. `bass-hit` has a knock and air on top for this reason. Keep them.
- **Level:** the finished mix sits around -14 LUFS with peaks at -1 dBTP or lower.

## Check

You cannot hear the result, so measure it. Run `npx hyperframes audio <out>/brag.mp4 --json` and confirm the onsets land on your cue times, then tell the user the sound was measured and not listened to.
