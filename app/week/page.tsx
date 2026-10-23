import type { Metadata } from "next";
import Link from "next/link";
import Banner from "@/components/Banner";
import JsonLd, { PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import { shortDate, weekday } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";
import { thisWeek } from "@/lib/week";

const week = thisWeek();
const range = `${shortDate(week.start)}–${shortDate(week.end)}`;

export const metadata: Metadata = {
  title: `The week in ${week.picks.length} stories, ${range}`,
  description: `KKReckons' best stories of the week (${range}): ${week.picks.map((p) => p.head).slice(0, 4).join(" · ")}`,
  alternates: { canonical: "/week" },
};

export default function Week() {
  return (
    <main className="cu">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `The week in ${week.picks.length} stories · KKReckons`,
          url: `${SITE_URL}/week`,
          publisher: PUBLISHER,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: week.picks.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: `${SITE_URL}${p.href}` })),
          },
        }}
      />
      <Banner />
      <div className="cu-wrap">
        <section className="cu-hero" aria-labelledby="wk-title">
          <p className="ab-kicker">This week · {range}</p>
          <h1 id="wk-title">The week in {week.picks.length} stories.</h1>
          <p className="cu-lede">
            The best of {week.editions} daily briefings, one or two from each day and no more than one per topic. Short on time? Start here.
          </p>
        </section>
        <ol className="wk-list">
          {week.picks.map((p) => (
            <li key={p.href}>
              <Link href={p.href}>
                {p.thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumb} alt="" width={160} height={220} loading="lazy" decoding="async" />
                )}
                <span className="wk-body">
                  <small>
                    {weekday(p.date).slice(0, 3)} {shortDate(p.date)} · {p.topic}
                    {p.pick && <em>Pick of the day</em>}
                  </small>
                  <b>{p.head}</b>
                  <span>{p.teaser}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="tp-more">
          Want everything? <Link href="/daily/">Catch up on every edition →</Link>
        </p>
        <SubscribeBox />
      </div>
    </main>
  );
}
