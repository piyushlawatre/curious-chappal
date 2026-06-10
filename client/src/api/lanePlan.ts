/**
 * lanePlan.ts — typed fetch wrappers for per-cycle lane plans.
 * A plan overrides the default lane rotation for one A+B cycle's 7 Shorts.
 */

const BASE = import.meta.env.VITE_API_URL ?? "/api";

export type LanePlan = {
  _id: string;
  cycleStart: string;   // Monday of Week A that opens the cycle, "YYYY-MM-DD"
  lanes: string[];      // ordered, index 0 = Short 1 … index 6 = Short 7
  sourceRetroWeek: string;
  createdAt: string;
  updatedAt: string;
};

export type UpsertLanePlanPayload = {
  cycleStart: string;
  lanes: string[];
  sourceRetroWeek?: string;
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

export async function getLanePlan(cycleStart: string): Promise<LanePlan | null> {
  try {
    return await apiFetch<LanePlan>(`/lane-plan/${cycleStart}`);
  } catch (err) {
    if (err instanceof Error && /No plan for that cycle/.test(err.message)) return null;
    throw err;
  }
}

export async function upsertLanePlan(payload: UpsertLanePlanPayload): Promise<LanePlan> {
  return apiFetch<LanePlan>("/lane-plan", { method: "PUT", body: JSON.stringify(payload) });
}
