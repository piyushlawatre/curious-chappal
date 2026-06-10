/**
 * schedule.js — REST routes for the content posting calendar.
 * Mounted at: /api/schedule
 *
 * Endpoints:
 *   GET    /api/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD   list entries in range
 *   PUT    /api/schedule                                 upsert one slot assignment
 *   PATCH  /api/schedule/:id                             update status/notes
 *   DELETE /api/schedule/:id                             clear a slot
 */

const express = require("express");
const router  = express.Router();
const mongoose = require("mongoose");
const ScheduleEntry = require("../models/ScheduleEntry");
const Idea = require("../models/Idea");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// When the canonical YouTube Short for a day is marked POSTED and it carries an
// idea, that idea has shipped — reflect it on the Idea (videoMade) so it leaves the
// assignable pool, counts in Dashboard coverage, and the lifecycle advances. This
// closes the gap where calendar "posted" and Idea.videoMade were two disconnected
// signals. Auto-SET only — never auto-unset, so un-posting a slot can't wipe a
// "made" flag that may have been set deliberately elsewhere.
async function syncIdeaShipped(entry) {
  if (entry && entry.status === "posted" && entry.slotKey === "youtube-short" && entry.idea) {
    await Idea.findByIdAndUpdate(entry.idea, { $set: { videoMade: true } }).catch(() => {});
  }
}

// ── List entries in a date range ───────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;
    const q = {};
    if (from && ISO_DATE.test(from) && to && ISO_DATE.test(to)) {
      q.date = { $gte: from, $lte: to };
    } else if (from && ISO_DATE.test(from)) {
      q.date = { $gte: from };
    }
    const entries = await ScheduleEntry.find(q).sort({ date: 1, timeIST: 1 }).lean();
    res.json({ success: true, data: entries });
  } catch (err) {
    console.error("GET /api/schedule", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Upsert a slot assignment ───────────────────────────────────────────────────
// Body: { date, slotKey, platform?, timeIST?, ideaId?, status?, notes? }
router.put("/", async (req, res) => {
  try {
    const { date, slotKey, platform, timeIST, ideaId, status, notes, expectedIdea } = req.body;
    if (!date || !ISO_DATE.test(date)) return res.status(400).json({ success: false, error: "Valid date (YYYY-MM-DD) is required" });
    if (!slotKey) return res.status(400).json({ success: false, error: "slotKey is required" });

    const update = { date, slotKey };
    if (platform) update.platform = platform;
    if (typeof timeIST === "string") update.timeIST = timeIST;
    if (typeof notes === "string") update.notes = notes;
    if (status) update.status = status;

    // Resolve the idea and snapshot its title + lane (or clear the assignment).
    if (ideaId === null || ideaId === "") {
      update.idea = null;
      update.ideaTitle = "";
      update.laneAtAssign = "";
    } else if (ideaId) {
      if (!mongoose.Types.ObjectId.isValid(ideaId)) return res.status(400).json({ success: false, error: "Invalid ideaId" });
      const idea = await Idea.findById(ideaId).select("title formatLane").lean();
      if (!idea) return res.status(404).json({ success: false, error: "Idea not found" });
      update.idea = ideaId;
      update.ideaTitle = idea.title;
      update.laneAtAssign = idea.formatLane || "";
    }

    if (status === "posted") update.postedAt = update.postedAt || new Date().toISOString();
    if (status && status !== "posted") update.postedAt = "";

    // ── Optimistic concurrency guard ───────────────────────────────────────────
    // When the client passes `expectedIdea` (the idea id it believes occupies this
    // slot, or null for "I think it's empty"), reject if the slot has since been
    // filled by a *different* idea on another device/tab. This prevents one user
    // silently clobbering another's assignment. Omit `expectedIdea` to keep the
    // old last-write-wins behaviour.
    if (expectedIdea !== undefined) {
      const current = await ScheduleEntry.findOne({ date, slotKey }).select("idea").lean();
      const currentIdea = current?.idea ? String(current.idea) : null;
      const expected = expectedIdea ? String(expectedIdea) : null;
      if (currentIdea !== expected) {
        const conflict = await ScheduleEntry.findOne({ date, slotKey }).lean();
        return res.status(409).json({
          success: false,
          error: "This slot was changed on another device. Reload to see the latest, then try again.",
          data: conflict || null,
        });
      }
    }

    const entry = await ScheduleEntry.findOneAndUpdate(
      { date, slotKey },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    await syncIdeaShipped(entry);
    res.json({ success: true, data: entry });
  } catch (err) {
    console.error("PUT /api/schedule", err);
    if (err.code === 11000) {
      // Race on the unique index — fetch and return the winning row.
      const entry = await ScheduleEntry.findOne({ date: req.body.date, slotKey: req.body.slotKey }).lean();
      return res.json({ success: true, data: entry });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Update status / notes on an existing entry ─────────────────────────────────
router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, error: "Invalid entry ID" });

    const entry = await ScheduleEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, error: "Entry not found" });

    const { status, notes } = req.body;
    if (status) {
      entry.status = status;
      entry.postedAt = status === "posted" ? (entry.postedAt || new Date().toISOString()) : "";
    }
    if (typeof notes === "string") entry.notes = notes;

    await entry.save();
    await syncIdeaShipped(entry.toObject());
    res.json({ success: true, data: entry.toObject() });
  } catch (err) {
    console.error("PATCH /api/schedule/:id", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Clear a slot ───────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, error: "Invalid entry ID" });
    const entry = await ScheduleEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, error: "Entry not found" });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error("DELETE /api/schedule/:id", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
