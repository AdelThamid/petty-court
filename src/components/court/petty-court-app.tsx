"use client";

import { useEffect, useRef, useState } from "react";
import { Scale } from "lucide-react";
import {
  CourtRequestError,
  dramaticPause,
  fetchAiAvailable,
  generateCaseNumber,
  requestAiAppeal,
  requestAiTrial,
} from "@/lib/court-client";
import { FEATURED_SAMPLE, presetObjectionFor, sampleTrialFor, savedAppealFor } from "@/lib/samples";
import type { AppealRecord, CaseInput, CourtFailure, CourtMode, Trial } from "@/lib/types";
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
  mode: CourtMode;
  stage: Stage;
  appeal: AppealRecord | null;
  appealPending: boolean;
  appealError: CourtFailure | null;
};

function toFailure(err: unknown): CourtFailure {
  if (err instanceof CourtRequestError) return { message: err.message, retryable: err.retryable };
  return { message: "The court is in recess. Please try again.", retryable: true };
}

export function PettyCourtApp() {
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<CaseInput>(EMPTY);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<CourtFailure | null>(null);
  const [outOfScope, setOutOfScope] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [focusForm, setFocusForm] = useState(false);

  // Every new case / reset bumps the generation and aborts in-flight requests,
  // so a slow response can never land on a case the user has moved past.
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const appealBusy = useRef(false);

  useEffect(() => {
    let live = true;
    fetchAiAvailable().then((ok) => live && setAiAvailable(ok));
    return () => {
      live = false;
    };
  }, []);

  function startGeneration(): { id: number; signal: AbortSignal } {
    controller.current?.abort();
    controller.current = new AbortController();
    generation.current += 1;
    appealBusy.current = false;
    return { id: generation.current, signal: controller.current.signal };
  }
  const isCurrent = (id: number) => id === generation.current;

  async function fileCase(input: CaseInput, mode: CourtMode) {
    if (busy.current) return; // no duplicate submissions
    busy.current = true;
    const { id, signal } = startGeneration();
    setPending(true);
    setError(null);
    setOutOfScope(null);

    try {
      let trial: Trial;
      if (mode === "sample") {
        await dramaticPause();
        trial = sampleTrialFor(input);
      } else {
        const result = await requestAiTrial(input, signal);
        if (!isCurrent(id)) return;
        if (result.kind === "out_of_scope") {
          setOutOfScope(result.message);
          return;
        }
        trial = result;
      }
      if (!isCurrent(id)) return;
      setSession({
        caseNumber: generateCaseNumber(),
        input,
        trial,
        mode,
        stage: 0,
        appeal: null,
        appealPending: false,
        appealError: null,
      });
      window.scrollTo({ top: 0 });
    } catch (err) {
      if (!isCurrent(id) || signal.aborted) return;
      setError(toFailure(err));
    } finally {
      if (isCurrent(id)) {
        setPending(false);
        busy.current = false;
      }
    }
  }

  async function submitDraft() {
    let available = aiAvailable;
    if (available === null) {
      available = await fetchAiAvailable();
      setAiAvailable(available);
    }
    void fileCase(draft, available ? "ai" : "sample");
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
    void fileCase(FEATURED_SAMPLE.input, "sample");
  }

  function reset() {
    cancelInFlight();
    setFocusForm(true);
    setSession(null);
    setDraft(EMPTY);
    setError(null);
    setOutOfScope(null);
    window.scrollTo({ top: 0 });
  }

  /** One successful objection per case. Failures leave the trial intact and stay retryable. */
  async function appeal(objection: string): Promise<boolean> {
    const s = session;
    if (!s || s.appeal || appealBusy.current) return false;
    appealBusy.current = true;
    const id = generation.current;
    const signal = controller.current?.signal ?? new AbortController().signal;
    const patch = (p: Partial<Session>) => {
      if (isCurrent(id)) setSession((cur) => cur && { ...cur, ...p });
    };
    patch({ appealPending: true, appealError: null });

    try {
      // The saved demo appeal applies only to its sample case + preset objection.
      const saved = s.mode === "sample" ? savedAppealFor(s.input, objection) : null;
      let record: AppealRecord;
      if (saved) {
        await dramaticPause(1100);
        record = { ...saved, objection, mode: "sample" };
      } else {
        if (!aiAvailable) {
          throw new CourtRequestError(
            "The live AI court isn’t configured, and the saved demo only covers its preset objection.",
            false,
          );
        }
        const result = await requestAiAppeal({ ...s.input, trial: s.trial, objection }, signal);
        if (result.kind === "out_of_scope") {
          patch({ appealError: { message: result.message, retryable: false } });
          return false;
        }
        record = { ...result, objection, mode: "ai" };
      }
      if (!isCurrent(id)) return false;
      patch({ appeal: record });
      return true;
    } catch (err) {
      if (isCurrent(id) && !signal.aborted) patch({ appealError: toFailure(err) });
      return false;
    } finally {
      patch({ appealPending: false });
      if (isCurrent(id)) appealBusy.current = false;
    }
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
            aiAvailable={aiAvailable === true}
            presetObjection={session.mode === "sample" ? presetObjectionFor(session.input) : null}
            onReset={reset}
          />
        ) : (
          <CaseForm
            value={draft}
            onChange={setDraft}
            onSubmit={submitDraft}
            onRetry={() => fileCase(draft, "ai")}
            pending={pending}
            error={error}
            outOfScope={outOfScope}
            aiAvailable={aiAvailable}
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
