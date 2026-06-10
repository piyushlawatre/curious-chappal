/**
 * StepEditor.tsx — 1:1 implementation of StepperScreen body design
 */

import { useEffect, useState } from "react";
import type { WorkflowStep } from "../types";
import {
  buildPromptContextPack, getKnowledgeBaseFileCount, getPromptInputChecks,
} from "../utils/workflow";
import OutputInput from "./OutputInput";
import PromptPreview from "./PromptPreview";
import { motion } from "framer-motion";
import { tPanel } from "../lib/motion";

// ── Icons ─────────────────────────────────────────────────────────────────────

function Ico({ d, size = 13, stroke = 1.6, fill = "none", className = "" }: {
  d: React.ReactNode; size?: number; stroke?: number; fill?: string; className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {d}
    </svg>
  );
}
const CheckCircleIco = (p: { size?: number }) => <Ico {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></>}/>;
const ArrowLeftIco   = (p: { size?: number }) => <Ico {...p} d={<path d="M19 12H5M11 18l-6-6 6-6"/>}/>;
const ArrowRightIco  = (p: { size?: number }) => <Ico {...p} d={<path d="M5 12h14M13 6l6 6-6 6"/>}/>;
const TrashIco       = (p: { size?: number }) => <Ico {...p} d={<><path d="M4 7h16"/><path d="M9 7V4h6v3M6 7l1 13h10l1-13"/></>}/>;
const ChevDownIco    = (p: { size?: number }) => <Ico {...p} d={<path d="M6 9l6 6 6-6"/>}/>;
const ChevUpIco      = (p: { size?: number }) => <Ico {...p} d={<path d="M6 15l6-6 6 6"/>}/>;
const ChevRightIco   = (p: { size?: number }) => <Ico {...p} d={<path d="M9 6l6 6-6 6"/>}/>;
const HistoryIco     = (p: { size?: number }) => <Ico {...p} d={<><path d="M3 12a9 9 0 109-9 9 9 0 00-6.7 3L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/></>}/>;
const WarningIco     = (p: { size?: number }) => <Ico {...p} d={<><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/></>}/>;
const CheckIco       = (p: { size?: number; stroke?: number }) => <Ico {...p} d={<path d="M5 13l4 4L19 7"/>}/>;
const PauseIco       = (p: { size?: number }) => <Ico {...p} d={<path d="M9 5v14M15 5v14"/>}/>;
const DropIco        = (p: { size?: number }) => <Ico {...p} d={<path d="M12 3s-7 8-7 13a7 7 0 0014 0c0-5-7-13-7-13z"/>}/>;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { bg: string; fg: string; tint: string; solid: string; label: string }> = {
  not_started:      { bg:"#ecebe5", fg:"#1f1f1f", tint:"#d8d5c8", solid:"#5a5a5a", label:"Draft" },
  prompt_generated: { bg:"#fdf3dc", fg:"#6b430a", tint:"#f6dc9c", solid:"#b9760b", label:"Prompt ready" },
  output_added:     { bg:"#e8f1fc", fg:"#0c3b78", tint:"#c1ddf7", solid:"#1e6fdc", label:"In progress" },
  completed:        { bg:"#e8f7ef", fg:"#0f5132", tint:"#bce8cf", solid:"#16a34a", label:"Done" },
};

function StatusBadge({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.not_started;
  return (
    <span className={`inline-flex items-center gap-1 rounded-[4px] font-semibold motion-pop ${size === "sm" ? "h-[18px] px-1.5 text-[10.5px]" : "h-5 px-2 text-[11px] gap-1.5"}`}
          style={{ background: s.bg, color: s.fg, boxShadow: `inset 0 0 0 1px ${s.tint}` }}>
      <span className="inline-block rounded-full shrink-0 motion-dot"
            style={{ background: s.solid, width: 5, height: 5 }} />
      {s.label}
    </span>
  );
}

// ── Validation checklist ──────────────────────────────────────────────────────

function ValidationChecklist({ items }: { items: { label: string; ready: boolean; required: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-1 motion-stagger-fast">
      {items.map((it, i) => {
        const cls = it.ready
          ? { bg:"#e8f7ef", fg:"#0f5132", ring:"#bce8cf", mark:<CheckIco size={9} stroke={3}/> }
          : it.required
          ? { bg:"#fdf3dc", fg:"#6b430a", ring:"#f6dc9c", mark:<span className="font-bold text-[9px]">!</span> }
          : { bg:"#f3f2ee", fg:"#5a5a5a", ring:"#e3e1dc", mark:<span className="opacity-50 text-[9px]">–</span> };
        return (
          <span key={i} className="inline-flex items-center gap-1 rounded-[4px] px-1.5 h-[18px] text-[10.5px] font-medium motion-soft"
                style={{ background: cls.bg, color: cls.fg, boxShadow: `inset 0 0 0 1px ${cls.ring}` }}>
            <span className="w-2 h-2 grid place-items-center">{cls.mark}</span>
            {it.label}
            {!it.required && !it.ready && <span className="opacity-50 ml-0.5">opt</span>}
          </span>
        );
      })}
    </div>
  );
}

// ── Notes panel ───────────────────────────────────────────────────────────────

const NOTE_TABS = [
  { key: "stepNotes" as const,  label: "Notes",       hint: "Anything worth remembering this run" },
  { key: "gaps" as const,       label: "Gaps",        hint: "What was missing or uncertain in AI output" },
  { key: "decision" as const,   label: "Decision",    hint: "What you decided and why" },
  { key: "nextAction" as const, label: "Next Action", hint: "What needs to happen next" },
];

function NotesPanel({ step, onAnnotationChange }: {
  step: WorkflowStep;
  onAnnotationChange: (field: "stepNotes" | "gaps" | "decision" | "nextAction", value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"stepNotes" | "gaps" | "decision" | "nextAction">("decision");
  const hasContent = (k: string) => !!(step[k as keyof WorkflowStep] as string)?.trim();
  const anyContent = NOTE_TABS.some(t => hasContent(t.key));
  const historyCount = step.outputHistory?.length ?? 0;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isEditableTarget(e.target)) return;
      if (e.key.toLowerCase() !== "n") return;
      e.preventDefault();
      setOpen(value => !value);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) {
    return (
      <div className="shrink-0 px-4 h-9 flex items-center justify-between text-[11px] border-t"
           style={{ borderColor: "#ecebe5", background: "#f7f6f1" }}>
        <button type="button" onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 text-zinc-600 font-medium hover:text-zinc-900 transition-colors motion-press">
          <ChevUpIco size={12} />
          Step notes
          {anyContent && (
            <span className="inline-flex items-center gap-1 text-[10.5px] motion-pop" style={{ color: "#9a3a14" }}>
              <span className="inline-block rounded-full bg-[#d3501c]" style={{ width: 4, height: 4 }} />
              has notes
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 text-zinc-500">
          {historyCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <HistoryIco size={11} /> {historyCount} run{historyCount !== 1 ? "s" : ""}
            </span>
          )}
          <kbd className="kbd">N</kbd>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t motion-reveal" style={{ borderColor: "#ecebe5", background: "#f7f6f1" }}>
      <div className="px-4 h-9 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setOpen(false)} className="text-zinc-600 hover:text-zinc-900 transition-colors motion-press">
            <ChevDownIco size={12} />
          </button>
          <span className="text-[11px] font-semibold text-zinc-700 mr-2">Step notes</span>
          <div className="flex items-center gap-0.5 ml-1 text-[11px]">
            {NOTE_TABS.map(t => (
              <button key={t.key} type="button"
                      onClick={() => setActiveTab(t.key)}
                      className={`px-2 h-6 inline-flex items-center gap-1 rounded-[5px] font-medium transition-colors motion-press ${
                        activeTab === t.key ? "bg-white text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
                      }`}
                      style={activeTab === t.key ? { boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" } : {}}>
                {t.label}
                {hasContent(t.key) && (
                  <span className="inline-block rounded-full bg-[#d3501c] motion-pop" style={{ width: 4, height: 4 }} />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <span>autosaved</span>
        </div>
      </div>
      <div className="px-4 pb-3.5 pt-1">
        <textarea
          value={step[activeTab as keyof WorkflowStep] as string ?? ""}
          onChange={e => onAnnotationChange(activeTab, e.target.value)}
          placeholder={NOTE_TABS.find(t => t.key === activeTab)?.hint}
          rows={3}
          className="w-full rounded-[6px] bg-white p-2.5 text-[12.5px] leading-[1.55] text-zinc-900 outline-none transition resize-none placeholder:text-zinc-400 motion-soft"
          style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.10)" }}
        />
        {/* Output history */}
        {historyCount > 0 && (
          <div className="mt-2 space-y-1.5 motion-stagger-fast">
            {[...(step.outputHistory ?? [])].reverse().slice(0, 3).map((entry, i) => (
              <div key={i} className="rounded-[6px] p-2 bg-white text-[11px] motion-panel"
                   style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-semibold text-zinc-700">
                    Run {historyCount - i}
                    {i === 0 && <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider px-1 rounded" style={{ background:"#e8f7ef", color:"#0f5132" }}>prev</span>}
                  </span>
                  <span className="text-[10px] text-zinc-400">{new Date(entry.savedAt).toLocaleString()}</span>
                </div>
                <p className="font-mono text-[10.5px] text-zinc-600 leading-[1.55] line-clamp-2 whitespace-pre-wrap">
                  {entry.output.slice(0, 200)}{entry.output.length > 200 ? "…" : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Verdict nudge ─────────────────────────────────────────────────────────────

const VERDICT_NUDGE_CFG: Record<string, {
  bg: string; border: string; fg: string;
  icon: React.ReactNode; title: string; body: string;
}> = {
  "MAKE-NOW":   { bg:"#e8f7ef", border:"#bce8cf", fg:"#0f5132", icon:<CheckCircleIco size={13}/>, title:"Ready for Step 02", body:"Verdict locked. Continue to Script Creation when you are ready." },
  "REFRAME":    { bg:"#fdf3dc", border:"#f6dc9c", fg:"#6b430a", icon:<WarningIco size={13}/>,     title:"Reframe package detected", body:"A reframed angle was suggested. Review it carefully before Step 02." },
  "MAKE-LATER": { bg:"#e8f1fc", border:"#c1ddf7", fg:"#0c3b78", icon:<PauseIco size={13}/>,       title:"Lower urgency", body:"Topic is viable but not urgent. Capture the decision in notes before parking it." },
  "DROP":       { bg:"#fde8e6", border:"#f4bdb6", fg:"#7a1f15", icon:<DropIco size={13}/>,        title:"Terminal recommendation", body:"Stop work on this idea if you accept the verdict, and capture that decision in notes." },
};

function VerdictNudge({ verdict }: { verdict: string }) {
  const s = VERDICT_NUDGE_CFG[verdict];
  if (!s) return null;
  return (
    <div className="flex items-start gap-2.5 px-3 py-2 rounded-[8px] border text-[11.5px] motion-pop"
         style={{ background: s.bg, borderColor: s.border, color: s.fg }}>
      <span className="mt-0.5 shrink-0">{s.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold flex items-center gap-1.5">
          <span className="uppercase tracking-wider text-[10px] font-bold opacity-80">{verdict}</span>
          <span>· {s.title}</span>
        </div>
        <p className="opacity-85 mt-0.5 leading-snug">{s.body}</p>
      </div>
    </div>
  );
}

// ── Type / step config ────────────────────────────────────────────────────────

type TopicInputFields = {
  topic: string; surfaceNarrative: string; whyInteresting: string; sourceLink: string;
};
const emptyTopicFields: TopicInputFields = { topic:"", surfaceNarrative:"", whyInteresting:"", sourceLink:"" };

const readTopicLine = (input: string, label: string) => {
  const match = input.match(new RegExp(`^${label}:[ \\t]*(.*)$`, "im"));
  return match?.[1]?.trim() ?? "";
};
const parseTopicInput = (input: string): TopicInputFields => {
  if (!input.trim()) return emptyTopicFields;
  if (!/^Topic:/im.test(input)) return { ...emptyTopicFields, topic: input.trim() };
  return {
    topic: readTopicLine(input, "Topic"),
    surfaceNarrative: readTopicLine(input, "Surface narrative most people know"),
    whyInteresting: readTopicLine(input, "Why I think it might be interesting"),
    sourceLink: readTopicLine(input, "Source / article / video / event link \\(optional\\)"),
  };
};
const serializeTopicInput = (fields: TopicInputFields) =>
  [`Topic: ${fields.topic}`, `Surface narrative most people know: ${fields.surfaceNarrative}`,
   `Why I think it might be interesting: ${fields.whyInteresting}`,
   `Source / article / video / event link (optional): ${fields.sourceLink}`].join("\n");

const STEP_HUMAN_NAME: Record<string, string> = {
  "01_TOPIC_EVALUATION":   "Topic Evaluation",
  "02_SCRIPT_CREATION":    "Script Creation",
  "03_AUDIT_AND_FINALIZE": "Audit & Finalize",
  "04_EDITOR_BRIEF":       "Editor Brief",
};
const STEP_DESCRIPTION: Record<string, string> = {
  "01_TOPIC_EVALUATION":   "Fill in the topic fields. The prompt compiles automatically as you type.",
  "02_SCRIPT_CREATION":    "Paste the Step 01 evaluation output — the script prompt is built from it.",
  "03_AUDIT_AND_FINALIZE": "Paste the Step 02 script. Optionally include the Step 01 brief. The prompt runs the audit (Part A) then produces the final script (Part B) in one pass.",
  "04_EDITOR_BRIEF":       "Paste the Step 03 production-ready final script. The editor brief is built from it; audit notes are optional.",
};
const VERDICT_PATTERN = /\*\*(MAKE-NOW|REFRAME|MAKE-LATER|DROP)\*\*/i;

const getInputPlaceholder = (step: WorkflowStep) => {
  switch (step.id) {
    case "02_SCRIPT_CREATION":    return "Paste the full Step 01 topic-evaluation output here.";
    case "03_AUDIT_AND_FINALIZE": return "Paste the full Step 02 script-creation output here.\n\nOptionally, after the script, add:\n\n=== TOPIC-EVAL BRIEF (optional) ===\nPaste the Step 01 output here.";
    case "04_EDITOR_BRIEF":       return "Paste the Step 03 production-ready final script here. Audit notes are optional and can stay internal.";
    default: return "Paste input here.";
  }
};

// ── Main StepEditor ───────────────────────────────────────────────────────────

type StepEditorProps = {
  step: WorkflowStep;
  isFirstStep: boolean;
  isLastStep: boolean;
  onInputChange: (value: string) => void;
  onSaveOutput: (value: string) => void;
  onClearOutput: () => void;
  onComplete: () => void;
  onAutoAdvance: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onAnnotationChange?: (field: "stepNotes" | "gaps" | "decision" | "nextAction", value: string) => void;
};

export default function StepEditor({
  step, isFirstStep, isLastStep,
  onInputChange, onSaveOutput, onClearOutput, onComplete,
  onAutoAdvance, onPrevious, onNext, onAnnotationChange,
}: StepEditorProps) {
  const isInitialStep = step.id === "01_TOPIC_EVALUATION";
  const [outputDraft, setOutputDraft] = useState(step.aiOutput);

  const topicFields = parseTopicInput(step.input);
  const promptInputChecks = getPromptInputChecks(step);
  const missingRequired = promptInputChecks.filter(c => c.required && !c.ready);
  const kbFileCount = getKnowledgeBaseFileCount(step);
  const contextPack = buildPromptContextPack(step);
  const shouldSaveBeforeNext = Boolean(outputDraft.trim() && outputDraft !== step.aiOutput);

  const detectedVerdict = isInitialStep && step.status === "completed"
    ? (step.aiOutput.match(VERDICT_PATTERN)?.[1]?.toUpperCase() ?? null)
    : null;

  useEffect(() => { setOutputDraft(step.aiOutput); }, [step.id, step.aiOutput]);

  const updateTopicField = (field: keyof TopicInputFields, value: string) =>
    onInputChange(serializeTopicInput({ ...topicFields, [field]: value }));

  const saveOutput = () => onSaveOutput(outputDraft);
  const clearOutput = () => { setOutputDraft(""); onClearOutput(); };
  const goNext = () => { if (shouldSaveBeforeNext) onSaveOutput(outputDraft); onNext(); };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      if (key === "s") {
        e.preventDefault();
        if (outputDraft.trim() && outputDraft !== step.aiOutput) onSaveOutput(outputDraft);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (step.aiOutput.trim()) onComplete();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onComplete, onSaveOutput, outputDraft, step.aiOutput]);

  const handleAnnotationChange = (field: "stepNotes" | "gaps" | "decision" | "nextAction", value: string) =>
    onAnnotationChange?.(field, value);

  const inputCls = "w-full rounded-[6px] bg-white px-2.5 text-[12.5px] text-zinc-900 outline-none transition placeholder:text-zinc-400 h-8 shadow-[inset_0_0_0_1px_rgba(15,15,15,0.10)] focus:shadow-[inset_0_0_0_1px_#0a0a0a] motion-soft";
  const areaCls  = "w-full rounded-[6px] bg-white p-2.5 text-[12.5px] leading-[1.55] text-zinc-900 outline-none transition placeholder:text-zinc-400 resize-none shadow-[inset_0_0_0_1px_rgba(15,15,15,0.10)] focus:shadow-[inset_0_0_0_1px_#0a0a0a] motion-soft";

  return (
    <div className="flex flex-col h-full motion-panel">
      {/* ── Step header ──────────────────────────────────────────── */}
      <div className="shrink-0 flex flex-col gap-3 px-5 py-3.5 xl:flex-row xl:items-center xl:justify-between"
           style={{ borderBottom: "1px solid #ecebe5" }}>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="font-mono text-[18px] font-semibold text-zinc-300 num tracking-tight">
            {step.stepNumber}
          </span>
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-zinc-950 tracking-[-0.02em]">
              {STEP_HUMAN_NAME[step.id] ?? step.id}
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">{STEP_DESCRIPTION[step.id]}</p>
          </div>
          <StatusBadge status={step.status} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {/* Prev */}
          <button type="button" onClick={onPrevious} disabled={isFirstStep}
                  aria-label="Go to previous step"
                  title={isFirstStep ? "Already on the first step" : "Go to previous step"}
                  className="h-7 w-7 rounded-[6px] inline-flex items-center justify-center text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed motion-press"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
            <ArrowLeftIco size={13} />
          </button>
          {/* Next */}
          <button type="button" onClick={goNext} disabled={isLastStep}
                  aria-label="Go to next step"
                  title={isLastStep ? "Already on the last step" : "Go to next step"}
                  className="h-7 w-7 rounded-[6px] inline-flex items-center justify-center text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed motion-press"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
            <ArrowRightIco size={13} />
          </button>
          {/* Mark complete */}
          <button type="button" onClick={onComplete} disabled={!step.aiOutput.trim()}
                  title={step.aiOutput.trim() ? "Mark this step complete" : "Save AI output before marking complete"}
                  className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium text-white inline-flex items-center gap-1.5 transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed motion-press"
                  style={{ background: "#0a0a0a", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            Mark complete <kbd className="kbd kbd-dark">⌘↵</kbd>
          </button>
        </div>
      </div>

      {/* ── Split body ────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT — input + compiled prompt */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={tPanel}
          className="flex flex-col w-[46%] min-w-0"
          style={{ borderRight: "1px solid #ecebe5" }}
        >

          {/* Input section */}
          <div className="shrink-0" style={{ background: "#faf9f7", borderBottom: "1px solid #ecebe5" }}>
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Step input</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{STEP_DESCRIPTION[step.id]}</p>
              </div>
              {missingRequired.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10.5px] px-1.5 h-[18px] rounded-[4px] font-semibold motion-pop"
                      style={{ background: "#fdf3dc", color: "#6b430a", boxShadow: "inset 0 0 0 1px #f6dc9c" }}>
                  ! {missingRequired.length} required
                </span>
              )}
            </div>

            <div className="px-4 pb-3">
              {isInitialStep ? (
                <div className="space-y-2.5 motion-stagger-fast">
                  {([
                    { field: "topic" as const,           label: "Topic",                              required: true,  placeholder: "Why did UPI dominate in India?" },
                    { field: "surfaceNarrative" as const, label: "Surface narrative most people know", required: true,  placeholder: "The common / obvious version of the story" },
                    { field: "whyInteresting" as const,  label: "Why you think it's interesting",     required: true,  placeholder: "What makes this feel worth testing?" },
                    { field: "sourceLink" as const,      label: "Source / article / event link",      required: false, placeholder: "Optional URL or note" },
                  ] as const).map(({ field, label, required, placeholder }) => (
                    <label key={field} className="block">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11.5px] font-medium text-zinc-700">
                          {label}{required && <span style={{ color: "#c84a14" }}> *</span>}
                        </span>
                      </div>
                      <input value={topicFields[field]} onChange={e => updateTopicField(field, e.target.value)}
                             placeholder={placeholder} className={inputCls} />
                    </label>
                  ))}
                </div>
              ) : (
                <textarea value={step.input} onChange={e => onInputChange(e.target.value)}
                          placeholder={getInputPlaceholder(step)} rows={7}
                          className={areaCls} />
              )}

              {/* Validation checklist */}
              {promptInputChecks.length > 0 && (
                <div className="mt-2.5">
                  <ValidationChecklist items={promptInputChecks} />
                </div>
              )}
            </div>
          </div>

          {/* Compiled prompt — dark terminal */}
          <div className="flex-1 min-h-0 flex flex-col motion-panel" style={{ background: "#0a0a0a" }}>
            <PromptPreview prompt={step.generatedPrompt} contextPack={contextPack} kbFileCount={kbFileCount} />
          </div>
        </motion.div>

        {/* RIGHT — AI output + notes */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...tPanel, delay: 0.05 }}
          className="flex-1 min-w-0 flex flex-col"
        >
          {/* Verdict nudge (Step 01) */}
          {detectedVerdict && (
            <div className="shrink-0 px-4 py-2" style={{ borderBottom: "1px solid #ecebe5" }}>
              <VerdictNudge verdict={detectedVerdict} />
            </div>
          )}

          {/* Output panel */}
          <div className="flex-1 min-h-0 flex flex-col">
            <OutputInput
              step={step} value={step.aiOutput} draft={outputDraft}
              onDraftChange={setOutputDraft} onSave={saveOutput} onClear={clearOutput}
              onAutoAdvance={onAutoAdvance}
            />
          </div>

          {/* Notes panel */}
          <NotesPanel step={step} onAnnotationChange={handleAnnotationChange} />
        </motion.div>

      </div>
    </div>
  );
}
