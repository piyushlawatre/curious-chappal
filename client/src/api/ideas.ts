/**
 * ideas.ts — Typed fetch wrappers for the Curious Chappal API
 */

const BASE = import.meta.env.VITE_API_URL ?? "/api";

// ── Shared types ──────────────────────────────────────────────────────────────

export type FormatLane =
  | "Real Reason" | "Hidden India" | "Smart Money/Business"
  | "Science Lite" | "Sharp Contradiction" | "Viral Social Commentary" | "One-off"
  | "Forgotten Inventor" | "Quiet Monopoly" | "Status Game" | "";

export type Verdict = "MAKE-NOW" | "REFRAME" | "MAKE-LATER" | "DROP" | "";

export type IdeaStatus =
  | "draft" | "evaluating" | "scripting" | "auditing"
  | "rewriting" | "briefing" | "production" | "dropped" | "on_hold";

export type ApiStepStatus =
  | "not_started" | "prompt_generated" | "output_added" | "completed";

export type ApiOutputHistoryEntry = { prompt: string; output: string; savedAt: string };

export type ApiKnowledgeFile = { path: string; content: string };

export type ProductionChecklist = {
  scriptVerified: boolean;
  shotListVerified: boolean;
  brollVerified: boolean;
  onScreenTextVerified: boolean;
  audioVerified: boolean;
  thumbnailsAndSourcesVerified: boolean;
  passedToProduction: boolean;
};

export type ApiStep = {
  id:              string;
  stepNumber:      string;
  name:            string;
  description:     string;
  status:          ApiStepStatus;
  input:           string;
  generatedPrompt: string;
  aiOutput:        string;
  knowledgeFiles:  ApiKnowledgeFile[];
  stepNotes:       string;
  gaps:            string;
  decision:        string;
  nextAction:      string;
  outputHistory:   ApiOutputHistoryEntry[];
};

export type IdeaListItem = {
  _id:              string;
  title:            string;
  topicIdea:        string;
  formatLane:       FormatLane;
  verdict:          Verdict;
  ideaStatus:       IdeaStatus;
  currentStepIndex: number;
  completionPct:    number;
  activeStepId:     string | null;
  steps:            Pick<ApiStep, "id" | "stepNumber" | "name" | "status">[];
  videoMade:        boolean;
  fullFormVideo:    boolean;
  productionChecklist: ProductionChecklist;
  productionReadyAt: string;
  // Manual-override flags surfaced by the API so the client can show that a field
  // won't be auto-overwritten. Optional: absent on pre-migration records.
  titleManual?:      boolean;
  formatLaneManual?: boolean;
  verdictManual?:    boolean;
  createdAt:        string;
  updatedAt:        string;
};

export type IdeaFull = Omit<IdeaListItem, "steps"> & { steps: ApiStep[]; notes: string };

export type CreateIdeaPayload = {
  title:             string;
  topicIdea?:        string;
  notes?:            string;
  formatLane?:       FormatLane;
  verdict?:          Verdict;
};

export type UpdateIdeaPayload = Partial<
  Pick<IdeaFull, "title" | "topicIdea" | "notes" | "formatLane" | "verdict" | "ideaStatus" | "videoMade" | "fullFormVideo" | "productionChecklist" | "productionReadyAt">
>;
// Note: sending `title`/`formatLane`/`verdict` via updateIdea marks that field as
// a manual override server-side; sending it blank re-enables auto-derivation.

// Each step sent to the backend — includes every field we want persisted
export type SaveStepItem = {
  id:              string;
  stepNumber:      string;
  name:            string;
  description:     string;
  status:          ApiStepStatus;
  input:           string;
  generatedPrompt: string;
  aiOutput:        string;
  knowledgeFiles:  ApiKnowledgeFile[];
  stepNotes:       string;
  gaps:            string;
  decision:        string;
  nextAction:      string;
  outputHistory:   ApiOutputHistoryEntry[];
};

export type SaveStepsPayload = {
  currentStepIndex?: number;
  steps?:            SaveStepItem[];
  stepIndex?:        number;
  step?:             Partial<SaveStepItem>;
};

// ── Analytics types ───────────────────────────────────────────────────────────

export type LabelCount     = { label: string; count: number };
export type StepCompletion = { stepId: string; not_started: number; prompt_generated: number; output_added: number; completed: number };
export type LaneVerdictEntry  = { lane: string; verdict: string; count: number };
export type LaneCoverageEntry = { lane: string; videoMade: number; fullFormVideo: number; fullFormReady: number; production: number; inPipeline: number; draft: number; total: number };
export type StuckIdea = { _id: string; title: string; ideaStatus: IdeaStatus; currentStepIndex: number; updatedAt: string };

// Analytics returns a lightweight projection — only the fields the server actually selects.
// Intentionally narrower than IdeaListItem to avoid undefined-field bugs.
export type RecentIdeaItem = {
  _id:              string;
  title:            string;
  ideaStatus:       IdeaStatus;
  formatLane:       FormatLane;
  verdict:          Verdict;
  currentStepIndex: number;
  updatedAt:        string;
  videoMade:        boolean;
  fullFormVideo:    boolean;
};

export type AnalyticsSummary = {
  kpi: { total: number; production: number; inProgress: number; dropped: number; draft: number; videoMade: number; fullFormVideo: number };
  byStatus:           LabelCount[];
  byFormatLane:       LabelCount[];
  byVerdict:          LabelCount[];
  byLaneVerdict:      LaneVerdictEntry[];
  byLaneCoverage:     LaneCoverageEntry[];
  stepCompletion:     StepCompletion[];
  recentIdeas:        RecentIdeaItem[];
  recentFinalisedIdeas: RecentIdeaItem[];
  stuckIdeas:         StuckIdea[];
};

// ── Internal helper ───────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res  = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json().catch(() => ({ success: false, error: "API did not return JSON. Check that the backend or dev proxy is running." }));
  if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json.data as T;
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function listIdeas(filters?: {
  status?: IdeaStatus; lane?: FormatLane; verdict?: Verdict; search?: string;
}): Promise<IdeaListItem[]> {
  const params = new URLSearchParams();
  if (filters?.status)  params.set("status",  filters.status);
  if (filters?.lane)    params.set("lane",     filters.lane);
  if (filters?.verdict) params.set("verdict",  filters.verdict);
  if (filters?.search)  params.set("search",   filters.search);
  const qs  = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${BASE}/ideas${qs}`, { headers: { "Content-Type": "application/json" } });
  const json = await res.json().catch(() => ({ success: false, error: "API did not return JSON. Check that the backend or dev proxy is running." }));
  if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json.data as IdeaListItem[];
}

export async function createIdea(payload: CreateIdeaPayload): Promise<IdeaFull> {
  return apiFetch<IdeaFull>("/ideas", { method: "POST", body: JSON.stringify(payload) });
}

export async function getIdea(id: string): Promise<IdeaFull> {
  return apiFetch<IdeaFull>(`/ideas/${id}`);
}

export async function updateIdea(id: string, payload: UpdateIdeaPayload): Promise<IdeaFull> {
  return apiFetch<IdeaFull>(`/ideas/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteIdea(id: string): Promise<void> {
  const res  = await fetch(`${BASE}/ideas/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
  const json = await res.json().catch(() => ({ success: false, error: "API did not return JSON. Check that the backend or dev proxy is running." }));
  if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
}

export async function saveSteps(id: string, payload: SaveStepsPayload): Promise<IdeaFull> {
  return apiFetch<IdeaFull>(`/ideas/${id}/steps`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function toggleVideoMade(id: string, videoMade: boolean): Promise<IdeaFull> {
  return apiFetch<IdeaFull>(`/ideas/${id}`, { method: "PUT", body: JSON.stringify({ videoMade }) });
}

export async function toggleFullFormVideo(id: string, fullFormVideo: boolean): Promise<IdeaFull> {
  return apiFetch<IdeaFull>(`/ideas/${id}`, { method: "PUT", body: JSON.stringify({ fullFormVideo }) });
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  return apiFetch<AnalyticsSummary>("/ideas/analytics/summary");
}
