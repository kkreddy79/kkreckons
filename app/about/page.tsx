import type { Metadata } from "next";
import Link from "next/link";
import { latest, slugFor } from "@/lib/editions";

export const metadata: Metadata = {
  title: "About",
  description: "About KKReckons, the daily India + World briefing curated by KK Reddy.",
};

export default function About() {
  return (
    <main className="container narrow">
      <section className="hero">
        <div className="eyebrow">About</div>
        <h1>Baked in India, served from America.</h1>
        <p>
          KKReckons is a visual daily briefing curated by KK Reddy. Each edition pulls together the stories worth
          your time across AI, markets, business, India and the world.
        </p>
      </section>
      <div className="prose">
        <h2>How each edition works</h2>
        <ul>
          <li>
            <b>Pick of the day.</b> One story worth slowing down for.
          </li>
          <li>
            <b>India edition and World edition.</b> The day’s signals, side by side.
          </li>
          <li>
            <b>By the numbers.</b> The figures that carry each story.
          </li>
          <li>
            <b>Why it matters, and the other side.</b> The stakes, and the best case against.
          </li>
          <li>
            <b>Further reading and Today’s slice.</b> Where to go next, and the day in one line.
          </li>
        </ul>
        <h2>Our standards</h2>
        <p>
          Reported facts are kept apart from opinion, and opinion pieces are labelled. Every story links to its
          source, so you can check the numbers yourself before acting on them.
        </p>
        <p className="fine">For information only. Not financial, legal or career advice.</p>
        <p>
          <Link className="button" href={`/daily/${slugFor(latest.date)}`}>
            Read today’s edition →
          </Link>
        </p>
      </div>
    </main>
  );
}
