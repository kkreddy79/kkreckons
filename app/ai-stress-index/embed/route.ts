import { SITE_URL } from "@/lib/site";
import { addCacheTag } from "@vercel/functions";
import { EMBED_CACHE_TAG, liveStress, loadStressFile } from "@/lib/stress";
import { STRESS_BANDS, stressBand } from "@/lib/stressBand";

// A small live card other sites can embed in an iframe (snippet on /ai-stress-index). It's a plain HTML
// response, so it carries none of the site's header and footer, and next.config.mjs lets it be framed.

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const day = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export async function GET(req: Request) {
  const theme = new URL(req.url).searchParams.get("theme");
  // Fresh data on every render: the CDN copy below is the cache, and /api/revalidate clears it by tag.
  const si = liveStress(await loadStressFile("data.json", true));
  await addCacheTag(EMBED_CACHE_TAG);
  const link = `${SITE_URL}/ai-stress-index?utm_source=embed&utm_medium=widget`;
  let inner: string;
  if (!si) {
    inner = `<p class="k">AI Stress Index</p><p class="m">Today's reading is loading. <a href="${link}" target="_blank" rel="noopener">See the index</a></p>`;
  } else {
    const [name, , , text] = stressBand(si.score);
    const d = si.prevScore == null ? null : si.score - si.prevScore;
    const change = d == null || !si.prevDate ? "" : d === 0 ? `Unchanged from ${day(si.prevDate)}` : `${d > 0 ? "Up" : "Down"} ${Math.abs(d)} from ${day(si.prevDate)}`;
    inner = `
<p class="k">AI Stress Index · ${esc(day(si.asOf))} close</p>
<div class="row"><b class="s" style="--t:${text}">${si.score}</b><span class="o">/100</span>
${si.limited ? `<span class="p" style="background:#71717a">Limited data</span>` : `<span class="p" style="background:${text}">${name}</span>`}</div>
<div class="bar">${STRESS_BANDS.map(([, , c]) => `<i style="background:${c}"></i>`).join("")}<u style="left:${Math.min(100, Math.max(0, si.score))}%"></u></div>
<p class="m">${esc(change)}${change ? " · " : ""}<a href="${link}" target="_blank" rel="noopener">KKReckons ↗</a></p>`;
  }
  const html = `<!doctype html><html lang="en"${theme === "dark" || theme === "light" ? ` data-theme="${theme}"` : ""}><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>AI Stress Index · KKReckons</title>
<style>
/* No color-scheme here: a dark scheme inside a light host page would paint the frame's corners dark. */
:root{--bg:#fff;--ink:#1e1535;--mu:#5b5566;--ln:#e9e4dc}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#1e1a28;--ink:#f1ecfa;--mu:#b4adc2;--ln:#322c3f}}
:root[data-theme=dark]{--bg:#1e1a28;--ink:#f1ecfa;--mu:#b4adc2;--ln:#322c3f}
*{box-sizing:border-box}html,body{margin:0;background:transparent}
body{font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:var(--ink)}
.c{display:block;max-width:360px;padding:14px 16px;border:1px solid var(--ln);border-radius:14px;background:var(--bg)}
.k{margin:0;font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--mu)}
.row{display:flex;align-items:baseline;gap:6px;margin:6px 0 10px}
.s{font:800 44px/1 Georgia,serif;color:var(--t)}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .s{color:var(--ink)}}:root[data-theme=dark] .s{color:var(--ink)}
.o{font-weight:700;color:var(--mu)}
.p{margin-left:auto;align-self:center;padding:3px 10px;border-radius:999px;color:#fff;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
.bar{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:2px;height:7px}.bar i{border-radius:999px}
.bar u{position:absolute;top:50%;width:13px;height:13px;margin-left:-6.5px;border-radius:50%;background:var(--bg);border:3px solid var(--ink);transform:translateY(-50%)}
.m{margin:10px 0 0;font-size:12.5px;color:var(--mu)}.m a{color:var(--ink);font-weight:800;text-decoration:none}.m a:hover{text-decoration:underline}
</style></head><body><div class="c">${inner}</div></body></html>`;
  // Reads ?theme=, so it renders per request; the CDN keeps each version for an hour, like the data, or until
  // /api/revalidate clears the tag when a new reading publishes.
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
