"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "@/components/Link";
import s from "@/components/Drawdowns.module.css";
import { STRESS_BASES } from "@/lib/stress";
import { cleanDrawdowns, ddBand, median, summarize, type Drawdowns as Data, type DrawdownStock } from "@/lib/drawdowns";

const BANDS = [
  { name: "Normal", range: "0–24% off peak", cls: s.b0 },
  { name: "Elevated", range: "25–49%", cls: s.b1 },
  { name: "Severe", range: "50–74%", cls: s.b2 },
  { name: "Critical", range: "75–100%", cls: s.b3 },
];
const SORTS: Record<string, { label: string; fn: (a: DrawdownStock, b: DrawdownStock) => number }> = {
  deep: { label: "Biggest drop from peak", fn: (a, b) => a.dd - b.dd },
  shallow: { label: "Smallest drop from peak", fn: (a, b) => b.dd - a.dd },
  dayworst: { label: "Today: worst first", fn: (a, b) => a.day - b.day },
  daybest: { label: "Today: best first", fn: (a, b) => b.day - a.day },
  recent: { label: "Most recent peak", fn: (a, b) => b.d.localeCompare(a.d) },
  oldest: { label: "Oldest peak", fn: (a, b) => a.d.localeCompare(b.d) },
  az: { label: "Ticker A–Z", fn: (a, b) => a.t.localeCompare(b.t) },
};
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthYear = (iso: string) => `${MON[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
const dayMonth = (iso: string) => `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]}`;
const longDate = (iso: string) => `${dayMonth(iso)} ${iso.slice(0, 4)}`;
export const pct = (v: number, dp = 1) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v * 100).toFixed(dp)}%`;
const money = (v: number, cur: string) => `${cur}${v.toLocaleString("en-US", { minimumFractionDigits: cur === "₩" ? 0 : 2, maximumFractionDigits: cur === "₩" ? 0 : 2 })}`;
export const bandClass = (dd: number) => BANDS[ddBand(dd)].cls;

/** The full monitor on /ai-stress-index/drawdowns. Filters stack; the # is each stock's rank among all stocks. */
export default function Drawdowns({ initial }: { initial: Data | null }) {
  const [data, setData] = useState<Data | null>(initial);
  const [err, setErr] = useState(false);
  const [seg, setSeg] = useState<string | null>(null);
  const [band, setBand] = useState<number | null>(null);
  const [metric, setMetric] = useState<"ath" | "cyc">("ath");
  const [sort, setSort] = useState("deep");

  useEffect(() => {
    if (initial) return;
    (async () => {
      for (const base of STRESS_BASES) {
        try {
          const r = await fetch(`${base}/drawdowns.json?t=${Date.now()}`);
          const d = r.ok ? cleanDrawdowns(await r.json()) : null;
          if (d) return setData(d);
        } catch {}
      }
      setErr(true);
    })();
  }, [initial]);

  // The chosen measure: from the all-time high, or from the highest close since 1 Jan 2025 (no pre-2025 stripes then).
  const view = useMemo(() => (data?.stocks ?? []).map((r) => (metric === "cyc" ? { ...r, dd: r.dd25, d: r.d25, ath: r.ath25, old: false } : r)), [data, metric]);
  const rank = useMemo(() => new Map([...view].sort((a, b) => a.dd - b.dd).map((r, i) => [r.symbol, i + 1])), [view]);
  const segments = useMemo(() => [...new Set((data?.stocks ?? []).map((r) => r.g))], [data]);
  if (err) return <p className={s.err}>The drawdown data couldn’t be loaded. Please try again shortly.</p>;
  if (!data) return <p className={s.loading}>Loading today’s drawdowns…</p>;

  const base = view;
  const inSeg = base.filter((r) => !seg || r.g === seg);
  const rows = inSeg.filter((r) => band == null || ddBand(r.dd) === band).sort(SORTS[sort].fn);
  const k = summarize(rows);
  const counts = [0, 0, 0, 0];
  inSeg.forEach((r) => counts[ddBand(r.dd)]++);
  const notes = [
    ...data.stocks.filter((r) => r.ipo).map((r) => `${r.n} (${r.t}) listed on ${longDate(r.d)}${r.ipoPrice ? ` after pricing its IPO at ${r.cur}${r.ipoPrice}` : ""}, so its peak is recent.`),
    ...(data.stocks.some((r) => r.cur === "₩") ? [`${data.stocks.filter((r) => r.cur === "₩").map((r) => r.n).join(", ")} trades in Seoul, in Korean won.`] : []),
  ];

  return (
    <>
      <div className={s.kpis}>
        <Kpi value={pct(k.medianDrawdown)} label="Median distance from peak" cls={bandClass(k.medianDrawdown)} />
        <Kpi value={<>{k.down50}<small> / {k.count}</small></>} label="Down 50% or more" cls={s.b1} />
        <Kpi value={<>{k.down75}<small> / {k.count}</small></>} label="Down 75% or more" cls={s.b3} />
        <Kpi value={pct(k.medianDay)} label={`Median move, ${dayMonth(data.asOf)}`} cls={k.medianDay < 0 ? s.down : s.up} />
      </div>

      {data.benchmarks.length > 0 && (
        <>
          <h2 className={s.label}>Against the market · fall from each one’s own peak</h2>
          <div className={s.bench}>
            {data.benchmarks.map((b) => {
              const v = metric === "cyc" ? b.dd25 : b.dd;
              return <div key={b.id} className={`${s.bItem} ${b.id === "basket" ? s.bMe : ""} ${bandClass(v)}`}><span>{b.name}</span><b>{pct(v)}</b></div>;
            })}
          </div>
        </>
      )}

      <h2 className={s.label}>How deep the damage goes · tap to filter</h2>
      <div className={s.bandBar} role="group" aria-label="Filter by severity">
        {counts.map((n, i) => n > 0 && (
          <button key={i} type="button" className={`${s.bandSeg} ${BANDS[i].cls} ${band == null ? "" : band === i ? s.on : s.off}`} style={{ flexGrow: n }}
            aria-pressed={band === i} aria-label={`${BANDS[i].name}, ${BANDS[i].range}: ${n} stocks`} onClick={() => setBand(band === i ? null : i)}>{n}</button>
        ))}
      </div>
      <p className={s.legend}>{BANDS.map((b) => <span key={b.name}><i className={b.cls} />{b.name} <small>{b.range}</small></span>)}</p>

      <h2 className={s.label}>Median by segment · tap to filter</h2>
      <div className={s.segs}>
        {segments.map((g) => {
          const rs = base.filter((r) => r.g === g);
          if (!rs.length) return null;
          const m = median(rs.map((r) => r.dd));
          return (
            <button key={g} type="button" className={`${s.segCard} ${seg === g ? s.segOn : ""}`} aria-pressed={seg === g} onClick={() => setSeg(seg === g ? null : g)}>
              <span className={s.segName}>{g}</span>
              <b className={bandClass(m)}>{pct(m, 0)}</b>
              <small>{rs.length} {rs.length === 1 ? "stock" : "stocks"}</small>
            </button>
          );
        })}
      </div>

      <div className={s.controls}>
        <label className={s.sortBox}>
          <span className={s.label}>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([key, o]) => <option key={key} value={key}>{o.label}</option>)}
          </select>
        </label>
        <div className={s.measure} role="group" aria-label="Measure drops from">
          <span className={s.label}>Measure from</span>
          {(["ath", "cyc"] as const).map((m) => (
            <button key={m} type="button" className={metric === m ? s.mOn : ""} aria-pressed={metric === m} onClick={() => setMetric(m)}>
              {m === "ath" ? "All-time high" : "2025–26 peak"}
            </button>
          ))}
        </div>
        {(seg || band != null) && <button type="button" className={s.clear} onClick={() => { setSeg(null); setBand(null); }}>Clear filters</button>}
      </div>

      <div className={s.list} role="table" aria-label="AI stock drawdowns">
        <div className={`${s.row} ${s.head}`} role="row">
          <span role="columnheader" title="Rank by drop from peak among all stocks">#</span>
          <span role="columnheader">Stock</span>
          <span role="columnheader" className={s.hideSm}>{metric === "cyc" ? "Distance from 2025–26 peak" : "Distance from all-time high"}</span>
          <span role="columnheader" className={s.num}>Off peak</span>
          <span role="columnheader" className={`${s.num} ${s.hideSm}`}>Peak → now</span>
          <span role="columnheader" className={s.num}>Today</span>
        </div>
        {rows.map((r) => (
          <div key={r.symbol} className={s.row} role="row">
            <span className={s.rk} role="cell">{rank.get(r.symbol)}</span>
            <span className={s.nm} role="cell">
              <b>{r.t}</b>
              {r.old && <em className={s.tag}>Pre-2025 peak</em>}
              {r.ipo && <em className={`${s.tag} ${s.tagIpo}`}>New IPO</em>}
              {r.stale && <em className={s.tag} title={`Last available close: ${r.asOf}`}>Stale</em>}
              <small>{r.n} · {r.g}</small>
            </span>
            <span className={s.trackCell} role="cell" aria-hidden="true">
              <span className={s.track}><i className={`${bandClass(r.dd)} ${r.old ? s.striped : ""}`} style={{ width: `${(-r.dd * 100).toFixed(1)}%` }} /></span>
            </span>
            <span className={`${s.dd} ${bandClass(r.dd)}`} role="cell">{pct(r.dd)}</span>
            <span className={`${s.px} ${s.hideSm}`} role="cell"><b>{money(r.ath, r.cur)}</b> {r.ipo ? dayMonth(r.d) : monthYear(r.d)}<br />→ {money(r.c, r.cur)}</span>
            <span className={`${s.today} ${r.day < 0 ? s.down : s.up}`} role="cell">{pct(r.day)}</span>
          </div>
        ))}
        {!rows.length && <p className={s.empty}>No stocks match these filters.</p>}
      </div>

      <p className={s.note}>
        Daily closes from Yahoo Finance as of {longDate(data.asOf)}, split-adjusted, not dividend-adjusted. Each drop is measured from
        the stock’s own record close, which fell on different dates. Striped bars mark record closes from before 2025, so part of that
        fall predates the AI boom; “2025–26 peak” measures every stock from its highest close since 1 Jan 2025 instead. “AI basket as one portfolio” holds all the stocks in equal amounts, rebalanced daily from 2 Jan 2025, so it compares like for like with the indexes; the median above treats each stock on its own. The # is each
        stock’s rank by drop among all {data.stocks.length} on the chosen measure, whatever you sort or filter.{" "}
        {notes.join(" ")}
      </p>
      <p className={s.credit}>
        Analysis by KK Reddy. The basket is KKReckons’ selection of large AI-linked stocks; it’s a companion to the{" "}
        <Link href="/ai-stress-index">AI Market Stress Index</Link>, not part of its score. For information only, not investment advice.
      </p>
    </>
  );
}

function Kpi({ value, label, cls }: { value: React.ReactNode; label: string; cls: string }) {
  return (
    <div className={`${s.kpi} ${cls}`}>
      <span className={s.kpiV}>{value}</span>
      <span className={s.kpiL}>{label}</span>
    </div>
  );
}
