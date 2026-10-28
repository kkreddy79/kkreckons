// Playwright measurement script for the KKReckons local production build (http://localhost:3100).
// Writes JSON results to $OUT/pw.json and screenshots to $SHOTS.
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import fs from "node:fs";

const BASE = "http://localhost:3100";
const OUT = process.env.OUT;
const SHOTS = process.env.SHOTS;
const EDITION = "/daily/october-28-2026";
const STORY = "/daily/october-28-2026/1";
const KEY = ["/", EDITION, STORY, "/daily", "/about"];
const OTHER = ["/topics", "/topics/ai", "/ai-stress-index", "/week", "/quiz", "/coverage", "/standards", "/privacy", "/contact", "/research/ai-bubble-october-2026"];
const results = { pages: (process.env.RESUME && fs.existsSync(`${process.env.OUT}/pw.json`)) ? JSON.parse(fs.readFileSync(`${process.env.OUT}/pw.json`, "utf8")).pages : {}, meta: { base: BASE, note: "All timings are local (next start on localhost); not representative of real users." } };

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome" });

// ---------- in-page helpers (serialised into page.evaluate) ----------
const helpers = `
  var parseColor = (s) => { const m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(",").map((x) => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  var hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  var lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  var ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05))).toFixed(2); };
  var blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  // Walk up to the first ancestor with an opaque background-color; note any background-image on the way.
  var effectiveBg = (el) => { let n = el; const notes = []; let acc = null; while (n && n !== document.documentElement.parentNode) { const cs = getComputedStyle(n); if (cs.backgroundImage && cs.backgroundImage !== "none") notes.push((n.className && typeof n.className === "string" ? "." + n.className.split(" ")[0] : n.tagName.toLowerCase()) + ": " + cs.backgroundImage.slice(0, 80)); const c = parseColor(cs.backgroundColor); if (c && c.a > 0) { if (c.a >= 1) { const bg = acc ? blend(acc, c) : c; return { color: bg, notes, from: n.className && typeof n.className === "string" ? "." + n.className.split(" ")[0] : n.tagName.toLowerCase() }; } acc = acc ? blend(acc, c) : c; } n = n.parentElement; } const base = { r: 255, g: 255, b: 255, a: 1 }; return { color: acc ? blend(acc, base) : base, notes, from: "fallback-white" }; };
  var isVisible = (el) => { const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return false; const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; if (el.closest(".sr-only")) return false; return true; };
  var desc = (el) => { const cls = typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\\s+/).join(".") : ""; return el.tagName.toLowerCase() + cls + (el.id ? "#" + el.id : ""); };
  var text = (el) => (el.innerText || el.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 70);
  var contrastOf = (el, forcedBg) => { const cs = getComputedStyle(el); const fgRaw = parseColor(cs.color); const bgInfo = forcedBg ? { color: forcedBg, notes: [], from: "forced" } : effectiveBg(el); const fg = fgRaw.a < 1 ? blend(fgRaw, bgInfo.color) : fgRaw; const size = parseFloat(cs.fontSize); const weight = parseInt(cs.fontWeight, 10) || 400; const large = size >= 24 || (size >= 18.66 && weight >= 700); const r = ratio(fg, bgInfo.color); return { selector: desc(el), text: text(el), fg: hex(fg), fgRaw: cs.color, bg: hex(bgInfo.color), bgFrom: bgInfo.from, gradients: bgInfo.notes, ratio: r, fontSize: size, fontWeight: weight, large, aa: bgInfo.notes.length ? "gradient (see gradientCards)" : r >= (large ? 3 : 4.5) ? "pass" : "FAIL", aaa: r >= (large ? 4.5 : 7) ? "pass" : "fail" }; };
`;

function fmtBytes(n) { return +(n / 1024).toFixed(1); }

async function newPage(ctx, width, scheme) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width, height: width < 800 ? 844 : 900 });
  return page;
}

async function loadWithResources(page, url, opts = {}) {
  const resources = [];
  const consoleMsgs = [];
  const pageErrors = [];
  const failed = [];
  const onResp = async (resp) => {
    const req = resp.request();
    let bodyBytes = null;
    try { if (resp.status() < 300 || resp.status() >= 400) { const b = await resp.body(); bodyBytes = b.length; } } catch (e) { bodyBytes = null; }
    const cl = resp.headers()["content-length"];
    resources.push({ url: resp.url(), type: req.resourceType(), status: resp.status(), contentLength: cl ? +cl : null, bodyBytes, encoding: resp.headers()["content-encoding"] ?? null, contentType: resp.headers()["content-type"] ?? null, cacheControl: resp.headers()["cache-control"] ?? null });
  };
  page.on("response", onResp);
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) consoleMsgs.push({ type: m.type(), text: m.text().slice(0, 300) }); });
  page.on("pageerror", (e) => pageErrors.push(String(e.message).slice(0, 300)));
  page.on("requestfailed", (r) => failed.push({ url: r.url(), type: r.resourceType(), error: r.failure()?.errorText }));
  const t0 = Date.now();
  await page.goto(BASE + url, { waitUntil: "load", timeout: 60000 });
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(opts.settle ?? 1500);
  const nav = await page.evaluate(() => { const e = performance.getEntriesByType("navigation")[0]; return e ? { loadEventEnd: Math.round(e.loadEventEnd), domContentLoaded: Math.round(e.domContentLoadedEventEnd), responseEnd: Math.round(e.responseEnd), transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, decodedBodySize: e.decodedBodySize } : null; });
  const resEntries = await page.evaluate(() => performance.getEntriesByType("resource").map((e) => ({ name: e.name, transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, decodedBodySize: e.decodedBodySize, initiatorType: e.initiatorType })));
  return { resources, consoleMsgs, pageErrors, failed, loadMs, nav, resEntries };
}

function summariseResources(resources, resEntries) {
  const byType = {};
  let total = 0;
  const entryMap = new Map(resEntries.map((e) => [e.name, e]));
  for (const r of resources) {
    const pe = entryMap.get(r.url);
    const bytes = pe && pe.encodedBodySize ? pe.encodedBodySize : (r.contentLength ?? r.bodyBytes ?? 0);
    r.wireBytes = bytes;
    byType[r.type] = byType[r.type] || { count: 0, bytes: 0 };
    byType[r.type].count++;
    byType[r.type].bytes += bytes;
    total += bytes;
  }
  const heaviest = [...resources].sort((a, b) => (b.wireBytes || 0) - (a.wireBytes || 0)).slice(0, 5).map((r) => ({ url: r.url.replace(BASE, ""), type: r.type, wireKB: fmtBytes(r.wireBytes || 0), decodedKB: r.bodyBytes != null ? fmtBytes(r.bodyBytes) : null, encoding: r.encoding, cacheControl: r.cacheControl }));
  return { requestCount: resources.length, totalWireKB: fmtBytes(total), byType: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, { count: v.count, KB: fmtBytes(v.bytes) }])), heaviest, external: resources.filter((r) => !r.url.startsWith(BASE)).map((r) => ({ url: r.url, type: r.type, status: r.status })) };
}

async function domFacts(page, width) {
  return page.evaluate(({ helpersSrc, width }) => {
    eval(helpersSrc);
    const imgs = [...document.querySelectorAll("img")];
    const imgInfo = imgs.map((im) => { const r = im.getBoundingClientRect(); return { src: (im.currentSrc || im.src).replace(location.origin, ""), alt: im.getAttribute("alt"), hasWidthAttr: im.hasAttribute("width"), hasHeightAttr: im.hasAttribute("height"), widthAttr: im.getAttribute("width"), heightAttr: im.getAttribute("height"), natural: [im.naturalWidth, im.naturalHeight], rendered: [Math.round(r.width), Math.round(r.height)], loading: im.getAttribute("loading"), fetchpriority: im.getAttribute("fetchpriority"), decoding: im.getAttribute("decoding"), sizes: im.getAttribute("sizes"), hasSrcset: im.hasAttribute("srcset"), visible: isVisible(im) }; });
    // Largest element above the fold (approximation of LCP candidate): images and text blocks intersecting the first viewport.
    const vh = window.innerHeight, vw = window.innerWidth;
    let best = null;
    for (const el of document.querySelectorAll("img, svg, video, h1, h2, h3, p, li, a, span, b, div, section")) {
      if (!isVisible(el)) continue;
      const r = el.getBoundingClientRect();
      const ix = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)); const iy = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      const area = ix * iy; if (area <= 0) continue;
      const isImg = ["IMG", "SVG", "VIDEO"].includes(el.tagName);
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
      const cs = getComputedStyle(el); const hasBgImg = cs.backgroundImage && cs.backgroundImage !== "none" && /url\(/.test(cs.backgroundImage);
      if (!isImg && !hasText && !hasBgImg) continue;
      if (!best || area > best.area) best = { area, selector: desc(el), kind: isImg ? "image" : hasBgImg ? "background-image" : "text", text: text(el), rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, src: isImg ? (el.currentSrc || el.src || "").replace(location.origin, "") : undefined };
    }
    // Horizontal overflow: elements whose right edge passes the viewport.
    const overflowers = [];
    for (const el of document.querySelectorAll("body *")) { const r = el.getBoundingClientRect(); if (r.width > 0 && r.right > vw + 1 && !el.closest(".site-header nav, .ev-bar, .mk-list, .tp-nav, .ev-share")) { overflowers.push({ selector: desc(el), right: Math.round(r.right), width: Math.round(r.width) }); if (overflowers.length >= 8) break; } }
    const body = getComputedStyle(document.body);
    const fontOf = (sel) => { const el = document.querySelector(sel); return el ? getComputedStyle(el).fontFamily : null; };
    const sizeOf = (sel) => { const el = document.querySelector(sel); return el ? getComputedStyle(el).fontSize : null; };
    // Smallest visible text.
    let smallest = null; const small = [];
    for (const el of document.querySelectorAll("body *")) {
      if (!isVisible(el)) continue;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (!hasText) continue;
      const s = parseFloat(getComputedStyle(el).fontSize);
      if (s < 12) small.push({ selector: desc(el), fontSize: s, text: text(el) });
      if (!smallest || s < smallest.fontSize) smallest = { selector: desc(el), fontSize: s, text: text(el) };
    }
    // Line length of story text (.ev-points li) and the first long paragraph: column width / average char width.
    const measureCPL = (sel) => { const el = document.querySelector(sel); if (!el) return null; const cs = getComputedStyle(el); const span = document.createElement("span"); span.textContent = "the quick brown fox jumps over the lazy dog and keeps running 0123456789 "; span.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font:" + cs.font; document.body.appendChild(span); const cw = span.getBoundingClientRect().width / span.textContent.length; span.remove(); const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); return { selector: sel, columnPx: Math.round(w), avgCharPx: +cw.toFixed(2), charsPerLine: Math.round(w / cw), fontSize: cs.fontSize, lineHeight: cs.lineHeight, fontFamily: cs.fontFamily }; };
    // Heading order problems.
    const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(isVisible).map((h) => ({ level: +h.tagName[1], text: text(h) }));
    const skips = []; for (let i = 1; i < hs.length; i++) if (hs[i].level > hs[i - 1].level + 1) skips.push({ from: "h" + hs[i - 1].level + " " + hs[i - 1].text.slice(0, 40), to: "h" + hs[i].level + " " + hs[i].text.slice(0, 40) });
    const landmarks = { header: document.querySelectorAll("header, [role=banner]").length, headerTopLevel: [...document.querySelectorAll("header")].filter((h) => !h.closest("article, section, main, aside")).length, nav: document.querySelectorAll("nav, [role=navigation]").length, navLabels: [...document.querySelectorAll("nav")].map((n) => n.getAttribute("aria-label") || n.getAttribute("aria-labelledby") || "(unlabelled)"), main: document.querySelectorAll("main, [role=main]").length, footer: document.querySelectorAll("footer, [role=contentinfo]").length, idMainIsDiv: (document.getElementById("main") || {}).tagName };
    const skip = document.querySelector(".skip-link, a[href='#main']"); const skipR = skip ? skip.getBoundingClientRect() : null;
    const navLinks = [...document.querySelectorAll(".site-header nav a")].map((a) => { const r = a.getBoundingClientRect(); return { text: text(a), href: a.getAttribute("href"), left: Math.round(r.left), right: Math.round(r.right), fullyInViewport: r.left >= 0 && r.right <= vw, visible: isVisible(a) }; });
    const navEl = document.querySelector(".site-header nav"); const navScroll = navEl ? { scrollWidth: navEl.scrollWidth, clientWidth: navEl.clientWidth, overflows: navEl.scrollWidth > navEl.clientWidth + 1, overflowX: getComputedStyle(navEl).overflowX } : null;
    const header = document.querySelector(".site-header"); const hr = header ? header.getBoundingClientRect() : null;
    const emailInputs = [...document.querySelectorAll("input")].map((i) => ({ type: i.type, name: i.name, fontSize: getComputedStyle(i).fontSize, inputmode: i.getAttribute("inputmode"), autocomplete: i.getAttribute("autocomplete"), height: Math.round(i.getBoundingClientRect().height), visible: isVisible(i) }));
    const signupFallback = [...document.querySelectorAll(".ab-join a, .ev-signup a, .ev-signup, .hdr-sub")].slice(0, 6).map((a) => ({ selector: desc(a), text: text(a), href: a.getAttribute && a.getAttribute("href"), target: a.getAttribute && a.getAttribute("target") }));
    return {
      domNodes: document.getElementsByTagName("*").length,
      scrollWidth: document.documentElement.scrollWidth, innerWidth: vw, horizontalScroll: document.documentElement.scrollWidth > vw, overflowers,
      pageHeight: document.documentElement.scrollHeight,
      images: imgInfo, imagesMissingWidthHeight: imgInfo.filter((i) => !(i.hasWidthAttr && i.hasHeightAttr)).map((i) => i.src),
      largestAboveFold: best ? { ...best, area: Math.round(best.area) } : null,
      typography: { bodyFontFamily: body.fontFamily, bodyFontSize: body.fontSize, h1FontFamily: fontOf("h1"), h1FontSize: sizeOf("h1"), navFontFamily: fontOf(".site-header nav a"), navFontSize: sizeOf(".site-header nav a"), storyPointsFontFamily: fontOf(".ev-points li"), storyPointsFontSize: sizeOf(".ev-points li"), storyHeadingFontFamily: fontOf(".ev-story :is(h1,h3)"), storyHeadingFontSize: sizeOf(".ev-story :is(h1,h3)"), wordmarkFontFamily: fontOf(".wordmark"), smallestVisibleText: smallest, under12px: small.slice(0, 15), under12pxCount: small.length, cpl: [measureCPL(".ev-points li"), measureCPL(".prose p"), measureCPL(".ab-lede"), measureCPL(".tl-heads"), measureCPL(".ev-why")].filter(Boolean) },
      headings: hs, headingSkips: skips, landmarks,
      skipLink: skip ? { present: true, text: text(skip), href: skip.getAttribute("href"), offscreenAtRest: skipR.bottom <= 0, rect: { top: Math.round(skipR.top), height: Math.round(skipR.height) } } : { present: false },
      navLinks, navScroll, headerHeight: hr ? Math.round(hr.height) : null, headerPosition: header ? getComputedStyle(header).position : null,
      inputs: emailInputs, signupFallback,
    };
  }, { helpersSrc: helpers, width });
}

async function touchTargets(page) {
  return page.evaluate(({ helpersSrc }) => {
    eval(helpersSrc);
    const groups = { header: ".site-header a, .site-header button", firstStoryCard: ".ev-story a, .ev-story button", shareRow: ".ev-share a, .ev-share button", footer: ".site-footer a, .site-footer button", todayIn30s: ".ev-30s a, .ev-30s button", sectionBar: ".ev-bar a", marketStrip: ".mk a, .mk button", callouts: ".ev-callouts a", archive: ".tl-item a, .seg button, .chip, .src-filter button, .story-results a", about: ".ab-join a, .ab-btn, .ab-btn-ghost" };
    const out = {};
    for (const [name, sel] of Object.entries(groups)) {
      const els = [...document.querySelectorAll(sel)];
      const scope = name === "firstStoryCard" ? (document.querySelector(".ev-story") ? [...document.querySelector(".ev-story").querySelectorAll("a, button")] : []) : els;
      const rows = scope.map((el) => { const r = el.getBoundingClientRect(); const vis = isVisible(el); return { selector: desc(el), text: text(el) || el.getAttribute("aria-label") || "", w: +r.width.toFixed(1), h: +r.height.toFixed(1), visible: vis }; });
      const visible = rows.filter((r) => r.visible);
      out[name] = { count: rows.length, visibleCount: visible.length, hidden: rows.filter((r) => !r.visible).map((r) => r.text || r.selector), under44: visible.filter((r) => r.w < 44 || r.h < 44), all: visible };
    }
    return out;
  }, { helpersSrc: helpers });
}

async function contrast(page) {
  return page.evaluate(({ helpersSrc }) => {
    eval(helpersSrc);
    const targets = [
      ["body story text", ".ev-points li"], ["secondary: key numbers", ".ev-nums dd"], ["secondary: key numbers label", ".ev-nums dt"], ["secondary: figure caption", ".ev-fig figcaption"], ["secondary: also-reported", ".ev-also"], ["secondary: footer fine print", ".site-footer .fine"], ["footer text", ".site-footer > div"], ["footer links", ".foot-links a"],
      ["label: story category", ".ev-cat"], ["label: edition kicker (date)", ".ev-kicker"], ["label: Today in 30 seconds h2", ".ev-30s h2"], ["label: 30s key", ".ev-30s-key"], ["label: section subtitle", ".ev-sec-head p"], ["section 'all' link", ".ev-sec-head a"], ["30s list link", ".ev-30s a"], ["30s number", ".ev-30s-n"],
      ["nav link", ".site-header nav a:not(.on)"], ["nav link (current)", ".site-header nav a.on"], ["header Subscribe button", ".hdr-sub"], ["wordmark", ".wordmark"], ["theme toggle", ".theme-toggle"],
      ["AI Stress Index card: kicker", ".ev-sx-kicker"], ["AI Stress Index card: score", ".ev-sx-read b"], ["AI Stress Index card: /100", ".ev-sx-read span"], ["AI Stress Index card: band pill", ".ev-sx-read em"], ["AI Stress Index card: note", ".ev-sx-note"], ["AI Stress Index card: watch link", ".ev-sx-watch"], ["AI Stress Index card: CTA", ".ev-sx-cta"],
      ["number card 0: big number", ".ev-call-0 b"], ["number card 0: caption", ".ev-call-0 span"], ["number card 1: big number", ".ev-call-1 b"], ["number card 1: caption", ".ev-call-1 span"],
      ["special report banner: tag", ".ev-special-tag"], ["special report banner: title", ".ev-special b"], ["special report banner: text", ".ev-special small"], ["special report banner: go", ".ev-special-go"],
      ["story heading", ".ev-story :is(h1,h3)"], ["why it matters", ".ev-why"], ["other side", ".ev-other"], ["source row", ".ev-src"], ["source link", ".ev-src a"], ["free tag", ".ev-free-tag"], ["further reading small", ".ev-reading small"], ["related small", ".ev-related small"], ["signup small", ".ev-signup small"], ["fix/corrections line", ".ev-fix"], ["ext marker", ".ev-ext"], ["market strip name", ".mk-name"], ["market strip week", ".mk-week"], ["market strip src", ".mk-src"], ["market up", ".mk-up"], ["market down", ".mk-down"], ["share label", ".ev-share-label"], ["share button", ".ev-share a"], ["section bar link", ".ev-bar a"], ["clamp button", ".ev-clamp-btn"], ["eyebrow", ".eyebrow"], ["cat", ".cat"],
      ["archive: hero h1", ".cu-hero h1"], ["archive: lede", ".cu-lede"], ["archive: stats", ".cu-stats li"], ["archive: date", ".tl-date"], ["archive: headlines", ".tl-heads"], ["archive: meta", ".tl-meta"], ["archive: day tile", ".tl-day"], ["archive: seg button", ".seg button"], ["archive: chip", ".chip"], ["archive: search input placeholder", ".sp-panel input"],
      ["about: lede", ".ab-lede"], ["about: way p", ".ab-way p"], ["about: beats p", ".ab-beats p"], ["about: third p", ".ab-third p"], ["about: join text", ".ab-join-text > p:last-child"], ["about: join privacy", ".ab-join-privacy"], ["about: btn", ".ab-btn"], ["about: ghost btn", ".ab-btn-ghost"], ["about: dn body p", ".ab-dn-body p:last-child"],
      ["story page: crumbs", ".crumbs"], ["story page: pager label", ".pg span"], ["story page: pager em", ".pg em"], ["poll", ".ev-poll"], ["poll link", ".ev-poll a"], ["glossary/explainer", ".ev-qs-explainer"],
    ];
    const out = [];
    for (const [label, sel] of targets) {
      const el = [...document.querySelectorAll(sel)].find((e) => isVisible(e) && (e.innerText || "").trim());
      if (!el) { out.push({ label, selector: sel, missing: true }); continue; }
      out.push({ label, ...contrastOf(el) });
    }
    // Gradient cards: compute against each stop from app/globals.css.
    const stops = { ".ev-call-0": { light: "#4b2b78", dark: "#24123f" }, ".ev-call-1": { light: "#b8471d", dark: "#93321a" }, ".ev-sx": { light: "#4b2b78", dark: "#1d0f35" }, ".ev-special": { start: "#1B2747", mid: "#5B3A6E", end: "#B8603F" } };
    const hexToC = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16), a: 1 });
    const grad = [];
    for (const [card, st] of Object.entries(stops)) {
      const cardEl = document.querySelector(card); if (!cardEl) { grad.push({ card, missing: true }); continue; }
      const texts = [...cardEl.querySelectorAll("b, span, small, p, em, strong, a")].filter((e) => isVisible(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
      for (const t of texts.slice(0, 8)) for (const [stopName, h] of Object.entries(st)) { const c = contrastOf(t, hexToC(h)); grad.push({ card, stop: stopName + " " + h, ...c }); }
    }
    return { elements: out, gradientCards: grad };
  }, { helpersSrc: helpers });
}

async function focusCheck(page, shotPath) {
  const seq = [];
  seq.push({ beforeFirstTab: await page.evaluate(() => ({ activeElement: document.activeElement.tagName + (document.activeElement.id ? "#" + document.activeElement.id : "") + " ." + String(document.activeElement.className).split(" ")[0], scrollY: Math.round(scrollY), hash: location.hash })) });
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(150);
    seq.push(await page.evaluate(() => { const el = document.activeElement; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), cls: el.className, text: (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 40), matchesFocusVisible: el.matches(":focus-visible"), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset, boxShadow: cs.boxShadow, top: Math.round(r.top), visible: r.width > 0 && r.height > 0 && r.bottom > 0 }; }));
  }
  if (shotPath) await page.screenshot({ path: shotPath, fullPage: false });
  return seq;
}

async function runAxe(page) {
  try {
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
    return { violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, tags: v.tags.filter((t) => /wcag|best/.test(t)), nodes: v.nodes.length, example: v.nodes[0]?.target?.[0], exampleHtml: v.nodes[0]?.html?.slice(0, 160), examples: v.nodes.slice(0, 3).map((n) => n.target?.[0]) })), passes: r.passes.length, incomplete: r.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })) };
  } catch (e) { return { error: String(e).slice(0, 300) }; }
}

const shotName = (url, w, scheme) => `${(url === "/" ? "home" : url.replace(/^\//, "").replace(/\//g, "_"))}-${w}-${scheme}.png`;

import { spawn } from "node:child_process";
async function ensureServer() {
  for (let attempt = 0; attempt < 3; attempt++) {
    try { const r = await fetch(BASE + "/robots.txt"); if (r.ok) return; } catch (e) {}
    console.log("server down; restarting next start -p 3100 (another process in this sandbox kills next servers before its own build)");
    const log = fs.openSync(`${OUT}/../audit-next-server.log`, "a");
    const child = spawn("npx", ["next", "start", "-p", "3100"], { cwd: process.cwd(), detached: true, stdio: ["ignore", log, log] });
    child.unref();
    for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 1000)); try { const r = await fetch(BASE + "/robots.txt"); if (r.ok) { results.meta.serverRestarts = (results.meta.serverRestarts || 0) + 1; return; } } catch (e) {} }
  }
  throw new Error("could not start server");
}
async function measurePage(url, width, scheme, full) {
  await ensureServer();
  { const prev = results.pages[`${url}|${width}|${scheme}`]; if (prev && !prev.error && (!full || prev.focus)) { console.log("skip (already measured)", url, width, scheme); return; } }
  const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width, height: width < 800 ? 844 : 900 }, deviceScaleFactor: 1, isMobile: width < 800, hasTouch: width < 800 });
  const page = await ctx.newPage();
  const key = `${url}|${width}|${scheme}`;
  const rec = { url, width, scheme };
  try {
    const l = await loadWithResources(page, url, { settle: full ? 2000 : 1200 });
    rec.loadMsLocal = l.loadMs; rec.navigationTiming = l.nav;
    rec.resources = summariseResources(l.resources, l.resEntries);
    rec.console = l.consoleMsgs; rec.pageErrors = l.pageErrors; rec.requestsFailed = l.failed;
    rec.cspViolations = l.consoleMsgs.filter((m) => /Content Security Policy|CSP/i.test(m.text));
    rec.fonts = l.resources.filter((r) => r.type === "font").map((r) => ({ url: r.url.replace(BASE, ""), KB: fmtBytes(r.wireBytes || 0), selfHosted: r.url.startsWith(BASE) }));
    rec.dom = await domFacts(page, width);
    // natural vs rendered for heaviest images
    rec.resources.heaviest = rec.resources.heaviest.map((h) => { if (h.type === "image") { const im = rec.dom.images.find((i) => i.src === h.url || BASE + i.src === h.url || h.url.endsWith(i.src)); if (im) return { ...h, natural: im.natural, rendered: im.rendered, hasWidthHeight: im.hasWidthAttr && im.hasHeightAttr, loading: im.loading, fetchpriority: im.fetchpriority }; } return h; });
    if (full) {
      rec.touchTargets = await touchTargets(page);
      rec.contrast = await contrast(page);
      rec.axe = await runAxe(page);
      // Sticky elements after scrolling 800px and 2000px.
      const stickyFn = () => { const h = document.querySelector(".site-header"); const b = document.querySelector(".ev-bar"); const hr = h ? h.getBoundingClientRect() : null; const br = b ? b.getBoundingClientRect() : null; const bOn = b ? b.classList.contains("on") : false; const bcs = b ? getComputedStyle(b) : null; const fixed = [...document.querySelectorAll("body *")].filter((e) => ["fixed", "sticky"].includes(getComputedStyle(e).position) && e.getBoundingClientRect().height > 0 && getComputedStyle(e).opacity !== "0").map((e) => ({ selector: e.tagName.toLowerCase() + "." + String(e.className).split(" ")[0], top: Math.round(e.getBoundingClientRect().top), height: Math.round(e.getBoundingClientRect().height), position: getComputedStyle(e).position })); return { headerTop: hr ? Math.round(hr.top) : null, headerHeight: hr ? Math.round(hr.height) : null, sectionBarPresent: !!b, sectionBarOn: bOn, sectionBarTop: br ? Math.round(br.top) : null, sectionBarHeight: br ? Math.round(br.height) : null, sectionBarOpacity: bcs ? bcs.opacity : null, sectionBarInlineTop: b ? b.style.top : null, viewportHeight: innerHeight, coveredPx: (hr && hr.top <= 0 && hr.bottom > 0 ? hr.bottom : 0) + (bOn && br ? br.height : 0), fixedOrSticky: fixed }; };
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForTimeout(700);
      rec.stickyAt800 = await page.evaluate(stickyFn);
      await page.evaluate(() => window.scrollTo(0, 2000));
      await page.waitForTimeout(700);
      rec.stickyAt2000 = await page.evaluate(stickyFn);
      // Scroll the whole page in viewport steps so lazy images load, then re-count resources and image dimensions.
      await page.evaluate(async () => { const step = innerHeight * 0.8; for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } });
      await page.waitForTimeout(2500);
      const resEntries2 = await page.evaluate(() => performance.getEntriesByType("resource").map((e) => ({ name: e.name, transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, decodedBodySize: e.decodedBodySize })));
      rec.afterFullScroll = summariseResources(l.resources, resEntries2);
      rec.afterFullScroll.images = await page.evaluate(() => [...document.querySelectorAll("img")].map((im) => { const r = im.getBoundingClientRect(); return { src: (im.currentSrc || im.src).replace(location.origin, ""), natural: [im.naturalWidth, im.naturalHeight], rendered: [Math.round(r.width), Math.round(r.height)], loading: im.getAttribute("loading"), widthAttr: im.getAttribute("width"), heightAttr: im.getAttribute("height"), complete: im.complete }; }));
      rec.afterFullScroll.heaviest = rec.afterFullScroll.heaviest.map((h) => { if (h.type === "image") { const im = rec.afterFullScroll.images.find((i) => h.url.endsWith(i.src)); if (im) return { ...h, natural: im.natural, rendered: im.rendered, loading: im.loading, widthAttr: im.widthAttr, heightAttr: im.heightAttr }; } return h; });
      rec.nonOkResponses = l.resources.filter((r) => r.status >= 400).map((r) => ({ url: r.url.replace(BASE, ""), status: r.status, type: r.type }));
      // Focus: reload so the sequential-focus starting point is the document start, then Tab three times.
      const fresh = await ctx.newPage(); await fresh.goto(BASE + url, { waitUntil: "load" }); await fresh.waitForTimeout(1200);
      rec.focus = await focusCheck(fresh, `${SHOTS}/focus-${shotName(url, width, scheme)}`);
    } else {
      rec.nonOkResponses = l.resources.filter((r) => r.status >= 400).map((r) => ({ url: r.url.replace(BASE, ""), status: r.status, type: r.type }));
    }
    const wantShot = (["/", EDITION, "/daily"].includes(url) && [390, 1440].includes(width) && scheme === "light") || (url === "/" && width === 390 && scheme === "dark");
    if (wantShot) { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300); await page.screenshot({ path: `${SHOTS}/${shotName(url, width, scheme)}`, fullPage: true }); rec.screenshot = `audit/shots/${shotName(url, width, scheme)}`; }
  } catch (e) { rec.error = String(e).slice(0, 500); }
  await ctx.close();
  results.pages[key] = rec;
  console.log(key, rec.error ? "ERROR " + rec.error : `load ${rec.loadMsLocal}ms, ${rec.resources.requestCount} req, ${rec.resources.totalWireKB}KB, hscroll=${rec.dom.horizontalScroll}, dom=${rec.dom.domNodes}, console=${rec.console.length}, axe=${rec.axe ? rec.axe.violations?.length : "-"}`);
}

if (process.env.QUICK) { await measurePage(EDITION, 390, "light", true); await browser.close(); fs.writeFileSync(`${OUT}/pw-quick.json`, JSON.stringify(results, null, 2)); process.exit(0); }
// Key templates: full set at 390 & 1440 in light & dark; light-only quick pass at 360 & 768.
for (const url of KEY) {
  for (const scheme of ["light", "dark"]) for (const width of [390, 1440]) await measurePage(url, width, scheme, true);
  for (const width of [360, 768]) await measurePage(url, width, "light", false);
}
// Other pages: quick pass at 360, 390 and 1440 light; 390 dark.
for (const url of OTHER) {
  for (const width of [360, 390, 1440]) await measurePage(url, width, "light", false);
  await measurePage(url, 390, "dark", false);
}
// Axe for the other pages at 390 light (one run each).
for (const url of OTHER) {
  await ensureServer();
  const ctx = await browser.newContext({ colorScheme: "light", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  try { await page.goto(BASE + url, { waitUntil: "load" }); await page.waitForTimeout(1200); results.pages[`${url}|390|light`].axe = await runAxe(page); console.log("axe", url, results.pages[`${url}|390|light`].axe.violations?.length); } catch (e) { results.pages[`${url}|390|light`].axeError = String(e); }
  await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/pw.json`, JSON.stringify(results, null, 2));
console.log("written", `${OUT}/pw.json`);
