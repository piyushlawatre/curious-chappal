/**
 * CompleteView.tsx — Final sign-off page.
 *
 * Two actions only:
 *   1. Sign-off checklist  — idea is locked and ready to record (not yet made)
 *   2. Mark video as made  — video was recorded and published
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp, staggerContainer, fadeUpItem, springPop, springTick, tBar } from "../lib/motion";
import type { ProductionChecklist } from "../types";
import { getIdea, updateIdea, toggleVideoMade, type IdeaFull } from "../api/ideas";
import { formatDateTime } from "../utils/workflow";

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function Ico({ d, size = 13, stroke = 1.6, fill = "none" }: {
  d: React.ReactNode; size?: number; stroke?: number; fill?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

const IcoArrowLeft = (p: { s?: number }) => <Ico size={p.s ?? 13} d={<path d="M19 12H5M11 18l-6-6 6-6" />} />;
const IcoCheck     = (p: { s?: number; str?: number }) => <Ico size={p.s ?? 13} stroke={p.str ?? 2.2} d={<path d="M5 13l4 4L19 7" />} />;
const IcoWarning   = (p: { s?: number }) => <Ico size={p.s ?? 13} d={<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></>} />;
const IcoStar      = (p: { s?: number }) => <Ico size={p.s ?? 13} fill="currentColor" stroke={0} d={<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />} />;
const IcoShield    = (p: { s?: number }) => <Ico size={p.s ?? 13} d={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>} />;

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const show = (text: string) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setMsg(text);
    timer.current = window.setTimeout(() => setMsg(null), 2600);
  };
  return { msg, show };
}

function Toast({ msg }: { msg: string | null }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={springPop}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] text-[12.5px] font-medium text-white"
          style={{ background: "#0a0a0a", boxShadow: "0 4px 20px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.08)" }}
        >
          <IcoCheck s={12} />
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Checklist
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_CHECKLIST: ProductionChecklist = {
  scriptVerified: false,
  shotListVerified: false,
  brollVerified: false,
  onScreenTextVerified: false,
  audioVerified: false,
  thumbnailsAndSourcesVerified: false,
  passedToProduction: false,
};

const CHECKLIST_ITEMS: Array<{ key: keyof ProductionChecklist; label: string; detail: string }> = [
  { key: "scriptVerified",               label: "Script locked",                 detail: "Final spoken script, title, hook, payoff, and host tone are verified." },
  { key: "shotListVerified",             label: "Shot list verified",            detail: "Scene order, pacing beats, and editor handoff are complete." },
  { key: "brollVerified",               label: "B-roll verified",               detail: "B-roll plan, prompts, visual references, and usage warnings are reviewed." },
  { key: "onScreenTextVerified",         label: "On-screen text verified",       detail: "Captions, labels, supers, and key text beats are ready." },
  { key: "audioVerified",               label: "Audio verified",                detail: "SFX, music, and mastering checklist are signed off." },
  { key: "thumbnailsAndSourcesVerified", label: "Thumbnails & sources verified", detail: "Thumbnail concepts, source links, and licensing notes are checked." },
  { key: "passedToProduction",           label: "Idea signed off — ready to record", detail: "All items above are verified. This idea is locked and ready to go in front of camera." },
];

function SignOffChecklist({ checklist, readyAt, onChange }: {
  checklist: ProductionChecklist;
  readyAt: string;
  onChange: (c: ProductionChecklist) => void;
}) {
  const completed    = CHECKLIST_ITEMS.filter(i => checklist[i.key]).length;
  const allReady     = completed === CHECKLIST_ITEMS.length;
  const prereqsReady = CHECKLIST_ITEMS.filter(i => i.key !== "passedToProduction").every(i => checklist[i.key]);

  const toggle = (key: keyof ProductionChecklist) => {
    if (key === "passedToProduction" && !checklist.passedToProduction && !prereqsReady) return;
    const next = { ...checklist, [key]: !checklist[key] };
    if (key !== "passedToProduction" && checklist[key]) next.passedToProduction = false;
    onChange(next);
  };

  return (
    <div className="overflow-hidden rounded-[14px] bg-white"
         style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
           style={{ borderBottom: "1px solid #ecebe5", background: allReady ? "#f0fdf4" : "#faf9f7" }}>
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-[8px]"
                style={{ background: allReady ? "#dcfce7" : "#f3f2ee", color: allReady ? "#15803d" : "#71717a" }}>
            <IcoShield s={14} />
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-zinc-950 tracking-[-0.01em]">Sign-off checklist</p>
            <p className="text-[11.5px] text-zinc-500 mt-0.5">Idea locked and ready to record — video not yet made</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-[5px] text-[11px] font-semibold"
              style={{ background: allReady ? "#e8f7ef" : "#fdf3dc", color: allReady ? "#0f5132" : "#6b430a", boxShadow: `inset 0 0 0 1px ${allReady ? "#bce8cf" : "#f6dc9c"}` }}>
          {allReady ? <IcoCheck s={11} str={2.8} /> : <IcoWarning s={11} />}
          {allReady ? "Signed off" : <span className="inline-flex items-center"><CountUp value={completed} /> / {CHECKLIST_ITEMS.length}</span>}
        </span>
      </div>

      {/* Progress */}
      <div className="h-1 w-full bg-zinc-100">
        <motion.div
          className="h-full"
          style={{ background: allReady ? "#16a34a" : "#d3501c" }}
          initial={{ width: 0 }}
          animate={{ width: `${(completed / CHECKLIST_ITEMS.length) * 100}%` }}
          transition={tBar}
        />
      </div>

      {/* Items */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-px sm:grid-cols-2" style={{ background: "#ecebe5" }}>
        {CHECKLIST_ITEMS.map(item => {
          const checked  = checklist[item.key];
          const isFinal  = item.key === "passedToProduction";
          const disabled = isFinal && !checked && !prereqsReady;
          return (
            <motion.button
              key={item.key}
              type="button"
              variants={fadeUpItem}
              disabled={disabled}
              onClick={() => toggle(item.key)}
              className={`flex items-start gap-3 bg-white px-4 py-3.5 text-left transition motion-press
                ${isFinal ? "sm:col-span-2" : ""}
                ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-[#faf9f7]"}`}
            >
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[5px]"
                    style={{ background: checked ? "#16a34a" : "#ffffff", color: checked ? "#ffffff" : "#a1a1aa", boxShadow: checked ? "none" : "inset 0 0 0 1px #d8d5c8" }}>
                {checked && (
                  <motion.span initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={springTick} className="inline-flex">
                    <IcoCheck s={12} str={2.8} />
                  </motion.span>
                )}
              </span>
              <span className="min-w-0">
                <span className={`block text-[12.5px] font-semibold ${isFinal ? "text-zinc-900" : "text-zinc-800"}`}>{item.label}</span>
                <span className="mt-0.5 block text-[11px] leading-[1.5] text-zinc-500">{item.detail}</span>
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Signed-off timestamp */}
      {allReady && readyAt && (
        <div className="px-5 py-3 text-[11.5px] text-emerald-700 font-medium"
             style={{ borderTop: "1px solid #ecebe5", background: "#f0fdf4" }}>
          Signed off {formatDateTime(readyAt)}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mark video as made
// ─────────────────────────────────────────────────────────────────────────────

function MarkAsMade({ videoMade, productionReadyAt, signedOff, loading, onClick }: {
  videoMade: boolean;
  productionReadyAt: string;
  signedOff: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  const disabled = loading || (!videoMade && !signedOff);

  return (
    <div className="overflow-hidden rounded-[14px]"
         style={{ background: videoMade ? "#f0fdf4" : "#ffffff", boxShadow: "inset 0 0 0 1px " + (videoMade ? "#bce8cf" : "rgba(15,15,15,0.08)") }}>
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13.5px] font-semibold text-zinc-950 tracking-[-0.01em]">Mark video as made</p>
          <p className="mt-1 text-[12px] text-zinc-500 leading-[1.55]">
            {videoMade
              ? "This video has been recorded and published."
              : signedOff
                ? "Mark this once the video has been recorded and published."
                : "Complete the sign-off checklist before marking the video as made."}
          </p>
          {videoMade && productionReadyAt && (
            <p className="mt-1.5 text-[11.5px] text-emerald-700 font-medium">
              Published {formatDateTime(productionReadyAt)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-disabled={disabled}
          className="shrink-0 h-10 px-5 rounded-[9px] text-[13px] font-semibold inline-flex items-center gap-2 transition-all motion-press disabled:opacity-60 disabled:cursor-not-allowed"
          style={videoMade
            ? { background: "#ffffff", color: "#6b7280", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.10)" }
            : { background: "#0a0a0a", color: "#ffffff", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.18)" }
          }
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : videoMade
              ? <><IcoCheck s={13} /> Published</>
              : <><IcoStar s={13} /> Mark as made</>
          }
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

export type CompleteViewProps = {
  ideaId: string;
  onBack: () => void;
  onOpenStepper: (ideaId: string) => void;
};

export default function CompleteView({ ideaId, onBack, onOpenStepper }: CompleteViewProps) {
  const [idea,    setIdea]    = useState<IdeaFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [marking, setMarking] = useState(false);
  const { msg: toastMsg, show: showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getIdea(ideaId)
      .then(data  => { if (!cancelled) { setIdea(data);  setLoading(false); } })
      .catch(err  => { if (!cancelled) { setError(err instanceof Error ? err.message : "Failed to load"); setLoading(false); } });
    return () => { cancelled = true; };
  }, [ideaId]);

  const checklist: ProductionChecklist = useMemo(() => ({
    ...EMPTY_CHECKLIST,
    ...(idea?.productionChecklist ?? {}),
  }), [idea?.productionChecklist]);
  const signedOff = Object.values(checklist).every(Boolean);

  const handleChecklistChange = async (next: ProductionChecklist) => {
    if (!idea) return;
    const allDone = Object.values(next).every(Boolean);
    const readyAt = allDone
      ? (idea.productionReadyAt || new Date().toISOString())
      : "";
    setIdea(prev => prev ? { ...prev, productionChecklist: next, productionReadyAt: readyAt } : prev);
    setSaving(true);
    try {
      const updated = await updateIdea(ideaId, { productionChecklist: next, productionReadyAt: readyAt });
      setIdea(updated);
    } catch {
      showToast("Failed to save checklist");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkDone = async () => {
    if (!idea) return;
    if (!idea.videoMade && !signedOff) {
      showToast("Complete sign-off before marking as made");
      return;
    }
    const next = !idea.videoMade;
    setMarking(true);
    try {
      const updated = await toggleVideoMade(ideaId, next);
      setIdea(prev => prev ? { ...prev, videoMade: updated.videoMade, title: updated.title } : prev);
      showToast(next ? "Video marked as made" : "Unmarked");
    } catch {
      showToast("Failed to update");
    } finally {
      setMarking(false);
    }
  };

  // ── Shared header ──────────────────────────────────────────────────────────

  const Header = () => (
    <div className="shrink-0 flex items-center gap-3 px-5 h-[52px]"
         style={{ background: "#ffffff", borderBottom: "1px solid #ecebe5" }}>
      <button type="button" onClick={onBack}
              className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 text-zinc-600 hover:bg-zinc-100 transition motion-press shrink-0"
              style={{ background: "#faf9f7", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
        <IcoArrowLeft s={12} /> Ideas
      </button>

      {idea && (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold text-zinc-950 truncate tracking-[-0.01em]">{idea.title}</p>
            {saving && <p className="text-[11px] text-zinc-400">Saving…</p>}
          </div>
          <button type="button" onClick={() => onOpenStepper(ideaId)}
                  className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 text-zinc-600 hover:bg-zinc-50 transition motion-press shrink-0"
                  style={{ background: "#faf9f7", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
            Open in stepper
          </button>
        </>
      )}
    </div>
  );

  // ── States ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="h-screen flex flex-col" style={{ background: "#faf9f7" }}>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#d3501c] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="h-screen flex flex-col" style={{ background: "#faf9f7" }}>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-zinc-500">{error ?? "Idea not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#faf9f7" }}>
      <Header />

      <div className="flex-1 overflow-y-auto">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-[680px] mx-auto px-4 sm:px-6 py-7 space-y-4">

          {/* Sign-off checklist */}
          <motion.div variants={fadeUpItem}>
            <SignOffChecklist
              checklist={checklist}
              readyAt={idea.productionReadyAt ?? ""}
              onChange={handleChecklistChange}
            />
          </motion.div>

          {/* Mark as made */}
          <motion.div variants={fadeUpItem}>
            <MarkAsMade
              videoMade={idea.videoMade}
              productionReadyAt={idea.productionReadyAt ?? ""}
              signedOff={signedOff}
              loading={marking}
              onClick={handleMarkDone}
            />
          </motion.div>

          <div className="h-6" />
        </motion.div>
      </div>

      <Toast msg={toastMsg} />
    </div>
  );
}
