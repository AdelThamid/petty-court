import type { z } from "zod";
import type { AppealSchema, CaseInputSchema, JudgmentSchema, TrialSchema, VERDICTS } from "./schemas";

export { LIMITS } from "./schemas";

export type CaseInput = z.output<typeof CaseInputSchema>;
export type Verdict = (typeof VERDICTS)[number];
export type Judgment = z.output<typeof JudgmentSchema>;
export type Trial = z.output<typeof TrialSchema>;
export type Appeal = z.output<typeof AppealSchema>;

/** A ruled objection, with what was objected. */
export type AppealRecord = Appeal & { objection: string };

export function pickJudgment(j: Judgment): Judgment {
  return {
    judgeReasoning: j.judgeReasoning,
    verdict: j.verdict,
    sentence: j.sentence,
    closingLine: j.closingLine,
  };
}
