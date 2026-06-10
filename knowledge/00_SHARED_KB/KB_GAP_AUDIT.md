---
title: "KB Gap Audit — Why the Pipeline Doesn't Produce the Optimised Version"
file: "KB_GAP_AUDIT.md"
role: diagnostic
canonical: false
version: "v1.0"
produced: "2026-06-07"
related: ["01_TOPIC_EVALUATION/04_TOPIC_VALIDATION_GUIDE.md", "02_SCRIPT_CREATION/04_SCRIPT_DRAFTING_GUIDE.md", "03_AUDIT_AND_FINALIZE/03_REWRITE_SOP.md", "00_SHARED_KB/SOURCE_INTEGRITY_AND_CLARITY_GATE.md", "03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md"]
---

# KB Gap Audit

> **RESOLVED HISTORICAL AUDIT:** The narrative-asset handoff gaps below were fixed in KB v3.3. This file is retained only as historical evidence. Do not use its recommendations as current operating rules; use `../03_AUDIT_AND_FINALIZE/AUDITS/KB_AUDIT_optimised-version-v3.6_gap-pass_2026-06-07.md` for the active gap audit.

## The Problem in One Sentence

The pipeline produces factually-correct but narratively-weak scripts (the **New Script**) when a stronger scene-first version (the **Optimised Version**) is available — because no rule at any stage requires the scene to be preserved, handed forward, or used.

---

## The Three Versions and Their Failure Modes

| Version | Strength | Failure |
|---------|----------|---------|
| **Old Script** | Scene-first hook (1930s vendors outside). Cinematic. Strong retention. | Vague authority ("Every analyst…"), wrong journal ("journal Perception"), overclaim ("That is the whole business model"). Pipeline-level failures. |
| **New Script** | Factually clean: PVR INOX FY 2024-25 data, De Luca correctly cited, 85%+ sourced. | Ratio-first hook. Opens like a finance explainer. Denominator switch between ticket and F&B ratios. Single-cause payoff risk. |
| **Optimised Version** | Scene-first hook + Indian ratio data in the body + clean three-mechanism sequential payoff. | Target output. Pipeline did not produce it. |

**The gap between New and Optimised is not about facts.** All three facts (ticket split, smell study, margin figure) are present in both. The gap is structural: where the scene lands, how the ratios are presented, and how the payoff sequences the three mechanisms.

---

## Root Cause: The Pipeline Has No Handoff Mechanism for Narrative Assets

The 1930s scene — cinema owners watching vendors sell to their own audience before the door — is sourced (Smithsonian documents early adoption). It is the strongest available story asset for this topic. It converts a financial mechanism into a human conflict with a resolution. It earns the ratios that come after it.

But this scene is never documented in the Stage 1 output. Stage 2 never receives a standing order to use it. Stage 3 cannot test whether it was used. The pipeline is completely transparent to narrative assets that exist in the source material.

---

## The Six Specific Gaps

---

### GAP 1: Stage 1 doesn't require a "Narrative Asset" field in its output

**Where:** `01_TOPIC_EVALUATION/04_TOPIC_VALIDATION_GUIDE.md`

**What's missing:** The Stage 1 output template has fields for topic, lane, hook candidates, payoff, source notes, fact-risk grade, Indian relevance, and mental model. It has NO field for the strongest source-backed narrative asset (scene / person / decision / conflict / object) available from the research.

**Consequence:** Stage 2 receives a brief with hook candidates that came from the obvious angle (financial ratios, because those are specific and checkable). The 1930s scene never appears in the brief. Stage 2 has no standing order to use it.

**Fix:** Add a required field to the Stage 1 output template:
```
Narrative asset: [Name the strongest source-backed scene/person/decision/conflict/object.
State the source. If none exists, write NONE.]
```
Make it mandatory. A brief that skips it returns to Stage 1.

---

### GAP 2: "Story-before-receipts" is a preference in Stage 2, not a gate

**Where:** `02_SCRIPT_CREATION/04_SCRIPT_DRAFTING_GUIDE.md` § Story-before-receipts rule

**Current wording:** *"When a verified scene, person, decision, conflict, or object can carry the opening, **prefer** it over leading with accounting ratios or source exposition."*

**What's wrong:** "Prefer" is not a gate. A ratio-first hook that satisfies the hook rules (counterintuitive, specific, no greeting) will pass Stage 2 without triggering this preference — especially when the Stage 1 brief lists no narrative asset, so Stage 2 doesn't know a scene exists.

**Consequence:** "Film studios take most of your ticket price. / Cinemas have always known this." passes all hook tests (it is counterintuitive, specific, declarative) while the 1930s scene sits unused.

**Fix:** Change from preference to gate:
> If the Stage 1 brief names a source-backed narrative asset, using it as the hook or core mechanism scene is the **default choice**. A ratio/receipt-first hook is allowed only when (a) no narrative asset is listed in the Stage 1 brief, or (b) the brief explicitly justifies why the ratio creates stronger curiosity than the available scene.

---

### GAP 3: Stage 3 Mode 9(d) can only run if the Stage 1 brief documented the narrative asset

**Where:** `03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md` § Pass 2 § Failure Mode 9(d) — Narrative-Force Test

**What's missing:** Mode 9(d) requires the auditor to "name the strongest scene, person, decision, conflict, object, or contrast available in the **draft/brief/sources**." But if Stage 1 didn't document the narrative asset in the brief, the auditor has no prior record of it. The auditor would need to independently go back to the source material — which isn't required by the rubric.

**Consequence:** In the cinema-popcorn audit, Mode 9 was not triggered. The ratio-first hook passed. The 1930s scene was never tested. The audit correctly flagged four failure modes (10, 18, 22, 24) but left the narrative structure untouched.

**Fix:** Mode 9(d) should require the auditor to explicitly verify against the Stage 1 brief:
> "Does the script use the narrative asset named in the Stage 1 brief? If no narrative asset was listed, was a source-backed scene available and unused? [Evidence required for either answer.]"

---

### GAP 4: No guidance on multi-mechanism sequential payoffs

**Where:** `03_AUDIT_AND_FINALIZE/03_REWRITE_SOP.md` § How to Fix Final-Rule and Context Drift

**What's missing:** The KB correctly bans "That is the whole business model" (single-cause overclaim) via Mode 16 and Pillar 2. Mode 16 says to rewrite to "an honest both/and." But it doesn't show HOW to structure a three-mechanism sequential payoff where the mechanisms are causally ordered, not merely additive.

For the popcorn topic, the three mechanisms are sequential and each is necessary:
1. **Margin** = enables the business (prerequisite)
2. **Smell** = starts the buying decision (trigger)
3. **Counter** = closes the sale (closer)

This is an ENABLE → TRIGGER → CLOSE pattern. The KB doesn't name or template it. When writers avoid the overclaim, they produce either:
- A flat additive: "Popcorn has margin AND smell." (loses the sequence, loses the counter)
- A tangled finance explainer: the New Script's denominator-switching middle section

**Fix:** Add a worked example in the Rewrite SOP under "How to Fix Final-Rule and Context Drift":
```
Sequential three-mechanism payoff (ENABLE → TRIGGER → CLOSE):
✅ "The margin makes popcorn valuable.
   The counter closes the sale.
   But the smell starts it."

NOT this:
❌ "The concession stand is the whole business model." (overclaim)
❌ "Popcorn has margin and it has smell." (additive, loses the sequence and the counter)
```

---

### GAP 5: The denominator-reset verbal signal is not taught as a positive rule

**Where:** `00_SHARED_KB/SOURCE_INTEGRITY_AND_CLARITY_GATE.md` § Pillar 4 → Mental Math and Reference Stability Test; `00_SHARED_KB/LANGUAGE_AND_VOICE.md` § Sentence Rhythm

**What's missing:** The KB bans adjacent denominator switches (correctly). But when a script legitimately needs TWO ratios with different bases (ticket revenue split AND concession gross margin), it gives no guidance on HOW to present both without confusing the viewer.

The New Script's failure: "for every ₹100 in ticket revenue, cinemas earn ₹60 from food" then immediately "only ₹25 of that ₹60 is cost" — the implicit switch from ticket-₹100 to food-₹100 creates confusion even though every word is clear.

The Optimised Version's fix: an explicit verbal anchor resets the reference group before the second ratio:
- *"for every ₹100 PVR INOX earned from movie tickets, it earned almost ₹60 more from food"*
- *"when its food counter sold ₹100 worth of snacks and drinks, the food and drink itself cost only about ₹25"*

The phrase "when its food counter sold ₹100 worth" does the work. The viewer is explicitly told the new reference frame before the second number arrives.

**Fix:** Add a positive example to the Mental Math section in `SOURCE_INTEGRITY_AND_CLARITY_GATE.md` or `LANGUAGE_AND_VOICE.md`:
```
Two-ratio presentation with explicit denominator reset:
✅ "For every ₹100 PVR INOX earned from tickets, it earned almost ₹60 more from food.
   And when its food counter sold ₹100 worth, the food itself cost only about ₹25."
   [The second ratio is introduced with a new verbal anchor: "when its food counter sold ₹100 worth."
   The viewer is given the new reference frame before the number arrives.]

❌ "For every ₹100 in tickets, they earn ₹60 in food. And ₹75 of those rupees is profit."
   ["those rupees" implies ₹60 but the viewer must do the arithmetic to confirm it.]
```

---

### GAP 6: Stage 1 doesn't specifically prompt for historical founding scenes in Smart Money / Smart Business topics

**Where:** `01_TOPIC_EVALUATION/04_TOPIC_VALIDATION_GUIDE.md` § Business Stories, § Historical / Biographical Stories

**What's missing:** The Business Stories section lists hook types (mechanism, hidden reason, model) but doesn't explicitly say: "For Smart Money / Smart Business topics, check whether a documented historical founding scene, adoption event, resistance moment, or market-structure shift exists in the source material. These are first-class narrative assets — not background context."

The 1930s cinema-popcorn story lives at the intersection of Business Story and Historical Story. The Stage 1 guide treats them as separate categories. A researcher doing Stage 1 on a modern business topic (PVR INOX, multiplex economics) might not think to check the historical record for a founding conflict.

**Fix:** Add to the Business Stories section in the Stage 1 guide:
> For Smart Money / Smart Business topics, specifically check whether a documented historical founding scene, adoption event, or market-structure shift is available from credible sources (primary documents, established outlet archives, Smithsonian-level institutional records). If found and sourced, it is a first-class narrative asset — list it in the narrative asset field, not just as background research.

---

## Summary: What Breaks at Each Stage

| Stage | What the KB says | What happens in practice | The gap |
|-------|-----------------|--------------------------|---------|
| **Stage 1** | 8-point validation, hook candidates, lane, fact-risk, mental model | Lists ratio-based hook candidates. No scene documented. | No narrative asset field. Business stories section doesn't prompt for historical scenes. |
| **Stage 2** | "Prefer" scene-first over receipt-first | Produces ratio-first hook because brief has no scene listed and ratios satisfy all hook gates | "Prefer" is not a gate. Without narrative asset in brief, Stage 2 defaults to ratios. |
| **Stage 3 Audit** | Mode 9(d): name strongest scene available in brief/sources | Mode 9 not triggered. Hook passes as counterintuitive declarative. | Can't test narrative-force against a scene that was never documented in the Stage 1 brief. |
| **Stage 3 Part B** | Fix only what the audit flags | Fixes Modes 10, 18, 22, 24. Hook structure unchanged. | Mode 9(d) never flagged the hook structure, so Part B had no mandate to change it. |

---

## Files to Edit and What to Change

| File | Section | Change |
|------|---------|--------|
| `01_TOPIC_EVALUATION/04_TOPIC_VALIDATION_GUIDE.md` | Stage 1 output template + Business Stories section | Add required `Narrative asset` field; add historical-scene prompt for Smart Money topics |
| `02_SCRIPT_CREATION/04_SCRIPT_DRAFTING_GUIDE.md` | Story-before-receipts rule | Change from "prefer" to gate: if Stage 1 brief names a narrative asset, using it is the default |
| `03_AUDIT_AND_FINALIZE/03_REWRITE_SOP.md` | How to Fix Final-Rule and Context Drift | Add three-mechanism sequential payoff worked example (ENABLE → TRIGGER → CLOSE) |
| `00_SHARED_KB/SOURCE_INTEGRITY_AND_CLARITY_GATE.md` | Pillar 4 → Mental Math and Reference Stability Test | Add positive example showing how to present two ratios with an explicit denominator reset |
| `03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md` | Pass 2 → Failure Mode 9(d) | Require auditor to verify narrative-asset use against the Stage 1 brief by name |

---

## What the Optimised Version Proves

The Optimised Version is not "more creative." It is more faithful to the KB's own rules — specifically the rules that the pipeline currently fails to enforce:

- Scene-first hook: in the KB, not enforced
- Three-mechanism sequential payoff: implied by Mode 16 ban on overclaim, not positively taught
- Explicit denominator reset: in the KB as a prohibition, not as a positive technique
- Historical narrative asset for a business topic: referenced obliquely, not required at Stage 1

The Optimised Version would be the natural output if these six gaps were closed.

---

*Audit produced: 2026-06-07 | Model: claude-sonnet-4-6 | KB version: v3.2*
