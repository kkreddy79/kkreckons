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
  return { start, end, editions: days.length, picks };
}
