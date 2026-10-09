import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { latest, slugFor } from "@/lib/editions";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.kkreckons.com"),
  title: { default: "KKReckons — Read deep. Think clearly. Leave in five.", template: "%s · KKReckons" },
  description:
    "Visual daily briefings on AI, markets, business, India and the world. Curated by KK Reddy.",
  openGraph: {
    siteName: "KKReckons",
    type: "website",
    images: [`/covers/${latest.date}.jpg`],
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
            <Link href={`/daily/${slugFor(latest.date)}`}>Today</Link>
            <Link href="/daily/">Archive</Link>
            <Link href="/about">About</Link>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div>Read deep. Think clearly. Leave in five.</div>
          <div className="foot-links">
            <Link href="/daily/">All editions</Link>
            <Link href="/about">About</Link>
          </div>
          <div>
            Curated by KK Reddy
            <br />
            <span className="fine">For information only. Not financial, legal or career advice.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
