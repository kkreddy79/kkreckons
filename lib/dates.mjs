// Edition dates as the site writes them: URL slugs and display dates, all in UTC from "YYYY-MM-DD".
// Plain JavaScript so the scripts can use it as is (like weekly-picks.mjs); types are in dates.d.mts.

export const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const cap = (s) => s[0].toUpperCase() + s.slice(1);

function parts(date) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d, weekday: WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] };
}

/** 2026-09-30 → september-30-2026 */
export function slugFor(date) {
  const { y, m, d } = parts(date);
  return `${MONTHS[m - 1]}-${d}-${y}`;
}

/** 2026-09-30 → Wednesday, 30 September 2026 */
export function longDate(date) {
  const { y, m, d, weekday } = parts(date);
  return `${weekday}, ${d} ${cap(MONTHS[m - 1])} ${y}`;
}

/** 2026-09-30 → 30 Sep */
export function shortDate(date) {
  const { m, d } = parts(date);
  return `${d} ${cap(MONTHS[m - 1]).slice(0, 3)}`;
}

/** 2026-09-30 → Wednesday */
export function weekday(date) {
  return parts(date).weekday;
}

/** 2026-09-30 → September 2026 */
export function monthLabel(date) {
  const { y, m } = parts(date);
  return `${cap(MONTHS[m - 1])} ${y}`;
}

/** 2026-09-30 (or 2026-09) → september-2026, the /month/ page's slug */
export function monthSlug(date) {
  return `${MONTHS[+date.slice(5, 7) - 1]}-${date.slice(0, 4)}`;
}
