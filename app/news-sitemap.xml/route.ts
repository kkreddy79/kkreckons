import { editions, longDate, slugFor } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Google News sitemap: editions from the last two days (Google's limit), rebuilt on every publish. */
export function GET() {
  const cutoff = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
  const recent = editions.filter((e) => e.date >= cutoff);
  const urls = recent
    .map(
      (e) => `<url>
<loc>${SITE_URL}/daily/${slugFor(e.date)}</loc>
<news:news>
<news:publication><news:name>KKReckons</news:name><news:language>en</news:language></news:publication>
<news:publication_date>${e.date}</news:publication_date>
<news:title>${esc(e.slice || longDate(e.date))}</news:title>
</news:news>
</url>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
