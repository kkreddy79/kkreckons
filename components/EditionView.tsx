import Link from "next/link";
import type { EditionContent, FullStory } from "@/lib/content";
import { longDate, publisherName, shortDate, slugFor } from "@/lib/editions";
import { CORRECTIONS_EMAIL, correctionsHref, SITE_URL, SUBSCRIBE_URL } from "@/lib/site";
import type { Related } from "@/lib/related";
import { ScalesIcon, SunIcon } from "@/components/AboutIcons";
import StorySource from "@/components/StorySource";
import ShareRow from "@/components/ShareRow";
import FigClamp from "@/components/FigClamp";
import PrintImages from "@/components/PrintImages";

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

// Darker shades of the AI Stress Index bands, readable as text on white (WCAG AA).
const BAND_TEXT: Record<string, string> = { Normal: "#15803D", Elevated: "#B45309", Severe: "#C2410C", Critical: "#B91C1C" };

/** The AI Stress Index, shown once per edition when KK tags any story as related. The reading is the one saved when the edition was published. */
function StressLink({ si, related }: { si?: EditionContent["stressIndex"]; related: number[] }) {
  return (
    <Link className="ev-si" href="/ai-stress-index">
      <span className="ev-si-score" style={si ? { color: BAND_TEXT[si.band] } : undefined} aria-hidden>
        {si ? si.score : "↗"}
      </span>
      <span>
        <b>AI Stress Index</b>
        {si ? `${si.score}/100, ${si.band}, on ${shortDate(si.asOf)}${si.backCalculated ? " (back-calculated)" : ""}` : "A daily gauge of stress in AI stocks, financing and credit"}
        <small>Tracks {related.length === 1 ? "story" : "stories"} {related.map((n) => String(n).padStart(2, "0")).join(", ")}</small>
      </span>
      <span className="ev-si-go">See →</span>
    </Link>
  );
}

/** Graphics more than 1.6× as tall as they are wide are shown cut to the text's height, with a button to expand. */
const TALL = 1.6;

function StoryCard({ s, n, wide, full, id }: { s: FullStory; n: number; wide: boolean; full?: boolean; id: string }) {
  const tall = Boolean(s.imageW && s.imageH && s.imageH / s.imageW > TALL);
  const pic = s.image && (
    <a href={s.image} target="_blank" rel="noreferrer" className="ev-fig-link" aria-label="Open the full-size image">
      {s.imageW ? (
        <picture>
          <source
            type="image/webp"
            srcSet={["sm 640", "md 860", `lg ${Math.min(s.imageW, 1600)}`]
              .map((v) => v.split(" "))
              .filter(([, w]) => +w <= Math.min(s.imageW!, 1600))
              .map(([tag, w]) => `${s.image.replace(/\.[a-z]+$/, `-${tag}.webp`)} ${w}w`)
              .join(", ")}
            sizes={wide ? "(max-width: 700px) 100vw, 560px" : "(max-width: 700px) 100vw, 480px"}
          />
          <img src={s.image} alt={s.imageAlt || ""} width={s.imageW} height={s.imageH} loading="lazy" decoding="async" />
        </picture>
      ) : (
        <img src={s.image} alt={s.imageAlt || ""} loading="lazy" />
      )}
    </a>
  );
  return (
    <article id={`story-${n}`} className={`ev-story${wide ? " ev-wide" : ""}${s.image ? " ev-has-img" : ""}${full ? " ev-full" : ""}`}>
      <div className="ev-meta">
        <span className="ev-num">{n}</span>
        {s.category && <span className="ev-cat">{s.category}</span>}
        {s.tag && <span className="ev-tag">{s.tag}</span>}
      </div>
      <h3>
        {s.url ? (
          <a href={s.url} target="_blank" rel="noreferrer">
            {s.title}
            <span className="ev-ext" aria-hidden>
              {" "}↗
            </span>
            <span className="sr-only"> (opens the source in a new tab)</span>
          </a>
        ) : (
          s.title
        )}
      </h3>

      {s.image && (
        <figure className="ev-fig">
          {/* Graphics are tall and detailed: link to the full-size file so phone readers can zoom in. */}
          {tall ? <FigClamp>{pic}</FigClamp> : pic}
          <figcaption>
            {s.imageCredit && <span>{s.imageCredit}</span>}
            <a href={s.image} target="_blank" rel="noreferrer">
              View full size ↗
            </a>
          </figcaption>
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

      {/* Beside a graphic, "Other side" runs full width under it (see .ev-has-img in globals.css). */}
      <div className="ev-pair">
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
      </div>

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

      <StorySource s={s} id={id} summary={false} />
    </article>
  );
}

/** An edition in the KKReckons design: slice, key numbers, sections of stories, further reading. */
export default function EditionView({
  e,
  headingLevel = "h1",
  showDate = true,
  showCatchUp = false,
  related = [],
  children,
}: {
  e: EditionContent;
  headingLevel?: "h1" | "h2";
  /** Off where the page already shows the date (edition pages have it in the breadcrumb). */
  showDate?: boolean;
  /** Adds a "Catch up on past editions" link to the meta line (Home, where new visitors land). */
  showCatchUp?: boolean;
  /** Earlier or later stories naming the same companies, people or policies (see lib/related.ts). */
  related?: Related[];
  children?: React.ReactNode;
}) {
  const H = headingLevel;
  const count = e.sections.reduce((n, s) => n + s.stories.length, 0);
  const tracked = e.sections.flatMap((sec) => sec.stories).flatMap((s, i) => (s.stressIndex ? [i + 1] : []));
  let n = 0;

  return (
    <div className="ev">
      <section className="ev-head">
        {showDate && <p className="ev-kicker">{longDate(e.date)}</p>}
        <H className="ev-slice">{e.slice || "Today’s briefing"}</H>
        <p className="ev-sub">
          <span className="ev-nowrap">
            {count} stories · {e.readingMinutes} min read
          </span>
          {showCatchUp && (
            <>
              {" "}
              <span className="ev-sub-sep" aria-hidden>
                ·
              </span>{" "}
              <Link href="/daily/" className="ev-catchup">
                Catch up on past editions →
              </Link>
            </>
          )}
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
        <ShareRow url={`${SITE_URL}/daily/${slugFor(e.date)}`} slice={e.slice} />
      </section>
      <PrintImages />

      {count > 2 && (
        <nav className="ev-30s" aria-labelledby={`t30-${e.date}`}>
          <h2 id={`t30-${e.date}`}>Today in 30 seconds</h2>
          <ol>
            {e.sections
              .flatMap((sec) => sec.stories)
              .map((s, i) => (
                <li key={s.title}>
                  <a href={`#story-${i + 1}`}>
                    <span className="ev-30s-n">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      {s.category && <small>{s.category}</small>}
                      {s.emailHead || s.title}
                      {s.stressIndex && <em className="ev-30s-tag">Index</em>}
                    </span>
                  </a>
                </li>
              ))}
          </ol>
          {tracked.length > 0 && <StressLink si={e.stressIndex} related={tracked} />}
        </nav>
      )}
      {count <= 2 && tracked.length > 0 && <StressLink si={e.stressIndex} related={tracked} />}

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
          {sec.name === "Pick of the day" && (
            <p className="ev-signup">
              <span>One visual briefing a day. Free. Unsubscribe anytime.</span>
              <a href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
                Get it by email ↗
              </a>
            </p>
          )}
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

      {related.length > 0 && (
        <section className="ev-related" aria-labelledby={`rel-${e.date}`}>
          <h2 id={`rel-${e.date}`}>Related coverage</h2>
          <ul>
            {related.map((r) => (
              <li key={r.href}>
                <Link href={r.href}>
                  <small>{shortDate(r.date)}</small>
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {CORRECTIONS_EMAIL && (
        <p className="ev-fix">
          Spotted an error? <a href={correctionsHref(longDate(e.date))}>Tell us</a> and we’ll correct it.
        </p>
      )}
    </div>
  );
}
