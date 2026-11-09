"use client";

import { useId, useState } from "react";
import { Hand, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { LIMITS } from "@/lib/types";

export function ObjectionDialog({
  presetObjection,
  used,
  pending,
  onSubmit,
}: {
  /** The saved demo's preset objection, when this sample case has one. */
  presetObjection: string | null;
  /** One successful objection per case. */
  used: boolean;
  pending: boolean;
  /** Resolves true when the appeal succeeded. */
  onSubmit: (text: string) => Promise<boolean>;
}) {
  const ids = useId();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(presetObjection ?? "");
  const canSubmit = Boolean(text.trim()) && !pending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (await onSubmit(text.trim())) setOpen(false);
  }

  return (
    <section aria-labelledby={`${ids}-h`} className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 id={`${ids}-h`} className="label-proc text-gold">
          Disagree with the court?
        </h2>
        <p className="mt-1 text-sm text-cream/70">
          {used
            ? "Objection heard. The court’s patience has been fully spent on this case."
            : "Add new context and the court will reconsider. Once."}
        </p>
      </div>

      {!used && (
        <Button
          onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="h-14 gap-2 bg-burgundy px-8 text-xl font-black tracking-[0.08em] text-cream shadow-[0_8px_30px_-12px_rgba(136,47,59,0.9)] hover:bg-burgundy-hover"
      >
        <Hand className="size-5" aria-hidden />
          OBJECTION!
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next); // can't walk out mid-ruling
        }}
      >
        <DialogContent className="gap-0 border border-burgundy/60 bg-ink-2 p-0 text-cream ring-0 sm:max-w-lg">
          <form onSubmit={submit} className="flex flex-col">
            <DialogHeader className="gap-3 px-6 pt-6">
              <p className="label-proc text-burgundy-hover">Objection!</p>
              <DialogTitle className="text-2xl font-semibold leading-tight tracking-tight text-cream">
                The court reluctantly allows it.
              </DialogTitle>
              <DialogDescription className="text-cream/70">
                The court will take your word for it. It is not happy about it.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2 px-6 pt-6 pb-6">
              <div className="flex items-baseline justify-between">
                <label htmlFor={`${ids}-t`} className="text-sm font-medium text-cream">
                  What did we miss?
                </label>
                <span id={`${ids}-count`} className="text-xs tabular-nums text-muted-foreground">
                  {text.length} / {LIMITS.objection}
                </span>
              </div>
              <Textarea
                id={`${ids}-t`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={LIMITS.objection}
                rows={4}
                disabled={pending}
                placeholder="It was actually his air fryer."
                aria-describedby={`${ids}-count`}
                className="min-h-24 border-border bg-ink/60 text-base text-cream placeholder:text-muted-foreground/70 focus-visible:border-gold focus-visible:ring-gold/30 dark:bg-ink/60"
              />
            </div>

            <DialogFooter className="mx-0 mb-0 rounded-b-xl border-border bg-ink/40 px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="h-11 px-4 text-cream/80 hover:bg-cream/5 hover:text-cream"
              >
                Withdraw
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="h-11 gap-2 bg-burgundy px-5 font-semibold text-cream hover:bg-burgundy-hover"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    The court is reconsidering…
                  </>
                ) : (
                  "Present new evidence"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
