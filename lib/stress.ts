/* Where the AI Stress Index data lives: GitHub Pages first, then the raw file on GitHub when github.io
   can't be reached (Pages outage, or a network that blocks github.io). Both serve the same docs/ files.
   Shared by the server render and the browser fallback, so it must stay free of "use client". */
export const STRESS_BASES = ["https://kkreddy79.github.io/ai-implosion", "https://raw.githubusercontent.com/kkreddy79/ai-implosion/main/docs"];

/** Cache tag on every CDN copy of the embed card, so /api/revalidate can clear them all when a reading publishes. */
export const EMBED_CACHE_TAG = "ai-stress-index-embed";

/** Fetches one of the index's JSON files on the server, re-checked at most hourly (`fresh`: every time, for a
 *  response the CDN caches instead); null when no source answers. */
export async function loadStressFile<T>(file: string, fresh = false): Promise<T | null> {
  for (const base of STRESS_BASES) {
    try {
      const r = await fetch(`${base}/${file}`, fresh ? { cache: "no-store" } : { next: { revalidate: 3600 } });
      if (r.ok) return (await r.json()) as T;
    } catch {}
  }
  return null;
}

/** Above this share of the index weight on stale inputs, no stress band is shown (as on the index page). */
export const LIMITED = 0.25;

/** The latest reading, as Home's Stress Index card shows it. */
export type LiveStress = {
  score: number;
  asOf: string;
  prevScore: number | null;
  prevDate: string | null;
  /** Too many stale inputs to name a band. */
  limited: boolean;
  /** The last 30 daily scores, oldest first. */
  trend: number[];
};

type StressData = {
  asOf: string;
  score: number | null;
  prevDate?: string | null;
  prevScore?: number | null;
  factors: { weight: number; stale?: boolean }[];
  history: { score: number | null }[];
};

/** A finite number, or null: the data comes from another repository, and the embed card and badge put these
 *  values straight into HTML and SVG, so anything that isn't a number never gets that far. */
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function liveStress(d: StressData | null): LiveStress | null {
  const score = num(d?.score);
  if (!d || score == null) return null;
  const factors = Array.isArray(d.factors) ? d.factors : [];
  const total = factors.reduce((t, f) => t + (num(f.weight) ?? 0), 0);
  const stale = factors.filter((f) => f.stale).reduce((t, f) => t + (num(f.weight) ?? 0), 0);
  return {
    score,
    asOf: String(d.asOf),
    prevScore: num(d.prevScore),
    prevDate: d.prevDate == null ? null : String(d.prevDate),
    limited: total > 0 && stale / total > LIMITED,
    trend: (Array.isArray(d.history) ? d.history : []).flatMap((h) => {
      const v = num(h?.score);
      return v == null ? [] : [v];
    }).slice(-30),
  };
}
