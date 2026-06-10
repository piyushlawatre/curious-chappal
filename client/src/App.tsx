import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StepEditor from "./components/StepEditor";
import WorkflowLayout from "./components/WorkflowLayout";
import WorkflowSummary from "./components/WorkflowSummary";
import IdeasList, { defaultIdeasFilterState, type IdeasFilterState } from "./components/IdeasList";
import Dashboard from "./components/Dashboard";
import CalendarView from "./components/CalendarView";
import RetroView from "./components/RetroView";
import type { BannerMessage, ProductionChecklist, WorkflowSession } from "./types";
import {
  createDefaultSession,
  createEmptyProductionChecklist,
  refreshSession,
  updateStepWithDependentInvalidation,
} from "./utils/workflow";
import { knowledgeBaseByStep } from "./data/knowledgeBase";
import { getIdea, saveSteps, type IdeaFull, type IdeaListItem, type ApiStep, type SaveStepItem } from "./api/ideas";
import CompleteView from "./components/CompleteView";
import { motion } from "framer-motion";
import { pillSpring } from "./lib/motion";

// ── View state ─────────────────────────────────────────────────────────────────

type AppView = "ideas" | "dashboard" | "calendar" | "retro" | "stepper" | "complete";
type ViewMode = "step" | "summary";

// ── Helpers ────────────────────────────────────────────────────────────────────

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function ideaToSession(idea: IdeaFull, defaultSteps: WorkflowSession["steps"]): WorkflowSession {
  // Map by step ID so order differences between DB and defaults never cause mis-merges.
  const savedById = new Map(idea.steps.map((s) => [s.id, s]));
  const merged = defaultSteps.map((def) => {
    const saved = savedById.get(def.id) as ApiStep | undefined;
    return {
      ...def,
      status:          saved?.status          ?? def.status,
      input:           saved?.input           ?? def.input,
      generatedPrompt: saved?.generatedPrompt ?? def.generatedPrompt,
      aiOutput:        saved?.aiOutput        ?? def.aiOutput,
      stepNotes:       saved?.stepNotes       ?? "",
      gaps:            saved?.gaps            ?? "",
      decision:        saved?.decision        ?? "",
      nextAction:      saved?.nextAction      ?? "",
      outputHistory:   saved?.outputHistory   ?? [],
    };
  });

  const productionChecklist = {
    ...createEmptyProductionChecklist(),
    ...(idea.productionChecklist ?? {}),
  };

  return refreshSession({
    id: idea._id,
    title: idea.title,
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
    productionChecklist,
    productionReadyAt: idea.productionReadyAt ?? "",
    steps: merged,
  }, false);
}

/**
 * Map a frontend WorkflowSession step into the full SaveStepItem shape.
 * This includes the compiled generatedPrompt and a snapshot of every
 * knowledge-base MD file used to build the prompt — so MongoDB holds
 * the complete, self-contained record of every step.
 */
function sessionToApiSteps(session: WorkflowSession): SaveStepItem[] {
  return session.steps.map((s) => ({
    id:              s.id,
    stepNumber:      s.stepNumber,
    name:            s.name,
    description:     s.description,
    status:          s.status,
    input:           s.input,
    generatedPrompt: s.generatedPrompt,
    aiOutput:        s.aiOutput,
    // Snapshot of all knowledge-base MD files for this step
    knowledgeFiles:  (knowledgeBaseByStep[s.id] ?? []).map((f) => ({
      path:    f.path,
      content: f.content,
    })),
    stepNotes:     s.stepNotes     ?? "",
    gaps:          s.gaps          ?? "",
    decision:      s.decision      ?? "",
    nextAction:    s.nextAction    ?? "",
    outputHistory: s.outputHistory ?? [],
  }));
}

// ── SVG Icons (inline, no dependency) ─────────────────────────────────────────

function Icon({ d, size = 13, className = "", stroke = 1.6 }: {
  d: React.ReactNode; size?: number; className?: string; stroke?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {d}
    </svg>
  );
}

const GridIcon = ({ size = 12 }: { size?: number }) => (
  <Icon size={size} d={<><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></>}/>
);
const BarsIcon = ({ size = 12 }: { size?: number }) => (
  <Icon size={size} d={<path d="M4 20V10M10 20V4M16 20v-7M22 20v-4"/>}/>
);
const CalIcon = ({ size = 12 }: { size?: number }) => (
  <Icon size={size} d={<><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>}/>
);
const RetroIcon = ({ size = 12 }: { size?: number }) => (
  <Icon size={size} d={<><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 8v4l3 2"/></>}/>
);
const SpinIcon = ({ size = 12 }: { size?: number }) => (
  <Icon size={size} className="animate-spin" d={<><path d="M21 12a9 9 0 11-6.2-8.6"/><path d="M21 3v6h-6"/></>}/>
);

// ── Top Nav ────────────────────────────────────────────────────────────────────

function TopNav({ active, onIdeas, onDashboard, onCalendar, onRetro }: {
  active: "ideas" | "dashboard" | "calendar" | "retro";
  onIdeas: () => void;
  onDashboard: () => void;
  onCalendar: () => void;
  onRetro: () => void;
}) {
  return (
    <header className="shrink-0 flex items-center px-3 sm:px-5 h-[48px] motion-panel"
            style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-[8px] grid place-items-center motion-pop shrink-0"
             style={{ background: "#d3501c", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)" }}>
          <span className="font-mono text-[11px] font-bold text-white">cc</span>
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="text-[12.5px] font-semibold text-white tracking-[-0.01em]">Curious Engine</p>
          <p className="text-[9.5px] text-zinc-500 -mt-0.5">Content studio</p>
        </div>
      </div>

      <div className="h-6 w-px bg-white/[0.08] mx-3 sm:mx-5" />

      <nav
        aria-label="Primary"
        className="flex items-center gap-1 rounded-[10px] border border-white/[0.08] bg-[#111111] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]"
      >
        <NavBtn label="Ideas" icon={<GridIcon />} active={active === "ideas"} onClick={onIdeas} />
        <NavBtn label="Dashboard" icon={<BarsIcon />} active={active === "dashboard"} onClick={onDashboard} />
        <NavBtn label="Calendar" icon={<CalIcon />} active={active === "calendar"} onClick={onCalendar} />
        <NavBtn label="Retro" icon={<RetroIcon />} active={active === "retro"} onClick={onRetro} />
      </nav>

      <div className="flex-1" />
    </header>
  );
}

function NavBtn({ label, icon, active, onClick }: {
  label: string; icon: React.ReactNode; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group relative h-8 px-2.5 sm:px-3 inline-flex items-center gap-2 rounded-[7px] text-[12px] font-medium transition-colors motion-press focus-visible:!outline-none focus-visible:ring-2 focus-visible:ring-[#d3501c]/45 ${
        active ? "text-white" : "text-zinc-400 hover:text-white hover:bg-white/[0.055]"
      }`}
    >
      {active && (
        <motion.span
          layoutId="topNavPill"
          transition={pillSpring}
          className="absolute inset-0 rounded-[7px] bg-white/[0.095] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),0_8px_18px_rgba(0,0,0,0.22)]"
        />
      )}
      {active && <span className="absolute inset-x-3 bottom-0 z-10 h-px rounded-full bg-[#d3501c]" />}
      <span className={`relative z-10 ${active ? "text-[#ef7a3e]" : "text-zinc-500 group-hover:text-zinc-300"}`}>
        {icon}
      </span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function StepperLoading({ title, banner, onGoIdeas, onGoDashboard }: {
  title?: string;
  banner: BannerMessage | null;
  onGoIdeas: () => void;
  onGoDashboard: () => void;
}) {
  return (
    <WorkflowLayout
      steps={createDefaultSession().steps}
      activeIndex={0}
      isSummaryActive={false}
      banner={banner}
      onSelectStep={() => undefined}
      onShowSummary={() => undefined}
      onGoIdeas={onGoIdeas}
      onGoDashboard={onGoDashboard}
      activeIdeaTitle={title || undefined}
    >
      <div className="h-full grid place-items-center bg-white">
        <div className="inline-flex items-center gap-2 rounded-[8px] border border-zinc-200 bg-white px-3 py-2 text-[12px] font-medium text-zinc-600 shadow-sm">
          <SpinIcon size={13} />
          Opening idea
        </div>
      </div>
    </WorkflowLayout>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────────

export default function App() {
  type HistoryState = {
    view: AppView;
    activeIdeaId: string | null;
    activeIdeaTitle: string;
    activeIndex: number;
    viewMode: ViewMode;
  };

  const readHistoryState = (): HistoryState => {
    const s = history.state as HistoryState | null;
    return s ?? { view: "ideas", activeIdeaId: null, activeIdeaTitle: "", activeIndex: 0, viewMode: "step" };
  };

  const hs = readHistoryState();
  const [view,            setView]            = useState<AppView>(hs.view);
  const [activeIdeaId,    setActiveIdeaId]    = useState<string | null>(hs.activeIdeaId);
  const [completionIdeaId, setCompletionIdeaId] = useState<string | null>(null);
  const [activeIdeaTitle, setActiveIdeaTitle] = useState<string>(hs.activeIdeaTitle);

  const defaultSession = useMemo(() => createDefaultSession(), []);
  const [session,     setSession]     = useState<WorkflowSession>(defaultSession);
  const [activeIndex, setActiveIndex] = useState(hs.activeIndex);
  const [viewMode,    setViewMode]    = useState<ViewMode>(hs.viewMode);
  const [ideaLoading, setIdeaLoading] = useState(false);

  const navigate = (patch: Partial<HistoryState>) => {
    const current: HistoryState = { view, activeIdeaId, activeIdeaTitle, activeIndex, viewMode };
    const next: HistoryState = { ...current, ...patch };
    // Skip pushing a duplicate entry when nothing changed (e.g. clicking the
    // already-active nav tab) — otherwise the back button appears to do nothing.
    const changed = (Object.keys(next) as (keyof HistoryState)[]).some((k) => next[k] !== current[k]);
    if (changed) history.pushState(next, "");
    if (patch.view             !== undefined) setView(patch.view);
    if (patch.activeIdeaId     !== undefined) setActiveIdeaId(patch.activeIdeaId);
    if (patch.activeIdeaTitle  !== undefined) setActiveIdeaTitle(patch.activeIdeaTitle);
    if (patch.activeIndex      !== undefined) setActiveIndex(patch.activeIndex);
    if (patch.viewMode         !== undefined) setViewMode(patch.viewMode);
  };

  useEffect(() => {
    const initial: HistoryState = { view, activeIdeaId, activeIdeaTitle, activeIndex, viewMode };
    history.replaceState(initial, "");
    const onPop = (e: PopStateEvent) => {
      const s = e.state as HistoryState | null;
      if (!s) return;
      setView(s.view);
      setActiveIdeaId(s.activeIdeaId);
      setActiveIdeaTitle(s.activeIdeaTitle);
      setActiveIndex(s.activeIndex);
      setViewMode(s.viewMode);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [banner, setBanner] = useState<BannerMessage | null>(null);
  const saveTimer      = useRef<number | null>(null);
  const lastSaved      = useRef<string>("");
  // Tracks which idea id has been fetched into `session`, so history restores
  // don't start duplicate loads while still preventing stale-session flashes.
  const loadedIdeaRef  = useRef<string | null>(null);
  const useServerStepOnLoadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 2800);
    return () => window.clearTimeout(t);
  }, [banner]);

  const openIdeaFromFull = (idea: IdeaFull, stepIndex = 0) => {
    const sess = ideaToSession(idea, defaultSession.steps);
    const allComplete = sess.steps.every(s => s.status === "completed");
    const safeStepIndex = Math.min(Math.max(stepIndex, 0), sess.steps.length - 1);
    setSession(sess);
    loadedIdeaRef.current = idea._id;
    lastSaved.current = JSON.stringify({ steps: sess.steps, idx: safeStepIndex });
    navigate({
      view: "stepper",
      activeIdeaId:    idea._id,
      activeIdeaTitle: idea.title,
      activeIndex:     safeStepIndex,
      viewMode:        allComplete ? "summary" : "step",
    });
  };

  const openIdea = (ideaId: string, title = "") => {
    setBanner(null);
    if (session.id === ideaId && loadedIdeaRef.current === ideaId) {
      useServerStepOnLoadRef.current = null;
      navigate({
        view: "stepper",
        activeIdeaId: ideaId,
        activeIdeaTitle: title || activeIdeaTitle,
        activeIndex,
        viewMode,
      });
      return;
    }

    useServerStepOnLoadRef.current = ideaId;
    loadedIdeaRef.current = null;
    navigate({
      view: "stepper",
      activeIdeaId: ideaId,
      activeIdeaTitle: title,
      activeIndex: 0,
      viewMode: "step",
    });
  };

  useEffect(() => {
    if (view !== "stepper" || !activeIdeaId) return;
    if (session.id === activeIdeaId && loadedIdeaRef.current === activeIdeaId) return;

    let cancelled = false;
    loadedIdeaRef.current = activeIdeaId;
    setIdeaLoading(true);
    setBanner(null);
    getIdea(activeIdeaId)
      .then((idea) => {
        if (cancelled) return;
        const sess = ideaToSession(idea, defaultSession.steps);
        const useServerStep = useServerStepOnLoadRef.current === activeIdeaId;
        const nextIndex = Math.min(
          useServerStep ? idea.currentStepIndex ?? 0 : activeIndex,
          sess.steps.length - 1
        );
        const allComplete = sess.steps.every(s => s.status === "completed");
        setSession(sess);
        setActiveIdeaTitle(idea.title);
        setActiveIndex(nextIndex);
        if (useServerStep) {
          setViewMode(allComplete ? "summary" : "step");
          useServerStepOnLoadRef.current = null;
        }
        lastSaved.current = JSON.stringify({ steps: sess.steps, idx: nextIndex });
      })
      .catch((err) => {
        if (!cancelled) {
          setBanner({ message: err instanceof Error ? err.message : "Failed to load idea", tone: "error" });
        }
      })
      .finally(() => {
        if (!cancelled) setIdeaLoading(false);
      });

    return () => {
      cancelled = true;
      setIdeaLoading(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeIdeaId, session.id, defaultSession.steps]);

  // ── Auto-save to MongoDB (debounced 1.2 s) ───────────────────────────────────
  // No localStorage — backend is the single source of truth.
  //
  // Robust against navigate-away / tab-close: the latest dirty payload is held in
  // pendingRef and flushed (a) on the debounce timer, (b) on effect cleanup when
  // the user leaves the stepper, and (c) on beforeunload. Failed saves keep the
  // snapshot dirty, surface a banner, and auto-retry with backoff.
  const pendingRef    = useRef<{ id: string; idx: number; steps: SaveStepItem[]; snapshot: string } | null>(null);
  const retryRef      = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const flushingRef   = useRef(false);

  // Performs the actual PUT. Resolves true on success. On failure keeps the
  // payload pending, shows a banner, and schedules a backoff retry.
  const flushSave = useCallback(async (): Promise<boolean> => {
    const p = pendingRef.current;
    if (!p || flushingRef.current) return false;
    flushingRef.current = true;
    try {
      await saveSteps(p.id, { currentStepIndex: p.idx, steps: p.steps });
      // Only clear if nothing newer arrived while we were in flight.
      if (pendingRef.current && pendingRef.current.snapshot === p.snapshot) {
        lastSaved.current = p.snapshot;
        pendingRef.current = null;
      }
      retryCountRef.current = 0;
      if (retryRef.current !== null) { window.clearTimeout(retryRef.current); retryRef.current = null; }
      return true;
    } catch {
      // Keep pendingRef dirty so the next change or retry re-attempts it.
      setBanner({ message: "Couldn't save your latest edits — retrying…", tone: "error" });
      const attempt = (retryCountRef.current = Math.min(retryCountRef.current + 1, 5));
      const delay   = Math.min(1200 * 2 ** (attempt - 1), 30000); // 1.2s → 30s cap
      if (retryRef.current !== null) window.clearTimeout(retryRef.current);
      retryRef.current = window.setTimeout(() => { void flushSave(); }, delay);
      return false;
    } finally {
      flushingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!activeIdeaId || session.id !== activeIdeaId) return;

    const snapshot = JSON.stringify({ steps: session.steps, idx: activeIndex });
    if (snapshot === lastSaved.current) return;

    // Stage the newest payload so any flush path picks it up.
    pendingRef.current = { id: activeIdeaId, idx: activeIndex, steps: sessionToApiSteps(session), snapshot };

    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => { void flushSave(); }, 1200);

    // Cleanup runs on unmount and whenever deps change (i.e. user edits again or
    // navigates away). Flush the staged payload so a sub-1.2s edit isn't lost.
    return () => {
      if (saveTimer.current !== null) { window.clearTimeout(saveTimer.current); saveTimer.current = null; }
      if (pendingRef.current) void flushSave();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, activeIndex]);

  // Last-ditch flush when the tab is closing/hidden. Uses sendBeacon (survives
  // unload) when available, falling back to a keepalive fetch.
  useEffect(() => {
    const beaconSave = () => {
      const p = pendingRef.current;
      if (!p) return;
      const url  = `${import.meta.env.VITE_API_URL ?? "/api"}/ideas/${p.id}/steps`;
      const body = JSON.stringify({ currentStepIndex: p.idx, steps: p.steps });
      try {
        // keepalive lets this PATCH outlive the unloading document. sendBeacon is
        // not used because it can only POST, and the steps route is PATCH-only.
        void fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body, keepalive: true });
      } catch { /* best effort */ }
    };
    const onHide = () => { if (document.visibilityState === "hidden") beaconSave(); };
    window.addEventListener("beforeunload", beaconSave);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("beforeunload", beaconSave);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  const updateStep = (index: number, patch: Partial<WorkflowSession["steps"][number]>) => {
    setSession((prev) => updateStepWithDependentInvalidation(prev, index, patch));
  };

  // Ideas-board filter state is owned here so it survives IdeasList unmounting
  // when the user opens an idea and returns. Plain back navigation keeps it;
  // a dashboard lane click overrides the lane (see goIdeas).
  const [ideasFilter, setIdeasFilter] = useState<IdeasFilterState>(defaultIdeasFilterState);
  const [ideasCache, setIdeasCache] = useState<IdeaListItem[]>([]);
  const patchIdeasFilter = (patch: Partial<IdeasFilterState>) =>
    setIdeasFilter((prev) => ({ ...prev, ...patch }));
  const goIdeas     = (lane?: string) => {
    // Guard: some callers wire this directly to onClick (e.g. a back button),
    // which would pass a SyntheticEvent here. Only accept an actual string lane.
    if (typeof lane === "string" && lane) {
      patchIdeasFilter({ laneFilter: lane as IdeasFilterState["laneFilter"], page: 1 });
    }
    navigate({ view: "ideas", activeIdeaId: null, activeIdeaTitle: "" });
  };
  const goDashboard = () => { navigate({ view: "dashboard" }); };
  const goCalendar  = () => { navigate({ view: "calendar" }); };
  const goRetro     = () => { navigate({ view: "retro" }); };
  const openCompletion = (id: string) => { setCompletionIdeaId(id); navigate({ view: "complete" }); };
  const selectStep  = (index: number) => navigate({ activeIndex: index, viewMode: "step" });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isEditableTarget(e.target)) return;
      // Don't hijack keys while a dialog or any open menu/listbox has focus.
      if (document.querySelector("[role='dialog']")) return;
      if (document.querySelector("[aria-expanded='true']")) return;

      const key = e.key.toLowerCase();
      if (key === "i") {
        e.preventDefault();
        goIdeas();
      } else if (key === "d") {
        e.preventDefault();
        goDashboard();
      } else if (key === "c") {
        e.preventDefault();
        goCalendar();
      } else if (key === "r" && view !== "stepper") {
        e.preventDefault();
        goRetro();
      } else if (view === "stepper" && key === "s") {
        e.preventDefault();
        navigate({ viewMode: "summary" });
      } else if (view === "stepper" && /^[1-5]$/.test(key)) {
        const nextIndex = Number(key) - 1;
        if (nextIndex < session.steps.length) {
          e.preventDefault();
          selectStep(nextIndex);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, session.steps.length]);

  const activeStep = session.steps[activeIndex] ?? session.steps[0];
  if (!activeStep) return null;

  const saveStepOutput = (index: number, value: string, status: "output_added" | "completed" = "output_added") => {
    const stepToSave = session.steps[index];
    if (!stepToSave) return;

    const prevOutput  = stepToSave.aiOutput?.trim();
    const prevHistory = stepToSave.outputHistory ?? [];
    const nextHistory =
      prevOutput && prevOutput !== value.trim()
        ? [...prevHistory, { prompt: stepToSave.generatedPrompt ?? "", output: prevOutput, savedAt: new Date().toISOString() }].slice(-3)
        : prevHistory;

    updateStep(index, { aiOutput: value, status, outputHistory: nextHistory });
  };

  const saveEditorBriefOutput = (value: string) => {
    const editorBriefIndex = session.steps.findIndex((step) => step.id === "04_EDITOR_BRIEF");
    if (editorBriefIndex < 0) return;

    saveStepOutput(editorBriefIndex, value, "completed");
  };



  const completeStep = (index: number, moveForward = false, outputValue?: string) => {
    const stepToComplete = session.steps[index];
    const hasOutput = Boolean(outputValue?.trim() || stepToComplete?.aiOutput.trim());
    if (!stepToComplete || !hasOutput) return;

    if (outputValue !== undefined) {
      saveStepOutput(index, outputValue, "completed");
    } else {
      updateStep(index, { status: "completed" });
    }

    const allComplete = session.steps.every((step, stepIndex) =>
      stepIndex === index ? true : step.status === "completed"
    );

    if (allComplete) {
      navigate({ activeIndex: index, viewMode: "summary" });
      setBanner({ message: "All steps complete. Final output is ready.", tone: "success" });
      return;
    }

    if (moveForward) {
      navigate({ activeIndex: Math.min(session.steps.length - 1, index + 1), viewMode: "step" });
      setBanner({ message: `${stepToComplete.name} saved. Moving to the next step.`, tone: "success" });
      return;
    }

    setBanner({ message: `${stepToComplete.name} marked complete.`, tone: "success" });
  };

  // ── Ideas view ─────────────────────────────────────────────────────────────

  if (view === "ideas") {
    return (
      <div className="h-screen overflow-hidden flex flex-col motion-page" style={{ background: "#faf9f7" }}>
        <TopNav active="ideas" onIdeas={() => goIdeas()} onDashboard={goDashboard} onCalendar={goCalendar} onRetro={goRetro} />
        <div className="flex-1 min-h-0">
          <IdeasList
            onOpenIdea={openIdea}
            onOpenIdeaFull={openIdeaFromFull}
            onOpenCompletion={openCompletion}
            filterState={ideasFilter}
            onFilterStateChange={patchIdeasFilter}
            initialIdeas={ideasCache}
            onIdeasLoaded={setIdeasCache}
          />
        </div>
      </div>
    );
  }

  // ── Dashboard view ─────────────────────────────────────────────────────────

  if (view === "dashboard") {
    return (
      <div className="h-screen overflow-hidden flex flex-col motion-page" style={{ background: "#faf9f7" }}>
        <TopNav active="dashboard" onIdeas={() => goIdeas()} onDashboard={goDashboard} onCalendar={goCalendar} onRetro={goRetro} />
        <div className="flex-1 min-h-0">
          <Dashboard onGoIdeas={goIdeas} onOpenIdea={openIdea} />
        </div>
      </div>
    );
  }

  // ── Calendar view ──────────────────────────────────────────────────────────

  if (view === "calendar") {
    return (
      <div className="h-screen overflow-hidden flex flex-col motion-page" style={{ background: "#faf9f7" }}>
        <TopNav active="calendar" onIdeas={() => goIdeas()} onDashboard={goDashboard} onCalendar={goCalendar} onRetro={goRetro} />
        <div className="flex-1 min-h-0">
          <CalendarView onOpenIdea={openIdea} />
        </div>
      </div>
    );
  }

  // ── Retro view ─────────────────────────────────────────────────────────────

  if (view === "retro") {
    return (
      <div className="h-screen overflow-hidden flex flex-col motion-page" style={{ background: "#faf9f7" }}>
        <TopNav active="retro" onIdeas={() => goIdeas()} onDashboard={goDashboard} onCalendar={goCalendar} onRetro={goRetro} />
        <div className="flex-1 min-h-0">
          <RetroView />
        </div>
      </div>
    );
  }

  // ── Complete view ─────────────────────────────────────────────────────────

  if (view === "complete" && completionIdeaId) {
    return (
      <CompleteView
        ideaId={completionIdeaId}
        onBack={() => goIdeas()}
        onOpenStepper={(id) => openIdea(id)}
      />
    );
  }

  // ── Stepper view ───────────────────────────────────────────────────────────
  const stepperIsLoading = Boolean(activeIdeaId) && session.id !== activeIdeaId;
  if (stepperIsLoading) {
    return (
      <StepperLoading
        title={activeIdeaTitle}
        banner={banner}
        onGoIdeas={goIdeas}
        onGoDashboard={goDashboard}
      />
    );
  }

  return (
      <WorkflowLayout
        steps={session.steps}
        activeIndex={activeIndex}
        isSummaryActive={viewMode === "summary"}
        banner={banner}
        onSelectStep={selectStep}
        onShowSummary={() => navigate({ viewMode: "summary" })}
        onGoIdeas={goIdeas}
        onGoDashboard={goDashboard}
        activeIdeaTitle={activeIdeaTitle || undefined}
    >
      {viewMode === "summary" ? (
        <WorkflowSummary
          session={session}
          onBackToWorkflow={() => navigate({ viewMode: "step" })}
          onUpdateBriefOutput={saveEditorBriefOutput}
        />
      ) : (
        <StepEditor
          key={activeStep.id}
          step={activeStep}
          isFirstStep={activeIndex === 0}
          isLastStep={activeIndex === session.steps.length - 1}
          onInputChange={(value) => updateStep(activeIndex, { input: value })}
          onSaveOutput={(value) => {
            saveStepOutput(activeIndex, value);
            setBanner({ message: "Output saved. Related prompts refreshed.", tone: "success" });
          }}
          onClearOutput={() => {
            updateStep(activeIndex, { aiOutput: "", status: "prompt_generated" });
            setBanner({ message: "Output cleared.", tone: "success" });
          }}
          onComplete={() => {
            completeStep(activeIndex);
          }}
          onAutoAdvance={(value) => completeStep(activeIndex, true, value)}
          onPrevious={() => setActiveIndex((i) => Math.max(0, i - 1))}
          onNext={() => setActiveIndex((i) => Math.min(session.steps.length - 1, i + 1))}
          onAnnotationChange={(field, value) => updateStep(activeIndex, { [field]: value })}
        />
      )}
    </WorkflowLayout>
  );
}
