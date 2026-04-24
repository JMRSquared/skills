---
name: tanstack-trpc-query
description: Use when editing frontend queries or mutations that use TanStack Query + tRPC. Enforces useQuery/useMutation patterns, explicit loading/error states, and correct cache invalidation after writes.
---

# TanStack Query + tRPC Patterns (Wonderhire web)

Apply when adding or editing frontend data-fetching code that uses TanStack Query via the tRPC React client.

## Reads — `useQuery`

- Destructure `data`, `isLoading`, `isError`, `error` from the query result.
- Handle `isLoading` and `isError` explicitly in the UI. Do not render `data.x` without narrowing — `data` is `undefined` until loaded.
- Set `enabled: false` (or a boolean guard) when the query depends on an input that may be missing. Avoid running a query with a placeholder input that would poison the cache.

## Writes — `useMutation`

- Always invalidate the relevant queries on `onSuccess`. Never hand-patch the cache via `setQueryData` unless an optimistic update is explicitly wanted and tested.
- Show a pending state (`isPending`) on the triggering UI. Disable the submit button while pending.
- Surface `error.message` (or a mapped friendly message) on failure. Do not swallow.

## Cache invalidation

- Prefer `utils.<router>.<procedure>.invalidate()` over a blanket `queryClient.invalidateQueries()`.
- If a mutation affects multiple queries, invalidate each by its typed handle — avoids invalidating unrelated queries and re-fetching the world.

## Error boundaries

- Route-level error boundary catches anything that escapes. Component-level errors are surfaced via `isError` + inline message.

## What "done" looks like

- Loading / error / success states are all handled in the UI.
- Mutations invalidate the right queries.
- No `any` on query/mutation generics — tRPC provides the types, use them.
- `yarn build` + `yarn lint:fix` pass.
