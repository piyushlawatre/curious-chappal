# Curious Engine

The content pipeline behind the **Curious Chappal** YouTube Shorts channel — idea
intake to posted video, with a performance feedback loop that plans the next cycle.

## What it does

- **Ideas board** — capture topics, tag a format lane, track each idea through a
  4-step AI workflow (topic evaluation → script → audit/finalize → editor brief).
  Every step snapshots its prompts, outputs, and the knowledge-base files used.
- **Calendar** — a 2-week A+B posting cycle: 7 Shorts, one per format lane, each
  matched to its day's audience (peak Wednesdays get the sharpest lanes).
- **Weekly Retro** — log each video's numbers; an India-tuned scoring model
  (watch-through 55 / shares 30 / engagement 15) blends the last 4 weeks and
  proposes the next cycle's lane split. Capped at a one-slot tilt — no lane dies
  from one bad week. Trial lanes graduate into the rotation by performing.
- **Dashboard** — lane coverage, pipeline health, and "what to make next".
- **Knowledge base** (`knowledge/`) — the channel's constitution, lane definitions,
  drafting guides, audit rubrics, and per-step prompts that power the workflow.

## Stack

React + TypeScript + Vite + Tailwind (client) · Express + Mongoose (server) ·
MongoDB · Caddy for local HTTPS.

## Run it

```bash
# everything (macOS): starts Mongo, server, client, Caddy
./curious-engine.command

# or by hand
cd server && npm install && npm run dev   # API on :5001
cd client && npm install && npm run dev   # Vite on :5174
```

Copy `server/.env.example` to `server/.env` and set your Mongo URI.
