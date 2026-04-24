---
name: sst-infra
description: Use when editing infra/**, sst.config.ts, or adding SST resources. Enforces stage-based configuration, SST secret management, af-south-1 region, and defers to wonderhire-standing-rules for deployment safety.
---

# SST Infra Standards (Wonderhire)

Apply when touching `infra/**`, `sst.config.ts`, or any SST resource definition.

## Stages

- Two named stages: `dev` and `prod`. Do not introduce ad-hoc stages without asking the user — CI pipelines key off these names.
- Resource names are stage-scoped. Never hard-code `-prod` or `-dev` into a resource name; let SST interpolate the stage.

## Region

- `af-south-1` for all Wonderhire resources. If a new resource needs a different region, flag it and confirm with the user before adding a second region.

## Secrets

- Use SST secrets (`sst.Secret`) for every credential — Supabase keys, DB connection strings, third-party API tokens.
- `.env.local` / `.env` are for local dev only. Never commit `.env*` files containing real credentials (see `.sst-secrets.example` for the shape).

## Functions / API Gateway

- Lambda functions are defined in `infra/`. The tRPC API is served by a single handler that wraps the Express app for production.
- API Gateway v2 (HTTP API), not v1. Custom domains are set up in `infra/` — do not inline domain config at the function level.

## Static site

- Frontend is S3 + CloudFront via SST `StaticSite`. Do not introduce a second hosting mechanism without user discussion.

## Deployment safety

- `wonderhire-standing-rules` rule #1 overrides this skill: **never run `sst deploy`** without explicit user confirmation in the current turn.
- `sst dev` is the right tool for local iteration — it proxies Lambda calls to your local code.

## What "done" looks like

- New resource has a stage-scoped name.
- Region is `af-south-1` unless explicitly flagged.
- Secrets go through `sst.Secret`; no hard-coded credentials.
- `yarn build` succeeds (type-checks `sst.config.ts`).
