"use client";

import { useEffect, useRef, useState } from "react";

/** Embeds an edition's original HTML and grows the frame to fit its content. */
export default function EditionFrame({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(1600);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    let observer: ResizeObserver | null = null;

    const fit = () => {
      const doc = frame.contentDocument;
      if (!doc?.documentElement) return;
      const h = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight ?? 0);
      if (h > 0) setHeight(h);
    };
    const onLoad = () => {
      setLoaded(true);
      fit();
      const doc = frame.contentDocument;
      if (doc?.body && "ResizeObserver" in window) {
        observer = new ResizeObserver(fit);
        observer.observe(doc.body);
      }
      // Some editions finish laying out after fonts and scripts settle.
      setTimeout(fit, 400);
      setTimeout(fit, 1500);
    };

    frame.addEventListener("load", onLoad);
    if (frame.contentDocument?.readyState === "complete") onLoad();
    window.addEventListener("resize", fit);
    return () => {
      frame.removeEventListener("load", onLoad);
      window.removeEventListener("resize", fit);
      observer?.disconnect();
    };
  }, [src]);

  return (
    <div className={`frame-wrap${loaded ? " is-loaded" : ""}`}>
      {!loaded && <div className="frame-loading">Loading edition…</div>}
      <iframe ref={ref} src={src} title={title} style={{ height }} scrolling="no" />
    </div>
  );
}
