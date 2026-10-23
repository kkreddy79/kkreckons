"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** "/" anywhere on the site jumps to story search (the archive's search box), unless the reader is typing. */
export default function SearchKey() {
  const router = useRouter();
  useEffect(() => {
    const focus = () => document.getElementById("archive-search")?.focus();
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "/" || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const t = ev.target as HTMLElement;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      ev.preventDefault();
      if (document.getElementById("archive-search")) focus();
      else router.push("/daily/#search");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
  return null;
}
