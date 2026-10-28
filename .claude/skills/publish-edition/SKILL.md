---
name: publish-edition
description: Find the newest KKReckons newsletter artifact that isn't on the website yet, turn it into a site edition, check it, and open a preview for Krishnakanth to approve. Publishes only after he replies "publish". Use when asked to "publish" an edition.
model: sonnet
---

# Publish the day's KKReckons edition

Runs when he asks ("Publish", "Publish Friday edition"). There is no nightly run.

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
   It must be a full HTML document containing a `<script>` with `id="data"` (usually
   `<script type="application/json" id="data">`, so search for `id="data"`, not the literal tag).
   If it isn't, stop and say so; don't guess at content. The saved page is wrapped in an extra outer
   document skeleton; copy it as is, the build strips it.
2. Add `"<YYYY-MM-DD>": { "artifact": "<artifact url>" }` to `data/edition-meta.json`, keeping the
   file's existing order (oldest first) and two-space indentation.
3. `npm ci` (first time in the session), then run every mechanical step with one command:
   `npm run -s publish-edition -- <YYYY-MM-DD>` (add `--allow <date>` only for a correction he asked for).
   It rebuilds the site data, stores the new newsletter without its images and embedded fonts (the images are in `public/figs/` by
   then; `scripts/strip-newsletter-images.mjs`), runs the automatic checks, writes the email thumbnails
   (`public/email/<YYYY-MM-DD>-<n>.png`, commit them with the edition), the market strip
   (`data/markets/<YYYY-MM-DD>.json`, commit it too; if the build says market data was unreachable, mention it) and the email JSON
   (`.publish/beehiiv-<YYYY-MM-DD>.json`, used in section 4), builds the site and runs QC, printing only
   a summary or the failing step's output. Only the new date's files should change besides
   `data/editions.json`; investigate any other diffs. Ignore "Removed unused image public/figs/<other date>-…"
   lines for older dates: they are untracked leftovers and change nothing in git.
   **Email copy:** the newsletter normally carries it (`ehead`/`eteaser` per story and a top-level
   `takeaway`, see `docs/edition-format.md`). If it doesn't, write `.publish/copy-<YYYY-MM-DD>.json`
   (`{"stories": [{"head": "…", "teaser": "…"}, …], "takeaway": {"a": "…", "b": "…", "line": "…"}}`,
   story order) from each explainer graphic's headline and takeaway in his words, invent nothing,
   and re-run with `--copy .publish/copy-<YYYY-MM-DD>.json`. Mention in your message that you wrote it.
4. Read the check output. Every story needs:
   - a source link, at least two summary points and a "why it matters";
   - an article not already used in this edition or **any earlier edition** (same link, including
     further reading). Similar-headline warnings (⚠) must be looked at and mentioned in your message;
     when the new story updates the earlier one, suggest the `follows` (and an `update` line) the warning prints,
     for him to confirm; never add it yourself;
   - a summary of at most 120 words of points, so it doesn't replace reading the original;
   - no quoted passage over 25 words;
   - for any image, a declared origin (`figcredit`) and alt text (`figalt`).
   - **"What would change our mind"** (`data/watch.json`): if a new story bears on one of the signs there, say so
     in your message and suggest the new mark and evidence line. Don't change `data/watch.json` unless he agrees.

   Problems of these kinds are **editorial**: don't rewrite his text, drop stories or pick a replacement
   article yourself. Report each one with a suggested fix and let him decide.
   - Publishers listed as "bare domains": add a display name to `PUBLISHERS` in `lib/editionFormat.ts`
     (and to `PAYWALLED` if the site usually needs a subscription).
   - "ℹ Paywalled, no free version": search for a free report of **the same facts** (Reuters, AP, PTI, the
     company's, regulator's or court's own release, a free outlet quoting the same figures, or a gift link).
     When one clearly matches, add `{ "freeUrl": "…", "freeSrc": "Reuters" }` under `stories` in
     `data/edition-meta.json` and re-run. It sits beside the original, never replaces it. List each one in the
     pull request and your message so he can check it; when nothing matches, leave it and say so.
   - Missing source links or thin summaries: **don't invent anything.** Search for the original article.
     If you find it, add the fix as a per-story override under `stories` in `data/edition-meta.json`
     (see the 2026-09-30 entry for the shape) and re-run `npm run -s publish-edition -- <YYYY-MM-DD>`. List every fix you made
     in the pull request and in your message, so he can check them. Anything you can't fix stays
     listed as an open problem.
   **Alt text** is the one gap you fill in yourself, not an editorial problem: for each graphic the check
   reports without alt text, look at it (the contact sheet in step 5 is enough) and write one or two plain
   sentences naming the graphic's headline, its big number and the two or three key points it shows, in the
   graphic's own words and figures, nothing it doesn't show. Add it as `{ "imageAlt": "…" }` under `stories`
   in `data/edition-meta.json` and re-run. Say in the pull request and your message which graphics you wrote
   alt text for, so he can change any.
   **AI Stress Index links** (he wants these every day): stories about AI debt, AI financing or credit stress get a link to
   the index. Every edition (from 22 Oct 2026) shows the day's reading, saved at publication, once: a card in "Today in 30 seconds" and one email line. Linked stories are named on the card; with none it reads "Updated every trading day". The newsletter can mark them `stressindex: true`;
   the check also prints "ℹ Possible AI Stress Index link" for likely ones it doesn't mark. Tag each story that is clearly about
   AI debt, AI financing or credit stress with `{ "stressIndex": true }` under `stories` in `data/edition-meta.json` and re-run;
   skip passing mentions (a story that is mainly about something else). List the linked stories in the pull request and your
   message so he can say "remove" for any. Tagging a story this way is not a decision that holds up an advance-approved publish.
   **Cover:** the newsletter's top-level `cover` (1600×900) becomes the edition's share image, Google
   Discover image and first structured-data image. The check prints "ℹ … no 1600×900 cover" when it's
   missing; mention it in your message (previews then fall back to the first story graphic). Look at the
   cover in the rights review like any graphic.
5. **Rights review** (copyright and paywall rules in `docs/edition-format.md`), done by you, not a script:
   - **Images:** look at every `public/figs/<YYYY-MM-DD>-*` file, all at once on one contact sheet
     (PIL, about 1600px wide) rather than one by one. Allowed: his own original
     graphics and charts, and Creative Commons or licensed images whose `figcredit` names the licence.
     **Not allowed:** newspaper or agency photos, a publisher's own infographic or chart, anything showing
     a publisher's logo or watermark, and screenshots of articles. For anything not allowed, hide it with
     a per-story override `{ "image": "", "imageAlt": "" }` in `data/edition-meta.json` and re-run
     the publish command (unused images are deleted automatically). List it in your message. Also mention
     any realistic AI-made likeness of a real person, for his decision.
     **Second opinion for doubtful images only:** when a graphic's `figcredit` is not "Original graphic:
     KKReckons", or it looks like a photo, a screenshot or a publisher's chart, ask one subagent (`Agent`
     tool, `model: "opus"`) to judge just those files against the rules above, passing their paths and the
     rules, not the whole edition. Most days every graphic is his own and no second opinion is needed.
   - **Own words:** for each source you can open (not paywalled), compare the points with the article.
     Flag any sentence copied word for word or with only small word changes. If no source can be opened
     (the session's network may block publisher sites), review the wording by reading it, and say in
     the pull request and your message that it was not compared side by side with the articles.
   - **Paywalled sources:** the summary must give the gist and his view, not the article's full substance.
     Flag any story that reads as a replacement for the original, and any quote longer than a short phrase.
   - **Original value:** every story's "why it matters" (and "other side" when present) must add his own
     analysis, not restate the points. Flag any that don't.
6. **The publish command must end with "All steps passed".** Its QC step compares against `origin/main` and
   confirms that every edition already live is still listed and unchanged byte for byte, the pull request only
   touches edition files, every page shows all its data, Home shows the new edition, Catch up lists every
   edition (including yesterday's) and the sitemap lists them all. If a step fails, fix the cause and re-run.
   Never publish over a failing QC. A deliberate correction to an earlier edition (one he asked for) is the
   only exception: re-run with `--allow <that date>` and say so in the pull request.

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
  deployment, or a revert pull request), and don't draft the email.

  **If the live site can't be reached** (the session's network blocks kkreckons.com and
  `web_fetch_vercel_url` is refused): treat Vercel's `success` on the merge commit plus the passing QC
  as enough, carry on with the email draft, and tell him plainly that the live pages weren't checked by
  hand and he should open the link once.

  **Email draft (beehiiv, free plan):** every "publish" to the website also prepares the subscriber email,
  in the same run, without being asked. The beehiiv account is on the free (Launch) plan, which has no
  automatic sending (no RSS to Send, recurring series, automations or Send API), so the flow is: the
  draft is made here, and he presses Send or Schedule in beehiiv. Once the live check passes (the email
  links to the site's pages and thumbnails):
  1. Use `.publish/beehiiv-<YYYY-MM-DD>.json` from section 2 (re-run the publish command if it's missing). It has the
     title, subtitle, email settings, slug, theme and body built from `data/content/<YYYY-MM-DD>.json`.
     The email is one compact table (an HTML snippet): KK's takeaway at the top, the headline once near the end (beehiiv's own title, subtitle,
     byline and "Read online" are hidden; the subject line has the name and date), one tight row per story
     (thumbnail, kicker, short headline, one-line teaser), the numbers of the day, KK's takeaway, further
     reading titles and a "Read the full edition" button. Colour sits in text and borders, not backgrounds,
     so it reads the same where a mail app or printer drops backgrounds. Don't add blocks around it.
  2. Use the KKReckons publication (`list_publications`). Check `list_posts` for a post with the same
     title or slug `kkreckons-<YYYY-MM-DD>`; if one exists, don't create another, just link it.
  3. Otherwise call `save_post` with the JSON's fields (`html_content` verbatim, not `theme`), then
     `edit_post` with its `email_settings` again (`save_post` ignores `display_byline_in_email`), then
     `save_post_theme` with its `theme`. This makes a **draft** only.
  4. Re-read it with `get_post_content` (`format: "editor_html"`, ~15KB; not `text`, which omits the HTML
     snippet and shows only the "read online" line, and never `html`, which is ~70KB) and confirm the
     title and that every story's short headline (listed under "✓ email" in the publish summary) appears once.
  5. Also check `list_posts` for an older KKReckons post still in `draft`; mention it in one line so an
     unsent edition doesn't go unnoticed.
  6. Reply in this shape (and send a push notification if that tool is available):

     > **<Weekday, D Month YYYY> is live:** <live link>. <yesterday> is now on Catch up.
     > **Email to subscribers:** draft ready, tap **Send** (or **Schedule**, e.g. for 6am IST):
     > <editor_url from save_post>

     If the draft can't be created (tool missing or permission denied), say so plainly, so he knows
     subscribers won't get this edition until it's made.

     Then add a **WhatsApp post**, ready to paste into the KKReckons channel or a group, in a code block so it copies cleanly:
     the headline (`slice`), the three most interesting short headlines (`ehead`, else `title`) as "•" lines, and the
     live link. Plain text only, no more than 6 lines.
- **Changes** (for example "drop story 4" or "fix the headline"): make small text fixes as overrides in
  `data/edition-meta.json` (`slice`, `stories` keyed by title, or `reading` keyed by URL, e.g. a real title for a bare "Video (YouTube)" link). For bigger changes, ask him to update
  the artifact in his Project, then re-read it. Rebuild, re-check, push, and send the new preview link.
- **"skip"**: close the pull request without merging.

**"Publish" with no pull request waiting** (for example "Publish Friday edition"): that is his approval
in advance. Run sections 1 and 2 for that edition. If the checks, rights review and QC raise nothing that
needs his decision, commit, open the pull request, merge it and carry on with section 4 (live check, then
the email draft). If something does need his decision, stop at section 3 and ask.

## Weekly best-of email

The Friday weekly email has its own skill: `.claude/skills/weekly-email/SKILL.md`.

## Keeping it light

- Each "Publish" works best in a fresh session: this skill holds every step, so no earlier history is needed.
- The skill runs on Sonnet (`model: sonnet` above), but that covers only the turn that starts it. Start a
  publishing session on Sonnet too, so his "publish" reply and the email draft stay on it.
- Don't print whole files or tool payloads to look at them; grep or slice for what you need.
- Read the artifact once, look at images once (contact sheet), and trust the publish command's summary.

## Rules

- Never change an edition's facts, numbers or wording beyond what he asks for, or a sourced fix you list.
- Never publish an edition with open problems unless he says to publish anyway.
- Keep commits and pull requests free of model names.
- Never send or schedule a beehiiv email; only create drafts for him to send. (On the free plan the
  tools can't send anyway; if the account is ever upgraded, ask him before automating sends.)
