// Editorial checks for every edition (or just the dates given). Each story needs:
//   - a source link, at least two summary points and a "why it matters";
//   - no repeat of an article already used in the same edition or any earlier one (same link);
//   - a summary short enough not to replace the original (≤ MAX_SUMMARY_WORDS words of points);
//   - no long quotation (any quoted passage ≤ MAX_QUOTE_WORDS words);
//   - for any image, a declared origin (`figcredit` in the newsletter data).
// Headlines that look like an earlier story are listed for review (warning only).
//
// Usage: npm run check                (all editions)
//        npm run check -- 2026-10-10  (one or more dates; repeats are checked against all earlier dates)
// Deliberate exceptions live in data/qc-exceptions.json. Exits with status 1 on any problem.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MAX_SUMMARY_WORDS = 120;
const MAX_QUOTE_WORDS = 25;
const SIMILAR_TITLE = 0.6;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const index = JSON.parse(fs.readFileSync(path.join(root, "data", "editions.json"), "utf8"));
const lib = fs.readFileSync(path.join(root, "lib", "editions.ts"), "utf8");
const named = new Set([...lib.matchAll(/^  "([^"]+)": "/gm)].map((m) => m[1]));
const exceptionsFile = path.join(root, "data", "qc-exceptions.json");
const exceptions = fs.existsSync(exceptionsFile) ? JSON.parse(fs.readFileSync(exceptionsFile, "utf8")).exceptions : [];
const excused = (date, title, rule) => exceptions.some((x) => x.date === date && x.title === title && x.rules.includes(rule));

const host = (u) => {
  try {
    return new URL(u).hostname.replace(/^(www|m)\./, "");
  } catch {
    return "";
  }
};
/** Same article whatever the tracking parameters, mobile/www host or trailing slash. */
const articleKey = (u) => {
  try {
    const x = new URL(u);
    return `${x.hostname.replace(/^(www|m|amp)\./, "")}${x.pathname.replace(/\/amp\/?$|\/+$/g, "")}`.toLowerCase();
  } catch {
    return "";
  }
};
const words = (s) => (s || "").split(/\s+/).filter(Boolean).length;
const STOP = new Set("a an the and or of to in on for with at by from as is are was be its it this that how why what will can new says".split(" "));
const titleWords = (t) => new Set(t.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
const similarity = (a, b) => {
  const A = titleWords(a);
  const B = titleWords(b);
  if (A.size < 3 || B.size < 3) return 0;
  const shared = [...A].filter((w) => B.has(w)).length;
  return shared / Math.min(A.size, B.size);
};

const only = process.argv.slice(2);
const sorted = index.map((e) => e.date).sort();
const dates = sorted.filter((d) => !only.length || only.includes(d));
if (only.length && !dates.length) {
  console.error(`No edition found for ${only.join(", ")}. Did "npm run editions" run?`);
  process.exit(1);
}
const content = Object.fromEntries(sorted.map((d) => [d, JSON.parse(fs.readFileSync(path.join(root, "data", "content", `${d}.json`), "utf8"))]));

let problems = 0;
const warnings = [];
const unnamed = new Set();
const flag = (date, title, rule, msg) => {
  if (excused(date, title, rule)) return;
  problems += 1;
  console.log(`✗ ${date} · ${title} — ${msg}`);
};

for (const date of dates) {
  const c = content[date];
  // Articles already used: every earlier edition, then this one as we go.
  const used = new Map();
  for (const d of sorted.filter((x) => x < date)) {
    for (const s of content[d].sections.flatMap((sec) => sec.stories)) {
      for (const u of [s.url, s.url2]) if (u) used.set(articleKey(u), `${d} "${s.title}"`);
    }
    for (const r of content[d].reading) if (r.url) used.set(articleKey(r.url), `${d} further reading "${r.title}"`);
  }
  const earlierTitles = sorted.filter((x) => x < date).flatMap((d) => content[d].sections.flatMap((sec) => sec.stories.map((s) => [d, s.title])));

  let stories = 0;
  for (const sec of c.sections) {
    for (const s of sec.stories) {
      stories += 1;
      const issues = [];
      if (!s.url && !s.url2) issues.push("no source link");
      if (s.points.length < 2) issues.push(`${s.points.length} summary point(s)`);
      if (!s.why) issues.push('no "why it matters"');
      if (issues.length) flag(date, s.title, "basics", issues.join(", "));

      for (const u of new Set([s.url, s.url2].filter(Boolean).map(articleKey))) {
        if (used.has(u)) flag(date, s.title, "duplicate", `repeats an article already used in ${used.get(u)}`);
        else used.set(u, `${date} "${s.title}"`);
      }
      for (const [d, t] of earlierTitles) {
        if (t !== s.title && similarity(t, s.title) >= SIMILAR_TITLE && !excused(date, s.title, "similar"))
          warnings.push(`${date} "${s.title}" looks like ${d} "${t}"`);
      }

      const summary = s.points.reduce((n, p) => n + words(p), 0);
      if (summary > MAX_SUMMARY_WORDS)
        flag(date, s.title, "length", `summary is ${summary} words (limit ${MAX_SUMMARY_WORDS}); keep it short enough that readers still need the original`);
      for (const t of [...s.points, s.why, s.other]) {
        for (const m of (t || "").matchAll(/[“"‘]([^”"’]+)[”"’]/g)) {
          if (words(m[1]) > MAX_QUOTE_WORDS) flag(date, s.title, "quote", `quotes ${words(m[1])} words verbatim (limit ${MAX_QUOTE_WORDS}): "${m[1].slice(0, 60)}…"`);
        }
      }
      if (s.image && !s.imageCredit)
        flag(date, s.title, "image", "image has no declared origin (figcredit); only original, Creative Commons or licensed images may be used");

      for (const u of [s.url, s.url2]) if (u && !named.has(host(u))) unnamed.add(host(u));
    }
  }
  for (const r of c.reading) {
    if (!r.url) {
      flag(date, `Further reading "${r.title}"`, "basics", "no link");
      continue;
    }
    const k = articleKey(r.url);
    if (used.has(k)) flag(date, `Further reading "${r.title}"`, "duplicate", `repeats an article already used in ${used.get(k)}`);
    else used.set(k, `${date} further reading "${r.title}"`);
    if (!named.has(host(r.url))) unnamed.add(host(r.url));
  }
  console.log(`${date}: ${stories} stories, ${c.reading.length} further reading`);
}
if (unnamed.size) console.log(`ℹ Publishers shown as bare domains (add to PUBLISHERS in lib/editions.ts): ${[...unnamed].join(", ")}`);
for (const w of warnings) console.log(`⚠ Similar headline, check it isn't a repeat: ${w}`);
console.log(problems ? `${problems} problem(s) found.` : "All checks passed.");
process.exit(problems ? 1 : 0);
