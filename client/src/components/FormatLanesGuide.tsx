/**
 * FormatLanesGuide.tsx — plain-language visual explainer for format lanes,
 * distilled from the KB (FORMAT_LANES.md). Sibling of the retro's HowItWorks
 * modal: same pinned-header + scrollable-body + pinned-takeaway pattern.
 *
 * What it teaches a non-technical reader:
 *   1. A lane is the "show" a Short belongs to — repeatability over one-offs.
 *   2. The 7 lanes, each with its trigger question and a real hook example.
 *   3. The hook picks the lane, not the topic.
 *   4. The 3 trial lanes and how they earn a weekly slot.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

// Lane colors — mirror of the Dashboard/Calendar lane palette.
const LANE_COLOR: Record<string, string> = {
  "Real Reason":             "#1e6fdc",
  "Hidden India":            "#c84a14",
  "Smart Money/Business":    "#0f8c5f",
  "Science Lite":            "#6f43c5",
  "Sharp Contradiction":     "#b3261e",
  "Viral Social Commentary": "#c47e00",
  "One-off":                 "#5a5a5a",
  "Forgotten Inventor":      "#0e7c86",
  "Quiet Monopoly":          "#3b4cc0",
  "Status Game":             "#b5258f",
};

// The 7 canonical lanes — trigger question + a real reference hook (from the KB).
const CORE_LANES: { name: string; ask: string; example: string }[] = [
  { name: "Real Reason",
    ask: "The viewer thinks they know why — but the actual cause is different.",
    example: "“Global supply chains have a priority list. Most of the time, it's invisible.”" },
  { name: "Hidden India",
    ask: "The Indian-ness IS the surprise — not just the setting.",
    example: "“Britain's most decorated female WW2 spy was an Indian princess.”" },
  { name: "Smart Money/Business",
    ask: "A company, founder, or money decision hides the real mechanism.",
    example: "“In 2007 Nokia owned half the smartphone market. Six years later it sold for almost nothing.”" },
  { name: "Science Lite",
    ask: "An everyday body / nature / tech topic has one simple invisible mechanism.",
    example: "“Mosquitoes don't bite randomly. They hunt specific people.”" },
  { name: "Sharp Contradiction",
    ask: "Two true facts that can't both be true — until the hidden logic clicks.",
    example: "“Kerala is India's most literate state — and has among its highest unemployment.”" },
  { name: "Viral Social Commentary",
    ask: "A live Indian internet debate — stage both sides fairly, then surface the machinery beneath.",
    example: "The 70-hour work week. No kids vs one kid." },
  { name: "One-off",
    ask: "A standout story that fits no shelf. Use sparingly, with a written reason.",
    example: "The Voyager Golden Record." },
];

// The 3 trial (proposed) lanes — short descriptors from the KB.
const TRIAL_LANES: { name: string; ask: string }[] = [
  { name: "Forgotten Inventor", ask: "Someone built it — someone else got the credit." },
  { name: "Quiet Monopoly", ask: "A handful of unknown firms quietly control something essential." },
  { name: "Status Game", ask: "The product is really a status signal — and the price tracks the signal." },
];

// "The hook picks the lane" — same-topic-different-lane examples from the KB.
const HOOK_EXAMPLES: { hook: string; lane: string }[] = [
  { hook: "“Mosquitoes don't bite randomly. They hunt specific people.”", lane: "Science Lite" },
  { hook: "“Britain's most decorated female WW2 spy was an Indian princess.”", lane: "Hidden India" },
  { hook: "“Nokia owned half the market. Six years later — sold for scraps.”", lane: "Smart Money/Business" },
];

function SectionCard({ n, title, kicker, children }: {
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

// Section 1 — shows, not one-offs.
function ShowsNotOneOffs() {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {CORE_LANES.map((l) => (
          <span key={l.name} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[11px] font-semibold"
                style={{ background: "#faf9f7", color: "#3f3f46", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.06)" }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LANE_COLOR[l.name] }} />
            {l.name}
          </span>
        ))}
      </div>
      <p className="mt-2.5 text-[11.5px] leading-5 text-zinc-500">
        Each lane is a recurring show with its own promise to the viewer. Post in the same 7 shows every
        2-week cycle and the channel becomes <span className="font-semibold text-zinc-700">recognisable</span> —
        instead of a pile of unrelated one-offs.
      </p>
    </div>
  );
}

// Section 2 — the 7 lanes, one row each.
function LaneCards() {
  return (
    <div className="space-y-1.5">
      {CORE_LANES.map((l) => (
        <div key={l.name} className="rounded-[8px] px-3 py-2.5"
             style={{ background: "#faf9f7", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.05)", borderLeft: `3px solid ${LANE_COLOR[l.name]}` }}>
          <p className="text-[12.5px] font-semibold text-zinc-900">{l.name}</p>
          <p className="text-[11.5px] leading-5 text-zinc-600 mt-0.5">{l.ask}</p>
          <p className="text-[11px] leading-4 text-zinc-400 mt-1 italic">{l.example}</p>
        </div>
      ))}
    </div>
  );
}

// Section 3 — the hook picks the lane.
function HookPicksLane() {
  return (
    <div>
      <div className="space-y-1.5">
        {HOOK_EXAMPLES.map((x) => (
          <div key={x.lane} className="flex items-center gap-2 rounded-[8px] px-3 py-2"
               style={{ background: "#faf9f7", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.05)" }}>
            <span className="min-w-0 flex-1 text-[11.5px] leading-4 text-zinc-600 italic truncate" title={x.hook}>{x.hook}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] text-[10.5px] font-semibold shrink-0"
                  style={{ background: "#fff", color: LANE_COLOR[x.lane], boxShadow: `inset 0 0 0 1px ${LANE_COLOR[x.lane]}40` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: LANE_COLOR[x.lane] }} />
              {x.lane}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-[11.5px] leading-5 text-zinc-500">
        Most strong topics fit two or three lanes — <span className="font-semibold text-zinc-700">the hook decides</span>.
        Whatever the opening line makes surprising, that's the lane. An Indian business story isn't Hidden India;
        it's Smart Money — unless the Indian-ness itself is the twist.
      </p>
    </div>
  );
}

// Section 4 — trial lanes.
function TrialLanes() {
  return (
    <div>
      <div className="space-y-1.5">
        {TRIAL_LANES.map((l) => (
          <div key={l.name} className="flex items-center gap-2.5 rounded-[8px] px-3 py-2"
               style={{ background: "#eef2ff", boxShadow: "inset 0 0 0 1px #c4cbf0" }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LANE_COLOR[l.name] }} />
            <span className="text-[12px] font-semibold text-zinc-900 shrink-0">{l.name}</span>
            <span className="min-w-0 flex-1 text-[11.5px] leading-4 text-zinc-600 truncate" title={l.ask}>{l.ask}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: "#fff", color: "#3b4cc0" }}>On trial</span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-[11.5px] leading-5 text-zinc-500">
        Trial lanes are valid to tag any time, but they don't own a weekly slot. One earns its place by
        beating your typical video twice, in two different weeks — then the Retro's
        <span className="font-semibold text-zinc-700"> Trial lanes</span> panel lets you swap it into the
        rotation with one click. The cycle always stays 7 shows.
      </p>
    </div>
  );
}

// ── The modal ──────────────────────────────────────────────────────────────────

export function FormatLanesGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
            role="dialog" aria-modal="true" aria-labelledby="format-lanes-title"
            className="relative w-full max-w-[640px] max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-[14px]"
            style={{ background: "#faf9f7", boxShadow: "0 0 0 1px rgba(15,15,15,0.08), 0 24px 60px rgba(15,15,15,0.18)" }}
          >
            {/* Pinned header */}
            <div className="shrink-0 flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5 pb-3.5 transition-shadow duration-200"
                 style={{ boxShadow: scrolled ? "0 1px 0 rgba(15,15,15,0.07), 0 6px 16px -10px rgba(15,15,15,0.18)" : "none", zIndex: 1 }}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-1">Format Lanes</p>
                <h2 id="format-lanes-title" className="text-[18px] font-semibold text-zinc-950 tracking-[-0.02em]">
                  What's a format lane?
                </h2>
                <p className="text-[12px] text-zinc-500 mt-1 leading-5">
                  Every Short declares a lane before scripting. A lane is the <em>show</em> it belongs to —
                  the repeatable format that turns a channel of one-offs into a channel people return to.
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close format lanes guide"
                      className="w-7 h-7 shrink-0 grid place-items-center rounded-[6px] text-zinc-500 hover:bg-zinc-100 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Scrollable body — scroll container is the flex item itself. */}
            <div ref={bodyRef} onScroll={onBodyScroll}
                 className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 pb-4 sm:pb-5 pt-0.5">
              <div className="space-y-3">
                <SectionCard n={1} title="7 shows, not random videos"
                             kicker="Your channel runs the same 7 lanes every 2-week cycle — one Short each.">
                  <ShowsNotOneOffs />
                </SectionCard>
                <SectionCard n={2} title="Each lane answers one question"
                             kicker="If the topic makes you ask this question, it belongs in this lane.">
                  <LaneCards />
                </SectionCard>
                <SectionCard n={3} title="The hook picks the lane — not the topic"
                             kicker="Write the opening line first; whatever it makes surprising is the lane.">
                  <HookPicksLane />
                </SectionCard>
                <SectionCard n={4} title="Three lanes are on trial"
                             kicker="They can earn a weekly slot — but only by performing.">
                  <TrialLanes />
                </SectionCard>
              </div>
            </div>

            {/* Pinned one-line takeaway */}
            <div className="shrink-0 px-4 sm:px-5 py-3 text-center text-[11.5px] leading-5 text-zinc-500"
                 style={{ boxShadow: "0 -1px 0 rgba(15,15,15,0.07)" }}>
              <span className="font-semibold text-zinc-700">In one line:</span> a lane is the show a Short belongs to —
              the hook picks it, the cycle repeats it, and that repetition is what makes the channel a channel.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small trigger button, styled to sit in toolbars and panel headers. */
export function FormatLanesGuideButton({ onOpen, label = "What are lanes?" }: { onOpen: () => void; label?: string }) {
  return (
    <button type="button" onClick={onOpen}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[7px] text-[11.5px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            title="A plain-language tour of the 7 format lanes, how the hook picks the lane, and how trial lanes earn a slot.">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
      </svg>
      {label}
    </button>
  );
}
