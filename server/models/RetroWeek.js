/**
 * RetroWeek.js — one weekly performance retro.
 *
 * A retro is identified by its weekStart ("YYYY-MM-DD", the Monday of the week).
 * It holds the per-video performance rows the user reviews, free-text learnings,
 * and a verdict per video. Lane weighting for next week is computed from the rows
 * at read time (see routes/retro.js) so it always reflects the latest edits.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const LANES = [
  "Real Reason", "Hidden India", "Smart Money/Business",
  "Science Lite", "Sharp Contradiction", "Viral Social Commentary", "One-off",
  "Forgotten Inventor", "Quiet Monopoly", "Status Game", "",
];

const VERDICTS = ["double-down", "keep-testing", "avoid", ""];

// One reviewed video inside a weekly retro.
const VideoPerfSchema = new Schema(
  {
    title:    { type: String, default: "" },
    lane:     { type: String, enum: LANES, default: "" },
    platform: { type: String, default: "youtube" },
    // When the video went live ("YYYY-MM-DD"). Lets the app flag videos that have
    // reached the retro's review age and are ready to be scored fairly.
    postedDate: { type: String, default: "" },

    // Manually-entered performance metrics. All optional — log what you have.
    views:      { type: Number, default: 0, min: 0 },
    watchPct:   { type: Number, default: 0, min: 0, max: 100 }, // watch-through %
    likes:      { type: Number, default: 0, min: 0 },
    comments:   { type: Number, default: 0, min: 0 },
    shares:     { type: Number, default: 0, min: 0 },

    verdict:  { type: String, enum: VERDICTS, default: "" },
    note:     { type: String, default: "" },
  },
  { _id: false }
);

const RetroWeekSchema = new Schema(
  {
    // Monday of the reviewed week, "YYYY-MM-DD".
    weekStart: { type: String, required: true, unique: true, match: /^\d{4}-\d{2}-\d{2}$/ },

    videos:    { type: [VideoPerfSchema], default: [] },

    // Qualitative review of the week as a whole.
    learnings: { type: String, default: "" },
    // The decided plan for next week (what to post more / avoid).
    nextWeekPlan: { type: String, default: "" },
  },
  { timestamps: true }
);

RetroWeekSchema.index({ weekStart: -1 });

module.exports = mongoose.model("RetroWeek", RetroWeekSchema);
module.exports.LANES = LANES;
module.exports.VERDICTS = VERDICTS;
