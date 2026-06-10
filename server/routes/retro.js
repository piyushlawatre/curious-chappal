/**
 * retro.js — REST routes for weekly performance retros.
 * Mounted at: /api/retro
 *
 * Endpoints:
 *   GET    /api/retro                 list retros (newest first, lean)
 *   GET    /api/retro/:weekStart      one retro by Monday date (404 if absent)
 *   PUT    /api/retro                 upsert a retro for a weekStart
 *   DELETE /api/retro/:weekStart      delete a retro
 *
 * Each returned retro carries a computed `weighting` array (lane → recommendation
 * for next week), derived from its video rows so it always reflects current data.
 */

const express = require("express");
const router   = express.Router();
const RetroWeek = require("../models/RetroWeek");
const Settings  = require("../models/Settings");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Proposed (probationary) lanes — not part of the fixed 7-slot rotation. They are
// NOT auto-allocated a weekly slot just for being posted; they earn the rotation
// only by graduating (see the client Probation panel + FORMAT_LANES.md § Lane
// graduation). Excluding them here is the sync fix that keeps "proposed" meaningful.
const PROPOSED_LANES = ["Forgotten Inventor", "Quiet Monopoly", "Status Game"];

// ── Rotation + scoring helpers ──────────────────────────────────────────────────
// The 7 proven lanes that own the weekly rotation. They are the BASELINE for any
// next-cycle plan — a single partial week must never drop one of them. (Proposed
// lanes are handled separately and never auto-allocated; see PROPOSED_LANES.)
const ROTATION_LANES = [
  "Real Reason", "Hidden India", "Smart Money/Business", "Science Lite",
  "Sharp Contradiction", "Viral Social Commentary", "One-off",
];

// The LIVE rotation: canonical 7 unless a proposed lane has graduated in via the
// Probation panel (stored in Settings.rotationLanes). Falls back to canonical.
async function getRotationLanes() {
  try {
    const doc = await Settings.findOne({ key: Settings.SINGLETON_KEY }).lean();
    const rot = Array.isArray(doc?.rotationLanes) ? doc.rotationLanes.filter(Boolean) : [];
    if (rot.length === 7 && new Set(rot).size === 7) return rot;
  } catch { /* fall through to canonical */ }
  return ROTATION_LANES;
}
// A Short younger than this many days hasn't had a fair chance to accumulate views;
// it is flagged "too fresh to judge" so the reviewer reads its score with caution.
const REVIEW_AGE_DAYS = 3;

// A row counts only once it carries at least one real metric. Imported-but-blank
// rows (title/lane only) must NOT score 0 and drag the weighting / probation down.
function isMeasured(v) {
  return (v.views || 0) > 0 || (v.watchPct || 0) > 0 || (v.likes || 0) > 0 || (v.comments || 0) > 0 || (v.shares || 0) > 0;
}
function ageDays(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return Infinity;
  return (Date.now() - new Date(iso + "T00:00:00Z").getTime()) / 86400000;
}

// ── Scoring model (India-tuned) ────────────────────────────────────────────────
// Per-video 0–100 score (only for MEASURED videos):
//   • watch-through %   55%  — the spine; YouTube Shorts' main signal, and the
//                              truest read of whether the hook held a fast-swiping
//                              Indian short-form viewer.
//   • share rate        30%  — shares ÷ views. The WhatsApp / DM forward is the
//                              strongest virality signal in India; it gets its own
//                              heavy term instead of being diluted with likes.
//   • likes+comments    15%  — (likes+comments) ÷ views. Supporting engagement.
// Unmeasured rows get no score (so they never pollute weighting/allocation/probation).

// Returns the input videos annotated with `measured`, `tooFresh`, and (when
// measured) a 0..100 `score`.
function scoreVideos(videos) {
  if (!videos.length) return [];
  return videos.map((v) => {
    const tooFresh = ageDays(v.postedDate) < REVIEW_AGE_DAYS;
    if (!isMeasured(v)) return { ...v, measured: false, tooFresh };
    const views = Math.max(1, v.views || 0); // avoid /0
    const watch = Math.min(1, Math.max(0, (v.watchPct || 0) / 100));        // 0..1
    const shareRate = (v.shares || 0) / views;
    const share = Math.min(1, shareRate * 50);                              // ~2% share rate = full marks
    const lcRate = ((v.likes || 0) + (v.comments || 0)) / views;
    const lc = Math.min(1, lcRate * 25);                                    // ~4% like/comment rate = full marks
    const score = Math.round((watch * 0.55 + share * 0.30 + lc * 0.15) * 100);
    return { ...v, measured: true, tooFresh, score };
  });
}

// Bucket a score into repeat/improve/avoid by cohort thirds, with verdict override.
function bucketFor(score, verdict, lowCut, highCut) {
  if (verdict === "double-down") return "repeat";
  if (verdict === "avoid") return "avoid";
  if (score >= highCut) return "repeat";
  if (score <= lowCut) return "avoid";
  return "improve";
}

// ── Lane weighting ─────────────────────────────────────────────────────────────
// Aggregate per-video buckets up to lanes. Inputs:
//   videos      this retro week's rows
//   priorWeeks  up to 3 OLDER retro docs (newest first) — their measured videos are
//               blended in with decaying weight so a lane decision rests on more
//               than the single video the rotation gave it this week.
//
// Eligibility rules:
//   • Only MEASURED videos count (at least one real metric).
//   • Too-fresh videos (younger than REVIEW_AGE_DAYS) are EXCLUDED from weighting
//     and allocation — they are still scored + flagged for display, but a 1-day-old
//     video's weak numbers must never rest a lane for a whole cycle.
//   • Unmeasured rows with an explicit verdict (double-down / avoid) count toward a
//     lane's recommendation, but carry no score and can never drive the slot tilt.
const HISTORY_DECAY = [1.0, 0.6, 0.35, 0.2]; // this week, -1wk, -2wk, -3wk

function computeWeighting(videos, priorWeeks = [], rotationLanes = ROTATION_LANES) {
  const scored = scoreVideos(videos);
  const eligibleNow = scored.filter((v) => v.measured && !v.tooFresh);
  // No usable data from the reviewed week itself → no weighting / allocation.
  // (History alone must not propose a plan for a week that wasn't really reviewed.)
  if (eligibleNow.length === 0) return { weighting: [], scored, allocation: [], weightingMeta: null };

  // Pool: this week's eligible rows at weight 1.0, plus prior weeks' eligible rows
  // at decaying weight. Prior rows are re-scored fresh so rule changes apply evenly.
  const pool = eligibleNow.map((v) => ({ ...v, _w: HISTORY_DECAY[0] }));
  let weeksUsed = 1;
  priorWeeks.slice(0, HISTORY_DECAY.length - 1).forEach((wk, i) => {
    const rows = scoreVideos(wk.videos || []).filter((v) => v.measured && !v.tooFresh);
    if (rows.length) {
      weeksUsed += 1;
      for (const v of rows) pool.push({ ...v, _w: HISTORY_DECAY[i + 1] });
    }
  });

  // Bucket on the pooled cohort (bigger sample → steadier thirds).
  if (pool.length >= 3) {
    const sorted = pool.map((v) => v.score).sort((a, b) => a - b);
    const lowCut = sorted[Math.floor(sorted.length / 3)] ?? 0;
    const highCut = sorted[Math.floor((2 * sorted.length) / 3)] ?? 100;
    for (const v of pool) v.bucket = bucketFor(v.score, v.verdict, lowCut, highCut);
  } else {
    for (const v of pool) {
      v.bucket = v.verdict === "double-down" ? "repeat" : v.verdict === "avoid" ? "avoid" : undefined;
    }
  }
  // Mirror this week's buckets back onto the displayed rows.
  for (const v of scored) {
    const hit = pool.find((p) => p._w === HISTORY_DECAY[0] && p.title === v.title && p.postedDate === v.postedDate && p.lane === v.lane);
    if (hit) v.bucket = hit.bucket;
  }

  const byLane = new Map();
  for (const v of pool) {
    const lane = v.lane || "Unlabelled";
    if (!byLane.has(lane)) byLane.set(lane, []);
    byLane.get(lane).push(v);
  }

  const weighting = [...byLane.entries()].map(([lane, vids]) => {
    const wSum = vids.reduce((s, v) => s + v._w, 0);
    const avg = Math.round(vids.reduce((s, v) => s + v.score * v._w, 0) / wSum);
    let repeats = vids.filter((v) => v.bucket === "repeat").reduce((s, v) => s + v._w, 0);
    let avoids  = vids.filter((v) => v.bucket === "avoid").reduce((s, v) => s + v._w, 0);
    // Verdict-only rows (this week, unmeasured, explicit verdict) nudge the
    // recommendation for lanes that already have measured data.
    for (const v of scored) {
      if (!v.measured && (v.lane || "Unlabelled") === lane) {
        if (v.verdict === "double-down") repeats += HISTORY_DECAY[0];
        if (v.verdict === "avoid") avoids += HISTORY_DECAY[0];
      }
    }
    let recommendation;
    if (repeats > avoids) recommendation = "more";
    else if (avoids > repeats) recommendation = "less";
    else recommendation = "steady";
    return { lane, recommendation, score: avg, videoCount: vids.length };
  }).sort((a, b) => b.score - a.score);

  const allocation = allocateSlots(weighting, 7, rotationLanes);
  const freshExcluded = scored.filter((v) => v.measured && v.tooFresh).length;
  return { weighting, scored, allocation, weightingMeta: { weeksUsed, pooledVideos: pool.length, freshExcluded } };
}

// ── Next-cycle slot allocation ──────────────────────────────────────────────────
// The 7 proven rotation lanes are the BASELINE — each starts with one slot. The
// blended weighting then applies AT MOST a gentle one-slot tilt: if one reviewed
// rotation lane clearly out-scored another (by ≥ TILT_GAP), it earns a 2nd slot,
// funded by RESTING the weakest reviewed lane (0 slots for one cycle — a deliberate
// breather, not a deletion; it returns at baseline next cycle). Two guards:
//   • One-off can never earn the extra slot — "more One-offs" is lane-discipline
//     escape (FORMAT_LANES.md failure mode). It can still be the rested lane.
//   • Proposed lanes are never allocated here — they graduate via the Probation
//     panel (see FORMAT_LANES.md § Lane graduation).
function allocateSlots(weighting, N, rotationLanes = ROTATION_LANES) {
  const slotsTotal = Math.max(1, Math.round(N) || 7);
  const TILT_GAP = 20; // min score gap (0..100) before moving a slot — guards against small-sample noise

  // Baseline: spread slotsTotal as evenly as possible across the rotation lanes
  // (exactly one each when slotsTotal === 7).
  const slots = new Map();
  const base = Math.floor(slotsTotal / rotationLanes.length);
  const extra = slotsTotal % rotationLanes.length;
  rotationLanes.forEach((l, idx) => slots.set(l, base + (idx < extra ? 1 : 0)));

  // Reviewed rotation lanes that actually have a measured score.
  const reviewed = weighting
    .filter((w) => rotationLanes.includes(w.lane) && typeof w.score === "number" && (w.videoCount || 0) > 0)
    .map((w) => ({ lane: w.lane, score: w.score }))
    .sort((a, b) => b.score - a.score);

  if (reviewed.length >= 2) {
    // Best non-One-off lane is the only valid winner of the extra slot.
    const top = reviewed.find((r) => r.lane !== "One-off");
    const bottom = reviewed[reviewed.length - 1];
    if (top && top.lane !== bottom.lane && top.score - bottom.score >= TILT_GAP && (slots.get(bottom.lane) || 0) > 0) {
      slots.set(top.lane, (slots.get(top.lane) || 0) + 1);
      slots.set(bottom.lane, (slots.get(bottom.lane) || 0) - 1);
    }
  }

  return rotationLanes
    .map((lane) => ({ lane, slots: slots.get(lane) || 0, sharePct: Math.round(((slots.get(lane) || 0) / slotsTotal) * 100) }))
    .sort((x, y) => y.slots - x.slots);
}

function serialize(doc, priorWeeks = [], rotationLanes = ROTATION_LANES) {
  const o = typeof doc.toObject === "function" ? doc.toObject() : doc;
  const { weighting, scored, allocation, weightingMeta } = computeWeighting(o.videos || [], priorWeeks, rotationLanes);
  // Replace videos with their scored+bucketed versions so the client shows scores.
  return { ...o, videos: scored.length ? scored : (o.videos || []), weighting, allocation, weightingMeta };
}

// Fetch up to 3 retro weeks strictly older than weekStart (newest first) — the
// history window blended into that week's weighting/allocation.
async function priorWeeksFor(weekStart) {
  return RetroWeek.find({ weekStart: { $lt: weekStart } })
    .sort({ weekStart: -1 }).limit(HISTORY_DECAY.length - 1).lean();
}

// ── List ───────────────────────────────────────────────────────────────────────
// Query params (all optional):
//   limit   1..200, default 52     how many weeks to return (newest first)
//   before  YYYY-MM-DD             only weeks strictly older than this (paging key)
// Response includes `hasMore` + `nextBefore` so the client can page to older weeks
// instead of silently truncating at 52.
router.get("/", async (req, res) => {
  try {
    const rawLimit = Number(req.query.limit);
    const limit = Math.min(200, Math.max(1, Number.isFinite(rawLimit) ? Math.round(rawLimit) : 52));
    const filter = {};
    if (req.query.before && ISO_DATE.test(req.query.before)) {
      filter.weekStart = { $lt: req.query.before };
    }
    // Fetch extras: +1 detects whether more pages exist; +3 more give the last
    // page items their history window (each week blends up to 3 older weeks).
    const docs = await RetroWeek.find(filter).sort({ weekStart: -1 }).limit(limit + 1 + 3).lean();
    const hasMore = docs.length > limit;
    const page = docs.slice(0, limit);
    const nextBefore = hasMore ? page[page.length - 1].weekStart : null;
    // docs are newest-first, so a week's priors are simply the next docs in the array.
    const rotation = await getRotationLanes();
    const data = page.map((doc, i) => serialize(doc, docs.slice(i + 1, i + 4), rotation));
    res.json({ success: true, data, hasMore, nextBefore });
  } catch (err) {
    console.error("GET /api/retro", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── One by weekStart ───────────────────────────────────────────────────────────
router.get("/:weekStart", async (req, res) => {
  try {
    const { weekStart } = req.params;
    if (!ISO_DATE.test(weekStart)) return res.status(400).json({ success: false, error: "weekStart must be YYYY-MM-DD" });
    const doc = await RetroWeek.findOne({ weekStart }).lean();
    if (!doc) return res.status(404).json({ success: false, error: "No retro for that week" });
    res.json({ success: true, data: serialize(doc, await priorWeeksFor(weekStart), await getRotationLanes()) });
  } catch (err) {
    console.error("GET /api/retro/:weekStart", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Upsert ─────────────────────────────────────────────────────────────────────
// Body: { weekStart, videos?, learnings?, nextWeekPlan? }
// Handler shared by PUT (normal) and POST (navigator.sendBeacon on tab close,
// which can only issue POST). Both upsert identically.
async function upsertRetroHandler(req, res) {
  try {
    const { weekStart, videos, learnings, nextWeekPlan } = req.body ?? {};
    if (!weekStart || !ISO_DATE.test(weekStart)) {
      return res.status(400).json({ success: false, error: "Valid weekStart (YYYY-MM-DD) is required" });
    }

    const update = { weekStart };
    if (Array.isArray(videos)) {
      update.videos = videos.map((v) => ({
        title:    String(v.title ?? ""),
        lane:     String(v.lane ?? ""),
        platform: String(v.platform ?? "youtube"),
        postedDate: String(v.postedDate ?? ""),
        views:    Math.max(0, Math.round(Number(v.views) || 0)),
        watchPct: Math.min(100, Math.max(0, Number(v.watchPct) || 0)),
        likes:    Math.max(0, Math.round(Number(v.likes) || 0)),
        comments: Math.max(0, Math.round(Number(v.comments) || 0)),
        shares:   Math.max(0, Math.round(Number(v.shares) || 0)),
        verdict:  String(v.verdict ?? ""),
        note:     String(v.note ?? ""),
      }));
    }
    if (typeof learnings === "string") update.learnings = learnings;
    if (typeof nextWeekPlan === "string") update.nextWeekPlan = nextWeekPlan;

    const doc = await RetroWeek.findOneAndUpdate(
      { weekStart },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).lean();

    res.json({ success: true, data: serialize(doc, await priorWeeksFor(weekStart), await getRotationLanes()) });
  } catch (err) {
    console.error("PUT /api/retro", err);
    if (err.code === 11000) {
      const doc = await RetroWeek.findOne({ weekStart: req.body.weekStart }).lean();
      return res.json({ success: true, data: serialize(doc, await priorWeeksFor(req.body.weekStart), await getRotationLanes()) });
    }
    res.status(500).json({ success: false, error: err.message });
  }
}

router.put("/", upsertRetroHandler);
// Beacon fallback from the client's beforeunload handler (sendBeacon = POST only).
router.post("/", upsertRetroHandler);

// ── Delete ─────────────────────────────────────────────────────────────────────
router.delete("/:weekStart", async (req, res) => {
  try {
    const { weekStart } = req.params;
    if (!ISO_DATE.test(weekStart)) return res.status(400).json({ success: false, error: "weekStart must be YYYY-MM-DD" });
    const doc = await RetroWeek.findOneAndDelete({ weekStart });
    if (!doc) return res.status(404).json({ success: false, error: "No retro for that week" });
    res.json({ success: true, weekStart });
  } catch (err) {
    console.error("DELETE /api/retro/:weekStart", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
