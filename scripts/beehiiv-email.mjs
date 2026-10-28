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
// Links to the website carry UTM tags, so the analytics' UTM view shows visits from the email.
const utm = (href) => {
  if (!href.startsWith(SITE)) return href;
  const [base, hash] = href.split("#");
  return `${base}${base.includes("?") ? "&" : "?"}utm_source=newsletter&utm_medium=email&utm_campaign=${`daily-${date}`}${hash ? `#${hash}` : ""}`;
};
const a = (href, html, style = "") =>
  `<a href="${esc(utm(href))}" target="_blank" style="text-decoration:none;${style}">${html}</a>`;
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

// The day's research brief, if any, right under the takeaway: otherwise it only appears in Further reading.
const special = (ed.reading || []).find((r) => r.special);
if (special) {
  rows.push(
    `<tr><td colspan="2" style="padding:10px 0 0;font-family:${SANS};">` +
      `<div style="padding:8px 12px;border:2px solid #E2A23B;border-radius:8px;">` +
      `<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#B7791F;">★ SPECIAL REPORT TODAY</div>` +
      `<div style="margin-top:2px;font-size:15px;line-height:1.3;font-weight:700;">${a(special.url, `${esc(special.title)} &rarr;`, `color:${E.ink};`)}</div>` +
      (special.note ? `<div style="margin-top:2px;font-size:12.5px;line-height:1.35;color:${E.body};">${esc(special.note)}</div>` : "") +
      `</div></td></tr>`,
  );
}

// One AI Stress Index line under the story list, with the reading saved at publication (and the linked stories, if any).
const si = ed.stressIndex;
const siDate = si ? `${+si.asOf.slice(8)} ${new Date(`${si.asOf}T00:00:00Z`).toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}` : "";
const related = stories.flatMap((s, i) => (s.stressIndex ? [String(i + 1).padStart(2, "0")] : []));
// A move into a new band since the previous edition's saved reading is the news: the line calls it out.
const BAND_ORDER = ["Normal", "Elevated", "Severe", "Critical"];
const prevSi = fs
  .readdirSync(path.join("data", "content"))
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f.slice(0, 10) < date)
  .sort()
  .reverse()
  .map((f) => JSON.parse(fs.readFileSync(path.join("data", "content", f), "utf8")).stressIndex)
  .find(Boolean);
const bandMove =
  si && prevSi && prevSi.band !== si.band && BAND_ORDER.includes(si.band) && BAND_ORDER.includes(prevSi.band)
    ? `${BAND_ORDER.indexOf(si.band) > BAND_ORDER.indexOf(prevSi.band) ? "up" : "down"} from ${prevSi.band}`
    : "";

// 2. Today's stories: thumbnail, kicker, short headline, one-line teaser.
rows.push(label("TODAY’S STORIES", 16));
fs.mkdirSync(path.join("public", "email"), { recursive: true });
const heads = [];
for (const [i, s] of stories.entries()) {
  const n = i + 1;
  const c = copy.stories?.[i] || {};
  const head = c.head || s.emailHead || s.title;
  heads.push(head);
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
      `<div style="margin-top:1px;font-size:13px;line-height:1.35;color:${E.body};">${esc(teaser)}</div>` +
      `</td></tr>`,
  );
}

if (si || related.length) {
  rows.push(
    `<tr><td colspan="2" style="padding:8px 0 0;font-family:${SANS};font-size:13px;line-height:1.35;">` +
      a(`${SITE}/ai-stress-index`, si ? `&#9679; AI Stress Index: ${si.score}/100, ${esc(si.band)} (${siDate}${si.backCalculated ? ", back-calculated" : ""}) &rarr;` : "&#9679; See today’s AI Stress Index &rarr;", "color:#7048E8;font-weight:700;") +
      (bandMove ? `<span style="color:#C2410C;font-weight:800;"> · New band: ${esc(bandMove)}</span>` : "") +
      (related.length ? `<span style="color:${E.muted};"> · tracks ${related.length === 1 ? "story" : "stories"} ${related.join(", ")}</span>` : "") +
      `</td></tr>`,
  );
}

// One line of market numbers saved with the edition (components/MarketStrip.tsx shows the same on the site).
if (ed.markets?.assets?.length) {
  const fmt = (v, d) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const val = (m) => (m.unit === "yield" ? `${fmt(m.close, 2)}%` : m.unit === "fx" ? `₹${fmt(m.close, 2)}` : `${m.unit === "usd" ? "$" : ""}${fmt(m.close, m.close >= 1000 ? 0 : 2)}`);
  const chg = (m) => {
    if (!m.prev) return "";
    const d = m.unit === "yield" ? Math.round((m.close - m.prev) * 100) : ((m.close - m.prev) / m.prev) * 100;
    return ` ${d > 0 ? "&#9650;" : d < 0 ? "&#9660;" : ""}${m.unit === "yield" ? `${Math.abs(d)}bp` : `${Math.abs(d).toFixed(1)}%`}`;
  };
  const asOf = ed.markets.assets.map((m) => m.asOf).sort().at(-1);
  rows.push(
    `<tr><td colspan="2" style="padding:6px 0 0;font-family:${SANS};font-size:12px;line-height:1.45;color:${E.muted};">` +
      `<b>Markets</b> (${+asOf.slice(8)} ${new Date(`${asOf}T00:00:00Z`).toLocaleString("en-GB", { month: "short", timeZone: "UTC" })} close): ` +
      ed.markets.assets.map((m) => `${esc(m.name)} ${val(m)}${chg(m)}`).join(" · ") +
      `</td></tr>`,
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
      ed.reading.map((r) => `<div style="padding:3px 0;">${r.special ? "★" : "→"} ${a(r.url, esc(r.title), `color:${E.coral};font-weight:700;`)}${r.special ? ` <span style="font-size:11px;font-weight:700;color:#B7791F;">SPECIAL REPORT</span>` : ""}</div>`).join("") +
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

// Saturdays: the weekly quiz (built on the site from the week's quotable figures, each story's cite).
if (when.getUTCDay() === 6) {
  rows.push(
    `<tr><td colspan="2" align="center" style="padding:16px 0 0;font-family:${SANS};font-size:14px;">` +
      a(`${SITE}/quiz`, "How closely did you follow the week? Take the 5-question quiz &rarr;", `color:#7048E8;font-weight:700;`) +
      `</td></tr>`,
  );
}

// 6. One-tap feedback: each answer is its own page on the site, so beehiiv's click report and Vercel's
// page views both count the votes (no form or database needed).
const vote = (v, label) => a(`${SITE}/feedback/${MONTHS[m - 1]}-${d}-${y}/${v}`, label, `display:inline-block;margin:0 4px;padding:5px 12px;border:1px solid #E7E1D6;border-radius:16px;font-family:${SANS};font-size:13px;font-weight:700;color:${E.ink};`);
rows.push(
  `<tr><td colspan="2" align="center" style="padding:18px 0 0;font-family:${SANS};font-size:13px;color:${E.muted};">` +
    `Was today’s briefing useful?<div style="margin-top:6px;">${vote("yes", "Yes")}${vote("somewhat", "Somewhat")}${vote("no", "Not really")}</div>` +
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

// Subject: the takeaway's two phrases ("KKReckons · Big bets. Few hires."); the date is already in
// the email's top line. Falls back to the date when an edition has no takeaway.
const subject = tk.a ? `KKReckons · ${[tk.a, tk.b].filter(Boolean).join(" ")}` : `KKReckons, ${longDate}`;

const payload = {
  title: `KKReckons, ${longDate}`,
  subtitle: ed.slice,
  email_settings: {
    email_subject_line: subject,
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
// Story headlines as they appear in the email, for checking the beehiiv draft (stderr when the JSON goes to stdout).
(out ? console.log : console.error)(heads.map((h, i) => `${String(i + 1).padStart(2, "0")} · ${h}`).join("\n"));
