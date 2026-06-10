/**
 * index.js — Express server entry point
 *
 * Start with:   node index.js   or   npm run dev
 * Default port: 5001 (avoids macOS AirPlay Receiver on 5000)
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const ideasRouter = require("./routes/ideas");
const scheduleRouter = require("./routes/schedule");
const retroRouter = require("./routes/retro");
const lanePlanRouter = require("./routes/lanePlan");
const settingsRouter = require("./routes/settings");

const PORT = process.env.PORT || 5001;

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

// CORS allow-list.
//
// Defaults cover local dev (localhost / 127.0.0.1 on any port) plus every
// curious-engine.* hostname used across the stack — the Caddyfile serves
// `curious-engine.test`, while older configs referenced `.pro` / `.local`, so we
// accept all three rather than letting a hostname drift break every API call.
//
// Override in production by setting CLIENT_ORIGINS to a comma-separated list of
// exact origins (e.g. "https://app.example.com,https://example.com"); when set,
// ONLY those origins (plus no-origin tool requests) are allowed.
const DEFAULT_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1|curious-engine\.(pro|local|test))(:\d+)?$/;

const explicitOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (explicitOrigins.length > 0) return explicitOrigins.includes(origin);
  return DEFAULT_ORIGIN_RE.test(origin);
}

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, server-to-server, beacons).
      if (!origin || isAllowedOrigin(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" })); // steps + inline knowledge-file snapshots; worst-case ~1.2 MB

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API routes ─────────────────────────────────────────────────────────────────

app.use("/api/ideas", ideasRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/retro", retroRouter);
app.use("/api/lane-plan", lanePlanRouter);
app.use("/api/settings", settingsRouter);

// Note: analytics is a sub-route under /api/ideas
// GET /api/ideas/analytics/summary  → handled by ideasRouter

// ── 404 fallback ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: err.message || "Internal server error" });
});

// ── Boot ──────────────────────────────────────────────────────────────────────

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
      console.log(`    API:  http://localhost:${PORT}/api/ideas`);
      console.log(`    Analytics: http://localhost:${PORT}/api/ideas/analytics/summary`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
