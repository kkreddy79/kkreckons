export type StressBandRow = [name: string, lowerBound: number, fill: string, text: string, darkFill: string];
export const STRESS_BANDS: StressBandRow[];
export function stressBand(score: number): StressBandRow;
export function bandName(score: number): string;
