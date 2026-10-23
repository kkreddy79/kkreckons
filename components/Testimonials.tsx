import quotes from "@/data/testimonials.json";

/** What readers say, from data/testimonials.json ({ quote, name, role }, used with permission). Hidden while empty. */
type Quote = { quote: string; name: string; role?: string };

export default function Testimonials({ max = 2 }: { max?: number }) {
  const list = (quotes as Quote[]).filter((q) => q.quote && q.name).slice(0, max);
  if (!list.length) return null;
  return (
    <div className="tm-list">
      {list.map((q) => (
        <figure key={q.name} className="tm">
          <blockquote>“{q.quote}”</blockquote>
          <figcaption>
            {q.name}
            {q.role && <span>, {q.role}</span>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
