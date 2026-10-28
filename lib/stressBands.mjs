// AI Stress Index bands, used by the site (lib/stressBand.ts), the edition build and the emails.
// Plain JavaScript so the scripts can use it as is; types are in stressBands.d.mts.
// [name, lower bound, fill, text on white (and white-on-colour badges), fill bright enough for the dark edition card]
export const STRESS_BANDS = [
  ["Normal", 0, "#16A34A", "#15803D", "#4ADE80"],
  ["Elevated", 25, "#F59E0B", "#B45309", "#FBBF24"],
  ["Severe", 50, "#EA580C", "#C2410C", "#FB923C"],
  ["Critical", 75, "#DC2626", "#B91C1C", "#F87171"],
];

/** The band row for a 0–100 reading. */
export const stressBand = (score) => [...STRESS_BANDS].reverse().find(([, lo]) => score >= lo);

/** "Normal", "Elevated", "Severe" or "Critical". */
export const bandName = (score) => stressBand(score)[0];
