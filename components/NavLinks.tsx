"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  // Edition pages live under /daily/, so they count as Catch up too.
  { href: "/daily/", label: "Catch up", match: (p: string) => p.startsWith("/daily") },
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
          <Link key={l.href} href={l.href} className={on ? "on" : undefined} aria-current={on ? "page" : undefined}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
