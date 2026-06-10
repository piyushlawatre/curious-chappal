/**
 * Idea.js — Mongoose model
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const FORMAT_LANES = [
  "Real Reason", "Hidden India", "Smart Money/Business",
  "Science Lite", "Sharp Contradiction", "Viral Social Commentary", "One-off",
  "Forgotten Inventor", "Quiet Monopoly", "Status Game",
];
const VERDICTS = ["MAKE-NOW", "REFRAME", "MAKE-LATER", "DROP"];
const STEP_IDS = [
  "01_TOPIC_EVALUATION", "02_SCRIPT_CREATION", "03_AUDIT_AND_FINALIZE", "04_EDITOR_BRIEF",
];
const STEP_STATUSES = ["not_started", "prompt_generated", "output_added", "completed"];
const IDEA_STATUSES = [
  "draft", "evaluating", "scripting", "auditing",
  "briefing", "production", "dropped", "on_hold",
  // "rewriting" kept for backward compat with pre-migration records
  "rewriting",
];

const ProductionChecklistSchema = new Schema(
  {
    scriptVerified:               { type: Boolean, default: false },
    shotListVerified:             { type: Boolean, default: false },
    brollVerified:                { type: Boolean, default: false },
    onScreenTextVerified:         { type: Boolean, default: false },
    audioVerified:                { type: Boolean, default: false },
    thumbnailsAndSourcesVerified: { type: Boolean, default: false },
    passedToProduction:           { type: Boolean, default: false },
  },
  { _id: false }
);

// ── Knowledge file snapshot (one per MD file bundled at prompt-generation time)
const KnowledgeFileSchema = new Schema(
  {
    path:    { type: String, default: "" }, // e.g. "00_SHARED_KB/CONTEXT_PRIMER.md"
    content: { type: String, default: "" }, // full raw MD content at time of save
  },
  { _id: false }
);

// ── One workflow step ─────────────────────────────────────────────────────────
const WorkflowStepSchema = new Schema(
  {
    id:          { type: String, enum: STEP_IDS, required: true },
    stepNumber:  { type: String, required: true },
    name:        { type: String, required: true },
    description: { type: String, default: "" },
    status:      { type: String, enum: STEP_STATUSES, default: "not_started" },

    // User-supplied raw input for this step
    input:           { type: String, default: "" },
    // Full compiled prompt (prompt template + filled-in inputs) — stored in full
    generatedPrompt: { type: String, default: "" },
    // The AI response pasted by the user
    aiOutput:        { type: String, default: "" },

    // Snapshot of every knowledge-base MD file used to build the prompt
    knowledgeFiles: { type: [KnowledgeFileSchema], default: [] },

    // Annotation fields
    stepNotes:  { type: String, default: "" },
    gaps:       { type: String, default: "" },
    decision:   { type: String, default: "" },
    nextAction: { type: String, default: "" },

    // Ring-buffer of previous runs (max 3, newest last)
    outputHistory: {
      type: [
        {
          prompt:  { type: String, default: "" },
          output:  { type: String, default: "" },
          savedAt: { type: String, default: "" },
          _id: false,
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

// ── Root Idea schema ──────────────────────────────────────────────────────────
const IdeaSchema = new Schema(
  {
    title: {
      type: String, required: [true, "Title is required"],
      trim: true, maxlength: [200, "Title must be under 200 characters"],
    },
    topicIdea:        { type: String, default: "", trim: true },
    formatLane:       { type: String, enum: [...FORMAT_LANES, null, ""], default: "" },
    verdict:          { type: String, enum: [...VERDICTS, null, ""], default: "" },
    ideaStatus:       { type: String, enum: IDEA_STATUSES, default: "draft" },
    currentStepIndex: { type: Number, default: 0, min: 0, max: 3 },
    steps:            { type: [WorkflowStepSchema], default: [] },
    notes:            { type: String, default: "" },

    // Manual-override flags. When true, the stepper's auto-derivation leaves that
    // field alone so a user's explicit edit isn't clobbered by parsed AI output.
    titleManual:      { type: Boolean, default: false },
    formatLaneManual: { type: Boolean, default: false },
    verdictManual:    { type: Boolean, default: false },

    videoMade:        { type: Boolean, default: false },
    fullFormVideo:    { type: Boolean, default: false },
    productionChecklist: { type: ProductionChecklistSchema, default: () => ({}) },
    productionReadyAt:   { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

IdeaSchema.virtual("completionPct").get(function () {
  if (!this.steps || this.steps.length === 0) return 0;
  const done = this.steps.filter((s) => s.status === "completed").length;
  return Math.round((done / this.steps.length) * 100);
});

IdeaSchema.virtual("activeStepId").get(function () {
  if (!this.steps || this.steps.length === 0) return null;
  return this.steps[this.currentStepIndex]?.id ?? null;
});

IdeaSchema.index({ formatLane: 1 });
IdeaSchema.index({ verdict: 1 });
IdeaSchema.index({ ideaStatus: 1 });
IdeaSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Idea", IdeaSchema);
module.exports.FORMAT_LANES = FORMAT_LANES;
module.exports.VERDICTS = VERDICTS;
module.exports.STEP_IDS = STEP_IDS;
module.exports.IDEA_STATUSES = IDEA_STATUSES;
