// Illustrated masthead for the About page: South India on the left
// (Charminar, a hill fort, a temple gopuram, coconut palms) and Southern
// California on the right (downtown LA, Santa Monica pier, beach, fan palms),
// joined by a flight path across a shared sunset.
//
// Drawn in a 1200×400 box. On narrow screens the sides are cropped, so the
// key landmarks sit between x≈180 and x≈1020.

const INK = "#2b1a4f";
const MID = "#4a2d7a";
const FAR = "#8a4f86";

function CoconutPalm({ x, y, h, lean }: { x: number; y: number; h: number; lean: number }) {
  const cx = x + lean;
  const cy = y - h;
  const fronds = [-170, -140, -110, -70, -40, -10];
  return (
    <g stroke={INK} fill="none" strokeLinecap="round">
      <path d={`M${x} ${y} Q${x + lean * 0.2} ${y - h * 0.55} ${cx} ${cy}`} strokeWidth={6} />
      {fronds.map((a) => {
        const r = (a * Math.PI) / 180;
        const L = 40;
        const ex = cx + Math.cos(r) * L;
        const ey = cy + Math.sin(r) * L * 0.55 + 16;
        const mx = cx + Math.cos(r) * L * 0.55;
        const my = cy + Math.sin(r) * L * 0.6 - 10;
        return <path key={a} d={`M${cx} ${cy} Q${mx} ${my} ${ex} ${ey}`} strokeWidth={4.5} />;
      })}
      <circle cx={cx} cy={cy + 3} r={4} fill={INK} stroke="none" />
    </g>
  );
}

function FanPalm({ x, y, h }: { x: number; y: number; h: number }) {
  const cy = y - h;
  const fronds = [-165, -135, -105, -75, -45, -15];
  return (
    <g stroke={INK} fill="none" strokeLinecap="round">
      <path d={`M${x} ${y} Q${x + 3} ${y - h / 2} ${x} ${cy}`} strokeWidth={3} />
      <path d={`M${x - 4} ${cy + 4} Q${x} ${cy + 14} ${x + 4} ${cy + 4}`} strokeWidth={6} />
      {fronds.map((a) => {
        const r = (a * Math.PI) / 180;
        const ex = x + Math.cos(r) * 22;
        const ey = cy + Math.sin(r) * 12 + 8;
        return (
          <path key={a} d={`M${x} ${cy} Q${x + Math.cos(r) * 14} ${cy + Math.sin(r) * 14} ${ex} ${ey}`} strokeWidth={3} />
        );
      })}
    </g>
  );
}

function Minaret({ x }: { x: number }) {
  // x is the left edge; minaret is 14 wide, base at y=330
  return (
    <g fill={INK}>
      <rect x={x} y={172} width={14} height={158} />
      {[252, 216, 188].map((by) => (
        <rect key={by} x={x - 3} y={by} width={20} height={4} rx={1} />
      ))}
      <path d={`M${x} 172 Q${x - 1} 156 ${x + 7} 147 Q${x + 15} 156 ${x + 14} 172 Z`} />
      <rect x={x + 6} y={136} width={2} height={12} />
    </g>
  );
}

function Charminar() {
  const arches = [306, 324, 342, 360, 378];
  return (
    <g>
      <Minaret x={292} />
      <Minaret x={394} />
      <g fill={INK}>
        <rect x={300} y={248} width={100} height={82} />
        <rect x={296} y={240} width={108} height={9} />
        <rect x={302} y={222} width={96} height={18} />
        <rect x={298} y={217} width={104} height={6} />
        <path d="M334 217 Q350 196 366 217 Z" />
      </g>
      <path d="M330 330 V290 Q350 258 370 290 V330 Z" fill="url(#mh-sky)" />
      {arches.map((ax) => (
        <path key={ax} d={`M${ax} 240 V230 Q${ax + 6} 224 ${ax + 12} 230 V240 Z`} fill="url(#mh-sky)" opacity={0.85} />
      ))}
    </g>
  );
}

function Gopuram() {
  const tiers = Array.from({ length: 7 }, (_, i) => i);
  const baseY = 292;
  const step = 13;
  return (
    <g>
      <path d="M428 330 L433 292 L497 292 L502 330 Z" fill={MID} />
      {tiers.map((i) => {
        const y = baseY - i * step;
        const inset = 4 + i * 4;
        return (
          <path
            key={i}
            d={`M${430 + inset - 4} ${y} L${430 + inset} ${y - step} L${500 - inset} ${y - step} L${500 - inset + 4} ${y} Z`}
            fill={MID}
          />
        );
      })}
      {tiers.map((i) => (
        <line
          key={i}
          x1={432 + i * 4}
          x2={498 - i * 4}
          y1={baseY - i * step}
          y2={baseY - i * step}
          stroke="#ffd5a5"
          strokeOpacity={0.3}
          strokeWidth={1.2}
        />
      ))}
      <path d="M453 201 Q465 188 477 201 Z" fill={MID} />
      {[456, 465, 474].map((kx) => (
        <path key={kx} d={`M${kx - 2} 196 Q${kx} 186 ${kx + 2} 196 Z`} fill={MID} />
      ))}
      <path d="M458 330 V312 Q465 302 472 312 V330 Z" fill="url(#mh-sky)" opacity={0.9} />
    </g>
  );
}

function Fort() {
  // Hill-top fort walls in the distance, Golconda-style
  const merlons = Array.from({ length: 14 }, (_, i) => 150 + i * 12);
  return (
    <g fill={FAR} opacity={0.75}>
      <path d="M90 330 Q150 262 230 252 Q300 246 350 262 Q420 284 470 330 Z" />
      <rect x={150} y={236} width={168} height={22} />
      {merlons.map((mx) => (
        <rect key={mx} x={mx} y={230} width={6} height={7} />
      ))}
      <path d="M170 258 V222 Q181 210 192 222 V258 Z" />
      <path d="M244 254 V214 Q256 200 268 214 V254 Z" />
      <path d="M296 256 V226 Q306 216 316 226 V256 Z" />
    </g>
  );
}

function SmallTemple() {
  return (
    <g fill={MID}>
      <rect x={58} y={300} width={92} height={30} />
      <rect x={52} y={294} width={104} height={7} />
      <path d="M78 294 L104 238 L130 294 Z" />
      <path d="M100 240 Q104 228 108 240 Z" />
      {[70, 86, 120, 136].map((px) => (
        <rect key={px} x={px} y={304} width={4} height={26} fill="url(#mh-sky)" opacity={0.6} />
      ))}
    </g>
  );
}

function Skyline() {
  const blocks: [number, number, number][] = [
    [698, 24, 70],
    [724, 18, 96],
    [744, 26, 122],
    [842, 20, 132],
    [864, 24, 104],
    [890, 16, 82],
    [908, 20, 60],
  ];
  return (
    <g>
      <g fill={MID}>
        {blocks.map(([x, w, h]) => (
          <rect key={x} x={x} y={318 - h} width={w} height={h} />
        ))}
        {/* US Bank Tower: cylinder with stepped crown */}
        <rect x={772} y={142} width={32} height={176} rx={6} />
        <rect x={775} y={134} width={26} height={9} rx={2} />
        <rect x={779} y={127} width={18} height={8} rx={2} />
        <rect x={783} y={120} width={10} height={8} rx={2} />
        {/* Wilshire Grand: sail roof and spire */}
        <path d="M808 318 V140 L838 124 V318 Z" />
        <rect x={829} y={88} width={2.5} height={40} />
      </g>
      <g fill="url(#mh-win)" opacity={0.55}>
        {blocks.map(([x, w, h]) => (
          <rect key={x} x={x + 3} y={318 - h + 6} width={w - 6} height={h - 10} />
        ))}
        <rect x={776} y={148} width={24} height={166} />
        <rect x={812} y={146} width={22} height={168} />
      </g>
    </g>
  );
}

function Pier() {
  const cx = 985;
  const cy = 280;
  const r = 32;
  const spokes = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
  return (
    <g stroke={INK} fill="none">
      <rect x={905} y={321} width={150} height={4} fill={INK} stroke="none" />
      {Array.from({ length: 11 }, (_, i) => 910 + i * 14).map((px) => (
        <line key={px} x1={px} x2={px} y1={325} y2={346} strokeWidth={2} />
      ))}
      <circle cx={cx} cy={cy} r={r} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={r - 7} strokeWidth={1} strokeOpacity={0.6} />
      {spokes.map((a) => (
        <line key={a} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} strokeWidth={1.2} />
      ))}
      {spokes.map((a) => (
        <circle key={a} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r + 4} r={3} fill="#ef7447" stroke="none" />
      ))}
      <line x1={cx} y1={cy} x2={cx - 16} y2={321} strokeWidth={3} />
      <line x1={cx} y1={cy} x2={cx + 16} y2={321} strokeWidth={3} />
      {/* roller coaster hump */}
      <path d="M1022 321 Q1032 292 1044 306 Q1052 314 1056 321" strokeWidth={2.2} />
    </g>
  );
}

function LifeguardTower() {
  return (
    <g>
      <line x1={1124} y1={352} x2={1120} y2={372} stroke={INK} strokeWidth={2} />
      <line x1={1148} y1={352} x2={1152} y2={372} stroke={INK} strokeWidth={2} />
      <rect x={1118} y={338} width={36} height={16} rx={2} fill="#ef7447" />
      <path d="M1114 339 L1136 328 L1158 339 Z" fill="#ffd5a5" />
      <rect x={1128} y={342} width={12} height={7} fill="#2b1a4f" opacity={0.5} />
    </g>
  );
}

export default function TwoWorldsMasthead() {
  return (
    <svg
      className="mh-svg"
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="Illustration: South India, with the Charminar, a hill fort, a temple tower and coconut palms, joined by a flight path to Southern California, with downtown Los Angeles, Santa Monica pier, the beach and palm trees"
    >
      <defs>
        <linearGradient id="mh-sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1200" y2="0">
          <stop offset="0" stopColor="#ffd59a" />
          <stop offset="0.42" stopColor="#ffb07e" />
          <stop offset="0.58" stopColor="#f6928a" />
          <stop offset="1" stopColor="#b866a6" />
        </linearGradient>
        <linearGradient id="mh-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#35205f" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#35205f" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="mh-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6d6" />
          <stop offset="1" stopColor="#ffc06a" />
        </radialGradient>
        <linearGradient id="mh-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a5aa8" />
          <stop offset="1" stopColor="#35205f" />
        </linearGradient>
        <pattern id="mh-win" width="6" height="9" patternUnits="userSpaceOnUse">
          <rect x="1" y="2" width="2.4" height="3.4" fill="#ffd5a5" />
        </pattern>
      </defs>

      <rect width="1200" height="400" fill="url(#mh-sky)" />
      <rect width="1200" height="400" fill="url(#mh-dusk)" />

      {/* sun where the two worlds meet */}
      <circle cx="620" cy="300" r="150" fill="#fff2c8" opacity="0.18" />
      <circle cx="620" cy="300" r="66" fill="url(#mh-sun)" />

      {/* flight path */}
      <path d="M352 118 Q615 18 870 102" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="2" strokeDasharray="5 8" strokeLinecap="round" />
      <g transform="translate(874 104) rotate(22)" fill="#fff">
        <path d="M-12 -1.6 L10 -1.6 Q15 0 10 1.6 L-12 1.6 Z" />
        <path d="M-1 -1 L-7 -11 L-3 -11 L5 -1 Z" />
        <path d="M-1 1 L-7 11 L-3 11 L5 1 Z" />
        <path d="M-12 -1 L-15 -6 L-12.5 -6 L-9 -1 Z" />
      </g>
      <circle cx="352" cy="118" r="4" fill="#fff" />

      {/* birds */}
      <g fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity="0.6">
        <path d="M520 150 q5 -5 10 0 q5 -5 10 0" />
        <path d="M548 136 q4 -4 8 0 q4 -4 8 0" />
        <path d="M700 168 q4 -4 8 0 q4 -4 8 0" />
      </g>

      {/* labels */}
      <g fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Arial, sans-serif" fontWeight="800" fontSize="15" letterSpacing="3" fill="#fff">
        <text x="215" y="70">SOUTH INDIA</text>
        <text x="985" y="70" textAnchor="end">SOUTHERN CALIFORNIA</text>
      </g>

      {/* far hills */}
      <Fort />
      <path d="M640 318 Q760 246 900 268 Q1040 288 1200 250 V330 H640 Z" fill={FAR} opacity="0.45" />

      {/* sea */}
      <rect x="520" y="316" width="680" height="84" fill="url(#mh-sea)" />
      <g stroke="#ffe3b8" strokeLinecap="round" opacity="0.7">
        <line x1="584" x2="656" y1="326" y2="326" strokeWidth="3" />
        <line x1="594" x2="646" y1="336" y2="336" strokeWidth="2.5" />
        <line x1="604" x2="636" y1="346" y2="346" strokeWidth="2" />
        <line x1="611" x2="629" y1="356" y2="356" strokeWidth="2" />
      </g>

      {/* California side */}
      <Skyline />
      <Pier />
      <path d="M640 400 Q800 350 1200 344 V400 Z" fill="#f1b98b" />
      <path d="M660 394 Q820 352 1200 348" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />
      <path d="M700 400 Q840 362 1200 356" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
      <FanPalm x={684} y={384} h={150} />
      <FanPalm x={708} y={380} h={118} />
      <FanPalm x={1072} y={368} h={176} />
      <FanPalm x={1096} y={364} h={140} />
      <FanPalm x={1180} y={360} h={160} />
      <LifeguardTower />

      {/* India side */}
      <SmallTemple />
      <Gopuram />
      <Charminar />
      <path d="M0 330 H540 Q580 334 600 344 Q560 372 470 400 H0 Z" fill={INK} />
      <CoconutPalm x={224} y={336} h={104} lean={-14} />
      <CoconutPalm x={248} y={338} h={78} lean={10} />
      <CoconutPalm x={528} y={340} h={92} lean={16} />
      <CoconutPalm x={24} y={336} h={96} lean={8} />
    </svg>
  );
}
