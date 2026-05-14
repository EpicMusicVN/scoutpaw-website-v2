# Brainstorm — Shop Page Content Updates

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Hero image swap, ExploreProducts image swap, hide ProductGrid section.

---

## Asset Inventory

`assets/shop/` contains:
- `banner.png` (1024×572, ~16:9) — new hero
- `1.png` (2048×2048, square) — plushes tile
- `2.png` (2048×2048, square) — apparel tile
- `promotion.png` (existing, will be unused but kept)
- `review.png` (existing, unused)

**Note:** all three new assets need to be copied to `public/assets/shop/` (Next.js Image requires public path).

---

## Locked Changes

| # | Change | Files |
|---|---|---|
| 1 | Copy `banner.png`, `1.png`, `2.png` to `public/assets/shop/` | filesystem |
| 2 | Shop hero image src: `promotion.png` → `banner.png` | `app/shop/page.tsx` |
| 3 | ExploreProducts tile images: golden-2 → `1.png`, husky-bg → `2.png` | `components/shop/explore-products.tsx` |
| 4 | Hide ProductGrid section + preceding CloudDivider | `app/shop/page.tsx` |
| 5 | Remove now-unused imports from `app/shop/page.tsx` | `app/shop/page.tsx` |

---

## File-by-File Change Set

### 1. Asset copy

```
cp assets/shop/banner.png public/assets/shop/
cp assets/shop/1.png public/assets/shop/
cp assets/shop/2.png public/assets/shop/
```

### 2. `app/shop/page.tsx` — Hero image + remove ProductGrid section

```tsx
// Hero: image swap
<FullBleedHero
  ...
  image="/assets/shop/banner.png"  // was promotion.png
  imageAlt="ScoutPaw shop banner"   // tweak alt to match new image
  ...
/>

// Remove: ProductGrid section + CloudDivider above it + Suspense + ShopEmptyState + isMock badge
// (keep ProductGridFallback function for future re-enable, OR delete — KEEP per "temporarily" framing)
```

Net structure after change:
```tsx
<FullBleedHero ... />
<CloudDivider />
<ScrollReveal><ExploreProducts /></ScrollReveal>
<CloudDivider />   // was between Explore and Products — now between Explore and About
<ScrollReveal><AboutShop /></ScrollReveal>
<CloudDivider />
<ScrollReveal><NewsletterCTA tag="shop-newsletter" /></ScrollReveal>
```

**Imports to remove:**
- `Suspense` from "react"
- `ProductGrid` from "@/components/shop/product-grid"
- `ShopEmptyState` from "@/components/shop/shop-empty-state"
- `getProducts` from "@/lib/shopify/get-products"
- The `revalidate` export (not needed without shopify fetch)
- The `const products = await getProducts()` + `isMock` lines
- The `ProductGridFallback` function

Keep these files intact (`product-grid.tsx`, `shop-empty-state.tsx`, `get-products.ts`) for future re-enable.

### 3. `components/shop/explore-products.tsx` — Tile image swaps

```tsx
{
  category: "plushes",
  ...
  image: "/assets/shop/1.png",   // was /assets/characters/golden-2.png
},
{
  category: "apparel",
  ...
  image: "/assets/shop/2.png",   // was /assets/characters/husky-bg.png
},
```

Note: tiles 3 + 4 (prints, accessories) are filtered out via `VISIBLE_CATEGORIES = ["plushes", "apparel"]` — only 2 visible tiles render. Both get new images.

Tile is `aspect-square` (matches the source 2048×2048 squares — no distortion). `object-contain` keeps natural proportions.

---

## Phased Execution

| Phase | Item | Effort |
|---|---|---|
| P1 | Copy 3 PNGs to `public/assets/shop/` | 1m |
| P2 | Update FullBleedHero src in shop page | 1m |
| P3 | Update 2 tile image paths in ExploreProducts | 2m |
| P4 | Remove ProductGrid section + cleanup imports + remove ProductGridFallback | 5m |

**Total: ~10m**

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Banner.png aspect 1024×572 (1.79:1) vs FullBleedHero expects 16:9 (1.778) | None | 0.7% drift, identical to home banner's drift. Acceptable. |
| Square 2048×2048 tile images inside aspect-square tiles — perfect fit | None | Same aspect; object-contain works either way. |
| Removing `revalidate` export changes page caching behavior | Low | Shop page becomes static. Currently caches every 300s; without `getProducts`, no dynamic data to revalidate. |
| Future re-enable requires restoring removed imports | Low | All component files kept; restoring is paste-back. |
| Empty page after removal | Acceptable | ExploreProducts + AboutShop + Newsletter still present. Page has 3 sections + hero + 3 dividers. Solid content. |

---

## Success Criteria

- Hero shows new banner.png
- ExploreProducts shows new 1.png + 2.png
- Page has NO "Shop the Pack." product grid section
- typecheck + lint + build clean (no unused imports)

---

## Out of Scope

- Removing `product-grid.tsx`, `shop-empty-state.tsx`, `get-products.ts` files (kept for future re-enable)
- Newsletter / AboutShop / hero structural changes
- Image optimization / compression

---

## Unresolved Questions

None.
