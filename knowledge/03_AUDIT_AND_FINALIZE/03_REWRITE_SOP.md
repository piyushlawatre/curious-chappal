---
title: "Rewrite and Finalization SOP"
file: "03_REWRITE_SOP.md"
role: canonical
canonical: true
version: "v2.15"
related: ["../02_SCRIPT_CREATION/04_SCRIPT_DRAFTING_GUIDE.md", "03_AUDIT_RUBRIC.md", "../00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md", "../00_SHARED_KB/SOURCE_AND_FACT_RULES.md"]
summary: "Canonical rewrite triggers, Viral Social Commentary lane repair, fact-check workflow with named ownership and source bar, and the final approval checklist."
keywords: ["rewrite", "finalization", "viral social commentary", "fact-check", "ownership", "source bar", "correction protocol", "approval checklist", "fact-risk"]
---

# Rewrite and Finalization SOP

## When to Rewrite

Rewrite when a Short:

- Grades **Generic**, or **Good but needs polish** with structural flags
- Has a strong topic and clean hook/payoff potential, but weak execution
- Has good bones but soft hook, generic middle, or flat ending
- Has correct strategy but forced language (forced Hindi or forced English) or wrong tone
- Forces a fake mental model instead of preserving the natural Stage 1 model
- Is factually correct and cleanly structured, but triggers Polished Explainer Drift: too documentary/article-like, too polished, too slow, or not spoken enough
- Is a live viral debate that drifted into Hidden India / Smart Money / Sharp Contradiction, or missed Side A, Side B, wage/price math, direct viral evidence, or the viewer-verdict close

## When to Reject

Reject when a Short:

- Grades **Reject**
- Fails multiple consolidated checks
- Belongs to a different category entirely (long-form documentary-explainer, news anchor, hype channel)
- Has high external-creator clone risk (same topic packaging, hook rhythm, sponsor pivot, close, or visual grammar)
- Requires an AI-owned regeneration because line-level rewrite would preserve the wrong structure
- Has no hook + payoff combo that can survive a rewrite

Rejection is terminal only when Part B of Stage 3 cannot generate a defensible AI reframe or regeneration. If the idea is still fixable, Part B does the reframe/rerun itself and logs it; the user does not restart manually.

If the package lacks a Stage 1 mental model, do not invent one in Part B. Carry `N/A — optional bonus`.

## When to Keep Mostly Untouched

Keep with minor edits only when:
- Verdict is **Strong** — all 16 consolidated checks PASS, and the Viral Social Commentary overlay passes if applicable
- Fact-check is clean
- The Short feels distinctly like our channel

For these Shorts, preserve what already works, then run one controlled optimisation pass. Accept broader changes only when a materially stronger full treatment wins without adding factual or voice risk. If newly fetched evidence proves a locked audit finding wrong or inapplicable, record an explicit `Audit Finding Correction`; never silently ignore or downgrade it.

## How to Strengthen a Weak Payoff

1. Re-read the hook. What did the hook promise?
2. Make sure the payoff *answers* that promise — not a summary, an answer.
3. Phrase the payoff as a single memorable line in our voice.
4. Test: would a viewer repeat this line to a friend? If no, sharpen.
5. *(Optional)* If the topic naturally produces a transferable principle, add it as a single line near the close — never force it.

## How to Sharpen Hooks

A weak hook usually fails one of these tests:

- It opens with context instead of the surprise
- It's not specific (uses "many" or "some" instead of numbers)
- It states something the audience already knows
- It takes longer than 5 seconds to land
- It uses one neat headline where a 2-3 line hook stack would create stronger curiosity

Fix by:

- Moving the most surprising specific noun to the first 5 words
- Replacing vague quantifiers with specific data
- Starting from the most counterintuitive angle
- Cutting any setup before the surprise
- Turning a flat one-line hook into a hook stack: assumption attacked → obvious answer rejected → specific reveal

Specificity is a tool, not the objective. Before choosing a number-first hook, identify the strongest source-backed scene, person, decision, conflict, object, or contrast. Prefer the option that creates the strongest immediate story question with the lowest cognitive load.

Also identify the strongest **concrete story carrier**. If no sourced scene exists, a familiar illustrative comparison may safely carry the opening as long as it invents no specific event, quote, motive, company action, or measured result. A true research finding is still abstract until the viewer can picture the choice or consequence.

Use at most one numerical relationship in the first five seconds. Never switch denominator/reference group between adjacent hook lines.

## Major Rewrite: Story-Preserving Accuracy Protocol

Run this whenever finalization scope is `Major rewrite`.

1. **Narrative asset inventory:** name the original's strongest scene, conflict, character, object, image, and payoff line. Mark which are source-backed and safe to preserve.
2. **Two research passes:** run a claim-repair search for unsafe facts, then a narrative-evidence search for a sourced scene/event/decision/contrast that can carry the story.
3. **Build story-first:** verification changes the claims, not automatically the storytelling shape. Do not replace a strong scene with ratios, caveats, or source exposition merely because they are easier to verify.
4. **Rewrite Regression Check:** compare original vs final on:
   - hook pull / immediate curiosity;
   - concrete scene or image strength;
   - first-listen cognitive load;
   - payoff strength;
   - factual and mechanism honesty.
5. **No-regression rule:** the final may weaken a previously strong dimension only when evidence makes it unusable, and the Rewrite Accountability must say why.
6. **Cold-read final audit:** after the rewrite is complete, judge the final as fresh input without relying on the rewrite rationale. Any failed gate returns it to repair. A major rewrite cannot self-certify from its own improvement notes.

### Concreteness Repair for Abstract-but-Correct Scripts

Use this when the script is factually sound but explains the mechanism without staging it.

1. Separate the sourced proposition from the concrete story carrier.
2. Run the Pictureability Test: state what the editor can show without writing the thesis on screen.
3. For everyday behaviour, build a safe viewer-world comparison around a familiar object or decision.
4. Show the behaviour as actions: what the person sees, does, skips, or chooses.
5. Let the sourced explanation name why that behaviour matters.
6. Use a topic-native pivot when the object's own contrast can organise the reveal.

Example:

✅ "Two snack packets sit on the same shelf. / One says chocolate cookie. / The other says high protein cookie."  
Then: "They scan. They eliminate. They pick the option that feels easiest to defend."

❌ "Health claims reduce cognitive effort and increase willingness to pay."  
The claim may be accurate, but the mechanism remains unstaged.

## How to Remove Generic Wording

Common generic phrases to eliminate:

- "Have you ever wondered..."
- "It turns out..."
- "Believe it or not..."
- "What's fascinating is..."
- "Here's the crazy part..."
- "This is going to surprise you..."
- "In this video we'll explore..."

Replace with direct statements that trust the viewer.

## How to Fix Polished Explainer Drift (v2.7 — quoted-evidence required)

Use this when the script is accurate and structured but feels like a documentary, article, textbook, or polished explainer compressed into Shorts.

Recalibrate against `../00_SHARED_KB/REFERENCE_SCRIPTS.md § Anchor Short References`. Keep the rewrite spoken, restrained, high-retention, and topic-earned; Anchor Short is not permission to become essay-like or over-intellectual.

Do not preserve the structure by default. Preserve verified facts, the strongest source-backed narrative asset, and the payoff. Rebuild around the evidence tests in `03_AUDIT_RUBRIC.md § Required Evidence (a)–(d)`:

1. **Hook (a):** a single-line declarative or a 2-3 line stack — both valid. Line two may prove, sharpen, or open the causal promise; concrete support must arrive immediately after. Quote the new hook, and confirm it does not over-claim beyond the facts.
2. **Spoken cadence (b):** ensure at least 2 lines have clearly spoken cadence — short declaratives, spoken connectives ("And", "But", "So", "Because") intact, syntax natural-verbal not written-formal. Quote 2 such lines. Restrained, never performed: NO reaction-acting tics ("Bas.", "Right?", "But honestly?", "Sounds boring."), NO Hindi or Hinglish. The register is complete Indian English.
3. **Article-feel test (c):** pick the densest 3 consecutive lines of the new reveal beat. Join them as a paragraph in your head. If the paragraph reads like long-form documentary-explainer / magazine-article / Wikipedia prose, the rewrite is not done. Paste the joined paragraph + verdict in the rewrite output.
4. **Narrative-force test (d):** identify the strongest sourced scene/person/decision/conflict/object/contrast. Use it, or prove the replacement creates stronger curiosity with lower cognitive load.

Retention comes from information advancing — a new fact or a real contradiction every few seconds — not from curiosity-tease tics or mandated reaction beats. Spoken texture (single-sentence punctuation, the occasional fragment, at most one parallel triplet) is used sparingly, never performed.

Additional rewrite mechanics that v2.7 requires:

- **One cognitive anchor or action per line in setup.** Do not stack unrelated numbers, names, or anchors. Citation furniture moves to the reveal or fact-check notes; story-central people/institutions/actions may remain in setup.
- **Spoken connectives stay** — "And", "But", "So", "Because" at line-starts are spoken-rhythm load-bearing. Do not cut them. Do not add reaction-tease connectives ("Honestly?", "Right?") — those are banned tics.
- **Soft hedges for known uncertainty** — "scientists believe", "appears to", "estimates suggest" belong where the source-backed claim is genuinely uncertain. They are not a substitute for sourcing.
- **Accurate payoff verbs** — prefer verbs that land emotionally without implying a fact the source does not make.
- **Em-dash parenthetical definitions** → break onto their own line.
- **Ear-first vertical lines** — break any glued 2+-sentence paragraph block into spoken thoughts. There is no fixed line count; the references are paragraph-shaped prose with periodic single-line punches. The 3-Line Article-Feel Test is the real check.

The rewrite should still explain clearly. It should stop sounding like a neat article summary.

**Status: PRODUCTION-READY is forbidden until every (a)-(c) test passes with quoted evidence.** A rewrite that fixes facts and structure but leaves Polished Explainer Drift in place is a status NEEDS-ANOTHER-PASS regression, not a finalization.

### Also repair these on rewrite

- **Self-Clone / Sameness (PATTERN-FRESHNESS):** strip proper nouns; if the skeleton matches a recent Short, rebuild from this topic's own contradiction. Vary the closer shape from the last two Shorts (no back-to-back two-part inversion closes).
- **Thesis-Hammer / Repetition (PATTERN-FRESHNESS):** state the thesis once strong + once at the close; cut every restatement in between. The middle carries new facts only.
- **Hook Over-Claim (HOOK):** soften any hook that claims more than the body's facts support.
- **Contested-Claim-as-Settled (CONTESTED-CLAIMS):** attribute contested academic/historical readings as named arguments, not fact.
- **Unnamed Authority (AUTHORITY):** make the source checkable. Speak a recognizable/story-central authority; otherwise speak the study shape and put the full citation on-screen/in notes.
- **Hard-number gate:** every specific figure carries a source + date in fact-check notes, or it is softened/cut.
- **Mental-math gate:** first five seconds carry at most one numerical relationship; no adjacent denominator/reference switch.
- **Temporal-freshness + current-function gate:** re-fetch every "latest/currently/today/this year" claim at lock, and every exact older-period fact used as present proof.
- **Current-function freshness + scope gate:** recheck older exact-period facts used as present proof; do not expand one company/experiment/observation into an industry/universal/intent claim.
- **Causal-role map:** assign multiple mechanisms roles such as ENABLE → TRIGGER → CONVERT → CLOSE. Do not force “First/Second” labels when the sequence is clearer without them.
- **Ending subtraction:** remove each closing line in turn; cut any line whose removal improves the landing.

## How to Fix Viral Social Commentary Lane Drift

Use this when Stage 3 flags the Viral Social Commentary overlay, or when the topic is clearly a live viral internet debate but the draft declared Hidden India / Smart Money / Sharp Contradiction.

**Do not:**
- Preserve the wrong declared lane just because the audit called the script "good".
- Convert the debate into a timeless observation.
- End on an aphorism such as "India did not invent the helper; it priced the helper."
- Replace direct source language with a polite abstraction like "worker pay ka question still matters."

**Do:**
1. Correct the format lane to **Viral Social Commentary** in the final package.
2. Preserve verified facts, then rebuild the script around the six-part debate payload in `../00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md`.
3. Add or restore the direct viral evidence: job-listing language, app copy, rate card, public post, or terms when that wording is the proof.
4. Keep wage / price / behaviour math even if it adds lines. This is not filler.
5. Steelman Side A before Side B.
6. Name the discomfort only after both sides have been presented.
7. End with a specific viewer question plus named-audience share prompt.

**Test:** If the final script could be summarized as "old Indian behaviour now has a rate card," it is still the wrong lane. If it could be summarized as "here are the two sides, here is the math, now you decide," it is in the correct lane.

## How to Fix Compression Drift (Underdeveloped Surface Logic and Mechanism Collapse)

Use this when Stage 3 flags the **STRUCTURE** check (underdeveloped surface logic) or the **MECHANISM** check (mechanism collapse).

These two modes share a common root: the script prioritised brevity in the wrong place. The fix requires adding room back to the beats that need it — not trimming further.

### Fixing Underdeveloped Surface Logic (STRUCTURE)

**Trigger:** Stage 3 found fewer than 3 specific reasons why the viewer's intuitive belief was reasonable before the script contradicted it.

**Do not:**
- Compress the setup further to "get to the point faster"
- Add a single extra line and call it fixed

**Do:**
1. Identify the viewer's default belief that the script is about to contradict.
2. Build a full 3–4 line case for the viewer's side: name every reasonable argument, every observable fact, every lived-experience heuristic that supports their belief.
3. Each line of the setup should name a *specific* reason, not just restate the belief.
4. Only after the belief is fully reinforced, land the contradiction.

**Test:** If a skeptical viewer can say "but you didn't mention [obvious point]" before the contradiction, the setup is still thin.

✅ "You can see the water level. / You can see dirt building up. / You can catch motor overflow. / A transparent tank seems smarter in every practical way." — four distinct reasons, each specific.  
❌ "You can see the level and the dirt." — two reasons compressed to one line. Setup has no weight.

### Fixing Mechanism Collapse (MECHANISM)

**Trigger:** Stage 3 found that two or more distinct causal mechanisms were merged into a single explanation, making the reveal incomplete.

**Do not:**
- Describe both mechanisms in one flowing paragraph
- Fix by adding a transition word ("also" or "additionally") between the merged description

**Do:**
1. Count the distinct mechanisms in the topic (if there are two, treat them as two separate causal roles).
2. Map each mechanism by function: ENABLE, TRIGGER, CONVERT, CLOSE, RETAIN, or a plain equivalent.
3. Give each role enough space to show what happens and why it matters.
4. Use explicit "First/Second" labels only when they improve first-listen comprehension. If the sequence is clearer as a natural chain, use the chain.
5. The reveal is not complete until every causal role is clear and closed.

**Causal completeness beats brevity here.** A viewer can follow two clear causal roles; they cannot follow two problems presented as one.

✅ "Sunlight does two jobs here. / It warms the water, which helps algae grow. / It also weakens plastic over time." — two distinct mechanisms, each role clear without forced labels.  
❌ "Sunlight causes algae and plastic degradation." — both mechanisms collapsed to one clause. The viewer receives the conclusion without the mechanism.

### General Rule for Both Modes

When Stage 3 flags either failure, the default rewrite instinct (tighten, compress, cut) is the wrong instinct. **Prioritise causal completeness over brevity.** The brevity rule from the drafting guide applies to filler, repetition, and padding — it does not apply to load-bearing causal steps. If a line is the only place a mechanism is explained, it stays.

## How to Fix Final-Rule and Context Drift

Use this when Stage 3 flags the **PAYOFF** check (final-rule oversimplification) or the **INDIAN-RELEVANCE** check (labelled-not-concrete context).

### Fixing Final-Rule Oversimplification (PAYOFF)

**Trigger:** The script corrected the viewer's original belief but left a new shortcut in its place.

**Do:**
1. Identify the oversimplified rule the viewer would repeat.
2. Add the accurate mechanism-based rule before the punchline.
3. Keep the punchline last.

✅ "Black is not magic. White tanks can also work — if they block sunlight. The real rule is: sunlight should not enter your stored water."  
❌ "Black tanks are better." — category answer, not the rule.

### Fixing Labelled-Not-Concrete Indian Context (INDIAN-RELEVANCE)

**Trigger:** The script says "Indian", "terrace", "desi", or similar labels without a concrete lived picture.

**Do:**
1. Replace the label with a familiar contrast, lived condition, or practical behaviour.
2. Keep it short; one concrete scene beats a paragraph.
3. Use context only where it sharpens the angle.

✅ "Your tank is not sitting in an AC showroom. It is sitting under direct sunlight, every day, for years."  
❌ "On an Indian terrace, this is a problem." — labelled, not pictured.

## How to Fix Language Register

The register is complete Indian English. No Hindi or Hinglish — Hinglish does not appear in any of the sixteen reference scripts.

If the script sounds stiff or over-written:

- Break long compound sentences into short declaratives.
- Keep spoken connectives ("And", "But", "So", "Because") — they are rhythm load-bearing. ("Right?", "Honestly?", "But honestly?" are reaction tics — banned, not connectives.)
- Read aloud at scroll speed. If you stumble, rewrite the sentence.

If the register has drifted into documentary or academic:

- Remove written-language filler ("In other words", "It is worth noting that", "This phenomenon constitutes").
- Replace with the plain English equivalent the script needs.
- Calibrate against `../00_SHARED_KB/REFERENCE_SCRIPTS.md` for voice and cadence.

**If Vocabulary Drift (COMPREHENSION — word level) is flagged:**

The issue is not register drift — it is vocabulary difficulty. The fix is not to change sentence rhythm; it is to replace or define specific words.

1. Scan every line of the flagged section for words that fail the Plain Word Test: "would I use this in a WhatsApp voice note to a college friend?"
2. For each failing word, apply the swap table in `../00_SHARED_KB/LANGUAGE_AND_VOICE.md § Reader Benchmark`, or write an immediate inline definition on the same line ("Nitrogen is inert — it does not react with food").
3. The definition must be spoken and immediate. Prefer the same line; the next short line may define the term when no other idea intervenes.
4. Default to one necessary technical term. Additional essential terms are allowed only when each is immediately explained in plain English; never use an undefined second term as a workaround.
5. After fixing, re-run the COMPREHENSION check.

## Accessibility Repair Order

If a script fails the audience-English check (COMPREHENSION — Audience-English Accessibility Gate), repair it in this order:

1. Remove difficult words.
2. Replace trade jargon with common words.
3. Break long sentences.
4. Cushion hard names.
5. Replace abstract ideas with concrete images.
6. Simplify the mechanism into cause-effect steps.
7. Separate the script into anchor-readable beat blocks.
8. Keep the final payoff simple and relatable.

Do not reduce factual accuracy.

Do not make the tone childish.

Do not add Hinglish or slang.

Do not add motivational filler.

Do not rewrite strong sentences only to make them look different.

## How to Improve Indian / South Asian Relevance

If Indian relevance is forced: remove it. Not every Short needs it.

If Indian relevance is missing where it should be present:

- Add a single specific Indian application, not a paragraph.
- Use lived experience the audience recognizes.
- Connect to Indian context only where the angle is sharpened.

If Indian relevance is politically risky, the move depends on what kind of "political" it is:

- **Party-political risk** (government / party / community / electoral): reframe as observation, not critique. Acknowledge complexity briefly where required. Never take a party-political side.
- **Socio-economic risk in the Viral Social Commentary lane** (wage math, labour arbitrage, pricing fairness, platform-labour conditions): do *not* sand off the discomfort. Steelman both sides, keep the wage / price / behaviour math, name the uncomfortable observation that remains when both sides are true, and close on a stakes-naming viewer question. Laundering the debate into "this is just an observation about Indian markets" is the exact failure mode the Viral Social Commentary overlay was built to catch (see `03_AUDIT_RUBRIC.md § Viral Social Commentary Overlay`). The auto-fail line *"Worker pay ka question still matters"* without the underlying numbers is the canonical example of getting this wrong.

## How to Improve Endings

Weak endings usually:

- Restate what was said
- Use generic CTAs
- Trail off without landing
- Pose a vague question
- Force a fake mental model instead of preserving the Stage 1 model

Strong endings:

- Land the payoff as a sharp, memorable line
- Drop an identity line in complete Indian English — dry, casually confident, specific
- Land a clean observation that closes the loop
- *(Optional)* Name a transferable principle — only if natural
- For multi-mechanism endings, a supported sequential payoff may land harder than a flat both/and. Use the topic's actual causal roles; do not reuse a fixed wording template.

### Sequential Multi-Mechanism Payoff

When the topic has three causal roles, avoid both the single-cause overclaim and the flat additive list. Map the roles and let the close preserve their order.

For the popcorn fixture:

- **ENABLE:** margin makes the product worth pushing.
- **TRIGGER:** smell starts desire before the counter.
- **CLOSE:** the counter converts desire into a priced purchase.

Good:
"The margin makes popcorn valuable.
The counter closes the sale.
But the smell starts it."

Weak:
"Popcorn has margin and smell." — additive, loses the sequence.

Fail:
"That is the whole business model." — single-cause overclaim.

## Fact-Check Workflow (Who, When, Against What)

Fact-check is the single highest-risk operational step. This section names ownership; the rules below are mandatory before any script is locked.

**Owner:**
- Writer is responsible for **drafting** the fact-check notes (one note per claim in the script).
- Part B of Stage 3 is responsible for resolving every audit-flagged fact risk before the script is locked. It verifies, softens, reframes, or cuts claims itself. A separate human or second-AI check before recording is useful production hygiene, but it is not a reason for the workflow to hand fixable work back to the user.

**When in the workflow:**
- Step 1: Writer drafts script + fact-check notes (per `../02_SCRIPT_CREATION/04_SCRIPT_DRAFTING_GUIDE.md` template).
- Step 2: Script passes audit (per `03_AUDIT_RUBRIC.md`).
- Step 3: Part B of Stage 3 creates the final verification queue from the audit's Fact-Check Risks.
- Step 4: Part B of Stage 3 confirms every flagged claim against the source hierarchy or removes the claim.
- Step 4a: For every load-bearing cited claim, fill the **Source Dossier** (`../00_SHARED_KB/SOURCE_AND_FACT_RULES.md § The Source Dossier`) by fetching the source itself — outlet, author, year, document type, verbatim finding, resolving URL, accessed date. A dossier row that cannot be filled because the source will not fetch means the claim is unverified: re-source, soften, or cut (no-fetch, no-lock). Upstream Stage-1 notes are leads, never proof.
- Step 4b: If the script is **Sensitive-tier** (medical/legal/financial advice or safety claims; party-political claims; named-individual/company allegations; contested, reputationally harmful, or high-risk claims — per `../00_SHARED_KB/SOURCE_AND_FACT_RULES.md § Source Discipline`), the dossier must be filled by a verification pass independent of the writer and auditor. Routine business mechanisms and neutral company results may have Part B fill it directly.
- Step 4c: Re-fetch every time-relative claim ("latest", "currently", "today", "this year", "now") and every exact older-period fact used as present proof on the finalization date. Prefer exact reporting periods.
- Step 4d: For a Major rewrite, run a separate narrative-evidence search and record the source-backed scene/event/decision/contrast used to preserve story force.
- Step 5: Any unverified claim is either softened with honest sourcing language ("reportedly," "around," "estimates suggest") or cut.
- Step 6: Only then can the rewrite (Part B of the merged Audit & Finalize stage) return `Status: PRODUCTION-READY` and hand the locked script to Stage 4 (Editor Brief).

**Source bar (in order of preference):**
1. Best-fit primary sources — the actual paper, government data, official company filing, statute, court record, or other direct evidence appropriate to the claim.
2. Wire-service journalism — Reuters, AP, Bloomberg, *The Hindu*, *Indian Express*, BBC.
3. Reputable secondary sources — *The Atlantic*, *The Economist*, university press releases.
4. **Never** — external creator videos, creator scripts, blog summaries, Wikipedia (as primary source), social media posts.

**The unverifiable-claim rule:**
- If a claim is widely cited but methodology is contested (e.g. "₹45 trillion lost to British rule" — Utsa Patnaik estimate), frame as "around" / "estimates suggest" — never as fact.
- If a claim cannot be traced to an appropriate trusted tier 1–4 source within 30 minutes of verification effort, cut it from the script. Prefer primary evidence where it exists.
- "Reportedly" is a real word with a real cost — use it only when the underlying source is journalism, not when the writer wants plausible deniability.

**Post-publication correction protocol:**
- If a published Short is found factually wrong: pin a comment with the correction within 24 hours and log the failure in the active production tracker / source dossier system for that batch.
- Repeated fact failures in the same domain (e.g. medical) trigger a topic moratorium in that domain until the verification process is reviewed.

## How to Reduce Fact Risk

For every flagged or load-bearing claim:

1. Identify the source.
2. Verify the source is credible.
3. Confirm the specific numbers match exactly.
4. Check whether the claim is established fact or analytical inference.
5. Reframe inferences as inferences.
6. Remove "single source" or "first ever" claims unless verified.
7. For controversial figures or governments, acknowledge complexity briefly.

## How to Preserve Strong Scripts Without Over-Editing

When a Short grades Strong:

- Identify the 1–3 specific lines flagged.
- Preserve strong lines and avoid churn.
- Run one controlled optimisation pass before lock.
- Change unflagged lines only when the Best-Available-Version comparison proves a materially stronger safe treatment.
- Verify facts and lock the Stage-5-ready package.

Over-editing strong Shorts is the most common quality regression.

## When Minor Edits Are Wasted

Sometimes a borderline-Generic Short is not worth editing. Edit only when:

- The hook + payoff combo is genuinely strong
- The structural beats are mostly correct
- The fix list is specific
- The topic falls in one of the channel's strongest categories

Regenerate or reframe internally when:

- More than 40% of the script needs rewriting
- The topic doesn't pass the 8-point validation
- The Short has the wrong identity (drifts to documentary-explainer, hype, or news)

Minor editing a fundamentally flawed script wastes more time than an AI-owned regeneration. Terminal drop is allowed only when no clean AI reframe exists.

## Additional Prohibitions for Rewrites

### No Host-as-Expert Framing

The host is a sharp friend, not an authority.

Forbidden phrases:
- "I've studied this for years"
- "Trust me on this"
- "As I've often said"
- "In my expert opinion"
- "Having researched extensively"

### No Motivational Drift

A clean payoff *names* what happened or what it means.
A motivational closer *moralises* without giving anything specific.

Forbidden closing patterns:
- "So remember — never give up"
- "The lesson here is to always..."
- "Be the change you want to see"
- "Don't let constraint stop you"
- "What separates the great from the rest is..."

If a closing line could appear on a LinkedIn carousel without modification, rewrite it.

### No Forced Mental Model

Forbidden patterns:
- Tacking on a "broader principle" line just to seem deep
- Aphoristic closers that don't actually generalize
- Framework lines that slow the Short down

The Stage 1 framework is optional, but if present it must still feel earned. Weave it in only where the script has supported it; if it feels bolted on, repair the causal setup or cut the framework line instead of pasting it at the end.

### No False Certainty

If a claim is analytical inference, frame it as inference. If it's contested, acknowledge contestation.

Forbidden:
- "Scientists have proven that..." (when the science is preliminary)
- "Everyone agrees that..." (when there is disagreement)
- "The only reason this happened was..." (when multiple factors contributed)

### No Hype-Channel Drift

Forbidden:
- Reaction-style overacting in the script ("you guys WON'T BELIEVE this")
- Banned hype words
- Fake outrage
- Performed shock

Energy is fine. Hype is not.

## The Final Approved Batch Format

```
Format lane: [Real Reason / Hidden India / Smart Money / Science Lite / Sharp Contradiction / Viral Social Commentary / One-off with reason / Forgotten Inventor / Quiet Monopoly / Status Game]
Final title: [Title]
Thumbnail text: [3–5 words, all caps]
Hook / Hook stack: [The 1–5 second opening, 1–3 short spoken lines]
Payoff one-liner: [The line the viewer leaves with]
Mental model / framework: [Stage 1 model, ≤8 words, or N/A — optional bonus]
Final spoken script: [Full Anchor script, 200–280 words]
Host tone: Energy [1–10]. [Delivery notes, register calibration.]
Editor notes: [Beat-by-beat visual direction.]
Fact-check notes: [Each claim requiring verification.]
```

## Final Approval Checklist

The 16 named checks in `03_AUDIT_RUBRIC.md` (plus the Viral Social Commentary overlay when applicable) are the quality gate. They are verified in the Section II § 14 cold-read and are **not re-listed here** — re-checking them as boxes invites checkbox fatigue. This checklist covers only what the named checks do not:

- [ ] **Word count verified numerically:** strip every delivery cue and count — 200–280 words / 60–120 seconds. State the count in § 8.
- [ ] **Delivery cues present and valid:** only the seven canonical tokens (`[direct]`, `[no smile]`, `[stress]`, `[slow]`, `[drop voice]`, `[beat]`, `[pause]`); opens on `[direct]`; the closer carries `[drop voice]`; roughly one cue per one-to-three spoken lines; the script reads perfectly with cues stripped.
- [ ] Format lane declared and clearly fits (or One-off justified in the brief); proposed-lane labels preserved through the handoff.
- [ ] Title ≤60 characters and thumbnail text ≤5 words, both free of banned words.
- [ ] Editor notes are clear enough to execute without questions.
- [ ] Fact-check notes cover every load-bearing claim; nothing left `Needs verify` (verify, soften, or cut).
- [ ] If Major rewrite: Rewrite Regression Check passed and the cold-read final audit is recorded.
- [ ] Best-Available-Version comparison recorded when a materially different safe treatment existed.
- [ ] Viral Social Commentary overlay passed when applicable — including topic-native Beat 5 wording (no "inside their own X" reference clone).
- [ ] Slate Ledger row emitted: date | topic | lane | hook shape | pivot shape | closer shape | mid-script template.

If any box is unchecked, repair the script before returning. Use `Status: NEEDS-ANOTHER-PASS` only when a true terminal issue cannot be verified, softened, reframed, or cut.
