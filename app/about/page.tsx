import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import { editions, latest, slugFor, totalStories } from "@/lib/editions";

export const metadata: Metadata = {
  title: "About",
  description:
    "KKReckons is one visual daily briefing on India and the world: AI, markets, business and the story behind the headline, in five minutes.",
};

const RULES = [
  { title: "Every story links to its source.", body: "Trust, then verify.", color: "#e8622f", tint: "#fff1ea" },
  { title: "Every story has an “other side.”", body: "A headline is the trailer, not the movie.", color: "#0c8d86", tint: "#e8f6f4" },
  { title: "News and opinion stay in separate bowls.", body: "When I’m reckoning, I’ll tell you.", color: "#6a3fb8", tint: "#f1ebfb" },
  {
    title: "Complex stories, made simple.",
    body: "Jargon gets translated and numbers get context, so it makes sense in one read.",
    color: "#d1224e",
    tint: "#fdecf0",
  },
];

export default function About() {
  return (
    <main className="container about">
      <Masthead />
      <section className="ab-intro">
        <div>
          <div className="eyebrow">The person behind the briefing</div>
          <h1>Hi, I’m KK.</h1>
          <p className="ab-lede">
            I grew up in South India and now live in Southern California, so there’s always a news tab open on both
            sides of the planet. One of them is usually still awake.
          </p>
        </div>
        <ul className="ab-card ab-day">
          <li>
            <span aria-hidden>☀️</span>
            <p>
              <b>By day</b> I work where capital markets meet technology.
            </p>
          </li>
          <li>
            <span aria-hidden>🌙</span>
            <p>
              <b>By night</b> I read far more news than is healthy, so you don’t have to.
            </p>
          </li>
        </ul>
      </section>

      <section className="ab-menu">
        <h2>The internet serves news two ways.</h2>
        <div className="ab-options">
          <div className="ab-opt">
            <span className="ab-emoji" aria-hidden>
              🍜
            </span>
            <b>Instant noodles</b>
            <span>Fast, salty, gone in a minute.</span>
          </div>
          <div className="ab-opt">
            <span className="ab-emoji" aria-hidden>
              🍽️
            </span>
            <b>A 40-page tasting menu</b>
            <span>Impressive. Nobody has time for it.</span>
          </div>
          <div className="ab-opt ab-pick">
            <span className="ab-emoji" aria-hidden>
              🍰
            </span>
            <b>The third option</b>
            <span>One plate, cooked properly, served daily. That’s this briefing.</span>
          </div>
        </div>
      </section>

      <section className="ab-facts">
        <div>
          <b>1</b>
          <span>visual briefing every morning</span>
        </div>
        <div>
          <b>5 min</b>
          <span>to read, start to finish</span>
        </div>
        <div>
          <b>2</b>
          <span>worlds: India + global</span>
        </div>
        <div>
          <b>{totalStories}</b>
          <span>stories in {editions.length} editions so far</span>
        </div>
      </section>
      <p className="ab-covers">
        AI, markets, business and the story behind the headline, with just enough spice to keep you awake.
      </p>

      <section>
        <h2 className="ab-h2">House rules</h2>
        <ol className="ab-rules">
          {RULES.map((r, i) => (
            <li key={r.title} style={{ "--c": r.color, "--t": r.tint } as React.CSSProperties}>
              <span className="ab-num">{i + 1}</span>
              <div>
                <b>{r.title}</b>
                <span>{r.body}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="ab-close">
        <p>
          Five minutes. No doomscroll hangover. I’d rather have you back tomorrow than keep you scrolling today.
        </p>
        <div className="cta-row">
          <Link className="button light" href={`/daily/${slugFor(latest.date)}`}>
            Read today’s edition →
          </Link>
          <Link className="button ghost" href="/daily/">
            Browse the archive
          </Link>
        </div>
      </section>
    </main>
  );
}
