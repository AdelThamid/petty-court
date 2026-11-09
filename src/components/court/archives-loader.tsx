"use client";

import { useEffect, useRef, useState } from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Chaos card: a deliberately pointless 10-second fake loading screen.
 * Opt-in only (footer link), cancellable, and unconnected to the trial flow.
 */
const DURATION_MS = 10_000;
const TICK_MS = 100;

const STEPS = [
  "Dusting off precedent…",
  "Locating the court stapler…",
  "Asking the bailiff where he put the files…",
  "Cross-referencing grievances by pettiness…",
  "Consulting a pigeon of counsel…",
  "Alphabetizing sighs…",
  "Almost there. Emotionally.",
];

export function ArchivesLoader() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const done = elapsed >= DURATION_MS;

  useEffect(() => {
    if (!open || done) return;
    const t = setInterval(() => setElapsed((e) => Math.min(DURATION_MS, e + TICK_MS)), TICK_MS);
    return () => clearInterval(t);
  }, [open, done]);

  const pct = Math.round((elapsed / DURATION_MS) * 100);
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((elapsed / DURATION_MS) * STEPS.length))];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setElapsed(0);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-sm underline-offset-4 hover:text-cream hover:underline"
      >
        <Archive className="size-3.5" aria-hidden /> Consult the court archives
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent finalFocus={triggerRef} className="gap-0 border border-border bg-ink-2 p-0 text-cream ring-0 sm:max-w-md">
          <DialogHeader className="gap-2 px-6 pt-6">
            <p className="label-proc text-gold">Court archives</p>
            <DialogTitle className="text-xl font-semibold text-cream">
              {done ? "The archives have loaded." : "Retrieving historical precedent"}
            </DialogTitle>
            <DialogDescription className="text-cream/70">
              {done
                ? "They are empty. No prior case has ever been this petty. Yours is the precedent now."
                : "This is purely ceremonial and affects nothing. You can cancel at any time."}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6">
            <div
              role="progressbar"
              aria-label="Archive retrieval"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              className="h-2 overflow-hidden rounded-full bg-cream/10"
            >
              <div className="h-full rounded-full bg-gold transition-[width] duration-100" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-3 flex justify-between text-sm text-cream/70" aria-live="polite">
              <span>{done ? "Done. Somehow." : step}</span>
              <span className="tabular-nums">{pct}%</span>
            </p>
          </div>

          <DialogFooter className="mx-0 mb-0 rounded-b-xl border-border bg-ink/40 px-6 py-4">
            <Button
              onClick={() => setOpen(false)}
              variant={done ? "default" : "ghost"}
              className={
                done
                  ? "h-11 bg-burgundy px-5 font-semibold text-cream hover:bg-burgundy-hover"
                  : "h-11 px-4 text-cream/80 hover:bg-cream/5 hover:text-cream"
              }
            >
              {done ? "Close the archives" : "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
