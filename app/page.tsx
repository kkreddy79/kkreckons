import Banner from "@/components/Banner";
import EditionView from "@/components/EditionView";
import JsonLd, { PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { relatedFor } from "@/lib/related";
import type { Metadata } from "next";
import { latest, slugFor } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";

// Home shows the same edition as its dated page, so the dated page is the one search engines index.
export const metadata: Metadata = { alternates: { canonical: `/daily/${slugFor(latest.date)}` } };

export default function Home() {
  const today = getContent(latest.date);

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
      <Banner />
      <div className="ev-wrap">
        <EditionView e={today} showCatchUp related={relatedFor(latest.date)} />
        <SubscribeBox variant="home" />
      </div>
    </main>
  );
}
