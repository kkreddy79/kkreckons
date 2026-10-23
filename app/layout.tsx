import type { Metadata, Viewport } from "next";
import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/latin-800.css";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import ThemeToggle from "@/components/ThemeToggle";
import Lightbox from "@/components/Lightbox";
import { PROFILES, SUBSCRIBE_URL } from "@/lib/site";
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
  twitter: { card: "summary_large_image", creator: "@kkreddy78", images: ["/about/two-worlds.jpg"] },
  // Lets Google show the graphics as large previews (Discover, search).
  robots: { index: true, follow: true, "max-image-preview": "large", googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f1" },
    { media: "(prefers-color-scheme: dark)", color: "#14111b" },
  ],
};

// Applies a reader's saved light/dark choice before the page paints, so it never flashes the other theme.
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
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
          <ThemeToggle />
          <a className="hdr-sub" href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
            Subscribe
          </a>
        </header>
        <div id="main" tabIndex={-1}>
          {children}
        </div>
        <footer className="site-footer">
          <div>
            Curated by{" "}
            <a href={PROFILES.linkedin} rel="me noreferrer" target="_blank">
              Krishnakanth Reddy
            </a>
            <br />
            <span className="fine">For information only. Not financial, legal or career advice.</span>
          </div>
          <nav className="foot-links" aria-label="Footer">
            <Link href="/about">About</Link>
            <Link href="/daily/">Past editions</Link>
            <Link href="/topics">Topics</Link>
            <Link href="/ai-stress-index">AI Stress Index</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/standards">Standards</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="/feed.xml">RSS</a>
            <a href={PROFILES.linkedin} rel="me noreferrer" target="_blank">
              LinkedIn
            </a>
            <a href={PROFILES.x} rel="me noreferrer" target="_blank">
              X
            </a>
          </nav>
        </footer>
        <Lightbox />
        <Analytics />
      </body>
    </html>
  );
}
