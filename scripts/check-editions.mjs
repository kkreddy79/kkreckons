// Editorial checks for every edition (or just the dates given). Each story needs:
//   - a source link, at least two summary points and a "why it matters";
//   - no repeat of an article already used in the same edition or any earlier one (same link);
//   - a summary short enough not to replace the original (≤ MAX_SUMMARY_WORDS words of points);
//   - no long quotation (any quoted passage ≤ MAX_QUOTE_WORDS words);
//   - for any image, a declared origin (`figcredit` in the newsletter data);
//   - only http(s) links (sources, further reading, numbers of the day);
//   - a `follows` (follow-up) that points to an earlier story that exists.
// Headlines that look like an earlier story, and images without alt text, are listed for review (warning only).
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
// Publisher names (PUBLISHERS) and the PAYWALLED list live in lib/editionFormat.ts.
const lib = fs.readFileSync(path.join(root, "lib", "editionFormat.ts"), "utf8");
const named = new Set([...lib.matchAll(/^  "([^"]+)": "/gm)].map((m) => m[1]));
const paywalled = new Set([...(lib.match(/const PAYWALLED = new Set\(\[([^\]]*)\]/)?.[1] || "").matchAll(/"([^"]+)"/g)].map((m) => m[1]));
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
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const slugFor = (d) => `${MONTHS[+d.slice(5, 7) - 1]}-${+d.slice(8, 10)}-${d.slice(0, 4)}`;
const content = Object.fromEntries(sorted.map((d) => [d, JSON.parse(fs.readFileSync(path.join(root, "data", "content", `${d}.json`), "utf8"))]));
// Special reports that exist on the site (data/special.json): slugs served at /special/<slug>, or listed with their own href.
const specialSlugs = new Set(JSON.parse(fs.readFileSync(path.join(root, "data", "special.json"), "utf8")).filter((r) => r.file || r.href).map((r) => r.slug));

let problems = 0;
const warnings = [];
const unnamed = new Set();
// Stories that look like AI debt, AI financing or credit stress: suggested for an AI Stress Index link (info only).
const AI_WORDS = /\b(AI|artificial intelligence|data[- ]cent(re|er)s?|neoclouds?|hyperscalers?|CoreWeave|Nscale|OpenAI|Anthropic|Nvidia|GPUs?|compute)\b/gi;
const DEBT_WORDS = /\b(debt|bonds?|credit|loans?|lend(ers?|ing)|financing|CDS|defaults?|spreads?|leverage|borrow\w*|refinanc\w*)\b/gi;
const stressCandidate = (s) => {
  const t = [s.title, s.category, ...s.points, s.why].join(" ");
  return (t.match(AI_WORDS) || []).length >= 2 && (t.match(DEBT_WORDS) || []).length >= 3;
};
const suggested = [];
// Paywalled stories with no free version (info only; editions from when the `free` field arrived).
const FREE_FROM = "2026-10-24";
const noFree = [];
const vague = [];
// Further-reading titles that only name a platform or format ("Video (YouTube)", "Link") tell readers nothing.
const VAGUE_TITLE = /^(video|link|article|podcast|post|thread|read|watch)?\s*\(?\s*(youtube|youtu\.be|x|twitter|linkedin|instagram|link|video|article)?\s*\)?$/i;
const webLink = (u) => /^https?:\/\//i.test(u);
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
      for (const u of [s.url, s.url2, s.freeUrl]) if (u) used.set(articleKey(u), `${d} "${s.title}"`);
    }
    for (const r of content[d].reading) if (r.url) used.set(articleKey(r.url), `${d} further reading "${r.title}"`);
  }
  const earlierTitles = sorted
    .filter((x) => x < date)
    .flatMap((d) => content[d].sections.flatMap((sec) => sec.stories).map((s, i) => [d, s.title, `/daily/${slugFor(d)}/${i + 1}`]));
  const earlierPages = new Set(earlierTitles.map(([, , href]) => href));

  let stories = 0;
  for (const sec of c.sections) {
    for (const s of sec.stories) {
      stories += 1;
      const issues = [];
      if (!s.url && !s.url2) issues.push("no source link");
      if (s.points.length < 2) issues.push(`${s.points.length} summary point(s)`);
      if (!s.why) issues.push('no "why it matters"');
      if (issues.length) flag(date, s.title, "basics", issues.join(", "));

      for (const u of new Set([s.url, s.url2, s.freeUrl].filter(Boolean).map(articleKey))) {
        if (used.has(u)) flag(date, s.title, "duplicate", `repeats an article already used in ${used.get(u)}`);
        else used.set(u, `${date} "${s.title}"`);
      }
      for (const [d, t, href] of earlierTitles) {
        if (t !== s.title && href !== s.follows && similarity(t, s.title) >= SIMILAR_TITLE && !excused(date, s.title, "similar"))
          warnings.push(`${date} "${s.title}" looks like ${d} "${t}" (if it updates that story, add "follows": "${href}")`);
      }
      if (s.follows && !earlierPages.has(s.follows))
        flag(date, s.title, "follows", `"follows" must be an earlier story's page, like /daily/${slugFor(sorted[0])}/1; no earlier story at ${s.follows}`);

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
      if (!s.stressIndex && stressCandidate(s)) suggested.push(`${date} "${s.title}"`);
      const srcs = [s.url, s.url2].filter(Boolean);
      if (date >= FREE_FROM && !s.freeUrl && srcs.length && (s.pay ?? paywalled.has(host(srcs[0]))) && srcs.slice(1).every((u) => paywalled.has(host(u))))
        noFree.push(`${date} "${s.title}" (${host(srcs[0])})`);
      if (s.image && !(s.imageAlt || "").trim())
        flag(date, s.title, "alt", 'graphic has no alt text (figalt, or an "imageAlt" override in data/edition-meta.json); screen readers and search can\'t read it');

      // The free version must really be free: a gift or share link is fine, a plain paywalled link isn't.
      if (s.freeUrl && paywalled.has(host(s.freeUrl)) && !/gift|share|accessToken|giftToken/i.test(s.freeUrl))
        flag(date, s.title, "link", `"free" link points to a paywalled site (${host(s.freeUrl)}); use wire copy, the original release or a gift link`);
      for (const u of [s.url, s.url2, s.freeUrl]) if (u && !webLink(u)) flag(date, s.title, "link", `source link isn't an http(s) web address: ${u.slice(0, 60)}`);
      for (const u of [s.url, s.url2, s.freeUrl]) if (u && !named.has(host(u))) unnamed.add(host(u));
    }
  }
  for (const r of c.reading) {
    if (!r.url) {
      flag(date, `Further reading "${r.title}"`, "basics", "no link");
      continue;
    }
    if (VAGUE_TITLE.test((r.title || "").trim())) vague.push(`${date} "${r.title}"`);
    if (!webLink(r.url)) flag(date, `Further reading "${r.title}"`, "link", `link isn't an http(s) web address: ${r.url.slice(0, 60)}`);
    const k = articleKey(r.url);
    if (used.has(k)) flag(date, `Further reading "${r.title}"`, "duplicate", `repeats an article already used in ${used.get(k)}`);
    else used.set(k, `${date} further reading "${r.title}"`);
    if (!named.has(host(r.url))) unnamed.add(host(r.url));
  }
  for (const k of c.callouts || []) if (k.url && !webLink(k.url)) flag(date, `Number "${k.num}"`, "link", `link isn't an http(s) web address: ${k.url.slice(0, 60)}`);
  // The special-report pointer: a real link, and when it points at /special/<slug> here, a report that exists (the banner must never 404).
  if (c.special) {
    const sp = c.special;
    if (!sp.title || !webLink(sp.url)) flag(date, `Special report "${sp.title || ""}"`, "special", "needs a title and an http(s) url");
    const m = /^https?:\/\/(?:www\.)?kkreckons\.com\/special\/([a-z0-9-]+)\/?$/.exec(sp.url || "");
    if (m && !specialSlugs.has(m[1])) flag(date, `Special report "${sp.title}"`, "special", `points at /special/${m[1]}, but data/special.json has no report with that slug (add it, or drop the "special" block for this edition)`);
  }
  console.log(`${date}: ${stories} stories, ${c.reading.length} further reading`);
}
if (unnamed.size) console.log(`ℹ Publishers shown as bare domains (add to PUBLISHERS in lib/editionFormat.ts): ${[...unnamed].join(", ")}`);
for (const w of warnings) console.log(`⚠ Similar headline, check it isn't a repeat or a follow-up: ${w}`);
for (const date of dates) if (content[date].sections.some((sec) => sec.stories.some((s) => s.stressIndex)) && !content[date].stressIndex)
  console.log(`⚠ ${date}: a story links to the AI Stress Index but no reading was saved (index data was unreachable); it shows the link without a number`);
for (const v of vague) console.log(`⚠ Further reading needs a real title (it only names the platform): ${v}`);
for (const x of noFree) console.log(`ℹ Paywalled, no free version (add "free" or a { "freeUrl", "freeSrc" } override): ${x}`);
for (const x of suggested) console.log(`ℹ Possible AI Stress Index link (AI debt/credit story, not tagged): ${x}`);
{
  const newest = [...dates].sort().pop();
  if (newest && !content[newest].cover) console.log(`ℹ ${newest}: no 1600×900 cover (newsletter "cover"); link previews and Google Discover use the first story graphic`);
}
// "What would change our mind" (data/watch.json): valid states and dates, and every linked story exists.
{
  const MON = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const pages = new Set(sorted.flatMap((d) => content[d].sections.flatMap((sec) => sec.stories).map((_, i) => `/daily/${MON[+d.slice(5, 7) - 1]}-${+d.slice(8, 10)}-${d.slice(0, 4)}/${i + 1}`)));
  const STATES = new Set(["met", "partly", "not-met"]);
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
  const watch = JSON.parse(fs.readFileSync(path.join(root, "data", "watch.json"), "utf8"));
  for (const t of watch.theses)
    for (const c of t.conditions) {
      const where = `Watch "${c.label}"`;
      if (!STATES.has(c.state) || (c.history || []).some((h) => !STATES.has(h.state))) flag("data/watch.json", where, "watch", `state must be one of ${[...STATES].join(", ")}`);
      if (!isDate(c.since) || (c.history || []).some((h) => !isDate(h.since))) flag("data/watch.json", where, "watch", `"since" must be a YYYY-MM-DD date`);
      if (!c.evidence) flag("data/watch.json", where, "watch", "no evidence line");
      for (const l of c.links || []) if (!pages.has(l.href)) flag("data/watch.json", where, "watch", `links to ${l.href}, which isn't a story page`);
    }
}
console.log(problems ? `${problems} problem(s) found.` : "All checks passed.");
process.exit(problems ? 1 : 0);
