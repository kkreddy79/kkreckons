"use client";

import { useEffect, useRef, useState } from "react";

/** The shared link carries where it was shared, so the analytics' UTM view shows which channel brings readers. */
const tagged = (url: string, source: string) => `${url}${url.includes("?") ? "&" : "?"}utm_source=${source}&utm_medium=share`;

/**
 * One "Share" button for an edition or one story. On touch screens it opens the phone's own share sheet; on
 * desktops (or where there is no sheet) it opens a small menu: WhatsApp first (KKReckons' main channel), then X,
 * LinkedIn, copy-link, and a download for the story's graphic when there is one.
 */
export default function ShareRow({ url, slice, image, compact }: { url: string; slice: string; image?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const text = slice ? `${slice} — KKReckons` : "Today’s KKReckons briefing";
  const enc = encodeURIComponent;

  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

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
    if (open) return setOpen(false);
    const sheet = typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches;
    if (!sheet) return setOpen(true);
    try {
      await navigator.share({ title: text, url: tagged(url, "native-share") });
    } catch (e) {
      // Closing the sheet is a choice, not a failure; anything else falls back to the menu.
      if ((e as Error).name !== "AbortError") setOpen(true);
    }
  };

  return (
    <div ref={box} className={`ev-share${compact ? " ev-share-sm" : ""}${open ? " ev-share-open" : ""}`}>
      <button type="button" className="ev-share-one" onClick={share} aria-expanded={open} aria-haspopup="menu" aria-label={compact ? "Share this story" : undefined}>
        <ShareIcon />
        Share
      </button>
      {open && (
        <div className="ev-share-menu" role="menu">
          <a role="menuitem" className="ev-wa" href={`https://wa.me/?text=${enc(`${text}\n${tagged(url, "whatsapp")}`)}`} target="_blank" rel="noreferrer">
            <WhatsAppIcon />
            WhatsApp
          </a>
          <a role="menuitem" href={`https://x.com/intent/post?text=${enc(text)}&url=${enc(tagged(url, "x"))}&via=kkreddy78`} target="_blank" rel="noreferrer">
            <XIcon />X
          </a>
          <a role="menuitem" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(tagged(url, "linkedin"))}`} target="_blank" rel="noreferrer">
            <LinkedInIcon />
            LinkedIn
          </a>
          <button role="menuitem" type="button" onClick={copy} aria-live="polite">
            <LinkIcon />
            {copied ? "Link copied ✓" : "Copy link"}
          </button>
          {image && (
            <a role="menuitem" href={image} download>
              <DownloadIcon />
              Download graphic
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const line = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...line}>
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 11.4 11.4 0 0 0 4.4 3.9c1.6.7 2.3.7 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
      <path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3V9.5zm6.5 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4V9.5z" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...line}>
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...line}>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}
