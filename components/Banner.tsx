/**
 * Two-worlds sunset panorama with the KKReckons wordmark, fading into the page. Short by default, so every
 * page's own heading and content sit high on the screen; About passes compact={false} for the full panorama.
 */
export default function Banner({ strap = "A clearer slice of a complex world", compact = true }: { strap?: string; compact?: boolean }) {
  return (
    <header className={`ab-top${compact ? " ab-top-sm" : ""}`}>
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
          // The banner is the largest thing on screen when these pages open: fetch it first.
          fetchPriority="high"
          alt="Sunset panorama: South Indian temples and forts on one side, the Los Angeles skyline and Santa Monica pier on the other"
        />
      </picture>
      <div className="ab-brand">
        <p className="ab-wordmark">
          KK<span>Reckons</span>
        </p>
        <p className="ab-strap">{strap}</p>
      </div>
    </header>
  );
}
