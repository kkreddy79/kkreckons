# KKReckons UX / SEO measurement report (local production build)

Generated 2026-10-28T15:45:47.878Z. Measured against `next build` + `next start -p 3100` in a git worktree at the commit listed below. **The live site www.kkreckons.com could not be fetched from this sandbox (proxy 403)**, so nothing here reflects Vercel's CDN, HSTS, analytics scripts, real-user timings or Google's view of the site. This document records facts only; it makes no recommendations.

- Commit measured: 5ebae52f806e4d268d7ce4d28e1f56bd33385a51 (2026-10-27, Merge pull request #162 from kkreddy79/site/research-art)
- Pages measured: 70 page × viewport × scheme combinations across 15 URLs; key templates (/, /daily/october-28-2026, /daily/october-28-2026/1, /daily, /about) at 390 and 1440 in light and dark with the full checklist, plus 360 and 768 light; other pages at 360/390/1440 light and 390 dark.
- Screenshots: audit/shots/ (full page: home-390-light, home-1440-light, home-390-dark, daily_october-28-2026-390/1440-light, daily-390/1440-light; plus focus-*.png viewport shots after three Tab presses).

## 1. Response headers (curl -sI)

All HTML pages return the same five security headers from next.config.mjs. **Strict-Transport-Security is absent locally; next.config.mjs's comment says Vercel adds HSTS in production — this could not be verified from the sandbox.**
| Path | Status | CSP | X-Frame-Options | X-Content-Type-Options | Referrer-Policy | Permissions-Policy | Cache-Control |
| --- | --- | --- | --- | --- | --- | --- | --- |
| / | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=3600, stale-while-revalidate=31532400 |
| /daily/ | 308 | missing | missing | missing | missing | missing | missing |
| /daily | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /daily/october-28-2026 | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /daily/october-28-2026/1 | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /topics | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /topics/ai | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /ai-stress-index | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=3600, stale-while-revalidate=31532400 |
| /ai-stress-index/embed | 200 | present | missing | nosniff | strict-origin-when-cross-origin | present | public, s-maxage=3600, stale-while-revalidate=86400 |
| /about | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /week | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /quiz | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /coverage | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /standards | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /privacy | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /contact | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | s-maxage=31536000 |
| /research/ai-bubble-october-2026 | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | public, max-age=0 |
| /fonts/playfair-800.woff2 | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | public, max-age=31536000, immutable |
| /figs/2026-10-28-cover.jpg | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | public, max-age=86400, stale-while-revalidate=604800 |
| /figs/2026-10-28-1-sm.webp | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | public, max-age=86400, stale-while-revalidate=604800 |
| /icon.png | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | public, max-age=0, must-revalidate |
| /_next/static/chunks/3d_6q9uk1ylbm.css | 200 | present | DENY | nosniff | strict-origin-when-cross-origin | present | public, max-age=31536000, immutable |

- CSP value (every page except /ai-stress-index/embed): `default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://cloud.umami.is https://vercel.live; style-src 'self' 'unsafe-inline' https://vercel.live; img-src 'self' data: blob: https://vercel.live https://vercel.com; font-src 'self' https://vercel.live https://assets.vercel.com; connect-src 'self' https://kkreddy79.github.io https://raw.githubusercontent.com https://cloud.umami.is https://api-gateway.umami.dev https://vercel.live wss://ws-us3.pusher.com; frame-src 'self' https://vercel.live; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
- CSP keeps `'unsafe-inline'` for script-src and style-src (next.config.mjs explains: Next.js inlines page data and the theme script). No nonce or hash. `frame-ancestors 'none'` + `X-Frame-Options: DENY`.
- /ai-stress-index/embed: `default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors *` and no X-Frame-Options (intentionally framable).
- Permissions-Policy: `camera=(), microphone=(), geolocation=(), browsing-topics=()`.
- Cache-Control on HTML: `s-maxage=3600, stale-while-revalidate=31532400` on / and /ai-stress-index; `s-maxage=31536000` on prerendered pages (edition, story, archive, about, topics…). `/research/ai-bubble-october-2026` (static HTML file via rewrite): `public, max-age=0`.
- Static assets: /fonts/* `public, max-age=31536000, immutable`; /figs/* `public, max-age=86400, stale-while-revalidate=604800`; /_next/static/* `public, max-age=31536000, immutable`; /icon.png `public, max-age=0, must-revalidate`.
- No `Cross-Origin-Opener-Policy`, no `X-Robots-Tag` header on any page.

## 2. Raw endpoints

| Path | Status | Content-Type | Bytes |
| --- | --- | --- | --- |
| /robots.txt | 200 | text/plain | 756 |
| /sitemap.xml | 200 | application/xml | 53805 |
| /news-sitemap.xml | 200 | application/xml; charset=utf-8 | 1276 |
| /llms.txt | 200 | text/plain; charset=utf-8 | 3985 |
| /feed.xml | 200 | application/rss+xml; charset=utf-8 | 33626 |
| /.well-known/security.txt | 200 | text/plain; charset=UTF-8 | 156 |
| /manifest.json | 404 | text/html; charset=utf-8 | 19286 |
| /site.webmanifest | 404 | text/html; charset=utf-8 | 19286 |
| /manifest.webmanifest | 404 | text/html; charset=utf-8 | 19286 |
| /favicon.ico | 404 | text/html; charset=utf-8 | 19286 |
| /icon.png | 200 | image/png | 8317 |
| /apple-icon.png | 200 | image/png | 2669 |
| /ai-stress-index/data.json | 500 |  | 21 |
| /daily/summaries.json | 200 | application/json | 212899 |
| /topics/ai/feed.xml | 200 | application/rss+xml; charset=utf-8 | 36097 |
| /ai-stress-index/badge.svg | 200 | image/svg+xml; charset=utf-8 | 633 |
| /about/two-worlds.jpg | 200 | image/jpeg | 253564 |
| /research/ai-bubble-october-2026.jpg | 200 | image/jpeg | 97790 |

- robots.txt: 12 user-agent groups (*, Googlebot, Bingbot, Google-Extended, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Applebot-Extended), each `Allow: /` and `Disallow: /feedback/`; two Sitemap lines (sitemap.xml, news-sitemap.xml).
- sitemap.xml: 337 URLs (daily: 286, week: 1, quiz: 1, topics: 18, month: 2, coverage: 23, ai-stress-index: 1, research: 1, about: 1, standards: 1, contact: 1, privacy: 1); 323 have <lastmod>; **the home URL https://www.kkreckons.com is not listed**; no image sitemap extension; 0 trailing-slash URLs.
- news-sitemap.xml: 3 URLs (publication dates 2026-10-28, 2026-10-27, 2026-10-26), publication name KKReckons, language en.
- feed.xml: RSS 2.0, 30 items, atom:link rel=self present, first pubDate Wed, 28 Oct 2026 06:00:00 GMT; no content:encoded, no enclosure/media elements. Per-topic feeds exist (e.g. /topics/ai/feed.xml, 36,097 B).
- llms.txt: 3,985 B, lists latest edition, archive, AI Stress Index, about, standards, contact, RSS.
- /.well-known/security.txt: Contact mailto:kkreckons@gmail.com, Expires 2027-10-21, Canonical set.
- **No web app manifest**: /manifest.json, /site.webmanifest and /manifest.webmanifest all 404, and no `<link rel=manifest>` in any page. /favicon.ico 404 (pages link /icon.png and /apple-icon.png instead).
- /ai-stress-index/data.json returns 500 locally (rewrite to kkreddy79.github.io; blocked in the sandbox) — could not verify.
- /daily/summaries.json is a 212,899 B JSON route (used by the archive search).

## 3. Server-sent HTML (curl) per page

| Path | HTML KB | Title (length) | Meta description length | Canonical | Robots meta | H1s | Headings | JSON-LD @types | img / without alt / without w+h | script tags (external) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 139.7 | KKReckons — Read deep. Think clearly. Stay curious. (51) | 100 | https://www.kkreckons.com | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":8,"h3":5} | WebSite, Organization | 6 / 0 / 0 | 17 (8) |
| /daily | 157.1 | Catch up: every daily briefing · KKReckons (42) | 84 | https://www.kkreckons.com/daily | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":3} | CollectionPage, ItemList, ListItem, Organization | 1 / 0 / 0 | 14 (8) |
| /daily/october-28-2026 | 144 | China's AI stocks crash 40% as US neocloud debt stress spreads + 4 more \| 28 Oct 2026 · KKReckons (97) | 164 | https://www.kkreckons.com/daily/october-28-2026 | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":8,"h3":5} | NewsArticle, Person, Organization, BreadcrumbList, ListItem | 5 / 0 / 0 | 13 (8) |
| /daily/october-28-2026/1 | 50 | China's AI stocks crash 40% as US neocloud debt stress spreads \| 28 Oct 2026 · KKReckons (88) | 133 | https://www.kkreckons.com/daily/october-28-2026/1 | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":3} | NewsArticle, Person, Organization, BreadcrumbList, ListItem | 1 / 0 / 0 | 13 (8) |
| /topics | 28.9 | Topics: AI, markets, India and more · KKReckons (47) | 121 | https://www.kkreckons.com/topics | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":9} | none | 1 / 0 / 0 | 12 (8) |
| /topics/ai | 343.8 | AI news, explained: 101 stories · KKReckons (43) | 154 | https://www.kkreckons.com/topics/ai | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":31} | CollectionPage, ItemList, ListItem, Organization | 1 / 0 / 0 | 15 (8) |
| /ai-stress-index | 279.4 | AI Market Stress Index: an experimental daily AI-bubble stress gauge · KKReckons (80) | 157 | https://www.kkreckons.com/ai-stress-index | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":8} | Dataset | 2 / 0 / 1 | 14 (8) |
| /about | 44 | About KKReckons \| Signal & Spice from Two Worlds (48) | 148 | https://www.kkreckons.com/about | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":3,"h3":8} | ProfilePage, Person | 6 / 0 / 0 | 13 (8) |
| /week | 35.1 | The week in 8 stories, 22 Oct–28 Oct · KKReckons (48) | 178 | https://www.kkreckons.com/week | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":1} | CollectionPage, ItemList, ListItem, Organization | 9 / 0 / 0 | 13 (8) |
| /quiz | 26.1 | The weekly quiz, 22 Oct–28 Oct: 5 questions on the week's numbers · KKReckons (77) | 124 | https://www.kkreckons.com/quiz | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":1} | none | 1 / 0 / 0 | 12 (8) |
| /coverage | 41.1 | In the news: companies, institutions and people · KKReckons (59) | 127 | https://www.kkreckons.com/coverage | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":4,"h3":22} | none | 1 / 0 / 0 | 12 (8) |
| /standards | 23.7 | Editorial standards & corrections · KKReckons (45) | 77 | https://www.kkreckons.com/standards | index, follow, max-image-preview:large | 1 | {"h1":1} | none | 0 / 0 / 0 | 11 (7) |
| /privacy | 19.4 | Privacy · KKReckons (19) | 57 | https://www.kkreckons.com/privacy | index, follow, max-image-preview:large | 1 | {"h1":1,"h2":3} | none | 0 / 0 / 0 | 11 (7) |
| /contact | 17 | Contact · KKReckons (19) | 55 | https://www.kkreckons.com/contact | index, follow, max-image-preview:large | 1 | {"h1":1} | none | 0 / 0 / 0 | 11 (7) |
| /research/ai-bubble-october-2026 | 45.3 | Popped or leaking? The AI bubble, a KKReckons research brief (60) | 228 | https://www.kkreckons.com/research/ai-bubble-october-2026 | none | 1 | {"h1":1,"h2":12,"h3":21} | none | 0 / 0 / 0 | 0 (0) |


### /

- og:title: KKReckons — Read deep. Think clearly. Stay curious.
- og:description: Visual daily briefings on AI, markets, business, India and the world. Curated by Krishnakanth Reddy.
- og:image: https://www.kkreckons.com/figs/2026-10-28-cover.jpg (1600×900); og:type: website; og:site_name: KKReckons; og:url: none
- twitter:card: summary_large_image; twitter:creator: @kkreddy78
- JSON-LD blocks: 1; types: [["WebSite","Organization"]]
- Landmarks in HTML: header 2, nav 4, main 1, footer 1; skip link present: true; lang=en
- Preloads: /fonts/playfair-800.woff2, /_next/static/chunks/1kexj4s7oxhs2.js; stylesheet: /_next/static/chunks/3d_6q9uk1ylbm.css; icons: icon /icon.png?icon.1mlz8c1hg0vn1.png, apple-touch-icon /apple-icon.png?apple-icon.0lq4an5jw0-pn.png

Heading outline (H1–H3, first 25):
  - h1: China pops, credit wheezes, zombies nap, waists shrink, kids unplug. Capex keeps eating.
  - h2: Today in 30 seconds
  - h2: Markets at the last close before this edition · 27 Oct
  - h2: Pick of the day
  - h3: China's AI stocks crash 40% as US neocloud debt stress spreads ↗ (opens the source in a new tab)
  - h2: India edition
  - h3: India's zombie firms drop to 14.2% of listed companies, D&B finds ↗ (opens the source in a new tab)
  - h2: World edition
  - h3: Fed expected to hold as markets see 73% odds of a December rate hike ↗ (opens the source in a new tab)
  - h3: Weight-loss drugs reshape spending as 1 in 10 Americans take GLP-1s ↗ (opens the source in a new tab)
  - h3: Silicon Valley parents push schools to cut back on classroom tech ↗ (opens the source in a new tab)
  - h2: Further reading
  - h2: Related coverage
  - h2: Get tomorrow’s briefing in your inbox.


### /daily/october-28-2026

- og:title: China pops, credit wheezes, zombies nap, waists shrink, kids unplug. Capex keeps eating. | 28 Oct 2026 · KKReckons
- og:description: KKReckons briefing for Wednesday, 28 October 2026: China&#x27;s AI stocks crash 40% as US neocloud debt stress spreads · India&#x27;s zombie firms drop to 14.2% of…
- og:image: https://www.kkreckons.com/figs/2026-10-28-cover.jpg (1600×900); og:type: article; og:site_name: KKReckons; og:url: none; article:published_time: 2026-10-28
- twitter:card: summary_large_image; twitter:creator: @kkreddy78
- JSON-LD blocks: 1; types: [["NewsArticle","NewsArticle","NewsArticle","NewsArticle","NewsArticle","NewsArticle","Person","Organization","BreadcrumbList","ListItem","ListItem"]]
- Landmarks in HTML: header 1, nav 6, main 1, footer 1; skip link present: true; lang=en
- Preloads: /fonts/playfair-800.woff2, /_next/static/chunks/1kexj4s7oxhs2.js; stylesheet: /_next/static/chunks/3d_6q9uk1ylbm.css; icons: icon /icon.png?icon.1mlz8c1hg0vn1.png, apple-touch-icon /apple-icon.png?apple-icon.0lq4an5jw0-pn.png

Heading outline (H1–H3, first 25):
  - h1: China pops, credit wheezes, zombies nap, waists shrink, kids unplug. Capex keeps eating.
  - h2: Today in 30 seconds
  - h2: Markets at the last close before this edition · 27 Oct
  - h2: Pick of the day
  - h3: China's AI stocks crash 40% as US neocloud debt stress spreads ↗ (opens the source in a new tab)
  - h2: India edition
  - h3: India's zombie firms drop to 14.2% of listed companies, D&B finds ↗ (opens the source in a new tab)
  - h2: World edition
  - h3: Fed expected to hold as markets see 73% odds of a December rate hike ↗ (opens the source in a new tab)
  - h3: Weight-loss drugs reshape spending as 1 in 10 Americans take GLP-1s ↗ (opens the source in a new tab)
  - h3: Silicon Valley parents push schools to cut back on classroom tech ↗ (opens the source in a new tab)
  - h2: Further reading
  - h2: Related coverage
  - h2: Read deep. Think clearly. Stay curious.


### /daily/october-28-2026/1

- og:title: China&#x27;s AI stocks crash 40% as US neocloud debt stress spreads
- og:description: China&#x27;s STAR50 index of AI and chip stocks fell 40% in under four months, erasing about $480bn, Reuters reported on 26 Oct 2026.
- og:image: https://www.kkreckons.com/figs/2026-10-28-1.jpg (1280×3778); og:type: article; og:site_name: KKReckons; og:url: none; article:published_time: 2026-10-28
- twitter:card: summary_large_image; twitter:creator: @kkreddy78
- JSON-LD blocks: 1; types: [["NewsArticle","Person","Organization","BreadcrumbList","ListItem","ListItem","ListItem"]]
- Landmarks in HTML: header 1, nav 4, main 1, footer 1; skip link present: true; lang=en
- Preloads: /fonts/playfair-800.woff2, /_next/static/chunks/1kexj4s7oxhs2.js; stylesheet: /_next/static/chunks/3d_6q9uk1ylbm.css; icons: icon /icon.png?icon.1mlz8c1hg0vn1.png, apple-touch-icon /apple-icon.png?apple-icon.0lq4an5jw0-pn.png

Heading outline (H1–H3, first 25):
  - h1: China's AI stocks crash 40% as US neocloud debt stress spreads ↗ (opens the source in a new tab)
  - h2: Read next
  - h2: Also in this edition
  - h2: Read deep. Think clearly. Stay curious.


### /daily

- og:title: Catch up: every daily briefing · KKReckons
- og:description: Missed a day? Every KKReckons edition, organised by date, with searchable headlines.
- og:image: https://www.kkreckons.com/about/two-worlds.jpg (no og:image:width/height); og:type: website; og:site_name: KKReckons; og:url: none
- twitter:card: summary_large_image; twitter:creator: @kkreddy78
- JSON-LD blocks: 1; types: [["CollectionPage","ItemList","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","ListItem","Organization"]]
- Landmarks in HTML: header 2, nav 2, main 1, footer 1; skip link present: true; lang=en
- Preloads: /fonts/playfair-800.woff2, /_next/static/chunks/1kexj4s7oxhs2.js; stylesheet: /_next/static/chunks/3d_6q9uk1ylbm.css; icons: icon /icon.png?icon.1mlz8c1hg0vn1.png, apple-touch-icon /apple-icon.png?apple-icon.0lq4an5jw0-pn.png

Heading outline (H1–H3, first 25):
  - h1: Missed a day? It’s all here.
  - h2: October 2026
  - h2: September 2026
  - h2: Read deep. Think clearly. Stay curious.


### /about

- og:title: About KKReckons | Signal &amp; Spice from Two Worlds
- og:description: Meet Krishnakanth Reddy and KKReckons: visual daily briefings on AI, markets, business and global affairs, with sources, context and the other side.
- og:image: https://www.kkreckons.com/about/two-worlds.jpg (2000×816); og:type: none; og:site_name: none; og:url: https://www.kkreckons.com/about
- twitter:card: summary_large_image; twitter:creator: @kkreddy78
- JSON-LD blocks: 1; types: [["ProfilePage","Person"]]
- Landmarks in HTML: header 2, nav 2, main 1, footer 1; skip link present: true; lang=en
- Preloads: /fonts/playfair-800.woff2, /_next/static/chunks/1kexj4s7oxhs2.js; stylesheet: /_next/static/chunks/3d_6q9uk1ylbm.css; icons: icon /icon.png?icon.1mlz8c1hg0vn1.png, apple-touch-icon /apple-icon.png?apple-icon.0lq4an5jw0-pn.png

Heading outline (H1–H3, first 25):
  - h1: One foot in each world, and a news tab open in both.
  - h2: Capital markets meet technology.
  - h2: Way too much news, so you don’t have to.
  - h3: Instant noodles.
  - h3: A 40-page tasting menu.
  - h3: The third option.
  - h3: AI & Technology
  - h3: Markets & Economy
  - h3: Business & Companies
  - h3: U.S. & Global Affairs
  - h3: Science & More
  - h2: Read deep. Think clearly. Stay curious.


### /research/ai-bubble-october-2026 (static HTML file)

- Title: Popped or leaking? The AI bubble, a KKReckons research brief (60); description length 228; canonical https://www.kkreckons.com/research/ai-bubble-october-2026; robots meta: none; JSON-LD: none; 0 script tags; viewport width=device-width,initial-scale=1,viewport-fit=cover.
- Font stacks declared inline: --display: 'Lora', Georgia, 'Times New Roman', serif; --mono: 'IBM Plex Mono', ui-monospace, Menlo, monospace. There is no @font-face, no <link> to fonts.googleapis.com and no @import in the file, so 'Lora' and 'IBM Plex Mono' only render if installed locally; otherwise Georgia / system monospace are used. No external requests of any kind were observed when rendering it (see section 10).
- Headings: {"h1":1,"h2":12,"h3":21}; images in HTML: 0.

## 4. Rendered weight and requests (Playwright, local)

Bytes are wire bytes at the `load` event (plus ~1.5–2 s settle); 'after full scroll' re-counts after scrolling the whole page so lazy images and Next.js link prefetches load. `/_vercel/insights/script.js` 404s locally because Vercel Analytics is only served on Vercel.
| Path | Width | Scheme | Requests | Total KB | By type (count/KB) | After full scroll | DOM nodes | load (ms, local) | Page height px |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 390 | light | 19 | 404.6 | document 1/139.7KB; font 2/37.1KB; stylesheet 1/12.5KB; image 1/43.3KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB | 45 req / 758.2 KB | 665 | 341 | 12443 |
| / | 1440 | light | 20 | 557.1 | document 1/139.7KB; image 2/195.8KB; stylesheet 1/12.5KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB | 45 req / 806.6 KB | 665 | 455 | 7242 |
| / | 390 | dark | 19 | 404.6 | document 1/139.7KB; font 2/37.1KB; stylesheet 1/12.5KB; image 1/43.3KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB | 45 req / 758.2 KB | 666 | 298 | 12443 |
| / | 1440 | dark | 20 | 557.1 | document 1/139.7KB; stylesheet 1/12.5KB; font 2/37.1KB; image 2/195.8KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB | 45 req / 806.6 KB | 666 | 318 | 7242 |
| / | 360 | light | 19 | 404.6 | document 1/139.7KB; font 2/37.1KB; stylesheet 1/12.5KB; image 1/43.3KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB |  | 665 | 302 | 13126 |
| / | 768 | light | 20 | 557.1 | document 1/139.7KB; stylesheet 1/12.5KB; image 2/195.8KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB |  | 665 | 321 | 8726 |
| /daily/october-28-2026 | 390 | light | 22 | 511 | document 1/144KB; stylesheet 1/12.5KB; font 2/37.1KB; script 10/150.9KB; image 1/104.1KB; other 1/8.1KB; fetch 6/54.3KB | 49 req / 778.2 KB | 657 | 293 | 12353 |
| /daily/october-28-2026 | 1440 | light | 22 | 511 | document 1/144KB; stylesheet 1/12.5KB; font 2/37.1KB; script 10/150.9KB; image 1/104.1KB; other 1/8.1KB; fetch 6/54.3KB | 49 req / 778.2 KB | 657 | 324 | 7193 |
| /daily/october-28-2026 | 390 | dark | 22 | 511 | document 1/144KB; font 2/37.1KB; stylesheet 1/12.5KB; script 10/150.9KB; image 1/104.1KB; other 1/8.1KB; fetch 6/54.3KB | 49 req / 778.2 KB | 658 | 461 | 12353 |
| /daily/october-28-2026 | 1440 | dark | 22 | 511 | document 1/144KB; font 2/37.1KB; stylesheet 1/12.5KB; script 10/150.9KB; image 1/104.1KB; other 1/8.1KB; fetch 6/54.3KB | 49 req / 778.2 KB | 658 | 482 | 7193 |
| /daily/october-28-2026 | 360 | light | 22 | 511 | document 1/144KB; font 2/37.1KB; stylesheet 1/12.5KB; script 10/150.9KB; image 1/104.1KB; other 1/8.1KB; fetch 6/54.3KB |  | 657 | 270 | 13039 |
| /daily/october-28-2026 | 768 | light | 22 | 511 | document 1/144KB; font 2/37.1KB; stylesheet 1/12.5KB; image 1/104.1KB; script 10/150.9KB; other 1/8.1KB; fetch 6/54.3KB |  | 657 | 341 | 8842 |
| /daily/october-28-2026/1 | 390 | light | 24 | 431.3 | document 1/50KB; image 1/104.1KB; stylesheet 1/12.5KB; font 2/37.1KB; script 10/150.9KB; other 1/8.1KB; fetch 8/68.5KB | 57 req / 523.2 KB | 225 | 290 | 3657 |
| /daily/october-28-2026/1 | 1440 | light | 24 | 431.3 | document 1/50KB; font 2/37.1KB; stylesheet 1/12.5KB; image 1/104.1KB; script 10/150.9KB; other 1/8.1KB; fetch 8/68.5KB | 57 req / 523.2 KB | 225 | 313 | 2101 |
| /daily/october-28-2026/1 | 390 | dark | 24 | 431.3 | document 1/50KB; stylesheet 1/12.5KB; image 1/104.1KB; font 2/37.1KB; script 10/150.9KB; other 1/8.1KB; fetch 8/68.5KB | 57 req / 523.2 KB | 226 | 216 | 3657 |
| /daily/october-28-2026/1 | 1440 | dark | 24 | 431.3 | document 1/50KB; stylesheet 1/12.5KB; image 1/104.1KB; font 2/37.1KB; script 10/150.9KB; other 1/8.1KB; fetch 8/68.5KB | 57 req / 523.2 KB | 226 | 264 | 2101 |
| /daily/october-28-2026/1 | 360 | light | 24 | 431.3 | document 1/50KB; font 2/37.1KB; image 1/104.1KB; stylesheet 1/12.5KB; script 10/150.9KB; other 1/8.1KB; fetch 8/68.5KB |  | 225 | 316 | 3984 |
| /daily/october-28-2026/1 | 768 | light | 24 | 431.3 | document 1/50KB; stylesheet 1/12.5KB; image 1/104.1KB; font 2/37.1KB; script 10/150.9KB; other 1/8.1KB; fetch 8/68.5KB |  | 225 | 270 | 2604 |
| /daily | 1440 | light | 24 | 509.4 | document 1/157.1KB; font 2/37.1KB; stylesheet 1/12.5KB; image 1/91.6KB; script 10/150.9KB; other 1/8.1KB; fetch 8/52.1KB | 101 req / 996.1 KB | 421 | 355 | 6982 |
| /daily | 390 | dark | 22 | 443.5 | document 1/157.1KB; stylesheet 1/12.5KB; image 1/43.3KB; font 2/37.1KB; script 10/150.9KB; other 1/8.1KB; fetch 6/34.5KB | 98 req / 905.3 KB | 422 | 361 | 9158 |
| /daily | 1440 | dark | 24 | 509.4 | document 1/157.1KB; stylesheet 1/12.5KB; font 2/37.1KB; image 1/91.6KB; script 10/150.9KB; other 1/8.1KB; fetch 8/52.1KB | 101 req / 996.1 KB | 422 | 408 | 6982 |
| /daily | 360 | light | 22 | 443.5 | document 1/157.1KB; image 1/43.3KB; font 2/37.1KB; stylesheet 1/12.5KB; script 10/150.9KB; other 1/8.1KB; fetch 6/34.5KB |  | 421 | 231 | 9375 |
| /daily | 768 | light | 24 | 509.4 | document 1/157.1KB; image 1/91.6KB; stylesheet 1/12.5KB; font 2/37.1KB; script 10/150.9KB; other 1/8.1KB; fetch 8/52.1KB |  | 421 | 266 | 8806 |
| /about | 390 | light | 24 | 463.2 | document 1/44KB; image 6/197.7KB; stylesheet 1/12.5KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB | 39 req / 498.8 KB | 245 | 407 | 3922 |
| /about | 1440 | light | 24 | 511.6 | document 1/44KB; stylesheet 1/12.5KB; image 6/246.1KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB | 39 req / 547.1 KB | 245 | 283 | 2490 |
| /about | 390 | dark | 24 | 463.2 | document 1/44KB; image 6/197.7KB; font 2/37.1KB; stylesheet 1/12.5KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB | 39 req / 498.8 KB | 246 | 408 | 3922 |
| /about | 1440 | dark | 24 | 511.6 | document 1/44KB; stylesheet 1/12.5KB; image 6/246.1KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB | 39 req / 547.1 KB | 246 | 317 | 2490 |
| /about | 360 | light | 24 | 463.2 | document 1/44KB; font 2/37.1KB; stylesheet 1/12.5KB; image 6/197.7KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB |  | 245 | 266 | 4024 |
| /about | 768 | light | 24 | 511.6 | document 1/44KB; stylesheet 1/12.5KB; font 2/37.1KB; image 6/246.1KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB |  | 245 | 274 | 2695 |
| /topics | 360 | light | 25 | 380.1 | document 1/28.9KB; stylesheet 1/12.5KB; image 1/43.3KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 10/106.5KB |  | 172 | 248 | 3098 |
| /topics | 390 | light | 25 | 380.1 | document 1/28.9KB; font 2/37.1KB; image 1/43.3KB; stylesheet 1/12.5KB; script 9/143.6KB; other 1/8.1KB; fetch 10/106.5KB |  | 172 | 208 | 3013 |
| /topics | 1440 | light | 37 | 559.3 | document 1/28.9KB; font 2/37.1KB; image 1/91.6KB; stylesheet 1/12.5KB; script 9/143.6KB; other 1/8.1KB; fetch 22/237.4KB |  | 172 | 217 | 1465 |
| /topics | 390 | dark | 25 | 380.1 | document 1/28.9KB; stylesheet 1/12.5KB; font 2/37.1KB; image 1/43.3KB; script 9/143.6KB; other 1/8.1KB; fetch 10/106.5KB |  | 173 | 242 | 3013 |
| /topics/ai | 360 | light | 23 | 627.6 | document 1/343.8KB; image 1/43.3KB; stylesheet 1/12.5KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 8/39.1KB |  | 1336 | 296 | 11802 |
| /topics/ai | 390 | light | 23 | 627.6 | document 1/343.8KB; font 2/37.1KB; stylesheet 1/12.5KB; image 1/43.3KB; script 9/143.6KB; other 1/8.1KB; fetch 8/39.1KB |  | 1336 | 301 | 10902 |
| /topics/ai | 1440 | light | 25 | 693.5 | document 1/343.8KB; image 1/91.6KB; stylesheet 1/12.5KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 10/56.7KB |  | 1336 | 345 | 5944 |
| /topics/ai | 390 | dark | 23 | 627.6 | document 1/343.8KB; stylesheet 1/12.5KB; font 2/37.1KB; image 1/43.3KB; script 9/143.6KB; other 1/8.1KB; fetch 8/39.1KB |  | 1337 | 246 | 10902 |
| /ai-stress-index | 360 | light | 22 | 600.4 | document 1/279.4KB; font 2/37.1KB; stylesheet 2/17KB; image 2/76.5KB; script 10/162KB; other 1/8.1KB; fetch 4/20.2KB |  | 1415 | 402 | 9119 |
| /ai-stress-index | 390 | light | 22 | 600.4 | document 1/279.4KB; image 2/76.5KB; stylesheet 2/17KB; font 2/37.1KB; script 10/162KB; other 1/8.1KB; fetch 4/20.2KB |  | 1415 | 398 | 8761 |
| /ai-stress-index | 1440 | light | 22 | 692.2 | document 1/279.4KB; font 2/37.1KB; image 2/168.3KB; stylesheet 2/17KB; script 10/162KB; other 1/8.1KB; fetch 4/20.2KB |  | 1415 | 286 | 5701 |
| /ai-stress-index | 390 | dark | 22 | 600.4 | document 1/279.4KB; stylesheet 2/17KB; image 2/76.5KB; font 2/37.1KB; script 10/162KB; other 1/8.1KB; fetch 4/20.2KB |  | 1416 | 365 | 8761 |
| /week | 360 | light | 33 | 684 | document 1/35.1KB; stylesheet 1/12.5KB; image 9/407.4KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 10/40.1KB |  | 180 | 463 | 2884 |
| /week | 390 | light | 35 | 690.7 | document 1/35.1KB; stylesheet 1/12.5KB; image 9/407.4KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 12/46.9KB |  | 180 | 334 | 2655 |
| /week | 1440 | light | 35 | 739.1 | document 1/35.1KB; font 2/37.1KB; stylesheet 1/12.5KB; image 9/455.8KB; script 9/143.6KB; other 1/8.1KB; fetch 12/46.9KB |  | 180 | 243 | 2248 |
| /week | 390 | dark | 35 | 690.7 | document 1/35.1KB; image 9/407.4KB; stylesheet 1/12.5KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 12/46.9KB |  | 181 | 335 | 2655 |
| /quiz | 360 | light | 20 | 292.7 | document 1/26.1KB; stylesheet 1/12.5KB; image 1/43.3KB; font 2/37.1KB; script 10/145.4KB; other 1/8.1KB; fetch 4/20.2KB |  | 153 | 285 | 2537 |
| /quiz | 390 | light | 20 | 292.7 | document 1/26.1KB; stylesheet 1/12.5KB; image 1/43.3KB; font 2/37.1KB; script 10/145.4KB; other 1/8.1KB; fetch 4/20.2KB |  | 153 | 365 | 2358 |
| /quiz | 1440 | light | 20 | 341.1 | document 1/26.1KB; font 2/37.1KB; stylesheet 1/12.5KB; image 1/91.6KB; script 10/145.4KB; other 1/8.1KB; fetch 4/20.2KB |  | 153 | 339 | 1664 |
| /quiz | 390 | dark | 20 | 292.7 | document 1/26.1KB; stylesheet 1/12.5KB; image 1/43.3KB; font 2/37.1KB; script 10/145.4KB; other 1/8.1KB; fetch 4/20.2KB |  | 154 | 285 | 2358 |
| /coverage | 360 | light | 25 | 327.9 | document 1/41.1KB; font 2/37.1KB; stylesheet 1/12.5KB; image 1/43.3KB; script 9/143.6KB; other 1/8.1KB; fetch 10/42.2KB |  | 278 | 334 | 6095 |
| /coverage | 390 | light | 25 | 327.9 | document 1/41.1KB; stylesheet 1/12.5KB; image 1/43.3KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 10/42.2KB |  | 278 | 395 | 5918 |
| /coverage | 1440 | light | 43 | 430.5 | document 1/41.1KB; stylesheet 1/12.5KB; font 2/37.1KB; image 1/91.6KB; script 9/143.6KB; other 1/8.1KB; fetch 28/96.5KB |  | 278 | 341 | 2705 |
| /coverage | 390 | dark | 25 | 327.9 | document 1/41.1KB; font 2/37.1KB; image 1/43.3KB; stylesheet 1/12.5KB; script 9/143.6KB; other 1/8.1KB; fetch 10/42.2KB |  | 279 | 273 | 5918 |
| /standards | 360 | light | 20 | 248.3 | document 1/23.7KB; stylesheet 1/12.5KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 6/23.2KB |  | 126 | 255 | 1525 |
| /standards | 390 | light | 20 | 248.3 | document 1/23.7KB; stylesheet 1/12.5KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 6/23.2KB |  | 126 | 257 | 1462 |
| /standards | 1440 | light | 33 | 280.8 | document 1/23.7KB; stylesheet 1/12.5KB; font 2/37.1KB; script 10/145.4KB; other 1/8.1KB; fetch 18/54KB |  | 127 | 222 | 900 |
| /standards | 390 | dark | 20 | 248.3 | document 1/23.7KB; font 2/37.1KB; stylesheet 1/12.5KB; script 9/143.6KB; other 1/8.1KB; fetch 6/23.2KB |  | 127 | 201 | 1462 |
| /privacy | 360 | light | 18 | 240.9 | document 1/19.4KB; stylesheet 1/12.5KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB |  | 106 | 220 | 2013 |
| /privacy | 390 | light | 18 | 240.9 | document 1/19.4KB; stylesheet 1/12.5KB; font 2/37.1KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB |  | 106 | 261 | 1904 |
| /privacy | 1440 | light | 18 | 240.9 | document 1/19.4KB; font 2/37.1KB; stylesheet 1/12.5KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB |  | 106 | 318 | 1478 |
| /privacy | 390 | dark | 18 | 240.9 | document 1/19.4KB; font 2/37.1KB; stylesheet 1/12.5KB; script 9/143.6KB; other 1/8.1KB; fetch 4/20.2KB |  | 107 | 285 | 1904 |
| /contact | 360 | light | 33 | 274.1 | document 1/17KB; stylesheet 1/12.5KB; font 2/37.1KB; script 10/145.4KB; other 1/8.1KB; fetch 18/54KB |  | 96 | 172 | 933 |
| /contact | 390 | light | 33 | 274.1 | stylesheet 1/12.5KB; document 1/17KB; font 2/37.1KB; script 10/145.4KB; other 1/8.1KB; fetch 18/54KB |  | 96 | 176 | 907 |
| /contact | 1440 | light | 33 | 274.1 | font 2/37.1KB; stylesheet 1/12.5KB; document 1/17KB; script 10/145.4KB; other 1/8.1KB; fetch 18/54KB |  | 96 | 205 | 900 |
| /contact | 390 | dark | 33 | 274.1 | document 1/17KB; font 2/37.1KB; stylesheet 1/12.5KB; script 10/145.4KB; other 1/8.1KB; fetch 18/54KB |  | 97 | 228 | 907 |
| /research/ai-bubble-october-2026 | 360 | light | 2 | 53.4 | document 1/45.3KB; other 1/8.1KB |  | 602 | 58 | 15639 |
| /research/ai-bubble-october-2026 | 390 | light | 2 | 53.4 | document 1/45.3KB; other 1/8.1KB |  | 602 | 114 | 14860 |
| /research/ai-bubble-october-2026 | 1440 | light | 2 | 53.4 | document 1/45.3KB; other 1/8.1KB |  | 602 | 77 | 9146 |
| /research/ai-bubble-october-2026 | 390 | dark | 2 | 53.4 | document 1/45.3KB; other 1/8.1KB |  | 602 | 59 | 14860 |
| /daily | 390 | light | 22 | 443.5 | document 1/157.1KB; font 2/37.1KB; stylesheet 1/12.5KB; image 1/43.3KB; script 10/150.9KB; other 1/8.1KB; fetch 6/34.5KB | 101 req / 947.7 KB | 421 | 303 | 9158 |


### Five heaviest assets per key template (390 light; after full scroll)

**/** (at load: 19 requests, 404.6 KB; after full scroll: 45 requests, 758.2 KB)
| Asset | Type | Wire KB | Decoded KB | Encoding | Natural px | Rendered px | loading | width/height attrs | Cache-Control |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | document | 139.7 | 139.7 | gzip |  |  |  |  | s-maxage=3600, stale-while-revalidate=31532400 |
| /figs/2026-10-28-1-sm.webp | image | 104.1 | 104.1 |  | 390×1151 | 324×956 | lazy | 1280×3778 | public, max-age=86400, stale-while-revalidate=604800 |
| /_next/static/chunks/29cfjy6-q2bo9.js | script | 70 | 223.3 | gzip |  |  |  |  | public, max-age=31536000, immutable |
| /_next/static/chunks/2e268anpfvdoc.js | script | 45.3 | 164.4 | gzip |  |  |  |  | public, max-age=31536000, immutable |
| /figs/2026-10-28-2-sm.webp | image | 43.9 | 43.9 |  | 390×528 | 324×439 | lazy | 1280×1733 | public, max-age=86400, stale-while-revalidate=604800 |

**/daily/october-28-2026** (at load: 22 requests, 511 KB; after full scroll: 49 requests, 778.2 KB)
| Asset | Type | Wire KB | Decoded KB | Encoding | Natural px | Rendered px | loading | width/height attrs | Cache-Control |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /daily/october-28-2026 | document | 144 | 144 | gzip |  |  |  |  | s-maxage=31536000 |
| /figs/2026-10-28-1-sm.webp | image | 104.1 | 104.1 |  | 390×1151 | 324×956 | lazy | 1280×3778 | public, max-age=86400, stale-while-revalidate=604800 |
| /_next/static/chunks/29cfjy6-q2bo9.js | script | 70 | 223.3 | gzip |  |  |  |  | public, max-age=31536000, immutable |
| /_next/static/chunks/2e268anpfvdoc.js | script | 45.3 | 164.4 | gzip |  |  |  |  | public, max-age=31536000, immutable |
| /figs/2026-10-28-2-sm.webp | image | 43.9 | 43.9 |  | 390×528 | 324×439 | lazy | 1280×1733 | public, max-age=86400, stale-while-revalidate=604800 |

**/daily/october-28-2026/1** (at load: 24 requests, 431.3 KB; after full scroll: 57 requests, 523.2 KB)
| Asset | Type | Wire KB | Decoded KB | Encoding | Natural px | Rendered px | loading | width/height attrs | Cache-Control |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /figs/2026-10-28-1-sm.webp | image | 104.1 | 104.1 |  | 390×1151 | 324×956 | eager | 1280×3778 | public, max-age=86400, stale-while-revalidate=604800 |
| /_next/static/chunks/29cfjy6-q2bo9.js | script | 70 | 223.3 | gzip |  |  |  |  | public, max-age=31536000, immutable |
| /daily/october-28-2026/1 | document | 50 | 50 | gzip |  |  |  |  | s-maxage=31536000 |
| /_next/static/chunks/2e268anpfvdoc.js | script | 45.3 | 164.4 | gzip |  |  |  |  | public, max-age=31536000, immutable |
| /daily?_rsc=FXX-gaeT5m3M_5qD | fetch | 33.8 | 112 | gzip |  |  |  |  | s-maxage=31536000 |

**/daily** (at load: 22 requests, 443.5 KB; after full scroll: 101 requests, 947.7 KB)
| Asset | Type | Wire KB | Decoded KB | Encoding | Natural px | Rendered px | loading | width/height attrs | Cache-Control |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /daily | document | 157.1 | 157.1 | gzip |  |  |  |  | s-maxage=31536000 |
| /_next/static/chunks/29cfjy6-q2bo9.js | script | 70 | 223.3 | gzip |  |  |  |  | public, max-age=31536000, immutable |
| /_next/static/chunks/2e268anpfvdoc.js | script | 45.3 | 164.4 | gzip |  |  |  |  | public, max-age=31536000, immutable |
| /about/two-worlds-mobile.avif | image | 43.3 | 43.3 |  | 1200×749 | 390×170 |  | 2000×816 | public, max-age=0 |
| /fonts/playfair-700.woff2 | font | 18.6 | 18.6 |  |  |  |  |  | public, max-age=31536000, immutable |

**/about** (at load: 24 requests, 463.2 KB; after full scroll: 39 requests, 498.8 KB)
| Asset | Type | Wire KB | Decoded KB | Encoding | Natural px | Rendered px | loading | width/height attrs | Cache-Control |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /_next/static/chunks/29cfjy6-q2bo9.js | script | 70 | 223.3 | gzip |  |  |  |  | public, max-age=31536000, immutable |
| /about/day.webp | image | 48 | 48 |  | 880×372 | 358×151 | lazy | 880×372 | public, max-age=0 |
| /_next/static/chunks/2e268anpfvdoc.js | script | 45.3 | 164.4 | gzip |  |  |  |  | public, max-age=31536000, immutable |
| /about | document | 44 | 44 | gzip |  |  |  |  | s-maxage=31536000 |
| /about/two-worlds-mobile.avif | image | 43.3 | 43.3 |  | 1200×749 | 390×243 |  | 2000×816 | public, max-age=0 |


### Five heaviest assets per key template (1440 light; after full scroll)

**/** (at load 557.1 KB; after full scroll 806.6 KB)
| Asset | Type | Wire KB | Natural px | Rendered px | loading |
| --- | --- | --- | --- | --- | --- |
| / | document | 139.7 |  |  |  |
| /figs/2026-10-28-1-sm.webp | image | 104.1 | 559×1652 | 410×1209 | lazy |
| /about/two-worlds.avif | image | 91.6 | 2000×816 | 1440×250 |  |
| /_next/static/chunks/29cfjy6-q2bo9.js | script | 70 |  |  |  |
| /_next/static/chunks/2e268anpfvdoc.js | script | 45.3 |  |  |  |

**/daily/october-28-2026** (at load 511 KB; after full scroll 778.2 KB)
| Asset | Type | Wire KB | Natural px | Rendered px | loading |
| --- | --- | --- | --- | --- | --- |
| /daily/october-28-2026 | document | 144 |  |  |  |
| /figs/2026-10-28-1-sm.webp | image | 104.1 | 559×1652 | 410×1209 | lazy |
| /_next/static/chunks/29cfjy6-q2bo9.js | script | 70 |  |  |  |
| /_next/static/chunks/2e268anpfvdoc.js | script | 45.3 |  |  |  |
| /figs/2026-10-28-2-sm.webp | image | 43.9 | 480×650 | 410×555 | lazy |

**/daily/october-28-2026/1** (at load 431.3 KB; after full scroll 523.2 KB)
| Asset | Type | Wire KB | Natural px | Rendered px | loading |
| --- | --- | --- | --- | --- | --- |
| /figs/2026-10-28-1-sm.webp | image | 104.1 | 559×1652 | 429×1267 | eager |
| /_next/static/chunks/29cfjy6-q2bo9.js | script | 70 |  |  |  |
| /daily/october-28-2026/1 | document | 50 |  |  |  |
| /_next/static/chunks/2e268anpfvdoc.js | script | 45.3 |  |  |  |
| /daily?_rsc=FXX-gaeT5m3M_5qD | fetch | 33.8 |  |  |  |

**/daily** (at load 509.4 KB; after full scroll 996.1 KB)
| Asset | Type | Wire KB | Natural px | Rendered px | loading |
| --- | --- | --- | --- | --- | --- |
| /daily | document | 157.1 |  |  |  |
| /about/two-worlds.avif | image | 91.6 | 2000×816 | 1440×250 |  |
| /_next/static/chunks/29cfjy6-q2bo9.js | script | 70 |  |  |  |
| /_next/static/chunks/2e268anpfvdoc.js | script | 45.3 |  |  |  |
| /fonts/playfair-700.woff2 | font | 18.6 |  |  |  |

**/about** (at load 511.6 KB; after full scroll 547.1 KB)
| Asset | Type | Wire KB | Natural px | Rendered px | loading |
| --- | --- | --- | --- | --- | --- |
| /about/two-worlds.avif | image | 91.6 | 2000×816 | 1440×440 |  |
| /_next/static/chunks/29cfjy6-q2bo9.js | script | 70 |  |  |  |
| /about/day.webp | image | 48 | 880×372 | 507×214 | lazy |
| /_next/static/chunks/2e268anpfvdoc.js | script | 45.3 |  |  |  |
| /about | document | 44 |  |  |  |


### Images

- /: 6 <img>; without width+height attributes: none; /about/two-worlds-mobile.avif natural 1200×749 rendered 390×170; /figs/2026-10-28-1-sm.webp natural 390×1151 rendered 324×956 loading=lazy; /figs/2026-10-28-2-sm.webp natural 390×528 rendered 324×439 loading=lazy; /figs/2026-10-28-3-sm.webp natural 390×521 rendered 324×433 loading=lazy; /figs/2026-10-28-4-sm.webp natural 390×521 rendered 324×433 loading=lazy; /figs/2026-10-28-5-sm.webp natural 390×521 rendered 324×433 loading=lazy
- /daily/october-28-2026: 5 <img>; without width+height attributes: none; /figs/2026-10-28-1-sm.webp natural 390×1151 rendered 324×956 loading=lazy; /figs/2026-10-28-2-sm.webp natural 390×528 rendered 324×439 loading=lazy; /figs/2026-10-28-3-sm.webp natural 390×521 rendered 324×433 loading=lazy; /figs/2026-10-28-4-sm.webp natural 390×521 rendered 324×433 loading=lazy; /figs/2026-10-28-5-sm.webp natural 390×521 rendered 324×433 loading=lazy
- /daily/october-28-2026/1: 1 <img>; without width+height attributes: none; /figs/2026-10-28-1-sm.webp natural 390×1151 rendered 324×956 loading=eager
- /daily: 1 <img>; without width+height attributes: none; /about/two-worlds-mobile.avif natural 1200×749 rendered 390×170
- /about: 6 <img>; without width+height attributes: none; /about/two-worlds-mobile.avif natural 1200×749 rendered 390×243; /about/day.webp natural 880×372 rendered 358×151 loading=lazy; /about/night.webp natural 880×370 rendered 358×151 loading=lazy; /about/noodles.webp natural 388×260 rendered 125×84 loading=lazy; /about/books.webp natural 340×260 rendered 110×84 loading=lazy; /about/cake.webp natural 496×260 rendered 210×110 loading=lazy
- /ai-stress-index: 2 <img>; without width+height: /ai-stress-index/badge.svg.
- Note on 'natural' sizes: img.naturalWidth/naturalHeight are density-corrected by the browser for srcset 'w' candidates, so the same file reports 390×1151 at 390px (sizes=100vw) and 559×1652 at 1440px (sizes=560px). Actual files (sharp metadata): 2026-10-28-1-sm.webp 640×1889 (106,646 B), -md.webp 860×2538 (146,842 B), -lg.webp 1280×3778 (232,472 B), 2026-10-28-1.jpg 1280×3778 (449,083 B), 2026-10-28-cover.jpg 1600×900 (48,209 B).
- Story graphics use <picture> with srcSet sm 640 / md 860 / lg ≤1600 (components/EditionView.tsx:159–167) and sizes '(max-width: 700px) 100vw, 480px' (560px for wide); the fallback <img> carries the original width/height (e.g. 1280×3778) while the chosen webp is 390×1151 at phone width.

### Largest element above the fold

- / @390: image img (/about/two-worlds-mobile.avif) at 0,86 390×170px — ""
- / @1440: image img (/about/two-worlds.avif) at 0,68 1440×250px — ""
- /daily/october-28-2026 @390: text h1.ev-slice at 16,138 358×130px — "China pops, credit wheezes, zombies nap, waists shrink, kids unplug. C"
- /daily/october-28-2026 @1440: text h1.ev-slice at 204,130 900×175px — "China pops, credit wheezes, zombies nap, waists shrink, kids unplug. C"
- /daily/october-28-2026/1 @390: image img (/figs/2026-10-28-1-sm.webp) at 33,257 324×956px — ""
- /daily/october-28-2026/1 @1440: image img (/figs/2026-10-28-1-sm.webp) at 229,152 429×1267px — ""
- /daily @390: image img (/about/two-worlds-mobile.avif) at 0,86 390×170px — ""
- /daily @1440: image img (/about/two-worlds.avif) at 0,68 1440×250px — ""
- /about @390: image img (/about/two-worlds-mobile.avif) at 0,86 390×243px — ""
- /about @1440: image img (/about/two-worlds.avif) at 0,68 1440×440px — ""

## 5. Horizontal scroll (document.scrollWidth > innerWidth)

| Path | Width | Scheme | scrollWidth | innerWidth | Horizontal scroll | Elements past the right edge (excluding intentional scrollers) |
| --- | --- | --- | --- | --- | --- | --- |
| / | 390 | light | 390 | 390 | no |  |
| / | 1440 | light | 1440 | 1440 | no |  |
| / | 390 | dark | 390 | 390 | no |  |
| / | 1440 | dark | 1440 | 1440 | no |  |
| / | 360 | light | 360 | 360 | no |  |
| / | 768 | light | 768 | 768 | no |  |
| /daily/october-28-2026 | 390 | light | 390 | 390 | no |  |
| /daily/october-28-2026 | 1440 | light | 1440 | 1440 | no |  |
| /daily/october-28-2026 | 390 | dark | 390 | 390 | no |  |
| /daily/october-28-2026 | 1440 | dark | 1440 | 1440 | no |  |
| /daily/october-28-2026 | 360 | light | 360 | 360 | no |  |
| /daily/october-28-2026 | 768 | light | 768 | 768 | no |  |
| /daily/october-28-2026/1 | 390 | light | 390 | 390 | no |  |
| /daily/october-28-2026/1 | 1440 | light | 1440 | 1440 | no |  |
| /daily/october-28-2026/1 | 390 | dark | 390 | 390 | no |  |
| /daily/october-28-2026/1 | 1440 | dark | 1440 | 1440 | no |  |
| /daily/october-28-2026/1 | 360 | light | 360 | 360 | no |  |
| /daily/october-28-2026/1 | 768 | light | 768 | 768 | no |  |
| /daily | 1440 | light | 1440 | 1440 | no |  |
| /daily | 390 | dark | 390 | 390 | no |  |
| /daily | 1440 | dark | 1440 | 1440 | no |  |
| /daily | 360 | light | 360 | 360 | no |  |
| /daily | 768 | light | 768 | 768 | no |  |
| /about | 390 | light | 390 | 390 | no |  |
| /about | 1440 | light | 1440 | 1440 | no |  |
| /about | 390 | dark | 390 | 390 | no |  |
| /about | 1440 | dark | 1440 | 1440 | no |  |
| /about | 360 | light | 360 | 360 | no |  |
| /about | 768 | light | 768 | 768 | no |  |
| /topics | 360 | light | 360 | 360 | no |  |
| /topics | 390 | light | 390 | 390 | no |  |
| /topics | 1440 | light | 1440 | 1440 | no |  |
| /topics | 390 | dark | 390 | 390 | no |  |
| /topics/ai | 360 | light | 360 | 360 | no |  |
| /topics/ai | 390 | light | 390 | 390 | no |  |
| /topics/ai | 1440 | light | 1440 | 1440 | no |  |
| /topics/ai | 390 | dark | 390 | 390 | no |  |
| /ai-stress-index | 360 | light | 360 | 360 | no | table.je26bq_bt right=653; thead right=653; tr right=653; th right=413; th right=522; th right=653; tbody right=653; tr right=653 |
| /ai-stress-index | 390 | light | 390 | 390 | no | table.je26bq_bt right=653; thead right=653; tr right=653; th right=413; th right=522; th right=653; tbody right=653; tr right=653 |
| /ai-stress-index | 1440 | light | 1440 | 1440 | no |  |
| /ai-stress-index | 390 | dark | 390 | 390 | no | table.je26bq_bt right=653; thead right=653; tr right=653; th right=413; th right=522; th right=653; tbody right=653; tr right=653 |
| /week | 360 | light | 360 | 360 | no |  |
| /week | 390 | light | 390 | 390 | no |  |
| /week | 1440 | light | 1440 | 1440 | no |  |
| /week | 390 | dark | 390 | 390 | no |  |
| /quiz | 360 | light | 360 | 360 | no |  |
| /quiz | 390 | light | 390 | 390 | no |  |
| /quiz | 1440 | light | 1440 | 1440 | no |  |
| /quiz | 390 | dark | 390 | 390 | no |  |
| /coverage | 360 | light | 360 | 360 | no |  |
| /coverage | 390 | light | 390 | 390 | no |  |
| /coverage | 1440 | light | 1440 | 1440 | no |  |
| /coverage | 390 | dark | 390 | 390 | no |  |
| /standards | 360 | light | 360 | 360 | no |  |
| /standards | 390 | light | 390 | 390 | no |  |
| /standards | 1440 | light | 1440 | 1440 | no |  |
| /standards | 390 | dark | 390 | 390 | no |  |
| /privacy | 360 | light | 360 | 360 | no |  |
| /privacy | 390 | light | 390 | 390 | no |  |
| /privacy | 1440 | light | 1440 | 1440 | no |  |
| /privacy | 390 | dark | 390 | 390 | no |  |
| /contact | 360 | light | 360 | 360 | no |  |
| /contact | 390 | light | 390 | 390 | no |  |
| /contact | 1440 | light | 1440 | 1440 | no |  |
| /contact | 390 | dark | 390 | 390 | no |  |
| /research/ai-bubble-october-2026 | 360 | light | 360 | 360 | no | table right=657; thead right=657; tr right=657; th right=657; tbody right=657; tr right=657; td right=657; tr right=657 |
| /research/ai-bubble-october-2026 | 390 | light | 390 | 390 | no | table right=657; thead right=657; tr right=657; th right=657; tbody right=657; tr right=657; td right=657; tr right=657 |
| /research/ai-bubble-october-2026 | 1440 | light | 1440 | 1440 | no |  |
| /research/ai-bubble-october-2026 | 390 | dark | 390 | 390 | no | table right=657; thead right=657; tr right=657; th right=657; tbody right=657; tr right=657; td right=657; tr right=657 |
| /daily | 390 | light | 390 | 390 | no |  |


## 6. Typography (computed)

**/ @390**
- body: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 16px; h1: "Playfair Display", Georgia, serif @ 30px; nav: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 14px; .ev-points li: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 15.5px; story h3: "Playfair Display", Georgia, serif @ 20px
- Smallest visible text: 9px — p.ab-strap "A CLEARER SLICE OF A COMPLEX WORLD"; 10 visible text elements under 12px: p.ab-strap 9px "A CLEARER SLICE OF A COMPLEX W"; span 11.5px "1"; span 11.5px "3"; span.ev-special-tag 10.5px "SPECIAL REPORT TODAY"; p.ev-sx-kicker 11.5px "AI STRESS INDEX"; em 11.5px "ELEVATED"; span.ev-free-tag 11px "Free version"; span.ev-special-tag 10.5px "SPECIAL REPORT"
- Line length .ev-points li: column 306px / avg char 7.93px ≈ **39 characters per line** (font 15.5px/24.025px)
- Line length .ev-why: column 296px / avg char 7.93px ≈ **37 characters per line** (font 15px/22.5px)
**/ @1440**
- body: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 16px; h1: "Playfair Display", Georgia, serif @ 54px; nav: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 14px; .ev-points li: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 15.5px; story h3: "Playfair Display", Georgia, serif @ 30px
- Smallest visible text: 10.5px — span.ev-special-tag "SPECIAL REPORT TODAY"; 9 visible text elements under 12px: span 11.5px "1"; span 11.5px "3"; span.ev-special-tag 10.5px "SPECIAL REPORT TODAY"; p.ev-sx-kicker 11.5px "AI STRESS INDEX"; em 11.5px "ELEVATED"; span.ev-free-tag 11px "Free version"; span.ev-special-tag 10.5px "SPECIAL REPORT"
- Line length .ev-points li: column 483px / avg char 7.93px ≈ **61 characters per line** (font 15.5px/24.025px)
- Line length .ev-why: column 473px / avg char 7.93px ≈ **60 characters per line** (font 15px/22.5px)
**/daily/october-28-2026 @390**
- body: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 16px; h1: "Playfair Display", Georgia, serif @ 30px; nav: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 14px; .ev-points li: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 15.5px; story h3: "Playfair Display", Georgia, serif @ 20px
- Smallest visible text: 10.5px — span.ev-special-tag "SPECIAL REPORT TODAY"; 9 visible text elements under 12px: span 11.5px "1"; span 11.5px "3"; span.ev-special-tag 10.5px "SPECIAL REPORT TODAY"; p.ev-sx-kicker 11.5px "AI STRESS INDEX"; em 11.5px "ELEVATED"; span.ev-free-tag 11px "Free version"; span.ev-special-tag 10.5px "SPECIAL REPORT"
- Line length .ev-points li: column 306px / avg char 7.93px ≈ **39 characters per line** (font 15.5px/24.025px)
- Line length .ev-why: column 296px / avg char 7.93px ≈ **37 characters per line** (font 15px/22.5px)
**/daily/october-28-2026 @1440**
- body: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 16px; h1: "Playfair Display", Georgia, serif @ 54px; nav: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 14px; .ev-points li: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 15.5px; story h3: "Playfair Display", Georgia, serif @ 30px
- Smallest visible text: 10.5px — span.ev-special-tag "SPECIAL REPORT TODAY"; 9 visible text elements under 12px: span 11.5px "1"; span 11.5px "3"; span.ev-special-tag 10.5px "SPECIAL REPORT TODAY"; p.ev-sx-kicker 11.5px "AI STRESS INDEX"; em 11.5px "ELEVATED"; span.ev-free-tag 11px "Free version"; span.ev-special-tag 10.5px "SPECIAL REPORT"
- Line length .ev-points li: column 483px / avg char 7.93px ≈ **61 characters per line** (font 15.5px/24.025px)
- Line length .ev-why: column 473px / avg char 7.93px ≈ **60 characters per line** (font 15px/22.5px)
**/daily/october-28-2026/1 @390**
- body: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 16px; h1: "Playfair Display", Georgia, serif @ 20px; nav: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 14px; .ev-points li: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 15.5px; story h3: "Playfair Display", Georgia, serif @ 20px
- Smallest visible text: 11px — span.ev-free-tag "Free version"; 1 visible text elements under 12px: span.ev-free-tag 11px "Free version"
- Line length .ev-points li: column 306px / avg char 7.93px ≈ **39 characters per line** (font 15.5px/24.025px)
- Line length .ev-why: column 296px / avg char 7.93px ≈ **37 characters per line** (font 15px/22.5px)
**/daily/october-28-2026/1 @1440**
- body: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 16px; h1: "Playfair Display", Georgia, serif @ 30px; nav: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 14px; .ev-points li: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 15.5px; story h3: "Playfair Display", Georgia, serif @ 30px
- Smallest visible text: 11px — span.ev-free-tag "Free version"; 1 visible text elements under 12px: span.ev-free-tag 11px "Free version"
- Line length .ev-points li: column 507px / avg char 7.93px ≈ **64 characters per line** (font 15.5px/24.025px)
- Line length .ev-why: column 497px / avg char 7.93px ≈ **63 characters per line** (font 15px/22.5px)
**/daily @390**
- body: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 16px; h1: "Playfair Display", Georgia, serif @ 34px; nav: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 14px
- Smallest visible text: 9px — p.ab-strap "A CLEARER SLICE OF A COMPLEX WORLD"; 34 visible text elements under 12px: p.ab-strap 9px "A CLEARER SLICE OF A COMPLEX W"; span.tl-day 10px "28 WED"; span.tl-day 10px "27 TUE"; span.tl-day 10px "26 MON"; span.tl-day 10px "25 SUN"; span.tl-day 10px "24 SAT"; span.tl-day 10px "23 FRI"; span.tl-day 10px "22 THU"; span.tl-day 10px "21 WED"; span.tl-day 10px "20 TUE"; span.tl-day 10px "19 MON"; span.tl-day 10px "18 SUN"; span.tl-day 10px "17 SAT"; span.tl-day 10px "16 FRI"; span.tl-day 10px "15 THU"
- Line length .tl-heads: column 254px / avg char 7.93px ≈ **32 characters per line** (font 13px/19.5px)
**/daily @1440**
- body: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 16px; h1: "Playfair Display", Georgia, serif @ 60px; nav: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 14px
- Smallest visible text: 12px — p.ab-kicker "THE ARCHIVE"; 0 visible text elements under 12px
- Line length .tl-heads: column 990px / avg char 7.93px ≈ **125 characters per line** (font 14px/21px)
**/about @390**
- body: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 16px; h1: "Playfair Display", Georgia, serif @ 34px; nav: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 14px
- Smallest visible text: 9px — p.ab-strap "A CLEARER SLICE OF A COMPLEX WORLD"; 1 visible text elements under 12px: p.ab-strap 9px "A CLEARER SLICE OF A COMPLEX W"
- Line length .ab-lede: column 358px / avg char 7.93px ≈ **45 characters per line** (font 16px/24px)
**/about @1440**
- body: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 16px; h1: "Playfair Display", Georgia, serif @ 60px; nav: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif @ 14px
- Smallest visible text: 12px — p.ab-kicker "ABOUT KKRECKONS"; 0 visible text elements under 12px
- Line length .ab-lede: column 560px / avg char 7.93px ≈ **71 characters per line** (font 19px/28.5px)
- Units: All font sizes are px (grep for rem: 0 matches as a unit; the only 'rem' substring is in 'counter-increment'). Headline sizes use clamp(…px, …vw, …px).

## 7. Touch targets at 390px (getBoundingClientRect, visible elements only)

**/**
- header (.site-header a/button): 7 visible of 7; under 44px in either dimension: 7 — "KKReckons" 104.7×27; "Home" 40.5×37; "Catch up" 60.7×37; "AI Stress Index" 101.2×37; "About" 41×37; "Switch to dark mode" 30×30; "Subscribe" 93.6×32
- first story card (.ev-story a/button): 13 visible of 18; under 44px in either dimension: 10 — "AI · MARKETS" 105.9×25; "Expand full graphic ↓" 324×40; "View full size ↗" 90.9×25; "neoclouds" 76.2×24; "The limits of hedging the AI boom (FT editorial)" 299.5×34; "CoreWeave, Nvidia and Meta credit default swaps (Benzinga)" 312.8×34; "Reuters, The Economic Times and Financial Times (may need a subscripti" 324×42; "The Economic Times ↗" 146.9×26; "Free version Gartner ↗" 150.8×26; "Share" 80.5×30 (hidden at this width: 5, e.g. WhatsApp, X, LinkedIn, Copy link)
- share rows (.ev-share a/button): 6 visible of 35; under 44px in either dimension: 6 — "Share" 83.9×32; "Share" 80.5×30; "Share" 80.5×30; "Share" 80.5×30; "Share" 80.5×30; "Share" 80.5×30 (hidden at this width: 29, e.g. WhatsApp, X, LinkedIn, Copy link)
- footer (.site-footer a): 15 visible of 15; under 44px in either dimension: 15 — "Krishnakanth Reddy" 123.3×24; "About" 54×28.8; "Past editions" 97×28.8; "Topics" 57.7×28.8; "In the news" 87.9×28.8; "This week" 79.9×28.8; "Weekly quiz" 92.7×28.8; "Best of the month" 127.2×28.8; "AI Stress Index" 110×28.8; "Contact" 65.7×28.8; "Standards" 80.2×28.8; "Privacy" 63×28.8; "RSS" 41.4×28.8; "LinkedIn" 69.2×28.8; "X" 25.4×28.8
- Today in 30 seconds (.ev-30s a): 6 visible of 6; under 44px in either dimension: 3 — "01 China pops, America leaks" 316×40; "02 India Inc's zombies thin out" 316×40; "03 Markets may decide December" 316×40
- section bar (.ev-bar a): 4 visible of 4; under 44px in either dimension: 4 — "Pick of the day 1" 128.5×26; "India edition 1" 112.9×26; "World edition 3" 122.4×26; "Further reading" 122.3×26
- number cards (.ev-callouts a): 2 visible of 2; under 44px in either dimension: 0
- end-of-page join box (.ab-join a, .ab-btn, .ab-btn-ghost): 4 visible of 4; under 44px in either dimension: 3 — "Catch up on past editions" 318×39; "Privacy" 42.1×25; "Editorial standards" 105.3×25
**/daily/october-28-2026**
- header (.site-header a/button): 7 visible of 7; under 44px in either dimension: 7 — "KKReckons" 104.7×27; "Home" 39.9×37; "Catch up" 62×37; "AI Stress Index" 101.2×37; "About" 41×37; "Switch to dark mode" 30×30; "Subscribe" 93.6×32
- first story card (.ev-story a/button): 13 visible of 18; under 44px in either dimension: 10 — "AI · MARKETS" 105.9×25; "Expand full graphic ↓" 324×40; "View full size ↗" 90.9×25; "neoclouds" 76.2×24; "The limits of hedging the AI boom (FT editorial)" 299.5×34; "CoreWeave, Nvidia and Meta credit default swaps (Benzinga)" 312.8×34; "Reuters, The Economic Times and Financial Times (may need a subscripti" 324×42; "The Economic Times ↗" 146.9×26; "Free version Gartner ↗" 150.8×26; "Share" 80.5×30 (hidden at this width: 5, e.g. WhatsApp, X, LinkedIn, Copy link)
- share rows (.ev-share a/button): 6 visible of 35; under 44px in either dimension: 6 — "Share" 83.9×32; "Share" 80.5×30; "Share" 80.5×30; "Share" 80.5×30; "Share" 80.5×30; "Share" 80.5×30 (hidden at this width: 29, e.g. WhatsApp, X, LinkedIn, Copy link)
- footer (.site-footer a): 15 visible of 15; under 44px in either dimension: 15 — "Krishnakanth Reddy" 123.3×24; "About" 54×28.8; "Past editions" 97×28.8; "Topics" 57.7×28.8; "In the news" 87.9×28.8; "This week" 79.9×28.8; "Weekly quiz" 92.7×28.8; "Best of the month" 127.2×28.8; "AI Stress Index" 110×28.8; "Contact" 65.7×28.8; "Standards" 80.2×28.8; "Privacy" 63×28.8; "RSS" 41.4×28.8; "LinkedIn" 69.2×28.8; "X" 25.4×28.8
- Today in 30 seconds (.ev-30s a): 6 visible of 6; under 44px in either dimension: 3 — "01 China pops, America leaks" 316×40; "02 India Inc's zombies thin out" 316×40; "03 Markets may decide December" 316×40
- section bar (.ev-bar a): 4 visible of 4; under 44px in either dimension: 4 — "Pick of the day 1" 128.5×26; "India edition 1" 112.9×26; "World edition 3" 122.4×26; "Further reading" 122.3×26
- number cards (.ev-callouts a): 2 visible of 2; under 44px in either dimension: 0
- end-of-page join box (.ab-join a, .ab-btn, .ab-btn-ghost): 4 visible of 4; under 44px in either dimension: 3 — "Get it by email ↗" 318×39; "Privacy" 42.1×25; "Editorial standards" 105.3×25
**/daily/october-28-2026/1**
- header (.site-header a/button): 7 visible of 7; under 44px in either dimension: 7 — "KKReckons" 104.7×27; "Home" 39.9×37; "Catch up" 62×37; "AI Stress Index" 101.2×37; "About" 41×37; "Switch to dark mode" 30×30; "Subscribe" 93.6×32
- first story card (.ev-story a/button): 13 visible of 18; under 44px in either dimension: 10 — "AI · MARKETS" 105.9×25; "Expand full graphic ↓" 324×40; "View full size ↗" 90.9×25; "neoclouds" 76.2×24; "The limits of hedging the AI boom (FT editorial)" 299.5×34; "CoreWeave, Nvidia and Meta credit default swaps (Benzinga)" 312.8×34; "Reuters, The Economic Times and Financial Times (may need a subscripti" 324×42; "The Economic Times ↗" 146.9×26; "Free version Gartner ↗" 150.8×26; "Share" 80.5×30 (hidden at this width: 5, e.g. WhatsApp, X, LinkedIn, Copy link)
- share rows (.ev-share a/button): 1 visible of 6; under 44px in either dimension: 1 — "Share" 80.5×30 (hidden at this width: 5, e.g. WhatsApp, X, LinkedIn, Copy link)
- footer (.site-footer a): 15 visible of 15; under 44px in either dimension: 15 — "Krishnakanth Reddy" 123.3×24; "About" 54×28.8; "Past editions" 97×28.8; "Topics" 57.7×28.8; "In the news" 87.9×28.8; "This week" 79.9×28.8; "Weekly quiz" 92.7×28.8; "Best of the month" 127.2×28.8; "AI Stress Index" 110×28.8; "Contact" 65.7×28.8; "Standards" 80.2×28.8; "Privacy" 63×28.8; "RSS" 41.4×28.8; "LinkedIn" 69.2×28.8; "X" 25.4×28.8
- archive controls (.seg button, .chip, .tl-item a, …): 2 visible of 2; under 44px in either dimension: 2 — "Goldman Sachs 8" 144.7×32; "CoreWeave 6" 118.6×32
- end-of-page join box (.ab-join a, .ab-btn, .ab-btn-ghost): 4 visible of 4; under 44px in either dimension: 3 — "Get it by email ↗" 318×39; "Privacy" 42.1×25; "Editorial standards" 105.3×25
**/daily**
- header (.site-header a/button): 7 visible of 7; under 44px in either dimension: 7 — "KKReckons" 104.7×27; "Home" 39.9×37; "Catch up" 62×37; "AI Stress Index" 101.2×37; "About" 41×37; "Switch to dark mode" 30×30; "Subscribe" 93.6×32
- footer (.site-footer a): 15 visible of 15; under 44px in either dimension: 15 — "Krishnakanth Reddy" 123.3×24; "About" 54×28.8; "Past editions" 97×28.8; "Topics" 57.7×28.8; "In the news" 87.9×28.8; "This week" 79.9×28.8; "Weekly quiz" 92.7×28.8; "Best of the month" 127.2×28.8; "AI Stress Index" 110×28.8; "Contact" 65.7×28.8; "Standards" 80.2×28.8; "Privacy" 63×28.8; "RSS" 41.4×28.8; "LinkedIn" 69.2×28.8; "X" 25.4×28.8
- archive controls (.seg button, .chip, .tl-item a, …): 12 visible of 12; under 44px in either dimension: 12 — "By edition" 95.3×34; "All stories" 95.7×34; "AI 101" 67.9×32; "Markets 90" 104.1×32; "Banking 31" 100.6×32; "India 70" 82×32; "Jobs & careers 25" 145.6×32; "Geopolitics 36" 123.5×32; "Personal finance 26" 158.2×32; "Health & science 23" 157.7×32; "All sources (252 · 45 reading)" 238.6×34; "Free to read (137 · 37 reading)" 217.6×32
- end-of-page join box (.ab-join a, .ab-btn, .ab-btn-ghost): 4 visible of 4; under 44px in either dimension: 3 — "Get it by email ↗" 318×39; "Privacy" 42.1×25; "Editorial standards" 105.3×25
**/about**
- header (.site-header a/button): 7 visible of 7; under 44px in either dimension: 7 — "KKReckons" 104.7×27; "Home" 39.9×37; "Catch up" 60.7×37; "AI Stress Index" 101.2×37; "About" 42.6×37; "Switch to dark mode" 30×30; "Subscribe" 93.6×32
- footer (.site-footer a): 15 visible of 15; under 44px in either dimension: 15 — "Krishnakanth Reddy" 123.3×24; "About" 54×28.8; "Past editions" 97×28.8; "Topics" 57.7×28.8; "In the news" 87.9×28.8; "This week" 79.9×28.8; "Weekly quiz" 92.7×28.8; "Best of the month" 127.2×28.8; "AI Stress Index" 110×28.8; "Contact" 65.7×28.8; "Standards" 80.2×28.8; "Privacy" 63×28.8; "RSS" 41.4×28.8; "LinkedIn" 69.2×28.8; "X" 25.4×28.8
- end-of-page join box (.ab-join a, .ab-btn, .ab-btn-ghost): 4 visible of 4; under 44px in either dimension: 3 — "Get it by email ↗" 318×39; "Privacy" 42.1×25; "Editorial standards" 105.3×25

## 8. Contrast (computed colours; WCAG AA 4.5:1 normal, 3:1 large ≥24px or ≥18.66px bold)

Background is the first opaque background-color up the ancestor chain; semi-transparent foregrounds are composited. Elements sitting on a CSS gradient are listed separately against the lightest and darkest gradient stops from app/globals.css.

### light mode

| Element | Selector | Foreground | Background | Ratio | Size/weight | AA | AAA | Measured on |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| about: btn | a.ab-btn | #ffffff | #c4531c | 4.56 | 15px/800 | pass | fail | / |
| market up | span.mk-chg.mk-up | #15803d | #ffffff | 5.02 | 13px/800 | pass | fail | / |
| secondary: footer fine print | span.fine | #686873 | #fbf8f1 | 5.19 | 12px/400 | pass | fail | / |
| footer text | div | #686873 | #fbf8f1 | 5.19 | 13px/400 | pass | fail | / |
| footer links | a | #686873 | #fbf8f1 | 5.19 | 13px/600 | pass | fail | / |
| nav link | a | #686873 | #fbf8f1 | 5.19 | 14px/600 | pass | fail | / |
| story page: crumbs | nav.crumbs | #686873 | #fbf8f1 | 5.19 | 13px/400 | pass | fail | /daily/october-28-2026 |
| archive: date | div.tl-date | #b84a17 | #ffffff | 5.21 | 13px/800 | pass | fail | /daily |
| story page: pager em | em | #686873 | #ffffff | 5.5 | 14px/400 | pass | fail | /daily/october-28-2026 |
| archive: headlines | p.tl-heads | #686873 | #ffffff | 5.5 | 13px/400 | pass | fail | /daily |
| signup small | small | #6b5a8e | #fff7ee | 5.69 | 12.5px/400 | pass | fail | / |
| source link | a | #0a716b | #ffffff | 5.85 | 13px/800 | pass | fail | / |
| ext marker | span.ev-ext | #0a716b | #ffffff | 5.85 | 14px/700 | pass | fail | / |
| label: story category | a.ev-cat | #a8430f | #ffffff | 6.04 | 12px/800 | pass | fail | / |
| label: Today in 30 seconds h2 | h2#t30-2026-10-28 | #a8430f | #ffffff | 6.04 | 12px/800 | pass | fail | / |
| 30s number | span.ev-30s-n | #a8430f | #ffffff | 6.04 | 13px/800 | pass | fail | / |
| related small | small | #6b5a8e | #ffffff | 6.04 | 12px/800 | pass | fail | / |
| secondary: key numbers | dd | #5b5566 | #f3ece2 | 6.1 | 12.5px/400 | pass | fail | / |
| about: way p | p | #5b5566 | #f3ece2 | 6.1 | 13.5px/400 | pass | fail | /about |
| market down | span.mk-chg.mk-down | #b91c1c | #ffffff | 6.47 | 13px/800 | pass | fail | / |
| label: section subtitle | p | #5b5566 | #fff3ea | 6.56 | 14px/400 | pass | fail | / |
| fix/corrections line | p.ev-fix | #5b5566 | #fbf8f1 | 6.74 | 13.5px/400 | pass | fail | / |
| poll | p.ev-poll | #5b5566 | #fbf8f1 | 6.74 | 14px/700 | pass | fail | / |
| about: beats p | p.ab-kicker#beats-title | #5b5566 | #fbf8f1 | 6.74 | 14px/800 | pass | fail | /about |
| secondary: figure caption | figcaption | #5b5566 | #ffffff | 7.15 | 12px/400 | pass | pass | / |
| secondary: also-reported | p.ev-also | #5b5566 | #ffffff | 7.15 | 14px/400 | pass | pass | / |
| label: 30s key | p.ev-30s-key | #5b5566 | #ffffff | 7.15 | 12px/700 | pass | pass | / |
| further reading small | small | #5b5566 | #ffffff | 7.15 | 12.5px/400 | pass | pass | / |
| market strip name | span.mk-name | #5b5566 | #ffffff | 7.15 | 12.5px/700 | pass | pass | / |
| market strip week | small.mk-week | #5b5566 | #ffffff | 7.15 | 12px/400 | pass | pass | / |
| market strip src | p.mk-src | #5b5566 | #ffffff | 7.15 | 12px/400 | pass | pass | / |
| archive: stats | li | #5b5566 | #ffffff | 7.15 | 13px/700 | pass | pass | /daily |
| about: dn body p | p | #5b5566 | #ffffff | 7.15 | 15.5px/400 | pass | pass | /about |
| free tag | span.ev-free-tag | #0f5c2e | #e7f6ec | 7.25 | 11px/800 | pass | pass | / |
| special report banner: tag | span.ev-special-tag | #1b2747 | #f5c77e | 9.35 | 10.5px/800 | pass | pass | / |
| AI Stress Index card: band pill | em | #1d0f35 | #fbbf24 | 10.73 | 11.5px/800 | pass | pass | / |
| archive: lede | p.cu-lede | #3b3546 | #fbf8f1 | 11.1 | 16px/400 | pass | pass | /daily |
| about: lede | p.ab-lede | #3b3546 | #fbf8f1 | 11.1 | 16px/400 | pass | pass | /about |
| secondary: key numbers label | dt | #3b1d6e | #f3ece2 | 11.28 | 21px/800 (large) | pass | pass | / |
| label: edition kicker (date) | p.ev-kicker | #3b1d6e | #fbf8f1 | 12.48 | 12px/800 | pass | pass | / |
| archive: chip | a.chip | #34333b | #ffffff | 12.48 | 13px/700 | pass | pass | /daily/october-28-2026/1 |
| clamp button | button.ev-clamp-btn | #35205f | #f7f3fd | 12.6 | 13.5px/800 | pass | pass | / |
| story page: pager label | span | #35205f | #ffffff | 13.79 | 12px/800 | pass | pass | /daily/october-28-2026 |
| archive: meta | span.tl-meta | #35205f | #ffffff | 13.79 | 12px/700 | pass | pass | /daily |
| body story text | li | #2f2840 | #ffffff | 14.01 | 15.5px/400 | pass | pass | / |
| other side | p.ev-other | #24123f | #f1ebfb | 14.61 | 15px/400 | pass | pass | / |
| why it matters | p.ev-why | #24123f | #fff3ea | 15.62 | 15px/400 | pass | pass | / |
| nav link (current) | a.on | #24123f | #fbf8f1 | 16.05 | 14px/800 | pass | pass | / |
| wordmark | a.wordmark | #24123f | #fbf8f1 | 16.05 | 20px/700 (large) | pass | pass | / |
| archive: hero h1 | h1#cu-title | #24123f | #fbf8f1 | 16.05 | 34px/800 (large) | pass | pass | /daily |
| 30s list link | a | #24123f | #ffffff | 17.03 | 15px/700 | pass | pass | / |
| header Subscribe button | a.hdr-sub | #ffffff | #24123f | 17.03 | 13px/800 | pass | pass | / |
| AI Stress Index card: CTA | a.ev-sx-cta | #24123f | #ffffff | 17.03 | 13.5px/800 | pass | pass | / |
| story heading | h3 | #24123f | #ffffff | 17.03 | 20px/700 (large) | pass | pass | / |
| source row | p.ev-src | #24123f | #ffffff | 17.03 | 13px/800 | pass | pass | / |
| section bar link | a.on | #ffffff | #24123f | 17.03 | 13px/700 | pass | pass | / |
| poll link | a | #24123f | #ffffff | 17.03 | 14px/700 | pass | pass | / |
| archive: seg button | button | #ffffff | #16151b | 18.15 | 13px/700 | pass | pass | /daily |

Gradient cards on /daily/october-28-2026 @390 (text measured against each gradient stop from app/globals.css; elements with their own opaque background — pills, buttons, tags — are measured against that background instead; xFrac = horizontal centre of the text within the card, 0 = left edge, 1 = right edge):
| Card | Text element | Text | Size/weight | Background used | Foreground | Ratio | AA | xFrac |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| .ev-special | span.ev-special-go | Read the report → | 13.5px/800 | gradient stop end (lightest) #B8603F #B8603F | #f5c77e | 2.79 | FAIL | 0.5 |
| .ev-special | span. | → | 13.5px/800 | gradient stop end (lightest) #B8603F #B8603F | #f5c77e | 2.79 | FAIL | 0.36 |
| .ev-special | small. | Our deeper dive behind today's lead: Chi | 13.5px/400 | gradient stop end (lightest) #B8603F #B8603F | #e6dccd | 3.24 | FAIL | 0.5 |
| .ev-special | b. | Popped or leaking? A KKReckons research  | 19px/700 (large) | gradient stop end (lightest) #B8603F #B8603F | #fff8ee | 4.16 | pass | 0.5 |
| .ev-call-1 | span. | of listed Indian firms stressed or zombi | 15.5px/400 | gradient stop lightest #b8471d | #f9f0ed | 4.74 | pass | 0.5 |
| .ev-call-1 | b. | 14.2% | 34px/800 (large) | gradient stop lightest #b8471d | #ffffff | 5.31 | pass | 0.5 |
| .ev-special | span.ev-special-go | Read the report → | 13.5px/800 | gradient stop mid #5B3A6E #5B3A6E | #f5c77e | 5.87 | pass | 0.5 |
| .ev-special | span. | → | 13.5px/800 | gradient stop mid #5B3A6E #5B3A6E | #f5c77e | 5.87 | pass | 0.36 |
| .ev-sx | span. | /100 | 14px/700 | gradient stop lightest #4b2b78 | #c9bfd7 | 6.24 | pass | 0.19 |
| .ev-sx | b. | 25 | 34px/800 (large) | gradient stop lightest #4b2b78 | #fbbf24 | 6.57 | pass | 0.09 |
| .ev-call-1 | span. | of listed Indian firms stressed or zombi | 15.5px/400 | gradient stop darkest #93321a | #f6efed | 6.8 | pass | 0.5 |
| .ev-special | small. | Our deeper dive behind today's lead: Chi | 13.5px/400 | gradient stop mid #5B3A6E #5B3A6E | #e6dccd | 6.81 | pass | 0.5 |
| .ev-sx | p.ev-sx-kicker | AI STRESS INDEX | 11.5px/800 | gradient stop lightest #4b2b78 | #d2cadd | 6.91 | pass | 0.35 |
| .ev-call-1 | b. | 14.2% | 34px/800 (large) | gradient stop darkest #93321a | #ffffff | 7.74 | pass | 0.5 |
| .ev-sx | p.ev-sx-note | 27 Oct close · Story 01 | 13.5px/400 | gradient stop lightest #4b2b78 | #dfd9e7 | 7.93 | pass | 0.35 |
| .ev-special | b. | Popped or leaking? A KKReckons research  | 19px/700 (large) | gradient stop mid #5B3A6E #5B3A6E | #fff8ee | 8.75 | pass | 0.5 |
| .ev-sx | span. | /100 | 14px/700 | gradient stop darkest #1d0f35 | #bbb7c2 | 9.11 | pass | 0.19 |
| .ev-special | span.ev-special-tag | SPECIAL REPORT TODAY | 10.5px/800 | own: #f5c77e (span.ev-special-tag) | #1b2747 | 9.35 | pass | 0.3 |
| .ev-special | span.ev-special-go | Read the report → | 13.5px/800 | gradient stop start (darkest) #1B2747 #1B2747 | #f5c77e | 9.35 | pass | 0.5 |
| .ev-special | span. | → | 13.5px/800 | gradient stop start (darkest) #1B2747 #1B2747 | #f5c77e | 9.35 | pass | 0.36 |
| .ev-call-0 | span. | China's STAR50 AI and chip index fall in | 15.5px/400 | gradient stop lightest #4b2b78 | #f1eef4 | 9.54 | pass | 0.5 |
| .ev-sx | p.ev-sx-kicker | AI STRESS INDEX | 11.5px/800 | gradient stop darkest #1d0f35 | #c7c3cd | 10.32 | pass | 0.35 |
| .ev-sx | b. | 25 | 34px/800 (large) | gradient stop darkest #1d0f35 | #fbbf24 | 10.73 | pass | 0.09 |
| .ev-sx | em. | ELEVATED | 11.5px/800 | own: #fbbf24 (em., inline style) | #1d0f35 | 10.73 | pass | 0.39 |
| .ev-special | small. | Our deeper dive behind today's lead: Chi | 13.5px/400 | gradient stop start (darkest) #1B2747 #1B2747 | #e6dccd | 10.84 | pass | 0.5 |
| .ev-call-0 | b. | 40% | 34px/800 (large) | gradient stop lightest #4b2b78 | #ffffff | 10.96 | pass | 0.5 |
| .ev-sx | a. | 01 | 13.5px/800 | gradient stop lightest #4b2b78 | #ffffff | 10.96 | pass | 0.46 |
| .ev-sx | p.ev-sx-note | 27 Oct close · Story 01 | 13.5px/400 | gradient stop darkest #1d0f35 | #d6d4db | 12.19 | pass | 0.35 |
| .ev-special | b. | Popped or leaking? A KKReckons research  | 19px/700 (large) | gradient stop start (darkest) #1B2747 #1B2747 | #fff8ee | 13.95 | pass | 0.5 |
| .ev-call-0 | span. | China's STAR50 AI and chip index fall in | 15.5px/400 | gradient stop darkest #24123f | #edecf0 | 14.49 | pass | 0.5 |
| .ev-call-0 | b. | 40% | 34px/800 (large) | gradient stop darkest #24123f | #ffffff | 17.03 | pass | 0.5 |
| .ev-sx | a.ev-sx-cta | Gauges → | 13.5px/800 | own: #ffffff (a.ev-sx-cta) | #24123f | 17.03 | pass | 0.83 |
| .ev-sx | a. | 01 | 13.5px/800 | gradient stop darkest #1d0f35 | #ffffff | 17.92 | pass | 0.46 |

- AA failures in light mode: 0 solid-background element(s); 3 gradient-card row(s) below AA: .ev-special "Read the report →" vs gradient stop end (lightest) #B8603F #B8603F = 2.79:1; .ev-special "→" vs gradient stop end (lightest) #B8603F #B8603F = 2.79:1; .ev-special "Our deeper dive behind to" vs gradient stop end (lightest) #B8603F #B8603F = 3.24:1.

### dark mode

| Element | Selector | Foreground | Background | Ratio | Size/weight | AA | AAA | Measured on |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| about: btn | a.ab-btn | #ffffff | #c4531c | 4.56 | 15px/800 | pass | fail | / |
| market down | span.mk-chg.mk-down | #f87171 | #1e1a28 | 6.15 | 13px/800 | pass | fail | / |
| secondary: key numbers | dd | #b4adc2 | #2a2433 | 6.93 | 12.5px/400 | pass | fail | / |
| about: way p | p | #b4adc2 | #2a2433 | 6.93 | 13.5px/400 | pass | fail | /about |
| story page: pager em | em | #a9a3b5 | #1e1a28 | 6.97 | 14px/400 | pass | fail | /daily/october-28-2026 |
| archive: headlines | p.tl-heads | #a9a3b5 | #1e1a28 | 6.97 | 13px/400 | pass | fail | /daily |
| signup small | small | #b9a9dc | #2e231c | 7.12 | 12.5px/400 | pass | pass | / |
| header Subscribe button | a.hdr-sub | #1a1222 | #f0885a | 7.26 | 13px/800 | pass | pass | / |
| label: section subtitle | p | #b4adc2 | #261d1a | 7.62 | 14px/400 | pass | pass | / |
| secondary: footer fine print | span.fine | #a9a3b5 | #14111b | 7.63 | 12px/400 | pass | pass | / |
| footer text | div | #a9a3b5 | #14111b | 7.63 | 13px/400 | pass | pass | / |
| footer links | a | #a9a3b5 | #14111b | 7.63 | 13px/600 | pass | pass | / |
| nav link | a | #a9a3b5 | #14111b | 7.63 | 14px/600 | pass | pass | / |
| story page: crumbs | nav.crumbs | #a9a3b5 | #14111b | 7.63 | 13px/400 | pass | pass | /daily/october-28-2026 |
| label: story category | a.ev-cat | #f29a6c | #1e1a28 | 7.79 | 12px/800 | pass | pass | / |
| label: Today in 30 seconds h2 | h2#t30-2026-10-28 | #f29a6c | #1e1a28 | 7.79 | 12px/800 | pass | pass | / |
| 30s number | span.ev-30s-n | #f29a6c | #1e1a28 | 7.79 | 13px/800 | pass | pass | / |
| archive: date | div.tl-date | #f29a6c | #1e1a28 | 7.79 | 13px/800 | pass | pass | /daily |
| secondary: figure caption | figcaption | #b4adc2 | #1e1a28 | 7.86 | 12px/400 | pass | pass | / |
| secondary: also-reported | p.ev-also | #b4adc2 | #1e1a28 | 7.86 | 14px/400 | pass | pass | / |
| label: 30s key | p.ev-30s-key | #b4adc2 | #1e1a28 | 7.86 | 12px/700 | pass | pass | / |
| further reading small | small | #b4adc2 | #1e1a28 | 7.86 | 12.5px/400 | pass | pass | / |
| market strip name | span.mk-name | #b4adc2 | #1e1a28 | 7.86 | 12.5px/700 | pass | pass | / |
| market strip week | small.mk-week | #b4adc2 | #1e1a28 | 7.86 | 12px/400 | pass | pass | / |
| market strip src | p.mk-src | #b4adc2 | #1e1a28 | 7.86 | 12px/400 | pass | pass | / |
| archive: stats | li | #b4adc2 | #1e1a28 | 7.86 | 13px/700 | pass | pass | /daily |
| about: dn body p | p | #b4adc2 | #1e1a28 | 7.86 | 15.5px/400 | pass | pass | /about |
| related small | small | #b9a9dc | #1e1a28 | 7.92 | 12px/800 | pass | pass | / |
| clamp button | button.ev-clamp-btn | #c8b5f2 | #2a2340 | 8.03 | 13.5px/800 | pass | pass | / |
| secondary: key numbers label | dt | #c8b5f2 | #2a2433 | 8.11 | 21px/800 (large) | pass | pass | / |
| fix/corrections line | p.ev-fix | #b4adc2 | #14111b | 8.61 | 13.5px/400 | pass | pass | / |
| poll | p.ev-poll | #b4adc2 | #14111b | 8.61 | 14px/700 | pass | pass | / |
| about: beats p | p.ab-kicker#beats-title | #b4adc2 | #14111b | 8.61 | 14px/800 | pass | pass | /about |
| free tag | span.ev-free-tag | #8fe0ad | #16301f | 9.1 | 11px/800 | pass | pass | / |
| story page: pager label | span | #c8b5f2 | #1e1a28 | 9.2 | 12px/800 | pass | pass | /daily/october-28-2026 |
| archive: meta | span.tl-meta | #c8b5f2 | #1e1a28 | 9.2 | 12px/700 | pass | pass | /daily |
| special report banner: tag | span.ev-special-tag | #1b2747 | #f5c77e | 9.35 | 10.5px/800 | pass | pass | / |
| source link | a | #5fd3c7 | #1e1a28 | 9.43 | 13px/800 | pass | pass | / |
| ext marker | span.ev-ext | #5fd3c7 | #1e1a28 | 9.43 | 14px/700 | pass | pass | / |
| market up | span.mk-chg.mk-up | #4ade80 | #1e1a28 | 9.77 | 13px/800 | pass | pass | / |
| label: edition kicker (date) | p.ev-kicker | #c8b5f2 | #14111b | 10.08 | 12px/800 | pass | pass | / |
| AI Stress Index card: band pill | em | #1d0f35 | #fbbf24 | 10.73 | 11.5px/800 | pass | pass | / |
| archive: chip | a.chip | #d6d0e0 | #1e1a28 | 11.31 | 13px/700 | pass | pass | /daily/october-28-2026/1 |
| body story text | li | #d9d3e3 | #1e1a28 | 11.65 | 15.5px/400 | pass | pass | / |
| archive: lede | p.cu-lede | #d6d0e0 | #14111b | 12.4 | 16px/400 | pass | pass | /daily |
| about: lede | p.ab-lede | #d6d0e0 | #14111b | 12.4 | 16px/400 | pass | pass | /about |
| other side | p.ev-other | #f1ecfa | #2a2340 | 12.82 | 15px/400 | pass | pass | / |
| why it matters | p.ev-why | #f1ecfa | #33241d | 12.84 | 15px/400 | pass | pass | / |
| 30s list link | a | #f1ecfa | #1e1a28 | 14.69 | 15px/700 | pass | pass | / |
| story heading | h3 | #f1ecfa | #1e1a28 | 14.69 | 20px/700 (large) | pass | pass | / |
| source row | p.ev-src | #f1ecfa | #1e1a28 | 14.69 | 13px/800 | pass | pass | / |
| poll link | a | #f1ecfa | #1e1a28 | 14.69 | 14px/700 | pass | pass | / |
| archive: seg button | button | #14111b | #ece8f2 | 15.45 | 13px/700 | pass | pass | /daily |
| nav link (current) | a.on | #f1ecfa | #14111b | 16.09 | 14px/800 | pass | pass | / |
| wordmark | a.wordmark | #f1ecfa | #14111b | 16.09 | 20px/700 (large) | pass | pass | / |
| section bar link | a.on | #14111b | #f1ecfa | 16.09 | 13px/700 | pass | pass | / |
| archive: hero h1 | h1#cu-title | #f1ecfa | #14111b | 16.09 | 34px/800 (large) | pass | pass | /daily |
| AI Stress Index card: CTA | a.ev-sx-cta | #24123f | #ffffff | 17.03 | 13.5px/800 | pass | pass | / |

Gradient cards on /daily/october-28-2026 @390 (text measured against each gradient stop from app/globals.css; elements with their own opaque background — pills, buttons, tags — are measured against that background instead; xFrac = horizontal centre of the text within the card, 0 = left edge, 1 = right edge):
| Card | Text element | Text | Size/weight | Background used | Foreground | Ratio | AA | xFrac |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| .ev-special | span.ev-special-go | Read the report → | 13.5px/800 | gradient stop end (lightest) #B8603F #B8603F | #f5c77e | 2.79 | FAIL | 0.5 |
| .ev-special | span. | → | 13.5px/800 | gradient stop end (lightest) #B8603F #B8603F | #f5c77e | 2.79 | FAIL | 0.36 |
| .ev-special | small. | Our deeper dive behind today's lead: Chi | 13.5px/400 | gradient stop end (lightest) #B8603F #B8603F | #e6dccd | 3.24 | FAIL | 0.5 |
| .ev-special | b. | Popped or leaking? A KKReckons research  | 19px/700 (large) | gradient stop end (lightest) #B8603F #B8603F | #fff8ee | 4.16 | pass | 0.5 |
| .ev-call-1 | span. | of listed Indian firms stressed or zombi | 15.5px/400 | gradient stop lightest #b8471d | #f9f0ed | 4.74 | pass | 0.5 |
| .ev-call-1 | b. | 14.2% | 34px/800 (large) | gradient stop lightest #b8471d | #ffffff | 5.31 | pass | 0.5 |
| .ev-special | span.ev-special-go | Read the report → | 13.5px/800 | gradient stop mid #5B3A6E #5B3A6E | #f5c77e | 5.87 | pass | 0.5 |
| .ev-special | span. | → | 13.5px/800 | gradient stop mid #5B3A6E #5B3A6E | #f5c77e | 5.87 | pass | 0.36 |
| .ev-sx | span. | /100 | 14px/700 | gradient stop lightest #4b2b78 | #c9bfd7 | 6.24 | pass | 0.19 |
| .ev-sx | b. | 25 | 34px/800 (large) | gradient stop lightest #4b2b78 | #fbbf24 | 6.57 | pass | 0.09 |
| .ev-call-1 | span. | of listed Indian firms stressed or zombi | 15.5px/400 | gradient stop darkest #93321a | #f6efed | 6.8 | pass | 0.5 |
| .ev-special | small. | Our deeper dive behind today's lead: Chi | 13.5px/400 | gradient stop mid #5B3A6E #5B3A6E | #e6dccd | 6.81 | pass | 0.5 |
| .ev-sx | p.ev-sx-kicker | AI STRESS INDEX | 11.5px/800 | gradient stop lightest #4b2b78 | #d2cadd | 6.91 | pass | 0.35 |
| .ev-call-1 | b. | 14.2% | 34px/800 (large) | gradient stop darkest #93321a | #ffffff | 7.74 | pass | 0.5 |
| .ev-sx | p.ev-sx-note | 27 Oct close · Story 01 | 13.5px/400 | gradient stop lightest #4b2b78 | #dfd9e7 | 7.93 | pass | 0.35 |
| .ev-special | b. | Popped or leaking? A KKReckons research  | 19px/700 (large) | gradient stop mid #5B3A6E #5B3A6E | #fff8ee | 8.75 | pass | 0.5 |
| .ev-sx | span. | /100 | 14px/700 | gradient stop darkest #1d0f35 | #bbb7c2 | 9.11 | pass | 0.19 |
| .ev-special | span.ev-special-tag | SPECIAL REPORT TODAY | 10.5px/800 | own: #f5c77e (span.ev-special-tag) | #1b2747 | 9.35 | pass | 0.3 |
| .ev-special | span.ev-special-go | Read the report → | 13.5px/800 | gradient stop start (darkest) #1B2747 #1B2747 | #f5c77e | 9.35 | pass | 0.5 |
| .ev-special | span. | → | 13.5px/800 | gradient stop start (darkest) #1B2747 #1B2747 | #f5c77e | 9.35 | pass | 0.36 |
| .ev-call-0 | span. | China's STAR50 AI and chip index fall in | 15.5px/400 | gradient stop lightest #4b2b78 | #f1eef4 | 9.54 | pass | 0.5 |
| .ev-sx | p.ev-sx-kicker | AI STRESS INDEX | 11.5px/800 | gradient stop darkest #1d0f35 | #c7c3cd | 10.32 | pass | 0.35 |
| .ev-sx | b. | 25 | 34px/800 (large) | gradient stop darkest #1d0f35 | #fbbf24 | 10.73 | pass | 0.09 |
| .ev-sx | em. | ELEVATED | 11.5px/800 | own: #fbbf24 (em., inline style) | #1d0f35 | 10.73 | pass | 0.39 |
| .ev-special | small. | Our deeper dive behind today's lead: Chi | 13.5px/400 | gradient stop start (darkest) #1B2747 #1B2747 | #e6dccd | 10.84 | pass | 0.5 |
| .ev-call-0 | b. | 40% | 34px/800 (large) | gradient stop lightest #4b2b78 | #ffffff | 10.96 | pass | 0.5 |
| .ev-sx | a. | 01 | 13.5px/800 | gradient stop lightest #4b2b78 | #ffffff | 10.96 | pass | 0.46 |
| .ev-sx | p.ev-sx-note | 27 Oct close · Story 01 | 13.5px/400 | gradient stop darkest #1d0f35 | #d6d4db | 12.19 | pass | 0.35 |
| .ev-special | b. | Popped or leaking? A KKReckons research  | 19px/700 (large) | gradient stop start (darkest) #1B2747 #1B2747 | #fff8ee | 13.95 | pass | 0.5 |
| .ev-call-0 | span. | China's STAR50 AI and chip index fall in | 15.5px/400 | gradient stop darkest #24123f | #edecf0 | 14.49 | pass | 0.5 |
| .ev-call-0 | b. | 40% | 34px/800 (large) | gradient stop darkest #24123f | #ffffff | 17.03 | pass | 0.5 |
| .ev-sx | a.ev-sx-cta | Gauges → | 13.5px/800 | own: #ffffff (a.ev-sx-cta) | #24123f | 17.03 | pass | 0.83 |
| .ev-sx | a. | 01 | 13.5px/800 | gradient stop darkest #1d0f35 | #ffffff | 17.92 | pass | 0.46 |

- AA failures in dark mode: 0 solid-background element(s); 3 gradient-card row(s) below AA: .ev-special "Read the report →" vs gradient stop end (lightest) #B8603F #B8603F = 2.79:1; .ev-special "→" vs gradient stop end (lightest) #B8603F #B8603F = 2.79:1; .ev-special "Our deeper dive behind to" vs gradient stop end (lightest) #B8603F #B8603F = 3.24:1.

## 9. Sticky elements at 390px

- /: header 86px (position sticky); at scrollY=800: section bar present but hidden, covered 86px of 844px (10.2%); at scrollY=2000: section bar visible 41px, covered 127px (15.0%). Fixed/sticky elements: header.site-header sticky 86px, nav.ev-bar fixed 41px
- /daily/october-28-2026: header 86px (position sticky); at scrollY=800: section bar present but hidden, covered 86px of 844px (10.2%); at scrollY=2000: section bar visible 41px, covered 127px (15.0%). Fixed/sticky elements: header.site-header sticky 86px, nav.ev-bar fixed 41px
- /daily/october-28-2026/1: header 86px (position sticky); at scrollY=800: section bar absent, covered 86px of 844px (10.2%); at scrollY=2000: section bar hidden, covered 86px (10.2%). Fixed/sticky elements: header.site-header sticky 86px
- /daily: header 86px (position sticky); at scrollY=800: section bar absent, covered 86px of 844px (10.2%); at scrollY=2000: section bar hidden, covered 86px (10.2%). Fixed/sticky elements: header.site-header sticky 86px
- /about: header 86px (position sticky); at scrollY=800: section bar absent, covered 86px of 844px (10.2%); at scrollY=2000: section bar hidden, covered 86px (10.2%). Fixed/sticky elements: header.site-header sticky 86px
- /daily/october-28-2026 @1440: header 68px; section bar 41px at scrollY=2000; covered 109px of 900px.

## 10. Console errors, page errors, failed requests, CSP

- / @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- / @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- / @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- / @1440 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- / @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- / @768 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026 @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026 @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026 @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026 @1440 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026 @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026 @768 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026/1 @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026/1 @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026/1 @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026/1 @1440 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026/1 @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily/october-28-2026/1 @768 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily @1440 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily @768 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /about @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /about @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /about @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /about @1440 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /about @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /about @768 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /topics @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /topics @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /topics @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /topics @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /topics/ai @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /topics/ai @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /topics/ai @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /topics/ai @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /ai-stress-index @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /ai-stress-index @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /ai-stress-index @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /ai-stress-index @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /week @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /week @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /week @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /week @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /quiz @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /quiz @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /quiz @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /quiz @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /coverage @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /coverage @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /coverage @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /coverage @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /standards @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /standards @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /standards @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /standards @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /privacy @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /privacy @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /privacy @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /privacy @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /contact @360 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /contact @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /contact @1440 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /contact @390 dark: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- /daily @390 light: console 2 (error: Failed to load resource: the server responded with a status of 404 (Not Found) | error: Refused to execute script from 'http://localhost:3100/_vercel/insights/script.js' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.); pageerrors 0; failed requests /_vercel/insights/script.js net::ERR_ABORTED; non-2xx responses /_vercel/insights/script.js 404; CSP violations 0
- External (non-localhost) requests observed across all page loads: none.
- No request to fonts.googleapis.com or fonts.gstatic.com was made by any page, including the research brief.

## 11. Accessibility (axe-core via @axe-core/playwright; tags wcag2a/aa, wcag21a/aa, wcag22aa, best-practice)

| Path | Width | Scheme | Violations | Rule (impact, nodes, example selector) | Passed rules | Incomplete (needs review) |
| --- | --- | --- | --- | --- | --- | --- |
| / | 390 | light | 0 |  | 48 | color-contrast×34 |
| / | 1440 | light | 0 |  | 48 | color-contrast×38 |
| / | 390 | dark | 0 |  | 48 | color-contrast×34 |
| / | 1440 | dark | 0 |  | 48 | color-contrast×38 |
| /daily/october-28-2026 | 390 | light | 1 | landmark-unique (moderate, 1 node, e.g. `.crumbs`) | 47 | color-contrast×30 |
| /daily/october-28-2026 | 1440 | light | 1 | landmark-unique (moderate, 1 node, e.g. `.crumbs`) | 47 | color-contrast×32 |
| /daily/october-28-2026 | 390 | dark | 1 | landmark-unique (moderate, 1 node, e.g. `.crumbs`) | 47 | color-contrast×30 |
| /daily/october-28-2026 | 1440 | dark | 1 | landmark-unique (moderate, 1 node, e.g. `.crumbs`) | 47 | color-contrast×32 |
| /daily/october-28-2026/1 | 390 | light | 0 |  | 44 | color-contrast×12 |
| /daily/october-28-2026/1 | 1440 | light | 0 |  | 44 | color-contrast×11 |
| /daily/october-28-2026/1 | 390 | dark | 0 |  | 44 | color-contrast×12 |
| /daily/october-28-2026/1 | 1440 | dark | 0 |  | 44 | color-contrast×11 |
| /daily | 1440 | light | 0 |  | 45 | color-contrast×80 |
| /daily | 390 | dark | 0 |  | 45 | color-contrast×79 |
| /daily | 1440 | dark | 0 |  | 45 | color-contrast×80 |
| /about | 390 | light | 0 |  | 44 | color-contrast×13 |
| /about | 1440 | light | 0 |  | 44 | color-contrast×15 |
| /about | 390 | dark | 0 |  | 44 | color-contrast×13 |
| /about | 1440 | dark | 0 |  | 44 | color-contrast×15 |
| /topics | 390 | light | 0 |  | 43 | color-contrast×11 |
| /topics/ai | 390 | light | 0 |  | 42 | color-contrast×11 |
| /ai-stress-index | 390 | light | 0 |  | 51 | color-contrast×24, frame-tested×1 |
| /week | 390 | light | 0 |  | 43 | color-contrast×11 |
| /quiz | 390 | light | 0 |  | 42 | color-contrast×11 |
| /coverage | 390 | light | 0 |  | 43 | color-contrast×11 |
| /standards | 390 | light | 0 |  | 41 |  |
| /privacy | 390 | light | 0 |  | 40 |  |
| /contact | 390 | light | 0 |  | 40 |  |
| /research/ai-bubble-october-2026 | 390 | light | 4 | color-contrast (serious, 5 nodes, e.g. `.g`); landmark-one-main (moderate, 1 node, e.g. `html`); region (moderate, 22 nodes, e.g. `.tiles`); scrollable-region-focusable (serious, 1 node, e.g. `.tablewrap`) | 39 | color-contrast×8 |
| /daily | 390 | light | 0 |  | 45 | color-contrast×79 |


### Landmarks, skip link, heading order, nav visibility

- /: header 2 (top-level 1), nav 4 [Main, Sections, t30-2026-10-28, Footer], main 1 (#main is a <DIV> with tabindex=-1, not a <main> element), footer 1; skip link: "Skip to content" → #main, off-screen at rest (top -60px); heading-level skips: none
- / nav links @1440: Home, Catch up, AI Stress Index, About; @390: Home, Catch up, AI Stress Index, About; nav scrollWidth/clientWidth @390 358/358 (overflows: false)
- / nav @360: Home, Catch up, AI Stress Index, About; scrollWidth/clientWidth 328/328; header height 83px
- /daily/october-28-2026: header 1 (top-level 1), nav 6 [Main, (unlabelled), Sections, t30-2026-10-28, (unlabelled), Footer], main 1 (#main is a <DIV> with tabindex=-1, not a <main> element), footer 1; skip link: "Skip to content" → #main, off-screen at rest (top -60px); heading-level skips: none
- /daily/october-28-2026 nav links @1440: Home, Catch up, AI Stress Index, About; @390: Home, Catch up, AI Stress Index, About; nav scrollWidth/clientWidth @390 358/358 (overflows: false)
- /daily/october-28-2026 nav @360: Home, Catch up, AI Stress Index, About; scrollWidth/clientWidth 328/328; header height 83px
- /daily/october-28-2026/1: header 1 (top-level 1), nav 4 [Main, (unlabelled), st-list-t, Footer], main 1 (#main is a <DIV> with tabindex=-1, not a <main> element), footer 1; skip link: "Skip to content" → #main, off-screen at rest (top -60px); heading-level skips: none
- /daily/october-28-2026/1 nav links @1440: Home, Catch up, AI Stress Index, About; @390: Home, Catch up, AI Stress Index, About; nav scrollWidth/clientWidth @390 358/358 (overflows: false)
- /daily/october-28-2026/1 nav @360: Home, Catch up, AI Stress Index, About; scrollWidth/clientWidth 328/328; header height 83px
- /daily: header 2 (top-level 1), nav 2 [Main, Footer], main 1 (#main is a <DIV> with tabindex=-1, not a <main> element), footer 1; skip link: "Skip to content" → #main, off-screen at rest (top -60px); heading-level skips: none
- /daily nav links @1440: Home, Catch up, AI Stress Index, About; @390: Home, Catch up, AI Stress Index, About; nav scrollWidth/clientWidth @390 358/358 (overflows: false)
- /daily nav @360: Home, Catch up, AI Stress Index, About; scrollWidth/clientWidth 328/328; header height 83px
- /about: header 2 (top-level 1), nav 2 [Main, Footer], main 1 (#main is a <DIV> with tabindex=-1, not a <main> element), footer 1; skip link: "Skip to content" → #main, off-screen at rest (top -60px); heading-level skips: none
- /about nav links @1440: Home, Catch up, AI Stress Index, About; @390: Home, Catch up, AI Stress Index, About; nav scrollWidth/clientWidth @390 358/358 (overflows: false)
- /about nav @360: Home, Catch up, AI Stress Index, About; scrollWidth/clientWidth 328/328; header height 83px
- There is no hamburger menu: at ≤700px the four nav links sit on a second header row in a horizontally scrollable <nav> (scrollbar hidden). Whether any link is off-screen is reported above per width.

### Focus (fresh page, Tab × 3)

- / @390: before Tab activeElement=BODY . scrollY=0; Tab1 → <a.ev-special> "SPECIAL REPORT TODAY Popped or leaking? " focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab2 → <a> "01 China pops, America leaks" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab3 → <a> "02 India Inc's zombies thin out" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px (screenshot audit/shots/focus-home-390-light.png)
- / @1440: before Tab activeElement=BODY . scrollY=0; Tab1 → <a.ev-special> "SPECIAL REPORT TODAY Popped or leaking? " focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab2 → <a> "01 China pops, America leaks" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab3 → <a> "02 India Inc's zombies thin out" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px (screenshot audit/shots/focus-home-1440-light.png)
- /daily/october-28-2026 @390: before Tab activeElement=BODY . scrollY=0; Tab1 → <a.ev-special> "SPECIAL REPORT TODAY Popped or leaking? " focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab2 → <a> "01 China pops, America leaks" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab3 → <a> "02 India Inc's zombies thin out" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px (screenshot audit/shots/focus-daily_october-28-2026-390-light.png)
- /daily/october-28-2026 @1440: before Tab activeElement=BODY . scrollY=0; Tab1 → <a.ev-special> "SPECIAL REPORT TODAY Popped or leaking? " focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab2 → <a> "01 China pops, America leaks" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab3 → <a> "02 India Inc's zombies thin out" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px (screenshot audit/shots/focus-daily_october-28-2026-1440-light.png)
- /daily/october-28-2026/1 @390: before Tab activeElement=BODY . scrollY=0; Tab1 → <a.skip-link> "Skip to content" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab2 → <a.wordmark> "KKReckons" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab3 → <a> "Home" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px (screenshot audit/shots/focus-daily_october-28-2026_1-390-light.png)
- /daily/october-28-2026/1 @1440: before Tab activeElement=BODY . scrollY=0; Tab1 → <a.skip-link> "Skip to content" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab2 → <a.wordmark> "KKReckons" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab3 → <a> "Home" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px (screenshot audit/shots/focus-daily_october-28-2026_1-1440-light.png)
- /daily @390: before Tab activeElement=BODY . scrollY=0; Tab1 → <a.skip-link> "Skip to content" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab2 → <a.wordmark> "KKReckons" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab3 → <a> "Home" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px (screenshot audit/shots/focus-daily-390-light.png)
- /daily @1440: before Tab activeElement=BODY . scrollY=0; Tab1 → <a.skip-link> "Skip to content" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab2 → <a.wordmark> "KKReckons" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab3 → <a> "Home" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px (screenshot audit/shots/focus-daily-1440-light.png)
- /about @390: before Tab activeElement=BODY . scrollY=0; Tab1 → <a.skip-link> "Skip to content" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab2 → <a.wordmark> "KKReckons" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab3 → <a> "Home" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px (screenshot audit/shots/focus-about-390-light.png)
- /about @1440: before Tab activeElement=BODY . scrollY=0; Tab1 → <a.skip-link> "Skip to content" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab2 → <a.wordmark> "KKReckons" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px; Tab3 → <a> "Home" focus-visible=true outline solid 3px rgb(239, 116, 71) offset 3px (screenshot audit/shots/focus-about-1440-light.png)

### Tab order probe (fresh page at 390px, 13 Tabs then 14 Shift+Tabs; with and without JavaScript)

- / with JS: start body "Skip to content KKReckons Home" y=0 → a.ev-special "SPECIAL REPORT TODAY Popped or" y=487 → a "01 China pops, America leaks" y=757 → a "02 India Inc's zombies thin ou" y=798 → a "03 Markets may decide December" y=809 → a "04 Thinner customers, pricier " y=815 → a "05 Tech parents unplug the cla" y=799 → a.ev-30s-cards "See today as visual cards One " y=788 → a "01" y=883 → a.ev-sx-watch "Watching 4 signs the AI build-" y=838 → a.ev-sx-cta "Gauges →" y=813 → a.ev-call "40% China's STAR50 AI and chip" y=1063 → a.ev-call "14.2% of listed Indian firms s" y=1142
- / Shift+Tab back (with JS): a.ev-call "40% China's STAR50 AI and chip" y=911 → a.ev-sx-cta "Gauges →" y=184 → a.ev-sx-watch "Watching 4 signs the AI build-" y=1 → a "01" y=-13 → a.ev-30s-cards "See today as visual cards One " y=-28 → a "05 Tech parents unplug the cla" y=-19 → a "04 Thinner customers, pricier " y=-1 → a "03 Markets may decide December" y=37 → a "02 India Inc's zombies thin ou" y=3 → a "01 China pops, America leaks" y=-6 → a.ev-special "SPECIAL REPORT TODAY Popped or" y=-243 → button.ev-share-one "Share" y=-231 → a.hdr-sub "Subscribe" y=8 → button.theme-toggle "Switch to dark mode" y=9
- / without JS: start body "Skip to content KKReckons Home" y=0 → a.skip-link "Skip to content" y=10 → a.wordmark "KKReckons" y=11 → a.on "Home" y=42 → a "Catch up" y=42 → a "AI Stress Index" y=42 → a "About" y=42 → button.theme-toggle "Switch to dark mode" y=9 → a.hdr-sub "Subscribe" y=8 → button.ev-share-one "Share" y=435 → a.ev-special "SPECIAL REPORT TODAY Popped or" y=487 → a "01 China pops, America leaks" y=757 → a "02 India Inc's zombies thin ou" y=798
- / focusable elements before .ev-special in DOM order (with JS): a.skip-link tabindex=0 display=block, a.wordmark tabindex=0 display=block, a.on tabindex=0 display=block, a. tabindex=0 display=block, a. tabindex=0 display=block, a. tabindex=0 display=block, button.theme-toggle tabindex=0 display=grid, a.hdr-sub tabindex=0 display=block, div. tabindex=-1 display=block, button.ev-share-one tabindex=0 display=flex, a.ev-wa tabindex=0 display=none, a. tabindex=0 display=none, a. tabindex=0 display=none, button. tabindex=0 display=none, a.on tabindex=0 display=flex INERT aria-hidden, a. tabindex=0 display=flex INERT aria-hidden, a. tabindex=0 display=flex INERT aria-hidden, a. tabindex=0 display=flex INERT aria-hidden; inert elements: nav.ev-bar inert=; autofocus: 0; dialogs: lb open=false
- /daily/october-28-2026 with JS: start body "Skip to content KKReckons Home" y=0 → a.ev-special "SPECIAL REPORT TODAY Popped or" y=332 → a "01 China pops, America leaks" y=602 → a "02 India Inc's zombies thin ou" y=643 → a "03 Markets may decide December" y=684 → a "04 Thinner customers, pricier " y=725 → a "05 Tech parents unplug the cla" y=784 → a.ev-30s-cards "See today as visual cards One " y=819 → a "01" y=836 → a.ev-sx-cta "Gauges →" y=544 → a.ev-call "40% China's STAR50 AI and chip" y=898 → a.ev-call "14.2% of listed Indian firms s" y=899 → a.ev-cat "AI · MARKETS" y=1111
- /daily/october-28-2026 Shift+Tab back (with JS): a.ev-call "14.2% of listed Indian firms s" y=751 → a.ev-call "40% China's STAR50 AI and chip" y=587 → a.ev-sx-cta "Gauges →" y=163 → a "01" y=194 → a.ev-30s-cards "See today as visual cards One " y=23 → a "05 Tech parents unplug the cla" y=-8 → a "04 Thinner customers, pricier " y=-31 → a "03 Markets may decide December" y=11 → a "02 India Inc's zombies thin ou" y=-5 → a "01 China pops, America leaks" y=-11 → a.ev-special "SPECIAL REPORT TODAY Popped or" y=-207 → button.ev-share-one "Share" y=-191 → a "Catch up" y=-100 → a.hdr-sub "Subscribe" y=8
- /daily/october-28-2026 without JS: start body "Skip to content KKReckons Home" y=0 → a.skip-link "Skip to content" y=10 → a.wordmark "KKReckons" y=11 → a "Home" y=42 → a.on "Catch up" y=42 → a "AI Stress Index" y=42 → a "About" y=42 → button.theme-toggle "Switch to dark mode" y=9 → a.hdr-sub "Subscribe" y=8 → a "Catch up" y=98 → button.ev-share-one "Share" y=280 → a.ev-special "SPECIAL REPORT TODAY Popped or" y=332 → a "01 China pops, America leaks" y=602
- /daily/october-28-2026 focusable elements before .ev-special in DOM order (with JS): a.skip-link tabindex=0 display=block, a.wordmark tabindex=0 display=block, a. tabindex=0 display=block, a.on tabindex=0 display=block, a. tabindex=0 display=block, a. tabindex=0 display=block, button.theme-toggle tabindex=0 display=grid, a.hdr-sub tabindex=0 display=block, div. tabindex=-1 display=block, a. tabindex=0 display=inline, button.ev-share-one tabindex=0 display=flex, a.ev-wa tabindex=0 display=none, a. tabindex=0 display=none, a. tabindex=0 display=none, button. tabindex=0 display=none, a.on tabindex=0 display=flex INERT aria-hidden, a. tabindex=0 display=flex INERT aria-hidden, a. tabindex=0 display=flex INERT aria-hidden, a. tabindex=0 display=flex INERT aria-hidden; inert elements: nav.ev-bar inert=; autofocus: 0; dialogs: lb open=false
- /daily/october-28-2026/1 with JS: start body "Skip to content KKReckons Home" y=0 → a.skip-link "Skip to content" y=10 → a.wordmark "KKReckons" y=11 → a "Home" y=42 → a.on "Catch up" y=42 → a "AI Stress Index" y=42 → a "About" y=42 → button.theme-toggle "Switch to dark mode" y=9 → a.hdr-sub "Subscribe" y=8 → a "Catch up" y=98 → a "Wednesday, 28 October 2026" y=98 → a.ev-cat "AI · MARKETS" y=158 → a "China's AI stocks crash 40% as" y=194
- /daily/october-28-2026/1 Shift+Tab back (with JS): a.ev-cat "AI · MARKETS" y=158 → a "Wednesday, 28 October 2026" y=98 → a "Catch up" y=98 → a.hdr-sub "Subscribe" y=8 → button.theme-toggle "Switch to dark mode" y=9 → a "About" y=42 → a "AI Stress Index" y=42 → a.on "Catch up" y=42 → a "Home" y=42 → a.wordmark "KKReckons" y=11 → a.skip-link "Skip to content" y=10 → body "Skip to content KKReckons Home" y=0 → a "X" y=3569 → a "LinkedIn" y=3371
- /daily/october-28-2026/1 without JS: start body "Skip to content KKReckons Home" y=0 → a.skip-link "Skip to content" y=10 → a.wordmark "KKReckons" y=11 → a "Home" y=42 → a.on "Catch up" y=42 → a "AI Stress Index" y=42 → a "About" y=42 → button.theme-toggle "Switch to dark mode" y=9 → a.hdr-sub "Subscribe" y=8 → a "Catch up" y=98 → a "Wednesday, 28 October 2026" y=98 → a.ev-cat "AI · MARKETS" y=158 → a "China's AI stocks crash 40% as" y=194
- /daily/october-28-2026/1 focusable elements before .ev-special in DOM order (with JS): (no .ev-special on this page); inert elements: none; autofocus: 0; dialogs: lb open=false
- /daily with JS: start body "Skip to content KKReckons Home" y=0 → a.skip-link "Skip to content" y=10 → a.wordmark "KKReckons" y=11 → a "Home" y=42 → a.on "Catch up" y=42 → a "AI Stress Index" y=42 → a "About" y=42 → button.theme-toggle "Switch to dark mode" y=9 → a.hdr-sub "Subscribe" y=8 → input "Search stories" y=557 → button "By edition" y=624 → button "All stories" y=624 → button.chip "AI 101" y=679
- /daily Shift+Tab back (with JS): button "All stories" y=624 → button "By edition" y=624 → input "Search stories" y=557 → a.hdr-sub "Subscribe" y=8 → button.theme-toggle "Switch to dark mode" y=9 → a "About" y=42 → a "AI Stress Index" y=42 → a.on "Catch up" y=42 → a "Home" y=42 → a.wordmark "KKReckons" y=11 → a.skip-link "Skip to content" y=10 → body "Skip to content KKReckons Home" y=0 → a "X" y=9049 → a "LinkedIn" y=8869
- /daily without JS: start body "Skip to content KKReckons Home" y=0 → a.skip-link "Skip to content" y=10 → a.wordmark "KKReckons" y=11 → a "Home" y=42 → a.on "Catch up" y=42 → a "AI Stress Index" y=42 → a "About" y=42 → button.theme-toggle "Switch to dark mode" y=9 → a.hdr-sub "Subscribe" y=8 → input "Search stories" y=557 → button "By edition" y=624 → button "All stories" y=624 → button.chip "AI 101" y=679
- /daily focusable elements before .ev-special in DOM order (with JS): (no .ev-special on this page); inert elements: none; autofocus: 0; dialogs: lb open=false
- /about with JS: start body "Skip to content KKReckons Home" y=0 → a.skip-link "Skip to content" y=10 → a.wordmark "KKReckons" y=11 → a "Home" y=42 → a "Catch up" y=42 → a "AI Stress Index" y=42 → a.on "About" y=42 → button.theme-toggle "Switch to dark mode" y=9 → a.hdr-sub "Subscribe" y=8 → a "email us" y=3083 → a.ab-btn "Read Today’s Edition →" y=3359 → a.ab-btn-ghost "Get it by email ↗" y=3361 → a "Privacy" y=3330
- /about Shift+Tab back (with JS): a.ab-btn-ghost "Get it by email ↗" y=2757 → a.ab-btn "Read Today’s Edition →" y=2467 → a "email us" y=2087 → a.hdr-sub "Subscribe" y=8 → button.theme-toggle "Switch to dark mode" y=9 → a.on "About" y=42 → a "AI Stress Index" y=42 → a "Catch up" y=42 → a "Home" y=42 → a.wordmark "KKReckons" y=11 → a.skip-link "Skip to content" y=-2634 → body "Skip to content KKReckons Home" y=-2497 → a "X" y=1531 → a "LinkedIn" y=1237
- /about without JS: start body "Skip to content KKReckons Home" y=0 → a.skip-link "Skip to content" y=10 → a.wordmark "KKReckons" y=11 → a "Home" y=42 → a "Catch up" y=42 → a "AI Stress Index" y=42 → a.on "About" y=42 → button.theme-toggle "Switch to dark mode" y=9 → a.hdr-sub "Subscribe" y=8 → a "email us" y=3062 → a.ab-btn "Read Today’s Edition →" y=3346 → a.ab-btn-ghost "Get it by email ↗" y=3361 → a "Privacy" y=3330
- /about focusable elements before .ev-special in DOM order (with JS): (no .ev-special on this page); inert elements: none; autofocus: 0; dialogs: lb open=false
- Home .ab-strap ("A CLEARER SLICE OF A COMPLEX WORLD") computed font-size: @390 9px (clamp(9px, 1.1vw, 13px), colour rgb(43, 29, 64), text-shadow over the hero photo); @1440 13px.
- Edition @390 light: .ev-sx-read em (band pill) {"fontSize":"11.5px","color":"rgb(29, 15, 53)","background":"rgb(251, 191, 36)","text":"ELEVATED"}; .ev-sx-cta {"fontSize":"13.5px","color":"rgb(36, 18, 63)","background":"rgb(255, 255, 255)","text":"Gauges →"}; .ev-special-tag {"fontSize":"10.5px","color":"rgb(27, 39, 71)","background":"rgb(245, 199, 126)","text":"SPECIAL REPORT TODAY"}; .ev-free-tag {"fontSize":"11px","color":"rgb(15, 92, 46)","background":"rgb(231, 246, 236)","text":"Free version"}; .ev-bar span {"fontSize":"11.5px","color":"rgb(255, 255, 255)","background":"rgba(0, 0, 0, 0)","text":"1"}; .hdr-sub {"fontSize":"13px","color":"rgb(255, 255, 255)","background":"rgb(36, 18, 63)","text":"Subscribe"}; dark .hdr-sub {"fontSize":"13px","color":"rgb(26, 18, 34)","background":"rgb(240, 136, 90)","text":"Subscribe"}.

### Cause of the first-Tab jump on / and the edition page (audit/focus-cause.mjs)

- / normal: selection before Tab = None (rangeCount 0), scrollY 0; first Tab lands on a.ev-special "SPECIAL REPORT TODAY Popped or"
- / scrollIntoView-noop: selection before Tab = None (rangeCount 0), scrollY 0; first Tab lands on a.skip-link "Skip to content"
- /daily/october-28-2026 normal: selection before Tab = None (rangeCount 0), scrollY 0; first Tab lands on a.ev-special "SPECIAL REPORT TODAY Popped or"
- /daily/october-28-2026 scrollIntoView-noop: selection before Tab = None (rangeCount 0), scrollY 0; first Tab lands on a.skip-link "Skip to content"
- With JavaScript on, the first Tab on / and on the edition page lands on a.ev-special, skipping the skip link, wordmark, four nav links, theme toggle, Subscribe and the Share button. With JavaScript off, or with Element.prototype.scrollIntoView replaced by a no-op before load, the first Tab lands on a.skip-link. DOM order on these pages is: header links → div#main → .ev-share (Share button + display:none links) → nav.ev-bar (inert, aria-hidden, four section links) → a.ev-special. components/SectionBar.tsx line 47 calls scrollIntoView({block:'nearest', inline:'nearest'}) on the active .ev-bar link in a useEffect on mount; in Chromium, scrollIntoView() moves the sequential-focus-navigation starting point to that element, and because the bar is inert the next Tab stop after it is .ev-special. Story, archive and about pages have no SectionBar and tab normally. Only Chromium was tested.

## 12. Forms

- components/EmailSignup.tsx renders <input type="email" inputMode="email" autoComplete="email" required> styled by .es input[type=email] { height: 46px; font: 16px var(--sans) } — but only when lib/site.ts INLINE_SIGNUP = Boolean(process.env.BEEHIIV_API_KEY). BEEHIIV_API_KEY is unset locally, so no email input renders on any page; the fallback is an external link to https://kkreckons.beehiiv.com/subscribe (target=_blank): 'Subscribe free ↗' / 'Get it by email ↗' and the header 'Subscribe' pill.
- /: inputs rendered: none; sign-up elements present: a.hdr-sub "Subscribe" → https://kkreckons.beehiiv.com/subscribe target=_blank; div.ev-signup "One visual briefing a day. Free, unsubsc"; a "Get it by email ↗" → https://kkreckons.beehiiv.com/subscribe target=_blank; a.ab-btn "Subscribe free ↗" → https://kkreckons.beehiiv.com/subscribe target=_blank; a.ab-btn-ghost "Catch up on past editions" → /daily; a "Privacy" → /privacy
- /daily/october-28-2026: inputs rendered: none; sign-up elements present: a.hdr-sub "Subscribe" → https://kkreckons.beehiiv.com/subscribe target=_blank; div.ev-signup "One visual briefing a day. Free, unsubsc"; a "Get it by email ↗" → https://kkreckons.beehiiv.com/subscribe target=_blank; a.ab-btn "Read Today’s Edition →" → /; a.ab-btn-ghost "Get it by email ↗" → https://kkreckons.beehiiv.com/subscribe target=_blank; a "Privacy" → /privacy
- /daily/october-28-2026/1: inputs rendered: none; sign-up elements present: a.hdr-sub "Subscribe" → https://kkreckons.beehiiv.com/subscribe target=_blank; a.ab-btn "Read Today’s Edition →" → /; a.ab-btn-ghost "Get it by email ↗" → https://kkreckons.beehiiv.com/subscribe target=_blank; a "Privacy" → /privacy; a "Editorial standards" → /standards
- /daily: inputs rendered: type=search font-size 16px height 50px inputmode=null autocomplete=null; sign-up elements present: a.hdr-sub "Subscribe" → https://kkreckons.beehiiv.com/subscribe target=_blank; a.ab-btn "Read Today’s Edition →" → /; a.ab-btn-ghost "Get it by email ↗" → https://kkreckons.beehiiv.com/subscribe target=_blank; a "Privacy" → /privacy; a "Editorial standards" → /standards
- /about: inputs rendered: none; sign-up elements present: a.hdr-sub "Subscribe" → https://kkreckons.beehiiv.com/subscribe target=_blank; a.ab-btn "Read Today’s Edition →" → /; a.ab-btn-ghost "Get it by email ↗" → https://kkreckons.beehiiv.com/subscribe target=_blank; a "Privacy" → /privacy; a "Editorial standards" → /standards
- components/ArchiveBrowser.tsx renders <input id="archive-search" type="search" aria-label="Search stories" aria-keyshortcuts="/">. A global '/' key handler (components/SearchKey.tsx) focuses it or navigates to /daily/#search.

## 13. Fonts, reduced motion, colour scheme (from app/globals.css and observed requests)

- @font-face 'Playfair Display' 700, font-display: swap, src url(/fonts/playfair-700.woff2) (19,032 B on disk)
- @font-face 'Playfair Display' 800, font-display: swap, src url(/fonts/playfair-800.woff2) (18,980 B on disk)
- Observed font requests on /daily/october-28-2026 @390: /fonts/playfair-800.woff2 18.5 KB (self-hosted: true); /fonts/playfair-700.woff2 18.6 KB (self-hosted: true)
- Font stacks: --sans (body, nav, UI) = -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif; --serif (home hero, stress index) = Georgia, "Times New Roman", serif; headlines (.ev h1/h2/h3, .wordmark, .about h1-h3) = "Playfair Display", Georgia, serif
- package.json lists @fontsource/cormorant-garamond and @fontsource/playfair-display as dependencies; neither is imported anywhere in app/, components/ or lib/ (grep 'fontsource' finds only package.json).
- app/layout.tsx preloads /fonts/playfair-800.woff2 (as=font, crossOrigin=anonymous).
- Reduced motion: @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } *, *::before, *::after { transition: none !important; animation: none !important } } (globals.css ~line 663)
- Reduced motion: @media (prefers-reduced-motion: reduce) { .ev-bar { transition: none } } (~line 818)
- Colour scheme: 8 @media (prefers-color-scheme: dark) blocks, each scoped to :root:not([data-theme="light"]), with a duplicate :root[data-theme="dark"] rule for the header toggle:
- Colour scheme: line 64: the full dark token set (--ink #ece8f2, --cream #14111b, --paper/--card #1e1a28, --accent #f29a6c …) plus color-scheme: dark
- Colour scheme: line 94: .hdr-sub becomes #f0885a with #1a1222 text
- Colour scheme: line 291: .mk --mk-up #4ade80 / --mk-down #f87171
- Colour scheme: line 479: .ab-top-img img filter brightness(0.72) saturate(0.92)
- Colour scheme: line 770: inset 1px white 10% ring on .ev-sx, .ab-join, .ev-call, .hdr-sub, .tl-day, .ab-third
- Colour scheme: line 825: section tokens --sec-pick/--sec-india/--sec-world
- Colour scheme: lines 857/865: .wk-mk and .wk-no (week page)
- Colour scheme: Theme choice persists in localStorage('theme') and is applied by an inline script in <head> before paint; <meta name=theme-color> is set for both schemes (#fbf8f1 / #14111b).
- Focus style: a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid var(--orange) /* #ef7447 */; outline-offset: 3px; border-radius: 6px } — .es input[type=email]:focus sets outline: none and a 4px box-shadow instead.

## 14. Routing and miscellany

- GET /daily/ returns 308 Permanent Redirect to /daily. Source contains 13 internal links to "/daily/" (app/layout.tsx footer 'Past editions', components/SubscribeBox.tsx 'Catch up on past editions', app/week, app/month, app/daily/[slug]/[n] breadcrumb, app/not-found.tsx, …), so each of those clicks goes through the redirect. The header nav link uses /daily (no slash). Sitemap URLs have no trailing slashes.
- next.config.mjs rewrites /ai-stress-index/data.json to https://kkreddy79.github.io/ai-implosion/data.json; locally this returns 500 because the sandbox cannot reach GitHub Pages.
- AI Stress Index data in the browser: lib/stress.ts fetches https://kkreddy79.github.io/ai-implosion/*.json server-side with revalidate 3600 (fails locally with ENOTFOUND, logged by next start); components/StressIndex.tsx only fetches from GitHub in the browser when the server could not. Across all measured page loads no request left localhost (no github.io / raw.githubusercontent.com / umami / vercel request was observed), and the edition page's AI Stress Index card (.ev-sx) rendered a score and band from data stored with the edition.
- Next.js link prefetch: on the edition page at 390 the browser fetched 6 RSC payloads (54 KB) at load and 28 (156 KB) after scrolling the whole page (fetch type in section 4).

## 15. Could not verify (not measurable locally)

- Strict-Transport-Security and any other headers Vercel adds at the edge; CDN cache behaviour (age, x-vercel-cache, s-maxage honouring).
- Real-user timings (LCP/INP/CLS), TTFB, compression (Brotli) and HTTP/2/3 on Vercel; local load times above are on localhost.
- Vercel Analytics (/_vercel/insights/script.js) and Umami behaviour in production; locally the script 404s and Umami is not loaded.
- AI Stress Index live data (/ai-stress-index/data.json rewrite to GitHub Pages) — 500 locally; the home-page card and /ai-stress-index page therefore show their fallback/limited states here.
- Google indexation, Search Console coverage, rich-result eligibility, Discover, news-sitemap acceptance.
- Beehiiv-backed inline sign-up form (BEEHIIV_API_KEY unset locally; the external-link fallback is what rendered).
- Research brief fonts: whether 'Lora' / 'IBM Plex Mono' render on real devices depends on local installation; no web font is loaded.
- Behaviour on real iOS Safari (input zoom, share sheet, 100vh), real screen readers and real touch; Playwright Chromium with isMobile emulation only.