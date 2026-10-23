import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Banner from "@/components/Banner";
import JsonLd, { PUBLISHER } from "@/components/JsonLd";
import StorySource from "@/components/StorySource";
import SubscribeBox from "@/components/SubscribeBox";
import TopicNav from "@/components/TopicNav";
import { longDate, storyHref } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";
import { TOPICS, topicBySlug, topicStories } from "@/lib/topics";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = topicBySlug((await params).slug);
  if (!topic) return {};
  const n = topicStories(topic.name).length;
  return {
    title: `${topic.name} news, explained: ${n} stories`,
    description: `${topic.blurb} Every KKReckons ${topic.name} story, with why it matters and the other side.`,
    alternates: {
      canonical: `/topics/${topic.slug}`,
      types: { "application/rss+xml": [{ url: `/topics/${topic.slug}/feed.xml`, title: `KKReckons · ${topic.name}` }] },
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const topic = topicBySlug((await params).slug);
  if (!topic) notFound();
  const stories = topicStories(topic.name);
  const counts = Object.fromEntries(TOPICS.map((t) => [t.name, t.name === topic.name ? stories.length : topicStories(t.name).length]));
  const url = `${SITE_URL}/topics/${topic.slug}`;
  return (
    <main className="cu">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${topic.name} · KKReckons`,
          description: topic.blurb,
          url,
          publisher: PUBLISHER,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: stories.length,
            itemListElement: stories.slice(0, 20).map(({ edition, story }, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: story.title,
              url: `${SITE_URL}${storyHref(edition, story)}`,
            })),
          },
        }}
      />
      <Banner />
      <div className="cu-wrap">
        <section className="cu-hero" aria-labelledby="tp-title">
          <p className="ab-kicker">
            <Link href="/topics">Topics</Link>
          </p>
          <h1 id="tp-title">{topic.name}</h1>
          <p className="cu-lede">{topic.blurb}</p>
          <ul className="cu-stats" aria-label="On this page">
            <li>
              <b>{stories.length}</b> stories
            </li>
            {stories[0] && (
              <li>
                latest <b>{longDate(stories[0].edition.date).replace(/^\w+, /, "")}</b>
              </li>
            )}
          </ul>
        </section>
        <TopicNav current={topic.slug} counts={counts} />
        <section className="story-results tp-results">
          <ul>
            {stories.map(({ edition, story, full }, i) => (
              <li key={edition.date + story.title}>
                <Link href={storyHref(edition, story)} className="sr-date">
                  {longDate(edition.date)}
                </Link>
                <div className="sr-title">
                  {story.category && <span className="cat">{story.category}</span>}
                  {story.tag && <span className="tag">{story.tag}</span>}
                  <h2>
                    <Link href={storyHref(edition, story)}>{story.title}</Link>
                  </h2>
                  {full?.why && (
                    <p className="tp-why">
                      <b>Why it matters:</b> {full.why}
                    </p>
                  )}
                </div>
                {full && (
                  <div className="sr-src">
                    <StorySource s={{ ...full, src: story.src ?? full.src, pay: story.pay ?? full.pay }} id={`tp-qs-${edition.date}-${i}`} summary={false} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
        <p className="tp-more">
          Want to narrow it down? <Link href={`/daily/?theme=${encodeURIComponent(topic.name)}`}>Search {topic.name} stories in Catch up →</Link>
          {" · "}
          <a href={`/topics/${topic.slug}/feed.xml`}>RSS feed for {topic.name}</a>
        </p>
        <SubscribeBox />
      </div>
    </main>
  );
}
