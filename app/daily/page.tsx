import type { Metadata } from "next";
import { Suspense } from "react";
import ArchiveBrowser from "@/components/ArchiveBrowser";
import { editions, totalStories } from "@/lib/editions";

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
          {editions.length} daily briefings and {totalStories} stories, organised by date. Search across every
          headline or browse by theme.
        </p>
      </section>
      <Suspense>
        <ArchiveBrowser editions={editions} />
      </Suspense>
    </main>
  );
}
