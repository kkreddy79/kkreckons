import Link from "next/link";
import { Edition, shortDate, slugFor, weekday } from "@/lib/editions";

export default function EditionCard({ edition, headlines = 3 }: { edition: Edition; headlines?: number }) {
  const href = `/daily/${slugFor(edition.date)}`;
  return (
    <article className="ed-card">
      <Link href={href} className="ed-date-band" aria-label={`Read the ${shortDate(edition.date)} edition`}>
        <b>{shortDate(edition.date)}</b>
        <span>{weekday(edition.date)}</span>
      </Link>
      <div className="ed-body">
        {edition.slice && (
          <p className="ed-slice">
            <Link href={href}>{edition.slice}</Link>
          </p>
        )}
        <ul className="ed-heads">
          {edition.stories.slice(0, headlines).map((s) => (
            <li key={s.title}>
              {s.category && <span className="cat">{s.category}</span>}
              {s.title}
            </li>
          ))}
        </ul>
        <Link href={href} className="ed-more">
          {edition.stories.length} stories · {edition.readingMinutes} min read <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
