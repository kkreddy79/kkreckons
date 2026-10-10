// Quality control before an edition goes live. Run after `npm run editions` and `npm run build`:
//
//   npm run qc                          compare with origin/main
//   npm run qc -- --base <ref>          compare with another git ref
//   npm run qc -- --allow 2026-10-08    let an earlier edition change on purpose (a correction)
//
// 1. Nothing lost: every edition already live is still listed, and its data, original newsletter
//    and images are byte-for-byte unchanged (unless --allow'd). The pull request touches only
//    edition files.
// 2. Nothing dropped in rendering: every edition page shows every story, number, section, image
//    and further reading item from its data; Home shows the newest edition; Catch up lists every
//    edition, including the one Home just replaced; the sitemap lists them all.
// Exits with status 1 if any check fails.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const base = opt("--base") || "origin/main";
const allowed = new Set(args.filter((a, i) => args[i - 1] === "--allow"));

const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);
const read = (p) => fs.readFileSync(path.join(root, p));
const git = (...a) =>
  execFileSync("git", a, { cwd: root, encoding: "buffer", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] });
const atBase = (p) => {
  try {
    return git("show", `${base}:${p}`);
  } catch {
    return null;
  }
};

// Same slug and date formats as lib/editions.ts.
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const parts = (d) => d.split("-").map(Number);
const slugFor = (d) => {
  const [y, m, day] = parts(d);
  return `${MONTHS[m - 1]}-${day}-${y}`;
};
const longDate = (d) => {
  const [y, m, day] = parts(d);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
  return `${wd}, ${day} ${MONTHS[m - 1][0].toUpperCase()}${MONTHS[m - 1].slice(1)} ${y}`;
};
// React's HTML escaping, so text can be found in the built pages.
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const count = (html, needle) => html.split(needle).length - 1;

try {
  git("rev-parse", "--verify", base);
} catch {
  console.error(`Can't find ${base}. Run "git fetch origin main" first.`);
  process.exit(1);
}

// ---------- 1. Nothing lost ----------
const index = JSON.parse(read("data/editions.json"));
const baseIndex = JSON.parse(atBase("data/editions.json") || "[]");
const dates = new Set(index.map((e) => e.date));
const baseDates = baseIndex.map((e) => e.date);
const added = index.map((e) => e.date).filter((d) => !baseDates.includes(d)).sort();
const newest = [...dates].sort().at(-1);
const previous = baseDates.slice().sort().at(-1);

for (const d of baseDates) if (!dates.has(d)) fail(`Edition ${d} was live but is missing now.`);

for (const d of baseDates) {
  if (!dates.has(d) || allowed.has(d)) continue;
  const files = [`data/content/${d}.json`, `public/editions/${d}.html`];
  for (const f of files) {
    const before = atBase(f);
    if (before && (!fs.existsSync(path.join(root, f)) || !before.equals(read(f)))) fail(`${f} changed (an earlier edition). Use --allow ${d} if this is a deliberate correction.`);
  }
  const was = JSON.stringify(baseIndex.find((e) => e.date === d));
  const now = JSON.stringify(index.find((e) => e.date === d));
  if (was !== now) fail(`The Catch up listing for ${d} changed. Use --allow ${d} if deliberate.`);
}

const baseMeta = JSON.parse(atBase("data/edition-meta.json") || "{}");
const meta = JSON.parse(read("data/edition-meta.json"));
for (const [d, m] of Object.entries(baseMeta)) {
  if (allowed.has(d)) continue;
  if (JSON.stringify(meta[d]) !== JSON.stringify(m)) fail(`data/edition-meta.json entry for ${d} changed. Use --allow ${d} if deliberate.`);
}

const changed = git("diff", "--name-only", `${base}...HEAD`).toString().split("\n").filter(Boolean);
const uncommitted = git("status", "--porcelain").toString().split("\n").filter(Boolean).map((l) => l.slice(3));
const editionFile = (f) => {
  if (["data/editions.json", "data/edition-meta.json", "lib/editions.ts"].includes(f)) return true;
  const m = /^(?:public\/editions|data\/content|public\/figs)\/(\d{4}-\d{2}-\d{2})/.exec(f);
  return Boolean(m && (added.includes(m[1]) || allowed.has(m[1])));
};
for (const f of new Set([...changed, ...uncommitted])) {
  if (!editionFile(f)) fail(`Unexpected file in an edition update: ${f}. Edition pull requests should only add edition files.`);
}
for (const f of fs.readdirSync(path.join(root, "public/figs"))) {
  const d = f.slice(0, 10);
  if (atBase(`public/figs/${f}`) && !allowed.has(d) && !atBase(`public/figs/${f}`).equals(read(`public/figs/${f}`))) fail(`Image public/figs/${f} changed.`);
}
for (const f of git("ls-tree", "--name-only", base, "public/figs/").toString().split("\n").filter(Boolean)) {
  if (!fs.existsSync(path.join(root, f))) fail(`Image ${f} was deleted.`);
}

// ---------- 2. Nothing dropped in rendering ----------
const out = path.join(root, ".next/server/app");
if (!fs.existsSync(path.join(out, "index.html"))) {
  fail('No build found. Run "npm run build" before "npm run qc".');
} else {
  const page = (p) => {
    const f = path.join(out, p);
    return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
  };

  for (const e of index) {
    const c = JSON.parse(read(`data/content/${e.date}.json`));
    const html = page(`daily/${slugFor(e.date)}.html`);
    if (!html) {
      fail(`${e.date}: no page at /daily/${slugFor(e.date)}.`);
      continue;
    }
    const stories = c.sections.flatMap((s) => s.stories);
    const expect = {
      stories: stories.length,
      sections: c.sections.length,
      "numbers of the day": c.callouts.length,
      images: stories.filter((s) => s.image).length,
      "source lines": stories.filter((s) => s.url || s.url2).length,
      "further reading": c.reading.length,
    };
    const got = {
      stories: count(html, "<article "),
      sections: count(html, 'class="ev-section"'),
      "numbers of the day": count(html, 'class="ev-call '),
      images: count(html, 'class="ev-fig"'),
      "source lines": count(html, 'class="ev-src"'),
      "further reading": c.reading.length ? (/<section class="ev-reading"[\s\S]*?<\/section>/.exec(html)?.[0].match(/<li>/g) || []).length : 0,
    };
    for (const k of Object.keys(expect)) if (expect[k] !== got[k]) fail(`${e.date}: page shows ${got[k]} ${k}, data has ${expect[k]}.`);
    for (const s of stories) if (!html.includes(esc(s.title))) fail(`${e.date}: story "${s.title}" isn't on its page.`);
    if (c.slice && !html.includes(esc(c.slice))) fail(`${e.date}: headline missing from its page.`);
  }

  const home = page("index.html");
  const latest = JSON.parse(read(`data/content/${newest}.json`));
  if (!home.includes(esc(longDate(newest)))) fail(`Home doesn't show the newest edition (${longDate(newest)}).`);
  if (latest.slice && !home.includes(esc(latest.slice))) fail("Home doesn't show the newest edition's headline.");
  const homeStories = latest.sections.reduce((n, s) => n + s.stories.length, 0);
  if (count(home, "<article ") !== homeStories) fail(`Home shows ${count(home, "<article ")} stories, the newest edition has ${homeStories}.`);

  const catchUp = page("daily.html");
  const listed = count(catchUp, 'class="tl-item"');
  if (listed !== index.length) fail(`Catch up lists ${listed} editions, there are ${index.length}.`);
  for (const e of index) if (!catchUp.includes(`href="/daily/${slugFor(e.date)}"`)) fail(`Catch up has no link to ${e.date}.`);
  if (previous && previous !== newest) {
    if (!catchUp.includes(`href="/daily/${slugFor(previous)}"`)) fail(`The edition Home replaced (${previous}) isn't on Catch up.`);
    else notes.push(`${longDate(previous)} has moved from Home to Catch up (/daily/${slugFor(previous)}).`);
  }

  const sitemap = page("sitemap.xml.body") || "";
  for (const e of index) if (!sitemap.includes(`/daily/${slugFor(e.date)}<`)) fail(`Sitemap is missing ${e.date}.`);
}

// ---------- Report ----------
console.log(`Compared with ${base}. Editions: ${baseDates.length} before, ${index.length} now${added.length ? ` (new: ${added.join(", ")})` : ""}.`);
for (const n of notes) console.log(`• ${n}`);
if (failures.length) {
  for (const f of failures) console.log(`✗ ${f}`);
  console.log(`QC failed: ${failures.length} problem(s). Don't publish until they're fixed.`);
  process.exit(1);
}
console.log("✓ QC passed: no earlier edition changed, and every page shows all of its data.");
