/** Minimal structural shape — works for both ApiStep (api/ideas.ts) and WorkflowStep (types.ts). */
type StepLike = { id: string; aiOutput?: string };

/**
 * Robust spoken-script extraction with a fallback chain across pipeline steps.
 *
 * Why this exists: the original exporter looked ONLY at the 04_EDITOR_BRIEF
 * output, tried a fenced block then a "Locked spoken script" blockquote, and
 * silently returned "" when neither matched — 5 of 26 exported lanes shipped
 * with script_len:0 even though the model had produced a full script upstream.
 *
 * Chain (first non-empty wins):
 *   1. Editor Brief (04) §1 — inner fence, blockquote, or plain-text fallback
 *   2. Final script (03)    — "## 8. Final Spoken Script" section
 *   3. Draft script (02)    — "## 8. Final Spoken Script" section
 */

/** Unwrap a whole-document ```md fence (stage outputs are returned as one fenced block). */
export function unwrapFence(value: string): string {
  const t = (value ?? "").trim();
  const fenced = t.match(/^`{3,}(?:markdown|md)?[ \t]*\n([\s\S]*?)\n`{3,}\s*$/i);
  return (fenced?.[1] ?? t).trim();
}

/** Slice out one "## N. Title" section's body (heading line excluded). */
function sectionBody(markdown: string, headingPattern: RegExp): string {
  const m = headingPattern.exec(markdown);
  if (!m) return "";
  const start = markdown.indexOf("\n", m.index);
  if (start < 0) return "";
  const rest = markdown.slice(start + 1);
  const next = rest.search(/^##\s/m);
  return (next >= 0 ? rest.slice(0, next) : rest).trim();
}

/** Strip metadata lines that trail or annotate the spoken script body. */
function stripScriptMetadata(text: string): string {
  return text
    .split("\n")
    .filter(line => {
      const t = line.trim();
      if (/^\*\*Word count:/i.test(t)) return false;
      if (/^\*\*Estimated spoken length:/i.test(t)) return false;
      if (/^\*\*Delivery cues/i.test(t)) return false;
      if (/^---+$/.test(t)) return false;
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const blockquoteToText = (text: string) =>
  text
    .split(/\r?\n/)
    .filter(line => line.trim().startsWith(">"))
    .map(line => line.replace(/^\s*>\s?/, "").trimEnd())
    .join("\n")
    .trim();

/** Extract the locked spoken script from an Editor Brief (04) output. */
export function extractEditorBriefScript(aiOutput: string): string {
  if (!aiOutput?.trim()) return "";
  const doc = unwrapFence(aiOutput);

  // Scope to "## 1. Script" when the section exists; otherwise search the whole doc.
  const scope = sectionBody(doc, /^##\s*1\.\s*Script\b.*$/im) || doc;

  // (a) Inner fenced block within scope.
  const fenced = scope.match(/```(?:md|markdown)?[ \t]*\n([\s\S]*?)```/i);
  if (fenced?.[1]?.trim()) return stripScriptMetadata(fenced[1]);

  // (b) Blockquote after the "Locked spoken script" heading (or first blockquote in scope).
  const headingIdx = scope.search(/\*\*Locked spoken script/i);
  const from = headingIdx >= 0 ? scope.indexOf("\n", headingIdx) + 1 : 0;
  const bq: string[] = [];
  let inBlock = false;
  for (const line of scope.slice(from).split("\n")) {
    const isQuote = /^\s*>/.test(line);
    if (isQuote) { inBlock = true; bq.push(line); }
    else if (inBlock && line.trim() === "") { bq.push(line); }
    else if (inBlock) break;
  }
  const quoted = blockquoteToText(bq.join("\n"));
  if (quoted) return stripScriptMetadata(quoted);

  // (c) Plain-text fallback: lines after the "Locked spoken script" heading until
  //     the next bold field, heading, or table — covers briefs where the model
  //     pasted the script without a fence or blockquote.
  if (headingIdx >= 0) {
    const plain: string[] = [];
    for (const line of scope.slice(from).split("\n")) {
      const t = line.trim();
      if (/^(\*\*|##|\||---)/.test(t)) { if (plain.length) break; else continue; }
      plain.push(line);
    }
    const text = stripScriptMetadata(plain.join("\n"));
    if (text.split(/\s+/).filter(Boolean).length >= 50) return text;
  }

  return "";
}

/** Extract "## 8. Final Spoken Script" from a Stage 3 final or Stage 2 draft output. */
export function extractFinalSpokenScript(aiOutput: string): string {
  if (!aiOutput?.trim()) return "";
  const doc = unwrapFence(aiOutput);
  const body = sectionBody(doc, /^##\s*8\.\s*Final Spoken Script\b.*$/im);
  if (!body) return "";
  return stripScriptMetadata(body);
}

export type ExtractedScript = { script: string; source: "editor_brief" | "final_script" | "draft_script" | "none" };

/** Best-available script across pipeline steps (04 → 03 → 02). */
export function extractBestScript(steps: StepLike[]): ExtractedScript {
  const out = (id: string) => steps.find(s => s.id === id)?.aiOutput ?? "";

  const brief = extractEditorBriefScript(out("04_EDITOR_BRIEF"));
  if (brief) return { script: brief, source: "editor_brief" };

  const finalScript = extractFinalSpokenScript(out("03_AUDIT_AND_FINALIZE"));
  if (finalScript) return { script: finalScript, source: "final_script" };

  const draft = extractFinalSpokenScript(out("02_SCRIPT_CREATION"));
  if (draft) return { script: draft, source: "draft_script" };

  return { script: "", source: "none" };
}
