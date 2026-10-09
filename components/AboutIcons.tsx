// Small illustrated icons for the About page. Each is a self-contained SVG
// on a rounded gradient tile; ids are prefixed per icon so several can share
// a page.

type Props = { className?: string };

export function SunIcon({ className }: Props) {
  const rays = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="ic-sun-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd56b" />
          <stop offset="1" stopColor="#ff7a3d" />
        </linearGradient>
        <radialGradient id="ic-sun-core" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="1" stopColor="#ffe08a" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#ic-sun-bg)" />
      <g stroke="#fff6d8" strokeWidth="3.4" strokeLinecap="round">
        {rays.map((a) => (
          <line key={a} x1={32 + Math.cos(a) * 17} y1={32 + Math.sin(a) * 17} x2={32 + Math.cos(a) * 23} y2={32 + Math.sin(a) * 23} />
        ))}
      </g>
      <circle cx="32" cy="32" r="12" fill="url(#ic-sun-core)" />
      <path d="M27 34q5 4 10 0" fill="none" stroke="#e8752f" strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="29.5" r="1.4" fill="#e8752f" />
      <circle cx="36" cy="29.5" r="1.4" fill="#e8752f" />
    </svg>
  );
}

export function MoonIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="ic-moon-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b1d5c" />
          <stop offset="1" stopColor="#6a3fb8" />
        </linearGradient>
        <linearGradient id="ic-moon-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="1" stopColor="#ffc96b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#ic-moon-bg)" />
      <path d="M36 14a18 18 0 1 0 14 29A15 15 0 0 1 36 14z" fill="url(#ic-moon-fill)" />
      <g fill="#fff">
        <path d="M47 15l1.3 3.2 3.2 1.3-3.2 1.3L47 24l-1.3-3.2-3.2-1.3 3.2-1.3z" />
        <circle cx="52" cy="31" r="1.4" />
        <circle cx="16" cy="16" r="1.2" opacity="0.8" />
        <path d="M18 45l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" opacity="0.9" />
      </g>
    </svg>
  );
}

export function NoodlesIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="ic-nd-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff0e6" />
          <stop offset="1" stopColor="#ffd2bb" />
        </linearGradient>
        <linearGradient id="ic-nd-bowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0703a" />
          <stop offset="1" stopColor="#c8402a" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#ic-nd-bg)" />
      <g fill="none" stroke="#e9a88a" strokeWidth="2" strokeLinecap="round">
        <path d="M24 20q-3-4 0-8" />
        <path d="M32 19q-3-4 0-8" />
        <path d="M40 20q-3-4 0-8" />
      </g>
      <g stroke="#6b3a22" strokeWidth="2.6" strokeLinecap="round">
        <line x1="36" y1="31" x2="52" y2="14" />
        <line x1="40" y1="32" x2="55" y2="18" />
      </g>
      <path d="M17 31q4-6 7 0q4-6 7 0q4-6 7 0q4-6 7 0" fill="none" stroke="#ffc94d" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 32h40a20 17 0 0 1-40 0z" fill="url(#ic-nd-bowl)" />
      <rect x="12" y="30.5" width="40" height="3.4" rx="1.7" fill="#ff9b6a" />
      <path d="M18 40h28" stroke="#ffd2bb" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <rect x="24" y="49" width="16" height="3" rx="1.5" fill="#c8402a" />
    </svg>
  );
}

export function TastingMenuIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="ic-tm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef3f8" />
          <stop offset="1" stopColor="#cfdbe8" />
        </linearGradient>
        <linearGradient id="ic-tm-dome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#9fb0c2" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#ic-tm-bg)" />
      {/* a very long menu */}
      <g>
        <rect x="40" y="9" width="15" height="44" rx="2.5" fill="#fff" stroke="#9fb0c2" strokeWidth="1.4" />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1="43" x2={i % 3 === 2 ? 49 : 52} y1={14 + i * 4.3} y2={14 + i * 4.3} stroke="#b9c6d4" strokeWidth="1.5" strokeLinecap="round" />
        ))}
        <path d="M40 50q7.5 6 15 0v6H40z" fill="#fff" stroke="#9fb0c2" strokeWidth="1.4" />
      </g>
      <path d="M8 44a15 15 0 0 1 30 0z" fill="url(#ic-tm-dome)" stroke="#8597aa" strokeWidth="1.4" />
      <circle cx="23" cy="27.5" r="2.6" fill="#8597aa" />
      <path d="M13 40a10 10 0 0 1 6-8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <rect x="5" y="44" width="36" height="3.6" rx="1.8" fill="#7d8ea2" />
    </svg>
  );
}

export function CakeIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="ic-ck-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="1" stopColor="#ff9a4d" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#ic-ck-bg)" />
      <ellipse cx="32" cy="50" rx="23" ry="4" fill="#fff" opacity="0.85" />
      {/* side of the slice */}
      <path d="M12 47V35l36-9v21z" fill="#ffe9bf" />
      <path d="M12 40.5l36-8.6v4.2l-36 8.6z" fill="#ff7aa2" />
      <path d="M12 35l36-9v3l-36 9z" fill="#fff" opacity="0.8" />
      {/* front face */}
      <path d="M48 26l6 3v20l-6-2z" fill="#f6c98a" />
      {/* frosting top */}
      <path d="M10 34.5q2-1.5 4 0t4 0 4 0 4 0 4 0 4 0 4 0 4 0 4 0 4 0l1-9.5-38 9.5z" fill="#ff6f9c" />
      <path d="M11 34L48 24.5l6 3.2" fill="none" stroke="#ff4f86" strokeWidth="1.6" strokeLinejoin="round" />
      {/* cherry */}
      <path d="M40 22q1-7 6-9" fill="none" stroke="#3f6b2b" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="39.5" cy="23" r="4.6" fill="#d1224e" />
      <circle cx="38" cy="21.4" r="1.3" fill="#fff" opacity="0.8" />
      {/* sprinkles */}
      <g strokeWidth="1.6" strokeLinecap="round">
        <line x1="20" y1="31.5" x2="22" y2="30.6" stroke="#6a3fb8" />
        <line x1="27" y1="29.8" x2="29" y2="30.4" stroke="#0c8d86" />
        <line x1="33" y1="28.6" x2="34.6" y2="27.4" stroke="#fff" />
      </g>
    </svg>
  );
}

export function CharminarIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <g fill="#d9541f">
        {/* minarets with balconies and domes */}
        <rect x="2.5" y="4.5" width="2.6" height="17.5" />
        <rect x="18.9" y="4.5" width="2.6" height="17.5" />
        <rect x="1.8" y="9" width="4" height="1.1" rx="0.4" />
        <rect x="18.2" y="9" width="4" height="1.1" rx="0.4" />
        <rect x="1.8" y="13" width="4" height="1.1" rx="0.4" />
        <rect x="18.2" y="13" width="4" height="1.1" rx="0.4" />
        <path d="M2.5 4.6q1.3-3.6 2.6 0zM18.9 4.6q1.3-3.6 2.6 0z" />
        <rect x="3.6" y="0.6" width="0.5" height="1.6" />
        <rect x="20" y="0.6" width="0.5" height="1.6" />
        {/* body, gallery and small central dome */}
        <rect x="5" y="13.5" width="14" height="8.5" />
        <rect x="4.6" y="11.6" width="14.8" height="2" rx="0.4" />
        <path d="M10 11.6q2-3.2 4 0z" />
      </g>
      <path d="M9.6 22v-4.6q2.4-3.6 4.8 0V22z" fill="#fff" />
    </svg>
  );
}

export function PalmIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M12.5 22q-1-7 0-12" fill="none" stroke="#8a5a2b" strokeWidth="1.8" strokeLinecap="round" />
      <g fill="#0c8d86">
        <path d="M12.5 10q-5-4-10-1 5-1 10 1z" />
        <path d="M12.5 10q5-4 10-1-5-1-10 1z" />
        <path d="M12.5 10q-3-6-8-6 5 2 8 6z" />
        <path d="M12.5 10q3-6 8-6-5 2-8 6z" />
        <path d="M12.5 10q0-6-2-8 3 3 2 8z" />
      </g>
      <path d="M2 22q10-3 20 0" fill="none" stroke="#e9b26a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
