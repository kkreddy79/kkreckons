import type { Metadata } from "next";
import ArchiveBrowser from "@/components/ArchiveBrowser";
import Banner from "@/components/Banner";
import SubscribeBox from "@/components/SubscribeBox";
import TopicNav from "@/components/TopicNav";
import { getContent } from "@/lib/content";
import { editions, totalStories } from "@/lib/editions";
import { TOPICS, topicStories } from "@/lib/topics";
import type { ReadingLink, StoryLinks } from "@/components/ArchiveBrowser";

/** Each story's second source link, keyed by "date|title" (it names a publisher, so search and filters need it).
 *  The summaries load separately, from /daily/summaries.json. */
function storyLinks(): StoryLinks {
  const out: StoryLinks = {};
  for (const e of editions) {
    for (const sec of getContent(e.date).sections) {
      for (const s of sec.stories) if (s.url2) out[`${e.date}|${s.title}`] = s.url2;
    }
  }
  return out;
}

/** Every edition's further reading links, newest first. */
function readingLinks(): ReadingLink[] {
  return editions.flatMap((e) => getContent(e.date).reading.map((r) => ({ date: e.date, ...r })));
}

export const metadata: Metadata = {
  title: "Catch up: every daily briefing",
  description: "Missed a day? Every KKReckons edition, organised by date, with searchable headlines.",
  alternates: { canonical: "/daily" },
};

export default function Archive() {
  const reading = readingLinks();
  return (
    <main className="cu">
      <Banner />
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
              <b>{reading.length}</b> further reading links
            </li>
          </ul>
        </section>
        <section className="tp-browse" aria-labelledby="tp-browse-t">
          <h2 id="tp-browse-t">Browse by topic</h2>
          <TopicNav counts={Object.fromEntries(TOPICS.map((t) => [t.name, topicStories(t.name).length]))} />
        </section>
        <ArchiveBrowser editions={editions} links={storyLinks()} reading={reading} />
        <SubscribeBox />
      </div>
    </main>
  );
}
