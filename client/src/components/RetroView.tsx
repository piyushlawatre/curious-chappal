/**
 * RetroView.tsx — weekly performance retro.
 *
 * Review the week's videos (manual metrics), tag a verdict, write learnings, and
 * decide next week's plan. The backend computes a lane weighting ("post more of
 * X, less of Y") from the rows, surfaced here and on the calendar's lane strip.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeUpItem, staggerContainer } from "../lib/motion";
import { useScrollTopOn } from "../lib/useScrollTopOn";
import {
  listRetros, getRetro, upsertRetro, emptyVideo,
  type RetroWeek, type VideoPerf, type Verdict, type LaneWeighting, type LaneAllocation, type Bucket, type WeightingMeta,
} from "../api/retro";
import type { FormatLane } from "../api/ideas";
import { listSchedule, type ScheduleEntry } from "../api/schedule";
import {
  mondayOf, toISODate, parseISODate, todayLocalISO,
  cycleStartMondayOf, expandAllocationToLanes,
  setRotationLanes as installRotation,
} from "../data/postingSchedule";
import { getLanePlan, upsertLanePlan } from "../api/lanePlan";
import { getSettings, updateSettings } from "../api/settings";
import { HowItWorksModal, HowItWorksButton } from "./HowItWorks";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const LANE_OPTS: FormatLane[] = [
  "Real Reason", "Hidden India", "Smart Money/Business",
  "Science Lite", "Sharp Contradiction", "Viral Social Commentary", "One-off",
  "Forgotten Inventor", "Quiet Monopoly", "Status Game",
];

// Manual verdict overrides the computed score. Labels mirror the repeat/improve/
// avoid model the score buckets into.
const VERDICT_OPTS: { value: Verdict; label: string; cls: string }[] = [
  { value: "double-down", label: "Repeat", cls: "bg-emerald-50 text-emerald-700" },
  { value: "keep-testing", label: "Improve", cls: "bg-amber-50 text-amber-700" },
  { value: "avoid", label: "Avoid", cls: "bg-rose-50 text-rose-700" },
];

const BUCKET_STYLE: Record<Bucket, { bg: string; fg: string; label: string }> = {
  repeat:  { bg: "#e8f7ef", fg: "#0a6b43", label: "Repeat" },
  improve: { bg: "#fdf3dc", fg: "#7a4d0a", label: "Improve" },
  avoid:   { bg: "#fbe9e6", fg: "#a3302a", label: "Avoid" },
};

function addDaysISO(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISODate(d);
}

function weekLabel(weekStart: string): string {
  const a = parseISODate(weekStart);
  const b = parseISODate(addDaysISO(weekStart, 6));
  return `${MONTHS[a.getUTCMonth()]} ${a.getUTCDate()} – ${MONTHS[b.getUTCMonth()]} ${b.getUTCDate()}`;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function I({ d, size = 13, stroke = 1.7 }: { d: React.ReactNode; size?: number; stroke?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}
const ChevL = () => <I d={<path d="M15 18l-6-6 6-6" />} />;
const ChevR = () => <I d={<path d="M9 18l6-6-6-6" />} />;
const Plus  = ({ size = 12 }: { size?: number }) => <I size={size} d={<path d="M12 5v14M5 12h14" />} />;
const Trash = ({ size = 12 }: { size?: number }) => <I size={size} d={<><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /></>} />;
const Download = ({ size = 12 }: { size?: number }) => <I size={size} d={<><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></>} />;

// ── Proposed-lane probation / graduation ───────────────────────────────────────
// The three proposed lanes are NOT in the fixed 7-slot rotation. A lane joins the
// rotation only by proving it performs: enough videos that beat the channel's
// typical (median) video, spread across different weeks so it's not one lucky week.
// Thresholds are deliberately simple + legible, tuned to this channel's real data
// rate (~3-4 Shorts/week, proposed lanes are occasional swap-ins → samples stay tiny
// for months). We use a "spread across weeks" guard and an asymmetric (higher) cut
// bar instead of heavier statistics, because at this cadence the fancy math never
// gets enough samples to pay off. Revisit shrinkage only if a proposed lane ever
// routinely reaches 5+ Shorts — see FORMAT_LANES.md § Lane graduation (probation).
const PROPOSED_LANES = ["Forgotten Inventor", "Quiet Monopoly", "Status Game"];
// The 7 canonical rotation lanes (mirror of server Settings.CANONICAL_ROTATION).
const CORE_LANES = [
  "Real Reason", "Hidden India", "Smart Money/Business", "Science Lite",
  "Sharp Contradiction", "Viral Social Commentary", "One-off",
];
const PROMOTE_MIN_WINNERS = 2; // videos that beat the typical video…
const PROMOTE_MIN_WEEKS   = 2; // …landing in at least this many different weeks
const CUT_MIN_SHIPPED     = 4; // a fair run before cutting (higher bar than promote: cutting is costly + harder to undo)

type ProbationStatus = "promote" | "testing" | "cut" | "untested";
type ProbationRow = {
  lane: string;
  shipped: number;
  qualifying: number;        // videos scoring at/above the channel median
  shippedWeeks: number;
  status: ProbationStatus;
  statusLabel: string;       // plain-language chip
  headline: string;          // one-line "what's happening"
  action: string;            // plain-language "what to do + why"
};

function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const a = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : Math.round((a[mid - 1] + a[mid]) / 2);
}

// Build the probation report from every saved retro week (each video carries a
// server-computed 0..100 `score`). The channel median is the bar each lane must beat.
function computeProbation(history: RetroWeek[]): { channelMedian: number | null; rows: ProbationRow[] } {
  const allScores: number[] = [];
  const byLane = new Map<string, { score: number; week: string }[]>();
  for (const wk of history) {
    for (const v of wk.videos ?? []) {
      if (typeof v.score !== "number") continue;
      allScores.push(v.score);
      if (PROPOSED_LANES.includes(v.lane)) {
        if (!byLane.has(v.lane)) byLane.set(v.lane, []);
        byLane.get(v.lane)!.push({ score: v.score, week: wk.weekStart });
      }
    }
  }
  const channelMedian = median(allScores);
  const enoughChannelData = channelMedian != null && allScores.length >= 3;

  const rows: ProbationRow[] = PROPOSED_LANES.map((lane) => {
    const items = byLane.get(lane) ?? [];
    const shipped = items.length;
    const winners = channelMedian == null ? [] : items.filter((i) => i.score >= channelMedian);
    const qualifying = winners.length;
    const shippedWeeks = new Set(items.map((i) => i.week)).size;
    const winnerWeeks = new Set(winners.map((i) => i.week)).size;
    const confident = shipped >= 3; // 3+ videos = a solid read, not just an early one

    let status: ProbationStatus, statusLabel: string, headline: string, action: string;

    if (!enoughChannelData || shipped === 0) {
      status = "untested"; statusLabel = "Too early to tell";
      headline = shipped === 0 ? "No videos in this lane yet." : "Not enough to compare yet.";
      action = !enoughChannelData
        ? "We don't have enough of your own videos scored yet to know what a typical video looks like. Log a few weeks of numbers, then this lane will start tracking automatically."
        : `Your typical video scores ${channelMedian}/100 — that's the bar. Post a video in this lane to start its trial.`;
    } else if (qualifying >= PROMOTE_MIN_WINNERS && winnerWeeks >= PROMOTE_MIN_WEEKS) {
      status = "promote"; statusLabel = "Ready to add";
      headline = "Beating your typical video.";
      action = confident
        ? `${qualifying} of ${shipped} videos beat your typical video (${channelMedian}/100), across ${winnerWeeks} different weeks — a real pattern, not one lucky week. This lane has proven itself. Add it to the weekly plan in place of whichever regular lane is doing worst right now.`
        : `Both videos so far beat your typical video (${channelMedian}/100), in ${winnerWeeks} different weeks — a strong early sign. You can promote it into the weekly plan now, or post one more to be fully sure. Your call.`;
    } else if (shipped >= CUT_MIN_SHIPPED && shippedWeeks >= PROMOTE_MIN_WEEKS && qualifying < PROMOTE_MIN_WINNERS) {
      // Cut needs BOTH a fair volume (4+) AND a fair spread (2+ different weeks) —
      // four videos in one unlucky week must not read as "drop the lane"
      // (mirrors FORMAT_LANES.md § Lane graduation).
      status = "cut"; statusLabel = "Time to drop it";
      headline = "Not landing after a fair run.";
      action = `${shipped} videos over ${shippedWeeks} week${shippedWeeks === 1 ? "" : "s"} and only ${qualifying} beat your typical video (${channelMedian}/100). It's had a fair chance and isn't connecting. Drop this lane or rethink the angle rather than keep spending slots on it.`;
    } else if (qualifying >= PROMOTE_MIN_WINNERS && winnerWeeks < PROMOTE_MIN_WEEKS) {
      status = "testing"; statusLabel = "Still proving it";
      headline = "Promising, but from one week only.";
      action = `${qualifying} videos beat your typical video — but they all went out in the same week, which can just be a good week. Post one more in a different week; if it also beats your typical video, the lane has earned a spot.`;
    } else {
      status = "testing"; statusLabel = "Still proving it";
      headline = "Still being tested.";
      action = shipped === 1
        ? "Just 1 video so far — too few to read anything into. Post a couple more in this lane over the coming weeks."
        : `Only ${qualifying} of ${shipped} videos beat your typical video (${channelMedian}/100) so far. It needs ${PROMOTE_MIN_WINNERS} winners in ${PROMOTE_MIN_WEEKS} different weeks to earn a regular spot. Keep testing.`;
    }
    return { lane, shipped, qualifying, shippedWeeks, status, statusLabel, headline, action };
  });
  return { channelMedian, rows };
}

function ProbationPanel({ history, rotationLanes, onSwap, swapBusy, swapMsg }: {
  history: RetroWeek[];
  rotationLanes: string[];
  onSwap: (laneIn: string, laneOut: string) => void;
  swapBusy: boolean;
  swapMsg: string | null;
}) {
  const { channelMedian, rows } = computeProbation(history);
  // Which rotation lane each promotable trial lane would replace (per-lane choice).
  const [replaceFor, setReplaceFor] = useState<Record<string, string>>({});
  // Opportunistic: only surface proposed lanes actually in play (≥1 video) or
  // already graduated into the rotation. If you've never used one, the panel
  // stays hidden — no clutter. The rule itself lives in FORMAT_LANES.md.
  const inPlay = rows.filter((r) => r.shipped > 0 || rotationLanes.includes(r.lane));
  if (!inPlay.length) return null;
  const tone = (st: ProbationStatus) =>
    st === "promote" ? { bg: "#e8f7ef", fg: "#0a6b43", ring: "#bfe6cf" }
    : st === "cut" ? { bg: "#fbe9e6", fg: "#a3302a", ring: "#f0c4bd" }
    : st === "testing" ? { bg: "#fff4e2", fg: "#9a5b00", ring: "#f3dca8" }
    : { bg: "#f1efe8", fg: "#5f5e5a", ring: "#ddd9cf" };
  // A demoted trial lane is replaced by a canonical lane currently out of rotation.
  const missingCore = CORE_LANES.filter((l) => !rotationLanes.includes(l));
  return (
    <div className="rounded-[10px] border border-zinc-200/80 bg-white p-3.5 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1.5">
        Trial lanes — should any join the weekly plan?
      </p>
      <p className="text-[11.5px] leading-5 text-zinc-500 mb-3">
        Your channel runs on 7 proven lanes, one per weekly slot. The lanes below are on trial. A new lane
        only joins the weekly plan after it shows it can perform — so a lane that just looks interesting
        never pushes out one that already works. A video "performs" when it beats your typical video
        {channelMedian != null ? ` (your middle score, currently ${channelMedian} out of 100)` : ""}. Here's how
        each trial lane is doing and what to do next.
      </p>
      <div className="space-y-2">
        {inPlay.map((r) => {
          const graduated = rotationLanes.includes(r.lane);
          const t = graduated ? { bg: "#e8f7ef", fg: "#0a6b43", ring: "#bfe6cf" } : tone(r.status);
          const chosen = replaceFor[r.lane] ?? "";
          return (
            <div key={r.lane} className="rounded-[8px] p-2.5" style={{ background: "#faf9f7", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.05)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-zinc-900">{r.lane}</span>
                <span className="text-[10px] text-zinc-400 shrink-0 tabular-nums">{r.shipped} video{r.shipped === 1 ? "" : "s"} · {r.qualifying} beat your usual</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: t.bg, color: t.fg, boxShadow: `inset 0 0 0 1px ${t.ring}` }}>{graduated ? "In the weekly plan ✓" : r.statusLabel}</span>
              </div>
              <p className="text-[12px] font-medium text-zinc-700">{graduated ? "Graduated — it now owns a weekly slot." : r.headline}</p>
              <p className="mt-0.5 text-[11.5px] leading-5 text-zinc-500"><span className="font-semibold text-zinc-600">What to do: </span>
                {graduated
                  ? "It's in the rotation: the calendar gives it a default slot and retros allocate it like any core lane. If it stops performing, swap it back out below."
                  : r.action}
              </p>

              {/* Graduation controls — promote (status says ready) or demote (already in). */}
              {!graduated && r.status === "promote" && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <select value={chosen} disabled={swapBusy}
                          onChange={(e) => setReplaceFor((prev) => ({ ...prev, [r.lane]: e.target.value }))}
                          className="h-7 rounded-[6px] bg-white px-2 text-[11.5px] text-zinc-800 outline-none shadow-[inset_0_0_0_1px_rgba(15,15,15,0.10)]">
                    <option value="">Choose the lane it replaces…</option>
                    {rotationLanes.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <button type="button" disabled={!chosen || swapBusy} onClick={() => onSwap(r.lane, chosen)}
                          className="h-7 px-3 rounded-[6px] text-[11.5px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                    {swapBusy ? "Updating…" : "Add to weekly plan"}
                  </button>
                  <span className="text-[10.5px] text-zinc-400">Tip: replace whichever lane the weighting above says is weakest.</span>
                </div>
              )}
              {graduated && missingCore.length > 0 && (
                <div className="mt-2">
                  <button type="button" disabled={swapBusy} onClick={() => onSwap(missingCore[0], r.lane)}
                          className="h-7 px-3 rounded-[6px] text-[11.5px] font-medium text-zinc-700 bg-white hover:bg-zinc-100 transition-colors shadow-[inset_0_0_0_1px_rgba(15,15,15,0.10)] disabled:opacity-50">
                    {swapBusy ? "Updating…" : `Swap back out (restore ${missingCore[0]})`}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {swapMsg && <p className="mt-2.5 text-[11px] leading-5 font-medium text-emerald-700">{swapMsg}</p>}
    </div>
  );
}

// ── Lane weighting summary ─────────────────────────────────────────────────────
function WeightingPanel({ weighting, meta, rotationLanes = [] }: { weighting: LaneWeighting[]; meta?: WeightingMeta; rotationLanes?: string[] }) {
  // Empty state is owned by the Videos card's prompt below, so we render nothing
  // here when there's no data — avoids two stacked "add videos" messages.
  if (!weighting.length) return null;
  const tone = (r: LaneWeighting["recommendation"]) =>
    r === "more" ? { bg: "#e8f7ef", fg: "#0a6b43", label: "Post more" }
    : r === "less" ? { bg: "#fbe9e6", fg: "#a3302a", label: "Pull back" }
    : { bg: "#f1efe8", fg: "#5f5e5a", label: "Hold steady" };
  const blendNote = meta && meta.weeksUsed > 1
    ? `Blended across the last ${meta.weeksUsed} retro weeks (${meta.pooledVideos} videos, recent weeks weigh more)`
    : "Based on this week only — older retro weeks blend in automatically once saved";
  const freshNote = meta && meta.freshExcluded > 0
    ? ` · ${meta.freshExcluded} video${meta.freshExcluded === 1 ? "" : "s"} skipped (too fresh to judge)`
    : "";
  return (
    <div className="rounded-[10px] border border-zinc-200/80 bg-white p-3.5 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 cursor-help"
           title="How each lane is performing, scored mostly on watch-through and shares. Recent weeks count more than older ones. Tells you what to post more or less of next cycle.">
          Next week · lane weighting
        </p>
        {meta && (
          <span className="text-[10px] text-zinc-400 truncate" title={blendNote + freshNote}>
            {meta.weeksUsed > 1 ? `last ${meta.weeksUsed} weeks` : "this week only"}{freshNote}
          </span>
        )}
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {weighting.map((w) => {
          // Graduated lanes are full rotation members — no longer "on trial".
          const onTrial = PROPOSED_LANES.includes(w.lane) && !rotationLanes.includes(w.lane);
          const t = onTrial ? { bg: "#eef2ff", fg: "#3b4cc0", label: "On trial" } : tone(w.recommendation);
          return (
            <div key={w.lane} className="flex items-center gap-2 rounded-[7px] px-2.5 py-2"
                 style={{ background: "#faf9f7", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.05)" }}>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-zinc-800">{w.lane}</span>
                <span className="text-[10px] text-zinc-400">{w.videoCount} video{w.videoCount === 1 ? "" : "s"}{onTrial ? " · not in the rotation — see Trial lanes" : ""}</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[5px] shrink-0"
                    style={{ background: t.bg, color: t.fg }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Proposed next-week split ────────────────────────────────────────────────────
// Turns the lane weighting into an actual slot allocation for next week's Shorts
// (sums to the cycle count). This is the concrete plan you approve — winners get
// more slots, a floor keeps every lane alive, a cap stops any lane taking over.
function AllocationPanel({ allocation, onApply, applying, appliedMsg }: {
  allocation: LaneAllocation[];
  onApply: () => void;
  applying: boolean;
  appliedMsg: string | null;
}) {
  if (!allocation.length) return null;
  const total = allocation.reduce((s, a) => s + a.slots, 0);
  return (
    <div className="rounded-[10px] border-2 border-emerald-200 bg-white p-3.5 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 cursor-help"
           title="Your 7 proven lanes, one each by default. If one lane clearly out-performs another (blended over recent weeks), it earns a 2nd slot and the weakest lane rests for one cycle, then returns. One-off never takes the extra slot; too-fresh videos don't count. Apply to set these lanes on the next cycle.">
          Proposed next cycle · {total} Shorts
        </p>
        <button type="button" onClick={onApply} disabled={applying}
                title="Set these lanes on next cycle\u2019s calendar. You can still change any slot."
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[6px] text-[11.5px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-60">
          {applying ? "Applying…" : "Apply to calendar"}
        </button>
      </div>
      <div className="space-y-1.5">
        {allocation.map((a) => (
          <div key={a.lane} className={`flex items-center gap-2.5 ${a.slots === 0 ? "opacity-55" : ""}`}>
            <span className="text-[12.5px] font-semibold text-zinc-800 w-[150px] shrink-0 truncate">{a.lane}</span>
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "#f1efe8" }}>
              <div className="h-full rounded-full" style={{ width: `${a.sharePct}%`, background: a.slots >= 2 ? "#0a6b43" : "#0f8c5f" }} />
            </div>
            <span className="text-[12px] font-semibold text-zinc-700 tabular-nums w-[88px] text-right shrink-0">
              {a.slots === 0 ? "resting" : `${a.slots} slot${a.slots === 1 ? "" : "s"}`}
            </span>
          </div>
        ))}
      </div>
      {appliedMsg ? (
        <p className="mt-2.5 text-[11px] leading-5 font-medium text-emerald-700">{appliedMsg}</p>
      ) : (
        <p className="mt-2.5 text-[11px] leading-5 text-zinc-500">
          Apply to write these lanes onto the next cycle — {allocation.filter((a) => a.slots > 0).map((a) => `${a.slots} ${a.lane}`).join(", ")}.
        </p>
      )}
    </div>
  );
}

// ── Video row ──────────────────────────────────────────────────────────────────
function VideoRow({ v, onChange, onRemove }: {
  v: VideoPerf; onChange: (patch: Partial<VideoPerf>) => void; onRemove: () => void;
}) {
  const numCls = "w-full h-8 px-2 rounded-[6px] bg-[#faf9f7] text-[12px] text-right tabular-nums text-zinc-900 outline-none focus:shadow-[inset_0_0_0_1px_#0a0a0a]";
  const measuredLocal = Boolean(v.views || v.watchPct || v.likes || v.comments || v.shares);
  return (
    <div className="rounded-[9px] border border-zinc-200/70 bg-white p-2.5 shadow-[0_1px_0_rgba(15,15,15,0.02)]">
      <div className="flex items-center gap-2 mb-2">
        {/* Verdict badge (computed once metrics are entered) — the decision, no number. */}
        {v.bucket && (
          <span className="inline-flex items-center h-8 px-2.5 rounded-[6px] text-[11px] font-semibold shrink-0 cursor-help"
                title="A 0\u2013100 score from this video\u2019s watch-through, shares and engagement, ranked against the week\u2019s others. Your verdict overrides it."
                style={{ background: BUCKET_STYLE[v.bucket].bg, color: BUCKET_STYLE[v.bucket].fg }}>
            {BUCKET_STYLE[v.bucket].label}
          </span>
        )}
        <input
          value={v.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Video title"
          className="flex-1 h-8 px-2.5 rounded-[6px] bg-[#faf9f7] text-[12.5px] font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:shadow-[inset_0_0_0_1px_#0a0a0a]"
        />
        <select value={v.lane} onChange={(e) => onChange({ lane: e.target.value as FormatLane })}
                className="h-8 px-2 rounded-[6px] bg-[#faf9f7] text-[12px] text-zinc-700 outline-none focus:shadow-[inset_0_0_0_1px_#0a0a0a]">
          <option value="">Lane…</option>
          {LANE_OPTS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button type="button" onClick={onRemove} title="Remove video"
                className="w-8 h-8 grid place-items-center rounded-[6px] text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
          <Trash />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-2">
        <label className="block"><span className="block text-[9.5px] text-zinc-400 mb-0.5 pl-0.5">Views</span>
          <input type="number" min={0} value={v.views || ""} onChange={(e) => onChange({ views: Number(e.target.value) })} className={numCls} /></label>
        <label className="block"><span className="block text-[9.5px] text-zinc-400 mb-0.5 pl-0.5" title="Watch-through %">Watch %</span>
          <input type="number" min={0} max={100} value={v.watchPct || ""} onChange={(e) => onChange({ watchPct: Number(e.target.value) })} className={numCls} /></label>
        <label className="block"><span className="block text-[9.5px] text-zinc-400 mb-0.5 pl-0.5">Likes</span>
          <input type="number" min={0} value={v.likes || ""} onChange={(e) => onChange({ likes: Number(e.target.value) })} className={numCls} /></label>
        <label className="block"><span className="block text-[9.5px] text-zinc-400 mb-0.5 pl-0.5">Comments</span>
          <input type="number" min={0} value={v.comments || ""} onChange={(e) => onChange({ comments: Number(e.target.value) })} className={numCls} /></label>
        <label className="block"><span className="block text-[9.5px] text-zinc-400 mb-0.5 pl-0.5">Shares</span>
          <input type="number" min={0} value={v.shares || ""} onChange={(e) => onChange({ shares: Number(e.target.value) })} className={numCls} /></label>
      </div>

      {!measuredLocal ? (
        <p className="mb-2 text-[10.5px] leading-4 text-zinc-400">Enter at least one metric (views, watch %, likes…) so this video counts toward its lane's score. Until then it's ignored — blank rows don't drag a lane down.</p>
      ) : v.tooFresh ? (
        <p className="mb-2 text-[10.5px] leading-4 text-amber-600">Posted very recently — it may not have had a fair chance yet. Its score still counts, but read it with caution.</p>
      ) : null}

      <div className="flex items-center gap-1.5 flex-wrap">
        {VERDICT_OPTS.map((opt) => (
          <button key={opt.value} type="button"
                  onClick={() => onChange({ verdict: v.verdict === opt.value ? "" : opt.value })}
                  className={`text-[10.5px] font-semibold px-2 py-1 rounded-[5px] transition-colors ${v.verdict === opt.value ? opt.cls : "bg-zinc-50 text-zinc-400 hover:text-zinc-700"}`}>
            {opt.label}
          </button>
        ))}
        <input
          value={v.note}
          onChange={(e) => onChange({ note: e.target.value })}
          placeholder="Why did it land / flop?"
          className="flex-1 min-w-[140px] h-7 px-2 rounded-[6px] bg-[#faf9f7] text-[11.5px] text-zinc-700 outline-none placeholder:text-zinc-400 focus:shadow-[inset_0_0_0_1px_#0a0a0a]"
        />
      </div>
    </div>
  );
}

// ── Main view ───────────────────────────────────────────────────────────────────
export default function RetroView() {
  // Default to last week's Monday — you review the week that just ended.
  const [weekStart, setWeekStart] = useState(() => mondayOf(addDaysISO(todayLocalISO(), -7)));
  const [retro, setRetro] = useState<RetroWeek | null>(null);
  const [videos, setVideos] = useState<VideoPerf[]>([]);
  const [learnings, setLearnings] = useState("");
  const [nextWeekPlan, setNextWeekPlan] = useState("");
  const [history, setHistory] = useState<RetroWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const saveTimer = useRef<number | null>(null);
  const lastSaved = useRef<string>("");
  // Holds the newest dirty payload so it can be flushed on unmount / week change.
  const pendingRef = useRef<{ weekStart: string; videos: VideoPerf[]; learnings: string; nextWeekPlan: string; snapshot: string } | null>(null);
  const flushingRef = useRef(false);

  const load = useCallback(async (ws: string) => {
    setLoading(true); setError(null);
    try {
      const [doc, all, settings] = await Promise.all([
        getRetro(ws), listRetros(),
        getSettings().catch(() => null), // non-fatal — rotation falls back to canonical
      ]);
      setRetro(doc);
      setVideos(doc?.videos ?? []);
      setLearnings(doc?.learnings ?? "");
      setNextWeekPlan(doc?.nextWeekPlan ?? "");
      setHistory(all);
      const rot = settings?.rotationLanes?.length === 7 ? settings.rotationLanes : CORE_LANES;
      setRotation(rot);
      installRotation(rot); // keep calendar cycle-defaults in sync for this session
      lastSaved.current = JSON.stringify({ videos: doc?.videos ?? [], learnings: doc?.learnings ?? "", nextWeekPlan: doc?.nextWeekPlan ?? "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load retros");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(weekStart); }, [load, weekStart]);

  // Revalidate on focus so edits from another device show up — but skip it while
  // a local autosave is still pending, to avoid overwriting unsaved changes.
  useEffect(() => {
    const maybeReload = () => {
      if (pendingRef.current) return;        // unsaved edits in flight — don't clobber
      if (saveTimer.current !== null) return; // debounce armed — wait for it to settle
      void load(weekStart);
    };
    const onFocus = () => maybeReload();
    const onVis = () => { if (document.visibilityState === "visible") maybeReload(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load, weekStart]);

  // Performs the actual upsert of whatever is staged in pendingRef. Keeps the
  // payload dirty + surfaces an error if it fails so it retries on next change.
  const flushSave = useCallback(async () => {
    const p = pendingRef.current;
    if (!p || flushingRef.current) return;
    flushingRef.current = true;
    setSaving(true);
    try {
      const saved = await upsertRetro({
        weekStart: p.weekStart, videos: p.videos, learnings: p.learnings, nextWeekPlan: p.nextWeekPlan,
      });
      setRetro(saved);
      if (pendingRef.current && pendingRef.current.snapshot === p.snapshot) {
        lastSaved.current = p.snapshot;
        pendingRef.current = null;
      }
      setHistory((prev) => {
        const others = prev.filter((r) => r.weekStart !== saved.weekStart);
        return [saved, ...others].sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1));
      });
    } catch (err) {
      // Leave pendingRef dirty so a later edit / week change retries it.
      setError(err instanceof Error ? `Couldn't save retro — will retry. (${err.message})` : "Couldn't save retro — will retry.");
    } finally {
      setSaving(false);
      flushingRef.current = false;
    }
  }, []);

  // Debounced autosave (1.2s) — backend is source of truth. Flushes on unmount /
  // week change so an edit made just before leaving isn't dropped.
  useEffect(() => {
    if (loading) return;
    const snapshot = JSON.stringify({ videos, learnings, nextWeekPlan });
    if (snapshot === lastSaved.current) return;
    pendingRef.current = { weekStart, videos, learnings, nextWeekPlan, snapshot };
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => { void flushSave(); }, 1200);
    return () => {
      if (saveTimer.current !== null) { window.clearTimeout(saveTimer.current); saveTimer.current = null; }
      if (pendingRef.current) void flushSave();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos, learnings, nextWeekPlan]);

  // Best-effort flush when the tab is closing/hidden.
  useEffect(() => {
    const onUnload = () => {
      const p = pendingRef.current;
      if (!p) return;
      const url  = `${import.meta.env.VITE_API_URL ?? "/api"}/retro`;
      const body = JSON.stringify({ weekStart: p.weekStart, videos: p.videos, learnings: p.learnings, nextWeekPlan: p.nextWeekPlan });
      try {
        if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
        else void fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body, keepalive: true });
      } catch { /* best effort */ }
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  const updateVideo = (i: number, patch: Partial<VideoPerf>) =>
    setVideos((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const removeVideo = (i: number) => setVideos((prev) => prev.filter((_, idx) => idx !== i));
  const addVideo = () => setVideos((prev) => [...prev, emptyVideo()]);

  // Pull the videos you marked "posted" on the calendar for this week and pre-fill
  // rows (title, lane, platform, posted date). Metrics stay blank for you to enter.
  // Deduped against rows already present so re-running is safe.
  const importFromCalendar = async () => {
    setImporting(true); setImportMsg(null);
    try {
      const weekEnd = addDaysISO(weekStart, 6);
      const entries = await listSchedule(weekStart, weekEnd);
      // A reviewable "video" = a posted slot that is an actual video (Short / reel),
      // not a text post (LinkedIn / X). Keep YouTube + Instagram video slots.
      const isVideoSlot = (e: ScheduleEntry) =>
        e.status === "posted" &&
        (e.platform === "youtube" || e.platform === "instagram") &&
        (e.slotKey.includes("short") || e.slotKey.includes("reel") || e.slotKey.includes("instagram") || e.platform === "youtube");

      const posted = entries.filter(isVideoSlot);
      if (posted.length === 0) {
        setImportMsg("No posted videos found on the calendar for this week. Mark Shorts/Reels as posted there first.");
        setImporting(false);
        return;
      }

      setVideos((prev) => {
        // A calendar slot's true identity is date+platform+slotKey, so two distinct
        // posts on the same day (even both untitled) never collapse into one. We
        // also guard against re-importing a row already present by matching on the
        // human-visible identity (date+platform+title) of existing rows.
        const existing = new Set(
          prev.map((v) => `${v.postedDate}|${v.platform}|${v.title.trim().toLowerCase()}`),
        );
        const seenSlots = new Set<string>();
        const additions: VideoPerf[] = [];
        for (const e of posted) {
          const slotId = `${e.date}|${e.platform}|${e.slotKey}`;
          if (seenSlots.has(slotId)) continue; // same slot appeared twice in the range
          seenSlots.add(slotId);

          const title = (e.ideaTitle || "").trim();
          // Only skip when this exact (date, platform, title) is already a row AND
          // the title is non-empty — untitled posts are kept as separate rows.
          const existKey = `${e.date}|${e.platform}|${title.toLowerCase()}`;
          if (title && existing.has(existKey)) continue;
          existing.add(existKey);

          additions.push({
            ...emptyVideo(),
            title: title || "(untitled posted video)",
            lane: (e.laneAtAssign as FormatLane) || "",
            platform: e.platform,
            postedDate: e.date,
          });
        }
        if (additions.length === 0) {
          setImportMsg("Already up to date — every posted video for this week is already in the list.");
          return prev;
        }
        setImportMsg(`Imported ${additions.length} video${additions.length === 1 ? "" : "s"} from the calendar. Add their metrics below.`);
        return [...prev, ...additions];
      });
    } catch (err) {
      setImportMsg(err instanceof Error ? err.message : "Failed to import from calendar");
    } finally {
      setImporting(false);
    }
  };

  const weighting = retro?.weighting ?? [];
  const allocation = retro?.allocation ?? [];

  // Apply the proposed split onto the NEXT cycle's calendar.
  const [applying, setApplying] = useState(false);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Live lane rotation (graduation): canonical 7 unless a trial lane swapped in.
  const [rotation, setRotation] = useState<string[]>([...CORE_LANES]);
  const [swapBusy, setSwapBusy] = useState(false);
  const [swapMsg, setSwapMsg] = useState<string | null>(null);
  const swapRotation = async (laneIn: string, laneOut: string) => {
    setSwapBusy(true); setSwapMsg(null);
    try {
      const next = rotation.map((l) => (l === laneOut ? laneIn : l));
      const saved = await updateSettings({ rotationLanes: next });
      setRotation(saved.rotationLanes);
      installRotation(saved.rotationLanes);
      setSwapMsg(`Done — ${laneIn} is now in the weekly plan, replacing ${laneOut}. The calendar's default slots and future retro allocations follow it from now on.`);
      void load(weekStart); // refresh weighting/allocation under the new rotation
    } catch (err) {
      setSwapMsg(err instanceof Error ? `Could not update the plan: ${err.message}` : "Could not update the plan.");
    } finally {
      setSwapBusy(false);
    }
  };
  const applyToCalendar = async () => {
    if (!allocation.length) return;
    setApplying(true); setAppliedMsg(null);
    try {
      // The reviewed week belongs to a cycle; the plan applies to the FOLLOWING
      // cycle (the next one that hasn't started). A cycle is 2 weeks (14 days).
      const thisCycleStart = cycleStartMondayOf(weekStart);
      let targetCycle = addDaysISO(thisCycleStart, 14);

      // Stale-retro guard: never write a plan onto a cycle that has already
      // started — that would silently rewrite calendar history. Reviewing an old
      // week applies forward, to the next cycle that hasn't begun yet.
      const currentCycle = cycleStartMondayOf(todayLocalISO());
      let bumped = false;
      if (targetCycle <= currentCycle) {
        targetCycle = addDaysISO(currentCycle, 14);
        bumped = true;
      }

      // Overwrite guard: this cycle may already hold a plan applied from another
      // retro week (Week A vs Week B of the same cycle target the same date).
      const existing = await getLanePlan(targetCycle);
      if (existing && existing.sourceRetroWeek && existing.sourceRetroWeek !== weekStart) {
        const ok = window.confirm(
          `That cycle already has a lane plan applied from the ${weekLabel(existing.sourceRetroWeek)} retro.\n\nReplace it with this week's plan?`
        );
        if (!ok) { setAppliedMsg("Kept the existing plan — nothing was changed."); return; }
      }

      const lanes = expandAllocationToLanes(allocation, 7);
      await upsertLanePlan({ cycleStart: targetCycle, lanes, sourceRetroWeek: weekStart });
      const human = parseISODate(targetCycle);
      setAppliedMsg(
        `Applied to the cycle starting ${MONTHS[human.getUTCMonth()]} ${human.getUTCDate()}` +
        (bumped ? " (this retro is older, so it was applied to the next upcoming cycle)" : "") +
        " — open the Calendar to see the new lanes."
      );
    } catch (err) {
      setAppliedMsg(err instanceof Error ? `Could not apply: ${err.message}` : "Could not apply the plan.");
    } finally {
      setApplying(false);
    }
  };
  const isThisOrFuture = weekStart >= mondayOf(todayLocalISO());
  // Week prev/next keeps this scroll container alive — reset it to the top.
  const pageScrollRef = useScrollTopOn(weekStart);

  return (
    <div ref={pageScrollRef} className="h-full overflow-y-auto" style={{ background: "#faf9f7" }}>
      <div className="mx-auto max-w-[1180px] px-4 sm:px-7 pt-4 pb-8 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-semibold leading-[1.08] tracking-[-0.03em] text-zinc-950">Weekly Retro</h1>
            <p className="text-[12px] text-zinc-500 mt-0.5">Review a finished week's videos to set the next cycle's lane plan.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <HowItWorksButton onOpen={() => setShowHowItWorks(true)} />
            <span className="text-[11px] text-zinc-400 h-6 inline-flex items-center">
              {saving
                ? "Saving…"
                : (retro && (videos.length > 0 || learnings.trim() || nextWeekPlan.trim()))
                  ? "Saved"
                  : "Empty — nothing to save yet"}
            </span>
          </div>
        </div>
        <HowItWorksModal open={showHowItWorks} onClose={() => setShowHowItWorks(false)} />

        {/* Week toolbar */}
        <div className="flex items-center gap-2 rounded-[10px] border border-zinc-200/80 bg-white px-3 py-2 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
          <button type="button" onClick={() => setWeekStart((w) => addDaysISO(w, -7))} title="Previous week"
                  className="w-8 h-8 grid place-items-center rounded-[7px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"><ChevL /></button>
          <button type="button" onClick={() => setWeekStart(mondayOf(addDaysISO(todayLocalISO(), -7)))} title="Jump to last week"
                  className="h-8 px-3 rounded-[7px] text-[12px] font-medium text-zinc-700 hover:bg-zinc-100 transition-colors">Last week</button>
          <button type="button" onClick={() => setWeekStart((w) => addDaysISO(w, 7))} title="Next week"
                  className="w-8 h-8 grid place-items-center rounded-[7px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"><ChevR /></button>
          <span className="ml-1 text-[13px] font-semibold text-zinc-800">{weekLabel(weekStart)}</span>
          {isThisOrFuture && (
            <span className="text-[10.5px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-[5px] cursor-help"
                  title="This week isn\u2019t finished yet \u2014 retros work best once a week is over.">Not finished yet</span>
          )}

        </div>

        {error && (
          <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700">
            {error} — is the backend running? <code className="bg-rose-100 px-1 rounded">cd server &amp;&amp; npm run dev</code>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "#d3501c", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">

            {/* Lane weighting */}
            <motion.div variants={fadeUpItem}><WeightingPanel weighting={weighting} meta={retro?.weightingMeta} rotationLanes={rotation} /></motion.div>

            {/* The concrete plan you approve: how to split next week's Shorts. */}
            {allocation.length > 0 && (
              <motion.div variants={fadeUpItem}><AllocationPanel allocation={allocation} onApply={() => void applyToCalendar()} applying={applying} appliedMsg={appliedMsg} /></motion.div>
            )}

            {/* Proposed-lane probation: graduation status vs the channel median. */}
            <motion.div variants={fadeUpItem}>
              <ProbationPanel history={history} rotationLanes={rotation}
                              onSwap={(laneIn, laneOut) => void swapRotation(laneIn, laneOut)}
                              swapBusy={swapBusy} swapMsg={swapMsg} />
            </motion.div>

            {/* Videos */}
            <motion.div variants={fadeUpItem} className="rounded-[10px] border border-zinc-200/80 bg-white p-3.5 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
              <div className="flex items-center justify-between mb-2.5 gap-2 flex-wrap">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Videos this week</p>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => void importFromCalendar()} disabled={importing}
                          title="Pull in the videos you marked posted on the calendar this week"
                          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[6px] text-[11.5px] font-medium text-zinc-700 border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors disabled:opacity-60">
                    <Download /> {importing ? "Importing…" : "Import from calendar"}
                  </button>
                  <button type="button" onClick={addVideo}
                          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[6px] text-[11.5px] font-medium text-white bg-zinc-950 hover:bg-zinc-800 transition-colors">
                    <Plus /> Add video
                  </button>
                </div>
              </div>
              {importMsg && (
                <div className="mb-2.5 rounded-[7px] bg-[#faf9f7] px-2.5 py-1.5 text-[11.5px] text-zinc-600" style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.05)" }}>
                  {importMsg}
                </div>
              )}
              {videos.length === 0 ? (
                <div className="py-8 text-center text-[12px] text-zinc-500">
                  No videos yet — use <span className="font-medium text-zinc-700">Import from calendar</span> above to pull this week's posted videos, or <span className="font-medium text-zinc-700">Add video</span> to enter one manually.
                </div>
              ) : (
                <div className="space-y-2">
                  {videos.map((v, i) => (
                    <VideoRow key={i} v={v} onChange={(p) => updateVideo(i, p)} onRemove={() => removeVideo(i)} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Single action note — the only takeaway that drives next week. */}
            <motion.div variants={fadeUpItem}>
              <div className="rounded-[10px] border border-zinc-200/80 bg-white p-3.5 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">What to do next week</p>
                <textarea value={nextWeekPlan} onChange={(e) => setNextWeekPlan(e.target.value)} rows={4}
                          placeholder="Post more of… · pull back on… · topics/formats to repeat · experiments to stop"
                          className="w-full resize-y rounded-[7px] bg-[#faf9f7] p-2.5 text-[12.5px] leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-400 focus:shadow-[inset_0_0_0_1px_#0a0a0a]" />
              </div>
            </motion.div>

            {/* History */}
            {history.length > 0 && (
              <motion.div variants={fadeUpItem} className="rounded-[10px] border border-zinc-200/80 bg-white p-3.5 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-2.5">Past retros</p>
                <div className="space-y-1">
                  {history.map((r) => {
                    const top = r.weighting.find((w) => w.recommendation === "more");
                    const active = r.weekStart === weekStart;
                    return (
                      <button key={r.weekStart} type="button" onClick={() => setWeekStart(r.weekStart)}
                              className={`flex w-full items-center gap-2 rounded-[7px] px-2.5 py-1.5 text-left transition-colors ${active ? "bg-[#f3f2ee]" : "hover:bg-[#faf9f7]"}`}>
                        <span className="text-[12px] font-semibold text-zinc-700 w-[130px] shrink-0">{weekLabel(r.weekStart)}</span>
                        <span className="text-[11px] text-zinc-400">{r.videos.length} video{r.videos.length === 1 ? "" : "s"}</span>
                        {top && <span className="ml-auto text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">↑ {top.lane}</span>}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
