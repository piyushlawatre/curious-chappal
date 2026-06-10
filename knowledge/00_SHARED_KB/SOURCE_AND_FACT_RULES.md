---
title: "Source and Fact Rules"
file: "SOURCE_AND_FACT_RULES.md"
role: canonical
canonical: true
version: "v3.1"
related: ["REFERENCE_SCRIPTS.md", "VIRAL_SOCIAL_COMMENTARY.md", "../01_TOPIC_EVALUATION/04_TOPIC_VALIDATION_GUIDE.md", "../02_SCRIPT_CREATION/04_SCRIPT_DRAFTING_GUIDE.md", "../03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md", "../03_AUDIT_AND_FINALIZE/03_REWRITE_SOP.md"]
summary: "Source hierarchy, fact-risk grades, and verification discipline. The references are precise because every claim in them is checkable. New scripts must meet the same standard."
keywords: ["sources", "fact risk", "verification", "source hierarchy", "fact-check", "specificity", "named authority"]
---

# Source and Fact Rules

The reference scripts are authoritative because every claim is verifiable. Specificity is where their authority comes from. This file is the discipline that produces that specificity.

---

## What "Sourced" Looks Like in the References

Patterns visible across the sixteen reference scripts:

- **Authority is checkable and placed for the viewer.** Speak recognizable or story-central authorities. When unfamiliar names add no spoken value, speak the study shape and keep the full citation on-screen/in notes. Never use vague "scientists say" or "studies show" as proof.
- **Numbers come with units and context.** "450 crore rupees" (Ref 5), "six weeks" (Ref 1), "October 1943" (Ref 1), "over a hundred million diabetics" (Ref 8), "around seventy to ninety percent of the global grain trade" (Ref 12). Vague quantifiers appear only when a precise number would mislead.
- **Quotes are short, attributed, verifiable.** "Liberté." (Noor, Ref 1). "A diamond is forever." (Frances Gerety, 1947, Ref 13).
- **Where a topic is contested, the script states what is established and flags the rest.** Reference 6 names the brutal political conditions of the South Korean era alongside the economic mechanism. Reference 13 notes the post-2000s loosening of the diamond cartel.

A new script meets this standard or it does not pass audit.

---

## Source Discipline (How Much to Source)

Not every Short needs five sources. Calibrate verification to topic risk.

| Topic risk | Sources required | When to apply |
|------------|------------------|---------------|
| **Routine factual Short** (science curiosity, ordinary business mechanism, company results stated from filings, history fact, light current-affairs observation) | 1–2 trusted sources for each load-bearing claim | Most Shorts. Over-sourcing simple claims wastes research time. |
| **Sensitive Short** | 3+ independent trusted sources required | Medical/legal/financial advice or safety claims; party-political claims; named-individual or named-company allegations; contested, reputationally harmful, or high-fact-risk claims. A neutral business mechanism or official company result is not Sensitive-tier merely because a company or money is mentioned. |
| **Viral Social Commentary** | 1 direct viral-source quote or attribution + 1 supporting fact source | The viral object's own copy, public statement, or rate card is the proof; the supporting source confirms the surrounding facts. See `VIRAL_SOCIAL_COMMENTARY.md`. |

**Trusted sources include:**

- Peer-reviewed academic papers
- Government / institution websites and filings
- Reputable outlets with editorial standards (Reuters, AP, BBC, The Hindu, Indian Express, FT, Bloomberg, The Economist, university press releases)
- Official company pages, court records, public datasets
- Primary documents (treaties, statutes, official statements)

**Not trusted (do not cite as proof):**

- Random blogs, content farms, AI-generated articles, low-quality listicles
- Unsourced social-media posts
- The same fact echoed across multiple weak secondary sources (echo is not verification)
- External creators, including any YouTube channel
- Wikipedia as the *only* source — use it to find the underlying citation, then verify that

---

## Citation Integrity (a high-tier source named wrongly is still a failure)

A source being tier-1 does not make a claim verified. **The citation itself must be correct.** The most dangerous fact error is not an unsourced claim — it is a real, high-tier source described wrongly, because every downstream gate sees "tier 1, link present" and waves it through.

For every load-bearing claim that names a source, the following must be independently confirmed (re-fetched, not trusted from an upstream note):

1. **Right outlet / journal name.** *"i-Perception"* is not *"Perception"* — they are different journals. The exact title must match.
2. **Right author and year.** The named author actually wrote it, in the named year.
3. **Right document type.** A **review** or **commentary** is not a **primary study**. Do not say "a study found" when the source is a review that *cites* a study. Name the actual primary study (e.g. the experiment, its sample, its location) if that is what the claim rests on.
4. **The source supports the *exact* claim.** Not an adjacent claim. If the paper measured "evaluation and intention to return," the script may not say "spend more" unless the source actually measured spending. Conversely, do not strip a finding the source *does* support out of misplaced caution — verify, then state what is true.

**Rule:** if any of the four cannot be confirmed against the source itself, the citation is reframed to what *can* be confirmed, or the claim is cut. A misdescribed citation is a route-to-rewrite defect at audit (`../03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md` Mode 19 — Citation Integrity), never an acceptable note inside a passing score.

**Re-fetch discipline (where the work belongs).** A full independent re-fetch at audit is mandatory when the claim is **time-relative, contested, Sensitive-tier, or named in the audit's fix list.** For a routine load-bearing claim whose **Stage-1 dossier row is already complete** — a resolving URL, a verbatim quoted finding, and an accessed date are all present — Stage 3 performs a lighter **freshness/contested check** (has it been superseded? is it actually contested?) instead of a full re-fetch. This keeps the strictness where risk lives and removes the ceremony where the dossier already proves the citation. It does **not** weaken the no-fetch-no-lock rule: a row that was never properly filled, or whose URL no longer resolves, still requires a full fetch or the claim is treated as unverified. Time-relative and Sensitive-tier claims **always** re-fetch.

**Proof, not attestation (the Source Dossier).** Confirmation is not a checkbox — it is an artifact. For every load-bearing cited claim, fill a dossier row with content obtainable only by fetching the source: `claim | outlet | author | year | type | verbatim finding (quoted) | resolving URL | accessed date`. A vague or fabricated row is itself a failure. The full template and rules live in `SOURCE_INTEGRITY_AND_CLARITY_GATE.md § The Source Dossier`.

**No fetch, no lock (inaccessible-source fallback).** If a load-bearing source genuinely cannot be fetched (paywall, 403, dead link), the claim is treated as unverified. Re-source it from an accessible source, soften it to what an accessible source supports, or cut it — never pass it on the strength of an upstream note. "Source inaccessible, passed anyway" is forbidden.

**Independent verification for Sensitive-tier claims.** For Sensitive-tier topics (see `§ Source Discipline`), the dossier is filled by a verification pass independent of the writer and the auditor — a separate step / subagent with no stake in the script passing. Routine Shorts may have the auditor fill it directly.

---

## Source Hierarchy

Use the source best fitted to the claim. A direct primary source for the exact claim beats a generically higher-ranked but less relevant source. Examples: an official filing is best for company results; the actual paper is best for a study finding; a statute or court record is best for law.

1. Best-fit primary evidence — the actual peer-reviewed paper, government filing, court record, company filing, official dataset, statute, or official public statement that directly supports the claim.
2. Other high-quality primary or peer-reviewed evidence relevant to the claim.
3. Established outlet with editorial standards — Reuters, AP, FT, Bloomberg, BBC, The Hindu, Indian Express investigative pieces.
4. Industry or research-firm report with named author and disclosed methodology.
5. Wikipedia — pointer only; cite the underlying source Wikipedia uses.
6. Other media — podcasts, social posts, creator videos, blog write-ups. Leads only. Never citable.

---

## Fact-Risk Grade

- **Low:** core claim is in tier 1–3 with a direct link.
- **Medium:** core claim is in tier 3–4, or requires a small inferential step.
- **High:** core claim is in tier 5–6, contested, or no credible source is identified.

A High-risk claim must be reframed, softened, or cut before lock.

---

## Script Claim Rule

Every load-bearing claim needs a source tier label in fact-check notes. Supporting context (commonly known facts, well-established background) does not.

For causal or analytical inference, use soft truth language unless the source directly proves the claim:

- "appears to"
- "estimates suggest"
- "reportedly"
- "is currently"
- "for a fraction of a second"

The references model this restraint. Reference 8 uses "around 2027" for the GLP-1 repellent timeline rather than naming an exact year. Reference 12 uses "around seventy to ninety percent of the global grain trade" rather than a single fake-precise number.

---

## Temporal Freshness Rule

Any claim using "latest", "currently", "today", "this year", "now", or another time-relative word is time-sensitive by definition. An exact older period is also time-sensitive when used as proof of what is true now.

- Stage 3 must re-fetch a primary source on the finalization date.
- Prefer exact periods such as `FY 2025-26` or `as of May 11, 2026`.
- If a newer filing or dataset exists, the older claim cannot be described as latest.
- When older exact-period data is retained as current proof, record why it is more comparable or appropriate than the newest evidence.
- Time-relative claims that cannot be freshly checked are cut or rewritten with an exact historical date.

---

## Financial-Language Precision

Financial terms are not interchangeable:

- **Revenue** is money earned before costs.
- **Cost of goods sold / direct cost** is not total cost.
- **Gross margin** is revenue minus direct cost; it is not operating or net profit.
- **Operating profit / EBITDA / contribution margin / net profit** each measure different things.

The script may simplify the explanation, but it must not upgrade a revenue or gross-margin figure into a "profit engine" claim unless a source establishes the profit contribution being described.

---

## Discipline on Certainty

- Never present a fact as confirmed unless a trusted source supports it.
- If a fact is uncertain, say it is uncertain — never imply false confidence.
- If a claim is only viral discourse or internet chatter, label it as such ("the internet is split", "viral posts argue", "users on X are saying") — never as confirmed truth.
- External creators, viral posts, and unsourced articles are never proof, no matter how often they are repeated.

---

## Viral Debate Evidence

For Viral Social Commentary scripts, do not soften or generalise the source language when the wording itself is the proof. Public statements, job listings, app copy, rate cards, post text — quote or closely preserve them in the script when they carry the debate.

Use "reportedly" or "the listing says" or "the founder said" to attribute uncertain or third-party reporting, but keep the specific receipt visible.

**Label online reaction as online reaction.** "The internet is split", "users on X are saying", "viral posts argue" are acceptable framings. "It is well known that…" applied to a viral debate is not. Quote the viral evidence directly; label the discourse around it; do not claim the discourse itself is verified truth.

---

## Unverifiable Claim Rule

If a claim cannot be verified through tier 1–4 sources within reasonable verification effort:

1. Soften it if the uncertainty is honest and still useful.
2. Reframe it as a reported claim if appropriate.
3. Otherwise cut it.

Never keep a load-bearing claim because it sounds good.

---

## Stage Ownership

- **Stage 1 (Topic Evaluation)** identifies load-bearing claims and assigns the fact-risk grade.
- **Stage 2 (Script Creation)** drafts fact-check notes for every load-bearing claim used in the script.
- **Stage 3 Part A (Audit)** diagnoses missing, weak, or risky source support and re-verifies routine named citations against the source itself per `§ Citation Integrity`. Stage 1's source notes are leads to confirm, not settled facts. Sensitive-tier verification must come from the independent verification artifact described above.
- **Stage 3 Part B (Finalize)** verifies, softens, reframes, or cuts every audit-flagged fact risk before lock, using the independent artifact when Sensitive-tier.
- **Stage 4 (Editor Brief)** does not repair facts. If the locked script still has unresolved fact, legal, or safety issues, Stage 4 returns the brief as terminal.

A script with weak factual grounding cannot exceed the audit's 70 / 100 cap, regardless of writing quality. *(This cap is enforced in the Stage 3 audit rubric — see `../03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md`. It is noted here only as a downstream consequence of sourcing discipline.)*
