---
name: kysley-db
description: Use when editing files that use Kysely query builder patterns (e.g. importing from `kysely`, using `Kysely`, `sql`, or `Transaction`). Ensures type-safe queries, safe parameter binding, correct transaction usage, and avoids unsafe raw SQL.
---

# Kysely DB Standards

Apply when the stack uses **[Kysely](https://kysely.dev/)** for query building.

## Scope (what this skill covers)

- Building queries via the Kysely query builder (`selectFrom`, `insertInto`, `updateTable`, `deleteFrom`, joins, grouping).
- Using `sql` / raw SQL safely.
- Transactions (`db.transaction().execute(...)`).

## Type safety

- Model your DB schema as a single `Database` type and parameterize your Kysely instance with it (`Kysely<Database>`).
- Keep the schema type source-of-truth in one place and reuse it across query modules.
- Avoid unsafe casts (`as any`, `as unknown as ...`) in the DB/repository layer. If a cast is needed, prefer a narrower typed helper function.

## Query construction

- Prefer explicit column lists over broad selection; avoid “select everything” patterns when the query reads only a few fields.
- When filtering by user/session input, always use Kysely parameter binding (do not interpolate into strings).
- Keep joins explicit and constrained to the needed keys to avoid accidental cross products.

## Raw SQL (`sql`)

- Use `sql` for cases Kysely doesn’t express well, but always rely on bindings rather than string concatenation.
- If you must use raw SQL fragments, wrap them in small typed helpers that return predictable column shapes.
- Never build SQL using `... ${userInput} ...` string concatenation.

## Transactions

- Use `db.transaction().execute(async (trx) => { ... })` for multi-step write sequences.
- Inside a transaction, ensure all queries use `trx` (not the outer `db`).
- Keep the transaction scope minimal: compute non-DB values outside the transaction when possible.

## Pagination

- Always pair `limit` with a deterministic `orderBy`.
- If you implement keyset pagination, base it on a stable, indexed sort key instead of OFFSET for large datasets.

## What "done" looks like

- No unsafe/raw SQL construction from untrusted inputs.
- Typed schema is used consistently across DB modules.
- Transactions correctly use `trx` for all reads/writes in the sequence.
- Build/typecheck and lint pass.

