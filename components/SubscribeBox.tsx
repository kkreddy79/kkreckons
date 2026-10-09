import { MailIcon } from "@/components/AboutIcons";
import { SUBSCRIBE_URL } from "@/lib/site";

/** Call-out that sends readers to the beehiiv sign-up page. */
export default function SubscribeBox() {
  return (
    <aside className="sub-box" aria-labelledby="sub-title">
      <span className="sub-ic" aria-hidden>
        <MailIcon className="sub-ic-svg" />
      </span>
      <div className="sub-copy">
        <p className="sub-title" id="sub-title">
          Get it by email
        </p>
        <p className="sub-text">Free. One briefing a day. Unsubscribe anytime.</p>
      </div>
      <a className="sub-btn" href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
        Subscribe free ↗
      </a>
    </aside>
  );
}
