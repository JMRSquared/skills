---
name: react-tsx-component
description: Use when editing any .tsx component. Enforces function-component form, Props interface conventions, early returns, handler naming, Tailwind-only styling, and React 19 idioms.
---

# React TSX Component Standards

Apply when creating or editing any `.tsx` file in your React component directories.

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

- Prefix with `handle`: `handleClick`, `handleSubmit`, `handleSelectItem`.
- Props that receive a handler use an `on` prefix: `onSave`, `onClose`.

## Hooks

- Custom hooks start with `use`: `useAuth`, `useLogin`, `useItemSearch`.
- One concern per hook. If a hook grows past ~50 lines, split it.

## Styling

- Tailwind utility classes only. No custom CSS files. No `<style>` tags.
- Mobile-first: base classes are mobile, `sm:`/`md:`/`lg:` modifiers expand up.
- Use the design tokens from `tailwind.config` (spacing, colors). Do not hardcode hex colors in component files.
- For variant-heavy components, reach for the `cva` / `tailwind-variants` helper already in the shared UI package instead of stacking ternaries.

## Types

- No `any`. Use `unknown` + narrowing when a type is genuinely unknown.
- Prefer discriminated unions over optional flags.
- Type component state explicitly when the inferred type is ambiguous (`useState<User | null>(null)`).

## File-level

- One component per file. Helper components for the same view live in sibling files in the same `components/` folder.
- Named export only — no `export default`. Route components imported via React Router v7 use the same named-export convention.

## Domain-driven folder layout

Group code by product concept, not by file type. Every domain folder is a self-contained slice.

```
src/
  app/                                # web router entry (Next.js app/ or RR v7 routes)
    book/[id]/view.tsx                # thin route file — imports a domain component
  components/                         # app-wide UI primitives only (Button, Input, Loader)
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
      payments/     components/, context/, hooks/, subscription.schema.ts
      firebase/     firebase.ts, firebase.schema.ts, index.ts
      utils.ts
```

Rules:

- **`domain/` is singular.** One folder, many domains.
- **A domain owns one product concept** (`auth`, `book`, `league`). Cross-domain or framework-glue code (forms, PDF, payments, firebase, cache, permissions) lives under `domain/shared/<area>/`, structured as its own mini-domain.
- **Buckets inside a domain**, used as needed: `components/`, `hooks/`, `context/`. A domain doesn't need all three, but anything that fits one of these categories MUST sit in the matching bucket.
- **No `screens/` bucket.** Screens are route-layer files (`app/...` for Next.js, `routes/...` for React Router v7). A route file imports a single component from `domain/<name>/` and renders it — no business logic, no hooks, no styling lives in the route file.
- **Domain root** also holds `<concept>.schema.ts` (Zod schemas — never folder-nested), `utils.ts`, an `index.ts` barrel, and optional named purpose folders (e.g. `providers/` for third-party SDK glue).
- **`src/components/`** is reserved for truly app-wide primitives — `Button`, `Input`, `Loader`, `Shimmer`. A component belongs here only if it has zero business logic AND is used by ≥2 unrelated domains.
- **Domain folder names are kebab-case** (`author-application`, `book`), enforced by `naming-imports-exports`.

## Barrels and imports

- Every domain root and every bucket folder has an `index.ts` re-exporting its public surface.
- Consumers always import via the domain root: `import { BookView, useBook } from '~/domain/book'`. Never deep-link into `'~/domain/book/components/BookView'`.

```tsx
// routes/book.$id.view.tsx
import { BookView } from '~/domain/book';

export default function Route() {
  return <BookView />;
}
```

## File size

- If a `.tsx`/`.ts` file in `domain/**` or `src/components/**` grows past ~80 lines, split it.
- Extract sub-components into the domain's `components/`, hooks into `hooks/`, context / providers into `context/`, Zod schemas into `<concept>.schema.ts` at the domain root.
- Name the extracted file after the concern it owns: `OrderRow.tsx`, `useOrderFilters.ts`, `OrdersContext.tsx`, `order.schema.ts`.
- Same shape of rule as the per-hook ~50-line guideline above — judgement applies, but past ~80 lines the right move is almost always extraction.

## What "done" looks like

- `yarn build` + `yarn lint:fix` pass with zero warnings in the touched files.
- Component renders loading / error / success states; no infinite spinner on error.
- No inline hex colors, no `style={{ ... }}` except when layout requires a computed value.
- No `.tsx`/`.ts` file in `domain/**` exceeds ~80 lines.
- Every component / hook / context file sits in its matching domain bucket; route files stay thin.
- Schemas live at the domain root as `<concept>.schema.ts`.
- Barrel `index.ts` re-exports the domain's public surface; imports use `'~/domain/<name>'`.
