// Merges the measurement outputs into audit/measurements.json and writes audit/REPORT.md (facts only, no recommendations).
import fs from "node:fs";
const S = process.env.S; // scratchpad holding raw.json and headers.json
const AUDIT = process.env.AUDIT;
const pw = JSON.parse(fs.readFileSync(`${AUDIT}/pw.json`, "utf8"));
const raw = JSON.parse(fs.readFileSync(`${S}/raw.json`, "utf8"));
const hdr = JSON.parse(fs.readFileSync(`${S}/headers.json`, "utf8"));
const probe = fs.existsSync(`${AUDIT}/probe.json`) ? JSON.parse(fs.readFileSync(`${AUDIT}/probe.json`, "utf8")) : null;

const EDITION = "/daily/october-28-2026";
const STORY = "/daily/october-28-2026/1";
const KEY = ["/", EDITION, STORY, "/daily", "/about"];
const P = (url, w, s) => pw.pages[`${url}|${w}|${s}`];

const staticFacts = {
  build: { framework: "Next.js 16.4.3 (next build + next start -p 3100), React 19.3.1, images.unoptimized=true", worktreeCommit: process.env.COMMIT || null, editionsInData: 33, newestEdition: "2026-10-28 (/daily/october-28-2026)", storyPageMeasured: STORY },
  css: {
    file: "app/globals.css (913 lines)", units: "All font sizes are px (grep for rem: 0 matches as a unit; the only 'rem' substring is in 'counter-increment'). Headline sizes use clamp(…px, …vw, …px).",
    fontFace: ["@font-face 'Playfair Display' 700, font-display: swap, src url(/fonts/playfair-700.woff2) (19,032 B on disk)", "@font-face 'Playfair Display' 800, font-display: swap, src url(/fonts/playfair-800.woff2) (18,980 B on disk)"],
    fontStacks: { "--sans (body, nav, UI)": '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif', "--serif (home hero, stress index)": 'Georgia, "Times New Roman", serif', "headlines (.ev h1/h2/h3, .wordmark, .about h1-h3)": '"Playfair Display", Georgia, serif' },
    unusedFontDeps: "package.json lists @fontsource/cormorant-garamond and @fontsource/playfair-display as dependencies; neither is imported anywhere in app/, components/ or lib/ (grep 'fontsource' finds only package.json).",
    preload: "app/layout.tsx preloads /fonts/playfair-800.woff2 (as=font, crossOrigin=anonymous).",
    reducedMotion: ["@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } *, *::before, *::after { transition: none !important; animation: none !important } } (globals.css ~line 663)", "@media (prefers-reduced-motion: reduce) { .ev-bar { transition: none } } (~line 818)"],
    colorScheme: ["8 @media (prefers-color-scheme: dark) blocks, each scoped to :root:not([data-theme=\"light\"]), with a duplicate :root[data-theme=\"dark\"] rule for the header toggle:", "line 64: the full dark token set (--ink #ece8f2, --cream #14111b, --paper/--card #1e1a28, --accent #f29a6c …) plus color-scheme: dark", "line 94: .hdr-sub becomes #f0885a with #1a1222 text", "line 291: .mk --mk-up #4ade80 / --mk-down #f87171", "line 479: .ab-top-img img filter brightness(0.72) saturate(0.92)", "line 770: inset 1px white 10% ring on .ev-sx, .ab-join, .ev-call, .hdr-sub, .tl-day, .ab-third", "line 825: section tokens --sec-pick/--sec-india/--sec-world", "lines 857/865: .wk-mk and .wk-no (week page)", "Theme choice persists in localStorage('theme') and is applied by an inline script in <head> before paint; <meta name=theme-color> is set for both schemes (#fbf8f1 / #14111b)."],
    focusVisible: "a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid var(--orange) /* #ef7447 */; outline-offset: 3px; border-radius: 6px } — .es input[type=email]:focus sets outline: none and a 4px box-shadow instead.",
    gradients: { ".ev-call-0": "radial-gradient(120% 140% at 0% 0%, #4b2b78, #24123f 75%) — lightest stop #4b2b78, darkest #24123f", ".ev-call-1": "radial-gradient(120% 140% at 0% 0%, #b8471d, #93321a 80%) — lightest stop #b8471d, darkest #93321a", ".ev-sx (AI Stress Index card)": "radial-gradient(120% 160% at 0% 0%, #4b2b78, #1d0f35 70%)", ".ev-special (special report banner)": "linear-gradient(120deg, #1B2747, #5B3A6E 62%, #B8603F) — lightest stop #B8603F (end), darkest #1B2747 (start)" },
    shareRow: "@media (max-width: 700px): .ev-share hides every button except .ev-share-one (a single 'Share' button that opens the OS share sheet or unfolds the row).",
    phoneHeader: "@media (max-width: 700px): .site-header wraps to two rows (wordmark + toggle + Subscribe, then a horizontally scrollable nav with scrollbar hidden); nav links get padding 10px 0. @media (max-width: 360px): nav gap 12px, font-size 13px.",
  },
  forms: {
    emailSignup: "components/EmailSignup.tsx renders <input type=\"email\" inputMode=\"email\" autoComplete=\"email\" required> styled by .es input[type=email] { height: 46px; font: 16px var(--sans) } — but only when lib/site.ts INLINE_SIGNUP = Boolean(process.env.BEEHIIV_API_KEY). BEEHIIV_API_KEY is unset locally, so no email input renders on any page; the fallback is an external link to https://kkreckons.beehiiv.com/subscribe (target=_blank): 'Subscribe free ↗' / 'Get it by email ↗' and the header 'Subscribe' pill.",
    archiveSearch: "components/ArchiveBrowser.tsx renders <input id=\"archive-search\" type=\"search\" aria-label=\"Search stories\" aria-keyshortcuts=\"/\">. A global '/' key handler (components/SearchKey.tsx) focuses it or navigates to /daily/#search.",
    notFoundSearch: "app/not-found.tsx has a <form action=\"/daily/\" method=get> with <input type=search name=q>.",
  },
  routing: { trailingSlash: "GET /daily/ returns 308 Permanent Redirect to /daily. Source contains 13 internal links to \"/daily/\" (app/layout.tsx footer 'Past editions', components/SubscribeBox.tsx 'Catch up on past editions', app/week, app/month, app/daily/[slug]/[n] breadcrumb, app/not-found.tsx, …), so each of those clicks goes through the redirect. The header nav link uses /daily (no slash). Sitemap URLs have no trailing slashes.", stressDataRewrite: "next.config.mjs rewrites /ai-stress-index/data.json to https://kkreddy79.github.io/ai-implosion/data.json; locally this returns 500 because the sandbox cannot reach GitHub Pages." },
};

// ---------- Build measurements.json ----------
const measurements = { probe, generatedAt: new Date().toISOString(), base: "http://localhost:3100 (next start, production build)", notes: ["Live site www.kkreckons.com was not reachable from the sandbox (proxy 403); every number below is from a local production build.", "Timings are local-only and say nothing about real-user performance.", "Bytes are 'wire' bytes: encodedBodySize from the Resource Timing API where available (gzip from next start), otherwise content-length / body length."], staticFacts, headers: hdr, rawHtml: raw, rendered: pw.pages };
fs.writeFileSync(`${AUDIT}/measurements.json`, JSON.stringify(measurements, null, 2));

// ---------- REPORT.md ----------
const L = [];
const h = (n, t) => L.push(`\n${"#".repeat(n)} ${t}\n`);
const li = (t) => L.push(`- ${t}`);
const table = (cols, rows) => { L.push(`| ${cols.join(" | ")} |`); L.push(`| ${cols.map(() => "---").join(" | ")} |`); for (const r of rows) L.push(`| ${r.map((c) => String(c ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ")).join(" | ")} |`); L.push(""); };
const kb = (n) => `${n} KB`;

L.push("# KKReckons UX / SEO measurement report (local production build)");
L.push("");
L.push(`Generated ${measurements.generatedAt}. Measured against \`next build\` + \`next start -p 3100\` in a git worktree at the commit listed below. **The live site www.kkreckons.com could not be fetched from this sandbox (proxy 403)**, so nothing here reflects Vercel's CDN, HSTS, analytics scripts, real-user timings or Google's view of the site. This document records facts only; it makes no recommendations.`);
L.push("");
li(`Commit measured: ${process.env.COMMIT || "(see git log in the worktree)"}`);
li(`Pages measured: ${Object.keys(pw.pages).length} page × viewport × scheme combinations across 15 URLs; key templates (/, ${EDITION}, ${STORY}, /daily, /about) at 390 and 1440 in light and dark with the full checklist, plus 360 and 768 light; other pages at 360/390/1440 light and 390 dark.`);
li("Screenshots: audit/shots/ (full page: home-390-light, home-1440-light, home-390-dark, daily_october-28-2026-390/1440-light, daily-390/1440-light; plus focus-*.png viewport shots after three Tab presses).");

h(2, "1. Response headers (curl -sI)");
L.push("All HTML pages return the same five security headers from next.config.mjs. **Strict-Transport-Security is absent locally; next.config.mjs's comment says Vercel adds HSTS in production — this could not be verified from the sandbox.**");
table(["Path", "Status", "CSP", "X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Cache-Control"], Object.entries(hdr.pages).map(([p, v]) => [p, v.status, v.headers["content-security-policy"] ? "present" : "missing", v.headers["x-frame-options"] ?? "missing", v.headers["x-content-type-options"] ?? "missing", v.headers["referrer-policy"] ?? "missing", v.headers["permissions-policy"] ? "present" : "missing", v.headers["cache-control"] ?? "missing"]));
li("CSP value (every page except /ai-stress-index/embed): `" + hdr.pages["/"].headers["content-security-policy"] + "`");
li("CSP keeps `'unsafe-inline'` for script-src and style-src (next.config.mjs explains: Next.js inlines page data and the theme script). No nonce or hash. `frame-ancestors 'none'` + `X-Frame-Options: DENY`.");
li("/ai-stress-index/embed: `" + hdr.pages["/ai-stress-index/embed"].headers["content-security-policy"] + "` and no X-Frame-Options (intentionally framable).");
li("Permissions-Policy: `" + hdr.pages["/"].headers["permissions-policy"] + "`.");
li("Cache-Control on HTML: `s-maxage=3600, stale-while-revalidate=31532400` on / and /ai-stress-index; `s-maxage=31536000` on prerendered pages (edition, story, archive, about, topics…). `/research/ai-bubble-october-2026` (static HTML file via rewrite): `public, max-age=0`.");
li("Static assets: /fonts/* `public, max-age=31536000, immutable`; /figs/* `public, max-age=86400, stale-while-revalidate=604800`; /_next/static/* `public, max-age=31536000, immutable`; /icon.png `public, max-age=0, must-revalidate`.");
li("No `Cross-Origin-Opener-Policy`, no `X-Robots-Tag` header on any page.");

h(2, "2. Raw endpoints");
table(["Path", "Status", "Content-Type", "Bytes"], Object.entries(hdr.rawEndpoints).map(([p, v]) => [p, v.status, v.contentType, v.bytes]));
li(`robots.txt: 12 user-agent groups (*, Googlebot, Bingbot, Google-Extended, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Applebot-Extended), each \`Allow: /\` and \`Disallow: /feedback/\`; two Sitemap lines (sitemap.xml, news-sitemap.xml).`);
li(`sitemap.xml: ${hdr.sitemap.urlCount} URLs (${Object.entries(hdr.sitemap.byPrefix).map(([k, v]) => `${k}: ${v}`).join(", ")}); ${hdr.sitemap.withLastmod} have <lastmod>; **the home URL https://www.kkreckons.com is not listed**; no image sitemap extension; 0 trailing-slash URLs.`);
li(`news-sitemap.xml: ${hdr.newsSitemap.urlCount} URLs (publication dates ${hdr.newsSitemap.dates.join(", ")}), publication name KKReckons, language en.`);
li(`feed.xml: RSS 2.0, ${hdr.feed.items} items, atom:link rel=self present, first pubDate ${hdr.feed.firstPubDate}; no content:encoded, no enclosure/media elements. Per-topic feeds exist (e.g. /topics/ai/feed.xml, 36,097 B).`);
li("llms.txt: 3,985 B, lists latest edition, archive, AI Stress Index, about, standards, contact, RSS.");
li("/.well-known/security.txt: Contact mailto:kkreckons@gmail.com, Expires 2027-10-21, Canonical set.");
li("**No web app manifest**: /manifest.json, /site.webmanifest and /manifest.webmanifest all 404, and no `<link rel=manifest>` in any page. /favicon.ico 404 (pages link /icon.png and /apple-icon.png instead).");
li("/ai-stress-index/data.json returns 500 locally (rewrite to kkreddy79.github.io; blocked in the sandbox) — could not verify.");
li("/daily/summaries.json is a 212,899 B JSON route (used by the archive search).");

h(2, "3. Server-sent HTML (curl) per page");
table(["Path", "HTML KB", "Title (length)", "Meta description length", "Canonical", "Robots meta", "H1s", "Headings", "JSON-LD @types", "img / without alt / without w+h", "script tags (external)"], Object.entries(raw).map(([p, v]) => [p, v.htmlKB, `${v.title} (${v.titleLength})`, v.descriptionLength, v.canonical.join(", ") || "none", v.robotsMeta ?? "none", v.h1Count, JSON.stringify(v.allLevels), [...new Set(v.jsonLdTypes.flat())].join(", ") || "none", `${v.imgCount} / ${v.imgWithoutAlt} / ${v.imgMissingWidthHeight}`, `${v.scriptTags} (${v.externalScripts})`]));
for (const p of KEY) {
  const v = raw[p];
  h(3, `${p}`);
  li(`og:title: ${v.og.title}`); li(`og:description: ${v.og.description}`); li(`og:image: ${v.og.image} ${v.og.imageWidth ? `(${v.og.imageWidth}×${v.og.imageHeight})` : "(no og:image:width/height)"}; og:type: ${v.og.type ?? "none"}; og:site_name: ${v.og.siteName ?? "none"}; og:url: ${v.og.url ?? "none"}${v.og.publishedTime ? `; article:published_time: ${v.og.publishedTime}` : ""}`); li(`twitter:card: ${v.twitter.card}; twitter:creator: ${v.twitter.creator}`); li(`JSON-LD blocks: ${v.jsonLdBlocks}; types: ${JSON.stringify(v.jsonLdTypes)}`); li(`Landmarks in HTML: header ${v.landmarks.header}, nav ${v.landmarks.nav}, main ${v.landmarks.main}, footer ${v.landmarks.footer}; skip link present: ${v.skipLink}; lang=${v.lang}`); li(`Preloads: ${v.preloads.join(", ")}; stylesheet: ${v.stylesheets.join(", ")}; icons: ${v.icons.map((i) => i.rel + " " + i.href).join(", ")}`);
  L.push(""); L.push("Heading outline (H1–H3, first 25):"); for (const hh of v.outlineFirst25) L.push(`  - ${hh.level}: ${hh.text}`); L.push("");
}
const rr = raw["/research/ai-bubble-october-2026"];
h(3, "/research/ai-bubble-october-2026 (static HTML file)");
li(`Title: ${rr.title} (${rr.titleLength}); description length ${rr.descriptionLength}; canonical ${rr.canonical[0]}; robots meta: none; JSON-LD: none; ${rr.scriptTags} script tags; viewport ${rr.viewport}.`);
li("Font stacks declared inline: --display: 'Lora', Georgia, 'Times New Roman', serif; --mono: 'IBM Plex Mono', ui-monospace, Menlo, monospace. There is no @font-face, no <link> to fonts.googleapis.com and no @import in the file, so 'Lora' and 'IBM Plex Mono' only render if installed locally; otherwise Georgia / system monospace are used. No external requests of any kind were observed when rendering it (see section 10).");
li(`Headings: ${JSON.stringify(rr.allLevels)}; images in HTML: ${rr.imgCount}.`);

h(2, "4. Rendered weight and requests (Playwright, local)");
L.push("Bytes are wire bytes at the `load` event (plus ~1.5–2 s settle); 'after full scroll' re-counts after scrolling the whole page so lazy images and Next.js link prefetches load. `/_vercel/insights/script.js` 404s locally because Vercel Analytics is only served on Vercel.");
const rowsW = [];
for (const [k, v] of Object.entries(pw.pages)) if (v.resources) rowsW.push([v.url, v.width, v.scheme, v.resources.requestCount, v.resources.totalWireKB, Object.entries(v.resources.byType).map(([t, x]) => `${t} ${x.count}/${x.KB}KB`).join("; "), v.afterFullScroll ? `${v.afterFullScroll.requestCount} req / ${v.afterFullScroll.totalWireKB} KB` : "", v.dom?.domNodes, v.loadMsLocal, v.dom?.pageHeight]);
table(["Path", "Width", "Scheme", "Requests", "Total KB", "By type (count/KB)", "After full scroll", "DOM nodes", "load (ms, local)", "Page height px"], rowsW);
h(3, "Five heaviest assets per key template (390 light; after full scroll)");
for (const p of KEY) { const v = P(p, 390, "light"); if (!v?.afterFullScroll) continue; L.push(`**${p}** (at load: ${v.resources.requestCount} requests, ${v.resources.totalWireKB} KB; after full scroll: ${v.afterFullScroll.requestCount} requests, ${v.afterFullScroll.totalWireKB} KB)`); table(["Asset", "Type", "Wire KB", "Decoded KB", "Encoding", "Natural px", "Rendered px", "loading", "width/height attrs", "Cache-Control"], v.afterFullScroll.heaviest.map((a) => [a.url, a.type, a.wireKB, a.decodedKB ?? "", a.encoding ?? "", a.natural ? a.natural.join("×") : "", a.rendered ? a.rendered.join("×") : "", a.loading ?? "", a.widthAttr ? `${a.widthAttr}×${a.heightAttr}` : "", a.cacheControl ?? ""])); }
h(3, "Five heaviest assets per key template (1440 light; after full scroll)");
for (const p of KEY) { const v = P(p, 1440, "light"); if (!v?.afterFullScroll) continue; L.push(`**${p}** (at load ${v.resources.totalWireKB} KB; after full scroll ${v.afterFullScroll.totalWireKB} KB)`); table(["Asset", "Type", "Wire KB", "Natural px", "Rendered px", "loading"], v.afterFullScroll.heaviest.map((a) => [a.url, a.type, a.wireKB, a.natural ? a.natural.join("×") : "", a.rendered ? a.rendered.join("×") : "", a.loading ?? ""])); }
h(3, "Images");
for (const p of KEY) { const v = P(p, 390, "light"); if (!v?.dom) continue; const imgs = v.afterFullScroll?.images ?? v.dom.images; li(`${p}: ${v.dom.images.length} <img>; without width+height attributes: ${v.dom.imagesMissingWidthHeight.length ? v.dom.imagesMissingWidthHeight.join(", ") : "none"}; ` + imgs.map((i) => `${i.src} natural ${i.natural.join("×")} rendered ${i.rendered.join("×")}${i.loading ? ` loading=${i.loading}` : ""}`).join("; ")); }
const si = P("/ai-stress-index", 390, "light"); if (si?.dom) li(`/ai-stress-index: ${si.dom.images.length} <img>; without width+height: ${si.dom.imagesMissingWidthHeight.join(", ") || "none"}.`);
li("Note on 'natural' sizes: img.naturalWidth/naturalHeight are density-corrected by the browser for srcset 'w' candidates, so the same file reports 390×1151 at 390px (sizes=100vw) and 559×1652 at 1440px (sizes=560px). Actual files (sharp metadata): 2026-10-28-1-sm.webp 640×1889 (106,646 B), -md.webp 860×2538 (146,842 B), -lg.webp 1280×3778 (232,472 B), 2026-10-28-1.jpg 1280×3778 (449,083 B), 2026-10-28-cover.jpg 1600×900 (48,209 B).");
li("Story graphics use <picture> with srcSet sm 640 / md 860 / lg ≤1600 (components/EditionView.tsx:159–167) and sizes '(max-width: 700px) 100vw, 480px' (560px for wide); the fallback <img> carries the original width/height (e.g. 1280×3778) while the chosen webp is 390×1151 at phone width.");
h(3, "Largest element above the fold");
for (const p of KEY) for (const w of [390, 1440]) { const v = P(p, w, "light"); if (v?.dom?.largestAboveFold) { const b = v.dom.largestAboveFold; li(`${p} @${w}: ${b.kind} ${b.selector}${b.src ? ` (${b.src})` : ""} at ${b.rect.x},${b.rect.y} ${b.rect.w}×${b.rect.h}px — "${b.text}"`); } }

h(2, "5. Horizontal scroll (document.scrollWidth > innerWidth)");
const hs = []; for (const [k, v] of Object.entries(pw.pages)) if (v.dom) hs.push([v.url, v.width, v.scheme, v.dom.scrollWidth, v.dom.innerWidth, v.dom.horizontalScroll ? "YES" : "no", v.dom.overflowers.map((o) => `${o.selector} right=${o.right}`).join("; ")]);
table(["Path", "Width", "Scheme", "scrollWidth", "innerWidth", "Horizontal scroll", "Elements past the right edge (excluding intentional scrollers)"], hs);

h(2, "6. Typography (computed)");
for (const p of KEY) for (const w of [390, 1440]) { const v = P(p, w, "light"); if (!v?.dom) continue; const t = v.dom.typography; L.push(`**${p} @${w}**`); li(`body: ${t.bodyFontFamily} @ ${t.bodyFontSize}; h1: ${t.h1FontFamily} @ ${t.h1FontSize}; nav: ${t.navFontFamily} @ ${t.navFontSize}` + (t.storyPointsFontFamily ? `; .ev-points li: ${t.storyPointsFontFamily} @ ${t.storyPointsFontSize}; story h3: ${t.storyHeadingFontFamily} @ ${t.storyHeadingFontSize}` : "")); li(`Smallest visible text: ${t.smallestVisibleText?.fontSize}px — ${t.smallestVisibleText?.selector} "${t.smallestVisibleText?.text}"; ${t.under12pxCount} visible text elements under 12px${t.under12px.length ? ": " + [...new Set(t.under12px.map((u) => `${u.selector} ${u.fontSize}px "${u.text.slice(0, 30)}"`))].join("; ") : ""}`); for (const c of t.cpl) li(`Line length ${c.selector}: column ${c.columnPx}px / avg char ${c.avgCharPx}px ≈ **${c.charsPerLine} characters per line** (font ${c.fontSize}/${c.lineHeight})`); }
li("Units: " + staticFacts.css.units);

h(2, "7. Touch targets at 390px (getBoundingClientRect, visible elements only)");
for (const p of KEY) { const v = P(p, 390, "light"); if (!v?.touchTargets) continue; L.push(`**${p}**`); const groupNames = { header: "header (.site-header a/button)", firstStoryCard: "first story card (.ev-story a/button)", shareRow: "share rows (.ev-share a/button)", footer: "footer (.site-footer a)", todayIn30s: "Today in 30 seconds (.ev-30s a)", sectionBar: "section bar (.ev-bar a)", marketStrip: "market strip", callouts: "number cards (.ev-callouts a)", archive: "archive controls (.seg button, .chip, .tl-item a, …)", about: "end-of-page join box (.ab-join a, .ab-btn, .ab-btn-ghost)" }; for (const [g, d] of Object.entries(v.touchTargets)) { if (!d.count) continue; li(`${groupNames[g] || g}: ${d.visibleCount} visible of ${d.count}; under 44px in either dimension: ${d.under44.length}` + (d.under44.length ? " — " + d.under44.map((u) => `"${u.text || u.selector}" ${u.w}×${u.h}`).join("; ") : "") + (d.hidden.length ? ` (hidden at this width: ${d.hidden.length}, e.g. ${[...new Set(d.hidden)].slice(0, 4).join(", ")})` : "")); } }

h(2, "8. Contrast (computed colours; WCAG AA 4.5:1 normal, 3:1 large ≥24px or ≥18.66px bold)");
L.push("Background is the first opaque background-color up the ancestor chain; semi-transparent foregrounds are composited. Elements sitting on a CSS gradient are listed separately against the lightest and darkest gradient stops from app/globals.css.");
for (const scheme of ["light", "dark"]) {
  h(3, `${scheme} mode`);
  const seen = new Map();
  for (const p of KEY) { const v = P(p, 390, scheme); if (!v?.contrast) continue; for (const e of v.contrast.elements) { if (e.missing) continue; const k = e.label; if (!seen.has(k)) seen.set(k, { ...e, page: p }); } }
  const rows = [...seen.values()].filter((e) => !String(e.aa).startsWith("gradient")).sort((a, b) => a.ratio - b.ratio).map((e) => [e.label, e.selector, e.fg, e.bg, e.ratio, `${e.fontSize}px/${e.fontWeight}${e.large ? " (large)" : ""}`, e.aa, e.aaa, e.page]);
  table(["Element", "Selector", "Foreground", "Background", "Ratio", "Size/weight", "AA", "AAA", "Measured on"], rows);
  const grads = new Map();
  for (const p of KEY) { const v = P(p, 390, scheme); if (!v?.contrast) continue; for (const g of v.contrast.gradientCards) { if (g.missing) continue; const k = `${g.card}|${g.selector}|${g.text}|${g.stop}`; if (!grads.has(k)) grads.set(k, { ...g, page: p }); } }
  L.push(`Gradient cards on ${EDITION} @390 (text measured against each gradient stop from app/globals.css; elements with their own opaque background — pills, buttons, tags — are measured against that background instead; xFrac = horizontal centre of the text within the card, 0 = left edge, 1 = right edge):`);
  const g2 = probe ? probe.gradientCards[scheme].filter((r) => !r.missing) : [];
  table(["Card", "Text element", "Text", "Size/weight", "Background used", "Foreground", "Ratio", "AA", "xFrac"], g2.sort((a, b) => a.ratio - b.ratio).map((g) => [g.card, g.element, g.text, `${g.fontSize}px/${g.fontWeight}${g.large ? " (large)" : ""}`, g.background, g.fg, g.ratio, g.aa, g.xFracInCard]));
  const fails = rows.filter((r) => r[6] === "FAIL"); const gfails = g2.filter((g) => g.aa === "FAIL");
  li(`AA failures in ${scheme} mode: ${fails.length} solid-background element(s)${fails.length ? ": " + fails.map((r) => `${r[0]} ${r[4]}:1`).join("; ") : ""}; ${gfails.length} gradient-card row(s) below AA${gfails.length ? ": " + gfails.map((g) => `${g.card} "${g.text.slice(0, 25)}" vs ${g.background} = ${g.ratio}:1`).join("; ") : ""}.`);
}

h(2, "9. Sticky elements at 390px");
for (const p of KEY) for (const scheme of ["light"]) { const v = P(p, 390, scheme); if (!v?.stickyAt800) continue; const a = v.stickyAt800, b = v.stickyAt2000; li(`${p}: header ${a.headerHeight}px (position ${v.dom.headerPosition}); at scrollY=800: section bar ${a.sectionBarPresent ? (a.sectionBarOn ? `visible, ${a.sectionBarHeight}px at top ${a.sectionBarTop}px` : "present but hidden") : "absent"}, covered ${a.coveredPx}px of ${a.viewportHeight}px (${(100 * a.coveredPx / a.viewportHeight).toFixed(1)}%); at scrollY=2000: ${b.sectionBarOn ? `section bar visible ${b.sectionBarHeight}px` : "section bar hidden"}, covered ${b.coveredPx}px (${(100 * b.coveredPx / b.viewportHeight).toFixed(1)}%). Fixed/sticky elements: ${b.fixedOrSticky.map((f) => `${f.selector} ${f.position} ${f.height}px`).join(", ")}`); }
const d1440 = P(EDITION, 1440, "light"); if (d1440?.stickyAt2000) li(`${EDITION} @1440: header ${d1440.stickyAt2000.headerHeight}px; section bar ${d1440.stickyAt2000.sectionBarOn ? d1440.stickyAt2000.sectionBarHeight + "px" : "hidden"} at scrollY=2000; covered ${d1440.stickyAt2000.coveredPx}px of ${d1440.stickyAt2000.viewportHeight}px.`);

h(2, "10. Console errors, page errors, failed requests, CSP");
for (const [k, v] of Object.entries(pw.pages)) { if (!v.console) continue; if (v.console.length || v.pageErrors.length || v.requestsFailed.length || v.nonOkResponses?.length) li(`${v.url} @${v.width} ${v.scheme}: console ${v.console.length} (${[...new Set(v.console.map((c) => c.type + ": " + c.text))].join(" | ")}); pageerrors ${v.pageErrors.length}${v.pageErrors.length ? " (" + v.pageErrors.join(" | ") + ")" : ""}; failed requests ${v.requestsFailed.map((f) => f.url.replace("http://localhost:3100", "") + " " + f.error).join(", ") || "none"}; non-2xx responses ${v.nonOkResponses?.map((n) => n.url + " " + n.status).join(", ") || "none"}; CSP violations ${v.cspViolations.length}`); }
const allExternal = new Set(); for (const v of Object.values(pw.pages)) for (const e of v.resources?.external ?? []) allExternal.add(e.url);
li(`External (non-localhost) requests observed across all page loads: ${allExternal.size ? [...allExternal].join(", ") : "none"}.`);
li("No request to fonts.googleapis.com or fonts.gstatic.com was made by any page, including the research brief.");

h(2, "11. Accessibility (axe-core via @axe-core/playwright; tags wcag2a/aa, wcag21a/aa, wcag22aa, best-practice)");
const axeRows = []; for (const [k, v] of Object.entries(pw.pages)) if (v.axe) axeRows.push([v.url, v.width, v.scheme, v.axe.violations ? v.axe.violations.length : "error", v.axe.violations ? v.axe.violations.map((x) => `${x.id} (${x.impact}, ${x.nodes} node${x.nodes > 1 ? "s" : ""}, e.g. \`${x.example}\`)`).join("; ") : v.axe.error, v.axe.passes, v.axe.incomplete?.map((i) => `${i.id}×${i.nodes}`).join(", ")]);
table(["Path", "Width", "Scheme", "Violations", "Rule (impact, nodes, example selector)", "Passed rules", "Incomplete (needs review)"], axeRows);
h(3, "Landmarks, skip link, heading order, nav visibility");
for (const p of KEY) { const v = P(p, 390, "light"); const d = P(p, 1440, "light"); if (!v?.dom) continue; const lm = v.dom.landmarks; li(`${p}: header ${lm.header} (top-level ${lm.headerTopLevel}), nav ${lm.nav} [${lm.navLabels.join(", ")}], main ${lm.main} (#main is a <${lm.idMainIsDiv}> with tabindex=-1, not a <main> element), footer ${lm.footer}; skip link: ${v.dom.skipLink.present ? `"${v.dom.skipLink.text}" → ${v.dom.skipLink.href}, off-screen at rest (top ${v.dom.skipLink.rect.top}px)` : "absent"}; heading-level skips: ${v.dom.headingSkips.length ? v.dom.headingSkips.map((s) => `${s.from} → ${s.to}`).join("; ") : "none"}`); li(`${p} nav links @1440: ${d.dom.navLinks.map((n) => n.text).join(", ")}; @390: ${v.dom.navLinks.map((n) => n.text + (n.fullyInViewport ? "" : " (off-screen)")).join(", ")}; nav scrollWidth/clientWidth @390 ${v.dom.navScroll?.scrollWidth}/${v.dom.navScroll?.clientWidth} (overflows: ${v.dom.navScroll?.overflows})`); const v360 = P(p, 360, "light"); if (v360?.dom) li(`${p} nav @360: ${v360.dom.navLinks.map((n) => n.text + (n.fullyInViewport ? "" : " (off-screen)")).join(", ")}; scrollWidth/clientWidth ${v360.dom.navScroll?.scrollWidth}/${v360.dom.navScroll?.clientWidth}; header height ${v360.dom.headerHeight}px`); }
li("There is no hamburger menu: at ≤700px the four nav links sit on a second header row in a horizontally scrollable <nav> (scrollbar hidden). Whether any link is off-screen is reported above per width.");
h(3, "Focus (fresh page, Tab × 3)");
for (const p of KEY) for (const w of [390, 1440]) { const v = P(p, w, "light"); if (!v?.focus) continue; const b = v.focus[0]?.beforeFirstTab; li(`${p} @${w}: before Tab activeElement=${b?.activeElement} scrollY=${b?.scrollY}; ` + v.focus.slice(1).map((f, i) => `Tab${i + 1} → <${f.tag}${f.cls ? "." + String(f.cls).split(" ")[0] : ""}> "${f.text.replace(/\n/g, " ")}" focus-visible=${f.matchesFocusVisible} outline ${f.outlineStyle} ${f.outlineWidth} ${f.outlineColor} offset ${f.outlineOffset}`).join("; ") + ` (screenshot audit/shots/focus-${(p === "/" ? "home" : p.replace(/^\//, "").replace(/\//g, "_"))}-${w}-light.png)`); }

h(3, "Tab order probe (fresh page at 390px, 13 Tabs then 14 Shift+Tabs; with and without JavaScript)");
if (probe) for (const [u, t] of Object.entries(probe.tabOrder)) { li(`${u} with JS: start ${t.withJS.first13[0]} → ${t.withJS.first13.slice(1).join(" → ")}`); li(`${u} Shift+Tab back (with JS): ${t.withJS.shiftTabBack.join(" → ")}`); li(`${u} without JS: start ${t.withoutJS.first13[0]} → ${t.withoutJS.first13.slice(1).join(" → ")}`); li(`${u} focusable elements before .ev-special in DOM order (with JS): ${t.withJS.facts.focusableBeforeSpecial.map((f) => `${f.el} tabindex=${f.tabIndex} display=${f.display}${f.inert ? " INERT" : ""}${f.ariaHidden ? " aria-hidden" : ""}`).join(", ") || "(no .ev-special on this page)"}; inert elements: ${t.withJS.facts.inertElements.join(", ") || "none"}; autofocus: ${t.withJS.facts.autofocus}; dialogs: ${t.withJS.facts.dialogs.join(", ") || "none"}`); }
if (probe) { li(`Home .ab-strap ("A CLEARER SLICE OF A COMPLEX WORLD") computed font-size: @390 ${probe.misc["abStrap@390"]?.fontSize} (clamp(9px, 1.1vw, 13px), colour ${probe.misc["abStrap@390"]?.color}, text-shadow over the hero photo); @1440 ${probe.misc["abStrap@1440"]?.fontSize}.`); li(`Edition @390 light: .ev-sx-read em (band pill) ${JSON.stringify(probe.misc.light.evSxBandPill)}; .ev-sx-cta ${JSON.stringify(probe.misc.light.evSxCta)}; .ev-special-tag ${JSON.stringify(probe.misc.light.evSpecialTag)}; .ev-free-tag ${JSON.stringify(probe.misc.light.evFreeTag)}; .ev-bar span ${JSON.stringify(probe.misc.light.evBarSpan)}; .hdr-sub ${JSON.stringify(probe.misc.light.hdrSub)}; dark .hdr-sub ${JSON.stringify(probe.misc.dark.hdrSub)}.`); }

h(3, "Cause of the first-Tab jump on / and the edition page (audit/focus-cause.mjs)");
const fc = fs.existsSync(`${AUDIT}/focus-cause.json`) ? JSON.parse(fs.readFileSync(`${AUDIT}/focus-cause.json`, "utf8")) : null;
if (fc) { for (const [k, v] of Object.entries(fc)) li(`${k}: selection before Tab = ${v.selectionBeforeTab.type} (rangeCount ${v.selectionBeforeTab.rangeCount}), scrollY ${v.selectionBeforeTab.scrollY}; first Tab lands on ${v.firstTabLandsOn}`); li("With JavaScript on, the first Tab on / and on the edition page lands on a.ev-special, skipping the skip link, wordmark, four nav links, theme toggle, Subscribe and the Share button. With JavaScript off, or with Element.prototype.scrollIntoView replaced by a no-op before load, the first Tab lands on a.skip-link. DOM order on these pages is: header links → div#main → .ev-share (Share button + display:none links) → nav.ev-bar (inert, aria-hidden, four section links) → a.ev-special. components/SectionBar.tsx line 47 calls scrollIntoView({block:'nearest', inline:'nearest'}) on the active .ev-bar link in a useEffect on mount; in Chromium, scrollIntoView() moves the sequential-focus-navigation starting point to that element, and because the bar is inert the next Tab stop after it is .ev-special. Story, archive and about pages have no SectionBar and tab normally. Only Chromium was tested."); }

h(2, "12. Forms");
li(staticFacts.forms.emailSignup);
for (const p of KEY) { const v = P(p, 390, "light"); if (!v?.dom) continue; li(`${p}: inputs rendered: ${v.dom.inputs.length ? v.dom.inputs.map((i) => `type=${i.type} font-size ${i.fontSize} height ${i.height}px inputmode=${i.inputmode} autocomplete=${i.autocomplete}`).join("; ") : "none"}; sign-up elements present: ${v.dom.signupFallback.map((s) => `${s.selector} "${s.text.slice(0, 40)}"${s.href ? " → " + s.href : ""}${s.target ? " target=" + s.target : ""}`).join("; ")}`); }
li(staticFacts.forms.archiveSearch);

h(2, "13. Fonts, reduced motion, colour scheme (from app/globals.css and observed requests)");
for (const f of staticFacts.css.fontFace) li(f);
li(`Observed font requests on ${EDITION} @390: ${P(EDITION, 390, "light")?.fonts.map((f) => `${f.url} ${f.KB} KB (self-hosted: ${f.selfHosted})`).join("; ")}`);
li(`Font stacks: ${Object.entries(staticFacts.css.fontStacks).map(([k, v]) => `${k} = ${v}`).join("; ")}`);
li(staticFacts.css.unusedFontDeps);
li(staticFacts.css.preload);
for (const r of staticFacts.css.reducedMotion) li(`Reduced motion: ${r}`);
for (const c of staticFacts.css.colorScheme) li(`Colour scheme: ${c}`);
li(`Focus style: ${staticFacts.css.focusVisible}`);

h(2, "14. Routing and miscellany");
li(staticFacts.routing.trailingSlash);
li(staticFacts.routing.stressDataRewrite);
li("AI Stress Index data in the browser: lib/stress.ts fetches https://kkreddy79.github.io/ai-implosion/*.json server-side with revalidate 3600 (fails locally with ENOTFOUND, logged by next start); components/StressIndex.tsx only fetches from GitHub in the browser when the server could not. Across all measured page loads no request left localhost (no github.io / raw.githubusercontent.com / umami / vercel request was observed), and the edition page's AI Stress Index card (.ev-sx) rendered a score and band from data stored with the edition.");
li("Next.js link prefetch: on the edition page at 390 the browser fetched 6 RSC payloads (54 KB) at load and 28 (156 KB) after scrolling the whole page (fetch type in section 4).");

h(2, "15. Could not verify (not measurable locally)");
for (const t of ["Strict-Transport-Security and any other headers Vercel adds at the edge; CDN cache behaviour (age, x-vercel-cache, s-maxage honouring).", "Real-user timings (LCP/INP/CLS), TTFB, compression (Brotli) and HTTP/2/3 on Vercel; local load times above are on localhost.", "Vercel Analytics (/_vercel/insights/script.js) and Umami behaviour in production; locally the script 404s and Umami is not loaded.", "AI Stress Index live data (/ai-stress-index/data.json rewrite to GitHub Pages) — 500 locally; the home-page card and /ai-stress-index page therefore show their fallback/limited states here.", "Google indexation, Search Console coverage, rich-result eligibility, Discover, news-sitemap acceptance.", "Beehiiv-backed inline sign-up form (BEEHIIV_API_KEY unset locally; the external-link fallback is what rendered).", "Research brief fonts: whether 'Lora' / 'IBM Plex Mono' render on real devices depends on local installation; no web font is loaded.", "Behaviour on real iOS Safari (input zoom, share sheet, 100vh), real screen readers and real touch; Playwright Chromium with isMobile emulation only."]) li(t);

fs.writeFileSync(`${AUDIT}/REPORT.md`, L.join("\n"));
console.log("wrote", `${AUDIT}/REPORT.md`, `${AUDIT}/measurements.json`);
