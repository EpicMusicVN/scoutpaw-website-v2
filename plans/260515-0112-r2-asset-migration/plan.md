---
title: R2 Asset Migration
description: >-
  Centralize all asset URLs through a single lib/utils/asset-url.ts helper
  backed by NEXT_PUBLIC_R2_BASE_URL (Cloudflare R2 via images.scoutpaw.tv).
  Strip /assets/ prefix from content JSON values. Add R2 hostname to Next
  remotePatterns. Local /assets/ fallback when env empty.
status: completed
priority: P2
branch: ''
tags:
  - infrastructure
  - assets
  - r2
  - cdn
  - refactor
blockedBy: []
blocks: []
created: '2026-05-14T18:17:27.700Z'
createdBy: 'ck:plan'
source: skill
---

# R2 Asset Migration

## Overview

Move 75 asset references across 21 files from local `/assets/*` to Cloudflare R2 via a single helper. R2 bucket already populated by user (`images.scoutpaw.tv` custom domain). All callers use `assetUrl(key)` instead of hardcoded paths. Local `public/assets/` kept as dev fallback when env missing.

Source brainstorm: `plans/reports/brainstorm-260515-0112-r2-asset-migration.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Env + helper + next.config](./phase-01-env-helper-next-config.md) | Completed |
| 2 | [Data layer migration (content JSON + lib)](./phase-02-data-layer-migration-content-json-lib.md) | Completed |
| 3 | [UI layer migration (app + components)](./phase-03-ui-layer-migration-app-components.md) | Completed |
| 4 | [Validation + grep audit](./phase-04-validation-grep-audit.md) | Completed |

## Dependencies

None. Phase 1 lays the foundation; phases 2 and 3 are independent (different layers) and can run in either order or parallel once phase 1 is done. Phase 4 verifies all three.

## Key Files

- **NEW:** `lib/utils/asset-url.ts` — helper.
- **Config:** `.env`, `.env.local.example`, `next.config.ts`.
- **Data:** `content/*.json` (5 files), `lib/content/schemas.ts`, `lib/shopify/mock-products.ts`.
- **UI:** `app/{layout,page,shop/page}.tsx` (3 files), `components/{home,shop,watch}/*.tsx` (~15 files).

## Out of Scope

R2 upload (already done by user), image format optimization, image preloading, removing local `public/assets/`, other cycles (responsive audit, SEO audit, fixes, YouTube API).
