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
  /** Original size of `image`; WebP copies sit beside it as `-sm.webp` (640px), `-md.webp` (860px) and `-lg.webp` (full width). */
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
};

export type EditionContent = {
  date: string;
  slice: string;
  artifact: string;
  readingMinutes: number;
  callouts: { num: string; text: string; url: string }[];
  sections: { name: string; stories: FullStory[] }[];
  reading: { title: string; url: string; note: string }[];
  /** AI Stress Index reading taken when the edition was published (only when a story links to it). */
  stressIndex?: { score: number; band: string; asOf: string; backCalculated?: boolean };
};


/** Full content for one edition (read at build time). */
export function getContent(date: string): EditionContent {
  const file = path.join(process.cwd(), "data", "content", `${date}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
