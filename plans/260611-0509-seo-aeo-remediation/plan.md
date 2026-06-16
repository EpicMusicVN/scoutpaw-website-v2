---
title: SEO & AEO Remediation
description: >-
  Close technical-SEO gaps (robots, sitemap, canonicals) and add
  machine-readable structured data + AEO content so scoutpaw.tv is indexable and
  answer-engine-visible.
status: completed
priority: P2
branch: main
tags:
  - seo
  - aeo
  - structured-data
  - metadata
blockedBy: []
blocks: []
created: '2026-06-10T22:15:36.635Z'
createdBy: 'ck:plan'
source: skill
---

# SEO & AEO Remediation

## Overview

Audit (2026-06-11) scored the live site: Technical SEO 62/100, On-page 70/100, AEO 28/100.
Fundamentals are strong (SSR, per-page metadata, OG/Twitter, semantic HTML) but the site is
**missing every machine-readable discovery surface**: no `robots.txt`, no `sitemap.xml`, no
canonical tags, and **zero JSON-LD structured data** — which makes it near-invisible to AI
answer engines (ChatGPT, Perplexity, Google AI Overviews).

This plan delivers P0+P1+P2 from the brainstorm. All dynamic SEO surfaces read from the
existing `lib/content` adapter so they work identically for `json-source` today and
`payload-source` later (DRY). Target after completion: SEO ~85, AEO ~70.

Source audit + design: `plans/reports/brainstorm-260611-0439-seo-aeo-review.md` (this session).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Technical SEO Foundation](./phase-01-technical-seo-foundation.md) | Completed |
| 2 | [Core Structured Data](./phase-02-core-structured-data.md) | Completed |
| 3 | [Entity Structured Data](./phase-03-entity-structured-data.md) | Completed |
| 4 | [AEO Content](./phase-04-aeo-content.md) | Completed |
| 5 | [Validation & QA](./phase-05-validation-qa.md) | Completed |

## Key Decisions (locked during brainstorm)

- **Data source:** all schema/sitemap logic reads `lib/content` adapter — never hardcoded.
- **Shop Product schema:** emitted **only** when `SHOPIFY_MODE !== "mock"` (never ship mock prices).
- **Top Picks:** Amazon Associates ToS forbids displaying prices without PA-API → **no
  price-bearing schema** for `/top-picks` (BreadcrumbList only, no `Offer`).
- **WebSite schema:** omit `SearchAction` (no on-site query-URL search; existing search is
  client-side filtering only).
- **308 redirect:** apex→www 307 lives in **Vercel dashboard**, not repo (no middleware/
  `vercel.json`) → tracked as an **ops task** in Phase 5, not a code change.
- **FAQ:** plan drafts 5–8 calming-music/dog-wellness Q&A entries; user reviews before merge.

## Dependencies

- No cross-plan blockers. Touches `app/(frontend)/` metadata + new `lib/seo/`, `components/seo/`.
- Coexists with in-progress CMS migration (`plans/260526-1538-cms-architecture`): reads adapter
  interface only, adds no source-specific coupling.

## Build/Verify Constraint

Per memory `build-verification-gate`: `pnpm build` breaks while a dev server runs. Verify each
phase via **typecheck + lint + live render (curl)**, not a full prod build mid-dev.
