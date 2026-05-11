---
name: nativewind
description: Use when editing React Native components that use NativeWind — `className` props on RN primitives, `tailwind.config.js` with the NativeWind preset, `global.css`, or `nativewind-env.d.ts`. Enforces className-only styling, design-token usage, and dark / platform variant patterns.
---

# NativeWind Standards

Apply when a React Native component uses NativeWind's `className` prop, or when editing the NativeWind setup files (`tailwind.config.js`, `global.css`, `metro.config.js`, `babel.config.js`, `nativewind-env.d.ts`).

## Setup invariants

NativeWind v4+ requires all four wired together — break one and `className` silently no-ops:

- `metro.config.js` wraps the default config in `withNativeWind(config, { input: './global.css' })`.
- `babel.config.js` includes `"nativewind/babel"` in `presets` (after `babel-preset-expo`).
- `tailwind.config.js` extends `nativewind/preset` and lists every directory containing `className` in `content`.
- `global.css` holds the three Tailwind directives (`@tailwind base/components/utilities`) and is imported **once** from the root layout (`app/_layout.tsx`).
- `nativewind-env.d.ts` is checked into the repo so `className` typechecks on RN primitives.

## Styling rule

- `className` only. No parallel `StyleSheet.create` for the same component.
- Inline `style={{ ... }}` is reserved for **computed** values: Reanimated `useAnimatedStyle`, dynamic dimensions from `useWindowDimensions`, or values derived from props at render time.
- Static styling — color, padding, layout, typography, borders — always goes through `className`.

```tsx
<View className="flex-1 items-center justify-center bg-background px-4">
  <Text className="text-lg font-semibold text-foreground">Hello</Text>
</View>
```

## Design tokens

- Colors and spacing live in `tailwind.config.js` `theme.extend`. No hex literals (`#1e293b`) in component files.
- Token names mirror the design system: `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`. Avoid raw palette names (`bg-slate-900`) in screen code — wrap them in semantic tokens.
- Spacing follows the Tailwind 4px scale (`p-1` = 4px). Do not introduce one-off arbitrary values (`p-[13px]`) without a token reason.

## Platform variants

- `ios:`, `android:`, `web:` modifiers for divergent styling. Prefer this over `Platform.select` inside a `style` prop.
- `dark:` for dark mode. Set `userInterfaceStyle: "automatic"` in `app.config.ts` so the system theme drives the variant.
- Combine: `dark:ios:bg-zinc-900`.

## Variants

- For variant-heavy components (buttons, badges, alerts) use `tailwind-variants` or `cva`. Do not stack ternaries inside `className`.

```tsx
const button = tv({
  base: 'rounded-lg px-4 py-2',
  variants: {
    intent: { primary: 'bg-primary', danger: 'bg-destructive' },
    size: { sm: 'text-sm', md: 'text-base' },
  },
});
```

## Third-party components — `cssInterop`

- `className` does not work on third-party components by default. Register them once at module scope via `cssInterop`:

```tsx
import { cssInterop } from 'nativewind';
import { Image } from 'expo-image';

cssInterop(Image, { className: 'style' });
```

- Keep `cssInterop` calls in a shared `lib/nativewind-interop.ts` so registration is centralised and not duplicated per screen.

## What "done" looks like

- No `StyleSheet.create` introduced in new components.
- No static inline `style={{ ... }}` blocks — only computed / animated values.
- No hex literals in component files; every color resolves to a token.
- `nativewind-env.d.ts` is present and `className` typechecks.
- `yarn lint:fix` + project typecheck pass.
