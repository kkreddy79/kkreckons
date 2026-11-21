"use client";

import Link from "@/components/Link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edition,
  THEMES,
  isPaywalled,
  longDate,
  publisherName,
  slugFor,
  storyHref,
  storyPageHref,
  themeSlug,
  themesOf,
  weekday,
} from "@/lib/editionFormat";
import SourcePicker from "@/components/SourcePicker";
import StorySource, { PaidMark, storyHover, storyPaid } from "@/components/StorySource";

/** A story's second source link, keyed by "date|title". */
export type StoryLinks = Record<string, string>;

/** A story's first summary points, "why it matters" and other side, keyed by "date|title" (served by /daily/summaries.json). */
export type StorySummaries = Record<string, { points: string[]; why: string; other?: string }>;

export type ReadingLink = { date: string; title: string; url: string; note: string };

/** What search, filters and the story list work from (served by /daily/index.json, fetched on first use). */
export type ArchiveData = { editions: Edition[]; links: StoryLinks; reading: ReadingLink[] };

/** One month of the "By edition" list, with only what its rows show. */
export type ArchiveMonth = { label: string; items: { date: string; slice: string; heads: string; stories: number; readingMinutes: number }[] };

/** "12 stories" / "1 further reading link" */
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Dropdown count: stories, plus further reading links when there are any. */
const countLabel = (stories: number, links: number) => (links ? `${stories} · ${links} reading` : `${stories}`);

const NO_EDITIONS: Edition[] = [];
const NO_LINKS: StoryLinks = {};
const NO_READING: ReadingLink[] = [];

export default function ArchiveBrowser({
  months,
  themeCounts: allThemeCounts,
  totals,
}: {
  months: ArchiveMonth[];
  /** Stories in each theme across the archive, counted on the server so the chips show them at once. */
  themeCounts: Record<string, number>;
  totals: { stories: number; reading: number };
}) {
  // The stories themselves load the first time a reader reaches for the search box, a filter or the story list
  // (or arrives with a filter in the URL); the list of editions needs none of it.
  const [data, setData] = useState<ArchiveData | null>(null);
  const [wanted, setWanted] = useState(false);
  const want = useCallback(() => setWanted(true), []);
  useEffect(() => {
    if (!wanted || data) return;
    let live = true;
    fetch("/daily/index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: ArchiveData) => live && setData(d))
      // Failed (offline, a blip): the next touch of the controls tries again.
      .catch(() => live && setWanted(false));
    return () => {
      live = false;
    };
  }, [wanted, data]);
  const editions = data?.editions ?? NO_EDITIONS;
  const links = data?.links ?? NO_LINKS;
  const reading = data?.reading ?? NO_READING;

  // Filters live in the URL (?q=, ?theme=, ?source=, ?free=1) but are read after mount, so the page is fully
  // rendered on the server with the default "By edition" list (visible to crawlers and link previews).
  const [query, setQuery] = useState("");
  const [theme, setThemeState] = useState("");
  const [source, setSource] = useState("");
  const [free, setFree] = useState(false);
  const [view, setView] = useState<"editions" | "stories">("editions");
  const [summaries, setSummaries] = useState<StorySummaries | null>(null);

  // The story list's quick summaries load the first time it's shown; until then (or if the fetch fails, in
  // which case the next visit to the list tries again) each result shows its headline and sources.
  useEffect(() => {
    if (view !== "stories" || summaries) return;
    let live = true;
    fetch("/daily/summaries.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: StorySummaries | null) => live && d && setSummaries(d))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [view, summaries]);

  // Arriving from the "/" shortcut on another page (/daily#search): put the cursor in the search box.
  useEffect(() => {
    if (location.hash === "#search") document.getElementById("archive-search")?.focus();
  }, []);

  useEffect(() => {
    if (view === "stories") want();
  }, [view, want]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const [q, t, s] = [p.get("q") ?? "", p.get("theme") ?? "", p.get("source") ?? ""];
    // ?source=free is the older link form of the free-to-read filter.
    const f = p.get("free") === "1" || s === "free";
    if (!q && !t && !s && !f) return;
    setQuery(q);
    setThemeState(t);
    setSource(s === "free" ? "" : s);
    setFree(f);
    setView("stories");
    if (s === "free") {
      p.delete("source");
      p.set("free", "1");
      window.history.replaceState(null, "", `/daily?${p}`);
    }
  }, []);

  // The search text goes into the URL too (?q=), half a second after typing stops, so a search can be shared.
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(window.location.search);
      const q = query.trim();
      if ((next.get("q") ?? "") === q) return;
      if (q) next.set("q", q);
      else next.delete("q");
      window.history.replaceState(null, "", `/daily${next.size ? `?${next}` : ""}${window.location.hash}`);
    }, 500);
    return () => clearTimeout(id);
  }, [query]);

  const setParam = (key: "theme" | "source" | "free", value: string) => {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    window.history.replaceState(null, "", `/daily${next.size ? `?${next}` : ""}`);
    if (key === "theme") setThemeState(value);
    else if (key === "free") setFree(!!value);
    else setSource(value);
    if (value) setView("stories");
  };
  const clearAll = () => {
    setQuery("");
    setThemeState("");
    setSource("");
    setFree(false);
    window.history.replaceState(null, "", "/daily");
  };
  const setTheme = (t: string) => setParam("theme", t !== theme ? t : "");

  /** Every story with its source links and summary, ready to filter. */
  const all = useMemo(
    () =>
      editions.flatMap((e) =>
        e.stories.map((story) => {
          const s = {
            title: story.title,
            url: story.url,
            src: story.src,
            pay: story.pay,
            url2: links[`${e.date}|${story.title}`] ?? "",
            ...(summaries?.[`${e.date}|${story.title}`] ?? { points: [], why: "" }),
          };
          const pubs = [s.url ? s.src || publisherName(s.url) : "", s.url2 ? publisherName(s.url2) : ""].filter(Boolean);
          return { edition: e, story, s, pubs, paid: storyPaid(s) };
        })
      ),
    [editions, links, summaries]
  );

  /** Stories in each theme across the archive, shown on its filter chip (the same counts as the topic pages). */
  const themeCounts = allThemeCounts;

  /** Stories matching the theme and search, before the source filter, so source counts follow them. */
  const q = query.trim().toLowerCase();
  const base = useMemo(
    () =>
      all
        .filter((a) => !theme || themesOf(a.story).includes(theme))
        .filter(
          (a) =>
            !q ||
            `${a.story.title} ${a.story.category} ${a.story.section} ${a.pubs.join(" ")}`.toLowerCase().includes(q)
        ),
    [all, q, theme]
  );

  /** Further reading links matching the theme and search, the same way. */
  const readingBase = useMemo(
    () =>
      reading
        .map((r) => ({ ...r, pub: publisherName(r.url), paid: isPaywalled(r.url) }))
        .filter((r) => !theme || themesOf({ category: r.note, title: r.title }).includes(theme))
        .filter((r) => !q || `${r.title} ${r.note} ${r.pub}`.toLowerCase().includes(q)),
    [reading, q, theme]
  );

  /** Publishers by matching stories (then reading links), most first; the selected one stays listed even at zero. */
  const publishers = useMemo(() => {
    const n = new Map<string, [number, number]>();
    const bump = (p: string, i: 0 | 1) => {
      const c = n.get(p) ?? [0, 0];
      c[i] += 1;
      n.set(p, c);
    };
    for (const a of base) for (const p of new Set(a.pubs)) bump(p, 0);
    for (const r of readingBase) bump(r.pub, 1);
    if (source && !n.has(source)) n.set(source, [0, 0]);
    return [...n].sort((a, b) => b[1][0] - a[1][0] || b[1][1] - a[1][1] || a[0].localeCompare(b[0]));
  }, [base, readingBase, source]);
  const freeCount = base.filter((a) => !a.paid && (!source || a.pubs.includes(source))).length;
  const freeReading = readingBase.filter((r) => !r.paid && (!source || r.pub === source)).length;

  const matches = useMemo(
    () => base.filter((a) => (!source || a.pubs.includes(source)) && (!free || !a.paid)),
    [base, source, free]
  );
  const readingMatches = useMemo(
    () => readingBase.filter((r) => (!source || r.pub === source) && (!free || !r.paid)),
    [readingBase, source, free]
  );

  return (
    <>
      {/* Reaching for any control (hover, focus or touch) starts loading the stories behind it. */}
      <div className="cu-controls" onPointerOver={want} onFocus={want} onTouchStart={want}>
      <div className="toolbar">
        <input
          id="archive-search"
          type="search"
          value={query}
          aria-keyshortcuts="/"
          placeholder="Search headlines, topics, companies…"
          aria-label="Search stories"
          onChange={(ev) => {
            setQuery(ev.target.value);
            if (ev.target.value) setView("stories");
          }}
        />
        <div className="seg" role="group" aria-label="View">
          <button type="button" aria-pressed={view === "editions"} onClick={() => setView("editions")}>
            By edition
          </button>
          <button type="button" aria-pressed={view === "stories"} onClick={() => setView("stories")}>
            All stories
          </button>
        </div>
      </div>
      <div className="chips">
        {THEMES.map((t) => (
          <button
            key={t.name}
            className={`chip${theme === t.name ? " on" : ""}`}
            aria-pressed={theme === t.name}
            onClick={() => setTheme(t.name)}
          >
            {t.name} <span>{themeCounts[t.name]}</span>
          </button>
        ))}
        {theme && (
          <button className="chip clear" onClick={() => setTheme("")}>
            Clear ×
          </button>
        )}
      </div>
      <div className="src-filter">
        <span className="src-label" id="src-label">Source</span>
        <SourcePicker
          value={source}
          onChange={(v) => setParam("source", v)}
          options={[
            { value: "", label: "All sources", count: data ? countLabel(base.length, readingBase.length) : countLabel(totals.stories, totals.reading) },
            ...publishers.map(([name, [stories, links]]) => ({ value: name, label: name, count: countLabel(stories, links) })),
          ]}
        />
        {source && (
          <button className="chip clear" onClick={() => setParam("source", "")}>
            Clear ×
          </button>
        )}
        <button
          type="button"
          className={`chip${free ? " on" : ""}`}
          aria-pressed={free}
          onClick={() => setParam("free", free ? "" : "1")}
        >
          Free to read{data && <> ({countLabel(freeCount, freeReading)})</>}
        </button>
      </div>
      </div>

      {view === "editions" ? (
        months.map((m) => (
          <section key={m.label} className="month">
            <h2 className="month-label">{m.label}</h2>
            <div className="timeline">
              {m.items.map((e) => (
                <Link key={e.date} href={`/daily/${slugFor(e.date)}`} className="tl-item">
                  <span className="tl-day" aria-hidden>
                    <b>{e.date.slice(8).replace(/^0/, "")}</b>
                    {weekday(e.date).slice(0, 3)}
                  </span>
                  <div>
                    <div className="tl-date">{longDate(e.date)}</div>
                    {e.slice && <p className="tl-slice">{e.slice}</p>}
                    <p className="tl-heads">{e.heads}</p>
                    <span className="tl-meta">
                      {e.stories} stories · {e.readingMinutes} min read
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      ) : !data ? (
        <section className="story-results" aria-busy="true">
          <p className="count">Loading stories…</p>
        </section>
      ) : (
        <section className="story-results">
          <p className="count">
            {plural(matches.length, "story", "stories")}
            {readingMatches.length > 0 && <> and {plural(readingMatches.length, "further reading link", "further reading links")}</>}
            {theme && <> in <b>{theme}</b></>}
            {source && <> from <b>{source}</b></>}
            {free && <>, free to read</>}
            {q && <> matching “{query.trim()}”</>}
            {theme && (
              <>
                {" "}
                · <Link href={`/topics/${themeSlug(theme)}`} prefetch={false}>All {theme} stories on one page →</Link>
              </>
            )}
          </p>
          {matches.length === 0 && readingMatches.length === 0 && (
            <div className="sr-empty">
              <p>
                <b>No matches.</b> Try a shorter word, a company name or a different theme.
              </p>
              <button type="button" className="chip clear" onClick={clearAll}>
                Clear search and filters ×
              </button>
            </div>
          )}
          <ul>
            {matches.map(({ edition, story, s }, i) => (
              <li key={edition.date + story.title}>
                <Link href={storyHref(edition, story)} className="sr-date">
                  {longDate(edition.date)}
                </Link>
                <div className="sr-title">
                  {story.category && <span className="cat">{story.category}</span>}
                  {story.tag && <span className="tag">{story.tag}</span>}
                  {s.url || s.url2 ? (
                    <a href={s.url || s.url2} target="_blank" rel="noreferrer" title={storyHover(s)}>
                      {story.title}
                    </a>
                  ) : (
                    <Link href={storyHref(edition, story)}>{story.title}</Link>
                  )}
                </div>
                <div className="sr-src">
                  <StorySource s={s} id={`sr-qs-${edition.date}-${i}`} explainer={storyPageHref(edition, story)} />
                </div>
              </li>
            ))}
          </ul>

          {readingMatches.length > 0 && (
            <section className="sr-reading" aria-labelledby="sr-reading-t">
              <h2 id="sr-reading-t">
                Further reading <span>{readingMatches.length}</span>
              </h2>
              <ul>
                {readingMatches.map((r) => (
                  <li key={r.date + r.url + r.title}>
                    <Link href={`/daily/${slugFor(r.date)}#further-reading`} className="sr-date">
                      {longDate(r.date)}
                    </Link>
                    <div className="sr-title">
                      <a href={r.url} target="_blank" rel="noreferrer">
                        {r.title} <span aria-hidden>↗</span>
                      </a>
                      <p className="sr-pub">
                        {r.pub}
                        {r.paid && <PaidMark />}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
      )}
    </>
  );
}
