"use client";

import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import s from "./StressIndex.module.css";

/* Live data published every weekday after the US close by github.com/kkreddy79/ai-implosion. */
const BASE = "https://kkreddy79.github.io/ai-implosion";
const DATA_URL = `${BASE}/data.json`;
const BACKTEST_URL = `${BASE}/backtest.json`;

type Spark = { date: string; stress: number | null };
type Factor = {
  name: string; col: string; pillar: string; weight: number; type: "DD" | "LVL"; source?: string;
  ref: number | null; current: number | null; move: number | null;
  calm: number; trigger: number; wcalm: number | null; wtrig: number | null;
  levelStress: number; widenStress: number | null; stress: number; status: string;
  lastDate?: string; stale?: boolean; rationale?: string; descriptor?: string; points: number; maxPoints: number;
  prevStress?: number | null; spark?: Spark[];
  plus10: { kind: "price"; drawdown: number; price: number } | { kind: "spread"; bp: number; via: string } | null;
};
type Pillars = { Equity: number | null; Financing: number | null; Credit: number | null };
type Data = {
  asOf: string; generatedAt: string; score: number | null; factorCount: number;
  prevDate?: string | null; prevScore?: number | null; pillars?: Pillars; prevPillars?: Pillars | null;
  levels: { level: string; firstDate: string | null; active: boolean }[];
  factors: Factor[];
  history: { date: string; equity: number | null; financing: number | null; credit: number | null; score: number | null }[];
  weekly: { weekEnding: string; high: number | null }[];
  notes?: string[]; editorNote?: string;
  model?: { version: string; changed: string; note?: string; changelog: { version: string; date: string; note: string }[] };
};
type Backtest = {
  dataStart: string; dataEnd: string; firstScored: string; scoredDays: number;
  episodes: { name: string; description: string; ndxPeak: string; ndxTrough: string; ndxDrawdown: number; maxScore: number | null;
    levels: { level: string; date: string | null; daysFromPeak: number | null }[]; dataQuality?: string; standInShare?: number }[];
  outsideEpisodes: { level: string; date: string; days: number; score: number }[];
  comparison?: { name: string; outsideByLevel: number[]; episodes: { name: string; levels: { date: string | null }[] }[] }[];
  alertOutcomes?: { level: string; date: string; fwdWorst: number; kind: "during" | "followed" | "false"; complete: boolean }[];
  nasdaqDeclines?: { from: string; to: string; worst: number; alerted: boolean; firstAlert: string | null }[];
  outcomeRule?: { horizonDays: number; fall: number };
  sensitivity?: { name: string; latestScore: number | null; l4Episodes: string[]; outsideByLevel: number[] }[];
};

// Formal alert names. L1 is "Stress Watch" so it is not confused with the "Elevated" stress band.
const ALERTS: Record<string, string> = { L1: "Stress Watch", L2: "Financing Strain", L3: "Broad Correction", L4: "Systemic Dislocation" };
const PILLAR: Record<string, string> = { Equity: "AI equities", Financing: "AI financing", Credit: "Credit markets" };
const PILLAR_KEYS = ["Equity", "Financing", "Credit"] as const;
const SHORT: Record<string, string> = {
  NDX: "Nasdaq-100", SOX: "Semiconductors", AIQ: "AI & tech ETF", DTCR: "Data-center ETF", BBB: "BBB credit spreads",
  CCC: "CCC credit spreads", BIZD: "Listed BDCs", BKLN: "Leveraged loans", HY: "High-yield spreads",
};
const C = { red: "#DC2626", orangeRed: "#EA580C", green: "#16A34A", amber: "#F59E0B", indigo: "#4F46E5", teal: "#0D9488", slate: "#1E293B" };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const longDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MON[m - 1]} ${y}`;
};
const shortDate = (iso: string) => { const [, m, d] = iso.split("-").map(Number); return `${d} ${MON[m - 1]}`; };
const num = (v: number, dp = 2) => v.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
const pct = (v: number, dp = 0) => `${(v * 100).toFixed(dp)}%`;
const s100 = (x: number) => Math.round(x * 100); // gauge stress as a 0–100 score
// Stress bands describe the index reading (0–100).
const band = (v: number | null) => (v == null ? "—" : v >= 75 ? "Critical" : v >= 50 ? "Severe" : v >= 25 ? "Elevated" : "Normal");
// One colour scale for every reading: the index and each gauge's 0–100 stress score.
const bandColor = (v: number | null) => (v == null ? C.slate : v >= 75 ? C.red : v >= 50 ? C.orangeRed : v >= 25 ? C.amber : C.green);
const stressColor = (x: number) => bandColor(x * 100);
// The same bands label the index and every gauge score.
const gaugeWord = (x: number) => band(s100(x));
const an = (n: number) => (/^(8|11|18)/.test(String(n)) ? "an" : "a");
const sourceLink = (src?: string) => {
  if (!src) return null;
  const [kind, id] = src.split(" ");
  if (kind === "FRED") return { label: `FRED ${id}`, url: `https://fred.stlouisfed.org/series/${id}` };
  return { label: `Yahoo Finance ${id}`, url: `https://finance.yahoo.com/quote/${encodeURIComponent(id)}` };
};
const area = (col: string) => (["NDX", "SOX", "AIQ"].includes(col) ? "AI stocks" : col === "DTCR" ? "AI infrastructure" : "credit");
const weekdaysBetween = (a: string, b: string) => {
  let n = 0; const d = new Date(`${a}T00:00:00Z`); const end = new Date(`${b}T00:00:00Z`);
  while (d < end) { d.setUTCDate(d.getUTCDate() + 1); if (d.getUTCDay() % 6 !== 0) n++; }
  return n;
};

function direction(f: Factor) {
  if (f.prevStress == null) return { label: "No prior reading", cls: s.flat, arrow: "" };
  const dlt = f.stress - f.prevStress;
  if (dlt > 0.005) return { label: "Stress rising", cls: s.worse, arrow: "▲" };
  if (dlt < -0.005) return { label: "Stress easing", cls: s.better, arrow: "▼" };
  return { label: "Unchanged", cls: s.flat, arrow: "●" };
}

/* ---------- Layer 1 ---------- */
function Meter({ score }: { score: number | null }) {
  const v = Math.max(0, Math.min(100, score ?? 0));
  return (
    <div className={s.meter} role="img" aria-label={`Index ${score ?? "n/a"} on a 0 to 100 scale`}>
      <div className={s.meterBar}>
        <span style={{ background: "#BBF7D0" }} /><span style={{ background: "#FDE68A" }} /><span style={{ background: "#FDBA74" }} /><span style={{ background: "#FCA5A5" }} />
        <i style={{ left: `${v}%` }} />
      </div>
      <div className={s.meterLabels}>
        {[["Normal", "0–24"], ["Elevated", "25–49"], ["Severe", "50–74"], ["Critical", "75–100"]].map(([n, r]) => (
          <span key={n} className={score != null && band(score) === n ? s.meterOn : undefined}>{n}<small>{r}</small></span>
        ))}
      </div>
    </div>
  );
}

function hook(d: Data) {
  const top = [...d.factors].sort((a, b) => b.stress - a.stress)[0];
  const hot = d.factors.filter((f) => f.stress >= 0.5).length;
  const sc = d.score ?? 0;
  if (top && top.stress >= 0.75 && sc < 50)
    return { head: `${sc < 25 ? "Calm" : "Elevated"} index. Stressed ${area(top.col)}.`, line: `Overall stress is ${band(d.score).toLowerCase()}, but one ${area(top.col) === "credit" ? "credit " : ""}gauge is flashing a warning.` };
  if (sc >= 50) return { head: "Stress is spreading.", line: `${hot} of ${d.factorCount} gauges score 50 or more out of 100.` };
  if (hot === 0) return { head: "Calm across the board.", line: "No gauge scores above 50 out of 100." };
  return { head: "Pockets of stress.", line: `${hot} of ${d.factorCount} gauges score 50 or more out of 100, but the index stays ${band(d.score).toLowerCase()}.` };
}

// Why a stressed gauge matters when the rest of the index is calm.
const CONTRAST: Record<string, string> = {
  CCC: "The broad picture is calm; the weakest borrowers are not.",
  HY: "Stocks may be calm, but junk-bond lenders are getting cautious.",
  BBB: "Even investment-grade borrowers are paying more to borrow.",
  BIZD: "The broad picture is calm; listed private-credit lenders are not.",
  BKLN: "The broad picture is calm; the loan market behind riskier companies is not.",
  DTCR: "The broad picture is calm; the physical AI build-out is under pressure.",
  SOX: "The broad picture is calm; chip stocks are not.",
  NDX: "Credit is calm, but the large-cap tech benchmark is under real pressure.",
  AIQ: "Credit is calm, but AI-focused stocks are under real pressure.",
};

function todaysRead(d: Data) {
  const top = [...d.factors].sort((a, b) => b.stress - a.stress)[0];
  const movers = d.factors.filter((f) => f.prevStress != null).map((f) => ({ f, dlt: f.stress - (f.prevStress ?? 0) }))
    .filter((m) => Math.abs(m.dlt) >= 0.01 && m.f.col !== top?.col).sort((a, b) => Math.abs(b.dlt) - Math.abs(a.dlt));
  const sc = d.score, ch = d.prevScore != null && sc != null ? sc - d.prevScore : null;
  const m = movers[0];
  const verb = ch == null ? `The index is at ${sc}` : ch < 0 ? `The index eased to ${sc}` : ch > 0 ? `The index rose to ${sc}` : `The index held at ${sc}`;
  const why = m ? ` as ${SHORT[m.f.col]} stress ${m.dlt > 0 ? "rose" : "fell"} ${Math.abs(s100(m.dlt))} points` : "";
  const concentrated = top && top.stress >= 0.75 && (sc ?? 0) < 50;
  if (concentrated && top) return `${verb}${why}, but ${SHORT[top.col]} remain at ${s100(top.stress)}/100. ${CONTRAST[top.col] ?? ""}`;
  if ((sc ?? 0) >= 50) return `${verb}${why}. Stress is no longer confined to one corner of the market.`;
  return `${verb}${why}. No single gauge is flashing a warning.`;
}

/* ---------- Layer 2 ---------- */
function Sparkline({ data }: { data: Spark[] }) {
  const W = 600, H = 70, P = 4;
  const pts = data.map((p, i) => ({ x: P + (i / Math.max(1, data.length - 1)) * (W - 2 * P), y: p.stress == null ? null : P + (1 - p.stress) * (H - 2 * P) }));
  let path = "", pen = false;
  pts.forEach((p) => { if (p.y == null) { pen = false; return; } path += `${pen ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)} `; pen = true; });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.spark} preserveAspectRatio="none" role="img" aria-label="Stress score over the last 52 weeks">
      <line x1={P} x2={W - P} y1={H / 2} y2={H / 2} stroke="#D6D0C4" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
      <path d={path} fill="none" stroke={C.indigo} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function plus10(f: Factor) {
  const p = f.plus10;
  const room = f.maxPoints - f.points;
  const now = `${f.points.toFixed(1)} today`;
  if (!p) return room < 0.05 ? `Already contributes its maximum of ${f.maxPoints.toFixed(0)} points.` : `Contributes ${now}; at most ${f.maxPoints.toFixed(0)} points, so it can add no more than ${room.toFixed(1)}.`;
  const at = p.kind === "price" ? `at about ${pct(p.drawdown, 1)} from its 2-year high (about ${num(p.price)})` : `if the spread reached ${num(p.bp, 0)} bp`;
  return `This gauge would contribute ${(f.points + 10).toFixed(1)} points ${at}, up from ${now}. With every other gauge unchanged, the index would rise by those same 10 points.`;
}

function GaugeCard({ f }: { f: Factor }) {
  const dd = f.type === "DD";
  const dir = direction(f);
  return (
    <details className={s.gaugeRow}>
      <summary>
        <span className={s.gName}>{SHORT[f.col] ?? f.name}{f.stale && <em className={s.staleTag}>stale</em>}<small>{f.descriptor}</small>
          <small className={s.gQuick}>{f.current == null ? "No data" : dd ? num(f.current) : `${num(f.current, 0)} bp`} · contributes {f.points.toFixed(1)} pts</small></span>
        <span className={s.gBar}><span style={{ width: pct(f.stress, 1), background: stressColor(f.stress) }} /></span>
        <span className={s.gPct}>{s100(f.stress)}<small>/100</small></span>
        <span className={`${s.gDir} ${dir.cls}`} title={dir.label}><b aria-hidden="true">{dir.arrow}</b> <span className={s.gDirTxt}>{dir.label}</span></span>
      </summary>
      <div className={s.gBody}>
        <p className={s.gWord} style={{ color: stressColor(f.stress) }}>{gaugeWord(f.stress)} · {PILLAR[f.pillar]}</p>
        <dl className={s.facts}>
          <div><dt>Latest</dt><dd>{f.current == null ? "—" : dd ? num(f.current) : `${num(f.current, 0)} bp`}</dd></div>
          <div><dt>{dd ? "From 2-year high" : "Change from 52-week low"}</dt><dd>{f.move == null ? "—" : dd ? pct(f.move, 1) : `+${num(f.move, 0)} bp`}</dd></div>
          <div><dt>Contribution to index</dt><dd>{f.points.toFixed(1)} points</dd></div>
          <div><dt>Data through</dt><dd className={f.stale ? s.staleText : undefined}>{longDate(f.lastDate)}{f.stale ? " · stale" : ""}</dd></div>
        </dl>
        <p><b>Why it matters:</b> {f.rationale}</p>
        <details className={s.inner}>
          <summary>Thresholds, history and source</summary>
          <dl className={s.facts}>
            <div><dt>Calm → trigger</dt><dd>{dd ? `${pct(f.calm)} → ${pct(f.trigger)} from 2-year high` : `${f.calm} → ${f.trigger} bp`}</dd></div>
            {!dd && <div><dt>Widening calm → trigger</dt><dd>+{f.wcalm} → +{f.wtrig} bp above 52-week low</dd></div>}
            {!dd && <div><dt>Level test · widening test</dt><dd>{s100(f.levelStress)} · {s100(f.widenStress ?? 0)}<small>the higher one is the score</small></dd></div>}
            <div><dt>Weight · maximum contribution</dt><dd>{pct(f.weight)} · {f.maxPoints.toFixed(0)} points</dd></div>
          </dl>
          {f.spark && f.spark.length > 2 && <><div className={s.sparkLabel}>Stress score, last 52 weeks <small>(dashed line = 50)</small></div><Sparkline data={f.spark} /></>}
          <p className={s.small}>{plus10(f)}</p>
          <p className={s.small}>Source: {(() => { const l = sourceLink(f.source); return l ? <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a> : "—"; })()}, observation {longDate(f.lastDate)}. {dd ? "Score = (drawdown − calm) ÷ (trigger − calm), limited to 0–100." : "Score = the higher of (spread − calm) ÷ (trigger − calm) and (rise above 52-week low − widening calm) ÷ (widening trigger − widening calm), limited to 0–100."}</p>
        </details>
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
  const hi = scored.reduce<(typeof scored)[number] | null>((m, p) => (!m || p.score > m.score ? p : m), null);
  const lo = scored.reduce<(typeof scored)[number] | null>((m, p) => (!m || p.score < m.score ? p : m), null);
  const avg = scored.length ? scored.reduce((t, p) => t + p.score, 0) / scored.length : null;
  const nBelow = score != null ? scored.filter((p) => p.score < score).length : 0;
  const nEqual = score != null ? scored.filter((p) => p.score === score).length : 0;
  const below = score != null && scored.length ? Math.round((100 * nBelow) / scored.length) : null;
  const last = H[H.length - 1];
  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((x - L) / (W - L - R)) * (H.length - 1));
    setHover(i >= 0 && i < H.length ? i : null);
  };
  const hp = hover != null ? H[hover] : null;
  return (
    <figure className={s.panel}>
      <figcaption className={s.chartHead}>Is AI market stress building?<small>Daily index, last 52 weeks, on its 0–100 scale. Touch or hover for any day; add the components to see where stress comes from.</small></figcaption>
      <svg viewBox={`0 0 ${W} ${Ht}`} role="img" aria-label="Index over the last 52 weeks" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} style={{ touchAction: "pan-y" }}>
        {[25, 50, 75].map((b) => <rect key={b} x={L} width={W - L - R} y={ys(b + 25)} height={ys(b) - ys(b + 25)} fill={b === 75 ? "#FEF2F2" : b === 50 ? "#FFF7ED" : "#FFFBEB"} />)}
        {[0, 25, 50, 75, 100].map((g) => <g key={g}><line x1={L} x2={W - R} y1={ys(g)} y2={ys(g)} stroke="#E9E4DC" /><text x={L - 6} y={ys(g) + 4} textAnchor="end" className={s.axis}>{g}</text></g>)}
        {ticks.filter((_, n) => n % 2 === 0).map(({ p, i }) => <text key={p.date} x={xs(i)} y={Ht - 6} textAnchor="middle" className={s.axis}>{MON[Number(p.date.slice(5, 7)) - 1]}</text>)}
        {comps.map((c) => show[c.key] && <path key={c.key} d={path(c.key)} fill="none" stroke={c.color} strokeWidth="1.6" strokeLinejoin="round" />)}
        <path d={path("score")} fill="none" stroke={C.slate} strokeWidth="3" strokeLinejoin="round" />
        {last && last.score != null && <g><circle cx={xs(H.length - 1)} cy={ys(last.score)} r="5" fill={C.slate} /><text x={xs(H.length - 1) - 8} y={ys(last.score) - 10} textAnchor="end" className={s.lastLabel}>{last.score} · {shortDate(last.date)}</text></g>}
        {hp && hover != null && <g><line x1={xs(hover)} x2={xs(hover)} y1={T} y2={Ht - B} stroke="#94A3B8" strokeDasharray="3 3" />{hp.score != null && <circle cx={xs(hover)} cy={ys(hp.score)} r="5" fill={C.slate} />}</g>}
      </svg>
      <div className={s.readout} aria-live="polite">
        {hp ? <><b>{longDate(hp.date)}</b> · Index {hp.score ?? "—"}{comps.filter((c) => show[c.key]).map((c) => <span key={c.key}> · {c.label} {hp[c.key] == null ? "—" : (hp[c.key] as number).toFixed(0)}</span>)}</> : <span>&nbsp;</span>}
      </div>
      <div className={s.toggles}>
        <span className={s.toggleOn}><i style={{ background: C.slate }} />Index</span>
        {comps.map((c) => (
          <button key={c.key} type="button" aria-pressed={show[c.key]} className={show[c.key] ? s.toggleOn : s.toggle} onClick={() => setShow((v) => ({ ...v, [c.key]: !v[c.key] }))}>
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
          {below != null && <p className={s.compareNote}>Today’s score is higher than {nBelow} of the {scored.length} daily readings over the past 52 weeks{nEqual > 1 ? ` (and equal to ${nEqual - 1} others)` : ""}: about the {below}th percentile{score < 25 ? ", even though it is still in the Normal band" : ""}. Each trading day counts once using that day’s latest data; ties are not counted as lower. Range over the year: {lo.score} to {hi.score}.</p>}
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

function BacktestSummary({ b }: { b: Backtest }) {
  const highest = (e: Backtest["episodes"][number]) => {
    const hit = [...e.levels].reverse().find((l) => l.date);
    return hit ? { name: `${hit.level} ${ALERTS[hit.level]}`, date: hit.date } : null;
  };
  const first = (e: Backtest["episodes"][number]) => e.levels.find((l) => l.date);
  const outside = [0, 1, 2, 3].map((k) => b.outsideEpisodes.filter((x) => x.level === `L${k + 1}`).length);
  const oc = b.alertOutcomes ?? [];
  const cnt = (k: string) => oc.filter((o) => o.kind === k).length;
  const rule = b.outcomeRule;
  const missed = (b.nasdaqDeclines ?? []).filter((x) => !x.alerted);
  const cur = b.comparison?.[0], alt = b.comparison?.[1];
  const altExtra = cur && alt ? alt.outsideByLevel.reduce((t, x) => t + x, 0) - cur.outsideByLevel.reduce((t, x) => t + x, 0) : null;
  return (
    <div className={s.foldBody}>
      <p className={s.caveat}><b>Read with care:</b> historical results before late 2023 are indicative. Several gauges use substitute series because today’s instruments or comparable data did not exist, so historical alert dates and severity may differ from results with fully comparable data. This replay shows when formal alerts would have fired; it is not a test of predictive accuracy.</p>
      <p>The replay starts on {longDate(b.dataStart)} but scoring begins on {longDate(b.firstScored)}: each price gauge needs 2 years of history before its 2-year high exists. It runs day by day to {longDate(b.dataEnd)} ({b.scoredDays.toLocaleString()} scored trading days) with no look-ahead.</p>
      <div className={s.btWrap}>
        <table className={s.bt}>
          <thead><tr><th>Selected sell-off</th><th>Nasdaq-100 fall</th><th>Peak index</th><th>First alert</th><th>Highest alert</th><th>Share of weight on stand-ins</th></tr></thead>
          <tbody>
            {b.episodes.map((e) => {
              const f = first(e), h = highest(e), sh = e.standInShare ?? 0;
              return (
                <tr key={e.name}>
                  <td>{e.name}</td>
                  <td>{pct(e.ndxDrawdown)}</td>
                  <td>{e.maxScore ?? "—"}</td>
                  <td>{f && f.date ? <>{longDate(f.date)}<small>{f.daysFromPeak != null && f.daysFromPeak >= 0 ? `${f.daysFromPeak} days after the Nasdaq peak` : f.daysFromPeak != null ? `${-f.daysFromPeak} days before the peak` : ""}</small></> : "None"}</td>
                  <td>{h ? <>{h.name}<small>{longDate(h.date)}</small></> : "None"}</td>
                  <td><span className={s.proxyBar}><span style={{ width: pct(sh, 1) }} /></span>{pct(sh)}<small>{e.dataQuality}</small></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p><b>Alerts outside the selected sell-off windows</b> (since {b.firstScored.slice(0, 4)}): Stress Watch {outside[0]} · Financing Strain {outside[1]} · Broad Correction {outside[2]} · Systemic Dislocation {outside[3]}. An alert outside these windows is not automatically a false alarm; some match real stress periods the list leaves out, such as the 2010 euro crisis and the March 2023 bank failures.</p>
      {rule && oc.length > 0 && (
        <p><b>What followed each alert</b> ({oc.length} alert starts at any level): {cnt("during")} began during a selected sell-off; {cnt("followed")} were followed by a Nasdaq-100 fall of {pct(-rule.fall)} or more within about 6 months ({rule.horizonDays} trading days); {cnt("false")} were not. Those last {cnt("false")} are the closest thing to false alarms under this rule.</p>
      )}
      {b.nasdaqDeclines && (
        <p><b>Missed declines:</b> of {b.nasdaqDeclines.length} periods when the Nasdaq-100 fell 20% or more below its 2-year high, {b.nasdaqDeclines.length - missed.length} had a formal alert by the time they ended. {missed.length ? `No alert fired in: ${missed.map((x) => `${longDate(x.from)} (${pct(x.worst)})`).join("; ")}.` : ""}</p>
      )}
      {b.sensitivity && (
        <>
          <p><b>Threshold sensitivity:</b> the same replay with every calm and trigger threshold moved 20% tighter or looser.</p>
          <div className={s.btWrap}>
            <table className={s.bt}>
              <thead><tr><th>Thresholds</th><th>Index today</th><th>Systemic Dislocation fired in</th><th>Alerts outside windows (L1 · L2 · L3 · L4)</th></tr></thead>
              <tbody>{b.sensitivity.map((v) => <tr key={v.name}><td>{v.name}</td><td>{v.latestScore ?? "—"}</td><td>{v.l4Episodes.length ? v.l4Episodes.join(", ") : "None"}</td><td>{v.outsideByLevel.join(" · ")}</td></tr>)}</tbody>
            </table>
          </div>
        </>
      )}
      {altExtra != null && <p><b>Weighting check:</b> a lower-redundancy weighting (less weight on gauges that move together) caught the same Systemic Dislocation episodes but produced {altExtra} more alert{altExtra === 1 ? "" : "s"} outside the selected windows, so the current weights were kept.</p>}
      <p><b>Stand-ins:</b> QQQ, then the Nasdaq-100 itself, for the AI ETF before 2018; the IYR real-estate ETF for the data-center ETF before 2020; Ares Capital for BDCs before 2013; a senior-loan fund (VVR) for leveraged loans before 2011. FRED publishes only about three years of the ICE credit spreads, so older spread history uses Moody’s Baa spread (BAA10Y), scaled to join each series.</p>
    </div>
  );
}

/* ---------- Banner (renders before the data arrives) ---------- */
function Banner() {
  return (
    <section className={s.banner}>
      <div className={s.bannerArt} aria-hidden="true">
        <img src="/ai-stress-index/hero-1400.webp" srcSet="/ai-stress-index/hero-800.webp 800w, /ai-stress-index/hero-1400.webp 1400w"
          sizes="(max-width: 860px) 100vw, 62vw" width={1400} height={1200} alt="" fetchPriority="high" />
      </div>
      <div className={s.bannerInner}>
        <div className={s.bannerText}>
          <div className={s.kicker}>KKReckons · Markets</div>
          <h1>AI Market<br />Stress Index</h1>
          <div className={s.stripe} aria-hidden="true"><i /><i /><i /><i /></div>
          <p className={s.question}>Is the AI boom under pressure?<br />Could the bubble pop?</p>
          <p className={s.daily}>We check the gauges daily.</p>
          <p className={s.meta}>A daily market-stress monitor for AI-related stocks, AI financing proxies and wider credit conditions. Updated every weekday after the US close.</p>
          <div className={s.ctas}>
            <a className={s.ctaMain} href="#today">View today’s index <span aria-hidden="true">↓</span></a>
            <a className={s.ctaAlt} href="#methodology">How it works</a>
          </div>
          <p className={s.byline}>By <b>KK Reddy</b> · kkreckons.com</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export default function StressIndex() {
  const [d, setD] = useState<Data | null>(null);
  const [bt, setBt] = useState<Backtest | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = Date.now();
    fetch(`${DATA_URL}?t=${t}`, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(setD).catch((e: Error) => setErr(e.message));
    fetch(`${BACKTEST_URL}?t=${t}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then(setBt).catch(() => setBt(null));
  }, []);

  return (
    <main className={s.main}>
      <Banner />
      {err ? <div className={`container ${s.page}`}><p className={s.err}>The latest index data couldn’t be loaded ({err}). Please try again shortly.</p></div>
        : !d ? <div className={`container ${s.page}`}><p className={s.loading}>Loading today’s index…</p></div>
        : <Report d={d} bt={bt} />}
    </main>
  );
}

function Report({ d, bt }: { d: Data; bt: Backtest | null }) {
  const h = hook(d);
  const sorted = [...d.factors].sort((a, b) => b.stress - a.stress);
  const signal = sorted[0] && sorted[0].stress >= 0.5 ? sorted[0] : null;
  const change = d.prevScore != null && d.score != null ? d.score - d.prevScore : null;
  const refreshed = new Date(d.generatedAt);
  const refreshedTxt = isNaN(refreshed.getTime()) ? d.generatedAt : refreshed.toLocaleString("en-US", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  const movers = d.factors.filter((f) => f.prevStress != null).map((f) => ({ f, dlt: f.stress - (f.prevStress ?? 0) }))
    .filter((m) => Math.abs(m.dlt) >= 0.01).sort((a, b) => Math.abs(b.dlt) - Math.abs(a.dlt));
  const active = [...d.levels].reverse().find((l) => l.active);
  const pw: Record<string, number> = {};
  d.factors.forEach((f) => { pw[f.pillar] = (pw[f.pillar] ?? 0) + f.weight; });
  const ex = d.factors.filter((f) => f.type === "LVL" && f.current != null).sort((a, b) => b.stress - a.stress)[0];
  // data freshness by feed
  const priceDates = d.factors.filter((f) => f.type === "DD" && f.lastDate).map((f) => f.lastDate as string).sort();
  const spreadDates = d.factors.filter((f) => f.type === "LVL" && f.lastDate).map((f) => f.lastDate as string).sort();
  const priceDate = priceDates[0] ?? d.asOf, spreadDate = spreadDates[0] ?? null;
  const spreadLag = spreadDate ? weekdaysBetween(spreadDate, d.asOf) : 0;
  const stale = d.factors.filter((f) => f.stale);
  const staleW = stale.reduce((t, f) => t + f.weight, 0) / d.factors.reduce((t, f) => t + f.weight, 0);
  const LIMITED = 0.25; // above this share of the index weight on stale inputs, no stress band is shown

  return (
    <div className={`container ${s.page}`}>
      {/* Layer 1: the daily snapshot */}
      <section className={s.hero} id="today">
        <div className={s.scoreCard}>
          <div className={s.label}>Overall stress</div>
          <div className={s.scoreRow}>
            <span className={s.score} style={{ color: bandColor(d.score) }}>{d.score ?? "—"}</span>
            <span className={s.outOf}>/ 100</span>
            <span className={s.bandTxt}>
              <span className={s.badge} style={{ background: staleW > LIMITED ? "#71717A" : bandColor(d.score) }}>{staleW > LIMITED ? "LIMITED DATA" : band(d.score).toUpperCase()}</span>
              {change != null && <small>{change === 0 ? "Unchanged" : `${change > 0 ? "Up" : "Down"} ${Math.abs(change)} point${Math.abs(change) === 1 ? "" : "s"}`} vs previous close ({d.prevScore})</small>}
            </span>
          </div>
          {stale.length > 0 && (
            <p className={s.staleWarn}>⚠ {stale.length} input{stale.length > 1 ? "s are" : " is"} stale ({pct(staleW)} of the index weight): the score includes carried-forward data.{staleW > LIMITED ? " Above 25% stale, no stress band is shown." : ""}</p>
          )}
          <Meter score={d.score} />
          <p className={s.interp}>{h.line}</p>
          <p className={s.alert}>Stress band: <b>{band(d.score)}</b> · Formal alert: <b>{active ? `${active.level} ${ALERTS[active.level]}` : "None"}</b></p>
          <div className={s.fresh}>
            <div><span>Stock &amp; ETF data</span><b>{longDate(priceDate)} · US close</b><em className={s.ok}>Current</em></div>
            <div><span>Credit spread data</span><b>{longDate(spreadDate)} · latest available</b>
              <em className={spreadLag > 3 ? s.bad : s.ok}>{spreadLag === 0 ? "Current" : spreadLag <= 3 ? `${spreadLag}-day publication lag` : `Stale (${spreadLag} days)`}</em></div>
            <p>Refreshed {refreshedTxt}.{stale.length ? ` ${stale.length} gauge${stale.length > 1 ? "s are" : " is"} stale and ${stale.length > 1 ? "keep their" : "keeps its"} last value in the index.` : ""}</p>
          </div>
        </div>

        <div className={s.hookCol}>
          <h2 className={s.hook}>{h.head}</h2>
          {signal && (
            <div className={s.signal} style={{ borderColor: stressColor(signal.stress) }}>
              <div className={s.label}>The signal to watch</div>
              <div className={s.signalRow}><span className={s.signalName}>{SHORT[signal.col]}<small>{signal.descriptor}</small></span><span className={s.signalPct} style={{ color: stressColor(signal.stress) }}>{s100(signal.stress)}<small>/100</small></span></div>
              <p>{gaugeWord(signal.stress)} on this index’s 0–100 scale, while overall stress is {band(d.score).toLowerCase()}. This signals pressure in {area(signal.col) === "credit" ? "riskier corporate borrowing" : area(signal.col)}, not {an(s100(signal.stress))} {s100(signal.stress)}% probability of a {area(signal.col) === "credit" ? "credit event" : "crash"}.</p>
            </div>
          )}
          <div className={s.read}>
            <div className={s.label}>Today’s read</div>
            <p>{todaysRead(d)}</p>
            {d.editorNote && <p className={s.editor}><b>KK’s note:</b> {d.editorNote}</p>}
          </div>
        </div>
      </section>
      {(d.notes ?? []).map((n) => <p key={n} className={s.note}>{n}</p>)}
      <p className={s.disclaim}>Stress bands describe today’s reading. Formal alerts need extra conditions held for 5 straight trading days, so the index can be Elevated (25+) before the first alert, Stress Watch, triggers at 50. Gauge scores are normalised 0–100 readings, not probabilities. A Normal reading is not a prediction that markets are safe or will rise.</p>

      <h2 className={s.h2}>Where is the pressure?</h2>
      <section className={s.pillars}>
        {PILLAR_KEYS.map((p) => {
          const v = d.pillars?.[p] ?? null, pv = d.prevPillars?.[p] ?? null;
          const members = d.factors.filter((f) => f.pillar === p);
          const dv = v != null && pv != null ? v - pv : null;
          return (
            <div key={p} className={s.pillar}>
              <div className={s.label}>{PILLAR[p]}</div>
              <div className={s.sublabel}>Component stress score · {pct(pw[p] ?? 0)} of the index</div>
              <div className={s.pillarVal}>{v == null ? "—" : v.toFixed(0)}<small>/100</small>
                {dv != null && (Math.abs(dv) >= 0.5
                  ? <span className={dv > 0 ? s.worse : s.better} title="Change in this component’s score since the previous close"> {dv > 0 ? "▲" : "▼"} {Math.abs(dv).toFixed(0)} pt{Math.abs(dv) >= 1.5 ? "s" : ""} {dv > 0 ? "higher" : "lower"}</span>
                  : <span className={s.flat} title="Change in this component’s score since the previous close"> ● unchanged</span>)}
              </div>
              <span className={s.gBar}><span style={{ width: `${Math.min(100, v ?? 0)}%`, background: stressColor((v ?? 0) / 100) }} /></span>
              <ul className={s.members}>
                {members.map((f) => (
                  <li key={f.col}>
                    <span className={s.mName}>{SHORT[f.col]} <small>{pct(f.weight)}</small></span>
                    <span className={s.mBar}><span style={{ width: pct(f.stress, 1), background: stressColor(f.stress) }} /></span>
                    <b>{s100(f.stress)}</b>
                    <small className={s.mPts}>+{f.points.toFixed(1)}</small>
                  </li>
                ))}
              </ul>
              <p className={s.mNote}>Bar = gauge score (0–100) · +pts = contribution to the index</p>
            </div>
          );
        })}
      </section>
      {d.pillars && d.pillars.Equity != null && d.pillars.Financing != null && d.pillars.Credit != null && (
        <p className={s.small}>Each component weight is the sum of its gauges’ weights, and its score is their weighted average. Contributions may not sum exactly because of rounding; all calculations use unrounded values. The index combines the components: {PILLAR_KEYS.map((p) => `${pct(pw[p] ?? 0)} × ${(d.pillars?.[p] ?? 0).toFixed(1)}`).join(" + ")} = {PILLAR_KEYS.reduce((t, p) => t + (pw[p] ?? 0) * (d.pillars?.[p] ?? 0), 0).toFixed(1)}, rounded to {d.score}.</p>
      )}
      <p className={s.legendLine}><span className={s.swatches}><i style={{ background: C.green }} /><i style={{ background: C.amber }} /><i style={{ background: C.orangeRed }} /><i style={{ background: C.red }} /></span>One set of bands labels the index and every gauge: Normal 0–24 (green) · Elevated 25–49 (amber) · Severe 50–74 (orange) · Critical 75–100 (red). Arrows show direction: <span className={s.worse}>▲ stress rising</span> · <span className={s.better}>▼ stress easing</span>.</p>

      {/* Layer 2: the evidence */}
      <h2 className={s.h2} id="evidence">What changed since {d.prevDate ? longDate(d.prevDate) : "the previous session"}</h2>
      {movers.length ? (
        <ul className={s.changes}>
          {movers.slice(0, 3).map(({ f, dlt }) => (
            <li key={f.col}><span className={dlt > 0 ? s.worse : s.better}>{dlt > 0 ? "▲ Rose" : "▼ Eased"} {Math.abs(s100(dlt))}</span> {SHORT[f.col]}: now {s100(f.stress)}/100</li>
          ))}
        </ul>
      ) : <p className={s.small}>No gauge moved by more than 1 point.</p>}

      <h2 className={s.h2}>The nine gauges</h2>
      <p className={s.small}>Sorted by stress score (0–100). Tap a gauge for its latest value, contribution and why it matters, then open the details for thresholds, history and source.</p>
      <div className={s.gauges}>{sorted.map((f) => <GaugeCard key={f.col} f={f} />)}</div>

      <TrendChart H={d.history} score={d.score} />

      <details className={s.fold}>
        <summary>Weekly highs and formal alerts</summary>
        <div className={s.foldBody}>
          <div className={s.label}>Weekly high of the index, last 26 weeks</div>
          <WeeklyChart Wk={d.weekly} />
          <div className={s.label} style={{ marginTop: 16 }}>Formal alerts</div>
          <ul className={s.levelList}>
            {d.levels.map((l) => <li key={l.level}><b>{l.level} {ALERTS[l.level]}</b><span>{l.active ? "Active now" : l.firstDate ? `First confirmed ${longDate(l.firstDate)}` : "Not triggered"}</span></li>)}
          </ul>
          <p className={s.small}>Each alert needs the index and specific gauges to stay high for 5 trading days in a row.</p>
        </div>
      </details>

      {/* Layer 3: the methodology */}
      <h2 className={s.h2} id="methodology">Methodology</h2>
      <details className={s.fold}>
        <summary>How the index works</summary>
        <div className={s.foldBody}>
          <p>Every weekday after the US close, the index reads {d.factorCount} market gauges in three groups: <b>AI equities</b> ({pct(pw.Equity ?? 0)}), <b>AI financing</b> ({pct(pw.Financing ?? 0)}) and <b>credit markets</b> ({pct(pw.Credit ?? 0)}).</p>
          <p>Each gauge gets a stress score from 0 (calm) to 100 (its trigger level). For stocks and funds it is how far they have fallen from their 2-year high. For credit spreads (the extra interest riskier borrowers pay) it is how high they are, or how fast they have risen, whichever is greater.</p>
          <p>The index is the weighted average of those scores, from 0 to 100. Formal alerts need the index and specific gauges to stay high for 5 trading days in a row, so a one-day move never counts.</p>
          {ex && ex.stress > 0 && ex.current != null && ex.ref != null && ex.move != null && (
            <p><b>Today’s example:</b> {SHORT[ex.col]} stand at {num(ex.current, 0)} bp, {num(ex.move, 0)} bp above their 52-week low of {num(ex.ref, 0)}.{" "}
              {(ex.widenStress ?? 0) >= ex.levelStress ? <>That fast rise gives a widening score of {s100(ex.widenStress ?? 0)}, above the level score of {s100(ex.levelStress)}.</> : <>That is a level score of {s100(ex.levelStress)}.</>}
              {" "}With a {pct(ex.weight)} weight it adds {ex.points.toFixed(1)} points to today’s index of {d.score}.</p>
          )}
        </div>
      </details>
      <details className={s.fold}>
        <summary>What this index captures, and what it doesn’t</summary>
        <div className={s.foldBody}>
          <p><b>It captures</b> stress in market prices tied to the AI cycle: AI-related stocks, proxies for how the AI build-out is financed, and broader credit conditions.</p>
          <p><b>It does not measure</b> AI business fundamentals, valuations, returns on AI spending or future profits. A low score is not proof that the AI boom is healthy.</p>
          <p><b>The nine gauges are not nine independent signals.</b> The Nasdaq-100, semiconductors, the AI ETF and the data-center ETF often move together, as do the credit spreads, so one market move can lift several gauges at once. Weights are set with this in mind, but the score is a combination of related proxies, not a count of separate risks.</p>
          <p><b>Proxies:</b> listed BDCs stand in for private credit and the data-center ETF for the AI build-out. Their share prices also reflect broader stock-market moves. The CCC spread covers all CCC-rated borrowers, not only technology companies.</p>
          <p><b>Thresholds</b> are fixed, judgement-based settings informed by past market episodes, not statistically optimised or universal market levels.</p>
        </div>
      </details>
      <details className={s.fold}>
        <summary>Why each gauge is weighted this way</summary>
        <div className={s.foldBody}>
          <ul className={s.whyList}>
            {d.factors.map((f) => <li key={f.col}><b>{SHORT[f.col]} · {pct(f.weight)} · {PILLAR[f.pillar]}</b><span>{f.rationale}</span><small>{plus10(f)}</small></li>)}
          </ul>
        </div>
      </details>
      <details className={s.fold}>
        <summary>Exact rules, thresholds and data sources</summary>
        <div className={s.foldBody}>
          <p><b>Prices</b> (Nasdaq-100, semiconductors, AI, data-center, BDC and loan ETFs): drawdown = dividend-adjusted close ÷ highest close of the last 2 years − 1; score = (drawdown − calm) ÷ (trigger − calm), limited to 0–100. The 2-year high reflects the AI-cycle peak without old pre-AI highs.</p>
          <p><b>Credit spreads</b> (BBB, CCC, high yield, in bp): score = the higher of the level test, (spread − calm) ÷ (trigger − calm), and the widening test, (spread − 52-week low − widening calm) ÷ (widening trigger − widening calm), each limited to 0–100. The 52-week window catches fast blow-outs.</p>
          <p><b>Index</b> = Σ(weight × score) ÷ Σ weights, rounded. A gauge’s contribution = its weight share × its score. Blank days carry the last value; a gauge not updated for more than 3 trading days is flagged stale and keeps its last value in the index. History needs 2 years of data before the first score.</p>
          <p><b>Formal alerts</b> (5 straight trading days): L1 Stress Watch: index ≥ 50 · L2 Financing Strain: index ≥ 60 and (BDCs ≥ 80 with loans ≥ 50, or CCC ≥ 80) · L3 Broad Correction: index ≥ 70, semiconductors ≥ 83, AI ETF ≥ 80 · L4 Systemic Dislocation: index ≥ 75, Nasdaq-100 at 100, and high-yield ≥ 500 bp or BDCs at 100.</p>
          <p><b>Sources</b> (retrieved {refreshedTxt}): Yahoo Finance dividend-adjusted daily closes, and ICE BofA option-adjusted spreads via FRED, which publish a day after the market date. {d.factors.map((f) => { const l = sourceLink(f.source); return l ? <span key={f.col}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a> ({longDate(f.lastDate)}) · </span> : null; })}</p>
        </div>
      </details>
      {bt && (
        <details className={s.fold}>
          <summary>Backtest &amp; validation</summary>
          <BacktestSummary b={bt} />
        </details>
      )}

      {d.model && (
        <details className={s.fold}>
          <summary>Model version and changes</summary>
          <div className={s.foldBody}>
            <p>Model v{d.model.version} · methodology last changed {longDate(d.model.changed)}. {d.model.note}</p>
            <ul className={s.levelList}>{[...d.model.changelog].reverse().map((c) => <li key={c.version}><b>v{c.version}</b><span>{c.note}</span></li>)}</ul>
          </div>
        </details>
      )}
      <p className={s.fine}>{d.model ? `Model v${d.model.version}. ` : ""}Built and curated by KK Reddy. An indicator of market conditions, not a forecast. For information only; not financial advice. Market data as of {longDate(d.asOf)} · refreshed {refreshedTxt}.</p>
    </div>
  );
}
