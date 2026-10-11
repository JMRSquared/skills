---
name: code-quality
description: Use on any code change. Enforces DRY, single responsibility, early returns, one step per line, lookup objects over if-chains, strict TypeScript (no any, no unchecked indexing, explicit return types), one intermediate representation, escaping in generated code, Zod at every runtime boundary, minimal comments.
---

# Code Quality Principles

Applies to every code change in this codebase.

## DRY, but not prematurely

- Don't copy a 20-line block twice. Extract a helper.
- Don't extract a helper for three similar but-not-identical lines — you'll end up with parameters that paper over the differences. Inline repetition beats a premature abstraction.
- Shared utilities live in your shared package directory when they're used across apps; otherwise keep them local to the feature.
- An expression that appears twice with the same meaning gets a named helper, even when it's one line. `${tsType(column)}${column.is_nullable ? ' | null' : ''}` in two renderers becomes `fieldType(column)`.
- When a block repeats the shape of an existing helper (same empty case, open, body, close), give it its own named helper next to the first one. Don't inline the copy in a caller.
- A helper that doesn't use local state lives at module level. Don't redefine it inside the function that calls it.

## Single responsibility

- One function should do one thing. If you're writing `fetchAndScoreAndNotifyUser`, split it.
- One component should render one conceptual surface. Break wrappers apart when a child needs props its parent doesn't.

## Early returns

```ts
// Good
function getStatus(u: User) {
  if (!u.isVerified) return 'unverified';
  if (!u.hasOnboarded) return 'draft';
  return 'active';
}

// Bad — nested
function getStatus(u: User) {
  if (u.isVerified) {
    if (u.hasOnboarded) {
      return 'active';
    } else {
      return 'draft';
    }
  } else {
    return 'unverified';
  }
}
```

## One step per line

- Give each intermediate result its own `const` with a name that says what it holds. Don't chain lookup, fallback, transform and write in one expression.
- No ternary inside a template literal when the template has other interpolations. Pull it into a named `const` first.
- No spread over a ternary (`...(isTable ? [a, b] : [])`) mixed into a larger literal. Name the conditional part first.
- Call a function once per value. Don't call the same function twice for the same result; store it.
- Single-letter names only in tiny conventional scopes: `i` in an index loop, `a`/`b` in a sort comparator. Everywhere else, name what the value is.
- Brace every loop or `if` body that does more than one thing.
- If the formatter wraps a call into an odd shape like `.join(\n'\n',\n)`, the line is doing too much. Split it into named steps.

```ts
// Good
for (const row of rows) {
  const groupKey = getKey(row);
  const group = [...(groups.get(groupKey) ?? []), row];

  groups.set(groupKey, group);
}

// Bad: key computed twice, four operations in one line
for (const row of rows) groups.set(key(row), [...(groups.get(key(row)) ?? []), row]);
```

```ts
// Good
const optionalMark = isOptional ? '?' : '';
return `${column.column_name}${optionalMark}: ${fieldType(column)};`;

// Bad: two ternaries inside one template
return `${column.column_name}${isOptional ? '?' : ''}: ${tsType(column)}${column.is_nullable ? ' | null' : ''};`;
```

## Lookup objects over if-chains

```ts
// Good
const statusLabel: Record<Status, string> = {
  active: 'Active',
  draft: 'Draft',
  unverified: 'Unverified',
};
return statusLabel[status];

// Bad
if (status === 'active') return 'Active';
if (status === 'draft') return 'Draft';
if (status === 'unverified') return 'Unverified';
```

Exhaustiveness check with `never`:

```ts
function assertNever(x: never): never { throw new Error(`unhandled: ${x}`); }
// switch-based lookup with assertNever in default is acceptable; if-chains aren't.
```

## Strict TypeScript

- No `any`. Use `unknown` + narrowing.
- Prefer discriminated unions over optional booleans for state.
- Type component state explicitly when inference is ambiguous.
- Give every top-level function an explicit return type. Inline callbacks can rely on inference.
- Don't index into an array (`items[0]`, `items[items.length - 1]`) unless you checked it's non-empty first. Turn on `noUncheckedIndexedAccess` in `tsconfig.json` so the compiler catches it.
- Read a property from the thing it belongs to. A relation's `relkind` is relation metadata, so pass it in. Don't fish it out of `columns[0]`.

```ts
// Good
function renderRelation(name: string, relkind: string, columns: ColumnRow[]): string {
  const isTable = TABLE_KINDS.has(relkind);
  // ...
}

// Bad: throws on a relation with no columns and has no return type
function renderRelation(name: string, columns: ColumnRow[]) {
  const isTable = TABLE_KINDS.has(columns[0].relkind);
  // ...
}
```

## One intermediate representation

- When building output in stages (generated code, markup, reports), pick one shape for the pieces (such as `string[]` of lines) and join once at the outer edge.
- Don't mix renderers that return pre-joined strings with helpers that split them back on `\n`.
- Don't hardcode indentation inside strings when an `indent()` helper exists. Use one mechanism.

## Escaping in generated code

- Every value interpolated into emitted source (TypeScript, SQL, HTML, shell, JSON) gets escaped for that target. Database identifiers, user input and file names can all contain quotes, spaces or hyphens.
- Use `JSON.stringify(value)` for string literals. Quote object keys that aren't valid identifiers.
- Parameterize SQL values. Never build them with string interpolation.

```ts
// Good
const isIdentifier = /^[A-Za-z_$][\w$]*$/.test(name);
const key = isIdentifier ? name : JSON.stringify(name);

// Bad: emits `order-id?: string;`, which doesn't compile
return `${column.column_name}?: string;`;
```

## Runtime validation

- Zod at every runtime boundary: tRPC input, API response parsing, form submissions, reading from local storage, reading from URL params.
- Inside a trusted boundary, rely on TS types — don't parse again.

## Comments

- Self-documenting names first. A good name beats a comment.
- Comments allowed only when the why is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug, behaviour that would surprise a reader.
- No comments that restate the code. No TODOs without a linked ticket.

## What "done" looks like

- No `any`.
- No nested-if pyramids when early returns or lookup objects would do.
- No dense one-liners that hide several steps. No repeated identical calls.
- No top-level function without a return type. No unchecked `[0]` indexing.
- No unescaped values in generated code.
- No extracted helpers with five parameters papering over three different call sites.
- No drive-by comments that restate the code.
- `yarn build` + `yarn test` + `yarn lint:fix` pass.
