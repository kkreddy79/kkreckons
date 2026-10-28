import type { Metadata } from "next";
import Link from "@/components/Link";
import EditorialStandards from "@/components/EditorialStandards";

export const metadata: Metadata = {
  title: "Editorial standards & corrections",
  description: "How KKReckons labels, sources, credits and corrects its stories and graphics.",
  alternates: { canonical: "/standards" },
};

export default function StandardsPage() {
  return (
    <main className="about ab-standards">
      <div className="ab-wrap">
        <section className="ab-hero ab-hero-plain" aria-labelledby="standards-title">
          <p className="ab-kicker">Standards</p>
          <h1 id="standards-title">How KKReckons is made.</h1>
          <p className="ab-lede">
            The rules every edition follows. Questions or corrections: <Link href="/contact">get in touch</Link>.
          </p>
        </section>
        <EditorialStandards />
      </div>
    </main>
  );
}
