// Builds the edition index for the site.
//
//   1. Drop a newsletter's HTML into public/editions/YYYY-MM-DD.html
//   2. (Optional) add its artifact link / summary in data/edition-meta.json
//   3. Run `npm run editions`
//
// For every edition this script normalises the HTML (strips the artifact
// preview wrapper, makes links open in a new tab), renders it in headless
// Chromium to pull out the headlines, sections and "Today's slice", saves a
// cover image to public/covers/, and writes data/editions.json.

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const editionsDir = path.join(root, "public", "editions");
const coversDir = path.join(root, "public", "covers");
const metaPath = path.join(root, "data", "edition-meta.json");
const outPath = path.join(root, "data", "editions.json");

const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")) : {};
fs.mkdirSync(coversDir, { recursive: true });

const files = fs
  .readdirSync(editionsDir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f))
  .sort();

function normalise(html) {
  // Artifact downloads can arrive wrapped in a preview skeleton that holds
  // the real document as a second <!DOCTYPE>. Keep only the inner document.
  const first = html.search(/<!DOCTYPE html>/i);
  const second = first >= 0 ? html.slice(first + 15).search(/<!DOCTYPE html>/i) : -1;
  if (second >= 0) html = html.slice(first + 15 + second);
  if (!/<base\s/i.test(html)) html = html.replace(/<head>/i, '<head><base target="_blank">');
  return html;
}

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const editions = [];

for (const file of files) {
  const date = file.replace(".html", "");
  const full = path.join(editionsDir, file);
  const html = normalise(fs.readFileSync(full, "utf8"));
  fs.writeFileSync(full, html);

  const page = await browser.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(full).href, { waitUntil: "load" });
  await page.waitForTimeout(1200);

  const info = await page.evaluate(() => {
    const re = /^[^A-Za-z]*(pick of the day|india edition|world edition)$/i;
    const isLabel = (e) => {
      const t = (e.textContent || "").trim();
      return t.length < 40 && re.test(t) && ![...e.children].some((c) => re.test((c.textContent || "").trim()));
    };
    const nodes = [...document.querySelectorAll("body *")].filter((e) => /^H[23]$/.test(e.tagName) || isLabel(e));
    let section = "";
    const stories = [];
    for (const n of nodes) {
      const t = (n.innerText || n.textContent).replace(/\s+/g, " ").trim();
      if (!/^H[23]$/.test(n.tagName)) {
        const m = t.match(re)[1].toLowerCase();
        section = m[0].toUpperCase() + m.slice(1);
        continue;
      }
      if (/^(what happened|why it matters|what to watch|also on|source map|the daily)/i.test(t)) continue;
      if (t.length < 12) continue;
      const card = n.closest("article,section.story") || n.parentElement;
      let tag = ((card.querySelector(".tag") || {}).textContent || "").trim();
      if (tag.startsWith("·")) tag = "";
      let category = ((card.querySelector(".cat,.category-tag") || {}).textContent || "").trim();
      if (tag && category.endsWith(tag) && category !== tag) category = category.slice(0, -tag.length).trim();
      const a = n.querySelector("a") || card.querySelector("a.source-btn");
      const url = a && /^https?:/.test(a.href) ? a.href : "";
      stories.push({ section: section || "Top stories", title: t.replace(/\s+also$/, ""), category, tag, url });
    }
    const sliceEl = [...document.querySelectorAll("body *")].find(
      (e) => /today[’']s slice/i.test(e.innerText || "") && e.children.length < 6 && (e.innerText || "").length < 220
    );
    const slice = sliceEl
      ? sliceEl.innerText.replace(/^[\s\S]*today[’']s slice:?/i, "").replace(/\s+/g, " ").trim()
      : "";
    return { stories, slice, words: document.body.innerText.split(/\s+/).length };
  });

  await page.screenshot({
    path: path.join(coversDir, `${date}.jpg`),
    type: "jpeg",
    quality: 78,
    clip: { x: 0, y: 0, width: 430, height: 520 },
  });
  await page.close();

  const m = meta[date] || {};
  editions.push({
    date,
    title: m.title || (html.match(/<title>([^<]*)<\/title>/i) || [])[1]?.trim() || "",
    slice: m.slice || info.slice,
    artifact: m.artifact || "",
    readingMinutes: Math.max(3, Math.round(info.words / 230)),
    stories: info.stories,
  });
  console.log(`${date}: ${info.stories.length} stories`);
}

await browser.close();
editions.sort((a, b) => (a.date < b.date ? 1 : -1));
fs.writeFileSync(outPath, JSON.stringify(editions, null, 2) + "\n");
console.log(`Wrote ${editions.length} editions to ${path.relative(root, outPath)}`);
