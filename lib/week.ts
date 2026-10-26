import fs from "node:fs";
import path from "node:path";
import { getContent } from "@/lib/content";
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
