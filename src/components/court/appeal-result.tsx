import { forwardRef } from "react";
import { Hand } from "lucide-react";
import type { AppealRecord, Judgment } from "@/lib/types";
import { cn } from "@/lib/utils";

const RULING_STYLE: Record<AppealRecord["ruling"], string> = {
  UPHELD: "border-cream/40 text-cream",
  MODIFIED: "border-gold text-gold",
  OVERTURNED: "border-burgundy-hover bg-burgundy/20 text-cream",
};

/** Original verdict (kept visible, marked superseded if changed) + the objection ruling. */
export const AppealResult = forwardRef<
  HTMLHeadingElement,
  { original: Judgment; appeal: AppealRecord }
>(function AppealResult({ original, appeal }, ref) {
  const superseded = appeal.ruling !== "UPHELD";
  return (
    <section aria-labelledby="appeal-heading" className="no-print reveal flex flex-col gap-8">
      {/* Original verdict, clearly labelled */}
      <div
        className={cn(
          "relative rounded-lg border border-border p-5 sm:p-6",
          superseded && "opacity-80",
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="label-proc text-muted-foreground">Original verdict</span>
          {superseded ? (
            <span className="label-proc rounded-sm border border-burgundy-hover px-2 py-0.5 text-[#e08a96]">
              Superseded
            </span>
          ) : (
            <span className="label-proc rounded-sm border border-cream/30 px-2 py-0.5 text-cream/80">
              Upheld on objection
            </span>
          )}
        </div>
        <p className={cn("mt-3 text-lg font-semibold text-cream", superseded && "line-through decoration-burgundy-hover/70")}>
          {original.verdict}
        </p>
        <p className={cn("mt-1 text-sm text-cream/70", superseded && "line-through decoration-burgundy-hover/50")}>
          {original.sentence}
        </p>
      </div>

      {/* The objection and the judge's reaction */}
      <div className="grid gap-4 sm:grid-cols-[11rem_1fr] sm:gap-10">
        <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
          <span className="grid size-9 place-items-center rounded-full border border-burgundy bg-burgundy/20 text-cream">
            <Hand className="size-4" aria-hidden />
          </span>
          <div>
            <h3 id="appeal-heading" ref={ref} tabIndex={-1} className="label-proc text-gold outline-none focus-visible:outline-2">
              Objection
            </h3>
            <p className="text-xs text-muted-foreground">
              {appeal.mode === "sample" ? "Sample demo — saved appeal" : "Live AI ruling"}
            </p>
          </div>
        </div>
        <div className="border-l border-border pl-6 sm:pl-8">
          <p className="text-sm italic text-cream/65">“{appeal.objection}”</p>
          <p className="mt-4 text-xl font-medium leading-snug text-cream sm:text-2xl">{appeal.reaction}</p>
          <p className="mt-5 flex flex-wrap items-center gap-3">
            <span className="label-proc text-muted-foreground">Ruling</span>
            <span className={cn("label-proc rounded-sm border px-2.5 py-1 text-sm", RULING_STYLE[appeal.ruling])}>
              {appeal.ruling}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
});
