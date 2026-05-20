---
phase: 4
title: mock-products realignment
status: completed
priority: P2
effort: 10m
dependencies:
  - 3
---

# Phase 4: mock-products realignment

## Overview

Fix the parallel scramble in `lib/shopify/mock-products.ts`. Every product's `title` currently uses the WRONG name but the RIGHT breed-and-image-asset. Strategy: keep breed-in-title (which matches the image), swap name to the new correctly-mapped name for that breed.

## Requirements

- Functional: each product's `title`, `handle`, `description`, `imageAlt` reflect the correct character name for its breed/image
- Non-functional: TypeScript compiles; product `id` fields (mock-1..mock-8) unchanged so any external references stay stable

## Related Code Files

- Modify: `lib/shopify/mock-products.ts`

## Implementation Steps

For each of 5 mis-named products (mock-2, mock-3, mock-5, mock-6, mock-7), apply the swap:

### mock-2 — Golden Plush
- handle: `buddy-plush-toy` → `max-plush-toy`
- title: `Buddy the Golden Plush` → `Max the Golden Plush`
- description: `Soft, snuggle-friendly plush of Buddy.` → `Soft, snuggle-friendly plush of Max.`
- imageAlt: `Buddy plush toy` → `Max plush toy`

### mock-3 — Husky Tee
- handle: `max-the-husky-tee` → `rocky-husky-tee`
- title: `Max the Husky Tee` → `Rocky the Husky Tee`
- description: `Soft cotton tee featuring Max the Husky.` → `Soft cotton tee featuring Rocky the Husky.`
- imageAlt: `Max the Husky tee` → `Rocky the Husky tee`

### mock-5 — Collie Plush
- handle: `bella-collie-plush` → `oscar-collie-plush`
- title: `Bella the Collie Plush` → `Oscar the Collie Plush`
- description: `Bella, ready for cuddles and long walks alike.` → `Oscar, ready for cuddles and long walks alike.`
- imageAlt: `Bella plush toy` → `Oscar plush toy`

### mock-6 — Corgi Kid's Tee
- handle: `oscar-corgi-tee-kid` → `buddy-corgi-tee-kid`
- title: `Oscar Corgi Kid's Tee` → `Buddy Corgi Kid's Tee`
- description: `Bright tee with Oscar the Corgi — sized for little humans.` → `Bright tee with Buddy the Corgi — sized for little humans.`
- imageAlt: `Oscar the Corgi kids tee` → `Buddy the Corgi kids tee`

### mock-7 — Poodle Mug
- handle: `rocky-poodle-mug` → `bella-poodle-mug`
- title: `Rocky Poodle Mug` → `Bella Poodle Mug`
- description: `Ceramic mug featuring Rocky — just the way mornings should start.` → `Ceramic mug featuring Bella — just the way mornings should start.`
- imageAlt: `Rocky the Poodle mug` → `Bella the Poodle mug`

(mock-1, mock-4, mock-8 are pack-level products with no individual character — unchanged.)

## Success Criteria

- [ ] All 5 product titles match their image asset's breed
- [ ] All 5 product names match the new locked character mapping
- [ ] All 5 product handles updated to new kebab-case slug
- [ ] `pnpm typecheck` passes
- [ ] `grep -ni 'buddy\|rocky\|oscar\|bella' lib/shopify/mock-products.ts` shows each name only in its CORRECT product entry

## Risk Assessment

- **Risk:** Handle change breaks external references (Shopify URL routing, sitemap)
  - **Mitigation:** Mock data is fixture-only (SHOPIFY_MODE=mock); live URLs come from real Shopify. No external dependency on these handles.
- **Risk:** product `id` fields (mock-1..mock-8) referenced elsewhere
  - **Mitigation:** Leave `id` fields unchanged. Only title/handle/description/imageAlt change.
