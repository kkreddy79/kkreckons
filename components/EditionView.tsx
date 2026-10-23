import Link from "next/link";
import type { EditionContent, FullStory } from "@/lib/content";
import { editions, isPaywalled, longDate, themeSlug, themesOf, publisherName, shortDate, slugFor, totalStories } from "@/lib/editions";
import { CORRECTIONS_EMAIL, correctionsHref, INLINE_SIGNUP, SITE_URL, SUBSCRIBE_URL } from "@/lib/site";
import type { Related } from "@/lib/related";
import type { LiveStress } from "@/lib/stress";
import { ScalesIcon, SunIcon } from "@/components/AboutIcons";
import StorySource, { PaidMark, sourceLinks } from "@/components/StorySource";
import FreeToggle from "@/components/FreeToggle";
import ShareRow from "@/components/ShareRow";
import EmailSignup from "@/components/EmailSignup";
import FigClamp from "@/components/FigClamp";
import PrintImages from "@/components/PrintImages";
import SectionBar from "@/components/SectionBar";

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

// AI Stress Index bands: [name, lower bound, fill colour bright enough to read on the dark card].
const BANDS: [string, number, string][] = [
  ["Normal", 0, "#4ADE80"],
  ["Elevated", 25, "#FBBF24"],
  ["Severe", 50, "#FB923C"],
  ["Critical", 75, "#F87171"],
];
const bandOf = (score: number) => [...BANDS].reverse().find(([, lo]) => score >= lo)!;

/** A reading for the card: the one saved with the edition, or on Home the latest one (with its change and trend). */
type Reading = NonNullable<EditionContent["stressIndex"]> | (LiveStress & { backCalculated?: undefined });

/** The last 30 daily scores as a small line, scaled to their own range so small moves show. */
function Trend({ points }: { points: number[] }) {
  const lo = Math.min(...points);
  const hi = Math.max(...points, lo + 10);
  const xy = points.map((v, i) => `${((i / (points.length - 1)) * 100).toFixed(1)},${(28 - ((v - lo) / (hi - lo)) * 24).toFixed(1)}`);
  return (
    <svg className="ev-sx-spark" viewBox="0 0 100 32" preserveAspectRatio="none" role="img" aria-label={`Last ${points.length} trading days: low ${Math.min(...points)}, high ${Math.max(...points)}`}>
      <polyline points={xy.join(" ")} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** "Up 6 from 21 Oct" */
function changeText(score: number, prev: number | null | undefined, prevDate: string | null | undefined) {
  if (prev == null || !prevDate) return "";
  const d = score - prev;
  return d === 0 ? `Unchanged from ${shortDate(prevDate)}` : `${d > 0 ? "Up" : "Down"} ${Math.abs(d)} from ${shortDate(prevDate)}`;
}

/**
 * The AI Stress Index as one slim strip near the top of an edition (every edition from 22 Oct 2026, earlier
 * ones only when KK tagged a story): score, band, the day's change and a 30-day line on Home, and the
 * stories it relates to. Edition pages show the reading saved when the edition was published; Home the latest.
 */
function StressCard({ si, related, prevScore }: { si?: Reading; related: number[]; prevScore?: number | null }) {
  const live = si && "trend" in si ? si : null;
  const band = si && !live?.limited ? bandOf(si.score) : null;
  // A move into a new band since the previous reading is the news: call it out.
  const before = live ? live.prevScore : prevScore;
  const was = band && before != null ? bandOf(before) : null;
  const moved = band && was && was[0] !== band[0] ? `${band[1] > was[1] ? "Up" : "Down"} from ${was[0]}` : "";
  const notes = [
    live ? changeText(live.score, live.prevScore, live.prevDate) : "",
    si ? `${shortDate(si.asOf)} close${si.backCalculated ? " (back-calculated)" : ""}` : "Updated every trading day",
  ].filter(Boolean);
  return (
    <section className="ev-sx" aria-label="AI Stress Index">
      <div className="ev-sx-main">
        <p className="ev-sx-kicker" title="A daily 0–100 gauge of strain in AI stocks, financing and credit">
          AI Stress Index
        </p>
        <p className="ev-sx-read">
          {si && (
            <>
              <b style={{ color: band ? band[2] : "#fff" }}>{si.score}</b>
              <span>/100</span>
            </>
          )}
          {band ? <em style={{ background: band[2] }}>{band[0]}</em> : live?.limited ? <em className="ev-sx-limited">Limited data</em> : null}
          {moved && <strong className="ev-sx-new">New · {moved[0].toLowerCase() + moved.slice(1)}</strong>}
        </p>
        <p className="ev-sx-note">
          {notes.join(" · ")}
          {related.length > 0 && (
            <>
              {" · "}
              {related.length === 1 ? "Story" : "Stories"}{" "}
              {related.map((n) => (
                <a key={n} href={`#story-${n}`}>
                  {String(n).padStart(2, "0")}
                </a>
              ))}
            </>
          )}
        </p>
      </div>
      {live && live.trend.length > 1 && <Trend points={live.trend} />}
      <Link className="ev-sx-cta" href="/ai-stress-index">
        Gauges →
      </Link>
    </section>
  );
}

/** Graphics more than 1.6× as tall as they are wide are shown cut to the text's height, with a button to expand. */
const TALL = 1.6;

/** The story's own page (/daily/<edition>/<n>), which link previews show with the story's headline and graphic. */
export const storyPageUrl = (date: string, n: number) => `${SITE_URL}/daily/${slugFor(date)}/${n}`;

/** `priority` is for a story page, where the graphic is the main thing on screen: load it at once, not lazily. */
export function StoryCard({ s, n, wide, full, id, date, as: H = "h3", priority = false }: { s: FullStory; n: number; wide: boolean; full?: boolean; id: string; date: string; as?: "h1" | "h3"; priority?: boolean }) {
  const tall = Boolean(s.imageW && s.imageH && s.imageH / s.imageW > TALL);
  const topic = themesOf(s)[0];
  const links = sourceLinks(s);
  const freeHref = links[0]?.paid ? links.find((l) => !l.paid)?.href : undefined;
  const pic = s.image && (
    <a href={s.image} target="_blank" rel="noreferrer" className="ev-fig-link" aria-label="Open the full-size image" data-lightbox={s.imageAlt || s.title}>
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
          <img src={s.image} alt={s.imageAlt || ""} width={s.imageW} height={s.imageH} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />
        </picture>
      ) : (
        <img src={s.image} alt={s.imageAlt || ""} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} />
      )}
    </a>
  );
  return (
    <article id={`story-${n}`} className={`ev-story${wide ? " ev-wide" : ""}${s.image ? " ev-has-img" : ""}${full ? " ev-full" : ""}`}>
      <div className="ev-meta">
        <span className="ev-num">{n}</span>
        {s.category && (topic ? (
          <Link href={`/topics/${themeSlug(topic)}`} className="ev-cat" title={`More on ${topic}`}>
            {s.category}
          </Link>
        ) : (
          <span className="ev-cat">{s.category}</span>
        ))}
        {s.tag && <span className="ev-tag">{s.tag}</span>}
      </div>
      <H>
        {s.url ? (
          <a href={s.url} target="_blank" rel="noreferrer" data-free-href={freeHref}>
            {s.title}
            <span className="ev-ext" aria-hidden>
              {" "}↗
            </span>
            <span className="sr-only"> (opens the source in a new tab)</span>
          </a>
        ) : (
          s.title
        )}
      </H>

      {s.image && (
        <figure className="ev-fig">
          {/* Graphics are tall and detailed: link to the full-size file so phone readers can zoom in. */}
          {tall ? <FigClamp>{pic}</FigClamp> : pic}
          <figcaption>
            {s.imageCredit && <span>{s.imageCredit}</span>}
            <a href={s.image} target="_blank" rel="noreferrer" data-lightbox={s.imageAlt || s.title}>
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
            {s.other.replace(/^What to watch:\s*(.)/, (_, c: string) => c.toUpperCase())}
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

      {s.cite && (
        <p className="ev-cite">
          <b>Quote this</b> {s.cite} <span>(KKReckons, {shortDate(date)} {date.slice(0, 4)})</span>
        </p>
      )}

      <StorySource s={s} id={id} summary={false} />
      <ShareRow url={storyPageUrl(date, n)} slice={s.emailHead || s.title} image={s.image || undefined} compact />
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
  signup,
  liveStress,
  prevStressScore,
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
  /** Shown under the share row (Home's email sign-up). */
  signup?: React.ReactNode;
  /** Home: today's AI Stress Index reading, shown instead of the one saved with the edition. */
  liveStress?: LiveStress | null;
  /** Edition pages: the previous edition's saved index score, to flag a move into a new band. */
  prevStressScore?: number | null;
  children?: React.ReactNode;
}) {
  const H = headingLevel;
  const count = e.sections.reduce((n, s) => n + s.stories.length, 0);
  const paywalled = e.sections.flatMap((sec) => sec.stories).filter((s) => sourceLinks(s).some((l) => l.paid)).length;
  // "Today in 30 seconds", right under the headline.
  const digest = count > 2 && (
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
    </nav>
  );
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
          {paywalled > 0 && (
            <>
              {" "}
              <span className="ev-sub-sep" aria-hidden>
                ·
              </span>{" "}
              <FreeToggle paid={paywalled} />
            </>
          )}
        </p>
        {e.sections.length > 1 && (
          <nav className="ev-jump" id={`jump-${e.date}`} aria-label="Sections">
            {e.sections.map((s) => (
              <a key={s.name} href={`#${sectionId(s.name)}`}>
                {s.name} <span>{s.stories.length}</span>
              </a>
            ))}
            {e.reading.length > 0 && <a href="#further-reading">Further reading</a>}
          </nav>
        )}
        <ShareRow url={`${SITE_URL}/daily/${slugFor(e.date)}`} slice={e.slice} />
        {signup}
      </section>
      {e.sections.length > 1 && (
        <SectionBar
          watch={`jump-${e.date}`}
          items={[
            ...e.sections.map((s) => ({ id: sectionId(s.name), label: s.name, count: s.stories.length })),
            ...(e.reading.length > 0 ? [{ id: "further-reading", label: "Further reading" }] : []),
          ]}
        />
      )}
      <PrintImages />

      {digest}

      {(tracked.length > 0 || e.stressIndex || liveStress) && <StressCard si={liveStress ?? e.stressIndex} related={tracked} prevScore={prevStressScore} />}

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
          data-sec={sectionId(sec.name)}
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
                    date={e.date}
                    wide={sec.name === "Pick of the day"}
                    full={lone.has(i)}
                  />
                );
              });
            })()}
          </div>
          {sec.name === "Pick of the day" && (
            <div className={`ev-signup${INLINE_SIGNUP ? " ev-signup-form" : ""}`}>
              <span>
                One visual briefing a day. Free, unsubscribe anytime.
                <small>
                  {editions.length} editions and {totalStories} stories so far
                </small>
              </span>
              {INLINE_SIGNUP ? (
                <EmailSignup placement="after-pick" />
              ) : (
                <a href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
                  Get it by email ↗
                </a>
              )}
            </div>
          )}
        </section>
      ))}

      <div className={`ev-end${e.reading.length ? "" : " ev-end-solo"}`}>
        {e.reading.length > 0 && (
          <section className="ev-reading" id="further-reading" aria-labelledby="fr-t">
            <h2 id="fr-t">Further reading</h2>
            <ul>
              {e.reading.map((r) => (
                <li key={r.url + r.title} data-paid={isPaywalled(r.url) ? "" : undefined}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.title} <span aria-hidden>↗</span>
                  </a>
                  {(r.note || publisherName(r.url)) && (
                    <small>
                      {r.note || publisherName(r.url)}
                      {isPaywalled(r.url) && <PaidMark />}
                    </small>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {children}
      </div>

      <p className="ev-poll">
        Was this briefing useful?
        {(["yes", "somewhat", "no"] as const).map((v) => (
          <Link key={v} href={`/feedback/${slugFor(e.date)}/${v}`} rel="nofollow" prefetch={false}>
            {v === "yes" ? "Yes" : v === "somewhat" ? "Somewhat" : "Not really"}
          </Link>
        ))}
      </p>

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
