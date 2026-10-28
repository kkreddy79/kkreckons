import { getContent } from "@/lib/content";
import { editions, slugFor } from "@/lib/editions";

/**
 * Companies, institutions and people KKReckons covers often enough to have their own page (/coverage/<slug>).
 * Hand-picked so pages stay meaningful; a name only gets a page once it appears in MIN_STORIES stories.
 * `match` runs (case-sensitive) on each story's headline, points and "why it matters".
 */
const LIST: { name: string; kind: "Company" | "Institution" | "Person"; match: RegExp; about: string }[] = [
  { name: "OpenAI", kind: "Company", match: /\bOpenAI\b|\bChatGPT\b/, about: "The ChatGPT maker, its deals, its spending and the bets riding on it." },
  { name: "Anthropic", kind: "Company", match: /\bAnthropic\b/, about: "The AI lab behind Claude: models, funding and the race with OpenAI." },
  { name: "Nvidia", kind: "Company", match: /\bNvidia\b/, about: "The chipmaker at the centre of the AI build-out." },
  { name: "Microsoft", kind: "Company", match: /\bMicrosoft\b/, about: "Cloud, AI and the OpenAI partnership." },
  { name: "Google", kind: "Company", match: /\bGoogle\b|\bAlphabet\b|\bGemini\b/, about: "Search, Gemini, cloud and Alphabet's AI spending." },
  { name: "Meta", kind: "Company", match: /\bMeta\b/, about: "Facebook's parent, its AI ambitions and the data centres behind them." },
  { name: "Amazon", kind: "Company", match: /\bAmazon\b|\bAWS\b/, about: "Retail, AWS and Amazon's AI and data-centre spending." },
  { name: "Oracle", kind: "Company", match: /\bOracle\b/, about: "Oracle's cloud contracts, its debt and the AI deals behind them." },
  { name: "CoreWeave", kind: "Company", match: /\bCoreWeave\b/, about: "The AI cloud company whose debt has become a gauge of AI credit stress." },
  { name: "SpaceX", kind: "Company", match: /\bSpaceX\b|\bStarlink\b/, about: "Rockets, Starlink and Elon Musk's space business." },
  { name: "JPMorgan", kind: "Company", match: /\bJPMorgan\b|\bJ\.?P\.? Morgan\b/, about: "America's biggest bank and what it signals about credit and markets." },
  { name: "Goldman Sachs", kind: "Company", match: /\bGoldman\b/, about: "Wall Street's bellwether bank and its calls on markets." },
  { name: "Morgan Stanley", kind: "Company", match: /\bMorgan Stanley\b/, about: "The Wall Street bank and wealth manager." },
  { name: "TCS", kind: "Company", match: /\bTCS\b|\bTata Consultancy\b/, about: "India's largest IT services company, and what AI means for it." },
  { name: "Tata group", kind: "Company", match: /\bTata (Sons|Trusts|group|Group)\b|\bNoel Tata\b/, about: "Tata Sons, Tata Trusts and the group's leadership." },
  { name: "HDFC Bank", kind: "Company", match: /\bHDFC\b/, about: "India's largest private bank." },
  { name: "ICICI Bank", kind: "Company", match: /\bICICI\b/, about: "One of India's biggest private banks." },
  { name: "IDBI Bank", kind: "Company", match: /\bIDBI\b/, about: "The lender at the centre of India's biggest bank privatisation." },
  { name: "RBI", kind: "Institution", match: /\bRBI\b|\bReserve Bank of India\b/, about: "India's central bank: rates, rules and the rupee." },
  { name: "Federal Reserve", kind: "Institution", match: /\bFederal Reserve\b|\bthe Fed\b|\bFed (chair|rate|governor)/, about: "The US central bank and its decisions on rates." },
  { name: "IMF", kind: "Institution", match: /\bIMF\b|\bInternational Monetary Fund\b/, about: "The IMF's warnings and forecasts for the world economy." },
  { name: "Donald Trump", kind: "Person", match: /\bTrump\b/, about: "Tariffs, trade and the US president's economic policies." },
  { name: "Sam Altman", kind: "Person", match: /\bAltman\b/, about: "OpenAI's chief executive and his deals." },
];
const MIN_STORIES = 3;

const entitySlug = (name: string) => name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Hit = { date: string; n: number; title: string; why: string; href: string };
let built: { name: string; slug: string; kind: string; about: string; stories: Hit[] }[] | null = null;

/** Every listed name with at least MIN_STORIES stories, most covered first; each with its stories, newest first. */
export function entities() {
  if (built) return built;
  const all = editions.flatMap((e) =>
    getContent(e.date)
      .sections.flatMap((sec) => sec.stories)
      .map((s, i) => ({ date: e.date, n: i + 1, title: s.title, why: s.why, href: `/daily/${slugFor(e.date)}/${i + 1}`, text: [s.title, ...s.points, s.why].join(" ") })),
  );
  built = LIST.map((x) => ({
    name: x.name,
    slug: entitySlug(x.name),
    kind: x.kind,
    about: x.about,
    stories: all.filter((s) => x.match.test(s.text)).map(({ text: _text, ...s }) => s),
  }))
    .filter((x) => x.stories.length >= MIN_STORIES)
    .sort((a, b) => b.stories.length - a.stories.length || a.name.localeCompare(b.name));
  return built;
}

export const entityBySlug = (slug: string) => entities().find((x) => x.slug === slug);

/** The listed names a story mentions (for "More on" links on its page). */
export function entitiesForStory(date: string, n: number) {
  return entities().filter((x) => x.stories.some((s) => s.date === date && s.n === n));
}
