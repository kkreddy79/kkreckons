# Android

**Stack:** Jetpack Compose with Material 3. Use XML views only if the project already does.

## Tokens
- Put the brand tokens in `ui/theme/`: `Color.kt` (primitives), `Theme.kt` (`lightColorScheme`/`darkColorScheme` mapped to semantic roles), `Type.kt`, `Shape.kt`, and a small `Spacing` object exposed through a `CompositionLocal`.
- Components read `MaterialTheme.colorScheme.*`, `MaterialTheme.typography.*` and the spacing object. Never use `Color(0x…)` inside a screen.
- Dynamic colour (Android 12+) is a product decision. Default to the brand scheme and offer dynamic colour only if the user wants it.
- Roboto (or the system font) is native here. Add one brand font for headlines if the brand has one.

## Layout
- Edge-to-edge is the default (required from target SDK 35). Handle insets with `WindowInsets`/`Scaffold` padding.
- Touch targets of at least 48dp (`Modifier.minimumInteractiveComponentSize()`), with 8dp between targets.
- Adapt to window size classes (compact, medium, expanded): a bottom navigation bar on phones, a navigation rail on tablets and foldables.
- Use sp for text and dp for everything else; test at font scale 2×.

## Motion
- Use Material motion (container transform, shared axis, fade-through) and support predictive back.
- Check `Settings.Global.ANIMATOR_DURATION_SCALE` (0 means the user turned animations off) and skip motion that isn't essential.

## Accessibility and quality
- `contentDescription` on meaningful icons (`null` when decorative); merge semantics for list rows.
- Check with TalkBack and with Accessibility Scanner or Compose UI tests (`onNodeWithContentDescription`).
- Preview with `@PreviewLightDark` and `@PreviewScreenSizes`, plus `@PreviewFontScale`, instead of running the emulator for every change.
