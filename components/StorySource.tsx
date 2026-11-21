import { isPaywalled, publisherName, sourceName } from "@/lib/editionFormat";
import { InfoIcon, LinkIcon, LockIcon, OpenLockIcon } from "@/components/AboutIcons";

/** What the source line and quick summary need from a story. */
export type SourceStory = {
  title: string;
  url: string;
  url2: string;
  points: string[];
  why: string;
  /** "Other side" (or, when it starts "What to watch:", a dated upcoming event). */
  other?: string;
  /** Publisher name and paywall flag set in the newsletter data, when given. */
  src?: string;
  pay?: boolean;
  freeUrl?: string;
  freeSrc?: string;
};

/** One-line preview used for link hover text. */
export function storyHover(s: SourceStory) {
  const text = s.points[0] || s.why || s.title;
  const short = text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text;
  return `${short}${storyPaid(s) ? " (Source may need a subscription.)" : ""}`;
}

/** The story's source links, each marked paid or free. A free version, when given, comes last. */
function sourceLinks(s: SourceStory) {
  const links: { href: string; name: string; paid: boolean; free?: boolean }[] = [];
  if (s.url && sourceName(s.url)) links.push({ href: s.url, name: s.src || publisherName(s.url), paid: s.pay ?? isPaywalled(s.url) });
  if (s.url2) links.push({ href: s.url2, name: publisherName(s.url2), paid: links.length ? isPaywalled(s.url2) : (s.pay ?? isPaywalled(s.url2)) });
  if (s.freeUrl) links.push({ href: s.freeUrl, name: s.freeSrc || publisherName(s.freeUrl), paid: false, free: true });
  return links;
}

/** True when every way to read the story needs a subscription (a free version or free second source clears it). */
export function storyPaid(s: SourceStory) {
  const links = sourceLinks(s);
  return links.some((l) => l.paid) && !links.some((l) => !l.paid);
}

/** Open or closed lock after a publisher name, as in "Today in 30 seconds": free to read, or may need a subscription. */
export function SourceMark({ paid }: { paid: boolean }) {
  return paid ? (
    <span className="ev-mark ev-mark-paid ev-mark-sm" title="May need a subscription">
      <LockIcon />
      <span className="sr-only"> (may need a subscription)</span>
    </span>
  ) : (
    <span className="ev-mark ev-mark-free ev-mark-sm" title="Free to read">
      <OpenLockIcon />
      <span className="sr-only"> (free to read)</span>
    </span>
  );
}

/**
 * "Original source: Publisher ↗" line with an open or closed lock on each source, plus the Quick summary popover where the
 * page shows only the headline (story cards already show the full points).
 */
export default function StorySource({
  s,
  id,
  summary = true,
  explainer,
  short = false,
}: {
  s: SourceStory;
  id: string;
  summary?: boolean;
  /** The story's KKReckons page, linked from the Quick summary where the page lists stories without their graphics. */
  explainer?: string;
  /** "Source:" instead of "Original source:", where it shares a line with the share buttons. */
  short?: boolean;
}) {
  const links = sourceLinks(s);
  if (!links.length) return null;
  const paid = storyPaid(s);
  const hover = storyHover(s);
  const gist = s.points.slice(0, 3);
  return (
    <>
      <p className={`ev-src${paid ? " ev-src-paid" : ""}`}>
        <LinkIcon className="ev-ic-sm" />
        <span className="ev-src-label">{short ? "Source:" : "Original source:"}</span>
        {links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noreferrer" title={l.free ? "A free copy of the story" : hover}>
            {l.name}
            {l.free && " (free version)"}
            <SourceMark paid={l.paid} /> ↗
          </a>
        ))}
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
          {s.other && (
            <p className="ev-qs-other">
              <b>{s.other.startsWith("What to watch") ? "Watch next:" : "Other side:"}</b>{" "}
              {s.other.replace(/^What to watch:\s*(.)/, (_, c: string) => c.toUpperCase())}
            </p>
          )}
          {explainer && (
            <p className="ev-qs-explainer">
              <a href={explainer}>See the KKReckons explainer →</a>
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
