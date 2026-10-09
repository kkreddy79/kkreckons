import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditionFrame from "@/components/EditionFrame";
import { editions, getEdition, longDate, sectionsOf, shortDate, slugFor } from "@/lib/editions";

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
    openGraph: { images: [`/covers/${edition.date}.jpg`] },
  };
}

export default async function EditionPage({ params }: Props) {
  const found = getEdition((await params).slug);
  if (!found) notFound();
  const { edition, newer, older } = found;

  return (
    <main className="container edition">
      <nav className="crumbs">
        <Link href="/daily/">Archive</Link> <span>/</span> {longDate(edition.date)}
      </nav>

      <header className="ed-head">
        <div>
          <div className="eyebrow">{longDate(edition.date)} · Curated by KK Reddy</div>
          <h1>{edition.slice || "The daily briefing"}</h1>
          <p className="ed-sub">
            {edition.stories.length} stories · {edition.readingMinutes} min read
          </p>
        </div>
        <div className="ed-actions">
          {edition.artifact && (
            <a className="button alt" href={edition.artifact} target="_blank" rel="noreferrer">
              Interactive version ↗
            </a>
          )}
          <a className="button alt" href={`/editions/${edition.date}.html`} target="_blank" rel="noreferrer">
            Full screen ↗
          </a>
        </div>
      </header>

      <div className="ed-layout">
        <aside className="toc">
          <div className="toc-inner">
            <div className="toc-title">In this edition</div>
            {sectionsOf(edition).map((sec) => (
              <div key={sec.name} className="toc-sec">
                <h3>{sec.name}</h3>
                <ol>
                  {sec.stories.map((s) => (
                    <li key={s.title}>
                      {s.category && <span className="cat">{s.category}</span>}
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer">
                          {s.title} <span className="ext">↗</span>
                        </a>
                      ) : (
                        <span>{s.title}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </aside>

        <div className="ed-main">
          <EditionFrame src={`/editions/${edition.date}.html`} title={`KKReckons, ${longDate(edition.date)}`} />
        </div>
      </div>

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
          <Link href={`/daily/${slugFor(newer.date)}`} className="pg next">
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
