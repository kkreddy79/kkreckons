"use client";

import { useState } from "react";

/** The shared link carries where it was shared, so the analytics' UTM view shows which channel brings readers. */
const tagged = (url: string, source: string) => `${url}${url.includes("?") ? "&" : "?"}utm_source=${source}&utm_medium=share`;

/** Share links for an edition: WhatsApp first (KKReckons' main channel), then X, LinkedIn and copy-link. */
export default function ShareRow({ url, slice }: { url: string; slice: string }) {
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
    <div className="ev-share">
      <span className="ev-share-label">Share:</span>
      <a className="ev-wa" href={`https://wa.me/?text=${enc(`${text}\n${tagged(url, "whatsapp")}`)}`} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <a href={`https://x.com/intent/post?text=${enc(text)}&url=${enc(tagged(url, "x"))}`} target="_blank" rel="noreferrer">
        X
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(tagged(url, "linkedin"))}`} target="_blank" rel="noreferrer">
        LinkedIn
      </a>
      <button type="button" onClick={copy} aria-live="polite">
        {copied ? "Link copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
