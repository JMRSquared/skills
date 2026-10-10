#!/usr/bin/env bash
# jmr-generate-video: fetch the pinned brag skill, audit it, keep the run local.
#
#   jmr-generate-video.sh setup [--no-voice]
#                                      fetch + verify + audit brag, disable telemetry, build the
#                                      local Kokoro voice env, print export lines for eval
#   jmr-generate-video.sh env          print the export lines again (no fetch); use in each new shell
#   jmr-generate-video.sh audit [DIR]  re-run the audit on a brag checkout
#   jmr-generate-video.sh doctor       check node, ffmpeg, git, hyperframes, pdftoppm
#   jmr-generate-video.sh probe FILE   print size, duration and streams of a rendered video
#
# Env:
#   BRAG_REF    commit to pin (default: the audited commit below). A different
#               ref skips the baseline match, so the audit prints every hit
#               for a human or agent to read before the run continues.
#   JMR_VIDEO_CACHE  cache root (default: ${XDG_CACHE_HOME:-~/.cache}/jmr-generate-video)

set -euo pipefail

BRAG_REPO="https://github.com/latent-spaces/brag.git"
# Audited 2026-10-10. Bump only after reading the diff between the old and new
# commit and re-recording AUDIT_BASELINE with `audit --baseline`.
BRAG_PINNED="8531ccb9f471ef5099abf930079e47b55c55bb21"
AUDIT_BASELINE="9a229126eeeb10b623262b474b7f7c22694e1b3a0b8b25949425798f0d8009ba"

BRAG_REF="${BRAG_REF:-$BRAG_PINNED}"
CACHE_ROOT="${JMR_VIDEO_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/jmr-generate-video}"
CHECKOUT="$CACHE_ROOT/brag-$BRAG_REF"
VOICE_VENV="$CACHE_ROOT/kokoro-venv"

# Telemetry and feedback opt-outs. Exported so every child npx call inherits them.
export HYPERFRAMES_NO_TELEMETRY=1
export DO_NOT_TRACK=1
export NEXT_TELEMETRY_DISABLED=1

die() { echo "jmr-generate-video: $*" >&2; exit 1; }

# Only skills/brag is audited: it is the only part of the checkout the agent
# reads or runs. The repo's docs/ and examples/ are brag's own launch site.
# Patterns that mean "this text can reach the network, run code or track usage".
# Hits are expected (brag documents npx hyperframes and credits its music), so
# the audit compares the full hit list against a recorded baseline. Any change
# is a new line to read before trusting the checkout.
AUDIT_PATTERN='telemetry|analytics|posthog|mixpanel|segment\.(io|com)|sentry|amplitude|beacon|gtag|google-analytics|curl |wget |Invoke-WebRequest|iwr |fetch\(|XMLHttpRequest|requests\.|urllib|socket|subprocess|os\.system|child_process|eval\(|exec\(|base64|rm -rf|sudo |\| *(ba|z)?sh|npx |npm (i|install)|pip install|uvx? |letsbrag|heygen|feedback|events|https?://'

audit_hits() {
  local dir="$1"
  (cd "$dir/skills/brag" && grep -rnIE "$AUDIT_PATTERN" . \
      --exclude-dir=.git --exclude='uv.lock' --exclude='*.music-cues.json' \
      --exclude='sfx-analysis.json' 2>/dev/null || true) | LC_ALL=C sort
}

# Files that are neither text, media nor the known lockfile. A binary or
# script type brag never shipped before is a reason to stop.
odd_files() {
  local dir="$1"
  (cd "$dir/skills/brag" && find . -type f -print \
    | grep -vE '\.(md|json|py|toml|lock|mp3|ogg|wav|jpg|jpeg|png|mp4|html|css|js|mjs|yml|txt)$' \
    | grep -vE '/(LICENSE|\.gitignore|\.gitattributes)$' || true) | LC_ALL=C sort
}

hash_stdin() {
  if command -v shasum >/dev/null 2>&1; then shasum -a 256 | cut -d' ' -f1
  else sha256sum | cut -d' ' -f1; fi
}

cmd_audit() {
  local dir="${1:-$CHECKOUT}" mode="${2:-check}"
  [ -d "$dir/skills/brag" ] || die "no brag checkout at $dir. Run: $0 setup"

  local hits odd fingerprint
  hits="$(audit_hits "$dir")"
  odd="$(odd_files "$dir")"
  fingerprint="$(printf '%s\n--\n%s\n' "$hits" "$odd" | hash_stdin)"

  if [ "$mode" = "--baseline" ]; then
    echo "$fingerprint"
    return 0
  fi

  if [ "$BRAG_REF" = "$BRAG_PINNED" ] && [ "$fingerprint" = "$AUDIT_BASELINE" ]; then
    echo "audit: ok (matches the reviewed baseline for $BRAG_PINNED)" >&2
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

cmd_setup() {
  command -v git >/dev/null 2>&1 || die "git is not installed. Install git and re-run."
  mkdir -p "$CACHE_ROOT"

  if [ ! -d "$CHECKOUT/.git" ]; then
    local tmp="$CHECKOUT.tmp.$$"
    rm -rf "$tmp"
    git init -q "$tmp"
    git -C "$tmp" remote add origin "$BRAG_REPO"
    git -C "$tmp" fetch -q --depth 1 origin "$BRAG_REF" \
      || { rm -rf "$tmp"; die "could not fetch $BRAG_REF from $BRAG_REPO. Check the network or the ref."; }
    git -C "$tmp" -c advice.detachedHead=false checkout -q FETCH_HEAD
    mv "$tmp" "$CHECKOUT"
  fi

  local head
  head="$(git -C "$CHECKOUT" rev-parse HEAD)"
  case "$head" in
    "$BRAG_REF"*) ;;
    *) die "checkout at $CHECKOUT is $head, expected $BRAG_REF. Delete it and re-run setup." ;;
  esac
  [ -z "$(git -C "$CHECKOUT" status --porcelain)" ] \
    || die "checkout at $CHECKOUT has local edits. Delete it and re-run setup."

  cmd_audit "$CHECKOUT"

  if command -v npx >/dev/null 2>&1; then
    npx --yes hyperframes telemetry disable >/dev/null 2>&1 \
      || echo "warn: could not run 'hyperframes telemetry disable'; HYPERFRAMES_NO_TELEMETRY=1 still applies" >&2
  fi

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
  [ -d "$CHECKOUT/skills/brag" ] || die "brag is not set up yet. Run: $0 setup"
  echo "export BRAG_DIR='$CHECKOUT/skills/brag'"
  echo "export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 NEXT_TELEMETRY_DISABLED=1"
  if voice_ready; then echo "export HYPERFRAMES_PYTHON='$(voice_python)'"; fi
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
  if v="$(npx --yes hyperframes --version 2>/dev/null | tail -1)"; then echo "ok    hyperframes $v"
  else echo "FAIL  hyperframes CLI not runnable via npx"; ok=0; fi
  if voice_ready; then echo "ok    kokoro voice env ($VOICE_VENV)"
  elif command -v uv >/dev/null 2>&1 || command -v python3 >/dev/null 2>&1; then echo "warn  kokoro voice env not built yet; setup builds it"
  else echo "FAIL  no uv or python3; voiceover needs one"; ok=0; fi
  [ "$ok" = 1 ] || exit 1
}

cmd_probe() {
  local f="${1:-}"
  [ -f "$f" ] || die "probe needs a video file path."
  command -v ffprobe >/dev/null 2>&1 || die "ffprobe missing. Install ffmpeg."
  ffprobe -v error -show_entries format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate \
    -of default=noprint_wrappers=1 "$f"
}

case "${1:-}" in
  setup)  shift; cmd_setup "${1:-}" ;;
  env)    cmd_env ;;
  audit)  shift; cmd_audit "${1:-$CHECKOUT}" "${2:-check}" ;;
  doctor) cmd_doctor ;;
  probe)  shift; cmd_probe "${1:-}" ;;
  *) sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
