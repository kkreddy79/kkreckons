export default function Admin() {
  return <main className="container admin">
    <section className="hero"><div className="eyebrow">Private publishing workspace</div><h1>KKReckons Publisher</h1><p>This is the V1 publishing dashboard foundation. Firebase authentication, Firestore and Storage will be connected after the first Vercel deployment.</p></section>
    <section className="form-card">
      <div className="field"><label>Edition date</label><input type="date" defaultValue="2026-09-30"/></div>
      <div className="field"><label>Edition title</label><input defaultValue="India + World Edition"/></div>
      <div className="field"><label>Infographic</label><input type="file" accept="image/*"/></div>
      <div className="field"><label>Claude Artifact URL</label><input defaultValue="https://claude.ai/artifact/TptrwZg37dQfkjuokvRYCY"/></div>
      <div className="field"><label>Story notes / source URLs</label><textarea placeholder="Paste source-linked story notes here..."/></div>
      <button className="button" type="button">Preview (Firebase publishing coming next)</button>
    </section>
  </main>;
}