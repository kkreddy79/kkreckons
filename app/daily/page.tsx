import type { Metadata } from "next";
import ArchiveBrowser from "@/components/ArchiveBrowser";
import Banner from "@/components/Banner";
import JsonLd, { PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { editions, longDate, monthLabel, slugFor, themesOf, THEMES, totalStories } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";
import type { ArchiveMonth } from "@/components/ArchiveBrowser";

/** The list of editions by month, with only what a row shows: the stories behind the search load from /daily/index.json. */
function timeline(): ArchiveMonth[] {
  const out: ArchiveMonth[] = [];
  for (const e of editions) {
    const label = monthLabel(e.date);
    const item = { date: e.date, slice: e.slice, heads: e.stories.slice(0, 4).map((s) => s.title).join(" · "), stories: e.stories.length, readingMinutes: e.readingMinutes };
    const last = out[out.length - 1];
    if (last?.label === label) last.items.push(item);
    else out.push({ label, items: [item] });
  }
  return out;
}

export const metadata: Metadata = {
  title: "Catch up: every daily briefing",
  description: "Missed a day? Every KKReckons edition, organised by date, with searchable headlines.",
  alternates: { canonical: "/daily" },
};

export default function Archive() {
  const reading = editions.reduce((n, e) => n + getContent(e.date).reading.length, 0);
  const stories = editions.flatMap((e) => e.stories);
  const themeCounts = Object.fromEntries(THEMES.map((t) => [t.name, stories.filter((s) => themesOf(s).includes(t.name)).length]));
  return (
    <main className="cu">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Catch up: every daily briefing · KKReckons",
          description: metadata.description,
          url: `${SITE_URL}/daily`,
          publisher: PUBLISHER,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: editions.length,
            itemListElement: editions.map((e, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: longDate(e.date),
              url: `${SITE_URL}/daily/${slugFor(e.date)}`,
            })),
          },
        }}
      />
      <Banner slim />
      <div className="cu-wrap">
        <section className="cu-hero" aria-labelledby="cu-title">
          <p className="ab-kicker">The archive</p>
          <h1 id="cu-title">Missed a day? It’s all here.</h1>
          <p className="cu-lede">Search every headline, browse by theme or source, or open any day’s briefing.</p>
          <ul className="cu-stats" aria-label="In the archive">
            <li>
              <b>{editions.length}</b> daily briefings
            </li>
            <li>
              <b>{totalStories}</b> stories
            </li>
            <li>
              <b>{reading}</b> further reading links
            </li>
          </ul>
        </section>
        <ArchiveBrowser months={timeline()} themeCounts={themeCounts} totals={{ stories: totalStories, reading }} />
        <SubscribeBox />
      </div>
    </main>
  );
}
