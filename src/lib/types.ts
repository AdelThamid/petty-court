import type { z } from "zod";
import type {
  AppealRequestSchema,
  AppealResultSchema,
  AppealSchema,
  CaseInputSchema,
  JudgmentSchema,
  TrialResultSchema,
  TrialSchema,
  VERDICTS,
} from "./schemas";

export { LIMITS } from "./schemas";

export type CaseInput = z.output<typeof CaseInputSchema>;
export type Verdict = (typeof VERDICTS)[number];
export type Judgment = z.output<typeof JudgmentSchema>;
export type Trial = z.output<typeof TrialSchema>;
export type TrialResult = z.output<typeof TrialResultSchema>;
export type Appeal = z.output<typeof AppealSchema>;
export type AppealResult = z.output<typeof AppealResultSchema>;
export type AppealRequest = z.input<typeof AppealRequestSchema>;

export type CourtMode = "sample" | "ai";

/** A successful appeal, with what was objected and where the ruling came from. */
export type AppealRecord = Appeal & { objection: string; mode: CourtMode };

/** Error body returned by our API routes. */
export type ApiError = { error: string; retryable: boolean };

/** A failed request as shown in the UI. */
export type CourtFailure = { message: string; retryable: boolean };

export function pickJudgment(j: Judgment): Judgment {
  return {
    judgeReasoning: j.judgeReasoning,
    verdict: j.verdict,
    sentence: j.sentence,
    closingLine: j.closingLine,
  };
}
