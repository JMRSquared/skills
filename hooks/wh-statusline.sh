#!/usr/bin/env sh
# Wonderhire statusline — reads .wh-active and renders a badge.

set -u

CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
FLAG="$CONFIG_DIR/.wh-active"

ORANGE='\033[38;5;208m'
RESET='\033[0m'

if [ ! -f "$FLAG" ]; then
  printf "%b[WH]%b" "$ORANGE" "$RESET"
  exit 0
fi

CONTENT="$(head -c 256 "$FLAG" 2>/dev/null | tr -d '\n\r')"

if [ -z "$CONTENT" ] || [ "$CONTENT" = "@" ]; then
  printf "%b[WH]%b" "$ORANGE" "$RESET"
  exit 0
fi

printf "%b[WH: %s]%b" "$ORANGE" "$CONTENT" "$RESET"
