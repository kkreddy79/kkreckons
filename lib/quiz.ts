import { getContent } from "@/lib/content";
import { editions, slugFor } from "@/lib/editions";

/**
 * The weekly quiz: up to five questions from the last seven days' "Quote this" sentences (FullStory.cite).
 * Each question blanks the sentence's first figure with a unit (%, $, ₹, bn, …) and offers it with two
 * believable wrong answers, smallest first. Whether the right one is the lowest, middle or highest varies
 * (fixed by the sentence, so the page is static and answers can't be guessed from position).
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

function question(cite: string, href: string, date: string): Question | null {
  const m = FIGURE.exec(cite);
  if (!m) return null;
  const [whole, pre = "", num, unit] = m;
  const v = Number(num.replace(/,/g, ""));
  if (!v) return null;
  const decimals = (num.split(".")[1] || "").length;
  const commas = num.includes(",") || v >= 10000;
  const h = hash(cite);
  const factors = [[1.5, 2], [0.5, 2], [0.5, 0.75]][h % 3];
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
  const qs: Question[] = [];
  for (const d of days) {
    getContent(d)
      .sections.flatMap((sec) => sec.stories)
      .forEach((s, i) => {
        const q = s.cite && question(s.cite, `/daily/${slugFor(d)}/${i + 1}`, d);
        if (q) qs.push(q);
      });
  }
  // One question per edition first, so a busy day doesn't fill the quiz; then top up to five.
  const picked: Question[] = [];
  for (const d of days) {
    const q = qs.find((x) => x.date === d);
    if (q && picked.length < 5) picked.push(q);
  }
  for (const q of qs) if (picked.length < 5 && !picked.includes(q)) picked.push(q);
  return { start, end, questions: picked };
}
