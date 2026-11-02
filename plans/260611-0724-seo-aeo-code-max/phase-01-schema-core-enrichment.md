---
phase: 1
title: Schema Core Enrichment
status: completed
priority: P1
effort: 3h
dependencies: []
---

# Phase 1: Schema Core Enrichment

## Overview
Enrich the existing JSON-LD builders with richer, already-available data and connect entities via
stable `@id` references — the single biggest AEO lever in this pass. All changes live in
`lib/seo/structured-data.ts`; call sites (layout, watch) need no signature changes.

## Requirements
- Functional: VideoObject gains `duration` (ISO 8601), `interactionStatistic` (viewCount),
  `publisher` (→Org `@id`), `contentUrl`, and a non-echo `description`.
- Functional: Organization + WebSite expose stable `@id`; Org gains `alternateName` + `slogan`;
  WebSite gains `publisher`→Org. Product gains `brand`→Org + `itemCondition`.
- Non-functional: `@id` strings centralized as constants (identical across blocks or refs break).
- Non-functional: duration parser tolerant of `M:SS` and `H:MM:SS`; skip `duration` if unparseable.

## Architecture
In `lib/seo/structured-data.ts`:
- Add `@id` constants: `orgId(siteUrl) = ${siteUrl}#organization`, `websiteId(siteUrl) = ${siteUrl}#website`.
- `organizationSchema`: add `"@id": orgId`, `alternateName: config.brand.name`, `slogan: config.brand.tagline`.
- `websiteSchema`: add `"@id": websiteId`, `publisher: { "@id": orgId }`.
- `videoObjectSchema(video, siteUrl)` (add `siteUrl` param): `duration` via `isoDuration(video.duration)`,
  `interactionStatistic: { "@type": "InteractionCounter", interactionType: "https://schema.org/WatchAction", userInteractionCount: video.viewCount }` (only if viewCount present),
  `publisher: { "@id": orgId(siteUrl) }`, `contentUrl` (already), `description` fallback
  `"${title} — calming video from ScoutPaw TV"`.
- `isoDuration(d: string): string | undefined` — split on `:`; 2 parts → `PT${m}M${s}S`, 3 parts →
  `PT${h}H${m}M${s}S`; return undefined on NaN.
- `productSchema(product, siteUrl)` (add `siteUrl`): add `brand: { "@id": orgId(siteUrl) }`,
  `itemCondition: "https://schema.org/NewCondition"`. (sku/availability wired in Phase 2.)

Update call sites to pass `siteUrl`: `watch/page.tsx` (already has `siteUrl`), `shop/page.tsx`
(already has `siteUrl`). Layout already passes siteUrl to org/website.

## Related Code Files
- Modify: `lib/seo/structured-data.ts`
- Modify: `app/(frontend)/watch/page.tsx` — pass `siteUrl` to `videoObjectSchema`
- Modify: `app/(frontend)/shop/page.tsx` — pass `siteUrl` to `productSchema`

## Implementation Steps
1. Add `orgId`/`websiteId` helpers + `isoDuration` parser.
2. Enrich `organizationSchema` + `websiteSchema` with `@id` + new fields.
3. Enrich `videoObjectSchema` (duration, interactionStatistic, publisher, description); add `siteUrl` param.
4. Enrich `productSchema` (brand, itemCondition); add `siteUrl` param.
5. Update `watch/page.tsx` + `shop/page.tsx` call sites.
6. `tsc --noEmit` + `next lint`; curl `/watch` + `/` and grep new fields.

## Success Criteria
- [ ] VideoObject shows `duration` (e.g. `PT1H24M18S`), `interactionStatistic`, `publisher.@id`.
- [ ] Org has `@id` + `alternateName` + `slogan`; WebSite has `@id` + `publisher.@id` matching Org.
- [ ] Product has `brand.@id` + `itemCondition`.
- [ ] `tsc`/lint clean; endpoints still 200.

## Risk Assessment
- **`@id` mismatch** breaks refs → centralize constants, reuse everywhere.
- **Bad duration format** → parser returns undefined, field omitted (valid schema preserved).
