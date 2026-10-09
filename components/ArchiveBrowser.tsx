"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Edition, THEMES, longDate, monthLabel, slugFor, themesOf, weekday } from "@/lib/editions";
import StorySource, { storyHover } from "@/components/StorySource";

export type StoryDetails = Record<string, { url2: string; points: string[]; why: string }>;

export default function ArchiveBrowser({ editions, details }: { editions: Edition[]; details: StoryDetails }) {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const theme = params.get("theme") ?? "";
  const [view, setView] = useState<"editions" | "stories">(params.get("q") || theme ? "stories" : "editions");

  const setTheme = (t: string) => {
    const next = new URLSearchParams(params.toString());
    if (t && t !== theme) next.set("theme", t);
    else next.delete("theme");
    router.replace(`/daily/${next.size ? `?${next}` : ""}`, { scroll: false });
    if (t) setView("stories");
  };

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      editions.flatMap((e) =>
        e.stories
          .filter((s) => !theme || themesOf(s).includes(theme))
          .filter((s) => !q || `${s.title} ${s.category} ${s.section}`.toLowerCase().includes(q))
          .map((s) => ({ edition: e, story: s }))
      ),
    [editions, q, theme]
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
            {q && <> matching “{query.trim()}”</>}
          </p>
          <ul>
            {matches.map(({ edition, story }, i) => {
              const s = {
                title: story.title,
                url: story.url,
                ...(details[`${edition.date}|${story.title}`] ?? { url2: "", points: [], why: "" }),
              };
              return (
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
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
