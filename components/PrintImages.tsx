"use client";

import { useEffect } from "react";

/** Graphics load lazily as readers scroll; printing or saving as PDF would leave the unloaded ones blank, so load them all first. */
export default function PrintImages() {
  useEffect(() => {
    const load = () => document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((i) => (i.loading = "eager"));
    window.addEventListener("beforeprint", load);
    return () => window.removeEventListener("beforeprint", load);
  }, []);
  return null;
}
