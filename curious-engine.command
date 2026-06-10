#!/usr/bin/env bash
# Curious Engine — macOS double-click launcher
# Uses shared Caddy daemon — multiple apps can run simultaneously.

cd "$(dirname "$0")"

ROOT_DIR="$(pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"
CADDY_MGR="$HOME/Documents/Caddy/caddy-manager.sh"
DOMAIN="curious-engine.pro"
URL="https://$DOMAIN"

# ── Cleanup trap ─────────────────────────────────────────────────────────────
trap 'echo -e "\n\033[1;33mShutting down Curious Engine...\033[0m"
      echo -e "\033[2m(Caddy keeps running — stop it with: ~/Documents/Caddy/caddy-manager.sh stop)\033[0m"
      kill -TERM $SERVER_PID $CLIENT_PID 2>/dev/null
      [[ -n "$MONGO_PID" ]] && kill "$MONGO_PID" 2>/dev/null
      wait $SERVER_PID $CLIENT_PID 2>/dev/null
      tput cnorm
      exit' INT TERM

# ── Ensure dependencies ───────────────────────────────────────────────────────
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo -e "\n\033[1;33m[Curious Engine] Installing server dependencies...\033[0m"
  (cd "$SERVER_DIR" && npm install)
fi
if [ ! -d "$CLIENT_DIR/node_modules" ]; then
  echo -e "\n\033[1;33m[Curious Engine] Installing client dependencies...\033[0m"
  (cd "$CLIENT_DIR" && npm install)
fi

# ── Ensure /etc/hosts entry ───────────────────────────────────────────────────
if ! grep -q "$DOMAIN" /etc/hosts 2>/dev/null; then
  echo -e "\033[1;33m[hosts]\033[0m Adding $DOMAIN → 127.0.0.1 (requires sudo)"
  echo "127.0.0.1  $DOMAIN" | sudo tee -a /etc/hosts > /dev/null
fi

# ── Clear screen & banner ─────────────────────────────────────────────────────
clear
tput civis

echo -e "\n"
echo -e "\033[38;2;99;179;237m   ╔══════════════════════════════════════════════════════════╗\033[0m"
echo -e "\033[38;2;99;179;237m   ║                                                          ║\033[0m"
echo -e "\033[38;2;99;179;237m   ║   \033[1;37mCurious Engine\033[0m\033[38;2;99;179;237m  ✦  Local Dev Launcher                  ║\033[0m"
echo -e "\033[38;2;99;179;237m   ║   \033[38;5;245mhttps://curious-engine.pro\033[0m\033[38;2;99;179;237m                             ║\033[0m"
echo -e "\033[38;2;99;179;237m   ╚══════════════════════════════════════════════════════════╝\033[0m"
echo -e "\n  \033[38;5;245mInitializing engines...\033[0m\n"

# ── Start MongoDB ────────────────────────────────────────────────────────────
MONGO_DBPATH="/Users/piyushlawatre/data/db"
MONGO_PID=""
if pgrep -x mongod &>/dev/null; then
  echo -e "\033[0;32m[MongoDB]\033[0m Already running ✓"
else
  echo -e "\033[0;32m[MongoDB]\033[0m Starting mongod..."
  mongod --dbpath="$MONGO_DBPATH" >> /tmp/mongod.log 2>&1 &
  MONGO_PID=$!
  for i in $(seq 1 10); do
    sleep 0.5
    pgrep -x mongod &>/dev/null && break
  done
  if pgrep -x mongod &>/dev/null; then
    echo -e "\033[0;32m[MongoDB]\033[0m Started ✓"
  else
    echo -e "\033[0;31m[MongoDB]\033[0m Failed to start — check: $MONGO_DBPATH"
    echo -e "\033[0;31m[MongoDB]\033[0m Log: /tmp/mongod.log"
    exit 1
  fi
fi

# ── Start backend ─────────────────────────────────────────────────────────────
(cd "$SERVER_DIR" && npm run dev 2>&1 | sed $'s/^/\033[0;32m[Backend] \033[0m/') &
SERVER_PID=$!

# ── Start frontend ────────────────────────────────────────────────────────────
(cd "$CLIENT_DIR" && npm run dev 2>&1 | sed $'s/^/\033[0;36m[Frontend]\033[0m /') &
CLIENT_PID=$!

# ── Start/reload shared Caddy (won't start a second instance if already up) ───
bash "$CADDY_MGR" start

# ── Sweeping loader while waiting for app ─────────────────────────────────────
width=44
pos=0
dir=1
i=0
c_glow="\033[38;2;99;179;237m"
c_dim="\033[38;2;49;89;117m"
c_bg="\033[38;5;236m"
reset="\033[0m"

while true; do
    if (( i % 10 == 0 )); then
        code=$(curl -k -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null)
        if [[ "$code" == "200" || "$code" == "301" || "$code" == "302" || "$code" == "304" ]]; then
            break
        fi
    fi

    bar=""
    for ((j=0; j<width; j++)); do
        if (( j == pos )); then
            bar+="\033[1;37m█${reset}"
        elif (( j == pos - 1 || j == pos + 1 )); then
            bar+="${c_glow}▓${reset}"
        elif (( j == pos - 2 || j == pos + 2 )); then
            bar+="${c_dim}▒${reset}"
        else
            bar+="${c_bg}░${reset}"
        fi
    done

    spinner=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
    spin=${spinner[$((i % 10))]}
    printf "\r\033[K  ${c_glow}${spin}${reset} [ %b ] Starting up..." "$bar"

    pos=$((pos + dir))
    if (( pos == width - 1 )); then dir=-1; fi
    if (( pos == 0 )); then dir=1; fi

    sleep 0.05
    ((i++))
done

printf "\r\033[K  \033[38;2;50;205;50m✔\033[0m [ \033[38;2;50;205;50m████████████████████████████████████████████\033[0m ] Online!\n"
echo -e "\n  \033[36m🌐 Launching $URL ...\033[0m\n"

tput cnorm
open "$URL"
sleep 1

# ── Final summary ─────────────────────────────────────────────────────────────
clear
echo -e "\n"
echo -e "      \033[38;2;99;179;237m✨  C U R I O U S   E N G I N E   I S   L I V E  ✨\033[0m"
echo -e "    \033[38;2;99;179;237m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo -e "      \033[1mApp:\033[0m       \033[4;36mhttps://curious-engine.pro\033[0m"
echo -e "      \033[1mFrontend:\033[0m  \033[36mhttp://localhost:5174\033[0m"
echo -e "      \033[1mAPI:\033[0m       \033[36mhttp://localhost:5001\033[0m"
echo -e "      \033[1mCaddy:\033[0m     shared daemon (~/Documents/Caddyfile)"
echo -e "      \033[1mLocation:\033[0m  $ROOT_DIR"
echo -e "    \033[38;2;99;179;237m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo ""
echo -e "      \033[1;31mCtrl+C stops backend + frontend  •  Caddy stays running\033[0m"
echo -e "      \033[2mTo stop Caddy: ~/Documents/Caddy/caddy-manager.sh stop\033[0m"
echo -e "\n"

wait $SERVER_PID $CLIENT_PID
