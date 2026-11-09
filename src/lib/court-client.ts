export const dramaticPause = (ms = 900) => new Promise((r) => setTimeout(r, ms));

export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const n = Math.floor(10000 + Math.random() * 90000);
  const dept = ["PTY", "SNK", "GRB", "CRB"][Math.floor(Math.random() * 4)];
  return `No. ${year}-${dept}-${n}`;
}
