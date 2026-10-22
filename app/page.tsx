import Banner from "@/components/Banner";
import EditionView from "@/components/EditionView";
import JsonLd, { PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { relatedFor } from "@/lib/related";
import type { Metadata } from "next";
import { latest } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";

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
