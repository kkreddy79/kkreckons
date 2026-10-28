import type { Metadata } from "next";
import { figVariant, webpSrcSet } from "@/lib/figs";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import SubscribeBox from "@/components/SubscribeBox";
import Listen from "@/components/Listen";
import ShareRow from "@/components/ShareRow";
import { getContent, type FullStory } from "@/lib/content";
import { editions, getEdition, longDate, shortDate, slugFor } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";

// The day in cards: every story's explainer graphic in one grid, for a read in a few seconds.
// Each card opens full size in the lightbox; its headline links to the story's own page.

export const dynamicParams = false;

/** Editions with at least two graphics: one card is not a summary. */
const withCards = (date: string) => getContent(date).sections.flatMap((sec) => sec.stories).filter((s) => s.image).length >= 2;

export function generateStaticParams() {
  return editions.filter((e) => withCards(e.date)).map((e) => ({ slug: slugFor(e.date) }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = getEdition((await params).slug);
  if (!found) return {};
  const { edition } = found;
  const day = `${shortDate(edition.date)} ${edition.date.slice(0, 4)}`;
  const share = edition.cover ? { url: edition.cover, width: 1600, height: 900 } : { url: edition.image || "/about/two-worlds.jpg" };
  return {
    title: `The day in cards | ${day}`,
    description: `Every KKReckons story for ${longDate(edition.date)} as one explainer card each: the number, the takeaway and the other side.`,
    alternates: { canonical: `/daily/${slugFor(edition.date)}/cards` },
    openGraph: { type: "article", publishedTime: edition.date, siteName: "KKReckons", title: `${edition.slice || longDate(edition.date)}: the day in cards`, images: [share] },
    twitter: { card: "summary_large_image", creator: "@kkreddy78", images: [share] },
  };
}

/** The card image, served as WebP at the width the grid needs (same files the edition page uses). */
function CardImage({ s, eager }: { s: FullStory; eager: boolean }) {
  const loading = eager ? "eager" : "lazy";
  if (!s.imageW) return <img src={s.image} alt={s.imageAlt || s.title} loading={loading} decoding="async" />;
  const srcSet = webpSrcSet(s.image!, s.imageW);
  return (
    <picture>
      <source type="image/webp" srcSet={srcSet} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 520px" />
      <img src={s.image} alt={s.imageAlt || s.title} width={s.imageW} height={s.imageH} loading={loading} decoding="async" />
    </picture>
  );
}

export default async function CardsPage({ params }: Props) {
  const found = getEdition((await params).slug);
  if (!found) notFound();
  const { edition } = found;
  const editionUrl = `/daily/${slugFor(edition.date)}`;
  const stories = getContent(edition.date).sections.flatMap((sec) => sec.stories);
  const cards = stories.map((s, i) => ({ s, n: i + 1 })).filter(({ s }) => s.image);
  return (
    <main className="ev-wrap ev-page">
      {/* Where the cards sit, with Listen and Share on the same line (as on story pages and special reports). */}
      <div className="st-bar">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/daily">Catch up</Link> <span>/</span> <Link href={editionUrl}>{longDate(edition.date)}</Link> <span>/</span> Cards
        </nav>
        <div className="ev-tools st-tools">
          {/* Listen reads the heading, the line under it and each card's headline. */}
          <Listen rootId="cards-read" minutes={1} />
          <ShareRow url={`${SITE_URL}${editionUrl}/cards`} slice={`${edition.slice || longDate(edition.date)}: the day in cards`} image={edition.cover || undefined} compact />
        </div>
      </div>
      <div id="cards-read">
        <header className="cards-head">
          <h1>The day in {cards.length} cards</h1>
          <p>
            {edition.slice && <>{edition.slice.replace(/[.\s]+$/, "")}. </>}Tap a card to see it full size, or a headline for the whole story.
          </p>
        </header>
        <ol className="cards-grid">
          {cards.map(({ s, n }, i) => (
            <li key={n} className="cards-item">
              <a href={s.image} target="_blank" rel="noreferrer" className="cards-fig" data-lightbox={s.imageAlt || s.title} data-lightbox-src={s.imageW ? figVariant(s.image!, "lg") : undefined} aria-label={`Open the card for “${s.title}” full size`}>
                <CardImage s={s} eager={i < 2} />
              </a>
              <Link href={`${editionUrl}/${n}`} className="cards-title">
                <span className="cards-n">{String(n).padStart(2, "0")}</span>
                {s.emailHead || s.title}
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <p className="st-more">
        <Link className="button" href={editionUrl}>
          Read the full {shortDate(edition.date)} edition →
        </Link>
        <Link className="button alt" href="/daily">
          Catch up on past editions
        </Link>
      </p>
      <SubscribeBox />
    </main>
  );
}
