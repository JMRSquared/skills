---
name: code-quality
description: Use on any code change. Enforces DRY, single responsibility, early returns, one step per line, lookup objects over if-chains, strict TypeScript (no any, no unchecked indexing, no casts, explicit return types), one intermediate representation, escaping in generated code, Zod at every runtime boundary, errors that say how to fix the failure, integer money, one parsed config, no swallowed or floating work, minimal comments, forward edits that leave history to git, and domain folders grouped by product concept.
version: 1.2.0
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

## No pass-through wrapper

A function that only forwards its arguments is deleted. The caller uses the real function.

```ts
// Good
await saveOrder(order);

// Bad
async function persistOrder(order: Order): Promise<void> {
  await saveOrder(order);
}
```

## Single responsibility

- One function should do one thing. If you're writing `fetchAndScoreAndNotifyUser`, split it.
- One component should render one conceptual surface. Break wrappers apart when a child needs props its parent doesn't.

## Ask for the fields you use

Pass the fields the function reads. Do not pass the whole object when two fields are enough.

```ts
// Good
formatLine(product.name, product.priceCents);

// Bad
formatLine(product);
```

## No boolean parameters

A boolean argument hides the two cases in the call. Use two functions, or one argument whose type names the cases.

```ts
// Good
shipCollect(order);
shipDeliver(order);

// Bad
ship(order, true);
```

## Domain folders

Group code by product concept, not by kind of file. The shelf and the cart belong to the shop. They do not go in a top-level `components/` and a top-level `utils/`.

```
src/
  domain/                  # singular: one folder, many concepts
    shop/
      shelf.ts
      cart.ts
      index.ts
    checkout/
      checkout.ts
      index.ts
    shared/                # used by more than one domain
      format-rand.ts
      index.ts
```

- `domain/` is singular. A domain owns one product concept (`shop`, `checkout`, `auth`). The folder name is kebab-case.
- Code used by more than one domain in the same app lives under `domain/shared/<area>/`, as its own small domain. A helper used across apps still lives in the shared package, as the DRY section says.
- A module sits at the domain root. Add a bucket only for a kind of file the domain actually has, such as `components/`, `hooks/` or `context/`. Do not add an empty bucket, and do not add a `screens/` bucket.
- A Zod schema sits at the domain root as `<concept>.schema.ts`.
- Each domain root has an `index.ts` that re-exports its public surface. Other code imports from `~/domain/<name>`. It does not import a deep path such as `~/domain/shop/shelf`.
- An entry file stays thin. A route, a page or a function handler imports from the domain and starts that work. The behaviour lives in the domain.
- A UI primitive with no product concept (`Button`, `Input`, `Loader`) may live in `src/components/` only when at least two unrelated domains use it and it contains no business rules.
- Split a file under `domain/` that passes about 80 lines. Name the new file after the concept it takes with it.

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

## No else

When a branch returns, the lines after it are the other case. Do not write `else` after a `return`, a `throw` or a `continue`.

```ts
// Good
function label(status: Status): string {
  if (status === 'paid') return 'Paid';
  return 'Unpaid';
}

// Bad
function label(status: Status): string {
  if (status === 'paid') {
    return 'Paid';
  } else {
    return 'Unpaid';
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

## No stringly modes

A mode is a union, not `string`. Adding a mode means adding a member and a lookup arm that `assertNever` covers.

```ts
// Good
type OrderStatus = 'unpaid' | 'paid';

// Bad
function mark(status: string): void {
  if (status === 'paid') savePaid();
}
```

## Unknown values fail closed

A value from outside the program that is not in the union is an error. It does not fall through to a default that treats it as a known case.

```ts
// Good
const status = OrderStatusSchema.parse(body.status);

// Bad
const status = body.status === 'paid' ? 'paid' : 'unpaid';
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

## No casts

`as` and `!` appear only on the line that just parsed a value with Zod. Everywhere else the type is already known.

```ts
// Good
const body: CheckoutBody = CheckoutBodySchema.parse(input);

// Bad
const body = input as CheckoutBody;
const fee = settings!.deliveryFeeCents;
```

## Money is an integer of minor units

A price is a count of the smallest currency unit, not a float. The name carries the unit.

```ts
// Good
const totalCents = priceCents * quantity;

// Bad
const total = 19.99 * quantity;
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
- Inside a trusted boundary, rely on TS types. Don't parse again.

## One public type

The Zod schema is the source of a boundary type. The TypeScript type is `z.infer` of that schema. A hand-written twin of the same shape does not sit beside it.

```ts
// Good
const OrderSchema = z.object({ status: z.enum(['unpaid', 'paid']) });
type Order = z.infer<typeof OrderSchema>;

// Bad
type Order = { status: 'unpaid' | 'paid' };
const OrderSchema = z.object({ status: z.enum(['unpaid', 'paid']) });
```

## One config module

`process.env` is read in one module, parsed with Zod, and passed in. Feature code does not read `process.env`.

```ts
// Good
const env = EnvSchema.parse(process.env);
startCheckout(env.PAYSTACK_SECRET);

// Bad
const secret = process.env.PAYSTACK_SECRET;
```

## Missing and empty

`??` replaces only `null` and `undefined`. `||` also replaces `0` and `''`. Use `??` when a real zero or a real empty string must survive.

```ts
// Good
const deliveryFeeCents = settings.deliveryFeeCents ?? 5000;

// Bad: a free delivery becomes R50
const deliveryFeeCents = settings.deliveryFeeCents || 5000;
```

## Errors

An error says what failed and how to fix it.

```ts
// Good
throw new Error('Paystack secret missing. Set PAYSTACK_SECRET on the function.');

// Bad
throw new Error('failed');
```

A `catch` handles that case, or it adds the cause and throws. It does not log and continue, and it does not use an empty `catch`.

```ts
// Good
try {
  await markPaid(reference);
} catch (cause) {
  throw new Error(`Could not mark ${reference} paid.`, { cause });
}

// Bad
try {
  await markPaid(reference);
} catch {
  console.log('mark paid failed');
}
```

## Expected results

A case the program expects, such as a hidden product, returns a result. `throw` is for a broken invariant.

```ts
// Good
if (product.hidden) return { ok: false, reason: 'hidden' };

// Bad
if (product.hidden) throw new Error('hidden');
```

## Do not mutate inputs

A function returns a new value. It does not push onto an array or object it was given.

```ts
// Good
function withLine(lines: CartLine[], line: CartLine): CartLine[] {
  return [...lines, line];
}

// Bad
function addLine(lines: CartLine[], line: CartLine): void {
  lines.push(line);
}
```

## Inject the clock, the random source and the id

`new Date()`, `Math.random()` and an id factory are arguments. A test passes a fixed value.

```ts
// Good
function openOrder(input: OrderInput, now: Date, id: string): Order {
  return { id, createdAt: now.toISOString(), ...input };
}

// Bad
function openOrder(input: OrderInput): Order {
  return { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...input };
}
```

## Async work

Independent reads run together. A step that needs an earlier result waits.

```ts
// Good
const [products, settings] = await Promise.all([loadProducts(), loadSettings()]);

// Bad: the second call does not need the first
const products = await loadProducts();
const settings = await loadSettings();
```

An async call is awaited, or it is passed to a named runner. It is not left floating.

```ts
// Good
await saveOrder(order);

// Bad
saveOrder(order);
```

## Close what you open

A file, a client or a subscription is released on the failure path as well as the success path.

```ts
// Good
const client = createClient();
try {
  return await client.query(sql);
} finally {
  await client.end();
}

// Bad
const client = createClient();
return client.query(sql);
```

## Change it forward

Write the code as it should work now. Git holds what it used to be. Do not keep the old implementation in a comment, a dead branch, a renamed alias, or a note that says what the function used to be called.

A live caller outside this change can keep a real code path. That path is current behaviour, not a souvenir.

```ts
// Good
export function formatRand(cents: number): string {
  return `R${(cents / 100).toFixed(2)}`;
}

// Bad
// Previously formatPrice(rands). Kept so old imports still read clearly.
export function formatRand(cents: number): string {
  return `R${(cents / 100).toFixed(2)}`;
}

/** @deprecated use formatRand */
export function formatPrice(rands: number): string {
  return formatRand(Math.round(rands * 100));
}
```

## Comments

- Self-documenting names first. A good name beats a comment.
- Comments allowed only when the why is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug, behaviour that would surprise a reader.
- No comments that restate the code. No TODOs without a linked ticket.
- No commented-out code and no "was" or "previously" notes. See Change it forward.

## What "done" looks like

- No `any`.
- No nested-if pyramids when early returns or lookup objects would do.
- No dense one-liners that hide several steps. No repeated identical calls.
- No top-level function without a return type. No unchecked `[0]` indexing.
- No unescaped values in generated code.
- No extracted helpers with five parameters papering over three different call sites.
- No drive-by comments that restate the code.
- Product code lives under `domain/<concept>/`, imported from `~/domain/<name>`. No top-level bucket by file type.
- No `else` after a `return`, `throw` or `continue`.
- No `as` or `!` except on the line that just parsed with Zod.
- An unknown external mode is an error. Modes are unions, not `string`.
- Money is an integer of minor units, and the name says the unit.
- `process.env` is read in one parsed config module.
- Errors name the failure and the fix. No empty `catch`. Expected cases return a result.
- Clock, random and id values are arguments.
- Inputs are not mutated. A function takes the fields it reads. No boolean parameters. No pass-through wrapper.
- `??` keeps a real zero. Independent reads use `Promise.all`. No floating promise. Opened resources are closed in `finally`.
- One Zod schema, one `z.infer` type. No commented-out code and no leftover alias for the old name.
- The edit is the current code. Git holds the previous version.
- `yarn build` + `yarn test` + `yarn lint:fix` pass.
