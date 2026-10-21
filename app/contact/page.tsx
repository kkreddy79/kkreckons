import type { Metadata } from "next";
import Link from "next/link";
import { CORRECTIONS_EMAIL, SUBSCRIBE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach KKReckons: corrections, tips and feedback.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="container narrow">
      <section className="hero">
        <div className="eyebrow">Contact</div>
        <h1>Get in touch.</h1>
      </section>
      <div className="prose">
        <p>
          KKReckons is run by one person, Krishnakanth Reddy. Email{" "}
          <a href={`mailto:${CORRECTIONS_EMAIL}`}>{CORRECTIONS_EMAIL}</a> for any of these:
        </p>
        <ul>
          <li>
            <b>Corrections.</b> Name the edition and the story; material corrections are noted in that edition. See the{" "}
            <Link href="/standards">editorial standards</Link>.
          </li>
          <li>
            <b>Tips and feedback</b> on stories, the AI Stress Index or the site.
          </li>
          <li>
            <b>Your subscription.</b> Every email has an unsubscribe link; to subscribe,{" "}
            <a href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
              get it by email ↗
            </a>
            .
          </li>
        </ul>
      </div>
    </main>
  );
}
