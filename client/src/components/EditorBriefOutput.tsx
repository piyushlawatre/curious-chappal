/**
 * EditorBriefOutput.tsx
 *
 * Final output screen when all 5 pipeline stages are complete.
 * Parses the Stage-5 markdown into navigable sections with a sidebar.
 * §1 Script gets dedicated Copy-Script + Edit-Script controls.
 * All other sections get a section-level Copy button.
 */

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useScrollTopOn } from "../lib/useScrollTopOn";
import { createEditor, Descendant, Editor as SlateEditor, Transforms } from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import type { RenderLeafProps, RenderElementProps } from "slate-react";
import { withHistory } from "slate-history";
import type { WorkflowSession } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import { formatDateTime } from "../utils/workflow";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp, pillSpring, springPop, tEase } from "../lib/motion";
import { AnchorScript, CleanScript, CueLegend, usedCues, countCues, stripCues } from "../utils/anchorCues";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type BriefSection = {
  num:        string;
  title:      string;
  heading:    string; // e.g. "## 1. Script (locked — do not change a word)"
  body:       string; // content after the heading line
  full:       string; // heading + "\n" + body
};

// ─────────────────────────────────────────────────────────────────────────────
// Parsers
// ─────────────────────────────────────────────────────────────────────────────

function unwrap(value: string): string {
  const t = value.trim();
  const fenced = t.match(/^`{3,}(?:markdown|md)?[ \t]*\n([\s\S]*?)\n`{3,}$/i);
  return (fenced?.[1] ?? t).trim();
}

function parseSections(markdown: string): BriefSection[] {
  const re = /^(## (\d+)\. (.+))$/gm;
  const positions: Array<{ index: number; num: string; title: string; heading: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    positions.push({ index: m.index, num: m[2], title: m[3].trim(), heading: m[1] });
  }
  if (positions.length === 0) return [];
  return positions.map((p, i) => {
    const start = p.index;
    const end   = i + 1 < positions.length ? positions[i + 1].index : markdown.length;
    const full  = markdown.slice(start, end).trimEnd();
    const body  = full.slice(p.heading.length).trim();
    return { num: p.num, title: p.title, heading: p.heading, body, full };
  });
}

const stripMarkdownValue = (value: string) =>
  value.trim().replace(/^["“”]+|["“”]+$/g, "").trim();

const readBoldField = (body: string, label: string) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body.match(new RegExp(`[-*]?\\s*\\*\\*${escaped}:\\*\\*\\s*([^\\n]+)`, "i"))?.[1]?.trim() ?? "";
};

const textToBlockquote = (text: string) =>
  text.split(/\r?\n/).map(line => `> ${line}`).join("\n");

const blockquoteToText = (text: string) =>
  text
    .split(/\r?\n/)
    .filter(line => line.trim().startsWith(">"))
    .map(line => line.replace(/^\s*>\s?/, "").trimEnd())
    .join("\n")
    .trim();

function findLockedScriptHeadingEnd(body: string): number {
  const start = body.search(/\*\*Locked spoken script/i);
  if (start < 0) return -1;

  const lineEnd = body.indexOf("\n", start);
  return lineEnd < 0 ? body.length : lineEnd + 1;
}

function findBlockquoteRange(body: string, fromIndex: number): { start: number; end: number } | null {
  const lines = body.slice(fromIndex).match(/[^\n]*(?:\n|$)/g) ?? [];
  let offset = fromIndex;
  let rangeStart = -1;
  let rangeEnd = -1;
  let started = false;

  for (const line of lines) {
    if (!line) break;

    const lineStart = offset;
    const lineEnd = offset + line.length;
    const content = line.replace(/\n$/, "");
    const isQuote = content.trim().startsWith(">");
    const isBlank = content.trim() === "";

    if (isQuote) {
      if (!started) rangeStart = lineStart;
      started = true;
      rangeEnd = lineEnd;
    } else if (started && isBlank) {
      rangeEnd = lineEnd;
    } else if (started) {
      break;
    }

    offset = lineEnd;
  }

  return rangeStart >= 0 ? { start: rangeStart, end: rangeEnd } : null;
}

/** Extract the raw spoken-script lines from inside the §1 body's code fence or blockquote. */
function extractSpokenScript(body: string): string {
  const fenced = body.match(/```(?:md|markdown)?[ \t]*\n([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();

  const headingEnd = findLockedScriptHeadingEnd(body);
  const range = findBlockquoteRange(body, headingEnd >= 0 ? headingEnd : 0);
  if (range) return blockquoteToText(body.slice(range.start, range.end));

  return "";
}

/** Replace the spoken script portion in §1 body, preserving all metadata. */
function replaceSpokenScript(body: string, newScript: string): string {
  // Case 1: fenced code block
  const fenceRe = /```(?:md|markdown)?[ \t]*\n([\s\S]*?)```/i;
  if (fenceRe.test(body)) {
    return body.replace(fenceRe, (_m, _inner) => `\`\`\`\n${newScript}\n\`\`\``);
  }

  // Case 2: blockquote block after "Locked spoken script" heading
  const headingEnd = findLockedScriptHeadingEnd(body);
  if (headingEnd >= 0) {
    const range = findBlockquoteRange(body, headingEnd);
    const newBlock = `${textToBlockquote(newScript)}\n`;
    if (range) {
      return `${body.slice(0, range.start)}${newBlock}${body.slice(range.end).replace(/^\n+/, "")}`;
    }

    return `${body.slice(0, headingEnd).trimEnd()}\n\n${newBlock}`;
  }

  // Fallback: replace any blockquote block
  const range = findBlockquoteRange(body, 0);
  if (range) {
    return `${body.slice(0, range.start)}${textToBlockquote(newScript)}\n${body.slice(range.end).replace(/^\n+/, "")}`;
  }

  return body;
}


/** Extract metadata from the §1 body. */
function extractScriptMeta(body: string): {
  energy: string; pace: string; warmth: string;
  strongTitle: string; hook: string; payoff: string;
  wordCount: number; duration: string;
} {
  const hostTone    = readBoldField(body, "Host tone");
  const energy      = hostTone.match(/Energy\s+([\d/]+)/i)?.[1]
                    ?? body.match(/Energy\s+([\d/]+)/i)?.[1] ?? "";
  // Extract Pace: everything between "Pace:" and "Warmth:" (or end), then clean up
  const paceRaw     = hostTone.match(/Pace:\s*([\s\S]*?)(?=\s*,?\s*Warmth:|$)/i)?.[1]?.trim()
                    ?? body.match(/Pace[:\s]+([^,\n]+)/i)?.[1]?.trim() ?? "";
  const pace        = paceRaw.replace(/^[),\s]+/, "").replace(/[,\s]+$/, "").trim();
  // Extract Warmth: everything after "Warmth:" label, then clean up
  const warmthRaw   = hostTone.match(/Warmth:\s*([\s\S]*?)(?:\s*$)/i)?.[1]?.trim()
                    ?? body.match(/Warmth[:\s]+([^\n,]+)/i)?.[1]?.trim() ?? "";
  const warmth      = warmthRaw.replace(/^[),\s]+/, "").replace(/[.,\s]+$/, "").trim();
  const strongTitle = readBoldField(body, "Strong video title")
                    || readBoldField(body, "Optimized video title")
                    || readBoldField(body, "Video title")
                    || readBoldField(body, "Title");
  const hookRaw     = body.match(/\*\*Hook stack:\*\*\s*([\s\S]*?)(?=\n- \*\*|\n\n\*\*|\*\*Payoff)/i)?.[1]?.trim() ?? "";
  const hook        = hookRaw.split("\n").map(l => l.replace(/^\/\s*/, "").trim()).filter(Boolean).join(" / ");
  const payoff      = stripMarkdownValue(readBoldField(body, "Payoff"));
  const spoken      = extractSpokenScript(body);
  const words       = spoken ? spoken.split(/\s+/).filter(Boolean).length : 0;
  const loSec       = Math.round(words / 2.4);
  const hiSec       = Math.round(words / 2.1);
  const duration    = words > 0 ? `~${loSec}–${hiSec}s` : "";
  return { energy, pace, warmth, strongTitle, hook, payoff, wordCount: words, duration };
}

/** Rebuild the full markdown replacing one section's body. */
function rebuildMarkdown(sections: BriefSection[], editedNum: string, newBody: string): string {
  return sections
    .map(s => s.num === editedNum ? `${s.heading}
${newBody}` : s.full)
    .join("\n\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon helpers  (inline SVG only — no external icon library)
// ─────────────────────────────────────────────────────────────────────────────

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

const IconScript    = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></>}/>;
const IconList      = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>}/>;
const IconPhoto     = (p: { s?: number }) => <Ico size={p.s??13} d={<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="M21 15l-5-5L5 20"/></>}/>;
const IconText      = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M4 7V4h16v3M9 20h6M12 4v16"/></>}/>;
const IconAudio     = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M9 18V5l12-2v13M9 9l12-2"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>}/>;
const IconPalette   = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M12 2a10 10 0 100 20c1.7 0 3-1.3 3-3 0-.8-.3-1.5-.8-2.1a1 1 0 01.8-1.9h2a4 4 0 000-8A10 10 0 0012 2z"/><circle cx="8" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1" fill="currentColor" stroke="none"/></>}/>;
const IconLayout    = (p: { s?: number }) => <Ico size={p.s??13} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>}/>;
const IconEye       = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}/>;
const IconLink      = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>}/>;
const IconCopy      = (p: { s?: number }) => <Ico size={p.s??13} d={<><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></>}/>;
const IconCheck     = (p: { s?: number; str?: number }) => <Ico size={p.s??13} stroke={p.str??2.2} d={<path d="M5 13l4 4L19 7"/>}/>;
const IconEdit      = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></>}/>;
const IconX         = (p: { s?: number }) => <Ico size={p.s??13} d={<path d="M18 6L6 18M6 6l12 12"/>}/>;
const IconDownload  = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></>}/>;
const IconArrowLeft = (p: { s?: number }) => <Ico size={p.s??13} d={<path d="M19 12H5M11 18l-6-6 6-6"/>}/>;
const IconWarning   = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></>}/>;
const IconExternalLink = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6M10 14L21 3"/></>}/>;
const IconShieldCheck  = (p: { s?: number }) => <Ico size={p.s??13} d={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>}/>;

// ─────────────────────────────────────────────────────────────────────────────
// Section metadata
// ─────────────────────────────────────────────────────────────────────────────

const SECTION_META: Record<string, { label: string; icon: React.ReactNode }> = {
  "1": { label: "Script",           icon: <IconScript /> },
  "2": { label: "Shot list",        icon: <IconList /> },
  "3": { label: "B-roll & prompts", icon: <IconPhoto /> },
  "4": { label: "On-screen text",   icon: <IconText /> },
  "5": { label: "Audio",            icon: <IconAudio /> },
  "6": { label: "Color & look",     icon: <IconPalette /> },
  "7": { label: "Thumbnails",       icon: <IconLayout /> },
  "8": { label: "Visual refs",      icon: <IconEye /> },
  "9": { label: "References",       icon: <IconLink /> },
};

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const show = (text: string) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setMsg(text);
    timer.current = window.setTimeout(() => setMsg(null), 2400);
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
          <IconCheck s={12} />
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────

function Sidebar({ sections, active, onSelect }: {
  sections: BriefSection[];
  active: string;
  onSelect: (num: string) => void;
}) {
  return (
    <aside className="w-[192px] shrink-0 flex flex-col overflow-hidden"
           style={{ background: "#fff", borderRight: "1px solid #ecebe5" }}>

      {/* Header */}
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: "1px solid #ecebe5" }}>
        <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-zinc-400">Brief sections</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto noscroll py-1.5" aria-label="Brief sections">
        {sections.map(sec => {
          const meta    = SECTION_META[sec.num];
          const isActive = sec.num === active;
          return (
            <button
              key={sec.num}
              type="button"
              onClick={() => onSelect(sec.num)}
              aria-current={isActive ? "page" : undefined}
              className={`relative w-full flex items-center gap-2.5 px-3.5 py-[8px] text-left text-[12.5px] font-medium transition-colors motion-press focus-visible:outline-none ${
                isActive
                  ? "text-zinc-950 font-semibold"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="briefNavPill"
                  transition={pillSpring}
                  className="absolute inset-0"
                  style={{
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
                    borderLeft: "2px solid #d3501c",
                  }}
                />
              )}
              {/* Icon */}
              <span className={`relative z-10 ${isActive ? "text-[#d3501c]" : "text-zinc-400"}`}>
                {meta?.icon ?? <IconScript />}
              </span>

              {/* Label */}
              <span className="relative z-10 truncate flex-1">
                {meta?.label ?? sec.title.split("(")[0].trim()}
              </span>

              {/* Section number */}
              <span className="relative z-10 font-mono text-[9.5px] shrink-0"
                    style={{ color: isActive ? "#d3501c" : "#a1a1aa" }}>
                §{sec.num}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tone strip (§1 only)
// ─────────────────────────────────────────────────────────────────────────────

function DeliveryTags({ energy, pace, warmth }: { energy: string; pace: string; warmth: string }) {
  const tags = [
    energy && { label: "Energy", value: energy },
    pace   && { label: "Pace",   value: pace },
    warmth && { label: "Warmth", value: warmth },
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 px-4 py-2.5 rounded-[8px]"
         style={{ background: "#faf9f7", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.06)" }}>
      {tags.map((t) => (
        <span key={t.label} className="inline-flex items-center gap-1.5 text-[12.5px]">
          <span className="font-semibold text-zinc-400">{t.label}:</span>
          <span className="text-zinc-700">{t.value}</span>
        </span>
      ))}
    </div>
  );
}

type ScriptBlock = {
  text: string;
  isHook: boolean;
};

function buildReadableScriptBlocks(spokenScript: string): ScriptBlock[] {
  if (!spokenScript.trim()) return [];

  const paragraphs = spokenScript
    .split(/\n\s*\n+/)
    .map(part => part.trim())
    .filter(Boolean);

  const rawBlocks = paragraphs.length > 1
    ? paragraphs
    : spokenScript
        .split(/\n+/)
        .map(part => part.trim())
        .filter(Boolean);

  const hookLines: string[] = [];
  const remaining: string[] = [];

  rawBlocks.forEach((block, index) => {
    const lineCount = block.split("\n").filter(Boolean).length;
    const shouldBeHook =
      hookLines.length < 4 &&
      index < 4 &&
      (lineCount <= 2 || block.length < 150);

    if (shouldBeHook) {
      hookLines.push(block);
    } else {
      remaining.push(block);
    }
  });

  const hookText = hookLines.join("\n");
  return [
    ...(hookText ? [{ text: hookText, isHook: true }] : []),
    ...remaining.map(text => ({ text, isHook: false })),
  ];
}

function ScriptReader({ blocks }: { blocks: ScriptBlock[] }) {
  return (
    <div className="mx-auto w-full max-w-[920px] py-2 sm:py-4">
      {blocks.map((block, index) => (
        <div
          key={index}
          className={block.isHook ? "mb-7 rounded-[10px] px-4 py-3" : "mb-5"}
          style={block.isHook ? { background: "rgba(255,255,255,0.035)", boxShadow: "inset 0 0 0 1px rgba(251,146,60,0.16), inset 4px 0 0 #d3501c" } : undefined}
        >
          {block.isHook && (
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "#fb923c" }}>
              Opening hook
            </p>
          )}
          <p className={`whitespace-pre-line text-zinc-100 tracking-[-0.01em] ${block.isHook ? "text-[clamp(19px,2vw,27px)] leading-[1.48]" : "text-[clamp(18px,2.15vw,30px)] leading-[1.58]"}`}>
            {block.text}
          </p>
        </div>
      ))}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Slate rich-text editor helpers
// ─────────────────────────────────────────────────────────────────────────────

type ScriptLeaf      = { text: string; bold?: boolean; italic?: boolean; underline?: boolean };
type ScriptParagraph = { type: "paragraph"; children: ScriptLeaf[] };

function parseBoldInline(line: string): ScriptLeaf[] {
  if (!line) return [{ text: "" }];
  const parts: ScriptLeaf[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) parts.push({ text: line.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith("**")) parts.push({ text: tok.slice(2, -2), bold: true });
    else                       parts.push({ text: tok.slice(1, -1), italic: true });
    last = m.index + tok.length;
  }
  if (last < line.length) parts.push({ text: line.slice(last) });
  return parts.length ? parts : [{ text: line }];
}

function textToSlateValue(text: string): ScriptParagraph[] {
  if (!text.trim()) return [{ type: "paragraph", children: [{ text: "" }] }];
  return text.split("\n").map(line => ({
    type: "paragraph" as const,
    children: parseBoldInline(line),
  }));
}

function slateValueToText(nodes: Descendant[]): string {
  return (nodes as ScriptParagraph[]).map(node =>
    node.children.map((c: ScriptLeaf) => {
      let t = c.text;
      if (c.bold)      t = `**${t}**`;
      if (c.italic)    t = `*${t}*`;
      return t;
    }).join("")
  ).join("\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isMarkActive(editor: any, format: string): boolean {
  const marks = SlateEditor.marks(editor) as Record<string, boolean> | null;
  return marks ? marks[format] === true : false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toggleMark(editor: any, format: string): void {
  if (isMarkActive(editor, format)) SlateEditor.removeMark(editor, format);
  else                               SlateEditor.addMark(editor, format, true);
}

function SlateLeaf({ attributes, children, leaf }: RenderLeafProps) {
  let el = <>{children}</>;
  if ((leaf as ScriptLeaf).bold)      el = <strong>{el}</strong>;
  if ((leaf as ScriptLeaf).italic)    el = <em>{el}</em>;
  if ((leaf as ScriptLeaf).underline) el = <u>{el}</u>;
  return <span {...attributes}>{el}</span>;
}

function SlateParaElement({ attributes, children }: RenderElementProps) {
  return <p {...attributes} style={{ marginBottom: "1.1em" }}>{children}</p>;
}

function SlateMarkButton({ format }: { format: string }) {
  const editor = useSlate();
  const active = isMarkActive(editor, format);
  const label  = format === "bold" ? "B" : format === "italic" ? "I" : "U";
  const hint   = format === "bold" ? "⌘B" : format === "italic" ? "⌘I" : "⌘U";
  return (
    <button
      type="button"
      title={hint}
      onMouseDown={e => { e.preventDefault(); toggleMark(editor, format); }}
      className="h-6 min-w-[24px] px-1.5 rounded-[4px] text-[12.5px] inline-flex items-center justify-center transition"
      style={{
        background: active ? "#18181b" : "transparent",
        color:      active ? "#fff"    : "#71717a",
        fontWeight: format === "bold" ? 700 : 500,
        fontStyle:  format === "italic" ? "italic" : "normal",
        textDecoration: format === "underline" ? "underline" : "none",
      }}
    >
      {label}
    </button>
  );
}

function ScriptSlateEditor({
  initialValue,
  editorRef,
  onWordCount,
}: {
  initialValue: ScriptParagraph[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorRef: React.MutableRefObject<any>;
  onWordCount?: (n: number) => void;
}) {
  const editor      = useMemo(() => withHistory(withReact(createEditor())), []);
  const renderLeaf  = useCallback((p: RenderLeafProps) => <SlateLeaf {...p} />, []);
  const renderElem  = useCallback((p: RenderElementProps) => <SlateParaElement {...p} />, []);

  // Expose the editor instance so the parent can read editor.children on save
  useEffect(() => { editorRef.current = editor; }, [editor, editorRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    switch (e.key.toLowerCase()) {
      case "b": e.preventDefault(); toggleMark(editor, "bold");      break;
      case "i": e.preventDefault(); toggleMark(editor, "italic");    break;
      case "u": e.preventDefault(); toggleMark(editor, "underline"); break;
    }
  };

  const handleChange = useCallback(() => {
    // editor.children is always the current content — use it for word count
    if (onWordCount) {
      const txt = slateValueToText(editor.children as Descendant[]);
      onWordCount(txt.trim() ? txt.trim().split(/\s+/).filter(Boolean).length : 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, onWordCount]);

  return (
    <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
      {/* Formatting toolbar */}
      <div className="flex items-center gap-0.5 px-5 py-2 border-b"
           style={{ borderColor: "#f0ede8", background: "#faf9f7" }}>
        <SlateMarkButton format="bold" />
        <SlateMarkButton format="italic" />
        <SlateMarkButton format="underline" />
        <div className="w-px h-3.5 mx-1.5" style={{ background: "#e4e2dc" }} />
        <span className="text-[10px] text-zinc-400 font-medium">Ctrl / ⌘ + B · I · U</span>
      </div>
      {/* Editable area */}
      <Editable
        renderLeaf={renderLeaf}
        renderElement={renderElem}
        onKeyDown={handleKeyDown}
        spellCheck
        autoFocus
        className="outline-none px-8 py-8 w-full"
        style={{
          fontFamily: '"Georgia", "Cambria", "Times New Roman", serif',
          fontSize: 18,
          lineHeight: 1.78,
          color: "#1a1a1a",
          letterSpacing: "-0.005em",
          minHeight: 360,
        }}
        placeholder="Start typing the script…"
      />
    </Slate>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Script section (§1) — special renderer
// ─────────────────────────────────────────────────────────────────────────────

function ScriptSection({ section, onSave, toast }: {
  section: BriefSection;
  onSave?: (newBody: string) => void;
  toast:  (msg: string) => void;
}) {
  const spokenScript = useMemo(() => extractSpokenScript(section.body), [section.body]);
  const meta         = useMemo(() => extractScriptMeta(section.body), [section.body]);

  const [editing,       setEditing]       = useState(false);
  const [editWordCount, setEditWordCount] = useState(0);
  const [copyScript,    setCopyScript]    = useState<"idle" | "ok">("idle");
  const cues      = useMemo(() => usedCues(spokenScript), [spokenScript]);
  const cueCount  = useMemo(() => countCues(spokenScript), [spokenScript]);
  const hasCues   = cues.length > 0;
  const [view, setView] = useState<"script" | "anchor">("script");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef      = useRef<any>(null);
  const initialSlateRef = useRef<ScriptParagraph[]>([]);

  // Derive the locked metadata block (everything before the blockquote script)
  const lockedMetaBlock = useMemo(() => {
    const idx = section.body.search(/\*\*Locked spoken script/i);
    if (idx >= 0) return section.body.slice(0, idx).trimEnd();
    const bqIdx = section.body.search(/^> /m);
    if (bqIdx >= 0) return section.body.slice(0, bqIdx).trimEnd();
    return "";
  }, [section.body]);

  const handleStartEdit = () => {
    initialSlateRef.current = textToSlateValue(spokenScript);
    setEditWordCount(spokenScript.trim() ? spokenScript.trim().split(/\s+/).filter(Boolean).length : 0);
    setEditing(true);
  };

  const handleCopyScript = async () => {
    const raw = spokenScript || section.body;
    // Strip delivery cues, then per-line whitespace, and merge into a single paragraph
    const clean = stripCues(raw)
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
      .join(" ");
    try {
      await navigator.clipboard.writeText(clean);
      setCopyScript("ok");
      toast("Script copied to clipboard");
      setTimeout(() => setCopyScript("idle"), 2200);
    } catch { toast("Script copied"); }
  };

  const handleSave = () => {
    // Read directly from the Slate editor instance — always current, no stale-state risk
    const children = (editorRef.current?.children ?? []) as Descendant[];
    const newText  = slateValueToText(children.length ? children : initialSlateRef.current);
    const newBody  = replaceSpokenScript(section.body, newText);
    onSave?.(newBody);
    setEditing(false);
    toast("Script saved");
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <div className="flex min-h-full flex-col overflow-hidden rounded-[12px] motion-panel"
         style={{ background: "#ffffff", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>

      {/* Header */}
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
           style={{ borderBottom: "1px solid #ecebe5", background: "#faf9f7" }}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-bold px-1.5 h-5 inline-flex items-center rounded-[4px]"
                  style={{ background: "#e8f7ef", color: "#0f5132", boxShadow: "inset 0 0 0 1px #bce8cf" }}>
              §1
            </span>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-zinc-950">
              Locked script
            </h2>
          </div>
          {meta.strongTitle && (
            <p className="mt-2 text-[20px] font-semibold leading-[1.25] tracking-tight text-zinc-950">
              {meta.strongTitle}
            </p>
          )}
          {(meta.wordCount > 0 || meta.duration || hasCues) && (
            <p className="mt-1.5 text-[11.5px] text-zinc-500 num">
              {[
                meta.wordCount > 0 ? `${meta.wordCount} words` : "",
                meta.duration || "",
                hasCues ? `${cueCount} cues` : "",
              ].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <button type="button" onClick={handleCopyScript} disabled={!spokenScript && !section.body}
                  className="h-7 px-3 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 transition motion-press disabled:opacity-40"
                  style={{ background: "#faf9f7", color: "#18181b", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.15)" }}>
            {copyScript === "ok" ? <IconCheck s={12} /> : <IconCopy s={12} />}
            {copyScript === "ok" ? "Copied" : "Copy script"}
          </button>
          {!editing ? (
            <button type="button" onClick={handleStartEdit}
                    className="h-7 px-3 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 transition motion-press"
                    style={{ background: "#faf9f7", color: "#18181b", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.15)" }}>
              <IconEdit s={12} /> Edit
            </button>
          ) : (
            <button type="button" onClick={handleCancel}
                    className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 transition motion-press"
                    style={{ background: "#ffffff", color: "#3f3f46", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.10)" }}>
              <IconX s={12} /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div>
        {/* ── Normal view ── */}
        {!editing && (
          <div className="motion-reveal px-6 py-6 sm:px-8 sm:py-7">
            {/* View switcher: Script (clean) vs Anchor (with delivery cues) */}
            {spokenScript && hasCues && (
              <div className="mb-6 flex justify-center">
                <div className="inline-flex items-center gap-1 p-1 rounded-[9px]"
                     style={{ background: "#f3f2ee", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.07)" }}>
                  {([
                    { id: "script", label: "Script", hint: "Clean spoken text" },
                    { id: "anchor", label: "Anchor", hint: "With delivery cues" },
                  ] as const).map((tab) => {
                    const active = view === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setView(tab.id)}
                        title={tab.hint}
                        className="relative h-7 px-3.5 rounded-[7px] text-[12.5px] font-medium transition-colors motion-press"
                        style={{ color: active ? "#0a0a0a" : "#71717a" }}
                      >
                        {active && (
                          <motion.span
                            layoutId="scriptViewPill"
                            transition={pillSpring}
                            className="absolute inset-0 rounded-[7px]"
                            style={{ background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(15,15,15,0.06)" }}
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(meta.energy || meta.pace || meta.warmth) && (
              <div className="mb-6 max-w-3xl mx-auto">
                <DeliveryTags energy={meta.energy} pace={meta.pace} warmth={meta.warmth} />
              </div>
            )}

            {spokenScript ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={hasCues ? view : "plain"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={tEase}
                  className="motion-stagger"
                >
                  {hasCues && view === "anchor" ? (
                    <div className="space-y-5">
                      <div className="max-w-3xl mx-auto">
                        <CueLegend cues={cues} />
                      </div>
                      <AnchorScript script={spokenScript} />
                    </div>
                  ) : (
                    <CleanScript script={spokenScript} />
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="mx-auto w-full max-w-3xl">
                <MarkdownRenderer content={section.body} />
              </div>
            )}
          </div>
        )}

        {/* ── Edit mode ── */}
        {editing && (
          <div className="motion-reveal">
            {/* Locked metadata — non-editable */}
            {lockedMetaBlock && (
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #ecebe5", background: "#faf9f7" }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Locked — title, metadata &amp; delivery notes</span>
                </div>
                <div className="opacity-45 pointer-events-none select-none">
                  <MarkdownRenderer content={lockedMetaBlock} className="md-compact" />
                </div>
              </div>
            )}

            {/* Spoken script — Slate rich-text editor */}
            <div className="px-0 py-0" style={{ background: "#fff" }}>
              <div className="px-5 pt-4 pb-2" style={{ borderBottom: "1px solid #f0ede8" }}>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">Spoken script — editable</span>
              </div>
              {editing && (
                <ScriptSlateEditor
                  initialValue={initialSlateRef.current}
                  editorRef={editorRef}
                  onWordCount={setEditWordCount}
                />
              )}
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: "1px solid #ecebe5", background: "#faf9f7" }}>
                <span className="text-[11px] text-zinc-400 num">
                  {editWordCount} words
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handleCancel}
                          className="h-7 px-3 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 transition motion-press"
                          style={{ background: "#fff", color: "#6b7280", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.10)" }}>
                    Cancel
                  </button>
                  <button type="button" onClick={handleSave}
                          className="h-7 px-3 rounded-[6px] text-[12px] font-semibold inline-flex items-center gap-1.5 transition motion-press text-white"
                          style={{ background: "#0a0a0a", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                    <IconCheck s={12} /> Save script
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic section renderer (§2–§9)
// ─────────────────────────────────────────────────────────────────────────────

function GenericSection({ section, nextSection, onSelect, toast }: {
  section: BriefSection;
  nextSection?: BriefSection | null;
  onSelect?: (num: string) => void;
  toast:  (msg: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const meta = SECTION_META[section.num];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(section.body);
      setCopied(true);
      toast("Section copied");
      setTimeout(() => setCopied(false), 2200);
    } catch { toast("Copied"); }
  };

  return (
    <div className="bg-white rounded-[12px] overflow-hidden motion-panel max-w-4xl mx-auto w-full"
         style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)", marginBottom: "2rem" }}>

      {/* Header */}
      <div className="group flex items-center gap-3 px-6 py-4"
           style={{ borderBottom: "1px solid #ecebe5", background: "#faf9f7" }}>

        <span className="text-zinc-400 font-mono text-[11px] font-bold tracking-widest shrink-0">
          §{section.num}
        </span>

        <span className="text-zinc-400 shrink-0">
          {meta?.icon ?? <IconScript />}
        </span>

        <h2 className="flex items-center gap-3 text-[16px] font-semibold text-zinc-950 tracking-[-0.01em] truncate">
          {section.title.split("(")[0].trim()}
          {section.title.includes("(") && (
            <span className="font-normal text-zinc-500 text-[13.5px] ml-0.5">
              ({section.title.split("(").slice(1).join("(").replace(/\)$/, "")})
            </span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium inline-flex items-center gap-1.5 transition opacity-0 group-hover:opacity-100 motion-press"
            style={{ background: "#f4f4f5", color: "#52525b" }}
          >
            {copied ? <IconCheck s={11} /> : <IconCopy s={11} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </h2>
        <div className="flex-1" />
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        {section.body ? (
          <MarkdownRenderer content={section.body} />
        ) : (
          <p className="text-[13px] text-zinc-400 italic">No content for this section.</p>
        )}
      </div>

      {/* Footer */}
      {nextSection && onSelect && (
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button
            type="button"
            onClick={() => onSelect(nextSection.num)}
            className="text-[12.5px] font-medium text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1.5 transition motion-press"
          >
            Next: {nextSection.title.split("(")[0].trim()} &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// References section (§9) — special: clickable links in a mini-table
// ─────────────────────────────────────────────────────────────────────────────

function extractRefLinks(body: string): string[] {
  const urlRe = /https?:\/\/[^\s)>\]"]+/g;
  return [...new Set(body.match(urlRe) ?? [])];
}

function ReferencesSection({ section, toast }: {
  section: BriefSection;
  toast:  (msg: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const links = useMemo(() => extractRefLinks(section.body), [section.body]);

  const handleCopyLinks = async () => {
    const text = links.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast("All reference links copied — paste into video description");
      setTimeout(() => setCopied(false), 2200);
    } catch { toast("Links copied"); }
  };

  return (
    <div className="bg-white rounded-[12px] overflow-hidden motion-panel"
         style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5"
           style={{ borderBottom: "1px solid #ecebe5", background: "#faf9f7" }}>
        <span className="font-mono text-[10px] font-bold px-1.5 h-5 inline-flex items-center rounded-[4px]"
              style={{ background: "#ecebe5", color: "#5a5a5a", boxShadow: "inset 0 0 0 1px #d8d5c8" }}>
          §9
        </span>
        <span className="text-zinc-400 shrink-0"><IconLink /></span>
        <h2 className="flex-1 text-[13.5px] font-semibold text-zinc-950 tracking-[-0.01em]">
          {section.title.split("(")[0].trim()}
        </h2>
        {links.length > 0 && (
          <button
            type="button"
            onClick={handleCopyLinks}
            className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 shrink-0 transition motion-press"
            style={{ background: "#fff", color: "#3f3f46", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.10)" }}
          >
            {copied ? <IconCheck s={12} /> : <IconCopy s={12} />}
            {copied ? "Copied" : "Copy all links"}
          </button>
        )}
      </div>

      {/* Table body */}
      <div className="px-5 py-5 space-y-4">
        {/* Markdown-rendered full content */}
        <MarkdownRenderer content={section.body} />

        {/* Quick-access link list */}
        {links.length > 0 && (
          <div className="mt-4 pt-4 space-y-1" style={{ borderTop: "1px solid #ecebe5" }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-2">
              Quick links — paste into video description
            </p>
            {links.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-[12px] transition hover:bg-zinc-50 group"
                style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.06)" }}
              >
                <span className="font-mono text-[10px] text-zinc-400 shrink-0 w-4">{i + 1}.</span>
                <span className="text-[#0c5db8] truncate flex-1">{link}</span>
                <span className="shrink-0 text-zinc-300 group-hover:text-zinc-500 transition">
                  <IconExternalLink s={11} />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export type EditorBriefOutputProps = {
  session:              WorkflowSession;
  onBackToWorkflow:     () => void;
  onUpdateBriefOutput?: (newOutput: string) => void;
};

export default function EditorBriefOutput({
  session,
  onBackToWorkflow,
  onUpdateBriefOutput,
}: EditorBriefOutputProps) {
  const { msg: toastMsg, show: showToast } = useToast();

  const finalStep  = session.steps.find(s => s.id === "04_EDITOR_BRIEF") ?? session.steps[session.steps.length - 1];
  const rawOutput  = unwrap(finalStep?.aiOutput ?? "");
  const sections   = useMemo(() => parseSections(rawOutput), [rawOutput]);

  const [activeNum, setActiveNum] = useState<string>(() => sections[0]?.num ?? "1");

  // Keep active section valid if sections change
  useEffect(() => {
    if (sections.length > 0 && !sections.find(s => s.num === activeNum)) {
      setActiveNum(sections[0].num);
    }
  }, [sections, activeNum]);

  const activeSection = sections.find(s => s.num === activeNum) ?? sections[0];
  // Jump the reading pane back to the top whenever the user switches brief sections.
  const briefScrollRef = useScrollTopOn<HTMLElement>(activeNum);
  const isScriptActive = activeSection?.num === "1";

  // ── Save edited section ────────────────────────────────────────────────────
  const handleSaveSection = (sectionNum: string, newBody: string) => {
    const newMarkdown = rebuildMarkdown(sections, sectionNum, newBody);
    onUpdateBriefOutput?.(newMarkdown);
  };

  // ── Fallback: no sections parsed (raw markdown fallback) ───────────────────
  if (sections.length === 0) {
    return (
      <div className="h-full overflow-y-auto noscroll motion-page" style={{ background: "#faf9f7" }}>
        <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <button type="button" onClick={onBackToWorkflow}
                    className="h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 text-zinc-700 hover:bg-zinc-100 transition motion-press"
                    style={{ background: "#fff", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
              <IconArrowLeft s={12} /> Edit workflow
            </button>
          </div>
          <div className="bg-white rounded-[12px] px-5 py-5" style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}>
            <MarkdownRenderer content={rawOutput} />
          </div>
        </div>
        <Toast msg={toastMsg} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#faf9f7" }}>

      {/* ── Top header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={tEase}
        className="shrink-0 flex items-center gap-4 px-6 py-5"
        style={{ background: "#fff", borderBottom: "1px solid #ecebe5" }}
      >

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-bold text-zinc-950 truncate tracking-tight">
            {session.title || "Editor Brief"}
          </h1>
          <p className="text-[12px] text-zinc-500 mt-1">
            Updated {formatDateTime(session.updatedAt)}
            {" · "}
            <CountUp value={sections.length} /> section{sections.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Back to workflow */}
        <button
          type="button"
          onClick={onBackToWorkflow}
          className="h-8 px-3 rounded-[6px] text-[12.5px] font-medium inline-flex items-center gap-1.5 transition text-zinc-700 hover:bg-zinc-100 shrink-0 motion-press"
          style={{ background: "#faf9f7", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.08)" }}
        >
          <IconArrowLeft s={12} /> <span className="hidden sm:inline">Edit workflow</span>
        </button>

      </motion.div>

      {/* ── Body: sidebar + content ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* Sidebar */}
        <Sidebar sections={sections} active={activeNum} onSelect={setActiveNum} />

        {/* Content area */}
        <main ref={briefScrollRef} className="flex-1 overflow-y-auto noscroll" style={{ background: "#faf9f7" }}>
          <AnimatePresence mode="wait">
          <motion.div
            key={activeNum}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={tEase}
            className={isScriptActive ? "min-h-full px-4 py-4" : "max-w-[880px] mx-auto px-4 sm:px-6 py-6"}
            style={isScriptActive ? { background: "#050505" } : undefined}
          >
            {(() => {
              const currentIndex = sections.findIndex(s => s.num === activeNum);
              const nextSection = currentIndex !== -1 && currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;

              if (activeSection?.num === "1") {
                return (
                  <ScriptSection
                    section={activeSection}
                    onSave={newBody => handleSaveSection("1", newBody)}
                    toast={showToast}
                  />
                );
              }
              if (activeSection?.num === "9") {
                return (
                  <ReferencesSection
                    section={activeSection}
                    toast={showToast}
                  />
                );
              }
              if (activeSection) {
                return (
                  <GenericSection
                    section={activeSection}
                    nextSection={nextSection}
                    onSelect={setActiveNum}
                    toast={showToast}
                  />
                );
              }
              return <p className="text-[13px] text-zinc-400">Select a section from the sidebar.</p>;
            })()}
          </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast */}
      <Toast msg={toastMsg} />
    </div>
  );
}
