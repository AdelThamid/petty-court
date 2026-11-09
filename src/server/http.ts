import "server-only";

import { z } from "zod";
import type { ApiError } from "@/lib/types";
import { CourtError } from "./court";

export function errorResponse(message: string, status: number, retryable: boolean) {
  return Response.json({ error: message, retryable } satisfies ApiError, { status });
}

export function invalidRequest(error: z.ZodError) {
  const first = error.issues[0]?.message ?? "Invalid request.";
  return errorResponse(first, 400, false);
}

export function fromCourtError(err: unknown) {
  if (err instanceof CourtError) return errorResponse(err.message, err.status, err.retryable);
  console.error("[court] Unhandled:", err);
  return errorResponse("The court is in recess. Please try again.", 500, true);
}

export const notConfigured = () =>
  errorResponse(
    "Live AI court is not configured. Set ANTHROPIC_API_KEY on the server, or use the sample demo.",
    503,
    false,
  );

/**
 * Reads a JSON body, refusing anything over `maxBytes` before parsing.
 * Returns a Response on failure so routes can return it directly.
 */
export async function readJson(
  request: Request,
  maxBytes: number,
): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  const tooLarge = () => ({
    ok: false as const,
    response: errorResponse("That filing is too long for this court.", 413, false),
  });
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return tooLarge();

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, response: errorResponse("Invalid request.", 400, false) };
  }
  if (new TextEncoder().encode(text).byteLength > maxBytes) return tooLarge();
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, response: errorResponse("Request body must be JSON.", 400, false) };
  }
}
