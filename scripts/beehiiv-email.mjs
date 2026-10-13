// Builds the beehiiv email draft for one edition from data/content/<date>.json.
// Usage: node scripts/beehiiv-email.mjs <YYYY-MM-DD> [out.json]
// Prints (or writes) { title, subtitle, email_settings, web_settings, html_content },
// ready to pass to beehiiv's save_post. Sending stays a human action in beehiiv.
import fs from "node:fs";
import path from "node:path";

const SITE = "https://www.kkreckons.com";
const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const link = (href, text) =>
  `<a class="link" href="${esc(href)}" rel="noopener noreferrer nofollow" target="_blank">${esc(text)}</a>`;
const button = (href, text) =>
  `<div class="node-button"><a data-type="button" href="${esc(href)}" data-alignment="center" data-size="normal" data-custom-background-color="#0c4a6e" data-custom-text-color="#ffffff">${esc(text)}</a></div>`;
const rule = `<div data-type="horizontalRule"><hr></div>`;

const parts = [];
parts.push(`<p><em>${esc(ed.slice)}</em></p>`);
parts.push(`<p>${ed.sections.reduce((n, s) => n + s.stories.length, 0)} stories · ${ed.readingMinutes} min read · ${link(pageUrl, "Read on kkreckons.com")}</p>`);

if (ed.callouts?.length) {
  parts.push(`<h3>By the numbers</h3>`);
  parts.push(
    `<ul>${ed.callouts
      .map((c) => `<li><p><strong>${esc(c.num)}</strong> ${esc(c.text)}</p></li>`)
      .join("")}</ul>`,
  );
}

for (const section of ed.sections) {
  parts.push(rule);
  parts.push(`<h2>${esc(section.name)}</h2>`);
  for (const s of section.stories) {
    const kicker = [s.category, s.tag].filter(Boolean).join(" · ");
    if (kicker) parts.push(`<p><strong>${esc(kicker.toUpperCase())}</strong></p>`);
    parts.push(`<h3>${esc(s.title)}</h3>`);
    if (s.image) {
      parts.push(
        `<figure data-type="imageBlock" data-src="${esc(SITE + s.image)}" data-alt="${esc(s.imageAlt)}" data-align="center" data-width="100%"><figcaption>${esc(s.imageCredit || "")}</figcaption></figure>`,
      );
    }
    if (s.points?.length) {
      parts.push(`<ul>${s.points.map((p) => `<li><p>${esc(p)}</p></li>`).join("")}</ul>`);
    }
    if (s.why) parts.push(`<p><strong>Why it matters:</strong> ${esc(s.why)}</p>`);
    if (s.other) parts.push(`<p><strong>Other side:</strong> ${esc(s.other)}</p>`);
    if (s.url) {
      const src = s.src || new URL(s.url).hostname.replace(/^www\./, "");
      parts.push(`<p>Source: ${link(s.url, src)}${s.pay ? " (subscription)" : ""}</p>`);
    }
  }
}

if (ed.reading?.length) {
  parts.push(rule);
  parts.push(`<h2>Further reading</h2>`);
  parts.push(
    `<ul>${ed.reading
      .map((r) => `<li><p>${link(r.url, r.title)}${r.src ? ` (${esc(r.src)})` : ""}</p></li>`)
      .join("")}</ul>`,
  );
}

parts.push(rule);
parts.push(button(pageUrl, "Read the full edition"));
parts.push(`<p>Missed an edition? Every one is on ${link(`${SITE}/daily/`, "Catch up")}.</p>`);

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
  html_content: parts.join("\n"),
};

const json = JSON.stringify(payload, null, 2);
if (out) fs.writeFileSync(out, json + "\n");
else process.stdout.write(json + "\n");
