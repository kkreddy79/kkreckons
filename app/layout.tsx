import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KKReckons — Read deep. Think clearly.",
  description: "Visual daily briefings on AI, markets, business, India and the world. Curated by KK Reddy.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a className="brand" href="/">KK<span>RECKONS</span></a>
          <nav>
            <a href="/daily/">Daily</a>
            <a href="/daily/september-30-2026">Latest</a>
            <a href="/about">About</a>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div><strong>KKRECKONS</strong><br/>Read deep. Think clearly.</div>
          <div>Curated by KK Reddy</div>
        </footer>
      </body>
    </html>
  );
}