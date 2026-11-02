---
phase: 5
title: Validation & QA
status: completed
priority: P2
effort: 1.5h
dependencies:
  - 1
  - 2
  - 3
  - 4
---

# Phase 5: Validation & QA

## Overview
Verify every enriched surface end-to-end: typecheck/lint, live endpoint render, JSON-LD field
presence, and (post-deploy) Google Rich Results Test on the new VideoObject/Product richness.

## Requirements
- All endpoints still 200; all enriched JSON-LD valid.
- `@id` references resolve (Org ↔ WebSite ↔ Video.publisher ↔ Product.brand).
- Update the audit dashboard ceilings to reflect the code-max pass.

## Architecture
Validation only. Reuses `seo-audit-dashboard.html` numbers from the prior plan — bump the
"code now" ceilings (≈90/92/82) after verification.

## Related Code Files
- None (verification). Optionally update `plans/260611-0509-seo-aeo-remediation/seo-audit-dashboard.html`
  ceilings + `docs/project-changelog.md`.

## Implementation Steps
1. `npx tsc --noEmit` + `npx next lint` clean.
2. Restart `pnpm dev`; curl `/`, `/watch`, `/shop`, `/sitemap.xml`, character + coming-soon pages.
3. Grep JSON-LD for new fields: VideoObject `duration`/`interactionStatistic`/`publisher`,
   Org `@id`/`alternateName`/`slogan`, Product `brand`/`itemCondition`/`sku`/availability.
4. Confirm `@id` strings match across blocks (Org id referenced by Video.publisher + Product.brand).
5. Verify visible breadcrumbs render on detail pages + OG image dims/alt + sitemap images.
6. Post-deploy: Google Rich Results Test on a video + product URL; Schema.org validator on each type.
7. Bump dashboard ceilings + add changelog entry.

## Success Criteria
- [ ] tsc + lint clean; all endpoints 200.
- [ ] All new JSON-LD fields present + `@id` refs consistent.
- [ ] Visible breadcrumbs + OG dims + image sitemap verified.
- [ ] Rich Results Test passes for VideoObject + Product (post-deploy).
- [ ] Dashboard ceilings + changelog updated.

## Risk Assessment
- **Rich Results needs public URL** → validate JSON-LD locally with Schema.org validator pre-deploy;
  run Rich Results post-deploy.
- **Dev-server stale metadata** → restart dev before curl (per `metadata-routes-app-root` memory).
