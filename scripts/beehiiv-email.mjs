// Builds the beehiiv email draft for one edition from data/content/<date>.json.
// Usage: node scripts/beehiiv-email.mjs <YYYY-MM-DD> [out.json] [--copy copy.json]
//
// The email is a compact teaser for the website edition: KK's takeaway at the top, a numbered list
// of stories (thumbnail, kicker, short headline, one-line teaser), the day's numbers, further
// reading titles, then the day's headline and a button to the full edition.
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
};
const SANS = "'Inter',Helvetica,Arial,sans-serif";
const SERIF = "'Playfair Display',Georgia,'Times New Roman',serif";

const stories = ed.sections.flatMap((sec) => sec.stories.map((s) => ({ ...s, section: sec.name })));

// The whole body is one compact HTML table (a beehiiv "HTML snippet"), so spacing is ours, not
// the editor's block padding. Colour lives in text and borders, never in backgrounds alone, so
// it reads the same where a mail app or printer drops backgrounds.
const a = (href, html, style = "") =>
  `<a href="${esc(href)}" target="_blank" style="text-decoration:none;${style}">${html}</a>`;
const label = (text, top = 18) =>
  `<tr><td colspan="2" style="padding:${top}px 0 4px;border-bottom:1px solid ${E.ink};font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:1px;color:${E.ink};"><span style="color:${E.coral};">■</span>&nbsp; ${esc(text)}</td></tr>`;
const rows = [];

// 1. Top: a thin four-colour strip (borders, so it survives dropped backgrounds), then KK's
// takeaway. The day's headline (slice) closes the email instead, above the button; without a
// takeaway it stays at the top. beehiiv's own title, subtitle and byline are hidden.
const ACCENTS = [E.coral, "#F76707", "#E64980", "#7048E8"];
const tk = copy.takeaway || ed.takeaway || {};
const hasTakeaway = Boolean(tk.a || tk.line);
rows.push(
  `<tr><td colspan="2" style="padding:0 0 10px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    ACCENTS.map((c) => `<td width="25%" style="border-top:4px solid ${c};font-size:0;line-height:0;">&nbsp;</td>`).join("") +
    `</tr></table></td></tr>`,
);
// Name and date on the left, size on the right: one line instead of a separate title.
const shortDate = `${DAYS[when.getUTCDay()].slice(0, 3)} ${d} ${monthName.slice(0, 3)} ${y}`.toUpperCase();
rows.push(
  `<tr><td colspan="2"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:1px;color:${E.coral};white-space:nowrap;">KKRECKONS <span style="color:${E.ink};">· ${shortDate}</span></td>` +
    `<td align="right" style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:1px;color:${E.muted};white-space:nowrap;">${stories.length} STORIES · ${ed.readingMinutes} MIN</td>` +
    `</tr></table></td></tr>`,
);
rows.push(
  hasTakeaway
    ? `<tr><td colspan="2" align="center" style="padding:8px 0 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
        `<td align="center" style="padding:10px 12px;border-top:2px solid #E64980;border-bottom:2px solid #E64980;font-family:${SANS};">` +
        `<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#D6336C;">✦ KK’S TAKEAWAY ✦</div>` +
        (tk.a
          ? `<div style="margin-top:2px;font-family:${SERIF};font-size:22px;line-height:1.25;font-weight:700;"><span style="color:#7048E8;">${esc(tk.a)}</span>&nbsp; <span style="color:#F76707;">${esc(tk.b || "")}</span></div>`
          : "") +
        (tk.line ? `<div style="margin-top:2px;font-size:13px;line-height:1.35;font-style:italic;font-weight:700;color:#C2255C;">${esc(tk.line)}</div>` : "") +
        `</td></tr></table></td></tr>`
    : `<tr><td colspan="2" style="padding:4px 0 2px 12px;border-left:4px solid ${E.coral};font-family:${SERIF};font-size:20px;line-height:1.25;font-weight:700;color:${E.ink};">${esc(ed.slice)}</td></tr>`,
);

// 2. Today's stories: thumbnail, kicker, short headline, one-line teaser.
rows.push(label("TODAY’S STORIES", 16));
fs.mkdirSync(path.join("public", "email"), { recursive: true });
for (const [i, s] of stories.entries()) {
  const n = i + 1;
  const c = copy.stories?.[i] || {};
  const head = c.head || s.emailHead || s.title;
  const teaser = c.teaser || s.emailTeaser || firstSentence(s.why);
  const where = /pick/i.test(s.section) ? "PICK" : /india/i.test(s.section) ? "INDIA" : "WORLD";
  const cat = String(s.category || "").replace(/^[^:]*:\s*/, "").toUpperCase();
  const line = i === stories.length - 1 ? "" : `border-bottom:1px solid ${E.rule};`;
  const fig = s.image ? path.join("public", s.image) : "";
  let thumb = "";
  if (fig && fs.existsSync(fig)) {
    await thumbnail(fig, path.join("public", "email", `${date}-${n}.png`));
    thumb = a(pageUrl, `<img src="${SITE}/email/${date}-${n}.png" width="44" height="44" alt="" style="display:block;width:44px;height:44px;border:0;">`);
  }
  rows.push(
    `<tr><td width="44" valign="top" style="width:44px;padding:9px 12px 9px 0;${line}">${thumb}</td>` +
      `<td valign="top" style="padding:8px 0;${line}font-family:${SANS};">` +
      `<div style="font-size:10px;font-weight:700;letter-spacing:0.5px;color:${E.coral};">${String(n).padStart(2, "0")} · ${where} · ${esc(cat)}</div>` +
      `<div style="margin-top:1px;font-size:15px;line-height:1.3;font-weight:700;">${a(pageUrl, esc(head), `color:${E.ink};`)}</div>` +
      `<div style="margin-top:1px;font-size:13px;line-height:1.35;color:${E.body};">${esc(teaser)}</div></td></tr>`,
  );
}

// 3. By the numbers.
const nums = (ed.callouts || []).slice(0, 2);
if (nums.length) {
  rows.push(label("BY THE NUMBERS"));
  const cells = nums
    .map(
      (c, k) =>
        `<td width="${Math.floor(100 / nums.length)}%" valign="top" style="padding:10px 12px 0 0;font-family:${SANS};">` +
        `<div style="padding-left:10px;border-left:3px solid ${["#E64980", "#7048E8"][k]};">` +
        `<div style="font-family:${SERIF};font-size:26px;line-height:1.1;font-weight:700;color:${[E.coral, "#7048E8"][k]};">${esc(c.num)}</div>` +
        `<div style="margin-top:2px;font-size:12px;line-height:1.35;color:${E.body};">${esc(c.text)}</div></div></td>`,
    )
    .join("");
  rows.push(`<tr><td colspan="2"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr>`);
}
// 4. Further reading: titles only.
if (ed.reading?.length) {
  rows.push(label([0, 6].includes(when.getUTCDay()) ? "WORTH YOUR WEEKEND" : "FURTHER READING"));
  rows.push(
    `<tr><td colspan="2" style="padding:4px 0 0;font-family:${SANS};font-size:14px;line-height:1.45;">` +
      ed.reading.map((r) => `<div style="padding:3px 0;">→ ${a(r.url, esc(r.title), `color:${E.coral};font-weight:700;`)}</div>`).join("") +
      `</td></tr>`,
  );
}

// 5. Send readers to the full edition. A bordered button: it reads with or without its fill.
rows.push(
  `<tr><td colspan="2" align="center" style="padding:20px 0 0;">` +
    (hasTakeaway && ed.slice
      ? `<div style="max-width:480px;margin:0 auto 12px;font-family:${SERIF};font-size:16px;line-height:1.3;font-weight:700;color:${E.ink};">${esc(ed.slice)}</div>`
      : "") +
    `<table cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="border:2px solid ${E.coral};border-radius:24px;background-color:#FFF7EE;">` +
    a(pageUrl, "Read the full edition →", `display:block;padding:10px 26px;font-family:${SANS};font-size:15px;font-weight:700;color:${E.coral};`) +
    `</td></tr></table>` +
    `<div style="margin-top:8px;font-family:${SANS};font-size:11px;color:${E.muted};">Graphics, points, why it matters and the other side · ${a(`${SITE}/daily/`, "Past editions", `color:${E.coral};font-weight:700;`)}</div>` +
    `</td></tr>`,
);

const parts = [
  `<pre data-type="htmlSnippet"><code class="language-html">${esc(
    `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;"><tbody>${rows.join("")}</tbody></table>`,
  )}</code></pre>`,
];

// Per-post theme, as on the 17 October email: white page, compact type, coral links.
const theme = {
  padding_left: "16",
  padding_right: "16",
  padding_top: "10",
  padding_bottom: "8",
  margin_top: "8",
  margin_bottom: "8",
  header_padding_bottom: "0",
  header_byline_show_read_online: "false",
  header_topline_show_read_online: "false",
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
    display_title_in_email: false,
    display_subtitle_in_email: false,
    display_byline_in_email: false,
  },
  web_settings: { slug: `kkreckons-${date}` },
  theme,
  html_content: parts.join("\n"),
};

const json = JSON.stringify(payload, null, 2);
if (out) fs.writeFileSync(out, json + "\n");
else process.stdout.write(json + "\n");
