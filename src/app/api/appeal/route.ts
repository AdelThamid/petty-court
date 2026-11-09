import { AppealRequestSchema, BODY_LIMITS } from "@/lib/schemas";
import { aiConfigured, fileAppeal } from "@/server/court";
import { fromCourtError, invalidRequest, notConfigured, readJson } from "@/server/http";

export const maxDuration = 60;

export async function POST(request: Request) {
  const read = await readJson(request, BODY_LIMITS.appeal);
  if (!read.ok) return read.response;
  const parsed = AppealRequestSchema.safeParse(read.body);
  if (!parsed.success) return invalidRequest(parsed.error);
  if (!aiConfigured()) return notConfigured();

  const { trial, objection, ...input } = parsed.data;
  try {
    const result = await fileAppeal(input, trial, objection);
    return Response.json({ result });
  } catch (err) {
    return fromCourtError(err);
  }
}
