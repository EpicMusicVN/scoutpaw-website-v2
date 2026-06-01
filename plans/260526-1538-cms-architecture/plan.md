---
title: "CMS Architecture (Payload 3.0)"
description: "Adopt Payload CMS 3.0 as the headless backend for ScoutPaw. Single-deployment monorepo with Next.js. Incremental migration through the existing content adapter."
status: pending
priority: P1
branch: "main"
tags: [cms, payload, backend, postgres, r2, admin, infra]
blockedBy: []
blocks: []
created: "2026-05-26T08:58:27.570Z"
createdBy: "ck:plan"
source: skill
---

# CMS Architecture (Payload 3.0)

## Overview

Replace static JSON content (`content/*.json`) + sanity-source skeleton with Payload CMS 3.0 running inside the same Next.js deployment. Editors (CNL Team, 1–3 users) log in at `/admin`, edit content with drafts + preview, publish to the live site. Discount enforcement stays in Shopify; CMS owns banner copy + schedule windows only.

Approved design: `plans/reports/brainstorm-260526-1538-cms-architecture.md`.

**Key decisions (user-approved):** Payload CMS 3.0 (Next.js-native, MIT) · single Vercel deployment · Postgres (host TBD: Vercel/Neon/Supabase) · Cloudflare R2 for media (already in stack) · email/password auth · admin + editor roles · drafts + publish + preview · incremental per-collection migration · Shopify-as-truth for discount enforcement.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Foundation](./phase-01-foundation.md) | Pending |
| 2 | [Top Picks Migration](./phase-02-top-picks-migration.md) | Pending |
| 3 | [Promotions Collection](./phase-03-promotions-collection.md) | Pending |
| 4 | [Globals Migration](./phase-04-globals-migration.md) | Pending |
| 5 | [Characters and Channels](./phase-05-characters-and-channels.md) | Pending |
| 6 | [Videos and Playlists](./phase-06-videos-and-playlists.md) | Pending |
| 7 | [Coming Soon Pages](./phase-07-coming-soon-pages.md) | Pending |
| 8 | [Retirement and QA](./phase-08-retirement-and-qa.md) | Pending |

## Dependency Graph

- Phase 1 (Foundation) — independent. Gates everything.
- Phase 2 (Top Picks) — depends on 1. Proof-of-concept for adapter swap pattern.
- Phase 3 (Promotions) — depends on 1. New collection, no JSON migration. Can run parallel to Phase 2 after Phase 1 ships.
- Phase 4 (Globals: SiteConfig + Newsletter + Home) — depends on 1. Low-risk read-only on public side.
- Phase 5 (Characters + Channels) — depends on 1. FKs + image migration. Higher risk.
- Phase 6 (Videos + Playlists) — depends on 5 (Channels FK).
- Phase 7 (Coming Soon) — depends on 5 (Character FK).
- Phase 8 (Retirement + QA) — depends on 2–7 (all collections migrated).

Sequential default: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Phases 2–4 may parallelize after 1.

## Migration Principles

- **One collection per phase.** Per-collection env flag = instant rollback.
- **Zod-first.** Existing `lib/content/schemas.ts` schemas remain the validation contract on the adapter output side.
- **Local API only.** Public reads use Payload Local API (in-process, no HTTP). Zero added latency.
- **SSG/ISR preserved.** Public site rendering model unchanged.
- **Seed-from-JSON scripts.** Each migration ships a one-time seed script that's safe to re-run idempotently.

## Build Verification

Per project convention: `pnpm typecheck` + `pnpm lint` + a live dev-server render gate (concurrent `pnpm dev`; do not run `pnpm build` against a live server — known cache contention). Plus per-phase smoke: log in to `/admin`, create a draft, preview, publish, confirm on public route.

## Architecture (Quick Reference)

```
Vercel single deployment
├── Next.js public app (existing)
│   └── lib/content/sources/payload-source.ts ← reads Payload Local API
├── Payload Admin at /admin
│   ├── Email/pw auth → JWT cookie
│   ├── RBAC: admin / editor
│   └── Drafts + Versions + Preview
└── Payload API at /api/payload/* (admin mutations only)

Postgres (Vercel / Neon / Supabase) ← content + users + drafts + versions
Cloudflare R2 (existing)             ← media uploads via S3-compat adapter
Shopify                              ← discount codes + checkout (truth)
```

## Cost Estimate

- Vercel Pro (if needed for higher conn limits): ~$20/mo
- Postgres (Hobby tiers free, Pro ~$20/mo)
- R2: already in stack, near-free at this volume
- **Total CMS infra cost: $0–40/mo**

## Open Questions (To Resolve Before / During Phase 1)

1. **Postgres host** — Vercel Postgres (frictionless single-deploy story) vs. Neon (better free tier, branch DBs) vs. Supabase (auth/storage bundled but redundant here). Recommendation deferred; pick at Phase 1 install.
2. **2FA scope** — MVP requirement or post-launch? Default: post-launch.
3. **Audit log retention** — Payload versions table grows unbounded. Default policy or compliance-driven cap?
4. **`sanity-source.ts` removal timing** — Delete in Phase 1 with first commit, or keep dormant until Phase 8 retirement? Default: delete in Phase 1 (no consumer).
5. **Admin route exposure** — Public `/admin` URL acceptable, or hide behind subdomain (`admin.scoutpaw.tv`)? Default: same-deployment `/admin`, rate-limited.

## Dependencies

No cross-plan dependencies. Supersedes the dormant Sanity-as-future skeleton wired in `lib/content/sources/sanity-source.ts`.
