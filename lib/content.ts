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
  imageAlt: string;
  /** Where the image comes from, for example "Original graphic: KKReckons" or a Creative Commons credit. */
  imageCredit?: string;
  /** Optional overrides from the newsletter data: publisher name, paywall flag, theme names. */
  src?: string;
  pay?: boolean;
  themes?: string[];
};

export type EditionContent = {
  date: string;
  slice: string;
  artifact: string;
  readingMinutes: number;
  callouts: { num: string; text: string; url: string }[];
  sections: { name: string; stories: FullStory[] }[];
  reading: { title: string; url: string; note: string }[];
};


/** Full content for one edition (read at build time). */
export function getContent(date: string): EditionContent {
  const file = path.join(process.cwd(), "data", "content", `${date}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
