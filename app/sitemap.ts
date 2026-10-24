import type { MetadataRoute } from "next";
import { editions, latest, slugFor } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";
import { TOPICS, topicHref, topicPageCount } from "@/lib/topics";
import { months, monthSlug } from "@/lib/month";
import { entities } from "@/lib/entities";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/daily`, lastModified: latest.date, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/week`, lastModified: latest.date, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/quiz`, lastModified: latest.date, changeFrequency: "daily", priority: 0.5 },
    { url: `${SITE_URL}/topics`, lastModified: latest.date, changeFrequency: "daily", priority: 0.7 },
    ...TOPICS.map((t) => ({ url: `${SITE_URL}/topics/${t.slug}`, lastModified: latest.date, changeFrequency: "daily" as const, priority: 0.7 })),
    // Older topic pages change only when a new story pushes one down a page.
    ...TOPICS.flatMap((t) =>
      Array.from({ length: topicPageCount(t.name) - 1 }, (_, i) => ({ url: `${SITE_URL}${topicHref(t.slug, i + 2)}`, changeFrequency: "weekly" as const, priority: 0.4 }))
    ),
    ...months.map((m) => ({ url: `${SITE_URL}/month/${monthSlug(m)}`, lastModified: editions.find((e) => e.date.startsWith(m))!.date, changeFrequency: "weekly" as const, priority: 0.6 })),
    { url: `${SITE_URL}/coverage`, lastModified: latest.date, changeFrequency: "daily", priority: 0.6 },
    ...entities().map((x) => ({ url: `${SITE_URL}/coverage/${x.slug}`, lastModified: [...x.stories].sort((a, b) => b.date.localeCompare(a.date))[0].date, changeFrequency: "weekly" as const, priority: 0.6 })),
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
    ...editions.flatMap((e) =>
      e.stories.map((_, i) => ({ url: `${SITE_URL}/daily/${slugFor(e.date)}/${i + 1}`, lastModified: e.date, changeFrequency: "monthly" as const, priority: 0.5 }))
    ),
  ];
}
