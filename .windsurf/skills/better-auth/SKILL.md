---
name: better-auth
description: Use when editing Better Auth configuration, session/API routes, client (`authClient`), plugins (OAuth, 2FA, organization), database adapters (Drizzle/Prisma/Mongo), or framework integration (Next.js, Nuxt, SvelteKit). Activates for files importing from `better-auth` or `@/lib/auth` patterns tied to the official Better Auth setup.
---

# Better Auth Standards

Applies when the stack uses **[Better Auth](https://www.better-auth.com/)** — not Supabase Auth. If the file only uses Supabase for database or RLS, use **`supabase`** (and **`supabase-auth`** for legacy Supabase Auth UI).

## Single configuration surface

- One **authoritative `auth` instance** from `better-auth` (or your project’s thin wrapper). Avoid duplicate `betterAuth({...})` configs with diverging options.
- **`baseURL`**, **`secret`**, and **`trustedOrigins`** match the deployed origin and local dev. Rotating `secret` invalidates sessions — coordinate with deploy docs.

## Server vs client

- **Server:** use `auth.api.*` in Route Handlers, server actions, or tRPC context for session validation and sign-in/out flows that touch cookies or headers.
- **Client:** use the generated **`authClient`** (or framework adapter) in components. Do not reimplement cookie parsing in random hooks — use the library’s session hooks / methods.
- **Types:** extend the user/session types with plugins in one place so `user` stays consistent across server and client.

## Database adapter

- Migrations for Better Auth tables follow the adapter’s schema; keep **indexes** on session and user lookup paths as recommended for your adapter (Drizzle/Prisma).
- Do not hand-edit production session rows; fix bugs in application logic or cookie settings.

## OAuth and security

- Register **exact redirect/callback URLs** in the provider console for each environment.
- Prefer **httpOnly**, **Secure**, **SameSite** cookie settings per framework adapter defaults unless you have a documented exception.

## What "done" looks like

- Config, server handlers, and client usage align with one Better Auth setup.
- Session checks happen through the library APIs, not ad hoc JWT parsing in UI.
- Build and typecheck pass; session and user types are carried through consistently.
