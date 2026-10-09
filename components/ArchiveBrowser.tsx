"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Edition,
  THEMES,
  isPaywalled,
  longDate,
  monthLabel,
  publisherName,
  slugFor,
  themesOf,
  weekday,
} from "@/lib/editions";
import StorySource, { storyHover, storyPaid } from "@/components/StorySource";

export type StoryDetails = Record<string, { url2: string; points: string[]; why: string }>;

export type ReadingLink = { date: string; title: string; url: string; note: string };

/** "12 stories" / "1 further reading link" */
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Dropdown count: stories, plus further reading links when there are any. */
const countLabel = (stories: number, links: number) => (links ? `${stories} · ${links} reading` : `${stories}`);

export default function ArchiveBrowser({
  editions,
  details,
  reading,
}: {
  editions: Edition[];
  details: StoryDetails;
  reading: ReadingLink[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const theme = params.get("theme") ?? "";
  const source = params.get("source") ?? "";
  const [view, setView] = useState<"editions" | "stories">(
    params.get("q") || theme || source ? "stories" : "editions"
  );

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/daily/${next.size ? `?${next}` : ""}`, { scroll: false });
    if (value) setView("stories");
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
            ...(details[`${e.date}|${story.title}`] ?? { url2: "", points: [], why: "" }),
          };
          const pubs = [s.url, s.url2].filter(Boolean).map(publisherName);
          return { edition: e, story, s, pubs, paid: storyPaid(s) };
        })
      ),
    [editions, details]
  );

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
    if (source && source !== "free" && !n.has(source)) n.set(source, [0, 0]);
    return [...n].sort((a, b) => b[1][0] - a[1][0] || b[1][1] - a[1][1] || a[0].localeCompare(b[0]));
  }, [base, readingBase, source]);
  const freeCount = base.filter((a) => !a.paid).length;
  const freeReading = readingBase.filter((r) => !r.paid).length;

  const matches = useMemo(
    () => base.filter((a) => !source || (source === "free" ? !a.paid : a.pubs.includes(source))),
    [base, source]
  );
  const readingMatches = useMemo(
    () => readingBase.filter((r) => !source || (source === "free" ? !r.paid : r.pub === source)),
    [readingBase, source]
  );

  const months = useMemo(() => {
    const out: { label: string; items: Edition[] }[] = [];
    for (const e of editions) {
      const label = monthLabel(e.date);
      const last = out[out.length - 1];
      if (last?.label === label) last.items.push(e);
      else out.push({ label, items: [e] });
    }
    return out;
  }, [editions]);

  return (
    <>
      <div className="toolbar">
        <input
          type="search"
          value={query}
          placeholder="Search headlines, topics, companies…"
          aria-label="Search stories"
          onChange={(ev) => {
            setQuery(ev.target.value);
            if (ev.target.value) setView("stories");
          }}
        />
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={view === "editions"} onClick={() => setView("editions")}>
            By edition
          </button>
          <button role="tab" aria-selected={view === "stories"} onClick={() => setView("stories")}>
            All stories
          </button>
        </div>
      </div>
      <div className="chips">
        {THEMES.map((t) => (
          <button key={t.name} className={`chip${theme === t.name ? " on" : ""}`} onClick={() => setTheme(t.name)}>
            {t.name}
          </button>
        ))}
        {theme && (
          <button className="chip clear" onClick={() => setTheme("")}>
            Clear ×
          </button>
        )}
      </div>
      <div className="src-filter">
        <label htmlFor="src-select">Source</label>
        <select id="src-select" value={source} onChange={(ev) => setParam("source", ev.target.value)}>
          <option value="">All sources ({countLabel(base.length, readingBase.length)})</option>
          <option value="free">Free to read only ({countLabel(freeCount, freeReading)})</option>
          <optgroup label="Publisher">
            {publishers.map(([name, [stories, links]]) => (
              <option key={name} value={name}>
                {name} ({countLabel(stories, links)})
              </option>
            ))}
          </optgroup>
        </select>
        {source && (
          <button className="chip clear" onClick={() => setParam("source", "")}>
            Clear ×
          </button>
        )}
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
                    <p className="tl-heads">{e.stories.slice(0, 4).map((s) => s.title).join(" · ")}</p>
                    <span className="tl-meta">
                      {e.stories.length} stories · {e.readingMinutes} min read
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      ) : (
        <section className="story-results">
          <p className="count">
            {plural(matches.length, "story", "stories")}
            {readingMatches.length > 0 && <> and {plural(readingMatches.length, "further reading link", "further reading links")}</>}
            {theme && <> in <b>{theme}</b></>}
            {source && <> from <b>{source === "free" ? "free-to-read sources" : source}</b></>}
            {q && <> matching “{query.trim()}”</>}
          </p>
          <ul>
            {matches.map(({ edition, story, s }, i) => (
              <li key={edition.date + story.title}>
                <Link href={`/daily/${slugFor(edition.date)}`} className="sr-date">
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
                    <Link href={`/daily/${slugFor(edition.date)}`}>{story.title}</Link>
                  )}
                </div>
                <div className="sr-src">
                  <StorySource s={s} id={`sr-qs-${edition.date}-${i}`} />
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
                        {r.paid && <span className="ev-paid">May need subscription</span>}
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
