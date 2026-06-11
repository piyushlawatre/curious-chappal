---
title: "Knowledge Base Regression Tests"
file: "KB_REGRESSION_TESTS.md"
role: "quality-control"
canonical: true
version: "v1.3"
related: ["03_AUDIT_RUBRIC.md", "03_REWRITE_SOP.md", "01_PROMPT.md", "../00_SHARED_KB/SOURCE_AND_FACT_RULES.md"]
summary: "Reusable regression suite for story-preserving accuracy, mental-math clarity, authority placement, temporal freshness, and major-rewrite quality."
---

# Knowledge Base Regression Tests

Run this suite after any material edit to drafting, audit, rewrite, source, hook, or voice rules.

## Pass Condition

All cases must produce the expected result. A rule change that causes any case to pass incorrectly is not merged until repaired.

## Case 1 — Factually Unsafe but Narratively Strong

**Input shape:** strong scene-first opening; vague authority; unsupported intent; single-cause payoff.

**Expected:**

- Narrative asset is explicitly identified and preserved for rewrite.
- `NEEDS-ANOTHER-PASS` / `FIX`.
- HOOK (over-claim), PAYOFF (single-cause overclaim), AUTHORITY, and/or CITATION trigger as applicable.
- Rewrite searches for safer evidence supporting the scene; it does not automatically replace the scene with ratios.

**Popcorn fixture:** the old 1930s vendor story.

## Case 2 — Factually Clean but Narratively Weaker

**Input shape:** opens with two verified ratios; adjacent lines change denominator; unfamiliar author names spoken; no human scene; time-relative "latest" wording.

**Expected:**

- HOOK fails when a materially stronger source-backed scene is available.
- COMPREHENSION fails for mental-math/reference-switch friction.
- Authority Placement fails if unfamiliar names add no spoken value.
- Temporal Freshness fails if a newer primary filing exists.
- Cannot lock `PRODUCTION-READY`.

**Popcorn fixture:** the finance-first PVR INOX final.

## Case 3 — Story-Led, Fact-Safe Candidate

**Input shape:** strong narrative proposition opens and hands directly into a source-backed historical scene; current numbers later; honest mechanism roles; no unnecessary spoken citation details.

**Expected:**

- Preferred rewrite direction.
- Must not be weakened merely to put the historical scene literally in line one.
- Must still fail if it upgrades revenue/gross margin into unsupported profit language.
- Must use the newest verified period or an exact historical period.
- Can lock only after cold-read and Rewrite Regression Check pass.

**Popcorn fixture:** the supplied Optimised Version after:

1. softening/verifying "one of the main profit engines";
2. considering FY26 primary results;
3. keeping full academic citation on-screen/in notes.

## Case 4 — Generic Denominator Switch

**Input:**

> For every ₹100 the app earns, ₹40 comes from subscriptions.  
> For every ₹100 of subscriptions, ₹30 goes to creators.

**Expected:** COMPREHENSION fails when adjacent in the opening. The second ratio moves later or the denominator reset is made explicit.

## Case 5 — Authority Placement

**Input A:** "Researchers found that smell changes choice."

**Expected:** fail vague authority.

**Input B:** "Ramona De Luca and Delane Botelho ran five experiments..."

**Expected:** fail spoken placement when the names add no viewer value; full citation moves on-screen/in notes.

**Input C:** "A five-experiment 2020 study found that a pleasant smell can push people toward matching choices."

**Expected:** spoken line may pass when the full checkable citation is present on-screen/in notes.

## Case 6 — Temporal Freshness

**Input:** a script finalized today says an older filing is the company's "latest financial year" when a newer audited result exists.

**Expected:** TEMPORAL-FRESHNESS fails; update to newest data or replace "latest" with the exact historical period.

## Case 7 — Rewrite Regression

**Input:** original has a strong sourced scene; major rewrite is safer but opens with source exposition or ratios.

**Expected:**

- Rewrite Regression Check marks Hook Pull and Concrete Scene/Image as `Worse`.
- Final cannot be `PRODUCTION-READY` without restoring the story asset or documenting an evidence-forced reason plus a stronger replacement.

## Case 8 — Organic Multi-Mechanism Sequence

**Input:** margin enables value; smell triggers desire; counter closes sale.

**Expected:** causal roles are clear without forcing "First/Second" labels. A flat additive explanation or merged mechanism fails.

## Case 9 — Ending Subtraction

**Input A:** four-line close where one middle line repeats the same function.

**Input B:** shorter close that preserves clarity and gives the strongest line final emphasis.

**Expected:** B wins; A cannot lock merely because nothing follows its punchline.

## Case 10 — Good Versus Best

**Input:** two fact-safe full treatments: one compliant but formulaic, one with a stronger proposition, story spine, causal progression, and ending.

**Expected:** Best-Available-Version Gate selects the stronger treatment and records why.

## Case 11 — Current Function and Scope

**Input:** exact older-period data follows a present-day framing; one company's result is generalized to an industry.

**Expected:** current-function freshness and evidence-scope checks fail until newest comparable evidence is considered and the claim scope is narrowed.

## Case 12 — Abstract Asset Substitution

**Input:** Stage 1 labels "health claims can increase willingness to pay" as the strongest narrative asset; Stage 2 opens by stating that finding; editor notes show packets as B-roll.

**Expected:**

- The finding passes as the sourced narrative proposition but fails the Pictureability Test as the concrete story carrier.
- HOOK and MECHANISM fail when a safe shelf comparison would create a stronger opening.
- One isolated packet fails to stage the relative choice; the carrier must show both options or the reference point.
- Decorative packet B-roll does not rescue an abstract spoken script.

## Case 13 — Viewer-World Comparison + Observable Behaviour

**Input:** two similar packets on one shelf; one plain, one carrying a health claim; reveal shows the shopper scanning, eliminating, and choosing. The script does not claim a documented shopper, motive, exact price, or measured result.

**Expected:**

- Viewer-world comparison may pass as a safe illustrative carrier.
- The hook may take two or three short scene lines before the explicit claim.
- Observable-behaviour requirement passes.
- Full citation stays on-screen/in notes unless an authority name is recognisable or story-central.

## Case 14 — Reference Calibration Versus Safety Rule

**Input:** a reference script contains a creatively strong line that conflicts with a newer sourcing, clarity, or lock-safety rule.

**Expected:** preserve the creative function where possible, but the owning safety/operational rule wins. The reference cannot waive source integrity, instant clarity, or stage ownership.

## Case 15 — Optional Mental Model

**Input:** topic passes hook, curiosity, payoff, novelty, mechanism, and identity gates but has no natural transferable model.

**Expected:** no score or verdict reduction merely for `N/A`. Auditor checks model integrity only when Stage 1 supplied one.

## Case 16 — Routine Named-Company Business Mechanism

**Input:** neutral business mechanism supported directly by an official company filing; no allegation, advice, contested claim, or reputational harm.

**Expected:** Routine-tier. It does not become Sensitive-tier merely because a named company and financial figures appear.

## Case 17 — Audit Finding Corrected by New Evidence

**Input:** Part A flags a citation or claim; Part B fetches the source and proves the finding factually wrong.

**Expected:** Part B logs an explicit `Audit Finding Correction` with old finding, new evidence, and corrected action. Silent downgrade fails; damaging the script to satisfy a disproven finding also fails.

## Case 18 — Identity-Led Idea Strength

**Input:** the novelty is a specific person, place, company, or object.

**Expected:** keep identity-bearing proper nouns during Idea-Strength re-score. Strip them only for the separate clone/skeleton check.

## Case 19 — Editor Beat Count Collision

**Input:** a three-line hook forms one visual comparison; the Short has twelve meaningful visual beats; a science diagram needs a four-second hold.

**Expected:** the three hook lines may share one visual idea; the diagram hold is not treated as a two-second B-roll cutaway; the brief remains inside the 10–14 meaningful-beat target.

## Case 20 — Comparison Thumbnail

**Input:** the concrete story carrier is a clean comparison between two products.

**Expected:** clean side-by-side comparison may pass. Hype-style `VS`, hard split, arrows, circles, and adversarial treatment still fail.

## Case 21 — Proposed-Lane Handoff

**Input:** a topic cleanly fits Forgotten Inventor, Quiet Monopoly, or Status Game.

**Expected:** Stage 1 may declare that lane and every downstream schema preserves it. The topic is not forced into One-off or an adjacent canonical lane merely because the lane remains proposed.

## Case 22 — Declarative Reference-Shape Open

**Input:** a script opening on a sharp counterintuitive declarative with no staged scene ("Mosquitoes do not bite randomly. They hunt specific people."), mechanism carried by named specifics (institutions, dates, numbers).

**Expected:**

- Story-Shape Check 2 PASSES — the nod-at-it declarative is the channel's signature open, not a defect.
- Story-Shape Check 1 PASSES — named specifics carrying the mechanism satisfy concreteness; no staged scene required.
- Any reading of the gate that would fail an anchor reference is recalibrated per `03_AUDIT_RUBRIC.md § Calibration rule`.

## Case 23 — Viral Beat-5 Wording Clone

**Input:** a Viral Social Commentary script whose granting-both-sides beat reads "Both sides are right — inside their own clock."

**Expected:**

- The Viral overlay flags the Beat-5 wording: References 15/16's "inside their own X" construction with a swapped noun is a reference clone, counted against PATTERN-FRESHNESS.
- Rewrite Trigger = Yes; the line is rewritten from the topic's own nouns.
- The granting-both-sides beat itself remains mandatory — only the reference wording fails.

## Case 24 — Out-of-Band Word Count

**Input A:** a 172-word script formatted as dozens of fragmented vertical lines, otherwise clean on every named check.
**Input B:** a 289-word script, otherwise clean.

**Expected:**

- Neither can lock. The numeric word-count check (all delivery cues stripped) fails the Anchor band (200–280 words) and the count is stated in the final package.
- Input A additionally fails VOICE: a fragment-poem is the equal-and-opposite failure of article prose.
- A script with no delivery cues, or with invented cue tokens, also cannot lock (Writer's Lock check 7 / Stage 3 cue check).

## Case 25 — Diamond Script Accessibility & Formatting

### Purpose

This test checks whether the KB can preserve a strong script while improving:

- accessibility
- sentence rhythm
- anchor readability
- simple mechanism clarity
- production formatting

### Input: KB Generated Script (the "before")

```text
In Belgium, there is a city called Antwerp. For a hundred years, it was the diamond capital of the world. But some diamonds were a problem. They were too small. Cutting them cost more than they were worth. So they sat in a corner, ignored. And traders from Gujarat asked for exactly those stones. In the 1960s, trading families from Palanpur in Gujarat started arriving in Antwerp. They were new. They were small. They could not get the big stones. So they bought what nobody wanted — the tiny diamonds — and sent them home. To Surat. And in Surat, everything changed. A stone that lost money in Belgium made money in India. They polished in rupees. And sold in dollars. But it was not only cheap work. It was family networks. People they could trust with a bag of diamonds. Loans given on trust, with no paperwork. And factories built to cut tiny stones — by the millions. Today, Antwerp still trades diamonds. But the cutting happens in Surat. More than 80 percent of the world's diamonds. Surat did not win by fighting for the best stones. It won with the stones Europe threw aside. Sometimes, the bottom of a market is a door nobody is guarding. And the next diamond you see at a wedding? It was probably cut in Surat.
```

### Expected Output: Production-Ready Beat Format (the "after")

One narrative beat per block. Each block holds 1–4 short sentences that belong to the same beat. A new block starts when the story turns. Blank line between blocks.

```text
In Belgium, there is a city called Antwerp. For a hundred years, it was the diamond capital of the world.

But some diamonds were a problem. They were too small. Cutting them cost more than they were worth. So they sat in a corner, ignored.

And traders from Gujarat asked for exactly those stones.

In the 1960s, trading families from Palanpur in Gujarat started arriving in Antwerp. They were new. They were small. They could not get the big stones.

So they bought what nobody wanted — the tiny diamonds — and sent them home. To Surat.

And in Surat, everything changed. A stone that lost money in Belgium made money in India. They polished in rupees. And sold in dollars.

But it was not only cheap work. It was family networks. People they could trust with a bag of diamonds. Loans given on trust, with no paperwork. And factories built to cut tiny stones — by the millions.

Today, Antwerp still trades diamonds. But the cutting happens in Surat. More than 80 percent of the world's diamonds.

Surat did not win by fighting for the best stones. It won with the stones Europe threw aside.

Sometimes, the bottom of a market is a door nobody is guarding.

And the next diamond you see at a wedding? It was probably cut in Surat.
```

### Pass Conditions

The output passes if:

- the script is not one dense paragraph
- the beat structure is anchor-readable: one narrative beat per block, 1–4 short sentences per block, blank line between blocks
- hard names are cushioned
- trade jargon is avoided
- sentences are short and clean
- the mechanism is understandable without business vocabulary
- the payoff is simple and relatable
- no factual meaning is changed during formatting

### Fail Conditions

The output fails if:

- it outputs the final script as one paragraph
- it fragments into one sentence per block throughout (fragment-poem formatting — sentences of the same beat must stay together)
- it adds unnecessary complex words
- it replaces simple lines with abstract business language
- it removes concrete images
- it over-explains the mechanism
- it makes the script sound childish
- it adds Hinglish or slang
- it changes facts while formatting

## Generic Acceptance Checklist

- [ ] Story-led hooks are first-class; the strongest asset need not literally be line one.
- [ ] Specificity does not automatically outrank story force.
- [ ] First five seconds contain at most one numerical relationship.
- [ ] No adjacent denominator/reference switch without an explicit reset.
- [ ] Financial terms match what the source measures.
- [ ] Evidence is checkable without forcing unfamiliar citation furniture into speech.
- [ ] Time-relative claims are freshly rechecked at final lock.
- [ ] Major rewrites run claim-repair and narrative-evidence searches.
- [ ] Major rewrites include a Rewrite Regression Check.
- [ ] Major rewrites pass a cold-read final audit.
- [ ] Multiple mechanisms are clear by causal role without forced labels.
- [ ] Ending subtraction and best-available-version comparison pass.
- [ ] Exact older-period evidence used as present proof is freshly checked.
- [ ] Evidence scope matches claim scope.
- [ ] A sourced proposition is not accepted as a pictureable asset without a concrete story carrier.
- [ ] Human-choice mechanisms include an observable behaviour chain.
- [ ] Illustrative viewer-world scenes invent no specific event, motive, quote, company action, or measured result.
- [ ] Reference scripts control creative calibration only; owning operational/safety rules control lock decisions.
- [ ] Mental-model absence alone does not lower score or verdict.
- [ ] Routine named-company mechanisms are not automatically Sensitive-tier.
- [ ] Evidence-based audit corrections are explicit, never silent.
- [ ] Identity-bearing proper nouns remain during Idea-Strength scoring.
- [ ] Editor visual changes follow meaningful beats, not spoken-line count.
- [ ] Proposed lane labels survive every stage handoff.
- [ ] All Stage 3 templates use the consolidated 16-check audit (Group A story/voice + Group B safety, named checks).
- [ ] Word count is verified numerically at lock (cues stripped, 200–280) and the count is stated.
- [ ] Delivery cues are present and drawn only from the seven canonical tokens; the closer carries `[drop voice]`.
- [ ] Viral Beat 5 wording is topic-native (no "inside their own X" reference clone).
- [ ] In multi-script batches, no closer shape exceeds two of any five consecutive scripts and no two consecutive scripts share a mid-script template.
- [ ] Story-Shape Lock readings pass all ten anchor references unchanged (Calibration rule).
- [ ] Final scripts are output in anchor-readable beat blocks; the Audience-English Accessibility Gate (inside COMPREHENSION) can fail trade jargon, uncushioned hard names, and dense-paragraph delivery.
