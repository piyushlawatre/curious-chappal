import type { WorkflowStepId } from "../types";

import sharedMasterRule from "@knowledge/00_SHARED_KB/MASTER_RULE.md?raw";
import sharedContextPrimer from "@knowledge/00_SHARED_KB/CONTEXT_PRIMER.md?raw";
import sharedChannelConstitution from "@knowledge/00_SHARED_KB/CHANNEL_CONSTITUTION.md?raw";
import sharedFormatLanes from "@knowledge/00_SHARED_KB/FORMAT_LANES.md?raw";
import sharedViralSocialCommentary from "@knowledge/00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md?raw";
import sharedLanguageAndVoice from "@knowledge/00_SHARED_KB/LANGUAGE_AND_VOICE.md?raw";
import sharedSourceAndFactRules from "@knowledge/00_SHARED_KB/SOURCE_AND_FACT_RULES.md?raw";
import sharedReferenceScripts from "@knowledge/00_SHARED_KB/REFERENCE_SCRIPTS.md?raw";
import sharedReferenceScriptsCore from "@knowledge/00_SHARED_KB/REFERENCE_SCRIPTS_CORE.md?raw";
import sharedSlateLedger from "@knowledge/00_SHARED_KB/SLATE_LEDGER.md?raw";

import topicValidationGuide from "@knowledge/01_TOPIC_EVALUATION/04_TOPIC_VALIDATION_GUIDE.md?raw";

import scriptDraftingGuide from "@knowledge/02_SCRIPT_CREATION/04_SCRIPT_DRAFTING_GUIDE.md?raw";

import auditRubric from "@knowledge/03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md?raw";
import rewriteSop from "@knowledge/03_AUDIT_AND_FINALIZE/03_REWRITE_SOP.md?raw";

import editorVisualGuide from "@knowledge/04_EDITOR_BRIEF/03_EDITOR_AND_VISUAL_GUIDE.md?raw";
import editorThumbnailSop from "@knowledge/04_EDITOR_BRIEF/04_THUMBNAIL_DESIGN_SOP.md?raw";

export type KnowledgeBaseFile = {
  path: string;
  content: string;
};

export const knowledgeBaseByStep: Record<WorkflowStepId, KnowledgeBaseFile[]> = {
  // Stage 1: does NOT load CONTEXT_PRIMER (it is a compressed summary of files
  // Stage 1 already loads in full — see CHANGELOG 2026-06-01)
  "01_TOPIC_EVALUATION": [
    { path: "00_SHARED_KB/MASTER_RULE.md", content: sharedMasterRule },
    { path: "00_SHARED_KB/CHANNEL_CONSTITUTION.md", content: sharedChannelConstitution },
    {
      path: "01_TOPIC_EVALUATION/04_TOPIC_VALIDATION_GUIDE.md",
      content: topicValidationGuide,
    },
    { path: "00_SHARED_KB/FORMAT_LANES.md", content: sharedFormatLanes },
    {
      path: "00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md",
      content: sharedViralSocialCommentary,
    },
    {
      path: "00_SHARED_KB/LANGUAGE_AND_VOICE.md",
      content: sharedLanguageAndVoice,
    },
    {
      path: "00_SHARED_KB/SOURCE_AND_FACT_RULES.md",
      content: sharedSourceAndFactRules,
    },
    { path: "00_SHARED_KB/SLATE_LEDGER.md", content: sharedSlateLedger },
  ],
  // Stage 2: uses REFERENCE_SCRIPTS_CORE (not full) per CHANGELOG 2026-06-01
  "02_SCRIPT_CREATION": [
    { path: "00_SHARED_KB/MASTER_RULE.md", content: sharedMasterRule },
    { path: "00_SHARED_KB/CONTEXT_PRIMER.md", content: sharedContextPrimer },
    { path: "00_SHARED_KB/FORMAT_LANES.md", content: sharedFormatLanes },
    {
      path: "00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md",
      content: sharedViralSocialCommentary,
    },
    {
      path: "02_SCRIPT_CREATION/04_SCRIPT_DRAFTING_GUIDE.md",
      content: scriptDraftingGuide,
    },
    {
      path: "00_SHARED_KB/LANGUAGE_AND_VOICE.md",
      content: sharedLanguageAndVoice,
    },
    {
      path: "00_SHARED_KB/SOURCE_AND_FACT_RULES.md",
      content: sharedSourceAndFactRules,
    },
    {
      path: "00_SHARED_KB/REFERENCE_SCRIPTS_CORE.md",
      content: sharedReferenceScriptsCore,
    },
  ],
  // Stage 3: merged audit + rewrite; owns audit rubric and rewrite SOP
  "03_AUDIT_AND_FINALIZE": [
    { path: "00_SHARED_KB/MASTER_RULE.md", content: sharedMasterRule },
    { path: "00_SHARED_KB/CONTEXT_PRIMER.md", content: sharedContextPrimer },
    { path: "03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md", content: auditRubric },
    { path: "03_AUDIT_AND_FINALIZE/03_REWRITE_SOP.md", content: rewriteSop },
    { path: "00_SHARED_KB/FORMAT_LANES.md", content: sharedFormatLanes },
    {
      path: "00_SHARED_KB/LANGUAGE_AND_VOICE.md",
      content: sharedLanguageAndVoice,
    },
    {
      path: "00_SHARED_KB/SOURCE_AND_FACT_RULES.md",
      content: sharedSourceAndFactRules,
    },
    {
      path: "00_SHARED_KB/REFERENCE_SCRIPTS_CORE.md",
      content: sharedReferenceScriptsCore,
    },
    {
      path: "00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md",
      content: sharedViralSocialCommentary,
    },
    // (SOURCE_INTEGRITY_AND_CLARITY_GATE.md and STORY_SHAPE_LOCK.md were deleted at
    // KB v4.1 — their checks live inside 03_AUDIT_RUBRIC.md, already attached above.)
    { path: "00_SHARED_KB/SLATE_LEDGER.md", content: sharedSlateLedger },
  ],
  // Stage 4: editor brief; uses REFERENCE_SCRIPTS_CORE (not full)
  "04_EDITOR_BRIEF": [
    { path: "00_SHARED_KB/MASTER_RULE.md", content: sharedMasterRule },
    { path: "00_SHARED_KB/CONTEXT_PRIMER.md", content: sharedContextPrimer },
    {
      path: "04_EDITOR_BRIEF/03_EDITOR_AND_VISUAL_GUIDE.md",
      content: editorVisualGuide,
    },
    {
      path: "04_EDITOR_BRIEF/04_THUMBNAIL_DESIGN_SOP.md",
      content: editorThumbnailSop,
    },
    { path: "00_SHARED_KB/FORMAT_LANES.md", content: sharedFormatLanes },
    {
      path: "00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md",
      content: sharedViralSocialCommentary,
    },
    {
      path: "00_SHARED_KB/LANGUAGE_AND_VOICE.md",
      content: sharedLanguageAndVoice,
    },
    {
      path: "00_SHARED_KB/REFERENCE_SCRIPTS_CORE.md",
      content: sharedReferenceScriptsCore,
    },
  ],
};

// Full REFERENCE_SCRIPTS.md is available for deep recalibration / borderline calls
// (not bundled by default — open manually when needed)
export { sharedReferenceScripts };
