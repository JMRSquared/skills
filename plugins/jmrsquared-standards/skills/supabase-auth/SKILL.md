---
name: supabase-auth
description: Use when editing Supabase Auth–based app flows: session handling, route guards (`*ProtectedRoute`), or React auth context in your auth domain. For RLS, Storage, Realtime, service-role clients, or SQL policies, use `supabase`; for Better Auth stack, use `better-auth`. Enforces Supabase session + React Context + tRPC profile patterns where that stack applies.
---

# Supabase Auth (application integration)

Use when the product authenticates users **through Supabase Auth** and wires it into your UI and API. For **database policies, keys, and platform APIs**, use **`supabase`**. For **Better Auth**, use **`better-auth`**.

## Session lifecycle

1. Supabase handles authentication (email/password, OAuth providers, password reset) at the platform level — keys and RLS patterns belong in **`supabase`**.
2. Session is stored in a React Context (`AuthProvider`) at the app root.
3. tRPC queries the user profile once the session is present.
4. Route protection reads from both auth state and profile-completion state.

Do not call `supabase.auth.getSession()` ad hoc inside components — read from the context.

## Route guards

- `ProtectedRoute` — generic signed-in guard.
- Role-specific guards (e.g. `AdminProtectedRoute`, `UserProtectedRoute`) — signed-in + role-specific profile complete.

Picking the wrong guard is a real bug — the wrong role guard on a page leaks data. Re-read the guard's implementation before reusing it on a new route.

## Session-loaded vs profile-loaded

- `sessionLoaded` — the Supabase session has resolved (may be `null`).
- `profileLoaded` — the tRPC profile query has resolved.

Render a skeleton until the relevant state is loaded. Do not redirect based on `session === null` before `sessionLoaded` is true — you'll redirect authenticated users on a cold start.

## OAuth callback

- The OAuth callback route (`AuthCallback.tsx`) must read the hash, call `supabase.auth.setSession`, then navigate based on profile-completion state.
- Never commit OAuth client secrets. Use server-side secret management (e.g. SST secrets) for the server side; the web app only sees the anon key.

## What "done" looks like

- New route is wrapped in the correct `*ProtectedRoute`.
- Session- and profile-loaded states are handled with skeletons, not redirects.
- `yarn build` + `yarn lint:fix` pass; no `any` on auth context types.
