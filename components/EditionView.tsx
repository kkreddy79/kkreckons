import type { EditionContent, FullStory } from "@/lib/content";
import { isPaywalled, longDate, publisherName, sourceName } from "@/lib/editions";
import { InfoIcon, LinkIcon, ScalesIcon, SunIcon } from "@/components/AboutIcons";

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

/** One-line preview used for link hover text. */
function preview(s: FullStory) {
  const text = s.points[0] || s.why || s.title;
  return text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text;
}

function StoryCard({ s, n, wide, full, id }: { s: FullStory; n: number; wide: boolean; full?: boolean; id: string }) {
  const src = sourceName(s.url);
  const paid = [s.url, s.url2].some((u) => u && isPaywalled(u));
  const hover = `${preview(s)}${paid ? " (Source may need a subscription.)" : ""}`;
  const gist = s.points.slice(0, 3);
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

      {(src || s.url2) && (
        <p className="ev-src">
          <LinkIcon className="ev-ic-sm" />
          <span className="ev-src-label">Original source:</span>
          {src && (
            <a href={s.url} target="_blank" rel="noreferrer" title={hover}>
              {publisherName(s.url)} ↗
            </a>
          )}
          {s.url2 && (
            <a href={s.url2} target="_blank" rel="noreferrer" title={hover}>
              {publisherName(s.url2)} ↗
            </a>
          )}
          {paid && <span className="ev-paid">May need subscription</span>}
          <button type="button" className="ev-qs-btn" popoverTarget={id}>
            <InfoIcon className="ev-ic-sm" /> Quick summary
          </button>
        </p>
      )}

      {(src || s.url2) && (
        <div id={id} popover="auto" className="ev-qs" role="dialog" aria-label={`Quick summary: ${s.title}`}>
          <div className="ev-qs-head">
            <p className="ev-qs-kicker">Quick summary{paid ? " · Source may need a subscription" : ""}</p>
            <button
              type="button"
              className="ev-qs-close"
              popoverTarget={id}
              popoverTargetAction="hide"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="ev-qs-title">{s.title}</p>
          {gist.length > 0 && (
            <ul>
              {gist.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          {s.why && (
            <p className="ev-qs-why">
              <b>Why it matters:</b> {s.why}
            </p>
          )}
          <p className="ev-qs-src">
            Summary based on {publisherName(s.url || s.url2)}.{" "}
            <a href={s.url || s.url2} target="_blank" rel="noreferrer">
              Read the full story ↗
            </a>
          </p>
        </div>
      )}
    </article>
  );
}

/** An edition in the KKReckons design: slice, key numbers, sections of stories, further reading. */
export default function EditionView({
  e,
  headingLevel = "h1",
  children,
}: {
  e: EditionContent;
  headingLevel?: "h1" | "h2";
  children?: React.ReactNode;
}) {
  const H = headingLevel;
  const count = e.sections.reduce((n, s) => n + s.stories.length, 0);
  let n = 0;

  return (
    <div className="ev">
      <section className="ev-head">
        <p className="ev-kicker">{longDate(e.date)} · Curated by Krishnakanth Reddy</p>
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
