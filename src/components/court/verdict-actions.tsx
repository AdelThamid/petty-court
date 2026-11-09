"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Printer, RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const secondary =
  "h-11 gap-2 border-gold/35 bg-transparent px-4 text-cream hover:border-gold hover:bg-gold/10 dark:bg-transparent";
const primary = "h-11 gap-2 bg-burgundy px-5 font-semibold text-cream hover:bg-burgundy-hover";

/** Clipboard API first; falls back to a hidden textarea when it is unavailable or blocked. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export function VerdictActions({
  getText,
  onReset,
  resetIsPrimary,
}: {
  /** Builds the plain-text verdict at click time, so it is always the latest. */
  getText: () => string;
  onReset: () => void;
  /** True once nothing else is left to do on this case. */
  resetIsPrimary: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    const ok = await copyText(getText());
    setStatus(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), ok ? 2500 : 6000);
  }

  return (
    <div className="no-print mx-auto flex w-full max-w-3xl flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Button variant="outline" onClick={copy} className={secondary}>
            {status === "copied" ? (
              <Check className="size-4 text-gold" aria-hidden />
            ) : (
              <Copy className="size-4 text-gold" aria-hidden />
            )}
            {status === "copied" ? "Copied" : "Copy verdict"}
          </Button>
          <Button variant="outline" onClick={() => window.print()} className={secondary}>
            <Printer className="size-4 text-gold" aria-hidden /> Print / Save PDF
          </Button>
        </div>
        <Button
          variant={resetIsPrimary ? "default" : "outline"}
          onClick={onReset}
          className={resetIsPrimary ? primary : secondary}
        >
          <RotateCcw className={cn("size-4", !resetIsPrimary && "text-gold")} aria-hidden /> Try another case
        </Button>
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {status === "copied" && <span className="text-cream/80">Verdict copied to your clipboard.</span>}
        {status === "failed" && (
          <span className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            Couldn’t copy automatically. Try “Print / Save PDF”, or select the verdict text and copy it.
          </span>
        )}
      </p>
    </div>
  );
}
