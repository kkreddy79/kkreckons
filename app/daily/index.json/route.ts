import { getContent } from "@/lib/content";
import { editions } from "@/lib/editions";
import type { ArchiveData } from "@/components/ArchiveBrowser";

export const dynamic = "force-static";

/**
 * /daily/index.json: every edition's stories (headline, links, publisher, topic), each story's second source link
 * and every further reading link: what Catch up's search, filters and story list work from. Kept out of the page
 * itself (it grows with every edition, and was sent twice: as HTML and as page data) and fetched when a reader
 * reaches for the search box or a filter; the list of editions is in the page and needs none of it.
 */
export function GET() {
  const links: ArchiveData["links"] = {};
  for (const e of editions) {
    for (const sec of getContent(e.date).sections) {
      for (const s of sec.stories) if (s.url2) links[`${e.date}|${s.title}`] = s.url2;
    }
  }
  const reading = editions.flatMap((e) => getContent(e.date).reading.map((r) => ({ date: e.date, ...r })));
  const out: ArchiveData = { editions, links, reading };
  return Response.json(out, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
