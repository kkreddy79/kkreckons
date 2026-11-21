# Design tokens

<!-- Copy this to docs/design-tokens.md in the project. Keep it short: Claude reads this file instead of scanning
     every stylesheet, so every extra line costs context on every design task. -->

**Source of truth:** `<path to the file that defines the tokens, e.g. app/globals.css or tokens.json>`
**Platforms:** web / Android / iOS

## Colour (semantic)

| Token | Light | Dark | Use |
|---|---|---|---|
| text | | | Body text |
| text-muted | | | Secondary text, 4.5:1 on surface |
| surface | | | Page background |
| surface-raised | | | Cards, sheets |
| border | | | Dividers, 3:1 if it marks a control |
| accent | | | Primary actions, links |
| accent-2 | | | Secondary highlight |
| success / warning / danger | | | Status |

## Type

| Token | Family | Size / line height | Weight |
|---|---|---|---|
| display | | | |
| h1 / h2 / h3 | | | |
| body | | | |
| small | | | |

## Space, radius, motion

- Space: 4, 8, 12, 16, 24, 32, 48, 64
- Radius: sm, md, lg
- Motion: fast 150ms, base 250ms, slow 400ms; easing
- Reduced motion: what happens instead

## Decisions

<!-- One line each: what was chosen and why. e.g. "Serif headlines: editorial finance brand, not a SaaS look." -->
-
