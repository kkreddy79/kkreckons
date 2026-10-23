import Banner from "@/components/Banner";
import EditionView from "@/components/EditionView";
import JsonLd, { PUBLISHER } from "@/components/JsonLd";
import EmailSignup from "@/components/EmailSignup";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { relatedFor } from "@/lib/related";
import { liveStress, loadStressFile } from "@/lib/stress";
import type { Metadata } from "next";
import { latest } from "@/lib/editions";
import { INLINE_SIGNUP, SITE_URL } from "@/lib/site";

// Home is its own page in search (brand searches land here); each edition is indexed at its dated page.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  // Shared links to Home preview today's cover when the edition has one (else the site-wide image).
  ...(latest.cover
    ? {
        openGraph: { siteName: "KKReckons", type: "website", images: [{ url: latest.cover, width: 1600, height: 900, alt: latest.coverAlt || latest.slice }] },
        twitter: { card: "summary_large_image", creator: "@kkreddy78", images: [latest.cover] },
      }
    : {}),
};

// Re-rendered at most hourly so the AI Stress Index card shows the latest reading (as on /ai-stress-index).
export const revalidate = 3600;

export default async function Home() {
  const today = getContent(latest.date);
  const stress = liveStress(await loadStressFile("data.json"));

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "KKReckons",
          alternateName: "KKReckons — Read deep. Think clearly. Stay curious.",
          url: `${SITE_URL}/`,
          publisher: PUBLISHER,
        }}
      />
      <Banner compact />
      <div className="ev-wrap">
        <EditionView
          e={today}
          showCatchUp
          related={relatedFor(latest.date)}
          liveStress={stress}
          digestAfterPick
          signup={
            INLINE_SIGNUP && (
              <div className="ev-inbox">
                <p>
                  <b>Get this briefing in your inbox every morning.</b> Free, one email a day.
                </p>
                <EmailSignup placement="home-top" />
              </div>
            )
          }
        />
        <SubscribeBox variant="home" />
      </div>
    </main>
  );
}
