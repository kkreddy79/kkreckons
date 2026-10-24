import { getContent } from "@/lib/content";
import { editions, slugFor } from "@/lib/editions";

/**
 * The weekly quiz: up to five questions from the last seven days' quotable sentences (FullStory.cite).
 * Each question blanks the sentence's first figure with a unit (%, $, ₹, bn, …) and offers it with two
 * believable wrong answers, smallest first. Where the right one sits (lowest, middle or highest) is set per
 * quiz, not per sentence: the five questions cycle through all three positions from a starting point fixed by
 * the week, so no two questions in a row share a position and the answer can't be guessed from it. The page
 * stays static.
 */
export type Question = { before: string; after: string; options: string[]; answer: number; href: string; date: string };

const FIGURE = /([$₹€£]\s?)?(\d[\d,]*(?:\.\d+)?)(\s?(?:%|bn|billion|mn|million|tn|trillion|crore|cr|lakh|bp|x)\b|%)/;

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** 23 → "23", 0.5 × 23 → "12", 1.5 × 1194.5 → "1,792" (keeps decimals only where the original had them). */
function fmt(v: number, decimals: number, commas: boolean) {
  const r = v.toFixed(decimals);
  if (!commas) return r;
  const [i, d] = r.split(".");
  return Number(i).toLocaleString("en-US") + (d ? `.${d}` : "");
}

/** Wrong-answer multipliers that put the right answer lowest, in the middle or highest (options sort ascending). */
const FACTORS: [number, number][] = [
  [1.5, 2],
  [0.5, 2],
  [0.5, 0.75],
];

function question(cite: string, href: string, date: string, position: number): Question | null {
  const m = FIGURE.exec(cite);
  if (!m) return null;
  const [whole, pre = "", num, unit] = m;
  const v = Number(num.replace(/,/g, ""));
  if (!v) return null;
  const decimals = (num.split(".")[1] || "").length;
  const commas = num.includes(",") || v >= 10000;
  const factors = FACTORS[position];
  // A share can't pass 100%: keep wrong percentages below it when the right one is.
  const cap = (x: number) => (unit.trim() === "%" && v <= 100 && x > 100 ? (v + 100) / 2 : x);
  const wrong = factors.map((f) => cap(Math.max(v * f, decimals ? 0.1 : 1)));
  const values = [...new Set([v, ...wrong].map((x) => Number(x.toFixed(decimals))))].sort((a, b) => a - b);
  if (values.length < 3) return null;
  const options = values.map((x) => (x === v ? whole : `${pre}${fmt(x, decimals, commas)}${unit}`));
  const answer = values.indexOf(v);
  return { before: cite.slice(0, m.index), after: cite.slice(m.index + whole.length), options, answer, href, date };
}

export function weeklyQuiz() {
  const end = editions[0].date;
  const start = new Date(new Date(`${end}T00:00:00Z`).getTime() - 6 * 864e5).toISOString().slice(0, 10);
  const days = editions.filter((e) => e.date >= start).map((e) => e.date);
  // Every sentence that can make a question (at some answer position), in edition order.
  const cites: { cite: string; href: string; date: string }[] = [];
  for (const d of days) {
    getContent(d)
      .sections.flatMap((sec) => sec.stories)
      .forEach((s, i) => {
        if (s.cite && [0, 1, 2].some((p) => question(s.cite!, "", d, p))) cites.push({ cite: s.cite, href: `/daily/${slugFor(d)}/${i + 1}`, date: d });
      });
  }
  // One question per edition first, so a busy day doesn't fill the quiz; then top up to five.
  const picked: typeof cites = [];
  for (const d of days) {
    const c = cites.find((x) => x.date === d);
    if (c && picked.length < 5) picked.push(c);
  }
  for (const c of cites) if (picked.length < 5 && !picked.includes(c)) picked.push(c);
  // Positions step by 2 (mod 3): 0, 2, 1, 0, 2 from a week-dependent start, so all three appear and no two
  // neighbours match. If a figure can't take its position (say, a share near 100%), the next one that fits.
  const first = hash(start) % 3;
  const questions = picked.flatMap((c, i) => {
    const want = (first + 2 * i) % 3;
    const q = [want, (want + 1) % 3, (want + 2) % 3].map((p) => question(c.cite, c.href, c.date, p)).find(Boolean);
    return q ? [q] : [];
  });
  return { start, end, questions };
}
