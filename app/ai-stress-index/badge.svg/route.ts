import { liveStress, loadStressFile } from "@/lib/stress";
import { stressBand } from "@/lib/stressBand";

// A live image badge ("AI Stress Index | 32 Elevated") for blogs, newsletters and READMEs that allow
// images but not iframes. Snippet on /ai-stress-index.
export const revalidate = 3600;

export async function GET() {
  const si = liveStress(await loadStressFile("data.json"));
  const label = "AI Stress Index";
  const value = !si ? "see today" : si.limited ? `${si.score} · limited data` : `${si.score} · ${stressBand(si.score)[0]}`;
  const color = !si || si.limited ? "#71717a" : stressBand(si.score)[3];
  // Width from a rough per-character estimate at 11px; the text is centred, so small misses don't show.
  const lw = Math.round(label.length * 6.4 + 16);
  const vw = Math.round(value.length * 6.6 + 16);
  const w = lw + vw;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="22" viewBox="0 0 ${w} 22" role="img" aria-label="${label}: ${value}">
<title>${label}: ${value} (KKReckons)</title>
<clipPath id="r"><rect width="${w}" height="22" rx="5"/></clipPath>
<g clip-path="url(#r)"><rect width="${lw}" height="22" fill="#24123f"/><rect x="${lw}" width="${vw}" height="22" fill="${color}"/></g>
<g fill="#fff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif" font-size="11" font-weight="700" text-anchor="middle">
<text x="${lw / 2}" y="15">${label}</text><text x="${lw + vw / 2}" y="15">${value}</text></g></svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
