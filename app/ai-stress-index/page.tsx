import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import StressIndex, { type Backtest, type Data } from "@/components/StressIndex";
import { STRESS_BASES } from "@/lib/stress";
import { SITE_URL } from "@/lib/site";

const TITLE = "AI Market Stress Index: a daily AI bubble gauge";
const DESCRIPTION =
  "A daily 0–100 gauge of stress in the AI boom: AI stocks, the financing behind the AI build-out and the wider credit market. By Krishnakanth Reddy.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/ai-stress-index" },
  openGraph: {
    title: `${TITLE} · KKReckons`,
    description: DESCRIPTION,
    url: "/ai-stress-index",
    images: [{ url: "/og/ai-stress-index.jpg", width: 1200, height: 630, alt: "AI Market Stress Index: a daily 0–100 stress gauge by KK Reddy" }],
  },
  twitter: { card: "summary_large_image", creator: "@kkreddy78", title: `${TITLE} · KKReckons`, description: DESCRIPTION, images: ["/og/ai-stress-index.jpg"] },
};

/* The data is rebuilt every weekday by github.com/kkreddy79/ai-implosion. The page is rendered on the
   server with it and re-rendered at most hourly (Vercel's built-in caching, no redeploy needed), so
   search engines, AI tools and link previews get the full page as HTML. If the data can't be fetched,
   the page falls back to loading it in the browser. */
export const revalidate = 3600;

async function load<T>(file: string): Promise<T | null> {
  for (const base of STRESS_BASES) {
    try {
      const r = await fetch(`${base}/${file}`, { next: { revalidate: 3600 } });
      if (r.ok) return (await r.json()) as T;
    } catch {}
  }
  return null;
}

export default async function AiStressIndexPage() {
  const [d, bt] = await Promise.all([load<Data>("data.json"), load<Backtest>("backtest.json")]);
  const hist = d?.history.filter((h) => h.score != null) ?? [];
  return (
    <>
      {d && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: "AI Market Stress Index",
            description: DESCRIPTION,
            url: `${SITE_URL}/ai-stress-index`,
            creator: { "@type": "Person", name: "Krishnakanth Reddy", url: `${SITE_URL}/about` },
            dateModified: d.generatedAt,
            ...(hist.length ? { temporalCoverage: `${hist[0].date}/${hist[hist.length - 1].date}` } : {}),
            variableMeasured: ["AI Market Stress Index (0–100)", ...d.factors.map((f) => f.name)],
            distribution: { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE_URL}/ai-stress-index/data.json` },
          }}
        />
      )}
      <StressIndex initial={d} initialBt={bt} />
    </>
  );
}
