import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Banner from "@/components/Banner";
import JsonLd, { PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import Listen from "@/components/Listen";
import ShareRow from "@/components/ShareRow";
import { monthLabel, shortDate, weekday } from "@/lib/editions";
import { months, monthSlug } from "@/lib/month";
import { SITE_URL } from "@/lib/site";
import { marketsWeek, stressWeek, thisWeek, watchWeek, weeklyExtras } from "@/lib/week";
import { marketMove, marketValue, SHORT } from "@/components/MarketStrip";

const week = thisWeek();
const range = `${shortDate(week.start)}–${shortDate(week.end)}`;
// With a weekly file (data/weekly/<date>.json) the page is a numbered issue; without one, just the list.
const extras = weeklyExtras(week.start, week.end);
const stress = stressWeek(week.days);
const markets = marketsWeek(week.days);
const watch = watchWeek(week.start, week.end);
const STATE_LABEL = { met: "Met", partly: "Partly met", "not-met": "Not met" } as const;

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
      <div className="cu-wrap" id="wk-read">
        <section className="cu-hero" aria-labelledby="wk-title">
          <p className="ab-kicker">This week · {range}</p>
          <h1 id="wk-title">The week in {week.picks.length} stories.</h1>
          <p className="cu-lede">
            The best of {week.editions} daily briefings, one or two from each day and no more than one per topic. Short on time? Start here.
          </p>
          <div className="ev-tools">
            <ShareRow url={`${SITE_URL}/week`} slice={`The week in ${week.picks.length} stories, ${range}`} />
            <Listen rootId="wk-read" minutes={Math.max(1, Math.round(week.picks.length * 0.4))} />
          </div>
        </section>
        {extras ? <Issue list={<List />} /> : <List />}
        <p className="tp-more">
          Test yourself: <Link href="/quiz">take the weekly quiz →</Link> · Looking further back? <Link href={`/month/${monthSlug(months[0])}`}>Best of {monthLabel(`${months[0]}-01`)} →</Link> ·{" "}
          Want everything? <Link href="/daily">Catch up on every edition →</Link>
        </p>
        <SubscribeBox />
      </div>
    </main>
  );
}

function List() {
  return (
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
  );
}

/** "Up 5 from 27 (19 Oct)" */
function stressMove(s: NonNullable<typeof stress>) {
  if (s.from == null) return "";
  return s.to === s.from ? ", unchanged on the week" : `, ${s.to > s.from ? "up" : "down"} from ${s.from} on ${shortDate(s.fromDate)}`;
}

/** The weekly issue: numbered sections, each only when it has something to show. */
function Issue({ list }: { list: ReactNode }) {
  const sections: [string, string, ReactNode][] = [];
  if (extras?.oneMinute) sections.push(["one-minute", "The week in one minute", <p className="wk-para">{extras.oneMinute}</p>]);
  sections.push(["best", `The best ${week.picks.length} stories`, list]);
  if (markets)
    sections.push([
      "markets",
      "Markets this week",
      <>
        <ul className="mk-list wk-mk">
          {markets.assets.map((a) => {
            const m = marketMove(a, a.week);
            return (
              <li key={a.id}>
                <span className="mk-name" title={a.name}>
                  {SHORT[a.id] ?? a.name}
                </span>
                <b className="mk-val">{marketValue(a)}</b>
                {m && (
                  <span className={`mk-chg mk-${m.dir}`}>
                    <span aria-hidden>{m.dir === "up" ? "▲" : m.dir === "down" ? "▼" : "■"} </span>
                    <span className="sr-only">Over the week, {m.words}. </span>
                    <span aria-hidden>{m.text} on the week</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="wk-note">Closes up to {shortDate(markets.asOf)}, against the close before the week&rsquo;s first edition. Yahoo Finance daily closes.</p>
      </>,
    ]);
  if (stress)
    sections.push([
      "stress",
      "AI Stress Index this week",
      <p className="wk-para">
        <b>
          {stress.to}/100, {stress.band}
        </b>{" "}
        at the {shortDate(stress.asOf)} close{stressMove(stress)}. <Link href="/ai-stress-index">See the gauges →</Link>
      </p>,
    ]);
  for (const t of watch)
    sections.push([
      "watching",
      "What we’re watching",
      <>
        <p className="wk-para">
          Thesis to test: <b>{t.thesis}</b>
        </p>
        <ul className="wk-watch">
          {t.conditions.map((c) => (
            <li key={c.id}>
              <span>{c.label}</span>
              <em className={`wk-state wk-${c.state}`}>
                {STATE_LABEL[c.state]}
                {c.changed && <> · changed {shortDate(c.since)}</>}
              </em>
            </li>
          ))}
        </ul>
        <p className="wk-note">
          <Link href="/ai-stress-index#watching">The evidence behind each mark →</Link>
        </p>
      </>,
    ]);
  if (extras?.history)
    sections.push([
      "history",
      "This week in history",
      <p className="wk-para">
        {extras.history.text}{" "}
        <a href={extras.history.url} target="_blank" rel="noreferrer">
          {extras.history.src} ↗
        </a>
      </p>,
    ]);
  if (extras?.andFinally)
    sections.push([
      "and-finally",
      "And finally",
      <p className="wk-para">
        {extras.andFinally.text}{" "}
        {extras.andFinally.url.startsWith("/") ? (
          <Link href={extras.andFinally.url}>Read it →</Link>
        ) : (
          <a href={extras.andFinally.url} target="_blank" rel="noreferrer">
            {extras.andFinally.src || "Read it"} ↗
          </a>
        )}
      </p>,
    ]);
  return (
    <>
      {sections.map(([id, title, body], i) => (
        <section key={id} className="wk-sec" id={id} aria-labelledby={`wk-${id}`}>
          <h2 id={`wk-${id}`}>
            <span className="wk-n">{String(i + 1).padStart(2, "0")}</span> {title}
          </h2>
          {body}
        </section>
      ))}
    </>
  );
}
