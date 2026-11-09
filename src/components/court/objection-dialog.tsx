"use client";

import { useId, useState } from "react";
import { Hand, Loader2, RotateCcw } from "lucide-react";
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
import { LIMITS, type CourtFailure, type CourtMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const normalize = (s: string) => s.trim().replace(/\s+/g, " ");

type Route =
  | { kind: "saved" }
  | { kind: "live" }
  | { kind: "blocked"; reason: string; canRestore: boolean };

/** Decides where an objection would go, so the dialog can explain it up front. */
function routeFor(
  text: string,
  caseMode: CourtMode,
  preset: string | null,
  aiAvailable: boolean,
): Route {
  if (caseMode === "sample" && preset && normalize(text) === normalize(preset)) {
    return { kind: "saved" };
  }
  if (aiAvailable) return { kind: "live" };
  if (caseMode === "sample" && preset) {
    return {
      kind: "blocked",
      reason:
        "The saved demo only covers its preset objection. Restore it, or set ANTHROPIC_API_KEY for live analysis of your own wording.",
      canRestore: true,
    };
  }
  return {
    kind: "blocked",
    reason:
      "A saved appeal only exists for the air fryer sample case. Objections to other cases need the live AI court (ANTHROPIC_API_KEY).",
    canRestore: false,
  };
}

export function ObjectionDialog({
  caseMode,
  aiAvailable,
  presetObjection,
  used,
  pending,
  error,
  onSubmit,
}: {
  caseMode: CourtMode;
  aiAvailable: boolean;
  /** The saved demo's preset objection, when this sample case has one. */
  presetObjection: string | null;
  /** One successful objection per case. */
  used: boolean;
  pending: boolean;
  error: CourtFailure | null;
  /** Resolves true when the appeal succeeded. */
  onSubmit: (text: string) => Promise<boolean>;
}) {
  const ids = useId();
  const [open, setOpen] = useState(false);
  const initial = caseMode === "sample" && presetObjection ? presetObjection : "";
  const [text, setText] = useState(initial);
  // Show a failure only while the text is unchanged from the attempt that failed.
  const [attempted, setAttempted] = useState<string | null>(null);
  const shownError = error && attempted === text ? error : null;
  const route = routeFor(text, caseMode, presetObjection, aiAvailable);
  const canSubmit = Boolean(text.trim()) && !pending && route.kind !== "blocked";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setAttempted(text);
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
                aria-describedby={`${ids}-count ${ids}-route${shownError ? ` ${ids}-err` : ""}`}
                className="min-h-24 border-border bg-ink/60 text-base text-cream placeholder:text-muted-foreground/70 focus-visible:border-gold focus-visible:ring-gold/30 dark:bg-ink/60"
              />

              <RouteNote
                id={`${ids}-route`}
                route={route}
                onRestore={presetObjection ? () => setText(presetObjection) : undefined}
              />

              {shownError && (
                <p id={`${ids}-err`} role="alert" className="mt-1 rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive">
                  {shownError.message}
                </p>
              )}
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
                ) : shownError?.retryable ? (
                  <>
                    <RotateCcw className="size-4" aria-hidden /> Try again
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

function RouteNote({
  id,
  route,
  onRestore,
}: {
  id: string;
  route: Route;
  onRestore?: () => void;
}) {
  const base = "mt-1 rounded-md border px-3 py-2 text-xs leading-relaxed";
  if (route.kind === "saved") {
    return (
      <p id={id} className={cn(base, "border-gold/40 text-cream/80")}>
        <span className="label-proc mr-1 text-gold">Sample demo — saved appeal.</span>
        The saved ruling uses this preset objection. Edit it and the court will need live analysis.
      </p>
    );
  }
  if (route.kind === "live") {
    return (
      <p id={id} className={cn(base, "border-border text-cream/70")}>
        The live AI court will rule on your objection.
      </p>
    );
  }
  return (
    <div id={id} className={cn(base, "flex flex-col gap-2 border-gold/40 text-cream/80")}>
      <p>{route.reason}</p>
      {route.canRestore && onRestore && (
        <button
          type="button"
          onClick={onRestore}
          className="self-start rounded-sm text-gold underline underline-offset-4 hover:text-cream"
        >
          Restore preset objection
        </button>
      )}
    </div>
  );
}
