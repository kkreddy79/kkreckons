"use client";

import { useEffect, useState } from "react";
import { REACTIONS, type ReactionId } from "@/lib/reactions";

type Counts = Record<string, number>;

// One request per edition, however many story cards share the page.
const loads = new Map<string, Promise<Counts | null>>();
function load(date: string) {
  let p = loads.get(date);
  if (!p) {
    p = fetch(`/api/react?date=${date}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ counts: Counts }>) : null))
      .then((d) => d?.counts ?? null)
      .catch(() => null);
    loads.set(date, p);
  }
  return p;
}

// Which buttons this browser has pressed, so a second tap takes the reaction back. Kept only on the device.
const KEY = "kkr-reactions";
function mine(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function save(s: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...s].slice(-2000)));
  } catch {}
}

/** A row of reaction buttons under a story. Hidden until the counts load (and for good if reactions are off). */
export default function Reactions({ date, n }: { date: string; n: number }) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    let live = true;
    load(date).then((c) => live && setCounts(c ? { ...c } : null));
    setPicked(mine());
    return () => {
      live = false;
    };
  }, [date]);

  if (!counts) return null;

  const tap = async (kind: ReactionId) => {
    const field = `${n}:${kind}`;
    const id = `${date}:${field}`;
    const undo = picked.has(id);
    const next = new Set(picked);
    if (undo) next.delete(id);
    else next.add(id);
    setPicked(next);
    save(next);
    setCounts((c) => ({ ...c, [field]: Math.max(0, (c?.[field] ?? 0) + (undo ? -1 : 1)) }));
    try {
      const r = await fetch("/api/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, n, kind, undo }),
      });
      if (r.ok) {
        const { count } = (await r.json()) as { count: number };
        setCounts((c) => ({ ...c, [field]: count }));
      }
    } catch {}
  };

  return (
    <div className="ev-react" role="group" aria-label="React to this story">
      {REACTIONS.map((r) => {
        const field = `${n}:${r.id}`;
        const on = picked.has(`${date}:${field}`);
        const c = counts[field] ?? 0;
        return (
          <button key={r.id} type="button" className={on ? "on" : undefined} aria-pressed={on} title={c ? `${r.label} · ${c}` : r.label} aria-label={`React: ${r.label}`} onClick={() => tap(r.id)}>
            <span aria-hidden="true">{r.emoji}</span>
            {c > 0 && <b>{c}</b>}
          </button>
        );
      })}
    </div>
  );
}
