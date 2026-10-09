import { editions, longDate, slugFor } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = editions
    .map((e) => {
      const url = `${SITE_URL}/daily/${slugFor(e.date)}`;
      const list = e.stories.map((s) => `<li>${esc(s.title)}</li>`).join("");
      const summary = `${e.slice ? `<p>${esc(e.slice)}</p>` : ""}<ul>${list}</ul>`;
      return `    <item>
      <title>${esc(`KKReckons, ${longDate(e.date)}`)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${e.date}T13:00:00Z`).toUTCString()}</pubDate>
      <description><![CDATA[${summary}]]></description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KKReckons</title>
    <link>${SITE_URL}</link>
    <description>Visual daily briefings on AI, markets, business, India and the world. Curated by KK Reddy.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
