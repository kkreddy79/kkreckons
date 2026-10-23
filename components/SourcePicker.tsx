"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type Option = { value: string; label: string; count: string };

/**
 * Source filter for Catch up: a button that opens a searchable list of publishers, instead of a long
 * dropdown. Type to narrow it, arrow keys to move, Enter to pick, Esc to close.
 */
export default function SourcePicker({ value, options, onChange }: { value: string; options: Option[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? options.filter((o) => o.label.toLowerCase().includes(t)) : options;
  }, [options, q]);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const close = (ev: MouseEvent) => root.current && !root.current.contains(ev.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${hi}"]`)?.scrollIntoView({ block: "nearest" });
  }, [hi, open]);

  const pick = (o: Option | undefined) => {
    if (!o) return;
    onChange(o.value);
    setOpen(false);
    root.current?.querySelector<HTMLButtonElement>(".sp-btn")?.focus();
  };

  return (
    <div className="sp" ref={root}>
      <button
        type="button"
        className="sp-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          // Start each opening with an empty search and the current source highlighted.
          if (!open) {
            setQ("");
            setHi(Math.max(0, options.findIndex((o) => o.value === value)));
          }
          setOpen(!open);
        }}
      >
        {current.label} <span>({current.count})</span>
      </button>
      {open && (
        <div className="sp-panel">
          <input
            ref={input}
            type="search"
            value={q}
            placeholder="Type a publisher…"
            aria-label="Filter sources"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-activedescendant={shown[hi] ? `${id}-${hi}` : undefined}
            onChange={(ev) => {
              setQ(ev.target.value);
              setHi(0);
            }}
            onKeyDown={(ev) => {
              if (ev.key === "ArrowDown") (ev.preventDefault(), setHi((h) => Math.min(h + 1, shown.length - 1)));
              else if (ev.key === "ArrowUp") (ev.preventDefault(), setHi((h) => Math.max(h - 1, 0)));
              else if (ev.key === "Enter") (ev.preventDefault(), pick(shown[hi]));
              else if (ev.key === "Escape") (ev.preventDefault(), setOpen(false), root.current?.querySelector<HTMLButtonElement>(".sp-btn")?.focus());
            }}
          />
          <ul ref={list} id={`${id}-list`} role="listbox" aria-label="Sources">
            {shown.map((o, i) => (
              <li
                key={o.value || "all"}
                id={`${id}-${i}`}
                data-i={i}
                role="option"
                aria-selected={o.value === value}
                className={i === hi ? "hi" : undefined}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => pick(o)}
              >
                {o.label} <span>{o.count}</span>
              </li>
            ))}
            {shown.length === 0 && <li className="sp-none">No source matches “{q.trim()}”</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
