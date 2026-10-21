"use client";

import { useState } from "react";

/** Shows a very tall graphic cut to a readable height with a fade, and a button to show all of it. */
export default function FigClamp({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`ev-clamp${open ? " ev-clamp-open" : ""}`}>
      <div className="ev-clamp-body">{children}</div>
      <button type="button" className="ev-clamp-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Collapse graphic ↑" : "Expand full graphic ↓"}
      </button>
    </div>
  );
}
