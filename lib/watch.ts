import data from "@/data/watch.json";
import { getContent } from "@/lib/content";
import { getEdition } from "@/lib/editions";

export type WatchState = "met" | "partly" | "not-met";

/** One sign a thesis is breaking, marked from KKReckons stories (data/watch.json, edited by hand). */
type WatchCondition = {
  id: string;
  label: string;
  /** What would count as this sign happening. */
  test: string;
  state: WatchState;
  /** The date the current state began. */
  since: string;
  evidence: string;
  /** The stories behind the state, oldest first, each resolved to its headline. */
  links: { href: string; date: string; title: string }[];
  /** Earlier states, newest first. */
  history: { state: WatchState; since: string }[];
};

export type Watch = { id: string; thesis: string; intro: string; conditions: WatchCondition[] };

/** The headline of a story page ("/daily/<month>-<day>-<year>/<n>"), or "" if there is none. */
function titleOf(href: string) {
  const m = href.match(/^\/daily\/([a-z]+-\d+-\d+)\/(\d+)$/);
  const e = m && getEdition(m[1]);
  return e ? getContent(e.edition.date).sections.flatMap((sec) => sec.stories)[+m[2] - 1]?.title ?? "" : "";
}

/** Every thesis with its story links resolved. Server only: it reads edition content, so the page passes the result down. */
export function watchList(): Watch[] {
  return data.theses.map((t) => ({
    ...t,
    conditions: t.conditions.map((c) => ({
      ...c,
      state: c.state as WatchState,
      history: c.history as WatchCondition["history"],
      links: c.links.map((l) => ({ ...l, title: titleOf(l.href) })),
    })),
  }));
}

/** "4 signs · 1 partly met · 0 met", for the short line on Home. */
export function watchSummary() {
  const t = data.theses[0];
  const count = (s: WatchState) => t.conditions.filter((c) => c.state === s).length;
  return { thesis: t.thesis, total: t.conditions.length, met: count("met"), partly: count("partly") };
}
