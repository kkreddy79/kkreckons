# Special reports: house layout

A special report is a self-contained HTML file (`special/<slug>.html`) built in the KKReckons Claude Project and
served at `/special/<slug>` inside the site's header and footer (see the README). The report brings its own
stylesheet, scoped to the report by `lib/special.ts`. On top of that, `app/special/special.css` applies a house layout
to the report template's classes. Those rules win over the report's own CSS, so every report, past and future, gets
them. Build new reports on the same classes and the layout comes for free.

## The template's building blocks

| Block | Markup | What the site does with it |
| --- | --- | --- |
| Section head | `<div class="sec-head"><div class="lab">Label</div><h2>Headline</h2><p>Standfirst</p></div>` | From 900px wide, the label and headline sit on the left and the standfirst beside them on the right. Without a standfirst, the headline gets the full width. Any `max-width` the report sets on `.sec-head` is lifted. |
| Takeaway | `<div class="take"><div class="lab">The takeaway</div><p>One sentence. <em>The line to remember.</em></p></div>` | A full-width pull quote with a gold quotation mark. The sentence runs across the box at 22–33px; the `<em>` part turns gold. Keep it to one or two sentences, about 15–30 words. |
| Wrap | `<main class="wrap">` / `<div class="wrap">` | The page column: up to 1080px, centred. |

## Rules (the site check enforces them)

`npm run site-check` opens every report listed in `data/special.json` on eight screen sizes. It fails a report that
breaks any of these rules:

1. **No wasted width.** A headline or pull quote of 22px or more must not wrap onto two lines while 35% or more of
   its row stays empty beside it. Don't cap headlines with a narrow `max-width` (such as `62ch` on a section head or
   `40ch` on the takeaway). Either let the headline run the full width, or put the standfirst beside it (the section
   head above does this).
2. **No lone cards.** A grid laid out for several columns must not hold a single card. Use one full-width card, or
   lay the item out across the row. The "More special reports" strip does this when there is only one other report.
3. **The site's fonts only.** Headlines in Lora, labels and figures in Poppins (`var(--serif)` and `var(--sans)` in
   the template). Never a bare `Georgia`, `Times` or `serif`: readers would get Times on Windows and DejaVu or Noto
   on Linux and Android. Lora (regular and italic) and Poppins (400–700) are served by the site.
4. **Share and Listen stay level.** These are site controls, not the report's. Nothing in the report should restyle
   `.ev-share` or `.ev-listen`.

Check a new report before publishing it:

```
npm run build && npx next start -p 3000 &
SITE_CHECK_PAGES=/special/<slug>,/special npm run site-check
```
