/**
 * Dashboard.tsx — Content Planning
 * One question: which lane should I make the next video for?
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAnalytics,
  type AnalyticsSummary,
  type LaneCoverageEntry,
  type RecentIdeaItem,
} from "../api/ideas";
import { listRetros, type LaneWeighting, type RetroWeek } from "../api/retro";
import { getSettings } from "../api/settings";
import { useScrollTopOn } from "../lib/useScrollTopOn";
import {
  CountUp,
  staggerContainer,
  fadeUpItem,
  popItem,
  tabSwap,
  pillSpring,
  tBar,
  tHeight,
} from "../lib/motion";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_LANES = [
  "Real Reason",
  "Hidden India",
  "Smart Money/Business",
  "Science Lite",
  "Sharp Contradiction",
  "Viral Social Commentary",
  "One-off",
  "Forgotten Inventor",
  "Quiet Monopoly",
  "Status Game",
];

// Proposed lanes (not yet canonical in FORMAT_LANES.md): opportunistic, not part of
// the weekly rotation. They are valid to tag, but stay OUT of coverage urgency until
// an idea actually uses one — so they never permanently drag the coverage ratio,
// clutter "Uncovered lanes", or become "The Pick".
const PROPOSED_LANES = ["Forgotten Inventor", "Quiet Monopoly", "Status Game"];

// Retro nudges go stale: only trust the latest retro if it's within ~2 cycles
// (28 days). An old "post more X" hint shouldn't keep steering the Dashboard.
const STALE_RETRO_DAYS = 28;
function freshWeighting(retros: RetroWeek[]): LaneWeighting[] {
  const latest = retros[0];
  if (!latest?.weekStart) return [];
  const ageDays = (Date.now() - new Date(latest.weekStart + "T00:00:00Z").getTime()) / 86_400_000;
  return ageDays > STALE_RETRO_DAYS ? [] : (latest.weighting ?? []);
}

const LANE_COLOR: Record<string, string> = {
  "Real Reason":             "#1e6fdc",
  "Hidden India":            "#c84a14",
  "Smart Money/Business":    "#0f8c5f",
  "Science Lite":            "#6f43c5",
  "Sharp Contradiction":     "#b3261e",
  "Viral Social Commentary": "#c47e00",
  "One-off":                 "#5a5a5a",
  "Forgotten Inventor":      "#0e7c86",
  "Quiet Monopoly":          "#3b4cc0",
  "Status Game":             "#b5258f",
};

const LANE_BG: Record<string, string> = {
  "Real Reason":             "#eaf2fc",
  "Hidden India":            "#fcefe6",
  "Smart Money/Business":    "#e7f6ee",
  "Science Lite":            "#f1edfa",
  "Sharp Contradiction":     "#fbe9e6",
  "Viral Social Commentary": "#fdf3dc",
  "One-off":                 "#efede7",
  "Forgotten Inventor":      "#e2f4f6",
  "Quiet Monopoly":          "#e9ebfb",
  "Status Game":             "#fbe9f5",
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function Ico({ d, size = 13, stroke = 1.6 }: {
  d: React.ReactNode; size?: number; stroke?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}
const RefreshIcon  = (p: { size?: number }) => <Ico {...p} d={<path d="M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5"/>}/>;
const ArrowRight   = (p: { size?: number }) => <Ico {...p} d={<path d="M5 12h14M13 6l6 6-6 6"/>}/>;
const SparkleIcon  = (p: { size?: number }) => <Ico {...p} d={<><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></>} stroke={1.8}/>;
const VideoIcon    = (p: { size?: number }) => <Ico {...p} d={<><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></>}/>;
const DocumentIcon  = (p: { size?: number }) => <Ico {...p} d={<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>}/>;
const PipelineIcon = (p: { size?: number }) => <Ico {...p} d={<path d="M4 20V10M10 20V4M16 20v-7M22 20v-4"/>}/>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1)  return "today";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ── Lane scoring ──────────────────────────────────────────────────────────────
// Lower score = more urgent to make a video for

function laneScore(e: LaneCoverageEntry): number {
  // Each video made adds 10 points of "covered-ness"
  // Each idea already in pipeline reduces urgency by 1 (they're being addressed)
  return e.production * 10 - Math.min(e.inPipeline, 3);
}

function lanePriority(e: LaneCoverageEntry, maxVideos: number): "urgent" | "low" | "healthy" {
  if (e.production === 0)                                        return "urgent";
  if (maxVideos > 1 && e.production < Math.ceil(maxVideos / 2)) return "low";
  return "healthy";
}

function buildPriorityReason(e: LaneCoverageEntry, maxVideos: number): string {
  if (e.production === 0 && e.inPipeline === 0) return "No videos yet";
  if (e.production === 0 && e.inPipeline > 0)  return `No videos yet · ${e.inPipeline} in pipeline`;
  if (maxVideos > 1 && e.production < Math.ceil(maxVideos / 2)) return `${e.production} finalised video${e.production !== 1 ? "s" : ""} — under-covered`;
  return `${e.production} finalised video${e.production > 1 ? "s" : ""}`;
}

function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
  action,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "green" | "rose";
  action?: string;
}) {
  const toneClass = {
    neutral: "text-zinc-950",
    green: "text-emerald-700",
    rose: "text-rose-600",
  }[tone];

  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={{ y: -2 }}
      transition={pillSpring}
      className="rounded-[8px] border border-zinc-200/80 bg-white px-3.5 py-2.5 shadow-[0_1px_0_rgba(15,15,15,0.03)] transition-shadow hover:border-zinc-300 hover:shadow-[0_8px_22px_-12px_rgba(15,15,15,0.28)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{label}</p>
        {action && <span className="text-[10.5px] font-medium text-zinc-400">{action}</span>}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <CountUp value={value} className={`text-[22px] font-semibold leading-none tracking-[-0.04em] ${toneClass}`} />
        <span className="text-[11px] text-zinc-500">{detail}</span>
      </div>
    </motion.div>
  );
}

// ── THE PICK ─────────────────────────────────────────────────────────────────

function ThePick({
  pick,
  onGoIdeas,
  hasIdeas,
  maxVideos,
  isLongform = false,
  retroRec = {},
}: {
  pick: LaneCoverageEntry | null;
  onGoIdeas: (lane?: string) => void;
  hasIdeas: boolean;
  maxVideos: number;
  isLongform?: boolean;
  retroRec?: Record<string, "more" | "steady" | "less">;
}) {
  if (!pick) {
    return (
      <div className="rounded-[12px] border border-dashed border-zinc-300 bg-white px-5 py-5">
        <p className="text-[12px] font-medium text-zinc-800">
          {hasIdeas ? "No lane recommendation yet" : "No recommendation yet"}
        </p>
        <p className="mt-1 text-[12px] text-zinc-500">
          {hasIdeas
            ? "Assign format lanes to active ideas so coverage can be compared."
            : "Add ideas to start tracking lane coverage."}
        </p>
        {hasIdeas && (
          <button
            onClick={() => onGoIdeas()}
            className="motion-press mt-4 inline-flex h-8 items-center justify-center gap-2 rounded-[7px] bg-zinc-950 px-3 text-[12px] font-semibold text-white transition hover:bg-zinc-800"
          >
            Review ideas <ArrowRight size={12} />
          </button>
        )}
      </div>
    );
  }

  const color = LANE_COLOR[pick.lane] ?? "#9a9a9a";
  const bg    = LANE_BG[pick.lane] ?? "#f3f2ee";
  const reason = buildPriorityReason(pick, maxVideos);
  const actionLabel = isLongform
    ? (pick.production > 0 ? `View ${pick.lane} full-forms` : `Create first ${pick.lane} full-form`)
    : (pick.production > 0 ? `View ${pick.lane} videos` : `Create first ${pick.lane} idea`);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[10px] border border-zinc-200/80 bg-white shadow-[0_1px_0_rgba(15,15,15,0.03)]">
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
      <div className="p-4 pl-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="motion-pulse-soft grid h-6 w-6 place-items-center rounded-full" style={{ background: bg, color }}>
              <SparkleIcon size={12} />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Next action
            </span>
          </div>

          <div>
            <p className="text-[11px] font-medium text-zinc-400 mb-0.5">
              {isLongform ? "Next full-form" : "Next video"}
            </p>
            <h2 className="text-[22px] font-bold leading-[1.1] tracking-[-0.04em] text-zinc-950 flex flex-wrap items-baseline gap-x-2">
              <span>for</span>
              <span className="rounded-[5px] px-1.5 py-0.5" style={{ background: bg, color }}>{pick.lane}</span>
            </h2>
          </div>
          {pick.production === 0 ? (
            <p className="mt-1.5 text-[12px] leading-5 text-zinc-500">
              {isLongform ? "Highest-priority lane with no full-form content yet." : "Highest-priority uncovered lane — no finalised videos yet."}
            </p>
          ) : (
            <>
              <p className="mt-1.5 text-[12px] leading-5 text-zinc-500">{reason}</p>
              {pick.production < maxVideos && maxVideos > 1 && (
                <p className="mt-1 text-[11px] leading-5 text-zinc-400">
                  Fewest finalised videos relative to other lanes.
                </p>
              )}
              {/* Cross-view sync: reinforce (or caveat) with last retro's verdict. */}
              {retroRec[pick.lane] === "more" && (
                <p className="mt-1 text-[11px] leading-5 font-medium text-emerald-700">
                  ↑ Last retro said post more of this lane — it's performing.
                </p>
              )}
              {retroRec[pick.lane] === "less" && (
                <p className="mt-1 text-[11px] leading-5 font-medium text-amber-700">
                  Note: last retro flagged this lane to pull back — covering it, but keep an eye on performance.
                </p>
              )}
            </>
          )}

          {(pick.production > 0 || pick.inPipeline > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pick.production > 0 && (
                <span className="rounded-full px-2.5 py-1 text-[10.5px] font-medium" style={{ background: bg, color }}>
                  {pick.production} {isLongform ? "full-form" : "finalised"}
                </span>
              )}
              {pick.inPipeline > 0 && (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10.5px] font-medium text-zinc-600">
                  {pick.inPipeline} in pipeline
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => onGoIdeas()}
          className="group motion-press mt-4 inline-flex h-8 items-center justify-center gap-2 rounded-[7px] px-3 text-[12px] font-semibold text-white transition hover:opacity-90"
          style={{ background: "#d3501c", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }}
        >
          {actionLabel}
          <span className="transition-transform duration-200 group-hover:translate-x-0.5"><ArrowRight size={12} /></span>
        </button>
      </div>
    </div>
  );
}

// ── Distribution Bar (all lanes stacked) ─────────────────────────────────────

function DistributionBar({ rows }: { rows: LaneCoverageEntry[] }) {
  const totalVideos = rows.reduce((s, r) => s + r.production, 0);
  if (totalVideos === 0) return (
    <p className="text-[12px] text-zinc-500">No finalised ideas across any lane yet.</p>
  );

  const totalLanes = rows.length;
  const coveredLanes = rows.filter(r => r.production > 0).length;
  const coverageRatio = totalLanes > 0 ? (coveredLanes / totalLanes) * 100 : 0;

  return (
    <div>
      {/* Outer track: full width grey. Inner fill: only covers the % of lanes that have videos. */}
      <div className="mb-3 relative h-2.5 overflow-hidden rounded-full bg-zinc-200">
        <motion.div
          className="absolute inset-y-0 left-0 flex overflow-hidden rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${coverageRatio}%` }}
          transition={tBar}
        >
          {rows
            .filter(r => r.production > 0)
            .map(r => {
              const pct   = (r.production / totalVideos) * 100;
              const color = LANE_COLOR[r.lane] ?? "#9a9a9a";
              return (
                <div
                  key={r.lane}
                  title={`${r.lane}: ${r.production} finalised`}
                  style={{ width: `${pct}%`, background: color, minWidth: 3 }}
                />
              );
            })}
        </motion.div>
      </div>

      <div className="motion-stagger-fast flex flex-wrap gap-x-4 gap-y-2">
        {rows.filter(r => r.production > 0).map(r => {
          const pct   = Math.round((r.production / totalVideos) * 100);
          const color = LANE_COLOR[r.lane] ?? "#9a9a9a";
          return (
            <div key={r.lane} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-[10.5px] text-zinc-600">{r.lane}</span>
              <span className="text-[10px] text-zinc-400 font-mono">{r.production} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DistributionPanel({ rows, isLongform = false }: { rows: LaneCoverageEntry[]; isLongform?: boolean }) {
  const totalVideos = rows.reduce((s, r) => s + r.production, 0);
  const uncoveredLanes = rows.filter(r => r.production === 0).map(r => r.lane);
  return (
    <div className="flex h-full flex-col rounded-[10px] border border-zinc-200/80 bg-white p-4 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Coverage mix</p>
          <p className="mt-0.5 text-[11.5px] text-zinc-500">
            {rows.filter(r => r.production > 0).length}/{rows.length} lanes covered · {totalVideos} {isLongform ? "full-form " : ""}video{totalVideos !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <DistributionBar rows={rows} />
      {uncoveredLanes.length > 0 && (
        <div className="mt-3 border-t border-zinc-100 pt-3">
          <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Uncovered lanes</p>
          <div className="flex flex-wrap gap-1.5">
            {uncoveredLanes.map(lane => (
              <span key={lane} className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {lane}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecentFinalised({ ideas, isLongform = false }: { ideas: RecentIdeaItem[]; isLongform?: boolean }) {
  const filtered = isLongform ? ideas.filter(i => i.fullFormVideo) : ideas.filter(i => !i.fullFormVideo);
  if (!ideas.length) return null;
  const visibleIdeas = filtered.slice(0, 3);

  return (
    <div className="flex h-full flex-col rounded-[10px] border border-zinc-200/80 bg-white p-3.5 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Recent finalised</p>
          <p className="mt-0.5 text-[11.5px] text-zinc-500">{isLongform ? "Full-form titles" : "Titles counted in coverage"}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {visibleIdeas.map((idea) => {
          const color = LANE_COLOR[idea.formatLane] ?? "#9a9a9a";
          return (
            <div key={idea._id} className="flex items-start gap-2.5">
              <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[12px] font-medium leading-snug text-zinc-900">{idea.title}</p>
                <p className="mt-0.5 text-[10.5px] text-zinc-400">{idea.formatLane || "No lane"}</p>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length > visibleIdeas.length && (
        <p className="mt-2 text-[10.5px] font-medium text-blue-500 cursor-pointer hover:text-blue-700 transition-colors">
          {isLongform ? "View all full-form ideas →" : "View all finalised ideas →"}
        </p>
      )}
    </div>
  );
}

// ── Lane Priority Table ───────────────────────────────────────────────────────

const PRIORITY_CFG = {
  urgent:  { bg: "#fef3c7", fg: "#92400e", ring: "#fde68a", label: "Needs first video" },
  low:     { bg: "#fff7ed", fg: "#c2410c", ring: "#fed7aa", label: "Under-covered" },
  healthy: { bg: "#e8f7ef", fg: "#0f5132", ring: "#bce8cf", label: "Covered" },
};

function LanePriorityTable({
  rows,
  pickLane,
  laneLastSeen,
  laneTopics,
  maxVideos,
  onGoIdeas,
  isLongform = false,
}: {
  rows: LaneCoverageEntry[];
  pickLane: string | null;
  laneLastSeen: Record<string, string>;
  laneTopics: Record<string, string[]>;
  maxVideos: number;
  onGoIdeas: (lane?: string) => void;
  isLongform?: boolean;
}) {
  const [expandedLane, setExpandedLane] = useState<string | null>(null);
  const sorted = [...rows].sort((a, b) => {
    const pa = lanePriority(a, maxVideos);
    const pb = lanePriority(b, maxVideos);
    const order = { urgent: 0, low: 1, healthy: 2 };
    if (order[pa] !== order[pb]) return order[pa] - order[pb];
    if (a.production !== b.production) return a.production - b.production;
    return b.inPipeline - a.inPipeline;
  });

  return (
    <div className="space-y-2.5">


      {/* Table — 4 columns: Lane · Videos · State · Action */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="overflow-hidden rounded-[10px] border border-zinc-200/80 bg-white shadow-[0_1px_0_rgba(15,15,15,0.03)]"
      >
        {sorted.map((row, idx) => {
          const color    = LANE_COLOR[row.lane] ?? "#9a9a9a";
          const bg       = LANE_BG[row.lane]    ?? "#f5f4f0";
          const priority = lanePriority(row, maxVideos);
          const pcfg     = PRIORITY_CFG[priority];
          const isPick   = row.lane === pickLane;
          const barPct   = maxVideos > 0 ? Math.round((row.production / maxVideos) * 100) : 0;
          const lastSeen = laneLastSeen[row.lane];
          const topics   = laneTopics[row.lane] ?? [];
          const isExpanded = expandedLane === row.lane;
          const isEmpty  = row.production === 0;

          return (
            <motion.div
              key={row.lane}
              variants={fadeUpItem}
              className={`transition-colors ${idx > 0 ? "border-t border-zinc-100" : ""} ${isPick ? "bg-[#f0f6ff] border-l-[3px] border-blue-400" : "bg-white hover:bg-zinc-50/50"}`}
            >
              <div className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_140px] lg:gap-4 lg:items-center">

                {/* Lane name */}
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
                  <h3 className="truncate text-[13.5px] font-bold leading-tight tracking-[-0.02em] text-zinc-950">{row.lane}</h3>
                  {isPick && (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-[#fff0e8] px-2 py-0.5 text-[9.5px] font-semibold text-[#d3501c]">
                      Recommended
                    </span>
                  )}
                </div>

                {/* Videos — bar + count */}
                <div className="hidden lg:flex items-center gap-2.5 min-w-0">
                  <div className={`h-2 flex-1 overflow-hidden rounded-full ${isEmpty ? "bg-zinc-100" : "bg-zinc-200"}`}>
                    {!isEmpty && (
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${barPct}%` }}
                        transition={{ ...tBar, delay: 0.12 }}
                      />
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-[11px]" style={{ minWidth: 60 }}>
                    <span className="font-semibold" style={{ color: isEmpty ? "#d4d4d8" : color }}>{row.production}</span>
                    <span className="text-zinc-300"> video{row.production !== 1 ? "s" : ""}</span>
                  </span>
                </div>

                {/* State — max 2 chips */}
                <div className="hidden lg:flex items-center gap-1.5">
                  <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-[10.5px] font-semibold"
                        style={{ background: pcfg.bg, color: pcfg.fg, boxShadow: `inset 0 0 0 1px ${pcfg.ring}` }}>
                    {isLongform && priority === "urgent" ? "Needs first full-form" : pcfg.label}
                  </span>
                  {/* Secondary: show time for covered, pipeline for urgent */}

                  {row.inPipeline > 0 && isEmpty && (
                    <span className="text-[10.5px] font-medium text-zinc-400">{row.inPipeline} in pipeline</span>
                  )}

                  {/* Expand topics button */}
                  {topics.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandedLane(isExpanded ? null : row.lane)}
                      className="motion-press inline-flex h-6 items-center gap-1 rounded-full bg-zinc-100 px-2 text-[10px] font-medium text-zinc-500 hover:bg-zinc-200 transition-colors"
                    >
                      {isLongform ? <DocumentIcon size={10} /> : <VideoIcon size={10} />} {topics.length}
                      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                           style={{ transform: isExpanded ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Action */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => onGoIdeas(isEmpty ? undefined : row.lane)}
                    className={`motion-press inline-flex h-7 shrink-0 whitespace-nowrap items-center gap-1 rounded-[6px] px-2.5 text-[10.5px] font-semibold transition-colors ${
                      isEmpty
                        ? "bg-[#d3501c] text-white hover:bg-[#bf3f18]"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    {isEmpty ? "Add idea" : "View videos"}
                    <ArrowRight size={9} />
                  </button>
                </div>
              </div>

              {/* Expanded pipeline topics */}
              <AnimatePresence initial={false}>
                {isExpanded && topics.length > 0 && (
                  <motion.div
                    key="topics"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={tHeight}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-zinc-100 px-4 pb-3 pt-2.5">
                      <div className="rounded-[8px] bg-zinc-50 px-3.5 py-2.5">
                        <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-zinc-400">{isLongform ? "Full-form in pipeline" : "In pipeline"}</p>
                        {topics.map((t, i) => (
                          <div key={i} className="flex items-start gap-2 py-0.5 text-[12px] text-zinc-600">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ label, subtitle, children, right }: {
  label: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.025em] text-zinc-950">{label}</h2>
          {subtitle && <p className="text-[11.5px] text-zinc-500">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard({
  onGoIdeas,
}: {
  onGoIdeas: (lane?: string) => void;
  onOpenIdea: (id: string) => void;
}) {
  const [data,    setData]    = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [contentTab, setContentTab] = useState<"shorts" | "longform">("shorts");
  // Tab switches keep this scroll container alive — reset it to the top.
  const pageScrollRef = useScrollTopOn(contentTab);
  // Latest Weekly Retro's lane weighting — the shared signal that links Dashboard,
  // Retro, and Calendar. Lane → "more" | "steady" | "less".
  const [retroWeighting, setRetroWeighting] = useState<LaneWeighting[]>([]);
  // Live lane rotation: a graduated trial lane is a full rotation member here too
  // (counts in coverage urgency / The Pick like any core lane).
  const [rotation, setRotation] = useState<string[]>([]);

  // One load path for both the analytics and the cross-view retro nudges, so the
  // Refresh button (and focus refetch) keep them in sync. `quiet` skips the spinner
  // for background refetches.
  const load = (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");
    Promise.all([getAnalytics(), listRetros().catch(() => [] as RetroWeek[]), getSettings().catch(() => null)])
      .then(([d, retros, settings]) => {
        setData(d);
        setRetroWeighting(freshWeighting(retros));
        setRotation(settings?.rotationLanes ?? []);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => { if (!quiet) setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  // Refetch quietly when the tab regains focus, so actions taken elsewhere (e.g.
  // marking a Short posted on the Calendar) show up without a manual refresh.
  useEffect(() => {
    const onFocus = () => { load(true); };
    const onVis = () => { if (document.visibilityState === "visible") load(true); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Lane → retro recommendation, for quick lookup.
  const retroRec = useMemo<Record<string, "more" | "steady" | "less">>(() => {
    const m: Record<string, "more" | "steady" | "less"> = {};
    for (const w of retroWeighting) m[w.lane] = w.recommendation;
    return m;
  }, [retroWeighting]);

  // Build full rows — for longform tab, treat fullFormVideo count as production
  const rows = useMemo<LaneCoverageEntry[]>(() => {
    if (!data) return [];
    const map: Record<string, LaneCoverageEntry> = {};
    for (const e of data.byLaneCoverage ?? []) map[e.lane] = e;
    return ALL_LANES.map(lane => {
      const base = map[lane] ?? { lane, videoMade: 0, fullFormVideo: 0, fullFormReady: 0, production: 0, inPipeline: 0, draft: 0, total: 0 };
      // Longform tab: count full-form ideas that actually FINISHED the pipeline.
      if (contentTab === "longform") return { ...base, production: base.fullFormReady };
      // Short tab: ready ideas minus the ready full-form ones (only those overlap
      // with `production` — mid-pipeline full-form ideas were never counted, so we
      // must not subtract them).
      return { ...base, production: Math.max(0, base.production - base.fullFormReady) };
    }).filter(r => !PROPOSED_LANES.includes(r.lane) || rotation.includes(r.lane) || r.total > 0);
  }, [data, contentTab, rotation]);

  // Derived stats
  const maxVideos     = useMemo(() => Math.max(...rows.map(r => r.production), 0), [rows]);
  const totalVideos   = useMemo(() => rows.reduce((s, r) => s + r.production, 0), [rows]);
  const totalFullForm = useMemo(() => rows.reduce((s, r) => s + r.fullFormVideo, 0), [rows]);
  const hasIdeas      = Boolean(data?.kpi.total);

  // The Pick — most urgent core lane (excludes One-off + proposed lanes), retro-aware so Dashboard,
  // Retro, and Calendar agree. A "post more" lane (last retro) gets a priority
  // boost; a "pull back" lane is deprioritised — but a lane with zero coverage
  // stays urgent regardless, since you still need at least one video in it.
  const pick = useMemo<LaneCoverageEntry | null>(() => {
    const eligible = rows.filter(r => r.lane !== "One-off" && (!PROPOSED_LANES.includes(r.lane) || rotation.includes(r.lane)));
    if (!eligible.length) return null;
    const hasAnyIdeas = rows.some(r => r.total > 0);
    if (!hasAnyIdeas) return null;
    const effective = (r: LaneCoverageEntry) => {
      let sc = laneScore(r);                 // lower = more urgent
      if (r.production > 0) {                 // only nudge already-covered lanes
        const rec = retroRec[r.lane];
        if (rec === "more") sc -= 8;          // pull it toward the top
        else if (rec === "less") sc += 8;     // push it down
      }
      return sc;
    };
    return [...eligible].sort((a, b) => effective(a) - effective(b))[0] ?? null;
  }, [rows, retroRec, rotation]);

  // Last-seen per lane (from recentIdeas, best-effort)
  const laneLastSeen = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const idea of data?.recentIdeas ?? []) {
      const lane = idea.formatLane;
      if (!lane) continue;
      if (!map[lane] || idea.updatedAt > map[lane]) map[lane] = idea.updatedAt;
    }
    return map;
  }, [data]);

  // In-pipeline topic titles per lane (from recentIdeas)
  const laneTopics = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const idea of data?.recentIdeas ?? []) {
      const lane = idea.formatLane;
      if (!lane) continue;
      const inPipeline = ["evaluating", "scripting", "auditing", "rewriting", "briefing"].includes(idea.ideaStatus);
      if (!inPipeline) continue;
      // Filter to match the current tab
      if (contentTab === "longform" && !idea.fullFormVideo) continue;
      if (contentTab === "shorts"   &&  idea.fullFormVideo) continue;
      if (!map[lane]) map[lane] = [];
      if (map[lane].length < 3) map[lane].push(idea.title);
    }
    return map;
  }, [data, contentTab]);

  return (
    <div ref={pageScrollRef} className="h-full overflow-y-auto" style={{ background: "#faf9f7" }}>
      <div className="mx-auto max-w-[1180px] px-4 pt-3 pb-2.5 sm:px-7 sm:pt-4 sm:pb-3">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
<h1 className="text-[26px] font-semibold leading-[1.08] tracking-[-0.03em] text-zinc-950">Content Planner</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 rounded-[8px] border border-zinc-200 bg-white p-1 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
              <button
                type="button"
                onClick={() => setContentTab("shorts")}
                className={`relative inline-flex h-7 items-center gap-1.5 rounded-[6px] px-3 text-[12px] font-semibold transition-colors outline-none ${
                  contentTab === "shorts" ? "text-white" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {contentTab === "shorts" && (
                  <motion.span layoutId="dashTabPill" transition={pillSpring}
                    className="absolute inset-0 rounded-[6px] bg-zinc-950 shadow-sm" />
                )}
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  <VideoIcon size={11} /> Short ideas
                  {data && <span className={`text-[10px] font-mono ${contentTab === "shorts" ? "opacity-60" : "opacity-50"}`}>{data.kpi.total - data.kpi.fullFormVideo}</span>}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setContentTab("longform")}
                className={`relative inline-flex h-7 items-center gap-1.5 rounded-[6px] px-3 text-[12px] font-semibold transition-colors outline-none ${
                  contentTab === "longform" ? "text-white" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {contentTab === "longform" && (
                  <motion.span layoutId="dashTabPill" transition={pillSpring}
                    className="absolute inset-0 rounded-[6px] bg-zinc-950 shadow-sm" />
                )}
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  <DocumentIcon size={11} /> Full-form
                  {data && <span className={`text-[10px] font-mono ${contentTab === "longform" ? "opacity-60" : "opacity-50"}`}>{data.kpi.fullFormVideo}</span>}
                </span>
              </button>
            </div>
            <button onClick={() => load()} disabled={loading}
                    className="motion-press h-8 rounded-[7px] bg-zinc-950 px-3 text-[12px] font-medium text-white inline-flex items-center gap-1.5 transition hover:bg-zinc-800 disabled:opacity-70">
              <span className={loading ? "motion-spin inline-flex" : "inline-flex"}><RefreshIcon size={12} /></span> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-[74px] motion-shimmer rounded-[10px]" />
              <div className="h-[74px] motion-shimmer rounded-[10px]" />
            </div>
            <div className="h-[180px] motion-shimmer rounded-[14px]" />
            <div className="h-[320px] motion-shimmer rounded-[14px]" />
          </div>
        ) : error ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-[14px] border border-rose-100 bg-white text-center">
            <p className="text-sm text-rose-600">{error}</p>
            <p className="text-xs text-zinc-500">
              Make sure the backend is running: <code className="bg-zinc-100 px-1.5 py-0.5 rounded">cd server && npm run dev</code>
            </p>
            <button onClick={() => load()} className="text-sm underline" style={{ color: "#d3501c" }}>Retry</button>
          </div>
        ) : data ? (
          <AnimatePresence mode="wait">
          <motion.div
            key={contentTab}
            variants={tabSwap}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-4"
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-3 md:grid-cols-2"
            >
              <MetricCard
                label={contentTab === "longform" ? "Full-form videos" : "Finalised"}
                value={String(totalVideos)}
                detail={contentTab === "longform" ? "marked full-form" : "ideas ready"}
                action="Coverage base"
              />
              <MetricCard
                label="Shipped"
                value={String(data?.kpi.videoMade ?? 0)}
                detail="videos made"
                tone="neutral"
                action="Production"
              />
            </motion.div>

            {/* Shared retro signal — same line the Calendar shows, so all three
                views agree on what's working. */}
            {(() => {
              const more = retroWeighting.filter(w => w.recommendation === "more").map(w => w.lane);
              const less = retroWeighting.filter(w => w.recommendation === "less").map(w => w.lane);
              if (more.length === 0 && less.length === 0) return null;
              return (
                <div className="mb-3 flex items-center gap-2 flex-wrap rounded-[10px] border border-zinc-200/80 bg-white px-3.5 py-2 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 cursor-help"
                        title="From your latest retro \u2014 the same lane signal shown on the calendar.">From last retro</span>
                  {more.length > 0 && <span className="text-[11.5px] text-zinc-700"><span className="font-semibold text-emerald-700">Post more:</span> {more.join(", ")}</span>}
                  {less.length > 0 && <span className="text-[11.5px] text-zinc-700"><span className="font-semibold text-amber-700">Pull back:</span> {less.join(", ")}</span>}
                </div>
              );
            })()}

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid items-stretch gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))]"
            >
              <motion.div variants={popItem} whileHover={{ y: -3 }} transition={pillSpring} className="h-full min-w-0">
                <ThePick pick={pick} onGoIdeas={onGoIdeas} hasIdeas={hasIdeas} maxVideos={maxVideos} isLongform={contentTab === "longform"} retroRec={retroRec} />
              </motion.div>
              <motion.div variants={fadeUpItem} whileHover={{ y: -3 }} transition={pillSpring} className="h-full min-w-0">
                <DistributionPanel rows={rows} isLongform={contentTab === "longform"} />
              </motion.div>
              <motion.div variants={fadeUpItem} whileHover={{ y: -3 }} transition={pillSpring} className="h-full min-w-0">
                <RecentFinalised ideas={data.recentFinalisedIdeas ?? []} isLongform={contentTab === "longform"} />
              </motion.div>
            </motion.div>

            <Section
              label={contentTab === "longform" ? "Full-form by Lane" : "Lane Priority"}


            >
              <LanePriorityTable
                rows={rows}
                pickLane={pick?.lane ?? null}
                laneLastSeen={laneLastSeen}
                laneTopics={laneTopics}
                maxVideos={maxVideos}
                onGoIdeas={onGoIdeas}
                isLongform={contentTab === "longform"}
              />
            </Section>

          </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </div>
  );
}
