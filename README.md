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
- `/about` — about the briefing
- `/api/subscribe` — adds a reader to the beehiiv list from the on-page email form

## How editions are stored
- `newsletters/YYYY-MM-DD.html` — the original newsletter HTML, kept as the source only (not served on the site).
  From 25 Oct 2026 each is stored without its images: once `npm run editions` has saved them to `public/figs/`,
  the publish command swaps each one for a `kkreckons-fig:/figs/<file>` pointer (about 2.7 MB → 0.1 MB a day).
  Earlier newsletters stay as published; the claude.ai artifact keeps every original.
- `data/content/YYYY-MM-DD.json` — each edition's stories, numbers, why it matters, other side, sources and further reading, generated
- `data/editions.json` — the index used by the archive and home page, generated
- `public/figs/` — story images pulled out of the newsletters, generated
- `data/edition-meta.json` — hand-edited extras per date: `artifact` (link to the interactive version) and an optional `slice` override
- `data/markets/YYYY-MM-DD.json` — the edition's market strip (Nifty 50, S&P 500, US 10-year yield, Brent, gold, USD/INR at
  the last close before its date), saved once by `npm run editions` from the AI Stress Index job's `markets.json`. Editions
  from 27 Oct 2026 have one; commit it with the edition. If the data was unreachable the edition shows no strip.

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

`npm run site-check` (with the built site running: `npx next start -p 3000`) opens every page type at phone
and desktop width, in light and dark mode, and fails on a page that doesn't load, throws a script error,
scrolls sideways, or has a serious accessibility problem (axe).

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
