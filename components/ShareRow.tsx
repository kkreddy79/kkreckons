"use client";

import { useState } from "react";

/** Share links for an edition: WhatsApp first (KKReckons' main channel), then X, LinkedIn and copy-link. */
export default function ShareRow({ url, slice }: { url: string; slice: string }) {
  const [copied, setCopied] = useState(false);
  const text = slice ? `${slice} — KKReckons` : "Today’s KKReckons briefing";
  const enc = encodeURIComponent;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };
  return (
    <div className="ev-share">
      <span className="ev-share-label">Share:</span>
      <a className="ev-wa" href={`https://wa.me/?text=${enc(`${text}\n${url}`)}`} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <a href={`https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`} target="_blank" rel="noreferrer">
        X
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noreferrer">
        LinkedIn
      </a>
      <button type="button" onClick={copy} aria-live="polite">
        {copied ? "Link copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
