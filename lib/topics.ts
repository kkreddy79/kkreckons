import { getContent } from "@/lib/content";
import { THEMES, editions, themeSlug, themesOf } from "@/lib/editions";

/**
 * One crawlable page per archive theme (/topics/<slug>). The theme list and matching rules stay in
 * lib/editions.ts (THEMES); this adds the line that introduces each page.
 */
const BLURBS: Record<string, string> = {
  "AI": "Models, chips, agents and the money behind them: what AI is changing, and what it costs.",
  "Markets": "Stocks, bonds, gold and credit: the moves worth understanding, not just watching.",
  "Banking": "Banks, lenders and central banks, from the RBI to Wall Street.",
  "India": "India’s economy, companies, policy and people, with the numbers that matter.",
  "Jobs & careers": "Hiring, layoffs and skills: how work is shifting, in India and abroad.",
  "Geopolitics": "Trade, tariffs, defence and diplomacy: the forces reshaping who makes what, and where.",
  "Personal finance": "Savings, tax, insurance and debt: what the day’s news means for your money.",
  "Health & science": "Medicine, space and discovery: the science stories worth your attention.",
};

export const TOPICS = THEMES.map(({ name }) => {
  const blurb = BLURBS[name];
  if (!blurb) throw new Error(`lib/topics.ts: no blurb for the "${name}" theme`);
  return { name, slug: themeSlug(name), blurb };
});

export const topicBySlug = (slug: string) => TOPICS.find((t) => t.slug === slug);

const cache = new Map<string, ReturnType<typeof findStories>>();

/** Every story in a theme, newest first, with the summary shown on its edition page. */
export function topicStories(name: string) {
  if (!cache.has(name)) cache.set(name, findStories(name));
  return cache.get(name)!;
}

function findStories(name: string) {
  return editions.flatMap((edition) => {
    const full = getContent(edition.date).sections.flatMap((sec) => sec.stories);
    return edition.stories
      .filter((story) => themesOf(story).includes(name))
      .map((story) => ({ edition, story, full: full.find((f) => f.title === story.title) }));
  });
}
