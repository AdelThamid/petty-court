"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Loader2, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SAMPLE_CHIPS } from "@/lib/samples";
import { LIMITS, type CaseInput, type CourtFailure } from "@/lib/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "border-border bg-ink-2/60 text-cream placeholder:text-muted-foreground/70 focus-visible:border-gold focus-visible:ring-gold/30 dark:bg-ink-2/60";

function Counter({ value, max, id }: { value: string; max: number; id: string }) {
  const near = value.length > max * 0.9;
  return (
    <span
      id={id}
      className={cn("text-xs tabular-nums text-muted-foreground", near && "text-gold")}
    >
      {value.length.toLocaleString()} / {max.toLocaleString()}
    </span>
  );
}

export function CaseForm({
  value,
  onChange,
  onSubmit,
  onRetry,
  pending,
  error,
  outOfScope,
  aiAvailable,
  focusOnMount = false,
}: {
  value: CaseInput;
  onChange: (v: CaseInput) => void;
  onSubmit: () => void;
  onRetry: () => void;
  pending: boolean;
  error: CourtFailure | null;
  outOfScope: string | null;
  /** null while checking. */
  aiAvailable: boolean | null;
  /** Focus the complaint field when the form appears (e.g. after "Try another case"). */
  focusOnMount?: boolean;
}) {
  const ids = useId();
  const complaintRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (focusOnMount) complaintRef.current?.focus({ preventScroll: true });
  }, [focusOnMount]);
  const [touched, setTouched] = useState(false);
  const missing = touched && !value.complaint.trim();

  const set = (key: keyof CaseInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => onChange({ ...value, [key]: e.target.value });

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      {/* Left: the pitch */}
      <div className="lg:col-span-6 lg:pt-4">
        <p className="label-proc text-gold">Small disputes. Unnecessarily dramatic justice.</p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-[3.5rem]">
          Your roommate ate your leftovers.
          <span className="mt-2 block text-gold">We’re taking this to court.</span>
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/75">
          Present your case. Hear both sides. Receive a deeply unnecessary verdict.
        </p>

        <div className="mt-12 border-t border-border pt-6">
          <p className="label-proc text-muted-foreground" id={`${ids}-precedent`}>
            Notable precedent — click to file
          </p>
          <ul className="mt-4 flex flex-col gap-2" aria-labelledby={`${ids}-precedent`}>
            {SAMPLE_CHIPS.map((s) => {
              const active = value.complaint === s.input.complaint;
              return (
                <li key={s.input.complaint}>
                  <button
                    type="button"
                    onClick={() => onChange({ ...value, complaint: s.input.complaint })}
                    aria-pressed={active}
                    className={cn(
                      "w-full rounded-md border px-4 py-3 text-left text-sm transition-colors",
                      active
                        ? "border-gold bg-gold/10 text-cream"
                        : "border-border text-cream/80 hover:border-gold/60 hover:text-cream",
                    )}
                  >
                    “{s.input.complaint}”
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Right: the filing */}
      <form
        className="lg:col-span-6"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (value.complaint.trim()) onSubmit();
        }}
      >
        <div className="rounded-lg border border-border bg-ink-2/40 p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
            <h2 className="label-proc text-gold">Form PC-1 · Statement of Grievance</h2>
            <span className="label-proc text-muted-foreground">Filing fee: $0.00</span>
          </div>

          <div className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${ids}-nick`} className="text-cream">
                Defendant nickname <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id={`${ids}-nick`}
                value={value.defendantNickname}
                onChange={set("defendantNickname")}
                maxLength={LIMITS.nickname}
                placeholder="e.g. Kevin from 4B"
                className={cn(fieldClass, "h-11")}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <Label htmlFor={`${ids}-complaint`} className="text-cream">
                  What happened? <span className="text-gold" aria-hidden>*</span>
                </Label>
                <Counter value={value.complaint} max={LIMITS.complaint} id={`${ids}-c-count`} />
              </div>
              <Textarea
                ref={complaintRef}
                id={`${ids}-complaint`}
                value={value.complaint}
                onChange={set("complaint")}
                onBlur={() => setTouched(true)}
                maxLength={LIMITS.complaint}
                required
                aria-required
                aria-invalid={missing || undefined}
                aria-describedby={`${ids}-c-count ${missing ? `${ids}-c-err` : ""}`}
                rows={5}
                placeholder="State your grievance. Spare no petty detail."
                className={cn(fieldClass, "min-h-32 resize-y text-base leading-relaxed")}
              />
              {missing && (
                <p id={`${ids}-c-err`} className="text-sm text-destructive">
                  The court cannot rule on silence. Tell us what happened.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <Label htmlFor={`${ids}-side`} className="text-cream">
                  What’s their side of the story?{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Counter value={value.defenseContext} max={LIMITS.defenseContext} id={`${ids}-s-count`} />
              </div>
              <Textarea
                id={`${ids}-side`}
                value={value.defenseContext}
                onChange={set("defenseContext")}
                maxLength={LIMITS.defenseContext}
                aria-describedby={`${ids}-s-count`}
                rows={3}
                placeholder="Their excuse, in their words. The defense will need it."
                className={cn(fieldClass, "min-h-20 resize-y text-base leading-relaxed")}
              />
            </div>

            {outOfScope && (
              <div role="alert" className="rounded-md border border-gold/40 bg-gold/5 px-4 py-3">
                <p className="label-proc text-gold">Case dismissed — outside this court’s jurisdiction</p>
                <p className="mt-2 text-sm leading-relaxed text-cream/90">{outOfScope}</p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-md border border-destructive/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="flex items-start gap-2 text-sm text-destructive">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {error.message}
                </p>
                {error.retryable && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onRetry}
                    disabled={pending}
                    className="h-9 shrink-0 gap-2 border-destructive/50 bg-transparent px-3 text-cream hover:bg-destructive/10 dark:bg-transparent"
                  >
                    <RotateCcw className="size-3.5" aria-hidden /> Retry
                  </Button>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={pending || aiAvailable === null}
              className="h-12 w-full gap-2 bg-burgundy text-base font-semibold text-cream hover:bg-burgundy-hover"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  All rise…
                </>
              ) : (
                <>
                  Take this to court
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </Button>
            <CourtStatus aiAvailable={aiAvailable} />
          </div>
        </div>
      </form>
    </div>
  );
}

function CourtStatus({ aiAvailable }: { aiAvailable: boolean | null }) {
  if (aiAvailable === null) {
    return <p className="text-center text-xs text-muted-foreground">Checking whether the court is in session…</p>;
  }
  if (aiAvailable) {
    return (
      <p className="flex items-center justify-center gap-2 text-xs text-cream/70">
        <Sparkles className="size-3.5 text-gold" aria-hidden /> Live AI court in session
      </p>
    );
  }
  return (
    <p className="rounded-md border border-border px-4 py-3 text-xs leading-relaxed text-cream/70">
      <span className="label-proc mr-1 text-gold">Sample demo mode.</span> The live AI court isn’t
      configured on this server, so filings get saved or templated sample results, clearly labelled
      “Sample demo — saved results.”
    </p>
  );
}
