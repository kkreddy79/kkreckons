# Web

**Stack:** use whatever the project already has. For a new project, Next.js (App Router) with CSS custom properties or Tailwind is the default.
Ask before adding Tailwind, a component library or an animation library to an existing project.

## Tokens
- Define tokens as CSS custom properties on `:root`. Redefine them for dark mode under `@media (prefers-color-scheme: dark)`, and under `[data-theme="dark"]` if the site has a toggle.
- With Tailwind, map the theme to those variables (`--color-*` in v4 `@theme`), so the CSS stays the single source.
- Fluid type: `font-size: clamp(min, preferred-vw, max)` for display sizes only. Keep body text fixed (16–18px).

## Layout
- Semantic HTML first (`header`, `nav`, `main`, `article`, `button`, not `div onClick`).
- Readable text width of about 60–75 characters (`max-width: 68ch`).
- Mobile first. Check 375, 768, 1024 and 1440px, with no horizontal scroll at 320px.
- Fonts: self-host, subset, `font-display: swap`, at most 2 families and 4 weights; preload only the font above the fold.

## Motion
- Use CSS transitions and keyframes first. Animate only `transform` and `opacity`.
- Wrap all motion in `@media (prefers-reduced-motion: no-preference)`, or turn it off under `reduce`.
- GSAP (timelines, ScrollTrigger, SplitText) only when the project already uses it or the user asks. Register its plugins once, clean up in a `useGSAP`/effect cleanup, and check `matchMedia` for reduced motion.
- At most one signature animation per page (a hero reveal or scroll story). Don't animate everything.

## Accessibility and quality
- A visible `:focus-visible` ring with 3:1 contrast; never `outline: none` without a replacement.
- Every image has `alt` (or `alt=""` when decorative); icon buttons have `aria-label`.
- Core Web Vitals: set image sizes, avoid layout shift from fonts and ads, and lazy-load below the fold.
- If the project has Playwright and axe, run them at the four widths; otherwise run a one-off Playwright screenshot pass.
