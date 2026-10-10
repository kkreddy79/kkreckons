---
name: publish-edition
description: Find the newest KKReckons newsletter artifact that isn't on the website yet, turn it into a site edition, check it, and open a preview for Krishnakanth to approve. Publishes only after he replies "publish". Use for the nightly routine, or when asked to "publish today's edition".
---

# Publish the day's KKReckons edition

Runs automatically at 8:53 pm and 11:53 pm Pacific, and whenever he asks to "publish today's edition".
On late nights the earlier run simply finds nothing new, so later runs (or his request) pick the edition up.

Krishnakanth writes each edition in his Claude Project and publishes it as a claude.ai artifact titled
`KKReckons, <Weekday>, <D> <Month> <YYYY>` (for example `KKReckons, Friday, 9 October 2026`).
The data it must contain is described in `docs/edition-format.md`.
This skill moves that artifact onto kkreckons.com. **Nothing goes live without his explicit approval.**

## 1. Find the new edition

1. `git fetch origin main` and start a branch from it. Use the branch this session was told to develop on;
   if none was given, use `edition/<YYYY-MM-DD>`.
2. List his artifacts (`Artifact` tool, `action: "list"`, `limit: 60`).
3. Keep titles matching `KKReckons, <Weekday>, <D> <Month> <YYYY>` exactly. Ignore everything else
   (company scorecards, "in about a minute" videos, older "Reddy Reckoner" titles, personal artifacts).
4. Convert each title's date to `YYYY-MM-DD` and drop dates already in `data/editions.json`.
   If two artifacts share a date, take the most recently updated one.
5. **Already waiting for approval?** If an open pull request already adds that date (titled
   `Add edition: …`), don't build it again. Send one short reminder with its preview link, unless
   you already reminded him about it in this conversation tonight, then stop.
6. **Nothing new?** Stop. Report "No new KKReckons edition found" in one line, with the newest date
   already on the site. Don't open a pull request.
7. If more than one date is new, publish each (oldest first) in the same pull request.

## 2. Build it

1. Read the artifact (`Artifact` tool, `action: "read"`, `url`). Copy the saved page to
   `newsletters/<YYYY-MM-DD>.html` (source only; it is not served on the site).
   It must be a full HTML document containing `<script id="data">`. If it isn't, stop and say so;
   don't guess at content.
2. Add `"<YYYY-MM-DD>": { "artifact": "<artifact url>" }` to `data/edition-meta.json`, keeping the
   file's existing order (oldest first) and two-space indentation.
3. `npm ci` (first time in the session), then
   `CHROMIUM_PATH=/opt/pw-browsers/chromium npm run editions`.
   Only the new date's files should change in `data/` besides `data/editions.json`; investigate any
   other diffs before going on.
4. `npm run check -- <YYYY-MM-DD>`. Every story needs:
   - a source link, at least two summary points and a "why it matters";
   - an article not already used in this edition or **any earlier edition** (same link, including
     further reading). Similar-headline warnings (⚠) must be looked at and mentioned in your message;
   - a summary of at most 120 words of points, so it doesn't replace reading the original;
   - no quoted passage over 25 words;
   - for any image, a declared origin (`figcredit`).

   Problems of these kinds are **editorial**: don't rewrite his text, drop stories or pick a replacement
   article yourself. Report each one with a suggested fix and let him decide.
   - Publishers listed as "bare domains": add a display name to `PUBLISHERS` in `lib/editions.ts`
     (and to `PAYWALLED` if the site usually needs a subscription).
   - Missing source links or thin summaries: **don't invent anything.** Search for the original article.
     If you find it, add the fix as a per-story override under `stories` in `data/edition-meta.json`
     (see the 2026-09-30 entry for the shape) and re-run `npm run editions`. List every fix you made
     in the pull request and in your message, so he can check them. Anything you can't fix stays
     listed as an open problem.
5. **Rights review** (copyright and paywall rules in `docs/edition-format.md`), done by you, not a script:
   - **Images:** open every `public/figs/<YYYY-MM-DD>-*` file and look at it. Allowed: his own original
     graphics and charts, and Creative Commons or licensed images whose `figcredit` names the licence.
     **Not allowed:** newspaper or agency photos, a publisher's own infographic or chart, anything showing
     a publisher's logo or watermark, and screenshots of articles. For anything not allowed, hide it with
     a per-story override `{ "image": "", "imageAlt": "" }` in `data/edition-meta.json` and re-run
     `npm run editions` (unused images are deleted automatically). List it in your message. Also mention
     any realistic AI-made likeness of a real person, for his decision.
   - **Own words:** for each source you can open (not paywalled), compare the points with the article.
     Flag any sentence copied word for word or with only small word changes.
   - **Paywalled sources:** the summary must give the gist and his view, not the article's full substance.
     Flag any story that reads as a replacement for the original, and any quote longer than a short phrase.
   - **Original value:** every story's "why it matters" (and "other side" when present) must add his own
     analysis, not restate the points. Flag any that don't.
6. `npm run build` must pass.
7. **Quality control: `npm run qc` must pass** (it compares against `origin/main`). It confirms:
   - every edition already live is still listed;
   - every earlier edition's data, original newsletter and images are byte-for-byte unchanged;
   - the pull request only touches edition files;
   - every edition page shows all its stories, numbers, sections, images, source lines and further reading;
   - Home shows the new edition;
   - Catch up lists every edition, including the one Home just replaced (yesterday's);
   - the sitemap lists them all.

   If it fails, fix the cause and re-run. Never publish over a failing QC. A deliberate correction to an
   earlier edition (one he asked for) is the only exception: re-run with `--allow <that date>` and say
   so in the pull request.

## 3. Preview and ask for approval

1. Commit (`Add edition: <Weekday>, <D> <Month> <YYYY>`), push, and open a pull request against
   `main`. In its body, include:
   - the headline (`slice`)
   - the story count and reading time
   - the check, rights review and QC results (including the "has moved from Home to Catch up" line)
   - every fix you made
2. Vercel builds a preview for the pull request. Get its URL from the pull request's head commit
   status (`https://api.github.com/repos/kkreddy79/kkreckons/commits/<sha>/status`, the `target_url`
   of the Vercel status) once the state reads `success`.
3. Send him one short message (and a push notification if that tool is available) with:
   - the edition date and headline
   - the preview link: `<preview url>/daily/<month>-<day>-<year>`
   - "All checks, rights review and QC passed", or the list of open problems and flags
   - which edition moves from Home to Catch up
   - "Reply **publish** to put it live, or tell me what to change."
4. Then stop and wait. **Don't merge on your own.**

## 4. On his reply

- **"publish"** (or a clear yes): first re-run `npm run qc` on the pull request's latest commit (after
  `git fetch origin main`, in case main moved). Then merge the pull request (merge commit) and poll the
  merge commit's status until Vercel reports success.
  **Live check:** confirm on the live site, using the Vercel tools (`web_fetch_vercel_url`) where available,
  that:
  - `https://www.kkreckons.com/` shows the new date and headline;
  - `https://www.kkreckons.com/daily/<new slug>` loads;
  - yesterday's page `https://www.kkreckons.com/daily/<yesterday's slug>` loads with its stories;
  - Catch up (`/daily/`) lists both.

  If anything is off, say so at once and offer a rollback (Vercel "promote" of the previous production
  deployment, or a revert pull request). Otherwise reply with the live link and the line
  "<yesterday> is now on Catch up".
- **Changes** (for example "drop story 4" or "fix the headline"): make small text fixes as overrides in
  `data/edition-meta.json` (`slice`, or `stories` keyed by title). For bigger changes, ask him to update
  the artifact in his Project, then re-read it. Rebuild, re-check, push, and send the new preview link.
- **"skip"**: close the pull request without merging.

## Rules

- Never change an edition's facts, numbers or wording beyond what he asks for, or a sourced fix you list.
- Never publish an edition with open problems unless he says to publish anyway.
- Keep commits and pull requests free of model names.
