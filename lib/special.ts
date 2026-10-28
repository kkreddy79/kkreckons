// KKReckons Special Reports: long reads, one per big story.
//
// The registry is data/special.json, one entry per report, newest first on the hub (/special). A report is either
// a self-contained HTML file KK supplies (`file`, kept in special/<slug>.html at the repo root so it isn't served
// twice) and shown at /special/<slug> inside the site's header and footer, or an earlier page elsewhere on the
// site (`href`, for example a research brief under /research/), which the hub lists with its own address.
import fs from "node:fs";
import path from "node:path";
import registry from "@/data/special.json";

export type SpecialReport = {
  slug: string;
  title: string;
  /** Sector or theme, shown above the title. */
  kicker: string;
  /** One line under the title. */
  dek: string;
  /** Longer copy for the featured card on the hub; falls back to `dek`. */
  blurb?: string;
  date: string;
  themes: string[];
  reading_minutes: number;
  /** The report's own HTML, relative to the repo root (`special/<slug>.html`); null when `href` points elsewhere. */
  file: string | null;
  /** Where the report lives when it isn't served from /special/<slug>. */
  href?: string;
  /** 1600×900 cover for the card and link previews, as a site path; null for none. */
  cover: string | null;
  cover_alt?: string;
  sources: string[];
};

/** Every report, newest first. */
export const SPECIAL: SpecialReport[] = (registry as SpecialReport[]).slice().sort((a, b) => b.date.localeCompare(a.date));

/** Reports served at /special/<slug> from their own file. */
export const hosted = () => SPECIAL.filter((r) => r.file);

export const specialBySlug = (slug: string) => SPECIAL.find((r) => r.slug === slug);

/** The report's address on the site. */
export const specialHref = (r: SpecialReport) => r.href || `/special/${r.slug}`;

export type ReportPage = {
  /** The report's own stylesheet, every rule scoped to `.sp-report` so it can't restyle the site's header or footer. */
  css: string;
  /** The report's body markup, without its scripts (they come separately so the page can run them). */
  body: string;
  scripts: string[];
  /** Plain text of the report, for word counts. */
  text: string;
};

/** Reads and prepares a hosted report's HTML (build time). */
export function loadReport(r: SpecialReport): ReportPage {
  if (!r.file) throw new Error(`Report ${r.slug} has no file`);
  const html = fs.readFileSync(path.join(process.cwd(), r.file), "utf8");
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
  let body = (/<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1] ?? html)
    // A page saved from a claude.ai artifact can carry head elements inside its body.
    .replace(/<(title|meta|link|style)\b[^>]*>[\s\S]*?<\/\1>|<(meta|link)\b[^>]*>/gi, "")
    .trim();
  const scripts = [...body.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].trim()).filter(Boolean);
  body = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  // Links to other sites open in a new tab, as everywhere else on the site; links back to kkreckons.com stay in this tab.
  body = body.replace(/<a\s+([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi, (m, pre: string, href: string, post: string) => {
    if (/^https?:\/\/(www\.)?kkreckons\.com(\/|$)/.test(href)) return `<a ${pre}href="${href.replace(/^https?:\/\/(www\.)?kkreckons\.com/, "")}"${post}>`;
    if (/\btarget=/.test(pre + post)) return m;
    return `<a ${pre}href="${href}"${post} target="_blank" rel="noreferrer">`;
  });
  const text = body.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  return { css: scopeCss(css, ".sp-report"), body, scripts, text };
}

export const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

/**
 * Prefixes every selector in a stylesheet with `scope`, so a self-contained page's CSS applies only inside the
 * element that holds it. `:root`, `html` and `body` become the scope element itself (their custom properties then
 * cascade from it), theme selectors on `:root` (`:root[data-theme="dark"]`, `:root:not([data-theme="light"])`)
 * keep working with the site's theme switch, and `@media`/`@supports` blocks are walked; `@font-face` and
 * `@keyframes` are left as they are.
 */
export function scopeCss(css: string, scope: string): string {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const scopeSelector = (s: string) => {
    s = s.trim();
    if (!s) return s;
    if (/^(:root|html|body)$/.test(s)) return scope;
    if (/^:root(?=[:[.])/.test(s)) return `${s} ${scope}`;
    if (/^(html|body)\s+/.test(s)) return `${scope} ${s.replace(/^(html|body)\s+/, "")}`;
    if (/^(html|body)(?=[:[.])/.test(s)) return s.replace(/^(html|body)/, scope);
    return `${scope} ${s}`;
  };
  const walk = (block: string): string => {
    let out = "";
    let i = 0;
    while (i < block.length) {
      const open = block.indexOf("{", i);
      if (open < 0) {
        out += block.slice(i).trim() ? block.slice(i) : "";
        break;
      }
      const head = block.slice(i, open).trim();
      // Matching brace, allowing nested blocks.
      let depth = 1;
      let j = open + 1;
      while (j < block.length && depth > 0) {
        if (block[j] === "{") depth++;
        else if (block[j] === "}") depth--;
        j++;
      }
      const inner = block.slice(open + 1, j - 1);
      if (head.startsWith("@")) {
        out += /^@(media|supports|container|layer|scope)\b/.test(head) ? `${head}{${walk(inner)}}` : `${head}{${inner}}`;
      } else {
        out += `${splitSelectors(head).map(scopeSelector).join(",")}{${inner}}`;
      }
      i = j;
    }
    return out;
  };
  return walk(src);
}

/** Splits a selector list on commas that aren't inside parentheses (`:is(a, b)`). */
function splitSelectors(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of list) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}
