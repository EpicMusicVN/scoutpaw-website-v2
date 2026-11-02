---
title: SEO/AEO On-Page Remediation Batch 2
description: >-
  Fix the open on-page SEO/AEO findings from the 2026-06-18 homepage scan that
  the prior remediation missed: duplicate H1/headings/text (responsive
  dual-render), X-Powered-By header, JSON-LD dateModified freshness, missing
  image alt, reused/overlong internal anchors, and 2+ external citation links.
  Plus an ops/off-site checklist for the non-code findings. Code + schema only.
status: completed
priority: P2
branch: feat/seo-aeo-remediation
tags:
  - seo
  - aeo
  - on-page
  - structured-data
  - accessibility
blockedBy: []
blocks: []
created: '2026-06-17T22:53:18.034Z'
createdBy: 'ck:plan'
source: skill
---

# SEO/AEO On-Page Remediation Batch 2

## Overview

Second on-page remediation pass. Follows the completed `260617-0458-seo-aeo-audit-remediation`
(technical/schema base) and the cancelled `260617-0724-commercial-seo-aeo-buildout`.
A fresh 2026-06-18 homepage scan surfaced findings the first remediation **missed**.

Source brainstorm: `plans/reports/brainstorm-260618-0548-seo-aeo-onpage-batch2.md`.

**Scope:** code fixes + an ops/off-site checklist. **Out of scope:** commercial buildout,
new pages, CMS schema, real-content `updatedAt` wiring.

## Key Finding (root cause)

The "duplicate H1", "duplicate headings", and "2 duplicate text blocks (`Max, Rocky…`)"
findings share **one root cause**: `FullBleedHero` renders its `CardBody` (kicker + `<h1>`
+ description) **twice** — mobile in-flow card (`md:hidden`) and desktop absolute blob
(`hidden md:flex`). CSS hides one per breakpoint, but CSS-blind crawlers count both. The
prior remediation achieved a single *semantic* h1 but never noticed the responsive
dual-render emits two in raw HTML.

## Locked Decisions (from user, 2026-06-18)

- **Scope:** code fixes + ops checklist (off-site/backlinks/clock = documented, not coded).
- **Citations:** science-backed "Why calming works" note on the homepage with 2 credible
  outbound research links (satisfies the AEO check on the audited page).
- **Freshness:** `dateModified` sourced from **build/deploy date** (always fresh, no CMS work).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Hero Dedup](./phase-01-hero-dedup.md) | Completed |
| 2 | [Headers & Freshness Schema](./phase-02-headers-freshness-schema.md) | Completed |
| 3 | [Alt Attributes & Internal Anchors](./phase-03-alt-attributes-internal-anchors.md) | Completed |
| 4 | [AEO External Citations](./phase-04-aeo-external-citations.md) | Completed |
| 5 | [Validation & Ops Checklist](./phase-05-validation-ops-checklist.md) | Completed |

## Off-Site / Ops Findings (NOT code — see Phase 5 checklist)

- **Canonical "points to a different page"** = known **D1** apex↔www host mismatch →
  `NEXT_PUBLIC_SITE_URL=https://www.scoutpaw.tv` in Vercel + apex→www 308.
- **Backlinks** (few links / 1 referring domain / 1 backlink / 1 IP) → digital-PR program.
- **Server clock incorrect** → host/infra; non-issue on Vercel, verify host `Date` header.

## Build/Verify Constraint

Per memory `build-verification-gate`: `pnpm build` breaks while a dev server runs. Verify via
**typecheck + lint + live render** (`next start` + curl/view-source). Confirm single `<h1>` in
raw HTML. Metadata routes stay at `app/` root (memory `metadata-routes-app-root`).

## Dependencies

Independent of other active plans. Shares branch `feat/seo-aeo-remediation`. No blocking
cross-plan deps (commercial buildout is cancelled). Off-site items in Phase 5 hand off to
Ops/Marketing.
