import type { Metadata } from "next";
import Link from "@/components/Link";
import JsonLd from "@/components/JsonLd";
import Drawdowns from "@/components/Drawdowns";
import s from "@/components/Drawdowns.module.css";
import { loadDrawdowns } from "@/lib/drawdowns";
import { SITE_URL } from "@/lib/site";

const TITLE = "AI stocks: how far they have fallen from their peak";
const DESCRIPTION =
  "50 AI-linked stocks across chips, cloud, data centers, software, networking, power and frontier AI, each measured from its highest-ever close. Updated every weekday. By KK Reddy.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/ai-stress-index/drawdowns" },
  openGraph: {
    title: `${TITLE} · KKReckons`,
    description: DESCRIPTION,
    url: "/ai-stress-index/drawdowns",
    images: [{ url: "/og/ai-stress-index.jpg", width: 1200, height: 630, alt: "AI Market Stress Index by KK Reddy" }],
  },
  twitter: { card: "summary_large_image", creator: "@kkreddy78", title: `${TITLE} · KKReckons`, description: DESCRIPTION, images: ["/og/ai-stress-index.jpg"] },
};

/* drawdowns.json is rebuilt every weekday by drawdowns.py in github.com/kkreddy79/ai-implosion, beside the
   index's data. Rendered on the server and re-rendered at most hourly, or straight away by /api/revalidate. */
export const revalidate = 3600;

export default async function DrawdownsPage() {
  const d = await loadDrawdowns();
  return (
    <main className={s.wrap}>
      {d && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: "AI stocks: distance from peak",
            description: DESCRIPTION,
            url: `${SITE_URL}/ai-stress-index/drawdowns`,
            creator: { "@type": "Person", name: "Krishnakanth Reddy", url: `${SITE_URL}/about` },
            dateModified: d.generatedAt,
            variableMeasured: ["Drawdown from all-time high close", "Daily price change"],
          }}
        />
      )}
      <div className={`container ${s.page}`}>
        <Link href="/ai-stress-index" className={s.back}>← AI Market Stress Index</Link>
        <h1>How far the AI trade has fallen from its peak</h1>
        <p className={s.dek}>
          {d ? d.stocks.length : 50} AI stocks across chips, cloud, data centers, software, networking, power and frontier AI, each measured
          from its highest-ever close{d ? <> to the close on <b>{d.asOf.slice(8, 10).replace(/^0/, "")} {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+d.asOf.slice(5, 7) - 1]} {d.asOf.slice(0, 4)}</b></> : null}.
        </p>
        <Drawdowns initial={d} />
      </div>
    </main>
  );
}
