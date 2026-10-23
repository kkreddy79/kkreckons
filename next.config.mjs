/** @type {import('next').NextConfig} */
// Security headers on every page (Vercel already adds HSTS). No full Content-Security-Policy:
// the AI Stress Index loads data from GitHub, so a strict policy would need upkeep; frame-ancestors covers clickjacking.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig = {
  images: { unoptimized: true },
  // The AI Stress Index data, published by its own pipeline on GitHub Pages, is also served from this
  // domain, so citations and dataset listings credit kkreckons.com.
  async rewrites() {
    return [{ source: "/ai-stress-index/:file(data|backtest).json", destination: "https://kkreddy79.github.io/ai-implosion/:file.json" }];
  },
  async headers() {
    return [
      // Every page refuses to be framed by other sites, except the AI Stress Index embed card, which exists to be.
      { source: "/:path((?!ai-stress-index/embed$).*)", headers: securityHeaders },
      {
        source: "/ai-stress-index/embed",
        headers: [
          ...securityHeaders.filter((h) => h.key !== "X-Frame-Options" && h.key !== "Content-Security-Policy"),
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
      // Self-hosted heading fonts: renamed if they ever change, so browsers can keep them for a year.
      { source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // Story graphics rarely change once published: let browsers keep them a day (and reuse them for a
      // week while re-checking), instead of re-validating every image on every visit.
      { source: "/figs/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
};
export default nextConfig;
