// Stores a newly published newsletter without its images, so newsletters/ stops growing by ~3 MB a day.
// Run by `npm run publish-edition` right after `npm run editions` has saved every image to public/figs.
// Each story's "fig" (and the top-level "cover") becomes "kkreckons-fig:/figs/<file>", which
// scripts/build-editions.mjs reads back as the stored file; the claude.ai artifact keeps the original.
// Only the date given is touched: earlier newsletters stay byte for byte as published (QC checks that).
// Usage: node scripts/strip-newsletter-images.mjs <YYYY-MM-DD>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
  console.error("Usage: node scripts/strip-newsletter-images.mjs <YYYY-MM-DD>");
  process.exit(1);
}
const file = path.join(root, "newsletters", `${date}.html`);
const figsDir = path.join(root, "public", "figs");
const html = fs.readFileSync(file, "utf8");
const re = /(<script[^>]*id=["']?data["']?[^>]*>)([\s\S]*?)(<\/script>)/i;
const block = re.exec(html);
if (!block) {
  console.log(`${date}: no embedded data, nothing to strip`);
  process.exit(0);
}
const d = JSON.parse(block[2]);

// Same names build-editions.mjs gives the files: stories numbered across Pick of the day, India, World.
const EXT = { png: "png", jpeg: "jpg", jpg: "jpg", webp: "webp" };
const pointer = (dataUrl, name) => {
  const m = /^data:image\/(png|jpe?g|webp);base64,/.exec(typeof dataUrl === "string" ? dataUrl : "");
  if (!m) return null;
  const target = name(EXT[m[1]]);
  // An image hidden with an override lives in newsletters/figs-kept/ instead (build-editions.mjs).
  const kept = path.join(root, "newsletters", "figs-kept", target);
  if (!fs.existsSync(path.join(figsDir, target)) && !fs.existsSync(kept)) throw new Error(`public/figs/${target} is missing; run npm run editions first`);
  return `kkreckons-fig:/figs/${target}`;
};

let n = 0;
let stripped = 0;
for (const s of [...(d.featured || []), ...(d.pick || []), ...(d.india || []), ...(d.world || [])]) {
  n += 1;
  const p = s.fig ? pointer(s.fig, (ext) => `${date}-${n}.${ext}`) : null;
  if (p) (s.fig = p), stripped++;
}
if (typeof d.cover === "string") {
  const p = pointer(d.cover, () => `${date}-cover.jpg`);
  if (p) (d.cover = p), stripped++;
} else if (d.cover && typeof d.cover === "object") {
  const p = pointer(d.cover.src, () => `${date}-cover.jpg`);
  if (p) (d.cover.src = p), stripped++;
}

if (!stripped) {
  console.log(`${date}: newsletter already stored without images`);
  process.exit(0);
}
// Escape "<" so text such as "</script>" can't end the data block early.
const out = html.replace(re, (_, open, __, close) => `${open}${JSON.stringify(d).replace(/</g, "\\u003c")}${close}`);
fs.writeFileSync(file, out);
console.log(`${date}: stored without its ${stripped} images (${(html.length / 1048576).toFixed(1)} MB → ${(out.length / 1048576).toFixed(1)} MB)`);
