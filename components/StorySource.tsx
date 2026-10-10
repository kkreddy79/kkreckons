import { isPaywalled, publisherName, sourceName } from "@/lib/editions";
import { InfoIcon, LinkIcon } from "@/components/AboutIcons";

/** What the source line and quick summary need from a story. */
export type SourceStory = {
  title: string;
  url: string;
  url2: string;
  points: string[];
  why: string;
  /** Publisher name and paywall flag set in the newsletter data, when given. */
  src?: string;
  pay?: boolean;
};

/** One-line preview used for link hover text. */
export function storyHover(s: SourceStory) {
  const text = s.points[0] || s.why || s.title;
  const short = text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text;
  return `${short}${storyPaid(s) ? " (Source may need a subscription.)" : ""}`;
}

export function storyPaid(s: SourceStory) {
  return s.pay ?? [s.url, s.url2].some((u) => u && isPaywalled(u));
}

/**
 * "Original source: Publisher ↗" line and paywall badge, plus the Quick summary popover where the
 * page shows only the headline (story cards already show the full points).
 */
export default function StorySource({ s, id, summary = true }: { s: SourceStory; id: string; summary?: boolean }) {
  const src = sourceName(s.url);
  if (!src && !s.url2) return null;
  const paid = storyPaid(s);
  const hover = storyHover(s);
  const gist = s.points.slice(0, 3);
  return (
    <>
      <p className="ev-src">
        <LinkIcon className="ev-ic-sm" />
        <span className="ev-src-label">Original source:</span>
        {src && (
          <a href={s.url} target="_blank" rel="noreferrer" title={hover}>
            {s.src || publisherName(s.url)} ↗
          </a>
        )}
        {s.url2 && (
          <a href={s.url2} target="_blank" rel="noreferrer" title={hover}>
            {publisherName(s.url2)} ↗
          </a>
        )}
        {paid && <span className="ev-paid">May need subscription</span>}
        {summary && (
          <button type="button" className="ev-qs-btn" popoverTarget={id}>
            <InfoIcon className="ev-ic-sm" /> Quick summary
          </button>
        )}
      </p>

      {summary && (
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
            Summary based on {s.url ? s.src || publisherName(s.url) : publisherName(s.url2)}.{" "}
            <a href={s.url || s.url2} target="_blank" rel="noreferrer">
              Read the full story ↗
            </a>
          </p>
        </div>
      )}
    </>
  );
}
