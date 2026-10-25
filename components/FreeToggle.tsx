"use client";

import { useEffect, useState } from "react";
import { LockIcon, OpenLockIcon } from "@/components/AboutIcons";

/**
 * "Free sources only" switch on an edition: hides paywalled source links (CSS keyed on
 * html[data-free]), points headlines at a free version where there is one, and says when a story has
 * none. The choice is kept in localStorage so it holds across editions.
 */
export default function FreeToggle({ paid, noFree }: { paid: number; noFree: number }) {
  const [on, setOn] = useState(false);

  const apply = (next: boolean) => {
    const root = document.documentElement;
    if (next) root.dataset.free = "1";
    else delete root.dataset.free;
    // Headlines link to the original; swap to the free version while the switch is on.
    document.querySelectorAll<HTMLAnchorElement>("a[data-free-href]").forEach((a) => {
      if (!a.dataset.paidHref) a.dataset.paidHref = a.href;
      a.href = next ? a.dataset.freeHref! : a.dataset.paidHref;
    });
  };

  useEffect(() => {
    let saved = false;
    try {
      saved = localStorage.getItem("free-only") === "1";
    } catch {}
    if (saved) {
      setOn(true);
      apply(true);
    }
  }, []);

  const toggle = () => {
    const next = !on;
    try {
      localStorage.setItem("free-only", next ? "1" : "0");
    } catch {}
    setOn(next);
    apply(next);
  };

  return (
    <span className="ev-freebar">
      <span className="ev-freebar-n" title="Stories whose source may need a subscription">
        <LockIcon className="ev-lock-ic" /> {paid} paywalled
      </span>
      <button type="button" className="ev-free-switch" role="switch" aria-checked={on} onClick={toggle}>
        <span className="ev-free-knob" aria-hidden />
        Free sources only
      </button>
      {/* The links it changes sit under each story, far below: this key explains the marks the switch adds to the list. */}
      <span className="ev-free-note" role="status">
        {on && (
          <>
            {paid > noFree && (
              <span className="ev-free-key">
                <span className="ev-mark ev-mark-free" aria-hidden>
                  <OpenLockIcon />
                </span>
                {paid - noFree} free {paid - noFree === 1 ? "link" : "links"}
              </span>
            )}
            {paid > noFree && noFree > 0 && " "}
            {noFree > 0 && (
              <span className="ev-free-key">
                <span className="ev-mark ev-mark-paid" aria-hidden>
                  <LockIcon />
                </span>
                {noFree} summary only
              </span>
            )}
          </>
        )}
      </span>
    </span>
  );
}
