import type { Metadata } from "next";
import Link from "next/link";
import JsonLd, { AUTHOR, PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import { SpecialCard, SpecialMeta, Skyline } from "@/components/SpecialCards";
import { SITE_URL, SUBSCRIBE_URL } from "@/lib/site";
import { SPECIAL, specialHref } from "@/lib/special";

const TITLE = "Special Reports: the long read, made easy to see";
const DESCRIPTION =
  "KKReckons special reports take one big story and stay with it: the documents, the numbers, the people affected and the strongest case against. Original graphics, every figure sourced.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · KKReckons` },
  description: DESCRIPTION,
  alternates: { canonical: "/special" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/special", ...(SPECIAL[0]?.cover ? { images: [{ url: SPECIAL[0].cover, width: 1600, height: 900, alt: SPECIAL[0].cover_alt || SPECIAL[0].title }] } : {}) },
  // Set with openGraph, or X previews fall back to the site-wide banner.
  twitter: { card: "summary_large_image", creator: "@kkreddy78", ...(SPECIAL[0]?.cover ? { images: [SPECIAL[0].cover] } : {}) },
};

const WHY = [
  ["One question, answered properly.", "Each report starts with the question you would ask a friend who knows the subject, and ends when it is answered."],
  ["Built from the source.", "We read the filing, the paper or the ruling itself, and link it, so you can check every number."],
  ["Drawn, not just written.", "Original graphics show scale honestly: bars to scale, before and after, who gains and who pays."],
  ["Always the other side.", "Every report has a section on what the evidence does not show and who disagrees."],
];

export default function SpecialHub() {
  const [featured, ...rest] = SPECIAL;
  return (
    <main className="sp">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `KKReckons Special Reports`,
          headline: TITLE,
          description: DESCRIPTION,
          url: `${SITE_URL}/special`,
          publisher: PUBLISHER,
          author: AUTHOR,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: SPECIAL.length,
            itemListElement: SPECIAL.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.title, url: `${SITE_URL}${specialHref(r)}` })),
          },
          hasPart: SPECIAL.map((r) => ({
            "@type": "Article",
            headline: r.title,
            description: r.dek,
            datePublished: r.date,
            url: `${SITE_URL}${specialHref(r)}`,
            author: AUTHOR,
            ...(r.cover ? { image: `${SITE_URL}${r.cover}` } : {}),
          })),
        }}
      />
      <section className="sp-hero" aria-labelledby="sp-title">
        <div className="sp-wrap">
          <p className="sp-lab">KKReckons Special Reports</p>
          <h1 id="sp-title">
            The long read, <em>made easy to see</em>
          </h1>
          <p className="sp-stand">
            The daily edition gives you the day in ten minutes. Special reports take one big story and stay with it: the documents, the numbers, the people affected and the strongest case against.
          </p>
        </div>
        <Skyline />
      </section>

      <div className="sp-wrap sp-end">
        {featured && (
          <Link href={specialHref(featured)} className="sp-feature">
            {featured.cover && <img src={featured.cover} alt={featured.cover_alt || ""} width={1600} height={900} fetchPriority="high" />}
            <span className="sp-feature-body">
              <span className="sp-lab sp-start">Start here · {featured.kicker}</span>
              <h2 id="sp-feat">{featured.title}</h2>
              <p>{featured.blurb || featured.dek}</p>
              <SpecialMeta r={featured} />
              <span className="sp-go">Read the report →</span>
            </span>
          </Link>
        )}

        {rest.length > 0 && (
          <section className="sp-section" aria-labelledby="sp-all">
            <p className="sp-lab">All reports</p>
            <h2 id="sp-all">Newest first</h2>
            <ul className="sp-grid">
              {rest.map((r) => (
                <SpecialCard key={r.slug} r={r} />
              ))}
            </ul>
          </section>
        )}

        <section className="sp-section" aria-labelledby="sp-why">
          <p className="sp-lab">Why read them</p>
          <h2 id="sp-why">Four promises, every report</h2>
          <ul className="sp-why">
            {WHY.map(([head, body]) => (
              <li key={head}>
                <b>{head}</b>
                {body}
              </li>
            ))}
          </ul>
          <p className="sp-honest">
            <span>
              <b>How we keep it honest</b>
              Figures come from primary documents and independent research, quoted in our own words. Company-reported numbers are labelled as company-reported. If we cannot confirm something, it is not in the report. No sponsored content, ever.
            </span>
          </p>
        </section>

        <p className="sp-foot">
          New special reports arrive in the daily edition first.{" "}
          <a href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
            Subscribe
          </a>{" "}
          to get them the morning they land.
        </p>
        <SubscribeBox />
      </div>
    </main>
  );
}
