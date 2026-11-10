#!/usr/bin/env bash
# jmr-design-taste: fetch tasteskill (Leonxlnx/taste-skill, MIT) at one pinned commit and run its tools.
#
#   taste.sh path              print the pinned skill folder, fetching it once (about 40 MB)
#   taste.sh chrome            print the Chrome or Chromium binary its browser checks will use
#   taste.sh run <tool> [args] run one of its tools with CHROME_PATH set, from the current folder
#   taste.sh tools             list the tool names `run` accepts
#
# Env:
#   JMR_TASTE_CACHE  cache root (default: ${XDG_CACHE_HOME:-~/.cache}/jmr-design-taste)
#   CHROME_PATH      a browser to use; otherwise the first system Chrome or Playwright Chromium found
#
# The kit is 1,600 files with photographs and icons, so jmrsquared-standards does not copy it into
# every agent folder. It is read from the cache, where nobody edits it.

set -euo pipefail

REPO="https://github.com/Leonxlnx/taste-skill.git"
# tasteskill 2.5.1, read on 2026-11-10. Its scripts reach only 127.0.0.1 (their own page server),
# Wikimedia Commons (photos.mjs search and fetch), jsDelivr at pinned versions (icons.mjs) and
# Google Fonts (the pages it builds). No telemetry. To bump: read the diff of scripts/ and assets/
# for new hosts, child processes and install steps, then change COMMIT and the date above.
COMMIT="f6b76575f949707b4e3c37cd86cb44b0b98643e8"

CACHE_ROOT="${JMR_TASTE_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/jmr-design-taste}"
CHECKOUT="$CACHE_ROOT/${COMMIT:0:12}"
SKILL="$CHECKOUT/skills/taste-skill"

die() { echo "jmr-design-taste: $*" >&2; exit 1; }

fetch() {
  if [ -f "$SKILL/SKILL.md" ]; then
    verify
    return
  fi
  command -v git >/dev/null || die "git is required to fetch tasteskill"
  mkdir -p "$CACHE_ROOT"
  TMP="$(mktemp -d "$CACHE_ROOT/fetch.XXXXXX")"
  trap 'rm -rf "$TMP"' EXIT
  git -C "$TMP" init -q
  git -C "$TMP" remote add origin "$REPO"
  git -C "$TMP" fetch -q --depth 1 origin "$COMMIT" || die "could not fetch $REPO at $COMMIT"
  git -C "$TMP" -c advice.detachedHead=false checkout -q FETCH_HEAD
  [ "$(git -C "$TMP" rev-parse HEAD)" = "$COMMIT" ] || die "fetched the wrong commit"
  rm -rf "$CHECKOUT"
  mv "$TMP" "$CHECKOUT"
  trap - EXIT
  verify
}

# A cached checkout with local edits or another commit is not the kit that was read.
verify() {
  [ "$(git -C "$CHECKOUT" rev-parse HEAD 2>/dev/null)" = "$COMMIT" ] \
    || die "$CHECKOUT is not at $COMMIT. Delete it and run again."
  [ -z "$(git -C "$CHECKOUT" status --porcelain 2>/dev/null)" ] \
    || die "$CHECKOUT has local edits. Delete it and run again; never edit the kit to pass a check."
}

find_chrome() {
  if [ -n "${CHROME_PATH:-}" ] && [ -x "$CHROME_PATH" ]; then echo "$CHROME_PATH"; return; fi
  local c
  for c in /usr/bin/google-chrome /usr/bin/google-chrome-stable /usr/bin/chromium /usr/bin/chromium-browser \
           "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
    if [ -x "$c" ]; then echo "$c"; return; fi
  done
  # Playwright's Chromium, newest first.
  for c in $(ls -d "$HOME"/.cache/ms-playwright/chromium-* "$HOME"/Library/Caches/ms-playwright/chromium-* 2>/dev/null | sort -rV); do
    for b in "$c"/chrome-linux*/chrome "$c"/chrome-mac*/Chromium.app/Contents/MacOS/Chromium \
             "$c"/chrome-mac*/"Google Chrome for Testing.app"/Contents/MacOS/"Google Chrome for Testing"; do
      if [ -x "$b" ]; then echo "$b"; return; fi
    done
  done
  return 1
}

tool_path() {
  case "$1" in
    copy-lint|perf|consistency|shoot|photos|icons|start|moments|effects|gate)
      echo "$SKILL/scripts/$1.mjs" ;;
    layout-check) echo "$SKILL/assets/layout/check.mjs" ;;
    hero-deal) echo "$SKILL/assets/layout/deal.mjs" ;;
    *) return 1 ;;
  esac
}

cmd="${1:-}"
case "$cmd" in
  path)
    fetch
    echo "$SKILL"
    ;;
  chrome)
    find_chrome || die "no Chrome or Chromium found. Install Chrome, or run: npx playwright install chromium"
    ;;
  tools)
    echo "copy-lint perf consistency shoot photos icons start moments effects gate layout-check hero-deal"
    ;;
  run)
    shift
    [ $# -ge 1 ] || die "usage: taste.sh run <tool> [args]. Tools: $("$0" tools)"
    fetch
    script="$(tool_path "$1")" || die "unknown tool '$1'. Tools: $("$0" tools)"
    shift
    command -v node >/dev/null || die "Node 22 or later is required"
    major="$(node -p 'process.versions.node.split(".")[0]')"
    [ "$major" -ge 22 ] || die "Node 22 or later is required (found $(node -v))"
    if chrome="$(find_chrome)"; then export CHROME_PATH="$chrome"; fi
    exec node "$script" "$@"
    ;;
  *)
    die "usage: taste.sh path | chrome | tools | run <tool> [args]"
    ;;
esac
