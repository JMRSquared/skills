#!/usr/bin/env bash
# Copy files from this machine into shared storage that the user's other
# devices can open. Copies only; never moves or deletes.
#
# JMR_SHARE_ROOT sets the destination (default /mnt/tank/media/herdr).
# JMR_SHARE_MAX_GB sets the size limit before --force is needed (default 5).
#
#   share.sh <path>... [--as <folder>] [--dry-run] [--force]
#   share.sh --list
set -euo pipefail
# Folders this creates must be as open as the rest of the share, so every
# device's login can add and replace files.
umask 000

ROOT=${JMR_SHARE_ROOT:-/mnt/tank/media/herdr}
# Shared pools are usually shared with media servers and backups. Above this
# a copy needs --force so a stray build folder cannot fill the disk.
MAX_GB=${JMR_SHARE_MAX_GB:-5}
MAX_BYTES=$((MAX_GB * 1024 * 1024 * 1024))

die() { echo "jmr-file-share: $*" >&2; exit 1; }

as="" dry="" force="" paths=()
while (($#)); do
  case "$1" in
    --as) as="${2:?--as needs a folder name}"; shift 2 ;;
    --dry-run) dry=1; shift ;;
    --force) force=1; shift ;;
    --list) [[ -d $ROOT ]] && find "$ROOT" -mindepth 1 -maxdepth 2 -printf '%TY-%Tm-%Td %TH:%TM  %p\n' | sort -r; exit 0 ;;
    -h|--help) sed -n '2,10p' "$0"; exit 0 ;;
    *) paths+=("$1"); shift ;;
  esac
done
((${#paths[@]})) || die "usage: share.sh <path>... [--as <folder>] [--dry-run] [--force]"
BASE=$(dirname "$ROOT")
[[ -w $ROOT || -w $BASE ]] || die "$BASE is not mounted or not writable here. Set JMR_SHARE_ROOT to the shared folder."

# Shared storage reaches every device in the house. Keep secrets and bulky
# build output off it.
EXCLUDES=(
  --exclude=.git/ --exclude=node_modules/ --exclude=.venv/ --exclude=__pycache__/
  --exclude=dist/ --exclude=build/ --exclude=.next/ --exclude=.turbo/ --exclude=.cache/
  --exclude='.env' --exclude='.env.*' --exclude='*.pem' --exclude='*.key' --exclude='id_rsa*'
  --exclude='id_ed25519*' --exclude=.ssh/ --exclude='*.p12' --exclude='*credentials*'
  --exclude='*secret*' --exclude=.DS_Store
)

# Mirror the source's place in its project so a re-share overwrites the old
# copy in place: ~/CODE/app/docs/x.pdf -> herdr/app/docs/x.pdf
dest_for() {
  local src top rel
  src=$(realpath "$1")
  if top=$(git -C "$(dirname "$src")" rev-parse --show-toplevel 2>/dev/null); then
    rel=${src#"$top"}
    echo "$ROOT/${as:-$(basename "$top")}${rel:+$rel}"
  else
    echo "$ROOT/${as:-misc}/$(basename "$src")"
  fi
}

for p in "${paths[@]}"; do
  [[ -e $p ]] || die "$p does not exist"
  src=$(realpath "$p"); [[ -d $src ]] && src="$src/"
  # Size what would actually copy, after the excludes.
  bytes=$(rsync -a -n --stats "${EXCLUDES[@]}" "$src" /nonexistent-homelab-share/ 2>/dev/null |
    awk -F': ' '/^Total file size/ { gsub(/[^0-9]/, "", $2); print $2 }')
  bytes=${bytes:-0}
  if ((bytes > MAX_BYTES)) && [[ -z $force ]]; then
    die "$p is $((bytes / 1024 / 1024)) MB, over the $MAX_GB GB limit. Ask the user, then pass --force."
  fi
done

for p in "${paths[@]}"; do
  dest=$(dest_for "$p")
  mkdir -p "$(dirname "$dest")"
  src=$(realpath "$p")
  [[ -d $src ]] && src="$src/" && mkdir -p "$dest"
  rsync -a --no-owner --no-group --chmod=Da+rwx,Fa+rw ${dry:+--dry-run --itemize-changes} \
    "${EXCLUDES[@]}" "$src" "$dest"
  echo "${dry:+[dry run] }$p -> $dest"
done
