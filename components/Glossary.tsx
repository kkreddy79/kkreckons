import { Fragment } from "react";
import { GLOSSARY } from "@/lib/glossary";

/**
 * Story text with jargon explained: the first mention of each glossary term (per story, tracked in `seen`)
 * becomes a button that opens a one-line definition (native popover, so it works by tap and keyboard).
 */
export function Glossed({ text, seen, id }: { text: string; seen: Set<string>; id: string }) {
  const hits: { start: number; end: number; term: string; def: string }[] = [];
  for (const g of GLOSSARY) {
    if (seen.has(g.term)) continue;
    const m = new RegExp(g.match.source, g.match.flags.replace("g", "")).exec(text);
    if (!m || hits.some((h) => m.index < h.end && m.index + m[0].length > h.start)) continue;
    seen.add(g.term);
    hits.push({ start: m.index, end: m.index + m[0].length, term: g.term, def: g.def });
  }
  if (!hits.length) return <>{text}</>;
  hits.sort((a, b) => a.start - b.start);
  const out: React.ReactNode[] = [];
  let at = 0;
  for (const h of hits) {
    const pid = `${id}-gl-${h.term.toLowerCase().replace(/[^a-z]+/g, "-")}`;
    out.push(
      <Fragment key={pid}>
        {text.slice(at, h.start)}
        <button type="button" className="gl" popoverTarget={pid} aria-label={`${text.slice(h.start, h.end)}: what it means`}>
          {text.slice(h.start, h.end)}
        </button>
        <span id={pid} popover="auto" className="gl-pop" role="tooltip">
          <b>{h.term}</b> {h.def}
        </span>
      </Fragment>,
    );
    at = h.end;
  }
  out.push(text.slice(at));
  return <>{out}</>;
}
