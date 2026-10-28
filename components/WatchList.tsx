import Link from "@/components/Link";
import s from "@/components/StressIndex.module.css";
import type { Watch, WatchState } from "@/lib/watch";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const short = (iso: string) => `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]}`;
const STATE_LABEL: Record<WatchState, string> = { met: "Met", partly: "Partly met", "not-met": "Not met" };
const STATE_CLASS: Record<WatchState, string> = { met: s.wMet, partly: s.wPartly, "not-met": s.wNotMet };

/**
 * "What would change my mind": the signs that would show a thesis breaking, each marked Met, Partly met or
 * Not met from KKReckons stories, with the date the mark last changed. The word always shows beside the colour.
 */
export default function WatchList({ watch }: { watch: Watch[] }) {
  return (
    <div id="watching" className={s.watch}>
      {watch.map((t) => (
        <section key={t.id} aria-labelledby={`w-${t.id}`}>
          <h2 className={s.h2} id={`w-${t.id}`}>
            What would change our mind
          </h2>
          <p className={s.watchThesis}>
            Thesis to test: <b>{t.thesis}</b>
          </p>
          <p className={s.small}>{t.intro}</p>
          <ol className={s.watchList}>
            {t.conditions.map((c) => (
              <li key={c.id}>
                <div className={s.watchHead}>
                  <b>{c.label}</b>
                  <span className={`${s.wState} ${STATE_CLASS[c.state]}`}>
                    {STATE_LABEL[c.state]} <small>since {short(c.since)}</small>
                  </span>
                </div>
                <p className={s.watchTest}>{c.test}</p>
                <p>{c.evidence}</p>
                {c.links.length > 0 && (
                  <p className={s.watchLinks}>
                    {c.links.map((l) => (
                      <Link key={l.href} href={l.href} prefetch={false}>
                        {l.title || "The story"} <small>· {short(l.date)}</small>
                      </Link>
                    ))}
                  </p>
                )}
                {c.history.length > 0 && (
                  <p className={s.watchTest}>Before: {c.history.map((h) => `${STATE_LABEL[h.state]} from ${short(h.since)}`).join(" · ")}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
