# Brainstorm Report — SEO/AEO Code-Max Pass

Date: 2026-06-11 | Branch: feat/seo-aeo-remediation | Builds on plan `260611-0509-seo-aeo-remediation`

## Problem
Push every **code-controllable** SEO/AEO signal to its ceiling using data already in the repo.
Honest target: **Technical ~90, On-Page ~92, AEO ~82** — NOT 100. The remaining gap is content/
assets/config only Ops can supply (`ops-prep-checklist.md`).

## Approved scope: Tier 1+2+3 (everything)

### Tier 1 — pure-data schema wins
1. **VideoObject enrichment** — all 22 videos have `duration` ("1:24:18"), `viewCount`, `uploadDate`.
   Add: `duration`→ISO 8601 (`PT1H24M18S`), `interactionStatistic` (WatchAction + viewCount),
   `publisher`→Org `@id`, `contentUrl`. Replace title-echo `description` with a templated fallback.
2. **`@id` entity linking** — Organization gets stable `@id` (`${siteUrl}#organization`), WebSite
   `${siteUrl}#website` + `publisher` ref. VideoObject `publisher` + Product `brand` reference the
   Org `@id`. Cross-block refs (no single-`@graph` refactor — KISS).
3. **Organization** — add `alternateName` (brand.name), `slogan` (brand.tagline).
4. **Product** — add `brand`→Org `@id`, `itemCondition` = NewCondition.

### Tier 2 — OG + sitemap + metadata
5. **OG image `width`/`height`/`alt`** — measure `public/assets/banner/banner.png`; declare on all OG
   images. Shared OG-image constant to avoid per-page drift (DRY).
6. **Image sitemap** — attach representative image(s) per sitemap entry (Next `images` field).
7. **Richer root metadata** — `applicationName`, `authors`/`creator`/`publisher`, `category`,
   `formatDetection: { telephone: false }`.

### Tier 3 — higher surface
8. **Visible breadcrumb UI** — `components/ui/breadcrumbs.tsx` (`<nav aria-label="Breadcrumb">`,
   ordered list, `next/link`) on detail/section pages. Shares the trail array with `breadcrumbSchema`
   so visible + structured never drift (DRY).
9. **Shopify query change** — extend `PRODUCTS_QUERY` for `availableForSale` + first variant `sku`;
   thread through `types.ts` + `get-products.ts` → accurate `Offer.availability` + `Product.sku`.

## Files to modify
- `lib/seo/structured-data.ts` — VideoObject/Org/Product enrichment, `@id`s, duration helper, breadcrumb-trail export
- `lib/seo/og-image.ts` (new, small) — shared OG image meta (url + dims + alt)
- `components/seo/json-ld.tsx` — unchanged (cross-block `@id` needs no API change)
- `components/ui/breadcrumbs.tsx` (new) — visible breadcrumb nav
- `app/(frontend)/layout.tsx` — richer metadata, OG dims/alt via og-image helper, Org `@id`
- `app/(frontend)/{watch,shop,characters,characters/[slug],coming-soon/[slug],top-picks}/page.tsx` — visible breadcrumbs; OG dims where page-level OG set
- `app/sitemap.ts` — image entries
- `lib/shopify/{queries.ts,types.ts,get-products.ts}` — availableForSale + sku

## Risks
- **@id mismatch** — `@id` strings must be identical across blocks or refs break. *Mitigation:*
  centralize `@id` constants in `structured-data.ts`.
- **duration parse** — formats vary ("M:SS" vs "H:MM:SS"). *Mitigation:* robust splitter, skip
  `duration` if unparseable (don't emit invalid).
- **Shopify query** — extra fields could fail if storefront API version differs. *Mitigation:*
  fields are standard; live-fetch already wrapped in try/catch → empty array on error.
- **Breadcrumb UI** — visual addition to detail pages. *Mitigation:* minimal, unobtrusive; review render.

## Success criteria
- VideoObject validates with duration + interactionStatistic in Rich Results Test.
- Org/WebSite/Video/Product `@id` references resolve (validator shows linked entities).
- OG images expose width/height/alt; image sitemap valid.
- Visible breadcrumbs render + match schema trail; a11y nav landmark present.
- Live Shopify Product shows real availability + sku.
- `tsc --noEmit` + `next lint` clean; all endpoints still 200.

## Still Ops-only (out of scope — tracked in ops-prep-checklist.md)
Per-page hand-written copy (A1), FAQ expansion (A2), body depth (A3), real OG images (B1), X handle
(C1), founding date/contact (C3), product reviews (C4), content dates (C5), keywords (C6),
Search Console/Bing (D3/D4), 308 + prod www env (D1/D2).

## Open questions
- Visible breadcrumbs on ALL section pages (shop/watch/top-picks) or only true detail pages
  (character/coming-soon)? Section pages are one level deep (Home > X) — lower value.
- OK to bump Shopify Storefront API usage with the extra fields, or keep Product schema as-is?
