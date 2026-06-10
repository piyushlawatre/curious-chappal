/**
 * ideas.js — REST routes for Idea CRUD + stepper sync + analytics
 * Mounted at: /api/ideas
 */

const express = require("express");
const router  = express.Router();
const mongoose = require("mongoose");
const Idea = require("../models/Idea");
const { FORMAT_LANES, VERDICTS, STEP_IDS } = require("../models/Idea");
const ScheduleEntry = require("../models/ScheduleEntry");
const { findIdeaOutputFiles, deleteIdeaOutputFiles } = require("../lib/outputFileCleanup");

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDefaultSteps() {
  const STEP_META = [
    {
      stepNumber: "01",
      name: "Topic Evaluation",
      description:
        "Evaluate a raw idea and either pass it, reject it, delay it, or generate a Stage-2-ready AI reframe.",
    },
    {
      stepNumber: "02",
      name: "Script Creation",
      description:
        "Turn a MAKE-NOW or AI-reframed topic package into a complete first script draft with structure, hook, payoff, and production notes.",
    },
    {
      stepNumber: "03",
      name: "Audit & Finalize",
      description:
        "Audit the first script draft and produce the final production-ready version in a single pass. Part A locks the audit; Part B rewrites only what is needed and outputs Status: PRODUCTION-READY.",
    },
    {
      stepNumber: "04",
      name: "Editor Brief",
      description:
        "Convert the Stage 3 production-ready final script into a complete editor and producer handoff.",
    },
  ];
  return STEP_IDS.map((id, i) => ({
    id,
    stepNumber:      STEP_META[i].stepNumber,
    name:            STEP_META[i].name,
    description:     STEP_META[i].description,
    status:          "not_started",
    input:           "",
    generatedPrompt: "",
    aiOutput:        "",
    knowledgeFiles:  [],
  }));
}

function createEmptyProductionChecklist() {
  return {
    scriptVerified: false,
    shotListVerified: false,
    brollVerified: false,
    onScreenTextVerified: false,
    audioVerified: false,
    thumbnailsAndSourcesVerified: false,
    passedToProduction: false,
  };
}

function normaliseProductionChecklist(checklist) {
  const base = createEmptyProductionChecklist();
  if (!checklist || typeof checklist !== "object") return base;

  for (const key of Object.keys(base)) {
    base[key] = Boolean(checklist[key]);
  }

  return base;
}

function isProductionChecklistComplete(checklist) {
  return Object.values(normaliseProductionChecklist(checklist)).every(Boolean);
}

function deriveIdeaStatus(steps, currentStepIndex, productionChecklist, currentStatus) {
  // Preserve on_hold — it can only be cleared intentionally via PUT, not auto-derived.
  if (currentStatus === "on_hold") return "on_hold";
  if (!steps || steps.length === 0) return "draft";
  const productionApproved = isProductionChecklistComplete(productionChecklist);

  if (steps.every((s) => s.status === "completed")) return productionApproved ? "production" : "briefing";
  if (steps.some((s)  => s.status === "dropped"))   return "dropped";

  const map = ["evaluating", "scripting", "auditing", "briefing"];
  if (currentStepIndex >= 0 && currentStepIndex < map.length) {
    const cur = steps[currentStepIndex];
    if (cur?.aiOutput?.trim()) return map[currentStepIndex];
  }

  let furthest = -1;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].aiOutput?.trim() || steps[i].status !== "not_started") furthest = i;
  }
  if (furthest < 0) return "draft";
  return map[Math.min(furthest, map.length - 1)];
}

// Sanitise a knowledge-file entry coming from the client
function sanitiseKnowledgeFile(f) {
  return {
    path:    typeof f.path    === "string" ? f.path    : "",
    content: typeof f.content === "string" ? f.content : "",
  };
}

// A title extraction is only trusted if it looks like an actual title: non-empty
// after stripping markdown, not absurdly long (we likely grabbed a paragraph),
// and not a bare placeholder. Returns the cleaned title or "" if not confident.
function cleanExtractedTitle(raw) {
  if (!raw) return "";
  let t = String(raw)
    .replace(/^[*_`#\s>-]+/, "")   // leading markdown/bullets
    .replace(/[*_`]+$/, "")         // trailing emphasis
    .replace(/\s+/g, " ")
    .trim();
  // Drop surrounding quotes a model sometimes adds.
  t = t.replace(/^["'\u201c\u2018]+/, "").replace(/["'\u201d\u2019]+$/, "").trim();
  if (t.length < 3) return "";       // too short to be a real title
  if (t.length > 140) return "";     // too long — almost certainly not a title line
  // Reject obvious non-titles (a sentence of prose ending in a period with no title-case feel
  // is allowed, but a markdown heading marker or label leakage is not).
  if (/^(final title|title|format lane)\b[:\-]?$/i.test(t)) return "";
  return t;
}

// Extract the AI-decided video title from steps (last step first).
// Recognises patterns produced by Steps 04 and 05.
function extractAiTitle(steps) {
  for (let i = steps.length - 1; i >= 0; i--) {
    const out = steps[i]?.aiOutput?.trim();
    if (!out) continue;

    // Step 04 — "## 3. Final Title\n<title>"
    let m = out.match(/##\s*\d+\.\s*Final Title\s*\n+([^\n#]+)/i);
    if (m) { const c = cleanExtractedTitle(m[1]); if (c) return c; }

    // Step 05 — "- **Title:** <title>"
    m = out.match(/[-*]\s*\*\*Title:\*\*\s*(.+)/i);
    if (m) { const c = cleanExtractedTitle(m[1]); if (c) return c; }

    // Step 05 — "**Strong video title:** <title>"
    m = out.match(/\*\*Strong video title:\*\*\s*(.+)/i);
    if (m) { const c = cleanExtractedTitle(m[1]); if (c) return c; }

    // Fallback — "**Final Title:** <title>" or "Final Title: <title>"
    m = out.match(/\*{0,2}Final Title\*{0,2}:?\s*([^\n]+)/i);
    if (m) { const c = cleanExtractedTitle(m[1]); if (c) return c; }

    // Step 04 heading — "# Final Script: <title>"
    m = out.match(/^#\s+Final Script:\s+(.+)/m);
    if (m) { const c = cleanExtractedTitle(m[1]); if (c) return c; }
  }
  return null;
}

function hasCompletedPipeline(steps) {
  return Array.isArray(steps)
    && steps.length > 0
    && steps.every((s) => s.status === "completed");
}

function getFinalizedPipelineTitle(idea) {
  if (!idea) return "";
  const finalized = Boolean(idea.videoMade)
    || idea.ideaStatus === "production"
    || hasCompletedPipeline(idea.steps)
    || isProductionChecklistComplete(idea.productionChecklist);

  if (!finalized) return "";
  return extractAiTitle(idea.steps || []) || "";
}

function normaliseFormatLane(value) {
  if (!value) return "";

  const cleaned = String(value)
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/[\[\]]/g, "")
    .trim();

  const compact = cleaned.toLowerCase().replace(/\s+/g, " ");
  const aliases = [
    { re: /^real reason\b/i, lane: "Real Reason" },
    { re: /^hidden india\b/i, lane: "Hidden India" },
    { re: /^smart money\s*\/\s*(smart )?business\b/i, lane: "Smart Money/Business" },
    { re: /^smart money\b/i, lane: "Smart Money/Business" },
    { re: /^smart business\b/i, lane: "Smart Money/Business" },
    { re: /^science lite\b/i, lane: "Science Lite" },
    { re: /^sharp contradiction\b/i, lane: "Sharp Contradiction" },
    { re: /^viral social commentary\b/i, lane: "Viral Social Commentary" },
    { re: /^one-off\b/i, lane: "One-off" },
    { re: /^forgotten inventor\b/i, lane: "Forgotten Inventor" },
    { re: /^quiet monopoly\b/i, lane: "Quiet Monopoly" },
    { re: /^status game\b/i, lane: "Status Game" },
  ];

  for (const { re, lane } of aliases) {
    if (re.test(compact)) return lane;
  }

  return FORMAT_LANES.includes(cleaned) ? cleaned : "";
}

function extractFormatLaneFromOutput(output) {
  if (!output?.trim()) return "";

  const patterns = [
    /(?:^|\n)\s*[-*]\s*\*\*Format lane:\*\*\s*([^\n]+)/i,
    /(?:^|\n)\s*\*\*Format lane:\*\*\s*([^\n]+)/i,
    /(?:^|\n)\s*Format lane:\s*([^\n]+)/i,
    /##\s*\d+\.\s*Format Lane\s*\n+\s*(?:\*\*)?([^\n*#]+)/i,
  ];

  for (const pattern of patterns) {
    const match = output.match(pattern);
    const lane = normaliseFormatLane(match?.[1]);
    if (lane) return lane;
  }

  return "";
}

function extractFormatLane(steps) {
  const orderedSteps = [
    ...(steps || []).filter((step) => step?.id === "02_SCRIPT_CREATION"),
    ...(steps || []).filter((step) => step?.id === "01_TOPIC_EVALUATION"),
    ...(steps || []).filter((step) => step?.id !== "02_SCRIPT_CREATION" && step?.id !== "01_TOPIC_EVALUATION"),
  ];

  for (const step of orderedSteps) {
    const lane = extractFormatLaneFromOutput(step?.aiOutput);
    if (lane) return lane;
  }
  return "";
}

// ── List ideas ────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { status, lane, verdict, search } = req.query;
    const filter = {};
    if (status)  filter.ideaStatus = status;
    if (lane)    filter.formatLane = lane;
    if (verdict) filter.verdict    = verdict;
    if (search) {
      const rx = { $regex: search, $options: "i" };
      filter.$or = [{ title: rx }, { topicIdea: rx }]; // search the concept too, not just the title
    }

    const ideas = await Idea.find(filter)
      // Project ONLY the light step subfields the list needs (status for completion %,
      // aiOutput for title/lane extraction). Never load knowledgeFiles / generatedPrompt /
      // outputHistory here — those are large (full KB snapshots) and stripped anyway.
      .select("title topicIdea formatLane verdict ideaStatus currentStepIndex videoMade fullFormVideo productionChecklist productionReadyAt titleManual formatLaneManual verdictManual createdAt updatedAt steps.id steps.stepNumber steps.name steps.status steps.aiOutput")
      .sort({ createdAt: -1, _id: -1 })
      .lean({ virtuals: true });

    const result = ideas.map((idea) => {
      const done  = (idea.steps || []).filter((s) => s.status === "completed").length;
      // The pipeline has STEP_IDS.length (4) steps. Fall back to that when an
      // idea has no steps array yet, and never divide by zero.
      const total = idea.steps?.length || STEP_IDS.length;
      const parsedFormatLane = extractFormatLane(idea.steps);
      const finalizedTitle = getFinalizedPipelineTitle(idea);
      return {
        ...idea,
        title: idea.titleManual ? idea.title : (finalizedTitle || idea.title),
        formatLane: idea.formatLaneManual ? idea.formatLane : (parsedFormatLane || idea.formatLane),
        completionPct: total > 0 ? Math.round((done / total) * 100) : 0,
        activeStepId:  idea.steps?.[idea.currentStepIndex]?.id ?? null,
        // strip heavy fields from list view
        steps: (idea.steps || []).map((s) => ({
          id: s.id, stepNumber: s.stepNumber, name: s.name, status: s.status,
        })),
      };
    });

    res.json({ success: true, data: result, count: result.length });
  } catch (err) {
    console.error("GET /api/ideas", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Create idea ───────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, topicIdea, notes, formatLane, verdict } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, error: "title is required" });

    const idea = new Idea({
      title: title.trim(),
      topicIdea: topicIdea?.trim() || "",
      notes:     notes?.trim()     || "",
      formatLane: formatLane || "",
      verdict:    verdict    || "",
      ideaStatus: "draft",
      currentStepIndex: 0,
      steps: buildDefaultSteps(),
    });

    if (topicIdea?.trim()) idea.steps[0].input = topicIdea.trim();

    await idea.save();
    res.status(201).json({ success: true, data: idea.toJSON() });
  } catch (err) {
    console.error("POST /api/ideas", err);
    if (err.name === "ValidationError") return res.status(400).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get("/analytics/summary", async (req, res) => {
  try {
    const staleThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dashboardReadyExpr = {
      $or: [
        { $eq: ["$ideaStatus", "production"] },
        "$videoMade",
        {
          $and: [
            { $gt: [{ $size: { $ifNull: ["$steps", []] } }, 0] },
            {
              $eq: [
                {
                  $size: {
                    $filter: {
                      input: { $ifNull: ["$steps", []] },
                      as: "step",
                      cond: { $ne: ["$$step.status", "completed"] },
                    },
                  },
                },
                0,
              ],
            },
          ],
        },
      ],
    };
    const [totalCount, byStatus, byFormatLane, byVerdict, recentIdeas, recentFinalisedIdeas, videoMadeCount, fullFormVideoCount, dashboardReadyRaw, byLaneVerdictRaw, stuckIdeas, byLaneCoverageRaw] =
      await Promise.all([
        Idea.countDocuments(),
        Idea.aggregate([{ $group: { _id: "$ideaStatus", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
        Idea.aggregate([{ $match: { formatLane: { $ne: "" } } }, { $group: { _id: "$formatLane", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
        Idea.aggregate([{ $match: { verdict:    { $ne: "" } } }, { $group: { _id: "$verdict",    count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
        Idea.find().select("title ideaStatus formatLane verdict currentStepIndex updatedAt videoMade fullFormVideo").sort({ updatedAt: -1 }).limit(10).lean(),
        Idea.find({ $expr: dashboardReadyExpr }).select("title ideaStatus formatLane updatedAt videoMade fullFormVideo").sort({ updatedAt: -1 }).limit(5).lean(),
        Idea.countDocuments({ videoMade: true }),
        Idea.countDocuments({ fullFormVideo: true }),
        Idea.aggregate([{ $match: { $expr: dashboardReadyExpr } }, { $count: "count" }]),
        Idea.aggregate([
          { $match: { formatLane: { $ne: "" }, verdict: { $ne: "" } } },
          { $group: { _id: { lane: "$formatLane", verdict: "$verdict" }, count: { $sum: 1 } } },
        ]),
        Idea.find({
          ideaStatus: { $nin: ["production", "dropped", "draft"] },
          updatedAt: { $lt: staleThreshold },
        }).select("title ideaStatus currentStepIndex updatedAt").sort({ updatedAt: 1 }).limit(5).lean(),
        Idea.aggregate([
          { $match: { formatLane: { $ne: "" } } },
          { $group: {
            _id: "$formatLane",
            videoMade:  { $sum: { $cond: ["$videoMade", 1, 0] } },
            fullFormVideo: { $sum: { $cond: ["$fullFormVideo", 1, 0] } },
            // Full-form ideas that are ALSO finished (dashboard-ready). Lets the
            // client split Shorts vs full-form coverage exactly, instead of
            // subtracting every full-form flag (incl. mid-pipeline ones).
            fullFormReady: { $sum: { $cond: [{ $and: [dashboardReadyExpr, "$fullFormVideo"] }, 1, 0] } },
            production: { $sum: { $cond: [dashboardReadyExpr, 1, 0] } },
            inPipeline: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $in: ["$ideaStatus", ["evaluating","scripting","auditing","rewriting","briefing"]] },
                      { $not: [dashboardReadyExpr] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            draft:      { $sum: { $cond: [{ $eq: ["$ideaStatus", "draft"] }, 1, 0] } },
            total:      { $sum: 1 },
          }},
          { $sort: { videoMade: 1, _id: 1 } },
        ]),
      ]);

    const stepCompletion = await Idea.aggregate([
      { $unwind: { path: "$steps", includeArrayIndex: "stepIdx" } },
      { $group: { _id: { stepId: "$steps.id", status: "$steps.status" }, count: { $sum: 1 } } },
      { $sort: { "_id.stepId": 1 } },
    ]);

    const stepMap = {};
    for (const entry of stepCompletion) {
      const { stepId, status } = entry._id;
      if (!stepMap[stepId]) stepMap[stepId] = { not_started: 0, prompt_generated: 0, output_added: 0, completed: 0 };
      stepMap[stepId][status] = (stepMap[stepId][status] || 0) + entry.count;
    }

    const statusMap   = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
    const dashboardReadyCount = dashboardReadyRaw[0]?.count || 0;
    const inProgress  = totalCount - dashboardReadyCount - (statusMap.dropped || 0) - (statusMap.draft || 0);
    const byLaneVerdict  = byLaneVerdictRaw.map((e) => ({ lane: e._id.lane, verdict: e._id.verdict, count: e.count }));
    const byLaneCoverage = byLaneCoverageRaw.map((e) => ({ lane: e._id, videoMade: e.videoMade, fullFormVideo: e.fullFormVideo, fullFormReady: e.fullFormReady, production: e.production, inPipeline: e.inPipeline, draft: e.draft, total: e.total }));

    res.json({
      success: true,
      data: {
        kpi: {
          total:      totalCount,
          production: dashboardReadyCount,
          inProgress: Math.max(0, inProgress),
          dropped:    statusMap.dropped    || 0,
          draft:      statusMap.draft      || 0,
          videoMade:  videoMadeCount,
          fullFormVideo: fullFormVideoCount,
        },
        byStatus:       byStatus.map((s)     => ({ label: s._id, count: s.count })),
        byFormatLane:   byFormatLane.map((s) => ({ label: s._id, count: s.count })),
        byVerdict:      byVerdict.map((s)    => ({ label: s._id, count: s.count })),
        byLaneVerdict,
        byLaneCoverage,
        stepCompletion: STEP_IDS.map((id) => ({ stepId: id, ...(stepMap[id] || { not_started: 0, prompt_generated: 0, output_added: 0, completed: 0 }) })),
        recentIdeas,
        recentFinalisedIdeas,
        stuckIdeas,
      },
    });
  } catch (err) {
    console.error("GET /api/analytics/summary", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Get single idea (full) ────────────────────────────────────────────────────
// IMPORTANT: This /:id route MUST stay below all fixed-path GET routes (e.g.
// /analytics/summary). Express matches in registration order; moving /:id above
// them would cause "analytics" to be treated as an ObjectId and return a 400.
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, error: "Invalid idea ID" });

    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ success: false, error: "Idea not found" });

    const data = idea.toJSON();
    if (!idea.formatLaneManual) data.formatLane = extractFormatLane(idea.steps) || data.formatLane;
    if (!idea.titleManual)      data.title      = getFinalizedPipelineTitle(idea) || data.title;
    res.json({ success: true, data });
  } catch (err) {
    console.error("GET /api/ideas/:id", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Update idea metadata ──────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, error: "Invalid idea ID" });

    const allowed = ["title", "topicIdea", "notes", "formatLane", "verdict", "ideaStatus", "videoMade", "fullFormVideo", "productionChecklist", "productionReadyAt"];
    const update  = {};
    for (const key of allowed) { if (key in req.body) update[key] = req.body[key]; }

    if (Object.keys(update).length === 0)
      return res.status(400).json({ success: false, error: "No valid fields to update" });

    // Load the full document so we can read steps when needed
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ success: false, error: "Idea not found" });

    // When marking videoMade = true, replace title with the AI-decided title
    // from the last step that contains one (unless the caller also sent a title explicitly)
    // Only when the title hasn't been manually overridden, and only if we extract
    // a confident title (cleanExtractedTitle guards length/format), do we replace
    // it. Never blanks an existing title.
    if (update.videoMade === true && !("title" in req.body) && !idea.titleManual) {
      const aiTitle = getFinalizedPipelineTitle({ ...idea.toObject(), videoMade: true });
      if (aiTitle) update.title = aiTitle;
    }

    for (const [key, val] of Object.entries(update)) idea[key] = val;

    // Mark fields as manually overridden so the stepper's auto-derivation won't
    // later stomp an explicit user edit. A blank value re-enables auto-derive.
    if ("title" in update)      idea.titleManual      = Boolean(String(update.title ?? "").trim());
    if ("formatLane" in update) idea.formatLaneManual = Boolean(String(update.formatLane ?? "").trim());
    if ("verdict" in update)    idea.verdictManual    = Boolean(String(update.verdict ?? "").trim());

    if ("productionChecklist" in update) {
      idea.productionChecklist = normaliseProductionChecklist(update.productionChecklist);
      idea.productionReadyAt = isProductionChecklistComplete(idea.productionChecklist)
        ? (idea.productionReadyAt || new Date().toISOString())
        : "";
      idea.ideaStatus = deriveIdeaStatus(idea.steps, idea.currentStepIndex, idea.productionChecklist, idea.ideaStatus);
    }

    await idea.save();

    res.json({ success: true, data: idea.toJSON() });
  } catch (err) {
    console.error("PUT /api/ideas/:id", err);
    if (err.name === "ValidationError") return res.status(400).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Delete idea ───────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, error: "Invalid idea ID" });

    const idea = await Idea.findByIdAndDelete(req.params.id);
    if (!idea) return res.status(404).json({ success: false, error: "Idea not found" });

    // Detach the deleted idea from any calendar slots so we don't leave dangling
    // ObjectId refs. The denormalised ideaTitle/laneAtAssign stay, so the slot
    // still renders its history; only the live link is cleared.
    const detach = await ScheduleEntry.updateMany(
      { idea: req.params.id },
      { $set: { idea: null } },
    );

    // The idea is gone from Mongo — its loose per-video .md artifacts in the
    // knowledge output folders are now orphans. Best-effort cleanup.
    const cleanup = await deleteIdeaOutputFiles(idea.title);

    res.json({
      success: true, message: "Idea deleted", id: req.params.id,
      scheduleEntriesDetached: detach.modifiedCount ?? 0,
      outputFilesDeleted: cleanup.deleted,
    });
  } catch (err) {
    console.error("DELETE /api/ideas/:id", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Save stepper progress ─────────────────────────────────────────────────────
// PATCH /api/ideas/:id/steps
// Body: {
//   currentStepIndex?: number,
//   steps?: FullStepArray,          // full replace
//   stepIndex?: number, step?: obj  // single-step update
// }
//
// Each step object may include:
//   id, status, input, generatedPrompt, aiOutput,
//   knowledgeFiles, stepNotes, gaps, decision, nextAction, outputHistory
router.patch("/:id/steps", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, error: "Invalid idea ID" });

    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ success: false, error: "Idea not found" });

    // Snapshot completion BEFORE applying updates, so we can detect the moment
    // the pipeline newly finishes (all 4 steps completed) and clean up the
    // idea's loose .md artifacts — Mongo holds everything from here on.
    const wasPipelineComplete = hasCompletedPipeline(idea.steps);

    const { currentStepIndex, steps, stepIndex, step } = req.body;

    // ── Full steps array replace ──────────────────────────────────────────────
    if (Array.isArray(steps)) {
      for (const s of steps) {
        if (!STEP_IDS.includes(s.id))
          return res.status(400).json({ success: false, error: `Unknown step id: ${s.id}` });
      }
      idea.steps = steps.map((s, i) => ({
        id:              s.id,
        stepNumber:      typeof s.stepNumber === "string" ? s.stepNumber : String(i + 1).padStart(2, "0"),
        name:            typeof s.name === "string" ? s.name : (idea.steps[i]?.name || s.id),
        description:     typeof s.description === "string" ? s.description : (idea.steps[i]?.description || ""),
        status:          s.status          || "not_started",
        input:           s.input           ?? "",
        generatedPrompt: s.generatedPrompt ?? "",
        aiOutput:        s.aiOutput        ?? "",
        knowledgeFiles:  Array.isArray(s.knowledgeFiles)
                           ? s.knowledgeFiles.map(sanitiseKnowledgeFile)
                           : [],
        stepNotes:  s.stepNotes  ?? "",
        gaps:       s.gaps       ?? "",
        decision:   s.decision   ?? "",
        nextAction: s.nextAction ?? "",
        outputHistory: Array.isArray(s.outputHistory) ? s.outputHistory.slice(-3) : [],
      }));
    }

    // ── Single step update ────────────────────────────────────────────────────
    if (typeof stepIndex === "number" && step) {
      if (stepIndex < 0 || stepIndex > 3)
        return res.status(400).json({ success: false, error: "stepIndex must be 0–3" });

      const existing = idea.steps[stepIndex];
      if (existing) {
        if (step.stepNumber      !== undefined) existing.stepNumber      = step.stepNumber;
        if (step.name            !== undefined) existing.name            = step.name;
        if (step.description     !== undefined) existing.description     = step.description;
        if (step.status          !== undefined) existing.status          = step.status;
        if (step.input           !== undefined) existing.input           = step.input;
        if (step.generatedPrompt !== undefined) existing.generatedPrompt = step.generatedPrompt;
        if (step.aiOutput        !== undefined) existing.aiOutput        = step.aiOutput;
        if (Array.isArray(step.knowledgeFiles))
          existing.knowledgeFiles = step.knowledgeFiles.map(sanitiseKnowledgeFile);
        if (step.stepNotes  !== undefined) existing.stepNotes  = step.stepNotes;
        if (step.gaps       !== undefined) existing.gaps       = step.gaps;
        if (step.decision   !== undefined) existing.decision   = step.decision;
        if (step.nextAction !== undefined) existing.nextAction = step.nextAction;
        if (Array.isArray(step.outputHistory))
          existing.outputHistory = step.outputHistory.slice(-3);
        idea.steps[stepIndex] = existing;
      }
    }

    // ── currentStepIndex ─────────────────────────────────────────────────────
    if (typeof currentStepIndex === "number" && currentStepIndex >= 0 && currentStepIndex <= 3)
      idea.currentStepIndex = currentStepIndex;

    // ── Auto-derive status ────────────────────────────────────────────────────
    idea.ideaStatus = deriveIdeaStatus(idea.steps, idea.currentStepIndex, idea.productionChecklist, idea.ideaStatus);

    // ── Sync topicIdea from steps[0].input to prevent drift ─────────────────
    // steps[0].input is the canonical source of truth for the topic once editing starts.
    const step0Input = idea.steps[0]?.input?.trim();
    if (step0Input) idea.topicIdea = step0Input;

    // ── Auto-detect verdict from Step 01 output ───────────────────────────────
    const step01 = idea.steps[0];
    if (step01?.aiOutput?.trim() && !idea.verdictManual) {
      if (!idea.verdict) {
        for (const v of VERDICTS) {
          if (step01.aiOutput.includes(v) && !idea.verdict) { idea.verdict = v; break; }
        }
      }
    }

    const parsedFormatLane = extractFormatLane(idea.steps);
    if (parsedFormatLane && !idea.formatLaneManual) idea.formatLane = parsedFormatLane;

    const finalizedTitle = getFinalizedPipelineTitle(idea);
    if (finalizedTitle && !idea.titleManual) idea.title = finalizedTitle;

    idea.markModified("steps");
    await idea.save();

    // All 4 steps NEWLY completed → the Idea document now holds everything;
    // remove the idea's loose .md artifacts from the knowledge output folders.
    let outputFilesDeleted = [];
    if (!wasPipelineComplete && hasCompletedPipeline(idea.steps)) {
      const cleanup = await deleteIdeaOutputFiles(idea.title);
      outputFilesDeleted = cleanup.deleted;
    }

    res.json({ success: true, data: idea.toJSON(), outputFilesDeleted });
  } catch (err) {
    console.error("PATCH /api/ideas/:id/steps", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Per-video output-file cleanup (manual) ─────────────────────────────────────
// The same cleanup the automatic triggers use, exposed for manual control:
//   GET    /api/ideas/:id/output-files   preview which .md artifacts match this idea
//   DELETE /api/ideas/:id/output-files   delete them now
router.get("/:id/output-files", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, error: "Invalid idea ID" });
    const idea = await Idea.findById(req.params.id).select("title").lean();
    if (!idea) return res.status(404).json({ success: false, error: "Idea not found" });
    res.json({ success: true, data: await findIdeaOutputFiles(idea.title) });
  } catch (err) {
    console.error("GET /api/ideas/:id/output-files", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id/output-files", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, error: "Invalid idea ID" });
    const idea = await Idea.findById(req.params.id).select("title").lean();
    if (!idea) return res.status(404).json({ success: false, error: "Idea not found" });
    const cleanup = await deleteIdeaOutputFiles(idea.title);
    res.json({ success: true, data: cleanup });
  } catch (err) {
    console.error("DELETE /api/ideas/:id/output-files", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
