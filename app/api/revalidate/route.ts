import { timingSafeEqual } from "node:crypto";
import { dangerouslyDeleteByTag } from "@vercel/functions";
import { revalidatePath } from "next/cache";
import { EMBED_CACHE_TAG } from "@/lib/stress";

// Rebuilds the pages that show the live AI Stress Index as soon as a new reading is published, instead of
// waiting out their hourly cache (which let Home and /ai-stress-index show different days for up to an hour).
// Called by the "Update dashboard data" workflow in github.com/kkreddy79/ai-implosion once GitHub Pages serves
// the new docs/data.json, with `Authorization: Bearer <REVALIDATE_SECRET>`. The same value is set as
// REVALIDATE_SECRET on Vercel and as the KKRECKONS_REVALIDATE_SECRET secret in that repository.
// The embed card isn't a cached page but a response the CDN holds, so it's cleared by its cache tag instead:
// deleted rather than marked stale, so the next viewer gets the new reading, not the old one once more.

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
  await dangerouslyDeleteByTag(EMBED_CACHE_TAG);
  return json(200, { revalidated: [...PATHS, "/ai-stress-index/embed"] });
}
