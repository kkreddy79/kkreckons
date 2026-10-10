# KKReckons edition format

What the website reads from each newsletter. The `publish-edition` skill (`.claude/skills/publish-edition/SKILL.md`)
finds the artifact and turns it into a site edition with `npm run editions`.

## The artifact

- **Title:** exactly `KKReckons, <Weekday>, <D> <Month> <YYYY>`, for example `KKReckons, Saturday, 10 October 2026`.
  The routine finds editions by this title. Other titles are ignored.
- **Data:** a full HTML page containing one `<script id="data" type="application/json">` block with the JSON
  below. The website rebuilds everything from this JSON in its own design, whatever the newsletter looks like.
  The site saves the page as `public/editions/YYYY-MM-DD.html`; the artifact's own file name doesn't matter.

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
| `src` | – | Publisher name to show, for example `Mint`. If left out, the site names it from the link. |
| `pay` | – | `true`/`"paid"` or `false`/`"free"`. If left out, the site decides from the link's domain. |
| `themes` | – | Catch up themes, any of: `AI`, `Markets`, `Banking`, `India`, `Jobs & careers`, `Geopolitics`, `Personal finance`, `Health & science`. Unknown names are ignored. If left out (or none match), the site picks themes from the category and title. |

`npm run check -- YYYY-MM-DD` confirms every story has a link, two or more points and a "why it matters".
