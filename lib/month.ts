import { getContent } from "@/lib/content";
import { thumbOf } from "@/lib/figs";
import { editions, monthLabel, slugFor, themesOf } from "@/lib/editions";
import { teaserFrom } from "@/lib/weekly-picks.mjs";
import { monthSlug } from "@/lib/dates.mjs";

/** "2026-10" → "october-2026" */
export { monthSlug };

/** Months with at least one edition, newest first, as "YYYY-MM". */
export const months = [...new Set(editions.map((e) => e.date.slice(0, 7)))];

export const monthBySlug = (slug: string) => months.find((m) => monthSlug(m) === slug);

/**
 * A month's roundup: each edition's Pick of the day (KK's own choice of the day's best story), the themes
 * covered most, and the AI Stress Index readings saved with that month's editions.
 */
export function monthRoundup(ym: string) {
  const days = editions.filter((e) => e.date.startsWith(ym)).sort((a, b) => a.date.localeCompare(b.date));
  const picks = days.map((e) => {
    const c = getContent(e.date);
    const all = c.sections.flatMap((sec) => sec.stories.map((s) => ({ ...s, section: sec.name })));
    const i = Math.max(0, all.findIndex((s) => /pick/i.test(s.section)));
    const s = all[i];
    return {
      date: e.date,
      head: s.emailHead || s.title,
      title: s.title,
      teaser: teaserFrom(s.why),
      thumb: thumbOf(s),
      href: `/daily/${slugFor(e.date)}/${i + 1}`,
      slice: e.slice,
    };
  });
  const counts = new Map<string, number>();
  for (const e of days) for (const s of e.stories) for (const t of themesOf(s)) counts.set(t, (counts.get(t) || 0) + 1);
  const themes = [...counts].sort((a, b) => b[1] - a[1]);
  const stress = days.flatMap((e) => {
    const si = getContent(e.date).stressIndex;
    return si && !si.backCalculated ? [{ date: e.date, score: si.score, band: si.band }] : [];
  });
  return { ym, label: monthLabel(`${ym}-01`), days, picks, themes, stress, stories: days.reduce((n, e) => n + e.stories.length, 0) };
}
