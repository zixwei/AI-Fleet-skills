#!/usr/bin/env bash
# lipnardo uninstaller
# Removes the symlink from ~/.claude/skills/ (does NOT delete the repo,
# generated videos, API key, or cost ledger).
set -euo pipefail

TARGET_DIR="$HOME/.claude/skills"

echo "=== lipnardo Uninstaller ==="
echo ""

REMOVED=0
target="$TARGET_DIR/lipnardo"
if [ -L "$target" ]; then
    rm "$target"
    echo "  [REMOVED] symlink: $target"
    REMOVED=1
elif [ -d "$target" ]; then
    echo "  [SKIPPED] $target is a directory (not a symlink) -- manual removal needed"
fi

echo ""
echo "Removed $REMOVED symlink(s)."
echo "Untouched on purpose:"
echo "  - This repo at $(pwd)"
echo "  - Generated videos at ~/Documents/lipnardo_videos/"
echo "  - API key at ~/.heygen/config.json"
echo "  - Cost ledger at ~/.heygen/costs.json"
echo ""
echo "To wipe local state too:"
echo "  rm -rf ~/.heygen ~/Documents/lipnardo_videos"
