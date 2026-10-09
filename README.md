# KKReckons

**Read deep. Think clearly.**

Mobile-first editorial site for KK Reddy's visual daily briefings, live at [kkreckons.com](https://www.kkreckons.com).

## Stack
- Next.js 16 (App Router, fully static)
- React 19
- Vercel for hosting, Cloudflare for domain/DNS

## Routes
- `/` — home: latest edition, recent editions, browse by theme
- `/daily/` — archive: every edition by month, plus search and theme filters across all stories
- `/daily/<month>-<day>-<year>` — one edition (for example `/daily/october-9-2026`), with a table of contents, source links and previous/next navigation
- `/about` — about the briefing
- `/admin` — publishing dashboard placeholder (not linked from the site)

## How editions are stored
- `public/editions/YYYY-MM-DD.html` — the original newsletter HTML, embedded unchanged on the edition page
- `public/covers/YYYY-MM-DD.jpg` — cover image, generated
- `data/editions.json` — headlines, sections, categories and source links, generated
- `data/edition-meta.json` — hand-edited extras per date: `artifact` (link to the interactive version), and optional `title` / `slice` overrides

## Publishing a new daily edition
1. Save the edition's HTML as `public/editions/YYYY-MM-DD.html`.
2. Optionally add its artifact link to `data/edition-meta.json`.
3. Run `npm install` (first time only), then `npm run editions`. This renders each edition in headless Chromium, pulls out the headlines and "Today's slice", writes the cover image, and updates `data/editions.json`.
   If Playwright's browser isn't installed, run `npx playwright install chromium` once, or point `CHROMIUM_PATH` at an existing Chrome.
4. Commit and push. Vercel redeploys automatically.

## Develop
```
npm install
npm run dev
```
