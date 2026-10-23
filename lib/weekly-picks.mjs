// The week's best stories, shared by the weekly email (scripts/weekly-email.mjs) and the /week page.
// Plain JavaScript so the Node script can use it as is; types are in weekly-picks.d.mts.

// A teaser from "why it matters" when the newsletter gave none: its first sentence that stands on its
// own out of the day's context ("the gloom half of today's picks" doesn't), cut at a ; when long.
export function teaserFrom(why) {
  const sentences = String(why || "").match(/[^.!?]+[.!?]+/g) || [String(why || "")];
  let t = (sentences.find((x) => !/\btoday'?s?\b|\bpicks?\b|\bthis edition\b/i.test(x)) || sentences[0]).trim();
  if (t.split(/\s+/).length > 18 && /[;:]/.test(t)) t = t.split(/[;:]/)[0].trim() + ".";
  return t;
}

// Broad topics, from each story's category (first match wins). The weekly takes at most one story
// per topic (two for AI, the site's main beat), so a week heavy on one subject still reads varied.
const TOPICS = [
  ["AI", /\bAI\b|neocloud|chip/i],
  ["India", /india|rupee|upi/i],
  ["Jobs and careers", /\bjobs?\b|career/i],
  ["Tech and security", /cyber|security|software|IT services|payments|tech/i],
  ["Markets and money", /invest|credit|bond|debt|equity|IPO|commodit|gold|finance|bank|billionaire|wealth/i],
  ["Economy and policy", /econom|tax|policy|privatis|growth|sovereign|trade/i],
  ["Climate and energy", /climate|solar|energy|grid|weather/i],
  ["Transport", /transport|auto|aviation/i],
  ["Health and science", /health|medic|science/i],
  ["Ideas and culture", /.*/],
];
const MAX = 8;
const CAP = { AI: 2 };
const topicOf = (s) => (/india/i.test(s.section) && !/\bAI\b/i.test(s.category || "") ? "India" : TOPICS.find(([, re]) => re.test(s.category || ""))[0]);

/** The 7 days ending on `end` (YYYY-MM-DD), as edition dates from `dates`. */
export function weekOf(dates, end) {
  const start = new Date(new Date(`${end}T00:00:00Z`).getTime() - 6 * 864e5).toISOString().slice(0, 10);
  return { start, days: dates.filter((d) => d >= start && d <= end).sort() };
}

/**
 * Up to 8 stories from the week's stories ({ ...story, section, date, n }): KK's Picks of the day first,
 * then each edition in its own order. Every edition gets one story (its first with a topic still free),
 * then the remaining places go by topic, at most two per edition. Returned in date and story order,
 * each with its `topic`.
 */
export function pickWeek(days, stories) {
  const ranked = [...stories.filter((s) => /pick/i.test(s.section)), ...stories.filter((s) => !/pick/i.test(s.section))];
  const used = {};
  const perDay = {};
  const chosen = [];
  const take = (s) => {
    const t = topicOf(s);
    if (chosen.some((c) => c.s === s) || chosen.length >= MAX || (used[t] || 0) >= (CAP[t] || 1) || (perDay[s.date] || 0) >= 2) return false;
    used[t] = (used[t] || 0) + 1;
    perDay[s.date] = (perDay[s.date] || 0) + 1;
    chosen.push({ s, topic: t });
    return true;
  };
  for (const d of days) ranked.filter((s) => s.date === d).some(take);
  ranked.forEach(take);
  return chosen.sort((x, y) => x.s.date.localeCompare(y.s.date) || x.s.n - y.s.n).map(({ s, topic }) => ({ ...s, topic }));
}
