#!/bin/bash

# ─────────────────────────────────────────────────────────────────────────────
#  Curious Engine — single launcher
#  Starts Express backend + Vite frontend, then starts/reloads shared Caddy.
#  Local domain: https://curious-engine.pro
#
#  Uses a shared Caddy daemon so multiple local apps can coexist on port 443.
#  Global Caddyfile: ~/Documents/Caddy/Caddyfile
#  Manager script:   ~/Documents/Caddy/caddy-manager.sh
# ─────────────────────────────────────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"
CADDY_MGR="$HOME/Documents/Caddy/caddy-manager.sh"
DOMAIN="curious-engine.pro"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; BOLD='\033[1m'; RESET='\033[0m'

SERVER_PID=""
CLIENT_PID=""
MONGO_PID=""

cleanup() {
  echo -e "\n${YELLOW}Shutting down Curious Engine services...${RESET}"
  echo -e "${YELLOW}(Caddy keeps running — stop it with: ~/Documents/Caddy/caddy-manager.sh stop)${RESET}"
  [[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" 2>/dev/null
  [[ -n "$CLIENT_PID" ]] && kill "$CLIENT_PID" 2>/dev/null
  [[ -n "$MONGO_PID"  ]] && kill "$MONGO_PID" 2>/dev/null
  wait 2>/dev/null
  echo -e "${GREEN}Done.${RESET}"
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo -e "${BOLD}${CYAN}"
echo "  ╔══════════════════════════════════════════╗"
echo "  ║         Curious Engine Launcher          ║"
echo "  ║    https://curious-engine.pro          ║"
echo "  ╚══════════════════════════════════════════╝"
echo -e "${RESET}"

# ── 1. Ensure Caddy is installed ─────────────────────────────────────────────
if ! command -v caddy &>/dev/null; then
  echo -e "${YELLOW}[Caddy]${RESET} Not found — installing via Homebrew..."
  if ! command -v brew &>/dev/null; then
    echo -e "${RED}[Error]${RESET} Homebrew is required to install Caddy."
    echo "  Install it from https://brew.sh then re-run this script."
    exit 1
  fi
  brew install caddy
fi

CADDY_VERSION=$(caddy version 2>/dev/null | head -1)
echo -e "${MAGENTA}[Caddy]${RESET}    $CADDY_VERSION (shared daemon)"

# ── 2. Check shared manager exists ───────────────────────────────────────────
if [[ ! -f "$CADDY_MGR" ]]; then
  echo -e "${RED}[Error]${RESET} Shared Caddy manager not found at $CADDY_MGR"
  exit 1
fi

# ── 3. Add /etc/hosts entry if missing ───────────────────────────────────────
if ! grep -q "$DOMAIN" /etc/hosts 2>/dev/null; then
  echo -e "${YELLOW}[hosts]${RESET} Adding $DOMAIN → 127.0.0.1 (requires sudo)"
  echo "127.0.0.1  $DOMAIN" | sudo tee -a /etc/hosts > /dev/null
  echo -e "${GREEN}[hosts]${RESET} Entry added."
else
  echo -e "${GREEN}[hosts]${RESET} $DOMAIN already in /etc/hosts ✓"
fi

# ── 4. Trust Caddy's local CA (first run only) ────────────────────────────────
caddy trust 2>/dev/null || true

# ── 4.5. MongoDB ─────────────────────────────────────────────────────────────
MONGO_DBPATH="/Users/piyushlawatre/data/db"
if pgrep -x mongod &>/dev/null; then
  echo -e "${GREEN}[MongoDB]${RESET} Already running ✓"
else
  echo -e "${GREEN}[MongoDB]${RESET} Starting mongod (dbpath: $MONGO_DBPATH)..."
  mongod --dbpath="$MONGO_DBPATH" >> /tmp/mongod.log 2>&1 &
  MONGO_PID=$!
  for i in $(seq 1 10); do
    sleep 0.5
    pgrep -x mongod &>/dev/null && break
  done
  if pgrep -x mongod &>/dev/null; then
    echo -e "${GREEN}[MongoDB]${RESET} Started ✓"
  else
    echo -e "${RED}[MongoDB]${RESET} Failed to start — check dbpath: $MONGO_DBPATH"
    echo -e "${RED}[MongoDB]${RESET} Log: /tmp/mongod.log"
    exit 1
  fi
fi

# ── 5. Backend ────────────────────────────────────────────────────────────────
echo -e "${GREEN}[Backend]${RESET} Installing dependencies..."
(cd "$SERVER_DIR" && npm install --silent)

echo -e "${GREEN}[Backend]${RESET} Starting Express on :5001..."
(cd "$SERVER_DIR" && npm run dev 2>&1 | sed $'s/^/\033[0;32m[Backend]\033[0m /') &
SERVER_PID=$!

# ── 6. Frontend ───────────────────────────────────────────────────────────────
echo -e "${CYAN}[Frontend]${RESET} Installing dependencies..."
(cd "$CLIENT_DIR" && npm install --silent)

echo -e "${CYAN}[Frontend]${RESET} Starting Vite on :5174..."
(cd "$CLIENT_DIR" && npm run dev 2>&1 | sed $'s/^/\033[0;36m[Frontend]\033[0m /') &
CLIENT_PID=$!

# ── 7. Wait for Vite and backend to bind before starting Caddy ───────────────
echo -e "${MAGENTA}[Caddy]${RESET} Waiting for services to be ready..."
for i in $(seq 1 20); do
  sleep 0.5
  BACKEND_UP=false
  FRONTEND_UP=false
  curl -sf http://localhost:5001/health -o /dev/null 2>/dev/null && BACKEND_UP=true
  curl -sf http://127.0.0.1:5174       -o /dev/null 2>/dev/null && FRONTEND_UP=true
  if $BACKEND_UP && $FRONTEND_UP; then break; fi
done

# ── 8. Start/reload shared Caddy daemon ──────────────────────────────────────
echo -e "${MAGENTA}[Caddy]${RESET} Starting shared Caddy daemon..."
bash "$CADDY_MGR" start

echo ""
echo -e "${BOLD}${GREEN}  ✓ All servers running${RESET}"
echo -e "  ${BOLD}App:${RESET}     https://$DOMAIN"
echo -e "  ${BOLD}API:${RESET}     https://$DOMAIN/api/ideas"
echo -e "  ${BOLD}Health:${RESET}  https://$DOMAIN/health"
echo -e "  ${BOLD}Caddy:${RESET}   shared — ~/Documents/Caddy/Caddyfile"
echo ""
echo -e "${YELLOW}  Press Ctrl+C to stop backend + frontend (Caddy stays running).${RESET}\n"

wait "$SERVER_PID" "$CLIENT_PID"
