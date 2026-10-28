/** WebP copies of a story image, written beside it by scripts/build-editions.mjs (VARIANTS and THUMB there). */
export const figVariant = (image: string, tag: "sm" | "md" | "lg" | "th") => image.replace(/\.[a-z]+$/, `-${tag}.webp`);

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
export const thumbOf = (s: { image?: string; imageW?: number }) => (s.image ? (s.imageW ? figVariant(s.image, "th") : s.image) : "");
