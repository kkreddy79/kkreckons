export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <div className="eyebrow">A visual briefing by KK Reddy</div>
        <h1>Read deep.<br/>Think clearly.</h1>
        <p>KKReckons turns the day's important signals across AI, markets, business, India and the world into concise visual briefings — with the source links and context behind the story.</p>
        <div className="cta-row">
          <a className="button" href="/daily/september-30-2026">Read the latest briefing</a>
          <a className="button alt" href="/daily/">Browse archive</a>
        </div>
      </section>

      <section className="edition-card">
        <img className="edition-image" src="/daily-september-30-2026.jpg" alt="KKReckons September 30 2026 India and World briefing" />
        <div className="edition-body">
          <div className="eyebrow">Wednesday, 30 September 2026</div>
          <h2>India + World Edition</h2>
          <p>Curated by KK Reddy. Explore the full briefing for story context, source links and the interactive edition.</p>
          <a className="button" href="/daily/september-30-2026">Open edition</a>
        </div>
      </section>

      <div className="section-title"><h2>What you’ll find</h2><span>Editorial format</span></div>
      <section className="story-grid">
        {[
          ["01","AI & Technology","Signals from AI, cloud, chips and emerging technology."],
          ["02","Markets & Investing","Rates, markets, capital flows and economic signals."],
          ["03","India + World","Business, policy, infrastructure and global developments."],
          ["04","Why it matters","Context, counterpoints and the practical implication behind each story."]
        ].map(([n,t,p])=><article className="story" key={n}><span className="num">{n}</span><h3>{t}</h3><p>{p}</p></article>)}
      </section>
    </main>
  );
}