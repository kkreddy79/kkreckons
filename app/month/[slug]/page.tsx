import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import Banner from "@/components/Banner";
import JsonLd, { PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import Listen from "@/components/Listen";
import ShareRow from "@/components/ShareRow";
import { shortDate, themeSlug, weekday } from "@/lib/editions";
import { monthBySlug, monthRoundup, months, monthSlug } from "@/lib/month";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => months.map((m) => ({ slug: monthSlug(m) }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const ym = monthBySlug((await params).slug);
  if (!ym) return {};
  const r = monthRoundup(ym);
  return {
    title: `Best of ${r.label}: ${r.picks.length} stories worth your time`,
    description: `The Pick of the day from each of KKReckons' ${r.days.length} briefings in ${r.label}: ${r.picks.map((p) => p.head).slice(0, 4).join(" · ")}`,
    alternates: { canonical: `/month/${monthSlug(ym)}` },
  };
}

export default async function Month({ params }: { params: Promise<{ slug: string }> }) {
  const ym = monthBySlug((await params).slug);
  if (!ym) notFound();
  const r = monthRoundup(ym);
  const i = months.indexOf(ym);
  const [newer, older] = [months[i - 1], months[i + 1]];
  const first = r.stress[0];
  const last = r.stress[r.stress.length - 1];
  const high = r.stress.reduce((a, b) => (b.score > a.score ? b : a), first);
  return (
    <main className="cu">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Best of ${r.label} · KKReckons`,
          url: `${SITE_URL}/month/${monthSlug(ym)}`,
          publisher: PUBLISHER,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: r.picks.map((p, n) => ({ "@type": "ListItem", position: n + 1, name: p.title, url: `${SITE_URL}${p.href}` })),
          },
        }}
      />
      <Banner />
      <div className="cu-wrap" id="mo-read">
        <section className="cu-hero" aria-labelledby="mo-title">
          <p className="ab-kicker">Monthly roundup · {r.label}</p>
          <h1 id="mo-title">Best of {r.label}.</h1>
          <p className="cu-lede">
            {r.days.length} briefings and {r.stories} stories, boiled down to the one story picked each day as most worth slowing down for.
          </p>
          <div className="ev-tools">
            <ShareRow url={`${SITE_URL}/month/${monthSlug(ym)}`} slice={`Best of ${r.label}: ${r.picks.length} stories worth your time`} />
            <Listen rootId="mo-read" minutes={Math.max(1, Math.round(r.picks.length * 0.4))} />
          </div>
        </section>

        <div className="mo-facts">
          {r.themes.length > 0 && (
            <section aria-labelledby="mo-themes">
              <h2 id="mo-themes">Covered most</h2>
              <p>
                {r.themes.slice(0, 5).map(([t, n]) => (
                  <Link key={t} href={`/topics/${themeSlug(t)}`} className="chip">
                    {t} <span>{n}</span>
                  </Link>
                ))}
              </p>
            </section>
          )}
          {r.stress.length > 1 && (
            <section aria-labelledby="mo-stress">
              <h2 id="mo-stress">AI Stress Index</h2>
              <p className="mo-line">
                {first.score} on {shortDate(first.date)} → <b>{last.score}</b> ({last.band}) on {shortDate(last.date)}. High of {high.score} on {shortDate(high.date)}.{" "}
                <Link href="/ai-stress-index">See the gauges →</Link>
              </p>
            </section>
          )}
        </div>

        <ol className="wk-list">
          {r.picks.map((p) => (
            <li key={p.href}>
              <Link href={p.href}>
                {p.thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumb} alt="" width={160} height={220} loading="lazy" decoding="async" />
                )}
                <span className="wk-body">
                  <small>
                    {weekday(p.date).slice(0, 3)} {shortDate(p.date)}
                  </small>
                  <b>{p.head}</b>
                  <span>{p.teaser}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <nav className="mo-nav" aria-label="Other months">
          {older ? <Link href={`/month/${monthSlug(older)}`}>← Best of {monthRoundup(older).label}</Link> : <span />}
          {newer && <Link href={`/month/${monthSlug(newer)}`}>Best of {monthRoundup(newer).label} →</Link>}
        </nav>
        <p className="tp-more">
          Want everything? <Link href="/daily">Catch up on every edition →</Link>
        </p>
        <SubscribeBox />
      </div>
    </main>
  );
}
