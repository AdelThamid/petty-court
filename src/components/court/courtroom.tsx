"use client";

import { useEffect, useRef } from "react";
import { FastForward, Gavel, Scale, ScrollText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pickJudgment, type AppealRecord, type CaseInput, type CourtFailure, type CourtMode, type Trial } from "@/lib/types";
import { AppealResult } from "./appeal-result";
import { ObjectionDialog } from "./objection-dialog";
import { VerdictActions } from "./verdict-actions";
import { Testimony } from "./testimony";
import { VerdictDocument, type VerdictStatus } from "./verdict-document";
import { verdictToText } from "@/lib/verdict-text";

/** Smooth scrolling unless the user prefers reduced motion. */
const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

/** 0 = prosecution, 1 = + defense, 2 = + judgment */
export type Stage = 0 | 1 | 2;

const nextButton =
  "h-11 gap-2 bg-burgundy px-5 font-semibold text-cream hover:bg-burgundy-hover";

export function Courtroom({
  caseNumber,
  input,
  trial,
  mode,
  stage,
  onAdvance,
  onSkip,
  appeal,
  appealPending,
  appealError,
  onAppeal,
  aiAvailable,
  presetObjection,
  onReset,
}: {
  caseNumber: string;
  input: CaseInput;
  trial: Trial;
  mode: CourtMode;
  stage: Stage;
  onAdvance: () => void;
  onSkip: () => void;
  appeal: AppealRecord | null;
  appealPending: boolean;
  appealError: CourtFailure | null;
  onAppeal: (text: string) => Promise<boolean>;
  aiAvailable: boolean;
  presetObjection: string | null;
  onReset: () => void;
}) {
  // The latest ruling: the objection result if there is one, else the original verdict.
  const judgment = pickJudgment(appeal ?? trial);
  const status: VerdictStatus = !appeal ? "original" : appeal.ruling === "UPHELD" ? "upheld" : "amended";
  const defenseRef = useRef<HTMLHeadingElement>(null);
  const judgeRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const appealRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // After a successful objection, bring the ruling into view and focus.
  useEffect(() => {
    if (!appeal) return;
    appealRef.current?.focus({ preventScroll: true });
    appealRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
  }, [appeal]);

  // Move focus to newly revealed testimony so keyboard + screen reader users follow along.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      titleRef.current?.focus();
      return;
    }
    const target = stage === 1 ? defenseRef.current : stage === 2 ? judgeRef.current : null;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }, [stage]);

  return (
    <div className="flex flex-col gap-14">
      {/* Case header */}
      <header className="no-print reveal border-b border-border pb-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="label-proc tabular-nums text-gold">Case {caseNumber}</span>
          <span className="label-proc text-muted-foreground">Court is in session</span>
          {mode === "sample" ? (
            <span className="label-proc rounded-sm border border-gold/40 px-2 py-0.5 text-gold">
              Sample demo — saved results
            </span>
          ) : (
            <span className="label-proc rounded-sm border border-cream/25 px-2 py-0.5 text-cream/80">
              Live AI ruling
            </span>
          )}
        </div>
        <h1
          ref={titleRef}
          tabIndex={-1}
          className="mt-5 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-cream outline-none sm:text-5xl"
        >
          {trial.caseTitle}
        </h1>
        <p className="mt-4 text-base text-cream/70">
          <span className="label-proc mr-2 text-muted-foreground">Charge</span>
          {trial.charge}
        </p>

        <figure className="mt-8 max-w-3xl border-l-2 border-gold/60 pl-5">
          <figcaption className="label-proc flex items-center gap-2 text-muted-foreground">
            <ScrollText className="size-3.5" aria-hidden /> Complaint as filed
          </figcaption>
          <blockquote className="mt-2 text-lg leading-relaxed text-cream/90">“{input.complaint}”</blockquote>
          {input.defenseContext && (
            <p className="mt-3 text-sm text-cream/60">
              <span className="label-proc mr-2">Defendant’s position</span>“{input.defenseContext}”
            </p>
          )}
        </figure>
      </header>

      {/* Testimony */}
      <div className="no-print flex flex-col gap-14" aria-live="polite">
        <Testimony role="The Prosecution" speaker="For the plaintiff" icon={Gavel} text={trial.prosecutor}>
          {stage === 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={onAdvance} className={nextButton}>
                <Shield className="size-4" aria-hidden /> Hear the defense
              </Button>
              <SkipButton onSkip={onSkip} />
            </div>
          )}
        </Testimony>

        {stage >= 1 && (
          <Testimony
            ref={defenseRef}
            role="The Defense"
            speaker={`Counsel for ${input.defendantNickname.trim() || "the defendant"}`}
            icon={Shield}
            tone="cream"
            text={trial.defense}
          >
            {stage === 1 && (
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={onAdvance} className={nextButton}>
                  <Scale className="size-4" aria-hidden /> The court will rule
                </Button>
                <SkipButton onSkip={onSkip} />
              </div>
            )}
          </Testimony>
        )}

        {stage >= 2 && (
          <Testimony
            ref={judgeRef}
            role="The Bench"
            speaker="The Honorable Judge, presiding"
            icon={Scale}
            tone="burgundy"
            text={trial.judgeReasoning}
          >
            <p className="mt-6 label-proc text-gold">
              Verdict: <span className="text-cream">{trial.verdict}</span>
            </p>
          </Testimony>
        )}
      </div>

      {stage >= 2 && (
        <>
          {appeal && <AppealResult ref={appealRef} original={pickJudgment(trial)} appeal={appeal} />}

          <div className="flex flex-col gap-6">
            {mode === "sample" && (
              <p className="no-print label-proc mx-auto w-full max-w-3xl text-center text-gold">
                Sample demo — saved results
              </p>
            )}
            {/* Always the latest judgment: this is what gets copied and printed. */}
            <div className="reveal print-area" key={appeal ? "appealed" : "original"}>
              <VerdictDocument
                caseNumber={caseNumber}
                caseTitle={trial.caseTitle}
                charge={trial.charge}
                judgment={judgment}
                status={status}
              />
            </div>
            <VerdictActions
              getText={() =>
                verdictToText({ caseNumber, caseTitle: trial.caseTitle, charge: trial.charge, judgment, status })
              }
              onReset={onReset}
              resetIsPrimary={Boolean(appeal)}
            />
          </div>

          <ObjectionDialog
            caseMode={mode}
            aiAvailable={aiAvailable}
            presetObjection={presetObjection}
            used={Boolean(appeal)}
            pending={appealPending}
            error={appealError}
            onSubmit={onAppeal}
          />
        </>
      )}
    </div>
  );
}

function SkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onSkip}
      className="h-11 gap-2 px-4 text-cream/75 hover:bg-cream/5 hover:text-cream"
    >
      <FastForward className="size-4" aria-hidden /> Show full trial
    </Button>
  );
}
