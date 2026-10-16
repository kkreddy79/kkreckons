import type { Metadata } from "next";
import StressIndex from "@/components/StressIndex";

const TITLE = "AI Market Stress Index";
const DESCRIPTION =
  "A daily 0–100 gauge of stress in the AI investment cycle: AI equities, the financing behind the AI build-out, and the wider credit market. Curated by Krishnakanth Reddy.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/ai-stress-index" },
  openGraph: {
    title: `${TITLE} · KKReckons`,
    description: DESCRIPTION,
    url: "/ai-stress-index",
    images: [{ url: "/og/ai-stress-index.png", width: 1200, height: 630, alt: "AI Market Stress Index: a daily 0–100 stress gauge by KK Reddy" }],
  },
  twitter: { card: "summary_large_image", title: `${TITLE} · KKReckons`, description: DESCRIPTION, images: ["/og/ai-stress-index.png"] },
};

/* The data is rebuilt every weekday by github.com/kkreddy79/ai-implosion and loaded in the browser,
   so this page stays current without redeploying the site. */
export default function AiStressIndexPage() {
  return <StressIndex />;
}
