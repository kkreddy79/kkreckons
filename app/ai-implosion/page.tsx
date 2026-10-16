import type { Metadata } from "next";
import raw from "@/data/ai-implosion.json";
import s from "./page.module.css";

/* AI Implosion Dashboard: daily AI-bubble stress score and the rule-based "AI Implosion" date
   that settles KK vs SJ. Data is rebuilt every weekday by .github/workflows/ai-implosion.yml
   (ai-implosion/update_dashboard.py). Unlinked from the nav and kept out of search engines. */

export const metadata: Metadata = {
  title: "AI Implosion Dashboard",
  description: "Daily AI-bubble stress score (0–100) across AI-cycle drawdowns and high-yield credit spreads.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/ai-implosion" },
};

type Factor = {
  name: string; col: string; pillar: string; weight: number; type: "DD" | "LVL";
  ref: number; current: number; move: number; calm: number; trigger: number;
  triggerPrice: number | null; band: string | null; stress: number; status: string;
};
type Data = {
  asOf: string; generatedAt: string; sample: boolean; notes?: string[]; score: number | null; band: string; triggers: string;
  currentLevel: string; implosionDate: string | null; winner: string;
  levels: { level: string; name: string; firstDate: string | null; active: boolean }[];
  bet: { who: string; pick: string; daysLeft: number; daysOff: number | null }[];
  factors: Factor[];
  history: { date: string; equity: number | null; financing: number | null; credit: number | null; score: number | null }[];
  weekly: { weekEnding: string; high: number | null }[];
};
const d = raw as unknown as Data;

const C = { red: "#EF4444", orange: "#D97706", orangeRed: "#EA580C", green: "#16A34A", indigo: "#6366F1", amber: "#F59E0B", teal: "#14B8A6", slate: "#1E293B" };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso: string | null, year = true) => {
  if (!iso) return "—";
  const [y, m, dd] = iso.split("-").map(Number);
  return `${String(dd).padStart(2, "0")}-${MON[m - 1]}${year ? `-${y}` : ""}`;
};
const num = (v: number, dp = 2) => v.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
const pct = (v: number, dp = 0) => `${(v * 100).toFixed(dp)}%`;
const scoreColor = (v: number | null) => (v == null ? C.slate : v >= 75 ? C.red : v >= 50 ? C.orangeRed : v >= 25 ? C.orange : C.green);
const STATUS_CLASS: Record<string, string> = { TRIGGERED: s.triggered, WARNING: s.warning, WATCH: s.watch, CALM: s.calm };

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

function LineChart() {
  const H = d.history;
  const W = 720, Ht = 240, L = 34, R = 10, T = 10, B = 26;
  const xs = (i: number) => L + (i / Math.max(1, H.length - 1)) * (W - L - R);
  const ys = (v: number) => T + (1 - v / 100) * (Ht - T - B);
  const series: { key: keyof Data["history"][number]; label: string; color: string; w: number }[] = [
    { key: "equity", label: "Equity", color: C.indigo, w: 1.6 },
    { key: "financing", label: "Financing", color: C.amber, w: 1.6 },
    { key: "credit", label: "Credit", color: C.teal, w: 1.6 },
    { key: "score", label: "Score", color: C.red, w: 3 },
  ];
  const path = (k: keyof Data["history"][number]) => {
    let out = "", pen = false;
    H.forEach((p, i) => {
      const v = p[k] as number | null;
      if (v == null) { pen = false; return; }
      out += `${pen ? "L" : "M"}${xs(i).toFixed(1)},${ys(v).toFixed(1)} `;
      pen = true;
    });
    return out;
  };
  const ticks = H.map((p, i) => ({ p, i })).filter(({ p, i }) => i === 0 || p.date.slice(5, 7) !== H[i - 1].date.slice(5, 7));
  return (
    <figure className={s.chart}>
      <figcaption>Pillars &amp; score — last 52 weeks</figcaption>
      <svg viewBox={`0 0 ${W} ${Ht}`} role="img" aria-label="Line chart of pillar stress and score over the last 52 weeks">
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}><line x1={L} x2={W - R} y1={ys(g)} y2={ys(g)} stroke="#E9E4DC" /><text x={L - 6} y={ys(g) + 4} textAnchor="end" className={s.axis}>{g}</text></g>
        ))}
        {ticks.filter((_, n) => n % 2 === 0).map(({ p, i }) => (
          <text key={p.date} x={xs(i)} y={Ht - 6} textAnchor="middle" className={s.axis}>{MON[Number(p.date.slice(5, 7)) - 1]}</text>
        ))}
        {series.map((sr) => <path key={sr.key} d={path(sr.key)} fill="none" stroke={sr.color} strokeWidth={sr.w} strokeLinejoin="round" />)}
      </svg>
      <div className={s.legend}>{series.map((sr) => <span key={sr.key}><i style={{ background: sr.color }} />{sr.label}</span>)}</div>
    </figure>
  );
}

function WeeklyChart() {
  const Wk = d.weekly;
  const W = 720, Ht = 220, L = 34, R = 10, T = 10, B = 26;
  const bw = (W - L - R) / Wk.length;
  const ys = (v: number) => T + (1 - v / 100) * (Ht - T - B);
  return (
    <figure className={s.chart}>
      <figcaption>Weekly high score — 26 weeks</figcaption>
      <svg viewBox={`0 0 ${W} ${Ht}`} role="img" aria-label="Column chart of the weekly high stress score over 26 weeks">
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}><line x1={L} x2={W - R} y1={ys(g)} y2={ys(g)} stroke="#E9E4DC" /><text x={L - 6} y={ys(g) + 4} textAnchor="end" className={s.axis}>{g}</text></g>
        ))}
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

export default function AiImplosion() {
  const kk = d.bet[0], sj = d.bet[1];
  return (
    <main className={`container ${s.page}`}>
      <section className={s.hero}>
        <div className="eyebrow">AI bubble stress tracker</div>
        <h1>AI Implosion Dashboard</h1>
        <p>7 AI-cycle drawdowns + HY spread | Data as of {fmtDate(d.asOf)}</p>
        {(d.notes ?? []).map((n) => <p key={n} className={s.sample}>{n}</p>)}
        {d.sample && <p className={s.sample}>Sample data — illustrative prices, not real markets. Real data loads on the first automated run.</p>}
      </section>

      <section className={s.kpis}>
        <div className={`${s.card} ${s.gaugeCard}`}>
          <div className={s.label}>Stress score</div>
          <Gauge score={d.score} />
        </div>
        <div className={s.card}><div className={s.label}>Status</div><div className={s.value} style={{ color: d.implosionDate ? C.red : scoreColor(d.score) }}>{d.band}</div><div className={s.sub}>Score band</div></div>
        <div className={s.card}><div className={s.label}>Triggers</div><div className={s.value}>{d.triggers}</div><div className={s.sub}>factors at 100% stress</div></div>
        <div className={s.card}><div className={s.label}>Current level</div><div className={s.value}>{d.currentLevel}</div><div className={s.sub}>needs 5 straight trading days</div></div>
        <div className={s.card}><div className={s.label}>The bet</div><div className={s.valueSm}>KK {kk.daysLeft}d · SJ {sj.daysLeft}d</div><div className={s.sub}>Winner: <b>{d.winner}</b></div></div>
      </section>

      <h2 className={s.h2}>Factor detail</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Metric</th><th>Weight</th><th>52W high<br /><small>(HY: 52W low)</small></th><th>Current</th><th>Drawdown<br /><small>(HY: +bp vs low)</small></th><th>Calm</th><th>Trigger</th><th>Trigger price<br /><small>(HY: band)</small></th><th>Stress</th><th>Status</th></tr></thead>
          <tbody>
            {d.factors.map((f) => {
              const dd = f.type === "DD";
              return (
                <tr key={f.col}>
                  <td className={s.metric}>{f.name}<small>{f.col} · {f.pillar}</small></td>
                  <td>{pct(f.weight)}</td>
                  <td>{dd ? num(f.ref) : num(f.ref, 0)}</td>
                  <td>{dd ? num(f.current) : num(f.current, 0)}</td>
                  <td>{dd ? pct(f.move, 1) : `${f.move >= 0 ? "+" : ""}${num(f.move, 0)}`}</td>
                  <td>{dd ? pct(f.calm) : f.calm}</td>
                  <td>{dd ? pct(f.trigger) : f.trigger}</td>
                  <td>{dd ? num(f.triggerPrice ?? 0) : f.band}</td>
                  <td className={s.stressCell}><span className={s.bar}><span style={{ width: pct(f.stress, 1) }} /></span>{pct(f.stress)}</td>
                  <td><span className={`${s.pill} ${STATUS_CLASS[f.status]}`}>{f.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={s.grid2}>
        <figure className={s.chart}>
          <figcaption>Factor stress (0–100%)</figcaption>
          <div className={s.hbars}>
            {d.factors.map((f) => (
              <div key={f.col} className={s.hbar}>
                <span>{f.col}</span>
                <span className={s.track}><span style={{ width: pct(f.stress, 1), background: C.indigo }} /></span>
                <b>{pct(f.stress)}</b>
              </div>
            ))}
          </div>
        </figure>
        <div className={s.chart}>
          <h3 className={s.h3}>Levels</h3>
          <table className={s.table}>
            <thead><tr><th>Level</th><th>First date</th><th>Active now</th></tr></thead>
            <tbody>
              {d.levels.map((l) => (
                <tr key={l.level}><td className={s.metric}>{l.level} {l.name}</td><td>{fmtDate(l.firstDate)}</td><td>{l.active ? <b style={{ color: C.red }}>YES</b> : "NO"}</td></tr>
              ))}
            </tbody>
          </table>
          <p className={s.implosion}>AI Implosion date: <b>{fmtDate(d.implosionDate)}</b></p>
          <h3 className={s.h3}>The bet</h3>
          <table className={s.table}>
            <thead><tr><th>Player</th><th>Pick</th><th>Days left</th><th>Days off</th></tr></thead>
            <tbody>
              {d.bet.map((b) => (
                <tr key={b.who}><td className={s.metric}>{b.who}</td><td>{fmtDate(b.pick)}</td><td>{b.daysLeft}</td><td>{b.daysOff ?? "—"}</td></tr>
              ))}
            </tbody>
          </table>
          <p className={s.sub}>Winner: <b>{d.winner}</b> (closest pick to the Implosion date)</p>
        </div>
      </div>

      <LineChart />
      <WeeklyChart />

      <section className={s.note}>
        <h3 className={s.h3}>How it works</h3>
        <p>Drawdown = close ÷ trailing-365-day high − 1 (HY uses the spread level in bp). Stress = clamp((x − Calm) ÷ (Trigger − Calm), 0, 1). Score = weighted stress × 100. The first year of history is warm-up.</p>
        <p>Levels need 5 straight trading days: L1 Score ≥ 50 · L2 Score ≥ 60 + BIZD ≥ 80% + BKLN ≥ 50% · L3 Score ≥ 70 + SOX ≥ 83% + AIQ ≥ 80% · L4 Score ≥ 75 + NDX 100% + (HY ≥ 500bp or BIZD 100%). The Implosion date is the first day of the first L4 streak.</p>
        <div className="cta-row">
          <a className="button" href="/ai-implosion/AI_Implosion_Dashboard.xlsx" download>Download the Excel workbook</a>
        </div>
        <p className="fine">Prices: Yahoo Finance daily closes. HY spread: FRED BAMLH0A0HYM2. Updated every weekday after the US close · last run {d.generatedAt.replace("T", " ").replace("+00:00", " UTC")}. Built by KK Reddy. For information only; not financial advice.</p>
      </section>
    </main>
  );
}
