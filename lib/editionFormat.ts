// Edition helpers that don't need the edition data itself (names, dates, themes, publishers), so browser
// components can use them without bundling data/editions.json. lib/editions.ts re-exports all of this.

export type Story = {
  section: string;
  title: string;
  category: string;
  tag: string;
  url: string;
  /** Optional overrides from the newsletter data (see docs/edition-format.md). */
  src?: string;
  pay?: boolean;
  themes?: string[];
};

export type Edition = {
  date: string; // YYYY-MM-DD
  slice: string;
  artifact: string;
  readingMinutes: number;
  image: string;
  /** 1600×900 cover for link previews, Google Discover and structured data (newer editions). */
  cover?: string;
  coverAlt?: string;
  stories: Story[];
};

const PUBLISHERS: Record<string, string> = {
  "sec.gov": "SEC",
  "securityweek.com": "SecurityWeek",
  "pingcap.com": "PingCAP",
  "nber.org": "NBER",
  "ft.com": "Financial Times",
  "youtu.be": "YouTube",
  "youtube.com": "YouTube",
  "hbr.org": "Harvard Business Review",
  "giftarticle.ft.com": "Financial Times",
  "livemint.com": "Mint",
  "economictimes.indiatimes.com": "The Economic Times",
  "economictimes.com": "The Economic Times",
  "wsj.com": "The Wall Street Journal",
  "indiatoday.in": "India Today",
  "inc42.com": "Inc42",
  "moneycontrol.com": "Moneycontrol",
  "cnbc.com": "CNBC",
  "economist.com": "The Economist",
  "bbc.com": "BBC",
  "businessinsider.com": "Business Insider",
  "africa.businessinsider.com": "Business Insider Africa",
  "blog.google": "Google",
  "bloomberg.com": "Bloomberg",
  "ey.com": "EY",
  "visualcapitalist.com": "Visual Capitalist",
  "yourstory.com": "YourStory",
  "x.com": "X",
  "outlookbusiness.com": "Outlook Business",
  "startupfortune.com": "Startup Fortune",
  "axios.com": "Axios",
  "imf.org": "International Monetary Fund",
  "brookings.edu": "Brookings",
  "abcnews.com": "ABC News",
  "jpmorgan.com": "J.P. Morgan",
  "404media.co": "404 Media",
  "api.sci.gov.in": "Supreme Court of India",
  "asteriskmag.com": "Asterisk",
  "washingtonpost.com": "The Washington Post",
  "npr.org": "NPR",
  "capitalgroup.com": "Capital Group",
  "medium.com": "Medium",
  "kotakneo.com": "Kotak Neo",
  "cbsnews.com": "CBS News",
  "msn.com": "MSN",
  "city-journal.org": "City Journal",
  "ndtv.com": "NDTV",
  "theverge.com": "The Verge",
  "wired.com": "Wired",
  "theguardian.com": "The Guardian",
  "nytimes.com": "The New York Times",
  "theatlantic.com": "The Atlantic",
  "fortune.com": "Fortune",
  "gartner.com": "Gartner",
  "kkreckons.com": "KKReckons",
  "barrons.com": "Barron's",
  "theinformation.com": "The Information",
  "khaleejtimes.com": "Khaleej Times",
  "everycure.org": "Every Cure",
  "archive.is": "archive.is",
  "finalroundai.com": "Final Round AI",
  "humanistreview.ai": "Humanist Review",
  "vals.ai": "Vals AI",
  "outlookindia.com": "Outlook",
  "tradingeconomics.com": "Trading Economics",
  "view.asiae.co.kr": "The Asia Business Daily",
  "theglobeandmail.com": "The Globe and Mail",
  "nbclosangeles.com": "NBC Los Angeles",
  "thenextweb.com": "TNW",
  "aljazeera.com": "Al Jazeera",
  "benzinga.com": "Benzinga",
  "businessday.co.za": "BusinessDay",
  "tradingview.com": "TradingView",
  "timesofindia.indiatimes.com": "The Times of India",
  "telegraph.co.uk": "The Telegraph",
  "bis.org": "BIS",
  "maket.ai": "Maket",
  "angelsforchange.org": "Angels for Change",
  "news18.com": "News18",
  "ig.ft.com": "Financial Times",
  "business-standard.com": "Business Standard",
  "wolfstreet.com": "Wolf Street",
  "reuters.com": "Reuters",
  "thehindu.com": "The Hindu",
  "investmentnews.com": "InvestmentNews",
  "nature.com": "Nature",
  "apnews.com": "AP News",
  "linkedin.com": "LinkedIn",
  "ares.com": "Ares",
  "india.com": "India.com",
  "investing.com": "Investing.com",
  "investor.atmeta.com": "Meta",
  "independent.co.uk": "The Independent",
};

/** "https://www.livemint.com/…" → "Mint" (falls back to the domain) */
export function publisherName(url: string) {
  const host = sourceName(url);
  return PUBLISHERS[host] || host;
}

const PAYWALLED = new Set([
  "ft.com",
  "barrons.com",
  "wsj.com",
  "economist.com",
  "bloomberg.com",
  "washingtonpost.com",
  "theinformation.com",
  "nytimes.com",
  "theatlantic.com",
  "businessinsider.com",
  "fortune.com",
  "wired.com",
  "theglobeandmail.com",
  "telegraph.co.uk",
]);

/** True when the link usually sits behind a paywall (FT gift links and archive copies are free). */
export function isPaywalled(url: string) {
  if (/economictimes\.indiatimes\.com\/prime\/|economictimes\.com\/prime\//.test(url)) return true;
  return PAYWALLED.has(sourceName(url));
}

/** "www.livemint.com/…" → "livemint.com" */
export function sourceName(url: string) {
  try {
    return new URL(url).hostname.replace(/^(www|m)\./, "");
  } catch {
    return "";
  }
}

import { slugFor, longDate, shortDate, weekday, monthLabel } from "@/lib/dates.mjs";

// The date helpers live in lib/dates.mjs so the scripts use the same slugs and formats.
export { slugFor, longDate, shortDate, weekday, monthLabel };

/** Cut text to at most `max` characters at a word break, with an ellipsis. */
export function clip(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(" ", max - 1)).replace(/[;,:·]$/, "").trim() + "…";
}

/** Broad themes for browsing, matched against story categories and titles. */
export const THEMES: { name: string; match: RegExp }[] = [
  { name: "AI", match: /\bAI\b|artificial intelligence|OpenAI|Anthropic|chatbot|\bagents?\b/i },
  { name: "Markets", match: /market|bond|yield|treasury|invest|stock|\bIPOs?\b|gold|commodit|credit/i },
  { name: "Banking", match: /bank|\bRBI\b|HDFC|lender|deposit|\bUBS\b/i },
  { name: "India", match: /India|Tata|Sebi|\bIITs?\b|\bGCCs?\b|\bUPI\b|₹|Hyderabad|Gadkari|Railways|\bRBI\b|Punjab/i },
  { name: "Jobs & careers", match: /jobs?\b|layoff|payroll|talent|workforce|careers?|hiring|Ph\.?D/i },
  { name: "Geopolitics", match: /geopolit|China|Iran|trade|tariff|defence|diplomac|G20|\bFTA\b|\bEU\b/i },
  { name: "Personal finance", match: /personal finance|savings?|insurance|\bEMI\b|debt|\bNPS\b|\btax/i },
  { name: "Health & science", match: /health|plague|drug|science|medical|fossil|magnet|orbit|space/i },
];

/** A theme's topic page address, e.g. "Jobs & careers" → "jobs-careers" (/topics/jobs-careers). */
export const themeSlug = (name: string) => name.toLowerCase().replace(/&/g, "").replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

export function themesOf(s: Pick<Story, "category" | "title" | "themes">) {
  if (s.themes?.length) {
    const want = new Set(s.themes.map((t) => t.toLowerCase()));
    const named = THEMES.filter((t) => want.has(t.name.toLowerCase())).map((t) => t.name);
    if (named.length) return named;
  }
  const hay = `${s.category} ${s.title}`;
  return THEMES.filter((t) => t.match.test(hay)).map((t) => t.name);
}

/** A story on its edition page: stories are numbered in edition order, matching the #story-N anchors there. */
export const storyHref = (e: Edition, story: Story) => `/daily/${slugFor(e.date)}#story-${e.stories.indexOf(story) + 1}`;

/** A story's own page (/daily/<edition>/<n>): its explainer graphic, numbers, why it matters and other side. */
export const storyPageHref = (e: Edition, story: Story) => `/daily/${slugFor(e.date)}/${e.stories.indexOf(story) + 1}`;
