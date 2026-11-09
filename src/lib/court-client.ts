import { AppealResultSchema, TrialResultSchema } from "./schemas";
import type { AppealRequest, AppealResult, CaseInput, TrialResult } from "./types";

/** Client-side wait before giving up on the server (server's own budget is ~45s + 1 retry). */
const CLIENT_TIMEOUT_MS = 100_000;

/** Error the UI can show, with a flag for whether "Retry" makes sense. */
export class CourtRequestError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

async function postJson<T>(
  url: string,
  body: unknown,
  signal: AbortSignal,
  validate: (data: unknown) => T,
): Promise<T> {
  const timeout = AbortSignal.timeout(CLIENT_TIMEOUT_MS);
  const combined = AbortSignal.any([signal, timeout]);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: combined,
    });
  } catch (err) {
    if (signal.aborted) throw err; // cancelled by the user; caller ignores it
    if (timeout.aborted) {
      throw new CourtRequestError("The court took too long to deliberate. Please try again.", true);
    }
    throw new CourtRequestError("Could not reach the court. Check your connection and try again.", true);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = typeof data?.error === "string" ? data.error : "The court is in recess. Please try again.";
    throw new CourtRequestError(message, data?.retryable ?? res.status >= 500);
  }
  try {
    return validate(data?.result);
  } catch {
    throw new CourtRequestError("The court’s ruling came back garbled. Please try again.", true);
  }
}

export async function fetchAiAvailable(): Promise<boolean> {
  try {
    const res = await fetch("/api/status", { cache: "no-store" });
    const data = await res.json();
    return data?.aiAvailable === true;
  } catch {
    return false;
  }
}

export function requestAiTrial(input: CaseInput, signal: AbortSignal): Promise<TrialResult> {
  return postJson("/api/trial", input, signal, (d) => TrialResultSchema.parse(d));
}

export function requestAiAppeal(body: AppealRequest, signal: AbortSignal): Promise<AppealResult> {
  return postJson("/api/appeal", body, signal, (d) => AppealResultSchema.parse(d));
}

export const dramaticPause = (ms = 900) => new Promise((r) => setTimeout(r, ms));

export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const n = Math.floor(10000 + Math.random() * 90000);
  const dept = ["PTY", "SNK", "GRB", "CRB"][Math.floor(Math.random() * 4)];
  return `No. ${year}-${dept}-${n}`;
}
