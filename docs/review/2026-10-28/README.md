# Site review, 28 October 2026

Measurements behind the published review of kkreckons.com (UX, accessibility, SEO, AI discoverability), taken on a
production build of commit 5ebae52 at 360, 390, 768 and 1440px, light and dark. The live site was not reachable from
the review environment; live headers and the live home HTML were fetched through Vercel and matched the build.

- `REPORT.md`: every measured fact (headers, raw HTML, weights, typography, tap targets, contrast, sticky bars,
  console, axe, forms, fonts), facts only.
- `measurements.json` (the raw records, 2.1 MB) and `shots/` (full-page screenshots, 14 MB) were removed from the
  working tree to keep the repo small; both are in git history at commit f3c784b
  (`git show f3c784b:docs/review/2026-10-28/measurements.json`), and the scripts below regenerate them.
- `measure.mjs`, `probe.mjs`, `focus-cause.mjs`, `report.mjs`: the Playwright scripts, re-runnable against
  `npx next start -p 3100` with `CHROMIUM_PATH=/opt/pw-browsers/chromium` or Playwright's own Chromium.

Pull requests #163 (Special Reports, Listen) and #164 (tap targets, text sizes, keyboard focus, manifest) carry the
fixes made from these findings.
