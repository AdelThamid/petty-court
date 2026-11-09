import type { Judgment } from "./types";

/** Plain-text version of the latest verdict, for the clipboard. */
export function verdictToText(v: {
  caseNumber: string;
  caseTitle: string;
  charge: string;
  judgment: Judgment;
  status: "original" | "upheld" | "amended";
}): string {
  const note =
    v.status === "amended" ? " (amended on objection)" : v.status === "upheld" ? " (upheld on objection)" : "";
  return [
    "THE HIGH COURT OF PETTY MATTERS",
    "Department of Unnecessary Justice",
    "",
    `Case ${v.caseNumber}`,
    v.caseTitle,
    "",
    `VERDICT: ${v.judgment.verdict}${note}`,
    `Charge: ${v.charge}`,
    "",
    `The court finds: ${v.judgment.judgeReasoning}`,
    "",
    "COURT-ORDERED NONSENSE",
    v.judgment.sentence,
    "",
    `“${v.judgment.closingLine}”`,
    "",
    "Entirely fictional. Emotionally satisfying.",
  ].join("\n");
}
