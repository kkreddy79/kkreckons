import type { Metadata } from "next";
import ArchiveBrowser from "@/components/ArchiveBrowser";
import Banner from "@/components/Banner";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { editions, totalStories } from "@/lib/editions";
import type { ReadingLink, StoryDetails } from "@/components/ArchiveBrowser";

/** Source links and summary points for each story, keyed by "date|title". */
function storyDetails(): StoryDetails {
  const out: StoryDetails = {};
  for (const e of editions) {
    for (const sec of getContent(e.date).sections) {
      for (const s of sec.stories) {
        out[`${e.date}|${s.title}`] = { url2: s.url2, points: s.points.slice(0, 3), why: s.why };
      }
    }
  }
  return out;
}

/** Every edition's further reading links, newest first. */
function readingLinks(): ReadingLink[] {
  return editions.flatMap((e) => getContent(e.date).reading.map((r) => ({ date: e.date, ...r })));
}

export const metadata: Metadata = {
  title: "Catch up",
  description: "Missed a day? Every KKReckons edition, organised by date, with searchable headlines.",
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
        <ArchiveBrowser editions={editions} details={storyDetails()} reading={reading} />
        <SubscribeBox />
      </div>
    </main>
  );
}
