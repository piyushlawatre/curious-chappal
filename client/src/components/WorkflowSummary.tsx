/**
 * WorkflowSummary.tsx — 1:1 implementation of SummaryScreen design
 */

import { useState } from "react";
import type { WorkflowSession } from "../types";
import { formatDateTime } from "../utils/workflow";
import MarkdownRenderer from "./MarkdownRenderer";
import EditorBriefOutput from "./EditorBriefOutput";
import { motion } from "framer-motion";
import { CountUp, staggerContainer, fadeUpItem } from "../lib/motion";

type WorkflowSummaryProps = {
  session:              WorkflowSession;
  onBackToWorkflow:     () => void;
  onUpdateBriefOutput?: (output: string) => void;
};

const STEP_HUMAN_NAME: Record<string, string> = {
  "01_TOPIC_EVALUATION": "Topic Evaluation",
  "02_SCRIPT_CREATION":  "Script Creation",
  "03_AUDIT_AND_FINALIZE": "Audit & Finalize",
  "04_EDITOR_BRIEF":       "Editor Brief",
};

const unwrapMarkdownOutput = (value: string) => {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^`{3,}(?:markdown|md)?[ \t]*\n([\s\S]*?)\n`{3,}$/i);
  return (fenced?.[1] ?? trimmed).trim();
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function Ico({ d, size = 13, stroke = 1.6 }: { d: React.ReactNode; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}
const CopyIco      = (p: { size?: number }) => <Ico {...p} d={<><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></>}/>;
const CheckIco     = (p: { size?: number }) => <Ico {...p} stroke={2.5} d={<path d="M5 13l4 4L19 7"/>}/>;
const ArrowLeftIco = (p: { size?: number }) => <Ico {...p} d={<path d="M19 12H5M11 18l-6-6 6-6"/>}/>;
const HistoryIco   = (p: { size?: number }) => <Ico {...p} d={<><path d="M3 12a9 9 0 109-9 9 9 0 00-6.7 3L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/></>}/>;
const ChevDownIco  = (p: { size?: number }) => <Ico {...p} d={<path d="M6 9l6 6 6-6"/>}/>;

// ── Pipeline track (summary hero) ─────────────────────────────────────────────

const STEP_LABELS = ["Topic","Script","Audit","Rewrite","Brief"];

function PipelineTrackLg({ steps }: { steps: string[] }) {
  return (
    <div className="flex items-start" style={{ gap: 0 }}>
      {steps.map((s, i) => {
        const isLast  = i === steps.length - 1;
        const linked  = s === "completed";
        type NodeCfg = { bg: string; fg: string; ring: string };
        const cfgMap: Record<string, NodeCfg> = {
          completed:        { bg:"#16a34a", fg:"#ffffff", ring:"none" },
          output_added:     { bg:"#1e6fdc", fg:"#ffffff", ring:"none" },
          prompt_generated: { bg:"#fdf3dc", fg:"#6b430a", ring:"inset 0 0 0 1px #f6dc9c" },
          not_started:      { bg:"#ffffff", fg:"#9a9a9a", ring:"inset 0 0 0 1px #d8d5c8" },
        };
        const cfg = cfgMap[s] ?? cfgMap.not_started;
        return (
          <div key={i} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center" style={{ minWidth: 34 }}>
              <div className={`rounded-full flex items-center justify-center font-mono font-semibold motion-soft ${s === "completed" ? "motion-pop" : ""}`}
                   style={{ width: 28, height: 28, background: cfg.bg, color: cfg.fg, boxShadow: cfg.ring, fontSize: 10 }}>
                {s === "completed"
                  ? <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                  : <span>{i + 1}</span>
                }
              </div>
              <span className="text-[9px] text-zinc-500 font-medium mt-1 text-center">{STEP_LABELS[i]}</span>
            </div>
            {!isLast && (
              <div className="flex-1 self-start rounded-full mx-1 motion-progress"
                   style={{ height: 2, marginTop: 13, background: linked ? "#16a34a55" : "#e3e1dc" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; fg: string; tint: string; solid: string; label: string }> = {
    not_started:      { bg:"#ecebe5", fg:"#1f1f1f", tint:"#d8d5c8", solid:"#5a5a5a", label:"Draft" },
    prompt_generated: { bg:"#fdf3dc", fg:"#6b430a", tint:"#f6dc9c", solid:"#b9760b", label:"Prompt ready" },
    output_added:     { bg:"#e8f1fc", fg:"#0c3b78", tint:"#c1ddf7", solid:"#1e6fdc", label:"In progress" },
    completed:        { bg:"#e8f7ef", fg:"#0f5132", tint:"#bce8cf", solid:"#16a34a", label:"Done" },
  };
  const s = cfg[status] ?? cfg.not_started;
  return (
    <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-[4px] font-semibold text-[10.5px] motion-pop"
          style={{ background: s.bg, color: s.fg, boxShadow: `inset 0 0 0 1px ${s.tint}` }}>
      <span className="inline-block rounded-full motion-dot" style={{ background: s.solid, width: 5, height: 5 }} />
      {s.label}
    </span>
  );
}

// ── Step summary card ─────────────────────────────────────────────────────────

function SummaryStepCard({ step, stepNum }: { step: WorkflowSession["steps"][number]; stepNum: string }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success">("idle");
  const [expanded, setExpanded] = useState(true);
  const reruns = step.outputHistory?.length ?? 0;
  const displayOutput = unwrapMarkdownOutput(step.aiOutput);
  const wordCount = displayOutput ? displayOutput.split(/\s+/).length : 0;

  const copyStep = async () => {
    if (!displayOutput) return;
    try {
      await navigator.clipboard.writeText(displayOutput);
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2200);
    } catch { /* silent */ }
  };

  return (
    <div className="bg-white rounded-[12px] overflow-hidden motion-lift" style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
      <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
           style={{ borderBottom: "1px solid #ecebe5", background: "#faf9f7" }}>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-mono text-[10.5px] font-semibold num tracking-wider px-1.5 h-5 inline-flex items-center rounded-[4px]"
                style={{ background: "#e8f7ef", color: "#0f5132", boxShadow: "inset 0 0 0 1px #bce8cf" }}>
            {stepNum}
          </span>
          <h3 className="text-[14px] font-semibold text-zinc-950 tracking-[-0.015em]">
            {STEP_HUMAN_NAME[step.id] ?? step.id}
          </h3>
          <StatusBadge status={step.status} />
          {reruns > 0 && (
            <span className="text-[10.5px] text-zinc-500 inline-flex items-center gap-1">
              <HistoryIco size={10} /> {reruns} rerun{reruns > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[11px] text-zinc-500">
          {wordCount > 0 && <span className="num">{wordCount.toLocaleString()} words</span>}
          {displayOutput && (
            <button type="button" onClick={copyStep}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-700 transition-colors px-1.5 py-1 rounded-[4px] hover:bg-zinc-100 motion-press">
              {copyStatus === "success" ? <CheckIco size={10} /> : <CopyIco size={10} />}
              {copyStatus === "success" ? "Copied" : "Copy"}
            </button>
          )}
          <button type="button" onClick={() => setExpanded(v => !v)}
                  aria-label={expanded ? `Collapse ${STEP_HUMAN_NAME[step.id] ?? step.id}` : `Expand ${STEP_HUMAN_NAME[step.id] ?? step.id}`}
                  className="text-zinc-400 hover:text-zinc-700 transition-colors motion-press">
            <span className={`inline-flex motion-rotate ${expanded ? "motion-rotate-open" : ""}`}><ChevDownIco size={12} /></span>
          </button>
        </div>
      </div>
      {expanded && (
        <div className="max-h-64 overflow-y-auto noscroll px-5 py-4 motion-reveal">
          {displayOutput ? (
            <MarkdownRenderer content={displayOutput} className="md-compact" />
          ) : (
            <span className="text-zinc-400 font-sans not-italic">No output saved yet.</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Completed output view ────────────────────────────────────────────────────

function CompletedOutput({ session, onBackToWorkflow }: WorkflowSummaryProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success">("idle");
  const finalStep = session.steps.find(step => step.id === "04_EDITOR_BRIEF") ?? session.steps[session.steps.length - 1];
  const finalOutput = unwrapMarkdownOutput(finalStep?.aiOutput ?? "");

  const copyFinal = async () => {
    if (!finalOutput) return;
    try {
      await navigator.clipboard.writeText(finalOutput);
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2200);
    } catch { /* silent */ }
  };

  return (
    <div className="h-full overflow-y-auto noscroll motion-page" style={{ background: "#faf9f7" }}>
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onBackToWorkflow}
                  className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 text-zinc-700 hover:bg-zinc-200 transition motion-press"
                  style={{ background: "#ffffff", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
            <ArrowLeftIco size={12} /> Edit workflow
          </button>
          <button type="button" onClick={copyFinal} disabled={!finalOutput}
                  className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-40 disabled:cursor-not-allowed motion-press"
                  style={{ background: "#ffffff", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
            {copyStatus === "success" ? <CheckIco size={12} /> : <CopyIco size={12} />}
            {copyStatus === "success" ? "Copied" : "Copy output"}
          </button>
        </div>

        <main className="mt-5 bg-white rounded-[8px] overflow-hidden" style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
          <div className="px-5 sm:px-7 py-5 border-b" style={{ borderColor: "#ecebe5", background: "#faf9f7" }}>
            <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              <CheckIco size={12} />
              Complete
            </div>
            <h2 className="mt-2 text-[24px] sm:text-[30px] font-semibold tracking-[-0.025em] text-zinc-950 leading-tight">
              {session.title || "Final Output"}
            </h2>
            <p className="mt-2 text-[12px] text-zinc-500">
              Updated {formatDateTime(session.updatedAt)} · Source: {STEP_HUMAN_NAME[finalStep?.id ?? ""] ?? finalStep?.name ?? "Final step"}
            </p>
          </div>

          <article className="px-5 sm:px-7 py-6">
            {finalOutput ? (
              <MarkdownRenderer content={finalOutput} />
            ) : (
              <p className="text-[13px] text-zinc-500">No final output saved yet.</p>
            )}
          </article>
        </main>
      </div>
    </div>
  );
}

// ── Main WorkflowSummary ──────────────────────────────────────────────────────

export default function WorkflowSummary({ session, onBackToWorkflow, onUpdateBriefOutput }: WorkflowSummaryProps) {
  const [copyAllStatus, setCopyAllStatus] = useState<"idle" | "success">("idle");

  const completedSteps = session.steps.filter(s => s.status === "completed").length;
  const allComplete    = completedSteps === session.steps.length;
  const stepStatuses   = session.steps.map(s => s.status);
  const totalWords     = session.steps.reduce((acc, s) => acc + (s.aiOutput.trim() ? s.aiOutput.trim().split(/\s+/).length : 0), 0);

  if (allComplete) {
    return (
      <EditorBriefOutput
        session={session}
        onBackToWorkflow={onBackToWorkflow}
        onUpdateBriefOutput={onUpdateBriefOutput}
      />
    );
  }

  const copyAll = async () => {
    const summary = session.steps
      .map(s => `# ${STEP_HUMAN_NAME[s.id] ?? s.id}\n\n${unwrapMarkdownOutput(s.aiOutput) || "[No output saved]"}`)
      .join("\n\n---\n\n");
    try {
      await navigator.clipboard.writeText(summary);
      setCopyAllStatus("success");
      setTimeout(() => setCopyAllStatus("idle"), 2200);
    } catch { /* silent */ }
  };

  return (
    <div className="h-full overflow-y-auto noscroll motion-page" style={{ background: "#faf9f7" }}>
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-[1080px] mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Toolbar */}
        <motion.div variants={fadeUpItem} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onBackToWorkflow}
                  className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 text-zinc-700 hover:bg-zinc-200 transition motion-press"
                  style={{ background: "#ffffff", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
            <ArrowLeftIco size={12} /> Back to workflow
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={copyAll}
                    className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 text-zinc-700 hover:bg-zinc-100 transition motion-press"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
              {copyAllStatus === "success" ? <CheckIco size={12} /> : <CopyIco size={12} />}
              {copyAllStatus === "success" ? "Copied!" : "Copy all"}
            </button>
          </div>
        </motion.div>

        {/* Hero card */}
        <motion.div variants={fadeUpItem} whileHover={{ y: -2 }} className="bg-white rounded-[14px] p-6" style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-[26px] font-semibold tracking-[-0.025em] text-zinc-950 leading-[1.15]">
                {session.title || "Untitled workflow"}
              </h2>
              <p className="text-[12.5px] text-zinc-600 mt-2 leading-[1.55]">
                Created {formatDateTime(session.createdAt)} · Updated {formatDateTime(session.updatedAt)}
              </p>
            </div>
            <div className="shrink-0" style={{ minWidth: 200 }}>
              <PipelineTrackLg steps={stepStatuses} />
            </div>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-5 pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ borderTop: "1px solid #ecebe5" }}>
            {[
              { l: "Steps complete",  v: `${completedSteps}/5`,           sub: `${Math.round((completedSteps / 5) * 100)}% done`, count: true },
              { l: "Total words",     v: totalWords.toLocaleString(),      sub: "across all outputs", count: true },
              { l: "Previous runs",   v: session.steps.reduce((a,s)=>a+(s.outputHistory?.length??0),0).toString(), sub: "output history entries", count: true },
              { l: "Last updated",    v: formatDateTime(session.updatedAt),sub: "autosaved", count: false },
            ].map(s => (
              <motion.div key={s.l} variants={fadeUpItem}>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{s.l}</p>
                {s.count
                  ? <CountUp value={s.v} className="text-[20px] font-semibold text-zinc-950 num tracking-[-0.02em] mt-1 leading-none block" />
                  : <p className="text-[20px] font-semibold text-zinc-950 num tracking-[-0.02em] mt-1 leading-none">{s.v}</p>}
                <p className="text-[10.5px] text-zinc-500 mt-1">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Step output cards */}
        {session.steps.map(step => (
          <motion.div key={step.id} variants={fadeUpItem}>
            <SummaryStepCard step={step} stepNum={step.stepNumber} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
