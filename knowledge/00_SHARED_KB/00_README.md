# Shared Knowledge Base

This folder owns cross-stage knowledge used by stages 1 to 4.

**`REFERENCE_SCRIPTS.md` is the creative quality benchmark.** It controls voice and feel, but it does not override newer operational, sourcing, safety, stage-ownership, or schema rules in their owning canonical files.

**Routine pipeline runs load `REFERENCE_SCRIPTS_CORE.md`, not the full file.** The core holds the ten cited anchors (References 1-8 for general voice/pacing; 15-16 for the Viral Social Commentary lane) at roughly a third of the token cost. `REFERENCE_SCRIPTS.md` remains the full creative-calibration source and is opened only for deep recalibration or proposed-lane work (References 9-14). If the core conflicts with the full file on creative calibration, the full file wins.

**Read order for a new AI session:**

1. `REFERENCE_SCRIPTS.md` — the sixteen scripts and the rules around them.
2. `MASTER_RULE.md` — reference hierarchy, core production rules, stage ownership.
3. `CONTEXT_PRIMER.md` — compressed brief to paste into a new chat.

The other files are opened as needed — `LANGUAGE_AND_VOICE.md` for register questions, `FORMAT_LANES.md` for lane selection, `VIRAL_SOCIAL_COMMENTARY.md` for the one lane that overrides the default structure, `SOURCE_AND_FACT_RULES.md` for sourcing, `SOURCE_INTEGRITY_AND_CLARITY_GATE.md` for the mandatory final lock, and `CHANNEL_CONSTITUTION.md` for identity and the eight-point filter.

## Canonical Files

| File | Owns |
|------|------|
| `REFERENCE_SCRIPTS.md` | The sixteen Anchor Short scripts. The creative quality benchmark. |
| `REFERENCE_SCRIPTS_CORE.md` | Condensed default calibration set (ten cited anchors). Loaded by stages 2-4. Subordinate to `REFERENCE_SCRIPTS.md`. |
| `MASTER_RULE.md` | Reference hierarchy, core production rules, stage ownership. Read after the references. |
| `CHANNEL_CONSTITUTION.md` | Channel identity, audience, the eight-point topic filter, and what the channel is not. |
| `CONTEXT_PRIMER.md` | Compressed brief for fresh AI chats. Downstream summary of the canonical rules. |
| `LANGUAGE_AND_VOICE.md` | The complete Indian English register, host voice, banned openings and words. |
| `FORMAT_LANES.md` | Seven canonical lanes plus three proposed lanes. Lane-selection tiebreaker. Weekly cadence. |
| `VIRAL_SOCIAL_COMMENTARY.md` | Full spec for the Viral Social Commentary lane. Calibrated by References 15 and 16. |
| `SOURCE_AND_FACT_RULES.md` | Source hierarchy, fact-risk grades, verification discipline. |
| `SOURCE_INTEGRITY_AND_CLARITY_GATE.md` | Mandatory five-pillar source, mechanism, authority-placement, first-listen-clarity, and freshness gate. |

## Stage-Owned Canonical Files

These live in the stage folders, not here. They follow the same source-of-truth rule.

- `01_TOPIC_EVALUATION/04_TOPIC_VALIDATION_GUIDE.md`
- `02_SCRIPT_CREATION/04_SCRIPT_DRAFTING_GUIDE.md`
- `03_AUDIT_AND_FINALIZE/03_AUDIT_RUBRIC.md`
- `03_AUDIT_AND_FINALIZE/03_REWRITE_SOP.md`
- `04_EDITOR_BRIEF/03_EDITOR_AND_VISUAL_GUIDE.md`
- `04_EDITOR_BRIEF/04_THUMBNAIL_DESIGN_SOP.md`

Resolve conflicts by decision ownership:

- operational precedence and stage ownership → `MASTER_RULE.md`
- voice/language → `LANGUAGE_AND_VOICE.md`
- lane selection → `FORMAT_LANES.md` / `VIRAL_SOCIAL_COMMENTARY.md`
- sourcing and lock safety → `SOURCE_AND_FACT_RULES.md` / `SOURCE_INTEGRITY_AND_CLARITY_GATE.md`
- stage decisions → that stage's canonical guide/rubric/SOP
- creative calibration only → `REFERENCE_SCRIPTS.md`

READMEs, prompts, primers, and condensed references are subordinate summaries.
