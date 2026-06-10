# Audit & Finalize Prompt — Curious Chappal (merged Stage 3 + Stage 4)

**Purpose:** Audit a drafted Short *and* produce the final, production-ready version in a single pass. This merges the former standalone audit and rewrite stages to remove one full knowledge-base reload, one manual paste, and one round-trip per folder.
**Input:** ONE thing — the 15-section script output from `../02_SCRIPT_CREATION/01_PROMPT.md`. (You no longer paste a separate audit; this pass generates it.)
**Output:** TWO artifacts in one response — (I) the locked Audit Report, then (II) the final, production-ready script package for Stage 4 (Editor Brief).

> **This is the validated primary path (A/B-tested and confirmed good). It replaces the former separate audit and rewrite stages, which have been retired. The audit rubric and rewrite SOP they owned now live in this folder.**

---

## INPUT (paste the drafted script, then this whole prompt)

```
[PASTE THE FULL OUTPUT FROM ../02_SCRIPT_CREATION/01_PROMPT.md HERE — all 15 sections]
```

Optionally, immediately after, separated by a clear marker:

```
=== TOPIC-EVAL BRIEF (optional) ===
[PASTE THE UPSTREAM BRIEF FROM ../01_TOPIC_EVALUATION/01_PROMPT.md HERE — enables chain-integrity checks in both halves]
```

---

> **Recommended reasoning effort: HIGH.** This stage contains the rewrite, which needs real judgment (beat reconstruction, payoff strengthening, lane correction). Run the whole pass at High. The audit half is still executed as strict checklist work — see the Critical Design Rule.

---

## CRITICAL DESIGN RULE — read before anything (protects audit integrity)

Auditing and rewriting in one pass creates one specific risk: an auditor who knows it will have to fix what it flags has an incentive to flag less. This prompt eliminates that risk with a hard wall:

1. **PART A (Audit) runs first and in full.** You are the strict Auditor. Score every gate and every failure mode as if a *different person* — not you — will have to do the rewrite. You do not soften, skip, or pre-excuse any finding because fixing it will be work.
2. **The audit is LOCKED the moment Part A output is written.** In Part B you may NOT silently weaken, delete, downgrade, or re-interpret a finding to make the rewrite easier. If newly fetched evidence proves a finding factually wrong or inapplicable, log an explicit `Audit Finding Correction` with the old finding, new evidence, and corrected action. You may also ADD a finding if Part B surfaces a new defect.
3. **If you cannot do Part A honestly without thinking ahead to the fix, stop, discard any rewrite ideas, and complete Part A as a clean, standalone audit before you allow yourself to touch Part B.**

Treat Part A and Part B as two different jobs done by two different people who happen to share a desk.

### Clean-room default for flagged scripts (mandatory)

The single-pass wall above is the floor, not the ceiling. For the channel's strongest ideas — the ones most worth protecting from a self-soft audit — run Part A as a **standalone clean-room audit in a separate pass before Part B**, not opt-in:

- **Trigger:** the Stage-1 brief marked this topic **full-form-candidate = YES**, OR all 8 Stage-1 gates scored **≥8** (i.e. a strong/full-form candidate). If the brief was not provided, treat a Stage-1 verdict of MAKE-NOW with no fact-risk flags as routine.
- **What "clean-room" means:** complete and lock Section I (the Audit Report) on its own, as if a different person will do the rewrite, before reading or writing any Part B rewrite content. Do not let rewrite ideas leak backward into the audit.
- **Routine scripts:** the single-pass wall stands — audit fully and honestly first, lock, then rewrite in the same pass.

This targets the extra independence at the strongest ideas without paying the cost on every routine Short.

---

## REQUIRED READING (read in this order, fully, before Part A)

1. `../00_SHARED_KB/CONTEXT_PRIMER.md` — channel identity primer.
2. `03_AUDIT_RUBRIC.md` — Lite Audit (19 consolidated failure modes) + 12-category Full Rubric + failure modes + calibration anchors + Verdict Labels. **Central document for Part A.**
3. `03_REWRITE_SOP.md` — when to rewrite/reject/keep, hook-sharpening, payoff-strengthening, register fixes, fact-check workflow, banned patterns, Final Approval Checklist. **Central document for Part B.**
4. `../00_SHARED_KB/FORMAT_LANES.md` — lane-fit check (Part A) and lane preservation (Part B).
5. `../00_SHARED_KB/LANGUAGE_AND_VOICE.md` — voice rules, banned vocab, host archetype. Source of truth for identity scoring and register discipline.
6. `../00_SHARED_KB/SOURCE_AND_FACT_RULES.md` — source hierarchy, source discipline, fact-risk grading and resolution.
7. `../00_SHARED_KB/REFERENCE_SCRIPTS_CORE.md` — voice calibration. Use Anchor Short References 1–8 as the active voice target. (Full 16-script `../00_SHARED_KB/REFERENCE_SCRIPTS.md` is the full creative benchmark; open it only for a borderline creative call.)
8. `../00_SHARED_KB/SOURCE_INTEGRITY_AND_CLARITY_GATE.md` — the mandatory final gate (5 pillars, binary): source integrity, mechanism honesty, authority placement, instant clarity including mental math, and temporal freshness. **Run before any lock.**
9. `../00_SHARED_KB/SLATE_LEDGER.md` — the persisted slate memory (last ~8–12 Shorts with hook/pivot/closer shapes). Read it before the self-clone / closer-variety check; append this script's row after lock.
10. `../00_SHARED_KB/STORY_SHAPE_LOCK.md` — the mandatory binary story gate (4 PASS/FAIL checks). **Run at lock alongside the five source/clarity pillars; any FAIL caps the verdict at Generic and forces Rewrite Trigger = Yes.**

**Conditional:** If the declared lane is **Viral Social Commentary**, OR the topic is a live viral internet debate even if another lane was declared, also read `../00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md` — mandatory audit overlay (Part A) and rebuild spec (Part B). Skip it otherwise.

Do not begin Part A until all required files are read.

---

# PART A — AUDIT (run first, then lock)

You are the Script Auditor. You score against a fixed rubric and decide the route. You do not improvise the rubric, verdict labels, or schema. **You are strict by design. Real production money depends on the discipline.**

## A. Execution order (do NOT change)

1. Confirm all required files are read.
2. Parse the script input. Confirm all 15 sections are present. If any section is missing, return `Terminal — incomplete Stage 2 script package. Rerun 02_SCRIPT_CREATION.` and stop. Do not reconstruct or regenerate Stage 2.
3. Decide audit mode: **Lite Audit** (default) or **Full 12-Category Audit** (escalation) — see "Audit Mode Selection".
4. Run the chosen audit. Score every gate or category numerically. **Score before you narrate.**
5. Run the 19 Failure Mode Spot-Checks. Mode 7 includes the four-part Polished Explainer/Narrative-Force detector; mode 18 includes source-register, mental-math, denominator/reference stability, and finance-language precision; mode 19 enforces citation integrity. Each = Pass/Fail with evidence. A Mode 7 pass without evidence for (a)-(d) is auto-fail.
6. Run the **Viral Social Commentary Audit Overlay** from `../00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md` when (a) declared lane is Viral Social Commentary, or (b) topic is a live viral internet debate even if another lane was declared. Any missing overlay item = lane drift; set Failure Mode 4 = Yes, Rewrite Trigger = Yes, add the missing item to the Fix List.
7. Run the External-Creator Clone Drift Test (`03_AUDIT_RUBRIC.md § Lite Audit § Pass 2 — External-Creator Clone Drift`). Then read `../00_SHARED_KB/SLATE_LEDGER.md` and run the Self-Clone / Closer-Variety check against the last several rows: strip proper nouns and compare the hook/pivot/closer skeleton; if the last two Shorts closed on the two-part inversion, this one must close differently.
8. Run the Language Register Check (Complete Indian English / register drift).
9. Verify chain integrity if the topic-eval brief was provided: do the script's lane, payoff, hook, strongest source-backed narrative asset, and concrete story carrier match what the brief approved? If the asset or carrier was dropped, require evidence the replacement is more watchable.
10. Run the Temporal Freshness + Current-Function check on every time-relative word in the script (`latest`, `currently`, `today`, `this year`, `now`, equivalents) and every exact older-period fact used as present proof. Re-fetch a primary source on the audit date.
11. Generate the Fix List — specific line-level changes, each tagged to a failed gate or failure mode.
11b. Run the **Story-Shape Lock** (`../00_SHARED_KB/STORY_SHAPE_LOCK.md`) — four binary checks (carrier used in first third; open earns a Google; payoff sequenced/single-true-cause not flat-additive; thesis once + close not hammered). Record each PASS/FAIL with evidence. **Any FAIL caps the verdict at Generic and sets Rewrite Trigger = Yes.**
12. Decide the verdict using `03_AUDIT_RUBRIC.md § Verdict Labels`, then run the **Final Disposition** gate.
13. Set the **Rewrite Trigger** (ROUTE_TO_REWRITE: Yes / No).
14. Run the Part A Self-Verification checklist.
15. **Write the complete Section I (Audit Report) output now, then treat it as LOCKED.**

## Audit Mode Selection

Use Lite Audit (default) unless one or more is true, then run Full 12-Category:
- Among the first 10 Shorts produced (calibration period).
- Monthly review of past Shorts.
- Sponsored / `#AD` Short.
- Current-affairs Short with named individuals or specific factual claims.
- The Lite Audit already failed this script once and a rewrite was attempted.
- The upstream brief had Fact-risk **High** or external-creator clone risk **High** (if provided), OR the script's own Fact-Check Notes contain any claim at tier 5–6 marked **Needs verify**.

State the selected mode at the top of Section I. If escalating, state which trigger fired.

## Verdict Labels (use exactly these)

- **Strong** — avg 8.0+. Direct finalization. Rewrite Trigger = **No**.
- **Good but needs polish** — avg 7.0–7.9. Line edits + fact verification via Direct finalization. Rewrite Trigger = **No**.
- **Generic** — avg 5.5–6.9. Major rewrite. Rewrite Trigger = **Yes**.
- **Off-brand** — any score; fails Channel Identity Fit or high clone drift. Rewrite Trigger = **Yes**.
- **Fact-risky** — any score; fails Fact Risk or has unverified load-bearing claim. Rewrite Trigger = **Yes** if the claim can't be sourced as written; otherwise **No** and Direct finalization handles the repair.
- **Reject** — avg under 5.5 OR multiple failure modes. Rewrite Trigger = **Yes**. Part B attempts an AI-owned reframe if defensible; drop only when no clean reframe exists.

If **Polished Explainer Drift** (mode 7), **Underdeveloped Surface Logic** (9), **Mechanism Collapse** (10), **Punchline Dilution** (11), **Final-Rule Oversimplification** (12), **Labelled-Not-Concrete Indian Context** (13), **Vocabulary Drift** (14), or the **Viral Social Commentary overlay** fails, Rewrite Trigger = **Yes** even when facts, structure, and payoff score well. Mode 7 verdict = `Generic` unless identity also fails (`Off-brand`). Modes 9-13 and overlay failures = `Generic` unless category scores indicate otherwise.

Any **Story-Shape Lock** FAIL (`../00_SHARED_KB/STORY_SHAPE_LOCK.md`) caps the verdict at **Generic** and sets Rewrite Trigger = **Yes**, regardless of how well facts, structure, and execution score. Story-shape now blocks a lock with the same force as a Source-Integrity pillar.

**Be strict. Do not adjust scores upward to be kind.**

## Scoring discipline (mandatory)

- Score gates/categories **before** writing narrative justification.
- 10/10 = best-in-class, no fixable weakness. Reserve it. If everything scores 9–10, your bar is too low.
- Lite gates are Yes/No only. Full categories are 1–10 against the rubric's calibration anchors.
- Channel Identity Fit is scored against `../00_SHARED_KB/LANGUAGE_AND_VOICE.md`, not taste.
- If the script carries a Stage 1 mental model that is fake/forced, flag Chain Integrity. If absent, carry `N/A — optional bonus`.

## Search discipline at audit

**Citation integrity is mandatory and is NOT covered by an upstream URL.** Fill the Source Dossier for every load-bearing cited claim. **Re-fetch discipline:** a full re-fetch is required when the claim is time-relative, contested, Sensitive-tier, or named in the fix list; for a routine claim whose Stage-1 dossier row is already complete (resolving URL + verbatim quote + accessed date), a freshness/contested check suffices instead of a full re-fetch (per `../00_SHARED_KB/SOURCE_AND_FACT_RULES.md § Citation Integrity`). An incomplete or non-resolving row always re-fetches; no-fetch, no-lock still holds. Also run a **narrative-evidence search** when Part B will perform a Major rewrite: find a sourced scene, event, decision, character, object, or contrast that can preserve story force while unsafe claims are repaired. Re-fetch every time-relative claim and every exact older-period fact used as present proof at final lock. External creators are never factual sources.

---

# PART B — REWRITE & FINALIZE (consumes the LOCKED audit)

You are now the Rewriter & Finalizer. You take the locked audit from Part A and produce the final production-ready version. **You apply fixes; you do not soften the audit.** Preserve what works, then run one controlled optimisation pass. Accept broader changes only when a materially stronger safe treatment wins the best-available-version comparison.

## B. Route from the locked audit (internal — no separate paste)

Read the Disposition, Rewrite Trigger, and verdict you just locked:
- **Disposition = DROP** → return `Terminal — audit disposition DROP: <one-line reason>. The idea is not worth producing; do not rewrite to rescue it. Return to 01_TOPIC_EVALUATION only if a genuinely different angle exists.` and stop. This overrides every route below.
- **Rewrite Trigger = No** AND verdict ∈ {Strong, Good but needs polish} → **Direct finalization mode.** Apply the Fix List line edits + coherence fixes + fact-check verification + Final Approval Checklist.
- **Rewrite Trigger = Yes** AND (verdict = Good but needs polish OR recommendation = Minor edit) → **Minor edit.** Change the Fix List lines, required coherence lines, and any stronger safe phrasing selected by the controlled optimisation pass.
- **Rewrite Trigger = Yes** AND verdict ∈ {Generic, Off-brand} OR Polished Explainer Drift detected OR Viral overlay failed → **Major rewrite.** Restructure flagged beats; preserve verified facts + payoff intent if salvageable.
- Verdict = **Reject** AND recommendation = `Reject (drop the topic)` AND no defensible AI reframe exists → return `Terminal — audit recommended dropping the topic. Return to 01_TOPIC_EVALUATION for a new reframe.` and stop. If a clean reframe exists, regenerate through Stages 1-3 internally and continue.
- Routing-consistency guard: if Rewrite Trigger = No but verdict ∈ {Generic, Off-brand, Fact-risky, Reject (rewrite-allowed)}, that is a Part A logic error — note it at the top of Rewrite Accountability and run the appropriate rewrite path.

## B. Execution order (do NOT change)

1. Index every script line by beat (Hook / Setup / Reveal / Payoff / Identity / CTA).
2. From the locked audit, extract: verdict; failure modes detected (esp. 9, 13-17); Viral overlay status; generic/off-brand lines; Fix List; Fact-Check Risks; Final Recommendation.
3. Classify finalization scope using `03_REWRITE_SOP.md § When to Rewrite / Reject / Keep Mostly Untouched` and the route above.
4. If scope is Major rewrite, run `03_REWRITE_SOP.md § Major Rewrite: Story-Preserving Accuracy Protocol`: inventory the original's strongest narrative assets; run claim-repair and narrative-evidence searches; record the asset the rewrite will preserve.
5. Apply the Fix List line by line. Use each suggested replacement if it lands; if weak, write a stronger one and explain in Rewrite Accountability.
6. **Polished Explainer Drift (mode 7):** rebuild using the four-part detector in `03_AUDIT_RUBRIC.md § Failure Mode 7 (a)-(d)`, including Narrative Force.
7. **Viral lane drift:** if the overlay failed, rebuild with the debate payload + viewer-verdict close.
8. **Mode mappings:** apply flagged modes, including Mode 18 mental-math/reference stability and authority placement.
9. Build a second viable full treatment when a materially different safe spine exists; run the Best-Available-Version comparison and document why the selected treatment wins.
10. Address every Fact-Check Risk by re-fetching load-bearing sources; re-fetch time-relative claims and exact older-period evidence functioning as present proof; verify evidence scope. If unverifiable, soften or cut.
11. Run the **Rewrite Regression Check** for every Major rewrite: original vs final on hook pull, concrete imagery, cognitive load, payoff, and factual honesty. Repair any unjustified regression.
12. Run a **cold-read final audit** on the finished rewrite as fresh input. Do not rely on Rewrite Accountability explanations. All Lite gates, every failure mode, the five source/clarity pillars, and the four Story-Shape Lock checks must pass.
13. If Part A flagged Medium/High external-creator clone risk, confirm the rewrite differs in ≥3 dimensions.
14. Confirm length within the Anchor band.
15. Confirm chain integrity, including narrative-asset preservation.
16. Fill Section II, then run Part B Self-Verification.
17. **After the script is locked PRODUCTION-READY, record its Slate Ledger row** (date | topic | lane | hook shape | pivot shape | closer shape) so the next Stage 1 and Stage 3 inherit this Short as slate memory. If you can write files in this environment, append it as the new top data row of `../00_SHARED_KB/SLATE_LEDGER.md`. If you cannot write files (e.g. this prompt was run in a chat and the output is pasted back into the orchestrator app), **emit the row in Section II § 18 as a copy-ready line** for the operator to paste into the ledger. Use the shape vocabulary defined in `SLATE_LEDGER.md`. If the script was not locked (terminal/DROP), do not record a row — write "§ 18: N/A — not locked."

## B. Hard constraints (mandatory)

- **Preserve** the topic (changing it = a new script, not a rewrite); the format lane (unless the audit flagged a lane error or the Viral lane clearly applies); the hook+payoff combo if the audit didn't flag both (sharpen, don't replace); and fact-checked claims already verified.
- **Optimise without churn:** preserve strong lines and facts, but allow broader changes when the Best-Available-Version comparison proves a materially stronger safe treatment.
- **Length & structure:** Anchor 90–120s / 230–280 words; all narrative functions present in the strongest topic-native story spine.
- **Register:** complete Indian English; no Hindi/Hinglish structural work. If it reads written not spoken, break into vertical lines + spoken connectives.
- **Banned (zero instances):** hype words, generic creator tics, generic CTAs, documentary/lecture tells (source: `../00_SHARED_KB/LANGUAGE_AND_VOICE.md`); host-as-expert framing; motivational drift; forced mental model; false certainty; undefined high-register vocabulary (run the Plain Word Test per `../00_SHARED_KB/LANGUAGE_AND_VOICE.md § Reader Benchmark` — Class 10–12 ceiling applies).
- **Unverifiable claims get cut.** The final script cannot ship with `Needs verify` claims.
- Output `Status: PRODUCTION-READY` only when the Final Approval Result (Section II § 16) is 100% checked. Repair internally before returning; `NEEDS-ANOTHER-PASS` is reserved for true terminal issues.

---

# OUTPUT TEMPLATE — return BOTH sections, in this order, in one Markdown code block

## SECTION I — LOCKED AUDIT REPORT
*(Use these headers verbatim. Once written, this section is locked. Part B may correct a finding only through the explicit Audit Finding Correction path.)*

```
# Script Audit: <topic name>
*Audited on <YYYY-MM-DD>. KB version: v3.9. Auditor: <model name>.*
*Audit mode: <Lite | Full 12-Category — escalation reason: …>*
*Script source: 02_SCRIPT_CREATION draft dated <YYYY-MM-DD>.*
*Chain check: <Pass | Fail — describe drift> (if brief provided)*

## 1. Verdict
**<Strong | Good but needs polish | Generic | Off-brand | Fact-risky | Reject>**
One-line reasoning (≤25 words).
**Rewrite Trigger (ROUTE_TO_REWRITE):** Yes | No
**Final Disposition (PASS | FIX | DROP):** <one> — if DROP, one-line reason (see § 13 + `03_AUDIT_RUBRIC.md § Final Disposition`).

## 2. Lite Audit (8 gates, Yes/No)
| # | Gate | Pass? | Evidence (one line) |
|---|------|-------|---------------------|
| 1 | Hook stack lands in 1–5s | Y/N | … |
| 2 | Simple curiosity gap | Y/N | … |
| 3 | Clear payoff | Y/N | … |
| 4 | Relatable or surprising angle | Y/N | … |
| 5 | Easy at scroll speed | Y/N | … |
| 6 | Retention flow holds | Y/N | … |
| 7 | Viewer feels smarter | Y/N | … |
| 8 | Carries our identity | Y/N | … |
**Lite verdict:** <"8/8 pass" or "fail on point [N]">

## 3. Full 12-Category Rubric (ONLY IF audit mode = Full; else "Not run — Lite mode.")
| # | Category | Score | One-line reasoning |
|---|----------|-------|--------------------|
| 1 | Channel Identity Fit | X/10 | … |
| 2 | Hook Strength | X/10 | … |
| 3 | Curiosity Gap | X/10 | … |
| 4 | Payoff Strength | X/10 | … |
| 5 | Retention Flow | X/10 | … |
| 6 | Easy-to-Understand | X/10 | … |
| 7 | Originality of Angle | X/10 | … |
| 8 | Indian Relevance (conditional) | X/10 | … |
| 9 | Language Quality | X/10 | … |
| 10| Tone | X/10 | … |
| 11| Ending | X/10 | … |
| 12| Fact Risk | X/10 | … |
|   | **Average** | X.X | (out of 10) |

## 4. Mental Model / Framework Integrity
**Status:** Pass | Fail | N/A — <quote model + why natural / N/A / fake-forced>

## 5. Failure Modes Spot-Check (19 modes)
| Failure mode | Detected? | Evidence (specific line if Yes) |
|---|---|---|
| 1. Forced Mental Model | Y/N | … |
| 2. Fake Depth | Y/N | … |
| 3. Overexplaining | Y/N | … |
| 4. Adjacent-Category Drift (3 sub-tells: documentary/podcast/news, Headline/Wikipedia summarization, hype-channel) | Y/N | which sub-tell + evidence |
| 5. Forced Sophistication | Y/N | … |
| 6. External-Creator Clone Drift | Y/N | … |
| 7. Polished Explainer Drift + Narrative Force (4-test, see § 5a) | Y/N | evidence required |
| 8. Hook Over-Claim (survivability) | Y/N | quote hook; does it claim more than the facts support? |
| 9. Underdeveloped Surface Logic | Y/N | how many reasons built belief before contradiction |
| 10. Mechanism Collapse | Y/N | quote where two mechanisms merged |
| 11. Punchline Dilution | Y/N | quote any line after the final punchline |
| 12. Final-Rule Oversimplification | Y/N | quote catchy line + missing real rule |
| 13. Labelled-Not-Concrete Indian Context | Y/N | quote generic label + missing lived condition |
| 14. Vocabulary Drift (word-level) | Y/N | quote any high-register word that fails the Plain Word Test + show replacement or inline definition |
| 15. Self-Clone / Sameness + Thesis-Hammer / Repetition | Y/N | (a) proper-nouns-stripped skeleton vs SLATE_LEDGER recent Shorts + closer shape vs ledger; (b) surplus thesis restatements |
| 16. Contested-Claim-as-Settled | Y/N | quote the contested claim stated as fact |
| 17. Unnamed Authority | Y/N | quote any "studies show / researchers found" + name the missing source |
| 18. Source-Register / Instant-Comprehension / Mental-Math Drift (phrase-level) | Y/N | quote unclear line, misplaced citation, or denominator/reference switch |
| 19. Citation Misdescription / Integrity | Y/N | source dossier result |

## 5a. Polished Explainer Drift + Narrative Force — 4-Test Detector
If mode 7 = N, populate all four; a "N" without all four auto-converts to Y.
- **(a) Hook quoted:** `<verbatim declarative/stack/scene-first hook; concrete story question; no over-claim>`
- **(b) Spoken-cadence lines (2):** 1.`<>` 2.`<>` — restrained, natural-verbal; NO reaction-acting tics ("Bas.", "Right?", "But honestly?"), NO Hindi/Hinglish
- **(c) 3-Line Article-Feel Test:** densest 3 reveal lines `<>`; joined `<>`; verdict `Spoken-feel / Article-feel` (must be Spoken-feel)
- **(d) Narrative-force test:** strongest sourced scene/person/decision/conflict/object/contrast `<asset>`; used or replaced by demonstrably stronger opening `<evidence>`

## 5b. Story-Shape Lock (binary — any FAIL caps verdict at Generic + Rewrite Trigger = Yes)
| # | Check | Pass? | Evidence |
|---|---|---|---|
| 1 | Carrier used in first third (carries mechanism, not decorative B-roll) | PASS/FAIL | … |
| 2 | Open earns a Google (story question, not a stat to nod at) | PASS/FAIL | … |
| 3 | Payoff sequenced or single-true-cause (not flat-additive, not single-cause overclaim) | PASS/FAIL | … |
| 4 | Thesis stated once + once at close, not hammered | PASS/FAIL | … |
**Story-Shape Lock result:** <"4/4 PASS" or "FAIL on check [N] — verdict capped at Generic, Rewrite Trigger = Yes">

## 6. Lane + Voice + Register Checks
- **Format-lane fit:** Strong | Weak | One-off justified — why: <one line>
- **External-creator clone risk:** Low | Medium | High — side-by-side test + which channel; if High, which of (hook, framing, register, close, visual) must change
- **Language register:** Complete Indian English | register drift (describe)
- **Energy register match:** <1–10> — delivery note matches? Y/N
- **Viral Social Commentary overlay:** Pass | Fail | N/A — quote Side A, Side B, math, direct viral evidence, discomfort, viewer question OR list missing items
- **Self-clone check:** strip proper nouns — does the skeleton (hook shape + pivot + closer) match a recent Short? Y/N + closer shape vs ledger
- **Repetition check:** is the one idea stated more than twice? Y/N — quote the surplus
- **Authority + numbers:** every evidence claim is checkable; only viewer-useful authorities are spoken; hard numbers carry source + date; first five seconds pass mental-math/reference-stability rule. Y/N
- **Temporal freshness + scope:** every time-relative claim and exact older-period fact used as present proof freshly rechecked; evidence scope matches claim scope. Y/N

## 7. What Works (specific quotes)
- "<line>" — why it works

## 8. What Feels Weak (specific quotes + category)
- "<line>" — fails <category #X / mode #Y> — why

## 9. Generic or Off-Brand Lines (exact quotes; "None" if all pass)
- "<line>" — sounds like <creator house style / documentary / Hinglish fact channel / motivational reel>

## 10. Fix List (specific, line-level, actionable)
| # | Current line | Suggested fix | Tied to |
|---|---|---|---|
| 1 | "<exact current>" | "<exact replacement>" | Gate / Category / Mode |

## 11. Fact-Check Risks
| Claim | Severity | Required tier | Action | Source URL (if checked) |
|---|---|---|---|---|
| <claim> | High/Med/Low | <1–4> | Verify/Soften/Cut | <URL or "Needs check"> |

## 12. Sources Consulted (audit)
| # | Source | URL | What it supported | (or "None — script + KB only.") |

## 13. Final Recommendation
**Action:** Keep as is (Direct finalization) | Minor edit | Major rewrite | Reject (drop only if no defensible reframe)
**Final Disposition (PASS | FIX | DROP):** <one> — run the Idea-Strength re-score per `03_AUDIT_RUBRIC.md § Final Disposition` (proper-nouns-stripped idea: curiosity gap, repeatable payoff, novelty, mechanism strength, identity fit). If it fails ≥2, this is **DROP** regardless of execution scores; give the one-line reason. A cleanly written but weak idea is a DROP, not a FIX.
**Priority fixes (top 3):** 1. … 2. … 3. …

## 14. Counter-argument (1–2 lines): strongest case this audit is too harsh OR too lenient.

## 15. Audit Self-Verification (confirm before locking)
- [ ] All required files read
- [ ] Script had all 15 sections (else terminal stop)
- [ ] Audit mode declared (+ escalation reason if Full)
- [ ] Clean-room check: if brief = full-form-candidate OR all Stage-1 gates ≥8, Part A was completed and locked as a standalone pass before any Part B content
- [ ] All gates/categories scored BEFORE narrative
- [ ] All 19 failure modes checked with Y/N + evidence
- [ ] Temporal freshness rechecked for every time-relative claim and every exact older-period fact used as present proof
- [ ] Viral overlay run when required; failures → Rewrite Trigger = Yes
- [ ] External-creator clone risk graded
- [ ] Specific quotes used (not paraphrases)
- [ ] Fact-check table covers every load-bearing claim
- [ ] Sources Consulted listed (or "None")
- [ ] Story-Shape Lock (4 binary checks) run with evidence; any FAIL caps verdict at Generic + Rewrite Trigger = Yes
- [ ] Verdict ↔ scores ↔ Rewrite Trigger internally consistent
- [ ] Counter-argument written
- [ ] Final Disposition (PASS/FIX/DROP) set via the Idea-Strength re-score; DROP chosen over rewrite when the idea (not the execution) is weak
```

**>>> AUDIT LOCKED. No silent weakening; evidence-based corrections must be logged explicitly. <<<**

## SECTION II — FINAL SCRIPT PACKAGE
*(Use these headers verbatim.)*

```
# Final Script: <topic name>
*Finalized on <YYYY-MM-DD>. KB version: v3.9. Rewriter: <model name>.*
*Topic-eval source: <01 brief dated … / not provided>; verdict <… / not provided>.*
*Script source: 02_SCRIPT_CREATION draft dated <YYYY-MM-DD>.*
*Audit source: Section I above (this pass), verdict <verdict>, ROUTE_TO_REWRITE = <Yes | No>.*
*Finalization scope: <Direct finalization | Minor edit | Major rewrite>*
*Status: <PRODUCTION-READY | NEEDS-ANOTHER-PASS>*

## 1. Production Target
**Anchor Short**

## 2. Format Lane
**<Real Reason | Hidden India | Smart Money/Business | Science Lite | Sharp Contradiction | Viral Social Commentary | One-off | Forgotten Inventor | Quiet Monopoly | Status Game>** (preserved | reframed — explain in §12 if reframed)

## 3. Final Title
<≤60 chars; no clickbait; no hype words>

## 4. Thumbnail Text
<3–5 words, ALL CAPS>

## 5. Hook / Hook Stack
<1–3 short spoken lines; exact opening; curiosity within 1–5s>

## 6. Payoff One-liner
<≤15 words>

## 7. Mental Model / Framework
<one sentence ≤8 words from Stage 1, or "N/A — optional bonus.">

## 8. Final Spoken Script
<full spoken prose. Anchor 230–280 words. Complete Indian English. Required narrative functions present in the strongest topic-native order. No banned vocab.>

**Delivery cues:** Preserve the inline delivery cues from the draft verbatim (the `[direct]` / `[stress]` / `[beat]` vocabulary in `../00_SHARED_KB/LANGUAGE_AND_VOICE.md § Delivery Cue Vocabulary`). If a beat was rewritten, re-apply cues to the new lines using the same closed vocabulary and the same restraint. Add cues only from that list; never invent new bracketed tokens; never strip cues from kept lines.
**Word count:** <X> **Estimated spoken length:** <Y> seconds

## 9. Host Tone
- **Energy (1–10):** <n> — <map to topic type from LANGUAGE_AND_VOICE energy table>
- **Pace:** <fast-cut | measured | dry observation>
- **Warmth:** <half-smile | restrained | dry-irony>

## 10. Editor Notes (beat by beat)
- **Hook Stack (0–5s):** … **Setup (3–10s):** … **Reveal (10–45s):** … **Payoff (45–60s):** … **Identity (≈80–105s):** … **CTA (final 5–10s, if any):** …

## 11. Fact-Check Notes (final, all claims verified)
| Claim | Tier (1–6) | Source | URL | Status |
|---|---|---|---|---|
| <claim> | <tier> | <name> | <URL> | Verified |
Any claim still unverified must be marked **Cut** in §12 and removed.

## 12. Rewrite Accountability (line-by-line)
| # | Audit fix # / Failure mode / Coherence | Original | New | Why |
|---|---|---|---|---|
| 1 | … | "<original>" | "<new>" | <rationale tied to audit> |
**Lines deliberately preserved (flagged but kept):** … **Cut entirely:** …
(If newly fetched evidence invalidated an audit finding, add `Audit Finding Correction: <old finding> → <new evidence> → <corrected action>`. This is the only permitted correction path; silent downgrades remain banned.)

## 13. Sources Consulted (rewrite)
| # | Source | URL | What it supported | (or "None — script + audit + KB only.") |

## 14. Cold-Read Fix Verification (8/8 gates + 19/19 modes + 5/5 source/clarity pillars + 4/4 Story-Shape Lock)
| # | Gate | Pass? | Evidence |
|---|---|---|---|
| 1 | Hook stack lands in 1–5s | Y/N | … |
| 2 | Simple curiosity gap | Y/N | … |
| 3 | Clear payoff | Y/N | … |
| 4 | Relatable or surprising angle | Y/N | … |
| 5 | Easy at scroll speed | Y/N | … |
| 6 | Retention flow holds | Y/N | … |
| 7 | Viewer feels smarter | Y/N | … |
| 8 | Carries our identity | Y/N | … |

### 14a. Failure Modes (carry-forward + re-scores)
Judge the final rewrite as fresh input. Do not carry a passing result merely because the original beat passed. Re-score all modes affected by the rewrite, with special attention to Modes 7 (Polished Explainer), 17 (Unnamed Authority), 18 (Source-Register/Comprehension), and 19 (Citation Integrity).
| # | Mode (only if re-scored) | Detected? | Evidence from rewritten beat |
|---|---|---|---|

### 14b. Voice + Story Evidence Block (v3.3)
Quote the four Mode 7 tests for the final script: hook, spoken cadence, Article-Feel Test, and Narrative Force. Any unfillable item = not production-ready.

### 14c. Viral Social Commentary Evidence (only if applicable)
Quote: viral object + number; what it does; Side A steelman; Side B steelman + math; direct viral evidence; discomfort; viewer-question close. Any unfillable row = not production-ready.

### 14d. Source Integrity and Audience Clarity Gate
Paste all five pillar results, including temporal freshness.

### 14e. Story-Shape Lock (binary)
Paste all four Story-Shape Lock results (`../00_SHARED_KB/STORY_SHAPE_LOCK.md`). Any FAIL = not production-ready (verdict would cap at Generic).

**Result:** <"8/8 gates + all modes + 5/5 source/clarity pillars + 4/4 Story-Shape Lock clear — production-ready" OR "fail on [gate/mode/pillar/story-shape] — repair and re-score">

## 15. Improvement Verification (vs original)
| Original audit flag | Status in rewrite | Evidence |
|---|---|---|
| <flag> | Fixed/Cut | "<line or change>" |
**External-creator clone risk recheck** (if original Medium/High): differs in ≥3 of Hook|Framing|Register|Close|Visual — specifics per item.
**Chain-integrity** (if brief provided): lane / payoff intent / hook angle vs brief.

### 15a. Rewrite Regression Check (mandatory for Major rewrite)
| Dimension | Original strongest evidence | Final evidence | Better / Equal / Worse | Justification if Worse |
|---|---|---|---|---|
| Hook pull / curiosity | … | … | … | … |
| Concrete scene / image | … | … | … | … |
| First-listen cognitive load | … | … | … | … |
| Payoff strength | … | … | … | … |
| Factual + mechanism honesty | … | … | … | … |

**Strongest source-backed narrative asset:** <asset + source>  
**Concrete story carrier + Pictureability Test:** <carrier + what can be shown without writing the thesis on screen>  
**Preserved or improved:** Yes / No — <evidence>  
Any unjustified `Worse` or `No` = not production-ready.

### 15b. Best-Available-Version Comparison
Compare the selected final against at least one materially different safe full treatment when available. Record the winner on hook pull, story-spine clarity, causal progression, cognitive load, payoff, and ending force. A clearly weaker selected treatment cannot lock.

## 16. Final Approval Result
Run `03_REWRITE_SOP.md § Final Approval Checklist`.
- **SOP checklist status:** All checked / Failed
- **Failed items, if any:** … **Repair action:** …
If any item fails after repair, Status is NOT PRODUCTION-READY.

## 17. Process Verification (confirm before returning)
- [ ] Audit (Section I) completed and locked BEFORE any rewrite
- [ ] No audit finding silently weakened, deleted, or downgraded in Part B; any evidence-based correction is explicitly logged
- [ ] Route resolved (Direct finalization / Minor edit / Major rewrite / terminal)
- [ ] Lineage captured in header
- [ ] Every change in §12 traces to an audit fix, failure mode, or coherence adjustment (no silent changes)
- [ ] All fact-check risks Verified or Cut (none left Unverified)
- [ ] §14 cold-read passes: 8/8 gates + all failure modes + 5/5 source/clarity pillars + 4/4 Story-Shape Lock + Viral evidence if applicable
- [ ] If Major rewrite: §15a Rewrite Regression Check contains no unjustified regression
- [ ] §15b Best-Available-Version Comparison selects the strongest viable safe treatment when an alternative exists
- [ ] Spoken-Rhythm evidence carried or re-quoted for rewritten beats
- [ ] Plain Word Test passed: every word in the final script is accessible to a Class 10–12 educated Indian reader, or is defined immediately inline
- [ ] §16 SOP checklist = All checked
- [ ] All consulted URLs listed (or "None")
- [ ] §15 covers every original audit flag
- [ ] § 18 Slate Ledger Row emitted (copy-ready) or appended to the file; "N/A — not locked" if terminal

## 18. Slate Ledger Row (paste into SLATE_LEDGER.md)
Emit the single new ledger row for this Short, as a copy-ready Markdown table row, using the shape vocabulary in `../00_SHARED_KB/SLATE_LEDGER.md` (hook shape / pivot shape / closer shape). The operator pastes this as the new top data row of the ledger table. If the script did not lock, write `N/A — not locked.`

`| <YYYY-MM-DD> | <topic> | <lane> | <hook shape> | <pivot shape> | <closer shape> |`
```

---

## OPERATING RULES

- **The wall between Part A and Part B is the whole point.** Audit honestly and completely first; lock it; then fix. If you find yourself softening a Part A finding to reduce Part B work, you have violated the design — stop and re-audit.
- **You apply fixes in Part B; you do not re-judge.** If you disagree with a Part A finding, you may override a specific fix in §12 with documented reasoning — but you may not silently drop it, and you may not lower a score or remove a failure-mode flag. The default is to trust the locked audit.
- **Section 12 is the accountability artifact.** Any change not listed there is a silent change — a bug.
- **Controlled optimisation bias.** In Strong/Good scripts, preserve strong lines and avoid churn, but do not let "unflagged" mean "untouchable." A controlled optimisation pass may replace unflagged lines when the Best-Available-Version comparison proves a stronger safe treatment.
- **Coherence permission.** Downstream changes to unflagged lines are allowed when a flagged change requires them or when the controlled optimisation pass selects a stronger safe treatment; document as `Coherence — downstream of change #N` or `Optimisation — best-available-version`.
- **Where to save the output:** save Section II (the final script) to `FINAL_SCRIPTS/<TOPIC>_FINAL.md`. Optionally save Section I to `AUDITS/<TOPIC>_AUDIT.md` for the record. Then hand the final script to `../04_EDITOR_BRIEF/01_PROMPT.md`.

---

## CONSISTENCY NOTE FOR FUTURE EDITS

This file inherits its rubric from `03_AUDIT_RUBRIC.md` and its rewrite rules from `03_REWRITE_SOP.md`. Do not duplicate or fork their content here — edit those canonical files and this prompt picks the change up. If you edit this prompt, change only one of: (1) the Part A audit flow, (2) the Part B rewrite flow, or (3) an output template. Bump the KB version line in the output when you do.

---

## OUTPUT FORMAT

Return your entire output (Section I then Section II) as a single Markdown code snippet:

```md
<Section I — Locked Audit Report>

<Section II — Final Script Package>
```

Do not add any text before or after the code block.
