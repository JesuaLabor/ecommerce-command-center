#!/usr/bin/env bash

# ============================================================
#  run_project.sh — eCommerce Command Center
#  Usage: ./run_project.sh [--build | --preview | --help]
# ============================================================

set -euo pipefail

# ── Colors ──────────────────────────────────────────────────
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

# ── Banner ───────────────────────────────────────────────────
echo -e ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}║   eCommerce Command Center – Dev Launcher    ║${RESET}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════╝${RESET}"
echo -e ""

# ── Help ─────────────────────────────────────────────────────
usage() {
  echo -e "${BOLD}Usage:${RESET}"
  echo -e "  ${GREEN}./run_project.sh${RESET}            Start the dev server (default)"
  echo -e "  ${GREEN}./run_project.sh --build${RESET}    Build for production"
  echo -e "  ${GREEN}./run_project.sh --preview${RESET}  Preview the production build locally"
  echo -e "  ${GREEN}./run_project.sh --help${RESET}     Show this help message"
  echo -e ""
}

# ── Parse args ───────────────────────────────────────────────
MODE="dev"
if [[ $# -gt 0 ]]; then
  case "$1" in
    --build)   MODE="build" ;;
    --preview) MODE="preview" ;;
    --help|-h) usage; exit 0 ;;
    *)
      echo -e "${RED}Unknown option: $1${RESET}"
      usage
      exit 1
      ;;
  esac
fi

# ── Node.js check ────────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js is not installed. Please install Node.js (v18+) and try again.${RESET}"
  exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✔ Node.js${RESET} ${NODE_VERSION} detected"

# ── npm check ────────────────────────────────────────────────
if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm is not installed. Please install npm and try again.${RESET}"
  exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✔ npm${RESET} v${NPM_VERSION} detected"

# ── Install dependencies if needed ───────────────────────────
if [ ! -d "node_modules" ]; then
  echo -e ""
  echo -e "${YELLOW}⚙ node_modules not found. Installing dependencies...${RESET}"
  npm install
  echo -e "${GREEN}✔ Dependencies installed successfully${RESET}"
else
  echo -e "${GREEN}✔ node_modules${RESET} already present, skipping install"
fi

echo -e ""

# ── Run the selected mode ────────────────────────────────────
case "$MODE" in
  dev)
    echo -e "${CYAN}${BOLD}▶ Starting development server...${RESET}"
    echo -e "${YELLOW}  URL: http://localhost:5173${RESET}"
    echo -e "${YELLOW}  Press Ctrl+C to stop.${RESET}"
    echo -e ""
    npm run dev
    ;;
  build)
    echo -e "${CYAN}${BOLD}▶ Building production bundle...${RESET}"
    npm run build
    echo -e ""
    echo -e "${GREEN}✔ Build complete! Output is in the ${BOLD}dist/${RESET}${GREEN} directory.${RESET}"
    ;;
  preview)
    echo -e "${CYAN}${BOLD}▶ Previewing production build...${RESET}"
    echo -e "${YELLOW}  Make sure you have run --build first.${RESET}"
    echo -e ""
    npm run preview
    ;;
esac
