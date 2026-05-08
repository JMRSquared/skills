---
name: supabase
description: Use when editing Supabase client usage, Postgres/RLS policies, database SQL in Supabase projects, Storage buckets, Realtime channels, Edge Functions, or server-only service-role access. Applies to files importing `@supabase/supabase-js`, Supabase CLI config, or `.sql` migrations targeting Supabase-hosted Postgres. Not the primary skill for Supabase Auth UI flows—pair with `supabase-auth` when auth and data overlap.
---

# Supabase Platform Standards

Use for **Postgres, RLS, Storage, Realtime, Edge Functions, and client boundaries**. For **session, ProtectedRoute, and OAuth callback flows** with Supabase Auth in the app, use **`supabase-auth`** alongside this skill when both data and auth change.

## Client boundaries

- **Anon key** only in browser or public contexts. **Service role** only on trusted servers (API routes, workers, serverless with no user-controlled input to raw SQL). Never bundle the service role into client bundles or mobile apps.
- Create clients with the minimal role needed: user-scoped queries use the user’s JWT; admin scripts use service role in a controlled environment.

## Row Level Security

- Prefer **RLS enabled** on user-facing tables. Policies use **`auth.uid()`** (or your tenant model) consistently — avoid wide-open policies “temporarily”.
- Test policies for both **allowed** and **denied** paths when changing access. A policy bug is a data breach.
- Schema changes that affect RLS belong in the same change unit as the policy updates when possible.

## Realtime and Storage

- **Realtime:** unsubscribe or use scoped channels so tabs and user switches do not leak subscriptions. Treat payload data as untrusted; validate before UI state updates.
- **Storage:** use **signed URLs** or bucket policies matching your RLS story. Do not expose private buckets with public anon upload.

## Edge Functions

- Treat secrets from env; no hardcoded service keys. Validate inputs on the edge the same as in API routes.

## Relationship to migrations

- If the project uses **Knex** (or other SQL) for schema, align naming and constraints with **`knex-migration`**. If schema lives in **Supabase SQL migrations**, keep ordering and policy DDL explicit and reviewable.

## What "done" looks like

- Keys and roles are split correctly; RLS matches the product’s access model.
- No service role in client code; Storage and Realtime respect user boundaries.
- Changes stay reviewable as SQL/policy diffs where applicable.
