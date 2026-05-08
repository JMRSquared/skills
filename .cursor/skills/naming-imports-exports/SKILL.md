---
name: naming-imports-exports
description: Use on any TypeScript/JavaScript file edit. Enforces naming conventions (camelCase variables, PascalCase components, kebab-case directories, boolean prefixes) and import/export rules (named exports, ~ alias, barrel re-exports).
---

# Naming, Imports, Exports

Applies to every `.ts` / `.tsx` / `.js` / `.mjs` file in the repo.

## Naming

| Kind | Convention | Example |
|------|-----------|---------|
| Variables | `camelCase` | `sessionLoaded`, `userId` |
| Functions | `camelCase` | `fetchUsers`, `computeScore` |
| Components | `PascalCase` | `AuthProvider`, `LoginPage` |
| Types / Interfaces | `PascalCase` | `User`, `OrderStatus` |
| Constants (true constants) | `SCREAMING_SNAKE_CASE` | `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE` |
| Booleans | `is*`, `has*`, `should*` prefix | `isActive`, `hasCompletedOnboarding` |
| Event handlers | `handle*` prefix | `handleSubmit`, `handleClick` |
| Handler props | `on*` prefix | `onClick`, `onSelect` |
| DB columns | `snake_case` (see `knex-migration`) | `user_id`, `created_at` |
| Directories | `kebab-case` | `user-profile`, `order-list` |
| Component files | `PascalCase.tsx` | `ProtectedRoute.tsx` |
| Non-component TS files | `kebab-case.ts` | `use-auth.ts`, `user-service.ts` |

## Imports

- Absolute imports use the `~` alias configured in `tsconfig.json` / `vite.config.ts` (if your project configures one). No `../../../` chains beyond one or two levels.
- Order: external deps first, then internal (`~/...`), then relative (`./...`). The project's import-sort tool enforces this — don't fight it.
- No default imports from internal modules.

## Exports

- **Named exports only.** No `export default` from internal modules.
- `index.ts` barrel files re-export the public API of a folder. Keep them shallow — don't hide deep structure behind a single barrel.
- For a React component file, the component is the public export. Don't re-export a Props interface unless it's part of the consumer contract.

## What "done" looks like

- `yarn lint:fix` passes. No rename warnings.
- No `default` imports/exports in new code.
- No `../../../` chains that should have used `~/`.
