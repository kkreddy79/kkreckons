# KKReckons edition format

What the website reads from each newsletter. The `publish-edition` skill (`.claude/skills/publish-edition/SKILL.md`)
finds the artifact and turns it into a site edition with `npm run editions`.

## The artifact

- **Title:** exactly `KKReckons, <Weekday>, <D> <Month> <YYYY>`, for example `KKReckons, Saturday, 10 October 2026`.
  The routine finds editions by this title. Other titles are ignored.
- **Data:** a full HTML page containing one `<script id="data" type="application/json">` block with the JSON
  below. The website rebuilds everything from this JSON in its own design, whatever the newsletter looks like.
  The site saves the page as `newsletters/YYYY-MM-DD.html` (source only, never served); the artifact's own file name doesn't matter.

## Top level

| Field | Required | What it is |
|---|---|---|
| `slice` | yes | The day's headline, in plain text. Line breaks such as `<br>` are turned into spaces. |
| `featured` or `pick` | – | Pick of the day stories (array of stories). |
| `india` | – | India edition stories. |
| `world` | – | World edition stories. |
| `callout` | – | Numbers of the day: `{ "num": "20,000+", "lead": "staff moved…", "rest": "…", "url": "…" }`. |
| `reading` | – | Further reading: `{ "title": "…", "url": "…", "note": "…" }` (`src` is accepted in place of `note`). |

## Each story

| Field | Required | What it is |
|---|---|---|
| `title` | yes | Headline. |
| `url` | yes | Original article link. A story without one fails the site's checks. |
| `url2` | – | A second source link. |
| `cat` | – | Category label, for example `Markets`. |
| `tag` | – | Small tag such as `Opinion`, `Interview`, `Explainer`. |
| `pts` | yes | Summary points, **at least two**. |
| `nums` | – | Key numbers: `[["₹7.10L cr", "deficit, April–August"], …]`. |
| `why` | yes | Why it matters. |
| `flip` | – | Other side. Start with `What to watch:` to label it "Watch next" instead. |
| `also` | – | Also read: `[{ "t": "title", "u": "url" }]`. |
| `fig`, `figalt` | – | Story image as a `data:image/…;base64,` URL, plus its alt text. |
| `figcredit` | with `fig` | Where the image comes from, shown under it. For example `Original graphic: KKReckons`, `Photo: Jane Doe / Unsplash` or `Wikimedia Commons, CC BY-SA 4.0`. An image without one fails the checks. |
| `src` | – | Publisher name to show, for example `Mint`. If left out, the site names it from the link. |
| `pay` | – | `true`/`"paid"` or `false`/`"free"`. If left out, the site decides from the link's domain. |
| `themes` | – | Catch up themes, any of: `AI`, `Markets`, `Banking`, `India`, `Jobs & careers`, `Geopolitics`, `Personal finance`, `Health & science`. Unknown names are ignored. If left out (or none match), the site picks themes from the category and title. |

## Content rules (checked before every edition goes live)

These follow KKReckons' copyright and paywall policy. It's a working policy, not legal advice.

**No repeats.** A story's article (its link) must not already appear in the same edition or in any earlier
edition, including as further reading. A follow-up on the same topic needs a new article. Headlines that look
like an earlier story are flagged for a second look.

**Summaries in your own words.**
- Write every point in original language. Never copy sentences, even with small word changes.
- Keep a story's points to **120 words** or fewer, enough for the gist, not a replacement for the article.
  This matters most for paywalled sources.
- Quotes: a short phrase or a sentence or two at most, in quotation marks. No quoted passage over **25 words**.
- Add original value: "Why it matters" (and "Other side") must be your own analysis, not a restatement.
- Always name the source and link to the original article.

**Images.**
- Allowed: your own original graphics, charts and illustrations; Creative Commons or royalty-free images
  (Unsplash, Pexels, Wikimedia Commons) with their credit; images you've licensed.
- Not allowed: newspaper or agency photos, a publisher's own infographics or charts, anything showing a
  publisher's logo or watermark, screenshots of articles, even with a credit line. A subscription lets you
  read them, not republish them.
- Take care with realistic AI-made likenesses of real people.
- Every image needs a `figcredit`.

**Paywalled sources.** Summarise the gist and give your view; don't reproduce the article's substance, data
tables or images. Check each publication's terms if you plan to quote from it.

`npm run check -- YYYY-MM-DD` runs the automatic checks: links, two or more points, "why it matters",
repeats, summary length, quote length and image credits. The publishing routine also reviews images,
copied wording and paywalled summaries by hand. Deliberate exceptions for already-published editions are
recorded in `data/qc-exceptions.json`.
