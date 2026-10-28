// Makes a 1600×900 share image for a special report that has no cover of its own:
//
//   node scripts/special-cover.mjs <slug>          writes public/special/<slug>.jpg
//
// Navy-to-dusk sky, the reports' skyline, the kicker in gold and the title in a serif, with the KKReckons mark.
// Original artwork (no third-party images), so it can be shared anywhere. Set the registry entry's `cover` to
// "/special/<slug>.jpg" afterwards.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2];
const reports = JSON.parse(fs.readFileSync(path.join(root, "data", "special.json"), "utf8"));
const r = reports.find((x) => x.slug === slug);
if (!r) {
  console.error(`No report "${slug}" in data/special.json`);
  process.exit(1);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Breaks a title into lines of at most `max` characters. */
function lines(text, max) {
  const out = [];
  let cur = "";
  for (const w of text.split(/\s+/)) {
    if ((cur + " " + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
}
const title = lines(r.title, 22);
const size = title.length > 2 ? 104 : 124;
const top = 330 - (title.length - 2) * 40;
const dek = lines(r.dek, 70).slice(0, 2);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16222F"/><stop offset=".55" stop-color="#2B3550"/><stop offset="1" stop-color="#7A4A52"/></linearGradient>
  <radialGradient id="sun"><stop offset="0" stop-color="#F0B840" stop-opacity=".55"/><stop offset="1" stop-color="#F0B840" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1600" height="900" fill="url(#sky)"/>
<circle cx="1440" cy="150" r="230" fill="url(#sun)"/>
<circle cx="1440" cy="150" r="42" fill="#F0B840" opacity=".85"/>
<g transform="translate(0,660) scale(1.3334,1.6)">
  <path fill="#0F1924" opacity=".55" d="M0 150V96h60V70h36v26h40V58h28v38h52V80h34v16h70V48h22l8-18 8 18h20v48h56V76h44v20h60V62h30v34h48V84h56V54h26v42h66V72h40v24h58V60h34v36h50V82h70v14h64V66h28v30h60V88h42v62z"/>
  <path fill="#0B131C" d="M0 150v-30h80v-18h50v18h66v-26h30v26h90v-14h48v14h72v-32h36v32h84v-20h56v20h90v-28h40v28h70v-16h62v16h88v-24h34v24h70v-12h54v12h80v30z"/>
</g>
<text x="110" y="150" font-family="Inter, DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="5" fill="#F0B840">KKRECKONS SPECIAL REPORT · ${esc(r.kicker.toUpperCase())}</text>
${title.map((l, i) => `<text x="106" y="${top + i * (size + 14)}" font-family="DejaVu Serif, Georgia, serif" font-weight="700" font-size="${size}" fill="#FFF8EE">${esc(l)}</text>`).join("\n")}
${dek.map((l, i) => `<text x="110" y="${top + title.length * (size + 14) + 20 + i * 44}" font-family="Inter, DejaVu Sans, Arial, sans-serif" font-size="32" fill="#C9CED6">${esc(l)}</text>`).join("\n")}
<text x="110" y="840" font-family="DejaVu Serif, Georgia, serif" font-weight="700" font-size="40" fill="#FFF8EE">KK<tspan fill="#F0B840">Reckons</tspan></text>
<text x="1490" y="840" text-anchor="end" font-family="Inter, DejaVu Sans, Arial, sans-serif" font-weight="600" font-size="26" fill="#C9CED6">kkreckons.com/special</text>
</svg>`;

const out = path.join(root, "public", "special", `${slug}.jpg`);
fs.mkdirSync(path.dirname(out), { recursive: true });
await sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toFile(out);
console.log(`Wrote ${path.relative(root, out)} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
