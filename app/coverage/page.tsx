import type { Metadata } from "next";
import Link from "next/link";
import Banner from "@/components/Banner";
import SubscribeBox from "@/components/SubscribeBox";
import { entities } from "@/lib/entities";
import { longDate } from "@/lib/editions";

export const metadata: Metadata = {
  title: "In the news: companies, institutions and people",
  description: "Every KKReckons story on the companies, central banks and people in the news most: OpenAI, Anthropic, Nvidia, the RBI and more.",
  alternates: { canonical: "/coverage" },
};

const KINDS = [
  ["Company", "Companies"],
  ["Institution", "Institutions"],
  ["Person", "People"],
] as const;

export default function CoverageIndex() {
  const all = entities();
  return (
    <main className="cu">
      <Banner />
      <div className="cu-wrap">
        <section className="cu-hero" aria-labelledby="cvi-title">
          <p className="ab-kicker">In the news</p>
          <h1 id="cvi-title">The names behind the stories.</h1>
          <p className="cu-lede">Companies, institutions and people that keep coming up, each with every story that mentions them.</p>
        </section>
        {KINDS.map(([kind, label]) => {
          const list = all.filter((x) => x.kind === kind);
          return list.length ? (
            <section key={kind} className="cv-group" aria-labelledby={`cv-${kind}`}>
              <h2 id={`cv-${kind}`}>{label}</h2>
              <ul className="tp-grid">
                {list.map((x) => {
                  const latest = [...x.stories].sort((a, b) => b.date.localeCompare(a.date))[0];
                  return (
                    <li key={x.slug}>
                      <Link href={`/coverage/${x.slug}`}>
                        <h3>
                          {x.name} <span>{x.stories.length}</span>
                        </h3>
                        <p>{x.about}</p>
                        <p className="tp-latest">
                          <b>Latest, {longDate(latest.date)}:</b> {latest.title}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null;
        })}
        <p className="tp-more">
          Looking for a subject instead? <Link href="/topics">Browse by topic →</Link>
        </p>
        <SubscribeBox />
      </div>
    </main>
  );
}
