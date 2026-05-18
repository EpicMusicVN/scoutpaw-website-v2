---
title: Website Content & Asset Refresh
description: >-
  Home + shop content refresh: strip MenuCards backdrops, fix Max character data
  swap, point promotion banner at new R2 jpg, rebrand Shop explore tiles, purge
  stale CDN images.
status: pending
priority: P2
branch: main
tags:
  - home
  - shop
  - content
  - assets
blockedBy: []
blocks: []
created: '2026-05-18T00:04:20.258Z'
createdBy: 'ck:plan'
source: skill
---

# Website Content & Asset Refresh

## Overview

Apply five small but cross-cutting changes informed by the approved brainstorm at
`plans/reports/brainstorm-260518-0645-website-content-asset-refresh.md`:

1. **MenuCards (home)** — drop colored backdrop + decorative overlays, keep rounded float box transparent.
2. **Character data** — swap `content/characters.json` slug `max` ↔ `buddy` so `Max` is the Golden Retriever (resolves a pre-existing data shuffle that mislabels the spotlight hero).
3. **Promotion banner (home)** — switch FeatureBanner image from `shop/promotion.png` to new `shop/promotion.jpg` (already in R2).
4. **ExploreProducts (shop)** — override tile titles (`Plushes` → `Dog Calming & Essentials Collection`, `Apparel` → `Dog owner gifts`), refresh copy, update section subtitle. Routing/category slugs untouched.
5. **CDN cache** — manual Cloudflare purge for `shop/1.png`, `shop/2.png`, `shop/banner.png`, `shop/promotion.jpg` (+ old `promotion.png`).

All four file edits are independent and land in Phase 1. Phases 2–4 are sequential gates.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Content and Asset Reference Updates](./phase-01-content-and-asset-reference-updates.md) | Completed |
| 2 | [Build Verify](./phase-02-build-verify.md) | Completed |
| 3 | [Deploy and CDN Purge](./phase-03-deploy-and-cdn-purge.md) | Pending |
| 4 | [Post-Deploy Smoke Tests](./phase-04-post-deploy-smoke-tests.md) | Pending |

## Dependencies

None. No cross-plan dependencies detected.

## Out of Scope

- Other character slug/name swaps (`bella`/`oscar`/`rocky` — same shuffle pattern, not user-requested).
- Long-term cache strategy (versioned filenames / query-param hashing). Deferred.
- MenuCards copy review post-flatten — visual check only.

## References

- Brainstorm: `plans/reports/brainstorm-260518-0645-website-content-asset-refresh.md`
