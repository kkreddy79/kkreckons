"use client";

import { useState } from "react";

/** The shared link carries where it was shared, so the analytics' UTM view shows which channel brings readers. */
const tagged = (url: string, source: string) => `${url}${url.includes("?") ? "&" : "?"}utm_source=${source}&utm_medium=share`;

/**
 * Share links for an edition or one story: WhatsApp first (KKReckons' main channel), then X, LinkedIn and
 * copy-link, plus a download for the story's graphic when there is one.
 */
export default function ShareRow({ url, slice, image, compact }: { url: string; slice: string; image?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const text = slice ? `${slice} — KKReckons` : "Today’s KKReckons briefing";
  const enc = encodeURIComponent;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tagged(url, "copy-link"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", tagged(url, "copy-link"));
    }
  };
  return (
    <div className={`ev-share${compact ? " ev-share-sm" : ""}`}>
      <span className="ev-share-label">{compact ? "Share this story:" : "Share:"}</span>
      <a className="ev-wa" href={`https://wa.me/?text=${enc(`${text}\n${tagged(url, "whatsapp")}`)}`} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <a href={`https://x.com/intent/post?text=${enc(text)}&url=${enc(tagged(url, "x"))}&via=kkreddy78`} target="_blank" rel="noreferrer">
        X
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(tagged(url, "linkedin"))}`} target="_blank" rel="noreferrer">
        LinkedIn
      </a>
      <button type="button" onClick={copy} aria-live="polite">
        {copied ? "Link copied ✓" : "Copy link"}
      </button>
      {image && (
        <a href={image} download>
          Download graphic
        </a>
      )}
    </div>
  );
}
