/* The AI drawdown monitor: 50 AI-linked stocks measured from their highest-ever close. Built every weekday by
   drawdowns.py in github.com/kkreddy79/ai-implosion (basket, method and rules: drawdowns/README.md there) and
   served beside the index's own files, so it loads the same way (lib/stress.ts). Shared by the server render
   and the browser, so it must stay free of "use client". */
import { loadStressFile } from "@/lib/stress";

export type DrawdownStock = {
  /** Label shown, e.g. "NVDA" or "SK hynix". */
  t: string;
  symbol: string;
  /** Company name. */
  n: string;
  /** Segment, one of the basket's segments. */
  g: string;
  /** Highest-ever close and its date. */
  ath: number;
  d: string;
  /** Latest close and its date. */
  c: number;
  asOf: string;
  /** Latest close ÷ highest close − 1 (≤ 0). */
  dd: number;
  /** Move on the day. */
  day: number;
  /** Record close came before 2025, so part of the fall predates the AI trade. */
  old: boolean;
  /** Currency sign. */
  cur: string;
  /** Listed recently: its peak is only days old. */
  ipo: boolean;
  ipoPrice?: number;
  /** Fetch failed: the row shows its last available close. */
  stale?: boolean;
  /** Highest close since 1 Jan 2025, its date, and the drop from it (equal to ath/d/dd when the record is from 2025–26). */
  ath25: number;
  d25: string;
  dd25: number;
};

/** A broad index measured the same two ways, shown beside the basket. */
export type Benchmark = { id: string; name: string; dd: number; dd25: number };

export type DrawdownSummary = { count: number; medianDrawdown: number; down50: number; down75: number; medianDay: number };

export type Drawdowns = { asOf: string; generatedAt: string; source: string; summary: DrawdownSummary; stocks: DrawdownStock[]; benchmarks: Benchmark[]; notes: string[] };

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown) => (typeof v === "string" ? v : "");
const iso = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

/** The file comes from another repository: keep only rows whose numbers and dates are well formed. */
export function cleanDrawdowns(raw: unknown): Drawdowns | null {
  const r = raw as Partial<Drawdowns> | null;
  if (!r || !Array.isArray(r.stocks) || !iso(r.asOf)) return null;
  const stocks: DrawdownStock[] = r.stocks.flatMap((x) => {
    const o = x as Partial<DrawdownStock>;
    const ath = num(o.ath), c = num(o.c), dd = num(o.dd), day = num(o.day), d = iso(o.d), asOf = iso(o.asOf);
    if (ath == null || c == null || dd == null || day == null || !d || !asOf || !str(o.t) || dd > 0 || dd <= -1) return [];
    return [{
      t: str(o.t), symbol: str(o.symbol) || str(o.t), n: str(o.n), g: str(o.g) || "Other", ath, d, c, asOf, dd, day,
      old: o.old === true, cur: str(o.cur) || "$", ipo: o.ipo === true, ...(num(o.ipoPrice) != null ? { ipoPrice: num(o.ipoPrice)! } : {}),
      ...(o.stale === true ? { stale: true } : {}),
      // Files written before the 2025–26 measure have no dd25: fall back to the all-time figures.
      ...(() => { const dd25 = num(o.dd25), ath25 = num(o.ath25), d25 = iso(o.d25); return dd25 != null && ath25 != null && d25 && dd25 <= 0 && dd25 >= dd ? { ath25, d25, dd25 } : { ath25: ath, d25: d, dd25: dd }; })(),
    }];
  });
  if (!stocks.length) return null;
  return {
    asOf: r.asOf as string, generatedAt: str(r.generatedAt), source: str(r.source), stocks,
    benchmarks: (Array.isArray(r.benchmarks) ? r.benchmarks : []).flatMap((x) => {
      const b = x as Partial<Benchmark>, dd = num(b.dd), dd25 = num(b.dd25);
      return dd != null && dd25 != null && str(b.name) ? [{ id: str(b.id), name: str(b.name), dd, dd25 }] : [];
    }),
    notes: Array.isArray(r.notes) ? r.notes.filter((n): n is string => typeof n === "string") : [],
    summary: summarize(stocks),
  };
}

const median = (a: number[]) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Headline numbers for a set of rows (the page recomputes them for whatever its filters show). */
export function summarize(rows: DrawdownStock[]): DrawdownSummary {
  const dd = rows.map((r) => r.dd);
  return { count: rows.length, medianDrawdown: median(dd), down50: dd.filter((v) => v <= -0.5).length, down75: dd.filter((v) => v <= -0.75).length, medianDay: median(rows.map((r) => r.day)) };
}

export { median };

/** Server fetch, re-checked at most hourly like the index; null when no source answers. */
export async function loadDrawdowns(): Promise<Drawdowns | null> {
  return cleanDrawdowns(await loadStressFile<unknown>("drawdowns.json"));
}

/** Severity band of a drawdown, on the index's own 0–100 bands: 0 Normal, 1 Elevated, 2 Severe, 3 Critical. */
export const ddBand = (dd: number) => {
  const m = -dd * 100;
  return m >= 75 ? 3 : m >= 50 ? 2 : m >= 25 ? 1 : 0;
};
