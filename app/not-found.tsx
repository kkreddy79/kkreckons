import Link from "next/link";
import { latest } from "@/lib/editions";
import { TOPICS } from "@/lib/topics";

export default function NotFound() {
  return (
    <main className="container narrow nf">
      <section className="hero">
        <div className="eyebrow">404</div>
        <h1>That page isn’t here.</h1>
        <p>The link may be old or mistyped. Search every story, or pick up from today’s edition.</p>
        {/* Catch up reads ?q= and opens its story search with it. */}
        <form className="nf-search" action="/daily" method="get" role="search">
          <label htmlFor="nf-q" className="sr-only">
            Search every story
          </label>
          <input id="nf-q" type="search" name="q" placeholder="Search headlines, companies, topics…" />
          <button type="submit">Search</button>
        </form>
        <div className="cta-row">
          <Link className="button" href="/">
            Today’s edition{latest.slice ? `: ${latest.slice.length > 48 ? `${latest.slice.slice(0, 46).trimEnd()}…` : latest.slice}` : ""}
          </Link>
          <Link className="button alt" href="/daily">
            Catch up on every edition
          </Link>
        </div>
      </section>
      <nav className="nf-topics" aria-label="Topics">
        <h2>Or browse a topic</h2>
        <p>
          {TOPICS.map((t) => (
            <Link key={t.slug} href={`/topics/${t.slug}`} className="chip">
              {t.name}
            </Link>
          ))}
        </p>
      </nav>
    </main>
  );
}
