/**
 * settings.js — REST routes for the single app-settings document.
 * Mounted at: /api/settings
 *
 * Endpoints:
 *   GET  /api/settings            read the settings doc (creates default if missing)
 *   PUT  /api/settings            update subscriberCount and/or milestoneDates
 *   POST /api/settings            beacon fallback (sendBeacon = POST only); same as PUT
 */

const express = require("express");
const router  = express.Router();
const Settings = require("../models/Settings");
const { SINGLETON_KEY, CANONICAL_ROTATION } = Settings;
const { LANES } = require("../models/RetroWeek");

// Lanes allowed in a rotation (the 10 named lanes; not the "" empty value).
const NAMED_LANES = new Set(LANES.filter(Boolean));

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Get-or-create the singleton.
async function getDoc() {
  let doc = await Settings.findOne({ key: SINGLETON_KEY });
  if (!doc) doc = await Settings.create({ key: SINGLETON_KEY });
  return doc;
}

// Shape the response so the client never sees the Mongo Map wrapper.
function serialize(doc) {
  // Self-heal the rotation: anything missing/short/duplicated falls back to canonical.
  const rot = Array.isArray(doc.rotationLanes) ? doc.rotationLanes.filter((l) => NAMED_LANES.has(l)) : [];
  const rotationLanes = rot.length === 7 && new Set(rot).size === 7 ? rot : [...CANONICAL_ROTATION];
  return {
    subscriberCount: doc.subscriberCount ?? 0,
    milestoneDates: doc.milestoneDates ? Object.fromEntries(doc.milestoneDates) : {},
    rotationLanes,
    updatedAt: doc.updatedAt,
  };
}

// ── Read ───────────────────────────────────────────────────────────────────────
router.get("/", async (_req, res) => {
  try {
    const doc = await getDoc();
    res.json({ success: true, data: serialize(doc) });
  } catch (err) {
    console.error("GET /api/settings", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Update ─────────────────────────────────────────────────────────────────────
// Body: { subscriberCount?, milestoneDates? }
// milestoneDates is a full replacement map; "" or null value clears that key.
async function updateHandler(req, res) {
  try {
    const { subscriberCount, milestoneDates, rotationLanes } = req.body ?? {};
    const doc = await getDoc();

    if (rotationLanes !== undefined) {
      if (!Array.isArray(rotationLanes) || rotationLanes.length !== 7) {
        return res.status(400).json({ success: false, error: "rotationLanes must be an array of exactly 7 lanes" });
      }
      const bad = rotationLanes.filter((l) => !NAMED_LANES.has(l));
      if (bad.length) {
        return res.status(400).json({ success: false, error: `Unknown lane(s): ${bad.join(", ")}` });
      }
      if (new Set(rotationLanes).size !== 7) {
        return res.status(400).json({ success: false, error: "rotationLanes must not contain duplicates" });
      }
      doc.rotationLanes = rotationLanes;
    }

    if (subscriberCount !== undefined) {
      const n = Math.max(0, Math.round(Number(subscriberCount) || 0));
      doc.subscriberCount = n;
    }

    if (milestoneDates !== undefined && milestoneDates !== null) {
      if (typeof milestoneDates !== "object") {
        return res.status(400).json({ success: false, error: "milestoneDates must be an object" });
      }
      // Validate + apply as a full replacement.
      const next = new Map();
      for (const [phaseId, date] of Object.entries(milestoneDates)) {
        if (date && ISO_DATE.test(date)) next.set(String(phaseId), date);
        // empty / invalid → omitted (i.e. cleared)
      }
      doc.milestoneDates = next;
    }

    await doc.save();
    res.json({ success: true, data: serialize(doc) });
  } catch (err) {
    console.error("PUT /api/settings", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

router.put("/", updateHandler);
// Beacon fallback (navigator.sendBeacon can only POST).
router.post("/", updateHandler);

module.exports = router;
