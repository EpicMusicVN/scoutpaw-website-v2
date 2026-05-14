---
title: Cartoon Dog Character Website MVP
description: >-
  Bluey-style brand website. Home + Shop MVP. CMS-ready content adapter. Next.js
  15 + Vercel.
status: completed
priority: P2
branch: ''
tags:
  - nextjs
  - shopify
  - marketing
  - mvp
blockedBy: []
blocks: []
created: '2026-05-06T09:16:06.725Z'
createdBy: 'ck:plan'
source: skill
---

# Cartoon Dog Character Website MVP

## Overview

ScoutPaw TV — visual + musical companion brand for dogs (and the pet-parents who buy for them). 5 character cartoon dogs (Buddy/Max/Bella/Oscar/Rocky). MVP ships Home + Shop with 4 Coming Soon themed placeholders (Watch/Games/Activities/About). Architecture uses **Content Adapter pattern** — JSON files now, Sanity/Payload swap later w/o rewrite. Vercel deploy on default `*.vercel.app` (custom domain post-MVP).

**Audience:** dual — dogs viewing (calm motion, dog-vision palette: blues/yellows/warm browns) + pet-parents reading/buying.

**Source brainstorm:** [../reports/brainstorm-260506-1612-cartoon-dog-website-mvp.md](../reports/brainstorm-260506-1612-cartoon-dog-website-mvp.md)
**Decisions log:** [./reports/decisions-260506-1644-open-questions-resolved.md](./reports/decisions-260506-1644-open-questions-resolved.md)

## Stack

Next.js 15 App Router · TypeScript · Tailwind · Framer Motion · Lottie · Shopify Storefront API · ConvertKit · Plausible/GA4 · Vercel

## Phases

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1 | [Env Setup](./phase-01-env-setup.md) | Completed | 2h |
| 2 | [Content Layer](./phase-02-content-layer.md) | Completed | 4h |
| 3 | [Shared UI](./phase-03-shared-ui.md) | Completed | 6h |
| 4 | [Home Page](./phase-04-home-page.md) | Completed | 8h |
| 5 | [Shop Page](./phase-05-shop-page.md) | Completed | 4h |
| 6 | [Character Detail Pages](./phase-06-character-detail-pages.md) | Completed | 3h |
| 7 | [Coming Soon Pages](./phase-07-coming-soon-pages.md) | Completed | 3h |
| 8 | [Newsletter API](./phase-08-newsletter-api.md) | Completed | 2h |
| 9 | [Analytics & Perf](./phase-09-analytics-perf.md) | Completed | 3h |
| 10 | [Deploy](./phase-10-deploy.md) | Completed | 2h |

**Total estimate:** ~37h.

## Key Constraints

- JS bundle ≤ 200KB initial
- Lighthouse ≥ 90 on Home + Shop
- Zero rewrite when migrating JSON → Sanity (validate with mock adapter)
- Buy Now must redirect to Shopify (no in-site cart)
- Kids/COPPA-safe: no PII without parental gate

## External Services Status

| Service | Status | Impact |
|---|---|---|
| Shopify | Not set up yet | Phase 5 builds w/ MOCK products + same schema; swap to live when ready |
| ConvertKit | Not started | Phase 8 stubs API (logs payload, returns 200); swap to real when ready |
| GA4 | Account TBD | Phase 9 writes script tag + event helper; activate w/ measurement ID at launch |
| Domain | Vercel default | Phase 10 ships on `*.vercel.app`; custom domain is post-MVP followup |

**Result:** zero external blockers for build. All swap-points are env-flag flips.
