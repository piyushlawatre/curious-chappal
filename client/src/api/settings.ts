/**
 * settings.ts — typed fetch wrappers for the app-settings API
 * (subscriber count + milestone dates). Replaces the old localStorage values
 * so they survive browser changes/clears and sync across devices.
 */

const BASE = import.meta.env.VITE_API_URL ?? "/api";

export type AppSettings = {
  subscriberCount: number;
  milestoneDates: Record<string, string>;
  // The current 7-lane rotation. Canonical unless a proposed lane has graduated
  // in via the retro Probation panel (always exactly 7, no duplicates).
  rotationLanes: string[];
  updatedAt?: string;
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

export async function getSettings(): Promise<AppSettings> {
  return apiFetch<AppSettings>("/settings");
}

export async function updateSettings(
  patch: Partial<Pick<AppSettings, "subscriberCount" | "milestoneDates" | "rotationLanes">>,
): Promise<AppSettings> {
  return apiFetch<AppSettings>("/settings", { method: "PUT", body: JSON.stringify(patch) });
}
