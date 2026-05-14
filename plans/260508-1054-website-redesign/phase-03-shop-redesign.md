---
phase: 3
title: Shop Redesign
status: completed
priority: P2
effort: 1.5d
dependencies:
  - 1
---

# Phase 3: Shop Redesign

## Overview

Rebuild Shop page in 5 sections (Hero / Explore Products / Shop the Pack / About ScoutPaw Shop / Join the Pack) with the same cinematic scale + sticker direction as Home. Premium product cards. Reuses NewsletterCTA from P2.

## Requirements

**Functional:**
- Shop hero zoning matches Home hero (text + character no collision)
- Explore Products: category sticker tiles, hover settle animation
- Product grid: lift on hover, sticker price pill, oversized Buy Now CTA
- About section: 3 trust pillars w/ icons + copy
- Newsletter section reused from Home

**Non-functional:**
- WCAG AA on all body text (current `text-ink/85` on warm bg fails — fix here)
- Hover animations respect reduced-motion
- Product images: lazy below fold, eager above fold
- Existing Shopify Storefront client untouched

## Architecture

**Shop Hero (uses `components/home/cinematic-hero.tsx`):**
- Same zoning as Home hero — text panel left, character on right
- ScoutPaw character holding/with product context (e.g., Buddy w/ plush)
- If no product-context asset: use existing `/assets/shop/promotion.png` w/ overlay panel
- AtmosphereLayer variant `peach`

**Explore Products (`components/shop/explore-products.tsx` — REWRITE):**
- 4 category sticker tiles: Plushes / Apparel / Prints / Accessories
- Each: square aspect, accent bg, illustrated/photo icon, title, hover settle (rotate-0)
- Click → scrolls to filtered section in Shop the Pack (or filter chip state)
- Mobile: 2×2 grid

**Shop the Pack (`components/shop/product-grid.tsx` — KEEP, refactor card):**
- Section header: kicker + h2 + filter chips (All / Plushes / Apparel / Prints / Accessories)
- Filter state: client-side filter on existing products
- Empty state preserved

**Product Card (`components/shop/product-card.tsx` — REWRITE):**
- Sticker shadow at rest, lift + shadow grow on hover
- Image at top, name + price below
- Sticker price pill overlay (e.g. `$24.99` in honey pill, top-right)
- "Buy Now" sticker button (oversized, brand-primary)
- Hover: subtle scale + shadow-cozy-lg

**About ScoutPaw Shop (`components/shop/about-shop.tsx` — REWRITE):**
- 3-column trust pillar layout
- Pillars: "Designed by the pack" / "Made for real homes" / "Ships from our Shopify store"
- Each: large illustrated icon + h3 + 2-line copy

**Buy Now Button (`components/shop/buy-now-button.tsx`):**
- Verify it opens Shopify in new tab w/ analytics event tracking
- Apply new sticker style

## Related Code Files

**Modify:**
- `app/shop/page.tsx` — section order: Hero / ExploreProducts / ProductGrid / AboutShop / NewsletterCTA
- `components/shop/explore-products.tsx` — full rewrite (sticker tiles)
- `components/shop/product-card.tsx` — full rewrite (premium sticker style)
- `components/shop/about-shop.tsx` — full rewrite (3 trust pillars)
- `components/shop/product-grid.tsx` — add filter chips
- `components/shop/buy-now-button.tsx` — sticker style polish

**Delete:** none (all files rewrite in place).

## Implementation Steps

1. Update `app/shop/page.tsx` section order. Wire CinematicHero w/ shop variant.
2. Rewrite `explore-products.tsx`: 4 sticker tiles, hover settle.
3. Rewrite `product-card.tsx`: sticker style, price pill, oversized Buy Now.
4. Add filter chips to `product-grid.tsx` (client-side state, derive categories from product tags).
5. Rewrite `about-shop.tsx`: 3 trust pillars w/ icons.
6. Polish `buy-now-button.tsx` to match new sticker style.
7. Verify NewsletterCTA from P2 renders correctly on Shop page.
8. Responsive QA: 360 / 768 / 1024 / 1440.
9. Empty state QA: ensure `ShopEmptyState` still works when products array empty.

## Success Criteria

- [ ] Shop hero zoning matches Home (no text/character overlap)
- [ ] 4 category sticker tiles render w/ hover settle
- [ ] Filter chips functional: All + 4 categories
- [ ] Product card: sticker style, price pill, Buy Now visible AA contrast
- [ ] About section: 3 trust pillars, equal column heights
- [ ] Buy Now opens Shopify in new tab (analytics event still fires)
- [ ] Empty state renders when products array empty
- [ ] Lighthouse mobile perf ≥ 85
- [ ] Axe: zero AA violations across all sections

## Risk Assessment

| Risk | Mitigation |
|---|---|
| No product-context character asset for hero | Use existing `/assets/shop/promotion.png` w/ overlay text panel; flag asset gap to user |
| Filter state lost on page reload | Acceptable for MVP (URL state out of scope); add `?cat=` query param if user requests |
| Shopify product tags don't map to 4 categories cleanly | Map via lib helper `lib/shopify/categorize.ts` w/ tag → category dictionary; default → "Accessories" |
| Sticker price pill overlaps long product names | Constrain product name to 2-line clamp, pill stays top-right |

## Code-review fixes applied (post-implementation)
- **C1** ExploreProducts tile href `#products?cat=plushes` (parses as single hash) → fixed to `/shop?cat=plushes#products` so both URL state and scroll work.
- **C2** `useSearchParams()` in `ProductGrid` without Suspense — wrapped in `<Suspense fallback={<ProductGridFallback />} >` in `app/shop/page.tsx`. Shop page is now properly static-prerendered (○ in build output) instead of opting out.
- **H1** `categorize.ts` substring-match false positives ("art" matched "smart") — refactored to whole-token matching via tokenized `Set` lookup; multi-word keywords still use substring.
- **H2** Shop hero atmosphere matched plan — added `atmosphereVariant` prop to `CinematicHero` (default `honey`); shop passes `atmosphereVariant="peach"`.
- **H3** `app/shop/loading.tsx` skeleton rebuilt to match the new design (cream `bg-base`, `max-w-hero`, two-zone hero, 4 sticker tiles, 6-card grid w/ filter chips). No more color/width flash on hydration.
- **M3** Removed duplicate "Coming Soon" label in product card body — kept only the top-left badge in the image area.
- **M4** Removed `aria-hidden="true"` from price pill so screen-reader users hear the price.
- **Dead code:** removed unused `components/shop/buy-now-button.tsx` (ProductCard inlines its own Buy Now sticker).
