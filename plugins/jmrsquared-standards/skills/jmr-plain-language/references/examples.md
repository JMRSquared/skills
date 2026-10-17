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

## Reply that re-explains what the reader knows

Before:

> Yeah, this works around the issue rather than fixing it. The real fix is in `MergeService`: when we move a child under a new parent, it should update `pipeline_id` along with `parent_id`. We can backfill the bad rows from the audit log with `Change.where(field: "pipeline_id", source: "merge")`. I checked QA: 123 past merges, only 6 rows wrong now, so the cleanup is small.
>
> Since `MergeService` is shared and not specific to this account, I'd rather open a separate ticket than widen this PR. The fallback here is fine to keep until then.

After:

> Agreed, this is a workaround. Fixing it properly in `MergeService` would widen this ticket well past its scope: it's shared code, so it means checking the merge flow for every account, plus a backfill for the rows that are already wrong.
>
> I'd rather keep this PR account-specific and open a separate ticket for the `MergeService` fix and the backfill. Let me know if that works.

## Arguing with no one

Before:

> Session tokens are rotated every 24 hours. A tempting approach would be to rotate them by restarting the auth service on a cron job, but that would drop every active session. Rotation happens in place, and clients refresh transparently.

After:

> Session tokens are rotated every 24 hours, in place. Clients refresh transparently.

## Vague connection

Before:

> He is associated with the Rajhans Orchestra, which he founded and conducts. The concerts were organised in connection with the celebrations of Pakistan's 50th anniversary.

After:

> He founded and conducts the Rajhans Orchestra. The concerts were part of the celebrations of Pakistan's 50th anniversary.

## Heading repeated in the first sentence

Before:

> ## Performance
>
> Speed matters.
>
> When users hit a slow page, they leave.

After:

> ## Performance
>
> When users hit a slow page, they leave.

## Knowledge-cutoff disclaimer left in the prose

Before:

> While specific details about the company's founding are not extensively documented in readily available sources, it appears to have been established sometime in the 1990s.

After:

> The company's founding date is not in the public sources we have.

## Bold-as-decoration labeled list

Before:

> - **User Experience:** The user experience has been significantly improved with a new interface.
> - **Performance:** Performance has been enhanced through optimized algorithms.
> - **Security:** Security has been strengthened with end-to-end encryption.

After:

> The update improves the interface, speeds up load times through optimized algorithms, and adds end-to-end encryption.
