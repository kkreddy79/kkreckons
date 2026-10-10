import Banner from "@/components/Banner";
import EditionView from "@/components/EditionView";
import JsonLd, { PUBLISHER } from "@/components/JsonLd";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { latest } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";

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
        <EditionView e={today} />
        <SubscribeBox variant="home" />
      </div>
    </main>
  );
}
