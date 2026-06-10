/**
 * outputFileCleanup.js — removes an idea's per-video markdown artifacts from the
 * knowledge folder once they're no longer needed on disk.
 *
 * WHY: the workflow snapshots every KB file and step output into MongoDB (the
 * Idea document is the source of truth). The loose per-video .md files written
 * into the knowledge output folders during drafting (evaluations, scripts,
 * audits, final scripts, editor briefs) are working artifacts — once a video
 * has completed all 4 steps, or its idea is deleted, they're clutter.
 *
 * TRIGGERS (wired in routes/ideas.js):
 *   • all 4 workflow steps newly completed  → clean that idea's files
 *   • idea deleted                          → clean that idea's files
 *
 * SAFETY RAILS — this module can only ever touch:
 *   • files DIRECTLY inside the five whitelisted OUTPUT directories (no
 *     recursion, no canonical KB files, which live outside these dirs),
 *   • plain .md files (never .gitkeep, never anything else),
 *   • files whose name demonstrably matches the idea's title (every meaningful
 *     token of the filename must appear in the title, with at least two
 *     matching tokens) — generic or ambiguous names are left alone.
 * Deletion is best-effort: errors are reported, never thrown.
 */

const fs = require("fs/promises");
const path = require("path");

const KNOWLEDGE_ROOT = path.resolve(__dirname, "../../knowledge");

// The five per-video output folders. Everything else in knowledge/ is canonical.
const OUTPUT_DIRS = [
  "01_TOPIC_EVALUATION/EVALUATIONS",
  "02_SCRIPT_CREATION/SCRIPTS",
  "03_AUDIT_AND_FINALIZE/AUDITS",
  "03_AUDIT_AND_FINALIZE/FINAL_SCRIPTS",
  "04_EDITOR_BRIEF/BRIEFS",
];

// Filename affixes that describe the artifact TYPE, not the topic — stripped
// from the filename before matching it against the idea title.
const TYPE_AFFIXES = new Set([
  "editor", "brief", "briefs", "audit", "audits", "final", "script", "scripts",
  "evaluation", "evaluations", "eval", "md",
]);

function tokens(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

/** True when the filename clearly belongs to this idea title. */
function fileMatchesTitle(filename, titleTokenSet) {
  const base = filename.replace(/\.md$/i, "");
  const fileTokens = tokens(base).filter((t) => !TYPE_AFFIXES.has(t));
  if (fileTokens.length < 2) return false; // too generic to claim safely
  // Every topic token in the filename must appear in the idea title.
  return fileTokens.every((t) => titleTokenSet.has(t));
}

/** List this idea's artifact files (relative to knowledge/), without deleting. */
async function findIdeaOutputFiles(ideaTitle) {
  const titleTokenSet = new Set(tokens(ideaTitle));
  if (titleTokenSet.size < 2) return []; // blank/one-word titles: never guess
  const matches = [];
  for (const dir of OUTPUT_DIRS) {
    const abs = path.join(KNOWLEDGE_ROOT, dir);
    let entries = [];
    try { entries = await fs.readdir(abs, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (!e.isFile() || !/\.md$/i.test(e.name)) continue;
      if (fileMatchesTitle(e.name, titleTokenSet)) matches.push(path.join(dir, e.name));
    }
  }
  return matches;
}

/** Delete this idea's artifact files. Returns { deleted, errors } (relative paths). */
async function deleteIdeaOutputFiles(ideaTitle) {
  const deleted = [];
  const errors = [];
  const files = await findIdeaOutputFiles(ideaTitle);
  for (const rel of files) {
    const abs = path.resolve(KNOWLEDGE_ROOT, rel);
    // Belt-and-braces: the resolved path must still be inside a whitelisted dir.
    const inWhitelist = OUTPUT_DIRS.some((d) => path.dirname(abs) === path.join(KNOWLEDGE_ROOT, d));
    if (!inWhitelist) { errors.push({ file: rel, error: "outside output dirs" }); continue; }
    try {
      await fs.unlink(abs);
      deleted.push(rel);
    } catch (err) {
      errors.push({ file: rel, error: err.message });
    }
  }
  if (deleted.length) console.log(`[output-cleanup] removed ${deleted.length} file(s) for "${ideaTitle}":`, deleted.join(", "));
  return { deleted, errors };
}

module.exports = { findIdeaOutputFiles, deleteIdeaOutputFiles, OUTPUT_DIRS };
