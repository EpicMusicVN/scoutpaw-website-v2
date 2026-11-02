---
title: SEO AEO Code-Max Pass
description: ''
status: completed
priority: P2
branch: feat/seo-aeo-remediation
tags: []
blockedBy: []
blocks: []
created: '2026-06-11T00:32:40.632Z'
createdBy: 'ck:plan'
source: skill
---

# SEO AEO Code-Max Pass

## Overview

Code-max pass on top of the shipped SEO/AEO remediation (`260611-0509`, merged into this branch).
Squeezes every **code-controllable** signal using data already in the repo — no new content/assets.
Honest target ceilings: **Technical ~90, On-Page ~92, AEO ~82** (NOT 100; remaining gap is Ops
content/config tracked in `260611-0509-seo-aeo-remediation/ops-prep-checklist.md`).

Design: `plans/reports/brainstorm-260611-0724-seo-aeo-code-max.md`.

**Locked decisions:** cross-block `@id` entity linking (no single-`@graph` refactor); visible
breadcrumbs on **detail pages only** (`characters/[slug]`, `coming-soon/[slug]`); extend Shopify
Storefront query for `sku` + `availableForSale`. All schema reads the `lib/content` adapter (DRY).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Schema Core Enrichment](./phase-01-schema-core-enrichment.md) | Completed |
| 2 | [Shopify Product Enrichment](./phase-02-shopify-product-enrichment.md) | Completed |
| 3 | [OG Sitemap Metadata](./phase-03-og-sitemap-metadata.md) | Completed |
| 4 | [Visible Breadcrumbs](./phase-04-visible-breadcrumbs.md) | Completed |
| 5 | [Validation & QA](./phase-05-validation-qa.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->
