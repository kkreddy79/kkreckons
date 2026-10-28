import "./special.css";

/** Special Reports share one stylesheet (brand fonts, hub and report-page styles), loaded only on these routes. */
export default function SpecialLayout({ children }: { children: React.ReactNode }) {
  return children;
}
