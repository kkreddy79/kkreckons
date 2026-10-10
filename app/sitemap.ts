import type { MetadataRoute } from "next";
import { editions, latest, slugFor } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: latest.date, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/daily/`, lastModified: latest.date, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...editions.map((e) => ({
      url: `${SITE_URL}/daily/${slugFor(e.date)}`,
      lastModified: e.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
