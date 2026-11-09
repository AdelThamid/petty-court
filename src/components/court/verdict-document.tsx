import { Scale } from "lucide-react";
import type { Judgment } from "@/lib/types";
import { cn } from "@/lib/utils";

export type VerdictStatus = "original" | "upheld" | "amended";

const STAMP_STYLE: Record<Judgment["verdict"], string> = {
  GUILTY: "border-burgundy text-burgundy",
  "NOT GUILTY": "border-[#2f5d46] text-[#2f5d46]",
  "EVERYONE IS RIDICULOUS": "border-[#7a4a12] text-[#7a4a12]",
};

const STATUS_LABEL: Record<VerdictStatus, string | null> = {
  original: null,
  upheld: "Upheld on objection",
  amended: "Amended on objection",
};

/**
 * The final verdict: the visual centrepiece, and the only thing that prints.
 * Always rendered from the latest judgment (post-appeal when there is one).
 */
export function VerdictDocument({
  caseNumber,
  caseTitle,
  charge,
  judgment,
  status,
}: {
  caseNumber: string;
  caseTitle: string;
  charge: string;
  judgment: Judgment;
  status: VerdictStatus;
}) {
  const statusLabel = STATUS_LABEL[status];
  return (
    <article
      aria-labelledby="verdict-heading"
      className="verdict-doc parchment mx-auto w-full max-w-3xl rounded-sm p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] sm:p-3"
    >
      {/* Thin double-line border */}
      <div className="verdict-inner rounded-[2px] border-[3px] border-double border-parchment-ink/45 px-5 py-8 sm:px-12 sm:py-12">
        <header className="flex flex-col items-center text-center">
          <Scale className="size-8 text-parchment-ink/80" strokeWidth={1.5} aria-hidden />
          <h2
            id="verdict-heading"
            className="mt-4 text-lg font-bold tracking-[0.16em] text-parchment-ink sm:text-xl"
          >
            THE HIGH COURT OF PETTY MATTERS
          </h2>
          <p className="mt-1 text-sm text-parchment-ink/70">Department of Unnecessary Justice</p>
          <p className="label-proc mt-5 tabular-nums text-parchment-ink/60">Case {caseNumber}</p>
          <p className="mt-2 text-balance text-xl font-semibold leading-snug text-parchment-ink sm:text-2xl">
            {caseTitle}
          </p>
          {statusLabel && (
            <p className="label-proc mt-3 rounded-sm border border-parchment-ink/30 px-2 py-0.5 text-parchment-ink/70">
              {statusLabel}
            </p>
          )}
        </header>

        {/* Keyed so the stamp re-slams when an appeal changes the verdict */}
        <div className="verdict-keep verdict-stamp-wrap my-8 flex justify-center sm:my-10">
          <div
            key={`${status}-${judgment.verdict}`}
            role="img"
            aria-label={`Verdict: ${judgment.verdict}`}
            className={cn(
              "stamp max-w-[90%] rounded-sm border-4 px-4 py-2.5 text-center text-2xl font-black leading-tight tracking-[0.1em] sm:tracking-[0.14em] mix-blend-multiply [--stamp-rot:-4deg] sm:px-7 sm:text-4xl",
              STAMP_STYLE[judgment.verdict],
            )}
          >
            {judgment.verdict}
          </div>
        </div>

        <dl className="grid gap-6 border-t border-parchment-ink/20 pt-8">
          <DocRow label="Charge">
            <span className="text-lg font-semibold">{charge}</span>
          </DocRow>
          <DocRow label="The court finds">
            <span className="leading-relaxed">{judgment.judgeReasoning}</span>
          </DocRow>
        </dl>

        <section aria-labelledby="nonsense-heading" className="verdict-keep mt-8 border-t border-parchment-ink/20 pt-8">
          <h3 id="nonsense-heading" className="label-proc text-parchment-ink/70">
            COURT-ORDERED NONSENSE
          </h3>
          <p className="mt-3 text-lg leading-relaxed text-parchment-ink">{judgment.sentence}</p>
        </section>

        <blockquote className="verdict-keep verdict-punchline mt-10 border-l-[3px] border-burgundy pl-5 text-balance text-2xl font-semibold leading-snug text-parchment-ink sm:text-3xl">
          “{judgment.closingLine}”
        </blockquote>

        <footer className="verdict-keep mt-12 flex flex-col items-start gap-6 border-t border-parchment-ink/20 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <svg viewBox="0 0 160 40" className="h-9 w-36 text-parchment-ink/80" aria-hidden>
              <path
                d="M4 28c10-18 18-20 20-10s-6 14 2 8 14-22 20-16-4 18 4 14 12-12 18-10 2 10 10 8 16-10 24-8 10 6 18 4 14-6 30-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <p className="mt-1 w-44 border-t border-parchment-ink/40 pt-1 text-xs text-parchment-ink/70">
              The Honorable Judge, Presiding
            </p>
          </div>
          <p className="text-sm italic text-parchment-ink/70">Entirely fictional. Emotionally satisfying.</p>
        </footer>
      </div>
    </article>
  );
}

function DocRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="verdict-keep grid gap-1.5 sm:grid-cols-[9.5rem_1fr] sm:gap-6">
      <dt className="label-proc pt-1 text-parchment-ink/60">{label}</dt>
      <dd className="text-parchment-ink">{children}</dd>
    </div>
  );
}
