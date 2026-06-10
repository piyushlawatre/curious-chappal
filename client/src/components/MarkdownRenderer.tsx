/**
 * MarkdownRenderer.tsx — inline MD renderer (no deps)
 * Handles: h1–h3, bold, italic, inline-code, bullet lists,
 *          numbered lists, fenced code blocks, blockquotes, <hr>
 */

type Props = { content: string; className?: string };

// ── Inline formatting ─────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  // Links, bold + italic, bold, italic, inline code, and HEX colors.
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|#[A-Fa-f0-9]{6}\b)/g);
  return parts.map((p, i) => {
    if (p.match(/^#[A-Fa-f0-9]{6}$/)) {
      return (
        <span key={i} className="inline-flex items-center gap-1.5 font-mono text-[12.5px] bg-zinc-100 px-1.5 py-0.5 rounded-[4px] border border-zinc-200">
          <span className="w-2.5 h-2.5 rounded-[2px] shadow-sm border border-black/10" style={{ backgroundColor: p }} />
          {p}
        </span>
      );
    }
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = /^(https?:|mailto:)/i.test(link[2]) ? link[2] : undefined;
      return <a key={i} href={href} target="_blank" rel="noreferrer" className="md-link">{link[1]}</a>;
    }
    if (p.startsWith("***") && p.endsWith("***"))
      return <strong key={i}><em>{p.slice(3,-3)}</em></strong>;
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i}>{p.slice(2,-2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2)
      return <em key={i}>{p.slice(1,-1)}</em>;
    if (p.startsWith("`") && p.endsWith("`"))
      return <code key={i} className="inline-code">{p.slice(1,-1)}</code>;
    return <span key={i}>{p}</span>;
  });
}

// ── Block parser ──────────────────────────────────────────────────────────────

const isTableSeparator = (line: string) =>
  /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);

const splitTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(cell => cell.trim());

export default function MarkdownRenderer({ content, className = "" }: Props) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Fenced code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <pre key={i} className="md-pre">
          {lang && <div className="md-lang">{lang}</div>}
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++;
      continue;
    }

    // ── HR
    if (/^-{3,}$|^\*{3,}$|^_{3,}$/.test(line.trim())) {
      nodes.push(<hr key={i} className="md-hr" />);
      i++;
      continue;
    }

    // ── Table
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = splitTableRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      
      const isAudio = headers.some(h => h.toLowerCase() === "sound" || h.toLowerCase() === "sfx");
      const isShotList = headers.some(h => h.toLowerCase() === "visual treatment");
      
      if (isAudio && headers.some(h => h.toLowerCase() === "time")) {
        // Audio Timeline Rendering
        nodes.push(
          <div key={i} className="my-6 border-l-2 border-zinc-200 ml-2 pl-6 relative space-y-6">
            {rows.map((row, ri) => {
              const timeIndex = headers.findIndex(h => h.toLowerCase() === "time");
              const soundIndex = headers.findIndex(h => h.toLowerCase() === "sound" || h.toLowerCase() === "sfx");
              const time = timeIndex >= 0 ? row[timeIndex] : "";
              const sound = soundIndex >= 0 ? row[soundIndex] : "";
              const extra = headers
                .map((_, idx) => idx)
                .filter(idx => idx !== timeIndex && idx !== soundIndex)
                .map(idx => row[idx])
                .join(" · ");
              
              return (
                <div key={ri} className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-[11px] h-[11px] rounded-full bg-white border-2 border-zinc-400 z-10" />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-zinc-500 bg-zinc-100 px-1.5 rounded">{time || "0:00"}</span>
                      {sound && <span className="font-semibold text-[13.5px] text-zinc-900">{renderInline(sound)}</span>}
                    </div>
                    {extra && <div className="text-[12px] text-zinc-500 mt-1">{renderInline(extra)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      } else {
        nodes.push(
          <div key={i} className="md-table-wrap mb-6" style={{ overflowX: "auto" }}>
            <table className="md-table" style={{ minWidth: "800px", whiteSpace: "normal" }}>
              <thead>
                <tr>{headers.map((h, hi) => <th key={hi} className="bg-zinc-50">{renderInline(h)}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="motion-table-row hover:bg-zinc-50/50">
                    {headers.map((_, ci) => {
                      const isPrimary = isShotList && ci < 3;
                      return (
                        <td key={ci} className={isPrimary ? "font-medium text-zinc-900" : "text-zinc-600"}>
                          {renderInline(row[ci] ?? "")}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // ── Headings
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);
    if (h1) { nodes.push(<h1 key={i} className="md-h1">{renderInline(h1[1])}</h1>); i++; continue; }
    if (h2) { nodes.push(<h2 key={i} className="md-h2">{renderInline(h2[1])}</h2>); i++; continue; }
    if (h3) { 
      nodes.push(<h3 key={i} className="md-h3">{renderInline(h3[1])}</h3>); 
      if (h3[1].toLowerCase().includes("concept")) {
        nodes.push(
          <div key={`thumb-${i}`} className="w-full aspect-video bg-zinc-50 border border-zinc-200 border-dashed rounded-lg mt-3 mb-6 flex flex-col items-center justify-center text-zinc-400">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span className="text-[12px] font-medium mt-2">Preview not generated</span>
          </div>
        );
      }
      i++; 
      continue; 
    }

    // ── Blockquote (Notes / Cautions)
    if (line.startsWith(">")) {
      const qLines: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        qLines.push(lines[i].slice(1).trimStart());
        i++;
      }
      nodes.push(
        <blockquote key={i} className="my-5 pl-4 py-3 border-l-[3px] border-amber-500 bg-amber-50/50 rounded-r-md text-[13px] text-amber-900 leading-relaxed">
          {qLines.map((l, qi) => <p key={qi} className="mb-1 last:mb-0">{renderInline(l)}</p>)}
        </blockquote>
      );
      continue;
    }

    // ── Bullet list
    if (/^[-*+]\s/.test(line)) {
      const items: Array<{ text: string; checked?: boolean }> = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        const raw = lines[i].replace(/^[-*+]\s/, "");
        const checkbox = raw.match(/^\[([ xX])\]\s+(.*)$/);
        items.push(checkbox ? { checked: checkbox[1].toLowerCase() === "x", text: checkbox[2] } : { text: raw });
        i++;
      }
      nodes.push(
        <ul key={i} className="md-ul">
          {items.map((it, ii) => (
            <li key={ii} className={it.checked !== undefined ? "md-task" : undefined}>
              {it.checked !== undefined && <input type="checkbox" checked={it.checked} readOnly aria-label={it.checked ? "checked" : "unchecked"} />}
              <span>{renderInline(it.text)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      nodes.push(
        <ol key={i} className="md-ol">
          {items.map((it, ii) => <li key={ii}>{renderInline(it)}</li>)}
        </ol>
      );
      continue;
    }

    // ── Empty line (paragraph break)
    if (line.trim() === "") { i++; continue; }

    // ── Paragraph — collect consecutive non-special lines
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,3}\s/.test(lines[i]) &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !lines[i].startsWith(">") &&
      !lines[i].trimStart().startsWith("```") &&
      !/^-{3,}$|^\*{3,}$|^_{3,}$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i]);
      i++;
    }
    if (pLines.length) {
      nodes.push(
        <p key={i} className="md-p">
          {pLines.map((pl, pi) => (
            <span key={pi}>{renderInline(pl)}{pi < pLines.length - 1 ? " " : ""}</span>
          ))}
        </p>
      );
    }
  }

  return <div className={`md-body motion-panel ${className}`}>{nodes}</div>;
}
