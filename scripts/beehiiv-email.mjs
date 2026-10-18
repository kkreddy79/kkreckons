// Builds the beehiiv email draft for one edition from data/content/<date>.json.
// Usage: node scripts/beehiiv-email.mjs <YYYY-MM-DD> [out.json] [--copy copy.json]
//
// The email is a teaser for the website edition, in the layout of the 17 October email:
// a numbered list of stories (thumbnail, kicker, short headline, one-line teaser), the
// day's numbers, KK's takeaway, further reading and a card linking to the full edition.
//
// Also writes a small illustration thumbnail per story to public/email/<date>-<n>.png,
// cut from the circle at the top right of each KKReckons explainer graphic.
//
// Prints (or writes) { title, subtitle, email_settings, web_settings, theme, html_content },
// ready to pass to beehiiv's save_post (and `theme` to save_post_theme).
// Sending stays a human action in beehiiv.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SITE = "https://www.kkreckons.com";
const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const [date, out] = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
  console.error("Usage: node scripts/beehiiv-email.mjs <YYYY-MM-DD> [out.json] [--copy copy.json]");
  process.exit(1);
}
const file = path.join("data", "content", `${date}.json`);
if (!fs.existsSync(file)) {
  console.error(`No edition data at ${file}; run npm run editions first.`);
  process.exit(1);
}
const ed = JSON.parse(fs.readFileSync(file, "utf8"));

const [y, m, d] = date.split("-").map(Number);
const when = new Date(Date.UTC(y, m - 1, d));
const monthName = MONTHS[m - 1][0].toUpperCase() + MONTHS[m - 1].slice(1);
const longDate = `${DAYS[when.getUTCDay()]}, ${d} ${monthName} ${y}`;
const pageUrl = `${SITE}/daily/${MONTHS[m - 1]}-${d}-${y}`;

/** Cut the circle illustration (top right of every explainer graphic) into a 160px square. */
async function thumbnail(src, dest) {
  const img = sharp(src);
  const { width } = await img.metadata();
  const k = width / 2160; // graphics are laid out on a 2160px-wide canvas
  const box = { left: Math.round(1463 * k), top: Math.round(87 * k), width: Math.round(617 * k), height: Math.round(617 * k) };
  // Round with transparent corners, so it sits cleanly on any card or page colour.
  const mask = Buffer.from('<svg width="160" height="160"><circle cx="80" cy="80" r="79" fill="#fff"/></svg>');
  await img
    .extract(box)
    .resize(160, 160)
    .composite([{ input: mask, blend: "dest-in" }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(dest);
}

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const linkHtml = (href, html) =>
  `<a class="link" href="${esc(href)}" rel="noopener noreferrer nofollow" target="_blank">${html}</a>`;
const link = (href, text) => linkHtml(href, esc(text));
const section = (attrs, inner) =>
  `<div class="node-section" ${Object.entries(attrs)
    .map(([k, v]) => `data-${k}="${v}"`)
    .join(" ")}>${inner}</div>`;
const pad = (t, r = t, b = t, l = r) => ({ "padding-top": t, "padding-right": r, "padding-bottom": b, "padding-left": l });
const radius = (n) => ({
  "border-top-left-radius": n, "border-top-right-radius": n,
  "border-bottom-left-radius": n, "border-bottom-right-radius": n,
});

// ---------- Email copy ----------
// The email is a quick, scannable digest that sends readers to the site for the full story.
// Its short headlines, teasers and takeaway come from the newsletter itself (each story's
// `ehead`/`eteaser` and the top-level `takeaway`, see docs/edition-format.md). For an edition
// without them, they can be passed in with --copy:
//   { "stories": [{ "head": "...", "teaser": "..." }, ...],   // one per story, in order
//     "takeaway": { "a": "Big bets.", "b": "Few hires.", "line": "..." } }
// Failing both, the story title and the first sentence of "why it matters" stand in.
const copyFile = opt("--copy");
const copy = copyFile ? JSON.parse(fs.readFileSync(copyFile, "utf8")) : {};
const firstSentence = (t) => (String(t || "").match(/^.*?[.!?](\s|$)/) || [String(t || "")])[0].trim();

// KKReckons email palette (as in the 17 October email).
const E = {
  ink: "#1B2636",
  body: "#3B4452",
  muted: "#6B7482",
  coral: "#C4553B",
  rule: "#E6E0D6",
  plum: "#2A1A52",
};
const fontSize = (rem, html, hex) =>
  `<span style="${hex ? `color: ${hex}; ` : ""}font-size: ${rem};" data-font-size="${rem}">${html}</span>`;
const plain = (attrs, inner) =>
  section(
    {
      "border-style": "solid", "border-width-top": 0, "border-width-right": 0,
      "border-width-bottom": 0, "border-width-left": 0, ...pad(0, 0, 0, 0), ...attrs,
    },
    inner,
  );
const kicker = (label, top = 16) =>
  section(
    {
      "border-color": E.ink, "border-style": "solid",
      "border-width-top": 0, "border-width-right": 0, "border-width-bottom": 2, "border-width-left": 0,
      ...pad(0, 0, 0, 0), "margin-top": top,
    },
    `<p>${fontSize("0.75rem", `<strong>${esc(label)}</strong>`, E.ink)}</p>`,
  );
/** Raw HTML block (beehiiv "HTML snippet"), used for the cards the editor can't style. */
const snippet = (html, top = 14) =>
  plain({ "margin-top": top }, `<pre data-type="htmlSnippet"><code class="language-html">${esc(html)}</code></pre>`);
const SANS = "'Inter',Helvetica,Arial,sans-serif";
const SERIF = "'Playfair Display',Georgia,'Times New Roman',serif";

const stories = ed.sections.flatMap((sec) => sec.stories.map((s) => ({ ...s, section: sec.name })));
const parts = [];

// 1. Today's stories: thumbnail, kicker, short headline, one-line teaser.
parts.push(kicker(`TODAY’S STORIES · ${stories.length} · ${ed.readingMinutes} MIN READ`));
fs.mkdirSync(path.join("public", "email"), { recursive: true });
for (const [i, s] of stories.entries()) {
  const n = i + 1;
  const c = copy.stories?.[i] || {};
  const head = c.head || s.emailHead || s.title;
  const teaser = c.teaser || s.emailTeaser || firstSentence(s.why);
  const where = /pick/i.test(s.section) ? "PICK" : /india/i.test(s.section) ? "INDIA" : "WORLD";
  const label = `${String(n).padStart(2, "0")} · ${where} · ${String(s.category || "").replace(/^[^:]*:\s*/, "").toUpperCase()}`;
  const text =
    `<p>${fontSize("0.625rem", `<strong>${esc(label)}</strong>`, where === "PICK" ? E.coral : E.muted)}<br>` +
    `${linkHtml(pageUrl, fontSize("1rem", esc(head)))}<br>` +
    `${fontSize("0.8125rem", esc(teaser), E.body)}</p>`;

  let row = text;
  const fig = s.image ? path.join("public", s.image) : "";
  if (fig && fs.existsSync(fig)) {
    const thumb = `${date}-${n}.png`;
    await thumbnail(fig, path.join("public", "email", thumb));
    row =
      `<div data-type="columns" data-stack-on-mobile="false">` +
      `<div data-type="column" data-position="0" data-width="15%" data-vertical-align="middle">` +
      `<figure data-type="imageBlock" data-src="${SITE}/email/${thumb}" data-alt="${esc(head)}" data-align="center" data-width="100%" data-url="${esc(pageUrl)}"><figcaption></figcaption></figure>` +
      `</div><div data-type="column" data-position="1" data-width="85%" data-vertical-align="middle">${text}</div></div>`;
  }
  parts.push(
    section(
      {
        "border-color": E.rule, "border-style": "solid", "border-width-top": 0, "border-width-right": 0,
        "border-width-bottom": i === stories.length - 1 ? 0 : 1, "border-width-left": 0, ...pad(6, 0, 6, 0),
      },
      row,
    ),
  );
}

// 2. By the numbers: the edition's callouts as big figures, side by side.
if (ed.callouts?.length) {
  const cells = ed.callouts
    .slice(0, 2)
    .map(
      (c) =>
        `<td width="50%" valign="top" style="padding:16px 14px;background-color:#FFF7EE;border:1px solid #F2D9C4;border-radius:16px;">` +
        `<div style="font-family:${SERIF};font-size:34px;line-height:1.05;font-weight:700;color:${E.coral};">${esc(c.num)}</div>` +
        `<div style="margin-top:6px;font-family:${SANS};font-size:13px;line-height:1.4;color:${E.body};">${esc(c.text)}</div></td>`,
    )
    .join(`<td width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td>`);
  parts.push(kicker("BY THE NUMBERS", 22));
  parts.push(
    snippet(
      `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;"><tbody><tr>${cells}</tr></tbody></table>`,
      10,
    ),
  );
}

// 3. KK's takeaway: the day in two short phrases and one line.
const tk = copy.takeaway || ed.takeaway || {};
const takeawayLine = tk.line || ed.slice;
parts.push(
  section(
    {
      "background-color": "#FFF0F6", "border-color": "#E64980", "border-style": "solid",
      "border-width-top": 2, "border-width-right": 2, "border-width-bottom": 2, "border-width-left": 2,
      ...radius(14), ...pad(10, 10, 8, 10), "margin-top": 18,
    },
    `<p style="text-align: center">${fontSize("0.6875rem", "<strong>✦ KK’S TAKEAWAY ✦</strong>", "#D6336C")}` +
      (tk.a
        ? `<br><span style="color: #7048E8; font-family: Georgia, &quot;Times New Roman&quot;, serif; font-size: 1.4375rem;" data-font-size="1.4375rem"><strong>${esc(tk.a)}</strong></span>` +
          (tk.b
            ? ` <span style="color: #F76707; font-family: Georgia, &quot;Times New Roman&quot;, serif; font-size: 1.4375rem;" data-font-size="1.4375rem"><strong>${esc(tk.b)}</strong></span>`
            : "")
        : "") +
      `<br>${fontSize("0.875rem", `<strong><em>${esc(takeawayLine)}</em></strong>`, "#C2255C")}</p>`,
  ),
);

// 4. Further reading, kept short.
if (ed.reading?.length) {
  parts.push(kicker([0, 6].includes(when.getUTCDay()) ? "WORTH YOUR WEEKEND" : "FURTHER READING", 20));
  parts.push(
    plain(
      { "margin-top": 4 },
      ed.reading
        .map((r) => `<p>${fontSize("0.875rem", `→ ${link(r.url, r.title)}`)}${r.note ? `<br>${fontSize("0.8125rem", esc(r.note), E.muted)}` : ""}</p>`)
        .join(""),
    ),
  );
}

// 5. The card that sends readers to the full edition.
parts.push(
  snippet(
    `<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${E.plum}" style="width:100%;background-color:${E.plum};background-image:linear-gradient(135deg,#3A2468 0%,#26174A 45%,#1C1036 100%);border-radius:24px;border-collapse:separate;"><tbody><tr><td style="padding:28px 26px;">` +
      `<table cellpadding="0" cellspacing="0" border="0"><tbody><tr><td width="62" align="center" valign="middle" style="width:62px;height:62px;border-radius:31px;background-color:#D96B3F;color:#FFFFFF;font-size:40px;line-height:62px;font-weight:700;font-family:Arial,sans-serif;">☼</td></tr></tbody></table>` +
      `<div style="margin-top:22px;font-family:${SANS};font-size:13px;font-weight:700;letter-spacing:4px;color:#D8CCF4;text-transform:uppercase;">${esc(longDate)}</div>` +
      `<div style="margin-top:10px;font-family:${SERIF};font-size:29px;line-height:1.18;font-weight:700;color:#FFFFFF;">${esc(ed.slice)}</div>` +
      `<div style="margin-top:10px;font-family:${SANS};font-size:16px;line-height:1.45;color:#E2DAF5;">Every story in full, with the graphic, the points, why it matters and the other side.</div>` +
      `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;"><tbody><tr><td align="center" style="background-color:#B85A2E;border-radius:40px;">` +
      `<a href="${esc(pageUrl)}" style="display:block;padding:17px 10px;font-family:${SANS};font-size:18px;font-weight:700;color:#FFFFFF;text-decoration:none;">Read today’s edition →</a>` +
      `</td></tr></tbody></table></td></tr></tbody></table>`,
    22,
  ),
);
parts.push(
  plain(
    { "margin-top": 6 },
    `<p style="text-align: center">${fontSize("0.625rem", `Illustrations: original graphics by KKReckons · Missed one? ${link(`${SITE}/daily/`, "Catch up")}`, E.muted)}</p>`,
  ),
);

// Per-post theme, as on the 17 October email: white page, compact type, coral links.
const theme = {
  padding_left: "22",
  padding_right: "22",
  padding_top: "20",
  padding_bottom: "16",
  margin_top: "16",
  margin_bottom: "16",
  max_width: "620",
  background_color: "#FFFFFF",
  content_background_color: "#FFFFFF",
  paragraph_color: E.body,
  paragraph_padding_top: "3",
  paragraph_padding_bottom: "3",
  paragraph_line_height_exact: "1.45",
  inline_link_color: E.coral,
  inline_link_bold: "true",
  inline_link_underline: "false",
  inline_link_italic: "false",
  h3_font_size: "17",
  h3_font_color: E.ink,
  header_title_font_color: E.ink,
  header_subtitle_font_size: "18",
  header_subtitle_font_weight: "600",
  header_subtitle_font_color: E.coral,
  image_padding_top: "0",
  image_padding_bottom: "0",
  button_background_color: E.coral,
  button_border_color: E.coral,
  button_text_color: "#FFFFFF",
  button_border_radius: "24",
};

const payload = {
  title: `KKReckons, ${longDate}`,
  subtitle: ed.slice,
  email_settings: {
    email_subject_line: `KKReckons, ${longDate}`,
    email_preview_text: ed.slice,
    display_title_in_email: true,
    display_subtitle_in_email: true,
  },
  web_settings: { slug: `kkreckons-${date}` },
  theme,
  html_content: parts.join("\n"),
};

const json = JSON.stringify(payload, null, 2);
if (out) fs.writeFileSync(out, json + "\n");
else process.stdout.write(json + "\n");
