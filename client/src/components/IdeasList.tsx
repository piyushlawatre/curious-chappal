/**
 * IdeasList.tsx — 1:1 implementation of IdeasBoardScreen design
 */

import { useEffect, useId, useRef, useState } from "react";
import { FormatLanesGuideModal, FormatLanesGuideButton } from "./FormatLanesGuide";
import { useScrollTopOn } from "../lib/useScrollTopOn";
import {
  listIdeas, createIdea, deleteIdea, updateIdea, toggleVideoMade, toggleFullFormVideo, getIdea,
  type IdeaListItem, type IdeaFull, type FormatLane, type IdeaStatus,
} from "../api/ideas";
import { motion } from "framer-motion";
import Popover from "./Popover";
import { CountUp, staggerContainer, fadeUpItem, pillSpring } from "../lib/motion";

// ── Constants ─────────────────────────────────────────────────────────────────

const FORMAT_LANES: FormatLane[] = [
  "Real Reason", "Hidden India", "Smart Money/Business",
  "Science Lite", "Sharp Contradiction", "Viral Social Commentary", "One-off",
  "Forgotten Inventor", "Quiet Monopoly", "Status Game",
];
export type StatusFilter = "active" | "all" | IdeaStatus;
export type ContentTab = "shorts" | "longform";
export type IdeasFilterState = {
  search: string;
  laneFilter: FormatLane;
  statusFilter: StatusFilter;
  contentTab: ContentTab;
  layout: "grid" | "list";
  page: number;
};
export const defaultIdeasFilterState: IdeasFilterState = {
  search: "",
  laneFilter: "",
  statusFilter: "active",
  contentTab: "shorts",
  layout: "grid",
  page: 1,
};

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "active",     label: "Active" },
  { value: "production", label: "Production ready" },
  { value: "on_hold",    label: "On hold" },
  { value: "dropped",    label: "Dropped" },
  { value: "all",        label: "All" },
];
const CONTENT_TABS: { value: ContentTab; label: string }[] = [
  { value: "shorts", label: "Short ideas" },
  { value: "longform", label: "Long-form" },
];

// Design tokens — matching tokens.jsx exactly
const LANE_CFG: Record<string, { dot: string; bg: string; fg: string; ring: string; label: string }> = {
  "Real Reason":          { dot:"#1e6fdc", bg:"#eaf2fc", fg:"#0c3b78", ring:"#bcd6f4",  label:"Real Reason" },
  "Hidden India":         { dot:"#c84a14", bg:"#fcefe6", fg:"#7a2c0a", ring:"#f3cab1",  label:"Hidden India" },
  "Smart Money/Business": { dot:"#0f8c5f", bg:"#e7f6ee", fg:"#0a4d35", ring:"#bee0cd",  label:"Smart Money" },
  "Science Lite":         { dot:"#6f43c5", bg:"#f1edfa", fg:"#3d1e7a", ring:"#d3c4ed",  label:"Science Lite" },
  "Sharp Contradiction":  { dot:"#b3261e", bg:"#fbe9e6", fg:"#651510", ring:"#efc1ba",  label:"Sharp Contra" },
  "Viral Social Commentary": { dot:"#c47e00", bg:"#fdf3dc", fg:"#6b430a", ring:"#f6dc9c",  label:"Viral Social" },
  "One-off":              { dot:"#5a5a5a", bg:"#efede7", fg:"#1f1f1f", ring:"#d6d2c5",  label:"One-off" },
  "Forgotten Inventor":   { dot:"#0e7c86", bg:"#e2f4f6", fg:"#084a52", ring:"#b3e0e5",  label:"Forgotten Inv" },
  "Quiet Monopoly":       { dot:"#3b4cc0", bg:"#e9ebfb", fg:"#1e2875", ring:"#c4cbf0",  label:"Quiet Monopoly" },
  "Status Game":          { dot:"#b5258f", bg:"#fbe9f5", fg:"#6e164f", ring:"#f0c2e0",  label:"Status Game" },
};
const STATUS_CFG: Record<string, { label: string; bg: string; fg: string }> = {
  draft:      { label:"Draft",      bg:"#ecebe5", fg:"#1f1f1f" },
  evaluating: { label:"Evaluating", bg:"#fdf3dc", fg:"#6b430a" },
  scripting:  { label:"Scripting",  bg:"#e8f1fc", fg:"#0c3b78" },
  auditing:   { label:"Auditing",   bg:"#f1edfa", fg:"#3d1e7a" },
  rewriting:  { label:"Rewriting",  bg:"#eef2ff", fg:"#312e81" },
  briefing:   { label:"Briefing",   bg:"#ecfeff", fg:"#155e75" },
  production: { label:"Production", bg:"#e8f7ef", fg:"#0f5132" },
  dropped:    { label:"Dropped",    bg:"#fde8e6", fg:"#7a1f15" },
  on_hold:    { label:"On hold",    bg:"#eeece7", fg:"#2e2c25" },
};
const STEP_LABELS = ["Topic","Script","Audit","Brief"];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// ── Icons (inline SVG) ────────────────────────────────────────────────────────

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

const SearchIcon = (p: { size?: number }) => <Ico {...p} d={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>}/>;
const PlusIcon   = (p: { size?: number }) => <Ico {...p} d={<path d="M12 5v14M5 12h14"/>}/>;
const GridIcon   = (p: { size?: number }) => <Ico {...p} d={<><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></>}/>;
const ListIcon   = (p: { size?: number }) => <Ico {...p} d={<path d="M4 6h16M4 12h16M4 18h16"/>}/>;
const ChevDown   = (p: { size?: number; className?: string }) => <Ico {...p} d={<path d="M6 9l6 6 6-6"/>}/>;
const CheckIcon  = (p: { size?: number }) => <Ico {...p} d={<path d="M5 13l4 4L19 7"/>} stroke={2.6}/>;
const VideoIcon  = (p: { size?: number }) => <Ico {...p} d={<><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></>}/>;
const FullFormIcon = (p: { size?: number }) => <Ico {...p} d={<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>}/>;
const EditIcon   = (p: { size?: number }) => <Ico {...p} d={<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></>}/>;
const LaneIcon   = (p: { size?: number }) => <Ico {...p} d={<><path d="M4 7h16M4 12h10M4 17h7"/></>}/>;
const DownIcon   = (p: { size?: number }) => <Ico {...p} d={<path d="M12 4v12M6 12l6 6 6-6M5 20h14"/>}/>;
const ArrowRt    = (p: { size?: number }) => <Ico {...p} d={<path d="M5 12h14M13 6l6 6-6 6"/>}/>;
const LinkIcon   = (p: { size?: number }) => <Ico {...p} d={<><path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 10-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 105.66 5.66l1-1"/></>}/>;
const MoreIcon   = (p: { size?: number }) => <Ico {...p} d={<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>} fill="currentColor" stroke={0}/>;
const XIcon      = (p: { size?: number }) => <Ico {...p} d={<path d="M6 6l12 12M18 6l-12 12"/>}/>

// ── Atoms ──────────────────────────────────────────────────────────────────────

function Dot({ color, size = 5 }: { color: string; size?: number }) {
  return <span className="inline-block rounded-full shrink-0 motion-dot" style={{ background: color, width: size, height: size }} />;
}

function openOnKeyboard(e: React.KeyboardEvent, onOpen: () => void) {
  if (e.key !== "Enter" && e.key !== " ") return;
  if (e.target !== e.currentTarget) return;
  e.preventDefault();
  onOpen();
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function LaneBadge({ lane }: { lane: string }) {
  const l = LANE_CFG[lane];
  if (!l) return null;
  return (
    <span className="inline-flex items-center gap-1.5 h-[18px] px-2.5 rounded-[4px] text-[10.5px] font-medium motion-pop"
          style={{ background: l.bg, color: l.fg, boxShadow: `inset 0 0 0 1px ${l.ring}` }}>
      <Dot color={l.dot} />
      {l.label}
    </span>
  );
}

function IdeaActionsMenu({ idea, onDelete, onToggleVideo, onToggleFullForm, onOpenCompletion, onEditMeta }: {
  idea: IdeaListItem;
  onDelete: (id: string) => void;
  onToggleVideo: (id: string, val: boolean) => void;
  onToggleFullForm: (id: string, val: boolean) => void;
  onOpenCompletion?: (id: string) => void;
  onEditMeta?: (id: string, patch: { title?: string; formatLane?: FormatLane; verdict?: IdeaListItem["verdict"] }) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  // Inline sub-editors within the menu.
  const [mode, setMode] = useState<"menu" | "title" | "lane">("menu");
  const [titleDraft, setTitleDraft] = useState(idea.title);

  const close = () => { setOpen(false); setConfirmDel(false); setMode("menu"); };
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const submitTitle = () => {
    const next = titleDraft.trim();
    // Only persist a change; empty re-enables auto-derivation (clears the override).
    if (next !== idea.title) onEditMeta?.(idea._id, { title: next });
    close();
  };
  const pickLane = (lane: FormatLane) => {
    if (lane !== (idea.formatLane ?? "")) onEditMeta?.(idea._id, { formatLane: lane });
    close();
  };

  return (
    <div className="relative" onClick={stop}>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${idea.title}`}
        className="w-7 h-7 grid place-items-center rounded-[7px] bg-zinc-50/80 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 motion-press"
      >
        <MoreIcon size={14} />
      </button>

      <Popover
        anchorRef={triggerRef}
        open={open}
        onClose={close}
        align="right"
        width={208}
        surfaceProps={{ role: "menu", onClick: (e) => e.stopPropagation() }}
        className="rounded-[8px] bg-white p-1.5 motion-pop"
        style={{ boxShadow: "0 0 0 1px rgba(15,15,15,0.08), 0 14px 34px rgba(15,15,15,0.16)" }}
      >
        {mode === "title" ? (
          <div className="p-1" onClick={stop}>
            <p className="px-1 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400">Edit title</p>
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); submitTitle(); }
                if (e.key === "Escape") { e.preventDefault(); setMode("menu"); }
              }}
              placeholder="Title (blank = auto from AI output)"
              className="w-full h-8 rounded-[6px] border border-zinc-200 px-2 text-[12px] text-zinc-900 outline-none focus:border-zinc-400"
            />
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); setMode("menu"); }}
                      className="h-7 px-2 rounded-[6px] text-[11px] font-medium text-zinc-500 hover:bg-[#faf9f7]">Back</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); submitTitle(); }}
                      className="h-7 px-3 rounded-[6px] text-[11px] font-semibold text-white bg-zinc-950 hover:bg-zinc-800">Save</button>
            </div>
            {idea.titleManual && (
              <p className="px-1 pt-1.5 text-[10px] text-amber-700">Manual override active — won't auto-update.</p>
            )}
          </div>
        ) : mode === "lane" ? (
          <div className="p-0.5" onClick={stop} role="menu">
            <p className="px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400">Set lane</p>
            <button type="button" role="menuitem" onClick={(e) => { e.stopPropagation(); pickLane(""); }}
                    className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] font-medium text-zinc-500 transition-colors hover:bg-[#faf9f7] hover:text-zinc-900">
              Auto (from AI output)
              {!idea.formatLaneManual && <span className="ml-auto text-[10px] text-emerald-600">current</span>}
            </button>
            {FORMAT_LANES.map((lane) => (
              <button key={lane} type="button" role="menuitem" onClick={(e) => { e.stopPropagation(); pickLane(lane); }}
                      className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] font-medium text-zinc-700 transition-colors hover:bg-[#faf9f7] hover:text-zinc-950">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LANE_CFG[lane]?.dot ?? "#999" }} />
                {LANE_CFG[lane]?.label ?? lane}
                {idea.formatLaneManual && idea.formatLane === lane && <span className="ml-auto text-[10px] text-emerald-600">current</span>}
              </button>
            ))}
            <div className="my-1 h-px bg-zinc-100" />
            <button type="button" onClick={(e) => { e.stopPropagation(); setMode("menu"); }}
                    className="h-7 px-2 rounded-[6px] text-[11px] font-medium text-zinc-500 hover:bg-[#faf9f7]">Back</button>
          </div>
        ) : (
        <>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); setTitleDraft(idea.title); setMode("title"); }}
            className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] font-medium text-zinc-700 transition-colors hover:bg-[#faf9f7] hover:text-zinc-950"
          >
            <EditIcon size={13} />
            Edit title
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); setMode("lane"); }}
            className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] font-medium text-zinc-700 transition-colors hover:bg-[#faf9f7] hover:text-zinc-950"
          >
            <LaneIcon size={13} />
            Set lane{idea.formatLaneManual ? " (manual)" : ""}
          </button>
          <div className="my-1 h-px bg-zinc-100" />
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFullForm(idea._id, !idea.fullFormVideo);
              close();
            }}
            className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] font-medium text-zinc-700 transition-colors hover:bg-[#faf9f7] hover:text-zinc-950"
          >
            <FullFormIcon size={13} />
            {idea.fullFormVideo ? "Remove full-form" : "Mark full-form"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCompletion?.(idea._id);
              close();
            }}
            className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] font-medium text-zinc-700 transition-colors hover:bg-[#faf9f7] hover:text-zinc-950"
          >
            <VideoIcon size={13} />
            {idea.videoMade ? "Review shipped video" : "Complete video"}
          </button>
          <div className="my-1 h-px bg-zinc-100" />
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              if (confirmDel) {
                onDelete(idea._id);
                close();
                return;
              }
              setConfirmDel(true);
            }}
            className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] font-medium transition-colors hover:bg-rose-50"
            style={{ color: confirmDel ? "#7a1f15" : "#dc2626" }}
          >
            <XIcon size={13} />
            {confirmDel ? "Click again to delete" : "Delete idea"}
          </button>
        </>
        )}
      </Popover>
    </div>
  );
}

// ── Pipeline Track ─────────────────────────────────────────────────────────────

function PipelineTrack({ steps, videoMade }: { steps: IdeaListItem["steps"]; videoMade: boolean }) {
  return (
    <div className="flex items-start px-1" style={{ gap: 0 }}>
      {steps.map((s, i) => {
        const isLast      = i === steps.length - 1;
        const isVideo     = isLast && videoMade && s.status === "completed";
        const isCompleted = s.status === "completed";
        const hasOutput   = s.status === "output_added";
        const hasPrompt   = s.status === "prompt_generated";
        const next        = steps[i + 1];
        const linked      = isCompleted || (next && next.status !== "not_started");

        type NodeCfg = { bg: string; fg: string; ring: string };
        let cfg: NodeCfg;
        if (isVideo) {
          cfg = { bg: "#6f43c5", fg: "#ffffff", ring: "0 0 0 3px #f1ecfa" };
        } else if (isCompleted) {
          cfg = { bg: "#16a34a", fg: "#ffffff", ring: "none" };
        } else if (hasOutput) {
          cfg = { bg: "#1e6fdc", fg: "#ffffff", ring: "none" };
        } else if (hasPrompt) {
          cfg = { bg: "#fdf3dc", fg: "#6b430a", ring: "inset 0 0 0 1px #f6dc9c" };
        } else {
          cfg = { bg: "#ffffff", fg: "#9a9a9a", ring: "inset 0 0 0 1px #d8d5c8" };
        }

        const isActive = !isCompleted && !isVideo && (hasOutput || hasPrompt);
        return (
          <div key={s.id} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center" style={{ minWidth: 24 }}>
              <div className={`rounded-full flex items-center justify-center font-mono font-bold motion-soft ${isCompleted || isVideo ? "motion-pop" : ""} ${isActive ? "ring-2 ring-offset-1 ring-[#1e6fdc]/30" : ""}`}
                   style={{ width: 20, height: 20, background: cfg.bg, color: cfg.fg, boxShadow: cfg.ring, fontSize: 9 }}>
                {isVideo ? (
                  <VideoIcon size={8} />
                ) : isCompleted ? (
                  <CheckIcon size={8} />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className="text-[8px] text-zinc-400 font-medium mt-1 text-center" style={{ minWidth: 26, lineHeight: 1.1 }}>
                {STEP_LABELS[i]}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 self-start rounded-full mx-0.5 motion-progress"
                   style={{ height: 2, marginTop: 9, background: linked ? "#16a34a" : "#e3e1dc" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Idea Card ──────────────────────────────────────────────────────────────────

// ── IdeaRow — compact list-view row ──────────────────────────────────────────

function IdeaRow({ idea, onClick, onDelete, onToggleVideo, onToggleFullForm, onOpenCompletion, onEditMeta }: {
  idea: IdeaListItem;
  onClick: () => void;
  onDelete: (id: string) => void;
  onToggleVideo: (id: string, val: boolean) => void;
  onToggleFullForm: (id: string, val: boolean) => void;
  onOpenCompletion?: (id: string) => void;
  onEditMeta?: (id: string, patch: { title?: string; formatLane?: FormatLane; verdict?: IdeaListItem["verdict"] }) => void;
}) {
  const lane = LANE_CFG[idea.formatLane ?? ""] ?? null;
  const sc = STATUS_CFG[idea.ideaStatus] ?? STATUS_CFG.draft;
  const doneCount = idea.steps?.filter(s => s.status === "completed").length ?? 0;
  const totalSteps = idea.steps?.length ?? 5;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Open idea ${idea.title}`}
      variants={fadeUpItem}
      className="group flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-[#faf9f7] cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#d3501c]"
      onClick={onClick}
      onKeyDown={e => openOnKeyboard(e, onClick)}
    >
      {/* Title + lane */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-[13px] font-medium text-zinc-900 truncate">{idea.title}</span>
        <span className="shrink-0 text-[10.5px] font-semibold px-1.5 h-[18px] inline-flex items-center rounded-[4px]"
              style={{ background: sc.bg, color: sc.fg }}>
          {sc.label}
        </span>
        {lane && (
          <span className="shrink-0 text-[10.5px] font-semibold px-1.5 h-[18px] inline-flex items-center rounded-[4px]"
                style={{ background: lane.bg, color: lane.fg, boxShadow: `inset 0 0 0 1px ${lane.ring}` }}>
            {idea.formatLane}
          </span>
        )}
        {idea.fullFormVideo && (
          <span className="shrink-0 text-[10.5px] font-semibold px-1.5 h-[18px] inline-flex items-center gap-1 rounded-[4px]"
                style={{ background: "#fff7ed", color: "#9a3412", boxShadow: "inset 0 0 0 1px #fed7aa" }}>
            <FullFormIcon size={10} /> Full-form
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const s = idea.steps?.[i];
            const st = s?.status ?? "not_started";
            const color = st === "completed" ? "#16a34a" : st === "output_added" ? "#1e6fdc" : st === "prompt_generated" ? "#b9760b" : "#d4d2c8";
            return <span key={i} className="inline-block rounded-full motion-dot" style={{ width: 6, height: 6, background: color }} />;
          })}
        </div>
        <span className="text-[11px] text-zinc-400 num w-8 text-right">{doneCount}/{totalSteps}</span>
        <span className="hidden sm:inline text-[11px] text-zinc-400 num w-12 text-right">{timeAgo(idea.updatedAt)}</span>
      </div>

      <IdeaActionsMenu
        idea={idea}
        onDelete={onDelete}
        onToggleVideo={onToggleVideo}
        onToggleFullForm={onToggleFullForm}
        onOpenCompletion={onOpenCompletion}
        onEditMeta={onEditMeta}
      />
    </motion.div>
  );
}

function IdeaCard({ idea, onClick, onDelete, onToggleVideo, onToggleFullForm, onOpenCompletion, onEditMeta }: {
  idea: IdeaListItem;
  onClick: () => void;
  onDelete: (id: string) => void;
  onToggleVideo: (id: string, val: boolean) => void;
  onToggleFullForm: (id: string, val: boolean) => void;
  onOpenCompletion?: (id: string) => void;
  onEditMeta?: (id: string, patch: { title?: string; formatLane?: FormatLane; verdict?: IdeaListItem["verdict"] }) => void;
}) {
  const sc   = STATUS_CFG[idea.ideaStatus] ?? STATUS_CFG.draft;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Open idea ${idea.title}`}
      onClick={onClick}
      onKeyDown={e => openOnKeyboard(e, onClick)}
      variants={fadeUpItem}
      whileHover={{ y: -3 }}
      transition={pillSpring}
      className="group bg-white rounded-[8px] relative overflow-visible cursor-pointer hover:shadow-[0_10px_28px_rgba(15,15,15,0.13)] hover:border-zinc-300 transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d3501c]"
      style={{ minHeight: 168, boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}
    >
      <div className="p-3.5">
        {/* Title */}
        <h3 className="min-h-[36px] font-semibold text-zinc-900 text-[14px] leading-[1.3] tracking-[-0.01em] line-clamp-2 pr-9 mb-2">
          {idea.title}
        </h3>

        {/* Badges */}
        <div className="flex min-h-[22px] flex-wrap items-center gap-1.5 mb-2.5">
          {idea.formatLane && <LaneBadge lane={idea.formatLane} />}
          {idea.videoMade && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-[4px] font-semibold"
                  style={{ background: "#f1ecfa", color: "#3d1e7a", boxShadow: "inset 0 0 0 1px #d6c5f1" }}>
              <VideoIcon size={10} /> SHIPPED
            </span>
          )}
          {idea.fullFormVideo && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-[4px] font-semibold"
                  style={{ background: "#fff7ed", color: "#9a3412", boxShadow: "inset 0 0 0 1px #fed7aa" }}>
              <FullFormIcon size={10} /> FULL-FORM
            </span>
          )}
        </div>

        {/* Pipeline */}
        <PipelineTrack steps={idea.steps} videoMade={idea.videoMade} />

        {/* Footer */}
        <div className="mt-3 pt-2.5 flex items-center justify-between text-[11px]"
             style={{ borderTop: "1px solid #ecebe5" }}>
          <span className="inline-flex h-[20px] items-center rounded-[5px] px-2 font-semibold"
                style={{ background: sc.bg, color: sc.fg }}>
            {sc.label}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 num font-medium">{timeAgo(idea.updatedAt)}</span>
            {!["dropped","on_hold"].includes(idea.ideaStatus) && (
              <span className="text-[10.5px] font-semibold text-zinc-600 inline-flex items-center gap-0.5">
                Open <ArrowRt size={9} />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card actions */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <IdeaActionsMenu
          idea={idea}
          onDelete={onDelete}
          onToggleVideo={onToggleVideo}
          onToggleFullForm={onToggleFullForm}
          onOpenCompletion={onOpenCompletion}
          onEditMeta={onEditMeta}
        />
      </div>
    </motion.div>
  );
}

// ── Filter Select ─────────────────────────────────────────────────────────────

function FilterSelect({ label, value, options, onChange, active }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  active?: boolean;
}) {
  const labelId = useId();
  const valueId = useId();
  const listboxId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const selected = options[selectedIndex] ?? options[0];
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setHighlightedIndex(selectedIndex);
  }, [open, selectedIndex]);

  // Keep the highlighted option scrolled into view (long lists / keyboard nav).
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(listboxId)}-${highlightedIndex}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, highlightedIndex, listboxId]);

  const choose = (option: { value: string; label: string }) => {
    onChange(option.value);
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      setHighlightedIndex(selectedIndex);
      return;
    }

    if (!open) return;

    if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(index => Math.min(options.length - 1, index + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(index => Math.max(0, index - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlightedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlightedIndex(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(options[highlightedIndex] ?? selected);
    }
  };

  return (
    <div className="relative z-20">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={`${labelId} ${valueId}`}
        onClick={() => setOpen(value => !value)}
        onKeyDown={onKeyDown}
        className="h-8 min-w-[146px] rounded-[7px] text-[11.5px] inline-flex items-center gap-1.5 transition-colors motion-press"
        style={active
          ? { background: "#0a0a0a", color: "#ffffff", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }
          : { background: "#ffffff", color: "#3a3a3a", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }
        }
      >
        <span id={labelId} className="pl-2.5" style={{ color: active ? "rgba(255,255,255,0.55)" : "#7a7a7a" }}>{label}:</span>
        <span id={valueId} className="min-w-0 flex-1 truncate text-left font-medium">{selected?.label ?? "All"}</span>
        <span className={`mr-2 opacity-60 motion-rotate ${open ? "motion-rotate-open" : ""}`}>
          <ChevDown size={10} />
        </span>
      </button>

      <Popover
        anchorRef={buttonRef}
        open={open}
        onClose={() => setOpen(false)}
        align="left"
        offset={5}
        width={Math.max(buttonRef.current?.offsetWidth ?? 146, 160)}
        forwardSurfaceRef={listRef}
        surfaceProps={{
          id: listboxId,
          role: "listbox",
          "aria-labelledby": labelId,
          "aria-activedescendant": `${listboxId}-${highlightedIndex}`,
        }}
        className="rounded-[7px] bg-white p-1 motion-pop"
        style={{ boxShadow: "0 0 0 1px rgba(15,15,15,0.08), 0 14px 36px rgba(15,15,15,0.14)", maxWidth: 240 }}
      >
          {options.map((option, index) => {
            const selectedOption = option.value === value;
            const highlighted = index === highlightedIndex;
            return (
              <button
                key={option.value || "all"}
                id={`${listboxId}-${index}`}
                type="button"
                role="option"
                aria-selected={selectedOption}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => choose(option)}
                className={`flex h-7 w-full items-center gap-2 rounded-[5px] px-2 text-left text-[11.5px] font-medium transition-colors ${
                  highlighted ? "bg-[#f3f2ee] text-zinc-950" : "text-zinc-700"
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {selectedOption && <CheckIcon size={11} />}
              </button>
            );
          })}
      </Popover>
    </div>
  );
}

// ── New Idea Modal ─────────────────────────────────────────────────────────────

type TopicForm = {
  topic: string; surfaceNarrative: string; whyInteresting: string; sourceLink: string; mentalModel: string;
};
const emptyForm: TopicForm = { topic: "", surfaceNarrative: "", whyInteresting: "", sourceLink: "", mentalModel: "" };

function serializeTopicForStep(f: TopicForm): string {
  return [
    `Topic: ${f.topic.trim()}`,
    `Surface narrative most people know: ${f.surfaceNarrative.trim()}`,
    `Why I think it might be interesting: ${f.whyInteresting.trim()}`,
    `Source / article / video / event link (optional): ${f.sourceLink.trim() || "N/A"}`,
    `Mental model / framework, if you already have one (optional): ${f.mentalModel.trim() || "N/A"}`,
  ].join("\n");
}

function NewIdeaModal({ onClose, onCreated }: {
  onClose: () => void; onCreated: (idea: IdeaFull) => void;
}) {
  const [form, setForm] = useState<TopicForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const topicRef = useRef<HTMLInputElement>(null);
  const surfaceRef = useRef<HTMLTextAreaElement>(null);
  const whyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    topicRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const set = (field: keyof TopicForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic.trim()) { setError("Topic is required"); topicRef.current?.focus(); return; }
    if (!form.surfaceNarrative.trim()) { setError("Surface narrative is required"); surfaceRef.current?.focus(); return; }
    if (!form.whyInteresting.trim()) { setError("Why interesting is required"); whyRef.current?.focus(); return; }
    setSaving(true); setError("");
    try {
      const idea = await createIdea({ title: form.topic.trim(), topicIdea: serializeTopicForStep(form) });
      onCreated(idea);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create idea");
    } finally { setSaving(false); }
  };

  const inputCls = "w-full rounded-[6px] bg-white h-8 px-2.5 text-[12.5px] text-zinc-900 outline-none transition placeholder:text-zinc-400 motion-soft"
    + " shadow-[inset_0_0_0_1px_rgba(15,15,15,0.10)] focus:shadow-[inset_0_0_0_1px_#0a0a0a]";
  const areaCls  = "w-full rounded-[6px] bg-white p-2.5 text-[12.5px] leading-[1.55] text-zinc-900 outline-none transition placeholder:text-zinc-400 resize-none motion-soft"
    + " shadow-[inset_0_0_0_1px_rgba(15,15,15,0.10)] focus:shadow-[inset_0_0_0_1px_#0a0a0a]";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 motion-modal-backdrop"
      style={{ background: "rgba(10,10,10,0.45)", backdropFilter: "blur(3px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-idea-title"
        className="bg-white rounded-[14px] w-full max-h-[calc(100vh-2rem)] overflow-y-auto motion-modal-card"
           style={{ maxWidth: 560, boxShadow: "0 0 0 1px rgba(15,15,15,0.08), 0 24px 60px rgba(15,15,15,0.18)" }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-1">Create</p>
            <h2 id="new-idea-title" className="text-[18px] font-semibold text-zinc-950 tracking-[-0.02em]">New idea</h2>
          </div>
          <button onClick={onClose}
                  aria-label="Close new idea dialog"
                  className="w-7 h-7 grid place-items-center rounded-[6px] text-zinc-500 hover:bg-zinc-100 cursor-pointer motion-press">
            <XIcon size={14} />
          </button>
        </div>

        <form id="new-idea-form" onSubmit={handleSubmit} className="px-6 pb-5 space-y-3.5 motion-stagger-fast">
          {error && (
            <p role="alert" aria-live="assertive"
               className="text-[11.5px] text-rose-700 bg-rose-50 rounded-[6px] px-3 py-2 motion-banner"
               style={{ boxShadow: "inset 0 0 0 1px #f4bdb6" }}>{error}</p>
          )}

          {/* Topic */}
          <label className="block">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <span className="text-[11.5px] font-medium text-zinc-700">
                Title <span style={{ color: "#c84a14" }}>*</span>
              </span>
              <span className="text-[10.5px] text-zinc-400">≤ 80 chars · how you'll see it on the board</span>
            </div>
            <input ref={topicRef} value={form.topic} onChange={set("topic")}
                   maxLength={80}
                   aria-invalid={error === "Topic is required"}
                   placeholder="Why did UPI dominate in India?" className={inputCls} />
          </label>

          {/* Surface narrative */}
          <label className="block">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <span className="text-[11.5px] font-medium text-zinc-700">
                Surface narrative <span style={{ color: "#c84a14" }}>*</span>
              </span>
              <span className="text-[10.5px] text-zinc-400">The story most people already know</span>
            </div>
            <textarea ref={surfaceRef} value={form.surfaceNarrative} onChange={set("surfaceNarrative")} rows={2}
                      aria-invalid={error === "Surface narrative is required"}
                      placeholder="The common / obvious version of this story" className={areaCls} />
          </label>

          {/* Why interesting */}
          <label className="block">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <span className="text-[11.5px] font-medium text-zinc-700">
                Why you think it's interesting <span style={{ color: "#c84a14" }}>*</span>
              </span>
              <span className="text-[10.5px] text-zinc-400">What you suspect is actually true</span>
            </div>
            <textarea ref={whyRef} value={form.whyInteresting} onChange={set("whyInteresting")} rows={2}
                      aria-invalid={error === "Why interesting is required"}
                      placeholder="What makes this feel worth making a video about?" className={areaCls} />
          </label>

          {/* Source link */}
          <label className="block">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <span className="text-[11.5px] font-medium text-zinc-700">Source / article / event link</span>
              <span className="text-[10.5px] text-zinc-400">optional</span>
            </div>
            <div className="flex items-center rounded-[6px] bg-white px-2.5 h-8 gap-1.5 transition motion-soft"
                 style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.10)" }}>
              <LinkIcon size={12} />
              <input value={form.sourceLink} onChange={set("sourceLink")}
                     placeholder="Paste a URL, article title, or note"
                     className="flex-1 bg-transparent outline-none text-[12.5px] text-zinc-900 placeholder:text-zinc-400" />
            </div>
          </label>

          {/* Mental model */}
          <label className="block">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <span className="text-[11.5px] font-medium text-zinc-700">Mental model / framework</span>
              <span className="text-[10.5px] text-zinc-400">optional</span>
            </div>
            <input value={form.mentalModel} onChange={set("mentalModel")}
                   placeholder="e.g. second-order effects, scarcity loop, status signalling…"
                   className={inputCls} />
          </label>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 flex flex-col gap-3 border-t sm:flex-row sm:items-center sm:justify-between"
             style={{ borderColor: "#ecebe5", background: "#f7f6f1" }}>
          <span className="text-[11px] text-zinc-500">
            Saves a draft and opens <span className="font-medium text-zinc-700">Step 01 · Topic Evaluation</span>.
          </span>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose}
                    className="h-8 px-3 rounded-[6px] text-[12.5px] font-medium text-zinc-700 hover:bg-zinc-200 transition motion-press"
                    style={{ background: "#ecebe5" }}>
              Cancel
            </button>
            <button type="submit" form="new-idea-form" disabled={saving}
                    className="h-8 px-3 rounded-[6px] text-[12.5px] font-medium text-white inline-flex items-center gap-1.5 transition disabled:opacity-50 motion-press"
                    style={{ background: "#d3501c", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }}>
              {saving ? (
                <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating…</>
              ) : (
                <>Create &amp; open <ArrowRt size={13} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({
  onNew,
  filtered = false,
  onClearFilters,
  title,
  description,
}: {
  onNew: () => void;
  filtered?: boolean;
  onClearFilters?: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 motion-page">
      <div className="w-16 h-16 rounded-[14px] grid place-items-center mb-5 motion-pop"
           style={{ background: "#fff0e8", boxShadow: "inset 0 0 0 1px #ffd4bf" }}>
        <span className="text-2xl font-mono font-bold" style={{ color: "#d3501c" }}>cc</span>
      </div>
      <h3 className="text-[18px] font-semibold text-zinc-950 tracking-[-0.02em] mb-1.5">
        {title ?? (filtered ? "No matching ideas" : "No ideas yet")}
      </h3>
      <p className="text-[13px] text-zinc-500 mb-6 max-w-xs leading-relaxed">
        {description ?? (filtered
          ? "Try a different search or clear the active filters to see the full board."
          : "Create your first idea to start the 5-step content pipeline.")}
      </p>
      <div className="flex items-center gap-2">
        {filtered && onClearFilters ? (
          <button onClick={onClearFilters}
                  className="h-9 px-4 rounded-[8px] text-[13px] font-medium text-zinc-700 bg-white inline-flex items-center gap-2 transition hover:bg-zinc-100 motion-press"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
            Clear filters
          </button>
        ) : (
          <button onClick={onNew}
                  className="h-9 px-4 rounded-[8px] text-[13px] font-medium text-white inline-flex items-center gap-2 transition hover:opacity-90 motion-press"
                  style={{ background: "#d3501c", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }}>
            <PlusIcon size={14} /> New idea
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type IdeasListProps = {
  /** Persisted filter state, owned by the parent so it survives unmount. */
  filterState: IdeasFilterState;
  onFilterStateChange: (patch: Partial<IdeasFilterState>) => void;
  onOpenIdea: (ideaId: string, title?: string) => void;
  onOpenIdeaFull: (idea: IdeaFull, stepIndex?: number) => void;
  onOpenCompletion?: (ideaId: string) => void;
  initialIdeas?: IdeaListItem[];
  onIdeasLoaded?: (ideas: IdeaListItem[]) => void;
};

export default function IdeasList({
  onOpenIdea,
  onOpenIdeaFull,
  onOpenCompletion,
  filterState,
  onFilterStateChange,
  initialIdeas = [],
  onIdeasLoaded,
}: IdeasListProps) {
  const [ideas, setIdeas] = useState<IdeaListItem[]>(initialIdeas);
  const [loading, setLoading] = useState(initialIdeas.length === 0);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showLanesGuide, setShowLanesGuide] = useState(false);

  // Filter state lives in the parent (App) so it persists across opening and
  // returning to an idea. Local setters just forward a patch upward.
  const { search, laneFilter, statusFilter, contentTab, layout, page } = filterState;
  const setSearch       = (v: string)               => onFilterStateChange({ search: v });
  const setLaneFilter   = (v: FormatLane)           => onFilterStateChange({ laneFilter: v });
  const setStatusFilter = (v: StatusFilter)         => onFilterStateChange({ statusFilter: v });
  const setContentTab   = (v: ContentTab)           => onFilterStateChange({ contentTab: v });
  const setLayout       = (v: "grid" | "list")      => onFilterStateChange({ layout: v });
  const setPage         = (v: number)               => onFilterStateChange({ page: v });
  const PAGE_SIZE = 12;
  // Page changes keep the cards container alive — reset it to the top.
  const cardsScrollRef = useScrollTopOn(page);
  const commitIdeas = (updater: (prev: IdeaListItem[]) => IdeaListItem[]) => {
    setIdeas(prev => {
      const next = updater(prev);
      onIdeasLoaded?.(next);
      return next;
    });
  };

  // Note: dashboard lane navigation is applied by the parent (App) directly into
  // filterState, so there is no mount-time lane effect here. This prevents a
  // remount (after returning from an idea) from re-clobbering remembered filters.

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isEditableTarget(e.target) || showNew) return;
      if (e.key.toLowerCase() !== "n") return;
      e.preventDefault();
      setShowNew(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showNew]);

  const load = async (blocking = ideas.length === 0) => {
    if (blocking) setLoading(true);
    setError("");
    try {
      const filters: Parameters<typeof listIdeas>[0] = {};
      if (search.trim()) filters.search = search.trim();
      if (laneFilter) filters.lane = laneFilter;
      if (statusFilter !== "active" && statusFilter !== "all") filters.status = statusFilter;

      const result = await listIdeas(Object.keys(filters).length ? filters : undefined);
      const nextIdeas = statusFilter === "active" ? result.filter(i => !["on_hold","dropped"].includes(i.ideaStatus)) : result;
      setIdeas(nextIdeas);
      onIdeasLoaded?.(nextIdeas);
    }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load ideas"); }
    finally { if (blocking) setLoading(false); }
  };

  // Load on mount immediately, and whenever lane/status change (no debounce —
  // these are discrete clicks). The immediate mount load matters because the
  // parent briefly swaps IdeasList for a loading spinner during navigation; a
  // debounced-only load could be cancelled by that remount before it ever ran,
  // leaving the board empty until a filter was touched.
  const didMount = useRef(false);
  useEffect(() => {
    void load(ideas.length === 0);
  }, [laneFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce only the search input so we don't fire a request per keystroke.
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    const t = setTimeout(() => void load(ideas.length === 0), 350);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset to page 1 whenever filters or tab change — but NOT on mount, otherwise
  // returning to the board (a remount) would stomp the remembered page back to 1.
  const filterSig = `${search}|${laneFilter}|${statusFilter}|${contentTab}|${layout}`;
  const prevFilterSig = useRef(filterSig);
  useEffect(() => {
    if (prevFilterSig.current !== filterSig) {
      prevFilterSig.current = filterSig;
      setPage(1);
    }
  }, [filterSig]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreated = (idea: IdeaFull) => { setShowNew(false); onOpenIdeaFull(idea, 0); };
  const handleDelete  = async (id: string) => {
    try { await deleteIdea(id); commitIdeas(p => p.filter(i => i._id !== id)); }
    catch (err) { alert(err instanceof Error ? err.message : "Delete failed"); }
  };
  const handleToggleVideo = async (id: string, val: boolean) => {
    try {
      const updated = await toggleVideoMade(id, val);
      // When finalising, the server may have replaced the title with the AI-decided one
      commitIdeas(p => p.map(i => i._id === id ? { ...i, videoMade: updated.videoMade, title: updated.title } : i));
    }
    catch (err) { alert(err instanceof Error ? err.message : "Update failed"); }
  };
  const handleToggleFullForm = async (id: string, val: boolean) => {
    try {
      const updated = await toggleFullFormVideo(id, val);
      commitIdeas(p => p.map(i => i._id === id ? { ...i, fullFormVideo: updated.fullFormVideo } : i));
    }
    catch (err) { alert(err instanceof Error ? err.message : "Update failed"); }
  };
  // Manual metadata edit (title / formatLane / verdict). Sending a non-empty value
  // marks that field as a manual override server-side so the stepper's auto-derive
  // won't later overwrite it; sending "" re-enables auto-derivation.
  const handleEditMeta = async (id: string, patch: { title?: string; formatLane?: FormatLane; verdict?: IdeaListItem["verdict"] }) => {
    try {
      const updated = await updateIdea(id, patch);
      commitIdeas(p => p.map(i => i._id === id ? {
        ...i,
        title: updated.title,
        formatLane: updated.formatLane,
        verdict: updated.verdict,
        titleManual: updated.titleManual,
        formatLaneManual: updated.formatLaneManual,
        verdictManual: updated.verdictManual,
      } : i));
    }
    catch (err) { alert(err instanceof Error ? err.message : "Update failed"); }
  };
  const hasActiveFilters = Boolean(search.trim() || laneFilter || statusFilter !== "active");
  const clearFilters = () => {
    setSearch("");
    setLaneFilter("");
    setStatusFilter("active");
  };
  const visibleIdeas = contentTab === "longform"
    ? ideas.filter(i => i.fullFormVideo)
    : ideas.filter(i => !i.fullFormVideo);
  /** Extract locked spoken script from Editor Brief aiOutput (mirrors EditorBriefOutput.tsx) */
  function extractSpokenScript(body: string): string {
    if (!body) return "";
    // 1. Fenced code block
    const fenced = body.match(/```(?:md|markdown)?[ \t]*\n([\s\S]*?)```/i);
    if (fenced) return fenced[1].trim();
    // 2. Blockquote block after "Locked spoken script" heading
    const headingMatch = body.match(/\*\*Locked spoken script\b/i);
    const searchFrom = headingMatch
      ? body.indexOf("\n", body.indexOf(headingMatch[0])) + 1
      : 0;
    const lines = body.slice(searchFrom).split("\n");
    const bqLines: string[] = [];
    let inBlock = false;
    for (const line of lines) {
      if (/^> /.test(line) || line === ">") {
        inBlock = true;
        bqLines.push(line.replace(/^> ?/, ""));
      } else if (inBlock) break;
    }
    if (bqLines.length) return bqLines.join("\n").trim();
    return "";
  }

  const exportIdeas = async () => {
    const results: { id: string; title: string; script: string; _debug?: string }[] = [];
    for (const idea of visibleIdeas) {
      try {
        const full = await getIdea(idea._id);
        const editorBriefStep = full.steps.find(s => s.id === "04_EDITOR_BRIEF");
        const editorBriefOutput = editorBriefStep?.aiOutput ?? "";
        const script = extractSpokenScript(editorBriefOutput);
        results.push({
          id: idea._id,
          title: idea.title || "",
          script,
          _debug: `step_found:${!!editorBriefStep} aiOutput_len:${editorBriefOutput.length} script_len:${script.length}`,
        });
      } catch (err) {
        results.push({ id: idea._id, title: idea.title || "", script: "", _debug: `error:${String(err)}` });
      }
    }
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `curious-scripts-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shortCount = ideas.filter(i => !i.fullFormVideo).length;
  const fullFormCount = ideas.filter(i => i.fullFormVideo).length;
  const activeAll  = visibleIdeas.filter(i => !["on_hold","dropped"].includes(i.ideaStatus));
  const totalPages = Math.ceil(activeAll.length / PAGE_SIZE);
  const active     = activeAll.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const parked    = statusFilter === "active" ? [] : visibleIdeas.filter(i => ["on_hold","dropped"].includes(i.ideaStatus));
  const hasVisibleIdeas = visibleIdeas.length > 0;
  const primarySectionLabel = contentTab === "longform" ? "Long-form candidates" : "Active ideas";
  const parkedSectionLabel = contentTab === "longform" ? "Parked long-form" : "Parked & shipped";
  const summaryText = contentTab === "longform"
    ? `${fullFormCount} full-form candidate${fullFormCount === 1 ? "" : "s"}`
    : `${shortCount} short idea${shortCount === 1 ? "" : "s"}`;

  return (
    <div className="flex flex-col h-full motion-page" style={{ background: "#faf9f7" }}>
      {/* Page header */}
      <div className="relative z-30 shrink-0 motion-panel">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-7 pt-3 pb-2.5 sm:pt-4 sm:pb-3">
          <div className="flex flex-col gap-2.5">
            {/* Title + actions row */}
            <div className="mb-0.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-[26px] font-semibold text-zinc-950 tracking-[-0.03em] leading-[1.08]">Ideas</h1>
              <div className="flex items-center gap-2">
                <FormatLanesGuideButton onOpen={() => setShowLanesGuide(true)} />
                <button type="button" onClick={exportIdeas} disabled={!ideas.length}
                        className="h-8 px-3 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 text-zinc-500 transition hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-45 motion-press"
                        style={{ background: "transparent" }}>
                  <DownIcon size={12} /> Export
                </button>
                <button type="button" onClick={() => setShowNew(true)}
                        className="h-8 px-3 rounded-[7px] text-[12px] font-medium text-white inline-flex items-center gap-1.5 transition hover:opacity-90 motion-press"
                        style={{ background: "#d3501c", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }}>
                  <PlusIcon size={14} /> New idea
                </button>
              </div>
            </div>

            {/* Filter bar — tabs + search + filters + view toggle all in one row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Content-type tabs */}
              <div className="flex items-center gap-1 rounded-[8px] border border-zinc-200 bg-white p-1 shadow-[0_1px_0_rgba(15,15,15,0.03)] shrink-0">
                {CONTENT_TABS.map(tab => {
                  const activeTab = contentTab === tab.value;
                  const count = tab.value === "longform" ? fullFormCount : shortCount;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setContentTab(tab.value)}
                      className={`relative h-7 px-3 rounded-[6px] text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors outline-none motion-press ${
                        activeTab ? "text-white" : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      {activeTab && (
                        <motion.span layoutId="ideasTabPill" transition={pillSpring}
                          className="absolute inset-0 rounded-[6px] bg-zinc-950 shadow-sm" />
                      )}
                      <span className="relative z-10 inline-flex items-center gap-1.5">
                        {tab.value === "longform" ? <FullFormIcon size={11} /> : <VideoIcon size={11} />}
                        {tab.label}
                        <CountUp value={count} className={`text-[10px] font-mono ${activeTab ? "opacity-60" : "opacity-50"}`} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-5 w-px bg-zinc-200 shrink-0" />

              {/* Search */}
              <div className="relative shrink-0">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-2.5 pointer-events-none">
                  <SearchIcon size={13} />
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)}
                       placeholder="Search title, lane, or topic…"
                       className="pl-7 pr-2 h-8 w-52 rounded-[7px] bg-white text-[12px] text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:shadow-[inset_0_0_0_1px_#0a0a0a] motion-soft"
                       style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }} />
              </div>

              {/* Lane + Status filters */}
              <FilterSelect
                label="Lane"
                value={laneFilter}
                active={Boolean(laneFilter)}
                options={[{ value: "", label: "All" }, ...FORMAT_LANES.map(lane => ({ value: lane, label: LANE_CFG[lane]?.label ?? lane }))]}
                onChange={value => setLaneFilter(value as FormatLane)}
              />
              <FilterSelect
                label="Status"
                value={statusFilter}
                active={statusFilter !== "active"}
                options={STATUS_FILTERS}
                onChange={value => setStatusFilter(value as StatusFilter)}
              />

              {/* Spacer pushes Grid/List to the right */}
              <div className="flex-1" />

              {/* Grid / List toggle */}
              <div className="flex items-center gap-1 rounded-[7px] p-0.5 shrink-0" style={{ background: "#ffffff", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
                <button type="button" onClick={() => setLayout("grid")}
                        className={`relative px-2 h-6 rounded-[5px] text-[11px] font-medium inline-flex items-center gap-1 transition-colors motion-press ${layout === "grid" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}>
                  {layout === "grid" && <motion.span layoutId="ideasLayoutPill" transition={pillSpring} className="absolute inset-0 rounded-[5px]" style={{ background: "#f3f2ee" }} />}
                  <span className="relative z-10 inline-flex items-center gap-1"><GridIcon size={11} /> Grid</span>
                </button>
                <button type="button" onClick={() => setLayout("list")}
                        className={`relative px-2 h-6 rounded-[5px] text-[11px] font-medium inline-flex items-center gap-1 transition-colors motion-press ${layout === "list" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}>
                  {layout === "list" && <motion.span layoutId="ideasLayoutPill" transition={pillSpring} className="absolute inset-0 rounded-[5px]" style={{ background: "#f3f2ee" }} />}
                  <span className="relative z-10 inline-flex items-center gap-1"><ListIcon size={11} /> List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards area */}
      <div ref={cardsScrollRef} className="relative z-0 flex-1 min-h-0 overflow-y-auto noscroll motion-panel">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-7 pt-4 pb-7">
          {loading ? (
          <div className="flex items-center justify-center h-32 motion-pop">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#d3501c", borderTopColor: "transparent" }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 text-center gap-2 motion-panel">
            <p className="text-sm text-rose-600">{error}</p>
            <p className="text-xs text-zinc-400">Is the backend running? <code className="bg-zinc-100 px-1 rounded">cd server && npm run dev</code></p>
            <button onClick={() => void load()} className="text-sm underline motion-press" style={{ color: "#d3501c" }}>Retry</button>
          </div>
        ) : !hasVisibleIdeas ? (
          <EmptyState
            onNew={() => setShowNew(true)}
            filtered={hasActiveFilters}
            onClearFilters={clearFilters}
            title={contentTab === "longform" ? "No long-form candidates" : undefined}
            description={contentTab === "longform"
              ? "Ideas marked for full-form video will live here, separate from the short-form pipeline."
              : undefined}
          />
        ) : (
          <>
            {/* Active group */}
            {active.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-3 mt-1">
                  <p className="text-[12px] font-semibold text-zinc-700">
                    {primarySectionLabel} <span className="num font-normal text-zinc-400 ml-1">(<CountUp value={activeAll.length} />)</span>
                  </p>
                  <div className="flex-1 h-px" style={{ background: "#ecebe5" }} />
                </div>
                {layout === "grid" ? (
                  <motion.div key={`active-grid-${contentTab}-p${page}`} variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5 mb-7">
                    {active.map(idea => (
                      <IdeaCard key={idea._id} idea={idea}
                                onClick={() => onOpenIdea(idea._id, idea.title)}
                                onDelete={handleDelete} onToggleVideo={handleToggleVideo} onToggleFullForm={handleToggleFullForm} onOpenCompletion={onOpenCompletion} onEditMeta={handleEditMeta} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key={`active-list-${contentTab}-p${page}`} variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-px mb-7" style={{ background: "#ecebe5", borderRadius: 10, overflow: "hidden", boxShadow: "inset 0 0 0 1px #ecebe5" }}>
                    {active.map(idea => (
                      <IdeaRow key={idea._id} idea={idea}
                               onClick={() => onOpenIdea(idea._id, idea.title)}
                               onDelete={handleDelete} onToggleVideo={handleToggleVideo} onToggleFullForm={handleToggleFullForm} onOpenCompletion={onOpenCompletion} onEditMeta={handleEditMeta} />
                    ))}
                  </motion.div>
                )}
              </>
            )}

            {/* Parked / shipped group */}
            {parked.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-[12px] font-semibold text-zinc-700">
                    {parkedSectionLabel} <span className="num font-normal text-zinc-400 ml-1">(<CountUp value={parked.length} />)</span>
                  </p>
                  <div className="flex-1 h-px" style={{ background: "#ecebe5" }} />
                </div>
                {layout === "grid" ? (
                  <motion.div key={`parked-grid-${contentTab}`} variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
                    {parked.map(idea => (
                      <IdeaCard key={idea._id} idea={idea}
                                onClick={() => onOpenIdea(idea._id, idea.title)}
                                onDelete={handleDelete} onToggleVideo={handleToggleVideo} onToggleFullForm={handleToggleFullForm} onOpenCompletion={onOpenCompletion} onEditMeta={handleEditMeta} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key={`parked-list-${contentTab}`} variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-px" style={{ background: "#ecebe5", borderRadius: 10, overflow: "hidden", boxShadow: "inset 0 0 0 1px #ecebe5" }}>
                    {parked.map(idea => (
                      <IdeaRow key={idea._id} idea={idea}
                               onClick={() => onOpenIdea(idea._id, idea.title)}
                               onDelete={handleDelete} onToggleVideo={handleToggleVideo} onToggleFullForm={handleToggleFullForm} onOpenCompletion={onOpenCompletion} onEditMeta={handleEditMeta} />
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </>
        )}

        {/* Bottom: pagination + summary */}
        {hasVisibleIdeas && (
          <div className="mt-6 pt-4 flex flex-col items-center gap-3"
               style={{ borderTop: "1px solid #ecebe5" }}>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="h-7 w-7 rounded-[6px] inline-flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors motion-press"
                  aria-label="Previous page"
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                  const isCurrent = p === page;
                  const isEdge = p === 1 || p === totalPages;
                  const isNear = Math.abs(p - page) <= 1;
                  if (!isEdge && !isNear) {
                    if (p === 2 && page > 3) return <span key={p} className="text-[11px] text-zinc-300 px-0.5">…</span>;
                    if (p === totalPages - 1 && page < totalPages - 2) return <span key={p} className="text-[11px] text-zinc-300 px-0.5">…</span>;
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-7 min-w-[28px] px-1.5 rounded-[6px] text-[12px] font-medium transition-colors motion-press ${
                        isCurrent
                          ? "bg-zinc-950 text-white shadow-sm"
                          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="h-7 w-7 rounded-[6px] inline-flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors motion-press"
                  aria-label="Next page"
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            )}

            {/* Summary */}
            <div className="flex items-center justify-between w-full text-[11.5px] text-zinc-400">
              <span>
                <CountUp value={activeAll.length} /> active · <CountUp value={parked.length} /> parked
                {totalPages > 1 && <span className="ml-2">· page {page} of {totalPages}</span>}
                {search.trim() && <span className="ml-2 font-medium text-zinc-600">· filtered by "{search}"</span>}
              </span>
              <button
                onClick={() => setShowNew(true)}
                className="inline-flex items-center gap-1 font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <PlusIcon size={10} /> Add idea
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      <FormatLanesGuideModal open={showLanesGuide} onClose={() => setShowLanesGuide(false)} />
      {showNew && <NewIdeaModal onClose={() => setShowNew(false)} onCreated={handleCreated} />}
    </div>
  );
}
