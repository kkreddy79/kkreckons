// Builds the edition content used by the site.
//
//   1. Drop a newsletter's HTML into newsletters/YYYY-MM-DD.html
//   2. (Optional) add its artifact link / summary in data/edition-meta.json
//   3. Run `npm run editions`
//
// Each newsletter is turned into structured content (sections, stories, key
// numbers, why it matters, other side, sources, further reading) and written
// to data/content/YYYY-MM-DD.json, so every edition renders in the same
// KKReckons design. Newer newsletters embed this as JSON in a
// <script id="data"> tag; older ones are read from the rendered page.
// Inline story images are saved to public/figs/.

import { chromium } from "playwright";
import sharp from "sharp";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const editionsDir = path.join(root, "newsletters");
const figsDir = path.join(root, "public", "figs");
const contentDir = path.join(root, "data", "content");
const metaPath = path.join(root, "data", "edition-meta.json");
const indexPath = path.join(root, "data", "editions.json");

const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")) : {};
let metaChanged = false;

// The AI Stress Index reading shown on stories linked to it: the last close before the edition's
// date (what a reader could see that morning). Taken once, when an edition first has a linked story,
// and kept in data/edition-meta.json (`stressIndex`), so every rebuild shows the same dated number.
// Readings before the index went live are back-calculated by its model and marked as such.
// Same sources as the index page.
const STRESS_SOURCES = [
  "https://kkreddy79.github.io/ai-implosion/data.json",
  "https://raw.githubusercontent.com/kkreddy79/ai-implosion/main/docs/data.json",
];
const STRESS_LIVE_SINCE = "2026-10-15";
// From this edition on, every edition shows the day's reading, whether or not a story is linked to it.
const STRESS_DAILY_FROM = "2026-10-22";
let stressHistory;
const stressBand = (v) => (v >= 75 ? "Critical" : v >= 50 ? "Severe" : v >= 25 ? "Elevated" : "Normal");
async function stressSnapshot(date) {
  for (const url of stressHistory ? [] : STRESS_SOURCES) {
    try {
      const r = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
      if (r.ok) {
        stressHistory = (await r.json()).history.filter((h) => h.score != null);
        break;
      }
    } catch {}
  }
  const last = stressHistory?.filter((h) => h.date < date).at(-1);
  if (!last) return null;
  return { score: last.score, band: stressBand(last.score), asOf: last.date, ...(last.date < STRESS_LIVE_SINCE ? { backCalculated: true } : {}) };
}
fs.mkdirSync(figsDir, { recursive: true });
fs.mkdirSync(contentDir, { recursive: true });

const files = fs
  .readdirSync(editionsDir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f))
  .sort();

const clean = (s) => (s || "").replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim();

function normalise(html) {
  // Artifact downloads can arrive wrapped in a preview skeleton that holds
  // the real document as a second <!DOCTYPE>. Keep only the inner document.
  const first = html.search(/<!DOCTYPE html>/i);
  const second = first >= 0 ? html.slice(first + 15).search(/<!DOCTYPE html>/i) : -1;
  if (second >= 0) html = html.slice(first + 15 + second);
  if (!/<base\s/i.test(html)) html = html.replace(/<head>/i, '<head><base target="_blank">');
  return html;
}

function saveFig(date, n, dataUrl) {
  const m = /^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(dataUrl || "");
  if (!m) return "";
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const name = `${date}-${n}.${ext}`;
  // Written as received; figVariants() then adds the kkreckons.com credit strip (see creditStrip).
  // A file already credited from this same source is left alone, so rebuilds don't redo it.
  const file = path.join(figsDir, name);
  const raw = Buffer.from(m[2], "base64");
  if (!(fs.existsSync(file) && fileHead(file).includes(`src:${sourceHash(raw)}`))) fs.writeFileSync(file, raw);
  return `/figs/${name}`;
}

// A thin strip under every story graphic, "© KKReckons · share with credit … kkreckons.com", so a
// screenshot shared on WhatsApp or LinkedIn leads back to the site. It sits below the graphic and
// covers nothing. The copyright also goes in the file's EXIF, with a hash of the graphic as received,
// which marks the file as done: rebuilds never add a second strip, and a changed graphic is redone.
const COPYRIGHT = "Copyright KKReckons. Share with credit and a link to kkreckons.com";
const sourceHash = (buf) => createHash("sha1").update(buf).digest("hex").slice(0, 12);
const isCredited = (file) => fileHead(file).includes(COPYRIGHT);
function fileHead(file) {
  // EXIF sits near the start of a JPEG/PNG/WebP; reading the first 64KB is enough to find our tag.
  const fd = fs.openSync(file, "r");
  const buf = Buffer.alloc(65536);
  const n = fs.readSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);
  return buf.subarray(0, n).toString("latin1");
}
async function creditStrip(file) {
  if (isCredited(file)) return false;
  const src = fs.readFileSync(file);
  const hash = sourceHash(src);
  const { width, height } = await sharp(src).metadata();
  const h = Math.max(30, Math.round(width * 0.04));
  const size = Math.round(h * 0.42);
  const pad = Math.round(width * 0.045);
  // Match the graphic's own bottom edge, so the strip reads as part of it.
  const px = await sharp(src).extract({ left: 0, top: height - 3, width, height: 3 }).removeAlpha().raw().toBuffer();
  const sum = [0, 0, 0];
  for (let i = 0; i < px.length; i += 3) for (let c = 0; c < 3; c++) sum[c] += px[i + c];
  const [r, g, b] = sum.map((v) => Math.round(v / (px.length / 3)));
  const bg = { r, g, b };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${h}">
<line x1="${pad}" y1="0.5" x2="${width - pad}" y2="0.5" stroke="#24123f" stroke-opacity="0.15"/>
<text x="${pad}" y="${Math.round(h * 0.63)}" font-family="Inter, DejaVu Sans, Arial, sans-serif" font-size="${size}" fill="#5b5566">© KKReckons · share with credit</text>
<text x="${width - pad}" y="${Math.round(h * 0.63)}" text-anchor="end" font-family="Inter, DejaVu Sans, Arial, sans-serif" font-weight="800" font-size="${Math.round(size * 1.12)}" fill="#a8430f">kkreckons.com</text>
</svg>`;
  const out = sharp({ create: { width, height: height + h, channels: 3, background: bg } })
    .composite([{ input: src, top: 0, left: 0 }, { input: Buffer.from(svg), top: height, left: 0 }])
    .withExif({ IFD0: { Copyright: COPYRIGHT, Artist: "KKReckons (kkreckons.com)", ImageDescription: `src:${hash}` } });
  const ext = path.extname(file).toLowerCase();
  const buf = await (ext === ".png" ? out.png({ compressionLevel: 9 }) : ext === ".webp" ? out.webp({ quality: 90 }) : out.jpeg({ quality: 88, mozjpeg: true })).toBuffer();
  fs.writeFileSync(file, buf);
  return true;
}

// Lighter copies of each story graphic for the site: WebP at 640px (phones) and at the original width
// (≤1600px), plus 860px for most phones, next to the original, which stays for "View full size" and the email thumbnails.
// Made once and kept, so rebuilds don't rewrite them. The original's size is recorded so pages
// reserve the space before the image loads.
const VARIANTS = [["sm", 640], ["md", 860], ["lg", 1600]];
const variantName = (file, tag) => file.replace(/\.[a-z]+$/, `-${tag}.webp`);
async function figVariants(image) {
  const file = path.join(figsDir, path.basename(image));
  if (!fs.existsSync(file)) return {};
  const fresh = await creditStrip(file);
  const { width, height } = await sharp(file).metadata();
  for (const [tag, max] of VARIANTS) {
    const out = variantName(file, tag);
    if (fresh || !fs.existsSync(out)) await sharp(file).resize({ width: Math.min(max, width), withoutEnlargement: true }).withExif({ IFD0: { Copyright: COPYRIGHT } }).webp({ quality: 72, effort: 6 }).toFile(out);
  }
  return { imageW: width, imageH: height };
}

/** `pay` may be a boolean or a word such as "paid", "free", "yes" or "no". */
function paid(v) {
  return typeof v === "string" ? /^(paid|yes|true|paywall(ed)?|subscription)$/i.test(v.trim()) : Boolean(v);
}

/** Content from the JSON a newsletter embeds in <script id="data">. */
function fromEmbedded(date, d) {
  let n = 0;
  const story = (s) => {
    n += 1;
    return {
      category: clean(s.cat),
      tag: clean(s.tag),
      title: clean(s.title),
      url: s.url || "",
      url2: s.url2 || "",
      points: (s.pts || []).map(clean).filter(Boolean),
      numbers: (s.nums || []).map(([v, l]) => [clean(v), clean(l)]),
      why: clean(s.why),
      other: clean(s.flip),
      also: (s.also || []).map((a) => ({ title: clean(a.t), url: a.u })),
      image: s.fig ? saveFig(date, n, s.fig) : "",
      imageAlt: clean(s.figalt),
      // Optional editorial overrides; when absent the site works these out from the link.
      ...(s.fig && clean(s.figcredit) ? { imageCredit: clean(s.figcredit) } : {}),
      ...(clean(s.src) ? { src: clean(s.src) } : {}),
      ...(s.pay !== undefined && s.pay !== null && s.pay !== "" ? { pay: paid(s.pay) } : {}),
      ...(Array.isArray(s.themes) && s.themes.length ? { themes: s.themes.map(clean).filter(Boolean) } : {}),
      // Short copy for the subscriber email (scripts/beehiiv-email.mjs).
      ...(clean(s.ehead) ? { emailHead: clean(s.ehead) } : {}),
      ...(clean(s.eteaser) ? { emailTeaser: clean(s.eteaser) } : {}),
      // Editorial choice: link this story to the AI Stress Index (site card + email line).
      ...(s.stressindex === true || /^(yes|true)$/i.test(String(s.stressindex ?? "")) ? { stressIndex: true } : {}),
    };
  };
  const sections = [
    ["Pick of the day", [...(d.featured || []), ...(d.pick || [])]],
    ["India edition", d.india || []],
    ["World edition", d.world || []],
  ]
    .filter(([, list]) => list.length)
    .map(([name, list]) => ({ name, stories: list.map(story) }));
  return {
    slice: clean(d.slice),
    callouts: (d.callout || []).map((c) => ({ num: clean(c.num), text: clean(`${c.lead || ""}${c.rest || ""}`), url: c.url || "" })),
    sections,
    reading: (d.reading || []).map((r) => ({ title: clean(r.title), url: r.url || "", note: clean(r.note || r.src || "") })),
    ...(d.takeaway && clean(d.takeaway.line)
      ? { takeaway: { a: clean(d.takeaway.a), b: clean(d.takeaway.b), line: clean(d.takeaway.line) } }
      : {}),
  };
}

/** Content read from the rendered page, for newsletters without embedded JSON. */
async function fromPage(page) {
  return page.evaluate(() => {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const txt = (el) => clean(el?.innerText || el?.textContent || "");
    const labelRe = /^[^A-Za-z]*(pick of the day|india edition|world edition)$/i;

    // "Daily Briefing" format: <section class="story"> / cards with a .kicker.
    const kickers = [...document.querySelectorAll(".kicker")];
    if (kickers.length) {
      const stories = kickers.map((k) => {
        let card = k.parentElement;
        while (card && !card.querySelector("h2")) card = card.parentElement;
        const cat = clean(k.querySelector(".cat")?.textContent);
        const h3s = [...card.querySelectorAll("h3")];
        const after = (re) => {
          const h = h3s.find((x) => re.test(x.textContent));
          let el = h?.nextElementSibling;
          while (el && el.tagName !== "P") el = el.nextElementSibling;
          return txt(el);
        };
        const why = txt(card.querySelector(".why p"));
        const watch = after(/what to watch/i);
        const src = card.querySelector("a.src, a[href^='http']");
        return {
          category: cat,
          tag: "",
          title: txt(card.querySelector("h2")),
          url: src?.href || "",
          url2: "",
          points: [after(/what happened/i)].filter(Boolean),
          numbers: [...card.querySelectorAll(".nums .n")].map((n) => [txt(n.querySelector("b")), txt(n.querySelector("small"))]),
          why,
          other: watch ? `What to watch: ${watch}` : "",
          also: [],
          image: "",
          imageAlt: "",
        };
      });
      const reading = [...document.querySelectorAll("a.item")].map((a) => ({
        title: txt(a.querySelector(".t")),
        url: a.href,
        note: txt(a.querySelector(".s")),
      }));
      return { slice: "", callouts: [], sections: [{ name: "Top stories", stories }], reading };
    }

    // Card format with India / World edition labels.
    const isLabel = (e) => {
      const t = clean(e.textContent);
      return t.length < 40 && labelRe.test(t) && ![...e.children].some((c) => labelRe.test(clean(c.textContent)));
    };
    const nodes = [...document.querySelectorAll("body *")].filter((e) => e.tagName === "ARTICLE" || isLabel(e));
    const sections = [];
    let current = null;
    for (const n of nodes) {
      if (n.tagName !== "ARTICLE") {
        const m = clean(n.textContent).match(labelRe)[1].toLowerCase();
        current = { name: m[0].toUpperCase() + m.slice(1), stories: [] };
        sections.push(current);
        continue;
      }
      if (!current) sections.push((current = { name: "Top stories", stories: [] }));
      const tagEl = n.querySelector(".tag");
      const catEl = n.querySelector(".cat");
      let cat = txt(catEl);
      const tag = txt(tagEl);
      if (tag && cat.endsWith(tag)) cat = cat.slice(0, -tag.length).trim();
      const strip = (el) => txt(el).replace(/^(why it matters|other side)\s*:\s*/i, "");
      const a = n.querySelector("h3 a") || n.querySelector("a[href^='http']");
      current.stories.push({
        category: cat,
        tag,
        title: txt(n.querySelector("h3")),
        url: a?.href || "",
        url2: "",
        points: [...n.querySelectorAll("ul li")].map(txt).filter(Boolean),
        numbers: [...n.querySelectorAll(".nums > div")].map((d) => [txt(d.querySelector("b")), txt(d.querySelector("span, small"))]),
        why: strip(n.querySelector(".why")),
        other: strip(n.querySelector(".flip")),
        also: [],
        image: "",
        imageAlt: "",
      });
    }
    const sliceHead = [...document.querySelectorAll("h4, b, strong")].find((e) => /today[’']s slice/i.test(e.textContent));
    let slice = "";
    if (sliceHead) {
      let el = sliceHead.nextElementSibling || sliceHead.parentElement.nextElementSibling;
      slice = txt(el);
    }
    const callouts = [];
    const firstCard = document.querySelector("article");
    for (const b of document.querySelectorAll("b")) {
      if (firstCard && b.compareDocumentPosition(firstCard) & Node.DOCUMENT_POSITION_PRECEDING) continue;
      const strong = b.nextElementSibling;
      if (strong && strong.tagName === "STRONG") {
        const p = strong.parentElement.querySelector("p") || strong.parentElement.nextElementSibling;
        callouts.push({ num: txt(b), text: clean(`${txt(strong)} ${txt(p)}`), url: "" });
      }
    }
    return { slice, callouts, sections, reading: [] };
  });
}

let browser = null;
const index = [];

for (const file of files) {
  const date = file.replace(".html", "");
  const full = path.join(editionsDir, file);
  const html = normalise(fs.readFileSync(full, "utf8"));
  fs.writeFileSync(full, html);

  let content;
  const embedded = /<script[^>]*id=["']?data["']?[^>]*>([\s\S]*?)<\/script>/i.exec(html);
  if (embedded) {
    content = fromEmbedded(date, JSON.parse(embedded[1]));
  } else {
    browser ??= await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
    await page.goto(pathToFileURL(full).href, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    content = await fromPage(page);
    await page.close();
  }

  const m = meta[date] || {};
  if (m.slice) content.slice = m.slice;
  // Per-story fixes (missing source links, fuller summaries), keyed by story title.
  // `{ "remove": "<reason>" }` drops a story (for example a repeat of an article used before).
  for (const sec of content.sections) {
    for (const s of sec.stories) if (m.stories?.[s.title]) Object.assign(s, m.stories[s.title]);
    sec.stories = sec.stories.filter((s) => !s.remove);
  }
  content.sections = content.sections.filter((sec) => sec.stories.length);
  // Further-reading fixes (a real title for a bare "Video (YouTube)" link), keyed by URL.
  for (const r of content.reading) if (m.reading?.[r.url]) Object.assign(r, m.reading[r.url]);
  const stories = content.sections.flatMap((s) => s.stories);
  for (const s of stories) if (s.image) Object.assign(s, await figVariants(s.image));
  const showStress = stories.some((s) => s.stressIndex) || date >= STRESS_DAILY_FROM;
  if (showStress && !m.stressIndex) {
    const snap = await stressSnapshot(date);
    if (snap) {
      meta[date] = { ...meta[date], stressIndex: snap };
      metaChanged = true;
      console.log(`${date}: AI Stress Index reading saved (${snap.score}/100, ${snap.band}, as of ${snap.asOf}${snap.backCalculated ? ", back-calculated" : ""})`);
    } else console.log(`${date}: AI Stress Index data unreachable; the edition shows the link without a number`);
  }
  const stress = meta[date]?.stressIndex;
  const words = JSON.stringify(stories).split(/\s+/).length;
  const record = {
    date,
    slice: content.slice,
    artifact: m.artifact || "",
    readingMinutes: Math.max(3, Math.round(words / 200)),
    callouts: content.callouts,
    sections: content.sections,
    reading: content.reading,
    ...(content.takeaway ? { takeaway: content.takeaway } : {}),
    ...(stress && showStress ? { stressIndex: stress } : {}),
  };
  fs.writeFileSync(path.join(contentDir, `${date}.json`), JSON.stringify(record, null, 2) + "\n");

  index.push({
    date,
    slice: record.slice,
    artifact: record.artifact,
    readingMinutes: record.readingMinutes,
    image: stories.find((s) => s.image)?.image || "",
    stories: content.sections.flatMap((sec) =>
      sec.stories.map((s) => ({
        section: sec.name,
        title: s.title,
        category: s.category,
        tag: s.tag,
        url: s.url,
        ...(s.src ? { src: s.src } : {}),
        ...(s.pay !== undefined ? { pay: s.pay } : {}),
        ...(s.themes ? { themes: s.themes } : {}),
      }))
    ),
  });
  console.log(`${date}: ${stories.length} stories in ${content.sections.length} sections${embedded ? "" : " (from page)"}`);
}

await browser?.close();
if (metaChanged) fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
index.sort((a, b) => (a.date < b.date ? 1 : -1));
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n");

// Delete images no edition uses (for example one hidden with an edition-meta override), so a
// removed image is never left reachable on the site.
const usedFigs = new Set(
  fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => JSON.parse(fs.readFileSync(path.join(contentDir, f), "utf8")).sections)
    .flatMap((sec) => sec.stories.flatMap((s) => (s.image ? [s.image, ...VARIANTS.map(([tag]) => variantName(s.image, tag))].map((f) => path.basename(f)) : [])))
);
for (const f of fs.readdirSync(figsDir)) {
  if (!usedFigs.has(f)) {
    fs.unlinkSync(path.join(figsDir, f));
    console.log(`Removed unused image public/figs/${f}`);
  }
}
console.log(`Wrote ${index.length} editions`);
