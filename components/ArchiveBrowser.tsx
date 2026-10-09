"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Edition, THEMES, longDate, monthLabel, publisherName, slugFor, themesOf, weekday } from "@/lib/editions";
import StorySource, { storyHover, storyPaid } from "@/components/StorySource";

export type StoryDetails = Record<string, { url2: string; points: string[]; why: string }>;

export default function ArchiveBrowser({ editions, details }: { editions: Edition[]; details: StoryDetails }) {
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

  /** Publishers by number of stories, most first. */
  const publishers = useMemo(() => {
    const n = new Map<string, number>();
    for (const a of all) for (const p of new Set(a.pubs)) n.set(p, (n.get(p) ?? 0) + 1);
    return [...n].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [all]);
  const freeCount = all.filter((a) => !a.paid).length;

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      all
        .filter((a) => !theme || themesOf(a.story).includes(theme))
        .filter((a) => !source || (source === "free" ? !a.paid : a.pubs.includes(source)))
        .filter(
          (a) =>
            !q ||
            `${a.story.title} ${a.story.category} ${a.story.section} ${a.pubs.join(" ")}`.toLowerCase().includes(q)
        ),
    [all, q, theme, source]
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
          <option value="">All sources ({all.length})</option>
          <option value="free">Free to read only ({freeCount})</option>
          <optgroup label="Publisher">
            {publishers.map(([name, count]) => (
              <option key={name} value={name}>
                {name} ({count})
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
            {matches.length} {matches.length === 1 ? "story" : "stories"}
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
        </section>
      )}
    </>
  );
}
