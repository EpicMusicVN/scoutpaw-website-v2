---
title: Shopify Admin API on Shop page
description: >-
  Connect site to Shopify via Admin API + render live products in a new
  ProductGrid section on /shop. Replaces unused Storefront client; keeps
  external category tiles.
status: completed
priority: P2
branch: main
tags:
  - shop
  - shopify
  - rsc
blockedBy: []
blocks: []
created: '2026-05-31T19:56:50.279Z'
createdBy: 'ck:plan'
source: skill
---

# Shopify Admin API on Shop page

## Overview

Swap unused Storefront client for a thin Admin API fetch helper. Render live products via async RSC in a new section on `/shop` between `ExploreProducts` (kept) and `AboutShop`. Empty/error → existing `ShopEmptyState`. Mock mode preserved.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Backend Swap](./phase-01-backend-swap.md) | Completed |
| 2 | [Page Wiring](./phase-02-page-wiring.md) | Completed |
| 3 | [Docs and Smoke Test](./phase-03-docs-and-smoke-test.md) | Completed |

## Context

- Brainstorm report: `plans/reports/brainstorm-260601-0256-shopify-admin-shop-products.md`
- Prior decision (reversed by this plan): `plans/reports/brainstorm-260520-2254-shop-explore-external-links.md` — external tiles still kept, just no longer the only surface.

## Key Decisions

- **Admin API** (not Storefront) — single Custom App token, server-only.
- **Raw `fetch`** with Next.js `revalidate` tag — no extra dep, ISR for free.
- **Env rename:** `SHOPIFY_STOREFRONT_TOKEN` → `SHOPIFY_ADMIN_TOKEN`. User's `REVALIDATE_*` names rejected as misleading.
- **Page composition:** Hero → ExploreProducts (external tiles, kept) → **ProductGrid (new, live)** → AboutShop → Newsletter.

## Dependencies

None. Mocks let us ship without live creds; live mode flips on env change.
