# KKReckons

**Read deep. Think clearly. Stay curious.**

Mobile-first editorial site for KK Reddy's visual daily briefings, live at [kkreckons.com](https://www.kkreckons.com).

## Stack
- Next.js 16 (App Router, fully static)
- React 19
- Vercel for hosting, Cloudflare for domain/DNS

## Routes
- `/` — today's edition, followed by earlier editions
- `/daily/` — archive: every edition by month, plus search and theme filters across all stories
- `/daily/<month>-<day>-<year>` — one edition (for example `/daily/october-9-2026`), with previous/next navigation
- `/about` — about the briefing
- `/admin` — publishing dashboard placeholder (not linked from the site)

## How editions are stored
- `public/editions/YYYY-MM-DD.html` — the original newsletter HTML (linked as "Original newsletter design")
- `data/content/YYYY-MM-DD.json` — each edition's stories, numbers, why it matters, other side, sources and further reading, generated
- `data/editions.json` — the index used by the archive and home page, generated
- `public/figs/` — story images pulled out of the newsletters, generated
- `data/edition-meta.json` — hand-edited extras per date: `artifact` (link to the interactive version) and an optional `slice` override

Every edition is rendered in the same KKReckons design from its content JSON, whatever the original newsletter looked like.

## Publishing a new daily edition
1. Save the edition's HTML as `public/editions/YYYY-MM-DD.html`.
2. Optionally add its artifact link to `data/edition-meta.json`.
3. Run `npm install` (first time only), then `npm run editions`. Newsletters that embed their data in a `<script id="data">` tag are read directly; older formats are read from the rendered page in headless Chromium.
   If Playwright's browser isn't installed, run `npx playwright install chromium` once, or point `CHROMIUM_PATH` at an existing Chrome.
4. Commit and push. Vercel redeploys automatically, and the home page shows the new edition.

## Develop
```
npm install
npm run dev
```
