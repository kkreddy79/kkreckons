"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Slim bar of section links that stays under the site header once the edition's own section links
 * scroll out of view, and marks the section being read.
 */
export default function SectionBar({ items, watch }: { items: { id: string; label: string; count?: number }[]; watch: string }) {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [top, setTop] = useState(68);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = document.querySelector(".site-header");
    const measure = () => setTop(header ? Math.round(header.getBoundingClientRect().height) : 0);
    measure();
    window.addEventListener("resize", measure);

    // Show the bar once the edition's own section links have scrolled up under the header.
    const anchor = document.getElementById(watch);
    const showObs = anchor && new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    if (anchor) showObs?.observe(anchor);

    // The section whose top has most recently passed the upper third of the screen is "active".
    const onScroll = () => {
      const line = window.innerHeight * 0.33;
      let current = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= line) current = it.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      showObs?.disconnect();
    };
  }, [items, watch]);

  // Keep the active link in view when the bar scrolls sideways on phones.
  useEffect(() => {
    bar.current?.querySelector<HTMLElement>(`a[href="#${active}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  return (
    <nav ref={bar} className={`ev-bar${show ? " on" : ""}`} style={{ top }} aria-label="Sections" aria-hidden={!show} inert={!show || undefined}>
      {items.map((it) => (
        <a key={it.id} href={`#${it.id}`} className={it.id === active ? "on" : undefined} aria-current={it.id === active ? "true" : undefined}>
          {it.label}
          {it.count != null && <span>{it.count}</span>}
        </a>
      ))}
    </nav>
  );
}
