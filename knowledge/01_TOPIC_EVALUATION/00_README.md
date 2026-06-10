# 01_TOPIC_EVALUATION

**Purpose:** Decide whether a candidate topic should become a Curious Chappal Short.
**Scope:** Topic-stage gate only. Script writing, auditing, rewriting, and finalization live in other folders.

---

## How to use

1. Open `01_PROMPT.md`.
2. Fill in the five input lines at the top:
   - Topic
   - Surface narrative most people know
   - Why I think it might be interesting
   - Source / article / video / event link (optional)
   - Mental model / framework, if you already have one (optional)
3. Paste the entire `01_PROMPT.md` (with your filled inputs) into a fresh AI chat that has access to this folder.
4. The AI reads the required KB files in order, captures any optional mental model, scores the 8-Point Gate, applies the auto-downgrade rules, and returns the verdict using the fixed output schema.
5. If the verdict is `REFRAME`, the AI must include a complete Stage-2-ready AI Reframe Package. Do not manually rewrite the idea; pass the full brief to stage 2 as-is.

Same prompt, same files, same schema → near-identical output across runs.

---

## What lives in this folder (read order)

| # | File | Role |
|---|------|------|
| 00 | `00_README.md` | This file. Folder index and SOP. |
| 01 | `01_PROMPT.md` | The evaluation prompt. Self-contained schema, scoring thresholds, banned vocab, auto-downgrade rules. |
| 04 | `04_TOPIC_VALIDATION_GUIDE.md` | Canonical 8-Point Shorts Validation, acceptable formats, decision table. |

Read order is defined in `01_PROMPT.md`. Shared KB files are loaded from `../00_SHARED_KB/`.

---

## What does NOT belong in this folder

If you find any of these here, move them out:

- **Script audit rubrics & rewrite/finalization SOPs** — live with the merged audit-and-finalize stage (`03_AUDIT_AND_FINALIZE/`).
- **Canonical reference scripts** — live in the shared KB (`00_SHARED_KB/REFERENCE_SCRIPTS.md` and `00_SHARED_KB/REFERENCE_SCRIPTS_CORE.md`).
- Anything about thumbnails, editing, publishing, or analytics.

This folder is the topic gate. Keep it that way.

---

## Where to save outputs

Save each completed evaluation to a sibling folder for future audit:

```
01_TOPIC_EVALUATION/EVALUATIONS/YYYY-MM-DD_<topic-slug>.md
```

That way `01_TOPIC_EVALUATION/` stays a clean SOP folder (prompt + reference), and `EVALUATIONS/` becomes the log of every decision.

---

## Why output consistency works here

LLMs are stochastic — you will not get 100% identical output across runs. But this folder is engineered to push run-to-run agreement up to roughly 85–90% by:

1. **Pinning the execution order.** Capture any optional mental model first, then score before narrating, so the verdict cannot be post-rationalized.
2. **Numeric thresholds, not adjectives.** "Strong hook" is replaced with a calibration table that says what 9–10 vs 7–8 vs ≤6 looks like.
3. **Auto-downgrade rules.** Verdicts are forced to obey the math. The narrative cannot override the score.
4. **Fixed output schema.** Same section headers, same order, every time.
5. **Banned-vocabulary list inlined.** No hype words, no generic creator-tic phrases, no generic CTAs sneaking in.
6. **Required-reading list pinned.** The model cannot skip a KB file and improvise.
7. **AI-owned reframe handoff.** A fixable idea returns a Stage-2-ready corrected angle; a non-fixable idea is rejected or delayed.
8. **Self-verification checklist.** The model checks its own output before returning.

If you see drift across runs, check that the model actually read all required KB files, applied the scoring table verbatim, ran the Viral Social Commentary lane override when applicable, and ran the auto-downgrade rules in order.

---

## Editing this folder

- Edit `01_PROMPT.md` only when the gate logic genuinely changes. Bump the KB version line in the output template.
- Per-edit rule (from `01_PROMPT.md`): change only one of {scoring thresholds, auto-downgrade rules, output schema} per edit, so past evaluations stay comparable to future ones.
- After any edit, run a quick stale-reference check: `grep -nE "old-filename" *.md` should return nothing.
