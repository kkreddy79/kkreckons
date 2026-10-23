/**
 * Plain-English definitions for jargon in story text. The first mention in each story gets a dotted underline;
 * tapping it shows the definition (components/Glossary.tsx). Matching is case-sensitive unless the pattern says otherwise.
 * Keep each definition to one sentence a newcomer understands without the article.
 */
export const GLOSSARY: { term: string; match: RegExp; def: string }[] = [
  { term: "Credit default swap", match: /\bCDS\b|\bcredit default swaps?\b/i, def: "Insurance against a borrower not repaying; the higher its price, the more worried lenders are." },
  { term: "Basis point", match: /\bbasis points?\b|\b\d+(?:\.\d+)?\s?bps?\b/, def: "One hundredth of a percentage point: 100 basis points = 1%." },
  { term: "Capex", match: /\bcapex\b/i, def: "Capital expenditure: money a company spends on long-lived things like buildings, chips and data centres." },
  { term: "IPO", match: /\bIPOs?\b/, def: "Initial public offering: when a company first sells its shares on a stock exchange." },
  { term: "ETF", match: /\bETFs?\b/, def: "Exchange-traded fund: a basket of shares or bonds you can buy and sell like a single stock." },
  { term: "Hyperscaler", match: /\bhyperscalers?\b/i, def: "The giant cloud companies (Amazon, Microsoft, Google, Meta, Oracle) that build the biggest data centres." },
  { term: "Neocloud", match: /\bneoclouds?\b/i, def: "A newer cloud company, such as CoreWeave or Nscale, that rents out AI chips, often funded with debt." },
  { term: "Private credit", match: /\bprivate credit\b/i, def: "Loans made by investment funds instead of banks, usually less regulated and less visible." },
  { term: "Bond yield", match: /\b(?:bond|Treasury|10-year|gilt) yields?\b/i, def: "The annual return a bond pays at today's price; rising yields mean borrowing is getting dearer." },
  { term: "High-yield bond", match: /\bhigh-yield\b|\bjunk bonds?\b/i, def: "A bond from a riskier borrower that pays more interest to make up for the higher chance of default." },
  { term: "Credit spread", match: /\b(?:credit )?spreads? (?:widen|narrow|over)|\bcredit spreads?\b/i, def: "The extra interest a risky borrower pays over a safe government bond; wider spreads signal more worry." },
  { term: "GPU", match: /\bGPUs?\b/, def: "Graphics processing unit: the chip, mostly from Nvidia, that trains and runs AI models." },
  { term: "AI agent", match: /\bAI agents?\b|\bagentic\b/i, def: "AI software that takes actions on its own, like booking, buying or moving money, not just answering questions." },
  { term: "Stablecoin", match: /\bstablecoins?\b/i, def: "A cryptocurrency designed to hold a fixed value, usually one US dollar, backed by reserves." },
  { term: "UPI", match: /\bUPI\b/, def: "Unified Payments Interface: India's instant mobile payment system, run by NPCI." },
  { term: "GST", match: /\bGST\b/, def: "Goods and services tax: India's nationwide tax on most sales." },
  { term: "NPA", match: /\bNPAs?\b/, def: "Non-performing asset: a bank loan whose repayments are more than 90 days overdue." },
  { term: "Repo rate", match: /\brepo rate\b/i, def: "The rate at which the RBI lends to banks; it sets the floor for loan and deposit rates in India." },
  { term: "FPI", match: /\bFPIs?\b|\bFIIs?\b/, def: "Foreign portfolio investors: overseas funds buying Indian shares and bonds; their flows move the market and the rupee." },
  { term: "NBFC", match: /\bNBFCs?\b/, def: "Non-bank finance company: a lender that isn't a bank, such as Bajaj Finance, regulated more lightly by the RBI." },
  { term: "Circular deal", match: /\bcircular (?:deals?|financing|funding)\b/i, def: "When companies invest in each other's customers or suppliers, so the same money goes round and inflates sales." },
];
