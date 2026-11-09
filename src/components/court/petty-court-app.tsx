"use client";

import { useRef, useState } from "react";
import { Scale } from "lucide-react";
import { dramaticPause, generateCaseNumber } from "@/lib/court-client";
import { FEATURED_SAMPLE, appealFor, presetObjectionFor, sampleTrialFor } from "@/lib/samples";
import type { AppealRecord, CaseInput, Trial } from "@/lib/types";
import { ArchivesLoader } from "./archives-loader";
import { CaseForm } from "./case-form";
import { Courtroom, type Stage } from "./courtroom";
import { SiteHeader } from "./site-header";

const EMPTY: CaseInput = { defendantNickname: "", complaint: "", defenseContext: "" };

/** Everything about one case. Replaced wholesale for a new case, so nothing leaks between cases. */
type Session = {
  caseNumber: string;
  input: CaseInput;
  trial: Trial;
  stage: Stage;
  appeal: AppealRecord | null;
  appealPending: boolean;
};

export function PettyCourtApp() {
  const [draft, setDraft] = useState<CaseInput>(EMPTY);
  const [pending, setPending] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [focusForm, setFocusForm] = useState(false);

  // Every new case / reset bumps the generation, so a pending ruling can never
  // land on a case the user has moved past.
  const generation = useRef(0);
  const busy = useRef(false);
  const appealBusy = useRef(false);

  function startGeneration(): number {
    generation.current += 1;
    appealBusy.current = false;
    return generation.current;
  }
  const isCurrent = (id: number) => id === generation.current;

  async function fileCase(input: CaseInput) {
    if (busy.current) return; // no duplicate submissions
    busy.current = true;
    const id = startGeneration();
    setPending(true);
    await dramaticPause();
    if (!isCurrent(id)) return;
    setSession({
      caseNumber: generateCaseNumber(),
      input,
      trial: sampleTrialFor(input),
      stage: 0,
      appeal: null,
      appealPending: false,
    });
    window.scrollTo({ top: 0 });
    setPending(false);
    busy.current = false;
  }

  function cancelInFlight() {
    startGeneration();
    busy.current = false;
    setPending(false);
  }

  function trySample() {
    cancelInFlight();
    setSession(null);
    setDraft(FEATURED_SAMPLE.input);
    void fileCase(FEATURED_SAMPLE.input);
  }

  function reset() {
    cancelInFlight();
    setFocusForm(true);
    setSession(null);
    setDraft(EMPTY);
    window.scrollTo({ top: 0 });
  }

  /** One objection per case. */
  async function appeal(objection: string): Promise<boolean> {
    const s = session;
    if (!s || s.appeal || appealBusy.current) return false;
    appealBusy.current = true;
    const id = generation.current;
    const patch = (p: Partial<Session>) => {
      if (isCurrent(id)) setSession((cur) => cur && { ...cur, ...p });
    };
    patch({ appealPending: true });
    await dramaticPause(1100);
    if (!isCurrent(id)) return false;
    const record: AppealRecord = { ...appealFor(s.input, s.trial, objection), objection };
    patch({ appeal: record, appealPending: false });
    appealBusy.current = false;
    return true;
  }

  return (
    <>
      <SiteHeader onTrySample={trySample} onHome={reset} busy={pending} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-14 sm:px-8 sm:py-20">
        {pending && !session ? (
          <Deliberating onCancel={cancelInFlight} />
        ) : session ? (
          <Courtroom
            key={session.caseNumber}
            {...session}
            onAdvance={() =>
              setSession((s) => s && { ...s, stage: Math.min(2, s.stage + 1) as Stage })
            }
            onSkip={() => setSession((s) => s && { ...s, stage: 2 })}
            onAppeal={appeal}
            presetObjection={presetObjectionFor(session.input)}
            onReset={reset}
          />
        ) : (
          <CaseForm
            value={draft}
            onChange={setDraft}
            onSubmit={() => void fileCase(draft)}
            pending={pending}
            focusOnMount={focusForm}
          />
        )}
      </main>
      <footer className="no-print border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>Comedy court. Fictional verdicts. No actual legal authority.</span>
          <ArchivesLoader />
        </div>
      </footer>
    </>
  );
}

function Deliberating({ onCancel }: { onCancel: () => void }) {
  return (
    <div role="status" className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
      <Scale className="gavel-pulse size-12 text-gold" aria-hidden />
      <p className="label-proc text-gold">All rise</p>
      <p className="max-w-xl text-2xl font-semibold text-cream sm:text-3xl">
        The court is reviewing a deeply avoidable situation.
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-sm text-sm text-muted-foreground underline underline-offset-4 hover:text-cream"
      >
        Withdraw the case
      </button>
    </div>
  );
}
