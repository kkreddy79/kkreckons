import Link from "next/link";
import Banner from "@/components/Banner";
import EditionCard from "@/components/EditionCard";
import EditionView from "@/components/EditionView";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { editions, latest, slugFor } from "@/lib/editions";

export default function Home() {
  const today = getContent(latest.date);
  const earlier = editions.slice(1, 7);

  return (
    <main>
      <Banner />
      <div className="ev-wrap">
        <EditionView e={today} />

        <p className="ev-permalink">
          <Link href={`/daily/${slugFor(latest.date)}`}>Permanent link to this edition</Link>
          <span aria-hidden> · </span>
          <a href={`/editions/${latest.date}.html`} target="_blank" rel="noreferrer">
            Original newsletter design ↗
          </a>
        </p>

        <SubscribeBox />

        <section className="ev-earlier" aria-labelledby="earlier-t">
          <div className="ev-sec-head">
            <h2 id="earlier-t">Earlier editions</h2>
            <Link href="/daily/">See all {editions.length} →</Link>
          </div>
          <div className="card-grid">
            {earlier.map((e) => (
              <EditionCard key={e.date} edition={e} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
