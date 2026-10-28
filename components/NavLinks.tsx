"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  // Edition pages live under /daily/, so they count as Catch up too.
  // Catch up and the AI Stress Index are the heaviest pages (the archive's search data, the index's history),
  // so they load on click rather than being prefetched from every page's header.
  { href: "/daily", label: "Catch up", match: (p: string) => p.startsWith("/daily"), prefetch: false },
  { href: "/special", label: "Special Reports", match: (p: string) => p.startsWith("/special") },
  { href: "/ai-stress-index", label: "AI Stress Index", match: (p: string) => p.startsWith("/ai-stress-index"), prefetch: false },
  { href: "/about", label: "About", match: (p: string) => p.startsWith("/about") },
];

/** Site navigation, with the current section highlighted. */
export default function NavLinks() {
  const path = usePathname() || "/";
  return (
    <nav aria-label="Main">
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
