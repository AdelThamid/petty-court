import { z } from "zod";

/* Shared (client + server) validation. No secrets or server-only code here. */

export const LIMITS = {
  nickname: 60,
  complaint: 1500,
  defenseContext: 1000,
  objection: 500,
} as const;

export const VERDICTS = ["GUILTY", "NOT GUILTY", "EVERYONE IS RIDICULOUS"] as const;

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max.toLocaleString()} characters or fewer.`)
    .optional()
    .default("");

export const CaseInputSchema = z.object({
  defendantNickname: optionalText(LIMITS.nickname, "Defendant nickname"),
  complaint: z
    .string({ error: "Tell the court what happened." })
    .trim()
    .min(1, "Tell the court what happened.")
    .max(LIMITS.complaint, `Complaint must be ${LIMITS.complaint.toLocaleString()} characters or fewer.`),
  defenseContext: optionalText(LIMITS.defenseContext, "Their side of the story"),
});

/* ---------- Model output shapes (no length constraints: sent to the API) ---------- */

const judgmentShape = {
  judgeReasoning: z.string(),
  verdict: z.enum(VERDICTS),
  sentence: z.string(),
  closingLine: z.string(),
};

const OutOfScopeShape = z.object({
  kind: z.literal("out_of_scope"),
  message: z.string(),
});

export const TrialOutputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("trial"),
    caseTitle: z.string(),
    charge: z.string(),
    prosecutor: z.string(),
    defense: z.string(),
    ...judgmentShape,
  }),
  OutOfScopeShape,
]);


export const APPEAL_RULINGS = ["UPHELD", "OVERTURNED", "MODIFIED"] as const;

export const AppealOutputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("appeal"),
    reaction: z.string(),
    ruling: z.enum(APPEAL_RULINGS),
    ...judgmentShape,
  }),
  OutOfScopeShape,
]);

/* ---------- Capped shapes: what our API accepts and returns ---------- */
// Generous safety caps (the prompt targets far shorter text). Anything beyond
// these is treated as a malformed response rather than rendered.

const s = (max: number) => z.string().trim().min(1).max(max);

const JudgmentSchema = z.object({
  judgeReasoning: s(700),
  verdict: z.enum(VERDICTS),
  sentence: s(500),
  closingLine: s(300),
});

const OutOfScopeSchema = z.object({ kind: z.literal("out_of_scope"), message: s(400) });

export const TrialSchema = JudgmentSchema.extend({
  kind: z.literal("trial"),
  caseTitle: s(200),
  charge: s(200),
  prosecutor: s(900),
  defense: s(900),
});

export const TrialResultSchema = z.discriminatedUnion("kind", [TrialSchema, OutOfScopeSchema]);

export const AppealSchema = JudgmentSchema.extend({
  kind: z.literal("appeal"),
  reaction: s(500),
  ruling: z.enum(APPEAL_RULINGS),
});

export const AppealResultSchema = z.discriminatedUnion("kind", [AppealSchema, OutOfScopeSchema]);

export const ObjectionTextSchema = z
  .string({ error: "Tell the court what it missed." })
  .trim()
  .min(1, "Tell the court what it missed.")
  .max(LIMITS.objection, `Objections must be ${LIMITS.objection} characters or fewer.`);

export const AppealRequestSchema = z.object({
  ...CaseInputSchema.shape,
  trial: TrialSchema,
  objection: ObjectionTextSchema,
});

/** Max request body sizes in bytes, enforced before JSON parsing. */
export const BODY_LIMITS = { trial: 8_000, appeal: 24_000 } as const;

export { JudgmentSchema };
