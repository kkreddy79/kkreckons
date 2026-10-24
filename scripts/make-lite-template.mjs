// Builds templates/KKReckons_Template_lite.html: the newsletter template small enough for Claude to read in
// full inside the KKReckons Project (~130 KB instead of ~3 MB). Made from the newest edition in newsletters/:
//  - embedded fonts (~450 KB of base64) become Google Fonts (Poppins, Lora, Roboto Serif) and the device's own
//    Palatino / Helvetica for the TeX Gyre Pagella / Heros faces, keeping every font-family name in the CSS;
//  - the edition's data becomes one example story per section with no images, showing every field.
// Usage: node scripts/make-lite-template.mjs [newsletters/<date>.html]
import fs from "node:fs";
import path from "node:path";

const src = process.argv[2] || path.join("newsletters", fs.readdirSync("newsletters").filter((f) => f.endsWith(".html")).sort().at(-1));
let html = fs.readFileSync(src, "utf8");

// 1. Fonts. Each embedded face is replaced by a local() lookup or removed in favour of the Google Fonts link.
const LOCAL = {
  Pagella: "local('TeX Gyre Pagella'),local('Palatino Linotype'),local('Palatino'),local('Book Antiqua')",
  Heros: "local('TeX Gyre Heros'),local('Helvetica Neue'),local('Helvetica'),local('Arial')",
};
let faces = 0;
html = html.replace(/@font-face\{font-family:'([^']+)';[^}]*?\}/g, (rule, family) => {
  faces++;
  if (LOCAL[family]) return rule.replace(/src:url\(data:[^)]*\)\s*format\('[a-z]+'\)/, `src:${LOCAL[family]}`);
  return ""; // Poppins, Lora and RSC (Roboto Serif) come from Google Fonts below.
});
if (/url\(data:font/.test(html)) throw new Error("an embedded font was left behind");
const GOOGLE =
  "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,700;1,400&family=Lora:ital,wght@0,400..700;1,400..700&family=Roboto+Serif:ital,opsz,wdth,wght@0,20,62.5,700;1,20,62.5,700&display=swap";
html = html.replace(/<style>/, `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="${GOOGLE}"><style>`);
// 'RSC' was Roboto Serif (20pt optical size), extra-condensed, bold: same face from Google Fonts.
html = html.replace(/font-family:'RSC',/g, "font-stretch:extra-condensed;font-family:'Roboto Serif',");

// 2. Data: one example story per section, every field present, no images.
const re = /(<script[^>]*id="data"[^>]*>)([\s\S]*?)(<\/script>)/;
const d = JSON.parse(html.match(re)[2]);
const example = (s) => ({
  ...s,
  fig: "",
  figalt: s.figalt || "One or two sentences naming the graphic's headline, its big number and its key points.",
  figcredit: s.figcredit || "Original graphic: KKReckons",
  free: s.free ?? "",
  freesrc: s.freesrc ?? "",
});
const data = {
  ...d,
  cover: "",
  pick: (d.pick || []).slice(0, 1).map(example),
  india: (d.india || []).slice(0, 1).map(example),
  world: (d.world || []).slice(0, 1).map(example),
  reading: (d.reading || []).slice(0, 1),
};
html = html.replace(re, (_, open, __, close) => `${open}${JSON.stringify(data, null, 1)}${close}`);

// 3. A note for whoever fills it in.
const NOTE = `<!--
  KKReckons newsletter template (lite). Copy this file and change ONLY the JSON inside the JSON script whose id is data:
  date, slice, takeaway, cover, callout, pick / india / world (stories) and reading. Field reference:
  docs/edition-format.md in the kkreckons repo. Leave the CSS, other scripts and markup as they are.
  Images: "fig" and "cover" take a data:image/...;base64 URL (graphics 1280px wide or more); empty means none.
  Paywalled story: "pay": "paid", plus "free" (link to a free report of the same news) and "freesrc" (its publisher).
  Fonts load from Google Fonts and the device, so this file stays small enough to read in full.
-->`;
html = html.replace(/<head>/, `<head>${NOTE}`);
html = html.replace(/<title>[^<]*<\/title>/, "<title>KKReckons, Weekday, D Month YYYY</title>");

fs.mkdirSync("templates", { recursive: true });
const out = path.join("templates", "KKReckons_Template_lite.html");
fs.writeFileSync(out, html);
console.log(`${out}: ${(html.length / 1024).toFixed(0)} KB (from ${src}, ${faces} font faces replaced)`);
