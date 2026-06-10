import { Check, ClipboardCopy, PackageOpen } from "lucide-react";
import { useState } from "react";

type PromptPreviewProps = {
  prompt: string;
  contextPack?: string;
  kbFileCount?: number;
};

export default function PromptPreview({ prompt, contextPack, kbFileCount }: PromptPreviewProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
  const [packStatus, setPackStatus] = useState<"idle" | "success" | "error">("idle");

  const doCopy = async (text: string, setStatus: typeof setCopyStatus) => {
    if (!text.trim()) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 2200);
  };

  const hasPrompt = Boolean(prompt.trim());

  return (
    <div className="flex flex-col h-full min-h-0 motion-panel">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-zinc-950 shrink-0">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
            Generated Prompt
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Copy into Claude, ChatGPT, or Gemini
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {contextPack && kbFileCount && kbFileCount > 0 && (
            <button
              type="button"
              onClick={() => doCopy(contextPack, setPackStatus)}
              disabled={!hasPrompt}
              title={`Copy the prompt with all ${kbFileCount} knowledge files included`}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed motion-press"
            >
              {packStatus === "success" ? <Check className="h-3.5 w-3.5 text-emerald-500 motion-pop" /> : <PackageOpen className="h-3.5 w-3.5" />}
              {packStatus === "success" ? "Copied!" : `+ ${kbFileCount} KB files`}
            </button>
          )}
          <button
            type="button"
            onClick={() => doCopy(prompt, setCopyStatus)}
            disabled={!hasPrompt}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 motion-press ${
              copyStatus === "success"
                ? "bg-emerald-600 text-white"
                : "bg-white text-zinc-950 hover:bg-zinc-200"
            }`}
          >
            {copyStatus === "success" ? (
              <Check className="h-3.5 w-3.5 motion-pop" />
            ) : (
              <ClipboardCopy className="h-3.5 w-3.5" />
            )}
            {copyStatus === "success" ? "Copied!" : "Copy Prompt"}
          </button>
        </div>
      </div>

      {/* Prompt textarea — fills remaining height */}
      <textarea
        value={hasPrompt ? prompt : "Fill in the required inputs above to generate this prompt."}
        readOnly
        className="flex-1 min-h-0 w-full resize-none bg-[#0a0a0a] p-4 font-mono text-[12.5px] leading-[1.65] text-zinc-200 outline-none placeholder:text-zinc-500 motion-soft"
      />

      {copyStatus === "error" && (
        <p className="shrink-0 px-4 py-2 text-xs text-rose-300 border-t border-white/10 motion-banner">
          Could not copy — select the text above and copy manually.
        </p>
      )}
    </div>
  );
}
