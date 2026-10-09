import Link from "next/link";
import EditionCard from "@/components/EditionCard";
import SubscribeBox from "@/components/SubscribeBox";
import { THEMES, editions, latest, longDate, sectionsOf, slugFor, totalStories } from "@/lib/editions";

export default function Home() {
  const href = `/daily/${slugFor(latest.date)}`;
  const recent = editions.slice(1, 7);

  return (
    <main>
      <section className="home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">Daily briefing · India + World</div>
            <h1>
              Read deep.
              <br />
              <em>Think clearly.</em>
              <br />
              Leave in five.
            </h1>
            <p>
              Each morning, KK Reddy picks the stories that matter across AI, markets, business, India and the
              world, sets out what happened and why it matters, and gives the other side.
            </p>
            <div className="cta-row">
              <Link className="button" href={href}>
                Read today’s edition →
              </Link>
              <Link className="button alt" href="/daily/">
                Browse the archive
              </Link>
            </div>
            <dl className="stats">
              <div>
                <dt>{editions.length}</dt>
                <dd>editions</dd>
              </div>
              <div>
                <dt>{totalStories}</dt>
                <dd>stories</dd>
              </div>
              <div>
                <dt>2</dt>
                <dd>worlds: India + global</dd>
              </div>
            </dl>
          </div>

          <article className="today">
            <Link href={href} className="today-cover">
              <img src={`/covers/${latest.date}.jpg`} alt={`Cover of the ${longDate(latest.date)} edition`} />
            </Link>
            <div className="today-body">
              <div className="eyebrow">Latest · {longDate(latest.date)}</div>
              {latest.slice && <p className="today-slice">“{latest.slice}”</p>}
              {sectionsOf(latest).map((sec) => (
                <div key={sec.name} className="today-sec">
                  <h3>{sec.name}</h3>
                  <ol>
                    {sec.stories.map((s) => (
                      <li key={s.title}>
                        <Link href={href}>{s.title}</Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
              <Link href={href} className="ed-more">
                Open the full edition · {latest.readingMinutes} min <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        </div>
      </section>

      <div className="container">
        <div className="section-title">
          <h2>Recent editions</h2>
          <Link href="/daily/">See all {editions.length} →</Link>
        </div>
        <div className="card-grid">
          {recent.map((e) => (
            <EditionCard key={e.date} edition={e} />
          ))}
        </div>

        <div className="section-title">
          <h2>Browse by theme</h2>
          <span>Every story, every day</span>
        </div>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <Link key={t.name} href={`/daily/?theme=${encodeURIComponent(t.name)}`} className="theme-tile">
              {t.name} <span aria-hidden>→</span>
            </Link>
          ))}
        </div>

        <SubscribeBox />

        <section className="promise">
          <div>
            <h3>What happened</h3>
            <p>The facts, from the source, in a few lines. Every story links to where it came from.</p>
          </div>
          <div>
            <h3>Why it matters</h3>
            <p>One line on the stakes: for India, for markets, for your money or your career.</p>
          </div>
          <div>
            <h3>The other side</h3>
            <p>The strongest counter-argument, so you can weigh it and make up your own mind.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
