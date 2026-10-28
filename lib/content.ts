import fs from "node:fs";
import path from "node:path";

/** A story with its full content, as rendered on an edition page. */
export type FullStory = {
  category: string;
  tag: string;
  title: string;
  url: string;
  url2: string;
  points: string[];
  numbers: [string, string][];
  why: string;
  other: string;
  also: { title: string; url: string }[];
  image: string;
  /** Original size of `image`; WebP copies sit beside it as `-sm.webp` (640px), `-md.webp` (860px) and `-lg.webp` (full width), plus a 184×240 thumbnail, `-th.webp`. */
  imageW?: number;
  imageH?: number;
  imageAlt: string;
  /** Where the image comes from, for example "Original graphic: KKReckons" or a Creative Commons credit. */
  imageCredit?: string;
  /** Optional overrides from the newsletter data: publisher name, paywall flag, theme names. */
  src?: string;
  pay?: boolean;
  /** A free version of a paywalled story (wire copy, the company's own release, a gift link), and its publisher name. */
  freeUrl?: string;
  freeSrc?: string;
  themes?: string[];
  /** Short headline written for the email; also used in the edition's "Today in 30 seconds" list. */
  emailHead?: string;
  /** One self-contained sentence with the story's key figure, source and date. Not shown on the page: the story
   *  page's search, preview and structured-data description, and the weekly quiz's questions. */
  cite?: string;
  /** Editorial choice: show a link to the AI Stress Index under this story. */
  stressIndex?: boolean;
  /** The earlier story this one updates, as its page path ("/daily/october-21-2026/3"). Both stories link to each other. */
  follows?: string;
  /** One line on what changed since that earlier story, shown on the earlier story's "What happened next". */
  update?: string;
};

export type EditionContent = {
  date: string;
  slice: string;
  artifact: string;
  readingMinutes: number;
  callouts: { num: string; text: string; url: string }[];
  sections: { name: string; stories: FullStory[] }[];
  /** `special`: KKReckons' own research brief for the day, teased at the top of the edition and the email. */
  reading: { title: string; url: string; note: string; special?: boolean }[];
  /** AI Stress Index reading taken when the edition was published (only when a story links to it). */
  stressIndex?: { score: number; band: string; asOf: string; backCalculated?: boolean };
  /** Six market numbers at the last close before the edition (data/markets/<date>.json). */
  markets?: { source: string; assets: MarketAsset[] };
  /** A pointer to a KKReckons special report (/special/<slug>): a banner after the numbers of the day, and one line in the email.
   *  Not a news link, so it may appear in more than one edition and isn't counted as a used article. */
  special?: SpecialPointer;
  /** KK's takeaway for the day: two short beats for the email ("Less air." / "More bill.") and one plain sentence that
   *  says what the day's headline is about, shown under it on the site. */
  takeaway?: { a: string; b: string; line: string };
};

export type SpecialPointer = { kicker: string; title: string; intro: string; url: string; cta: string };

/** One number in the market strip: `prev` is the close before `asOf`, `week` the last close at least 7 days earlier. */
export type MarketAsset = {
  id: string;
  name: string;
  /** "index" points, "yield" per cent, "usd" dollars, "fx" rupees per dollar. */
  unit: "index" | "yield" | "usd" | "fx";
  close: number;
  asOf: string;
  prev: number;
  week?: number;
  /** Up to 30 closes, oldest first. */
  spark: number[];
};


/** Full content for one edition (read at build time). */
// Each page build reads many editions (an edition page reads every earlier one for related stories), so each file
// is parsed once. The cached copy is frozen: a caller that tried to change it would throw rather than alter what
// every later page sees.
const cache = new Map<string, EditionContent>();
const freeze = <T,>(o: T): T => {
  if (o && typeof o === "object" && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o)) freeze(v);
  }
  return o;
};
export function getContent(date: string): EditionContent {
  let c = cache.get(date);
  if (!c) {
    const file = path.join(process.cwd(), "data", "content", `${date}.json`);
    c = freeze(JSON.parse(fs.readFileSync(file, "utf8")) as EditionContent);
    cache.set(date, c);
  }
  return c;
}
