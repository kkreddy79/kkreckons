/**
 * Two-worlds sunset panorama, fading into the page. Home shows it short with the KKReckons wordmark; About passes
 * compact={false} for the full panorama. Every other page passes `slim`: a thin strip of the same picture with no
 * wordmark (the site header already carries it), so the page's own heading starts near the top of the screen.
 */
export default function Banner({ strap = "A clearer slice of a complex world", compact = true, slim = false }: { strap?: string; compact?: boolean; slim?: boolean }) {
  return (
    <header className={`ab-top${slim ? " ab-top-xs" : compact ? " ab-top-sm" : ""}`}>
      {slim ? (
        // A ready-cut strip of the panorama (1280×115, about 15 KB) rather than the whole picture shown through a slot.
        <picture className="ab-top-img">
          <source srcSet="/about/two-worlds-strip.avif" type="image/avif" />
          <source srcSet="/about/two-worlds-strip.webp" type="image/webp" />
          <img src="/about/two-worlds-strip.jpg" width={1280} height={115} alt="" />
        </picture>
      ) : (
        <picture className="ab-top-img">
          {/* AVIF first (about half the size of WebP), then WebP, then JPEG for browsers that support neither. */}
          <source media="(max-width: 700px)" srcSet="/about/two-worlds-mobile.avif" type="image/avif" />
          <source media="(max-width: 700px)" srcSet="/about/two-worlds-mobile.webp" type="image/webp" />
          <source media="(max-width: 700px)" srcSet="/about/two-worlds-mobile.jpg" />
          <source srcSet="/about/two-worlds.avif" type="image/avif" />
          <source srcSet="/about/two-worlds.webp" type="image/webp" />
          <img
            src="/about/two-worlds.jpg"
            width={2000}
            height={816}
            // The banner is the largest thing on screen when Home and About open: fetch it first.
            fetchPriority="high"
            alt="Sunset panorama: South Indian temples and forts on one side, the Los Angeles skyline and Santa Monica pier on the other"
          />
        </picture>
      )}
      {!slim && (
        <div className="ab-brand">
          <p className="ab-wordmark">
            KK<span>Reckons</span>
          </p>
          <p className="ab-strap">{strap}</p>
        </div>
      )}
    </header>
  );
}
