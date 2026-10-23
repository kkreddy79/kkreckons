"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Opens story graphics in a full-screen viewer instead of a new tab. Any link marked
 * data-lightbox (the graphic itself and "View full size") opens here; the links still work
 * as plain links without JavaScript, and Ctrl/Cmd-click still opens a new tab.
 * Tap the image to switch between fit-to-screen and full size (scroll to pan); phones can also pinch.
 */
export default function Lightbox() {
  const ref = useRef<HTMLDialogElement>(null);
  const [img, setImg] = useState<{ src: string; alt: string } | null>(null);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      const a = (ev.target as Element).closest?.("a[data-lightbox]") as HTMLAnchorElement | null;
      if (!a) return;
      ev.preventDefault();
      setImg({ src: a.getAttribute("href")!, alt: a.dataset.lightbox || "" });
      setZoom(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (img && !ref.current?.open) ref.current?.showModal();
  }, [img]);

  return (
    <dialog
      ref={ref}
      className={`lb${zoom ? " lb-zoom" : ""}`}
      aria-label="Graphic, full size"
      onClose={() => setImg(null)}
      onClick={(ev) => ev.target === ev.currentTarget && ref.current?.close()}
    >
      {img && (
        <>
          <div className="lb-bar">
            <button type="button" onClick={() => setZoom(!zoom)}>
              {zoom ? "Fit to screen" : "Zoom in"}
            </button>
            <a href={img.src} target="_blank" rel="noreferrer">
              Open in new tab ↗
            </a>
            <button type="button" className="lb-close" onClick={() => ref.current?.close()} aria-label="Close">
              ×
            </button>
          </div>
          <div className="lb-body" onClick={(ev) => ev.target === ev.currentTarget && ref.current?.close()}>
            <img src={img.src} alt={img.alt} onClick={() => setZoom(!zoom)} />
          </div>
        </>
      )}
    </dialog>
  );
}
