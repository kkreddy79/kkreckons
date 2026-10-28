import type { Metadata } from "next";
import Link from "@/components/Link";
import Banner from "@/components/Banner";
import SubscribeBox from "@/components/SubscribeBox";
import Listen from "@/components/Listen";
import ShareRow from "@/components/ShareRow";
import { longDate } from "@/lib/editions";
import { TOPICS, topicStories } from "@/lib/topics";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Topics: AI, markets, India and more",
  description: "Every KKReckons story by topic: AI, markets, banking, India, jobs, geopolitics, personal finance, and health and science.",
  alternates: { canonical: "/topics" },
};

export default function Topics() {
  const topics = TOPICS.map((t) => ({ ...t, stories: topicStories(t.name) }));
  return (
    <main className="cu">
      <Banner />
      <div className="cu-wrap" id="tp-read">
        <section className="cu-hero" aria-labelledby="tp-title">
          <p className="ab-kicker">Topics</p>
          <h1 id="tp-title">Follow the stories you care about.</h1>
          <p className="cu-lede">Every story from every edition, grouped by topic, newest first.</p>
          <div className="ev-tools">
            <ShareRow url={`${SITE_URL}/topics`} slice="KKReckons topics: follow the stories you care about" />
            <Listen rootId="tp-read" minutes={Math.max(1, Math.round(topics.length * 0.3))} />
          </div>
        </section>
        <ul className="tp-grid">
          {topics.map((t) => (
            <li key={t.slug}>
              <Link href={`/topics/${t.slug}`}>
                <h2>
                  {t.name} <span>{t.stories.length}</span>
                </h2>
                <p>{t.blurb}</p>
                {t.stories[0] && (
                  <p className="tp-latest">
                    <b>Latest, {longDate(t.stories[0].edition.date)}:</b> {t.stories[0].story.title}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <p className="tp-more">
          Following a company or person? <Link href="/coverage">See who’s in the news →</Link>
        </p>
        <SubscribeBox />
      </div>
    </main>
  );
}
