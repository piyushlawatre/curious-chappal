# Merged Stage — Audit & Finalize

This is **Stage 3 of the 4-stage pipeline** — the validated primary path that runs the audit and the rewrite/finalization in a single chat. (A/B tested against the former two-stage flow and confirmed good.) It replaced the former separate audit and rewrite stages.

## Why it exists

Running the former audit and rewrite stages as separate chats reloaded the shared knowledge base twice and required pasting the audit by hand between them. Merging removes one full KB reload (~15–20k tokens), one manual paste, and one round-trip per folder — the biggest token + latency saving available when you run a fresh chat per stage (prompt caching isn't available in that mode).

## How it protects quality

The one real risk of combining audit + rewrite is that an auditor who knows it will fix what it flags may flag less. The prompt blocks this with a hard wall:

1. **Part A (Audit) runs first, in full, scored as if a different person must do the fix.**
2. **The audit is printed and LOCKED.** Part B may not silently weaken, delete, or downgrade a finding. Newly fetched evidence may invalidate one only through an explicit Audit Finding Correction; Part B may also add findings.
3. Output is two artifacts in one response: the locked Audit Report, then the Final Script package.
4. Major rewrites must preserve or improve the narrative proposition, asset, and story spine; pass a Rewrite Regression Check and Best-Available-Version Comparison; and survive a cold-read final audit.

## How to run

Paste the Stage 2 script (optionally the Stage 1 brief), then this folder's `01_PROMPT.md`. Output's Section II (final script) goes to `03_AUDIT_AND_FINALIZE/FINAL_SCRIPTS/` and feeds `../04_EDITOR_BRIEF/`.

## Fallback

The former standalone audit and rewrite prompts have been retired after the merged path was A/B-validated. If you ever want a fully independent second audit on a contested rewrite (a clean-room auditor that did not also write the fix), run **Part A only** of this prompt in a separate chat and compare.

## Source of truth

This prompt inherits its rubric from `03_AUDIT_RUBRIC.md` and its rewrite rules from `03_REWRITE_SOP.md`. Run `KB_REGRESSION_TESTS.md` after material rule changes.
