import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Everything is open to everyone. AI and search crawlers are also named, so a later edit to the
// catch-all rule can't block them by accident.
const NAMED = ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }, ...NAMED.map((userAgent) => ({ userAgent, allow: "/" }))],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
