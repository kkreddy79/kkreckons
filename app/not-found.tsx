import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container narrow">
      <section className="hero">
        <div className="eyebrow">404</div>
        <h1>That page isn’t here.</h1>
        <p>The edition may have moved. Every briefing is waiting in Catch up.</p>
        <div className="cta-row">
          <Link className="button" href="/daily/">
            Catch up on every edition
          </Link>
        </div>
      </section>
    </main>
  );
}
