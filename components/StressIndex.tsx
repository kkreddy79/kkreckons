"use client";

import { useEffect, useState } from "react";
import s from "./StressIndex.module.css";

/* Live data published every weekday after the US close by github.com/kkreddy79/ai-implosion. */
const DATA_URL = "https://kkreddy79.github.io/ai-implosion/data.json";

type Factor = {
  name: string; col: string; pillar: string; weight: number; type: "DD" | "LVL";
  ref: number | null; current: number | null; move: number | null;
  calm: number; trigger: number; wcalm: number | null; wtrig: number | null;
  triggerPrice: number | null; band: string | null;
  levelStress: number; widenStress: number | null; stress: number; status: string;
  lastDate?: string; stale?: boolean; rationale?: string; points: number; maxPoints: number;
  plus10: { kind: "price"; drawdown: number; price: number } | { kind: "spread"; bp: number; via: string } | null;
};
type Data = {
  asOf: string; generatedAt: string; score: number | null; band: string; triggers: string; factorCount: number;
  levels: { level: string; firstDate: string | null; active: boolean }[];
  concentrated?: { name: string; col: string; stress: number }[];
  factors: Factor[];
  history: { date: string; equity: number | null; financing: number | null; credit: number | null; score: number | null }[];
  weekly: { weekEnding: string; high: number | null }[];
  notes?: string[];
};

// Public names for the alert levels.
const LEVELS: Record<string, string> = {
  L1: "Elevated",
  L2: "Financing Strain",
  L3: "Broad Correction",
  L4: "Systemic Dislocation",
};
const C = { red: "#EF4444", orange: "#D97706", orangeRed: "#EA580C", green: "#16A34A", indigo: "#6366F1", amber: "#F59E0B", teal: "#14B8A6", slate: "#1E293B" };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmtDate = (iso: string | null | undefined, year = true) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}-${MON[m - 1]}${year ? `-${y}` : ""}`;
};
const num = (v: number, dp = 2) => v.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
const pct = (v: number, dp = 0) => `${(v * 100).toFixed(dp)}%`;
const scoreColor = (v: number | null) => (v == null ? C.slate : v >= 75 ? C.red : v >= 50 ? C.orangeRed : v >= 25 ? C.orange : C.green);
const cleanName = (n: string) => n.replace(" (bp)", "");
const publicBand = (b: string) => (b === "IMPLOSION CONFIRMED" ? "SYSTEMIC DISLOCATION" : b);
const STATUS: Record<string, string> = { TRIGGERED: s.triggered, WARNING: s.warning, WATCH: s.watch, CALM: s.calm };

function currentLevel(d: Data) {
  const on = [...d.levels].reverse().find((l) => l.active);
  return on ? `${on.level} ${LEVELS[on.level]}` : "None";
}

function Gauge({ score }: { score: number | null }) {
  const v = Math.max(0, Math.min(100, score ?? 0));
  const r = 80, cx = 100, cy = 96;
  const a = Math.PI * (1 - v / 100);
  const x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
  return (
    <svg viewBox="0 0 200 112" className={s.gauge} role="img" aria-label={`Stress score ${score ?? "n/a"} out of 100`}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#E2E8F0" strokeWidth="18" />
      {v > 0 && <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`} fill="none" stroke={scoreColor(score)} strokeWidth="18" />}
      <text x={cx} y={cy - 12} textAnchor="middle" className={s.gaugeNum} fill={scoreColor(score)}>{score ?? "—"}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" className={s.gaugeSub}>out of 100</text>
    </svg>
  );
}

function Grid({ L, R, W, ys }: { L: number; R: number; W: number; ys: (v: number) => number }) {
  return (
    <>
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={ys(g)} y2={ys(g)} stroke="#E9E4DC" />
          <text x={L - 6} y={ys(g) + 4} textAnchor="end" className={s.axis}>{g}</text>
        </g>
      ))}
    </>
  );
}

function PillarChart({ H }: { H: Data["history"] }) {
  const W = 720, Ht = 240, L = 34, R = 10, T = 10, B = 26;
  const xs = (i: number) => L + (i / Math.max(1, H.length - 1)) * (W - L - R);
  const ys = (v: number) => T + (1 - v / 100) * (Ht - T - B);
  const series = [
    { key: "equity", label: "AI equities", color: C.indigo, w: 1.6 },
    { key: "financing", label: "AI financing", color: C.amber, w: 1.6 },
    { key: "credit", label: "Credit", color: C.teal, w: 1.6 },
    { key: "score", label: "Index", color: C.red, w: 3 },
  ] as const;
  const path = (k: (typeof series)[number]["key"]) => {
    let out = "", pen = false;
    H.forEach((p, i) => {
      const v = p[k];
      if (v == null) { pen = false; return; }
      out += `${pen ? "L" : "M"}${xs(i).toFixed(1)},${ys(v).toFixed(1)} `;
      pen = true;
    });
    return out;
  };
  const ticks = H.map((p, i) => ({ p, i })).filter(({ p, i }) => i === 0 || p.date.slice(5, 7) !== H[i - 1].date.slice(5, 7));
  return (
    <figure className={s.panel}>
      <figcaption>Pillars &amp; index — last 52 weeks</figcaption>
      <svg viewBox={`0 0 ${W} ${Ht}`} role="img" aria-label="Pillar stress and index over the last 52 weeks">
        <Grid L={L} R={R} W={W} ys={ys} />
        {ticks.filter((_, n) => n % 2 === 0).map(({ p, i }) => (
          <text key={p.date} x={xs(i)} y={Ht - 6} textAnchor="middle" className={s.axis}>{MON[Number(p.date.slice(5, 7)) - 1]}</text>
        ))}
        {series.map((sr) => <path key={sr.key} d={path(sr.key)} fill="none" stroke={sr.color} strokeWidth={sr.w} strokeLinejoin="round" />)}
      </svg>
      <div className={s.legend}>{series.map((sr) => <span key={sr.key}><i style={{ background: sr.color }} />{sr.label}</span>)}</div>
    </figure>
  );
}

function WeeklyChart({ Wk }: { Wk: Data["weekly"] }) {
  const W = 720, Ht = 220, L = 34, R = 10, T = 10, B = 26;
  const bw = (W - L - R) / Wk.length;
  const ys = (v: number) => T + (1 - v / 100) * (Ht - T - B);
  return (
    <figure className={s.panel}>
      <figcaption>Weekly high — 26 weeks</figcaption>
      <svg viewBox={`0 0 ${W} ${Ht}`} role="img" aria-label="Weekly high of the index over 26 weeks">
        <Grid L={L} R={R} W={W} ys={ys} />
        {Wk.map((w, i) => (
          <g key={w.weekEnding}>
            {w.high != null && (
              <rect x={L + i * bw + bw * 0.15} width={bw * 0.7} y={ys(w.high)} height={Math.max(0, ys(0) - ys(w.high))} rx="2" fill={scoreColor(w.high)}>
                <title>{`Week ending ${fmtDate(w.weekEnding)}: ${w.high}`}</title>
              </rect>
            )}
            {i % 4 === 0 && <text x={L + i * bw + bw / 2} y={Ht - 6} textAnchor="middle" className={s.axis}>{fmtDate(w.weekEnding, false)}</text>}
          </g>
        ))}
      </svg>
    </figure>
  );
}

function plus10(f: Factor) {
  const p = f.plus10;
  if (!p) return f.points >= f.maxPoints - 0.05 ? "Already at its maximum" : `Can’t add 10 on its own (at most +${(f.maxPoints - f.points).toFixed(1)})`;
  if (p.kind === "price") return `Falls to ${pct(p.drawdown, 1)} from its 2-year high (about ${num(p.price)})`;
  return `Spread reaches ${num(p.bp, 0)} bp (${p.via} rule)`;
}

function FactorRow({ f }: { f: Factor }) {
  const dd = f.type === "DD";
  const name = (
    <td className={s.metric}>
      {cleanName(f.name)}
      <small>{f.col} · {f.pillar === "Equity" ? "AI equities" : f.pillar === "Financing" ? "AI financing" : "Credit"}</small>
      {f.stale ? <small className={s.stale}>⚠ stale since {fmtDate(f.lastDate)}</small> : f.lastDate ? <small>as of {fmtDate(f.lastDate)}</small> : null}
    </td>
  );
  if (f.current == null || f.ref == null || f.move == null)
    return <tr>{name}<td>{pct(f.weight)}</td><td>—</td><td>—</td><td>—</td><td>—</td><td>0.0</td><td><span className={s.pill}>NO DATA</span></td></tr>;
  return (
    <tr>
      {name}
      <td>{pct(f.weight)}</td>
      <td>{dd ? num(f.current) : `${num(f.current, 0)} bp`}</td>
      <td>{dd ? pct(f.move, 1) : `${f.move >= 0 ? "+" : ""}${num(f.move, 0)} bp`}<small>{dd ? "vs 2-year high" : "vs 52-week low"}</small></td>
      <td>
        <span className={s.bar}><span style={{ width: pct(f.stress, 1) }} /></span>{pct(f.stress)}
        {!dd && <small>level {pct(f.levelStress)} · widen {pct(f.widenStress ?? 0)}</small>}
      </td>
      <td>{dd ? `${pct(f.calm)} → ${pct(f.trigger)}` : `${f.calm} → ${f.trigger} bp`}{!dd && <small>or +{f.wcalm} → +{f.wtrig} bp</small>}</td>
      <td><b>{f.points.toFixed(1)}</b><small>of {f.maxPoints.toFixed(0)}</small></td>
      <td><span className={`${s.pill} ${STATUS[f.status] ?? ""}`}>{f.status}</span></td>
    </tr>
  );
}

export default function StressIndex() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${DATA_URL}?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(setD)
      .catch((e: Error) => setErr(e.message));
  }, []);

  if (err) return <main className="container"><p className={s.err}>The latest index data couldn’t be loaded ({err}). Please try again shortly.</p></main>;
  if (!d) return <main className="container"><p className={s.loading}>Loading today’s index…</p></main>;

  const pw: Record<string, number> = {};
  d.factors.forEach((f) => { pw[f.pillar] = (pw[f.pillar] ?? 0) + f.weight; });
  const ex = d.factors.filter((f) => f.type === "LVL" && f.current != null).sort((a, b) => b.stress - a.stress)[0];

  return (
    <main className={`container ${s.page}`}>
      <section className={s.hero}>
        <div className="eyebrow">Markets · updated every weekday</div>
        <h1>AI Market Stress Index</h1>
        <p>A 0–100 gauge of stress across AI equities, the financing behind the AI build-out, and the wider credit market. Data as of {fmtDate(d.asOf)}.</p>
        {(d.notes ?? []).filter((n) => !/sample/i.test(n)).map((n) => <p key={n} className={s.note}>{n}</p>)}
        {d.concentrated && d.concentrated.length > 0 && (
          <div className={s.callout}>
            <b>Concentrated stress:</b> {d.concentrated.map((c) => `${cleanName(c.name)} at ${pct(c.stress)}`).join(", ")} while the index is {d.score} and no alert level is active. One gauge flashing can lead the rest, so it is worth watching.
          </div>
        )}
      </section>

      <section className={s.kpis}>
        <div className={`${s.card} ${s.gaugeCard}`}><div className={s.label}>Index</div><Gauge score={d.score} /></div>
        <div className={s.card}><div className={s.label}>Reading</div><div className={s.value} style={{ color: scoreColor(d.score) }}>{publicBand(d.band)}</div><div className={s.sub}>0–25 normal · 25–50 elevated · 50–75 severe · 75+ critical</div></div>
        <div className={s.card}><div className={s.label}>Gauges at maximum</div><div className={s.value}>{d.triggers}</div><div className={s.sub}>indicators at 100% stress</div></div>
        <div className={s.card}><div className={s.label}>Alert level</div><div className={s.value}>{currentLevel(d)}</div><div className={s.sub}>confirmed after 5 straight trading days</div></div>
      </section>

      <h2 className={s.h2}>The nine gauges</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Indicator</th><th>Weight</th><th>Current</th><th>Move</th><th>Stress</th><th>Calm → trigger</th><th>Index points</th><th>Status</th></tr></thead>
          <tbody>{d.factors.map((f) => <FactorRow key={f.col} f={f} />)}</tbody>
        </table>
      </div>

      <div className={s.grid2}>
        <div className={s.panel}>
          <h3 className={s.h3}>Alert levels</h3>
          <table className={s.table}>
            <thead><tr><th>Level</th><th>First confirmed</th><th>Active now</th></tr></thead>
            <tbody>
              {d.levels.map((l) => (
                <tr key={l.level}><td className={s.metric}>{l.level} {LEVELS[l.level]}</td><td>{fmtDate(l.firstDate)}</td><td>{l.active ? <b style={{ color: C.red }}>YES</b> : "NO"}</td></tr>
              ))}
            </tbody>
          </table>
          <p className={s.sub} style={{ marginTop: 10 }}>Each level needs the index and specific gauges to stay high for 5 trading days in a row.</p>
        </div>
        <div className={s.panel}>
          <h3 className={s.h3}>Index points by gauge</h3>
          <div className={s.hbars}>
            {d.factors.map((f) => (
              <div key={f.col} className={s.hbar}>
                <span>{f.col}</span>
                <span className={s.track}><span style={{ width: `${(f.points / Math.max(...d.factors.map((x) => x.maxPoints))) * 100}%` }} /></span>
                <b>{f.points.toFixed(1)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PillarChart H={d.history} />
      <WeeklyChart Wk={d.weekly} />

      <h2 className={s.h2}>Why these weights — and what would move the index</h2>
      <div className={s.tableWrap}>
        <table className={`${s.table} ${s.why}`}>
          <thead><tr><th>Indicator</th><th>Weight</th><th>Why it is here</th><th>To add 10 points on its own</th></tr></thead>
          <tbody>
            {d.factors.map((f) => (
              <tr key={f.col}><td className={s.metric}>{cleanName(f.name)}<small>{f.col}</small></td><td>{pct(f.weight)}</td><td>{f.rationale}</td><td>{plus10(f)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className={s.how}>
        <h2 className={s.h2}>How it works</h2>
        <p>Every weekday after the US close, the index reads {d.factorCount} market gauges in three groups: <b>AI equities</b> ({pct(pw.Equity ?? 0)} of the index), <b>the financing behind the AI build-out</b> ({pct(pw.Financing ?? 0)}) and <b>the wider credit market</b> ({pct(pw.Credit ?? 0)}).</p>
        <p>Each gauge gets a stress reading from 0% (calm) to 100% (its trigger level). For stocks and funds it is how far they have fallen from their 2-year high. For credit spreads — the extra interest riskier borrowers pay — it is how high they are, or how fast they have jumped, whichever is worse.</p>
        <p>The <b>index</b> is the weighted average of those readings, from 0 to 100. Alert levels need the index and specific gauges to stay high for <b>5 trading days in a row</b>, so a one-day wobble never counts. The top level, <b>Systemic Dislocation</b>, needs an index of 75+, the Nasdaq-100 down 25% or more, and credit cracking (junk-bond spreads at 500 bp or the private-credit fund down 25%).</p>
        {ex && ex.stress > 0 && ex.current != null && ex.ref != null && ex.move != null && (
          <p><b>Today’s example:</b> the {cleanName(ex.name)} is {num(ex.current, 0)} bp.{" "}
            {(ex.widenStress ?? 0) >= ex.levelStress
              ? <>That is {num(ex.move, 0)} bp above its 52-week low of {num(ex.ref, 0)}, a fast climb, so its widening reading of {pct(ex.widenStress ?? 0)} beats its level reading of {pct(ex.levelStress)}.</>
              : <>Against its calm ({ex.calm}) and trigger ({ex.trigger}) levels that is {pct(ex.levelStress)} stress.</>}
            {" "}With a {pct(ex.weight)} weight it adds {ex.points.toFixed(1)} points to today’s index of {d.score}.</p>
        )}
        <details className={s.formulas}>
          <summary>The exact rules</summary>
          <p><b>Prices</b> (Nasdaq-100, semiconductors, AI, data-center, BDC and loan ETFs): drawdown = dividend-adjusted close ÷ highest close of the last 2 years − 1; stress = clamp((drawdown − calm) ÷ (trigger − calm), 0, 1).</p>
          <p><b>Credit spreads</b> (BBB, CCC, high yield, in bp): stress = the higher of the level test, clamp((spread − calm) ÷ (trigger − calm)), and the widening test, clamp((spread − 52-week low − widen calm) ÷ (widen trigger − widen calm)).</p>
          <p><b>Index</b> = Σ(weight × stress) ÷ Σ weights × 100, rounded. A gauge’s points = its weight share × its stress × 100. Blank days carry the last value; a gauge not updated for more than 3 trading days is flagged stale.</p>
          <p><b>Alert levels</b> (5 straight trading days): L1 Elevated: index ≥ 50 · L2 Financing Strain: index ≥ 60 and (BDC ≥ 80% with loans ≥ 50%, or CCC ≥ 80%) · L3 Broad Correction: index ≥ 70, semiconductors ≥ 83%, AI ETF ≥ 80% · L4 Systemic Dislocation: index ≥ 75, Nasdaq-100 at 100%, and high-yield ≥ 500 bp or BDC at 100%.</p>
          <p>Replayed on daily data since 1999, the top level confirmed in the dot-com bust, the 2008 crisis and the 2022 bear market, and in no other period.</p>
        </details>
        <p className={s.fine}>Prices: Yahoo Finance dividend-adjusted daily closes. Credit spreads: ICE BofA option-adjusted spreads via FRED (BAMLC0A4CBBB, BAMLH0A3HYC, BAMLH0A0HYM2). Updated every weekday after the US close · last run {d.generatedAt.replace("T", " ").replace("+00:00", " UTC")}. An indicator of market conditions, not a forecast; for information only and not financial advice.</p>
      </section>
    </main>
  );
}
