#!/usr/bin/env bash
# pngimg.sh — search and download transparent PNGs from https://pngimg.com
#
# License warning: pngimg.com content is CC BY-NC 4.0 (attribution, non-commercial).
# Do not ship these assets in a commercial product.
#
# Usage:
#   pngimg.sh search <query> [--page N] [--limit N]
#   pngimg.sh download <query> [--index N | --all] [--limit N] [--page N] [--out DIR]
#   pngimg.sh get <full-image-url> [--out DIR]

set -euo pipefail

UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
BASE='https://pngimg.com'
OUT_DIR='.'
PAGE=1
LIMIT=20
INDEX=''
ALL=0

die() { printf 'pngimg: %s\n' "$1" >&2; exit 1; }

urlencode() {
  local s="$1" out='' c
  for (( i = 0; i < ${#s}; i++ )); do
    c=${s:i:1}
    case "$c" in
      [a-zA-Z0-9.~_-]) out+="$c" ;;
      ' ') out+='+' ;;
      *) out+=$(printf '%%%02X' "'$c") ;;
    esac
  done
  printf '%s' "$out"
}

# Prints "<full-url>\t<title>" per result, deduped, in page order.
fetch_results() {
  local query="$1" page="$2"
  local url="$BASE/search_image/?page=$page&search_image=$(urlencode "$query")"
  curl -fsSL --max-time 30 -A "$UA" "$url" \
    | { grep -o '<img src="https://pngimg\.com/uploads/[^"]*"[^>]*alt="[^"]*"' || true; } \
    | sed -e 's#^<img src="##' -e 's#"[^>]*alt="#\t#' -e 's#"$##' \
    | sed 's#/uploads/\(.*\)/small/#/uploads/\1/#' \
    | awk -F'\t' '!seen[$1]++'
}

download_one() {
  local url="$1" name
  name=$(basename "$url")
  mkdir -p "$OUT_DIR"
  curl -fsSL --max-time 120 -A "$UA" -e "$BASE/" "$url" -o "$OUT_DIR/$name"
  # Reject HTML error pages saved with a .png name.
  local magic
  magic=$(head -c 4 "$OUT_DIR/$name" | od -An -tx1 | tr -d ' \n')
  if [ "$magic" != "89504e47" ]; then
    rm -f "$OUT_DIR/$name"
    die "not a PNG: $url"
  fi
  printf '%s\n' "$OUT_DIR/$name"
}

CMD=${1:-}
[ -n "$CMD" ] || die "usage: pngimg.sh {search|download|get} ..."
shift || true

ARG=${1:-}
[ -n "$ARG" ] || die "missing query/url"
shift || true

while [ $# -gt 0 ]; do
  case "$1" in
    --page) PAGE=${2:-1}; shift 2 ;;
    --limit) LIMIT=${2:-20}; shift 2 ;;
    --index) INDEX=${2:-}; shift 2 ;;
    --all) ALL=1; shift ;;
    --out) OUT_DIR=${2:-.}; shift 2 ;;
    *) die "unknown option: $1" ;;
  esac
done

case "$CMD" in
  search)
    RESULTS=$(fetch_results "$ARG" "$PAGE" | head -n "$LIMIT")
    [ -n "$RESULTS" ] || die "no results for: $ARG (try fewer, more literal words)"
    printf '%s\n' "$RESULTS" | awk -F'\t' '{ printf "%2d  %s\n    %s\n", NR, $2, $1 }'
    ;;
  download)
    RESULTS=$(fetch_results "$ARG" "$PAGE" | head -n "$LIMIT")
    [ -n "$RESULTS" ] || die "no results for: $ARG (try fewer, more literal words)"
    if [ "$ALL" -eq 1 ]; then
      printf '%s\n' "$RESULTS" | cut -f1 | while read -r u; do download_one "$u"; done
    else
      [ -n "$INDEX" ] || die "pass --index N (see: pngimg.sh search \"$ARG\") or --all"
      URL=$(printf '%s\n' "$RESULTS" | sed -n "${INDEX}p" | cut -f1)
      [ -n "$URL" ] || die "no result at index $INDEX"
      download_one "$URL"
    fi
    ;;
  get)
    case "$ARG" in
      https://pngimg.com/uploads/*) download_one "$ARG" ;;
      *) die "url must start with https://pngimg.com/uploads/" ;;
    esac
    ;;
  *) die "unknown command: $CMD" ;;
esac
