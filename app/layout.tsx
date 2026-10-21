import type { Metadata, Viewport } from "next";
import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/latin-800.css";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import { SUBSCRIBE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.kkreckons.com"),
  title: { default: "KKReckons — Read deep. Think clearly. Stay curious.", template: "%s · KKReckons" },
  description:
    "Visual daily briefings on AI, markets, business, India and the world. Curated by Krishnakanth Reddy.",
  openGraph: {
    siteName: "KKReckons",
    type: "website",
    images: ["/about/two-worlds.jpg"],
  },
  twitter: { card: "summary_large_image", images: ["/about/two-worlds.jpg"] },
  // Lets Google show the graphics as large previews (Discover, search).
  robots: { index: true, follow: true, "max-image-preview": "large", googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport: Viewport = { themeColor: "#fbf8f1" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* In the layout, not metadata, so pages that set their own canonical keep it. */}
        <link rel="alternate" type="application/rss+xml" title="KKReckons daily editions" href="/feed.xml" />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className="site-header">
          <Link href="/" className="wordmark" aria-label="KKReckons home">
            KK<b>Reckons</b>
          </Link>
          <NavLinks />
          <a className="hdr-sub" href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
            Subscribe
          </a>
        </header>
        <div id="main" tabIndex={-1}>
          {children}
        </div>
        <footer className="site-footer">
          <div>
            Curated by Krishnakanth Reddy
            <br />
            <span className="fine">For information only. Not financial, legal or career advice.</span>
          </div>
          <nav className="foot-links" aria-label="Footer">
            <Link href="/about">About</Link>
            <Link href="/daily/">Past editions</Link>
            <Link href="/ai-stress-index">AI Stress Index</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/about#standards">Standards</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="/feed.xml">RSS</a>
          </nav>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
