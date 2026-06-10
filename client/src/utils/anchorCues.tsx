/**
 * anchorCues.tsx — Anchor-cue parsing pipeline.
 *
 * A single, reusable module that turns a locked spoken script containing
 * delivery cues (e.g. [direct], [beat], [pause], [stress]) into two views:
 *
 *   • Script view  — the clean spoken text with every cue removed.
 *   • Anchor view  — the same text with cues rendered as colour-coded chips,
 *                    plus a legend of only the cues that actually appear.
 *
 * This works for ANY future script: unknown cues degrade gracefully into a
 * neutral chip, and a script with no cues simply renders as plain text.
 */

import type React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Cue dictionary
// ─────────────────────────────────────────────────────────────────────────────

export type CueKind = "frame" | "pause" | "emphasis";

export type CueDef = {
  /** normalized lookup key, e.g. "drop voice" */
  key: string;
  /** display label, e.g. "Drop voice" */
  label: string;
  /** plain-language meaning for the legend / tooltip */
  meaning: string;
  kind: CueKind;
  /** chip text colour */
  text: string;
  /** chip background */
  bg: string;
  /** chip ring / border colour */
  ring: string;
  /** accent dot colour */
  dot: string;
};

/**
 * The canonical cue legend. Order here defines the order cues appear in the
 * Anchor legend bar. Add new cues here and the whole pipeline picks them up.
 */
export const CUE_LIST: CueDef[] = [
  {
    key: "direct", label: "Direct", meaning: "Look straight into camera", kind: "frame",
    text: "#0f766e", bg: "#e4f6f2", ring: "rgba(20,184,166,0.28)", dot: "#14b8a6",
  },
  {
    key: "no smile", label: "No smile", meaning: "Serious delivery", kind: "frame",
    text: "#334155", bg: "#eef1f5", ring: "rgba(100,116,139,0.28)", dot: "#64748b",
  },
  {
    key: "stress", label: "Stress", meaning: "Emphasise this word or phrase", kind: "emphasis",
    text: "#be123c", bg: "#fde9ec", ring: "rgba(244,63,94,0.28)", dot: "#f43f5e",
  },
  {
    key: "slow", label: "Slow", meaning: "Slow down", kind: "emphasis",
    text: "#1d4ed8", bg: "#e8effe", ring: "rgba(59,130,246,0.28)", dot: "#3b82f6",
  },
  {
    key: "drop voice", label: "Drop voice", meaning: "Lower, firmer closer tone", kind: "emphasis",
    text: "#6d28d9", bg: "#efe9fd", ring: "rgba(139,92,246,0.28)", dot: "#8b5cf6",
  },
  {
    key: "beat", label: "Beat", meaning: "Small pause", kind: "pause",
    text: "#b45309", bg: "#fdf3e2", ring: "rgba(245,158,11,0.30)", dot: "#f59e0b",
  },
  {
    key: "pause", label: "Pause", meaning: "Longer pause", kind: "pause",
    text: "#c2410c", bg: "#fdecde", ring: "rgba(249,115,22,0.30)", dot: "#f97316",
  },
];

const CUE_BY_KEY: Record<string, CueDef> = Object.fromEntries(
  CUE_LIST.map((c) => [c.key, c]),
);

/** Neutral fallback for any bracketed cue we don't recognise. */
export function fallbackCue(label: string): CueDef {
  return {
    key: label.toLowerCase(),
    label: label.replace(/\b\w/g, (m) => m.toUpperCase()),
    meaning: "Delivery cue",
    kind: "frame",
    text: "#52525b", bg: "#f4f4f5", ring: "rgba(161,161,170,0.35)", dot: "#a1a1aa",
  };
}

/** Normalize a raw cue body: lowercase, trim, collapse spaces, strip hyphens. */
export function normalizeCue(raw: string): string {
  return raw.toLowerCase().trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}

/** Look up a cue definition, falling back to a neutral chip for unknowns. */
export function lookupCue(raw: string): CueDef {
  const norm = normalizeCue(raw);
  return CUE_BY_KEY[norm] ?? fallbackCue(norm);
}

// A bracketed cue is a short token like [direct] or [drop voice] — letters,
// spaces and simple punctuation only, kept on a single line.
const CUE_RE = /\[([a-zA-Z][a-zA-Z \-_/]{0,28})\]/g;

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline: strip + tokenize + collect
// ─────────────────────────────────────────────────────────────────────────────

/** Remove every cue, leaving clean spoken text with tidy spacing. */
export function stripCues(text: string): string {
  return text
    .replace(CUE_RE, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").replace(/[ \t]+([.,!?;:])/g, "$1").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type ScriptToken =
  | { type: "text"; value: string }
  | { type: "cue"; def: CueDef; raw: string };

/** Split a script into an ordered stream of text and cue tokens. */
export function tokenize(text: string): ScriptToken[] {
  const tokens: ScriptToken[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  CUE_RE.lastIndex = 0;
  while ((m = CUE_RE.exec(text)) !== null) {
    if (m.index > last) tokens.push({ type: "text", value: text.slice(last, m.index) });
    tokens.push({ type: "cue", def: lookupCue(m[1]), raw: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ type: "text", value: text.slice(last) });
  return tokens;
}

/** The distinct cues used in a script, ordered by the canonical legend. */
export function usedCues(text: string): CueDef[] {
  const seen = new Set<string>();
  CUE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CUE_RE.exec(text)) !== null) seen.add(lookupCue(m[1]).key);
  const known = CUE_LIST.filter((c) => seen.has(c.key));
  // Preserve any unknown cues at the end, in first-seen order.
  const knownKeys = new Set(CUE_LIST.map((c) => c.key));
  const unknown: CueDef[] = [];
  CUE_RE.lastIndex = 0;
  while ((m = CUE_RE.exec(text)) !== null) {
    const def = lookupCue(m[1]);
    if (!knownKeys.has(def.key) && !unknown.find((u) => u.key === def.key)) unknown.push(def);
  }
  return [...known, ...unknown];
}

/** Count of cues in a script (used for the header meta line). */
export function countCues(text: string): number {
  CUE_RE.lastIndex = 0;
  let n = 0;
  while (CUE_RE.exec(text) !== null) n++;
  return n;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline bold rendering (shared by both views)
// ─────────────────────────────────────────────────────────────────────────────

/** Render **bold** segments inside a plain text run. */
export function renderInlineBold(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-b${i}`} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={`${keyPrefix}-t${i}`}>{part}</span>
    ),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Presentational components
// ─────────────────────────────────────────────────────────────────────────────

/** A single colour-coded cue chip. */
export function CuePill({ def, withMeaning = false }: { def: CueDef; withMeaning?: boolean }) {
  return (
    <span
      title={`${def.label} — ${def.meaning}`}
      className="inline-flex items-center gap-1.5 align-middle rounded-full font-semibold whitespace-nowrap select-none"
      style={{
        background: def.bg,
        color: def.text,
        boxShadow: `inset 0 0 0 1px ${def.ring}`,
        fontSize: "11px",
        lineHeight: 1,
        padding: "3px 8px 3px 7px",
        margin: "0 2px",
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{ width: 6, height: 6, background: def.dot }}
      />
      {def.label}
      {withMeaning && (
        <span style={{ fontWeight: 500, opacity: 0.72 }}>· {def.meaning}</span>
      )}
    </span>
  );
}

/** Legend bar showing only the cues that appear in the current script. */
export function CueLegend({ cues }: { cues: CueDef[] }) {
  if (cues.length === 0) return null;
  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-[10px] px-3.5 py-3"
      style={{ background: "#faf9f7", boxShadow: "inset 0 0 0 1px rgba(15,15,15,0.06)" }}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 mr-1">
        Cue legend
      </span>
      {cues.map((def) => (
        <CuePill key={def.key} def={def} withMeaning />
      ))}
    </div>
  );
}

/**
 * Anchor view of a spoken script: inline cue chips embedded in the text,
 * paragraph by paragraph, with **bold** preserved.
 */
export function AnchorScript({ script }: { script: string }) {
  const paragraphs = script.split(/\n\s*\n+/).filter((p) => p.trim());
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      {paragraphs.map((para, pi) => {
        const tokens = tokenize(para);
        return (
          <p
            key={pi}
            className="text-[17px] leading-[1.85] text-zinc-900 tracking-normal"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {tokens.map((tok, ti) =>
              tok.type === "cue" ? (
                <CuePill key={`c${pi}-${ti}`} def={tok.def} />
              ) : (
                <span key={`t${pi}-${ti}`}>{renderInlineBold(tok.value, `p${pi}-${ti}`)}</span>
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

/** Clean Script view: cues removed, **bold** preserved, paragraph spacing. */
export function CleanScript({ script }: { script: string }) {
  const clean = stripCues(script);
  const paragraphs = clean.split(/\n\s*\n+/).filter((p) => p.trim());
  return (
    <div className="mx-auto w-full max-w-3xl text-[17px] leading-[1.65] text-zinc-900 tracking-normal space-y-6">
      {paragraphs.map((para, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {renderInlineBold(para, `clean${i}`)}
        </p>
      ))}
    </div>
  );
}
