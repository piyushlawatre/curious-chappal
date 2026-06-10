import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tEaseFast, springTick } from "../lib/motion";
import type { WorkflowStep } from "../types";
import { getOutputContractChecks } from "../utils/workflow";

function Ico({ d, size = 13, stroke = 1.6 }: { d: React.ReactNode; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}
const CheckIco  = (p: { size?: number; stroke?: number }) => <Ico {...p} d={<path d="M5 13l4 4L19 7"/>}/>;
const TrashIco  = (p: { size?: number }) => <Ico {...p} d={<><path d="M4 7h16"/><path d="M9 7V4h6v3M6 7l1 13h10l1-13"/></>}/>;
const SpinnerIco = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={2} strokeLinecap="round" className="animate-spin">
    <circle cx="12" cy="12" r="9" strokeOpacity={0.25}/>
    <path d="M12 3a9 9 0 019 9" />
  </svg>
);

type OutputInputProps = {
  step: WorkflowStep;
  value?: string;
  draft?: string;
  onDraftChange?: (value: string) => void;
  onSave: (value: string) => void;
  onClear: () => void;
  onAutoAdvance?: (value: string) => void; // fired after auto-save when all checks pass
};

export default function OutputInput({
  step, value, draft, onDraftChange, onSave, onClear, onAutoAdvance,
}: OutputInputProps) {
  const savedValue = value ?? "";
  const isControlledDraft = typeof draft === "string" && typeof onDraftChange === "function";
  const [localDraft, setLocalDraft] = useState(savedValue);
  const activeDraft = isControlledDraft ? draft : localDraft;

  // Track whether auto-advance already fired for this step
  const autoFiredRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);
  const [autoState, setAutoState] = useState<"idle" | "saving" | "advancing">("idle");

  useEffect(() => {
    if (!isControlledDraft) setLocalDraft(savedValue);
  }, [isControlledDraft, savedValue]);

  // Reset auto-fire when step changes
  useEffect(() => {
    autoFiredRef.current = false;
    setAutoState("idle");
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
  }, [step.id]);

  const updateDraft = (v: string) => {
    if (isControlledDraft) onDraftChange(v);
    else setLocalDraft(v);
  };

  const wordCount = activeDraft.trim() ? activeDraft.trim().split(/\s+/).length : 0;
  const charCount = activeDraft.length;
  const isDirty   = activeDraft !== savedValue;

  const checks         = activeDraft.trim() ? getOutputContractChecks(step, activeDraft) : [];
  const requiredChecks = checks.filter(c => c.required);
  const passedCount    = requiredChecks.filter(c => c.ready).length;
  const allPassed      = requiredChecks.length > 0 && passedCount === requiredChecks.length;
  const isTerminal     = checks.length === 1 && checks[0]?.label === "Recognized terminal stop" && checks[0].ready;
  const contractMet    = allPassed || isTerminal;
  const canAutoAdvance = allPassed && !isTerminal;

  // ── Auto-save when contract is met, then advance on full required checks ─────
  useEffect(() => {
    if (!contractMet || !activeDraft.trim() || autoFiredRef.current) return;
    if (!isDirty && (step.status === "completed" || !canAutoAdvance)) return;
    autoFiredRef.current = true;
    setAutoState("saving");

    // Save immediately
    onSave(activeDraft);

    if (!canAutoAdvance) {
      advanceTimerRef.current = window.setTimeout(() => setAutoState("idle"), 900);
      return () => {
        if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
      };
    }

    // Then complete and advance after a beat
    advanceTimerRef.current = window.setTimeout(() => {
      setAutoState("advancing");
      advanceTimerRef.current = window.setTimeout(() => {
        onAutoAdvance?.(activeDraft);
        setAutoState("idle");
      }, 600);
    }, 900);

    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractMet]);

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b shrink-0 flex-wrap"
           style={{ borderColor: "#ecebe5", background: "#faf9f7" }}>
        <div>
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-zinc-500">AI Output</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Paste AI response — saves automatically when all checks pass</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button type="button" onClick={() => onClear()}
                  disabled={!savedValue.trim() && !activeDraft.trim()}
                  title={!savedValue.trim() && !activeDraft.trim() ? "No output to clear" : "Clear AI output"}
                  className="motion-press h-7 px-2.5 rounded-[6px] text-[11.5px] font-medium inline-flex items-center gap-1.5 text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
            <TrashIco size={12} /> Clear
          </button>
          <button type="button" onClick={() => onSave(activeDraft)}
                  disabled={!activeDraft.trim() || !isDirty}
                  title={!activeDraft.trim() ? "Paste AI output before saving" : !isDirty ? "Output is already saved" : "Save AI output"}
                  className="motion-press h-7 px-2.5 rounded-[6px] text-[11.5px] font-medium text-white inline-flex items-center gap-1.5 transition hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "#16a34a", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }}>
            <CheckIco size={12} stroke={2.5} /> {isDirty ? "Save" : "Saved"}
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={activeDraft}
        onChange={e => updateDraft(e.target.value)}
        placeholder={"Paste AI output here…\n\nWhen all required checks are satisfied, the step saves and advances automatically."}
        className="flex-1 min-h-0 w-full resize-none bg-white p-4 text-[13px] leading-[1.65] text-zinc-800 outline-none placeholder:text-zinc-400"
      />

      {/* Footer */}
      <div className="shrink-0 border-t" style={{ borderColor: "#ecebe5", background: "#faf9f7" }}>

        {/* Stats + overall status */}
        <div className="flex items-center justify-between px-4 py-2 text-[11px] text-zinc-400">
          <span className="font-mono num">{wordCount.toLocaleString()} words · {charCount.toLocaleString()} chars</span>

          {activeDraft.trim() && (
            <AnimatePresence mode="wait" initial={false}>
              {contractMet ? (
                <motion.span
                  key={autoState === "idle" ? "met" : autoState}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={tEaseFast}
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-600"
                >
                  {autoState === "saving"    ? <><SpinnerIco /> Saving…</> :
                   autoState === "advancing" ? <><SpinnerIco /> Advancing…</> :
                   <><CheckIco size={11} stroke={2.5} /> {isTerminal ? "Terminal stop" : `✓ ${passedCount}/${requiredChecks.length} checks passed`}</>}
                </motion.span>
              ) : (
                <motion.span
                  key="pending"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={tEaseFast}
                  className="font-semibold text-amber-500"
                >
                  {passedCount}/{requiredChecks.length} checks passed
                </motion.span>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Contract checklist */}
        {checks.length > 0 && !isTerminal && (
          <div className="motion-stagger-fast px-4 pb-3 grid grid-cols-1 gap-0.5 max-h-44 overflow-y-auto">
            {checks.map(item => (
              <div key={item.label}
                   className={`motion-soft flex items-center gap-2 rounded-[4px] px-2 py-[3px] text-[11px] font-medium ${
                     item.ready       ? "text-emerald-700 bg-emerald-50"
                     : item.required  ? "text-amber-700 bg-amber-50"
                     : "text-zinc-400"
                   }`}>
                {item.ready
                  ? <motion.span
                      initial={{ scale: 0, rotate: -25 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={springTick}
                      className="inline-flex"
                    ><CheckIco size={10} stroke={2.5} /></motion.span>
                  : <span className="w-2.5 h-2.5 inline-flex items-center justify-center text-[9px] font-bold">✗</span>
                }
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
