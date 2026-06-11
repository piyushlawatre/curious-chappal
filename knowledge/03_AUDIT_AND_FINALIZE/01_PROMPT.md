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

1. **PART A (Audit) runs first and in full.** You are the strict Auditor. Run every check as if a *different person* — not you — will have to do the rewrite. You do not soften, skip, or pre-excuse any finding because fixing it will be work.
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
2. `03_AUDIT_RUBRIC.md` — the **Consolidated Audit**: 16 named checks (Group A story/voice + Group B safety), Required Evidence (a)–(f), verdict mapping, Final Disposition, calibration anchors, Legacy Map. **Central document for Part A.**
3. `03_REWRITE_SOP.md` — when to rewrite/reject/keep, hook-sharpening, payoff-strengthening, register fixes, fact-check workflow, banned patterns, Final Approval Checklist. **Central document for Part B.**
4. `../00_SHARED_KB/FORMAT_LANES.md` — lane-fit check (Part A) and lane preservation (Part B).
5. `../00_SHARED_KB/LANGUAGE_AND_VOICE.md` — voice rules, banned vocab, host archetype. Source of truth for identity scoring and register discipline.
6. `../00_SHARED_KB/SOURCE_AND_FACT_RULES.md` — source hierarchy, source discipline, fact-risk grading and resolution.
7. `../00_SHARED_KB/REFERENCE_SCRIPTS_CORE.md` — voice calibration. Use Anchor Short References 1–8 as the active voice target. (Full 16-script `../00_SHARED_KB/REFERENCE_SCRIPTS.md` is the full creative benchmark; open it only for a borderline creative call.)
8. `../00_SHARED_KB/SOURCE_AND_FACT_RULES.md § Citation Integrity` + `§ The Source Dossier` — already in item 6; re-read these two sections specifically before running the Group B safety checks. (The former five-pillar gate was absorbed at KB v4.0 — its checks are Group B of the rubric, owned by `SOURCE_AND_FACT_RULES.md` and `LANGUAGE_AND_VOICE.md`.)
9. `../00_SHARED_KB/SLATE_LEDGER.md` — the persisted slate memory (last ~8–12 Shorts with hook/pivot/closer shapes). Read it before the self-clone / closer-variety check; append this script's row after lock.
10. `../00_SHARED_KB/LANGUAGE_AND_VOICE.md § Reader Benchmark` + `§ The Instant Comprehension Gate` + `§ Authority Placement` — already in item 5; these own the COMPREHENSION and AUTHORITY checks. (The former Story-Shape Lock was absorbed at KB v4.0 — its checks live in HOOK, MECHANISM, PAYOFF, and PATTERN-FRESHNESS, with the Calibration rule stated in `03_AUDIT_RUBRIC.md`.)

**Conditional:** If the declared lane is **Viral Social Commentary**, OR the topic is a live viral internet debate even if another lane was declared, also read `../00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md` — mandatory audit overlay (Part A) and rebuild spec (Part B). Skip it otherwise.

Do not begin Part A until all required files are read.

---

# PART A — AUDIT (run first, then lock)

You are the Script Auditor. You score against a fixed rubric and decide the route. You do not improvise the rubric, verdict labels, or schema. **You are strict by design. Real production money depends on the discipline.**

## A. Execution order (do NOT change)

1. Confirm all required files are read.
2. Parse the script input. Confirm all 15 sections are present. If any section is missing, return `Terminal — incomplete Stage 2 script package. Rerun 02_SCRIPT_CREATION.` and stop. Do not reconstruct or regenerate Stage 2.
3. Run the **Consolidated Audit** (`03_AUDIT_RUBRIC.md`): all 16 named checks — Group A (HOOK, STRUCTURE, MECHANISM, PAYOFF, VOICE, COMPREHENSION, PATTERN-FRESHNESS, INDIAN-RELEVANCE, MODEL-INTEGRITY), then Group B (CITATION, AUTHORITY, CONTESTED-CLAIMS, HARD-NUMBERS, TEMPORAL-FRESHNESS). Record PASS/FAIL with one-line evidence per check. **Check before you narrate.**
4. Paste the Required Evidence (a)–(f) blocks verbatim (hook / spoken cadence / article-feel / concreteness carrier / self-clone vs ledger / comprehension). An un-evidenced PASS auto-converts to FAIL.
5. Apply the rubric's Calibration rule throughout: a check reading that would fail one of the ten anchor references is a miscalibrated reading — recalibrate the reading, not the script.
6. Run the **Viral Social Commentary Audit Overlay** from `../00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md` when (a) declared lane is Viral Social Commentary, or (b) topic is a live viral internet debate even if another lane was declared. Any missing overlay item = lane drift; Rewrite Trigger = Yes; add the missing item to the Fix List.
7. Complete PATTERN-FRESHNESS: read `../00_SHARED_KB/SLATE_LEDGER.md` and run the self-clone / closer-variety check against the last several rows (strip proper nouns, compare the hook/pivot/closer skeleton; if the last two Shorts closed on the two-part inversion, this one must close differently), plus the external-creator clone test (≥3 of hook/framing/mechanism angle/close/visual differ).
8. Run the Language Register Check (Complete Indian English / register drift).
9. Verify chain integrity if the topic-eval brief was provided: do the script's lane, payoff, hook, strongest source-backed narrative asset, and concrete story carrier match what the brief approved? If the asset or carrier was dropped, require evidence the replacement is more watchable.
10. Run the Temporal Freshness + Current-Function check on every time-relative word in the script (`latest`, `currently`, `today`, `this year`, `now`, equivalents) and every exact older-period fact used as present proof. Re-fetch a primary source on the audit date.
11. Generate the Fix List — specific line-level changes, each tagged to a failed named check.
11b. Confirm the structural story checks (HOOK, MECHANISM, PAYOFF, PATTERN-FRESHNESS) carry their evidence. **Any structural FAIL caps the verdict at Generic and sets Rewrite Trigger = Yes** — story blocks with the same force as safety.
12. Decide the verdict using `03_AUDIT_RUBRIC.md § Verdict Labels`, then run the **Final Disposition** gate.
13. Set the **Rewrite Trigger** (ROUTE_TO_REWRITE: Yes / No).
14. Run the Part A Self-Verification checklist.
15. **Write the complete Section I (Audit Report) output now, then treat it as LOCKED.**

## Sensitive-Tier Escalation (replaces the former Lite/Full mode selection)

There is **one audit** — the 16-check Consolidated Audit, every script. The former Full-mode triggers now escalate the CITATION check to **Sensitive tier** (the Source Dossier is filled by a verification pass independent of writer and auditor — per `../00_SHARED_KB/SOURCE_AND_FACT_RULES.md § Citation Integrity`):
- Sponsored / `#AD` Short.
- Current-affairs Short with named individuals or specific factual claims.
- Upstream Fact-risk **High**, OR any tier 5–6 claim marked **Needs verify** in the script's Fact-Check Notes.
- A script that already failed this audit once and was rewritten.

State at the top of Section I whether Sensitive-tier escalation applies and which trigger fired.

## Verdict Labels (derived from the checks — full mapping in `03_AUDIT_RUBRIC.md § Verdict Labels`)

- **Strong** — 16/16 PASS (+ overlay if applicable). Rewrite Trigger = **No**, Direct finalization.
- **Good but needs polish** — Group B all PASS; ≤2 Group A FAILs, each line-level fixable. Rewrite Trigger = **No**.
- **Generic** — any FAIL on HOOK, STRUCTURE, MECHANISM, PAYOFF, or PATTERN-FRESHNESS; or >2 Group A FAILs. Rewrite Trigger = **Yes**.
- **Off-brand** — VOICE FAIL. Rewrite Trigger = **Yes**.
- **Fact-risky** — any Group B FAIL. Rewrite Trigger = **Yes** if the claim can't survive as written; otherwise **No** and Direct finalization repairs (verify / soften / cut).
- **Reject** — pervasive failure or the idea fails the Final Disposition re-score. Rewrite Trigger = **Yes**; AI reframe if defensible; drop only when no clean reframe exists.

A failed Viral overlay = Rewrite Trigger **Yes** (lane rewrite), verdict at most Generic. A factually clean script that fails VOICE or a structural story check is **not Strong** — story blocks with the same force as safety.

**Be strict. Do not adjust results upward to be kind.**

## Check discipline (mandatory)

- Record PASS/FAIL **before** writing narrative justification.
- Every PASS carries one line of evidence; the six Required Evidence blocks are pasted verbatim. An un-evidenced PASS auto-converts to FAIL.
- VOICE is checked against `../00_SHARED_KB/LANGUAGE_AND_VOICE.md`, not taste. If everything passes effortlessly, re-run VOICE and PATTERN-FRESHNESS — those two catch the failures a kind auditor waves through.
- If the script carries a Stage 1 mental model that is fake/forced, MODEL-INTEGRITY fails and Chain Integrity is flagged. If absent, carry `N/A — optional bonus`.

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
2. From the locked audit, extract: verdict; failed checks (Group A and Group B by name); Viral overlay status; generic/off-brand lines; Fix List; Fact-Check Risks; Final Recommendation.
3. Classify finalization scope using `03_REWRITE_SOP.md § When to Rewrite / Reject / Keep Mostly Untouched` and the route above.
4. If scope is Major rewrite, run `03_REWRITE_SOP.md § Major Rewrite: Story-Preserving Accuracy Protocol`: inventory the original's strongest narrative assets; run claim-repair and narrative-evidence searches; record the asset the rewrite will preserve.
5. Apply the Fix List line by line. Use each suggested replacement if it lands; if weak, write a stronger one and explain in Rewrite Accountability.
6. **VOICE / article-feel failures:** rebuild using `03_AUDIT_RUBRIC.md § Required Evidence (a)–(d)` and `03_REWRITE_SOP.md § How to Fix Polished Explainer Drift`.
7. **Viral lane drift:** if the overlay failed, rebuild with the debate payload + viewer-verdict close.
8. **Per-check fixes:** apply the fix guidance for every failed check, including COMPREHENSION (mental-math/reference stability) and AUTHORITY (placement).
9. Build a second viable full treatment when a materially different safe spine exists; run the Best-Available-Version comparison and document why the selected treatment wins.
10. Address every Fact-Check Risk by re-fetching load-bearing sources; re-fetch time-relative claims and exact older-period evidence functioning as present proof; verify evidence scope. If unverifiable, soften or cut.
11. Run the **Rewrite Regression Check** for every Major rewrite: original vs final on hook pull, concrete imagery, cognitive load, payoff, and factual honesty. Repair any unjustified regression.
12. Run a **cold-read final audit** on the finished rewrite as fresh input. Do not rely on Rewrite Accountability explanations. All 16 consolidated checks must pass.
13. If Part A flagged Medium/High external-creator clone risk, confirm the rewrite differs in ≥3 dimensions.
14. Confirm length within the Anchor band **numerically**: strip every delivery cue and count the words — 200–280 or the script cannot lock; state the count in Section II § 8. Also confirm delivery cues are present and drawn only from the seven canonical tokens (`[direct]`, `[no smile]`, `[stress]`, `[slow]`, `[drop voice]`, `[beat]`, `[pause]`), with the closer carrying `[drop voice]`.
15. Confirm chain integrity, including narrative-asset preservation.
16. Fill Section II, then run Part B Self-Verification.
17. **After the script is locked PRODUCTION-READY, record its Slate Ledger row** (date | topic | lane | hook shape | pivot shape | closer shape | mid-script template) so the next Stage 1 and Stage 3 inherit this Short as slate memory. If you can write files in this environment, append it as the new top data row of `../00_SHARED_KB/SLATE_LEDGER.md`. If you cannot write files (e.g. this prompt was run in a chat and the output is pasted back into the orchestrator app), **emit the row in Section II § 18 as a copy-ready line** for the operator to paste into the ledger. Use the shape vocabulary defined in `SLATE_LEDGER.md`. If the script was not locked (terminal/DROP), do not record a row — write "§ 18: N/A — not locked."

## B. Hard constraints (mandatory)

- **Preserve** the topic (changing it = a new script, not a rewrite); the format lane (unless the audit flagged a lane error or the Viral lane clearly applies); the hook+payoff combo if the audit didn't flag both (sharpen, don't replace); and fact-checked claims already verified.
- **Optimise without churn:** preserve strong lines and facts, but allow broader changes when the Best-Available-Version comparison proves a materially stronger safe treatment.
- **Length & structure:** Anchor 60–120s / 200–280 words; all narrative functions present in the strongest topic-native story spine.
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
*Audited on <YYYY-MM-DD>. KB version: v4.3. Auditor: <model name>.*
*Sensitive-tier escalation: <No — routine | Yes — trigger: …>*
*Script source: 02_SCRIPT_CREATION draft dated <YYYY-MM-DD>.*
*Chain check: <Pass | Fail — describe drift> (if brief provided)*

## 1. Verdict
**<Strong | Good but needs polish | Generic | Off-brand | Fact-risky | Reject>**
One-line reasoning (≤25 words).
**Rewrite Trigger (ROUTE_TO_REWRITE):** Yes | No
**Final Disposition (PASS | FIX | DROP):** <one> — if DROP, one-line reason (see § 13 + `03_AUDIT_RUBRIC.md § Final Disposition`).

## 2. Consolidated Audit (16 named checks)

**Sensitive-tier escalation:** <applies? + trigger | "No — routine">

### Group A — Story & Voice
| Check | Pass? | Evidence (one line; quotes where the check requires them) |
|---|---|---|
| HOOK | PASS/FAIL | … |
| STRUCTURE | PASS/FAIL | … |
| MECHANISM | PASS/FAIL | … |
| PAYOFF | PASS/FAIL | … |
| VOICE | PASS/FAIL | … |
| COMPREHENSION | PASS/FAIL | … |
| PATTERN-FRESHNESS | PASS/FAIL | … |
| INDIAN-RELEVANCE | PASS/FAIL | … |
| MODEL-INTEGRITY | PASS/FAIL/N-A | … |

### Group B — Safety (binary; ANY FAIL blocks lock)
| Check | Pass? | Evidence |
|---|---|---|
| CITATION | PASS/FAIL | Source Dossier result (per claim) |
| AUTHORITY | PASS/FAIL | … |
| CONTESTED-CLAIMS | PASS/FAIL | … |
| HARD-NUMBERS | PASS/FAIL | … |
| TEMPORAL-FRESHNESS | PASS/FAIL | … |

**Audit result:** <"16/16 PASS" or "FAIL on [CHECK, CHECK] — see Fix List">

## 3. Required Evidence (a)–(f) — un-evidenced passes are auto-fail
- **(a) Hook quoted:** `<verbatim single line or 2–3 line stack; confirm no over-claim>`
- **(b) Spoken-cadence lines (2):** 1.`<>` 2.`<>` — restrained, natural-verbal; NO reaction tics, NO Hindi/Hinglish
- **(c) Article-feel test:** densest 3 reveal lines `<>`; joined `<>`; verdict `Spoken-feel / Article-feel`
- **(d) Concreteness carrier:** `<scene/object/comparison/action-chain/named-specifics + what the editor can show without writing the thesis on screen>`
- **(e) Self-clone:** `<proper-nouns-stripped skeleton + closer shape vs SLATE_LEDGER recent rows + verdict>`
- **(f) Comprehension:** `<failing lines quoted, or "none">`

## 4. Mental Model / Framework Integrity
**Status:** Pass | Fail | N/A — <quote model + why natural / N/A / fake-forced>

## 5. Viral Social Commentary Overlay
Pass | Fail | N/A — quote Side A, Side B, math, direct viral evidence, discomfort, viewer question OR list missing items.

## 6. Lane + Register + Chain Checks
- **Format-lane fit:** Strong | Weak | One-off justified — why: <one line>
- **External-creator clone risk:** Low | Medium | High — side-by-side test + which channel; if High, which of (hook, framing, mechanism angle, close, visual) must change *(detail behind PATTERN-FRESHNESS)*
- **Language register:** Complete Indian English | register drift (describe)
- **Energy register match:** <1–10> — delivery note matches? Y/N
- **Chain integrity (if brief provided):** lane / payoff / hook / narrative asset / carrier vs brief — Pass | Fail (describe drift)

## 7. What Works (specific quotes)
- "<line>" — why it works

## 8. What Feels Weak (specific quotes + category)
- "<line>" — fails <NAMED CHECK> — why

## 9. Generic or Off-Brand Lines (exact quotes; "None" if all pass)
- "<line>" — sounds like <creator house style / documentary / Hinglish fact channel / motivational reel>

## 10. Fix List (specific, line-level, actionable)
| # | Current line | Suggested fix | Tied to |
|---|---|---|---|
| 1 | "<exact current>" | "<exact replacement>" | <NAMED CHECK> |

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
- [ ] Sensitive-tier escalation declared (+ trigger, or "routine")
- [ ] Clean-room check: if brief = full-form-candidate OR all Stage-1 gates ≥8, Part A was completed and locked as a standalone pass before any Part B content
- [ ] All 16 checks recorded PASS/FAIL BEFORE narrative
- [ ] Required Evidence (a)–(f) pasted verbatim; no un-evidenced PASS
- [ ] Calibration rule applied: no check reading that would fail an anchor reference
- [ ] Group B safety checks run with the Source Dossier filled per load-bearing cited claim
- [ ] Temporal freshness rechecked for every time-relative claim and every exact older-period fact used as present proof
- [ ] Viral overlay run when required; failures → Rewrite Trigger = Yes
- [ ] External-creator clone risk graded; SLATE_LEDGER read for self-clone/closer variety
- [ ] Specific quotes used (not paraphrases)
- [ ] Fact-check table covers every load-bearing claim
- [ ] Sources Consulted listed (or "None")
- [ ] Verdict ↔ checks ↔ Rewrite Trigger internally consistent (per the rubric mapping)
- [ ] Counter-argument written
- [ ] Final Disposition (PASS/FIX/DROP) set via the Idea-Strength re-score; DROP chosen over rewrite when the idea (not the execution) is weak
```

**>>> AUDIT LOCKED. No silent weakening; evidence-based corrections must be logged explicitly. <<<**

## SECTION II — FINAL SCRIPT PACKAGE
*(Use these headers verbatim.)*

```
# Final Script: <topic name>
*Finalized on <YYYY-MM-DD>. KB version: v4.3. Rewriter: <model name>.*
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
<full spoken prose. Anchor 200–280 words. Complete Indian English. Required narrative functions present in the strongest topic-native order. No banned vocab.>

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

## 14. Cold-Read Fix Verification (16/16 consolidated checks)
Judge the final rewrite as fresh input. Do not carry a PASS merely because the original beat passed. Re-run every check touched by the rewrite, with special attention to VOICE, COMPREHENSION, AUTHORITY, and CITATION.

| Check (all 16) | Pass? | Evidence from the final script |
|---|---|---|
| HOOK … TEMPORAL-FRESHNESS (one row per check) | PASS/FAIL | … |

### 14a. Required Evidence (a)–(f) for the final script
Paste all six blocks (hook, spoken cadence, article-feel, concreteness carrier, self-clone vs ledger, comprehension) for the FINAL script. Any unfillable item = not production-ready.

### 14b. Viral Social Commentary Evidence (only if applicable)
Quote: viral object + number; what it does; Side A steelman; Side B steelman + math; direct viral evidence; discomfort; viewer-question close. Any unfillable row = not production-ready.

**Result:** <"16/16 checks clear — production-ready" OR "FAIL on [CHECK] — repair and re-score">

## 15. Improvement Verification (vs original)
| Original audit flag | Status in rewrite | Evidence |
|---|---|---|
| <flag> | Fixed/Cut | "<line or change>" |
**External-creator clone risk recheck** (if original Medium/High): differs in ≥3 of Hook|Framing|Mechanism angle|Close|Visual — specifics per item.
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
- [ ] Every change in §12 traces to an audit fix, a failed check, or a coherence adjustment (no silent changes)
- [ ] All fact-check risks Verified or Cut (none left Unverified)
- [ ] §14 cold-read passes: 16/16 consolidated checks + Viral evidence if applicable
- [ ] If Major rewrite: §15a Rewrite Regression Check contains no unjustified regression
- [ ] §15b Best-Available-Version Comparison selects the strongest viable safe treatment when an alternative exists
- [ ] Spoken-Rhythm evidence carried or re-quoted for rewritten beats
- [ ] Plain Word Test passed: every word in the final script is accessible to a Class 10–12 educated Indian reader, or is defined immediately inline
- [ ] Word count verified numerically with all delivery cues stripped: 200–280 (count stated in § 8)
- [ ] Delivery cues present and drawn only from the canonical seven-token vocabulary; closer carries `[drop voice]`
- [ ] §16 SOP checklist = All checked
- [ ] All consulted URLs listed (or "None")
- [ ] §15 covers every original audit flag
- [ ] § 18 Slate Ledger Row emitted (copy-ready) or appended to the file; "N/A — not locked" if terminal

## 18. Slate Ledger Row (paste into SLATE_LEDGER.md)
Emit the single new ledger row for this Short, as a copy-ready Markdown table row, using the shape vocabulary in `../00_SHARED_KB/SLATE_LEDGER.md` (hook shape / pivot shape / closer shape / mid-script template). The operator pastes this as the new top data row of the ledger table. If the script did not lock, write `N/A — not locked.`

`| <YYYY-MM-DD> | <topic> | <lane> | <hook shape> | <pivot shape> | <closer shape> | <mid-script template> |`
```

---

## OPERATING RULES

- **The wall between Part A and Part B is the whole point.** Audit honestly and completely first; lock it; then fix. If you find yourself softening a Part A finding to reduce Part B work, you have violated the design — stop and re-audit.
- **You apply fixes in Part B; you do not re-judge.** If you disagree with a Part A finding, you may override a specific fix in §12 with documented reasoning — but you may not silently drop it, and you may not lower a score or remove a failure-mode flag. The default is to trust the locked audit.
- **Section 12 is the accountability artifact.** Any change not listed there is a silent change — a bug.
- **Controlled optimisation bias.** In Strong/Good scripts, preserve strong lines and avoid churn, but do not let "unflagged" mean "untouchable." A controlled optimisation pass may replace unflagged lines when the Best-Available-Version comparison proves a stronger safe treatment.
- **Coherence permission.** Downstream changes to unflagged lines are allowed when a flagged change requires them or when the controlled optimisation pass selects a stronger safe treatment; document as `Coherence — downstream of change #N` or `Optimisation — best-available-version`.
- **Where to save the output:** save Section II (the final script) to `03_AUDIT_AND_FINALIZE/FINAL_SCRIPTS/<TOPIC>_FINAL.md` — the `FINAL_SCRIPTS/` folder *inside this stage folder*, never a root-level `FINAL_SCRIPTS/`. Optionally save Section I to `03_AUDIT_AND_FINALIZE/AUDITS/<TOPIC>_AUDIT.md` for the record. Then hand the final script to `../04_EDITOR_BRIEF/01_PROMPT.md`.

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
