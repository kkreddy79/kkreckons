import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/latin-800.css";
import "@fontsource/cormorant-garamond/latin-600-italic.css";
import "@fontsource/cormorant-garamond/latin-700.css";

const ALT =
  "Sunset panorama joining two worlds: Hyderabad's Charminar and Golconda Fort on the left, a US city skyline on the right";

/** Photo banner with the KKReckons title set over the sky. */
export default function Masthead() {
  return (
    <div className="ab-mast">
      <picture>
        <source media="(max-width: 700px)" srcSet="/about/two-worlds-tall.webp" type="image/webp" width={1200} height={750} />
        <source media="(max-width: 700px)" srcSet="/about/two-worlds-tall.jpg" width={1200} height={750} />
        <source srcSet="/about/two-worlds.webp" type="image/webp" width={2048} height={666} />
        <img src="/about/two-worlds.jpg" width={2048} height={666} alt={ALT} />
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
            <span className="kk">KK</span>Reckons
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
