#!/usr/bin/env bash
# lipnardo -- Interactive Installer
# Symlinks the skill into ~/.claude/skills/ and optionally writes the API key.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"
TARGET_DIR="$HOME/.claude/skills"
HEYGEN_DIR="$HOME/.heygen"
CONFIG_PATH="$HEYGEN_DIR/config.json"
OUTPUT_DIR="$HOME/Documents/lipnardo_videos"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

print_step() { echo -e "\n${BLUE}${BOLD}[$1]${NC} $2"; }
print_ok()   { echo -e "  ${GREEN}[OK]${NC} $1"; }
print_warn() { echo -e "  ${YELLOW}[!]${NC} $1"; }
print_err()  { echo -e "  ${RED}[ERROR]${NC} $1"; }
ask()        { echo -en "  ${BOLD}$1${NC} "; read -r REPLY; }

echo -e "${BOLD}"
echo "  ================================================================"
echo "      lipnardo -- HeyGen Avatar Video Generation for Claude Code"
echo "  ================================================================"
echo -e "${NC}"
echo "  This installer will set up everything you need."
echo "  Just answer a few questions -- no technical knowledge required."
echo ""

# ──────────────────────────────────────────────────────────────────────
# Step 1: Check prerequisites
# ──────────────────────────────────────────────────────────────────────
print_step "1/4" "Checking your system..."

if command -v git &>/dev/null; then
    print_ok "git found"
else
    print_err "git not found. Install with: sudo apt install git (Linux) or brew install git (macOS)"
    exit 1
fi

if command -v python3 &>/dev/null; then
    PY_VER=$(python3 --version 2>&1)
    PY_MAJOR=$(python3 -c 'import sys; print(sys.version_info[0])')
    PY_MINOR=$(python3 -c 'import sys; print(sys.version_info[1])')
    if [ "$PY_MAJOR" -lt 3 ] || ([ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 8 ]); then
        print_err "Python 3.8+ required, found $PY_VER"
        exit 1
    fi
    print_ok "Python: $PY_VER"
else
    print_err "Python 3 not found. Install Python 3.8+ first."
    exit 1
fi

if command -v claude &>/dev/null; then
    print_ok "Claude Code CLI found"
else
    print_warn "Claude Code CLI not detected."
    echo "         That's fine if you use the VS Code / JetBrains extension or the desktop app."
    echo "         To install: https://claude.com/claude-code"
fi

# ──────────────────────────────────────────────────────────────────────
# Step 2: API key setup
# ──────────────────────────────────────────────────────────────────────
print_step "2/4" "HeyGen API key setup..."

if [ -n "${HEYGEN_API_KEY:-}" ]; then
    print_ok "HEYGEN_API_KEY environment variable is set (will be used at runtime)"
elif [ -f "$CONFIG_PATH" ]; then
    print_ok "Existing config found at $CONFIG_PATH"
else
    echo ""
    echo "  Get your key from: https://app.heygen.com/settings/api"
    echo "  (Free signup, \$5 minimum balance for first paid generation)"
    echo ""
    ask "Paste your HeyGen API key now (or press Enter to skip and set HEYGEN_API_KEY later):"
    if [ -n "$REPLY" ]; then
        mkdir -p "$HEYGEN_DIR"
        chmod 700 "$HEYGEN_DIR"
        # Use python json.dumps to escape the key safely
        API_KEY="$REPLY" python3 <<'PYEOF'
import json, os
key = os.environ["API_KEY"]
config_path = os.environ.get("CONFIG_PATH", os.path.expanduser("~/.heygen/config.json"))
fd = os.open(config_path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
with os.fdopen(fd, "w") as f:
    json.dump({"api_key": key}, f, indent=2)
    f.write("\n")
PYEOF
        chmod 600 "$CONFIG_PATH" 2>/dev/null || true
        print_ok "API key saved to $CONFIG_PATH (chmod 600)"
    else
        print_warn "Skipped. Set HEYGEN_API_KEY env var before running the skill."
    fi
fi

# ──────────────────────────────────────────────────────────────────────
# Step 3: Install skill (symlink)
# ──────────────────────────────────────────────────────────────────────
print_step "3/4" "Installing Claude Code skill..."

mkdir -p "$TARGET_DIR"
SKILL_SRC="$SKILLS_DIR/lipnardo"
SKILL_TARGET="$TARGET_DIR/lipnardo"

if [ ! -d "$SKILL_SRC" ]; then
    print_err "Skill source not found at $SKILL_SRC"
    exit 1
fi

if [ -L "$SKILL_TARGET" ]; then
    rm "$SKILL_TARGET"
elif [ -d "$SKILL_TARGET" ]; then
    backup="$SKILL_TARGET.backup.$(date +%Y%m%d%H%M%S)"
    mv "$SKILL_TARGET" "$backup"
    print_warn "Existing installation moved to $backup"
fi

ln -s "$SKILL_SRC" "$SKILL_TARGET"
chmod +x "$SKILL_SRC/scripts/"*.py 2>/dev/null || true
mkdir -p "$OUTPUT_DIR"

print_ok "Skill linked: $SKILL_TARGET -> $SKILL_SRC"
print_ok "Output folder: $OUTPUT_DIR"

# ──────────────────────────────────────────────────────────────────────
# Step 4: Verify
# ──────────────────────────────────────────────────────────────────────
print_step "4/4" "Verifying installation..."

ALL_OK=true

if [ -L "$SKILL_TARGET" ] && [ -d "$SKILL_TARGET" ]; then
    print_ok "Skill linked to Claude Code"
else
    print_err "Skill symlink missing or broken"
    ALL_OK=false
fi

# Try the validator script
if python3 "$SKILL_SRC/scripts/validate_setup.py" 2>&1 | grep -qE '"(success|api_key)":\s*true'; then
    print_ok "API connectivity verified"
else
    print_warn "API connectivity not verified -- run: python3 $SKILL_SRC/scripts/validate_setup.py"
fi

echo ""
if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}${BOLD}  ================================================================"
    echo "      Installation Complete!"
    echo "  ================================================================${NC}"
    echo ""
    echo "  Your videos will be saved to: $OUTPUT_DIR"
    echo ""
    echo -e "  ${BOLD}How to use:${NC}"
    echo "  Open Claude Code and type any of these:"
    echo ""
    echo "    \"Generate a 30-second avatar video saying: Welcome to Acme\""
    echo "    \"/lipnardo generate --prompt 'A professional explaining quarterly results'\""
    echo "    \"/lipnardo credits\""
    echo "    \"/lipnardo setup\""
    echo ""
    echo -e "  ${BOLD}First-time tip:${NC} use --test true for free watermarked iterations."
    echo ""
    echo -e "  ${BOLD}To uninstall:${NC} bash $SCRIPT_DIR/uninstall.sh"
else
    echo -e "${YELLOW}${BOLD}  Installation finished with warnings. See above.${NC}"
fi
echo ""
