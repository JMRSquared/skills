---
name: react-tsx-component
description: Use when editing any .tsx component under apps/web/src/**, apps/video-call/src/**, or packages/web-ui/**. Enforces function-component form, Props interface conventions, early returns, handler naming, Tailwind-only styling, and React 19 idioms.
---

# React TSX Component Standards (Wonderhire web)

Apply when creating or editing any `.tsx` file in:
- `apps/web/src/**`
- `apps/video-call/src/**`
- `packages/web-ui/**`

## Declaration form

```tsx
export function MyComponent({ title, onSave }: Props) {
  // ...
}

interface Props {
  title: string;
  onSave: (value: string) => void;
}
```

- `export function Component()` — not `const Component = () => {}`.
- `interface Props` lives **at the bottom** of the file.
- `Props` is the literal name — do not suffix with the component name (`MyComponentProps` is wrong in this codebase).

## State & early returns

- Early-return for `loading`, `error`, and empty states. Do not nest the happy path inside an `if (!loading) { ... }`.
- Return `null` for genuinely empty states; return a skeleton or spinner only when the UI requires it.

## Event handlers

- Prefix with `handle`: `handleClick`, `handleSubmit`, `handleSelectCandidate`.
- Props that receive a handler use an `on` prefix: `onSave`, `onClose`.

## Hooks

- Custom hooks start with `use`: `useAuth`, `useLogin`, `useCandidateSearch`.
- One concern per hook. If a hook grows past ~50 lines, split it.

## Styling

- Tailwind utility classes only. No custom CSS files. No `<style>` tags.
- Mobile-first: base classes are mobile, `sm:`/`md:`/`lg:` modifiers expand up.
- Use the design tokens from `tailwind.config` (spacing, colors). Do not hardcode hex colors in component files.
- For variant-heavy components, reach for the `cva` / `tailwind-variants` helper already in the shared UI package instead of stacking ternaries.

## Types

- No `any`. Use `unknown` + narrowing when a type is genuinely unknown.
- Prefer discriminated unions over optional flags.
- Type component state explicitly when the inferred type is ambiguous (`useState<Candidate | null>(null)`).

## File-level

- One component per file. Helper components for the same screen live in sibling files in the same folder.
- Named export only — no `export default`. Route components imported via React Router v7 use the same named-export convention.

## What "done" looks like

- `yarn build` + `yarn lint:fix` pass with zero warnings in the touched files.
- Component renders loading / error / success states; no infinite spinner on error.
- No inline hex colors, no `style={{ ... }}` except when layout requires a computed value.
