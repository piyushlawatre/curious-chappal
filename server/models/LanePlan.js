/**
 * LanePlan.js — the lane assignment for one A+B cycle's 7 Shorts.
 *
 * Identified by cycleStart (the Monday of Week A that opens the cycle, "YYYY-MM-DD").
 * `lanes` is an ordered array of length up to 7: position i = the lane for cycle
 * Short i+1. When a plan exists for a cycle, the calendar uses it to override the
 * default SHORT_CYCLE rotation. Produced by applying a Weekly Retro's proposed
 * slot allocation.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const LanePlanSchema = new Schema(
  {
    cycleStart: { type: String, required: true, unique: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    // Ordered lane per cycle position (index 0 = Short 1 … index 6 = Short 7).
    lanes: { type: [String], default: [] },
    // Provenance: which retro week produced this plan (for traceability).
    sourceRetroWeek: { type: String, default: "" },
  },
  { timestamps: true }
);

LanePlanSchema.index({ cycleStart: -1 });

module.exports = mongoose.model("LanePlan", LanePlanSchema);
