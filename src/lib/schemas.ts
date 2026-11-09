import { z } from "zod";

/* Shared validation and data shapes. */

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

export const APPEAL_RULINGS = ["UPHELD", "OVERTURNED", "MODIFIED"] as const;

/* ---------- Trial and appeal shapes ---------- */

const s = (max: number) => z.string().trim().min(1).max(max);

const JudgmentSchema = z.object({
  judgeReasoning: s(700),
  verdict: z.enum(VERDICTS),
  sentence: s(500),
  closingLine: s(300),
});


export const TrialSchema = JudgmentSchema.extend({
  kind: z.literal("trial"),
  caseTitle: s(200),
  charge: s(200),
  prosecutor: s(900),
  defense: s(900),
});

export const AppealSchema = JudgmentSchema.extend({
  kind: z.literal("appeal"),
  reaction: s(500),
  ruling: z.enum(APPEAL_RULINGS),
});

export { JudgmentSchema };
