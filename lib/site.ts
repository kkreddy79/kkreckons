export const SITE_URL = "https://www.kkreckons.com";

/** beehiiv's hosted sign-up page for the KKReckons publication. */
export const SUBSCRIBE_URL = "https://kkreckons.beehiiv.com/subscribe";

/**
 * Where readers report errors ("Spotted an error?" links and the About page corrections note).
 * Left empty, those links stay hidden.
 */
export const CORRECTIONS_EMAIL = "";

/** mailto: link for reporting an error, with the edition or page in the subject line. */
export function correctionsHref(subject: string) {
  return `mailto:${CORRECTIONS_EMAIL}?subject=${encodeURIComponent(`Correction: ${subject}`)}`;
}
