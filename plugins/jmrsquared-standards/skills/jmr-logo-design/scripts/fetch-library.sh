#!/usr/bin/env bash
# jmr-logo-design: download the reference logo library from the pinned upstream commit.
#
#   fetch-library.sh          fetch once into the cache; a second run only prints the path
#   fetch-library.sh --path   print the library path without fetching
#
# Env:
#   JMR_LOGO_CACHE  cache root (default: ${XDG_CACHE_HOME:-~/.cache}/jmr-logo-design)
#
# The 1,432 SVGs are trademarks of their owners, so jmrsquared-standards does not
# redistribute them. The scripts read them from the cache for study only.

set -euo pipefail

REPO="https://github.com/kaankiziltug/logo-design-skill.git"
# Read on 2026-10-25: the library is plain SVG with no scripts, event handlers or
# external references. Bump together with LIBRARY_COMMIT in svglib.py and
# re-copy catalog.json and stats.json from the same commit.
COMMIT="734090317a2155c5bf1ae8bd4cc85c6848a0128f"

CACHE_ROOT="${JMR_LOGO_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/jmr-logo-design}"
DEST="$CACHE_ROOT/${COMMIT:0:12}"

die() { echo "jmr-logo-design: $*" >&2; exit 1; }

if [ "${1:-}" = "--path" ]; then
  echo "$DEST/svg"
  exit 0
fi

if [ -d "$DEST/svg" ]; then
  echo "$DEST/svg"
  exit 0
fi

command -v git >/dev/null || die "git is required to fetch the library"

mkdir -p "$CACHE_ROOT"
TMP="$(mktemp -d "$CACHE_ROOT/fetch.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

git -C "$TMP" init -q
git -C "$TMP" remote add origin "$REPO"
git -C "$TMP" sparse-checkout set --no-cone /skills/logo-design/assets/library/
git -C "$TMP" fetch -q --depth 1 --filter=blob:none origin "$COMMIT"
git -C "$TMP" checkout -q FETCH_HEAD
[ "$(git -C "$TMP" rev-parse HEAD)" = "$COMMIT" ] || die "fetched commit does not match $COMMIT"

LIB="$TMP/skills/logo-design/assets/library"
[ -d "$LIB/svg" ] || die "upstream commit has no assets/library/svg"

# preview_sheet.py inlines reference SVGs into HTML pages that open in a browser,
# so anything that can run code or load a remote resource stops the fetch.
if grep -rlIiE '<script|[[:space:]]on[a-z]+=|href="https?:|url\(https?:' "$LIB/svg" >/dev/null; then
  grep -rlIiE '<script|[[:space:]]on[a-z]+=|href="https?:|url\(https?:' "$LIB/svg" >&2
  die "library files above contain scripts or remote references; read them before trusting this commit"
fi

mkdir -p "$DEST"
mv "$LIB/svg" "$DEST/svg"
[ -f "$LIB/gallery.html" ] && mv "$LIB/gallery.html" "$DEST/gallery.html"
echo "$DEST/svg"
