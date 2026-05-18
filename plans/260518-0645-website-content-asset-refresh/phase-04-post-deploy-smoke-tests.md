---
phase: 4
title: "Post-Deploy Smoke Tests"
status: pending
priority: P2
effort: "20m"
dependencies: [3]
---

# Phase 4: Post-Deploy Smoke Tests

## Overview

Live verification on production after deploy + CDN purge. Visual + functional + a11y checks.

## Requirements

- Home + shop pages render with all five changes visible.
- Routing still works (`?cat=plushes`, `?cat=apparel`).
- `/characters/[slug]` pages reflect the swap.
- No console errors, no broken images, no layout shift regressions.

## Implementation Steps

### 1. Home page (`/`)

**MenuCards section ("Step into the pack's world"):**
- [ ] No colored block behind icons (transparent backdrop).
- [ ] No paw-tile pattern, no glow.
- [ ] Hover lift on icon card still works.
- [ ] Drop-shadow keeps icons grounded.
- [ ] Text card overlap from below unchanged.

**FeaturedPupSpotlight section ("Meet the pack leader"):**
- [ ] Hero image is the Golden Retriever (`golden-2.png`).
- [ ] H2 reads "Say hi to Max".
- [ ] Subtitle: "The soulful, golden heart of ScoutPaw".
- [ ] Bio + funFacts match Golden Retriever narrative (sunbeam, Mr. Fluff, etc.).
- [ ] "Meet Max" button links to `/characters/max`.

**FeatureBanner ("Shop the Pack"):**
- [ ] Image is the new `promotion.jpg`.
- [ ] DevTools → Network → image request shows `.jpg` extension and `200` (not `304` from stale cache).

### 2. Shop page (`/shop`)

**ExploreProducts section:**
- [ ] Plushes tile h3 reads "Dog Calming & Essentials Collection".
- [ ] Plushes tile copy: "Shop our curated collection for pet anxiety, comfort, and wellness. Free your pup from stress today!".
- [ ] Apparel tile h3 reads "Dog owner gifts".
- [ ] Apparel tile copy: "Keep your pup close to your heart...".
- [ ] Section subtitle updated to: "Curated picks for the whole pack — calming essentials for pups + gifts for the humans who love them."
- [ ] Click plushes tile → URL becomes `/shop?cat=plushes#products`, ProductGrid filters/scrolls correctly.
- [ ] Click apparel tile → URL becomes `/shop?cat=apparel#products`, same flow.

**Shop banner image:**
- [ ] `shop/banner.png` loads fresh (verify via Network panel).

### 3. Character pages

- [ ] `/characters/max` resolves → Golden Retriever (Max).
- [ ] `/characters/buddy` resolves → Husky (Buddy).
- [ ] Both pages render without console errors.
- [ ] Character showcase grid on home page renders all 5 characters (order preserved).

### 4. A11y / regressions

- [ ] DevTools → Lighthouse (mobile + desktop) → no regressions vs pre-change baseline (allow ±3 in scores).
- [ ] Tab through MenuCards links — focus rings visible, order logical.
- [ ] Screen-reader smoke test on ExploreProducts tile: VoiceOver/NVDA announces new title via aria-label.
- [ ] No CLS spike from removed pattern/glow divs.

### 5. Mobile

- [ ] Resize to 375px width — MenuCards stack, no horizontal scroll.
- [ ] ExploreProducts collapses to 2-column grid; new titles don't truncate.
- [ ] FeaturedPupSpotlight stacks copy below the Golden hero image.

## Success Criteria

- [ ] All checkboxes above ticked
- [ ] No new console errors, no 404s in Network panel
- [ ] Lighthouse mobile + desktop within ±3 of baseline scores
- [ ] Visual review approved by user (screenshots optional)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| User has stale browser cache during smoke test | Test in private/incognito window. |
| `/characters/[slug]` route uses Buddy data but shows old image | Confirm Phase 1 JSON swap committed; force-refresh deployed build cache. |
| Mobile layout broke from backdrop removal | Inspect at 375px / 768px / 1024px breakpoints during smoke test. |

## Rollback Plan

If any verification fails:
1. Revert the offending file(s) via git.
2. Redeploy.
3. Re-purge if image URLs changed.
4. Open issue with screenshots + Network panel evidence.
