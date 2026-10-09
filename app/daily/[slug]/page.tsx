import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditionView from "@/components/EditionView";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { editions, getEdition, longDate, shortDate, slugFor } from "@/lib/editions";

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
    description: edition.slice || edition.stories.map((s) => s.title).slice(0, 3).join(" · "),
  };
}

export default async function EditionPage({ params }: Props) {
  const found = getEdition((await params).slug);
  if (!found) notFound();
  const { edition, newer, older } = found;
  const content = getContent(edition.date);

  return (
    <main className="ev-wrap ev-page">
      <nav className="crumbs">
        <Link href="/daily/">Catch up</Link> <span>/</span> {longDate(edition.date)}
      </nav>

      <EditionView e={content} />

      <p className="ev-permalink">
        <a href={`/editions/${edition.date}.html`} target="_blank" rel="noreferrer">
          Original newsletter design ↗
        </a>
        {edition.artifact && (
          <>
            <span aria-hidden> · </span>
            <a href={edition.artifact} target="_blank" rel="noreferrer">
              Interactive version ↗
            </a>
          </>
        )}
      </p>

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
