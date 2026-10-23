import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Everything is open to everyone, except the feedback-vote pages (crawlers following them would count as votes). AI and search crawlers are also named, so a later edit to the
// catch-all rule can't block them by accident.
const NAMED = ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/feedback/" }, ...NAMED.map((userAgent) => ({ userAgent, allow: "/", disallow: "/feedback/" }))],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/news-sitemap.xml`],
  };
}
