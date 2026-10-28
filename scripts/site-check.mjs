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
//   - a large headline or pull quote wraps onto two or more lines while 35% or more of its row stays empty beside it
//     (a narrow max-width on a wide screen: the space looks wasted, and a balanced two-liner should be one line or sit
//     beside its standfirst);
//   - a grid laid out for several cards holds just one, which then stands in a third of the row;
//   - text is set in a bare system serif (Georgia, Times) instead of the site's fonts, or in a web font that never loaded;
//   - Share and Listen sit side by side but not level (a caption wrapping under one of them pushes it up);
//   - axe finds a serious or critical accessibility problem (phone and laptop, light and dark).
// Lists, without failing: lesser axe findings, and tap targets under 40px on touch devices.
//
// SITE_CHECK_PAGES=<path>,<path> checks only those pages. SITE_CHECK_SHOTS=<dir> also saves a screenshot of the top of every page on every device, for a look by eye.
// SITE_CHECK_BASE=<url> checks a site served elsewhere (a URL argument wins). SITE_CHECK_CONCURRENCY=<n> sets how many
// device/scheme contexts run at once (default: CPU cores, 2 to 4), Chromium and WebKit side by side; results print in
// the same order as a one-at-a-time run.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = (process.argv[2] || process.env.SITE_CHECK_BASE || "http://localhost:3000").replace(/\/$/, "");
// Browser contexts (one device size in one colour scheme) checked at the same time. Each loads its pages one by one.
const CONCURRENCY = Math.max(1, Math.floor(Number(process.env.SITE_CHECK_CONCURRENCY)) || Math.min(4, Math.max(2, os.availableParallelism())));
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

/** Measured in the page: cropped covers, clipped text, wasted width, lone cards, stray fonts, uneven tools and small tap
 * targets. */
function inspect({ touch, wide }) {
  const out = { cropped: [], clipped: [], wrapped: [], wasted: [], lone: [], fonts: [], uneven: [], small: [] };
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

  // Text lines of an element, for line counts and the width the text really uses. A text box starts a new line when its
  // top is more than half a line below the current line's top.
  const textLines = (el) => {
    const boxes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
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
    return { lines, left: Math.min(...boxes.map((r) => r.left)), right: Math.max(...boxes.map((r) => r.right)) };
  };

  // Fonts: every line of text is in one of the site's own faces (or the system sans the site asks for). Georgia or
  // Times means a rule asked for a serif the site doesn't serve; a web font that never loaded falls back the same way.
  const faces = new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family.replace(/"/g, "")}|${f.style}`));
  const webFonts = new Set([...document.fonts].map((f) => f.family.replace(/"/g, "")));
  const badFonts = new Map();
  for (const el of textEls) {
    const s = getComputedStyle(el);
    const first = s.fontFamily.split(",")[0].replace(/["']/g, "").trim();
    let why = "";
    if (/^(georgia|times new roman|times|serif)$/i.test(first)) why = `${first} (a system serif)`;
    else if (webFonts.has(first) && !faces.has(`${first}|${s.fontStyle === "normal" ? "normal" : "italic"}`)) why = `${first} ${s.fontStyle}, which never loaded`;
    if (why && !badFonts.has(why)) badFonts.set(why, label(el));
  }
  for (const [why, where] of badFonts) out.fonts.push(`${why}, e.g. ${where}`);

  // Wasted width (screens from 1024px): a headline or pull quote (22px and up) that wraps although 35% or more of the
  // column it sits in is empty beside it. The column is the nearest box clearly wider than the text; the band to the
  // right of the text counts as empty when no other text, image or control overlaps it.
  if (wide) {
    for (const el of document.querySelectorAll("h1, h2, h3, p, blockquote, li")) {
      if (!visible(el) || parseFloat(getComputedStyle(el).fontSize) < 22 || el.querySelector("h1, h2, h3, p, li")) continue;
      const t = textLines(el);
      if (t.lines < 2) continue;
      // The column is the nearest box clearly wider than the text that isn't itself held narrow inside its parent: a
      // max-width block pinned to the left (a section head capped at 62ch) is measured against the column it sits in,
      // while a centred page wrap (max-width with equal margins) is the column.
      const pinned = (a) => {
        if (getComputedStyle(a).maxWidth === "none" || !a.parentElement) return false;
        const r = a.getBoundingClientRect();
        const P = a.parentElement.getBoundingClientRect();
        return P.right - r.right - (r.left - P.left) > 40;
      };
      let col = el.parentElement;
      while (col && col !== document.body && (col.getBoundingClientRect().width < t.right - t.left + 40 || pinned(col))) col = col.parentElement;
      if (!col) continue;
      const cs = getComputedStyle(col);
      const C = col.getBoundingClientRect();
      const cLeft = C.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth);
      const cRight = C.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
      const width = cRight - cLeft;
      const free = cRight - t.right;
      if (width < 560 || free < 0.35 * width) continue;
      const E = el.getBoundingClientRect();
      const band = { left: t.right + 16, right: cRight, top: E.top, bottom: E.bottom };
      const used = [...col.querySelectorAll("*")].some((o) => {
        if (o.contains(el) || el.contains(o) || !visible(o)) return false;
        const r = o.getBoundingClientRect();
        if (r.right <= band.left || r.left >= band.right || r.bottom <= band.top || r.top >= band.bottom) return false;
        return /^(IMG|SVG|VIDEO|CANVAS|IFRAME|INPUT|BUTTON|SELECT|PICTURE)$/i.test(o.tagName) || [...o.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      });
      // A picture beside the text fills the band too, decorative art included (it may sit outside the column, as the
      // AI Stress Index's hero illustration does).
      const art = [...document.querySelectorAll("img, picture, video, canvas")].some((o) => {
        const r = o.getBoundingClientRect();
        return r.width > 40 && getComputedStyle(o).visibility !== "hidden" && !(r.right <= band.left || r.left >= band.right || r.bottom <= band.top || r.top >= band.bottom);
      });
      if (!used && !art) out.wasted.push(`${label(el)} wraps onto ${t.lines} lines with ${Math.round((free / width) * 100)}% of its ${Math.round(width)}px row empty`);
    }

    // A grid laid out for several columns holding a single card.
    for (const el of document.querySelectorAll("*")) {
      const s = getComputedStyle(el);
      if (s.display !== "grid" || !visible(el)) continue;
      const kids = [...el.children].filter(visible);
      const tracks = s.gridTemplateColumns.split(" ").filter((x) => parseFloat(x) > 0).length;
      if (kids.length !== 1 || tracks < 2 || el.getBoundingClientRect().width < 600) continue;
      const k = kids[0].getBoundingClientRect();
      if (k.width < 0.55 * el.getBoundingClientRect().width) out.lone.push(`${label(el).split(" ")[0]} has one item in ${tracks} columns (${label(kids[0])})`);
    }
  }

  // Share and Listen side by side must be level.
  for (const share of document.querySelectorAll(".ev-share-one")) {
    const tools = share.closest(".ev-tools, .sp-tools, .st-tools");
    const listen = tools?.querySelector(".ev-listen button");
    if (!listen || !visible(share) || !visible(listen)) continue;
    const a = share.getBoundingClientRect();
    const b = listen.getBoundingClientRect();
    if (a.bottom <= b.top || b.bottom <= a.top) continue; // on different rows (a phone stacking them) is fine
    const off = Math.abs(a.top + a.height / 2 - (b.top + b.height / 2));
    if (off > 3) out.uneven.push(`Share and Listen are ${Math.round(off)}px out of line`);
  }

  // Short labels on buttons and navigation must stay on one line ("Special / Reports" stacked in the header is a
  // layout that ran out of room).
  for (const el of document.querySelectorAll(".site-header a, .site-header button, a.chip, button.chip, .ev-share a, .ev-share button, .hdr-sub, .ab-btn, .sp-go, .ev-sx-cta, .ev-sp-cta, .ev-listen button")) {
    const text = (el.textContent || "").trim();
    if (!visible(el) || !text || text.split(/\s+/).length > 4) continue;
    // Lines of text only (an icon beside the label is not a second line); a smaller count beside a label ("AI 101")
    // is on the same line.
    if (textLines(el).lines > 1) out.wrapped.push(label(el));
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

/** Loads every page in one browser context (one device size in one colour scheme) and returns what it found. Contexts
 * run side by side, so each keeps its own results; they are merged in device and page order afterwards. */
async function checkContext(browser, engineName, device, scheme, axe) {
  const out = { failures: [], notes: [], small: [], loads: 0 };
  const { name, axe: runAxe, width, height, ...opts } = device;
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, deviceScaleFactor: 1, ...opts });
  if (engineName === "WebKit") {
    // The CSP's upgrade-insecure-requests sends WebKit to https://localhost for every stylesheet, script and
    // image (Chromium exempts localhost), so pages would be checked unstyled. On the live https site it does
    // nothing, so drop just that directive from page responses here; the rest of the policy still applies.
    await context.route("**/*", async (route) => {
      if (route.request().resourceType() !== "document") return route.continue();
      const res = await route.fetch();
      const headers = res.headers();
      if (headers["content-security-policy"]) headers["content-security-policy"] = headers["content-security-policy"].replace(/;\s*upgrade-insecure-requests/, "");
      await route.fulfill({ response: res, headers });
    });
  }
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const p of PAGES) {
    const where = `${p} (${engineName === "Chromium" ? "" : engineName + " "}${name}, ${scheme})`;
    // Leave the previous page first: WebKit reports a background prefetch cut off by the navigation as a script
    // error ("…?_rsc=… due to access control checks"), which would otherwise be blamed on this page.
    await page.goto("about:blank").catch(() => {});
    errors.length = 0;
    // networkidle, not load: the archive filter (/daily/?theme=…) fetches its stories after the load event, and they
    // must be on the page when it is measured (with load, ~100 of its links were never checked).
    const res = await page.goto(base + p, { waitUntil: "networkidle" }).catch((e) => ({ status: () => e.message }));
    out.loads += 1;
    if (res?.status() !== 200) {
      out.failures.push(`${where}: loaded with ${res?.status()}`);
      continue;
    }
    // The site's stylesheet sets the body margin to 0; the browser default is 8px. A page without its CSS would
    // otherwise show up as dozens of layout failures.
    if ((await page.evaluate(() => getComputedStyle(document.body).marginLeft)) !== "0px") {
      out.failures.push(`${where}: rendered without the site's stylesheet`);
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
    if (wide > 1) out.failures.push(`${where}: scrolls sideways by ${wide}px${culprits.length ? `; past the edge: ${culprits.join("; ")}` : ""}`);
    for (const e of errors) out.failures.push(`${where}: script error: ${e}`);
    // Measure with the page's own fonts in place (a face still loading would read as a fallback).
    await page.evaluate(() => document.fonts.ready);
    const found = await page.evaluate(inspect, { touch: Boolean(opts.hasTouch), wide: width >= 1024 });
    for (const c of found.cropped) out.failures.push(`${where}: cover image cropped: ${c}`);
    for (const c of [...new Set(found.clipped)].slice(0, 5)) out.failures.push(`${where}: text clipped: ${c}`);
    if (found.wrapped.length) out.failures.push(`${where}: label wraps onto two lines: ${found.wrapped.slice(0, 5).join("; ")}`);
    for (const w of found.wasted.slice(0, 3)) out.failures.push(`${where}: wasted width: ${w}`);
    for (const l of found.lone.slice(0, 3)) out.failures.push(`${where}: lone card: ${l}`);
    for (const f of found.fonts.slice(0, 3)) out.failures.push(`${where}: wrong font: ${f}`);
    for (const u of found.uneven) out.failures.push(`${where}: ${u}`);
    if (found.small.length) out.small.push([`${p} · ${engineName === "Chromium" ? "" : engineName + " "}${name}`, found.small]);
    if (shots && scheme === "light") {
      const file = `${p.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home"}--${engineName.toLowerCase()}-${name.replace(/\s+/g, "-")}.png`;
      await page.screenshot({ path: path.join(shots, file) });
    }
    // Accessibility: on a phone and a laptop, light and dark (colour contrast differs by theme).
    if (axe && runAxe) {
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      for (const v of violations) {
        const line = `${v.id}: ${v.help} (${v.nodes.length}×, e.g. ${v.nodes[0]?.target.join(" ")})`;
        if (v.impact === "serious" || v.impact === "critical") out.failures.push(`${where}: ${line}`);
        else out.notes.push([`${p} ${scheme}: ${v.id}`, `${where}: ${line}`]);
      }
    }
  }
  await context.close();
  return out;
}

async function launch(engine, engineName) {
  try {
    return await (engineName === "Chromium" && process.env.CHROMIUM_PATH ? engine.launch({ executablePath: process.env.CHROMIUM_PATH }) : engine.launch());
  } catch (e) {
    if (engineName === "Chromium") throw e;
    console.log(`ℹ ${engineName} isn't installed here, so Safari's engine was not checked (npx playwright install ${engineName.toLowerCase()}).`);
    return null;
  }
}

const started = Date.now();
// Chromium and WebKit are separate browsers, launched together; their contexts share one pool of workers.
const [chromiumBrowser, webkitBrowser] = await Promise.all([launch(chromium, "Chromium"), launch(webkit, "WebKit")]);
// Every context in report order: Chromium's devices (light, then dark where configured), then WebKit's.
const tasks = [];
for (const device of DEVICES) for (const scheme of DARK.includes(device.name) ? ["light", "dark"] : ["light"]) tasks.push({ browser: chromiumBrowser, engineName: "Chromium", device, scheme, axe: true });
if (webkitBrowser) for (const device of DEVICES.filter((d) => WEBKIT.includes(d.name))) tasks.push({ browser: webkitBrowser, engineName: "WebKit", device, scheme: "light", axe: false });
// The slowest contexts (WebKit, then Chromium with axe) start first, so the workers finish at about the same time.
const cost = (t) => (t.engineName === "WebKit" ? 2 : t.axe && t.device.axe ? 1 : 0);
const queue = tasks.map((t, i) => i).sort((a, b) => cost(tasks[b]) - cost(tasks[a]) || a - b);
const results = new Array(tasks.length);
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, async () => {
    for (let i = queue.shift(); i !== undefined; i = queue.shift()) {
      const t = tasks[i];
      results[i] = await checkContext(t.browser, t.engineName, t.device, t.scheme, t.axe);
    }
  })
);
await Promise.all([chromiumBrowser.close(), webkitBrowser?.close()]);

// Merge in report order, exactly as a one-context-at-a-time run would have filled these.
const failures = [];
const notes = new Map();
const smallTargets = new Map();
let loads = 0;
for (const r of results) {
  failures.push(...r.failures);
  for (const [k, v] of r.notes) notes.set(k, v);
  for (const [k, v] of r.small) smallTargets.set(k, v);
  loads += r.loads;
}

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
