/**
 * postingSchedule.ts — the Channel Growth Action Plan, encoded.
 *
 * Source of truth for the posting calendar:
 *   - the alternating Week A (3 Shorts) / Week B (4 Shorts) cadence,
 *   - the per-day platform slots with IST times,
 *   - a CYCLIC format-lane rotation across the 7 Shorts of each A+B cycle,
 *   - and a bi-weekly retrospective at the close of every cycle.
 *
 * Cyclic lanes
 * ------------
 * Each full cycle is Week A + Week B = 3 + 4 = 7 Shorts. There are exactly 7
 * canonical format lanes, so every cycle now covers all seven lanes once — a
 * recognisable "show" instead of repeating the same two suggestions every day.
 * The rotation is ordered so the channel-defining peak days (Wed / Thu) land on
 * the sharpest, highest-stakes lanes, while lighter / weekend slots take the
 * more shareable, curiosity-led lanes.
 *
 * Retrospective
 * -------------
 * The cycle closes on Week B Sunday (a rest day). That day carries a "Cycle
 * retro" block: review the 7 posted Shorts, what hit, what to change next cycle.
 *
 * All logic here is pure and dependency-free so it can be reused by the
 * calendar UI, the timeline, and (its lane map) the backend.
 */

import type { FormatLane } from "../api/ideas";
import { activePlatformsForSubs } from "./growthPhases";

// ── Week cycle anchor ───────────────────────────────────────────────────────
// The plan runs Week A, Week B, Week A, ... We anchor the cycle to the Monday
// of a known "Week A". 2025-01-06 is a Monday; pick it as cycle origin so the
// parity is stable and deterministic across the app and over time.
export const WEEK_CYCLE_ANCHOR = "2025-01-06"; // Monday, Week A

export type WeekType = "A" | "B";
export type Platform = "youtube" | "instagram" | "linkedin" | "x" | "facebook";

export type PostingSlot = {
  /** Stable key within a day, e.g. "youtube-short" or "instagram-native". */
  slotKey: string;
  platform: Platform;
  /** Human label for the slot, e.g. "YouTube Short". */
  label: string;
  /** Posting time in IST, 24h "HH:MM". */
  timeIST: string;
  /** True when this slot is a publishable video Short (drives lane hints). */
  isShort: boolean;
  /** True for the one native (non-cross-post) Instagram Reel of the week. */
  isNativeReel?: boolean;
  /**
   * Recommended format lanes for this slot, best first. For Shorts this is the
   * single cyclic lane for that slot's position in the A+B rotation (filled in
   * dynamically by slotsForDate). Empty for non-Shorts.
   */
  recommendedLanes: FormatLane[];
  /** Short rationale shown in the UI. */
  rationale: string;
};

export const PLATFORM_META: Record<Platform, { label: string; color: string; short: string }> = {
  youtube:   { label: "YouTube",   color: "#ef4444", short: "YT" },
  instagram: { label: "Instagram", color: "#d6249f", short: "IG" },
  linkedin:  { label: "LinkedIn",  color: "#0a66c2", short: "in" },
  x:         { label: "X",         color: "#18181b", short: "X" },
  facebook:  { label: "Facebook",  color: "#1877f2", short: "fb" },
};

// ── Cyclic lane rotation ─────────────────────────────────────────────────────
// The 7 Short slots of an A+B cycle, in chronological order:
//
//   #  Week  Day  Slot day                Distribution strength
//   1   A    Mon  fresh-week opener       steady
//   2   A    Wed  channel-defining peak   PEAK   ← sharpest lane
//   3   A    Fri  week close              steady
//   4   B    Mon  fresh-week opener       steady
//   5   B    Wed  channel-defining peak   PEAK   ← sharpest lane
//   6   B    Thu  second-strongest day    high
//   7   B    Sat  weekend leisure scroll  light  ← most shareable lane
//
// Each gets ONE distinct canonical lane; all seven lanes appear once per cycle.
// Peak days (#2, #5) take the two sharpest lanes; the weekend slot (#7) takes
// the lightest. The order below is the rotation, indexed 0..6.
export type ShortCyclePos = {
  week: WeekType;
  dow: number;          // 0 Sun … 6 Sat
  lane: FormatLane;
  rationale: string;
};

// SUGGESTED default lane per cycle slot — a rotation so every lane gets airtime
// across the 7-Short cycle, and each day's lane is matched to that day's audience
// behaviour. These are DEFAULTS, not rules: the 8-point filter and "quality over
// cadence" always win. If the sharpest researched idea this week is a different
// lane, post it in the slot and let the rotation flex. The lane chips in the UI
// surface these as recommendations, never hard assignments.
export const SHORT_CYCLE: ShortCyclePos[] = [
  { week: "A", dow: 1, lane: "Real Reason",
    rationale: "Cycle Short 1/7 · Mon 7 PM — fresh-week opener. Real Reason hooks with a familiar story and a hidden cause." },
  { week: "A", dow: 3, lane: "Sharp Contradiction",
    rationale: "Cycle Short 2/7 · Wed 7 PM — India's peak engagement day. Lead with your sharpest lane: Sharp Contradiction." },
  { week: "A", dow: 5, lane: "Hidden India",
    rationale: "Cycle Short 3/7 · Fri 7 PM — close the week with a Hidden India story; rooted, shareable into the weekend." },
  { week: "B", dow: 1, lane: "Smart Money/Business",
    rationale: "Cycle Short 4/7 · Mon 7 PM — open the second week with a Smart Money/Business mechanism." },
  { week: "B", dow: 3, lane: "Viral Social Commentary",
    rationale: "Cycle Short 5/7 · Wed 7 PM — peak day. Stage a live debate with Viral Social Commentary while it's hot." },
  { week: "B", dow: 4, lane: "Science Lite",
    rationale: "Cycle Short 6/7 · Thu 7 PM — second-strongest day. Science Lite: one clean invisible mechanism." },
  { week: "B", dow: 6, lane: "One-off",
    rationale: "Cycle Short 7/7 · Sat 11 AM — weekend leisure scroll. Spend the One-off slot on a standout topic, then retro." },
];

// ── Non-Short slot factories ─────────────────────────────────────────────────
function igReel(timeIST: string, native = false): PostingSlot {
  return {
    slotKey: native ? "instagram-native" : "instagram-reel",
    platform: "instagram",
    label: native ? "Instagram native Reel" : "Instagram Reel",
    timeIST, isShort: false, isNativeReel: native, recommendedLanes: [],
    rationale: native ? "Instagram native Reel — filmed and uploaded directly in Instagram (a quote card or hook visual), not a repost of your YouTube Short. Native uploads get more reach in IG's algorithm." : "Cross-post of the day's Short to Instagram, 30 min after the Short goes live.",
  };
}
function linkedin(): PostingSlot {
  return { slotKey: "linkedin", platform: "linkedin", label: "LinkedIn post", timeIST: "09:00", isShort: false, recommendedLanes: [], rationale: "One mental model, text-only. Link in first comment." };
}
function xThread(timeIST: string): PostingSlot {
  return { slotKey: "x-thread", platform: "x", label: "X thread", timeIST, isShort: false, recommendedLanes: [], rationale: "Extract the Short's mental model as a text thread." };
}

// ── Day-of-week → non-Short slots ────────────────────────────────────────────
// The YouTube Short itself is generated by slotsForDate (so it can carry the
// correct cyclic lane). These tables hold everything else per day.
// dow: 0 = Sunday … 6 = Saturday (JS getDay convention).
type ShortSpec = { timeIST: string };

// Which days carry a Short, per week, plus that Short's posting time.
const WEEK_A_SHORT: Record<number, ShortSpec | undefined> = {
  1: { timeIST: "19:00" }, // Mon
  3: { timeIST: "19:00" }, // Wed
  5: { timeIST: "19:00" }, // Fri
};
const WEEK_B_SHORT: Record<number, ShortSpec | undefined> = {
  1: { timeIST: "19:00" }, // Mon
  3: { timeIST: "19:00" }, // Wed
  4: { timeIST: "19:00" }, // Thu
  6: { timeIST: "11:00" }, // Sat
};

// Non-Short companion slots per day.
const WEEK_A_REST: Record<number, PostingSlot[]> = {
  1: [igReel("19:30")],
  2: [linkedin()],
  3: [igReel("19:30"), linkedin(), xThread("20:00")],
  4: [linkedin()],
  5: [igReel("19:30")],
  6: [igReel("11:30", true)],
  0: [],
};
const WEEK_B_REST: Record<number, PostingSlot[]> = {
  1: [igReel("19:30")],
  2: [linkedin()],
  3: [igReel("19:30"), linkedin(), xThread("20:00")],
  4: [igReel("19:30"), linkedin()],
  5: [],
  6: [igReel("11:30")],
  0: [igReel("11:30", true), xThread("20:00")], // cycle-closing Sunday — also the retro day
};

// ── Date helpers (UTC-date-only, no timezone math needed for day parity) ─────

/** Parse "YYYY-MM-DD" into a UTC Date at midnight. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

/** Format a Date as "YYYY-MM-DD" using its UTC fields.
 *  Must read UTC (not local) so it round-trips with parseISODate, which builds a
 *  UTC-midnight Date. Reading local fields shifted dates back a day for users in
 *  timezones behind UTC (the Americas), corrupting Week A/B parity and lanes. */
export function toISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today's calendar date as "YYYY-MM-DD", read from the user's LOCAL clock.
 *  Use this instead of toISODate(new Date()) — toISODate reads UTC fields, so
 *  feeding it a local Date would mis-date the early-morning hours. */
export function todayLocalISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

/** Whole days between two ISO dates (b - a). */
function daysBetween(aISO: string, bISO: string): number {
  const a = parseISODate(aISO).getTime();
  const b = parseISODate(bISO).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Monday-of-week ISO for a given date (ISO week starts Monday). */
export function mondayOf(dateISO: string): string {
  const d = parseISODate(dateISO);
  const dow = d.getUTCDay(); // 0 Sun … 6 Sat
  const diff = dow === 0 ? -6 : 1 - dow; // shift back to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return toISODate(d);
}

/** Which week (A or B) a given date falls in, per the anchored cycle. */
export function weekTypeFor(dateISO: string): WeekType {
  const weeks = Math.floor(daysBetween(WEEK_CYCLE_ANCHOR, mondayOf(dateISO)) / 7);
  // Even week offset → A, odd → B. Handle negatives safely.
  const parity = ((weeks % 2) + 2) % 2;
  return parity === 0 ? "A" : "B";
}

/** Monday of the *Week-A* that opens the A+B cycle containing this date. */
export function cycleStartMondayOf(dateISO: string): string {
  const wkMon = mondayOf(dateISO);
  // If this week is B, the cycle opened the previous Monday (Week A).
  return weekTypeFor(wkMon) === "A" ? wkMon : addDaysISO(wkMon, -7);
}

/** Sunday that closes the A+B cycle containing this date (the retro day). */
export function cycleEndSundayOf(dateISO: string): string {
  return addDaysISO(cycleStartMondayOf(dateISO), 13); // Mon(A) +13 days = Sun(B)
}

/** Local addDays kept here so cycle helpers above are self-contained. */
function addDaysISO(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISODate(d);
}

// ── Live rotation (lane graduation) ──────────────────────────────────────────
// The default rotation is the 7 canonical lanes baked into SHORT_CYCLE. When a
// proposed lane graduates (retro Probation panel → Settings.rotationLanes), it
// swaps 1:1 with a canonical lane. Views call setRotationLanes() after loading
// settings; every cycle-default lookup below then substitutes the swapped lane
// while keeping the slot's day, time, and audience rationale.
const CANONICAL_ROTATION: string[] = SHORT_CYCLE.map((s) => s.lane);
let activeRotation: string[] = [...CANONICAL_ROTATION];

/** Install the live rotation from Settings (ignored unless 7 unique lanes). */
export function setRotationLanes(lanes: string[] | undefined | null): void {
  if (Array.isArray(lanes) && lanes.length === 7 && new Set(lanes).size === 7) {
    activeRotation = [...lanes];
  } else {
    activeRotation = [...CANONICAL_ROTATION];
  }
}

export function getRotationLanes(): string[] {
  return [...activeRotation];
}

/** A SHORT_CYCLE position with its lane substituted per the live rotation. */
function withRotation(s: ShortCyclePos): ShortCyclePos {
  if (activeRotation.includes(s.lane)) return s;
  // 1:1 mapping: k-th canonical lane that left ↔ k-th new lane that entered.
  const departed = CANONICAL_ROTATION.filter((l) => !activeRotation.includes(l));
  const entered  = activeRotation.filter((l) => !CANONICAL_ROTATION.includes(l));
  const lane = entered[departed.indexOf(s.lane)] ?? s.lane;
  if (lane === s.lane) return s;
  const slotIntro = s.rationale.split("—")[0].trim(); // "Cycle Short n/7 · Day time"
  return { ...s, lane: lane as FormatLane, rationale: `${slotIntro} — ${lane}, graduated into the rotation (swapped in for ${s.lane}).` };
}

/** The full 7-slot cycle with the live rotation applied. */
export function effectiveShortCycle(): ShortCyclePos[] {
  return SHORT_CYCLE.map(withRotation);
}

// ── Cyclic lane lookup ───────────────────────────────────────────────────────

/** The cycle position (1..7) for a date that carries a Short, else 0. */
export function shortCyclePositionFor(dateISO: string): number {
  const week = weekTypeFor(dateISO);
  const dow = parseISODate(dateISO).getUTCDay();
  const idx = SHORT_CYCLE.findIndex((s) => s.week === week && s.dow === dow);
  return idx === -1 ? 0 : idx + 1;
}

/** The single cyclic lane assigned to a date's Short (null if no Short). */
export function laneForShortDate(dateISO: string): ShortCyclePos | null {
  const pos = shortCyclePositionFor(dateISO);
  return pos === 0 ? null : withRotation(SHORT_CYCLE[pos - 1]);
}

/** True when a date is the cycle-closing Sunday (carries the retro block). */
export function isRetroDate(dateISO: string): boolean {
  return weekTypeFor(dateISO) === "B" && parseISODate(dateISO).getUTCDay() === 0;
}

// ── Slot assembly ────────────────────────────────────────────────────────────

function youtubeShortSlot(dateISO: string): PostingSlot | null {
  const week = weekTypeFor(dateISO);
  const dow = parseISODate(dateISO).getUTCDay();
  const spec = (week === "A" ? WEEK_A_SHORT : WEEK_B_SHORT)[dow];
  if (!spec) return null;
  const cyc = laneForShortDate(dateISO);
  return {
    slotKey: "youtube-short",
    platform: "youtube",
    label: "YouTube Short",
    timeIST: spec.timeIST,
    isShort: true,
    recommendedLanes: cyc ? [cyc.lane] : [],
    rationale: cyc?.rationale ?? "YouTube Short.",
  };
}

/** All posting slots scheduled for a given date (Short first, then companions). */
export function slotsForDate(dateISO: string, subs?: number): PostingSlot[] {
  const week = weekTypeFor(dateISO);
  const dow = parseISODate(dateISO).getUTCDay();
  const rest = (week === "A" ? WEEK_A_REST : WEEK_B_REST)[dow] ?? [];
  const short = youtubeShortSlot(dateISO);
  const all = short ? [short, ...rest] : [...rest];
  // Phase gating: when subs is provided, hide slots for platforms not yet unlocked
  // by the current growth phase (e.g. LinkedIn + X stay hidden until 1,000 subs).
  if (subs === undefined) return all;
  const active = new Set<string>(activePlatformsForSubs(subs));
  return all.filter((sl) => active.has(sl.platform));
}

/** The recommended lane(s) for a date's Short slot (single lane, or empty). */
export function recommendedLanesForDate(dateISO: string): FormatLane[] {
  const cyc = laneForShortDate(dateISO);
  return cyc ? [cyc.lane] : [];
}

/** True when a date carries a publishable Short slot. */
export function hasShortSlot(dateISO: string): boolean {
  return shortCyclePositionFor(dateISO) !== 0;
}

// ── Daily engagement activities ──────────────────────────────────────────────
// Every day carries light, platform-specific engagement work so no day is dead.
// IG-led (this niche's virality/reach engine) with the YouTube equivalent right
// beside it — YT is Priority 1 for monetization, so its activities are never
// dropped. Grounded in current platform mechanics (verified Jun 2026):
//   • IG Repost ("reshare with a thought") — loop icon → Add a thought → Save.
//   • YT share velocity — shares via DM/link in the first ~2h drive reach.
//   • YT Community posts — polls / quote cards / past-Short moments.

export type ActivityKind = "reply" | "reshare-thought" | "story" | "community" | "engage" | "share-push";

export type Activity = {
  kind: ActivityKind;
  platform: Platform;
  label: string;
  detail: string;
  /** Time-sensitive activities (e.g. first-2h share push) render with a clock. */
  timeSensitive?: boolean;
};

// On a day with a fresh Short/Reel going out — protect the launch window.
const POSTING_DAY_ACTIVITIES: Activity[] = [
  { kind: "reply", platform: "youtube", label: "Reply to YT comments (first 2h)",
    detail: "Answer every early comment on today's Short. Early replies + watch-time signal the algorithm.", timeSensitive: true },
  { kind: "share-push", platform: "youtube", label: "Push early shares",
    detail: "DM / link-share the Short to 3–5 people in the first 2h. Share velocity is a 2026 YT ranking signal.", timeSensitive: true },
  { kind: "reply", platform: "instagram", label: "Reply to Reel comments",
    detail: "Reply to comments + DMs on the cross-posted Reel. Conversation depth boosts Reel reach." },
];

// On a rest day (no new post) — keep the accounts warm with low-effort, high-signal work.
const REST_DAY_ACTIVITIES: Activity[] = [
  { kind: "reshare-thought", platform: "instagram", label: "Reshare a Reel with a thought",
    detail: "Tap the loop (Repost) icon on your best recent Reel, tap “Add a thought”, add one sharp line, Save. Re-surfaces it to followers' feeds." },
  { kind: "story", platform: "instagram", label: "Reshare top Reel to Stories",
    detail: "Push a strong recent Reel to Stories with a poll or question sticker to pull replies." },
  { kind: "community", platform: "youtube", label: "Post a YT Community update",
    detail: "A poll, a quote card, or a “best moment” from a past Short. Keeps subscribers engaged between uploads." },
  { kind: "engage", platform: "instagram", label: "Engage on 5 niche accounts",
    detail: "Leave thoughtful comments on 5 creators in your space (history / business / science explainers). Grows reach." },
];

// Retro (cycle-closing Sunday) — lighter, reflection-focused, but still not dead.
const RETRO_DAY_ACTIVITIES: Activity[] = [
  { kind: "reshare-thought", platform: "instagram", label: "Reshare the cycle's best Reel",
    detail: "Repost the top performer of the cycle with a thought that teases next cycle's direction." },
  { kind: "community", platform: "youtube", label: "Ask the audience (Community)",
    detail: "Run a Community poll on what they want next cycle — feeds topic selection and signals you're listening." },
];

/** Engagement activities for a date — every day returns at least one. */
export function activitiesForDate(dateISO: string): Activity[] {
  if (isRetroDate(dateISO)) return RETRO_DAY_ACTIVITIES;
  return hasShortSlot(dateISO) ? POSTING_DAY_ACTIVITIES : REST_DAY_ACTIVITIES;
}

// ── Lane-plan expansion (retro allocation → ordered cycle lanes) ─────────────
// Turns a slot allocation [{lane, slots}] into an ordered array of length 7 —
// one lane per cycle Short. Winners are SPREAD across the cycle (round-robin by
// remaining slots) rather than clumped, so a 3-slot lane lands on positions
// across both weeks instead of three days in a row.
// Cycle positions (0-based, matching SHORT_CYCLE order) ranked by audience strength,
// strongest first: the two peak-engagement Wednesdays, then Thursday, the two
// Monday openers, Friday, and finally the Saturday leisure slot. Winner lanes are
// placed onto the strongest days so a strong lane lands on a peak day — not wherever
// its index happened to fall. Derived from the per-slot rationale in SHORT_CYCLE.
const POSITION_STRENGTH_ORDER = [1, 4, 5, 0, 3, 2, 6];

export function expandAllocationToLanes(
  allocation: { lane: string; slots: number }[],
  total = 7,
): string[] {
  // Build a mutable pool of [lane, remaining] sorted by slots desc (winners first).
  const pool = allocation
    .filter((a) => a.lane && a.slots > 0)
    .map((a) => ({ lane: a.lane, left: a.slots }))
    .sort((x, y) => y.left - x.left);

  // Winner-ordered sequence, round-robin so a 2-slot lane is spread (not clumped).
  const seq: string[] = [];
  while (seq.length < total && pool.some((p) => p.left > 0)) {
    for (const p of pool) {
      if (p.left > 0 && seq.length < total) {
        seq.push(p.lane);
        p.left -= 1;
      }
    }
  }

  // Strength-ordered list of positions; append any beyond the known 7 (if total>7).
  const strength = POSITION_STRENGTH_ORDER.filter((p) => p < total);
  for (let p = 0; p < total; p++) if (!strength.includes(p)) strength.push(p);

  // Place the k-th best lane on the k-th strongest cycle position.
  const out: string[] = new Array(total).fill("");
  for (let k = 0; k < seq.length && k < total; k++) out[strength[k]] = seq[k];
  return out;
}

/** Look up a planned lane for a cycle position (1..7) from a plan's ordered lanes. */
export function plannedLaneForPosition(planLanes: string[] | undefined, pos: number): string | null {
  if (!planLanes || pos < 1 || pos > planLanes.length) return null;
  return planLanes[pos - 1] || null;
}
