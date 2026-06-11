---
title: "Channel Operations — Cadence, Rotation, and Proposed-Lane Promotion"
file: "OPERATIONS.md"
role: operations
canonical: true
version: "v1.0"
related: ["00_SHARED_KB/FORMAT_LANES.md"]
summary: "Publishing cadence, lane rotation, solo-operation buffer, and the proposed-lane promotion/probation rule. Extracted from FORMAT_LANES.md at KB v4.0 — this is production scheduling for the human operator, not script knowledge, and no pipeline stage needs to load it."
keywords: ["operations", "cadence", "rotation", "schedule", "lane graduation", "probation"]
---

# Channel Operations

**No pipeline stage loads this file.** It governs *when and what to publish*, not *how to write*. Lane definitions, the hook-test tiebreaker, and lane-selection rules stay in `00_SHARED_KB/FORMAT_LANES.md`.

## Weekly Cadence

Every produced Short is an Anchor Short. The slate runs on a **2-week A+B cycle — 7 Shorts per cycle** (~3–4 per week): each canonical lane posts once per cycle, matched to that day's audience behaviour.

| Cycle Short | Week · Day | Time (IST) | Default lane |
|---|---|---|---|
| 1/7 | A · Monday | 7 PM | Real Reason — familiar story, hidden cause; fresh-week opener |
| 2/7 | A · Wednesday | 7 PM | Sharp Contradiction — peak engagement day gets the sharpest lane |
| 3/7 | A · Friday | 7 PM | Hidden India — rooted and shareable into the weekend |
| 4/7 | B · Monday | 7 PM | Smart Money/Business — open the second week with a mechanism |
| 5/7 | B · Wednesday | 7 PM | Viral Social Commentary — peak day; stage the debate while it's hot |
| 6/7 | B · Thursday | 7 PM | Science Lite — one clean invisible mechanism |
| 7/7 | B · Saturday | 11 AM | One-off — weekend leisure scroll, spend it on a standout topic |

These are **defaults, not rules** — quality over cadence always wins. If the sharpest researched idea this week is a different lane, post it in the slot and let the rotation flex. Viral Social Commentary follows current debate intensity: pull it forward or swap slots when a debate is live. Maximum two current-event Shorts per week (Real Reason doorway + Viral Social Commentary combined); never two consecutive current-event Shorts. The weekly retro may tilt the next cycle's split by at most one slot.

**Solo operation:** the cadence above is *publishing* rhythm, not *drafting* rhythm. Maintain a 1-week buffer — draft and verify next week's scripts before this week ends. The 24-hour fact-check gap sits inside the buffer, not the publishing window.

## Proposed-Lane Promotion (probation)

The three proposed lanes (Forgotten Inventor, Quiet Monopoly, Status Game) are valid to tag and script at any time, but they are **not** part of the fixed 7-slot rotation and never enter it automatically. The benchmark is the **channel median performance score** from the weekly retro (only Shorts with real metrics count — unmeasured videos are ignored).

- **Promote** — the lane has shipped **≥2 Shorts at or above the channel median, landing in ≥2 different weeks** (guards against one lucky week). It may then swap in for the weakest-performing core lane, 1:1 — the cycle stays 7 Shorts. With 2 Shorts this is an *early* read; with 3+ it is *solid*.
- **Keep testing** — shipped at least one Short but not yet 2 above-median ones.
- **Cut / reframe** — shipped **≥4 Shorts across ≥2 weeks with fewer than 2 at or above median**. The cut bar is deliberately higher than the promote bar: cutting is costly and hard to undo; promotion is reversible.

These are deliberately plain counts, not statistics — at ~3–4 Shorts/week a proposed lane stays a small sample for months, and a legible count beats a shrinkage estimate the operator cannot sanity-check. Revisit only if a proposed lane routinely reaches 5+ measured Shorts. Promotion is a deliberate human decision: the retro surfaces the recommendation; the operator performs the swap (the rotation lives in app settings; calendar defaults follow it).
