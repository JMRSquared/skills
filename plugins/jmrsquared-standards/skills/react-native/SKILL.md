---
name: react-native
description: Use when editing React Native code — files importing from `react-native` or `expo-*`, Expo Router screens under `app/`, or any `.tsx` in mobile app directories. Enforces function-component form, `Props` at bottom, FlatList perf hygiene, Expo Router file-based routing, and EAS / OTA discipline.
---

# React Native Standards (Expo-first)

Apply when editing any `.tsx` file that imports from `react-native` or `expo-*`, lives under an Expo Router `app/` tree, or is otherwise targeting the mobile runtime. This skill supersedes the web `react-tsx-component` skill for those files — for styling rules, defer to `nativewind`; for graphics, defer to `react-native-skia`.

## Declaration form

```tsx
export function ProfileScreen({ userId }: Props) {
  // ...
}

interface Props {
  userId: string;
}
```

- `export function Component()` — no `const Component = () => {}`, no `export default`.
- `interface Props` lives **at the bottom** of the file, named literally `Props`.
- One component per file. Sibling helper components live in the same folder.

## RN primitives

- `View`, `Text`, `Pressable` for new code. Do not reach for `TouchableOpacity` / `TouchableHighlight` unless an existing screen already uses them.
- All visible text goes inside a `<Text>`. Never put a bare string in a `<View>`.
- `SafeAreaView` from `react-native-safe-area-context` (not the deprecated `react-native` export). Wrap screen roots with `useSafeAreaInsets()` or `SafeAreaView` — never hardcode top/bottom padding for the notch.
- `KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` for any screen with a text input above the keyboard.

## Routing (Expo Router)

- File-based routing under `src/app/`. Routes are folders; `_layout.tsx` defines the stack/tab/drawer shell.
- Group routes with `(group)` segments to share a layout without affecting the URL.
- Read params via `useLocalSearchParams<{ id: string }>()`. Type the generic — do not destructure unknowns.
- Prefer typed routes (`experiments.typedRoutes: true` in `app.config.ts`) so `<Link href="...">` is checked at build time.
- Navigate via `router.push` / `router.replace` from `expo-router`. Do not import `@react-navigation/native` directly for new screens.
- **Route files stay thin.** A file under `app/` imports a single component from `domain/<name>/components/` and renders it — no business logic, no hooks beyond `useLocalSearchParams`, no styling lives in the route file:

```tsx
// src/app/book/[id]/view.tsx
import { BookView } from '~/domain/book';

export default function Route() {
  return <BookView />;
}
```

## Domain-driven folder layout

Group code by product concept, not by file type. Every domain folder is a self-contained slice.

```
src/
  app/                                # Expo Router — thin route files only
    book/[id]/view.tsx                # imports BookView from domain/book
    payments/purchase-plan.tsx        # imports UpgradePlan from domain/shared/payments
  components/                         # truly app-wide UI primitives (Button, Input, Loader)
    Button.tsx
    index.ts
  domain/                             # singular — one folder, many domains
    auth/
      components/   Login.tsx
      context/      UserContext.tsx
      hooks/        useLogin.ts + index.ts barrel
      providers/    apple.ts, google.ts, index.ts
      user.schema.ts
      index.ts
    book/
      components/   BookView.tsx, BookRead.tsx, CreateBookForm.tsx
      hooks/        useBook.ts, useBooks.ts, useCreateBook.ts
      book.schema.ts
      category.schema.ts
      index.ts
    shared/                           # cross-domain meta-namespace
      components/   TopNav.tsx, TermsOfUse.tsx + index.ts
      form/         components/, components/ui/, index.ts
      pdf/          components/, index.ts
      cache/        components/, hooks/, index.ts
      payments/     components/, context/, hooks/, subscription.schema.ts
      firebase/     firebase.ts, firebase.schema.ts, index.ts
      permissions/  permissions.ts, utils.ts
      utils.ts
      storage.ts
  assets/                             # icons, images, fonts (barrelled)
    icons/        AccountIcon.tsx, BookIcon.tsx, ..., index.ts
    images/       index.ts
    fonts/
```

Rules:

- **`domain/` is singular.** One folder, many domains.
- **A domain owns one product concept** (`auth`, `book`, `league`). Cross-domain or framework-glue code (forms, PDF, payments, firebase, cache, permissions, ads) lives under `domain/shared/<area>/`, structured as its own mini-domain.
- **Buckets inside a domain**, used as needed: `components/`, `hooks/`, `context/`. A domain doesn't need all three, but anything that fits one of these categories MUST sit in the matching bucket.
- **No `screens/` bucket.** Screens are the Expo Router files under `src/app/` (see above).
- **Domain root** also holds `<concept>.schema.ts` (Zod schemas — never folder-nested), `utils.ts`, an `index.ts` barrel, and optional named purpose folders (e.g. `providers/` for third-party SDK glue like Apple / Google sign-in).
- **`src/components/`** is reserved for truly app-wide primitives — `Button`, `Input`, `Loader`, `Shimmer`. A component belongs here only if it has zero business logic AND is used by ≥2 unrelated domains.
- **`src/assets/`** holds icons (as `.tsx` components), images, and fonts. Each subfolder has an `index.ts` barrel so consumers import `from '~/assets/icons'` rather than deep paths.
- **Domain folder names are kebab-case** (`author-application`, `book`), enforced by `naming-imports-exports`.

## Barrels and imports

- Every domain root and every bucket folder has an `index.ts` re-exporting its public surface.
- Consumers always import via the domain root: `import { BookView, useBook } from '~/domain/book'`. Never deep-link into `'~/domain/book/components/BookView'`.
- Cross-domain shared utilities import the same way: `import { Form } from '~/domain/shared/form'`.
- App-wide primitives import from `'~/components'`; icons from `'~/assets/icons'`.

## Lists

- `FlatList` with `keyExtractor={(item) => item.id}` — never `index` for non-static data.
- `renderItem` is a stable function: extract it outside the component, or wrap with `useCallback`. Never pass an inline arrow.
- For lists >50 items, set `removeClippedSubviews`, `maxToRenderPerBatch={10}`, `windowSize={5}`, and `initialNumToRender` sized to the visible viewport.
- If the project already uses `@shopify/flash-list`, prefer `FlashList` for new long lists — it sets the perf defaults for you.

## Images

- `expo-image` (`<Image source={...} contentFit="cover" transition={150} />`) is the default for new screens — disk + memory cache, blurhash placeholders.
- `react-native-fast-image` only in legacy areas already using it.
- Never use the bare `react-native` `Image` for remote URIs.

## Handlers / hooks

- Local handlers prefixed `handle`: `handleSubmit`, `handlePressItem`.
- Props that receive handlers use `on`: `onSave`, `onClose`.
- `useCallback` is required when the handler is passed into a memoized child, `renderItem`, or a Gesture Handler / Reanimated worklet. Otherwise skip it.
- Custom hooks start with `use` and own one concern. Split past ~50 lines.

## Platform code

- `Platform.select({ ios: ..., android: ..., default: ... })` over `if (Platform.OS === ...)` chains.
- For diverging screens use platform-specific files: `Settings.ios.tsx` / `Settings.android.tsx`. Metro resolves the right one.
- Never assume `web` works — explicitly guard or omit when the screen is mobile-only.

## State & early returns

- Early-return for loading / error / empty: `if (isLoading) return <Spinner />`, `if (error) return <ErrorView ... />`, then the happy path.
- Return `null` for genuinely empty states.
- Type state explicitly when inference is ambiguous: `useState<User | null>(null)`.

## Types

- No `any`. Use `unknown` + narrowing.
- Prefer discriminated unions over optional flag soups.
- Route params, navigation state, and tRPC inputs are all typed end-to-end — do not cast.

## Environment

- Expo SDK with EAS Build for store releases; Expo Updates for OTA channels (`development`, `preview`, `production`).
- `app.config.ts` (typed) — not `app.json`. Read secrets via `expo-constants` `extra` populated from EAS secrets, not bundled `.env`.
- Local dev: `expo start` (or `expo start --dev-client` when native modules are present). Never run `eas build` without explicit user confirmation per `jmr-standing-rules` rule #1.

## File size

- If a `.tsx`/`.ts` file in `domain/**` or `src/components/**` grows past ~80 lines, split it.
- Extract sub-components into the domain's `components/`, hooks into `hooks/`, context / providers into `context/` (or `providers/` for SDK wrappers), Zod schemas into `<concept>.schema.ts` at the domain root.
- Name the extracted file after the concern it owns: `BookHeader.tsx`, `useBookReader.ts`, `BookContext.tsx`, `book.schema.ts`.
- Same shape of rule as the per-hook ~50-line guideline above — judgement applies, but past ~80 lines the right move is almost always extraction.

## What "done" looks like

- `yarn lint:fix` + the project's typecheck (`tsc --noEmit` or `expo export --platform all`) pass.
- No anonymous `renderItem`, no `keyExtractor={() => Math.random()}`.
- No inline `style={{ ... }}` for static styling — that's `nativewind`'s job.
- Screens render loading / error / success states; no infinite spinner on error.
- No `.tsx`/`.ts` file in `domain/**` exceeds ~80 lines.
- Every component / hook / context file sits in its matching domain bucket; `app/` route files stay thin.
- Schemas live at the domain root as `<concept>.schema.ts`.
- Barrel `index.ts` re-exports the domain's public surface; imports use `'~/domain/<name>'`, `'~/components'`, `'~/assets/icons'` — no deep paths.
- No deploy / EAS submit run without explicit user confirmation.
