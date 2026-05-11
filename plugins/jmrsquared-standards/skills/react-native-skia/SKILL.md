---
name: react-native-skia
description: Use when editing code that imports from `@shopify/react-native-skia` — `Canvas`, `Group`, `Path`, `Image`, `Circle`, `useImage`, `useClock`, `useValue`, or Reanimated-driven Skia animations. Enforces Canvas hierarchy, off-thread animation patterns, memoized paths / shaders, and proper asset loading.
---

# React Native Skia Standards

Apply when editing any file that imports from `@shopify/react-native-skia` — 2D graphics, custom shaders, animated visualisations.

## Canvas hierarchy

- One `<Canvas>` per visual surface. Each `<Canvas>` is a separate native view — stacking many siblings is expensive.
- Nest `<Group>` for shared transforms (`transform`, `origin`, `opacity`, `clip`) rather than duplicating props on every shape.
- `<Canvas style={{ flex: 1 }}>` — give it explicit dimensions; a zero-sized Canvas renders nothing.

```tsx
<Canvas style={{ flex: 1 }}>
  <Group transform={[{ translateX: 100 }]}>
    <Circle cx={0} cy={0} r={40} color="black" />
  </Group>
</Canvas>
```

## Animation driver

- For new code, drive animations with **Reanimated** `useSharedValue` + `useDerivedValue`. Skia reads shared values directly off the UI thread.
- The legacy Skia value system (`useValue`, `useTiming`, `useSpring`) is deprecated — do not introduce it in new components.
- `useClock()` returns a shared value of milliseconds — use it as the source of frame timing.

```tsx
const clock = useClock();
const x = useDerivedValue(() => (clock.value / 10) % 300);
return <Circle cx={x} cy={50} r={20} color="red" />;
```

## Asset loading

- `useImage(require('./logo.png'))` for static bundled assets.
- `useImage(uri)` for remote — returns `null` while loading. Always early-return `null` from the component while the image is `null`, or guard with a conditional render. Never pass `null` to `<Image image={...}>`.

```tsx
const image = useImage(uri);
if (!image) return null;
return <Image image={image} x={0} y={0} width={200} height={200} fit="cover" />;
```

## Paths & shaders

- Build paths once. `useMemo(() => Skia.Path.MakeFromSVGString(d), [d])` — never construct a path inside the render body without memoisation.
- Custom shaders (`Skia.RuntimeEffect.Make(sksl)`) are expensive to compile. Cache at **module scope**, not inside the component:

```tsx
const effect = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  half4 main(float2 xy) { return half4(xy.x / resolution.x, 0, 0, 1); }
`)!;
```

- Reuse `Paint` objects (`useMemo`) when the same paint is applied across many shapes.

## Touch & gestures

- For touch on a Canvas, use **Gesture Handler v2** (`Gesture.Pan()`, `Gesture.Tap()`) piped into Reanimated shared values. Skia reads the values directly.
- The Skia `useTouchHandler` is fine for simple cases but cannot compose with other gestures — prefer Gesture Handler for anything multi-touch or combined.
- Do not mix raw `PanResponder` with Skia. The thread model fights the animation runtime.

## Performance

- Skia shared values run on the **UI thread**. Do not read `sharedValue.value` from `useEffect` — use `runOnJS` from inside a `useDerivedValue` callback to bring values back to JS.
- Avoid per-frame allocations: no `new Skia.Path()`, no `Skia.Color('red')`, no inline `[{ translateX: x }]` arrays inside a `useDerivedValue`. Allocate once via `useMemo`, mutate.
- Profile with `expo-dev-client` + the React DevTools profiler. The Hermes sampling profiler shows JS-thread cost; the native Xcode / Android Studio profiler shows GPU cost.

## What "done" looks like

- No per-frame allocations inside `useDerivedValue` or `useFrameCallback`.
- Paths and shaders are memoised; `RuntimeEffect.Make` is cached at module scope.
- Loading states (`useImage` returning `null`) are explicitly handled.
- No deprecated `useValue` / `useTiming` in new code.
- `yarn lint:fix` + project typecheck pass; Metro bundles without warnings.
