import { editions, latest, longDate, slugFor } from "@/lib/editions";
import { PROFILES, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** /llms.txt: a short guide to the site for AI assistants and search tools (llmstxt.org format). */
export function GET() {
  const recent = editions.slice(0, 14);
  const body = `# KKReckons

> A free daily visual briefing on AI, markets, business, India and the world, curated by Krishnakanth Reddy (LinkedIn: ${PROFILES.linkedin}). Each edition has about seven stories, each with a source link, summary points, key numbers, "why it matters" and the other side.

Editions are published at ${SITE_URL}/daily/<month>-<day>-<year> (for example ${SITE_URL}/daily/${slugFor(latest.date)}). Every story links to its original source; summaries are written in KKReckons' own words.

## Key pages

- [Latest edition: ${longDate(latest.date)}](${SITE_URL}/daily/${slugFor(latest.date)}): ${latest.slice}
- [All past editions](${SITE_URL}/daily): searchable archive of every edition and story
- [AI Market Stress Index](${SITE_URL}/ai-stress-index): an experimental daily 0–100 composite stress score for AI equities, AI financing and credit markets (six of nine gauges are broad-market proxies). A monitoring dashboard, not a probability or forecast. Full methodology, sources and backtest with misses and false alarms ([how it works](${SITE_URL}/ai-stress-index#methodology); live data as JSON: ${SITE_URL}/ai-stress-index/data.json)
- [About](${SITE_URL}/about): who curates KKReckons
- [Editorial standards & corrections](${SITE_URL}/standards): labels, sourcing, image rights and how errors are corrected
- [Contact](${SITE_URL}/contact)
- [RSS feed](${SITE_URL}/feed.xml)

## Recent editions

${recent.map((e) => `- [${longDate(e.date)}](${SITE_URL}/daily/${slugFor(e.date)}): ${e.slice}`).join("\n")}

## Optional

- [Privacy](${SITE_URL}/privacy)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
