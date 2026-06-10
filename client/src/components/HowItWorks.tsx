/**
 * HowItWorks.tsx — plain-language visual explainer for the retro → lane-plan
 * engine. Five illustrated steps, written for a non-technical reader: how videos
 * are scored, which videos count, how memory fades, how the one-slot promotion
 * works, and why winners land on peak days.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Tiny building blocks ───────────────────────────────────────────────────────

function StepCard({ n, title, kicker, children }: {
  n: number; title: string; kicker: string; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * n, duration: 0.35, ease: "easeOut" }}
      className="rounded-[10px] border border-zinc-200/80 bg-white p-4 shadow-[0_1px_0_rgba(15,15,15,0.03)]"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-6 h-6 shrink-0 grid place-items-center rounded-full text-[11px] font-bold text-white"
              style={{ background: "#d3501c" }}>{n}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-zinc-900 leading-tight">{title}</p>
          <p className="text-[11.5px] text-zinc-500 mt-0.5 leading-5">{kicker}</p>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}

// Step 1 — the 100-point score, split 55 / 30 / 15.
function ScoreBar() {
  const parts = [
    { label: "Watched till the end", pts: 55, bg: "#0f8c5f", note: "the big one" },
    { label: "Shared / forwarded", pts: 30, bg: "#2f9e77", note: "the WhatsApp test" },
    { label: "Likes & comments", pts: 15, bg: "#9bd4bd", note: "nice to have" },
  ];
  return (
    <div>
      <div className="flex h-9 rounded-[8px] overflow-hidden" style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.06)" }}>
        {parts.map((p) => (
          <div key={p.label} className="grid place-items-center" style={{ width: `${p.pts}%`, background: p.bg }}>
            <span className="text-[11px] font-bold text-white">{p.pts}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 grid gap-1 sm:grid-cols-3">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: p.bg }} />
            <span className="text-[11px] text-zinc-600 leading-4">{p.label} <span className="text-zinc-400">· {p.note}</span></span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-[11.5px] leading-5 text-zinc-500">
        A video people <span className="font-semibold text-zinc-700">finish and forward</span> beats a video people merely like.
        Even 2 shares per 100 views is a perfect sharing mark.
      </p>
    </div>
  );
}

// Step 2 — which videos are allowed to count.
function FairnessRow() {
  const Card = ({ ok, title, sub }: { ok: boolean; title: string; sub: string }) => (
    <div className={`flex-1 rounded-[9px] px-3 py-2.5 ${ok ? "" : "opacity-60"}`}
         style={{ background: ok ? "#e8f7ef" : "#f1efe8", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.05)" }}>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 grid place-items-center rounded-full text-[9px] font-bold text-white shrink-0"
              style={{ background: ok ? "#0a6b43" : "#a8a29e" }}>{ok ? "✓" : "–"}</span>
        <span className="text-[12px] font-semibold text-zinc-800">{title}</span>
      </div>
      <p className="text-[10.5px] text-zinc-500 mt-1 leading-4">{sub}</p>
    </div>
  );
  return (
    <div>
      <div className="flex gap-2">
        <Card ok title="5 days old, numbers filled in" sub="Counted — it had a fair run." />
        <Card ok={false} title="1 day old" sub="Skipped — too fresh to judge." />
        <Card ok={false} title="No numbers entered" sub="Skipped — can't be judged." />
      </div>
      <p className="mt-2.5 text-[11.5px] leading-5 text-zinc-500">
        A brand-new video hasn't had its chance yet, so it can never drag its lane down.
      </p>
    </div>
  );
}

// Step 3 — fading memory bars.
function MemoryBars() {
  const weeks = [
    { label: "This week", w: 100 },
    { label: "Last week", w: 60 },
    { label: "2 weeks ago", w: 35 },
    { label: "3 weeks ago", w: 20 },
  ];
  return (
    <div>
      <div className="space-y-1.5">
        {weeks.map((wk) => (
          <div key={wk.label} className="flex items-center gap-2.5">
            <span className="text-[11px] text-zinc-500 w-[88px] shrink-0">{wk.label}</span>
            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "#f1efe8" }}>
              <div className="h-full rounded-full" style={{ width: `${wk.w}%`, background: "#0f8c5f", opacity: 0.35 + (wk.w / 100) * 0.65 }} />
            </div>
            <span className="text-[10.5px] font-semibold text-zinc-500 tabular-nums w-9 text-right">{wk.w}%</span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-[11.5px] leading-5 text-zinc-500">
        Like judging someone on their recent month — not just on yesterday.
      </p>
    </div>
  );
}

// Step 4 — seven chips, one promotion, one rest.
function PromotionRow() {
  const lanes = [
    { name: "Winner lane", tone: "win" },
    { name: "Lane", tone: "norm" }, { name: "Lane", tone: "norm" }, { name: "Lane", tone: "norm" },
    { name: "Lane", tone: "norm" }, { name: "Lane", tone: "norm" },
    { name: "Weakest lane", tone: "rest" },
  ] as const;
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {lanes.map((l, i) => (
          <span key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[7px] text-[11px] font-semibold"
                style={l.tone === "win"
                  ? { background: "#e8f7ef", color: "#0a6b43", boxShadow: "inset 0 0 0 1.5px #0f8c5f" }
                  : l.tone === "rest"
                  ? { background: "#fdf3dc", color: "#7a4d0a" }
                  : { background: "#f1efe8", color: "#5f5e5a" }}>
            {l.name}
            <span className="text-[10px] font-bold opacity-80">
              {l.tone === "win" ? "2 slots ↑" : l.tone === "rest" ? "rests 1 cycle" : "1 slot"}
            </span>
          </span>
        ))}
      </div>
      <p className="mt-2.5 text-[11.5px] leading-5 text-zinc-500">
        All 7 lanes keep their slot by default. Only a <span className="font-semibold text-zinc-700">clear winner</span> (20+ points ahead)
        earns a 2nd slot — and the weakest lane just takes one cycle off, then comes back.
        One-off never takes the extra slot. Nobody gets fired for one bad week.
      </p>
    </div>
  );
}

// Step 5 — winners land on peak days.
function PeakDays() {
  const days = [
    { d: "Mon", peak: false }, { d: "Wed", peak: true }, { d: "Fri", peak: false },
    { d: "Mon", peak: false }, { d: "Wed", peak: true }, { d: "Thu", peak: false }, { d: "Sat", peak: false },
  ];
  return (
    <div>
      <div className="flex gap-1.5 flex-wrap">
        {days.map((x, i) => (
          <div key={i} className="w-12 rounded-[8px] px-1 py-2 text-center"
               style={x.peak
                 ? { background: "#0a6b43", boxShadow: "0 2px 8px rgba(10,107,67,0.25)" }
                 : { background: "#f1efe8" }}>
            <p className={`text-[10px] font-bold ${x.peak ? "text-white" : "text-zinc-500"}`}>{x.d}</p>
            <p className={`text-[8.5px] mt-0.5 font-medium ${x.peak ? "text-emerald-100" : "text-zinc-400"}`}>
              {x.peak ? "peak ★" : "slot"}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-[11.5px] leading-5 text-zinc-500">
        The strongest lane is placed on Wednesdays — India's peak engagement day — so your best story gets the biggest stage.
      </p>
    </div>
  );
}

// ── The modal ──────────────────────────────────────────────────────────────────

export function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Scroll affordance: the pinned header earns a divider once the body scrolls.
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const onBodyScroll = useCallback(() => {
    const el = bodyRef.current;
    if (el) setScrolled(el.scrollTop > 4);
  }, []);
  useEffect(() => { if (open) setScrolled(false); }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center p-4"
          style={{ background: "rgba(10,10,10,0.45)", backdropFilter: "blur(3px)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            role="dialog" aria-modal="true" aria-labelledby="how-it-works-title"
            className="relative w-full max-w-[640px] max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-[14px]"
            style={{ background: "#faf9f7", boxShadow: "0 0 0 1px rgba(15,15,15,0.08), 0 24px 60px rgba(15,15,15,0.18)" }}
          >
            {/* Pinned header — earns a hairline divider once the body scrolls. */}
            <div className="shrink-0 flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5 pb-3.5 transition-shadow duration-200"
                 style={{ boxShadow: scrolled ? "0 1px 0 rgba(15,15,15,0.07), 0 6px 16px -10px rgba(15,15,15,0.18)" : "none", zIndex: 1 }}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-1">Weekly Retro</p>
                <h2 id="how-it-works-title" className="text-[18px] font-semibold text-zinc-950 tracking-[-0.02em]">
                  How your lane plan is decided
                </h2>
                <p className="text-[12px] text-zinc-500 mt-1 leading-5">
                  Think of your 7 lanes as 7 shows, each guaranteed one episode per 2-week cycle.
                  After every retro, the engine decides who earned a little more airtime.
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close how-it-works dialog"
                      className="w-7 h-7 shrink-0 grid place-items-center rounded-[6px] text-zinc-500 hover:bg-zinc-100 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Scrollable body — the scroll container IS the flex item (no nested
                percentage heights, which don't resolve reliably inside a
                max-height flex panel). Scrollbar = the app's thin 5px thumb,
                inside the panel and clear of the rounded corners. */}
            <div ref={bodyRef} onScroll={onBodyScroll}
                 className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 pb-4 sm:pb-5 pt-0.5">
              <div className="space-y-3">
                <StepCard n={1} title="Every video gets a score out of 100"
                          kicker="Three questions decide it — and they're not equal.">
                  <ScoreBar />
                </StepCard>
                <StepCard n={2} title="Only fair videos count"
                          kicker="The engine refuses to judge anyone too early.">
                  <FairnessRow />
                </StepCard>
                <StepCard n={3} title="Recent weeks matter more"
                          kicker="The engine remembers the last 4 retro weeks — with fading memory.">
                  <MemoryBars />
                </StepCard>
                <StepCard n={4} title="One gentle promotion, never a firing"
                          kicker="Change is capped at a single slot per cycle.">
                  <PromotionRow />
                </StepCard>
                <StepCard n={5} title="Best story, best stage"
                          kicker="Winning lanes are placed on your strongest days.">
                  <PeakDays />
                </StepCard>
              </div>
            </div>

            {/* Pinned one-line takeaway — always visible while the steps scroll. */}
            <div className="shrink-0 px-4 sm:px-5 py-3 text-center text-[11.5px] leading-5 text-zinc-500"
                 style={{ boxShadow: "0 -1px 0 rgba(15,15,15,0.07)" }}>
              <span className="font-semibold text-zinc-700">In one line:</span> finish + forward decides the score,
              memory fades, change is capped at one slot — and nobody gets fired for one bad week.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small "How it works" trigger button, styled to sit in panel headers. */
export function HowItWorksButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[7px] text-[11.5px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            title="A plain-language tour of how videos are scored and the next cycle's lanes are chosen.">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
      </svg>
      How it works
    </button>
  );
}
