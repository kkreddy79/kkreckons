import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/latin-800.css";
import "@fontsource/playfair-display/latin-800-italic.css";
import "@fontsource/cormorant-garamond/latin-600-italic.css";
import "@fontsource/cormorant-garamond/latin-700.css";

const ALT =
  "Sunset panorama joining two worlds: Indian temples, forts and palms on the left, the Los Angeles skyline, beach and Santa Monica pier on the right";

/** Photo banner with the KKReckons title set over the sky. */
export default function Masthead() {
  return (
    <div className="ab-mast">
      <picture>
        <source media="(max-width: 700px)" srcSet="/about/two-worlds-tall.webp" type="image/webp" width={1200} height={750} />
        <source media="(max-width: 700px)" srcSet="/about/two-worlds-tall.jpg" width={1200} height={750} />
        <source srcSet="/about/two-worlds.webp" type="image/webp" width={2000} height={816} />
        <img src="/about/two-worlds.jpg" width={2000} height={816} alt={ALT} />
      </picture>
      <div className="mast-overlay">
        <div className="mast-top">
          <span className="mast-tags">
            Markets<i>•</i>Technology<i>•</i>Policy<i>•</i>Business<i>•</i>World
          </span>
          <span className="mast-ed">India and World editions</span>
        </div>
        <div className="mast-center">
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
          <p className="mast-motto">
            <span className="m1">Curiosity Today.</span> <span className="m2">Read Deep.</span>{" "}
            <span className="m3">A Brighter Tomorrow.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
