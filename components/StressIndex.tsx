"use client";

import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import s from "./StressIndex.module.css";

/* Live data published every weekday after the US close by github.com/kkreddy79/ai-implosion. */
const DATA_URL = "https://kkreddy79.github.io/ai-implosion/data.json";

type Spark = { date: string; stress: number | null };
type Factor = {
  name: string; col: string; pillar: string; weight: number; type: "DD" | "LVL";
  ref: number | null; current: number | null; move: number | null;
  calm: number; trigger: number; wcalm: number | null; wtrig: number | null;
  levelStress: number; widenStress: number | null; stress: number; status: string;
  lastDate?: string; stale?: boolean; rationale?: string; points: number; maxPoints: number;
  prevStress?: number | null; spark?: Spark[];
  plus10: { kind: "price"; drawdown: number; price: number } | { kind: "spread"; bp: number; via: string } | null;
};
type Pillars = { Equity: number | null; Financing: number | null; Credit: number | null };
type Data = {
  asOf: string; generatedAt: string; score: number | null; band: string; triggers: string; factorCount: number;
  prevDate?: string | null; prevScore?: number | null; pillars?: Pillars; prevPillars?: Pillars | null;
  levels: { level: string; firstDate: string | null; active: boolean }[];
  factors: Factor[];
  history: { date: string; equity: number | null; financing: number | null; credit: number | null; score: number | null }[];
  weekly: { weekEnding: string; high: number | null }[];
  notes?: string[]; editorNote?: string;
};

const LEVELS: Record<string, string> = { L1: "Elevated", L2: "Financing Strain", L3: "Broad Correction", L4: "Systemic Dislocation" };
const PILLAR: Record<string, string> = { Equity: "AI equities", Financing: "AI financing", Credit: "Credit markets" };
const PILLAR_KEYS = ["Equity", "Financing", "Credit"] as const;
const SHORT: Record<string, string> = {
  NDX: "Nasdaq-100", SOX: "Semiconductors", AIQ: "AI & tech ETF", DTCR: "Data-center ETF", BBB: "BBB credit spreads",
  CCC: "CCC credit spreads", BIZD: "Private-credit funds", BKLN: "Leveraged loans", HY: "High-yield spreads",
};
// What a high reading means, in plain words.
const EXPLAIN: Record<string, string> = {
  NDX: "The broad AI-era tech benchmark is falling well below its recent high.",
  SOX: "Chip stocks, the picks-and-shovels of AI, are well below their recent high.",
  AIQ: "A basket of AI and big-data companies is well below its recent high.",
  DTCR: "Data-center and digital-infrastructure stocks, the physical AI build-out, are under pressure.",
  BBB: "Investment-grade companies, including big AI spenders, are paying more to borrow.",
  CCC: "High stress in riskier corporate debt: the weakest borrowers are paying much more to borrow.",
  BIZD: "Listed private-credit lenders, big funders of tech and growth firms, are well below their high.",
  BKLN: "Leveraged loans, the funding behind riskier companies, are losing value.",
  HY: "The broad junk-bond market is demanding more to lend.",
};
const C = { red: "#DC2626", orange: "#D97706", orangeRed: "#EA580C", green: "#16A34A", indigo: "#4F46E5", amber: "#F59E0B", teal: "#0D9488", slate: "#1E293B" };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const longDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MON[m - 1]} ${y}`;
};
const shortDate = (iso: string) => { const [, m, d] = iso.split("-").map(Number); return `${d} ${MON[m - 1]}`; };
const num = (v: number, dp = 2) => v.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
const pct = (v: number, dp = 0) => `${(v * 100).toFixed(dp)}%`;
const band = (v: number | null) => (v == null ? "—" : v >= 75 ? "Critical" : v >= 50 ? "Severe" : v >= 25 ? "Elevated" : "Normal");
// One colour scale for every reading: the index (0–100) and each gauge's stress (0–100%).
const bandColor = (v: number | null) => (v == null ? C.slate : v >= 75 ? C.red : v >= 50 ? C.orangeRed : v >= 25 ? C.amber : C.green);
const stressColor = (x: number) => bandColor(x * 100);
const area = (col: string) => (["NDX", "SOX", "AIQ"].includes(col) ? "AI stocks" : col === "DTCR" ? "AI infrastructure" : "credit");

function direction(f: Factor) {
  if (f.prevStress == null) return { label: "—", cls: s.flat, arrow: "" };
  const dlt = f.stress - f.prevStress;
  if (dlt > 0.005) return { label: "Worsening", cls: s.worse, arrow: "▲" };
  if (dlt < -0.005) return { label: "Improving", cls: s.better, arrow: "▼" };
  return { label: "Unchanged", cls: s.flat, arrow: "●" };
}

/* ---------- Layer 1 pieces ---------- */
function Meter({ score }: { score: number | null }) {
  const v = Math.max(0, Math.min(100, score ?? 0));
  return (
    <div className={s.meter} role="img" aria-label={`Index ${score ?? "n/a"} on a 0 to 100 scale`}>
      <div className={s.meterBar}>
        <span style={{ background: "#BBF7D0" }} /><span style={{ background: "#FDE68A" }} /><span style={{ background: "#FDBA74" }} /><span style={{ background: "#FCA5A5" }} />
        <i style={{ left: `${v}%` }} />
      </div>
      <div className={s.meterLabels}><span>Normal<small>0–24</small></span><span>Elevated<small>25–49</small></span><span>Severe<small>50–74</small></span><span>Critical<small>75–100</small></span></div>
    </div>
  );
}

function hook(d: Data) {
  const top = [...d.factors].sort((a, b) => b.stress - a.stress)[0];
  const hot = d.factors.filter((f) => f.stress >= 0.5).length;
  const sc = d.score ?? 0;
  if (top && top.stress >= 0.75 && sc < 50) {
    return {
      head: `${sc < 25 ? "Calm" : "Elevated"} index. Stressed ${area(top.col)}.`,
      line: `The broad index is ${band(d.score).toLowerCase()}, but one ${area(top.col) === "credit" ? "credit " : ""}gauge is flashing a warning.`,
    };
  }
  if (sc >= 50) return { head: "Stress is spreading.", line: `${hot} of ${d.factorCount} gauges are above 50% stress.` };
  if (hot === 0) return { head: "Calm across the board.", line: "No gauge is above 50% stress." };
  return { head: "Pockets of stress.", line: `${hot} of ${d.factorCount} gauges are above 50% stress, but the index stays ${band(d.score).toLowerCase()}.` };
}

// Why a stressed gauge matters when the rest of the index is calm.
const CONTRAST: Record<string, string> = {
  CCC: "The broad picture is calm; the weakest borrowers are not.",
  HY: "Stocks may be calm, but junk-bond lenders are getting nervous.",
  BBB: "Even investment-grade borrowers, including big AI spenders, are paying up.",
  BIZD: "The broad picture is calm; private lenders to tech and growth firms are not.",
  BKLN: "The broad picture is calm; the loan market behind riskier companies is not.",
  DTCR: "The broad picture is calm; the physical AI build-out is under pressure.",
  SOX: "The broad picture is calm; chip stocks, the front line of AI, are not.",
  NDX: "Credit is calm, but the AI-era tech benchmark is under real pressure.",
  AIQ: "Credit is calm, but AI-focused stocks are under real pressure.",
};

function todaysRead(d: Data) {
  const top = [...d.factors].sort((a, b) => b.stress - a.stress)[0];
  const movers = d.factors.filter((f) => f.prevStress != null).map((f) => ({ f, dlt: f.stress - (f.prevStress ?? 0) }))
    .filter((m) => Math.abs(m.dlt) >= 0.01 && m.f.col !== top?.col).sort((a, b) => Math.abs(b.dlt) - Math.abs(a.dlt));
  const sc = d.score, ch = d.prevScore != null && sc != null ? sc - d.prevScore : null;
  const parts: string[] = [];
  const concentrated = top && top.stress >= 0.75 && (sc ?? 0) < 50;
  if (ch != null && sc != null) {
    if (ch < 0) parts.push(`The index eased to ${sc}${concentrated ? ", but the relief is uneven." : "."}`);
    else if (ch > 0) parts.push(`The index rose to ${sc}${concentrated ? ", led by a single pocket of stress." : "."}`);
    else parts.push(`The index held at ${sc}.`);
  }
  const m = movers[0];
  const moveTxt = m ? `${SHORT[m.f.col]} stress ${m.dlt > 0 ? "rose" : "fell"} ${Math.abs(m.dlt * 100).toFixed(0)} points` : "";
  if (concentrated && top) {
    const still = `${SHORT[top.col]} remain at ${pct(top.stress)} stress`;
    parts.push(m ? `${moveTxt} while ${still}.` : `${still}.`);
    parts.push(CONTRAST[top.col] ?? "");
  } else if ((sc ?? 0) >= 50) {
    const hot = d.factors.filter((f) => f.stress >= 0.5).length;
    parts.push(`${hot} of ${d.factorCount} gauges are above 50% stress${m ? `; ${moveTxt.charAt(0).toLowerCase()}${moveTxt.slice(1)}` : ""}.`);
    parts.push("Stress is no longer confined to one corner of the market.");
  } else if (m) {
    parts.push(`${moveTxt}.`);
    parts.push("No single gauge is flashing a warning.");
  }
  return parts.filter(Boolean).join(" ");
}

/* ---------- Layer 2 pieces ---------- */
function Sparkline({ data }: { data: Spark[] }) {
  const W = 300, H = 60, P = 4;
  const pts = data.map((p, i) => ({ x: P + (i / Math.max(1, data.length - 1)) * (W - 2 * P), y: p.stress == null ? null : P + (1 - p.stress) * (H - 2 * P) }));
  let path = "", pen = false;
  pts.forEach((p) => { if (p.y == null) { pen = false; return; } path += `${pen ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)} `; pen = true; });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.spark} role="img" aria-label="Stress over the last 52 weeks">
      <line x1={P} x2={W - P} y1={P + 0.5 * (H - 2 * P)} y2={P + 0.5 * (H - 2 * P)} stroke="#E9E4DC" strokeDasharray="3 3" />
      <path d={path} fill="none" stroke={C.indigo} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function plus10(f: Factor) {
  const p = f.plus10;
  if (!p) return f.points >= f.maxPoints - 0.05 ? "Already at its maximum." : `It can’t add 10 points on its own (at most +${(f.maxPoints - f.points).toFixed(1)}).`;
  if (p.kind === "price") return `It would add 10 points if it fell to ${pct(p.drawdown, 1)} from its 2-year high (about ${num(p.price)}).`;
  return `It would add 10 points if the spread reached ${num(p.bp, 0)} bp.`;
}

function GaugeCard({ f }: { f: Factor }) {
  const dd = f.type === "DD";
  const dir = direction(f);
  return (
    <details className={s.gaugeRow}>
      <summary>
        <span className={s.gName}>{SHORT[f.col] ?? f.name}{f.stale && <em className={s.staleTag}>stale</em>}</span>
        <span className={s.gBar}><span style={{ width: pct(f.stress, 1), background: stressColor(f.stress) }} /></span>
        <span className={s.gPct}>{pct(f.stress)}</span>
        <span className={`${s.gDir} ${dir.cls}`} title={dir.label}><b aria-hidden="true">{dir.arrow}</b> <span className={s.gDirTxt}>{dir.label}</span></span>
      </summary>
      <div className={s.gBody}>
        <p>{f.rationale}</p>
        <dl className={s.facts}>
          <div><dt>Current</dt><dd>{f.current == null ? "—" : dd ? num(f.current) : `${num(f.current, 0)} bp`}</dd></div>
          <div><dt>{dd ? "From 2-year high" : "Above 52-week low"}</dt><dd>{f.move == null ? "—" : dd ? pct(f.move, 1) : `+${num(f.move, 0)} bp`}</dd></div>
          <div><dt>Calm → trigger</dt><dd>{dd ? `${pct(f.calm)} → ${pct(f.trigger)}` : `${f.calm} → ${f.trigger} bp`}{!dd && <small>or a jump of +{f.wcalm} → +{f.wtrig} bp</small>}</dd></div>
          <div><dt>Index points</dt><dd>{f.points.toFixed(1)} <small>of {f.maxPoints.toFixed(0)} possible · weight {pct(f.weight)}</small></dd></div>
          {!dd && <div><dt>Level · widening</dt><dd>{pct(f.levelStress)} · {pct(f.widenStress ?? 0)} <small>the higher one counts</small></dd></div>}
          <div><dt>Data as of</dt><dd className={f.stale ? s.staleText : undefined}>{longDate(f.lastDate)}{f.stale ? " (stale)" : ""}</dd></div>
        </dl>
        {f.spark && f.spark.length > 2 && <><div className={s.sparkLabel}>Stress, last 52 weeks <small>(dashed line = 50%)</small></div><Sparkline data={f.spark} /></>}
        <p className={s.small}>{plus10(f)}</p>
      </div>
    </details>
  );
}

function TrendChart({ H, score }: { H: Data["history"]; score: number | null }) {
  const [show, setShow] = useState({ equity: false, financing: false, credit: false });
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, Ht = 240, L = 34, R = 10, T = 10, B = 26;
  const xs = (i: number) => L + (i / Math.max(1, H.length - 1)) * (W - L - R);
  const ys = (v: number) => T + (1 - v / 100) * (Ht - T - B);
  const path = (k: "score" | "equity" | "financing" | "credit") => {
    let out = "", pen = false;
    H.forEach((p, i) => { const v = p[k]; if (v == null) { pen = false; return; } out += `${pen ? "L" : "M"}${xs(i).toFixed(1)},${ys(v).toFixed(1)} `; pen = true; });
    return out;
  };
  const comps = [
    { key: "equity", label: "AI equities", color: C.indigo },
    { key: "financing", label: "AI financing", color: C.amber },
    { key: "credit", label: "Credit markets", color: C.teal },
  ] as const;
  const ticks = H.map((p, i) => ({ p, i })).filter(({ p, i }) => i === 0 || p.date.slice(5, 7) !== H[i - 1].date.slice(5, 7));
  const scored = H.filter((p) => p.score != null) as (Data["history"][number] & { score: number })[];
  const hi = scored.reduce<typeof scored[number] | null>((m, p) => (!m || p.score > m.score ? p : m), null);
  const lo = scored.reduce<typeof scored[number] | null>((m, p) => (!m || p.score < m.score ? p : m), null);
  const avg = scored.length ? scored.reduce((t, p) => t + p.score, 0) / scored.length : null;
  const below = score != null && scored.length ? Math.round((100 * scored.filter((p) => p.score < score).length) / scored.length) : null;
  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((x - L) / (W - L - R)) * (H.length - 1));
    setHover(i >= 0 && i < H.length ? i : null);
  };
  const hp = hover != null ? H[hover] : null;
  return (
    <figure className={s.panel}>
      <figcaption className={s.chartHead}>Is AI market stress building?<small>The index over the last 52 weeks. Touch or hover for any day; add the components to see where stress comes from.</small></figcaption>
      <svg viewBox={`0 0 ${W} ${Ht}`} role="img" aria-label="Index over the last 52 weeks" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} style={{ touchAction: "pan-y" }}>
        {[25, 50, 75].map((b) => <rect key={b} x={L} width={W - L - R} y={ys(b + 25)} height={ys(b) - ys(b + 25)} fill={b === 75 ? "#FEF2F2" : b === 50 ? "#FFF7ED" : "#FFFBEB"} />)}
        {[0, 25, 50, 75, 100].map((g) => <g key={g}><line x1={L} x2={W - R} y1={ys(g)} y2={ys(g)} stroke="#E9E4DC" /><text x={L - 6} y={ys(g) + 4} textAnchor="end" className={s.axis}>{g}</text></g>)}
        {ticks.filter((_, n) => n % 2 === 0).map(({ p, i }) => <text key={p.date} x={xs(i)} y={Ht - 6} textAnchor="middle" className={s.axis}>{MON[Number(p.date.slice(5, 7)) - 1]}</text>)}
        {comps.map((c) => show[c.key] && <path key={c.key} d={path(c.key)} fill="none" stroke={c.color} strokeWidth="1.6" strokeLinejoin="round" />)}
        <path d={path("score")} fill="none" stroke={C.slate} strokeWidth="3" strokeLinejoin="round" />
        {hp && hover != null && (
          <g>
            <line x1={xs(hover)} x2={xs(hover)} y1={T} y2={Ht - B} stroke="#94A3B8" strokeDasharray="3 3" />
            {hp.score != null && <circle cx={xs(hover)} cy={ys(hp.score)} r="5" fill={C.slate} />}
          </g>
        )}
      </svg>
      <div className={s.readout} aria-live="polite">
        {hp ? <><b>{longDate(hp.date)}</b> · Index {hp.score ?? "—"}
          {comps.filter((c) => show[c.key]).map((c) => <span key={c.key}> · {c.label} {hp[c.key] == null ? "—" : (hp[c.key] as number).toFixed(0)}</span>)}</>
          : <span>&nbsp;</span>}
      </div>
      <div className={s.toggles}>
        <span className={s.toggleOn}><i style={{ background: C.slate }} />Index</span>
        {comps.map((c) => (
          <button key={c.key} type="button" aria-pressed={show[c.key]} className={show[c.key] ? s.toggleOn : s.toggle}
            onClick={() => setShow((v) => ({ ...v, [c.key]: !v[c.key] }))}>
            <i style={{ background: c.color }} />{c.label}
          </button>
        ))}
      </div>
      {hi && lo && avg != null && score != null && (
        <dl className={s.compare}>
          <div><dt>Today</dt><dd>{score}</dd></div>
          <div><dt>52-week high</dt><dd>{hi.score}<small>{longDate(hi.date)}</small></dd></div>
          <div><dt>52-week low</dt><dd>{lo.score}<small>{longDate(lo.date)}</small></dd></div>
          <div><dt>52-week average</dt><dd>{avg.toFixed(0)}</dd></div>
          {below != null && <p className={s.compareNote}>Today’s reading is higher than {below}% of the past year’s readings{score < 25 ? ", even though it is still in the normal band" : ""}.</p>}
        </dl>
      )}
    </figure>
  );
}

function WeeklyChart({ Wk }: { Wk: Data["weekly"] }) {
  const W = 720, Ht = 200, L = 34, R = 10, T = 10, B = 26;
  const bw = (W - L - R) / Wk.length;
  const ys = (v: number) => T + (1 - v / 100) * (Ht - T - B);
  return (
    <svg viewBox={`0 0 ${W} ${Ht}`} role="img" aria-label="Weekly high of the index over 26 weeks">
      {[0, 25, 50, 75, 100].map((g) => <g key={g}><line x1={L} x2={W - R} y1={ys(g)} y2={ys(g)} stroke="#E9E4DC" /><text x={L - 6} y={ys(g) + 4} textAnchor="end" className={s.axis}>{g}</text></g>)}
      {Wk.map((w, i) => (
        <g key={w.weekEnding}>
          {w.high != null && <rect x={L + i * bw + bw * 0.15} width={bw * 0.7} y={ys(w.high)} height={Math.max(0, ys(0) - ys(w.high))} rx="2" fill={bandColor(w.high)}><title>{`Week ending ${longDate(w.weekEnding)}: ${w.high}`}</title></rect>}
          {i % 4 === 0 && <text x={L + i * bw + bw / 2} y={Ht - 6} textAnchor="middle" className={s.axis}>{shortDate(w.weekEnding)}</text>}
        </g>
      ))}
    </svg>
  );
}

/* ---------- Page ---------- */
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

  const h = hook(d);
  const sorted = [...d.factors].sort((a, b) => b.stress - a.stress);
  const signal = sorted[0] && sorted[0].stress >= 0.5 ? sorted[0] : null;
  const change = d.prevScore != null && d.score != null ? d.score - d.prevScore : null;
  const refreshed = new Date(d.generatedAt);
  const refreshedTxt = isNaN(refreshed.getTime()) ? d.generatedAt
    : refreshed.toLocaleString("en-US", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  const movers = d.factors.filter((f) => f.prevStress != null)
    .map((f) => ({ f, dlt: f.stress - (f.prevStress ?? 0) })).filter((m) => Math.abs(m.dlt) >= 0.01)
    .sort((a, b) => Math.abs(b.dlt) - Math.abs(a.dlt));
  const active = [...d.levels].reverse().find((l) => l.active);
  const spreadDates = d.factors.filter((f) => f.type === "LVL" && f.lastDate).map((f) => f.lastDate as string).sort();
  const spreadLag = spreadDates.length && spreadDates[0] < d.asOf ? spreadDates[0] : null;
  const pw: Record<string, number> = {};
  d.factors.forEach((f) => { pw[f.pillar] = (pw[f.pillar] ?? 0) + f.weight; });
  const ex = d.factors.filter((f) => f.type === "LVL" && f.current != null).sort((a, b) => b.stress - a.stress)[0];

  return (
    <main className={`container ${s.page}`}>
      {/* Layer 1 — the daily snapshot */}
      <header className={s.top}>
        <div className="eyebrow">KKReckons · Markets</div>
        <h1>AI Market Stress Index</h1>
        <p className={s.question}>Is the AI boom showing cracks beneath the surface?</p>
        <p className={s.meta}>Market data as of {longDate(d.asOf)} (US close){spreadLag ? ` · credit spreads as of ${longDate(spreadLag)} (published a day later)` : ""} · Refreshed {refreshedTxt}</p>
        {(d.notes ?? []).map((n) => <p key={n} className={s.note}>{n}</p>)}
      </header>

      <section className={s.hero}>
        <div className={s.scoreCard}>
          <div className={s.label}>Market stress</div>
          <div className={s.scoreRow}>
            <span className={s.score} style={{ color: bandColor(d.score) }}>{d.score ?? "—"}</span>
            <span className={s.outOf}>/ 100</span>
            <span className={s.badge} style={{ background: bandColor(d.score) }}>{band(d.score).toUpperCase()}</span>
          </div>
          <Meter score={d.score} />
          {change != null && d.prevScore != null && (
            <p className={s.prev}>Previous close ({longDate(d.prevDate)}): {d.prevScore} · Change: {change > 0 ? `+${change}` : change === 0 ? "0" : `−${Math.abs(change)}`}</p>
          )}
          <p className={s.interp}>{h.line}</p>
          <p className={s.alert}>Alert level: <b>{active ? `${active.level} ${LEVELS[active.level]}` : "None"}</b></p>
        </div>

        <div className={s.hookCol}>
          <h2 className={s.hook}>{h.head}</h2>
          {signal && (
            <div className={s.signal} style={{ borderColor: stressColor(signal.stress) }}>
              <div className={s.label}>The signal to watch</div>
              <div className={s.signalRow}><span className={s.signalName}>{SHORT[signal.col]}</span><span className={s.signalPct} style={{ color: stressColor(signal.stress) }}>{pct(signal.stress)}</span></div>
              <p>{EXPLAIN[signal.col]}</p>
            </div>
          )}
          <div className={s.read}>
            <div className={s.label}>Today’s read</div>
            <p>{todaysRead(d)}</p>
            {d.editorNote && <p className={s.editor}><b>KK’s note:</b> {d.editorNote}</p>}
          </div>
        </div>
      </section>

      <h2 className={s.h2}>Where is the pressure?</h2>
      <section className={s.pillars}>
        {PILLAR_KEYS.map((p) => {
          const v = d.pillars?.[p] ?? null, pv = d.prevPillars?.[p] ?? null;
          const top = d.factors.filter((f) => f.pillar === p).sort((a, b) => b.stress - a.stress)[0];
          const dv = v != null && pv != null ? v - pv : null;
          return (
            <div key={p} className={s.pillar}>
              <div className={s.label}>{PILLAR[p]}</div>
              <div className={s.sublabel}>Component stress score · {pct(pw[p] ?? 0)} of the index</div>
              <div className={s.pillarVal}>{v == null ? "—" : v.toFixed(0)}<small>/100</small>
                {dv != null && Math.abs(dv) >= 0.5 && <span className={dv > 0 ? s.worse : s.better}> {dv > 0 ? "▲" : "▼"} {Math.abs(dv).toFixed(0)} {dv > 0 ? "rising" : "easing"}</span>}
              </div>
              <span className={s.gBar}><span style={{ width: `${Math.min(100, v ?? 0)}%`, background: stressColor((v ?? 0) / 100) }} /></span>
              {top && top.stress > 0 && <p className={s.small}>{signal && top.col === signal.col ? `Driven by ${SHORT[top.col]}` : `Most stressed: ${SHORT[top.col]} · ${pct(top.stress)}`}</p>}
            </div>
          );
        })}
      </section>
      {d.pillars && d.pillars.Equity != null && d.pillars.Financing != null && d.pillars.Credit != null && (
        <p className={s.small}>Each component score is the weighted average stress of its gauges (0–100). The index combines them by weight: {PILLAR_KEYS.map((p) => `${pct(pw[p] ?? 0)} × ${(d.pillars?.[p] ?? 0).toFixed(1)}`).join(" + ")} = {PILLAR_KEYS.reduce((t, p) => t + (pw[p] ?? 0) * (d.pillars?.[p] ?? 0), 0).toFixed(1)}, rounded to {d.score}.</p>
      )}
      <p className={s.disclaim}>The index measures defined market-stress signals. A normal reading is not a prediction that markets are safe or will rise.</p>

      {/* Layer 2 — the evidence */}
      <p className={s.legendLine}><span className={s.swatches}><i style={{ background: C.green }} /><i style={{ background: C.amber }} /><i style={{ background: C.orangeRed }} /><i style={{ background: C.red }} /></span>Colour shows how high stress is: green low → red severe. Arrows show direction: <span className={s.worse}>▲ rising stress</span> · <span className={s.better}>▼ easing</span>.</p>
      <h2 className={s.h2} id="evidence">What changed since {d.prevDate ? longDate(d.prevDate) : "the previous session"}</h2>
      {movers.length ? (
        <ul className={s.changes}>
          {movers.slice(0, 5).map(({ f, dlt }) => (
            <li key={f.col}><span className={dlt > 0 ? s.worse : s.better}>{dlt > 0 ? "▲ Rose" : "▼ Eased"} {Math.abs(dlt * 100).toFixed(0)} pts</span> {SHORT[f.col]} — now {pct(f.stress)} stress</li>
          ))}
        </ul>
      ) : <p className={s.small}>No gauge moved by more than 1 point of stress.</p>}

      <h2 className={s.h2}>The nine gauges</h2>
      <p className={s.small}>Sorted by stress. Tap a gauge for its definition, 52-week history, thresholds and contribution to the index.</p>
      <div className={s.gauges}>{sorted.map((f) => <GaugeCard key={f.col} f={f} />)}</div>

      <TrendChart H={d.history} score={d.score} />

      <details className={s.fold}>
        <summary>Weekly highs and alert levels</summary>
        <div className={s.foldBody}>
          <div className={s.label}>Weekly high of the index, last 26 weeks</div>
          <WeeklyChart Wk={d.weekly} />
          <div className={s.label} style={{ marginTop: 16 }}>Alert levels</div>
          <ul className={s.levelList}>
            {d.levels.map((l) => (
              <li key={l.level}><b>{l.level} {LEVELS[l.level]}</b><span>{l.active ? "Active now" : l.firstDate ? `First confirmed ${longDate(l.firstDate)}` : "Not triggered"}</span></li>
            ))}
          </ul>
          <p className={s.small}>Each level needs the index and specific gauges to stay high for 5 trading days in a row.</p>
        </div>
      </details>

      {/* Layer 3 — the methodology */}
      <h2 className={s.h2}>Methodology</h2>
      <details className={s.fold}>
        <summary>How the index works</summary>
        <div className={s.foldBody}>
          <p>Every weekday after the US close, the index reads {d.factorCount} market gauges in three groups: <b>AI equities</b> ({pct(pw.Equity ?? 0)}), <b>the financing behind the AI build-out</b> ({pct(pw.Financing ?? 0)}) and <b>the wider credit market</b> ({pct(pw.Credit ?? 0)}).</p>
          <p>Each gauge gets a stress reading from 0% (calm) to 100% (its trigger level). For stocks and funds it is how far they have fallen from their 2-year high. For credit spreads — the extra interest riskier borrowers pay — it is how high they are, or how fast they have jumped, whichever is worse.</p>
          <p>The index is the weighted average of those readings, from 0 to 100. Alert levels need the index and specific gauges to stay high for 5 trading days in a row, so a one-day wobble never counts.</p>
          {ex && ex.stress > 0 && ex.current != null && ex.ref != null && ex.move != null && (
            <p><b>Today’s example:</b> {SHORT[ex.col]} stand at {num(ex.current, 0)} bp, {num(ex.move, 0)} bp above their 52-week low of {num(ex.ref, 0)}.{" "}
              {(ex.widenStress ?? 0) >= ex.levelStress ? <>That fast climb gives a widening reading of {pct(ex.widenStress ?? 0)}, above the level reading of {pct(ex.levelStress)}.</> : <>That is a level reading of {pct(ex.levelStress)}.</>}
              {" "}With a {pct(ex.weight)} weight it adds {ex.points.toFixed(1)} points to today’s index of {d.score}.</p>
          )}
        </div>
      </details>
      <details className={s.fold}>
        <summary>Why each indicator is weighted this way</summary>
        <div className={s.foldBody}>
          <ul className={s.whyList}>
            {d.factors.map((f) => (
              <li key={f.col}><b>{SHORT[f.col]} · {pct(f.weight)}</b><span>{f.rationale}</span><small>{plus10(f)}</small></li>
            ))}
          </ul>
          <p className={s.small}>Replayed on daily data since 1999, a lower-redundancy weighting caught the same severe episodes but raised more false alarms, so these weights were kept.</p>
        </div>
      </details>
      <details className={s.fold}>
        <summary>Exact rules, thresholds and data sources</summary>
        <div className={s.foldBody}>
          <p><b>Prices</b> (Nasdaq-100, semiconductors, AI, data-center, BDC and loan ETFs): drawdown = dividend-adjusted close ÷ highest close of the last 2 years − 1; stress = clamp((drawdown − calm) ÷ (trigger − calm), 0, 1).</p>
          <p><b>Credit spreads</b> (BBB, CCC, high yield, in bp): stress = the higher of the level test, clamp((spread − calm) ÷ (trigger − calm)), and the widening test, clamp((spread − 52-week low − widen calm) ÷ (widen trigger − widen calm)).</p>
          <p><b>Index</b> = Σ(weight × stress) ÷ Σ weights × 100, rounded. A gauge’s points = its weight share × its stress × 100. Blank days carry the last value; a gauge not updated for more than 3 trading days is flagged stale.</p>
          <p><b>Alert levels</b> (5 straight trading days): L1 Elevated: index ≥ 50 · L2 Financing Strain: index ≥ 60 and (private credit ≥ 80% with loans ≥ 50%, or CCC ≥ 80%) · L3 Broad Correction: index ≥ 70, semiconductors ≥ 83%, AI ETF ≥ 80% · L4 Systemic Dislocation: index ≥ 75, Nasdaq-100 at 100%, and high-yield ≥ 500 bp or private credit at 100%. Replayed on daily data since 1999, L4 confirmed only in the dot-com bust, the 2008 crisis and the 2022 bear market.</p>
          <p><b>Sources:</b> Yahoo Finance dividend-adjusted daily closes (^NDX, ^SOX, AIQ, DTCR, BIZD, BKLN); ICE BofA option-adjusted spreads via FRED (BAMLC0A4CBBB, BAMLH0A3HYC, BAMLH0A0HYM2).</p>
        </div>
      </details>

      <p className={s.fine}>An indicator of market conditions, not a forecast. For information only; not financial advice. Market data as of {longDate(d.asOf)} · refreshed {refreshedTxt}.</p>
    </main>
  );
}
