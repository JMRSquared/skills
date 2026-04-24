---
name: supabase-auth
description: Use when editing auth flows, session handling, or route guards under apps/web/src/domain/auth/**, or any file referencing ProtectedRoute, CandidateProtectedRoute, RecruiterProtectedRoute, or the Supabase auth client. Enforces the Supabase session + React Context + tRPC profile pattern.
---

# Supabase Auth Standards (Wonderhire web)

Apply when touching:
- `apps/web/src/domain/auth/**`
- Any file that imports the Supabase auth client, the session context, or a `*ProtectedRoute` component.

## Session lifecycle

1. Supabase handles authentication (email/password, Google OAuth, password reset).
2. Session is stored in a React Context (`AuthProvider`) at the app root.
3. tRPC queries the user profile once the session is present.
4. Route protection reads from both auth state and profile-completion state.

Do not call `supabase.auth.getSession()` ad hoc inside components — read from the context.

## Route guards

- `ProtectedRoute` — generic signed-in guard.
- `CandidateProtectedRoute` — signed-in + candidate profile complete.
- `RecruiterProtectedRoute` — signed-in + recruiter profile complete.

Picking the wrong guard is a real bug — recruiter guards on candidate pages leak data. Re-read the guard's implementation before reusing it on a new route.

## Session-loaded vs profile-loaded

- `sessionLoaded` — the Supabase session has resolved (may be `null`).
- `profileLoaded` — the tRPC profile query has resolved.

Render a skeleton until the relevant state is loaded. Do not redirect based on `session === null` before `sessionLoaded` is true — you'll redirect authenticated users on a cold start.

## OAuth callback

- The OAuth callback route (`AuthCallback.tsx`) must read the hash, call `supabase.auth.setSession`, then navigate based on profile-completion state.
- Never commit OAuth client secrets. Use SST secrets for the server side; the web app only sees the anon key.

## What "done" looks like

- New route is wrapped in the correct `*ProtectedRoute`.
- Session- and profile-loaded states are handled with skeletons, not redirects.
- `yarn build` + `yarn lint:fix` pass; no `any` on auth context types.
