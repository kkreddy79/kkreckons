// Builds the beehiiv email draft for one edition from data/content/<date>.json.
// Usage: node scripts/beehiiv-email.mjs <YYYY-MM-DD> [out.json]
//
// Also writes a small illustration thumbnail per story to public/email/<date>-<n>.png,
// cut from the circle at the top right of each KKReckons explainer graphic. The email
// shows those thumbnails rather than the full graphics: the full graphic repeats the
// story's points, takeaway and other side, so the email would say everything twice.
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

// KKReckons palette, taken from the explainer graphics.
const C = {
  navy: "#1F2A3A",
  red: "#B83A2E",
  teal: "#2F6F73",
  cream: "#FAF6ED",
  page: "#F1ECE2",
  text: "#374151",
  muted: "#6B7280",
  rule: "#E5DED0",
};

const [date, out] = process.argv.slice(2);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
  console.error("Usage: node scripts/beehiiv-email.mjs <YYYY-MM-DD> [out.json]");
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
const link = (href, text) =>
  `<a class="link" href="${esc(href)}" rel="noopener noreferrer nofollow" target="_blank">${esc(text)}</a>`;
const color = (hex, html) => `<span style="color: ${hex}">${html}</span>`;
const section = (attrs, inner) =>
  `<div class="node-section" ${Object.entries(attrs)
    .map(([k, v]) => `data-${k}="${v}"`)
    .join(" ")}>${inner}</div>`;
const pad = (t, r = t, b = t, l = r) => ({ "padding-top": t, "padding-right": r, "padding-bottom": b, "padding-left": l });
const radius = (n) => ({
  "border-top-left-radius": n, "border-top-right-radius": n,
  "border-bottom-left-radius": n, "border-bottom-right-radius": n,
});

/** "What to watch: …" already carries its own label; otherwise label it "The other side". */
function otherSide(text) {
  const m = /^([A-Z][A-Za-z ]{2,24}):\s+(.*)$/s.exec(text);
  return m ? [m[1], m[2]] : ["The other side", text];
}

/**
 * Section heading as coloured text over a rule. It reads the same whether or not the
 * mail app shows background colours (Gmail's print view and some dark modes drop them).
 */
const banner = (name) =>
  section(
    {
      "border-color": C.navy, "border-style": "solid",
      "border-width-top": 0, "border-width-right": 0, "border-width-bottom": 2, "border-width-left": 0,
      ...pad(0, 0, 0, 0), "margin-top": 28,
    },
    `<p>${color(C.red, `<strong>${esc(name.toUpperCase())}</strong>`)}</p>`,
  );

/** "X" alone says little; a title like "Craig Tindale: …" gives "Craig Tindale on X". */
function sourceLabel(s) {
  const src = s.src || new URL(s.url).hostname.replace(/^www\./, "");
  const who = /^([^:]{3,40}):\s/.exec(s.title || "");
  return src === "X" && who ? `${who[1]} on X` : src;
}

const parts = [];
const storyCount = ed.sections.reduce((n, s) => n + s.stories.length, 0);
parts.push(`<p>${color(C.muted, `${storyCount} stories · about ${ed.readingMinutes} minutes`)}</p>`);

fs.mkdirSync(path.join("public", "email"), { recursive: true });
let n = 0;
for (const sec of ed.sections) {
  parts.push(banner(sec.name));
  for (const s of sec.stories) {
    n += 1;
    const kicker = [s.category, s.tag].filter(Boolean).join(" · ").toUpperCase();
    const head =
      (kicker ? `<p>${color(C.teal, `<strong>${esc(kicker)}</strong>`)}</p>` : "") + `<h3>${esc(s.title)}</h3>`;

    let top = head;
    const fig = s.image ? path.join("public", s.image) : "";
    if (fig && fs.existsSync(fig)) {
      const thumb = `${date}-${n}.png`;
      await thumbnail(fig, path.join("public", "email", thumb));
      top =
        `<div data-type="columns" data-stack-on-mobile="false">` +
        `<div data-type="column" data-position="0" data-width="24%" data-vertical-align="middle">` +
        `<figure data-type="imageBlock" data-src="${SITE}/email/${thumb}" data-alt="" data-align="center" data-width="100%" data-url="${esc(pageUrl)}"><figcaption></figcaption></figure>` +
        `</div>` +
        `<div data-type="column" data-position="1" data-width="76%" data-vertical-align="middle">${head}</div>` +
        `</div>`;
    }

    const body = [];
    if (s.points?.length) body.push(`<ul>${s.points.map((p) => `<li><p>${esc(p)}</p></li>`).join("")}</ul>`);
    if (s.why) {
      body.push(
        `<figure data-type="blockquoteFigure" data-variant="2"><blockquote>` +
          `<p>${color(C.red, "<strong>Why it matters</strong>")}</p><p>${esc(s.why)}</p>` +
          `</blockquote><figcaption data-type="quoteCaption"></figcaption></figure>`,
      );
    }
    if (s.other) {
      const [label, text] = otherSide(s.other);
      body.push(`<p>${color(C.teal, `<strong>${esc(label)}:</strong>`)} ${esc(text)}</p>`);
    }
    if (s.url) {
      body.push(`<p>${color(C.muted, `Read the original: ${link(s.url, sourceLabel(s))}${s.pay ? " (subscription)" : ""}`)}</p>`);
    }

    parts.push(
      section(
        {
          "background-color": C.cream, "border-color": C.rule, "border-style": "solid",
          "border-width-top": 1, "border-width-right": 1, "border-width-bottom": 1, "border-width-left": 1,
          ...radius(12), ...pad(8, 20, 8, 20), "margin-top": 16,
        },
        top + body.join(""),
      ),
    );
  }
}

if (ed.reading?.length) {
  parts.push(banner("Further reading"));
  parts.push(
    `<ul>${ed.reading
      .map((r) => `<li><p>${link(r.url, r.title)}${r.src ? ` (${esc(r.src)})` : ""}</p></li>`)
      .join("")}</ul>`,
  );
}

parts.push(
  `<div class="node-button"><a data-type="button" href="${esc(pageUrl)}" data-alignment="center" data-size="large" data-custom-background-color="${C.red}" data-custom-text-color="#FFFFFF">Read today’s edition on kkreckons.com</a></div>`,
);
parts.push(`<p style="text-align: center">${color(C.muted, `Missed one? Every edition is on ${link(`${SITE}/daily/`, "Catch up")}.`)}</p>`);

// Per-post theme: KKReckons colours, one body font, quieter links and rules.
const theme = {
  padding_left: "24",
  padding_right: "24",
  background_color: C.page,
  content_background_color: "#FFFFFF",
  paragraph_color: C.text,
  list_font_family: "Inter",
  list_font_color: C.text,
  list_line_height_exact: "1.5",
  list_item_spacing: "6",
  list_padding_left: "18",
  list_padding_right: "4",
  list_padding_top: "4",
  list_padding_bottom: "4",
  inline_link_italic: "false",
  inline_link_color: C.teal,
  inline_link_underline_color: C.teal,
  h3_font_size: "20",
  h3_font_color: C.navy,
  h3_padding_top: "4",
  header_title_font_color: C.navy,
  header_subtitle_font_size: "18",
  header_subtitle_font_weight: "500",
  header_subtitle_font_color: C.red,
  image_padding_top: "8",
  image_padding_bottom: "8",
  quote_2_background_color: "#FFFFFF",
  quote_2_border_color: C.red,
  quote_2_border_left_width: "3",
  quote_2_font_family: "Inter",
  quote_2_font_size: "16",
  quote_2_font_color: C.navy,
  quote_2_padding_left: "14",
  quote_2_padding_top: "4",
  quote_2_padding_bottom: "4",
  quote_2_margin_left: "0",
  quote_2_margin_right: "0",
  button_background_color: C.red,
  button_border_color: C.red,
  button_text_color: "#FFFFFF",
  button_font_family: "Inter",
  button_font_weight: "bold",
  button_border_radius: "24",
  button_margin_top: "28",
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
