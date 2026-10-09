import type { EditionContent, FullStory } from "@/lib/content";
import { longDate, publisherName } from "@/lib/editions";
import { ScalesIcon, SunIcon } from "@/components/AboutIcons";
import StorySource, { storyHover } from "@/components/StorySource";

const SECTION_NOTE: Record<string, string> = {
  "Pick of the day": "One story worth slowing down for",
  "India edition": "What moved in India",
  "World edition": "What moved everywhere else",
  "Top stories": "The day’s signals",
};

function sectionId(name: string) {
  return name.toLowerCase().replace(/[^a-z]+/g, "-");
}

/** Stories that would sit alone in a two-column row: the last of each odd-length run of image-less stories. */
function loneStories(stories: FullStory[]) {
  const lone = new Set<number>();
  let run: number[] = [];
  const flush = () => {
    if (run.length % 2 === 1) lone.add(run[run.length - 1]);
    run = [];
  };
  stories.forEach((s, i) => {
    if (s.image) flush();
    else run.push(i);
  });
  flush();
  return lone;
}

function StoryCard({ s, n, wide, full, id }: { s: FullStory; n: number; wide: boolean; full?: boolean; id: string }) {
  const hover = storyHover(s);
  return (
    <article className={`ev-story${wide ? " ev-wide" : ""}${s.image ? " ev-has-img" : ""}${full ? " ev-full" : ""}`}>
      <div className="ev-meta">
        <span className="ev-num">{n}</span>
        {s.category && <span className="ev-cat">{s.category}</span>}
        {s.tag && <span className="ev-tag">{s.tag}</span>}
      </div>
      <h3>
        {s.url ? (
          <a href={s.url} target="_blank" rel="noreferrer" title={hover}>
            {s.title}
          </a>
        ) : (
          s.title
        )}
      </h3>

      {s.image && (
        <figure className="ev-fig">
          <img src={s.image} alt={s.imageAlt || ""} loading="lazy" />
        </figure>
      )}

      <div className="ev-body">
        {s.points.length > 0 && (
          <ul className="ev-points">
            {s.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        {s.numbers.length > 0 && (
          <dl className="ev-nums">
            {s.numbers.map(([v, l]) => (
              <div key={v + l}>
                <dt>{v}</dt>
                <dd>{l}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {s.why && (
        <p className="ev-why">
          <SunIcon className="ev-ic" />
          <span>
            <b>Why it matters</b> {s.why}
          </span>
        </p>
      )}
      {s.other && (
        <p className="ev-other">
          <ScalesIcon className="ev-ic" />
          <span>
            <b>{s.other.startsWith("What to watch") ? "Watch next" : "Other side"}</b>{" "}
            {s.other.replace(/^What to watch:\s*/, "")}
          </span>
        </p>
      )}

      {s.also.length > 0 && (
        <p className="ev-also">
          Also read:{" "}
          {s.also.map((a, i) => (
            <span key={a.url}>
              {i > 0 && " · "}
              <a href={a.url} target="_blank" rel="noreferrer">
                {a.title}
              </a>
            </span>
          ))}
        </p>
      )}

      <StorySource s={s} id={id} />
    </article>
  );
}

/** An edition in the KKReckons design: slice, key numbers, sections of stories, further reading. */
export default function EditionView({
  e,
  headingLevel = "h1",
  showDate = true,
  children,
}: {
  e: EditionContent;
  headingLevel?: "h1" | "h2";
  /** Off where the page already shows the date (edition pages have it in the breadcrumb). */
  showDate?: boolean;
  children?: React.ReactNode;
}) {
  const H = headingLevel;
  const count = e.sections.reduce((n, s) => n + s.stories.length, 0);
  let n = 0;

  return (
    <div className="ev">
      <section className="ev-head">
        {showDate && <p className="ev-kicker">{longDate(e.date)}</p>}
        <H className="ev-slice">{e.slice || "Today’s briefing"}</H>
        <p className="ev-sub">
          {count} stories · {e.readingMinutes} min read
        </p>
        {e.sections.length > 1 && (
          <nav className="ev-jump" aria-label="Sections">
            {e.sections.map((s) => (
              <a key={s.name} href={`#${sectionId(s.name)}`}>
                {s.name} <span>{s.stories.length}</span>
              </a>
            ))}
            {e.reading.length > 0 && <a href="#further-reading">Further reading</a>}
          </nav>
        )}
      </section>

      {e.callouts.length > 0 && (
        <section className="ev-callouts" aria-label="Numbers of the day">
          {e.callouts.map((c, i) => {
            const body = (
              <>
                <b>{c.num}</b>
                <span>{c.text}</span>
              </>
            );
            return c.url ? (
              <a key={c.num} className={`ev-call ev-call-${i % 2}`} href={c.url} target="_blank" rel="noreferrer">
                {body}
              </a>
            ) : (
              <div key={c.num} className={`ev-call ev-call-${i % 2}`}>
                {body}
              </div>
            );
          })}
        </section>
      )}

      {e.sections.map((sec) => (
        <section
          key={sec.name}
          className="ev-section"
          id={sectionId(sec.name)}
          aria-labelledby={`${sectionId(sec.name)}-t`}
        >
          <div className="ev-sec-head">
            <h2 id={`${sectionId(sec.name)}-t`}>{sec.name}</h2>
            <p>{SECTION_NOTE[sec.name] || ""}</p>
          </div>
          <div className={`ev-grid${sec.name === "Pick of the day" ? " ev-grid-pick" : ""}`}>
            {(() => {
              const lone = loneStories(sec.stories);
              return sec.stories.map((s, i) => {
                n += 1;
                return (
                  <StoryCard
                    key={s.title}
                    s={s}
                    n={n}
                    id={`qs-${e.date}-${n}`}
                    wide={sec.name === "Pick of the day"}
                    full={lone.has(i)}
                  />
                );
              });
            })()}
          </div>
        </section>
      ))}

      <div className={`ev-end${e.reading.length ? "" : " ev-end-solo"}`}>
        {e.reading.length > 0 && (
          <section className="ev-reading" id="further-reading" aria-labelledby="fr-t">
            <h2 id="fr-t">Further reading</h2>
            <ul>
              {e.reading.map((r) => (
                <li key={r.url + r.title}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.title} <span aria-hidden>↗</span>
                  </a>
                  {(r.note || publisherName(r.url)) && <small>{r.note || publisherName(r.url)}</small>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {children}
      </div>
    </div>
  );
}
