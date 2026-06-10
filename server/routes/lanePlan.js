/**
 * lanePlan.js — REST routes for per-cycle lane plans.
 * Mounted at: /api/lane-plan
 *
 * Endpoints:
 *   GET /api/lane-plan/:cycleStart   the plan for a cycle (404 if none)
 *   PUT /api/lane-plan               upsert a plan { cycleStart, lanes[], sourceRetroWeek? }
 */

const express = require("express");
const router   = express.Router();
const LanePlan = require("../models/LanePlan");
const { LANES } = require("../models/RetroWeek");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
// Known lane names (includes proposed lanes and "" for an empty slot). Anything
// else is a typo or a stale client — reject instead of silently overriding the calendar.
const KNOWN_LANES = new Set(LANES);

// ── Get the plan for a cycle ────────────────────────────────────────────────────
router.get("/:cycleStart", async (req, res) => {
  try {
    const { cycleStart } = req.params;
    if (!ISO_DATE.test(cycleStart)) return res.status(400).json({ success: false, error: "cycleStart must be YYYY-MM-DD" });
    const doc = await LanePlan.findOne({ cycleStart }).lean();
    if (!doc) return res.status(404).json({ success: false, error: "No plan for that cycle" });
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error("GET /api/lane-plan/:cycleStart", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Upsert a plan ───────────────────────────────────────────────────────────────
// Body: { cycleStart, lanes: string[], sourceRetroWeek? }
router.put("/", async (req, res) => {
  try {
    const { cycleStart, lanes, sourceRetroWeek } = req.body ?? {};
    if (!cycleStart || !ISO_DATE.test(cycleStart)) {
      return res.status(400).json({ success: false, error: "Valid cycleStart (YYYY-MM-DD) is required" });
    }
    if (!Array.isArray(lanes)) {
      return res.status(400).json({ success: false, error: "lanes must be an array" });
    }
    const cleanLanes = lanes.slice(0, 7).map((l) => String(l ?? ""));
    const unknown = cleanLanes.filter((l) => !KNOWN_LANES.has(l));
    if (unknown.length) {
      return res.status(400).json({ success: false, error: `Unknown lane(s): ${unknown.join(", ")}` });
    }

    const doc = await LanePlan.findOneAndUpdate(
      { cycleStart },
      { $set: { cycleStart, lanes: cleanLanes, sourceRetroWeek: String(sourceRetroWeek ?? "") } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ success: true, data: doc });
  } catch (err) {
    console.error("PUT /api/lane-plan", err);
    if (err.code === 11000) {
      const doc = await LanePlan.findOne({ cycleStart: req.body.cycleStart }).lean();
      return res.json({ success: true, data: doc });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
