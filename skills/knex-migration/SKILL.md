---
name: knex-migration
description: Use when editing Knex migrations under packages/db/migrations/**. Enforces ULID primary keys, snake_case columns, created_at/updated_at timestamps, and explicit foreign-key constraints.
---

# Knex Migration Standards (Wonderhire DB)

Apply when creating or editing a migration under `packages/db/migrations/**`, or when adding a new table / column via Knex in any package.

## Column naming

- `snake_case` for all columns: `user_id`, `created_at`, `completed_at`, `application_status`.
- Boolean columns use an `is_`/`has_` prefix: `is_verified`, `has_completed_onboarding`.

## Primary keys

- ULID strings, not auto-increment integers.
- Column name `id`, type `string` (or `varchar(26)`), not null.
- Generate with the project's ULID helper in application code; do not rely on a DB default.

## Timestamps

- Every table has `created_at` and `updated_at` (TIMESTAMP WITH TIME ZONE), both NOT NULL, both default to `NOW()`.
- `updated_at` is maintained in application code (Objection hooks) — do not rely on DB triggers unless there is an existing pattern.

## Foreign keys

- Always declare the constraint explicitly: `.references('id').inTable('<table>').onDelete('<ACTION>')`.
- Choose `CASCADE` / `SET NULL` / `RESTRICT` consciously. Note the choice in the migration if it's non-obvious.

## Up + down

- Every migration must have a working `down`. No `throw new Error('irreversible')` unless the table is write-only audit data and the user has confirmed.
- `down` reverses the schema change; it does not need to restore deleted rows.

## Ordering

- Migrations run in filename order. Use the existing timestamp prefix convention (do not invent a new one). Check the newest file in the directory before naming a new one.

## What "done" looks like

- `yarn workspace @wonderhire/db migrate:latest` applies cleanly against a fresh DB and against the current dev DB.
- `yarn workspace @wonderhire/db migrate:rollback` reverts cleanly.
- New schema is reflected in the Kysely/Objection types used by callers.
- `yarn build`, `yarn test`, `yarn lint:fix` pass.
