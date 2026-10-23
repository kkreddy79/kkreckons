import { isPaywalled, publisherName, sourceName } from "@/lib/editions";
import { InfoIcon, LinkIcon, LockIcon } from "@/components/AboutIcons";

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
export function sourceLinks(s: SourceStory) {
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

/** Small lock after a publisher name: the source may need a subscription. Free sources carry no mark. */
export function PaidMark() {
  return (
    <span className="ev-lock" title="May need a subscription">
      <LockIcon className="ev-lock-ic" />
      <span className="sr-only"> (may need a subscription)</span>
    </span>
  );
}

/**
 * "Original source: Publisher ↗" line with a lock on paywalled sources, plus the Quick summary popover where the
 * page shows only the headline (story cards already show the full points).
 */
export default function StorySource({ s, id, summary = true }: { s: SourceStory; id: string; summary?: boolean }) {
  const links = sourceLinks(s);
  if (!links.length) return null;
  const paid = storyPaid(s);
  const hover = storyHover(s);
  const gist = s.points.slice(0, 3);
  return (
    <>
      <p className={`ev-src${paid ? " ev-src-paid" : ""}`}>
        <LinkIcon className="ev-ic-sm" />
        <span className="ev-src-label">Original source:</span>
        {links.map((l) =>
          l.free ? (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="ev-free" title="Free to read">
              <span className="ev-free-tag">Free version</span> {l.name} ↗
            </a>
          ) : (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" title={hover} data-paid={l.paid ? "" : undefined}>
              {l.name}
              {l.paid && <PaidMark />} ↗
            </a>
          ),
        )}
        {paid && <span className="ev-nofree">Paywalled source, no free version yet. The summary above has the gist.</span>}
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
