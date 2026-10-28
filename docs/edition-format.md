# KKReckons edition format

What the website reads from each newsletter. The `publish-edition` skill (`.claude/skills/publish-edition/SKILL.md`)
finds the artifact and turns it into a site edition with `npm run editions`.

## The artifact

- **Title:** exactly `KKReckons, <Weekday>, <D> <Month> <YYYY>`, for example `KKReckons, Saturday, 10 October 2026`.
  The routine finds editions by this title. Other titles are ignored.
- **Data:** a full HTML page containing one `<script id="data" type="application/json">` block with the JSON
  below. The website rebuilds everything from this JSON in its own design, whatever the newsletter looks like.
  The site saves the page as `newsletters/YYYY-MM-DD.html` (source only, never served); the artifact's own file name doesn't matter. After publishing, the stored copy has each image swapped for a `kkreckons-fig:/figs/<file>` pointer to the file in `public/figs/`; the artifact keeps the original.
- **Template:** Start every edition from `templates/KKReckons_Template_lite.html`, not from an earlier edition: a
  finished edition is about 3 MB (embedded images and fonts), too big to read in full, while the template can be. Fill in
  the day's data block and `pics` script; the build replaces the whole data block. Whenever the template changes, upload
  the new copy to the KKReckons Project and tell the Project so; the next edition is built from it. The template (about 65 KB) has the same design,
  scripts and data format, one example story per section and no images; fonts load from Google Fonts and the device
  instead of being embedded. Rebuild it from the newest edition after a design change with
  `node scripts/make-lite-template.mjs`.
- **Icons:** the story icons live in `templates/KKReckons_icons.json` (every icon any edition has used, by name), not in
  the template; upload it to the Project beside the template, and again when it changes. An edition's
  `<script id="pics">` holds only the icons its stories use: copy each from the library by name (no need to read the
  whole file; the template's opening note lists the names), or add a new SVG in the same 80×80 style. The same script
  `node scripts/make-lite-template.mjs` rebuilds the library, so a new icon joins it once its edition is on the site.

## Top level

| Field | Required | What it is |
|---|---|---|
| `slice` | yes | The day's headline, in plain text. Line breaks such as `<br>` are turned into spaces. |
| `featured` or `pick` | – | Pick of the day stories (array of stories). |
| `india` | – | India edition stories. |
| `world` | – | World edition stories. |
| `callout` | – | Numbers of the day: `{ "num": "20,000+", "lead": "staff moved…", "rest": "…", "url": "…" }`. |
| `reading` | – | Further reading: `{ "title": "…", "url": "…", "note": "…" }` (`src` is accepted in place of `note`). Every item needs a real title (never a bare platform name such as "Video (YouTube)") and a one-line note on why it's worth reading. Add `"special": true` to the one item that is KKReckons' own research brief for the day: the website then shows a "Special report today" banner above "Today in 30 seconds" and highlights it in Further reading, and the email gets a line under the takeaway. Host the brief on the site (`public/research/<slug>.html`, listed in `lib/research.ts`, served at `https://www.kkreckons.com/research/<slug>`) rather than linking a claude.ai artifact. It can also be set afterwards with a `reading` override in `data/edition-meta.json` keyed by the item's URL (`{ "url": "…", "special": true }`). |
| `special` | – | A pointer to a KKReckons special report: `{ "kicker": "Special report", "title": "Claude at work: the receipts", "intro": "≤45 words, plain text", "url": "https://www.kkreckons.com/special/claude-at-work", "cta": "Read the special report" }`. The website shows a navy banner (gold kicker, title linking to `url`, intro, gold button) directly after the numbers of the day and before Pick of the day; the email gets one line under the slice, "Special report: <title> →". The report itself must be on the site first: `special/<slug>.html` plus an entry in `data/special.json` (served at `/special/<slug>`; see README). The check fails when `url` points at a `/special/<slug>` that isn't in the registry, so the banner can never 404. The url is not a news link: it may appear in more than one edition and is not counted as a used article. Can also be set afterwards with a top-level `special` object in `data/edition-meta.json` (`"special": null` removes it). |
| `takeaway` | – | For the subscriber email: the day in two short contrasting phrases plus one line, `{ "a": "Big bets.", "b": "Few hires.", "line": "Money is pouring into India. Jobs need to keep up." }`. |
| `cover` | – | The edition's cover for link previews, Google Discover and the article's structured data: a 1600×900 (16:9) image as a `data:image/jpeg;base64,…` (or PNG/WebP) string, or `{ "src": "data:…", "alt": "…" }`. Another size is cropped to 1600×900. Without one, previews use the first story graphic. |

## Each story

| Field | Required | What it is |
|---|---|---|
| `title` | yes | Headline. |
| `url` | yes | Original article link. A story without one fails the site's checks. |
| `url2` | – | A second source link. |
| `cat` | – | Category label, for example `Markets`. |
| `tag` | – | Small tag such as `Opinion`, `Interview`, `Explainer`. |
| `pic` | – | Name of the story's icon, for example `chip`. Its SVG must be in the edition's `pics` script (see **Icons** above); without it the story shows a plain badge. |
| `pts` | yes | Summary points, **at least two**. |
| `nums` | – | Key numbers: `[["₹7.10L cr", "deficit, April–August"], …]`. |
| `why` | yes | Why it matters. |
| `flip` | – | Other side: the counter-argument. Every story should have one (the site promises it). Start with `What to watch:` only for a genuine dated upcoming event; it is then labelled "Watch next". |
| `also` | – | Also read: `[{ "t": "title", "u": "url" }]`. |
| `fig`, `figalt` | – | Story image as a `data:image/…;base64,` URL, rendered **1280px wide or more**, plus its alt text. `figalt` names the 2–3 key figures the graphic shows, so screen readers and search can read them. |
| `figcredit` | with `fig` | Where the image comes from, shown under it. For example `Original graphic: KKReckons`, `Photo: Jane Doe / Unsplash` or `Wikimedia Commons, CC BY-SA 4.0`. An image without one fails the checks. |
| `src` | – | Publisher name to show, for example `Mint`. If left out, the site names it from the link. |
| `pay` | – | `true`/`"paid"` or `false`/`"free"`. If left out, the site decides from the link's domain. |
| `free` | – | For a paywalled story: a link to a **free version of the same news** (wire copy such as Reuters or AP, the company's or regulator's own release, a free outlet reporting the same facts, or a gift/share link). Shown as "Free version: <publisher>" beside the original, and it is what earns the story the open-padlock "free to read" icon in "Today in 30 seconds". Leave it out when nothing free covers the same facts; never point it at another paywalled site. |
| `freesrc` | – | Publisher name for `free`, for example `Reuters`. If left out, the site names it from the link. |
| `ehead` | – | For the subscriber email: a short headline, about 6 words (`"A top degree, no job offer"`). If left out, the email uses `title`. |
| `cite` | – | Optional. One self-contained sentence with the story's key figure, written to be quoted (`"CoreWeave's 5-year CDS hit a record 1,194.5 bp on 15 Oct 2026."`). Not shown on the page: it becomes the story page's search and link-preview description and its structured-data description (what search engines and AI tools read), and feeds the weekly quiz. Keep it under 160 characters. |
| `eteaser` | – | For the subscriber email: a one-line teaser, about 10 words (`"2,300 applications later, the hiring freeze still wins."`). If left out, the email uses the first sentence of `why`. |
| `stressindex` | – | `true` to link the story to the AI Stress Index. The edition then shows the index once (a card in "Today in 30 seconds" on the website, and one line under the story list in the email), showing the index reading at the last close before the edition (saved once, so old editions keep their dated number; readings from before the index went live on 15 October 2026 are marked back-calculated). Use it for stories about AI debt, AI financing or credit stress; it's an editorial choice. It can also be set afterwards with a `{ "stressIndex": true }` story override in `data/edition-meta.json`. |
| `follows` | – | Optional. When the story updates one KKReckons ran earlier, that story's page path: `"/daily/october-21-2026/3"`. The new story shows "Follow-up to …" under its headline, and the earlier story gains a "What happened next" box linking forward. `npm run check` fails if no earlier story has that path. Can also be set afterwards with a `{ "follows": "…" }` story override in `data/edition-meta.json`. |
| `update` | – | Optional, with `follows`. One line on what changed since the earlier story (`"Meta's cash gap widened again in Q3."`), shown in that story's "What happened next" box. |
| `themes` | – | Catch up themes, any of: `AI`, `Markets`, `Banking`, `India`, `Jobs & careers`, `Geopolitics`, `Personal finance`, `Health & science`. Unknown names are ignored. If left out (or none match), the site picks themes from the category and title. |

## Writing for search, previews and the email

- **Cover on every edition.** Add the top-level `cover` (1600×900). It is the share image, the Google Discover
  image and the first image Google reads for the article. Own original artwork only (same rules as story
  graphics), with key text away from the edges, because previews crop.
- **The lead headline is the search title.** The first Pick of the day story's `title` is what Google shows in
  results ("<title> + 7 more | 22 Oct 2026"). Make it plain and searchable: names, numbers, the actual news,
  not wordplay. Keep the wit in `slice`, which shared links still show.
- **Quotable facts.** Where a story has a headline figure, add `cite`: one self-contained sentence with the
  figure, its source and its date, under 160 characters. Readers don't see it; it is the story's description in
  search results, link previews and structured data, and a weekly quiz question.
- **AI Stress Index.** The day's reading appears on every edition automatically. Set `stressindex: true` only on
  stories that are mainly about AI debt, AI financing or credit stress.
- **Email copy.** Keep `ehead`, `eteaser` and `takeaway` on every edition: they write the subscriber email.

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
tables or images. Check each publication's terms if you plan to quote from it. Add a `free` link when a free
source reports the same facts, so readers without a subscription can still check them.

`npm run check -- YYYY-MM-DD` runs the automatic checks: links, two or more points, "why it matters",
repeats, summary length, quote length and image credits. The publishing routine also reviews images,
copied wording and paywalled summaries by hand. Deliberate exceptions for already-published editions are
recorded in `data/qc-exceptions.json`.

## Graphics credit strip

When an edition is built, every story graphic gets a thin strip underneath reading "© KKReckons · share with credit … kkreckons.com", plus a copyright note in the file's EXIF data. It is added once: the EXIF also holds a hash of the graphic as received, so rebuilds leave the file alone and a changed graphic is redone. Graphics don't need their own watermark.

