// Runs every mechanical step of publishing an edition, in order, and prints only a short summary
// (or the output of the step that failed):
//
//   npm run publish-edition -- <YYYY-MM-DD> [--email out.json] [--copy copy.json] [--allow <date>]
//
// 1. npm run editions        rebuild site data from newsletters/ (the date must be in data/edition-meta.json)
// 2. strip-newsletter-images store this date's newsletter without its images (they are now in public/figs)
// 3. npm run check -- <date> automatic content checks (warnings are printed)
// 4. beehiiv-email.mjs       email thumbnails in public/email/ and the email JSON (default: .publish/beehiiv-<date>.json)
// 5. npm run build           clean Next.js build
// 6. npm run qc              compare with origin/main (--allow is passed through, for corrections)
//
// The rights review (images, wording, paywalls) stays a human/Claude step; see the publish-edition skill.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const date = args.find((a, i) => /^\d{4}-\d{2}-\d{2}$/.test(a) && args[i - 1] !== "--allow");
if (!date) {
  console.error("Usage: npm run publish-edition -- <YYYY-MM-DD> [--email out.json] [--copy copy.json] [--allow <date>]");
  process.exit(1);
}
const email = opt("--email") || path.join(".publish", `beehiiv-${date}.json`);
const allow = args.flatMap((a, i) => (args[i - 1] === "--allow" ? ["--allow", a] : []));
const env = { ...process.env, CHROMIUM_PATH: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" };

const steps = [
  ["editions", "npm", ["run", "-s", "editions"]],
  ["store", "node", ["scripts/strip-newsletter-images.mjs", date]],
  ["check", "npm", ["run", "-s", "check", "--", date]],
  ["email", "node", ["scripts/beehiiv-email.mjs", date, email, ...(opt("--copy") ? ["--copy", opt("--copy")] : [])]],
  ["build", "npm", ["run", "-s", "build"]],
  ["qc", "npm", ["run", "-s", "qc", "--", ...allow]],
];

fs.mkdirSync(path.dirname(path.resolve(root, email)), { recursive: true });
fs.rmSync(path.join(root, ".next"), { recursive: true, force: true });

for (const [name, cmd, argv] of steps) {
  const r = spawnSync(cmd, argv, { cwd: root, env, encoding: "utf8", maxBuffer: 1 << 26 });
  const output = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (r.status !== 0) {
    console.log(`✗ ${name} failed:\n${output.split("\n").slice(-40).join("\n")}`);
    process.exit(1);
  }
  const lines = output.split("\n");
  const keep = {
    editions: lines.filter((l) => l.startsWith(date) || /Removed|Moved|Wrote|Missing stored image/.test(l)),
    store: lines,
    check: lines.filter((l) => !/^\s*$/.test(l)),
    email: [`email written to ${email}`, ...lines.filter((l) => /^\d{2} · /.test(l))],
    build: [],
    qc: lines.filter((l) => /^(•|✓|Compared)/.test(l)),
  }[name];
  console.log(`✓ ${name}${keep.length ? `\n  ${keep.join("\n  ")}` : ""}`);
}
console.log(`All steps passed for ${date}. Next: rights review, then commit and open the pull request.`);
