import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import { CakeIcon, CharminarIcon, MoonIcon, NoodlesIcon, PalmIcon, SunIcon, TastingMenuIcon } from "@/components/AboutIcons";
import { editions, latest, slugFor, totalStories } from "@/lib/editions";

const TITLE = "About KKReckons | Signal & Spice from Two Worlds";
const DESCRIPTION =
  "Meet KK Reddy and discover KKReckons: thoughtful briefings on AI, markets, business and global affairs, with context, evidence and perspectives beyond the headlines.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/about",
    images: [{ url: "/about/two-worlds.jpg", width: 2000, height: 816, alt: "KKReckons: Signal & Spice from Two Worlds" }],
  },
};

const PILLARS = [
  { title: "The Signal", body: "Find the developments worth your attention amid the daily flood of headlines." },
  { title: "The Context", body: "Understand the numbers, incentives, background and forces driving the story." },
  {
    title: "The Other Side",
    body: "Where it matters, weigh credible counterarguments, open questions and what the evidence does, and doesn’t, establish.",
  },
];

const RULES = [
  {
    title: "Follow the source",
    body: "Stories link to their original sources wherever available, so you can examine the evidence yourself.",
    color: "#b84a17",
  },
  {
    title: "Consider the other side",
    body: "Explore credible counterarguments, competing interpretations and important uncertainties. Fair scrutiny matters more than artificial balance.",
    color: "#0a716b",
  },
  {
    title: "Separate reporting from opinion",
    body: "Make it clear what the sources report, what the analysis infers, and where KKReckons offers its own view.",
    color: "#6a3fb8",
  },
  {
    title: "Respect the reader’s intelligence",
    body: "Explain complex developments in clear language, put important numbers in context, and keep the nuance that makes a story meaningful.",
    color: "#c8173f",
  },
];

function Ctas() {
  return (
    <div className="cta-row">
      <Link className="button" href={`/daily/${slugFor(latest.date)}`}>
        Read Today’s Edition →
      </Link>
      <Link className="button alt" href="/daily/">
        Explore the Archive
      </Link>
    </div>
  );
}

export default function About() {
  const avgStories = Math.round(totalStories / editions.length);
  const avgMinutes = Math.round(editions.reduce((n, e) => n + e.readingMinutes, 0) / editions.length);

  return (
    <main className="container about">
      <Masthead />

      <section className="ab-hero" aria-labelledby="about-title">
        <p className="eyebrow">About</p>
        <h1 id="about-title">The world is complicated. Your briefing shouldn’t be.</h1>
        <p className="ab-lede">
          Independent perspectives on AI, markets, business and global affairs, with the context, evidence and
          opposing views behind the headline.
        </p>
        <p className="ab-identity">India-rooted. Globally minded. Curated by KK Reddy.</p>
        <Ctas />
      </section>

      <section className="ab-founder" aria-labelledby="founder-title">
        <div className="ab-founder-text">
          <h2 id="founder-title">Hi, I’m KK.</h2>
          <p className="ab-route">
            <span>
              <CharminarIcon className="ab-chip-ic" /> South India
            </span>
            <span className="ab-route-arrow" aria-hidden>
              ⇄
            </span>
            <span>
              <PalmIcon className="ab-chip-ic" /> Southern California
            </span>
          </p>
          <p className="ab-founder-lede">
            One foot in each world, and a news tab open in both. One of them is always awake.
          </p>
        </div>
        <ul className="ab-daynight">
          <li>
            <SunIcon className="ab-dn-ic" />
            <p>
              <b>By day</b> Capital markets, meet technology.
            </p>
          </li>
          <li>
            <MoonIcon className="ab-dn-ic" />
            <p>
              <b>By night</b> Way too much news, so you don’t have to.
            </p>
          </li>
        </ul>
      </section>

      <section className="ab-menu" aria-labelledby="menu-title">
        <h2 id="menu-title">The internet serves news two ways.</h2>
        <ul className="ab-options">
          <li className="ab-opt">
            <NoodlesIcon className="ab-emoji" />
            <b>Instant noodles</b>
            <span>Fast, salty, gone in a minute.</span>
          </li>
          <li className="ab-opt">
            <TastingMenuIcon className="ab-emoji" />
            <b>A 40-page tasting menu</b>
            <span>Impressive. Nobody has the time.</span>
          </li>
          <li className="ab-opt ab-pick">
            <CakeIcon className="ab-emoji" />
            <b>The third option</b>
            <span>One slice. Cooked right. Served daily.</span>
          </li>
        </ul>
      </section>

      <section className="ab-section" aria-labelledby="product-title">
        <h2 id="product-title">Less noise. More understanding.</h2>
        <p className="ab-intro">
          Every edition brings together a curated selection of stories across technology, markets, business and global
          affairs. The goal isn’t to tell you everything that happened. It’s to help you understand the developments
          that matter, the forces behind them, and the implications worth considering.
        </p>
        <ul className="ab-pillars">
          {PILLARS.map((p) => (
            <li key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>
        <p className="ab-stats">
          A typical edition: about <b>{avgStories} stories</b> and <b>{avgMinutes} minutes</b> of reading.{" "}
          <span>
            {editions.length} editions and {totalStories} stories published so far.
          </span>
        </p>
      </section>

      <section className="ab-section" aria-labelledby="rules-title">
        <h2 id="rules-title">Four rules. No shortcuts.</h2>
        <p className="ab-intro">The standards every edition aims for.</p>
        <ol className="ab-rules">
          {RULES.map((r, i) => (
            <li key={r.title} style={{ "--c": r.color } as React.CSSProperties}>
              <span className="ab-rule-num" aria-hidden>
                0{i + 1}
              </span>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ab-close" aria-labelledby="close-title">
        <h2 id="close-title">Read deep. Think clearly. Leave in five.</h2>
        <p>A little more context. A little less noise. A better understanding of the world.</p>
        <Ctas />
      </section>
    </main>
  );
}
