import type { Metadata } from "next";
import { Suspense } from "react";
import ArchiveBrowser from "@/components/ArchiveBrowser";
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
    <main className="container">
      <section className="hero">
        <div className="eyebrow">Catch up</div>
        <h1>Missed a day? Catch up.</h1>
        <p>
          {editions.length} daily briefings, {totalStories} stories and {reading.length} further reading links, organised by
          date. Search across every headline or browse by theme.
        </p>
      </section>
      <Suspense>
        <ArchiveBrowser editions={editions} details={storyDetails()} reading={reading} />
      </Suspense>
      <SubscribeBox />
    </main>
  );
}
