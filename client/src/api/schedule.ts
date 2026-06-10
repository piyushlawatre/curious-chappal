/**
 * schedule.ts — typed fetch wrappers for the posting-calendar API.
 */

const BASE = import.meta.env.VITE_API_URL ?? "/api";

export type SlotStatus = "planned" | "posted" | "skipped";

export type ScheduleEntry = {
  _id:          string;
  date:         string;   // "YYYY-MM-DD"
  slotKey:      string;
  platform:     string;
  timeIST:      string;
  idea:         string | null;
  ideaTitle:    string;
  laneAtAssign: string;
  status:       SlotStatus;
  postedAt:     string;
  notes:        string;
  createdAt:    string;
  updatedAt:    string;
};

export type UpsertSlotPayload = {
  date:      string;
  slotKey:   string;
  platform?: string;
  timeIST?:  string;
  ideaId?:   string | null;
  status?:   SlotStatus;
  notes?:    string;
  // Optimistic concurrency: the idea id the client believes currently occupies
  // this slot (null = believed empty). The server rejects with 409 if reality
  // differs, preventing a silent overwrite of another device's assignment.
  expectedIdea?: string | null;
};

// Thrown when the server reports a 409 slot conflict. Carries the server's
// current entry so the caller can reconcile its local state.
export class SlotConflictError extends Error {
  current: ScheduleEntry | null;
  constructor(message: string, current: ScheduleEntry | null) {
    super(message);
    this.name = "SlotConflictError";
    this.current = current;
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json().catch(() => ({ success: false, error: "API did not return JSON. Check that the backend or dev proxy is running." }));
  if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json.data as T;
}

export async function listSchedule(from: string, to: string): Promise<ScheduleEntry[]> {
  const qs = new URLSearchParams({ from, to }).toString();
  return apiFetch<ScheduleEntry[]>(`/schedule?${qs}`);
}

export async function upsertSlot(payload: UpsertSlotPayload): Promise<ScheduleEntry> {
  const res = await fetch(`${BASE}/schedule`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({ success: false, error: "API did not return JSON. Check that the backend or dev proxy is running." }));
  if (res.status === 409) {
    throw new SlotConflictError(json.error ?? "Slot changed on another device.", (json.data as ScheduleEntry) ?? null);
  }
  if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json.data as ScheduleEntry;
}

export async function updateSlotStatus(id: string, status: SlotStatus, notes?: string): Promise<ScheduleEntry> {
  return apiFetch<ScheduleEntry>(`/schedule/${id}`, { method: "PATCH", body: JSON.stringify({ status, notes }) });
}

export async function clearSlot(id: string): Promise<void> {
  await apiFetch<{ id: string }>(`/schedule/${id}`, { method: "DELETE" });
}
