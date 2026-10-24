import data from "@/data/editions.json";
import { slugFor, type Edition } from "@/lib/editionFormat";

export * from "@/lib/editionFormat";

/** Newest first. */
export const editions: Edition[] = (data as Edition[]).slice().sort((a, b) => (a.date < b.date ? 1 : -1));

export function getEdition(slug: string) {
  const i = editions.findIndex((e) => slugFor(e.date) === slug);
  if (i < 0) return null;
  return { edition: editions[i], newer: editions[i - 1] ?? null, older: editions[i + 1] ?? null };
}

export const latest = editions[0];

export const totalStories = editions.reduce((n, e) => n + e.stories.length, 0);
