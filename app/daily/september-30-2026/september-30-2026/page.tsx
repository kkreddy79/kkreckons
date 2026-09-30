const stories = [
  ["1","India","3,000 new jobs in India; DoorDash opens Hyderabad tech hub","A reported expansion of technology activity and employment in Hyderabad.","Verify the underlying company and government sources before treating the headline as a confirmed figure.","https://www.door-dash.com/"],
  ["2","Markets","30-year US Treasury yield reaches a major threshold","Long-duration yields can affect mortgages, valuations and the cost of capital.","Market moves can reflect several factors; a single yield level does not explain the whole economy.","https://home.treasury.gov/"],
  ["3","AI & Technology","AI infrastructure and the next phase of compute","The economics of compute increasingly depend on power, chips, data centres and capital.","Forecasts about AI demand remain uncertain and should be distinguished from reported results.","https://www.iea.org/"],
  ["4","Business","Corporate restructuring meets AI adoption","AI adoption can change workforce needs, software spending and capital allocation.","Company restructuring plans can have multiple causes beyond AI.","https://www.sec.gov/"]
];

export default function DailyEdition() {
  return <main className="container">
    <section className="hero">
      <div className="eyebrow">Wednesday, 30 September 2026 · Curated by KK Reddy</div>
      <h1>India + World<br/>Edition</h1>
      <p>A visual briefing with the important signals of the day, followed by context and source links.</p>
      <div className="cta-row"><a className="button" href="https://claude.ai/artifact/TptrwZg37dQfkjuokvRYCY" target="_blank" rel="noreferrer">Explore interactive edition ↗</a></div>
    </section>

    <section className="edition-card">
      <img className="edition-image" src="/daily-september-30-2026.jpg" alt="KKReckons September 30 2026 briefing" />
      <div className="edition-body"><strong>Today’s slice</strong><p>US long rates, AI infrastructure and the latest India business signals — read the source-linked context below.</p></div>
    </section>

    <div className="section-title"><h2>Stories</h2><span>Source-linked</span></div>
    <section className="story-grid">
      {stories.map(([n,cat,title,what,why,src]) => <article className="story" key={n}>
        <span className="num">{n}</span><span className="tag">{cat}</span>
        <h3>{title}</h3><p>{what}</p>
        <div className="why"><strong>Other side / context:</strong> {why}</div>
        <p style={{marginTop:14}}><a href={src} target="_blank" rel="noreferrer"><strong>Open source ↗</strong></a></p>
      </article>)}
    </section>

    <div className="slice"><strong>Editorial note:</strong> This page separates reported information from interpretation. Always open the source and verify important figures before acting on them.</div>
  </main>;
}