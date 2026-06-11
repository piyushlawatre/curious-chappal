---
title: "KB Deep Audit — Reference-Fidelity Pass 2"
file: "KB_DEEP_AUDIT_2026-06-11.md"
role: history
canonical: false
version: "v1.0"
summary: "Second external deep audit of the KB against REFERENCE_SCRIPTS_CORE.md, using the 2026-06-11 generated-script export (28 scripts) as evidence. Verdict: Keep and lightly edit — 12 surgical changes, 2 deletions, no rebuild."
---

# KB Deep Audit — 2026-06-11 (Pass 2)

> **Implementation status (same day):** all 12 KB changes (P0–P2) applied and verified; KB stamped v4.1 (see `00_SHARED_KB/CHANGELOG.md`). The only open item is the app-layer `script_len: 0` extraction guard, which lives outside the KB.

Evidence base: all 30 KB files read in full; 28 generated scripts from `curious-scripts-2026-06-11.json` (24 with non-empty script bodies) compared line-level against the ten anchors in `REFERENCE_SCRIPTS_CORE.md`.

---

## 1. Executive Verdict

**Keep and lightly edit.** The v4.0 consolidation worked. The architecture is sound, the ownership model is clean, and — the only test that matters — the generated scripts now genuinely sound like the channel. The remaining defects are point defects, not structural ones: a handful of rules that contradict the references they claim to encode, two checks that exist on paper but are not binding anywhere, one beat spec that accidentally mandates cloning a reference line, and residual ceremony in Stage 3. Twelve surgical edits and two file deletions close the gap. A rebuild or heavy restructure would destroy calibration that is demonstrably working.

The strongest evidence for "keep": scripts like *Bengal Had Food* (#17), *IVF Baby* (#13), *Snakes* (#1), and *Molai Forest* (#27) would sit comfortably next to References 1–8 — restrained voice, mechanism-first, named specifics, earned closes, zero Hinglish, zero hype. The system produces the target sound. The failures are leaks, not drift.

---

## 2. Similarity Score vs REFERENCE_SCRIPTS_CORE.md

**Overall: 84/100** (previous audit: ~83).

| Dimension | Score | Evidence |
|---|---|---|
| Hook pattern | 9.0 | Declarative and scene-first families dominate, no greetings, no hype. "Bengal Had Food. Three Million People Starved Anyway." is reference-grade. |
| Opening rhythm | 8.5 | Mostly clean two-line hook+proof. #12 (Nokia) opens choppy/staccato; #7 opens as fragment poetry. |
| Script structure | 9.0 | Hook → context → turn → mechanism → close lands in topic-native order; no flat middles in the sample. |
| Reveal mechanism | 9.0 | Real *why*, concrete carriers (bamboo roots, the unpaid time-zone hour, the lease under the burger). |
| Evidence placement | 7.5 | Refs name institutions in speech (WHO, Rockefeller); generated set sometimes floats numbers unattributed ("around 58,000", #1) or uses near-vague authority ("Researchers studying video-on-demand release schedules found", #19). |
| Tonality | 9.0 | Restraint holds across all 24. No fake hype, no Hinglish, no exclamation marks anywhere. |
| Payoff style | 7.5 | Closes are sharp but monotone: ~70% land the two-part inversion/reframe shape. Refs spread across five closer families. |
| Spoken rhythm | 8.0 | Mostly reference-like prose. #7 is a fragmented vertical poem (172 words); #12 has a reaction-tic line ("Makes sense."). |
| Indian metro audience fit | 9.5 | The strongest dimension. FASTag, dabbawalas, WFO commute math, government jobs, Punjab migration — earned, never pasted. |
| Lane logic | 7.5 | VSC three-beat close executed correctly in #9; but lane scaffolding leaks into non-VSC scripts (#20 stages a debate then closes on an aphorism), and own-reference/saturated topics passed the gate (see below). |
| Overall channel resemblance | 8.5 | Strip the proper nouns and most scripts still read as this channel — which is the goal. |

### Where the KB still fails to preserve the reference pattern

1. **Closer monotony.** "The snake does not want you. It wants a way out." / "It lacked the system to recognise one of its own." / "Their access had to vanish first." / "McDonald's collects from the ground beneath both." / "It becomes a bill." — one shape, five scripts. The closer-variety rule only constrains the *last two ledger rows*, so a batch generated in one run bypasses it entirely.
2. **The VSC spec mandates a reference clone.** `VIRAL_SOCIAL_COMMENTARY.md` Beat 5 quotes Ref 15's "Both sides are right — inside their own economy" as the beat definition, and the validation checklist requires "the 'both sides are right — inside their own world' beat." Result: #9 writes "Both sides are right — inside their own clock," and #16/#20 write near-variants. The KB itself turned a reference line into a template — exactly what the anti-cloning rules ban.
3. **Own-reference and saturated topics leak through.** #12 retells Ref 4's core fact (Nokia's 2004 touchscreen) as a fresh Short and closes on the same inversion family; #19 is the *named* saturated example ("Netflix binge-vs-weekly") from the drafting guide; #24 is the *named* saturated example ("McDonald's-is-really-real-estate"); #20 re-enters Ref 16's territory (urban Indians and children). The own-reference clone check and saturation flag live in `04_TOPIC_VALIDATION_GUIDE.md` but appear in neither Stage 1's auto-downgrade rules nor its self-verification checklist — so they are advisory, and the evidence shows they don't bind.
4. **Rhythm bimodality.** The references are paragraph-shaped prose with periodic one-line punches. #7 (Surat diamonds) is broken into 50+ fragment lines — the residue of "Write vertically: one spoken thought per line" still sitting in the drafting guide's Sentence Style section after v4.0 demoted line counts.
5. **Envelope misses.** #7 = 172 words (band: 230–280), #9 = 289. The band is stated in five files; nothing numerically verifies it at lock.
6. **Delivery cues are mandatory and unenforced.** Stage 2 marks cues mandatory; Stage 3 must preserve them; Stage 4 must keep them verbatim. Only 1 of 24 generated scripts (#1) contains any cues. No check in the Writer's Lock, the 16-check audit, or the Final Approval Checklist verifies their presence or vocabulary.
7. **Extraction bug persists.** 4 of 28 exports have `script_len: 0` (was 5/26 at the last audit). App layer, not KB — but it is the single largest quality leak by volume.

---

## 3. Biggest Remaining Risks

1. **Self-cloning at the beat level, not the closer level.** The ledger encodes hook/pivot/closer shapes only. The sameness now visible is *mid-script*: "That is the mechanism." / "That is not the story India chose." / "That argument is not fake. It is incomplete." / the both-sides-inside-their-own-X beat. The channel's next failure mode is every Short feeling like the last one from second 30 to second 70.
2. **Paper rules.** Three mandatory rules have no enforcement point (own-reference clone, saturation, delivery cues). A rule that exists only in a guide file the prompt summarizes is a rule the model will skip under token pressure.
3. **The vocabulary swap table overshoots and contradicts the references.** It bans "incumbent" while three KB files hold up "incumbent capture" (Ref 4) as the gold-standard mental model; it bans "executed" while Ref 1 says "She was executed at Dachau"; it bans "infrastructure", "accelerate", "mandate" — everyday words for the stated Class 10–12 metro reader. A literal-minded auditor applying the table would fail reference scripts, which the rubric's own Calibration rule defines as a miscalibrated reading. The *principle* (spoken over newspaper register) is right; the letter is wrong.
4. **Stage 3 ceremony still double-charges.** Every script pays: 16 checks + Required Evidence ×2 (Part A and §14 cold-read) + a ~40-item Final Approval Checklist that is ~90% a restatement of the 16 checks + Best-Available-Version + Regression Check. The redundancy invites checkbox fatigue, which is how real defects (missing cues, word counts) slip while ceremony passes.

---

## 4. File-by-File Audit

| File | Job | Necessary? | Verdict | Notes |
|---|---|---|---|---|
| **00_SHARED_KB/00_README.md** | Index + precedence map | Yes | Keep, 1 fix | Read-order step 1 sends a new session to the *full* REFERENCE_SCRIPTS.md while every stage loads CORE — point it at CORE with full-file as escalation. |
| **MASTER_RULE.md** | Precedence, non-negotiables, stage ownership | Yes | Keep | Clear, well-scoped, earns its length. The six-question calibration test is a good compression of the audit. |
| **CONTEXT_PRIMER.md** | Fresh-chat brief | Yes | Keep | The v4.0 trim was right. No issues. |
| **CHANNEL_CONSTITUTION.md** | Identity, audience, 8-point lens | Yes | Keep | Some identity restatement vs PRIMER/MASTER_RULE is acceptable redundancy (different load contexts). |
| **REFERENCE_SCRIPTS.md / _CORE.md** | The benchmark | Yes | Keep | Core/full split is the right token economy. Divergence risk is documented and acceptable. |
| **LANGUAGE_AND_VOICE.md** | Register, voice, hooks, closers, cues | Yes — most important file | **Rewrite one section** | The Reader Benchmark swap tables (Categories 1–3) overshoot: ban words the references use and the audience knows. Replace ~40 hard rows with the principle + the test ("would I say it aloud to a college friend") + 10 worst offenders. Also: the Energy section has no 1–10 scale, yet three stage templates demand "Energy (1–10) from the energy table" — add the scale or drop the number. Everything else in this file is excellent and evidence-grounded. |
| **FORMAT_LANES.md** | Lanes, tiebreakers, clone safety | Yes | Keep, trim | The "Audit Add-On" block duplicates rubric §6 — cut. Fix the differentiator-list mismatch (this file says "mechanism/mental-model angle"; Stages 1–2 say "language register," which can never differ since the register is fixed channel-wide — a free pass that weakens the check). |
| **VIRAL_SOCIAL_COMMENTARY.md** | The one lane override | Yes | Keep, 1 fix | Beat 5 must say: *the beat is mandatory, the wording must be topic-native — do not reuse the "inside their own X" construction from Refs 15/16.* Evidence: three generated scripts cloned it. |
| **SOURCE_AND_FACT_RULES.md** | Sourcing, dossier, freshness | Yes | Keep | Heavy but earned — the cinema-popcorn miscitation justified it, and the routine-tier relaxation already removed the worst friction. Single-owner model works. |
| **SOURCE_INTEGRITY_AND_CLARITY_GATE.md** | Absorbed pointer | No | **Delete** | Pure tombstone. Its mapping table is duplicated by the rubric's Legacy Map; its rationale belongs in CHANGELOG. |
| **STORY_SHAPE_LOCK.md** | Absorbed pointer | No | **Delete** | Same. The Calibration rule it preserves already lives verbatim in the rubric. KB_REGRESSION_TESTS Case 22 cites it — repoint that citation to the rubric. |
| **SLATE_LEDGER.md** | Anti-clone memory | Yes | Keep, extend | Add one column: `Beat-5/pivot template used` (e.g. "both-sides-inside-own-X", "that-is-the-mechanism") so mid-script templating becomes checkable. Note: rows claim provenance from `FINAL_SCRIPTS/`, which is empty on disk — keep the ledger as the single source and drop that provenance line. |
| **CHANGELOG.md / OPERATIONS.md** | History / operator scheduling | Yes | Keep | Correctly excluded from stage loads. |
| **01_TOPIC_EVALUATION/00_README.md** | Stage SOP | Yes | Keep | Fine. |
| **01_TE/01_PROMPT.md** | The topic gate | Yes | Keep, 3 fixes | (1) Self-verification says "All six KB files read" but Required Reading lists seven — fix the count. (2) Add own-reference clone + saturation to the auto-downgrade rules and the checklist — they are currently unenforced and the generated set proves it. (3) "Energy register (1–10)" references a table that doesn't exist. Otherwise: the MEDIUM/HIGH two-pass split and the Drop/Reframe/Upgrade ladder are genuinely good design. |
| **01_TE/04_TOPIC_VALIDATION_GUIDE.md** | 8-point gate detail | Yes | Keep | Solid; the decision table is good calibration. Its own-reference clone check and saturation flag are correct — the defect is that the prompt never operationalizes them. |
| **02_SC/00_README.md** | Stage SOP | Yes | Keep | Fine. |
| **02_SC/01_PROMPT.md** | The writer | Yes | Keep, 1 fix | The 6-check Writer's Lock is the right size. Add check 7: *delivery cues present, vocabulary-valid, ~1 per 1–3 lines* — it is the only mandatory output element with no check anywhere. |
| **02_SC/04_SCRIPT_DRAFTING_GUIDE.md** | Drafting depth | Yes | Keep, 2 fixes | (1) Sentence Style still says "Write vertically: one spoken thought per line" — the residue that produced #7's fragment poem. Rewrite to match the v4.0 position: references are paragraph-shaped prose; the 3-Line Article-Feel Test is the check, fragmentation is the equal-and-opposite failure. (2) The 12-item "Spoken-Rhythm Completion Test" contradicts the Writer's Lock's own instruction not to pre-run Stage 3 (it includes repetition discipline, authority placement, hedge discipline — all Stage 3 checks). Cut it to the 4–5 items genuinely owned by drafting; delete the rest. |
| **03_AF/00_README.md** | Stage SOP | Yes | Keep | Fine. |
| **03_AF/01_PROMPT.md** | Audit + finalize | Yes | Keep, trim | The Part A/B wall, clean-room trigger, and cold-read are the best-engineered parts of the pipeline. Trim: §16 should point at a 10-item residual checklist, not re-run ~40 boxes that restate the 16 checks. Add to §14 or §16: a numeric word count (230–280, cues stripped) and a cue-vocabulary check — two mechanical checks that would have caught #7, #9, and the missing cues. |
| **03_AF/03_AUDIT_RUBRIC.md** | The 16 checks | Yes | Keep | The v4.0 consolidation is the single best thing in this KB: named checks, single owners, calibration rule, evidence-or-fail. Do not touch the structure. |
| **03_AF/03_REWRITE_SOP.md** | Rewrite craft | Yes | Keep, trim | Strong practical content. Cut the Final Approval Checklist to the ~10 items not already named checks (cue presence, word count, editor-note executability, ledger row, packaging). |
| **03_AF/KB_REGRESSION_TESTS.md** | Rule-change safety net | Yes | Keep | Genuinely valuable. Repoint Case 22's STORY_SHAPE_LOCK citation to the rubric. Add Case 23: VSC Beat 5 wording must not clone "inside their own X." Add Case 24: a 172-word or 289-word script cannot lock. |
| **04_EB/00_README.md, 01_PROMPT.md** | Editor brief | Yes | Keep | The leanest, best-scoped stage. The Upstream-Gap Log is smart. No changes. |
| **04_EB/03_EDITOR_AND_VISUAL_GUIDE.md** | Edit/audio rules | Yes | Keep | Concrete, executable, restrained. Fine. |
| **04_EB/04_THUMBNAIL_DESIGN_SOP.md** | Thumbnails | Yes | Keep | Fine. |

(Note: the folder tree in the audit request listed `KB_GAP_AUDIT.md` — it no longer exists on disk (deleted at v4.0), and `CHANGELOG.md` + root `OPERATIONS.md` exist but weren't in the tree. The tree was stale, not the KB.)

---

## 5. Cross-File Conflict List

1. **Swap tables vs the references** (LANGUAGE_AND_VOICE Reader Benchmark vs Refs 1, 3, 4, 6): bans "incumbent", "executed", "psychological"-register words the references use. Violates the file's own claim that "every rule here is observable in the sixteen reference scripts" and the rubric's Calibration rule.
2. **VSC Beat 5 vs anti-cloning rules**: the beat spec quotes the reference line as the definition; the anti-cloning section bans lifting reference lines. The generated set resolved the conflict in the wrong direction three times.
3. **Writer's Lock vs Spoken-Rhythm Completion Test** (02 PROMPT vs 02 GUIDE): the prompt says "run only these six checks; do not pre-run Stage 3"; the guide demands a 12-item pre-submission test covering Stage 3 territory.
4. **"Write vertically" vs "paragraph-shaped prose"** (02 GUIDE Sentence Style vs the same file's Vertical Line Count section, post-v4.0): contradictory rhythm instructions in one file. Evidence: script #7.
5. **Differentiator lists disagree**: FORMAT_LANES says {hook, framing, mechanism angle, close, visual}; Stage 1 step 6 and Stage 2's clone check say {hook, framing, *language register*, close, visual}. Register is fixed channel-wide, so it's an always-true differentiator that silently weakens a 3-of-5 gate to 3-of-4.
6. **"Six files" vs seven** (01 PROMPT self-verification vs its own Required Reading).
7. **Energy (1–10) vs no scale**: Stage 1/2/3 templates require a number "from the LANGUAGE_AND_VOICE energy table"; that section is qualitative only. Models invent the number.
8. **Cues mandatory vs never checked** (LANGUAGE_AND_VOICE + 02 PROMPT vs Writer's Lock, rubric, Final Approval Checklist): a three-stage chain of "preserve the cues" with no stage verifying they exist.
9. **README read order vs CORE-first policy** (00_README step 1 vs its own routine-runs paragraph).
10. **Final Approval Checklist vs the 16 checks**: ~30 of ~40 items are restatements — double jeopardy that adds fatigue, not safety.
11. **Closer-variety rule vs batch generation**: "last two ledger rows" logic assumes serial production; a 28-script batch run never consults itself, producing the observed inversion-close monotony.
12. **Ledger provenance vs empty FINAL_SCRIPTS/**: SLATE_LEDGER claims its rows were "read off the locked scripts in FINAL_SCRIPTS/" — that folder is empty; the claim is unverifiable.

---

## 6. Pipeline Failure Points

**Stage 1 (Topic Evaluation).** Clear job, good ladder, right reasoning-effort split. Failure points: (a) own-reference clone and saturation are advisory, not binding — proven leaks #12, #19, #24, #20; (b) the 17-item self-verification is long enough that items get checked reflexively; (c) gate 5's "any dictionary word counts as a prerequisite" plus the overshooting swap table could downgrade strong topics for using normal words — a false-rejection risk (mitigated in practice by the Upgrade ladder, but the rule text invites it).

**Stage 1 → 2 handoff.** Strong — the frozen 5b Verified Source Notes + VERIFY-AT-AUDIT flags are well-designed. No change.

**Stage 2 (Script Creation).** The Writer's Lock is right-sized. Failure points: (a) cue mandate unverified; (b) the guide's second checklist re-introduces the pre-auditing the Lock removed; (c) "write vertically" residue produces fragment-poem outliers.

**Stage 2 → 3 handoff.** Clean (15-section package, terminal-stop rules). No change.

**Stage 3 (Audit & Finalize).** The strongest stage conceptually (wall, lock, cold-read, regression check, Final Disposition backstop). Failure points: (a) checklist redundancy → fatigue; (b) no numeric word-count check despite a hard band — #7 and #9 would have sailed through every named check; (c) Final Disposition can DROP at the very end of full production effort — correct as a backstop, but it only stays cheap if Stage 1's clone/saturation rules start binding (currently the weak ideas it would catch are exactly the ones Stage 1 is leaking).

**Stage 3 → 4 handoff.** Clean; PRODUCTION-READY gating + Upstream-Gap Log is good design.

**Stage 4 (Editor Brief).** No failure points found. Correctly terminal on factual issues, correctly forbidden from script edits.

**App layer (outside KB but blocking).** The `script_len: 0` extraction bug (4/28) and missing cue rendering are the largest end-to-end quality losses right now — larger than anything in the KB text.

**Net likelihood the final output matches the reference style:** high (the 24 non-empty scripts average reference-adjacent), conditional on fixing closer monotony and the leaking topic gates — those two are what currently make the output recognizably "generated in batch" rather than "written by the channel."

---

## 7. Exact Changes Required

**P0 — fixes that change output quality (do first)**

1. `VIRAL_SOCIAL_COMMENTARY.md` Beat 5 + Validation Checklist: add — *"The beat is mandatory; the wording is not. Never reuse the 'Both sides are right — inside their own X' construction from Refs 15/16; write the granting-both-sides line from the topic's own nouns."* Mirror one line in the rubric's Viral overlay.
2. `01_TOPIC_EVALUATION/01_PROMPT.md`: add to Auto-Downgrade rules — *"8. Topic matches a reference script's territory or a named saturated explainer and the brief does not state ≥3 differentiators → DROP/REFRAME."* Add matching self-verification item. (Closes the #12/#19/#24/#20 leak.)
3. `LANGUAGE_AND_VOICE.md § Closer Variety` + `SLATE_LEDGER.md`: extend the variety rule to batch runs — *"In any multi-script batch, no closer shape may exceed 2 of any 5 consecutive scripts"* — and add a ledger column for mid-script template shapes (pivot/Beat-5 scaffolds).
4. `03_AF/01_PROMPT.md` §14/§16: add two mechanical checks — *word count 230–280 with cues stripped (state the count)* and *delivery cues present + only the seven valid tokens*. Add Writer's Lock check 7 (cues) in `02_SC/01_PROMPT.md`.
5. App layer (not KB): fix the `script_len: 0` extraction bug (add `script_len > 0` guard + retry) — already flagged in CHANGELOG, still open, 14% of output lost.

**P1 — false/contradictory rules**

6. `LANGUAGE_AND_VOICE.md § Reader Benchmark`: replace the three swap-table categories with the principle, the say-it-aloud test, and ≤10 genuinely banned rows. Add: *"This table must pass all ten anchor scripts; a word the references speak is not banned."*
7. `02_SC/04_SCRIPT_DRAFTING_GUIDE.md`: rewrite Sentence Style's "Write vertically" bullet to the paragraph-prose-with-punches position; cut the Spoken-Rhythm Completion Test to the 4–5 drafting-owned items.
8. Fix the small lies: "six files" → "seven" (01 PROMPT); differentiator list → replace "language register" with "mechanism angle" in Stage 1 step 6 and Stage 2's clone check; Energy — either add a 1–10 scale to LANGUAGE_AND_VOICE § Energy or change all three templates to the qualitative register names.

**P2 — friction removal**

9. Delete `SOURCE_INTEGRITY_AND_CLARITY_GATE.md` and `STORY_SHAPE_LOCK.md`; repoint KB_REGRESSION_TESTS Case 22 and the two README/MASTER_RULE mentions to the rubric.
10. `03_REWRITE_SOP.md`: cut the Final Approval Checklist to the ~10 items not already named checks.
11. `FORMAT_LANES.md`: delete the "Audit Add-On for Format Lane" block (rubric §6 owns it). `00_SHARED_KB/00_README.md`: read order step 1 → CORE first.
12. `KB_REGRESSION_TESTS.md`: add Case 23 (VSC Beat-5 wording clone must FAIL) and Case 24 (out-of-band word count must FAIL).

---

## 8. Files to Delete, Merge, or Rewrite

- **Delete:** `SOURCE_INTEGRITY_AND_CLARITY_GATE.md`, `STORY_SHAPE_LOCK.md` (absorbed pointers; content fully owned elsewhere).
- **Rewrite (one section each):** `LANGUAGE_AND_VOICE.md` (Reader Benchmark tables), `04_SCRIPT_DRAFTING_GUIDE.md` (Sentence Style + Completion Test), `VIRAL_SOCIAL_COMMENTARY.md` (Beat 5 anti-clone note).
- **Trim:** `03_REWRITE_SOP.md` (approval checklist), `FORMAT_LANES.md` (audit add-on), `03_AF/01_PROMPT.md` (§16 pointer instead of restatement).
- **Merge:** nothing. The v4.0 merges were sufficient; further merging would couple files that load at different stages.
- **No file needs a rebuild.**

---

## 9. Final Recommended KB Structure

```
knowledge
 ┣ OPERATIONS.md                      (operator-only, unchanged)
 ┣ 00_SHARED_KB
 ┃ ┣ 00_README.md                     (read order fixed: CORE first)
 ┃ ┣ CHANGELOG.md
 ┃ ┣ CHANNEL_CONSTITUTION.md
 ┃ ┣ CONTEXT_PRIMER.md
 ┃ ┣ FORMAT_LANES.md                  (audit add-on removed; differentiators fixed)
 ┃ ┣ LANGUAGE_AND_VOICE.md            (Reader Benchmark rewritten; Energy scale added)
 ┃ ┣ MASTER_RULE.md
 ┃ ┣ REFERENCE_SCRIPTS.md
 ┃ ┣ REFERENCE_SCRIPTS_CORE.md
 ┃ ┣ SLATE_LEDGER.md                  (+ mid-script template column; batch rule)
 ┃ ┣ SOURCE_AND_FACT_RULES.md
 ┃ ┗ VIRAL_SOCIAL_COMMENTARY.md       (Beat 5 anti-clone note)
 ┣ 01_TOPIC_EVALUATION                (clone/saturation now binding; counts fixed)
 ┣ 02_SCRIPT_CREATION                 (Writer's Lock 7 checks; guide de-duplicated)
 ┣ 03_AUDIT_AND_FINALIZE              (word-count + cue checks; checklist trimmed;
 ┃                                     regression Cases 23–24 added)
 ┗ 04_EDITOR_BRIEF                    (unchanged)
```

Net: −2 files, −~250 lines of duplication, +~30 lines of new binding rules.

---

## 10. Prioritized Implementation Plan

1. **Day 1 (P0, ~1 hour of edits):** items 1–4 above. These are the only changes that move the similarity score — expected gain: payoff style 7.5→8.5, lane logic 7.5→8.5, overall ~84→~89.
2. **Day 1 (app):** the extraction-bug guard (item 5). Biggest volume win, zero KB risk.
3. **Day 2 (P1):** items 6–8. Run `KB_REGRESSION_TESTS.md` after the Reader Benchmark rewrite — specifically confirm all ten anchors still pass COMPREHENSION.
4. **Day 3 (P2):** items 9–12, then a `grep -nE "STORY_SHAPE_LOCK|SOURCE_INTEGRITY_AND_CLARITY_GATE"` stale-reference sweep across all stage files.
5. **Validation run:** regenerate 5 lanes (one VSC, one saturated-adjacent topic, one history, one science, one business) and check exactly four things: closer-shape spread, Beat-5 wording, word counts, cue presence. If all four hold, stamp the KB v4.1 and declare it stable.
6. **Then stop editing.** The KB's residual risk is now over-tuning, not under-tuning. Freeze rules until ≥10 published Shorts produce real retention data; let the weekly retro, not script-level intuition, drive the next change.
