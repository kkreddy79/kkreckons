import data from "@/data/editions.json";

export type Story = {
  section: string;
  title: string;
  category: string;
  tag: string;
  url: string;
};

export type Edition = {
  date: string; // YYYY-MM-DD
  slice: string;
  artifact: string;
  readingMinutes: number;
  image: string;
  stories: Story[];
};

const PUBLISHERS: Record<string, string> = {
  "ft.com": "Financial Times",
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
  "theinformation.com": "The Information",
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
};

/** "https://www.livemint.com/…" → "Mint" (falls back to the domain) */
export function publisherName(url: string) {
  const host = sourceName(url);
  return PUBLISHERS[host] || host;
}

const PAYWALLED = new Set([
  "ft.com",
  "wsj.com",
  "economist.com",
  "bloomberg.com",
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

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Newest first. */
export const editions: Edition[] = (data as Edition[]).slice().sort((a, b) => (a.date < b.date ? 1 : -1));

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d, weekday: WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] };
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/** 2026-09-30 → september-30-2026 */
export function slugFor(date: string) {
  const { y, m, d } = parts(date);
  return `${MONTHS[m - 1]}-${d}-${y}`;
}

/** 2026-09-30 → Wednesday, 30 September 2026 */
export function longDate(date: string) {
  const { y, m, d, weekday } = parts(date);
  return `${weekday}, ${d} ${cap(MONTHS[m - 1])} ${y}`;
}

/** 2026-09-30 → 30 Sep */
export function shortDate(date: string) {
  const { m, d } = parts(date);
  return `${d} ${cap(MONTHS[m - 1]).slice(0, 3)}`;
}

export function weekday(date: string) {
  return parts(date).weekday;
}

/** 2026-09-30 → September 2026 */
export function monthLabel(date: string) {
  const { y, m } = parts(date);
  return `${cap(MONTHS[m - 1])} ${y}`;
}

export function getEdition(slug: string) {
  const i = editions.findIndex((e) => slugFor(e.date) === slug);
  if (i < 0) return null;
  return { edition: editions[i], newer: editions[i - 1] ?? null, older: editions[i + 1] ?? null };
}

export const latest = editions[0];

export function sectionsOf(e: Edition) {
  const out: { name: string; stories: Story[] }[] = [];
  for (const s of e.stories) {
    const last = out[out.length - 1];
    if (last && last.name === s.section) last.stories.push(s);
    else out.push({ name: s.section, stories: [s] });
  }
  return out;
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

export function themesOf(s: Pick<Story, "category" | "title">) {
  const hay = `${s.category} ${s.title}`;
  return THEMES.filter((t) => t.match.test(hay)).map((t) => t.name);
}

export const totalStories = editions.reduce((n, e) => n + e.stories.length, 0);
