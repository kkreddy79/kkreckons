export function teaserFrom(why: string | undefined): string;
export function weekOf(dates: string[], end: string): { start: string; days: string[] };
export function pickWeek<T extends { section: string; category?: string; date: string; n: number }>(days: string[], stories: T[]): (T & { topic: string })[];
