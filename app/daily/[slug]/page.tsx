import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditionView from "@/components/EditionView";
import JsonLd, { AUTHOR, PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
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
  return {
    title: longDate(edition.date),
    alternates: { canonical: `/daily/${slugFor(edition.date)}` },
    openGraph: { type: "article", publishedTime: edition.date },
    description:
      edition.slice ||
      edition.stories
        .map((s) => s.title)
        .slice(0, 3)
        .join(" · "),
  };
}

export default async function EditionPage({ params }: Props) {
  const found = getEdition((await params).slug);
  if (!found) notFound();
  const { edition, newer, older } = found;
  const content = getContent(edition.date);
  const url = `${SITE_URL}/daily/${slugFor(edition.date)}`;
  const image = edition.image ? new URL(edition.image, SITE_URL).href : `${SITE_URL}/about/two-worlds.jpg`;
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
      image: [image],
      author: AUTHOR,
      publisher: PUBLISHER,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Catch up", item: `${SITE_URL}/daily/` },
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

      <EditionView e={content} showDate={false} />
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
