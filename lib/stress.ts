/* Where the AI Stress Index data lives: GitHub Pages first, then the raw file on GitHub when github.io
   can't be reached (Pages outage, or a network that blocks github.io). Both serve the same docs/ files.
   Shared by the server render and the browser fallback, so it must stay free of "use client". */
export const STRESS_BASES = ["https://kkreddy79.github.io/ai-implosion", "https://raw.githubusercontent.com/kkreddy79/ai-implosion/main/docs"];

/** Fetches one of the index's JSON files on the server, re-checked at most hourly; null when no source answers. */
export async function loadStressFile<T>(file: string): Promise<T | null> {
  for (const base of STRESS_BASES) {
    try {
      const r = await fetch(`${base}/${file}`, { next: { revalidate: 3600 } });
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

export function liveStress(d: StressData | null): LiveStress | null {
  if (!d || d.score == null) return null;
  const total = d.factors.reduce((t, f) => t + f.weight, 0);
  const stale = d.factors.filter((f) => f.stale).reduce((t, f) => t + f.weight, 0);
  return {
    score: d.score,
    asOf: d.asOf,
    prevScore: d.prevScore ?? null,
    prevDate: d.prevDate ?? null,
    limited: total > 0 && stale / total > LIMITED,
    trend: d.history.flatMap((h) => (h.score == null ? [] : [h.score])).slice(-30),
  };
}
