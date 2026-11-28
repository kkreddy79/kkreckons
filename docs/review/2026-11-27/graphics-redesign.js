// Redesigned explainer graphics for the 27 Nov 2026 edition (run: node graphics-redesign.js; writes ./out/<n>.png).
// One layout, colour family and illustration per story. Text is taken from the original graphics.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const FONTS = path.join(__dirname, '../../../public/fonts');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const f64 = (n) => fs.readFileSync(path.join(FONTS, n)).toString('base64');

const ICONS = {
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  scales: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-3 7a3.2 3.2 0 0 0 6 0zM19 7l-3 7a3.2 3.2 0 0 0 6 0z"/>',
  warn: '<path d="M12 3.5 22 20H2z"/><path d="M12 10v4.5M12 17.4v.2"/>',
  shield: '<path d="M12 3 20 6v6c0 4.6-3.3 7.6-8 9-4.7-1.4-8-4.4-8-9V6z"/><path d="m8.6 12 2.4 2.4 4.4-4.6"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.3h2"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="M2.5 9.5h19M6 15h4"/>',
  layers: '<path d="m12 3 9 4.6-9 4.6-9-4.6zM3 12.2l9 4.6 9-4.6M3 16.6l9 4.6 9-4.6"/>',
  plug: '<path d="M9 3v5M15 3v5M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0zM12 17v4"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9"/>',
  bot: '<rect x="4.5" y="8" width="15" height="11" rx="3"/><path d="M12 8V4.5M9.2 13v1.4M14.8 13v1.4"/><circle cx="12" cy="3.6" r="1.1"/>',
  clock: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7v5.2l3.3 2"/>',
  down: '<path d="M12 4v15M6 13.5l6 6 6-6"/>',
  up: '<path d="M12 20V5M6 10.5l6-6 6 6"/>',
  saw: '<circle cx="10.5" cy="10.5" r="6.3"/><path d="m15.2 15.2 5.6 5.6"/>',
  chat: '<path d="M4 5h16v11H10.5L6 19.8V16H4z"/><path d="M8 9.3h8M8 12.3h5"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',
  wave: '<path d="M2 12c2.2-7 4.4-7 6.6 0s4.4 7 6.6 0 4.4-7 6.6 0"/>',
  atom: '<circle cx="12" cy="12" r="1.6" fill="currentColor"/><ellipse cx="12" cy="12" rx="9.4" ry="3.9"/><ellipse cx="12" cy="12" rx="9.4" ry="3.9" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.4" ry="3.9" transform="rotate(120 12 12)"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.3"/><path d="m15.2 15.2 5.6 5.6"/>',
  book: '<path d="M12 6.2C9.8 4.6 6.6 4.3 3 4.8v13.6c3.6-.5 6.8-.2 9 1.4 2.2-1.6 5.4-1.9 9-1.4V4.8c-3.6-.5-6.8-.2-9 1.4zM12 6.2v13.6"/>',
  person: '<circle cx="12" cy="7.5" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  ban: '<circle cx="12" cy="12" r="8.8"/><path d="m5.8 5.8 12.4 12.4"/>',
  compass: '<circle cx="12" cy="12" r="8.8"/><path d="m15.6 8.4-2 5.2-5.2 2 2-5.2z"/>',
  columns: '<path d="M3 9.5 12 4l9 5.5zM5.5 10v8M10 10v8M14 10v8M18.5 10v8M3 20.5h18"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.7"/><path d="M6 9.5v5M18 9.5v5"/>',
  people: '<circle cx="8.5" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.4"/><path d="M2.5 19.5a6 6 0 0 1 12 0M15 14.3a5 5 0 0 1 6.5 4.7"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 0V7a3 3 0 0 0-3-3zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 0"/>',
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

const css = `
@font-face{font-family:"Playfair Display";font-weight:700;src:url(data:font/woff2;base64,${f64('playfair-700.woff2')}) format("woff2")}
@font-face{font-family:"Playfair Display";font-weight:800;src:url(data:font/woff2;base64,${f64('playfair-800.woff2')}) format("woff2")}
@font-face{font-family:"Poppins";font-weight:400;src:url(data:font/woff2;base64,${f64('poppins-400.woff2')}) format("woff2")}
@font-face{font-family:"Poppins";font-weight:500;src:url(data:font/woff2;base64,${f64('poppins-500.woff2')}) format("woff2")}
@font-face{font-family:"Poppins";font-weight:600;src:url(data:font/woff2;base64,${f64('poppins-600.woff2')}) format("woff2")}
@font-face{font-family:"Poppins";font-weight:700;src:url(data:font/woff2;base64,${f64('poppins-700.woff2')}) format("woff2")}
@font-face{font-family:"Lora";font-style:italic;font-weight:400 700;src:url(data:font/woff2;base64,${f64('lora-italic.woff2')}) format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#888;font-family:"Poppins","Inter",sans-serif;-webkit-font-smoothing:antialiased}
.card{--ink:#1B1A33;--mut:#5E5B78;--bg:#FBF6EE;--hl:#C0392B;--pan:#fff;--line:rgba(27,26,51,.12);--tk:#1B2238;--os:#E3ECEB;--osk:#1F6F6A;
 width:640px;position:relative;overflow:hidden;background:var(--bg);color:var(--ink);padding:28px 28px 20px;display:flex;flex-direction:column;gap:14px}
.ic{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.kick{display:inline-flex;align-items:center;gap:7px;align-self:flex-start;font:600 12px/1 "Poppins";letter-spacing:.04em;color:var(--kc,var(--mut));position:relative;z-index:2}
.kick b{font-weight:700;background:var(--kb,rgba(27,26,51,.08));color:var(--kbc,var(--ink));padding:5px 10px;border-radius:999px}
h1{font:800 43px/1.04 "Playfair Display",Georgia,serif;letter-spacing:-.4px;max-width:380px;position:relative;z-index:2}
h1 em{font-style:normal;color:var(--hl)}
.hero{position:absolute;right:0;top:0;z-index:1}
.head{display:flex;flex-direction:column;gap:12px;min-height:158px}
.pan{background:var(--pan);border:1px solid var(--line);border-radius:16px;padding:14px 16px}
.pan h3,.h3{font:700 19px/1.15 "Playfair Display",Georgia,serif}
p,li{font-size:15px;line-height:1.42}
ul{list-style:none;display:flex;flex-direction:column}
.rows li{display:flex;gap:11px;align-items:flex-start;padding:9px 0;border-top:1px solid var(--line)}
.rows li:first-child{border-top:0;padding-top:4px}.rows li:last-child{padding-bottom:2px}
.rows .ic{margin-top:1px;color:var(--rc,var(--hl))}
.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.tk,.os{border-radius:16px;padding:14px 16px 15px}
.tk{background:var(--tk);color:#F3F1EA}.os{background:var(--os);color:var(--ink)}
.tk h4,.os h4{display:flex;align-items:center;gap:8px;font:700 17px/1 "Playfair Display",Georgia,serif;margin-bottom:8px}
.tk h4{color:#F2B84B}.os h4{color:var(--osk)}
.tk p,.os p{font-size:14.6px;line-height:1.42}
.src{font-size:11.6px;line-height:1.45;color:var(--mut);margin-top:2px}.src b{color:var(--ink);font-weight:600}
.big{font:800 64px/.95 "Playfair Display",Georgia,serif;color:var(--hl);letter-spacing:-1px;white-space:nowrap}
`;

const foot = (tk, os, src) => `
<div class="two"><div class="tk"><h4>${ic('target')}The takeaway</h4><p>${tk}</p></div>
<div class="os"><h4>${ic('scales')}Other side</h4><p>${os}</p></div></div>
<p class="src"><b>Source:</b> ${src} Original graphic: KKReckons.</p>`;
const rows = (items) => `<ul class="rows">${items.map(([i, t]) => `<li>${ic(i)}<span>${t}</span></li>`).join('')}</ul>`;

/* ---------- 1. Wired: pick of the day, dark, two sides ---------- */
const wired = `
<style>
.c1{--bg:#141A2E;--ink:#F4F1EA;--mut:#A9AEC6;--hl:#FF8A5B;--line:rgba(255,255,255,.14);--kb:#F2B84B;--kbc:#1B1A33;--kc:#C9CEE3;--tk:#F2B84B;--os:#232B47;--osk:#7FE0D2;
 background:radial-gradient(900px 420px at 88% -6%,#34407A 0%,rgba(52,64,122,0) 62%),linear-gradient(180deg,#141A2E,#10152A)}
.c1 .tk{color:#1B1A33}.c1 .tk h4{color:#1B1A33}.c1 .os{color:#E9ECF7;border:1px solid var(--line)}
.vs{display:grid;grid-template-columns:1fr 1fr;gap:0;position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--line)}
.side{padding:16px 18px 14px}
.side.w{background:linear-gradient(180deg,rgba(255,138,91,.20),rgba(255,138,91,.06))}
.side.d{background:linear-gradient(180deg,rgba(64,201,184,.20),rgba(64,201,184,.06))}
.side h3{font:700 22px/1 "Playfair Display";display:flex;align-items:center;gap:9px;margin-bottom:8px}
.side.w h3{color:#FF9D76}.side.d h3{color:#7FE0D2}
.side.w{--rc:#FF9D76}.side.d{--rc:#7FE0D2}
.side li{font-size:14.8px}
.vsb{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:46px;height:46px;border-radius:50%;background:#141A2E;border:2px solid #F2B84B;color:#F2B84B;display:grid;place-items:center;font:italic 700 17px "Lora";z-index:3}
.ninety{display:flex;align-items:center;gap:18px;background:linear-gradient(100deg,#1F2850,#2B2466);border:1px solid var(--line);border-radius:18px;padding:14px 20px}
.ninety .big{color:#F2B84B;font-size:76px}
.ninety p{font-size:16.5px;line-height:1.35;color:#E9ECF7}
.meter{height:10px;border-radius:999px;background:rgba(255,255,255,.14);margin-top:9px;overflow:hidden}.meter i{display:block;height:100%;width:90%;border-radius:999px;background:linear-gradient(90deg,#FF8A5B,#F2B84B)}
</style>
<div class="card c1">
<svg class="hero" width="270" height="210" viewBox="0 0 270 210">
 <circle cx="170" cy="92" r="88" fill="#2A3470" opacity=".55"/><circle cx="236" cy="30" r="20" fill="#F2B84B"/>
 <g transform="translate(62 44)">
  <rect x="14" y="0" width="150" height="100" rx="10" fill="#0C1022" stroke="#8C97C9" stroke-width="3"/>
  <rect x="24" y="10" width="130" height="80" rx="4" fill="#1D2650"/>
  <rect x="24" y="10" width="130" height="14" rx="4" fill="#2B3670"/><circle cx="32" cy="17" r="2.6" fill="#FF8A5B"/><circle cx="41" cy="17" r="2.6" fill="#F2B84B"/><circle cx="50" cy="17" r="2.6" fill="#40C9B8"/>
  <path d="M66 42 50 56l16 14M112 42l16 14-16 14M96 36 82 78" fill="none" stroke="#FF8A5B" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M0 106h178l-12 14H12z" fill="#8C97C9"/><rect x="70" y="109" width="38" height="4" rx="2" fill="#141A2E" opacity=".5"/>
 </g>
 <g transform="translate(206 112)"><rect x="-22" y="-16" width="44" height="34" rx="10" fill="#F4F1EA"/><circle cx="-8" cy="0" r="4" fill="#141A2E"/><circle cx="8" cy="0" r="4" fill="#141A2E"/><path d="M0-16v-9" stroke="#F4F1EA" stroke-width="3"/><circle cx="0" cy="-28" r="4.5" fill="#40C9B8"/><path d="M-7 9q7 5 14 0" fill="none" stroke="#141A2E" stroke-width="2.4" stroke-linecap="round"/></g>
 <path d="M40 30l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#F2B84B" opacity=".9"/>
</svg>
<div class="head"><span class="kick"><b>★ Pick of the day</b> Coding and AI · Opinion</span>
<h1>The end of <em>programmers</em>, not programming</h1></div>
<div class="vs"><span class="vsb">vs</span>
 <div class="side w"><h3>${ic('warn')}The worry</h3>${rows([['bot', 'Coders become operators who prompt agents'], ['clock', 'The deep focus of coding fades'], ['down', 'Han says his own skills slipped fast']])}</div>
 <div class="side d"><h3>${ic('shield')}The defence</h3>${rows([['saw', 'A table saw still needs a carpenter (Willison)'], ['up', 'Code has always climbed abstraction, bytes to Python'], ['chat', 'AI takes tasks unfit for human brains']])}</div>
</div>
<div class="ninety"><span class="big">90%+</span><div><p>of code at some firms is now written with AI, per reports Han cites</p><div class="meter"><i></i></div></div></div>
${foot('The paid skill shifts from writing code to specifying and judging it.', 'Juniors may lose the practice that builds judgment, or find new paths up.', 'Sheon Han, Wired, 23 Nov 2026.')}
</div>`;

/* ---------- 2. HDFC: India, green, layered diagram ---------- */
const hdfc = `
<style>
.c2{--bg:#F3F8F1;--hl:#1E7A46;--tk:#12372A;--os:#FFF1DC;--osk:#A85B00;--kb:#1E7A46;--kbc:#fff}
.zone{border-radius:18px;padding:14px 16px;position:relative}
.out{background:#FDECE8;border:2px dashed #D9553F}.out h3{color:#B93A26;display:flex;gap:9px;align-items:center;margin-bottom:6px}.out .ic{width:24px;height:24px}
.wall{background:#1E7A46;color:#fff;display:flex;gap:12px;align-items:center;padding:13px 16px;border-radius:14px;margin:-4px 14px;position:relative;z-index:2;
 background-image:linear-gradient(#1E7A46,#1E7A46),repeating-linear-gradient(90deg,rgba(255,255,255,.14) 0 2px,transparent 2px 46px);box-shadow:0 6px 0 #155C34}
.wall .ic{width:30px;height:30px}.wall p{font-size:14.8px}.wall b{font-weight:700}
.in{background:#DDF0DC;border:2px solid #1E7A46;padding-top:20px}.in h3{color:#155C34;margin-bottom:10px}
.jewels{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.jewels div{background:#fff;border-radius:12px;padding:10px 12px;display:flex;gap:10px;align-items:center;font:600 15px/1.2 "Poppins";box-shadow:0 2px 0 rgba(30,122,70,.18)}
.jewels .ic{color:#1E7A46;width:24px;height:24px}
.mv{display:flex;gap:10px;align-items:flex-start;margin-top:12px;font-size:14.8px;line-height:1.4}.mv .ic{color:#1E7A46;margin-top:1px}
.pct{display:flex;align-items:center;gap:16px;margin-top:10px;border-top:1px solid rgba(30,122,70,.3);padding-top:10px}.pct p{font-size:16px;line-height:1.3}
.arrow{position:absolute;left:50%;top:-15px;transform:translateX(-50%);z-index:3}
</style>
<div class="card c2">
<svg class="hero" width="260" height="200" viewBox="0 0 260 200">
 <circle cx="150" cy="84" r="86" fill="#D5ECD3"/><circle cx="232" cy="34" r="17" fill="#F2B84B"/>
 <g transform="translate(62 28)">
  <path d="M0 52 84 6l84 46z" fill="#1E7A46"/><path d="M26 46 84 15l58 31z" fill="#F3F8F1"/><circle cx="84" cy="36" r="7" fill="#1E7A46"/>
  <rect x="2" y="52" width="164" height="10" fill="#155C34"/>
  <g fill="#fff" stroke="#1E7A46" stroke-width="2.5"><rect x="14" y="64" width="20" height="58"/><rect x="50" y="64" width="20" height="58"/><rect x="98" y="64" width="20" height="58"/><rect x="134" y="64" width="20" height="58"/></g>
  <rect x="72" y="84" width="24" height="38" rx="12" fill="#12372A"/>
  <rect x="-2" y="122" width="172" height="10" fill="#155C34"/><rect x="-12" y="132" width="192" height="10" rx="2" fill="#1E7A46"/>
 </g>
 <g transform="translate(70 118)"><path d="M0-26 22-18v16c0 13-9 21-22 25-13-4-22-12-22-25v-16z" fill="#F2B84B" stroke="#fff" stroke-width="3"/><path d="m-9-3 6 7 12-13" fill="none" stroke="#12372A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>
</svg>
<div class="head"><span class="kick"><b>India</b> Banking tech</span>
<h1>HDFC Bank <em>brings its apps home</em></h1></div>
<div class="zone out"><h3 class="h3">${ic('warn')}Outside: the risk</h3><p>Attacks via fintechs, NBFCs and payment APIs. NBFCs lost over ₹300 crore in three months; about 20 institutions were hit in October.</p></div>
<div class="wall">${ic('shield')}<p><b>The wall:</b> stronger API authentication, certificate management and monitoring of partner links</p></div>
<div class="zone in" style="margin-top:-4px"><h3 class="h3">Inside: the crown jewels</h3>
 <div class="jewels"><div>${ic('phone')}Mobile banking</div><div>${ic('card')}Net banking</div><div>${ic('layers')}Core payments</div><div>${ic('plug')}API management</div></div>
 <p class="mv">${ic('gear')}<span><b style="font-weight:600">Moving in:</b> MyCards, OnlyCards, PayZapp. BizX shut and folded in.</span></p>
 <div class="pct"><span class="big">60-70%</span><p>of key apps built in-house within a few years</p></div>
</div>
${foot('Control over code is becoming a security choice, not just a cost one.', 'In-house tech has failed too, and it is slower and dearer. Tighter partner checks may be enough.', 'The Economic Times, 27 Nov 2026.')}
</div>`;

/* ---------- 3. Bank of England: World, blue, timeline ---------- */
const tl = [['Spring', 'New AI models take even their makers by surprise, Bailey says'], ['Last week', 'An Anthropic employee says Claude proved the Riemann hypothesis'], ['Wednesday', 'Scott Aaronson: labs likely hold results that break encryption'], ['Thursday', 'BoE tells firms, for the first time, to prioritise cryptography upgrades'], ['After 2030', 'When banks had planned their switch, on a quantum timetable']];
const boe = `
<style>
.c3{--bg:#EEF3FB;--hl:#1F4FB5;--tk:#14254F;--os:#FFF3D6;--osk:#8A5A00;--kb:#1F4FB5;--kbc:#fff;background:linear-gradient(180deg,#E3ECFA 0,#EEF3FB 230px)}
.tl{position:relative;padding:4px 0 2px 0;display:flex;flex-direction:column;gap:0}
.tl:before{content:"";position:absolute;left:21px;top:22px;bottom:64px;width:4px;border-radius:2px;background:linear-gradient(180deg,#9DB5E8,#1F4FB5)}
.tl:after{content:"";position:absolute;left:21px;bottom:22px;height:44px;width:0;border-left:4px dashed #E0A21F}
.step{display:grid;grid-template-columns:46px 1fr;gap:12px;align-items:center;padding:6px 0;position:relative;z-index:1}
.dot{width:46px;height:46px;border-radius:50%;background:#fff;border:4px solid #1F4FB5;display:grid;place-items:center;font:800 18px "Playfair Display";color:#1F4FB5}
.step .bx{background:#fff;border:1px solid var(--line);border-radius:14px;padding:9px 14px}
.step b{display:block;font:700 12.5px/1.2 "Poppins";letter-spacing:.06em;text-transform:uppercase;color:#1F4FB5;margin-bottom:2px}
.step.now .dot{background:#1F4FB5;color:#fff}.step.now .bx{background:#1F4FB5;color:#fff;border-color:#1F4FB5}.step.now b{color:#FFD778}
.step.fut .dot{border:4px dashed #E0A21F;color:#B07A00}.step.fut .bx{border:2px dashed #E0A21F;background:#FFF9EA}.step.fut b{color:#B07A00}
.st{background:#14254F;color:#fff;border-radius:16px;padding:14px 16px}.st .big{color:#F2B84B;font-size:54px;display:block;margin-bottom:6px}.st p{font-size:14.6px;line-height:1.38;color:#DCE4F7}
</style>
<div class="card c3">
<svg class="hero" width="250" height="210" viewBox="0 0 250 210">
 <defs><linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD778"/><stop offset="1" stop-color="#E09A12"/></linearGradient></defs>
 <circle cx="158" cy="92" r="88" fill="#D3E0F8"/>
 <g fill="none" stroke="#1F4FB5" stroke-opacity=".22" stroke-width="2"><circle cx="158" cy="92" r="66"/><circle cx="158" cy="92" r="44" stroke-dasharray="5 7"/></g>
 <g transform="translate(108 30)">
  <path d="M22 62V38a28 28 0 0 1 56 0v24" fill="none" stroke="#6E7FA8" stroke-width="13" stroke-linecap="round"/>
  <path d="M22 62V38a28 28 0 0 1 56 0v24" fill="none" stroke="#C7D2EC" stroke-width="5" stroke-linecap="round"/>
  <rect x="0" y="58" width="100" height="84" rx="14" fill="url(#gl)" stroke="#B07A00" stroke-width="3"/>
  <rect x="8" y="66" width="84" height="10" rx="5" fill="#fff" opacity=".35"/>
  <circle cx="50" cy="94" r="11" fill="#14254F"/><path d="M45 98h10l3 24H42z" fill="#14254F"/>
 </g>
 <g fill="#1F4FB5" font-family="JetBrains Mono,monospace" font-weight="700" font-size="13" opacity=".55"><text x="70" y="52">∑</text><text x="222" y="150">π</text><text x="60" y="150">01</text></g>
 <path d="M228 44l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#F2B84B"/>
</svg>
<div class="head"><span class="kick"><b>World</b> AI and encryption</span>
<h1>The Bank of England <em>wants new locks</em></h1></div>
<div class="tl">${tl.map(([w, t], i) => `<div class="step${i === 3 ? ' now' : ''}${i === 4 ? ' fut' : ''}"><span class="dot">${i === 4 ? '?' : i + 1}</span><div class="bx"><b>${w}</b><p>${t}</p></div></div>`).join('')}</div>
<div class="two"><div class="st"><span class="big">No</span><p>AI firm has published proof that encryption can be cracked</p></div><div class="st"><span class="big">2030</span><p>Banks' upgrade plans start after this; AI may not wait</p></div></div>
${foot('Find every place old codes are used, map what depends on them and plan the switch now.', 'Experts say the public breakthroughs pose no immediate threat. A warning is not proof a code has broken.', 'Financial Times, 26 Nov 2026; Bank of England Financial Stability Report.')}
</div>`;

/* ---------- 4. Aaronson: World, amber, picture tiles ---------- */
const tiles = [['grid', 'Matrix maths', 'OpenAI claims the exponent is exactly 9/4, matching its October upper bound', '#C2410C', '#FFE9D6'], ['wave', 'Fourier transform', 'OpenAI preprint: a faster gate bound, with a matching lower bound', '#0E7C6B', '#D9F3EC'], ['atom', 'QIP(2) = PSPACE', "Yupan Liu's preprint on quantum proofs, made with AI help", '#5B3FC4', '#E8E1FF'], ['search', 'Riemann hypothesis', "A proof claim from Anthropic's side, checked with Lean", '#B4236A', '#FFE0EE']];
const aar = `
<style>
.c4 h1{max-width:400px;font-size:40px}
.c4{--bg:#FFF8EA;--hl:#C2410C;--tk:#3B1F0B;--os:#E7EEF9;--osk:#1F4FB5;--kb:#C2410C;--kbc:#fff}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.tile{background:#fff;border-radius:16px;padding:14px 15px 15px;border:1px solid var(--line);border-top:6px solid var(--c);position:relative}
.tile .bd{width:44px;height:44px;border-radius:12px;background:var(--t);color:var(--c);display:grid;place-items:center;margin-bottom:9px}.tile .bd .ic{width:26px;height:26px}
.tile h3{font:700 19.5px/1.12 "Playfair Display";margin-bottom:5px}.tile p{font-size:14.4px;line-height:1.4}
.tile .n{position:absolute;right:13px;top:10px;font:800 30px "Playfair Display";color:var(--t)}
.care{display:flex;gap:12px;align-items:flex-start;background:#FFE9A8;border-left:7px solid #D99A00;border-radius:12px;padding:12px 15px}.care .ic{color:#8A5A00;width:24px;height:24px;margin-top:1px}.care p{font-size:14.6px}.care b{font-weight:700}
</style>
<div class="card c4">
<svg class="hero" width="260" height="200" viewBox="0 0 260 200">
 <circle cx="170" cy="86" r="86" fill="#FFE7BD"/><circle cx="234" cy="30" r="16" fill="#F2B84B"/>
 <g transform="translate(74 118)"><rect x="6" y="20" width="150" height="16" rx="3" fill="#1F4FB5"/><rect x="12" y="23" width="138" height="5" fill="#fff" opacity=".7"/><rect x="18" y="4" width="136" height="16" rx="3" fill="#0E7C6B"/><rect x="24" y="7" width="124" height="5" fill="#fff" opacity=".7"/></g>
 <g transform="translate(82 30) rotate(-5 80 50)">
  <path d="M80 18C62 4 34 2 6 8v78c28-6 56-4 74 10 18-14 46-16 74-10V8c-28-6-56-4-74 10z" fill="#fff" stroke="#3B1F0B" stroke-width="3" stroke-linejoin="round"/>
  <path d="M80 18v78" stroke="#3B1F0B" stroke-width="3"/>
  <g stroke="#C9B79A" stroke-width="3" stroke-linecap="round"><path d="M18 24c16-2 34-1 50 6M18 38c16-2 34-1 50 6M18 52c16-2 34-1 50 6M92 30c16-7 34-8 50-6M92 44c16-7 34-8 50-6"/></g>
  <text x="117" y="78" text-anchor="middle" font-family="Playfair Display,serif" font-weight="800" font-size="19" fill="#C2410C">P ≠ NP</text>
  <path d="M130 2v30l8-7 8 7V2z" fill="#C2410C"/>
 </g>
</svg>
<div class="head"><span class="kick"><b>World</b> AI and maths · Opinion</span>
<h1>Aaronson: the proofs are <em>piling up</em></h1></div>
<div class="tiles">${tiles.map(([i, h, t, c, tt], k) => `<div class="tile" style="--c:${c};--t:${tt}"><span class="n">${k + 1}</span><div class="bd">${ic(i)}</div><h3>${h}</h3><p>${t}</p></div>`).join('')}</div>
<div class="care">${ic('book')}<p><b>Read with care:</b> Aaronson says he is virtually certain labs hold code-breaking results, but his details are secondhand and unverified.</p></div>
${foot('He now expects a P ≠ NP proof is not far off. Hard maths is no longer a safe moat.', 'Understanding these proofs may take years, and he concedes results like Riemann barely touch daily life.', 'Scott Aaronson, Shtetl-Optimized, 25 Nov 2026.')}
</div>`;

/* ---------- 5. Guardian: World, plum, one big line ---------- */
const guard = `
<style>
.c5{--bg:#FBF1F3;--hl:#B4234F;--tk:#3A1230;--os:#E6F1EE;--osk:#1F6F6A;--kb:#B4234F;--kbc:#fff}
.quote{background:linear-gradient(120deg,#3A1230,#6B1F4A);color:#fff;border-radius:20px;padding:22px 24px 18px;position:relative;overflow:hidden}
.quote:before{content:"“";position:absolute;right:14px;top:-34px;font:800 190px "Playfair Display";color:rgba(255,255,255,.10)}
.quote q{display:block;quotes:none;font:italic 600 31px/1.2 "Lora",Georgia,serif;position:relative}
.quote span{display:inline-block;margin-top:12px;font-size:13px;color:#F5C9D9;background:rgba(255,255,255,.12);padding:5px 11px;border-radius:999px}
.c5 .pan h3{display:flex;gap:9px;align-items:center;margin-bottom:6px}
.pa{background:#FFF4DF;border-color:#EBCF9A}.pa h3{color:#9A5B00}.pa{--rc:#9A5B00}
.pb{background:#FFE4E4;border-color:#EDB1B1}.pb h3{color:#B4234F}.pb{--rc:#B4234F}
.speed{height:26px;border-radius:999px;background:repeating-linear-gradient(110deg,#B4234F 0 18px,#3A1230 18px 36px);position:relative;opacity:.9}
</style>
<div class="card c5">
<svg class="hero" width="250" height="200" viewBox="0 0 250 200">
 <circle cx="166" cy="88" r="86" fill="#F6D5DF"/><circle cx="228" cy="30" r="16" fill="#F2B84B"/>
 <g stroke="#B4234F" stroke-width="5" stroke-linecap="round" opacity=".45"><path d="M40 70h44M26 96h50M44 122h36"/></g>
 <g transform="translate(166 92) rotate(8)">
  <path d="M0-66 52-48v40c0 34-22 54-52 66-30-12-52-32-52-66v-40z" fill="#3A1230"/>
  <path d="M0-54 41-40v32c0 27-17 43-41 53-24-10-41-26-41-53v-32z" fill="#F2B84B"/>
  <rect x="-26" y="-26" width="52" height="40" rx="12" fill="#3A1230"/><circle cx="-11" cy="-8" r="6" fill="#FF6B6B"/><circle cx="11" cy="-8" r="6" fill="#FF6B6B"/>
  <path d="M-10 6h20" stroke="#F2B84B" stroke-width="3" stroke-linecap="round"/><path d="M0-26v-10" stroke="#3A1230" stroke-width="4"/><circle cx="0" cy="-39" r="5" fill="#B4234F"/>
  <path d="M6 18 -8 34h12l-8 14" fill="none" stroke="#B4234F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
 </g>
</svg>
<div class="head"><span class="kick"><b>World</b> AI safety · Opinion</span>
<h1>Big tech is <em>taking the brakes off</em></h1></div>
<div class="quote"><q>Ethical hesitation is now treated as a luxury the race can't afford.</q><span>An anonymous senior AI leader's argument, paraphrased</span></div>
<div class="two">
 <div class="pan pa"><h3>${ic('people')}Who gets cut</h3>${rows([['person', 'Trust, safety and privacy staff slimmed down or sidelined'], ['down', 'A 15-year drift that has recently sped up']])}</div>
 <div class="pan pb"><h3>${ic('ban')}What gets skipped</h3>${rows([['scales', 'Legal concerns left until after launch'], ['up', 'A bet that the next big win lifts the stock']])}</div>
</div>
${foot('The checks are thinning just as models get most powerful. Expect regulators to fill the gap.', 'One unnamed insider, no documents or figures. Firms say safety is being built into products.', 'The Guardian, anonymous column, 26 Nov 2026.')}
</div>`;

/* ---------- 6. OpenRouter: World, violet, chart first ---------- */
const vals = [['Q1', 5.4], ['Q2', 5.5], ['Q3', 1.6], ['Q4*', 1.2]];
const U = 34; // px per unit of elasticity, bars to scale from zero
const chart = `<svg viewBox="0 0 560 262" width="100%" role="img">
 <g font-family="Poppins" font-size="12" fill="#7A7694">${[0, 1, 2, 3, 4, 5].map((v) => `<text x="22" y="${224 - v * U + 4}" text-anchor="end">${v}</text><path d="M32 ${224 - v * U}H548" stroke="rgba(27,26,51,.09)"/>`).join('')}</g>
 ${vals.map(([q, v], i) => { const x = 70 + i * 122, h = v * U, hi = i === 3; return `<rect x="${x}" y="${224 - h}" width="76" height="${h}" rx="8" fill="${hi ? '#5B3FC4' : '#C9BDF2'}"/><rect x="${x}" y="${224 - Math.min(h, 10)}" width="76" height="${Math.min(h, 10)}" fill="${hi ? '#5B3FC4' : '#C9BDF2'}"/><text x="${x + 38}" y="${224 - h - 9}" text-anchor="middle" font-family="Playfair Display" font-weight="800" font-size="${hi ? 30 : 25}" fill="${hi ? '#5B3FC4' : '#1B1A33'}">${v}</text><text x="${x + 38}" y="246" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="14" fill="#1B1A33">${q}</text>`; }).join('')}
 <path d="M32 224H548" stroke="#1B1A33" stroke-width="2"/>
 <path d="M32 ${224 - U}H548" stroke="#C0392B" stroke-width="2.5" stroke-dasharray="8 6"/>
 <path d="M372 14h34" stroke="#C0392B" stroke-width="2.5" stroke-dasharray="8 6"/><text x="414" y="18" font-family="Poppins" font-weight="600" font-size="12.5" fill="#C0392B">1 = spend stays flat</text>
</svg>`;
const orr = `
<style>
.c6{--bg:#F6F3FF;--hl:#5B3FC4;--tk:#22184F;--os:#FFF1DC;--osk:#A85B00;--kb:#5B3FC4;--kbc:#fff}
.ch h3{margin-bottom:4px}.ch .note{font-size:12.8px;line-height:1.4;color:var(--mut);margin-top:4px}
.three{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.three div{border-radius:16px;padding:13px 14px;color:#fff}
.three b{display:block;font:800 40px/1 "Playfair Display";letter-spacing:-.5px}.three span{display:flex;gap:6px;align-items:center;font-size:14px;margin-top:7px}
.three .ic{width:18px;height:18px}
</style>
<div class="card c6">
<svg class="hero" width="250" height="200" viewBox="0 0 250 200">
 <defs><linearGradient id="gc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E09A12"/><stop offset=".5" stop-color="#FFD778"/><stop offset="1" stop-color="#E09A12"/></linearGradient></defs>
 <circle cx="166" cy="88" r="86" fill="#E2DAFB"/>
 ${[[112, 132, 3], [176, 132, 5]].map(([cx, by, n]) => Array.from({ length: n }, (_, k) => { const y = by - k * 15; return `<path d="M${cx - 36} ${y}v12a36 11 0 0 0 72 0v-12z" fill="url(#gc)" stroke="#B07A00" stroke-width="2"/><ellipse cx="${cx}" cy="${y}" rx="36" ry="11" fill="#FFE39A" stroke="#B07A00" stroke-width="2"/>`; }).join('')).join('')}
 <ellipse cx="176" cy="72" rx="24" ry="6.5" fill="none" stroke="#B07A00" stroke-width="1.6"/>
 <path d="M72 46c40 4 70 22 104 58" fill="none" stroke="#5B3FC4" stroke-width="5" stroke-linecap="round"/><path d="M180 84v22h-22" fill="none" stroke="#5B3FC4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M224 36l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#F2B84B"/>
</svg>
<div class="head"><span class="kick"><b>World</b> AI pricing</span>
<h1>Cheaper tokens, <em>flat budgets</em></h1></div>
<div class="pan ch"><h3>Price elasticity of AI tokens, 2026</h3>${chart}<p class="note">*Q4 through 16 Nov. Dashed line at 1: spend stays flat. Above it, cheaper tokens raise total spend. Bars drawn to scale.</p></div>
<div class="three"><div style="background:#5B3FC4"><b>44x</b><span>${ic('up')}paid tokens</span></div><div style="background:#22184F"><b>7.6x</b><span>${ic('cash')}total spend</span></div><div style="background:#B4234F"><b>-83%</b><span>${ic('down')}price per token</span></div></div>
${foot('Buyers are now pocketing price cuts instead of spending more. Watch revenue, not usage.', 'Elasticity dipped near 1 twice before and recovered with new launches. One platform is not the market.', 'OpenRouter, paid usage, 26 Nov 2026.')}
</div>`;

/* ---------- 7. WSJ: World, sunset scene, classic with a big number ---------- */
const wsj = `
<style>
.c7{--bg:#FFF6EA;--hl:#C0392B;--tk:#33203A;--os:#E3EEE6;--osk:#2B6B45;padding-top:0}
.scene{margin:0 -28px;height:292px;position:relative}
.scene svg{position:absolute;inset:0;width:100%;height:100%}
.scene .tx{position:absolute;left:28px;top:26px;right:200px;display:flex;flex-direction:column;gap:12px}
.c7 .kick b{background:#33203A;color:#fff}.c7 .kick{color:#4A2B3F}
.c7 h1{max-width:400px;font-size:45px}
.eighty{display:flex;align-items:center;gap:18px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:12px 20px;margin-top:-52px;position:relative;z-index:3;box-shadow:0 10px 24px rgba(90,40,20,.14)}
.eighty .big{font-size:84px}.eighty p{font-size:17px;line-height:1.35}
.c7 .pan h3{margin-bottom:6px}
.ca{background:#FFF0D2;border-color:#EBCF9A}.ca h3{color:#9A5B00}.ca{--rc:#9A5B00}
.cb{background:#FFE3DC;border-color:#EDB7A8}.cb h3{color:#C0392B}.cb{--rc:#C0392B}
</style>
<div class="card c7">
<div class="scene">
<svg viewBox="0 0 640 292" preserveAspectRatio="xMidYMid slice">
 <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9C7"/><stop offset=".55" stop-color="#FFC98A"/><stop offset="1" stop-color="#F59A6A"/></linearGradient>
 <linearGradient id="wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7B27C"/><stop offset="1" stop-color="#FFF6EA"/></linearGradient>
 <radialGradient id="glow"><stop offset="0" stop-color="#FFF3C4" stop-opacity=".95"/><stop offset="1" stop-color="#FFF3C4" stop-opacity="0"/></radialGradient></defs>
 <rect width="640" height="292" fill="url(#sky)"/>
 <circle cx="430" cy="176" r="120" fill="url(#glow)"/><circle cx="430" cy="176" r="42" fill="#FFF1B8"/>
 <path d="M0 190c70-34 130-38 200-14 60-36 130-44 210-10 70-30 150-24 230 14v40H0z" fill="#D9825E" opacity=".55"/>
 <path d="M0 204c90-22 170-20 250 0 90-24 230-22 390 6v30H0z" fill="#B8604A" opacity=".6"/>
 <rect y="216" width="640" height="76" fill="url(#wat)"/>
 <g stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"><path d="M400 228h60M386 240h88M410 252h40"/></g>
 <path d="M0 262c120-22 260-20 420-4 90 8 160 6 220-4v38H0z" fill="#FFF6EA"/>
 <path d="M300 252c110-14 230-12 340 2v20H300z" fill="#6E8B4E" opacity=".55"/>
 <g transform="translate(548 60)"><path d="M10 196c4-60-2-100-14-140" fill="none" stroke="#4A2B25" stroke-width="13" stroke-linecap="round"/><path d="M4 110c18-10 30-26 36-46M-2 92c-18-8-30-22-38-40" fill="none" stroke="#4A2B25" stroke-width="7" stroke-linecap="round"/>
  <g fill="#D9562B"><circle cx="-8" cy="26" r="46"/><circle cx="46" cy="40" r="38"/><circle cx="-52" cy="50" r="32"/></g><g fill="#F08A3C"><circle cx="-24" cy="8" r="30"/><circle cx="30" cy="16" r="28"/><circle cx="62" cy="58" r="20"/></g><g fill="#F7B955"><circle cx="2" cy="-4" r="18"/><circle cx="-50" cy="34" r="14"/></g></g>
 <g transform="translate(404 214)" fill="none" stroke="#33203A" stroke-linecap="round"><path d="M0 22h96M4 8h88M4-4h88" stroke-width="7"/><path d="M10 22v22M86 22v22M8-8v30M88-8v30" stroke-width="6"/></g>
 <g fill="#C0392B"><path d="M330 268l6-4 5 5-7 2z"/><path d="M372 276l6-3 4 5-7 2z"/></g><path d="M250 268l7-3 3 6-7 1z" fill="#F08A3C"/>
</svg>
<div class="tx"><span class="kick"><b>World</b> Retirement · Opinion</span><h1>The right age to retire? <em>Never</em></h1></div>
</div>
<div class="eighty"><span class="big">82</span><p>Alicia Munnell's age when she retired, a move she now regrets</p></div>
<div class="two">
 <div class="pan ca"><h3>Carstensen says</h3>${rows([['person', 'Age is a poor guide to ability'], ['compass', 'Her advice on when to retire: never'], ['columns', 'Raise the Social Security age, means-test it']])}</div>
 <div class="pan cb"><h3>The cost of stopping</h3>${rows([['brain', 'Long retirements hurt minds and money'], ['cash', 'Her household gets $100k a year in benefits'], ['people', "Munnell is puzzled by France's protests"]])}</div>
</div>
${foot('Plan for several retirement ages, and count later-life work as real income.', "Manual workers, carers and the unwell often can't work longer. That is why the age is contested.", 'Joel Stein, The Wall Street Journal, 26 Nov 2026.')}
</div>`;

const cards = { 1: wired, 2: hdfc, 3: boe, 4: aar, 5: guard, 6: orr, 7: wsj };
(async () => {
  const only = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 640, height: 900 }, deviceScaleFactor: 2 });
  for (const [n, html] of Object.entries(cards)) {
    if (only && only !== n) continue;
    await p.setContent(`<!doctype html><meta charset="utf-8"><style>${css}</style>${html}`);
    await p.evaluate(() => document.fonts.ready);
    const el = await p.$('.card');
    const over = await p.evaluate(() => [...document.querySelectorAll('.card *')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible' && !e.closest('svg')).map((e) => e.className).slice(0, 5));
    const box = await el.boundingBox();
    await el.screenshot({ path: path.join(OUT, `${n}.png`) });
    console.log(n, Math.round(box.width * 2) + 'x' + Math.round(box.height * 2), over.length ? 'OVERFLOW ' + over : '');
  }
  await b.close();
})();
