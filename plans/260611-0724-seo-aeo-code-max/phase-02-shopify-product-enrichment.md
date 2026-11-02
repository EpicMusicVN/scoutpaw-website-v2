---
phase: 2
title: Shopify Product Enrichment
status: completed
priority: P2
effort: 2h
dependencies:
  - 1
---

# Phase 2: Shopify Product Enrichment

## Overview
Extend the Shopify Storefront query to fetch `availableForSale` + first-variant `sku`, thread them
through the product type + mapper, and wire them into the Product schema (accurate availability +
sku for rich results). Live-mode only — mock products unaffected.

## Requirements
- Functional: `PRODUCTS_QUERY` returns `availableForSale` and first variant `sku`.
- Functional: `ShopProduct` carries `availableForSale: boolean` + `sku: string | null`.
- Functional: `productSchema` emits `Offer.availability` from `availableForSale` and `sku` when present.
- Non-functional: mock path + existing fields untouched; live-fetch errors still return `[]`.

## Architecture
- `lib/shopify/queries.ts`: add `availableForSale` to the product node and `variants(first: 1) { nodes { sku } }`.
- `lib/shopify/types.ts`: extend `ShopProductSchema` with `availableForSale: z.boolean().default(true)`,
  `sku: z.string().nullable().default(null)`.
- `lib/shopify/get-products.ts`: map `node.availableForSale` and `node.variants.nodes[0]?.sku ?? null`
  in `mapNode`; add to the `LiveResponseNode` type.
- `lib/seo/structured-data.ts` (`productSchema`): `availability` =
  `product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"`;
  add `sku: product.sku` when non-null.

## Related Code Files
- Modify: `lib/shopify/queries.ts`
- Modify: `lib/shopify/types.ts`
- Modify: `lib/shopify/get-products.ts`
- Modify: `lib/seo/structured-data.ts` — `productSchema` availability + sku
- Verify: `lib/shopify/mock-products.ts` still parses (schema defaults fill new fields)

## Implementation Steps
1. Add `availableForSale` + `variants(first:1){nodes{sku}}` to `PRODUCTS_QUERY`.
2. Extend `ShopProductSchema` + `LiveResponseNode` type; map new fields in `mapNode`.
3. Wire availability + sku into `productSchema`.
4. Confirm `mock-products.ts` parses (schema defaults cover new fields).
5. `tsc`/lint; if live creds available, curl `/shop` and verify `availability`/`sku`; else confirm mock path unaffected.

## Success Criteria
- [ ] Live Shopify Product schema shows real `availability` (In/OutOfStock) + `sku` when present.
- [ ] Mock mode unchanged (no Product schema, no parse errors).
- [ ] `tsc`/lint clean.

## Risk Assessment
- **Storefront API field/version drift** → `availableForSale` + variant `sku` are stable Storefront
  fields; existing try/catch returns `[]` on error (no broken schema).
- **mock-products missing new fields** → schema `.default()` fills them; verify parse at boot.
