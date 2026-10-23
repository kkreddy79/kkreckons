"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "read-stories";
const LAST = "last-visit";

function load(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function save(read: Set<string>) {
  try {
    // Keep the most recent 400 so the list never grows without limit.
    localStorage.setItem(KEY, JSON.stringify([...read].slice(-400)));
  } catch {}
}

/**
 * Remembers, in this browser only, which stories a reader has seen: a story counts as read after its card has
 * been mostly on screen for two seconds, or its own page was opened. Read stories are ticked and dimmed in
 * "Today in 30 seconds". On Home, a returning reader who has missed editions gets a link to catch up.
 * `story` marks a story page; `editions` (Home only) is every edition date, for the "missed" count.
 */
export default function ReadTracker({ date, story, editions }: { date: string; story?: number; editions?: string[] }) {
  const [missed, setMissed] = useState(0);

  useEffect(() => {
    const read = load();
    const mark = (n: number) => {
      const k = `${date}-${n}`;
      if (read.has(k)) return;
      read.add(k);
      save(read);
      document.querySelector(`.ev-30s a[href="#story-${n}"]`)?.closest("li")?.classList.add("is-read");
    };
    if (story) {
      mark(story);
      return;
    }
    document.querySelectorAll<HTMLAnchorElement>(".ev-30s a[href^='#story-']").forEach((a) => {
      if (read.has(`${date}-${a.getAttribute("href")!.slice(7)}`)) a.closest("li")?.classList.add("is-read");
    });

    if (editions) {
      try {
        const last = localStorage.getItem(LAST);
        if (last) setMissed(editions.filter((d) => d > last && d < date).length);
        localStorage.setItem(LAST, date);
      } catch {}
    }

    const timers = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const n = Number(e.target.id.replace("story-", ""));
          // "Mostly on screen": 60% of the card, or half the screen for cards taller than it.
          const seen = e.intersectionRect.height >= Math.min(0.6 * e.boundingClientRect.height, 0.5 * window.innerHeight);
          window.clearTimeout(timers.get(e.target));
          if (seen) timers.set(e.target, window.setTimeout(() => mark(n), 2000));
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1] },
    );
    document.querySelectorAll("article[id^='story-']").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [date, story, editions]);

  if (!missed) return null;
  return (
    <p className="ev-missed">
      Welcome back. You’ve missed {missed} edition{missed > 1 ? "s" : ""} since your last visit.{" "}
      <Link href="/week">Catch up with the week in 8 stories →</Link>
    </p>
  );
}
