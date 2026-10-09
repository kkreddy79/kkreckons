/** Two-worlds sunset panorama with the KKReckons wordmark, fading into the page. */
export default function Banner({ strap = "A clearer slice of a complex world" }: { strap?: string }) {
  return (
    <header className="ab-top">
      <picture className="ab-top-img">
        <source media="(max-width: 700px)" srcSet="/about/two-worlds-mobile.webp" type="image/webp" />
        <source media="(max-width: 700px)" srcSet="/about/two-worlds-mobile.jpg" />
        <source srcSet="/about/two-worlds.webp" type="image/webp" />
        <img
          src="/about/two-worlds.jpg"
          width={2000}
          height={816}
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
