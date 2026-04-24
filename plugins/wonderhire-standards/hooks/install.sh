#!/usr/bin/env sh
# Standalone installer for wonderhire-standards Claude Code hooks.
set -eu

CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
TARGET="$CONFIG_DIR/hooks/wonderhire-standards"
SRC="$(cd "$(dirname "$0")" && pwd)"

mkdir -p "$TARGET"
cp "$SRC/wh-config.js"        "$TARGET/"
cp "$SRC/wh-session-start.js" "$TARGET/"
cp "$SRC/wh-statusline.sh"    "$TARGET/"
cp "$SRC/wh-statusline.ps1"   "$TARGET/"
cp "$SRC/package.json"        "$TARGET/"
chmod +x "$TARGET/wh-statusline.sh"

echo "Installed wonderhire-standards hooks to $TARGET"
echo
echo "Add to $CONFIG_DIR/settings.json:"
cat <<JSON
  "hooks": {
    "SessionStart": [
      { "command": "node $TARGET/wh-session-start.js" }
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "$TARGET/wh-statusline.sh"
  }
JSON
