export const SITE_URL = "https://www.kkreckons.com";

/** Krishnakanth Reddy's public profiles: linked in the footer and listed as sameAs in structured data. */
export const PROFILES = { linkedin: "https://www.linkedin.com/in/krishnakanthreddy", x: "https://x.com/kkreddy78" };

/**
 * Email sign-up, site-wide. Off since November 2026: the newsletter is no longer sent (sending needs a paid beehiiv
 * plan), so the site offers no way to subscribe: no header button, no sign-up forms, no "get it by email" links,
 * and /api/subscribe answers 410. Set to true to bring them all back.
 */
export const EMAIL_SIGNUP: boolean = false;

/** beehiiv's hosted sign-up page for the KKReckons publication. */
export const SUBSCRIBE_URL = "https://kkreckons.beehiiv.com/subscribe";
