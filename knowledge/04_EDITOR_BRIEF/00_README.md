# 04_EDITOR_BRIEF

**Purpose:** Convert a final, locked script into a lean, editor-ready production package — the locked script and locked title (plus a clearly labelled packaging-title alternative only when useful), a scene-by-scene shot list, simple B-roll placement guidance, on-screen text, audio, look, three thumbnail concepts, and must-keep visual references with licensing flags. **No AI generation prompts** — the editor handles B-roll sourcing, AI generation, and editing independently. No lineage logs or internal QA dumps — only what the editor needs to finish the video.
**Scope:** Editor briefing stage only. Script work is upstream. This is the **final stage** in the production chain before recording and editing begin.
**Chain position:** Stage 4 of 4. Consumes the locked `Status: PRODUCTION-READY` script from `03_AUDIT_AND_FINALIZE` (the merged audit-and-finalize stage), which is always run first.

---

## How to use

1. Run a topic through `01_TOPIC_EVALUATION/` → `02_SCRIPT_CREATION/` → `03_AUDIT_AND_FINALIZE/` first.
2. Use the stage 3 output only after it returns `Status: PRODUCTION-READY`. If the audit was Strong or Good but needs polish, stage 3 direct finalization applies the polish automatically.
3. Open `01_PROMPT.md` here.
4. Paste the locked script into the INPUT block. Optionally paste the audit report immediately after — useful for catching audit-flagged delivery / visual concerns.
5. Paste the entire `01_PROMPT.md` (with filled input) into a fresh AI chat that has access to this folder.
6. The AI validates the input, reads the required KB files, parses the script into lane-appropriate beats, builds the shot list + B-roll placement guide + on-screen text + audio + look, notes a visual source type (AI-gen / Stock / In-house card / Host / Real-footage-only) for each beat, designs three thumbnail concepts, adds licensing/attribution flags, and saves the complete brief as a Markdown file in `BRIEFS/` using the fixed nine-section output template.
7. Hand the brief to the editor (and the host, for delivery audit instructions).

Same prompt, same locked script, same KB files → near-identical editor briefs across runs.

---

## What lives in this folder (read order)

| # | File | Role |
|---|------|------|
| 00 | `00_README.md` | This file. Folder index, chain dependency, sync warning. |
| 01 | `01_PROMPT.md` | The editor brief prompt. Hybrid: restraint rules, mandatory beats, audio mastering, thumbnail rules, output template — all inlined. |
| 03 | `03_EDITOR_AND_VISUAL_GUIDE.md` | **The central document for this stage.** Aesthetic target, delivery audit, pacing, music, audio mastering, on-screen text, B-roll, graphics, mandatory quiet beat, banned visual moves, treatment by topic type. |
| 04 | `04_THUMBNAIL_DESIGN_SOP.md` | **The second key document.** Dimensions, palette, typography, three composition layouts, approved text patterns, banned visuals, format-lane-specific patterns. |

Read order is defined in `01_PROMPT.md`. Shared KB files are loaded from `../00_SHARED_KB/`.

---

## Dependency on upstream stages

This folder accepts one valid input path:

### From 03_AUDIT_AND_FINALIZE
- Input: `Status: PRODUCTION-READY` script (Section II) with the 17-section template from stage 3.
- Used when: stage 3 completed either Direct finalization, Minor edit, or Major rewrite.
- Stage 2 drafts are not accepted here. If you only have a stage 2 draft, run stage 3 first.

### Optional: paste the audit report alongside
The editor brief accepts the Audit Report (Section I of the `03_AUDIT_AND_FINALIZE` output) as a second optional input. Pasting it lets the briefer catch audit-flagged delivery / visual concerns (e.g., if the audit said "language register: register drift detected" → the briefer can flag this for the host before recording).

---

## What does NOT belong in this folder

If you find any of these here, move them out:

- **Topic gating** — `../01_TOPIC_EVALUATION/`.
- **Script drafting** — `../02_SCRIPT_CREATION/`.
- **Script auditing & rewrite** — `03_AUDIT_AND_FINALIZE/`.

This folder is the editor brief / production-package stage. Keep it that way.

---

## Where to save outputs

The editor brief is saved as a Markdown file in this folder's `BRIEFS/` directory.

Use this path pattern:

```
04_EDITOR_BRIEF/BRIEFS/EDITOR_BRIEF_<topic-slug>.md
```

The editor + host work from the saved brief. If the Curious Engine app needs the brief, attach or paste the saved Markdown file into the app.

---

## Why output consistency works here

LLMs are stochastic. Editor briefs won't be byte-identical across runs (creative choices about B-roll, thumbnail composition, etc.), but this folder pushes structural agreement up to ~85% by:

1. **Locked-script input.** The script is not being rewritten — only translated to visual direction. The brief carries the full locked script in section 1 so the editor works from one artifact. (Script lineage, sources, and internal QA were removed at v3.0 — they added no production value.)
2. **Topic-treatment register selection.** Five named treatments (Default / Serious-historical / Science / Current affairs / Historical) — the briefer picks one, and the choice cascades through pacing, music, color, and graphics.
3. **Mandatory beats inlined.** Half-second pause before payoff. 1.5–2 second quiet beat in second half. 10–14 meaningful visual beats per 90–120 second Anchor. SFX ≤ 4. Impact text ≤ 3 uses.
4. **Hard caps on text and graphics.** Maximum 5 thumbnail words. Two text types only (Poppins ExtraBold + Inter Bold). Banned visuals listed inline.
5. **Three thumbnail concepts, three layouts.** Forces breadth and stops the model from defaulting to one composition style.
6. **Visual source classification.** Every non-host visual in the shot list is labelled with a source type (AI-gen / Stock / In-house card / Host / Real-footage-only). Real footage is reserved for real people, places, events, archival records, and trademarks — the briefer flags this explicitly. Source screenshots are used only when the source is the proof; otherwise facts become clean text cards. AI generation prompts are the editor's domain and are not written here (removed at v3.3).
7. **Banned-visual and banned-vocabulary check on every visible string.** On-screen text, captions, and thumbnail text all go through the same banned word and banned visual-move list as the script. The self-check runs this before returning.

8. **Self-verification checklist.** Every item must pass before the briefer returns.

If you see drift across runs, check that the model actually read `03_EDITOR_AND_VISUAL_GUIDE` and `04_THUMBNAIL_DESIGN_SOP` (the two folder-unique files — they're not in any other stage's KB), and selected a topic-treatment register.

---

## Editing this folder

- Edit `01_PROMPT.md` only when editor brief logic genuinely changes. Bump the KB version line in the output template.
- Per-edit rule (from `01_PROMPT.md`): change only one of {hard constraints, topic-treatment register selection, output template} per edit, so past briefs stay comparable to future ones.
- After any edit, run a stale-reference check: `grep -nE "old-filename" *.md` should return nothing.
