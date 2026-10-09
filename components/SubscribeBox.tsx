import { SUBSCRIBE_URL } from "@/lib/site";

/** Call-out that sends readers to the beehiiv sign-up page. */
export default function SubscribeBox() {
  return (
    <aside className="sub-box" aria-labelledby="sub-title">
      <div>
        <p className="sub-title" id="sub-title">
          Get each new edition by email
        </p>
        <p className="sub-text">Free. One briefing a day. Unsubscribe anytime.</p>
      </div>
      <div className="sub-actions">
        <a className="sub-btn" href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
          Subscribe free ↗
        </a>
        <a className="sub-rss" href="/feed.xml">
          RSS feed
        </a>
      </div>
    </aside>
  );
}
