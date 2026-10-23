import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditionView from "@/components/EditionView";
import JsonLd, { AUTHOR, PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { relatedFor } from "@/lib/related";
import { editions, getEdition, longDate, shortDate, slugFor } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return editions.map((e) => ({ slug: slugFor(e.date) }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = getEdition((await params).slug);
  if (!found) return {};
  const { edition } = found;
  // The 1600×900 cover (when the edition has one) is the share and Discover image; older editions
  // fall back to their first story graphic.
  const share = edition.cover
    ? { url: edition.cover, width: 1600, height: 900, alt: edition.coverAlt || edition.slice }
    : { url: edition.image || "/about/two-worlds.jpg" };
  // Search results show the lead story's own headline (what people search for), then the date; shared
  // links keep KK's headline for the day (slice), which reads well in a feed but says little in search.
  const day = `${shortDate(edition.date)} ${edition.date.slice(0, 4)}`;
  const lead = edition.stories[0]?.title;
  const more = edition.stories.length - 1;
  const title = edition.slice ? `${edition.slice} | ${day}` : longDate(edition.date);
  const searchTitle = lead ? `${lead}${more > 0 ? ` + ${more} more` : ""} | ${day}` : title;
  const heads = edition.stories.map((s) => s.title).join(" · ");
  const description = clip(`KKReckons briefing for ${longDate(edition.date)}: ${heads}`, 158);
  return {
    title: searchTitle,
    alternates: { canonical: `/daily/${slugFor(edition.date)}` },
    // Setting openGraph here replaces the site-wide one, so the share image must be repeated.
    openGraph: {
      type: "article",
      publishedTime: edition.date,
      siteName: "KKReckons",
      title: `${title} · KKReckons`,
      images: [share],
    },
    twitter: { card: "summary_large_image", creator: "@kkreddy78", images: [share] },
    description,
  };
}

/** Cut at a word boundary so search snippets end cleanly. */
function clip(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(" ", max - 1)).replace(/[;,:·]$/, "").trim() + "…";
}

export default async function EditionPage({ params }: Props) {
  const found = getEdition((await params).slug);
  if (!found) notFound();
  const { edition, newer, older } = found;
  const content = getContent(edition.date);
  // The latest earlier edition with a saved AI Stress Index reading, to flag a move into a new band.
  const prevStressScore = editions.filter((x) => x.date < edition.date).map((x) => getContent(x.date).stressIndex).find(Boolean)?.score ?? null;
  const url = `${SITE_URL}/daily/${slugFor(edition.date)}`;
  const image = edition.image ? new URL(edition.image, SITE_URL).href : `${SITE_URL}/about/two-worlds.jpg`;
  // Cover first: Google picks the article's preview image from this list.
  const images = edition.cover
    ? [{ "@type": "ImageObject", url: new URL(edition.cover, SITE_URL).href, width: 1600, height: 900 }, image]
    : [image];
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: edition.slice || `KKReckons briefing, ${longDate(edition.date)}`,
      description: edition.stories.map((s) => s.title).slice(0, 3).join(" · "),
      datePublished: edition.date,
      dateModified: edition.date,
      url,
      mainEntityOfPage: url,
      image: images,
      author: AUTHOR,
      publisher: PUBLISHER,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Catch up", item: `${SITE_URL}/daily` },
        { "@type": "ListItem", position: 2, name: longDate(edition.date), item: url },
      ],
    },
  ];

  return (
    <main className="ev-wrap ev-page">
      <JsonLd data={ld} />
      <nav className="crumbs">
        <Link href="/daily/">Catch up</Link> <span>/</span> {longDate(edition.date)}
      </nav>

      <EditionView e={content} showDate={false} related={relatedFor(edition.date)} prevStressScore={prevStressScore} />
      <SubscribeBox />

      <nav className="pager">
        {older ? (
          <Link href={`/daily/${slugFor(older.date)}`} className="pg prev">
            <span>← Previous</span>
            <b>{shortDate(older.date)}</b>
            {older.slice && <em>{older.slice}</em>}
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link href={newer === editions[0] ? "/" : `/daily/${slugFor(newer.date)}`} className="pg next">
            <span>Next →</span>
            <b>{shortDate(newer.date)}</b>
            {newer.slice && <em>{newer.slice}</em>}
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
