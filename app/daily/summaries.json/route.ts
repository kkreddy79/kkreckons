import { getContent } from "@/lib/content";
import { editions } from "@/lib/editions";
import type { StorySummaries } from "@/components/ArchiveBrowser";

export const dynamic = "force-static";

/**
 * /daily/summaries.json: each story's first three points and "why it matters", keyed by "date|title", for the
 * quick summaries in Catch up's story list. Kept out of the page itself (it grows with every edition) and
 * fetched only when a reader opens that list; search and filters don't need it.
 */
export function GET() {
  const out: StorySummaries = {};
  for (const e of editions) {
    for (const sec of getContent(e.date).sections) {
      for (const s of sec.stories) out[`${e.date}|${s.title}`] = { points: s.points.slice(0, 3), why: s.why };
    }
  }
  return Response.json(out, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
