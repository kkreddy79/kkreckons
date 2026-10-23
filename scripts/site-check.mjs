// Browser check of the built site: every page type at phone and desktop width, light and dark.
//
//   npm run build && npx next start -p 3000 &   then   npm run site-check [-- <base url>]
//
// Fails (exit 1) when a page doesn't load, throws a script error, scrolls sideways, or has a
// serious or critical accessibility problem found by axe. Lesser axe findings are listed only.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const slugFor = (d) => {
  const [y, m, day] = d.split("-").map(Number);
  return `${MONTHS[m - 1]}-${day}-${y}`;
};
const editions = JSON.parse(fs.readFileSync(path.join(root, "data", "editions.json"), "utf8")).map((e) => e.date).sort();
const latest = slugFor(editions.at(-1));
const earlier = slugFor(editions.at(-2) ?? editions.at(-1));

const PAGES = ["/", "/daily/", "/daily/?theme=AI", `/daily/${earlier}`, `/daily/${latest}/1`, "/topics", "/topics/ai", "/week", "/ai-stress-index", "/about", "/standards", "/contact", "/privacy"];
const VIEWS = [
  { name: "phone", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 900 },
];

const failures = [];
const notes = new Map();
const browser = await (process.env.CHROMIUM_PATH ? chromium.launch({ executablePath: process.env.CHROMIUM_PATH }) : chromium.launch());
for (const scheme of ["light", "dark"]) {
  for (const view of VIEWS) {
    const context = await browser.newContext({ viewport: { width: view.width, height: view.height }, colorScheme: scheme });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const p of PAGES) {
      const where = `${p} (${view.name}, ${scheme})`;
      errors.length = 0;
      const res = await page.goto(base + p, { waitUntil: "networkidle" }).catch((e) => ({ status: () => e.message }));
      if (res?.status() !== 200) {
        failures.push(`${where}: loaded with ${res?.status()}`);
        continue;
      }
      const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (wide > 1) failures.push(`${where}: scrolls sideways by ${wide}px`);
      for (const e of errors) failures.push(`${where}: script error: ${e}`);
      // Accessibility: once per page and theme is enough for most rules; colour contrast differs by theme.
      if (view.name === "desktop" || p === "/") {
        const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        for (const v of violations) {
          const line = `${v.id}: ${v.help} (${v.nodes.length}×, e.g. ${v.nodes[0]?.target.join(" ")})`;
          if (v.impact === "serious" || v.impact === "critical") failures.push(`${where}: ${line}`);
          else notes.set(`${p} ${scheme}: ${v.id}`, `${where}: ${line}`);
        }
      }
    }
    await context.close();
  }
}
await browser.close();

for (const n of notes.values()) console.log(`ℹ ${n}`);
for (const f of failures) console.log(`✗ ${f}`);
console.log(failures.length ? `Site check failed: ${failures.length} problem(s).` : `Site check passed: ${PAGES.length} pages × 2 widths × 2 themes.`);
process.exit(failures.length ? 1 : 0);
