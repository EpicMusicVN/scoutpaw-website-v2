---
phase: 2
title: Page Wiring
status: completed
priority: P2
effort: 45m
dependencies:
  - 1
---

# Phase 2: Page Wiring

## Overview

Make `/shop` async. Fetch products server-side. Mount new section: header + `ProductGrid` (or `ShopEmptyState` fallback) between `ExploreProducts` and `AboutShop`. Add Shopify CDN to image allowlist.

## Requirements

- Functional: live products render in new section. Click → opens `{shop}/products/{handle}` in new tab via existing `ProductCard`. Filter chips still work via `?cat=...`.
- Non-functional: SSR (no client roundtrip for catalog). Empty list → `ShopEmptyState` (no empty grid flash).

## Architecture

```
app/shop/page.tsx (async RSC)
  ├── FullBleedHero (unchanged)
  ├── CloudDivider
  ├── ScrollReveal > ExploreProducts (kept — external tiles)
  ├── CloudDivider
  ├── ScrollReveal > <section> NEW
  │     ├── header (kicker + h2)
  │     └── ProductGrid products={products}  | ShopEmptyState
  ├── CloudDivider
  ├── ScrollReveal > AboutShop
  ├── CloudDivider
  └── ScrollReveal > NewsletterCTA
```

`next.config.ts` `images.remotePatterns` extended with `cdn.shopify.com` so Shopify-hosted product images pass through `next/image`.

## Related Code Files

- Modify: `app/shop/page.tsx` — `export default async function ShopPage()`. `const products = await getProducts();`. Insert new `<section>` with header + grid/empty.
- Modify: `next.config.ts` — add `{ protocol: "https", hostname: "cdn.shopify.com" }` to `images.remotePatterns` (if not already there).
- Read for context: `components/shop/product-grid.tsx`, `components/shop/shop-empty-state.tsx`, `components/shop/product-card.tsx` — no edits expected.

## Implementation Steps

1. Verify current `next.config.ts` `images.remotePatterns`. If `cdn.shopify.com` is absent, add it. If file currently uses `domains`, migrate the entry to `remotePatterns` (it's required for wildcards/protocol).
2. Edit `app/shop/page.tsx`:
   - Add `import { getProducts } from "@/lib/shopify/get-products";`
   - Add `import { ProductGrid } from "@/components/shop/product-grid";`
   - Add `import { ShopEmptyState } from "@/components/shop/shop-empty-state";`
   - Change to `export default async function ShopPage() { const products = await getProducts(); ... }`
   - Insert new section (wrapped in `ScrollReveal`, bracketed by `CloudDivider`) between `ExploreProducts` and `AboutShop`:
     ```tsx
     <ScrollReveal>
       <section id="products" className="mx-auto max-w-hero px-4 py-24 md:px-8 md:py-32">
         <header className="text-center">
           <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm">
             From the Shop
           </p>
           <h2 className="mt-3 font-display text-4xl font-bold heading-gradient-gold-light md:text-6xl lg:text-7xl">
             Fresh from the kennel.
           </h2>
         </header>
         {products.length > 0 ? <ProductGrid products={products} /> : <ShopEmptyState />}
       </section>
     </ScrollReveal>
     ```
   - Confirm `ProductGrid` is `"use client"` — wrapping it inside an async RSC is fine; Next.js handles the boundary.
3. `pnpm typecheck` → must pass. `pnpm lint` → must pass.

## Success Criteria

- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] In `SHOPIFY_MODE=mock`, `/shop` renders 8 mock products in the new section
- [ ] `?cat=plushes` URL filters chips correctly on first paint
- [ ] Empty products array renders `ShopEmptyState`
- [ ] No console errors about unallowed image hosts
- [ ] `ExploreProducts` tiles still link to Linktree / Fourthwall

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Section ID collision with old `#products` anchor (now revived) | Intentional revival; ExploreProducts no longer points at it (May 20 decision) so no broken link. |
| `ScrollReveal` may flash empty grid before reveal | Existing component handles this; verify visually in smoke test. |
| `next.config.ts` already uses Shopify-related domain | Step 1 grep-checks before adding to avoid duplicate entry. |
| ProductGrid as client component in async RSC tree | Standard Next App Router pattern; product data passed as prop. No serialization issues — `ShopProduct` is pure JSON. |
