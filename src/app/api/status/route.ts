import { connection } from "next/server";
import { aiConfigured } from "@/server/court";

/** Tells the client whether the live AI court is available. Never exposes the key. */
export async function GET() {
  await connection(); // evaluate env at request time, not at build
  return Response.json({ aiAvailable: aiConfigured() });
}
