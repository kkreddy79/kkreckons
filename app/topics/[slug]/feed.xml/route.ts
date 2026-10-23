import { slugFor } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";
import { TOPICS, topicBySlug, topicStories } from "@/lib/topics";

// One RSS feed per topic (/topics/<topic>/feed.xml): its latest 30 stories, each linking to the story's own page.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const topic = topicBySlug((await params).slug)!;
  const items = topicStories(topic.name)
    .slice(0, 30)
    .map(({ edition, story, full }) => {
      const url = `${SITE_URL}/daily/${slugFor(edition.date)}/${edition.stories.indexOf(story) + 1}`;
      const body = full ? `<p>${esc(full.why)}</p><ul>${full.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : "";
      return `<item>
<title>${esc(story.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<pubDate>${new Date(`${edition.date}T06:00:00Z`).toUTCString()}</pubDate>
<category>${esc(topic.name)}</category>
<description>${esc(body)}</description>
</item>`;
    })
    .join("\n");
  const self = `${SITE_URL}/topics/${topic.slug}/feed.xml`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>KKReckons · ${esc(topic.name)}</title>
<link>${SITE_URL}/topics/${topic.slug}</link>
<description>${esc(topic.blurb)}</description>
<language>en</language>
<atom:link href="${self}" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
