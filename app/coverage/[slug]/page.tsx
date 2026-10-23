import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Banner from "@/components/Banner";
import JsonLd, { PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import { entities, entityBySlug } from "@/lib/entities";
import { longDate } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => entities().map((x) => ({ slug: x.slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const x = entityBySlug((await params).slug);
  if (!x) return {};
  return {
    title: `${x.name} news, explained: ${x.stories.length} stories`,
    description: `${x.about} Every KKReckons story on ${x.name}, with why it matters.`,
    alternates: { canonical: `/coverage/${x.slug}` },
  };
}

export default async function Coverage({ params }: Props) {
  const x = entityBySlug((await params).slug);
  if (!x) notFound();
  const stories = [...x.stories].sort((a, b) => b.date.localeCompare(a.date) || a.n - b.n);
  const others = entities().filter((o) => o.slug !== x.slug);
  return (
    <main className="cu">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${x.name} · KKReckons`,
          description: x.about,
          url: `${SITE_URL}/coverage/${x.slug}`,
          publisher: PUBLISHER,
          about: { "@type": x.kind === "Person" ? "Person" : "Organization", name: x.name },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: stories.length,
            itemListElement: stories.slice(0, 20).map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title, url: `${SITE_URL}${s.href}` })),
          },
        }}
      />
      <Banner />
      <div className="cu-wrap">
        <section className="cu-hero" aria-labelledby="cv-title">
          <p className="ab-kicker">
            <Link href="/coverage">In the news</Link> · {x.kind}
          </p>
          <h1 id="cv-title">{x.name}</h1>
          <p className="cu-lede">{x.about}</p>
          <ul className="cu-stats" aria-label="On this page">
            <li>
              <b>{stories.length}</b> stories
            </li>
            <li>
              latest <b>{longDate(stories[0].date).replace(/^\w+, /, "")}</b>
            </li>
          </ul>
        </section>
        <section className="story-results tp-results">
          <ul>
            {stories.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="sr-date">
                  {longDate(s.date)}
                </Link>
                <div className="sr-title">
                  <h2>
                    <Link href={s.href}>{s.title}</Link>
                  </h2>
                  {s.why && (
                    <p className="tp-why">
                      <b>Why it matters:</b> {s.why}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
        <nav className="cv-others" aria-label="Other names in the news">
          <h2>Also in the news</h2>
          <p>
            {others.map((o) => (
              <Link key={o.slug} href={`/coverage/${o.slug}`} className="chip">
                {o.name} <span>{o.stories.length}</span>
              </Link>
            ))}
          </p>
        </nav>
        <SubscribeBox />
      </div>
    </main>
  );
}
