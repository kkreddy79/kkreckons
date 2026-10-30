import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";

// Rebuilds the pages that show the live AI Stress Index as soon as a new reading is published, instead of
// waiting out their hourly cache (which let Home and /ai-stress-index show different days for up to an hour).
// Called by the "Update dashboard data" workflow in github.com/kkreddy79/ai-implosion once GitHub Pages serves
// the new docs/data.json, with `Authorization: Bearer <REVALIDATE_SECRET>`. The same value is set as
// REVALIDATE_SECRET on Vercel and as the KKRECKONS_REVALIDATE_SECRET secret in that repository.

const PATHS = ["/", "/ai-stress-index", "/ai-stress-index/badge.svg"];

const json = (status: number, body: object) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function authorized(req: Request, secret: string) {
  const given = Buffer.from(req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
  const want = Buffer.from(secret);
  return given.length === want.length && timingSafeEqual(given, want);
}

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return json(503, { error: "not_configured" });
  if (!authorized(req, secret)) return json(401, { error: "unauthorized" });
  for (const p of PATHS) revalidatePath(p);
  return json(200, { revalidated: PATHS });
}
