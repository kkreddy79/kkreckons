"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Listen": reads the page aloud with the device's own voice (the browser's Web Speech API). Nothing is
 * generated or hosted, so it costs nothing and works for every edition the day it is published; the trade-off
 * is that voice quality depends on the reader's phone or browser, and there is no MP3 to download. The button
 * stays hidden where the browser can't speak.
 *
 * What is read: for an edition (`.ev` inside `rootId`), the headline, the numbers of the day, then each story's
 * number, headline, points, key numbers, "why it matters" and "other side"; for any other page, its headings,
 * paragraphs and list items in order, skipping navigation, buttons, captions and source lists.
 */
type Part = { text: string; el: Element | null };

const CLEAN = /[↗→]|\(opens the source in a new tab\)/g;

function cleanText(el: Element) {
  const copy = el.cloneNode(true) as HTMLElement;
  copy.querySelectorAll(".sr-only, .ev-ext, .ev-mark, script, style, button").forEach((n) => n.remove());
  return (copy.textContent || "").replace(CLEAN, " ").replace(/\s+/g, " ").trim();
}

function editionParts(root: Element): Part[] {
  const parts: Part[] = [];
  const add = (text: string, el: Element | null = null) => text && parts.push({ text, el });
  const slice = root.querySelector(".ev-slice");
  if (slice) add(cleanText(slice), slice);
  const calls = [...root.querySelectorAll(".ev-call")];
  if (calls.length) add("Numbers of the day.");
  for (const c of calls) add(`${cleanText(c.querySelector("b") || c)}: ${cleanText(c.querySelector("span") || c)}`, c);
  for (const sec of root.querySelectorAll(".ev-section")) {
    const h = sec.querySelector("h2");
    if (h) add(cleanText(h), h);
    for (const a of sec.querySelectorAll("article.ev-story")) {
      const n = cleanText(a.querySelector(".ev-num") || a);
      const title = a.querySelector(":scope > h1, :scope > h3");
      if (title) add(`Story ${n}. ${cleanText(title)}.`, a);
      for (const li of a.querySelectorAll(".ev-points li")) add(cleanText(li), a);
      for (const d of a.querySelectorAll(".ev-nums div")) add(`${cleanText(d.querySelector("dt") || d)}, ${cleanText(d.querySelector("dd") || d)}.`, a);
      const why = a.querySelector(".ev-why > span");
      if (why) add(cleanText(why), a);
      const other = a.querySelector(".ev-other > span");
      if (other) add(cleanText(other), a);
    }
  }
  return parts;
}

function genericParts(root: Element): Part[] {
  const parts: Part[] = [];
  const skip = "nav, button, figcaption, footer, .sources, .filters, .count, .scale, .sp-bar, .sp-more, .ab-join, [aria-hidden='true']";
  for (const el of root.querySelectorAll("h1, h2, h3, h4, p, li, dt, dd")) {
    if (el.closest(skip) || (el as HTMLElement).hidden || el.closest("[hidden]")) continue;
    if (el.querySelector("p, li, h1, h2, h3, h4")) continue; // read the leaves, not their containers
    const text = cleanText(el);
    if (text.length > 1) parts.push({ text: /^h\d$/i.test(el.tagName) ? `${text}.` : text, el });
  }
  return parts;
}

/** Sentences of at most ~220 characters: long utterances stall in some browsers. */
function chunks(text: string) {
  const out: string[] = [];
  let cur = "";
  for (const s of text.match(/[^.!?]+[.!?]+["’”)]?\s*|[^.!?]+$/g) || [text]) {
    if ((cur + s).length > 220 && cur) {
      out.push(cur.trim());
      cur = "";
    }
    cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const RATES = [1, 1.25, 1.5];

export default function Listen({ rootId, minutes }: { rootId: string; minutes?: number }) {
  const [ok, setOk] = useState(false);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [rate, setRate] = useState(1);
  // The speed every next sentence uses (the state above only drives the button label), so a change made while
  // paused still applies.
  const rateRef = useRef(1);
  const [where, setWhere] = useState("");
  const queue = useRef<Part[]>([]);
  const at = useRef(0);
  const live = useRef<SpeechSynthesisUtterance[]>([]); // kept so Chrome doesn't garbage-collect them mid-sentence
  const current = useRef<Element | null>(null);

  useEffect(() => {
    setOk(typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined");
    return () => window.speechSynthesis?.cancel();
  }, []);

  const highlight = (el: Element | null) => {
    current.current?.classList.remove("is-reading");
    el?.classList.add("is-reading");
    current.current = el;
  };

  const voice = () => {
    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
    const want = (navigator.language || "en-US").toLowerCase();
    return voices.find((v) => v.lang.toLowerCase() === want && v.default) || voices.find((v) => v.lang.toLowerCase() === want) || voices.find((v) => v.default) || voices[0] || null;
  };

  const speakNext = () => {
    const part = queue.current[at.current];
    if (!part) {
      highlight(null);
      setState("idle");
      setWhere("");
      return;
    }
    highlight(part.el);
    const u = new SpeechSynthesisUtterance(part.text);
    const v = voice();
    if (v) u.voice = v;
    u.lang = v?.lang || "en-US";
    u.rate = rateRef.current;
    u.onend = () => {
      live.current = live.current.filter((x) => x !== u);
      at.current += 1;
      speakNext();
    };
    u.onerror = (e) => {
      if (e.error === "interrupted" || e.error === "canceled") return;
      at.current += 1;
      speakNext();
    };
    live.current.push(u);
    // "Story 3 of 7" while a story is being read (editions only).
    const stories = (ps: Part[]) => new Set(ps.map((p) => p.el).filter((e) => e?.matches("article"))).size;
    const total = stories(queue.current);
    setWhere(total && part.el?.matches("article") ? `Story ${stories(queue.current.slice(0, at.current + 1))} of ${total}` : "");
    window.speechSynthesis.speak(u);
  };

  const start = () => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const parts = (root.querySelector(".ev") ? editionParts(root) : genericParts(root)).flatMap((p) => chunks(p.text).map((t) => ({ text: t, el: p.el })));
    if (!parts.length) return;
    window.speechSynthesis.cancel();
    queue.current = parts;
    at.current = 0;
    setState("playing");
    speakNext();
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setState("paused");
  };
  const resume = () => {
    setState("playing");
    // Speed changed while paused: say the current sentence again at the new speed.
    if (live.current.at(-1)?.rate !== rateRef.current) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      speakNext();
      return;
    }
    window.speechSynthesis.resume();
  };
  const stop = () => {
    window.speechSynthesis.cancel();
    queue.current = [];
    highlight(null);
    setState("idle");
    setWhere("");
  };
  const faster = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    rateRef.current = next;
    if (state === "playing") {
      // Restart the current sentence at the new speed.
      window.speechSynthesis.cancel();
      speakNext();
    }
  };

  if (!ok) return null;
  const spoken = minutes ? Math.max(1, Math.round(minutes * 1.3)) : 0;
  return (
    <div className={`ev-listen${state !== "idle" ? " ev-listen-on" : ""}`} role="group" aria-label="Listen to this page">
      {state === "idle" ? (
        <button type="button" onClick={start} title="Read aloud by your device's own voice">
          <SpeakerIcon />
          Listen{spoken ? <span> · ~{spoken} min</span> : null}
        </button>
      ) : (
        <>
          <button type="button" onClick={state === "playing" ? pause : resume}>
            {state === "playing" ? <PauseIcon /> : <PlayIcon />}
            {state === "playing" ? "Pause" : "Resume"}
          </button>
          <button type="button" onClick={stop}>
            <StopIcon />
            Stop
          </button>
          <button type="button" onClick={faster} title="Change the speed">
            {rate}×<span className="sr-only"> speed</span>
          </button>
          <span className="ev-listen-where" aria-live="polite">
            {where}
          </span>
        </>
      )}
      <small>Automated voice from your device</small>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10v4h3l4 3V7L7 10H4z" />
      <path d="M15 9.5a3.5 3.5 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="currentColor">
      <path d="M7 5l12 7-12 7z" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
