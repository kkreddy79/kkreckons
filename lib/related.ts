import { getContent } from "@/lib/content";
import { editions, slugFor } from "@/lib/editions";

/** An earlier or later story that names the same companies, people, places or policies. */
export type Related = { date: string; title: string; href: string; shared: string[] };

// Capitalised words that start sentences or headlines rather than name something.
const SKIP = new Set(
  "A An The This That These Those It Its Why What When Where Who How Now New Not No Yes And But Or If As At By For From In Into Of On To With Over After Before Up Down Out Is Are Was Were Be Can Could Will Would Should May Might Must One Two Three Some Most Many More Less Big Small Every All Both Each Other Another Their They We Our You Your He She His Her Here There Also Even Only Just Still Yet So Than Then Today Tomorrow Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April June July August September October November December Mr Ms Dr Lex Unhedged Opinion Explainer WSJ FT ET Mint Prime India Indian Indians US USA America American Americans UK Europe European World Global AI IT CEO CEOs Investors Banks Banking Debt Data-centre Data Markets Market Stocks GDP Inc Ltd Co Group South North East West War York Bank Fund Times Capital Digital Investing Defence PhD".split(
    " ",
  ),
);
// Two shared names, or one name rare enough to be specific (in at most ~3 stories).
const MIN_SCORE = 4;
const MIN_SINGLE = 4.0;

/** Capitalised words that aren't the first word of a sentence: in sentence-case headlines and summaries, these are names. */
function names(texts: string[]) {
  const out = new Set<string>();
  for (const sentence of texts.flatMap((t) => t.split(/(?<=[.!?:;])\s+/))) {
    const words = sentence.split(/\s+/).slice(1);
    for (const raw of words) {
      const w = raw.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "").replace(/['’]s$/, "");
      if (/^[A-Z][A-Za-z0-9&-]*$/.test(w) && (w.length > 2 || /^[A-Z]{2}$/.test(w)) && !SKIP.has(w)) out.add(w);
    }
  }
  return out;
}

type Entry = { date: string; n: number; title: string; names: Set<string>; lead: Set<string> };
let index: Entry[] | null = null;
let weight: Map<string, number> | null = null;

function build() {
  index = [];
  for (const e of editions) {
    const c = getContent(e.date);
    c.sections
      .flatMap((sec) => sec.stories)
      .forEach((s, i) => index!.push({ date: e.date, n: i + 1, title: s.title, names: names([s.title, ...s.points]), lead: names([`x ${s.title}`]) }));
  }
  // Rare names say more than common ones ("Nscale" beats "India").
  const df = new Map<string, number>();
  for (const x of index) for (const w of x.names) df.set(w, (df.get(w) || 0) + 1);
  weight = new Map([...df].map(([w, k]) => [w, Math.log((index!.length + 1) / k)]));
}

/** Up to `limit` stories from other editions that name the same things as this edition's stories: one per edition, spread across this edition's stories first. */
export function relatedFor(date: string, limit = 3): Related[] {
  if (!index) build();
  const mine = index!.filter((x) => x.date === date);
  const found: { score: number; x: Entry; from: number; shared: string[] }[] = [];
  for (const x of index!) {
    if (x.date === date) continue;
    for (const m of mine) {
      const shared = [...m.names].filter((w) => x.names.has(w));
      // A name in either headline is what the story is about, so it counts double.
      const score = shared.reduce((t, w) => t + weight!.get(w)! * (m.lead.has(w) || x.lead.has(w) ? 2 : 1), 0);
      // The match must involve what today's story is about: a name in its headline.
      if (!shared.some((w) => m.lead.has(w))) continue;
      if (shared.length >= 2 ? score >= MIN_SCORE : shared.length === 1 && score >= MIN_SINGLE) found.push({ score, x, from: m.n, shared });
    }
  }
  found.sort((a, b) => b.score - a.score || (a.x.date < b.x.date ? 1 : -1));
  const picked: typeof found = [];
  for (const spread of [true, false]) {
    for (const f of found) {
      if (picked.length >= limit) break;
      if (picked.some((p) => p.x.date === f.x.date || (spread && p.from === f.from))) continue;
      picked.push(f);
    }
  }
  return picked.map(({ x, shared }) => ({
    date: x.date,
    title: x.title,
    href: `/daily/${slugFor(x.date)}#story-${x.n}`,
    shared: shared.sort((a, b) => weight!.get(b)! - weight!.get(a)!).slice(0, 3),
  }));
}
