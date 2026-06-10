---
title: "Source Integrity and Audience Clarity Gate"
file: "SOURCE_INTEGRITY_AND_CLARITY_GATE.md"
role: canonical
canonical: true
version: "v1.3"
related: ["SOURCE_AND_FACT_RULES.md", "LANGUAGE_AND_VOICE.md", "../03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md", "../03_AUDIT_AND_FINALIZE/03_REWRITE_SOP.md"]
summary: "The final mandatory binary gate: source integrity, mechanism honesty, authority placement, first-listen clarity including mental math, and temporal freshness."
keywords: ["gate", "source integrity", "audience clarity", "citation", "overclaim", "authority", "first listen", "mental math", "freshness", "production blocker"]
---

# Source Integrity and Audience Clarity Gate

This is the **last gate before production.** It runs at Stage 3 lock, after the applicable audit mode (Lite or Full) and the 19 failure modes, and it is **binary**: every line below is PASS or FAIL. A single FAIL blocks production. There is no "strong enough to ship anyway," no averaging, no "minor note inside a high score." This gate exists because the rubric is granular enough that a script can be individually green on all 19 modes and still ship a mislabelled source, an overstated mechanism, a vague authority, or a line nobody can follow — exactly the failures observed in the Cinema Popcorn script.

The gate has five pillars. Run all five. Record the evidence inline.

---

## Pillar 1 — Source Integrity

For **every** load-bearing claim that names or implies a source, the auditor has independently re-fetched the source (not trusted any upstream note) and confirmed:

- [ ] **Outlet/journal name is exactly correct.** ("i-Perception" ≠ "Perception". A wrong name is a FAIL even if the rest is right.)
- [ ] **Author and year are correct.**
- [ ] **Document type is correct.** A review/commentary is not a primary study. If the claim rests on an experiment, the actual study is named (with sample/location where it does evidential work), not the review that cites it.
- [ ] **The source supports the exact claim** — not an adjacent one, in either direction (don't inflate "evaluation" into "spending"; don't delete a real finding out of vague caution).
- [ ] **The evidence scope matches the script scope.** One company is not an industry; one experiment is not all consumers; an observed effect is not deliberate intent.

**FAIL action:** reframe the citation to what the source actually supports, or cut the claim. Re-run the pillar.

### The Source Dossier (mandatory — proof, not a checkbox)

Ticking "verified" is not verification. Pillar 1 does not pass until a dossier row is filled for **every** load-bearing cited claim. The row must contain content that can only be obtained by actually fetching the source — a fabricated or vague row is itself a FAIL:

| Claim (one line) | Outlet / journal | Author | Year | Type (primary study / review / report / news / primary doc) | **Verbatim finding** (the exact sentence the claim rests on, in quotes) | URL (must resolve) | Accessed |
|---|---|---|---|---|---|---|---|

Rules for the dossier:
- The **verbatim finding** must be a real quoted sentence from the source, and the claim in the script must be a faithful plain-English rendering of it. It must never be broader than the evidence. It may be narrower when the narrowing is accurate, useful, and does not distort the finding.
- The **URL must resolve** to the named source. A link that 404s, redirects to a homepage, or returns a paywall/403 means the source was **not** fetched — see the fallback below.
- "Confirmed against the upstream Stage-1 note" is **not** acceptable as a source — the upstream note is a lead, not proof. The dossier is filled from the source itself.
- An empty cell, a paraphrase in place of the verbatim finding, or "could not access" in any row = Pillar 1 FAIL.

### Re-fetch vs freshness check (load belongs where risk is)

A **full re-fetch** at this gate is mandatory when the claim is **time-relative, contested, Sensitive-tier, or named in the audit's fix list.** For a routine load-bearing claim whose **Stage-1 dossier row is already complete** (resolving URL + verbatim quoted finding + accessed date all present), Pillar 1 is satisfied by a **freshness/contested check** rather than a full re-fetch. This is not a loophole: an incomplete row, a non-resolving URL, or a paraphrase-in-place-of-quote still triggers the full fetch (or the claim is unverified — see below). Time-relative and Sensitive-tier claims always re-fetch.

### Inaccessible-source fallback (no fetch, no lock)

If a load-bearing source genuinely cannot be fetched (paywall, 403, dead link, no retrievable copy), the claim does **not** pass on the strength of an upstream note or memory. It must be:
1. **Re-sourced** — find an accessible source that supports the same fact, fill the dossier from that, or
2. **Softened** — reframe to what an accessible source supports, with honest hedging ("reportedly", "estimates suggest"), or
3. **Cut.**

A claim whose only support is an unfetchable source is treated as unverified, full stop. This is the exact loophole that passed the popcorn script ("paper inaccessible for direct verification in this pass" → passed anyway); it is now closed.

### Independent verification for Sensitive-tier scripts

For **Sensitive-tier** topics (medical/legal/financial advice or safety claims; party-political claims; named-individual/company allegations; contested, reputationally harmful, or high-risk claims — per `SOURCE_AND_FACT_RULES.md § Source Discipline`), the dossier must be filled by a verification pass **independent of the writer and the auditor**. Routine Shorts, ordinary business mechanisms, and neutral company results may have the auditor fill the dossier directly.

---

## Pillar 2 — Mechanism Honesty (no single-cause overclaim)

- [ ] **Competing-cause test:** if the script's named mechanism were removed, would the outcome still be *partly* explained by other real causes? If yes, the script does NOT say "the whole reason", "the only reason", "that is the whole business model", "this is why X won." It says the honest both/and.

A mechanism can be the *interesting* cause without being the *whole* cause. "The margin makes popcorn profitable. The smell makes it sell." passes. "The smell is the whole business model." fails.

**FAIL action:** rewrite the payoff to the both/and. Re-run.

---

## Pillar 3 — Authority Specificity and Placement

- [ ] No claim leans on **vague authority** of either form: (a) "studies show / researchers found / experts say"; or (b) rhetorical authority used as evidence — "every analyst", "most economists agree", "the usual explanation", "everyone knows". Every appeal to what is known/standard is checkable, or rephrased to claim no authority it cannot back.
- [ ] Authority is placed where it helps the viewer. Speak a recognizable or story-central institution/person. When unfamiliar author names, journal names, study IDs, or affiliations add no first-listen value, speak the study shape ("a five-experiment 2020 study") and put the full citation on-screen and in fact-check notes.

"The standard explanation is the margin story" passes. "Every analyst will tell you the margin story" fails (who? unverifiable, and doing real evidentiary work).

**FAIL action:** make the authority checkable, place it appropriately, attribute the view concretely, or cut the appeal. Re-run.

---

## Pillar 4 — Instant Audience Clarity (first listen)

Run on **every line**, as the viewer *hears* it (not reads it):

- [ ] **"Will an average educated Indian viewer (Class 10–12 English, 18–40) understand this immediately, on first listen, without pausing, rewinding, Googling, or needing outside context?"**

Specific FAILs even when every word is simple:

- A common word used as a proper noun the ear cannot catch ("the journal *Perception*").
- An unexplained institution the viewer cannot place ("the Smithsonian", with no gloss). Name what it is in the same line, or cut it.
- Archive/report register nobody says aloud ("records the outcome plainly", "demonstrates a correlation").
- Citation furniture (journal names, study IDs, affiliations) sitting in the *spoken* track doing no work for the viewer — move it to on-screen text.
- Two adjacent ratios or percentages that change denominator/reference group without an explicit reset.
- A first-five-seconds opening that requires the viewer to retain more than one numerical relationship.
- A finance line that uses revenue, gross margin, contribution, operating profit, or net profit as if they mean the same thing.

### Mental Math and Reference Stability Test

- [ ] The first five seconds contain at most one numerical relationship.
- [ ] Adjacent spoken numbers keep the same denominator/reference group, or the script explicitly resets it in plain language.
- [ ] No line requires the viewer to hold one calculation in memory while decoding another.
- [ ] Every spoken number earns its cognitive cost. If moving it later or on-screen preserves the story, do that.
- [ ] Every finance term matches what the source actually measures.

**Positive pattern — explicit denominator reset:**

- ✅ "For every ₹100 PVR INOX earned from tickets, it earned almost ₹60 more from food. And when its food counter sold ₹100 worth, the food itself cost about ₹25." The second line resets the reference frame before the number.
- ❌ "For every ₹100 in tickets, they earn ₹60 in food. And ₹75 of those rupees is profit." "Those rupees" makes the viewer do arithmetic while the line is moving.

A reset is not a free pass. If two adjacent ratios still slow the hook, move the second number later or on-screen.

**Finance-term precision:** revenue, direct food cost, gross margin, contribution margin, operating profit, and net profit are not interchangeable. A filing that gives F&B revenue and food cost supports "major revenue line" or "low direct food cost." It does not by itself support "one of the main profit engines" unless the source also establishes profit contribution after staff, rent, electricity, occupancy, and shared costs.

**FAIL action:** translate the line into viewer-language per `LANGUAGE_AND_VOICE.md § Source-Language vs Viewer-Language`, keeping the fact exact. Re-run.

---

## Pillar 5 — Temporal Freshness

Run at final lock on every time-relative claim and every fact functioning as present-day proof:

- [ ] Every use of "latest", "currently", "today", "this year", "now", or equivalent was rechecked against a primary source on the finalization date.
- [ ] No newer filing, result, law, office-holder, price, policy, or dataset supersedes the period used.
- [ ] Exact dates/reporting periods replace relative wording wherever the relative word adds no value.
- [ ] Exact older periods used as present-day proof were checked against the newest comparable primary evidence.

**FAIL action:** update the claim to the newest verified fact, replace the relative word with an exact date/period, or cut it. Re-run.

---

## Gate Result

```
SOURCE INTEGRITY AND AUDIENCE CLARITY GATE
Pillar 1 — Source Integrity:        PASS / FAIL   [Source Dossier filled per claim; no-fetch = FAIL]
Pillar 2 — Mechanism Honesty:       PASS / FAIL   [competing-cause result]
Pillar 3 — Authority Placement:     PASS / FAIL   [checkable authority; spoken/on-screen placement]
Pillar 4 — Instant Audience Clarity: PASS / FAIL  [language + mental-math/reference stability]
Pillar 5 — Temporal Freshness:      PASS / FAIL   [time-relative claims freshly rechecked]

GATE: PASS only if all five are PASS.
A FAIL on any pillar = Status: NEEDS-ANOTHER-PASS. The script does not enter production.
```

This gate cannot be waived for a strong script. A strong script with a mislabelled source, an overstated mechanism, misplaced authority, an unclear spoken reference, or a stale time-relative claim is exactly the script this gate exists to stop.
