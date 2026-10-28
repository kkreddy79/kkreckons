import Link from "@/components/Link";
import { TOPICS } from "@/lib/topics";

/** Plain links to every topic page, rendered on the server so crawlers can follow them. */
export default function TopicNav({ current, counts }: { current?: string; counts: Record<string, number> }) {
  return (
    <nav className="tp-nav" aria-label="Topics">
      {TOPICS.map((t) => (
        <Link key={t.slug} href={`/topics/${t.slug}`} prefetch={false} className={`chip${t.slug === current ? " on" : ""}`} aria-current={t.slug === current ? "page" : undefined}>
          {t.name} <span>{counts[t.name] ?? 0}</span>
        </Link>
      ))}
    </nav>
  );
}
