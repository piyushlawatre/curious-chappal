/**
 * ScheduleEntry.js — one assigned posting slot on the content calendar.
 *
 * A slot is identified by (date, slotKey). Assigning an idea to a slot creates
 * or updates one of these. "Posted" status drives the posting-history timeline.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const SLOT_STATUSES = ["planned", "posted", "skipped"];
const PLATFORMS = ["youtube", "instagram", "linkedin", "x", "facebook"];

const ScheduleEntrySchema = new Schema(
  {
    // Local calendar date "YYYY-MM-DD" (no time component — the slot carries the time).
    date:     { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    // Stable slot key within the day, e.g. "youtube-short", "instagram-native".
    slotKey:  { type: String, required: true },
    platform: { type: String, enum: PLATFORMS, default: "youtube" },
    // Posting time in IST "HH:MM" — snapshot from the schedule template at assign time.
    timeIST:  { type: String, default: "" },

    // The idea filling this slot (optional — a slot can be marked posted/skipped without one).
    idea:     { type: Schema.Types.ObjectId, ref: "Idea", default: null },
    // Denormalised snapshots so the calendar renders without a join and survives idea deletion.
    ideaTitle: { type: String, default: "" },
    laneAtAssign: { type: String, default: "" },

    status:   { type: String, enum: SLOT_STATUSES, default: "planned" },
    postedAt: { type: String, default: "" },
    notes:    { type: String, default: "" },
  },
  { timestamps: true }
);

// One assignment per (date, slot).
ScheduleEntrySchema.index({ date: 1, slotKey: 1 }, { unique: true });
ScheduleEntrySchema.index({ idea: 1 });
ScheduleEntrySchema.index({ status: 1 });

module.exports = mongoose.model("ScheduleEntry", ScheduleEntrySchema);
module.exports.SLOT_STATUSES = SLOT_STATUSES;
module.exports.PLATFORMS = PLATFORMS;
