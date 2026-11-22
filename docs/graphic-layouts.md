# KKReckons explainer graphics: layout rules

How each story's explainer graphic is laid out, so a day's graphics don't all share one template. The graphics are
made in the KKReckons Claude Project; this file is the reference copy of the rules given to it. First used for the
22 November 2026 edition. Image fields (`fig`, `figalt`, `figcredit`) are described in `docs/edition-format.md`.

Reference mock-ups: https://claude.ai/artifact/PdVkDycdUbeVRvSMFXRvcG

## The rule

Choose each story's layout from the kind of story it is. Within one edition:

- no layout appears more than twice;
- the classic template (big number, two boxes, takeaway, other side) is the fallback, used at most twice;
- two stories next to each other never share a layout.

## Which layout

| If the story is about | Layout | What it shows |
| :--- | :--- | :--- |
| A sequence of events | **Timeline** | 4 to 5 dated steps down a vertical line. The last step is dashed when something is still unsettled. Two key figures in a strip below. |
| A list of things (products, companies, states) | **Picture tiles** | One headline figure, then 4 tiles, each with a simple line icon, a name and one fact. A "read with care" strip when the numbers need a caution. |
| Numbers compared | **Chart first** | A real chart drawn to scale (bars, ranges or a line) with labelled values and a zero baseline. One highlight colour for the number that matters. One line of advice under it. |
| An argument with two camps | **Two sides** | The card split down the middle: "The worry" against "The defence" (or similar), 3 points each, a "vs" marker between them. One figure below. |
| One idea, few numbers | **One big line** | The idea in large italic type across the top. Two supporting facts and the other side below. |
| A product, screen, document or object | **Show the object** | A simple drawing of the thing (a phone screen, a contract, a chip) with the facts beside it. |
| A place or a mechanism | **Diagram** | The facts placed where they belong: stacked by layer, along a route, on a simple map or through a supply chain. |
| None of the above | **Classic** | The current template. |

## What stays the same on every card

- Size: 1280px wide or more. About 3:4 or taller; height may vary with the content.
- Top line: section and category (for example "India · Trade"), plus "Opinion" when the source is a column.
- Headline: the same serif typeface, with one highlighted phrase at most.
- Footer: the source line, then "Original graphic: KKReckons". The site adds the kkreckons.com credit strip itself, so the graphic does not repeat it.
- Every card still carries the other side somewhere, even if only as one line.

## Colour

- Pick of the day: dark ground, so the lead story always stands apart.
- India edition: one colour family (green in the mock-ups).
- World edition: a different family per card, chosen from a fixed set of four or five so the set still looks like one publication.
- Chart cards use a plain light ground and a single highlight colour.

## Rules that keep it honest

- Charts are drawn to scale and show only figures that appear in the story. If the story has fewer than three comparable numbers, don't use a chart.
- "One big line" is labelled as a paraphrase ("X's argument, paraphrased") unless the words are a short direct quote from the piece.
- Drawn objects are generic drawings. Never a screenshot of a real app, article or website, and no publisher logos.
- Icons are simple line drawings in the card's colour.
- Nothing appears on a card that is not in the story's points, numbers, "why it matters" or "other side".

## Free images

Use a photo only when it adds something a drawing can't (for example Earth from orbit behind a space diagram).

- Allowed sources: NASA, Wikimedia Commons, Unsplash, Pexels, and government releases such as PIB.
- Not allowed: newspaper or agency photos, a publisher's chart or infographic, anything with a watermark.
- `figcredit` must name the source and licence, for example "Photo: NASA, public domain. Graphic: KKReckons".
- At most one photo-backed card per edition.

## Alt text

`figalt` names the layout's content, not its look: the headline, the main figure and the two or three key points (for a chart, the values; for a timeline, the first and last steps).
