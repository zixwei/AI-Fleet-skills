#!/bin/sh
# Link this repo into Claude Code and/or Codex skill folders.
#   ./install.sh                # both
#   ./install.sh claude         # Claude Code only
#   ./install.sh codex          # Codex only
#   ./install.sh --uninstall    # remove the links (never touches real folders)
set -eu

REPO="$(cd "$(dirname "$0")" && pwd)"
NAME="topaz-video"
ACTION="install"
TARGETS=""
for arg in "$@"; do
  case "$arg" in
    --uninstall) ACTION="uninstall" ;;
    claude) TARGETS="$TARGETS $HOME/.claude/skills" ;;
    codex) TARGETS="$TARGETS ${CODEX_HOME:-$HOME/.codex}/skills" ;;
    *) echo "unknown argument: $arg" >&2; exit 2 ;;
  esac
done
[ -n "$TARGETS" ] || TARGETS="$HOME/.claude/skills ${CODEX_HOME:-$HOME/.codex}/skills"

for dir in $TARGETS; do
  link="$dir/$NAME"
  if [ "$ACTION" = "uninstall" ]; then
    if [ -L "$link" ]; then rm "$link"; echo "removed $link"; else echo "skip $link (not a link)"; fi
    continue
  fi
  mkdir -p "$dir"
  if [ -L "$link" ]; then
    rm "$link"
  elif [ -e "$link" ]; then
    echo "refusing to replace existing folder $link — move it away first" >&2
    exit 1
  fi
  ln -s "$REPO" "$link"
  echo "linked $link -> $REPO"
done

[ "$ACTION" = "install" ] && python3 "$REPO/scripts/tvai.py" doctor >/dev/null 2>&1 \
  && echo "doctor: ok (run: python3 $REPO/scripts/tvai.py doctor)" \
  || { [ "$ACTION" = "install" ] && echo "doctor reported problems: python3 $REPO/scripts/tvai.py doctor"; }
exit 0
