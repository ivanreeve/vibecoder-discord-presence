#!/usr/bin/env bash
#
# Vibecoder Discord Presence — one-line setup for Claude Code.
#
#   curl -fsSL https://raw.githubusercontent.com/ivanreeve/vibecoder-discord-presence/master/setup.sh | bash
#
# Clones (or updates) this fork, builds it, registers the Claude Code hooks, and
# installs the dynamic "developer" preset — a live readout of the model and
# reasoning effort you're actually running (e.g. "Using Opus 4.8 (Max)").
#
# Safe to re-run: any existing presence config is backed up before it's replaced.
# Works on macOS and Linux. Needs Node 18+, npm, and git, plus the Discord
# desktop app running for the status to appear.
#
# Environment overrides:
#   VDP_REPO           git URL to clone            (default: the ivanreeve fork)
#   VDP_BRANCH         branch to check out         (default: master)
#   VDP_HOME           where to install the tool   (default: ~/.vibecoder-discord-presence)
#   CLAUDE_CONFIG_DIR  Claude Code config dir      (default: ~/.claude; honored by vdp too)

set -euo pipefail

REPO="${VDP_REPO:-https://github.com/ivanreeve/vibecoder-discord-presence.git}"
BRANCH="${VDP_BRANCH:-master}"
INSTALL_DIR="${VDP_HOME:-$HOME/.vibecoder-discord-presence}"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
CONFIG_DEST="$CLAUDE_DIR/discord-presence/config.json"

# --- output helpers ----------------------------------------------------------
if [ -t 1 ]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; GRN=$'\033[32m'; YLW=$'\033[33m'; RED=$'\033[31m'; RST=$'\033[0m'
else
  BOLD=''; DIM=''; GRN=''; YLW=''; RED=''; RST=''
fi
step() { printf '%s==>%s %s\n' "$GRN" "$RST" "$*"; }
warn() { printf '%s!%s   %s\n' "$YLW" "$RST" "$*"; }
die()  { printf '%serror:%s %s\n' "$RED" "$RST" "$*" >&2; exit 1; }

# --- guard against a footgun VDP_HOME (we rm -rf it on a fresh clone) ---------
case "$INSTALL_DIR" in
  '' | '/' | "$HOME") die "refusing to use '$INSTALL_DIR' as the install dir; set VDP_HOME to a dedicated folder." ;;
esac

# --- preflight ---------------------------------------------------------------
step "Checking prerequisites"
command -v git  >/dev/null 2>&1 || die "git is required. On macOS run: xcode-select --install"
command -v node >/dev/null 2>&1 || die "Node.js 18+ is required. Install from https://nodejs.org (or: brew install node)."
command -v npm  >/dev/null 2>&1 || die "npm is required (it ships with Node.js)."

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 18 ] || die "Node.js 18+ required; found $(node -v)."
printf '%s   node %s, %s%s\n' "$DIM" "$(node -v)" "$(git --version | awk '{print $3}')" "$RST"

# --- fetch / update ----------------------------------------------------------
if [ -d "$INSTALL_DIR/.git" ]; then
  step "Updating existing install at $INSTALL_DIR"
  git -C "$INSTALL_DIR" fetch --quiet --depth 1 origin "$BRANCH"
  git -C "$INSTALL_DIR" checkout --quiet -B "$BRANCH" "origin/$BRANCH"
  git -C "$INSTALL_DIR" reset --hard --quiet "origin/$BRANCH"
else
  step "Cloning $REPO"
  rm -rf "$INSTALL_DIR"
  git clone --quiet --branch "$BRANCH" --depth 1 "$REPO" "$INSTALL_DIR"
fi

# --- build -------------------------------------------------------------------
step "Installing dependencies (this can take a minute)"
( cd "$INSTALL_DIR" && npm install --include=dev --no-fund --no-audit --loglevel=error )

step "Building"
( cd "$INSTALL_DIR" && npm run build --silent )
[ -f "$INSTALL_DIR/dist/vdp.js" ] || die "build did not produce dist/vdp.js"

# --- register the Claude Code hooks ------------------------------------------
step "Registering Claude Code hooks"
node "$INSTALL_DIR/dist/vdp.js" install

# --- install the dynamic developer preset ------------------------------------
PRESET="$INSTALL_DIR/presets/developer.json"
if [ -f "$PRESET" ]; then
  mkdir -p "$(dirname "$CONFIG_DEST")"
  if [ -f "$CONFIG_DEST" ] && ! cmp -s "$PRESET" "$CONFIG_DEST"; then
    BACKUP="$CONFIG_DEST.$(date +%Y%m%d-%H%M%S).bak"
    cp "$CONFIG_DEST" "$BACKUP"
    warn "existing config backed up -> $BACKUP"
  fi
  cp "$PRESET" "$CONFIG_DEST"
  printf '%s   preset installed -> %s%s\n' "$DIM" "$CONFIG_DEST" "$RST"
else
  warn "preset not found at $PRESET — kept the default config"
fi

# --- done --------------------------------------------------------------------
step "${BOLD}Done!${RST}"
cat <<EOF

  Your presence uses the ${BOLD}developer${RST} theme with a live model + effort readout, e.g.
    ${DIM}Editing index.ts · Using Opus 4.8 (Max)${RST}

  Next:
    1. Make sure the ${BOLD}Discord desktop app${RST} is running.
    2. Open Claude Code — your status appears on its own.

  Customize:  node "$INSTALL_DIR/dist/vdp.js" config
  Uninstall:  node "$INSTALL_DIR/dist/vdp.js" uninstall --purge
EOF
