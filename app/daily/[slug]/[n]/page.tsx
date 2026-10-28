import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryCard, storyPageUrl } from "@/components/EditionView";
import JsonLd, { AUTHOR, PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { relatedForStory } from "@/lib/related";
import { entitiesForStory } from "@/lib/entities";
import ReadTracker from "@/components/ReadTracker";
import { topicStories } from "@/lib/topics";
import { editions, getEdition, longDate, shortDate, slugFor, storyHref, themesOf } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";

// One story on its own page, so a shared story previews with its own headline and graphic.
// The full edition stays the main page: this one links back to the story's place in it.

export const dynamicParams = false;

export function generateStaticParams() {
  return editions.flatMap((e) => e.stories.map((_, i) => ({ slug: slugFor(e.date), n: String(i + 1) })));
}

type Props = { params: Promise<{ slug: string; n: string }> };

async function find(params: Props["params"]) {
  const { slug, n } = await params;
  const found = getEdition(slug);
  if (!found) return null;
  const stories = getContent(found.edition.date).sections.flatMap((sec) => sec.stories);
  const i = Number(n) - 1;
  if (!Number.isInteger(i) || !stories[i]) return null;
  return { edition: found.edition, stories, story: stories[i], n: i + 1 };
}

/** Cut at a word boundary so search snippets end cleanly. */
function clip(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(" ", max - 1)).replace(/[;,:·]$/, "").trim() + "…";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await find(params);
  if (!f) return {};
  const { edition, story, n } = f;
  const image = story.image
    ? { url: story.image, ...(story.imageW ? { width: story.imageW, height: story.imageH } : {}), alt: story.imageAlt || story.title }
    : { url: edition.cover || edition.image || "/about/two-worlds.jpg" };
  // The story's one quotable sentence (key figure, source and date) where it has one: what search results,
  // link previews and AI tools show. Otherwise "why it matters".
  const description = clip(story.cite || story.why || story.points[0] || edition.slice, 158);
  return {
    title: `${story.title} | ${shortDate(edition.date)} ${edition.date.slice(0, 4)}`,
    description,
    alternates: { canonical: `/daily/${slugFor(edition.date)}/${n}` },
    openGraph: { type: "article", publishedTime: edition.date, siteName: "KKReckons", title: story.title, description, images: [image] },
    twitter: { card: "summary_large_image", creator: "@kkreddy78", title: story.title, description, images: [image] },
  };
}

export default async function StoryPage({ params }: Props) {
  const f = await find(params);
  if (!f) notFound();
  const { edition, stories, story, n } = f;
  const editionUrl = `/daily/${slugFor(edition.date)}`;
  const url = storyPageUrl(edition.date, n);
  // Read next: stories that name the same companies or people, topped up with the latest from the same topic.
  const named = relatedForStory(edition.date, n);
  const theme = themesOf(edition.stories[n - 1])[0];
  const sameTopic = theme
    ? topicStories(theme)
        .filter((t) => t.edition.date !== edition.date)
        .map((t) => ({ date: t.edition.date, title: t.story.title, href: storyHref(t.edition, t.story).replace("#story-", "/") }))
    : [];
  const names = entitiesForStory(edition.date, n).slice(0, 4);
  const related = [...named, ...sameTopic.filter((t) => !named.some((r) => r.href === t.href))].slice(0, 3);
  return (
    <main className="ev-wrap ev-page st-page">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: story.title,
            description: story.cite || story.why || story.points[0] || "",
            datePublished: edition.date,
            dateModified: edition.date,
            url,
            mainEntityOfPage: url,
            isPartOf: `${SITE_URL}${editionUrl}`,
            ...(story.image ? { image: [new URL(story.image, SITE_URL).href] } : {}),
            author: AUTHOR,
            publisher: PUBLISHER,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Catch up", item: `${SITE_URL}/daily` },
              { "@type": "ListItem", position: 2, name: longDate(edition.date), item: `${SITE_URL}${editionUrl}` },
              { "@type": "ListItem", position: 3, name: story.title, item: url },
            ],
          },
        ]}
      />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/daily">Catch up</Link> <span>/</span> <Link href={editionUrl}>{longDate(edition.date)}</Link> <span>/</span> Story {n}
      </nav>
      <ReadTracker date={edition.date} story={n} />
      <div className="ev">
        <StoryCard s={story} n={n} wide full as="h1" priority id={`st-qs-${edition.date}-${n}`} date={edition.date} />
        <p className="st-more">
          <Link className="button" href={`${editionUrl}#story-${n}`}>
            Read the full {shortDate(edition.date)} edition →
          </Link>
          <Link className="button alt" href="/daily">
            Catch up on past editions
          </Link>
        </p>
        {names.length > 0 && (
          <p className="st-names">
            More on:
            {names.map((x) => (
              <Link key={x.slug} href={`/coverage/${x.slug}`} className="chip">
                {x.name} <span>{x.stories.length}</span>
              </Link>
            ))}
          </p>
        )}
        {related.length > 0 && (
          <section className="ev-related" aria-labelledby="st-rel-t">
            <h2 id="st-rel-t">Read next</h2>
            <ul>
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href}>
                    <small>{shortDate(r.date)}</small>
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {stories.length > 1 && (
          <nav className="st-list" aria-labelledby="st-list-t">
            <h2 id="st-list-t">Also in this edition</h2>
            <ol>
              {stories.map((s, i) =>
                i + 1 === n ? null : (
                  <li key={s.title}>
                    <Link href={`${editionUrl}/${i + 1}`}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {s.emailHead || s.title}
                    </Link>
                  </li>
                )
              )}
            </ol>
          </nav>
        )}
      </div>
      <SubscribeBox />
    </main>
  );
}
