/**
 * WorkflowLayout.tsx — full-width layout, no sidebar.
 * Top bar: brand · idea title · step pills · autosaved
 */

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pillSpring, tHeight, tEase } from "../lib/motion";
import type { BannerMessage, WorkflowStep } from "../types";

const STATUS_DOT: Record<string, string> = {
  not_started:      "#3a3a3a",
  prompt_generated: "#e09f1c",
  output_added:     "#3b82f6",
  completed:        "#22c55e",
};

const STEP_SHORT: Record<string, string> = {
  "01_TOPIC_EVALUATION": "Topic",
  "02_SCRIPT_CREATION":  "Script",
  "03_AUDIT_AND_FINALIZE": "Audit",
  "04_EDITOR_BRIEF":       "Brief",
};

function Ico({ d, size = 13, stroke = 1.6 }: { d: React.ReactNode; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}
const ChkIco  = ({ size = 11 }: { size?: number }) => <Ico size={size} stroke={2.8} d={<path d="M5 13l4 4L19 7"/>}/>;
const ArrowLt = ({ size = 12 }: { size?: number }) => <Ico size={size} d={<path d="M19 12H5M11 18l-6-6 6-6"/>}/>;
const BarsIco = ({ size = 12 }: { size?: number }) => <Ico size={size} d={<path d="M4 20V10M10 20V4M16 20v-7M22 20v-4"/>}/>;
const FileIco = ({ size = 12 }: { size?: number }) => <Ico size={size} d={<><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></>}/>;
const GreenDot = () => <span className="inline-block w-[5px] h-[5px] rounded-full bg-emerald-500" />;

type WorkflowLayoutProps = {
  steps: WorkflowStep[];
  activeIndex: number;
  isSummaryActive: boolean;
  banner: BannerMessage | null;
  children: ReactNode;
  onSelectStep: (index: number) => void;
  onShowSummary: () => void;
  onGoIdeas?: () => void;
  onGoDashboard?: () => void;
  activeIdeaTitle?: string;
};

export default function WorkflowLayout({
  steps, activeIndex, isSummaryActive, banner, children,
  onSelectStep, onShowSummary, onGoIdeas, onGoDashboard, activeIdeaTitle,
}: WorkflowLayoutProps) {
  const completedCount = steps.filter(s => s.status === "completed").length;
  const allComplete = completedCount === steps.length;
  const showStepNav = !(allComplete && isSummaryActive);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#fff" }}>

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center gap-3 px-4 h-11 border-b"
              style={{ background: "#0a0a0a", borderColor: "#1f1f1f" }}>

        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-[6px] grid place-items-center"
               style={{ background: "#d3501c" }}>
            <span className="font-mono text-[10px] font-bold text-white">cc</span>
          </div>
          <span className="text-[12px] font-semibold text-white tracking-[-0.01em] hidden sm:block">Curious Engine</span>
        </div>

        <div className="h-4 w-px bg-zinc-700 shrink-0" />

        {/* Back */}
        {onGoIdeas && (
          <button type="button" onClick={() => onGoIdeas()}
                  className="motion-press h-6 px-2 rounded-[5px] text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] inline-flex items-center gap-1 transition shrink-0">
            <ArrowLt size={11} /> Ideas
          </button>
        )}

        {onGoDashboard && (
          <button type="button" onClick={onGoDashboard}
                  className="motion-press h-6 px-2 rounded-[5px] text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] inline-flex items-center gap-1 transition shrink-0">
            <BarsIco size={11} /> Dashboard
          </button>
        )}



        <div className="flex-1" />

        {showStepNav ? (
          <nav className="flex items-center gap-1 shrink-0">
            {steps.map((step, i) => {
              const active = !isSummaryActive && i === activeIndex;
              const done   = step.status === "completed";
              const dot    = STATUS_DOT[step.status] ?? "#3a3a3a";
              return (
                <button key={step.id} type="button"
                        onClick={() => onSelectStep(i)}
                        aria-label={`Open step ${step.stepNumber}: ${STEP_SHORT[step.id] ?? step.name}`}
                        className={`motion-press relative h-7 px-2.5 rounded-[6px] text-[11px] font-medium inline-flex items-center gap-1.5 transition ${
                          active
                            ? "text-zinc-950"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                        }`}>
                  {active && (
                    <motion.span layoutId="navPill" transition={pillSpring}
                      className="absolute inset-0 rounded-[6px] bg-white" />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    <span className="inline-block rounded-full shrink-0"
                          style={{ width: 5, height: 5, background: active ? dot : dot + "99" }} />
                    {done && !active ? <ChkIco size={10} /> : null}
                    <span className="font-mono text-[10px] opacity-60">{step.stepNumber}</span>
                    <span className="hidden lg:inline">{STEP_SHORT[step.id] ?? step.name}</span>
                  </span>
                </button>
              );
            })}
            <button type="button" onClick={onShowSummary}
                    aria-label="Open final output summary"
                    className={`motion-press relative h-7 px-2.5 rounded-[6px] text-[11px] font-medium inline-flex items-center gap-1.5 transition ${
                      isSummaryActive
                        ? "text-zinc-950"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    }`}>
              {isSummaryActive && (
                <motion.span layoutId="navPill" transition={pillSpring}
                  className="absolute inset-0 rounded-[6px] bg-white" />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                <FileIco size={11} />
                <span className="hidden lg:inline">Output</span>
              </span>
            </button>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 h-7 px-2.5 rounded-[6px] bg-white text-zinc-950 text-[11px] font-semibold shrink-0">
            <ChkIco size={11} />
            Final output
          </div>
        )}

        <div className="h-4 w-px bg-zinc-700 shrink-0 hidden sm:block" />

        {/* Progress + autosaved */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-500 shrink-0">
          <GreenDot />
          <span className="font-mono num">{completedCount}/{steps.length}</span>
        </div>
      </header>

      {/* ── Banner ───────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {banner && (
          <motion.div
            key="banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={tHeight}
            className={`shrink-0 overflow-hidden text-xs font-semibold border-b ${
              banner.tone === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <div className="px-5 py-1.5">{banner.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={isSummaryActive ? "summary" : `step-${activeIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={tEase}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
