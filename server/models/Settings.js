/**
 * Settings.js — single app-settings document (channel-level state).
 *
 * Holds the manually-tracked values that drive the calendar's growth header:
 *   • subscriberCount — current subs (drives the phase rail).
 *   • milestoneDates  — map of phaseId -> "YYYY-MM-DD" when that milestone was logged.
 *
 * Single-user app: there is exactly one doc, addressed by a fixed key.
 * To go multi-user later, replace `key` with a userId and scope reads/writes.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const SINGLETON_KEY = "app";

// The 7 canonical rotation lanes — the default weekly-cycle rotation. A proposed
// lane graduates by SWAPPING IN for one of these via the retro's Probation panel
// (the cycle always stays 7 lanes; see FORMAT_LANES.md § Lane graduation).
const CANONICAL_ROTATION = [
  "Real Reason", "Hidden India", "Smart Money/Business", "Science Lite",
  "Sharp Contradiction", "Viral Social Commentary", "One-off",
];

const SettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: SINGLETON_KEY },

    subscriberCount: { type: Number, default: 0, min: 0 },

    // { "1": "2026-05-01", "2": "", ... } — empty/absent = not logged.
    milestoneDates: { type: Map, of: String, default: {} },

    // The CURRENT 7-lane rotation (ordered like CANONICAL_ROTATION). Differs from
    // canonical only when a proposed lane has graduated in (1:1 swap).
    rotationLanes: { type: [String], default: () => [...CANONICAL_ROTATION] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", SettingsSchema);
module.exports.SINGLETON_KEY = SINGLETON_KEY;
module.exports.CANONICAL_ROTATION = CANONICAL_ROTATION;
