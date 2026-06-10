/**
 * CalendarView.tsx — the content posting calendar + growth timeline.
 *
 * Three stacked sections:
 *   1. Phase tracker — where the channel sits in the 5-phase growth plan.
 *   2. Week calendar — the Week A/B posting slots with per-day recommended
 *      lanes; click a Short slot to assign a production-ready idea (lane-matched
 *      ideas surface first), and mark slots posted.
 *   3. Posting-history timeline — recent posted slots, week by week, with
 *      cadence vs the 3–4 Shorts/week target.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { pillSpring, fadeUpItem, staggerContainer } from "../lib/motion";
import Popover from "./Popover";
import {
  listSchedule, upsertSlot, updateSlotStatus, clearSlot, SlotConflictError,
  type ScheduleEntry, type SlotStatus,
} from "../api/schedule";
import { listIdeas, type IdeaListItem, type FormatLane } from "../api/ideas";
import { listRetros, type LaneAllocation } from "../api/retro";
import { getLanePlan } from "../api/lanePlan";
import { getSettings, updateSettings } from "../api/settings";
import { useScrollTopOn } from "../lib/useScrollTopOn";
import { FormatLanesGuideModal, FormatLanesGuideButton } from "./FormatLanesGuide";
import {
  slotsForDate, weekTypeFor, recommendedLanesForDate, toISODate, parseISODate,
  mondayOf, PLATFORM_META, effectiveShortCycle, setRotationLanes,
  shortCyclePositionFor, laneForShortDate, isRetroDate, cycleStartMondayOf, cycleEndSundayOf,
  plannedLaneForPosition,
  activitiesForDate, todayLocalISO,
  type PostingSlot, type Activity, type ActivityKind, type Platform,
} from "../data/postingSchedule";
import {
  GROWTH_PHASES, phaseForSubs, phaseProgress, type GrowthPhase,
} from "../data/growthPhases";

// ── Lane visuals (kept local so this view is self-contained) ──────────────────
const LANE_CFG: Record<string, { dot: string; bg: string; fg: string; ring: string; label: string }> = {
  "Real Reason":             { dot:"#1e6fdc", bg:"#eaf2fc", fg:"#0c3b78", ring:"#bcd6f4", label:"Real Reason" },
  "Hidden India":            { dot:"#c84a14", bg:"#fcefe6", fg:"#7a2c0a", ring:"#f3cab1", label:"Hidden India" },
  "Smart Money/Business":    { dot:"#0f8c5f", bg:"#e7f6ee", fg:"#0a4d35", ring:"#bee0cd", label:"Smart Money" },
  "Science Lite":            { dot:"#6f43c5", bg:"#f1edfa", fg:"#3d1e7a", ring:"#d3c4ed", label:"Science Lite" },
  "Sharp Contradiction":     { dot:"#b3261e", bg:"#fbe9e6", fg:"#651510", ring:"#efc1ba", label:"Sharp Contra" },
  "Viral Social Commentary": { dot:"#c47e00", bg:"#fdf3dc", fg:"#6b430a", ring:"#f6dc9c", label:"Viral Social" },
  "One-off":                 { dot:"#5a5a5a", bg:"#efede7", fg:"#1f1f1f", ring:"#d6d2c5", label:"One-off" },
  "Forgotten Inventor":      { dot:"#0e7c86", bg:"#e2f4f6", fg:"#084a52", ring:"#b3e0e5", label:"Forgotten Inv" },
  "Quiet Monopoly":          { dot:"#3b4cc0", bg:"#e9ebfb", fg:"#1e2875", ring:"#c4cbf0", label:"Quiet Monopoly" },
  "Status Game":             { dot:"#b5258f", bg:"#fbe9f5", fg:"#6e164f", ring:"#f0c2e0", label:"Status Game" },
};
// ── Real platform brand logos ─────────────────────────────────────────────────
// White glyphs on each brand's signature fill, rendered into a rounded tile so
// they slot into the existing badge layout. Instagram uses its gradient.
function PlatformLogo({ platform, size = 14, title }: { platform: Platform; size?: number; title?: string | null }) {
  // Each logo is a full-bleed SVG (the brand badge fills the whole box), so the
  // mark reads clearly even at 14px. No coloured wrapper tile — the SVG carries
  // its own shape and fill.
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    role: "img" as const,
    "aria-label": PLATFORM_META[platform]?.label,
  };
  const wrap = (node: React.ReactNode) => (
    <span className="shrink-0 inline-grid place-items-center" title={title === null ? undefined : (title ?? PLATFORM_META[platform]?.label)}>
      {node}
    </span>
  );

  switch (platform) {
    case "youtube":
      // The iconic rounded-rect red badge with a white play triangle.
      return wrap(
        <svg {...common} aria-hidden="true">
          <rect x="1" y="4.5" width="22" height="15" rx="4.2" fill="#FF0000" />
          <path d="M10 8.6l6.2 3.4L10 15.4z" fill="#fff" />
        </svg>);
    case "instagram":
      return wrap(
        <svg {...common} aria-hidden="true">
          <defs>
            <radialGradient id={`ig-${size}`} cx="28%" cy="100%" r="120%">
              <stop offset="0%" stopColor="#FFD776" />
              <stop offset="25%" stopColor="#F09433" />
              <stop offset="50%" stopColor="#E6683C" />
              <stop offset="68%" stopColor="#DC2743" />
              <stop offset="84%" stopColor="#CC2366" />
              <stop offset="100%" stopColor="#BC1888" />
            </radialGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="6" fill={`url(#ig-${size})`} />
          <rect x="6.3" y="6.3" width="11.4" height="11.4" rx="3.4" fill="none" stroke="#fff" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="2.9" fill="none" stroke="#fff" strokeWidth="1.7" />
          <circle cx="16.1" cy="7.9" r="1.1" fill="#fff" />
        </svg>);
    case "linkedin":
      return wrap(
        <svg {...common} aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="4.2" fill="#0A66C2" />
          <path fill="#fff" d="M6.3 9.3h2.5V18H6.3V9.3zM7.55 5.2a1.45 1.45 0 110 2.9 1.45 1.45 0 010-2.9zM10.4 9.3h2.4v1.19h.03c.33-.6 1.15-1.23 2.37-1.23 2.53 0 3 1.55 3 3.62V18h-2.5v-3.66c0-.88-.02-2.0-1.25-2.0-1.25 0-1.44.95-1.44 1.94V18h-2.5V9.3z" />
        </svg>);
    case "x":
      return wrap(
        <svg {...common} aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="4.2" fill="#000" />
          <path fill="#fff" d="M15.9 6.2h1.86l-4.07 4.65L18.5 17.8h-3.74l-2.93-3.83-3.35 3.83H4.62l4.35-4.97L6.5 6.2h3.83l2.65 3.5 3.0-3.5zm-.65 10.48h1.03L9.0 7.26H7.9l7.35 9.42z" />
        </svg>);
    case "facebook":
      return wrap(
        <svg {...common} aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="4.2" fill="#1877F2" />
          <path fill="#fff" d="M14.6 12.4l.36-2.36h-2.27V8.5c0-.65.32-1.28 1.34-1.28h1.03V5.21s-.93-.16-1.83-.16c-1.86 0-3.08 1.13-3.08 3.18v1.8H8.07v2.37h2.11V18h2.6v-5.6h1.82z" />
        </svg>);
    default:
      return wrap(
        <svg {...common} aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="4.2" fill="#71717a" />
        </svg>);
  }
}

const DOW_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Small helpers ─────────────────────────────────────────────────────────────
function timeLabel(t: string): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${m ? ":" + String(m).padStart(2, "0") : ""} ${ampm}`;
}
function addDays(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISODate(d);
}
function isToday(iso: string): boolean {
  return iso === todayLocalISO();
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function I({ d, size = 13, stroke = 1.7 }: { d: React.ReactNode; size?: number; stroke?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}
const ChevL = ({ size = 14 }: { size?: number }) => <I size={size} d={<path d="M15 18l-6-6 6-6" />} />;
const ChevR = ({ size = 14 }: { size?: number }) => <I size={size} d={<path d="M9 18l6-6-6-6" />} />;
const Check = ({ size = 12 }: { size?: number }) => <I size={size} stroke={2.6} d={<path d="M5 13l4 4L19 7" />} />;
const Plus  = ({ size = 12 }: { size?: number }) => <I size={size} d={<path d="M12 5v14M5 12h14" />} />;
const Xmark = ({ size = 12 }: { size?: number }) => <I size={size} d={<path d="M18 6L6 18M6 6l12 12" />} />;
const Clock = ({ size = 11 }: { size?: number }) => <I size={size} d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>} />;
const ChevDown = ({ size = 13 }: { size?: number }) => <I size={size} d={<path d="M6 9l6 6 6-6" />} />;
const Sparkle = ({ size = 13 }: { size?: number }) => <I size={size} d={<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />} />;
const Repeat  = ({ size = 12 }: { size?: number }) => <I size={size} d={<><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>} />;
const Chat    = ({ size = 12 }: { size?: number }) => <I size={size} d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />;
const Send    = ({ size = 12 }: { size?: number }) => <I size={size} d={<><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>} />;
const Mega    = ({ size = 12 }: { size?: number }) => <I size={size} d={<><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></>} />;
const Heart   = ({ size = 12 }: { size?: number }) => <I size={size} d={<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />} />;

// Maps an activity kind to an icon.
function ActivityIcon({ kind, size = 12 }: { kind: ActivityKind; size?: number }) {
  switch (kind) {
    case "reshare-thought": return <Repeat size={size} />;
    case "reply":           return <Chat size={size} />;
    case "story":           return <Send size={size} />;
    case "community":       return <Mega size={size} />;
    case "share-push":      return <Send size={size} />;
    case "engage":          return <Heart size={size} />;
    default:                return <Chat size={size} />;
  }
}

// ── Daily engagement-activity list (rendered in every day cell) ───────────────
function ActivityList({ activities }: { activities: Activity[] }) {
  if (!activities.length) return null;
  return (
    <div className="mt-1.5 space-y-1">
      <p className="px-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-400">Activity</p>
      {activities.map((a, i) => {
        return (
          <div key={i}
               className="flex items-start gap-1.5 rounded-[5px] px-1.5 py-1 cursor-help"
               title={a.detail}
               style={{ background: "#faf9f7", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.04)" }}>
            <span className="mt-[1px] shrink-0"><PlatformLogo platform={a.platform} size={15} title={null} /></span>
            <span className="min-w-0 flex-1 text-[9.5px] leading-tight text-zinc-600">{a.label}</span>
            {a.timeSensitive
              ? <span className="mt-[1px] text-amber-500 shrink-0"><Clock size={10} /></span>
              : <span className="mt-[1px] text-zinc-400 shrink-0"><ActivityIcon kind={a.kind} size={11} /></span>}
          </div>
        );
      })}
    </div>
  );
}


// ── Slot assignment popover ───────────────────────────────────────────────────
function AssignPopover({
  anchorRef, open, onClose, ideas, recommendedLanes, currentIdeaId, scheduledIdeaIds, onAssign, onClearAssign,
}: {
  anchorRef: React.RefObject<HTMLElement>;
  open: boolean;
  onClose: () => void;
  ideas: IdeaListItem[];
  recommendedLanes: FormatLane[];
  currentIdeaId: string | null;
  scheduledIdeaIds: Set<string>;
  onAssign: (idea: IdeaListItem) => void;
  onClearAssign: () => void;
}) {
  const [query, setQuery] = useState("");
  // The dropdown shows ONLY the day's lane by default; this opt-in reveals every
  // lane for the rare deliberate override.
  const [showAllLanes, setShowAllLanes] = useState(false);

  // Production-ready / shippable ideas, lane-matched ones first. Ideas already
  // assigned to another slot are hidden (you can't double-book one Short) — except
  // the idea currently in THIS slot, which stays visible so you can keep/clear it.
  const { ranked, hiddenScheduled, hiddenOtherLane } = useMemo(() => {
    const recSet = new Set(recommendedLanes);
    const q = query.trim().toLowerCase();
    let hiddenScheduled = 0;
    let hiddenOtherLane = 0;
    const list = ideas
      .filter((i) => !i.videoMade) // not already shipped
      .filter((i) => {
        if (i._id === currentIdeaId) return true;          // current slot's idea always shows
        if (scheduledIdeaIds.has(i._id)) { hiddenScheduled++; return false; } // booked elsewhere
        return true;
      })
      .filter((i) => {
        // Default: only ideas IN this day's lane. The current slot's idea is exempt,
        // and "show all lanes" lifts the filter for a deliberate override.
        if (showAllLanes || i._id === currentIdeaId) return true;
        const match = i.formatLane ? recSet.has(i.formatLane) : false;
        if (!match) { hiddenOtherLane++; return false; }
        return true;
      })
      .filter((i) => !q || i.title.toLowerCase().includes(q) || (i.formatLane ?? "").toLowerCase().includes(q))
      .map((i) => {
        const ready = i.ideaStatus === "production" || i.completionPct === 100;
        const laneMatch = i.formatLane ? recSet.has(i.formatLane) : false;
        const score = (laneMatch ? 2 : 0) + (ready ? 1 : 0);
        return { idea: i, ready, laneMatch, score };
      })
      .sort((a, b) => b.score - a.score || a.idea.title.localeCompare(b.idea.title))
      .slice(0, 40);
    return { ranked: list, hiddenScheduled, hiddenOtherLane };
  }, [ideas, recommendedLanes, query, currentIdeaId, scheduledIdeaIds, showAllLanes]);

  const dayLaneLabel = recommendedLanes[0] ? (LANE_CFG[recommendedLanes[0]]?.label ?? recommendedLanes[0]) : "";

  return (
    <Popover
      anchorRef={anchorRef}
      open={open}
      onClose={onClose}
      align="left"
      offset={6}
      width={300}
      className="rounded-[10px] bg-white motion-pop"
      style={{ boxShadow: "0 0 0 1px rgba(15,15,15,0.1), 0 18px 44px rgba(15,15,15,0.2)" }}
    >
      <div className="p-2 border-b border-zinc-100">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ideas to schedule…"
          className="w-full h-8 px-2.5 rounded-[6px] bg-[#faf9f7] text-[12px] text-zinc-900 outline-none placeholder:text-zinc-400 focus:shadow-[inset_0_0_0_1px_#0a0a0a]"
        />
        {recommendedLanes.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1 px-0.5">
            <span className="text-[10px] text-zinc-400">{showAllLanes ? "All lanes:" : "This day\u2019s lane:"}</span>
            {!showAllLanes && recommendedLanes.slice(0, 3).map((l) => {
              const c = LANE_CFG[l];
              return (
                <span key={l} className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px]"
                      style={{ background: c?.bg, color: c?.fg, boxShadow: `inset 0 0 0 1px ${c?.ring}` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: c?.dot }} />{c?.label ?? l}
                </span>
              );
            })}
            <button type="button" onClick={() => setShowAllLanes((v) => !v)}
                    title={showAllLanes ? "Show only ideas in this day\u2019s lane" : "Show ideas from every lane (deliberate override)"}
                    className="ml-auto text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 underline-offset-2 hover:underline shrink-0">
              {showAllLanes ? `Only ${dayLaneLabel}` : "Show all lanes"}
            </button>
          </div>
        )}
      </div>

      <div className="max-h-[260px] overflow-y-auto p-1">
        {currentIdeaId && (
          <button
            type="button"
            onClick={onClearAssign}
            className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] font-medium text-rose-600 hover:bg-rose-50"
          >
            <Xmark size={12} /> Clear this slot
          </button>
        )}
        {ranked.length === 0 ? (
          <div className="px-2.5 py-6 text-center text-[11.5px] text-zinc-400 leading-5">
            {!showAllLanes && dayLaneLabel ? (
              <>No unscheduled <span className="font-semibold text-zinc-600">{dayLaneLabel}</span> ideas ready.{" "}
                <button type="button" onClick={() => setShowAllLanes(true)} className="font-semibold text-zinc-700 underline underline-offset-2">Show all lanes</button></>
            ) : (
              "No assignable ideas — every idea is either already shipped or scheduled on another slot."
            )}
          </div>
        ) : (
          ranked.map(({ idea, ready, laneMatch }) => {
            const c = idea.formatLane ? LANE_CFG[idea.formatLane] : null;
            const isCurrent = idea._id === currentIdeaId;
            return (
              <button
                key={idea._id}
                type="button"
                onClick={() => onAssign(idea)}
                className={`flex w-full items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-left transition-colors ${isCurrent ? "bg-[#f3f2ee]" : "hover:bg-[#faf9f7]"}`}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c?.dot ?? "#c4c4c4" }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-zinc-900">{idea.title}</span>
                  <span className="flex items-center gap-1.5 mt-0.5">
                    {c && <span className="text-[10px] font-semibold" style={{ color: c.fg }}>{c.label}</span>}
                    {laneMatch && <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">lane match</span>}
                    {ready && <span className="text-[9.5px] font-semibold text-zinc-500">ready</span>}
                  </span>
                </span>
                {isCurrent && <Check size={12} />}
              </button>
            );
          })
        )}
        {hiddenScheduled > 0 && (
          <p className="px-2.5 py-1.5 text-[10px] text-zinc-400 border-t border-zinc-100 mt-1">
            {hiddenScheduled} idea{hiddenScheduled === 1 ? " is" : "s are"} hidden — already scheduled on another slot. Clear that slot first to move it here.
          </p>
        )}
      </div>
    </Popover>
  );
}

// ── One slot card inside a day ────────────────────────────────────────────────
function SlotCard({
  slot, entry, ideas, recommendedLanes, scheduledIdeaIds, onAssign, onClear, onTogglePosted, onSkip,
}: {
  slot: PostingSlot;
  entry: ScheduleEntry | undefined;
  ideas: IdeaListItem[];
  recommendedLanes: FormatLane[];
  scheduledIdeaIds: Set<string>;
  onAssign: (idea: IdeaListItem) => void;
  onClear: () => void;
  onTogglePosted: () => void;
  onSkip: () => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const pm = PLATFORM_META[slot.platform];
  const assignedIdea = ideas.find((i) => i._id === entry?.idea);
  const laneCfg = entry?.laneAtAssign ? LANE_CFG[entry.laneAtAssign] : (assignedIdea?.formatLane ? LANE_CFG[assignedIdea.formatLane] : null);
  const posted = entry?.status === "posted";
  const skipped = entry?.status === "skipped";
  const title = entry?.ideaTitle || assignedIdea?.title || "";

  // Non-Short slots (LinkedIn / X / native reel / cross-post) aren't idea-assignable;
  // show them as fixed reminders with an optional posted toggle.
  if (!slot.isShort) {
    return (
      <div className="flex items-center gap-1.5 rounded-[6px] px-1.5 py-1 text-[10.5px]"
           style={{ background: "#faf9f7", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.05)" }}>
        <PlatformLogo platform={slot.platform} size={14} title={pm.label} />
        <span className="min-w-0 flex-1 leading-tight text-zinc-600 cursor-help" title={slot.rationale || `${pm.label} · ${slot.label}`}>{slot.label}</span>
        <span className="text-zinc-400 tabular-nums shrink-0">{timeLabel(slot.timeIST)}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className={`rounded-[7px] p-1.5 transition-colors ${skipped ? "opacity-70" : ""}`}
        style={{
          background: skipped ? "#f4f3f0" : posted ? "#e8f7ef" : (title ? "#ffffff" : "#fbfaf8"),
          boxShadow: skipped ? "inset 0 0 0 1px rgba(15,15,15,0.08)" : posted ? "inset 0 0 0 1px #b6e2c8" : (title ? "inset 0 0 0 1px rgba(15,15,15,0.1)" : "inset 0 0 0 1px rgba(15,15,15,0.06)"),
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <PlatformLogo platform={slot.platform} size={15} title={pm.label} />
          <span className="text-[10px] font-semibold text-zinc-500 inline-flex items-center gap-0.5"><Clock size={9} /> {timeLabel(slot.timeIST)}</span>
          <div className="flex-1" />
          {/* Posted + Skip controls — available whether or not an idea is assigned, so
              you can record an unplanned post or deliberately rest a slot. */}
          {!skipped && (
            <button type="button" onClick={onTogglePosted}
                    title={posted ? "Mark not posted" : "Mark posted"}
                    className={`w-[18px] h-[18px] grid place-items-center rounded-[4px] transition-colors ${posted ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"}`}>
              <Check size={11} />
            </button>
          )}
          {!posted && (
            <button type="button" onClick={onSkip}
                    title={skipped ? "Un-skip this slot" : "Skip this slot — no Short this day"}
                    className={`w-[18px] h-[18px] grid place-items-center rounded-[4px] transition-colors ${skipped ? "bg-amber-500 text-white" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"}`}>
              <Xmark size={10} />
            </button>
          )}
        </div>

        {skipped ? (
          <div className="py-1.5 text-center text-[10.5px] font-medium text-zinc-400 cursor-help"
               title="This slot is intentionally skipped — no Short ships here this cycle. Click the amber button to restore it.">
            Skipped — no Short this day
          </div>
        ) : title ? (
          <button ref={triggerRef} type="button" onClick={() => setOpen((v) => !v)}
                  aria-haspopup="menu" aria-expanded={open}
                  className="w-full text-left">
            <span className="block truncate text-[11.5px] font-medium leading-tight text-zinc-900">{title}</span>
            {laneCfg && (
              <span className="mt-1 inline-flex items-center gap-1 text-[9.5px] font-semibold px-1.5 py-0.5 rounded-[4px] cursor-help"
                    title={`${laneCfg.label} — the content lane this Short belongs to (the theme/angle it follows).`}
                    style={{ background: laneCfg.bg, color: laneCfg.fg, boxShadow: `inset 0 0 0 1px ${laneCfg.ring}` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: laneCfg.dot }} />{laneCfg.label}
              </span>
            )}
          </button>
        ) : (
          <button ref={triggerRef} type="button" onClick={() => setOpen((v) => !v)}
                  aria-haspopup="menu" aria-expanded={open}
                  title="No idea assigned to this slot yet. Click to pick a Short concept for this day's publish time."
                  className="flex w-full items-center justify-center gap-1 rounded-[5px] py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors border border-dashed border-zinc-200">
            <Plus size={11} /> Assign idea
          </button>
        )}
      </div>

      <AssignPopover
        anchorRef={triggerRef}
        open={open}
        onClose={() => setOpen(false)}
        ideas={ideas}
        recommendedLanes={recommendedLanes}
        currentIdeaId={entry?.idea ?? null}
        scheduledIdeaIds={scheduledIdeaIds}
        onAssign={(idea) => { onAssign(idea); setOpen(false); }}
        onClearAssign={() => { onClear(); setOpen(false); }}
      />
    </div>
  );
}

// ── Compact status bar (collapsed Growth phase + milestones) ──────────────────
// Replaces the tall phase block so the week grid leads the page. The full phase
// detail + milestone log live inside a collapsible drawer.
function StatusBar({
  subs, subsLoaded, milestoneDates, onSubsChange, onMilestoneDateChange,
}: {
  subs: number;
  subsLoaded: boolean;
  milestoneDates: MilestoneDates;
  onSubsChange: (n: number) => void;
  onMilestoneDateChange: (phaseId: number, date: string) => void;
}) {
  const current = phaseForSubs(subs);
  const prog = phaseProgress(subs, current);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(subs));

  const commit = () => {
    const n = Math.max(0, Math.round(Number(draft) || 0));
    onSubsChange(n);
    setEditing(false);
  };

  return (
    <div className="rounded-[10px] border border-zinc-200/80 bg-white shadow-[0_1px_0_rgba(15,15,15,0.03)]">
      {/* Slim summary row */}
      <div className="flex items-center gap-3 sm:gap-4 px-3.5 py-2.5 flex-wrap">
        <div className="flex items-center gap-2 shrink-0 cursor-help"
             title={`Phase ${current.id}: ${current.name} — ${current.primaryGoal}`}>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Phase {current.id}</span>
          <span className="text-[13px] font-semibold text-zinc-900">{current.name}</span>
        </div>

        {/* Phase rail (compact) */}
        <div className="flex items-center gap-1 flex-1 min-w-[180px]">
          {GROWTH_PHASES.map((p) => {
            const done = subs >= p.exitSubs;
            const isCurrent = p.id === current.id;
            return (
              <div key={p.id} className="relative h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "#ececec" }}
                   title={p.range}>
                <div className="absolute inset-y-0 left-0 rounded-full"
                     style={{ background: done ? "#22c55e" : "#d3501c",
                              width: done ? "100%" : isCurrent ? `${prog * 100}%` : "0%" }} />
              </div>
            );
          })}
        </div>

        {/* Subscriber count (inline-editable) */}
        <div className="flex items-baseline gap-1.5 shrink-0">
          {editing ? (
            <input
              autoFocus value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
              className="w-20 h-7 px-2 text-right rounded-[6px] bg-[#faf9f7] text-[14px] font-semibold text-zinc-900 outline-none focus:shadow-[inset_0_0_0_1px_#0a0a0a]"
            />
          ) : !subsLoaded ? (
            <span title="Loading subscriber count…"
                  className="inline-block h-[18px] w-14 rounded-[5px] bg-zinc-200/70 animate-pulse align-middle" />
          ) : (
            <button type="button" onClick={() => { setDraft(String(subs)); setEditing(true); }}
                    title="Your current subscriber count. Click to edit — it sets which growth phase you\u2019re in."
                    className="text-[16px] font-semibold text-zinc-950 tabular-nums hover:text-[#d3501c] transition-colors">
              {subs.toLocaleString()}
            </button>
          )}
          <span className="text-[11px] text-zinc-400">/ {current.exitSubs === Infinity ? "—" : current.exitSubs.toLocaleString()} subs</span>
        </div>

        <button type="button" onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors shrink-0">
          {open ? "Hide" : "Details & milestones"}
          <span className={`transition-transform ${open ? "rotate-180" : ""}`}><ChevDown size={13} /></span>
        </button>
      </div>

      {/* Collapsible drawer: goal, cadence, milestone log */}
      {open && (
        <div className="border-t border-zinc-100 px-3.5 py-3">
          <p className="text-[11.5px] text-zinc-600 leading-snug">{current.primaryGoal}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500">
            <span><span className="text-zinc-400">Shorts:</span> {current.shortsCadence}</span>
            <span><span className="text-zinc-400">Long-form:</span> {current.longformCadence}</span>
            <span><span className="text-zinc-400">Next unlock:</span> {current.exitTrigger}</span>
          </div>

          <div className="mt-3 border-t border-zinc-100 pt-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Milestone log</p>
              <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded-[4px]">Manual</span>
            </div>
            {/* Milestones are fully manual — log / edit / clear any one freely,
                independent of the subscriber count. */}
            <div className="grid gap-1.5 sm:grid-cols-2">
              {GROWTH_PHASES.filter((p) => isFinite(p.exitSubs)).map((p) => {
                const achievedAt = milestoneDates[String(p.id)] ?? "";
                const logged = Boolean(achievedAt);
                return (
                  <div key={p.id} className="flex items-center gap-2 rounded-[7px] bg-[#faf9f7] px-2 py-1.5">
                    <span
                      className={`w-5 h-5 grid place-items-center rounded-[5px] text-[10px] font-bold shrink-0 ${logged ? "bg-emerald-100 text-emerald-700" : "bg-white text-zinc-400"}`}
                      style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.06)" }}
                    >
                      {logged ? <Check size={12} /> : p.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-zinc-700">{p.exitTrigger}</p>
                      <p className="text-[9.5px] text-zinc-400">{logged ? "Achieved" : "Not logged"} · {p.range}</p>
                    </div>
                    {logged ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="date"
                          value={achievedAt}
                          onChange={(e) => onMilestoneDateChange(p.id, e.target.value)}
                          className="h-7 w-[118px] rounded-[5px] bg-white px-1.5 text-[10.5px] font-medium text-zinc-700 outline-none focus:shadow-[inset_0_0_0_1px_#0a0a0a]"
                        />
                        <button
                          type="button"
                          onClick={() => onMilestoneDateChange(p.id, "")}
                          title="Clear this milestone"
                          className="w-7 h-7 grid place-items-center rounded-[5px] bg-white text-zinc-400 hover:text-rose-600 transition-colors"
                          style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}
                        >
                          <Xmark size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onMilestoneDateChange(p.id, todayLocalISO())}
                        className="h-7 rounded-[5px] bg-white px-2 text-[10.5px] font-semibold text-zinc-600 hover:text-zinc-950 transition-colors shrink-0"
                        style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}
                      >
                        Mark done
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Phase tracker strip ───────────────────────────────────────────────────────
type MilestoneDates = Record<string, string>;

// ── Posting-history timeline ──────────────────────────────────────────────────
function HistoryTimeline({ entries }: { entries: ScheduleEntry[] }) {
  // Group posted Short entries by ISO week (Monday), newest week first.
  const weeks = useMemo(() => {
    const posted = entries.filter((e) => e.status === "posted" && e.slotKey === "youtube-short");
    const byWeek = new Map<string, ScheduleEntry[]>();
    for (const e of posted) {
      const wk = mondayOf(e.date);
      (byWeek.get(wk) ?? byWeek.set(wk, []).get(wk)!).push(e);
    }
    return [...byWeek.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 8)
      .map(([weekStart, items]) => ({
        weekStart,
        weekType: weekTypeFor(weekStart),
        items: items.sort((a, b) => (a.date < b.date ? -1 : 1)),
      }));
  }, [entries]);

  if (weeks.length === 0) {
    return (
      <div className="rounded-[10px] border border-zinc-200/80 bg-white p-5 text-center shadow-[0_1px_0_rgba(15,15,15,0.03)]">
        <p className="text-[12.5px] text-zinc-500">No posts marked yet.</p>
        <p className="text-[11px] text-zinc-400 mt-1">Assign ideas to slots and tap the check to mark them posted — they'll show up here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-zinc-200/80 bg-white p-3.5 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-3">Posting history</p>
      <div className="space-y-3">
        {weeks.map(({ weekStart, weekType, items }) => {
          const target = weekType === "A" ? 3 : 4;
          const hit = items.length;
          const onTarget = hit >= target;
          const d = parseISODate(weekStart);
          return (
            <div key={weekStart} className="flex gap-3">
              <div className="w-[88px] shrink-0 pt-0.5">
                <p className="text-[11.5px] font-semibold text-zinc-700">{MONTHS[d.getUTCMonth()]} {d.getUTCDate()}</p>
                <p className="text-[10px] text-zinc-400">Week {weekType}</p>
                <span className={`mt-1 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] ${onTarget ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {hit}/{target} Shorts
                </span>
              </div>
              <div className="flex-1 min-w-0 border-l border-zinc-100 pl-3 space-y-1.5">
                {items.map((e) => {
                  const c = e.laneAtAssign ? LANE_CFG[e.laneAtAssign] : null;
                  const day = parseISODate(e.date);
                  return (
                    <div key={e._id} className="flex items-center gap-2 text-[11.5px]">
                      <span className="w-9 shrink-0 text-zinc-400">{DOW_LABEL[day.getUTCDay()]}</span>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c?.dot ?? "#c4c4c4" }} />
                      <span className="min-w-0 flex-1 truncate text-zinc-700">{e.ideaTitle || "(untitled)"}</span>
                      {c && <span className="text-[10px] font-semibold shrink-0" style={{ color: c.fg }}>{c.label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Retro block (cycle-closing Sunday) ────────────────────────────────────────
function RetroCard({ posted, total }: { posted: number; total: number }) {
  return (
    <div className="rounded-[7px] p-2"
         style={{ background: "#fbf3ff", boxShadow: "inset 0 0 0 1px #e6cdf5" }}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-[15px] h-[15px] grid place-items-center rounded-[3px] text-[9px] shrink-0"
              style={{ background: "#8b3fce", color: "#fff" }}>↺</span>
        <span className="text-[10px] font-bold uppercase tracking-wide cursor-help" style={{ color: "#6b2a9e" }}
              title="The 2-week cycle ends today. Review all 7 Shorts: which lanes worked, what to change next cycle.">Cycle retro</span>
      </div>
      <p className="text-[10.5px] leading-snug" style={{ color: "#5a2a82" }}>
        Close of the A+B cycle. Review the {total} Shorts: which lanes landed, what to change next cycle.
      </p>
      <div className="mt-1.5 flex items-center gap-1">
        <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-[4px]"
              style={{ background: "#f0dcfb", color: "#6b2a9e" }}>
          {posted}/{total} Shorts posted
        </span>
      </div>
    </div>
  );
}

// ── Lane-cycle overview strip ─────────────────────────────────────────────────
// Shows the 7-lane rotation for the current A+B cycle, marks which slot is
// today / done, so the user sees the "show" structure at a glance.
// Surfaces the most recent retro's lane weighting as a one-line steer on the
// calendar, linking last week's review to this week's planning.
function RetroHint() {
  const [allocation, setAllocation] = useState<LaneAllocation[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const all = await listRetros();
        if (cancelled) return;
        setAllocation(all[0]?.allocation ?? []);
      } catch { /* non-fatal — hint just hides */ }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!allocation || allocation.length === 0) return null;
  const total = allocation.reduce((s, a) => s + a.slots, 0);

  return (
    <div className="rounded-[10px] border-2 border-emerald-200 bg-white px-3.5 py-2.5 shadow-[0_1px_0_rgba(15,15,15,0.03)] flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 cursor-help"
            title="Your latest retro\u2019s suggested lane split for next week. Use it as a guide when filling the slots below.">
        Retro plan · {total} Shorts
      </span>
      <span className="text-[11.5px] text-zinc-700">
        {allocation.map((a) => `${a.slots} ${a.lane}`).join(" · ")}
      </span>
    </div>
  );
}

function LaneCycleStrip({ weekStart, entries }: { weekStart: string; entries: ScheduleEntry[] }) {
  const cycleStart = cycleStartMondayOf(weekStart);
  const cycleEnd = cycleEndSundayOf(weekStart);
  const todayISO = todayLocalISO();

  // For each of the 7 cycle Shorts, compute its actual date and posted state.
  const dayOffsetFor = (week: "A" | "B", dow: number) => {
    // Monday of week A = offset 0; Monday of week B = offset 7.
    const weekBase = week === "A" ? 0 : 7;
    const fromMon = dow === 0 ? 6 : dow - 1; // Mon=0 … Sun=6
    return weekBase + fromMon;
  };

  // The week currently shown in the grid above, so we can highlight which of the
  // 7 cycle positions belong to it (the rest are dimmed for clarity).
  const viewedWeekEnd = toISODate((() => { const e = parseISODate(weekStart); e.setUTCDate(e.getUTCDate() + 6); return e; })());
  const items = effectiveShortCycle().map((s, i) => {
    const d = parseISODate(cycleStart);
    d.setUTCDate(d.getUTCDate() + dayOffsetFor(s.week, s.dow));
    const dateISO = toISODate(d);
    const posted = entries.some((e) => e.date === dateISO && e.slotKey === "youtube-short" && e.status === "posted");
    const assigned = entries.find((e) => e.date === dateISO && e.slotKey === "youtube-short" && e.idea);
    const inViewedWeek = dateISO >= weekStart && dateISO <= viewedWeekEnd;
    return { pos: i + 1, lane: s.lane, week: s.week, dateISO, posted, assigned: !!assigned, isToday: dateISO === todayISO, inViewedWeek };
  });

  const cs = parseISODate(cycleStart);
  const ce = parseISODate(cycleEnd);
  const [showLanesGuide, setShowLanesGuide] = useState(false);

  return (
    <div className="rounded-[10px] border border-zinc-200/80 bg-white p-3.5 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
      <FormatLanesGuideModal open={showLanesGuide} onClose={() => setShowLanesGuide(false)} />
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 cursor-help truncate"
             title="A default lane per slot so every lane gets airtime. Always overridable \u2014 post your sharpest idea, whatever its lane.">
            Lane rotation · full 2-week cycle (all 7 Shorts)
          </p>
          <FormatLanesGuideButton onOpen={() => setShowLanesGuide(true)} label="What are lanes?" />
        </div>
        <span className="text-[10.5px] text-zinc-500">
          {MONTHS[cs.getUTCMonth()]} {cs.getUTCDate()} – {MONTHS[ce.getUTCMonth()]} {ce.getUTCDate()} · Shorts 1–7 · colour key
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {items.map((it) => {
          const c = LANE_CFG[it.lane];
          const day = parseISODate(it.dateISO);
          return (
            <div key={it.pos}
                 title={`Short ${it.pos} of 7 · Week ${it.week}${it.inViewedWeek ? " (this week)" : ""}`}
                 className="rounded-[7px] px-1.5 py-1.5 text-center transition-opacity"
                 style={{
                   background: it.posted ? "#e8f7ef" : c?.bg,
                   boxShadow: it.isToday ? "inset 0 0 0 1.5px #d3501c" : `inset 0 0 0 1px ${it.posted ? "#b6e2c8" : (c?.ring ?? "#e4e4e7")}`,
                   // Dim the half of the cycle that isn't the week currently in view,
                   // so this full-cycle strip reads clearly against the day badges.
                   opacity: it.inViewedWeek ? 1 : 0.5,
                 }}>
              <div className="flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: it.posted ? "#16a34a" : c?.dot }} />
                <span className="text-[9px] font-bold" style={{ color: it.posted ? "#0a4d35" : c?.fg }}>{it.pos}/7</span>
              </div>
              <p className="mt-0.5 text-[9.5px] font-semibold leading-tight" style={{ color: it.posted ? "#0a4d35" : c?.fg }}>{c?.label ?? it.lane}</p>
              <p className="text-[9px] text-zinc-500 mt-0.5">{DOW_LABEL[day.getUTCDay()]} · Wk {it.week}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SUBS_KEY = "ce_subscriber_count";
const MILESTONE_DATES_KEY = "ce_milestone_dates";

// ── Main view ─────────────────────────────────────────────────────────────────
export default function CalendarView({ onOpenIdea }: { onOpenIdea?: (id: string) => void }) {
  // `onOpenIdea` reserved for future per-idea drill-in; referenced to satisfy lint.
  void onOpenIdea;

  const todayISO = todayLocalISO();
  const [weekStart, setWeekStart] = useState(() => mondayOf(todayISO));
  // Week prev/next keeps this scroll container alive — reset it to the top.
  const pageScrollRef = useScrollTopOn(weekStart);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  // Applied lane plan for the visible cycle (overrides the default rotation).
  const [planLanes, setPlanLanes] = useState<string[]>([]);
  const [planSource, setPlanSource] = useState<string>("");
  const [ideas, setIdeas] = useState<IdeaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Server-backed (was localStorage). Default to empty; an effect loads the real
  // values from /api/settings on mount so they sync across devices/browsers.
  const [subs, setSubs] = useState<number>(0);
  // Bumped when the live lane rotation is (re)installed, so cycle-default lanes re-render.
  const [, setRotationTick] = useState(0);
  const [subsLoaded, setSubsLoaded] = useState(false);
  const [milestoneDates, setMilestoneDates] = useState<MilestoneDates>({});

  // Load settings on mount. One-time migration: if the server is still at
  // defaults but localStorage holds old values, push them up then clear them.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await getSettings();
        if (cancelled) return;
        let nextSubs = s.subscriberCount;
        let nextDates = s.milestoneDates ?? {};

        const localSubsRaw = (() => { try { return window.localStorage.getItem(SUBS_KEY); } catch { return null; } })();
        const localDatesRaw = (() => { try { return window.localStorage.getItem(MILESTONE_DATES_KEY); } catch { return null; } })();
        const localSubs = localSubsRaw ? Number(localSubsRaw) || 0 : 0;
        let localDates: MilestoneDates = {};
        if (localDatesRaw) {
          try { const p = JSON.parse(localDatesRaw); if (p && typeof p === "object") localDates = p as MilestoneDates; } catch { /* ignore */ }
        }
        const serverEmpty = (s.subscriberCount === 0) && Object.keys(nextDates).length === 0;
        const haveLocal = localSubs > 0 || Object.keys(localDates).length > 0;
        if (serverEmpty && haveLocal) {
          try {
            const migrated = await updateSettings({ subscriberCount: localSubs, milestoneDates: localDates });
            nextSubs = migrated.subscriberCount;
            nextDates = migrated.milestoneDates ?? {};
          } catch { /* keep server values; migration is best-effort */ }
        }
        // Clear legacy keys regardless so they can't shadow the server later.
        try { window.localStorage.removeItem(SUBS_KEY); window.localStorage.removeItem(MILESTONE_DATES_KEY); } catch { /* ignore */ }

        if (!cancelled) {
          setSubs(nextSubs); setMilestoneDates(nextDates);
          // Install the live lane rotation (graduated lanes swap into the cycle
          // defaults). The tick forces re-render of anything showing cycle lanes.
          setRotationLanes(s.rotationLanes);
          setRotationTick((t) => t + 1);
        }
      } catch {
        // Non-fatal — header just shows defaults until the backend is reachable.
      } finally {
        if (!cancelled) setSubsLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Optimistic local update, then write through to the server.
  const setSubsPersist = (n: number) => {
    setSubs(n);
    void updateSettings({ subscriberCount: n }).catch(() => { /* header keeps optimistic value */ });
  };
  const setMilestoneDatePersist = (phaseId: number, date: string) => {
    setMilestoneDates((prev) => {
      const next = { ...prev };
      if (date) next[String(phaseId)] = date;
      else delete next[String(phaseId)];
      void updateSettings({ milestoneDates: next }).catch(() => { /* keep optimistic value */ });
      return next;
    });
  };

  // Fetch a wide window of schedule entries (8 weeks back → 4 weeks ahead) so
  // the timeline has history and the calendar can page without refetching.
  const rangeFrom = useMemo(() => addDays(weekStart, -56), [weekStart]);
  const rangeTo   = useMemo(() => addDays(weekStart, 35), [weekStart]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sched, ideaList] = await Promise.all([
        listSchedule(rangeFrom, rangeTo),
        listIdeas(),
      ]);
      setEntries(sched);
      setIdeas(ideaList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [rangeFrom, rangeTo]);

  useEffect(() => { void load(); }, [load]);

  // Revalidate when the tab regains focus so assignments made on another device
  // appear without a manual reload. Calendar writes are immediate (no debounce),
  // so there is no unsaved local state to clobber.
  useEffect(() => {
    const onFocus = () => { void load(); };
    const onVis = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  // Load the applied lane plan for the cycle currently in view. When present it
  // overrides the default rotation; absent → calendar falls back to SHORT_CYCLE.
  useEffect(() => {
    let cancelled = false;
    const cs = cycleStartMondayOf(weekStart);
    void (async () => {
      try {
        const plan = await getLanePlan(cs);
        if (!cancelled) { setPlanLanes(plan?.lanes ?? []); setPlanSource(plan?.sourceRetroWeek ?? ""); }
      } catch { if (!cancelled) { setPlanLanes([]); setPlanSource(""); } }
    })();
    return () => { cancelled = true; };
  }, [weekStart]);

  const entryFor = useCallback(
    (date: string, slotKey: string) => entries.find((e) => e.date === date && e.slotKey === slotKey),
    [entries],
  );

  // Idea ids already occupying a slot (any date, not skipped) — used to stop the
  // same Short being double-booked onto two slots.
  const scheduledIdeaIds = useMemo(
    () => new Set(entries.filter((e) => e.idea && e.status !== "skipped").map((e) => String(e.idea))),
    [entries],
  );

  // Optimistic upsert helper — applies the server result into local state.
  const applyEntry = (saved: ScheduleEntry) => {
    setEntries((prev) => {
      const i = prev.findIndex((e) => e.date === saved.date && e.slotKey === saved.slotKey);
      if (i === -1) return [...prev, saved];
      const next = prev.slice();
      next[i] = saved;
      return next;
    });
  };

  const assignIdea = async (date: string, slot: PostingSlot, idea: IdeaListItem) => {
    const existing = entryFor(date, slot.slotKey);
    try {
      const saved = await upsertSlot({
        date, slotKey: slot.slotKey, platform: slot.platform, timeIST: slot.timeIST, ideaId: idea._id,
        // What we believe occupies the slot right now; server rejects if reality differs.
        expectedIdea: existing?.idea ?? null,
      });
      applyEntry(saved);
    } catch (err) {
      if (err instanceof SlotConflictError) {
        // Reconcile to the server's current row and tell the user.
        if (err.current) applyEntry(err.current);
        else setEntries((prev) => prev.filter((e) => !(e.date === date && e.slotKey === slot.slotKey)));
        setError(err.message);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to assign");
    }
  };

  const clearAssign = async (date: string, slot: PostingSlot) => {
    const existing = entryFor(date, slot.slotKey);
    try {
      if (existing) await clearSlot(existing._id);
      setEntries((prev) => prev.filter((e) => !(e.date === date && e.slotKey === slot.slotKey)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear");
    }
  };

  const togglePosted = async (date: string, slot: PostingSlot) => {
    const existing = entryFor(date, slot.slotKey);
    const next: SlotStatus = existing?.status === "posted" ? "planned" : "posted";
    try {
      // Works even on an empty slot — lets you record an unplanned post.
      const saved = existing
        ? await updateSlotStatus(existing._id, next)
        : await upsertSlot({ date, slotKey: slot.slotKey, platform: slot.platform, timeIST: slot.timeIST, status: next });
      applyEntry(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const toggleSkipped = async (date: string, slot: PostingSlot) => {
    const existing = entryFor(date, slot.slotKey);
    const next: SlotStatus = existing?.status === "skipped" ? "planned" : "skipped";
    try {
      const saved = existing
        ? await updateSlotStatus(existing._id, next)
        : await upsertSlot({ date, slotKey: slot.slotKey, platform: slot.platform, timeIST: slot.timeIST, status: next });
      applyEntry(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const weekType = weekTypeFor(weekStart);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  // Shorts posted in the current A+B cycle — promoted to the week toolbar so the
  // week's real progress isn't buried inside Sunday's retro card.
  const cyclePosted = useMemo(() => {
    const cs = cycleStartMondayOf(weekStart);
    const ce = cycleEndSundayOf(weekStart);
    return entries.filter((e) => e.slotKey === "youtube-short" && e.status === "posted" && e.date >= cs && e.date <= ce).length;
  }, [entries, weekStart]);
  const wkLabelStart = parseISODate(weekStart);
  const wkLabelEnd = parseISODate(addDays(weekStart, 6));

  return (
    <div ref={pageScrollRef} className="h-full overflow-y-auto" style={{ background: "#faf9f7" }}>
      <div className="mx-auto max-w-[1180px] px-4 sm:px-7 pt-4 pb-8 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[26px] font-semibold leading-[1.08] tracking-[-0.03em] text-zinc-950">Content Calendar</h1>
          <button onClick={() => void load()} disabled={loading}
                  title="Reload posts and ideas from the server"
                  className="motion-press h-8 rounded-[7px] bg-zinc-950 px-3 text-[12px] font-medium text-white inline-flex items-center gap-1.5 transition hover:bg-zinc-800 disabled:opacity-70">
            Refresh
          </button>
        </div>

        <StatusBar
          subs={subs}
          subsLoaded={subsLoaded}
          milestoneDates={milestoneDates}
          onSubsChange={setSubsPersist}
          onMilestoneDateChange={setMilestoneDatePersist}
        />

        {error && (
          <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700">
            {error} — is the backend running? <code className="bg-rose-100 px-1 rounded">cd server &amp;&amp; npm run dev</code>
          </div>
        )}

        {/* Week toolbar — sticky so the week nav + cycle progress stay visible and
            aren't clipped under the top nav when the calendar scrolls. */}
        <div className="sticky top-0 z-20 -mx-1 px-1 py-1 backdrop-blur-sm" style={{ background: "rgba(250,249,247,0.92)" }}>
        <div className="flex items-center justify-between gap-3 rounded-[10px] border border-zinc-200/80 bg-white px-3 py-2 shadow-[0_1px_0_rgba(15,15,15,0.03)]">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setWeekStart((w) => addDays(w, -7))}
                    title="Previous week" aria-label="Previous week"
                    className="w-8 h-8 grid place-items-center rounded-[7px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors motion-press">
              <ChevL />
            </button>
            <button type="button" onClick={() => setWeekStart(mondayOf(todayISO))}
                    title="Go to this week"
                    className="h-8 px-3 rounded-[7px] text-[12px] font-medium text-zinc-700 hover:bg-zinc-100 transition-colors motion-press">
              This week
            </button>
            <button type="button" onClick={() => setWeekStart((w) => addDays(w, 7))}
                    title="Next week" aria-label="Next week"
                    className="w-8 h-8 grid place-items-center rounded-[7px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors motion-press">
              <ChevR />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-[13px] font-semibold text-zinc-800">
              {MONTHS[wkLabelStart.getUTCMonth()]} {wkLabelStart.getUTCDate()} – {MONTHS[wkLabelEnd.getUTCMonth()]} {wkLabelEnd.getUTCDate()}
            </span>
            <span title={`Week ${weekType} of the 2-week cycle \u2014 ${weekType === "A" ? "3" : "4"} Shorts this week`}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-[5px] cursor-help ${weekType === "A" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"}`}>
              Week {weekType} · {weekType === "A" ? "3 Shorts" : "4 Shorts"}
            </span>
            <span title={weekType === "A" ? "Shorts 1–3 of this cycle’s 7" : "Shorts 4–7 of this cycle’s 7 · retro is on Sunday"}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-[5px] bg-zinc-100 text-zinc-500 cursor-help">
              {weekType === "A" ? "Cycle 1–3 / 7" : "Cycle 4–7 / 7 · retro Sun"}
            </span>
            {/* Promoted cycle-progress meter */}
            <span className="inline-flex items-center gap-1.5 pl-2 ml-0.5 border-l border-zinc-200"
                  title="Shorts posted so far this cycle">
              <span className="h-1.5 w-[72px] rounded-full overflow-hidden" style={{ background: "#ececec" }}>
                <span className="block h-full rounded-full" style={{ width: `${(cyclePosted / 7) * 100}%`, background: cyclePosted >= 7 ? "#22c55e" : "#d3501c" }} />
              </span>
              <span className="text-[11px] font-semibold text-zinc-700 tabular-nums">{cyclePosted}/7 posted</span>
            </span>
          </div>
        </div>
        </div>

        {/* Retro plan banner — shown when this cycle's lanes came from a retro. */}
        {planLanes.length > 0 && (() => {
          const src = planSource ? parseISODate(planSource) : null;
          return (
            <div className="flex items-center gap-2.5 rounded-[10px] border-2 border-emerald-200 bg-emerald-50/40 px-3.5 py-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-full shrink-0" style={{ background: "#d6f0e1", color: "#0f8c5f" }}>
                <Sparkle size={13} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-emerald-800 leading-tight">This cycle's lanes were set by your retro</p>
                <p className="text-[11px] text-emerald-700/80 leading-tight">
                  {src ? `Applied from the ${MONTHS[src.getUTCMonth()]} ${src.getUTCDate()} review — ` : ""}winners get more slots, every lane keeps at least one. You can still override any day.
                </p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-white/70 px-2 py-1 rounded-[5px] shrink-0">
                Retro plan
              </span>
            </div>
          );
        })()}

        {/* Week grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#d3501c", borderTopColor: "transparent" }} />
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show"
                      className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {days.map((date) => {
              const slots = slotsForDate(date, subs);
              const recLanes = recommendedLanesForDate(date);
              const d = parseISODate(date);
              const today = isToday(date);
              const isRest = slots.length === 0;
              const cyclePos = shortCyclePositionFor(date);
              const cycDefault = laneForShortDate(date);
              // A saved lane plan overrides the default rotation for this position.
              const plannedLane = plannedLaneForPosition(planLanes, cyclePos);
              const fromPlan = Boolean(plannedLane);
              const effectiveLane = plannedLane || cycDefault?.lane || null;
              const cyc = effectiveLane ? { lane: effectiveLane } : null;
              const retro = isRetroDate(date);
              const cycLane = cyc ? LANE_CFG[cyc.lane] : null;
              const activities = activitiesForDate(date);
              return (
                <motion.div key={date} variants={fadeUpItem}
                  className="rounded-[9px] border bg-white p-2 shadow-[0_1px_0_rgba(15,15,15,0.03)] flex flex-col"
                  style={{ borderColor: today ? "#d3501c" : "rgba(228,228,231,0.8)", boxShadow: today ? "0 0 0 1px #d3501c" : undefined }}>
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <span className={`text-[11px] font-semibold ${today ? "text-[#d3501c]" : "text-zinc-700"}`}>
                      {DOW_LABEL[d.getUTCDay()]} {d.getUTCDate()}
                    </span>
                    {today ? (
                      <span className="text-[9px] font-bold tracking-wide text-[#d3501c]">Today</span>
                    ) : cyclePos > 0 ? (
                      <span className="text-[9px] font-bold text-zinc-500 tabular-nums cursor-help"
                            title={`Short ${cyclePos} of 7 this cycle`}>{cyclePos}/7</span>
                    ) : null}
                  </div>

                  {/* Day's lane — from the applied retro plan (emerald accent) or the
                      default rotation. Either way it's overridable. */}
                  {cycLane && (
                    <div className="mb-1.5 px-0.5 flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] cursor-help"
                            title={fromPlan
                              ? `${cycLane.label} \u2014 set by your retro plan. Override anytime with a sharper idea.`
                              : `${cycLane.label} \u2014 the suggested lane for this slot. Override anytime with a sharper idea.`}
                            style={{ background: cycLane.bg, color: cycLane.fg, boxShadow: `inset 0 0 0 1px ${fromPlan ? "#86c9a8" : cycLane.ring}` }}>
                        <span className="w-1 h-1 rounded-full" style={{ background: cycLane.dot }} />{cycLane.label}
                      </span>
                      {fromPlan && (
                        <span className="grid place-items-center text-emerald-600 cursor-help" title="Set by your applied retro plan">
                          <Sparkle size={10} />
                        </span>
                      )}
                    </div>
                  )}

                  {isRest ? (
                    retro ? (
                      <RetroCard
                        posted={entries.filter((e) => e.slotKey === "youtube-short" && e.status === "posted" && e.date >= cycleStartMondayOf(date) && e.date <= date).length}
                        total={7}
                      />
                    ) : (
                      <div className="flex-1">
                        {/* Rest-day header — a single, non-wrapping two-tier label so
                            it reads as one unit instead of two columns colliding. */}
                        <div className="mb-1.5 rounded-[6px] bg-[#f7f6f3] px-2 py-1.5 cursor-help"
                             title="No Short ships today. This is an engagement-only day — keep the accounts warm with the activities below instead of publishing a new video.">
                          <p className="text-[10.5px] font-semibold text-zinc-600 leading-tight">No new Short</p>
                          <p className="text-[9px] text-zinc-400 leading-tight mt-0.5">Engagement only</p>
                        </div>
                        <ActivityList activities={activities} />
                      </div>
                    )
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        {slots.map((slot) => (
                          <SlotCard
                            key={slot.slotKey}
                            slot={slot}
                            entry={entryFor(date, slot.slotKey)}
                            ideas={ideas}
                            recommendedLanes={effectiveLane ? [effectiveLane as FormatLane] : recLanes}
                            scheduledIdeaIds={scheduledIdeaIds}
                            onAssign={(idea) => void assignIdea(date, slot, idea)}
                            onClear={() => void clearAssign(date, slot)}
                            onTogglePosted={() => void togglePosted(date, slot)}
                            onSkip={() => void toggleSkipped(date, slot)}
                          />
                        ))}
                      </div>
                      {/* Retro can also fall on a Sunday that has companion posts (Week B) */}
                      {retro && (
                        <div className="mt-1.5">
                          <RetroCard
                            posted={entries.filter((e) => e.slotKey === "youtube-short" && e.status === "posted" && e.date >= cycleStartMondayOf(date) && e.date <= date).length}
                            total={7}
                          />
                        </div>
                      )}
                      <ActivityList activities={activities} />
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Lane rotation overview for the current cycle */}
        {!loading && <RetroHint />}
        {!loading && <LaneCycleStrip weekStart={weekStart} entries={entries} />}

        {/* Timeline */}
        <HistoryTimeline entries={entries} />
      </div>
    </div>
  );
}
