---
title: "Slate Ledger"
file: "SLATE_LEDGER.md"
role: canonical
canonical: true
version: "v1.2"
related: ["LANGUAGE_AND_VOICE.md", "../01_TOPIC_EVALUATION/01_PROMPT.md", "../03_AUDIT_AND_FINALIZE/01_PROMPT.md", "../03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md"]
summary: "The persisted memory the anti-cloning rules depend on. A rolling table of the most recent published Shorts with their hook / pivot / closer shapes, so Stage 1 and Stage 3 can steer lane and closer variety against real history instead of an imaginary ledger."
keywords: ["ledger", "slate", "self-clone", "closer variety", "sameness drift", "anti-cloning", "memory"]
---

# Slate Ledger

This file is the channel's **memory between scripts.** Every stage runs in a fresh chat, so the self-clone and closer-variety rules have no way to "remember" the last few Shorts unless that history is written down here. This is that written-down history. Without it, the PATTERN-FRESHNESS check (`../03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md § PATTERN-FRESHNESS`) and the closer-variety rule in `LANGUAGE_AND_VOICE.md § Closing Line` cannot run — they become decorative. Keep this file current and the channel stops cloning itself.

## How to use it

- **Stage 1 (Topic Evaluation):** read the last ~8 rows before assigning a lane and shaping hooks. Steer toward an under-used lane and away from a closer shape used in the last two Shorts.
- **Stage 3 Part B (Audit & Finalize):** *before lock*, read this file and run the self-clone / closer-variety check against the last several rows (specifically: if the last two Shorts closed on the two-part inversion — "X is not about A, it is about B" — this one must close differently, and no two consecutive Shorts may share a mid-script template). *After lock*, append this script's row.
- Keep the table to roughly the **last 8–12 published Shorts.** Older rows can be trimmed (or archived below a `--- archive ---` divider); only the recent window drives the anti-cloning checks.

## Shape vocabulary (keep entries short and comparable)

- **Hook shape:** `single-line declarative` | `2-3 line stack` | `scene-first conflict` | `viewer-world comparison` | `number-led` | `question` (rare).
- **Pivot shape:** `flat pivot` | `validate-then-break` | `quiet escalation` | `mechanism reveal` | `none (turn is implicit)`.
- **Closer shape:** `two-part inversion` ("X is not about A, it is about B") | `single-line reframe` | `twist-to-personal` | `quiet stand` | `forward question` | `viewer-verdict question` (Viral Social Commentary).
- **Mid-script template:** the recurring body scaffold, if any — `both-sides-inside-own-X` | `that-is-the-mechanism` | `validate-then-break` ("X is not fake. It is incomplete.") | `none`. Two consecutive Shorts may not share a mid-script template.

## Ledger (most recent first)

| Date (YYYY-MM-DD) | Topic | Lane | Hook shape | Pivot shape | Closer shape | Mid-script template |
|---|---|---|---|---|---|---|
| 2026-06-11 | McDonald's / Harry Sonneborn — who actually built McDonald's | Smart Money/Business | scene-first conflict | flat pivot | single-line reframe + quiet attribution stand | that-is-the-mechanism |
| 2026-06-11 | India's two monsoons — Mumbai ends, Chennai begins | Sharp Contradiction | scene-first conflict | flat pivot | single-line reframe | none |
| 2026-06-11 | Jio's free offer — what free was actually buying | Real Reason | scene-first conflict | validate-then-break | two-part inversion | none |
| 2026-06-11 | Surat — the diamonds Europe refused to cut | Hidden India | scene-first conflict | mechanism reveal | twist-to-personal | none |
| 2026-06-11 | Snake blocked exit — why the bite happens | Science Lite | scene-first conflict | mechanism reveal | single-line reframe | none |
| 2026-06-09 | Nagpur Zero Mile vs Karaundi (true geographic centre of India) | Sharp Contradiction | 2-3 line stack | mechanism reveal | forward question | — |
| 2026-06-09 | Why health words raise food prices | Smart Money/Business | 2-3 line stack | mechanism reveal | two-part inversion | — |
| 2026-06-07 | Cinema popcorn smell | Smart Money/Business | number-led | validate-then-break | two-part inversion | validate-then-break |
| 2026-06-11 | He Did Not Start With Trees (Jadav Payeng) | Hidden India | scene-first conflict | mechanism reveal | single-line reframe | none |

> This ledger is the single source of slate memory. Append every new published Short as its top row at lock; trim below ~12 rows. (Rows predating the mid-script-template column carry "—".)
>
> **Artifact note:** rows without a saved final in `../03_AUDIT_AND_FINALIZE/FINAL_SCRIPTS/` predate consistent artifact archiving. From KB v4.3, Stage 3 saves every locked final there (and the audit record to `../03_AUDIT_AND_FINALIZE/AUDITS/`), so each new ledger row has a matching file.
