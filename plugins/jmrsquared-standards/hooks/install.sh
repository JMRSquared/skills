#!/usr/bin/env sh
# Standalone installer for jmrsquared-standards Claude Code hooks.
set -eu

CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
TARGET="$CONFIG_DIR/hooks/jmrsquared-standards"
SRC="$(cd "$(dirname "$0")" && pwd)"

mkdir -p "$TARGET"
cp "$SRC/jmr-config.js"        "$TARGET/"
cp "$SRC/jmr-session-start.js" "$TARGET/"
cp "$SRC/jmr-statusline.sh"    "$TARGET/"
cp "$SRC/jmr-statusline.ps1"   "$TARGET/"
cp "$SRC/package.json"         "$TARGET/"
chmod +x "$TARGET/jmr-statusline.sh"

echo "Installed jmrsquared-standards hooks to $TARGET"
echo
echo "Add to $CONFIG_DIR/settings.json:"
cat <<JSON
  "hooks": {
    "SessionStart": [
      { "command": "node $TARGET/jmr-session-start.js" }
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "$TARGET/jmr-statusline.sh"
  }
JSON
