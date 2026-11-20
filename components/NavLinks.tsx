"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const LINKS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  // Edition pages live under /daily/, so they count as Catch up too.
  // Catch up and the AI Stress Index are the heaviest pages (the archive's search data, the index's history),
  // so they load on click rather than being prefetched from every page's header.
  { href: "/daily", label: "Catch up", match: (p: string) => p.startsWith("/daily"), prefetch: false },
  { href: "/special", label: "Special Reports", match: (p: string) => p.startsWith("/special") },
  { href: "/ai-stress-index", label: "AI Stress Index", match: (p: string) => p.startsWith("/ai-stress-index") && !p.startsWith("/ai-stress-index/drawdowns"), prefetch: false },
  { href: "/ai-stress-index/drawdowns", label: "AI Drawdowns", match: (p: string) => p.startsWith("/ai-stress-index/drawdowns") },
  { href: "/about", label: "About", match: (p: string) => p.startsWith("/about") },
];

/** Site navigation, with the current section highlighted. */
export default function NavLinks() {
  const path = usePathname() || "/";
  const nav = useRef<HTMLElement>(null);
  // On phones the menu is a sideways-scrolling strip: bring the current section into view (scrolls the strip only).
  useEffect(() => {
    const el = nav.current, on = el?.querySelector<HTMLElement>("a.on");
    if (el && on && el.scrollWidth > el.clientWidth) el.scrollLeft = Math.max(0, on.offsetLeft - el.offsetLeft - 16);
  }, [path]);
  return (
    <nav aria-label="Main" ref={nav}>
      {LINKS.map((l) => {
        const on = l.match(path);
        return (
          <Link key={l.href} href={l.href} prefetch={l.prefetch} className={on ? "on" : undefined} aria-current={on ? "page" : undefined}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
