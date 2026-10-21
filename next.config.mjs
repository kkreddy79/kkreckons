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
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Story graphics rarely change once published: let browsers keep them a day (and reuse them for a
      // week while re-checking), instead of re-validating every image on every visit.
      { source: "/figs/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
};
export default nextConfig;
