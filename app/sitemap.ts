import type { MetadataRoute } from "next";
import { editions, latest, slugFor } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/daily`, lastModified: latest.date, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/ai-stress-index`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/standards`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    ...editions.map((e) => ({
      url: `${SITE_URL}/daily/${slugFor(e.date)}`,
      lastModified: e.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
