import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
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

// A real story from the 3 October 2026 edition, reproduced as published.
const EXAMPLE = {
  date: "2026-10-03",
  category: "Corporate governance",
  headline: "Noel Tata seeks the video and minutes of the meeting that reappointed Chandrasekaran",
  source: {
    name: "The Economic Times",
    url: "https://economictimes.indiatimes.com/news/company/corporate-trends/noel-tata-seeks-tata-sons-meeting-video-minutes-questions-legal-opinions-on-chandrasekaran-reappointment/articleshow/134646293.cms",
  },
  reported: [
    "In a September 30 letter, the Tata Trusts chairman asked the Tata Sons board for the recording and minutes of its September 17 meeting, executives said.",
    "He says he wasn’t given enough time to present former CJI DY Chandrachud’s view that the chairman’s casting vote can’t override the trust nominees’ affirmative rights.",
    "He also questions why the board obtained two more opinions after the vote, from former CJI UU Lalit and retired Justice BN Srikrishna; both upheld it.",
  ],
  numbers: [
    ["4–1", "board vote, Sept 17"],
    ["5 years", "new chairman term"],
    ["2", "opinions after vote"],
  ],
  why: "The fight over Tata’s top job has moved from boardroom to lawyers.",
  other:
    "Three legal opinions back the vote, and an independent lawyer says a director has no unfettered right to a board video. Is this governance, or a lost vote relitigated?",
};

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
        <div className="ab-founder-head">
          <h2 id="founder-title">Hi, I’m KK.</h2>
          <p className="ab-route">
            Southern India <span aria-hidden>→</span> Southern California
          </p>
        </div>
        <div className="ab-founder-body">
          <p>
            Born and raised in Southern India, now in Southern California. One foot in each world, and a news tab open
            in both. One of them is usually still awake.
          </p>
          <p>
            By day, I work at the intersection of capital markets and technology. By night, I read far more news than
            is probably healthy, then curate the stories worth your attention.
          </p>
          <p>
            KKReckons is my attempt at a third option between instant noodles and a 40-page tasting menu: enough depth
            to understand the story, without needing an entire evening to get through it.
          </p>
        </div>
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

      <section className="ab-section" aria-labelledby="method-title">
        <h2 id="method-title">Not just what happened. Why it matters.</h2>
        <p className="ab-intro">
          Headlines tell you what happened. Good analysis helps you understand why it happened, what the evidence
          supports, what remains uncertain, and why the outcome matters. Here’s one story as it ran.
        </p>
        <article className="ab-example" aria-labelledby="example-title">
          <p className="ab-ex-meta">
            From the <Link href={`/daily/${slugFor(EXAMPLE.date)}`}>3 October 2026 edition</Link> · {EXAMPLE.category}
          </p>
          <h3 id="example-title">{EXAMPLE.headline}</h3>
          <div className="ab-ex-grid">
            <div className="ab-ex-reported">
              <p className="ab-ex-label">
                What the reporting says <span>· summarised from {EXAMPLE.source.name}</span>
              </p>
              <ul>
                {EXAMPLE.reported.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <dl className="ab-ex-numbers">
                {EXAMPLE.numbers.map(([n, label]) => (
                  <div key={label}>
                    <dt>{n}</dt>
                    <dd>{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="ab-ex-take">
              <p className="ab-ex-label">
                The KKReckons take <span>· commentary</span>
              </p>
              <p>
                <b>Why it matters:</b> {EXAMPLE.why}
              </p>
              <p>
                <b>Other side:</b> {EXAMPLE.other}
              </p>
            </div>
          </div>
          <a className="ab-ex-source" href={EXAMPLE.source.url} target="_blank" rel="noreferrer">
            Read the original report in {EXAMPLE.source.name} ↗
          </a>
        </article>
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
