// Browser check of the built site: every page type on every kind of device readers use.
//
//   npm run build && npx next start -p 3000 &   then   npm run site-check [-- <base url>]
//
// Devices (DEVICES below): small Android phone, iPhone, large phone, tablet portrait and landscape, a laptop at
// Windows' 150% scaling, a common laptop and a wide desktop; phones and tablets with touch and a high pixel density.
// Every page is loaded on every device in light mode, and on a phone and a laptop in dark mode. Safari's engine
// (WebKit) also runs on an iPhone, a tablet and a laptop whenever it is installed (CI installs it; `npx playwright
// install webkit` locally), with the layout checks only.
//
// Fails (exit 1) when, on any device:
//   - a page doesn't load or throws a script error;
//   - the page scrolls sideways;
//   - a cover or share image (they carry their own headline) is cropped by more than 3%;
//   - text is clipped by the box that holds it (cut off at a card's edge, say), outside scrolling strips and ellipses;
//   - a short button or navigation label wraps onto two lines;
//   - axe finds a serious or critical accessibility problem (phone and laptop, light and dark).
// Lists, without failing: lesser axe findings, and tap targets under 40px on touch devices.
//
// SITE_CHECK_PAGES=<path>,<path> checks only those pages. SITE_CHECK_SHOTS=<dir> also saves a screenshot of the top of every page on every device, for a look by eye.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const shots = process.env.SITE_CHECK_SHOTS;
if (shots) fs.mkdirSync(shots, { recursive: true });
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const slugFor = (d) => {
  const [y, m, day] = d.split("-").map(Number);
  return `${MONTHS[m - 1]}-${day}-${y}`;
};
const editions = JSON.parse(fs.readFileSync(path.join(root, "data", "editions.json"), "utf8")).map((e) => e.date).sort();
const latest = slugFor(editions.at(-1));
const earlier = slugFor(editions.at(-2) ?? editions.at(-1));
const month = `${MONTHS[+editions.at(-1).slice(5, 7) - 1]}-${editions.at(-1).slice(0, 4)}`;
// Every special report served from its own file.
const reports = JSON.parse(fs.readFileSync(path.join(root, "data", "special.json"), "utf8")).filter((r) => r.file).map((r) => `/special/${r.slug}`);

const ALL = ["/", "/daily/", "/daily/?theme=AI", `/daily/${earlier}`, `/daily/${latest}/1`, `/daily/${latest}/cards`, "/topics", "/topics/ai", "/topics/ai/page/2", "/week", `/month/${month}`, `/feedback/${latest}/somewhat`, "/quiz", "/coverage", "/coverage/openai", "/special", ...reports, "/ai-stress-index", "/about", "/standards", "/contact", "/privacy"];
// SITE_CHECK_PAGES=/special,/about checks just those pages (for a quick look while fixing one).
const PAGES = process.env.SITE_CHECK_PAGES ? process.env.SITE_CHECK_PAGES.split(",") : ALL;

const phone = { isMobile: true, hasTouch: true, deviceScaleFactor: 3 };
const tablet = { isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const DEVICES = [
  { name: "small phone 360", width: 360, height: 740, ...phone },
  { name: "iPhone 390", width: 390, height: 844, ...phone, axe: true },
  { name: "large phone 430", width: 430, height: 932, ...phone },
  { name: "tablet 768", width: 768, height: 1024, ...tablet },
  { name: "tablet landscape 1024", width: 1024, height: 768, ...tablet },
  // A 1920px Windows laptop at 150% scaling shows pages 1280px wide.
  { name: "laptop 1280", width: 1280, height: 720, deviceScaleFactor: 1.5, axe: true },
  { name: "laptop 1366", width: 1366, height: 768 },
  { name: "desktop 1920", width: 1920, height: 1080 },
];
const DARK = ["iPhone 390", "laptop 1280"];
const WEBKIT = ["iPhone 390", "tablet 768", "laptop 1280"];

/** Measured in the page: cropped covers, clipped text and small tap targets. */
function inspect({ touch }) {
  const out = { cropped: [], clipped: [], wrapped: [], small: [] };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden" && !el.closest("[hidden], [aria-hidden='true'], dialog:not([open]), .sr-only, .ev-bar:not(.on)");
  };
  const label = (el) =>
    `${el.tagName.toLowerCase()}${typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/)[0] : ""} "${(el.textContent || el.getAttribute("alt") || "").replace(/\s+/g, " ").trim().slice(0, 40)}"`;

  // Covers and share images carry a headline close to their edges: they must show whole.
  for (const img of document.querySelectorAll("img")) {
    if (!visible(img) || !img.naturalWidth) continue;
    const src = img.currentSrc || img.src;
    if (!/-cover\.|\/special\/[^/]+\.(jpe?g|png|webp)|\/research\/[^/]+\.(jpe?g|png|webp)|\/og\//.test(src)) continue;
    const fit = getComputedStyle(img).objectFit;
    if (fit !== "cover" && fit !== "none") continue;
    const r = img.getBoundingClientRect();
    const box = r.width / r.height;
    const nat = img.naturalWidth / img.naturalHeight;
    const crop = 1 - Math.min(box / nat, nat / box);
    if (crop > 0.03) out.cropped.push(`${new URL(src).pathname} shows ${Math.round((1 - crop) * 100)}% of its ${box > nat ? "height" : "width"} (box ${Math.round(r.width)}×${Math.round(r.height)})`);
  }

  // Text cut off by an ancestor that hides overflow (a card's rounded edge, a fixed-height band). Scrolling strips
  // (nav, section bar, tables) and deliberate ellipses are fine.
  const textEls = [...document.querySelectorAll("h1, h2, h3, h4, p, li, dt, dd, a, button, span, b, small, em, strong, label, figcaption")].filter(
    (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1) && visible(el)
  );
  for (const el of textEls) {
    if (getComputedStyle(el).textOverflow === "ellipsis") continue;
    const r = el.getBoundingClientRect();
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (/(auto|scroll)/.test(s.overflowX) || s.textOverflow === "ellipsis") break;
      if (/(hidden|clip)/.test(s.overflowX)) {
        const A = a.getBoundingClientRect();
        const over = Math.max(r.right - A.right, A.left - r.left);
        if (over > 2) out.clipped.push(`${label(el)} runs ${Math.round(over)}px past ${label(a).split(" ")[0]}`);
        break;
      }
    }
  }

  // Short labels on buttons and navigation must stay on one line ("Special / Reports" stacked in the header is a
  // layout that ran out of room).
  for (const el of document.querySelectorAll(".site-header a, .site-header button, a.chip, button.chip, .ev-share a, .ev-share button, .hdr-sub, .ab-btn, .sp-go, .ev-sx-cta, .ev-sp-cta, .ev-listen button")) {
    const text = (el.textContent || "").trim();
    if (!visible(el) || !text || text.split(/\s+/).length > 4) continue;
    // Lines of text only (an icon beside the label is not a second line). A text box starts a new line when its top is
    // more than half a line below the current line's top, so a smaller count beside a label ("AI 101") is one line.
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const boxes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (r.width > 1) boxes.push(r);
    }
    boxes.sort((a, b) => a.top - b.top);
    let lines = 0;
    let top = -Infinity;
    let half = 0;
    for (const r of boxes) {
      if (r.top > top + half) {
        lines += 1;
        top = r.top;
        half = r.height / 2;
      }
    }
    if (lines > 1) out.wrapped.push(label(el));
  }

  // Tap targets on touch screens. Links inside running text are exempt (WCAG 2.5.8 inline exception).
  if (touch) {
    for (const el of document.querySelectorAll("a[href], button, input, select, summary")) {
      if (!visible(el) || el.closest(".skip-link")) continue;
      const parent = el.parentElement;
      const inline = parent && /^(P|LI|SPAN|SMALL|DD|FIGCAPTION|LABEL|H1|H2|H3)$/.test(parent.tagName) && parent.textContent.trim().length > (el.textContent || "").trim().length + 3;
      if (inline || el.classList.contains("gl")) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) out.small.push(`${label(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
  }
  return out;
}

const failures = [];
const notes = new Map();
const smallTargets = new Map();

async function run(engine, engineName, devices, { schemes, axe }) {
  let browser;
  try {
    browser = await (engineName === "Chromium" && process.env.CHROMIUM_PATH ? engine.launch({ executablePath: process.env.CHROMIUM_PATH }) : engine.launch());
  } catch (e) {
    if (engineName === "Chromium") throw e;
    console.log(`ℹ ${engineName} isn't installed here, so Safari's engine was not checked (npx playwright install ${engineName.toLowerCase()}).`);
    return 0;
  }
  let loads = 0;
  for (const device of devices) {
    for (const scheme of schemes(device)) {
      const { name, axe: runAxe, width, height, ...opts } = device;
      const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, deviceScaleFactor: 1, ...opts });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      for (const p of PAGES) {
        const where = `${p} (${engineName === "Chromium" ? "" : engineName + " "}${name}, ${scheme})`;
        errors.length = 0;
        const res = await page.goto(base + p, { waitUntil: "networkidle" }).catch((e) => ({ status: () => e.message }));
        loads += 1;
        if (res?.status() !== 200) {
          failures.push(`${where}: loaded with ${res?.status()}`);
          continue;
        }
        // Let lazy images in the first screen arrive, so covers can be measured.
        await page.evaluate(() =>
          Promise.all([...document.images].filter((i) => !i.complete && i.getBoundingClientRect().top < innerHeight).map((i) => new Promise((ok) => ((i.onload = i.onerror = ok), setTimeout(ok, 3000)))))
        );
        // Name what sticks out: the innermost elements past the right edge, so the fix is obvious from the log.
        const { wide, culprits } = await page.evaluate(() => {
          const wide = document.documentElement.scrollWidth - window.innerWidth;
          if (wide <= 1) return { wide, culprits: [] };
          // Anything inside a scrolling or clipping box (the phone nav row) cannot widen the page.
          const contained = (el) => {
            for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== "visible") return true;
            return false;
          };
          const past = [...document.body.querySelectorAll("*")].filter((el) => el.getBoundingClientRect().right > innerWidth + 1 && !contained(el));
          const inner = past.filter((el) => !past.some((c) => c !== el && el.contains(c)));
          const name = (el) => `${el.tagName.toLowerCase()}${typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).join(".") : ""}`;
          return {
            wide,
            culprits: inner.slice(0, 3).map((el) => {
              const r = el.getBoundingClientRect();
              const path = [];
              for (let a = el; a && a !== document.body && path.length < 4; a = a.parentElement) path.unshift(name(a));
              return `${path.join(" > ")} (x ${Math.round(r.left)}–${Math.round(r.right)}, "${(el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30)}")`;
            }),
          };
        });
        if (wide > 1) failures.push(`${where}: scrolls sideways by ${wide}px${culprits.length ? `; past the edge: ${culprits.join("; ")}` : ""}`);
        for (const e of errors) failures.push(`${where}: script error: ${e}`);
        const found = await page.evaluate(inspect, { touch: Boolean(opts.hasTouch) });
        for (const c of found.cropped) failures.push(`${where}: cover image cropped: ${c}`);
        for (const c of [...new Set(found.clipped)].slice(0, 5)) failures.push(`${where}: text clipped: ${c}`);
        if (found.wrapped.length) failures.push(`${where}: label wraps onto two lines: ${found.wrapped.slice(0, 5).join("; ")}`);
        if (found.small.length) smallTargets.set(`${p} · ${engineName === "Chromium" ? "" : engineName + " "}${name}`, found.small);
        if (shots && scheme === "light") {
          const file = `${p.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home"}--${engineName.toLowerCase()}-${name.replace(/\s+/g, "-")}.png`;
          await page.screenshot({ path: path.join(shots, file) });
        }
        // Accessibility: on a phone and a laptop, light and dark (colour contrast differs by theme).
        if (axe && runAxe) {
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
  return loads;
}

const started = Date.now();
let loads = await run(chromium, "Chromium", DEVICES, { schemes: (d) => (DARK.includes(d.name) ? ["light", "dark"] : ["light"]), axe: true });
loads += await run(webkit, "WebKit", DEVICES.filter((d) => WEBKIT.includes(d.name)), { schemes: () => ["light"], axe: false });

for (const n of notes.values()) console.log(`ℹ ${n}`);
if (smallTargets.size) {
  const total = [...smallTargets.values()].reduce((n, l) => n + l.length, 0);
  console.log(`ℹ Tap targets under 40px on touch screens: ${total} across ${smallTargets.size} page views. Most on:`);
  for (const [k, list] of [...smallTargets].sort((a, b) => b[1].length - a[1].length).slice(0, 5)) console.log(`   ${k}: ${list.length}, e.g. ${list.slice(0, 3).join("; ")}`);
}
for (const f of failures) console.log(`✗ ${f}`);
const secs = Math.round((Date.now() - started) / 1000);
console.log(
  failures.length
    ? `Site check failed: ${failures.length} problem(s) in ${loads} page loads.`
    : `Site check passed: ${PAGES.length} pages on ${DEVICES.length} device sizes (${loads} page loads, light and dark, ${secs}s).`
);
process.exit(failures.length ? 1 : 0);
