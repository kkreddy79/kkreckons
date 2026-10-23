/** AI Stress Index bands, shared by the embed card and badge: [name, lower bound, fill, text on white]. */
export const STRESS_BANDS: [string, number, string, string][] = [
  ["Normal", 0, "#16A34A", "#15803D"],
  ["Elevated", 25, "#F59E0B", "#B45309"],
  ["Severe", 50, "#EA580C", "#C2410C"],
  ["Critical", 75, "#DC2626", "#B91C1C"],
];
export const stressBand = (score: number) => [...STRESS_BANDS].reverse().find(([, lo]) => score >= lo)!;
