# KKReckons

**Read deep. Think clearly. Stay curious.**

Mobile-first editorial site for Krishnakanth Reddy's visual daily briefings, live at [kkreckons.com](https://www.kkreckons.com).

## Stack
- Next.js 16 (App Router, fully static)
- React 19
- Vercel for hosting, Cloudflare for domain/DNS

## Routes
- `/` — today's edition, followed by earlier editions
- `/daily/` — archive: every edition by month, plus search and theme filters across all stories
- `/daily/<month>-<day>-<year>` — one edition (for example `/daily/october-9-2026`), with previous/next navigation
- `/daily/<month>-<day>-<year>/cards` — the day in cards: every story's explainer graphic in one grid (built for editions with two or more graphics; linked from the "Today in 30 seconds" card, not in the sitemap)
- `/daily/<month>-<day>-<year>/<n>` — one story of an edition on its own page
- `/topics` and `/topics/<topic>` — every story in each archive theme (for example `/topics/ai`), newest first
- `/special` — Special Reports hub: every long read, newest first; `/special/<slug>` — one report (a self-contained HTML
  file KK supplies, kept in `special/<slug>.html`, served inside the site header and footer with its own stylesheet scoped to
  the report). The registry is `data/special.json`: one entry per report (slug, title, kicker, dek, date, themes, reading time,
  `file` or `href` for a report that lives elsewhere on the site, 1600×900 `cover`, sources). An edition can point at a report
  with a top-level `special` object in its data (see `docs/edition-format.md`).
- `/about` — about the briefing
- `/api/subscribe` — adds a reader to the beehiiv list from the on-page email form

## How editions are stored
- `newsletters/YYYY-MM-DD.html` — the original newsletter HTML, kept as the source only (not served on the site).
  Each is stored without its images and embedded fonts: once `npm run editions` has saved the images to
  `public/figs/`, the publish command swaps each one for a `kkreckons-fig:/figs/<file>` pointer (about 2.7 MB → 0.1 MB
  a day; the newsletters up to 24 Oct were stripped the same way on 28 Oct). The claude.ai artifact keeps every
  original. An image hidden or removed with an edition-meta override is kept off the site in `newsletters/figs-kept/`,
  so lifting the override brings it back.
- `data/content/YYYY-MM-DD.json` — each edition's stories, numbers, why it matters, other side, sources and further reading, generated
- `data/editions.json` — the index used by the archive and home page, generated
- `public/figs/` — story images pulled out of the newsletters (stored at most 1600px wide from 28 Oct), with WebP
  copies (`-sm`, `-md`, `-lg`) and a 184×240 list thumbnail (`-th`), generated
- `data/edition-meta.json` — hand-edited extras per date: `artifact` (link to the interactive version) and an optional `slice` override
- `data/weekly/YYYY-MM-DD.json` — the written parts of a weekly issue (`oneMinute`, `history`, `andFinally`), dated the
  week's last day. With one, `/week` and the Friday email become a numbered issue (the week in one minute, the best
  stories, the AI Stress Index move, this week in history, and finally); without one, `/week` is the plain list.
- `data/markets/YYYY-MM-DD.json` — the edition's market strip (Nifty 50, S&P 500, US 10-year yield, Brent, gold, USD/INR at
  the last close before its date), saved once by `npm run editions` from the AI Stress Index job's `markets.json`. Every
  edition has one; commit it with the edition. If the data was unreachable the edition shows no strip.
- `data/watch.json` — "What would change our mind", hand-edited: the signs that would show a thesis breaking ("The AI
  build-out is breaking"), each marked `met`, `partly` or `not-met` with the date it began, one evidence line and the
  stories behind it. Shown on `/ai-stress-index#watching`, tallied on Home's Stress Index card. To change a mark, move the
  old `state`/`since` to the front of `history`, then set the new `state`, `since`, `evidence` and `links`;
  `npm run check` validates it.

Every edition is rendered in the same KKReckons design from its content JSON, whatever the original newsletter looked like.

## Publishing a new daily edition
A nightly routine (8:53 pm and 11:53 pm Pacific) runs the `publish-edition` skill (`.claude/skills/publish-edition/SKILL.md`):
it finds the newest artifact titled `KKReckons, <Weekday>, <D> <Month> <YYYY>` that isn't on the site yet,
builds and checks it, opens a pull request with a Vercel preview, and merges only after Krishnakanth replies
"publish". To run it by hand, ask Claude Code to "publish today's edition". The Friday best-of email has its own
skill (`.claude/skills/weekly-email/SKILL.md`): ask for "the weekly".

Both skills run on Sonnet (`model: sonnet` in their frontmatter), which covers the turn that starts them; start
publishing sessions on Sonnet too (model picker or `/model sonnet`) so the approval and email turns stay on it.
The rights review asks an Opus subagent only about graphics that aren't plainly KKReckons' own.

`npm run qc` (after `npm run editions` and `npm run build`) is the quality-control gate before any edition goes
live. It checks that no earlier edition's data, newsletter or images changed or went missing, that every page
shows all of its data, and that the edition Home replaces moves to Catch up.

`npm run check` (or `npm run check -- YYYY-MM-DD`) confirms every story has a source link, at least two
summary points, a "why it matters" and alt text for every graphic.

`npm run site-check` (with the built site running: `npx next start -p 3000`) opens every page type on eight
device sizes: small Android phone (360px), iPhone (390px), large phone (430px), tablet portrait (768px) and
landscape (1024px), a laptop at Windows' 150% scaling (1280px), a common laptop (1366px) and a wide desktop
(1920px), phones and tablets with touch; dark mode on a phone and a laptop; and Safari's engine (WebKit) on
iPhone, tablet and laptop sizes when it is installed (CI installs it). It fails on a page that doesn't load,
throws a script error, scrolls sideways, crops a cover or share image (they carry their own headline), clips
text at the edge of its box, or has a serious accessibility problem (axe), and lists tap targets under 40px on
touch screens. `SITE_CHECK_PAGES=/special,/about` checks just those pages; `SITE_CHECK_SHOTS=<dir>` saves a
screenshot of every page on every device to look at by eye.

Every pull request runs all of these on GitHub Actions (`.github/workflows/checks.yml`): the content check,
the build, QC (`--site-change` for anything that isn't an `edition/*` branch, which skips only the
"edition files only" rule) and the site check.

Manual steps, if needed:
1. Save the edition's HTML as `newsletters/YYYY-MM-DD.html`.
2. Optionally add its artifact link to `data/edition-meta.json`.
3. Run `npm install` (first time only), then `npm run editions`. Newsletters that embed their data in a `<script id="data">` tag are read directly; older formats are read from the rendered page in headless Chromium.
   If Playwright's browser isn't installed, run `npx playwright install chromium` once, or point `CHROMIUM_PATH` at an existing Chrome.
4. Commit and push. Vercel redeploys automatically, and the home page shows the new edition.

## Email sign-up
The email boxes on Home, after each edition's Pick of the day and in the closing band sign readers up without
leaving the site. They need a beehiiv API key set as `BEEHIIV_API_KEY` in Vercel (Production and Preview),
then a redeploy. Without it, those spots stay links to beehiiv's sign-up page.

## Analytics
Vercel Web Analytics counts visits. Umami Cloud (free Hobby plan, no cookies) adds visit duration and a named
event for every link or button tapped (`Out: <site>` for sources, `Go: <path>` for pages here, `Tap: <label>`
for buttons, `Subscribe` for an on-page sign-up), from `components/Umami.tsx`. It is off until
`NEXT_PUBLIC_UMAMI_WEBSITE_ID` (the website ID from Umami's dashboard) is set in Vercel for Production, then a
redeploy. It counts only www.kkreckons.com, so previews and local runs don't add to the numbers.

## Develop
```
npm install
npm run dev
```
