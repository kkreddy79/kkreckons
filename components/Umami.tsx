"use client";

import Script from "next/script";
import { useEffect } from "react";

type Umami = { track: (name: string, data?: Record<string, string>) => void };
declare global {
  interface Window {
    umami?: Umami;
  }
}

/** Umami's free cloud analytics: visits, time on site, and one named event per link or button tapped.
 *  Off unless NEXT_PUBLIC_UMAMI_WEBSITE_ID is set, and counts only the live domain (not previews or localhost). */
export const UMAMI_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

/** Sends one custom event, if the tracker has loaded. Names are cut to Umami's 50-character limit. */
export function track(name: string, data?: Record<string, string>) {
  window.umami?.track(name.slice(0, 50), data);
}

// The visible label, without the "↗ (opens in a new tab)" that external links carry.
const label = (el: HTMLElement) =>
  (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").replace(/\s*↗.*$/, "").trim().slice(0, 80);

/** One listener for the whole site, so the weekly report can rank what readers tap:
 *  "Out: ft.com" for a source or other site, "Go: /daily/…" for a page here, "Tap: …" for a button. */
function onClick(e: MouseEvent) {
  const el = (e.target as Element | null)?.closest<HTMLElement>("a[href], button");
  if (!el) return;
  const from = location.pathname;
  if (el instanceof HTMLAnchorElement) {
    const url = new URL(el.href, location.href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return;
    if (url.host === location.host) track(`Go: ${url.pathname}`, { from, label: label(el) });
    else track(`Out: ${url.hostname.replace(/^www\./, "")}`, { from, url: `${url.hostname}${url.pathname}`.slice(0, 500), label: label(el) });
  } else {
    // Form submit buttons are counted by the form itself (e.g. "Subscribe" on success), not here.
    if ((el as HTMLButtonElement).type === "submit") return;
    track(`Tap: ${label(el) || "button"}`, { from });
  }
}

export default function Umami() {
  useEffect(() => {
    if (!UMAMI_ID) return;
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  if (!UMAMI_ID) return null;
  return <Script src="https://cloud.umami.is/script.js" data-website-id={UMAMI_ID} data-domains="www.kkreckons.com,kkreckons.com" strategy="afterInteractive" />;
}
