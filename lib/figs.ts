import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Browsers keep /figs/ files for a day (next.config.mjs), so a graphic replaced under the same name (a correction)
// would keep showing the old one. Each /figs/ URL the pages print carries ?v=<first 8 hex of the file's SHA-1>:
// unchanged files keep their URL, a replaced one gets a new URL and is fetched at once. Read once per file at build
// time; a file the server can't read (or any other URL) is left as it is.
const versions = new Map<string, string>();
export function figSrc(url: string) {
  if (!url.startsWith("/figs/")) return url;
  let v = versions.get(url);
  if (v === undefined) {
    try {
      v = crypto.createHash("sha1").update(fs.readFileSync(path.join(process.cwd(), "public", url))).digest("hex").slice(0, 8);
    } catch {
      v = "";
    }
    versions.set(url, v);
  }
  return v ? `${url}?v=${v}` : url;
}

/** WebP copies of a story image, written beside it by scripts/build-editions.mjs (VARIANTS and THUMB there). */
export const figVariant = (image: string, tag: "sm" | "md" | "lg" | "th") => figSrc(image.replace(/\.[a-z]+$/, `-${tag}.webp`));

/** `srcset` for a story image's WebP copies (640px, 860px and up to 1600px), given its original width. */
export function webpSrcSet(image: string, width: number) {
  const max = Math.min(width, 1600);
  return (
    [
      ["sm", 640],
      ["md", 860],
      ["lg", max],
    ] as const
  )
    .filter(([, w]) => w <= max)
    .map(([tag, w]) => `${figVariant(image, tag)} ${w}w`)
    .join(", ");
}

/** The 184×240 thumbnail for lists (/week, /month); images without WebP copies (the oldest) use the original. */
export const thumbOf = (s: { image?: string; imageW?: number }) => (s.image ? (s.imageW ? figVariant(s.image, "th") : figSrc(s.image)) : "");
