#!/usr/bin/env bash
# jmr-generate-video: install a pinned Hyperframes, audit its skills, keep the run local.
#
#   jmr-generate-video.sh setup [--no-voice]
#                                      install the pinned CLI, fetch + verify + audit its skills, disable
#                                      telemetry, build the local Kokoro voice env (skipped with --no-voice),
#                                      print export lines for eval
#   jmr-generate-video.sh env          print the export lines again (no fetch); use in each new shell
#   jmr-generate-video.sh audit [DIR]  re-run the audit on a Hyperframes skills checkout
#   jmr-generate-video.sh doctor       check node, ffmpeg, git, hyperframes, pdftoppm
#   jmr-generate-video.sh new DIR [portrait|landscape|square]
#                                      scaffold a Hyperframes project and hold it to the pin and local-only rules
#   jmr-generate-video.sh music        list the user's own music tracks
#   jmr-generate-video.sh music search WORDS
#                                      find full-length music on Openverse, fewest licence limits first
#   jmr-generate-video.sh probe FILE   print size, duration, bitrate and streams of a rendered video
#   jmr-generate-video.sh slop DIR     scan a composition for AI tells; exit 1 when any are found
#   jmr-generate-video.sh look FILE    measure a rendered film for still pictures, too few pictures and an empty lower frame,
#                                      and write cut and shot sheets to <film folder>/qa/look/ for review
#   jmr-generate-video.sh words OUT    check the film's words against jmr-plain-language and its caption breaks; exit 1 on any hit
#   jmr-generate-video.sh captions OUT check caption groups for broken phrases and split numbers
#   jmr-generate-video.sh series OUT [--series NAME]
#                                      compare SPEC.md's devices with the series' last films, then log this one
#   jmr-generate-video.sh deliver OUT  keep the render as master.mp4 and encode video.mp4 for social upload
#   jmr-generate-video.sh refs         fetch the text source of HeyGen's launch films to read, and print its folder
#   jmr-generate-video.sh cutout IN OUT.png
#                                      cut a real object out of a photo with a local general model
#
# Env:
#   HF_VERSION, HF_COMMIT  CLI version and matching commit to pin (default: the audited pair
#                          below). A different pair skips the baseline match, so the audit prints
#                          every hit for a human or agent to read before the run continues.
#   JMR_VIDEO_CACHE        cache root (default: ${XDG_CACHE_HOME:-~/.cache}/jmr-generate-video)
#   JMR_VIDEO_MUSIC        music folder (default: ${XDG_CONFIG_HOME:-~/.config}/jmr-generate-video/music)

set -euo pipefail

HF_REPO="https://github.com/heygen-com/hyperframes.git"
# Audited 2026-11-05. Bump only after reading the diff between the old and new
# tag and re-recording AUDIT_BASELINE with `audit <dir> --baseline`.
HF_PINNED_VERSION="0.9.16"
HF_PINNED_COMMIT="45705fa25c4aa7ba2cef3e8a66842ea08c261b9a"
AUDIT_BASELINE="d884032d1c6ebd41d1d2f1ce08e1c752455e076bd00b6b3e0ee7a405cad4502a"

HF_VERSION="${HF_VERSION:-$HF_PINNED_VERSION}"
HF_COMMIT="${HF_COMMIT:-$HF_PINNED_COMMIT}"
CACHE_ROOT="${JMR_VIDEO_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/jmr-generate-video}"
CLI_DIR="$CACHE_ROOT/hf-$HF_VERSION"
HF_BIN="$CLI_DIR/node_modules/.bin/hyperframes"
CHECKOUT="$CACHE_ROOT/hyperframes-$HF_COMMIT"
VOICE_VENV="$CACHE_ROOT/kokoro-venv"
MUSIC_DIR="${JMR_VIDEO_MUSIC:-${XDG_CONFIG_HOME:-$HOME/.config}/jmr-generate-video/music}"
REFS_REPO="https://github.com/heygen-com/hyperframes-launches.git"
REFS_COMMIT="d7ac35069d74a3a437780579b3b7fe2f3eeace5f"
REFS_DIR="$CACHE_ROOT/hyperframes-launches-$REFS_COMMIT"

# Only the docs the agent reads and the sound effects it copies are checked out.
# media-use's scripts stay out, so nothing can run its HeyGen or Gemini routes.
SKILL_DIRS=(skills/hyperframes skills/hyperframes-cli skills/hyperframes-registry skills/media-use)
SPARSE_DIRS=(skills/hyperframes skills/hyperframes-cli skills/hyperframes-registry skills/media-use/audio/assets/sfx)

# Telemetry and feedback opt-outs. Exported so every child call inherits them.
# The other HYPERFRAMES ones stop `init` refreshing skills past the pin and the CLI replacing itself.
export HYPERFRAMES_NO_TELEMETRY=1
export HYPERFRAMES_SKIP_SKILLS=1
export HYPERFRAMES_NO_UPDATE_CHECK=1
export HYPERFRAMES_NO_AUTO_INSTALL=1
export DO_NOT_TRACK=1
export NEXT_TELEMETRY_DISABLED=1

die() { echo "jmr-generate-video: $*" >&2; exit 1; }

# Patterns that mean "this text can reach the network, run code or track usage".
# Hits are expected (the docs describe cloud commands the run never uses), so the
# audit compares the full hit list against a recorded baseline. Any change is a
# new line to read before trusting the checkout.
AUDIT_PATTERN='telemetry|analytics|posthog|mixpanel|segment\.(io|com)|sentry|amplitude|beacon|gtag|google-analytics|curl |wget |Invoke-WebRequest|iwr |fetch\(|XMLHttpRequest|requests\.|urllib|socket|subprocess|os\.system|child_process|eval\(|exec\(|base64|rm -rf|sudo |\| *(ba|z)?sh|npx |npm (i|install)|pip install|uvx? |heygen|feedback|events|https?://'

audit_hits() {
  local dir="$1"
  (cd "$dir" && grep -rnIE "$AUDIT_PATTERN" "${SKILL_DIRS[@]}" 2>/dev/null || true) | LC_ALL=C sort
}

# Files that are neither text, media nor fonts. A binary or script type the
# pinned skills never shipped before is a reason to stop.
odd_files() {
  local dir="$1"
  (cd "$dir" && find "${SKILL_DIRS[@]}" -type f -print \
    | grep -vE '\.(md|json|mjs|html|css|txt|mp3|ogg|wav|jpg|jpeg|png|svg|woff2|ttf)$' \
    | grep -vE '/(LICENSE|\.gitignore|\.gitattributes)$' || true) | LC_ALL=C sort
}

hash_stdin() {
  if command -v shasum >/dev/null 2>&1; then shasum -a 256 | cut -d' ' -f1
  else sha256sum | cut -d' ' -f1; fi
}

cmd_audit() {
  local dir="${1:-$CHECKOUT}" mode="${2:-check}"
  [ -d "$dir/skills/hyperframes" ] || die "no Hyperframes checkout at $dir. Run: $0 setup"

  local hits odd fingerprint
  hits="$(audit_hits "$dir")"
  odd="$(odd_files "$dir")"
  fingerprint="$(printf '%s\n--\n%s\n' "$hits" "$odd" | hash_stdin)"

  if [ "$mode" = "--baseline" ]; then
    echo "$fingerprint"
    return 0
  fi

  if [ "$HF_COMMIT" = "$HF_PINNED_COMMIT" ] && [ "$fingerprint" = "$AUDIT_BASELINE" ]; then
    echo "audit: ok (matches the reviewed baseline for hyperframes $HF_PINNED_VERSION)" >&2
    return 0
  fi

  echo "audit: REVIEW NEEDED. The hit list differs from the reviewed baseline." >&2
  echo "Read every line below. Strip or skip anything that sends data off this machine," >&2
  echo "installs software, or runs a command you did not expect, then re-run." >&2
  echo "--- network / exec / tracking hits ---" >&2
  printf '%s\n' "$hits" >&2
  echo "--- unexpected file types ---" >&2
  printf '%s\n' "${odd:-(none)}" >&2
  return 2
}

fetch_skills() {
  [ -d "$CHECKOUT/.git" ] && return 0
  local tmp="$CHECKOUT.tmp.$$"
  rm -rf "$tmp"
  git init -q "$tmp"
  git -C "$tmp" remote add origin "$HF_REPO"
  git -C "$tmp" sparse-checkout set --cone "${SPARSE_DIRS[@]}"
  git -C "$tmp" fetch -q --depth 1 --filter=blob:none origin "$HF_COMMIT" \
    || { rm -rf "$tmp"; die "could not fetch $HF_COMMIT from $HF_REPO. Check the network or the commit."; }
  git -C "$tmp" -c advice.detachedHead=false checkout -q FETCH_HEAD
  mv "$tmp" "$CHECKOUT"
}

# Reading material only: nothing here runs and nothing is copied into a film. Large media
# stays out because Git LFS is skipped, and its media and fonts are not licensed for reuse.
cmd_refs() {
  command -v git >/dev/null 2>&1 || die "git is not installed. Install git and re-run."
  mkdir -p "$CACHE_ROOT"
  if [ ! -d "$REFS_DIR/.git" ]; then
    local tmp="$REFS_DIR.tmp.$$"
    rm -rf "$tmp"
    git init -q "$tmp"
    git -C "$tmp" remote add origin "$REFS_REPO"
    git -C "$tmp" fetch -q --depth 1 origin "$REFS_COMMIT" \
      || { rm -rf "$tmp"; die "could not fetch $REFS_COMMIT from $REFS_REPO. Check the network or work from the table in references/world-class.md."; }
    GIT_LFS_SKIP_SMUDGE=1 git -C "$tmp" -c advice.detachedHead=false -c filter.lfs.process= -c filter.lfs.smudge= -c filter.lfs.required=false checkout -q FETCH_HEAD
    mv "$tmp" "$REFS_DIR"
  fi
  echo "$REFS_DIR"
}

verify_skills() {
  local head
  head="$(git -C "$CHECKOUT" rev-parse HEAD)"
  case "$head" in
    "$HF_COMMIT"*) ;;
    *) die "checkout at $CHECKOUT is $head, expected $HF_COMMIT. Delete it and re-run setup." ;;
  esac
  [ -z "$(git -C "$CHECKOUT" status --porcelain)" ] \
    || die "checkout at $CHECKOUT has local edits. Delete it and re-run setup."
}

cli_version() { "$HF_BIN" --version 2>/dev/null | tail -1; }

ensure_cli() {
  if [ ! -x "$HF_BIN" ] || [ "$(cli_version)" != "$HF_VERSION" ]; then
    command -v npm >/dev/null 2>&1 || die "npm is not installed. Install Node 22+ and re-run."
    echo "installing hyperframes $HF_VERSION into $CLI_DIR (one time)" >&2
    mkdir -p "$CLI_DIR"
    [ -f "$CLI_DIR/package.json" ] || echo '{"private":true}' > "$CLI_DIR/package.json"
    npm install --prefix "$CLI_DIR" --silent --ignore-scripts --no-audit --no-fund --save-exact \
      "hyperframes@$HF_VERSION" >&2 || die "could not install hyperframes@$HF_VERSION."
  fi
  [ "$(cli_version)" = "$HF_VERSION" ] || die "$HF_BIN does not report $HF_VERSION. Delete $CLI_DIR and re-run setup."
}

cmd_setup() {
  command -v git >/dev/null 2>&1 || die "git is not installed. Install git and re-run."
  mkdir -p "$CACHE_ROOT"

  fetch_skills
  verify_skills
  cmd_audit "$CHECKOUT"
  ensure_cli

  "$HF_BIN" telemetry disable >/dev/null 2>&1 \
    || echo "warn: could not run 'hyperframes telemetry disable'; HYPERFRAMES_NO_TELEMETRY=1 still applies" >&2

  [ "${1:-}" = "--no-voice" ] || ensure_voice
  cmd_env
}

voice_python() {
  if [ -x "$VOICE_VENV/bin/python" ]; then echo "$VOICE_VENV/bin/python"
  else echo "$VOICE_VENV/Scripts/python.exe"; fi
}

voice_ready() {
  local py; py="$(voice_python)"
  [ -x "$py" ] && "$py" -c 'import kokoro_onnx, soundfile' >/dev/null 2>&1
}

# hyperframes tts runs Kokoro through Python and expects kokoro-onnx in
# whatever interpreter HYPERFRAMES_PYTHON names. A private venv keeps that
# install out of the user's system Python.
ensure_voice() {
  voice_ready && return 0
  echo "setting up the local Kokoro voice env in $VOICE_VENV (one time)" >&2
  rm -rf "$VOICE_VENV"
  if command -v uv >/dev/null 2>&1; then
    uv venv -q --python 3.12 "$VOICE_VENV" >&2 \
      && uv pip install -q --python "$(voice_python)" kokoro-onnx soundfile >&2
  elif command -v python3 >/dev/null 2>&1; then
    python3 -m venv "$VOICE_VENV" >&2 \
      && "$(voice_python)" -m pip install -q kokoro-onnx soundfile >&2
  else
    die "no uv or python3 found, so the voiceover cannot run. Install uv (https://docs.astral.sh/uv/) or Python 3.10-3.12."
  fi
  voice_ready || die "kokoro-onnx did not install into $VOICE_VENV. Delete that folder and re-run setup, or install Python 3.12."
}

cmd_env() {
  [ -d "$CHECKOUT/skills/hyperframes" ] && [ -x "$HF_BIN" ] || die "Hyperframes is not set up yet. Run: $0 setup"
  echo "export HF='$HF_BIN'"
  echo "export HF_SKILLS='$CHECKOUT/skills'"
  echo "export HF_SFX='$CHECKOUT/skills/media-use/audio/assets/sfx'"
  echo "export HYPERFRAMES_NO_TELEMETRY=1 HYPERFRAMES_SKIP_SKILLS=1 HYPERFRAMES_NO_UPDATE_CHECK=1 HYPERFRAMES_NO_AUTO_INSTALL=1 DO_NOT_TRACK=1 NEXT_TELEMETRY_DISABLED=1"
  if voice_ready; then echo "export HYPERFRAMES_PYTHON='$(voice_python)'"; fi
}

# init loads GSAP from a CDN, points the registry at the moving main branch and writes
# agent files that route to skills this run bans, so each is corrected here.
cmd_new() {
  local dir="${1:-}" format="${2:-portrait}" gsap
  [ -n "$dir" ] || die "new needs a folder, for example <out>/composition."
  [ ! -e "$dir" ] || die "$dir already exists."
  [ -x "$HF_BIN" ] || die "Hyperframes is not set up yet. Run: $0 setup"
  "$HF_BIN" init "$dir" --non-interactive --resolution "$format" >/dev/null
  gsap="$(find "$CLI_DIR/node_modules/hyperframes/dist/vendor/npm" -name gsap.min.js | head -1)"
  [ -f "$gsap" ] || die "could not find GSAP inside $CLI_DIR."
  mkdir -p "$dir/assets/vendor"
  cp "$gsap" "$dir/assets/vendor/gsap.min.js"
  node - "$dir" "$HF_VERSION" <<'NODE'
const { readFileSync, writeFileSync } = require('node:fs');
const [dir, version] = process.argv.slice(2);
const edit = (file, change) => writeFileSync(`${dir}/${file}`, change(readFileSync(`${dir}/${file}`, 'utf8')));
edit('index.html', (html) => html.replace(/<script\s+src="https?:[^"]*gsap[^"]*"/g, '<script src="assets/vendor/gsap.min.js"'));
edit('hyperframes.json', (json) => json.replace('/hyperframes/main/registry', `/hyperframes/v${version}/registry`));
NODE
  rm -f "$dir/CLAUDE.md" "$dir/AGENTS.md"
  if grep -qE '<script[^>]+src="https?:' "$dir/index.html"; then die "$dir/index.html still loads a remote script."; fi
  echo "new: $dir ($format), GSAP is local and the registry is pinned to v$HF_VERSION"
}

cmd_doctor() {
  local ok=1 v
  if command -v node >/dev/null 2>&1; then
    v="$(node -p 'process.versions.node.split(".")[0]')"
    if [ "$v" -ge 22 ]; then echo "ok    node $(node -v)"; else echo "FAIL  node $(node -v) (need 22+)"; ok=0; fi
  else echo "FAIL  node missing (need 22+)"; ok=0; fi
  for t in ffmpeg ffprobe git; do
    if command -v "$t" >/dev/null 2>&1; then echo "ok    $t"; else echo "FAIL  $t missing"; ok=0; fi
  done
  if command -v pdftoppm >/dev/null 2>&1; then echo "ok    pdftoppm (PDF pages to images)"
  else echo "warn  pdftoppm missing; PDF pages cannot become images (brew install poppler / apt install poppler-utils)"; fi
  if [ -x "$HF_BIN" ] && [ "$(cli_version)" = "$HF_VERSION" ]; then echo "ok    hyperframes $HF_VERSION (pinned)"
  else echo "warn  hyperframes $HF_VERSION not installed yet; setup installs it"; fi
  if voice_ready; then echo "ok    kokoro voice env ($VOICE_VENV)"
  elif command -v uv >/dev/null 2>&1 || command -v python3 >/dev/null 2>&1; then echo "warn  kokoro voice env not built yet; setup builds it"
  else echo "warn  no uv or python3; only a voiceover needs one"; fi
  [ "$ok" = 1 ] || exit 1
}

cmd_music() {
  local found=""
  [ -d "$MUSIC_DIR" ] && found="$(find -L "$MUSIC_DIR" -type f \( -iname '*.mp3' -o -iname '*.wav' -o -iname '*.m4a' -o -iname '*.flac' -o -iname '*.ogg' \) | LC_ALL=C sort)"
  if [ -z "$found" ]; then
    echo "no music tracks in $MUSIC_DIR. Find one with: $0 music search <feel and tempo>"
    return 0
  fi
  while IFS= read -r track; do
    echo "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$track" 2>/dev/null | cut -d. -f1)s  $track"
  done <<< "$found"
}

# Tab-separated: licence, seconds, title, creator, source page, audio URL. Titles
# come from strangers, so tabs and control characters are stripped.
cmd_music_search() {
  [ "$#" -gt 0 ] || die "music search needs words, for example: music search upbeat electronic instrumental"
  command -v node >/dev/null 2>&1 || die "node is not installed."
  node - "$*" <<'NODE'
const RANK = ['cc0', 'pdm', 'by', 'by-sa', 'by-nc', 'by-nc-sa', 'by-nd', 'by-nc-nd'];
const MIN_SECONDS = 60;
const clean = (text) => String(text ?? '').replace(/[\x00-\x1f\x7f]+/g, ' ').trim();
const params = new URLSearchParams({ q: process.argv[2], category: 'music', license: RANK.join(','), page_size: '20' });
const response = await fetch(`https://api.openverse.org/v1/audio/?${params}`, { headers: { 'User-Agent': 'jmr-generate-video' } });
if (!response.ok) {
  console.error(`Openverse answered ${response.status}. Try again later or use a track the user supplies.`);
  process.exit(1);
}
const { results } = await response.json();
const tracks = results
  .filter((track) => track.duration >= MIN_SECONDS * 1000 && RANK.includes(track.license))
  .sort((a, b) => RANK.indexOf(a.license) - RANK.indexOf(b.license));
if (!tracks.length) console.log('No full-length tracks matched. Use fewer words: one mood and one genre.');
for (const track of tracks) {
  console.log([track.license, Math.round(track.duration / 1000), clean(track.title), clean(track.creator), track.foreign_landing_url, track.url].join('\t'));
}
NODE
}

cmd_probe() {
  local f="${1:-}" rate
  [ -f "$f" ] || die "probe needs a video file path."
  command -v ffprobe >/dev/null 2>&1 || die "ffprobe missing. Install ffmpeg."
  ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,r_frame_rate \
    -of default=noprint_wrappers=1 "$f"
  rate="$(ffprobe -v error -show_entries format=bit_rate -of csv=p=0 "$f")"
  if [ -n "$rate" ] && [ "$rate" -gt $((SOCIAL_MAX_MBPS * 1000000)) ]; then
    echo "PROBE: $((rate / 1000000)) Mbps is more than a social upload needs. Run: $0 deliver <out>" >&2
    return 1
  fi
}

# Renders at delivery quality run at 15-27 Mbps. The master stays for re-edits and
# video.mp4 becomes the upload, tagged so a second run encodes from the master again.
cmd_deliver() {
  local out="${1:-}" video master tag
  [ -d "$out" ] || die "deliver needs the output folder, for example video-output-<timestamp>."
  command -v ffmpeg >/dev/null 2>&1 || die "ffmpeg is missing. Install ffmpeg."
  video="$out/video.mp4"
  master="$out/master.mp4"
  [ -f "$video" ] || die "$video is missing. Render the film first."
  tag="$(ffprobe -v error -show_entries format_tags=comment -of csv=p=0 "$video" 2>/dev/null || true)"
  [ "$tag" = "jmr-deliver" ] || mv -f "$video" "$master"
  [ -f "$master" ] || die "$master is missing. Render the film again to $video."
  ffmpeg -v error -y -i "$master" -map 0:v:0 -map '0:a?' \
    -c:v libx264 -preset slow -crf 20 -maxrate 10M -bufsize 20M -profile:v high -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart -metadata comment=jmr-deliver "$video"
  cmd_probe "$video"
}

cmd_captions() {
  local out="${1:-}" self
  [ -d "$out/composition" ] || die "captions needs the output folder that holds composition/."
  self="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
  if [ -f "$out/voiceover.txt" ]; then node "$self/captions.mjs" "$out/composition" "$out/voiceover.txt"
  else node "$self/captions.mjs" "$out/composition"; fi
}

cmd_series() {
  local self
  self="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
  node "$self/series.mjs" "$@"
}

# Signs a search can catch, from references/no-slop-video.md. It cannot judge
# taste, so a clean result only means there is nothing obvious left to fix.
# Glows, washes, heavy type and overshoot are absent on purpose: the best reference
# films use them, so whether one belongs is judged by eye, not by a search.
SLOP_CHECKS=(
  'gradient text|background-clip: *text'
  'purple or violet|#(7c3aed|8b5cf6|6366f1|a855f7|9333ea|4f46e5)|violet|indigo'
  'tracked uppercase label|text-transform: *uppercase'
  'looping motion|repeat: *-1|animation-iteration-count: *infinite|animate-(pulse|ping)'
  'hype word|supercharge|seamless|unlock|game-chang|revolutioni[sz]e|AI-powered|next-gen'
  'unverifiable claim|[Tt]rusted by|[Ll]oved by|10x'
  'exclamation mark in copy|>[^<>{}]*![[:space:]]*<'
  'mono type as decoration|font-family:[^;}]*([Mm]ono|[Cc]ourier)'
)
# Each waiver hides a collision from `"$HF" check`. Reels shipped with text under logos and
# titles under titles behind 22 of them.
LAYOUT_WAIVER='data-layout-allow-(overlap|occlusion)'
# A social upload is re-encoded by the platform, so more than this only slows the upload.
SOCIAL_MAX_MBPS=12

OBJECT_WORDS='car|cars|truck|bakkie|suv|bus|bike|vehicle|wheel|wheels|tyre|tire|rim|body|roof|door|bumper|person|man|woman|face|head|hand|dog|cat|bird|house|building|tree|sun|cloud|pencil|phone|laptop|cup|bottle|trophy|rocket|robot|brain|bulb|lightbulb|heart|magnifier'
DRAWN_OBJECT="<(g|path|polygon|polyline|rect|circle|ellipse)[^>]*(id|class)=\"([^\"]*[-_ ])?($OBJECT_WORDS)([-_ 0-9][^\"]*)?\""

# rembg with a general model, because Hyperframes' remove-background ships u2net_human_seg,
# which only finds people and returned an empty mask for a car. Pinned and kept in its own env.
CUTOUT_VENV="$CACHE_ROOT/cutout-venv"
CUTOUT_PIN="rembg[cpu]==2.0.66"
CUTOUT_MODEL="isnet-general-use"

cutout_python() {
  if [ -x "$CUTOUT_VENV/bin/python" ]; then echo "$CUTOUT_VENV/bin/python"
  else echo "$CUTOUT_VENV/Scripts/python.exe"; fi
}

ensure_cutout() {
  "$(cutout_python)" -I -c 'import rembg' >/dev/null 2>&1 && return 0
  echo "setting up the local cutout env in $CUTOUT_VENV (one time)" >&2
  rm -rf "$CUTOUT_VENV"
  if command -v uv >/dev/null 2>&1; then
    uv venv -q --python 3.12 "$CUTOUT_VENV" >&2 && uv pip install -q --python "$(cutout_python)" "$CUTOUT_PIN" >&2
  elif command -v python3 >/dev/null 2>&1; then
    python3 -m venv "$CUTOUT_VENV" >&2 && "$(cutout_python)" -m pip install -q "$CUTOUT_PIN" >&2
  else
    die "no uv or python3 found, so cutouts cannot run. Install uv (https://docs.astral.sh/uv/) or Python 3.10-3.12."
  fi
  "$(cutout_python)" -I -c 'import rembg' >/dev/null 2>&1 || die "rembg did not install into $CUTOUT_VENV. Delete that folder and try again."
}

cmd_cutout() {
  local in="${1:-}" out="${2:-}"
  [ -f "$in" ] && [ -n "$out" ] || die "cutout needs a photo and an output PNG, for example: cutout context/images/car.jpg composition/assets/car.png"
  case "$out" in *.png) ;; *) die "cutout writes a transparent PNG, so the output must end in .png." ;; esac
  ensure_cutout
  mkdir -p "$CACHE_ROOT/rembg-models"
  U2NET_HOME="$CACHE_ROOT/rembg-models" "$(cutout_python)" -I - "$in" "$out" "$CUTOUT_MODEL" <<'PY'
import sys
from PIL import Image
from rembg import new_session, remove

source, target, model = sys.argv[1:4]
cut = remove(Image.open(source), session=new_session(model), post_process_mask=True)
alpha = cut.getchannel("A")
histogram = alpha.histogram()
kept = sum(histogram[200:]) / sum(histogram)
box = alpha.point(lambda v: 255 if v > 200 else 0).getbbox()
if not box or kept < 0.03:
    sys.exit(f"cutout: the model found almost nothing in {source}. Pick a photo where the object is large, whole and alone.")
cut.crop(box).save(target)
print(f"cutout: {target}, {cut.crop(box).size[0]}x{cut.crop(box).size[1]}, the object covers {round(kept * 100)}% of the photo")
w, h = cut.size
edges = [name for name, touches in (("left", box[0] <= 2), ("top", box[1] <= 2), ("right", box[2] >= w - 2), ("bottom", box[3] >= h - 2)) if touches]
if edges:
    print(f"cutout: the object touches the photo's {', '.join(edges)} edge, so it may be cropped. It can only enter from that side of the frame, or pick another photo.")
print("cutout: open the PNG at full size. When it kept a neighbour, lost a part or left a fringe, pick another photo.")
PY
}

slop_count() {
  { grep -rhoIE "$1" "$2" --include='*.html' --exclude-dir=node_modules --exclude-dir=.hyperframes --exclude='*.min.*' || true; } | wc -l | tr -d ' '
}

cmd_look() {
  [ -f "${1:-}" ] || die "look needs a video file, for example <out>/video.mp4."
  command -v node >/dev/null 2>&1 || die "node is not installed."
  command -v ffmpeg >/dev/null 2>&1 || die "ffmpeg is missing. Install ffmpeg."
  node "$(cd "$(dirname "$(readlink -f "$0")")" && pwd)/look.mjs" "$1"
}

cmd_slop() {
  local dir="${1:-}" hits=0 label pattern found
  [ -d "$dir" ] || die "slop needs the composition folder, for example <out>/composition."
  for check in "${SLOP_CHECKS[@]}"; do
    label="${check%%|*}"
    pattern="${check#*|}"
    found="$(grep -rnIE "$pattern" "$dir" --include='*.html' --include='*.css' \
      --exclude-dir=node_modules --exclude-dir=.hyperframes --exclude='*.min.*' \
      | grep -vE '^[^:]*(CLAUDE|AGENTS)\.md' || true)"
    [ -n "$found" ] || continue
    hits=$((hits + 1))
    echo "SLOP: $label ($(printf '%s\n' "$found" | wc -l | tr -d ' ') lines)"
    printf '%s\n' "$found" | head -3 | cut -c1-140 | sed 's/^/  /'
  done
  # An agent's SVG drawing of a real object reads as a child's (references/world-class.md
  # section 2). Agents name the shapes after what they draw, so the names give it away.
  # An earlier check here counted photos against SVG and pushed films into drawing everything.
  found="$(grep -rnIoE "$DRAWN_OBJECT" "$dir" --include='*.html' \
    --exclude-dir=node_modules --exclude-dir=.hyperframes --exclude='*.min.*' || true)"
  if [ -n "$found" ]; then
    hits=$((hits + 1))
    echo "SLOP: real object drawn by hand ($(printf '%s\n' "$found" | wc -l | tr -d ' ') shapes). Use a 3D model or \"$0 cutout\" (references/world-class.md sections 1 and 2)"
    printf '%s\n' "$found" | head -3 | cut -c1-140 | sed 's/^/  /'
  fi
  found="$(grep -rnIE "$LAYOUT_WAIVER" "$dir" --include='*.html' \
    --exclude-dir=node_modules --exclude-dir=.hyperframes --exclude='*.min.*' || true)"
  if [ -n "$found" ]; then
    hits=$((hits + 1))
    echo "SLOP: layout waivers ($(printf '%s\n' "$found" | wc -l | tr -d ' ') elements). Each hides a collision from check. Remove it, use data-layout-ignore on texture, or name it with its reason in REVIEW.md"
    printf '%s\n' "$found" | head -3 | cut -c1-140 | sed 's/^/  /'
  fi
  if [ "$hits" -gt 0 ]; then
    echo "$hits kinds of sign found. Fix each one, or say why the brand or tone calls for it." >&2
    return 1
  fi
  echo "slop: nothing a search can catch. Now check the stills by eye (references/no-slop-video.md)."
}

# The words have no exceptions for tone: only wording the client wrote or the user asked
# for may go in the allow file. Voice clips without a script would skip the voiceover check.
cmd_words() {
  local out="${1:-}" self checker args=()
  [ -d "$out" ] || die "words needs the output folder, for example video-output-<timestamp>."
  self="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
  checker="$self/../../jmr-plain-language/scripts/check-copy.mjs"
  [ -f "$checker" ] || die "jmr-plain-language is missing. Install it with: npx skills add jmrsquared/skills --skill jmr-plain-language -g"
  if [ -d "$out/composition/assets/vo" ] && [ ! -s "$out/voiceover.txt" ]; then
    die "the film has voice clips but $out/voiceover.txt is missing or empty. Write the script there, one line per beat."
  fi
  [ -f "$out/plain-language-allow.txt" ] && args+=(--allow "$out/plain-language-allow.txt")
  [ -d "$out/composition" ] && args+=("$out/composition")
  [ -f "$out/voiceover.txt" ] && args+=("$out/voiceover.txt")
  [ -f "$out/share-copy.txt" ] && args+=("$out/share-copy.txt")
  [ "${#args[@]}" -gt 0 ] || die "$out has no composition, voiceover.txt or share-copy.txt to check."
  local status=0
  node "$checker" "${args[@]}" || status=$?
  if [ -d "$out/composition" ]; then cmd_captions "$out" || status=1; fi
  return "$status"
}

case "${1:-}" in
  slop)   shift; cmd_slop "${1:-}" ;;
  look)   shift; cmd_look "${1:-}" ;;
  cutout) shift; cmd_cutout "${1:-}" "${2:-}" ;;
  refs)   cmd_refs ;;
  words)  shift; cmd_words "${1:-}" ;;
  setup)  shift; cmd_setup "${1:-}" ;;
  env)    cmd_env ;;
  audit)  shift; cmd_audit "${1:-$CHECKOUT}" "${2:-check}" ;;
  doctor) cmd_doctor ;;
  new)    shift; cmd_new "$@" ;;
  music)  shift; if [ "${1:-}" = search ]; then shift; cmd_music_search "$@"; else cmd_music; fi ;;
  probe)  shift; cmd_probe "${1:-}" ;;
  deliver) shift; cmd_deliver "${1:-}" ;;
  captions) shift; cmd_captions "${1:-}" ;;
  series) shift; cmd_series "$@" ;;
  *) sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
