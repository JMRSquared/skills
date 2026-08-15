#!/usr/bin/env bash
# jmr-image.sh — Unified Unsplash + pngimg image fetcher.
# Favours Unsplash (commercial-safe); falls back to pngimg (non-commercial transparent cutouts).
# No dependencies beyond bash + curl + jq.

set -euo pipefail

UNSPLASH_API="https://api.unsplash.com"
UNSPLASH_KEY="${UNSPLASH_ACCESS_KEY:-${UNSPLASH_APPLICATION_ID:-${UNSPLASH_SECRET_KEY:-}}}"
OUT_DIR="${JMR_IMAGE_OUT:-.}"

# ── Colours ───────────────────────────────────────────────────────────────────
RED=$'\033[0;31m'
GRN=$'\033[0;32m'
YLW=$'\033[0;33m'
CYN=$'\033[0;36m'
BOLD=$'\033[1m'
RESET=$'\033[0m'

warn()  { printf "${RED}! %s${RESET}\n" "$*" >&2; }
info()  { printf "${CYN}→ %s${RESET}\n" "$*"; }
ok()    { printf "${GRN}✓ %s${RESET}\n" "$*"; }
label() { printf "${BOLD}${CYN}[%s]${RESET} " "$*"; }

# ── Helpers ───────────────────────────────────────────────────────────────────
usage() {
  cat <<EOF
Usage: jmr-image.sh <command> [options]

Commands
  search <query>             Search both sources; print numbered results
  download <source> [opts]   Download by index from a specific source
  get <url>                  Download a known URL directly

Search options
  --source unsplash|pngimg|auto   Source to search (default: auto)
  --limit <n>                     Max results per source (default: 10)
  --page <n>                      Page number (default: 1)

Download options
  --index <n>                     Result index to download (required for download command)
  --all                           Download all results (use after user approves the list)
  --out <dir>                     Output directory (default: cwd)

Sources
  unsplash   https://unsplash.com — photos, commercial-safe (Unsplash License)
  pngimg     https://pngimg.com   — transparent cutouts, non-commercial only (CC BY-NC 4.0)

Examples
  jmr-image.sh search "mountain sunrise"
  jmr-image.sh search "batman logo" --source pngimg
  jmr-image.sh download unsplash --index 2 --out public/images
  jmr-image.sh get https://pngimg.com/uploads/cat/cat_PNG50483.png --out public/images
EOF
}

require_cmd() {
  if [[ -z "${1:-}" ]]; then
    usage >&2
    exit 1
  fi
}

save_image() {
  local url="$1"
  local out="$2"
  local label="$3"

  # Determine extension from URL
  local ext="jpg"
  case "$url" in
    *.png*)       ext="png" ;;
    *.gif*)       ext="gif" ;;
    *.webp*)      ext="webp" ;;
    *.avif*)      ext="avif" ;;
  esac

  local filename="${label}.${ext}"
  local dest="$out/$filename"
  mkdir -p "$out"

  info "Downloading → $dest"
  if curl -fsSL -L --max-time 30 "$url" -o "$dest" 2>/dev/null; then
    local size
    size=$(wc -c < "$dest")
    if [[ "$size" -lt 1024 ]]; then
      warn "File too small ($size bytes) — likely an error page. Removing."
      rm -f "$dest"
      return 1
    fi
    ok "Saved $(basename "$dest") ($(echo "$size" | awk '{printf "%.1fKB", $1/1024}'))"
  else
    warn "Download failed for $url"
    rm -f "$dest"
    return 1
  fi
}

# ── Unsplash ───────────────────────────────────────────────────────────────────
unsplash_search() {
  local query="$1"
  local limit="$2"
  local page="$3"

  if [[ -z "$UNSPLASH_KEY" ]]; then
    return 1
  fi

  curl -fsSL \
    -H "Authorization: Client-ID $UNSPLASH_KEY" \
    --max-time 15 \
    "${UNSPLASH_API}/search/photos?query=$(jq -rn --arg q "$query" '$q|@uri')&per_page=${limit}&page=${page}" \
    | jq -c '.results[]?' 2>/dev/null || return 1
}

# Returns the real download URL for an Unsplash photo ID.
unsplash_resolve() {
  local photo_id="$1"
  if [[ -z "$UNSPLASH_KEY" ]]; then
    echo ""
    return 1
  fi
  curl -fsSL \
    -H "Authorization: Client-ID $UNSPLASH_KEY" \
    --max-time 15 \
    "${UNSPLASH_API}/photos/${photo_id}/download" \
    | jq -r '.url' 2>/dev/null || echo ""
}

# ── pngimg ─────────────────────────────────────────────────────────────────────
pngimg_search() {
  local query="$1"
  local limit="$2"
  local page="$3"

  local html
  html=$(curl -fsSL \
    --max-time 15 \
    "https://pngimg.com/search_image/?search_image=$(jq -rn --arg q "$query" '$q|@uri')&page=${page}" \
    -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

  if [[ -z "$html" ]]; then
    return 1
  fi

  # Extract full-res pngimg URLs (no space in URLs), strip /small/ and trailing quote
  echo "$html" \
    | grep -o 'pngimg.com/uploads/[^ ]*' \
    | sed 's|small/||;s|"||' \
    | sort -u \
    | head -n "$limit" \
    | sed 's|^|https://|'
}

# ── Commands ───────────────────────────────────────────────────────────────────
cmd_search() {
  local query=""
  local source="auto"
  local limit=10
  local page=1

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --source) source="$2"; shift 2 ;;
      --limit)  limit="$2";  shift 2 ;;
      --page)   page="$2";   shift 2 ;;
      -*)       warn "Unknown option: $1"; shift ;;
      *)        query="$1";  shift ;;
    esac
  done

  require_cmd "$query"

  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "  jmr-image — search: \"$query\""
  echo "═══════════════════════════════════════════════════════"
  echo ""

  # Fixed temp file for cross-command state sharing
  local cache_file="/tmp/jmr-image-search-cache"
  > "$cache_file"

  local result_counter=0
  local unsplash_count=0

  # ── Unsplash ───────────────────────────────────────────────────────────────
  if [[ "$source" == "auto" ]] || [[ "$source" == "unsplash" ]]; then
    if [[ -n "$UNSPLASH_KEY" ]]; then
      info "Searching Unsplash..."
      while IFS= read -r photo_json; do
        [[ -z "$photo_json" ]] && continue
        result_counter=$((result_counter + 1))
        local id title author url download_url html_url width height
        id=$(echo "$photo_json" | jq -r '.id')
        title=$(echo "$photo_json" | jq -r '.description // .alt_description // "Untitled"')
        author=$(echo "$photo_json" | jq -r '.user.name')
        url=$(echo "$photo_json" | jq -r '.urls.regular')
        download_url=$(echo "$photo_json" | jq -r '.links.download')
        html_url=$(echo "$photo_json" | jq -r '.links.html')
        width=$(echo "$photo_json" | jq -r '.width')
        height=$(echo "$photo_json" | jq -r '.height')

        # Store as JSON line with source prefix
        printf '%s|%s\n' "$result_counter" "unsplash" >> "$cache_file"
        echo "$photo_json" >> "${cache_file}.unsplash.${result_counter}"

        printf "  %3d  ${GRN}%-10s${RESET}  %s\n" "$result_counter" "unsplash" "$title"
      done < <(unsplash_search "$query" "$limit" "$page")
      unsplash_count=$result_counter
    else
      warn "UNSPLASH_ACCESS_KEY not set — skipping Unsplash"
    fi
  fi

  # ── pngimg ─────────────────────────────────────────────────────────────────
  local pngimg_count=0
  if [[ "$source" == "auto" ]] || [[ "$source" == "pngimg" ]]; then
    info "Searching pngimg..."
    while IFS= read -r img_url; do
      [[ -z "$img_url" ]] && continue
      result_counter=$((result_counter + 1))
      local img_id
      img_id=$(echo "$img_url" | sed 's/.*\///' | sed 's/\.png$//' | head -c 60)

      # Store URL in a temp file keyed by result number
      echo "$img_url" > "${cache_file}.pngimg.${result_counter}"
      printf '%s|%s\n' "$result_counter" "pngimg" >> "$cache_file"

      local title
      title=$(echo "$img_id" | sed 's/_/ /g' | sed 's/-/ /g')
      printf "  %3d  ${YLW}%-10s${RESET}  %s\n" "$result_counter" "pngimg" "$title"
    done < <(pngimg_search "$query" "$limit" "$page")
    pngimg_count=$((result_counter - unsplash_count))
  fi

  echo ""
  if [[ "$result_counter" == "0" ]]; then
    warn "No results for \"$query\""
    echo "  Try 2-3 nouns (e.g. 'mountain sunrise', not 'a beautiful mountain at sunrise')."
    rm -f "$cache_file" "${cache_file}.unsplash."* "${cache_file}.pngimg."*
    return 1
  fi

  echo "───────────────────────────────────────────────────────"
  echo "  $result_counter result(s) — $unsplash_count unsplash, $pngimg_count pngimg"
  echo ""
  echo "  Download: jmr-image.sh download <source> --index <n> --out <dir>"
  printf "  %sunsplash%s=commercial-safe  %spngimg%s=non-commercial only (CC BY-NC 4.0)\n" "$GRN" "$RESET" "$YLW" "$RESET"
  echo "───────────────────────────────────────────────────────"
  echo ""
  info "Results cached in $cache_file"
}

cmd_download() {
  local source=""
  local index=""
  local all=false
  local out="$OUT_DIR"

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --index) index="$2"; shift 2 ;;
      --all)   all=true;   shift ;;
      --out)   out="$2";   shift 2 ;;
      -*)      warn "Unknown option: $1"; shift ;;
      *)       source="$1"; shift ;;
    esac
  done

  require_cmd "$source"

  if [[ "$source" != "unsplash" ]] && [[ "$source" != "pngimg" ]]; then
    warn "Source must be 'unsplash' or 'pngimg' — got '$source'"
    exit 1
  fi

  if [[ "$all" == "false" ]] && [[ -z "$index" ]]; then
    warn "Either --index <n> or --all is required."
    exit 1
  fi

  local cache_file="/tmp/jmr-image-search-cache"
  if [[ -z "$cache_file" ]] || [[ ! -f "$cache_file" ]]; then
    warn "No search results cached. Run 'jmr-image.sh search <query>' first."
    exit 1
  fi

  echo ""

  # Collect matching result numbers for the chosen source
  local matching_indices=""
  matching_indices=$(grep "|${source}$" "$cache_file" | cut -d'|' -f1 | tr '\n' ' ')

  if [[ -z "$matching_indices" ]]; then
    warn "No results for source '$source' in cached search."
    exit 1
  fi

  # If --index given, override matching_indices to just that one
  if [[ "$all" == "false" ]]; then
    if [[ "$index" -lt 1 ]]; then
      warn "Index must be >= 1."
      exit 1
    fi
    # Verify index exists for this source
    if ! echo " $matching_indices " | grep -q " $index "; then
      warn "Index $index not found for source '$source'."
      warn "Available indices for '$source': ${matching_indices:-none}"
      exit 1
    fi
    matching_indices="$index"
  fi

  local downloaded=0
  local total=0

  for idx in $matching_indices; do
    total=$((total + 1))

    if [[ "$source" == "unsplash" ]]; then
      local photo_json
      photo_json=$(cat "${cache_file}.unsplash.${idx}" 2>/dev/null || echo "")
      if [[ -z "$photo_json" ]]; then
        warn "Missing data for Unsplash index $idx"
        continue
      fi

      local id title download_url
      id=$(echo "$photo_json" | jq -r '.id')
      title=$(echo "$photo_json" | jq -r '.description // .alt_description // "Untitled"')
      label "unsplash"
      echo "ID: $id  Title: $title"
      echo "URL: $(echo "$photo_json" | jq -r '.urls.regular')"

      info "Resolving download URL..."
      download_url=$(unsplash_resolve "$id")
      if [[ -z "$download_url" ]]; then
        download_url=$(echo "$photo_json" | jq -r '.urls.regular')
      fi

      if save_image "$download_url" "$out" "unsplash-${id}"; then
        downloaded=$((downloaded + 1))
      fi

    else
      # pngimg
      local img_url
      img_url=$(cat "${cache_file}.pngimg.${idx}" 2>/dev/null || echo "")
      if [[ -z "$img_url" ]]; then
        warn "Missing data for pngimg index $idx"
        continue
      fi

      label "pngimg"
      echo "URL: $img_url"

      if save_image "$img_url" "$out" "pngimg-${idx}"; then
        downloaded=$((downloaded + 1))
      fi
    fi
    echo ""
  done

  echo "──────────────────────────────────────────"
  ok "$downloaded / $total image(s) saved to $out"
  echo "──────────────────────────────────────────"
}

cmd_get() {
  local url=""
  local out="$OUT_DIR"

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --out) out="$2"; shift 2 ;;
      -*)    warn "Unknown option: $1"; shift ;;
      *)     url="$1"; shift ;;
    esac
  done

  require_cmd "$url"

  echo ""
  label "direct"
  echo "URL: $url"
  echo ""

  local source="unknown"
  local resolved_url="$url"

  if echo "$url" | grep -q "pngimg.com"; then
    source="pngimg"
  elif echo "$url" | grep -q "unsplash.com/photos/"; then
    source="unsplash"
    local photo_id
    photo_id=$(echo "$url" | sed 's/.*unsplash.com\/photos\///' | cut -d'/' -f1 | cut -d'?' -f1)
    if [[ -n "$photo_id" ]] && [[ -n "$UNSPLASH_KEY" ]]; then
      info "Resolving Unsplash download URL..."
      resolved_url=$(unsplash_resolve "$photo_id")
      [[ -z "$resolved_url" ]] && resolved_url="$url"
    fi
  fi

  if save_image "$resolved_url" "$out" "direct"; then
    echo ""
    ok "Done — saved to $out"
  fi
}

# ── Main ───────────────────────────────────────────────────────────────────────
COMMAND="${1:-}"
shift || true

case "$COMMAND" in
  search)   cmd_search   "$@" ;;
  download) cmd_download "$@" ;;
  get)      cmd_get      "$@" ;;
  help|--help|-h) usage ;;
  *)        usage >&2; exit 1 ;;
esac
