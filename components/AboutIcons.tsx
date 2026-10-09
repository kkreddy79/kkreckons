// Small line icons for the About page, drawn in currentColor.

type Props = { className?: string };

function Icon({ className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const SunIcon = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </Icon>
);

export const MoonIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor" stroke="none" />
  </Icon>
);

export const ChipIcon = (p: Props) => (
  <Icon {...p}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
    <path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21" />
  </Icon>
);

export const ChartIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M4 20h16" />
    <path d="M6.5 17v-4M10.5 17v-7M14.5 17v-5M18.5 17V7" strokeWidth="2.4" />
    <path d="M5 10l4.5-4 4 2.5L19 4" />
  </Icon>
);

export const BuildingIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M4 21V9l5-3v15M9 21V4l7 3v14M16 21v-9l4 2v7M3 21h18" />
    <path d="M11.5 9h2M11.5 12h2M11.5 15h2M6 12h1M6 15h1" />
  </Icon>
);

export const GlobeIcon = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <ellipse cx="12" cy="12" rx="4" ry="9" />
    <path d="M3.5 9h17M3.5 15h17" />
  </Icon>
);

export const BulbIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M9 17h6M10 20.5h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z" />
  </Icon>
);

export const LinkIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4l-1.1 1.1" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.1-1.1" />
  </Icon>
);

export const ScalesIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M12 3v17M7 20h10M5 6h14M12 4.5l-7 1.5M12 4.5l7 1.5" />
    <path d="M5 6l-3 6.5a3.2 3.2 0 0 0 6 0zM19 6l-3 6.5a3.2 3.2 0 0 0 6 0z" />
  </Icon>
);

export const DocIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4M9 11h6M9 14h6M9 17h4" />
  </Icon>
);

export const PeopleIcon = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3" />
    <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
    <circle cx="5" cy="10" r="2.2" />
    <circle cx="19" cy="10" r="2.2" />
    <path d="M1.5 18a3.6 3.6 0 0 1 4.6-3.4M22.5 18a3.6 3.6 0 0 0-4.6-3.4" />
  </Icon>
);

