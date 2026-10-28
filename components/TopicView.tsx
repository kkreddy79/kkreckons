import Link from "@/components/Link";
import Banner from "@/components/Banner";
import JsonLd, { PUBLISHER } from "@/components/JsonLd";
import StorySource from "@/components/StorySource";
import SubscribeBox from "@/components/SubscribeBox";
import TopicNav from "@/components/TopicNav";
import { longDate, storyHref, storyPageHref } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";
import { TOPICS, TOPIC_PAGE_SIZE, topicHref, topicPageCount, topicStories } from "@/lib/topics";

type Topic = (typeof TOPICS)[number];

/** One page of a topic's stories, newest first (page 1 at /topics/<slug>, then /topics/<slug>/page/<n>). */
export default function TopicView({ topic, page }: { topic: Topic; page: number }) {
  const all = topicStories(topic.name);
  const pages = topicPageCount(topic.name);
  const first = (page - 1) * TOPIC_PAGE_SIZE;
  const stories = all.slice(first, first + TOPIC_PAGE_SIZE);
  const counts = Object.fromEntries(TOPICS.map((t) => [t.name, t.name === topic.name ? all.length : topicStories(t.name).length]));
  const url = `${SITE_URL}${topicHref(topic.slug, page)}`;
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
            numberOfItems: all.length,
            itemListElement: stories.slice(0, 20).map(({ edition, story }, i) => ({
              "@type": "ListItem",
              position: first + i + 1,
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
          <h1 id="tp-title">
            {topic.name}
            {page > 1 && <span className="tp-page"> · page {page}</span>}
          </h1>
          <p className="cu-lede">{topic.blurb}</p>
          <ul className="cu-stats" aria-label="On this page">
            <li>
              <b>{all.length}</b> stories
            </li>
            {all[0] && (
              <li>
                latest <b>{longDate(all[0].edition.date).replace(/^\w+, /, "")}</b>
              </li>
            )}
            {pages > 1 && (
              <li>
                page <b>{page}</b> of {pages}
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
                    {/* "Why it matters" is already shown above, so the Quick summary leaves it out. */}
                    <StorySource
                      s={{ ...full, why: "", src: story.src ?? full.src, pay: story.pay ?? full.pay }}
                      id={`tp-qs-${edition.date}-${first + i}`}
                      explainer={storyPageHref(edition, story)}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
        {pages > 1 && (
          <nav className="pager" aria-label={`${topic.name} pages`}>
            {page > 1 ? (
              <Link href={topicHref(topic.slug, page - 1)} className="pg prev" prefetch={false}>
                <span>← Newer stories</span>
                <b>Page {page - 1}</b>
              </Link>
            ) : (
              <span />
            )}
            {page < pages ? (
              <Link href={topicHref(topic.slug, page + 1)} className="pg next" prefetch={false}>
                <span>Older stories →</span>
                <b>Page {page + 1}</b>
                <em>of {pages}</em>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
        <p className="tp-more">
          Want to narrow it down? <Link href={`/daily?theme=${encodeURIComponent(topic.name)}`}>Search {topic.name} stories in Catch up →</Link>
          {" · "}
          <a href={`/topics/${topic.slug}/feed.xml`}>RSS feed for {topic.name}</a>
        </p>
        <SubscribeBox />
      </div>
    </main>
  );
}
