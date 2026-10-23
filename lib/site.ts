export const SITE_URL = "https://www.kkreckons.com";

/** Krishnakanth Reddy's public profiles: linked in the footer and listed as sameAs in structured data. */
export const PROFILES = { linkedin: "https://www.linkedin.com/in/krishnakanthreddy", x: "https://x.com/kkreddy78" };

/** beehiiv's hosted sign-up page for the KKReckons publication. */
export const SUBSCRIBE_URL = "https://kkreckons.beehiiv.com/subscribe";

/** The KKReckons publication on beehiiv (an ID, not a secret), used by /api/subscribe. */
export const BEEHIIV_PUBLICATION_ID = "pub_8ac4375a-ab66-4eff-8d3e-d8029c985186";

/**
 * On-page email sign-up needs a beehiiv API key in the BEEHIIV_API_KEY environment variable (Vercel).
 * Pages are built statically, so this is read at build time: without a key, sign-up stays a link to
 * beehiiv's page, exactly as before.
 */
export const INLINE_SIGNUP = Boolean(process.env.BEEHIIV_API_KEY);

/**
 * Where readers report errors ("Spotted an error?" links and the About page corrections note).
 * Left empty, those links stay hidden.
 */
export const CORRECTIONS_EMAIL = "kkreckons@gmail.com";

/** mailto: link for reporting an error, with the edition or page in the subject line. */
export function correctionsHref(subject: string) {
  return `mailto:${CORRECTIONS_EMAIL}?subject=${encodeURIComponent(`Correction: ${subject}`)}`;
}

/**
 * Reader referral reward (beehiiv referral program). Left empty, the /refer page and its links stay hidden;
 * set `reward` (e.g. "the Best of KKReckons PDF: 10 top explainers") and `referrals` once the program is on.
 */
export const REFERRAL = { reward: "", referrals: 3 };

/** The KKReckons WhatsApp Channel link (https://whatsapp.com/channel/…). Left empty, the "Follow on WhatsApp" buttons stay hidden. */
export const WHATSAPP_CHANNEL = "";
