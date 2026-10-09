import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/latin-800.css";
import { Analytics } from "@vercel/analytics/next";
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
};

export const viewport: Viewport = { themeColor: "#fbf8f1" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav>
            <Link href="/">Home</Link>
            <Link href="/daily/">Catch up</Link>
            <Link href="/about">About</Link>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div>
            Curated by Krishnakanth Reddy
            <br />
            <span className="fine">For information only. Not financial, legal or career advice.</span>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
