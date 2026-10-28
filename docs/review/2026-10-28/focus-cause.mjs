// Hypothesis test: SectionBar's scrollIntoView() on the inert .ev-bar link moves Chromium's sequential-focus
// starting point, so the first Tab lands on .ev-special instead of the skip link. Compare a normal load with a
// load where Element.prototype.scrollIntoView is a no-op.
import { chromium } from "playwright";
import fs from "node:fs";
const BASE = "http://localhost:3100";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome" });
const out = {};
for (const url of ["/", "/daily/october-28-2026"]) {
  for (const variant of ["normal", "scrollIntoView-noop"]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    if (variant !== "normal") await ctx.addInitScript(() => { Element.prototype.scrollIntoView = function () {}; });
    const page = await ctx.newPage();
    await page.goto(BASE + url, { waitUntil: "load" }); await page.waitForTimeout(1500);
    const sel = await page.evaluate(() => { const s = getSelection(); return { rangeCount: s.rangeCount, type: s.type, anchor: s.anchorNode ? (s.anchorNode.nodeType === 3 ? "text:" + s.anchorNode.textContent.slice(0, 30) : s.anchorNode.tagName + "." + s.anchorNode.className) : null, scrollY: scrollY }; });
    await page.keyboard.press("Tab"); await page.waitForTimeout(80);
    const first = await page.evaluate(() => { const e = document.activeElement; return e.tagName.toLowerCase() + "." + String(e.className).split(" ")[0] + ' "' + (e.innerText || "").replace(/\s+/g, " ").trim().slice(0, 30) + '"'; });
    out[`${url} ${variant}`] = { selectionBeforeTab: sel, firstTabLandsOn: first };
    console.log(url, variant, JSON.stringify(out[`${url} ${variant}`]));
    await ctx.close();
  }
}
await b.close();
fs.writeFileSync(`${process.env.OUT}/focus-cause.json`, JSON.stringify(out, null, 2));
