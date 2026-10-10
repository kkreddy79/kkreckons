// Checks every edition (or just the dates given) for what each story needs on the site:
// a source link, at least two summary points and a "why it matters", plus named publishers.
// Usage: npm run check            (all editions)
//        npm run check 2026-10-10 (one or more dates)
// Exits with status 1 when anything is missing.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const index = JSON.parse(fs.readFileSync(path.join(root, "data", "editions.json"), "utf8"));
const lib = fs.readFileSync(path.join(root, "lib", "editions.ts"), "utf8");
const named = new Set([...lib.matchAll(/^  "([^"]+)": "/gm)].map((m) => m[1]));
const host = (u) => {
  try {
    return new URL(u).hostname.replace(/^(www|m)\./, "");
  } catch {
    return "";
  }
};

const only = process.argv.slice(2);
const dates = index.map((e) => e.date).filter((d) => !only.length || only.includes(d));
if (only.length && !dates.length) {
  console.error(`No edition found for ${only.join(", ")}. Did "npm run editions" run?`);
  process.exit(1);
}

let problems = 0;
const unnamed = new Set();
for (const date of dates) {
  const c = JSON.parse(fs.readFileSync(path.join(root, "data", "content", `${date}.json`), "utf8"));
  let stories = 0;
  for (const sec of c.sections) {
    for (const s of sec.stories) {
      stories += 1;
      const issues = [];
      if (!s.url && !s.url2) issues.push("no source link");
      if (s.points.length < 2) issues.push(`${s.points.length} summary point(s)`);
      if (!s.why) issues.push('no "why it matters"');
      for (const u of [s.url, s.url2]) if (u && !named.has(host(u))) unnamed.add(host(u));
      if (issues.length) {
        problems += 1;
        console.log(`✗ ${date} · ${s.title} — ${issues.join(", ")}`);
      }
    }
  }
  for (const r of c.reading) {
    if (!r.url) {
      problems += 1;
      console.log(`✗ ${date} · Further reading "${r.title}" — no link`);
    } else if (!named.has(host(r.url))) unnamed.add(host(r.url));
  }
  console.log(`${date}: ${stories} stories, ${c.reading.length} further reading`);
}
if (unnamed.size) console.log(`ℹ Publishers shown as bare domains (add to PUBLISHERS in lib/editions.ts): ${[...unnamed].join(", ")}`);
console.log(problems ? `${problems} problem(s) found.` : "All checks passed.");
process.exit(problems ? 1 : 0);
