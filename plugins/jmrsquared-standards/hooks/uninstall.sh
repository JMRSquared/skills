#!/usr/bin/env sh
set -eu

CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
TARGET="$CONFIG_DIR/hooks/jmrsquared-standards"

if [ -d "$TARGET" ]; then
  rm -rf "$TARGET"
  echo "Removed $TARGET"
else
  echo "Nothing to remove at $TARGET"
fi

echo "Now manually remove the SessionStart and statusLine entries from $CONFIG_DIR/settings.json."
