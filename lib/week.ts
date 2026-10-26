import fs from "node:fs";
import path from "node:path";
import { getContent } from "@/lib/content";
import { watchList } from "@/lib/watch";
import { editions, slugFor } from "@/lib/editions";
import { pickWeek, teaserFrom, weekOf } from "@/lib/weekly-picks.mjs";

/** This week's best stories (the same picks as the weekly email): the 7 days ending on the newest edition. */
export function thisWeek() {
  const end = editions[0].date;
  const { start, days } = weekOf(
    editions.map((e) => e.date),
    end,
  );
  const stories = days.flatMap((d) =>
    getContent(d)
      .sections.flatMap((sec) => sec.stories.map((s) => ({ ...s, section: sec.name })))
      .map((s, i) => ({ ...s, date: d, n: i + 1 })),
  );
  const picks = pickWeek(days, stories).map((s) => ({
    date: s.date,
    n: s.n,
    topic: s.topic,
    pick: /pick/i.test(s.section),
    head: s.emailHead || s.title,
    title: s.title,
    teaser: teaserFrom(s.why),
    // Newer graphics have small WebP copies beside them (see FullStory.imageW); older ones only the original.
    thumb: s.image ? (s.imageW ? s.image.replace(/\.[a-z]+$/, "-sm.webp") : s.image) : "",
    href: `/daily/${slugFor(s.date)}/${s.n}`,
  }));
  return { start, end, days, editions: days.length, picks };
}

/** The written parts of a weekly issue (data/weekly/<end date>.json), drafted with the weekly email; all optional. */
export type WeeklyExtras = {
  /** "The week in one minute": one paragraph, facts only from that week's stories. */
  oneMinute?: string;
  /** "This week in history": one dated fact, with its source. */
  history?: { text: string; url: string; src: string };
  /** "And finally": a light closer, with its link. */
  andFinally?: { text: string; url: string; src?: string };
};

/** The newest weekly file dated inside this week, if any. */
export function weeklyExtras(start: string, end: string): WeeklyExtras | null {
  const dir = path.join(process.cwd(), "data", "weekly");
  if (!fs.existsSync(dir)) return null;
  const file = fs
    .readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f.slice(0, 10) >= start && f.slice(0, 10) <= end)
    .sort()
    .at(-1);
  return file ? JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) : null;
}

/** The AI Stress Index over the week, from the readings saved with each edition: first and last of the week. */
export function stressWeek(days: string[]) {
  const readings = days.map((d) => getContent(d).stressIndex).filter((r): r is NonNullable<typeof r> => Boolean(r));
  if (!readings.length) return null;
  const first = readings[0];
  const last = readings[readings.length - 1];
  return { from: readings.length > 1 ? first.score : null, fromDate: first.asOf, to: last.score, band: last.band, asOf: last.asOf };
}

/** Each market number at the end of the week, with the close it moved from: the first edition's saved close
 *  (or, with only one edition, that edition's own week-earlier close). Null when no edition has a strip. */
export function marketsWeek(days: string[]) {
  const snaps = days.map((d) => getContent(d).markets).filter((m): m is NonNullable<typeof m> => Boolean(m?.assets.length));
  if (!snaps.length) return null;
  const first = snaps[0];
  const last = snaps[snaps.length - 1];
  const asOf = last.assets.map((a) => a.asOf).sort().at(-1)!;
  return {
    asOf,
    assets: last.assets.map((a) => ({ ...a, week: snaps.length > 1 ? first.assets.find((f) => f.id === a.id)?.close : a.week })),
  };
}

/** The "What would change our mind" signs, flagging any whose mark changed during the week (a first mark is not a change). */
export function watchWeek(start: string, end: string) {
  return watchList().map((t) => ({ ...t, conditions: t.conditions.map((c) => ({ ...c, changed: c.history.length > 0 && c.since >= start && c.since <= end })) }));
}
