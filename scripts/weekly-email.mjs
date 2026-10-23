// Builds the beehiiv draft for the weekly best-of email: the week's best stories across different
// topics (KK's Picks of the day first), the week's AI Stress Index move, and a link to catch up.
// Usage: node scripts/weekly-email.mjs [end YYYY-MM-DD] [out.json]
//   end defaults to the newest edition; the week is the 7 days ending on it (Saturday to Friday
//   when end is a Friday, for the Friday-night send).
//
// Same look as the daily email (scripts/beehiiv-email.mjs): one compact HTML table, colour in
// text and borders only. Each story links to its card on the website (/daily/<date>#story-N) and
// reuses the daily email's thumbnail (public/email/<date>-<n>.png) when there is one.
// Prints (or writes) { title, subtitle, email_settings, web_settings, theme, html_content } for
// beehiiv's save_post. Sending stays a human action in beehiiv.
import { pickWeek, teaserFrom } from "../lib/weekly-picks.mjs";
import fs from "node:fs";
import path from "node:path";

const SITE = "https://www.kkreckons.com";
const STRESS_DATA = [
  "https://kkreddy79.github.io/ai-implosion/data.json",
  "https://raw.githubusercontent.com/kkreddy79/ai-implosion/main/docs/data.json",
];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const args = process.argv.slice(2);
const dates = JSON.parse(fs.readFileSync(path.join("data", "editions.json"), "utf8")).map((e) => e.date).sort();
const end = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || dates[dates.length - 1];
const out = args.find((a) => a.endsWith(".json"));
const day = (s) => new Date(`${s}T00:00:00Z`);
const iso = (t) => t.toISOString().slice(0, 10);
const start = iso(new Date(day(end).getTime() - 6 * 864e5));
const week = dates.filter((d) => d >= start && d <= end);
if (!week.length) {
  console.error(`No editions between ${start} and ${end}.`);
  process.exit(1);
}

const short = (s) => `${day(s).getUTCDate()} ${MONTHS[day(s).getUTCMonth()].slice(0, 3)}`;
const dow = (s) => DAYS[day(s).getUTCDay()].slice(0, 3);
const slug = (s) => `${MONTHS[day(s).getUTCMonth()].toLowerCase()}-${day(s).getUTCDate()}-${day(s).getUTCFullYear()}`;
const range = `${short(start)}–${short(end)}`;
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const stories = week.flatMap((d) => {
  const c = JSON.parse(fs.readFileSync(path.join("data", "content", `${d}.json`), "utf8"));
  return c.sections.flatMap((sec) => sec.stories.map((s) => ({ ...s, section: sec.name }))).map((s, i) => ({ ...s, date: d, n: i + 1 }));
});
const chosen = pickWeek(week, stories);
const picks = chosen.map((s) => ({
  date: s.date,
  head: s.emailHead || s.title,
  teaser: s.emailTeaser || teaserFrom(s.why),
  cat: s.topic.toUpperCase(),
  pick: /pick/i.test(s.section),
  url: `${SITE}/daily/${slug(s.date)}#story-${s.n}`,
  thumb: fs.existsSync(path.join("public", "email", `${s.date}-${s.n}.png`)) ? `${SITE}/email/${s.date}-${s.n}.png` : "",
}));

// The AI Stress Index over the week: the last close before the week against the latest close in it.
async function stressMove() {
  for (const u of STRESS_DATA) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) continue;
      const h = (await r.json()).history.filter((x) => x.score != null && x.date <= end);
      const last = h[h.length - 1];
      const before = [...h].reverse().find((x) => x.date < start);
      if (last && last.date >= start) return { from: before?.score, to: last.score, asOf: last.date };
    } catch {}
  }
  return null;
}
const si = await stressMove();
const band = (v) => (v >= 75 ? "Critical" : v >= 50 ? "Severe" : v >= 25 ? "Elevated" : "Normal");

// KKReckons email palette (as in the daily email).
const E = { ink: "#1B2636", body: "#3B4452", muted: "#6B7482", coral: "#C4553B", rule: "#E6E0D6" };
const SANS = "'Inter',Helvetica,Arial,sans-serif";
const SERIF = "'Playfair Display',Georgia,'Times New Roman',serif";
// Links to the website carry UTM tags, so the analytics' UTM view shows visits from the email.
const utm = (href) => {
  if (!href.startsWith(SITE)) return href;
  const [base, hash] = href.split("#");
  return `${base}${base.includes("?") ? "&" : "?"}utm_source=newsletter&utm_medium=email&utm_campaign=${`weekly-${end}`}${hash ? `#${hash}` : ""}`;
};
const a = (href, html, style = "") =>
  `<a href="${esc(utm(href))}" target="_blank" style="text-decoration:none;${style}">${html}</a>`;
const label = (text, top = 18) =>
  `<tr><td colspan="2" style="padding:${top}px 0 4px;border-bottom:1px solid ${E.ink};font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:1px;color:${E.ink};"><span style="color:${E.coral};">■</span>&nbsp; ${esc(text)}</td></tr>`;
const rows = [];

const ACCENTS = [E.coral, "#F76707", "#E64980", "#7048E8"];
rows.push(
  `<tr><td colspan="2" style="padding:0 0 10px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    ACCENTS.map((c) => `<td width="25%" style="border-top:4px solid ${c};font-size:0;line-height:0;">&nbsp;</td>`).join("") +
    `</tr></table></td></tr>`,
);
rows.push(
  `<tr><td colspan="2"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:1px;color:${E.coral};white-space:nowrap;">KKRECKONS WEEKLY <span style="color:${E.ink};">· ${esc(range.toUpperCase())}</span></td>` +
    `<td align="right" style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:1px;color:${E.muted};white-space:nowrap;">${picks.length} STORIES</td>` +
    `</tr></table></td></tr>`,
);
rows.push(
  `<tr><td colspan="2" style="padding:12px 0 2px;font-family:${SERIF};font-size:22px;line-height:1.25;font-weight:700;color:${E.ink};">The week in ${picks.length} stories</td></tr>` +
    `<tr><td colspan="2" style="padding:0 0 2px;font-family:${SANS};font-size:13px;line-height:1.4;color:${E.body};">Missed a day? The week’s best stories, one per topic.</td></tr>`,
);

rows.push(label("BEST OF THE WEEK", 14));
picks.forEach((p, i) => {
  const line = i === picks.length - 1 ? "" : `border-bottom:1px solid ${E.rule};`;
  const thumb = p.thumb ? a(p.url, `<img src="${p.thumb}" width="44" height="44" alt="" style="display:block;width:44px;height:44px;border:0;">`) : "";
  rows.push(
    `<tr><td width="44" valign="top" style="width:44px;padding:9px 12px 9px 0;${line}">${thumb}</td>` +
      `<td valign="top" style="padding:8px 0;${line}font-family:${SANS};">` +
      `<div style="font-size:10px;font-weight:700;letter-spacing:0.5px;color:${E.coral};">${esc(dow(p.date).toUpperCase())} ${esc(short(p.date).toUpperCase())}${p.cat ? ` · ${esc(p.cat)}` : ""}</div>` +
      `<div style="margin-top:1px;font-size:15px;line-height:1.3;font-weight:700;">${a(p.url, esc(p.head), `color:${E.ink};`)}</div>` +
      `<div style="margin-top:1px;font-size:13px;line-height:1.35;color:${E.body};">${esc(p.teaser)}</div>` +
      `</td></tr>`,
  );
});

if (si) {
  const move = si.from == null ? "" : si.to === si.from ? `, unchanged on the week` : `, ${si.to > si.from ? "up" : "down"} from ${si.from} a week earlier`;
  rows.push(label("AI STRESS INDEX THIS WEEK"));
  rows.push(
    `<tr><td colspan="2" style="padding:8px 0 0;font-family:${SANS};font-size:14px;line-height:1.4;color:${E.body};">` +
      `<b style="color:#7048E8;">${si.to}/100, ${band(si.to)}</b> at the ${short(si.asOf)} close${move}. ` +
      a(`${SITE}/ai-stress-index`, "See the gauges &rarr;", "color:#7048E8;font-weight:700;") +
      `</td></tr>`,
  );
}

rows.push(
  `<tr><td colspan="2" align="center" style="padding:22px 0 0;">` +
    `<table cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="border:2px solid ${E.coral};border-radius:24px;background-color:#FFF7EE;">` +
    a(`${SITE}/daily/`, "Catch up on the week →", `display:block;padding:10px 26px;font-family:${SANS};font-size:15px;font-weight:700;color:${E.coral};`) +
    `</td></tr></table>` +
    `<div style="margin-top:8px;font-family:${SANS};font-size:11px;color:${E.muted};">Every edition, with graphics, the other side and sources, is on the website.</div>` +
    `</td></tr>`,
);

const html = `<pre data-type="htmlSnippet"><code class="language-html">${esc(
  `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;"><tbody>${rows.join("")}</tbody></table>`,
)}</code></pre>`;

// Same per-post theme as the daily email.
const theme = {
  padding_left: "16", padding_right: "16", padding_top: "10", padding_bottom: "8", margin_top: "8", margin_bottom: "8",
  header_padding_bottom: "0", header_byline_show_read_online: "false", header_topline_show_read_online: "false",
  max_width: "620", background_color: "#FFFFFF", content_background_color: "#FFFFFF",
  paragraph_color: E.body, paragraph_padding_top: "3", paragraph_padding_bottom: "3", paragraph_line_height_exact: "1.45",
  inline_link_color: E.coral, inline_link_bold: "true", inline_link_underline: "false", inline_link_italic: "false",
  h3_font_size: "17", h3_font_color: E.ink, header_title_font_color: E.ink, header_subtitle_font_size: "18",
  header_subtitle_font_weight: "600", header_subtitle_font_color: E.coral, image_padding_top: "0", image_padding_bottom: "0",
  button_background_color: E.coral, button_border_color: E.coral, button_text_color: "#FFFFFF", button_border_radius: "24",
};

const preview = picks.slice(0, 3).map((p) => p.head).join(" · ");
const payload = {
  title: `KKReckons Weekly, ${range} ${day(end).getUTCFullYear()}`,
  subtitle: preview,
  email_settings: {
    email_subject_line: `KKReckons Weekly · The week in ${picks.length} stories, ${range}`,
    email_preview_text: preview,
    display_title_in_email: false,
    display_subtitle_in_email: false,
    display_byline_in_email: false,
  },
  web_settings: { slug: `kkreckons-weekly-${end}` },
  theme,
  html_content: html,
};
const json = JSON.stringify(payload, null, 2);
if (out) fs.writeFileSync(out, json + "\n");
else process.stdout.write(json + "\n");
(out ? console.log : console.error)(
  [`${range}: ${picks.length} picks${si ? `, AI Stress Index ${si.from ?? "?"} → ${si.to}` : ", no AI Stress Index reading (data unreachable)"}`, ...picks.map((p) => `${p.date} · ${p.cat.toLowerCase()}${p.pick ? " (pick)" : ""} · ${p.head}`)].join("\n"),
);
