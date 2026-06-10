/**
 * growthPhases.ts — the five growth phases from the Channel Growth Action Plan,
 * encoded for the phase-progress timeline. Subscriber count is the spine.
 */

export type GrowthPhase = {
  id: number;
  name: string;
  range: string;
  /** Subscriber thresholds [start, exit]. exit = Infinity for the final phase. */
  startSubs: number;
  exitSubs: number;
  primaryGoal: string;
  shortsCadence: string;
  longformCadence: string;
  exitTrigger: string;
  /** Platforms that are ACTIVE in this phase. Slots for any other platform are
   *  hidden on the calendar until the channel reaches the phase that unlocks them.
   *  Per the Growth Action Plan: YouTube + Instagram (+ auto Facebook) from day one;
   *  LinkedIn and X start in Phase 2 (1,000 subs +). */
  activePlatforms: Platform[];
};

/** Platform keys used across the schedule + phases. */
export type Platform = "youtube" | "instagram" | "facebook" | "linkedin" | "x";

export const GROWTH_PHASES: GrowthPhase[] = [
  {
    id: 1, name: "Foundation", range: "0 → 1,000 subs",
    startSubs: 0, exitSubs: 1000,
    primaryGoal: "Hit 1,000 subscribers and build the Shorts habit. YouTube + Instagram only.",
    shortsCadence: "3–4 Shorts / week", longformCadence: "None yet",
    exitTrigger: "1,000 subscribers reached.",
    activePlatforms: ["youtube", "instagram", "facebook"],
  },
  {
    id: 2, name: "Watch Hours & First Long-Form", range: "1K → monetization",
    startSubs: 1000, exitSubs: 4000,
    primaryGoal: "Hit 4,000 watch hours on long-form to unlock full YPP. Add LinkedIn + X.",
    shortsCadence: "3–4 Shorts / week", longformCadence: "1 long-form / month (8–12 min)",
    exitTrigger: "YouTube Partner Program approved (1K subs + 4K watch hours).",
    activePlatforms: ["youtube", "instagram", "facebook", "linkedin", "x"],
  },
  {
    id: 3, name: "Post-Monetization", range: "Monetized → 10K subs",
    startSubs: 4000, exitSubs: 10000,
    primaryGoal: "Build watch-time revenue + first brand deals.",
    shortsCadence: "3–4 Shorts / week", longformCadence: "1 long-form / 2–3 weeks",
    exitTrigger: "10,000 subscribers reached.",
    activePlatforms: ["youtube", "instagram", "facebook", "linkedin", "x"],
  },
  {
    id: 4, name: "Scale", range: "10K → 50K subs",
    startSubs: 10000, exitSubs: 50000,
    primaryGoal: "Establish long-form as a serious revenue + authority pillar. Hire editor, then researcher.",
    shortsCadence: "3–4 Shorts / week", longformCadence: "1 long-form / 2 weeks",
    exitTrigger: "50,000 subscribers reached.",
    activePlatforms: ["youtube", "instagram", "facebook", "linkedin", "x"],
  },
  {
    id: 5, name: "Authority", range: "50K+ subs",
    startSubs: 50000, exitSubs: Infinity,
    primaryGoal: "Long-form weekly if infra is in place. Prioritise long-form in Q4 (peak India RPM).",
    shortsCadence: "3–4 Shorts / week", longformCadence: "1 / week (with team) or 1 / 2 weeks (solo)",
    exitTrigger: "Ongoing.",
    activePlatforms: ["youtube", "instagram", "facebook", "linkedin", "x"],
  },
];

export function phaseForSubs(subs: number): GrowthPhase {
  return GROWTH_PHASES.find((p) => subs >= p.startSubs && subs < p.exitSubs) ?? GROWTH_PHASES[GROWTH_PHASES.length - 1];
}

/** Progress 0–1 within the current phase's subscriber band. */
export function phaseProgress(subs: number, phase: GrowthPhase): number {
  if (!isFinite(phase.exitSubs)) return 1;
  const span = phase.exitSubs - phase.startSubs;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, (subs - phase.startSubs) / span));
}

/** Platforms active for a given subscriber count (i.e. the current phase's). */
export function activePlatformsForSubs(subs: number): Platform[] {
  return phaseForSubs(subs).activePlatforms;
}
