---
name: weekly-email
description: Draft KKReckons Weekly, the Friday-night best-of-the-week subscriber email, as a beehiiv draft for Krishnakanth to send. Use when asked to "draft the weekly", for the "best of the week" or for the weekly email.
model: sonnet
---

# Draft KKReckons Weekly

Make a beehiiv **draft** of KKReckons Weekly, sent **Friday night**: the week's best stories across different
topics from the 7 days Saturday to Friday (pass that Friday as the end date). Up to 8 stories, one from every
edition, KK's Picks first, at most one per topic (two for AI); each links to its story card on the site, plus
the week's AI Stress Index move and a "Catch up on the week" button. If Friday's edition isn't published yet,
build it anyway and rebuild after that edition goes live.

0. **The issue's written parts.** Draft `data/weekly/<end date>.json` (shown on `/week` and in this email as
   numbered sections; any part can be left out):
   - `oneMinute`: "The week in one minute", 60–90 words in his voice, built **only** from facts in that week's
     stories (headlines, numbers, why it matters). No outside facts, no opinions he didn't write.
   - `history`: `{ "text", "url", "src" }`, "This week in history": one dated event from the same calendar week
     in an earlier year that connects to a story of the week, in one or two sentences, from a reliable source
     (an encyclopaedia, a central bank, a major newspaper's archive). Check the date against the source.
   - `andFinally`: `{ "text", "url", "src"? }`, "And finally": a light closer, preferably one of the week's own
     lighter stories (its page path as `url`, for example `/daily/october-26-2026/8`).
   Commit it on a branch `weekly/<end date>` and open a draft pull request; show him the three texts in your
   reply. It goes live only when he approves (he merges, or replies "publish").
1. `npm ci` (first time in the session), then
   `npm run -s weekly-email -- [YYYY-MM-DD] .publish/beehiiv-weekly-<end date>.json`. It prints the week, the
   picks and the index move, and uses the step 0 file when it's there (build the draft after writing it);
   check that each teaser reads on its own (they come from `emailTeaser`, or from
   "why it matters" when an older edition has none).
2. In beehiiv, use the KKReckons publication (`list_publications`). Check `list_posts` for slug
   `kkreckons-weekly-<end date>`; if it exists, don't create another, just link it.
3. Otherwise call `save_post` with the JSON's fields (`html_content` verbatim, not `theme`), then `edit_post`
   with its `email_settings` again (`save_post` ignores `display_byline_in_email`), then `save_post_theme`
   with its `theme`. This makes a **draft** only.
4. Re-read it with `get_post_content` (`format: "editor_html"`; not `text` or `html`) and confirm the title
   and that every pick's headline appears.
5. Reply with the editor link for him to Send or Schedule (Friday night).

Never send or schedule the email; only create the draft. Keep commits and messages free of model names.
