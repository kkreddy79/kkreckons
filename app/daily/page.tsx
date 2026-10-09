import type { Metadata } from "next";
import { Suspense } from "react";
import ArchiveBrowser from "@/components/ArchiveBrowser";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { editions, totalStories } from "@/lib/editions";
import type { StoryDetails } from "@/components/ArchiveBrowser";

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

export const metadata: Metadata = {
  title: "Catch up",
  description: "Missed a day? Every KKReckons edition, organised by date, with searchable headlines.",
};

export default function Archive() {
  return (
    <main className="container">
      <section className="hero">
        <div className="eyebrow">Catch up</div>
        <h1>Missed a day? Catch up.</h1>
        <p>
          {editions.length} daily briefings and {totalStories} stories, organised by date. Search across every headline
          or browse by theme.
        </p>
      </section>
      <Suspense>
        <ArchiveBrowser editions={editions} details={storyDetails()} />
      </Suspense>
      <SubscribeBox />
    </main>
  );
}
