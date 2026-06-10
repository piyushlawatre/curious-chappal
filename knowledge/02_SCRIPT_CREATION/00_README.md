# 02_SCRIPT_CREATION

**Purpose:** Turn an approved or AI-reframed topic-evaluation brief into a production-ready Short script.
**Scope:** Script-writing stage only. Topic gating happens upstream in `01_TOPIC_EVALUATION/`. Script auditing and rewrite happen downstream in `03_AUDIT_AND_FINALIZE/`.
**Chain position:** Stage 2 of 4. Consumes the output of `01_TOPIC_EVALUATION/01_PROMPT.md`.

---

## How to use

1. Run a topic through `../01_TOPIC_EVALUATION/` first. Save the verdict.
2. If the verdict was **MAKE-NOW** or **REFRAME with an AI Reframe Package**, open `01_PROMPT.md` here.
3. Paste the full output from the 01_TOPIC_EVALUATION brief into the INPUT block at the top of `01_PROMPT.md`.
4. Paste the entire `01_PROMPT.md` (with your filled input) into a fresh AI chat that has access to this folder.
5. The AI reads the required KB files in order, drafts the lane-appropriate narrative functions in the strongest topic-native order, writes the script, self-audits, and returns the script in the fixed output template.

Same prompt, same brief, same KB files → near-identical script output across runs.

---

## What lives in this folder (read order)

| # | File | Role |
|---|------|------|
| 00 | `00_README.md` | This file. Folder index and SOP. |
| 01 | `01_PROMPT.md` | The script-creation prompt. Hybrid: hard constraints + self-audit inlined, depth in KB files. |
| 04 | `04_SCRIPT_DRAFTING_GUIDE.md` | Canonical narrative functions, hook rules, length bands, output template. |

Read order is defined in `01_PROMPT.md`. Shared KB files are loaded from `../00_SHARED_KB/`.

---

## Dependency on 01_TOPIC_EVALUATION

This folder consumes the output schema of `01_TOPIC_EVALUATION/01_PROMPT.md` — specifically these fields:

- Verdict (must be MAKE-NOW, or REFRAME with a complete AI Reframe Package)
- Format lane + lane-fit justification
- Three hook or hook-stack candidates
- Strongest source-backed narrative asset + source
- Concrete story carrier + Pictureability Test
- Payoff one-liner
- Mental model / framework (optional bonus from Stage 1)
- External-creator clone risk check + required differentiators
- Fact-risk + source tier
- Register calibration note (any topic-specific voice or register guidance; complete Indian English is always the default)
- AI Reframe Package (required only when verdict = REFRAME; stage 2 uses this corrected angle directly)

If you change the 01_TOPIC_EVALUATION output schema, update the INPUT block in `01_PROMPT.md` here to match. The two prompts are designed as a chain — break the schema and the chain breaks.

---

## What does NOT belong in this folder

If you find any of these here, move them out:

- **Topic gating** — lives in `../01_TOPIC_EVALUATION/`.
- **Script audit rubrics & rewrite/finalization SOPs** — live in `03_AUDIT_AND_FINALIZE/` (audit + rewrite happen *after* drafting).
- **Editor briefs, visual guides, thumbnail rules** — live in `../04_EDITOR_BRIEF/`.

This folder is the drafting stage. Keep it that way.

---

## Where to save outputs

Save each finalized script to a sibling folder for production:

```
02_SCRIPT_CREATION/SCRIPTS/YYYY-MM-DD_<topic-slug>.md
```

Save the topic-eval brief alongside it (or keep a link), so the script and its approving brief are always paired.

---

## Why output consistency works here

LLMs are stochastic — you will not get 100% identical scripts across runs. But this folder is engineered to push run-to-run agreement up to roughly 80–85% (slightly lower than topic-eval because script writing is generative, not gating) by:

1. **Chained input.** The script takes a structured brief, not a vague topic. The format lane, hook candidates, and payoff are already decided.
2. **Hard length band.** Anchor scripts run 90–120 seconds, 230–280 words. Auto-rejected if out of band; reframe or move formats rather than padding.
3. **Narrative functions enforced, order flexible.** Hook, setup/context, turn, mechanism, optional Indian relevance, payoff, and close must land in the strongest topic-native order. Viral Social Commentary uses its lane-specific structure.
4. **Banned vocabulary inlined.** Hype words, generic creator-tic phrases, generic CTAs, documentary tells — all listed in the prompt, so the model can't drift.
5. **Self-audit before return.** Model scores its own draft on 10 gates and runs the First-Draft Drift Guard. Must rewrite any beat scoring ≤6, any draft that drops the strongest narrative asset without a stronger replacement, or any draft that feels like a polished explainer.
6. **External-creator clone check.** If brief flagged adjacency, model must list ≥3 differentiators or rewrite.
7. **Required reading pinned.** Model reads `../00_SHARED_KB/REFERENCE_SCRIPTS_CORE.md` for routine creative calibration, with `../00_SHARED_KB/REFERENCE_SCRIPTS.md` available as the full creative benchmark for deep recalibration.

If you see drift across runs, check that the model actually read the core Anchor Short references, applied the First-Draft Drift Guard, and ran the clone check.

---

## Editing this folder

- Edit `01_PROMPT.md` only when the drafting logic genuinely changes. Bump the KB version line in the output template.
- Per-edit rule (from `01_PROMPT.md`): change only one of {hard constraints, self-audit rubric, output template} per edit, so past scripts stay comparable to future ones.
- After any edit, run a stale-reference check: `grep -nE "old-filename" *.md` should return nothing.
