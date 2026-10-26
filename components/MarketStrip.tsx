import type { EditionContent, MarketAsset } from "@/lib/content";
import { shortDate } from "@/lib/editions";

// Names short enough for a three-column phone layout (the full name shows as a tooltip).
export const SHORT: Record<string, string> = { us10y: "US 10-yr yield" };

/** "24,612", "5.00%", "$103.27", "₹88.45" */
export function marketValue(a: MarketAsset) {
  const n = (v: number, d: number) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  if (a.unit === "yield") return `${n(a.close, 2)}%`;
  if (a.unit === "fx") return `₹${n(a.close, 2)}`;
  if (a.unit === "usd") return `$${n(a.close, a.close >= 1000 ? 0 : 2)}`;
  return n(a.close, a.close >= 1000 ? 0 : 2);
}

/** A move from `from` to the close: basis points for a yield, per cent otherwise. Null when there's nothing to compare. */
export function marketMove(a: MarketAsset, from: number | undefined) {
  if (from == null || !from) return null;
  const d = a.unit === "yield" ? Math.round((a.close - from) * 100) : ((a.close - from) / from) * 100;
  const text = a.unit === "yield" ? `${Math.abs(d)} bp` : `${Math.abs(d).toFixed(Math.abs(d) < 10 ? 2 : 1)}%`;
  return { dir: d > 0 ? "up" : d < 0 ? "down" : "flat", text, words: `${d > 0 ? "up" : d < 0 ? "down" : "unchanged"}${d ? ` ${text}` : ""}` };
}

/** The last 30 closes as a small line, scaled to their own range. */
function Spark({ points }: { points: number[] }) {
  const lo = Math.min(...points);
  const hi = Math.max(...points);
  const span = hi - lo || 1;
  const xy = points.map((v, i) => `${((i / (points.length - 1)) * 100).toFixed(1)},${(22 - ((v - lo) / span) * 20).toFixed(1)}`);
  return (
    <svg className="mk-spark" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={xy.join(" ")} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * Six market numbers at the last close before the edition (Nifty 50, S&P 500, US 10-year yield, Brent, gold,
 * USD/INR): the close, its move on the day (arrow and words, not colour alone), the move over a week, and a
 * 30-day line. Saved when the edition was published, so it never changes afterwards.
 */
export default function MarketStrip({ m }: { m: NonNullable<EditionContent["markets"]> }) {
  const asOf = m.assets.map((a) => a.asOf).sort().at(-1)!;
  return (
    <section className="mk" aria-labelledby="mk-t">
      <h2 id="mk-t" className="mk-head">
        Markets <small>at the last close before this edition · {shortDate(asOf)}</small>
      </h2>
      <ul className="mk-list">
        {m.assets.map((a) => {
          const day = marketMove(a, a.prev);
          const week = marketMove(a, a.week);
          return (
            <li key={a.id}>
              <span className="mk-name" title={a.name}>
                {SHORT[a.id] ?? a.name}
              </span>
              <b className="mk-val">{marketValue(a)}</b>
              {day && (
                <span className={`mk-chg mk-${day.dir}`}>
                  <span aria-hidden>{day.dir === "up" ? "▲" : day.dir === "down" ? "▼" : "■"} </span>
                  <span className="sr-only">On the day, {day.words}. </span>
                  <span aria-hidden>{day.text}</span>
                </span>
              )}
              {week && (
                <small className="mk-week">
                  1 wk: {week.dir === "down" ? "−" : week.dir === "up" ? "+" : ""}
                  {week.text}
                </small>
              )}
              {a.spark.length > 2 && <Spark points={a.spark} />}
              {a.asOf !== asOf && <small className="mk-stale">Close of {shortDate(a.asOf)}</small>}
            </li>
          );
        })}
      </ul>
      <p className="mk-src">{m.source}. Not investment advice.</p>
    </section>
  );
}
