# Cross-platform and shared tokens

## One token source for every app
When a brand spans a website and native apps, keep a single `tokens.json` (W3C Design Tokens format:
`{ "color": { "accent": { "$type": "color", "$value": "#a8430f" } } }`) and generate the platform files from it:

- Web: CSS custom properties
- Android: `Color.kt` and a theme
- iOS: asset catalogue colours and a Swift `DS` enum

Use Style Dictionary or a short script for this. Generated files are never edited by hand. Record the source path in `docs/design-tokens.md`.
If the apps live in separate repos, publish the tokens from one repo (a package or a git submodule) rather than copying values.

## React Native / Flutter
- React Native: a `theme.ts` generated from the tokens and `useColorScheme()` for dark mode. Use `Pressable` with a `hitSlop` that reaches 44pt or 48dp. Honour `AccessibilityInfo.isReduceMotionEnabled()`.
- Flutter: `ThemeData` with `ColorScheme`, plus `ThemeExtension` for custom tokens. `MediaQuery.disableAnimations` for reduced motion; `MediaQuery.textScaler` for text size.
- Keep each platform's feel: navigation, back behaviour, sheets and fonts follow Android and iOS conventions, while colour, type and spacing come from the shared tokens.
