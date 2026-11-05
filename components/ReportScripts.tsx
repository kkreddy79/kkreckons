"use client";

import { useEffect } from "react";

/**
 * Runs a special report's own scripts (filters, toggles) once the report is on the page.
 * A <script> that React renders is not executed when the page is reached by client-side navigation
 * (for example from the Special Reports list), so the scripts are added here as fresh script elements,
 * which the browser always runs. They run once per visit, whether the page was loaded or navigated to.
 */
export default function ReportScripts({ rootId, scripts }: { rootId: string; scripts: string[] }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const added = scripts.map((code) => {
      const el = document.createElement("script");
      el.text = code;
      root.appendChild(el);
      return el;
    });
    return () => added.forEach((el) => el.remove());
  }, [rootId, scripts]);
  return null;
}
