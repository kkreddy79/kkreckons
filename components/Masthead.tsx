import "@fontsource/playfair-display/latin-800.css";
import "@fontsource/playfair-display/latin-800-italic.css";
import "@fontsource/cormorant-garamond/latin-600-italic.css";

/** Photo banner with the KKReckons wordmark and tagline set over the sky. */
export default function Masthead() {
  return (
    <div className="ab-mast">
      <picture>
        <source srcSet="/about/two-worlds.webp" type="image/webp" width={2000} height={816} />
        <img
          src="/about/two-worlds.jpg"
          width={2000}
          height={816}
          alt="Sunset panorama joining two worlds: Indian temples and forts on one side, the Los Angeles skyline and Santa Monica pier on the other"
        />
      </picture>
      <div className="mast-overlay">
        <p className="mast-title">
          <svg className="mast-globe" viewBox="0 0 100 100" fill="none" aria-hidden>
            <defs>
              <linearGradient id="mast-globe-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ef7447" />
                <stop offset="0.55" stopColor="#d1224e" />
                <stop offset="1" stopColor="#6a2a9e" />
              </linearGradient>
            </defs>
            <g stroke="url(#mast-globe-g)" strokeWidth="6" strokeLinecap="round">
              <circle cx="50" cy="50" r="44" />
              <ellipse cx="50" cy="50" rx="20" ry="44" />
              <path d="M8 36h84M8 64h84M50 6v88" />
            </g>
          </svg>
          <span>
            KK<span className="r">Reckons</span>
          </span>
        </p>
        <p className="mast-sub">
          Signal <span className="amp">&amp;</span> Spice from Two Worlds
        </p>
      </div>
    </div>
  );
}
