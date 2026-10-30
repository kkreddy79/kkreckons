---
name: design-stack-pro
description: Design, redesign or visually polish a website, web app, Android app or iOS app so it looks deliberate rather than generic AI output. Covers design tokens, layout, motion, accessibility and a critique pass. Use when asked to design a page or screen, build a new UI, restyle, "make it look better", or set up a design system. Not for content-only changes such as publishing an edition or editing copy.
---

# Design Stack Pro

A repo-agnostic workflow for web, Android and iOS UI. Work in this order: **tokens → banned list → build → check → critique.** Never ship the first generic pass.

## Keep context small

- Read only what each step needs. Load **one** platform reference, and only when you start building for that platform:
  [web](references/web.md) · [android](references/android.md) · [ios](references/ios.md) · [cross-platform](references/cross-platform.md).
  Open [tools](references/tools.md) only if the user wants an external tool (Figma, GSAP, video, 3D).
- Once `docs/design-tokens.md` exists, read it **instead of** re-scanning stylesheets or theme files.
- Search before reading: `grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(' <ui dirs>` to find hardcoded values. Don't open whole files to look for them.
- Calculate contrast with `node <this skill>/scripts/contrast.mjs <fg> <bg>`. Don't estimate it.
- Take screenshots only at the widths you are checking, and only after a change that affects layout.
- Report a short list of findings and fixes. Don't repeat code you have already written.

## 1. Tokens first

**Existing project:** find its tokens (CSS custom properties, Tailwind config, Compose `Theme.kt`, SwiftUI colour assets, `tokens.json`).
**Extend them; never replace them.** Don't add a framework, font or animation library the project doesn't already use without asking.
The project's brand wins over every rule below.

**New project:** infer the product type and audience, then define tokens in three layers:

| Layer | Example | Rule |
|---|---|---|
| Primitive | `purple-700: #35205f` | Raw values. Never referenced by components |
| Semantic | `color-text`, `color-surface`, `color-accent`, `space-4`, `radius-md` | What components use. Light and dark values live here |
| Component | `button-bg → color-accent` | Only when a component genuinely differs |

Minimum set: text, muted text, surface, raised surface, border, accent, one secondary accent, success, warning and danger;
a 4- or 8-point spacing scale; a 5–7 step type scale; 2–3 radii; one motion duration scale (fast, base, slow) with an easing.
Fit the industry: no playful gradients for finance or health, high contrast and plain hierarchy for data-heavy products.

**Save the tokens** to `docs/design-tokens.md` (start from [the template](references/design-tokens-template.md)) as one compact table plus a short list of decisions.
This file is the single source every screen and app reuses. Update it whenever a token changes.

## 2. Banned list (web defaults; a platform or existing brand overrides)

Reject or rewrite these unless the brand already uses them:

- Purple-to-blue or cyan-on-dark gradients as the default look; glow or neon on everything
- Cards nested inside cards; a coloured side border on every card; an icon tile above every heading
- Emoji used as icons (use the platform's icon set: SF Symbols, Material Symbols, or one SVG set)
- Bounce or elastic easing as the default; animation on every element
- Inter or Roboto as the only web font with nothing distinctive (fine on Android, where Roboto is native)
- Pure `#000` and `#fff` for large web surfaces (true black is fine for dark mode on iOS and Android)
- Grey text on coloured backgrounds; a hardcoded colour or spacing value where a token exists

## 3. Build

Load the platform reference now. Shared rules:

- Every colour, space, radius, font and duration comes from a token.
- Layout and hierarchy before decoration: one primary action per view, a clear reading order, generous whitespace.
- Motion must have a purpose (orientation, feedback, continuity). Honour reduced motion on every platform.
- Work from structured design data (a Figma frame through MCP, an existing component) rather than guessing from a screenshot.

## 4. Check before you call it done

- Contrast: 4.5:1 for body text, 3:1 for large text (24px, or 18.66px bold) and for UI parts such as borders, icons and focus rings
- Touch targets: 48dp on Android, 44pt on iOS, 44px on web (24px is the WCAG 2.2 minimum)
- Sizes: web at 375, 768, 1024 and 1440px; mobile on a small phone, a large phone and a tablet, in light and dark
- Text scaling: browser zoom to 200% on web, Dynamic Type at its largest on iOS, font scale 2× on Android
- Keyboard and focus order on web; VoiceOver and TalkBack labels on mobile
- Nothing from the banned list and no hardcoded values; `docs/design-tokens.md` is up to date

Use the project's own checks if it has them (axe, Playwright, lint, snapshot tests).

## 5. Critique pass

Review your own output once as a sceptical senior designer: which parts look generic or AI-made, which hierarchy problems there are, and what you would fix.
Apply the fixes, then report at most 5 remaining issues.
If the `design:design-critique` or `design:accessibility-review` skills are installed, use them for this pass instead of improvising.
