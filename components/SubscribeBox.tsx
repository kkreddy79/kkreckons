import Link from "next/link";
import { MailIcon, SunIcon } from "@/components/AboutIcons";
import { SUBSCRIBE_URL } from "@/lib/site";

/**
 * Closing call-to-action band. The default version points readers to today's
 * edition and email sign-up; the "home" version is for readers already on
 * today's edition, so it leads with email and offers past editions instead.
 */
export default function SubscribeBox({ variant = "default" }: { variant?: "default" | "home" }) {
  const home = variant === "home";
  return (
    <section className="ab-join" aria-labelledby="join-title">
      <span className="ab-join-ic" aria-hidden>
        {home ? <MailIcon className="ab-ic" /> : <SunIcon className="ab-ic" />}
      </span>
      <div className="ab-join-text">
        <p className="ab-join-kicker">{home ? "Never miss an edition" : "Today’s edition is ready"}</p>
        <h2 id="join-title">
          {home ? "Get tomorrow’s briefing in your inbox." : "Read deep. Think clearly. Leave in five."}
        </h2>
        <p>
          {home
            ? "Free. One visual briefing a day on India, the world, and what’s next. Unsubscribe anytime."
            : "A daily visual briefing on the stories that matter: India, the world, and what’s next."}
        </p>
      </div>
      <div className="ab-join-cta">
        {home ? (
          <>
            <a className="ab-btn" href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
              Subscribe free ↗
            </a>
            <Link className="ab-btn-ghost" href="/daily/">
              Catch up on past editions
            </Link>
          </>
        ) : (
          <>
            <Link className="ab-btn" href="/">
              Read Today’s Edition →
            </Link>
            <a className="ab-btn-ghost" href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
              Get it by email ↗
            </a>
          </>
        )}
      </div>
    </section>
  );
}
