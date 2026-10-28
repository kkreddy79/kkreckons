import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd, { AUTHOR, PUBLISHER } from "@/components/JsonLd";
import Listen from "@/components/Listen";
import ShareRow from "@/components/ShareRow";
import { SpecialCard } from "@/components/SpecialCards";
import SubscribeBox from "@/components/SubscribeBox";
import { SITE_URL } from "@/lib/site";
import { hosted, loadReport, SPECIAL, specialBySlug, wordCount } from "@/lib/special";

export const dynamicParams = false;
export const generateStaticParams = () => hosted().map((r) => ({ slug: r.slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = specialBySlug((await params).slug);
  if (!r?.file) return {};
  const image = r.cover ? { url: r.cover, width: 1600, height: 900, alt: r.cover_alt || r.title } : { url: "/about/two-worlds.jpg" };
  return {
    title: r.title,
    description: r.dek,
    alternates: { canonical: `/special/${r.slug}` },
    openGraph: { type: "article", publishedTime: r.date, siteName: "KKReckons", title: `${r.title} · KKReckons`, description: r.dek, images: [image] },
    twitter: { card: "summary_large_image", creator: "@kkreddy78", images: [image] },
  };
}

export default async function SpecialReportPage({ params }: Props) {
  const r = specialBySlug((await params).slug);
  if (!r?.file) notFound();
  const page = loadReport(r);
  const url = `${SITE_URL}/special/${r.slug}`;
  const more = SPECIAL.filter((x) => x.slug !== r.slug).slice(0, 3);
  return (
    <main className="sp">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: r.title,
            description: r.dek,
            articleSection: r.kicker,
            keywords: r.themes.join(", "),
            datePublished: r.date,
            dateModified: r.date,
            url,
            mainEntityOfPage: url,
            ...(r.cover ? { image: [{ "@type": "ImageObject", url: `${SITE_URL}${r.cover}`, width: 1600, height: 900 }] } : {}),
            author: { ...AUTHOR, alternateName: "KK Reddy" },
            publisher: PUBLISHER,
            isPartOf: { "@type": "CollectionPage", name: "KKReckons Special Reports", url: `${SITE_URL}/special` },
            wordCount: wordCount(page.text),
            timeRequired: `PT${r.reading_minutes}M`,
            isAccessibleForFree: true,
            citation: r.sources,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Special Reports", item: `${SITE_URL}/special` },
              { "@type": "ListItem", position: 2, name: r.title, item: url },
            ],
          },
        ]}
      />
      <div className="sp-wrap">
        <div className="sp-bar">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/special">Special Reports</Link> <span>/</span> {r.kicker}
          </nav>
          <div className="sp-tools">
            <Listen rootId="sp-report" minutes={r.reading_minutes} />
            <ShareRow url={url} slice={r.title} image={r.cover || undefined} compact />
          </div>
        </div>
      </div>

      {/* The report, as supplied, with its stylesheet scoped to this box (lib/special.ts). */}
      <article id="sp-report" className="sp-report" aria-label={r.title}>
        <style dangerouslySetInnerHTML={{ __html: page.css }} />
        <div dangerouslySetInnerHTML={{ __html: page.body }} />
        {page.scripts.map((s, i) => (
          <script key={i} dangerouslySetInnerHTML={{ __html: s }} />
        ))}
      </article>

      <div className="sp-wrap sp-end">
        {more.length > 0 && (
          <section className="sp-section sp-more" aria-labelledby="sp-more">
            <p className="sp-lab">More special reports</p>
            <h2 id="sp-more">Keep reading</h2>
            <ul className="sp-grid">
              {more.map((x) => (
                <SpecialCard key={x.slug} r={x} />
              ))}
            </ul>
            <p className="sp-foot">
              <Link href="/special">All special reports →</Link>
            </p>
          </section>
        )}
        <SubscribeBox />
      </div>
    </main>
  );
}
