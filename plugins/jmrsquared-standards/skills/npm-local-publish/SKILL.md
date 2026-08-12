---
name: npm-local-publish
description: Publish npm packages locally when CI Trusted Publishing fails or the user asks to release/publish to npm with 2FA. Use Dia browser + TTY expect flow. Triggers on "publish to npm", "npm publish", "release package", ENEEDAUTH/EOTP, or /npm-local-publish. Do not scrape redacted auth/cli URLs or use macOS OTP dialogs.
---

# npm Local Publish (Dia + TTY)

**Companion:** `/npm-local-publish`

Use when the user asks to **release / publish to npm**, CI publish fails with `ENEEDAUTH` / `EOTP`, or a version is on git but missing from the registry.

## Hard lessons (do not repeat)

1. **npm redacts** `https://www.npmjs.com/auth/cli/...` in non-TTY and logged output as `auth/cli/***`. Scraping logs or piped stdout and `open`ing that URL opens a **404**.
2. **Web OTP only runs with a real TTY.** In `npm/lib/utils/auth.js`, `otplease` opens the browser only when `stdin` and `stdout` are TTYs. Piped `npm publish` throws `EOTP` instead.
3. With a TTY, npm prints the **real** auth URL (`redact: false`), then waits for **ENTER** before opening the configured browser.
4. **Browser must be Dia** on this machine: `npm config set browser 'open -a Dia'`.
5. **No macOS `osascript` OTP dialogs.** Approve in Dia, or paste a 6-digit authenticator OTP in chat for `--otp=`.
6. **`npm login --auth-type=web`** prints a non-redacted `https://www.npmjs.com/login?next=/login/cli/<uuid>` URL. Open that in Dia if login is stale. Login alone does **not** skip publish OTP when the account requires OTP on write.

## Script (portable)

`scripts/publish-local.mjs` in this skill — copy into the package repo as `scripts/publish-local.mjs` (or keep using the package’s own copy) and wire:

```json
"scripts": {
  "publish:local": "node ./scripts/publish-local.mjs"
}
```

Resolve the skill script from the installed skill path when copying, e.g. `skills/npm-local-publish/scripts/publish-local.mjs` in this standards repo.

## Default release path

1. Bump `package.json` version.
2. Commit + push `main` (CI may still fail OIDC until Trusted Publisher is fixed).
3. Publish locally with the recipe below.
4. Verify: `npm view <package-name> version`

Works for `create-jmrsquared-website-template` and any other public scoped/unscoped package on the same machine/account.

## Working recipe (copy/run)

```bash
npm config set browser 'open -a Dia'

cd /path/to/package

# Prefer the package script when present:
yarn publish:local
# or
node ./scripts/publish-local.mjs

# Inline fallback (no package script yet):
expect <<'EXPECT'
set timeout 300
spawn npm publish --access public --registry https://registry.npmjs.org/
expect {
  -re {Press ENTER to open in the browser} {
    send "\r"
    exp_continue
  }
  eof
}
catch wait result
exit [lindex $result 3]
EXPECT

npm view <package-name> version --registry https://registry.npmjs.org/
```

### What you tell the user

- Dia will open the npm auth page after Enter is sent automatically.
- They approve the CLI login / publish grant in Dia.
- Do not ask them to open a scraped `auth/cli/***` link.
- Optional fallback: they paste a 6-digit authenticator code → `npm publish --access public --otp=<code>`.

## Stale login

```bash
npm config set browser 'open -a Dia'
npm login --auth-type=web --registry https://registry.npmjs.org/
```

If the login URL appears as `login?next=/login/cli/...`, run `open -a Dia '<url>'` and activate Dia. Wait until `Logged in on https://registry.npmjs.org/.` Then run the publish recipe.

## Forbidden / failed approaches

| Approach | Why it fails |
|----------|----------------|
| `open` / Safari / Firefox on `auth/cli/***` | Token stripped → 404 |
| Pipe `npm publish` without TTY | No browser opener; bare `EOTP` |
| `script` + `/dev/null` stdin | Prints URL then hangs on ENTER forever |
| `osascript` display dialog for OTP | Not the working path |
| Rely on CI Trusted Publishing alone | Can `ENEEDAUTH` until npm Trusted Publisher matches the publish workflow |
| Empty `NODE_AUTH_TOKEN` / setup-node `registry-url` auth lines in OIDC CI | Blocks OIDC; keep CI fixes separate from local Dia publish |

## CI note

Keep fixing Trusted Publishing (OIDC, no `NODE_AUTH_TOKEN`, empty npmrc, workflow registered on npm). Until that ships cleanly, **local Dia + expect is the release path**.

## Done check

- [ ] `npm view <name>@<version> version` returns the new version
- [ ] Package page in Dia shows the new version under Versions
- [ ] User was not asked to open a redacted `auth/cli/***` URL
