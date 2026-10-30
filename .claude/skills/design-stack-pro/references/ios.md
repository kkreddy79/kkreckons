# iOS

**Stack:** SwiftUI. Use UIKit only if the project already does. Building and running needs a Mac with Xcode, so in a cloud or Linux session write the code and previews and leave the build to the user.

## Tokens
- Colours live in the asset catalogue as named colours with Any and Dark appearances (add High Contrast variants for key colours), exposed as `Color` extensions (`Color.brandAccent`).
- Spacing, radius and motion live in a small `enum DS { static let space4: CGFloat = 16 … }`.
- Fonts: SF Pro (the system font) is the native default. A custom brand font must scale with Dynamic Type: `Font.custom("Name", size: 17, relativeTo: .body)`.
- Prefer semantic system styles (`.font(.headline)`, `.foregroundStyle(.secondary)`) where the brand has no stronger opinion.

## Layout
- Respect safe areas. Use `.safeAreaInset` for custom bars instead of hardcoded padding.
- Touch targets of at least 44×44pt (`.contentShape` and `.frame(minWidth: 44, minHeight: 44)` for small icons).
- Follow HIG patterns: large navigation titles on top-level screens, `NavigationStack`, `TabView` for 2–5 top-level sections, sheets for focused tasks.
- Use the current system materials and bar styles (Liquid Glass on iOS 26 and later) as the system provides them. Don't imitate them with custom blur.
- Use SF Symbols for icons and match their weight to the text beside them.

## Motion
- Spring animations (`.smooth`, `.snappy`) and `matchedGeometryEffect` for continuity.
- Check `@Environment(\.accessibilityReduceMotion)` and replace movement with a fade.

## Accessibility and quality
- `accessibilityLabel` on icon-only buttons, `accessibilityElement(children: .combine)` on rows.
- Check at the largest Dynamic Type size (`.dynamicTypeSize(.accessibility5)` in a preview). Layouts must reflow, not truncate.
- Use `#Preview` variants for light and dark, a small phone (iPhone SE) and an iPad.
