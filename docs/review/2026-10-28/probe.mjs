// Supplementary probes: keyboard tab order (with and without JavaScript) and gradient-card contrast that
// respects elements' own backgrounds. Writes $OUT/probe.json.
import { chromium } from "playwright";
import fs from "node:fs";
const BASE = "http://localhost:3100";
const OUT = process.env.OUT;
const EDITION = "/daily/october-28-2026";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome" });
const out = { tabOrder: {}, gradientCards: {}, misc: {} };

const descFn = `(el) => el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/)[0] : "") + " \\"" + (el.innerText || el.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim().slice(0, 30) + "\\" y=" + Math.round(el.getBoundingClientRect().top)`;

async function tabOrder(url, js) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: js });
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: "load" });
  await page.waitForTimeout(js ? 1500 : 300);
  const seq = [await page.evaluate(`(${descFn})(document.activeElement)`)];
  for (let i = 0; i < 12; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(60); seq.push(await page.evaluate(`(${descFn})(document.activeElement)`)); }
  // Shift+Tab back from wherever we are to see whether the header is reachable backwards.
  const back = [];
  for (let i = 0; i < 14; i++) { await page.keyboard.press("Shift+Tab"); await page.waitForTimeout(60); back.push(await page.evaluate(`(${descFn})(document.activeElement)`)); }
  // Focusability facts about the elements that precede .ev-special in DOM order.
  const facts = await page.evaluate(() => {
    const special = document.querySelector(".ev-special");
    const before = [];
    if (special) { const all = [...document.querySelectorAll("a[href], button, input, [tabindex]")]; for (const el of all) { if (el === special) break; const cs = getComputedStyle(el); before.push({ el: el.tagName.toLowerCase() + "." + String(el.className).split(" ")[0], tabIndex: el.tabIndex, display: cs.display, visibility: cs.visibility, inert: el.closest("[inert]") ? true : false, ariaHidden: el.closest("[aria-hidden='true']") ? true : false, rect: [Math.round(el.getBoundingClientRect().top), Math.round(el.getBoundingClientRect().height)] }); } }
    return { focusableBeforeSpecial: before, inertElements: [...document.querySelectorAll("[inert]")].map((e) => e.tagName.toLowerCase() + "." + String(e.className).split(" ")[0] + " inert=" + e.getAttribute("inert")), autofocus: document.querySelectorAll("[autofocus]").length, dialogs: [...document.querySelectorAll("dialog")].map((d) => d.className + " open=" + d.open) };
  });
  await ctx.close();
  return { js, first13: seq, shiftTabBack: back, facts };
}

for (const url of ["/", EDITION, EDITION + "/1", "/daily", "/about"]) {
  out.tabOrder[url] = { withJS: await tabOrder(url, true), withoutJS: await tabOrder(url, false) };
  console.log(url, "JS first tabs:", out.tabOrder[url].withJS.first13.slice(0, 4).join(" | "));
  console.log(url, "noJS first tabs:", out.tabOrder[url].withoutJS.first13.slice(0, 4).join(" | "));
}

// Gradient cards, respecting own backgrounds.
const gradJs = `(() => {
  const parseColor = (s) => { const m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(",").map((x) => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05))).toFixed(2); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const hexToC = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16), a: 1 });
  const cards = { ".ev-call-0": { lightest: "#4b2b78", darkest: "#24123f" }, ".ev-call-1": { lightest: "#b8471d", darkest: "#93321a" }, ".ev-sx": { lightest: "#4b2b78", darkest: "#1d0f35" }, ".ev-special": { "start (darkest) #1B2747": "#1B2747", "mid #5B3A6E": "#5B3A6E", "end (lightest) #B8603F": "#B8603F" } };
  const rows = [];
  for (const [sel, stops] of Object.entries(cards)) {
    const card = document.querySelector(sel); if (!card) { rows.push({ card: sel, missing: true }); continue; }
    const cr = card.getBoundingClientRect();
    const cardBgColor = parseColor(getComputedStyle(card).backgroundColor);
    const els = [...card.querySelectorAll("*")].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().width > 0);
    for (const e of els) {
      const cs = getComputedStyle(e); const fgRaw = parseColor(cs.color); const size = parseFloat(cs.fontSize); const weight = parseInt(cs.fontWeight, 10) || 400; const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const text = (e.innerText || "").replace(/\\s+/g, " ").trim().slice(0, 40);
      const r = e.getBoundingClientRect(); const xFrac = +(((r.left + r.right) / 2 - cr.left) / cr.width).toFixed(2);
      // own or intermediate opaque background inside the card?
      let n = e, own = null; while (n && n !== card) { const c = parseColor(getComputedStyle(n).backgroundColor); if (c && c.a >= 1) { own = { color: c, from: n.tagName.toLowerCase() + "." + String(n.className).split(" ")[0], inline: n.getAttribute("style") }; break; } n = n.parentElement; }
      if (own) { const fg = fgRaw.a < 1 ? blend(fgRaw, own.color) : fgRaw; const rt = ratio(fg, own.color); rows.push({ card: sel, element: e.tagName.toLowerCase() + "." + String(e.className).split(" ")[0], text, fontSize: size, fontWeight: weight, large, background: "own: " + hex(own.color) + " (" + own.from + (own.inline ? ", inline style" : "") + ")", fg: hex(fg), ratio: rt, aa: rt >= (large ? 3 : 4.5) ? "pass" : "FAIL", xFracInCard: xFrac }); continue; }
      for (const [name, h] of Object.entries(stops)) { const bg = hexToC(h); const fg = fgRaw.a < 1 ? blend(fgRaw, bg) : fgRaw; const rt = ratio(fg, bg); rows.push({ card: sel, element: e.tagName.toLowerCase() + "." + String(e.className).split(" ")[0], text, fontSize: size, fontWeight: weight, large, background: "gradient stop " + name + " " + h, fg: hex(fg), ratio: rt, aa: rt >= (large ? 3 : 4.5) ? "pass" : "FAIL", xFracInCard: xFrac, cardBgColor: cardBgColor ? getComputedStyle(card).backgroundColor : null }); }
    }
  }
  return rows;
})()`;
for (const scheme of ["light", "dark"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(BASE + EDITION, { waitUntil: "load" }); await page.waitForTimeout(1500);
  out.gradientCards[scheme] = await page.evaluate(gradJs);
  out.misc[scheme] = await page.evaluate(() => { const q = (s) => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e); return { fontSize: cs.fontSize, color: cs.color, background: cs.backgroundColor, text: (e.innerText || "").slice(0, 40) }; }; return { evSxBandPill: q(".ev-sx-read em"), evSxCta: q(".ev-sx-cta"), evSpecialTag: q(".ev-special-tag"), evFreeTag: q(".ev-free-tag"), evBarSpan: q(".ev-bar span"), hdrSub: q(".hdr-sub") }; });
  await ctx.close();
  console.log(scheme, "gradient rows", out.gradientCards[scheme].length, "fails", out.gradientCards[scheme].filter((r) => r.aa === "FAIL").length);
}
// Home page .ab-strap and about-page smallest text at 390 and 1440.
for (const w of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" }); await page.waitForTimeout(800);
  out.misc[`abStrap@${w}`] = await page.evaluate(() => { const e = document.querySelector(".ab-strap"); if (!e) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { text: e.innerText, fontSize: cs.fontSize, color: cs.color, letterSpacing: cs.letterSpacing, rect: [Math.round(r.top), Math.round(r.height)], parentBgImage: getComputedStyle(e.parentElement).backgroundImage.slice(0, 60), overImage: !!e.closest(".ab-top") }; });
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/probe.json`, JSON.stringify(out, null, 2));
console.log("wrote probe.json");
