"use client";

import { useState } from "react";

/** The shared link carries where it was shared, so the analytics' UTM view shows which channel brings readers. */
const tagged = (url: string, source: string) => `${url}${url.includes("?") ? "&" : "?"}utm_source=${source}&utm_medium=share`;

/**
 * Share links for an edition or one story: WhatsApp first (KKReckons' main channel), then X, LinkedIn and
 * copy-link, plus a download for the story's graphic when there is one. On phones the row folds into one
 * "Share" button (CSS, so the page doesn't shift as it loads): it opens the phone's share sheet, or, where
 * the browser has none, unfolds the row.
 */
export default function ShareRow({ url, slice, image, compact }: { url: string; slice: string; image?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
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
  const share = async () => {
    if (!navigator.share) return setOpen(true);
    try {
      await navigator.share({ title: text, url: tagged(url, "native-share") });
    } catch (e) {
      // Closing the sheet is a choice, not a failure; anything else falls back to the buttons.
      if ((e as Error).name !== "AbortError") setOpen(true);
    }
  };
  return (
    <div className={`ev-share${compact ? " ev-share-sm" : ""}${open ? " ev-share-open" : ""}`}>
      <button type="button" className="ev-share-one" onClick={share} aria-expanded={open} aria-label={compact ? "Share this story" : undefined}>
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Share
      </button>
      <span className="ev-share-label">Share:</span>
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
