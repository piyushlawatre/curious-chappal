/**
 * retro.ts — typed fetch wrappers for the weekly performance retro API.
 */

import type { FormatLane } from "./ideas";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

export type Verdict = "double-down" | "keep-testing" | "avoid" | "";

export type Bucket = "repeat" | "improve" | "avoid";

export type VideoPerf = {
  title: string;
  lane: FormatLane;
  platform: string;
  postedDate: string;   // "YYYY-MM-DD" — when it went live
  views: number;
  watchPct: number;
  likes: number;
  comments: number;
  shares: number;
  verdict: Verdict;
  note: string;
  // Computed server-side on read:
  score?: number;       // 0..100 (only present when the row is measured)
  bucket?: Bucket;      // repeat | improve | avoid
  measured?: boolean;   // false until at least one real metric is entered
  tooFresh?: boolean;   // posted very recently — score may be unreliable
};

export type LaneWeighting = {
  lane: string;
  recommendation: "more" | "steady" | "less";
  score: number;      // 0..100
  videoCount: number;
};

// Proposed slot split for next week's cycle (sums to the cycle's Short count).
export type LaneAllocation = {
  lane: string;
  slots: number;      // how many of next week's Shorts go to this lane
  sharePct: number;   // slots as a % of the cycle
};

// How the weighting was computed — lets the UI say "blended across N weeks" and
// flag videos excluded for being too fresh to judge.
export type WeightingMeta = {
  weeksUsed: number;      // 1 = this week only; up to 4 with blended history
  pooledVideos: number;   // measured, fairly-aged videos in the blend
  freshExcluded: number;  // this week's measured videos skipped as too fresh
} | null;

export type RetroWeek = {
  _id: string;
  weekStart: string;  // "YYYY-MM-DD" (Monday)
  videos: VideoPerf[];
  learnings: string;
  nextWeekPlan: string;
  weighting: LaneWeighting[];
  allocation: LaneAllocation[];
  weightingMeta?: WeightingMeta;
  createdAt: string;
  updatedAt: string;
};

export type UpsertRetroPayload = {
  weekStart: string;
  videos?: VideoPerf[];
  learnings?: string;
  nextWeekPlan?: string;
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json().catch(() => ({ success: false, error: "API did not return JSON. Check that the backend or dev proxy is running." }));
  if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json.data as T;
}

export function emptyVideo(): VideoPerf {
  return { title: "", lane: "", platform: "youtube", postedDate: "", views: 0, watchPct: 0, likes: 0, comments: 0, shares: 0, verdict: "", note: "" };
}

export async function listRetros(): Promise<RetroWeek[]> {
  return apiFetch<RetroWeek[]>("/retro");
}

export async function getRetro(weekStart: string): Promise<RetroWeek | null> {
  try {
    return await apiFetch<RetroWeek>(`/retro/${weekStart}`);
  } catch (err) {
    // 404 → no retro yet for that week; treat as null, re-throw anything else.
    if (err instanceof Error && /No retro for that week/.test(err.message)) return null;
    throw err;
  }
}

export async function upsertRetro(payload: UpsertRetroPayload): Promise<RetroWeek> {
  return apiFetch<RetroWeek>("/retro", { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteRetro(weekStart: string): Promise<void> {
  await apiFetch<{ weekStart: string }>(`/retro/${weekStart}`, { method: "DELETE" });
}
