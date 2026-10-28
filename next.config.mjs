/** @type {import('next').NextConfig} */
// Content-Security-Policy: everything comes from this site, except the AI Stress Index data the page re-fetches
// from GitHub (lib/stress.ts STRESS_BASES), Umami's cloud analytics (components/Umami.tsx) and the Vercel Toolbar on preview deployments (vercel.live, Pusher).
// Scripts and styles keep 'unsafe-inline': Next.js inlines its page data and the theme script, and per-request
// nonces would make every page dynamic. The policy still blocks scripts, frames and objects from anywhere else,
// <base> hijacking and forms posting off-site.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://cloud.umami.is https://vercel.live",
  "style-src 'self' 'unsafe-inline' https://vercel.live",
  "img-src 'self' data: blob: https://vercel.live https://vercel.com",
  "font-src 'self' https://vercel.live https://assets.vercel.com",
  "connect-src 'self' https://kkreddy79.github.io https://raw.githubusercontent.com https://cloud.umami.is https://api-gateway.umami.dev https://vercel.live wss://ws-us3.pusher.com",
  "frame-src 'self' https://vercel.live",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Security headers on every page (Vercel already adds HSTS).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: CSP },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig = {
  images: { unoptimized: true },
  // The AI Stress Index data, published by its own pipeline on GitHub Pages, is also served from this
  // domain, so citations and dataset listings credit kkreckons.com.
  async rewrites() {
    return [
      { source: "/ai-stress-index/:file(data|backtest).json", destination: "https://kkreddy79.github.io/ai-implosion/:file.json" },
      // Research briefs are self-contained pages (public/research/<slug>.html), served at /research/<slug>.
      { source: "/research/:slug([a-z0-9-]+)", destination: "/research/:slug.html" },
    ];
  },
  async headers() {
    return [
      // Every page refuses to be framed by other sites, except the AI Stress Index embed card, which exists to be.
      { source: "/:path((?!ai-stress-index/embed$).*)", headers: securityHeaders },
      {
        source: "/ai-stress-index/embed",
        headers: [
          ...securityHeaders.filter((h) => h.key !== "X-Frame-Options" && h.key !== "Content-Security-Policy"),
          // A static card with no scripts or images: inline styles only, framable anywhere.
          { key: "Content-Security-Policy", value: "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors *" },
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
