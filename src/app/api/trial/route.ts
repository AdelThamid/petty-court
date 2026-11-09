import { BODY_LIMITS, CaseInputSchema } from "@/lib/schemas";
import { aiConfigured, generateTrial } from "@/server/court";
import { fromCourtError, invalidRequest, notConfigured, readJson } from "@/server/http";

export const maxDuration = 60;

export async function POST(request: Request) {
  const read = await readJson(request, BODY_LIMITS.trial);
  if (!read.ok) return read.response;
  const parsed = CaseInputSchema.safeParse(read.body);
  if (!parsed.success) return invalidRequest(parsed.error);
  if (!aiConfigured()) return notConfigured();

  try {
    const result = await generateTrial(parsed.data);
    return Response.json({ result });
  } catch (err) {
    return fromCourtError(err);
  }
}
