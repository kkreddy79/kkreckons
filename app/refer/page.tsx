import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Banner from "@/components/Banner";
import SubscribeBox from "@/components/SubscribeBox";
import Testimonials from "@/components/Testimonials";
import { REFERRAL, SUBSCRIBE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Share KKReckons",
  description: `Share the KKReckons daily briefing with ${REFERRAL.referrals} friends and get ${REFERRAL.reward || "a thank-you"}.`,
  alternates: { canonical: "/refer" },
};

/** The reader referral program. Only built once REFERRAL.reward is set in lib/site.ts. */
export default function Refer() {
  if (!REFERRAL.reward) notFound();
  return (
    <main className="cu">
      <Banner />
      <div className="cu-wrap">
        <section className="cu-hero" aria-labelledby="rf-title">
          <p className="ab-kicker">Share KKReckons</p>
          <h1 id="rf-title">Know someone who’d like this? Share it.</h1>
          <p className="cu-lede">
            When {REFERRAL.referrals} people you share it with subscribe, you get {REFERRAL.reward}. It costs them nothing, and they can unsubscribe anytime.
          </p>
        </section>
        <ol className="rf-steps">
          <li>
            <b>Find your personal link.</b> It’s at the bottom of every KKReckons email, under “Share KKReckons”.
          </li>
          <li>
            <b>Send it</b> on WhatsApp, LinkedIn, Teams or email, to people who’d enjoy a five-minute daily briefing.
          </li>
          <li>
            <b>Get your reward.</b> Each sign-up through your link counts. At {REFERRAL.referrals}, beehiiv emails you {REFERRAL.reward}.
          </li>
        </ol>
        <p className="tp-more">
          Not subscribed yet?{" "}
          <a href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
            Subscribe free first ↗
          </a>{" "}
          · <Link href="/">Read today’s edition</Link>
        </p>
        <Testimonials max={3} />
        <SubscribeBox />
      </div>
    </main>
  );
}
