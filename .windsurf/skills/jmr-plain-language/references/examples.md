# Before and after

Each "before" sample breaks the rules on purpose. The "after" fixes it.

## Product announcement

Before:

> We're thrilled to unveil our groundbreaking new platform that leverages cutting-edge AI to revolutionize the customer experience. This game-changing solution seamlessly integrates with your existing ecosystem, empowering teams to unlock new opportunities and navigate the evolving digital landscape. Not only does it optimize workflows, but it also elevates productivity to unprecedented levels.

After:

> Our new platform uses machine learning to answer customer questions faster. It connects to your current tools and cuts the steps needed for common tasks.

## Biography

Before:

> John Smith stands as a pivotal figure in the annals of American industry, a visionary titan whose unwavering commitment to innovation crafted a legacy that continues to illuminate the path forward. His multifaceted contributions to the railroad sector underscore his significance in shaping the nation's economic tapestry.

After:

> John Smith invented a train-coupling device in 1873 that reduced coupling injuries by 90%. He founded three railroad companies and held 47 patents.

## Chat reply after a bug fix

Before:

> You're absolutely right! Great catch — the issue was indeed in the auth middleware. I've successfully implemented a comprehensive fix that ensures robust session handling, and all tests are now passing. ✅
>
> ## Summary
> - **Fixed** token expiry check
> - **Enhanced** error handling
> - **Improved** code readability
>
> Let me know if you need anything else!

After:

> The middleware compared expiry with `<` where it needed `<=`, so tokens stayed valid for one extra second. I changed the comparison and added a test for the boundary. `yarn test` passes (212 tests). I didn't touch the error handling.

## Commit message

Before:

> ✨ feat(auth): seamlessly integrate robust session handling, ensuring a smooth and secure user journey
>
> - Updated src/auth/session.ts
> - Updated src/auth/middleware.ts
> - Added tests

After:

> ✨ feat(auth): refresh the session token before it expires
>
> Users on long forms lost their work when the token expired mid-edit. The client now refreshes five minutes before expiry.

## PR description

Before:

> This PR introduces a comprehensive overhaul of the caching layer, significantly enhancing performance and maintainability. It not only streamlines the codebase but also lays the groundwork for future scalability.
>
> ### Changes
> - Modified `cache.ts`
> - Modified `redis.ts`
> - Updated tests

After:

> Product pages took 1.8 s at p95 because each request built the price table from scratch. This change caches the table in Redis for 60 s and clears it when a price changes.
>
> Check the invalidation in `prices/update.ts`. A missed path there would show stale prices.
>
> Tested: `yarn test` and a local load test (p95 dropped to 240 ms). Not tested: Redis failover.

## Code comment

Before:

```ts
// IMPORTANT: Loop through the users array and filter out inactive users
// Updated to use the new isActive helper
const active = users.filter(isActive);
```

After:

```ts
const active = users.filter(isActive);
```

When a comment earns its place:

```ts
// Stripe retries webhooks for 3 days, so dedupe on event.id.
if (await seen(event.id)) return;
```

## README opening

Before:

> # 🚀 SuperCache
>
> SuperCache is a powerful, lightweight and blazing-fast caching solution designed to seamlessly supercharge your applications. Whether you're building a small side project or an enterprise-grade platform, SuperCache has you covered!

After:

> # SuperCache
>
> SuperCache is an in-memory cache for Node with per-key TTLs and a Redis fallback. Use it to keep repeated database reads out of hot request paths.

## Error message

Before:

> Oops! Something went wrong. Please try again later.

After:

> Couldn't save the invoice: the due date (31 Feb 2026) isn't a real date. Pick a date and save again.

## The ", and" rule

Before:

> The worker reads the queue, retries failed jobs, and logs each attempt, and it stops after five tries.

After:

> The worker reads the queue, retries failed jobs and logs each attempt. It stops after five tries.
