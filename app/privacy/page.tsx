import type { Metadata } from "next";
import Link from "@/components/Link";
import { CORRECTIONS_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What KKReckons collects, why, and how to have it deleted.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="container narrow">
      <section className="hero">
        <div className="eyebrow">Privacy</div>
        <h1>What we collect, and what we don’t.</h1>
      </section>
      <div className="prose">
        <p>KKReckons is a free daily briefing run by one person, Krishnakanth Reddy. It collects as little as it can.</p>

        <h2>If you subscribe by email</h2>
        <ul>
          <li>
            Your email address is held by <b>beehiiv</b>, the service that sends the newsletter. It is used only to send
            KKReckons. Read{" "}
            <a href="https://www.beehiiv.com/privacy" target="_blank" rel="noreferrer">
              beehiiv’s privacy policy ↗
            </a>
            .
          </li>
          <li>Every email has an unsubscribe link. Unsubscribing stops all emails.</li>
          <li>Your address is never sold or shared with advertisers.</li>
        </ul>

        <h2>If you read the website</h2>
        <ul>
          <li>
            The site uses <b>Vercel Web Analytics</b> to count visits: pages viewed, the referring site, and country and
            device type. It uses no cookies and does not identify you.
          </li>
          <li>
            It also uses <b>Umami</b>, a privacy-focused analytics service, to see how long visits last and which links and
            buttons are tapped (for example, which story sources are opened most). Umami uses no cookies, does not identify
            you and does not track you across other sites.
          </li>
          <li>There are no ads and no advertising trackers.</li>
          <li>
            The AI Stress Index page loads its daily data from GitHub, which sees your request in the same way any website
            host does.
          </li>
          <li>Story headlines and sources link to other sites, which have their own policies.</li>
        </ul>

        <h2>Questions or deletion</h2>
        <p>
          To ask what we hold about you, or to have it deleted, email{" "}
          <a href={`mailto:${CORRECTIONS_EMAIL}?subject=${encodeURIComponent("Privacy request")}`}>{CORRECTIONS_EMAIL}</a>.
          See also <Link href="/about">About KKReckons</Link>.
        </p>
        <p className="fine">Last updated 21 October 2026.</p>
      </div>
    </main>
  );
}
