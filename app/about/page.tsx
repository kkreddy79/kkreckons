import type { Metadata } from "next";
import Link from "next/link";
import { latest, slugFor } from "@/lib/editions";

export const metadata: Metadata = {
  title: "About",
  description:
    "KKReckons is one visual daily briefing on India and the world: AI, markets, business and the story behind the headline, in five minutes.",
};

export default function About() {
  return (
    <main className="container narrow">
      <section className="hero">
        <div className="eyebrow">About KKReckons</div>
        <h1>Hi, I’m KK.</h1>
        <p>
          I grew up in South India and now live in Southern California, so there’s always a news tab open on both
          sides of the planet. One of them is usually still awake.
        </p>
      </section>
      <div className="prose">
        <p>
          By day I work where capital markets meet technology. By night I read far more news than is healthy, so
          you don’t have to.
        </p>
        <p>
          The internet serves news two ways: instant noodles (fast, salty, gone in a minute) or a 40-page tasting
          menu nobody has time for. KKReckons is the third option: one plate, cooked properly, served daily.
        </p>
        <p>
          Each morning you get one visual briefing on India and the world. It covers AI, markets, business and the
          story behind the headline, with just enough spice to keep you awake.
        </p>

        <h2>House rules</h2>
        <ul>
          <li>
            <b>Every story links to its source.</b> Trust, then verify.
          </li>
          <li>
            <b>Every story has an “other side.”</b> A headline is the trailer, not the movie.
          </li>
          <li>
            <b>News and opinion stay in separate bowls.</b> When I’m reckoning, I’ll tell you.
          </li>
        </ul>

        <p>
          Five minutes. No doomscroll hangover. I’d rather have you back tomorrow than keep you scrolling today.
        </p>
        <p className="signoff">Read deep. Think clearly. Leave in five.</p>
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
