---
phase: 3
title: Page-Level Section Transitions
status: completed
priority: P2
effort: 10m
dependencies:
  - 1
  - 2
---

# Phase 3: Page-Level Section Transitions

## Overview

Place 5 `<CloudDivider />` block elements between section components in `app/page.tsx` at the 5 user-specified transition points:
1. Hero → MenuCards
2. MenuCards → FeaturedPupSpotlight (Pack Leader)
3. CharacterShowcase → FeatureBanner (Shop the Pack)
4. FeatureBanner → VideoGrid
5. VideoGrid → NewsletterCTA

## Requirements

- Functional: 5 dividers visible at the specified transitions
- Non-functional: dividers don't add interactive behavior; only decorative

## Related Code Files

- Modify: `app/page.tsx`

## Implementation Steps

1. Import the refactored component:
   ```tsx
   import { CloudDivider } from "@/components/ui/cloud-divider";
   ```
2. Place dividers between section components:
   ```tsx
   <FullBleedHero ... />

   <CloudDivider />  {/* 1. Hero → MenuCards */}

   <ScrollReveal>
     <MenuCards />
   </ScrollReveal>

   <CloudDivider />  {/* 2. MenuCards → Pack Leader */}

   <ScrollReveal>
     <FeaturedPupSpotlight />
   </ScrollReveal>

   <ScrollReveal>
     <CharacterShowcase />
   </ScrollReveal>

   <CloudDivider />  {/* 3. CharacterShowcase → Shop */}

   <ScrollReveal>
     <FeatureBanner ... />
   </ScrollReveal>

   <CloudDivider />  {/* 4. Shop → VideoGrid */}

   <ScrollReveal>
     <VideoGrid />
   </ScrollReveal>

   <CloudDivider />  {/* 5. VideoGrid → Newsletter */}

   <ScrollReveal>
     <NewsletterCTA ... />
   </ScrollReveal>
   ```
3. Note: NO divider between Pack Leader and CharacterShowcase (per user brief — 5 specified, not 6).
4. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] 5 `<CloudDivider />` instances in `app/page.tsx`
- [ ] Dividers visible at each transition during scroll
- [ ] No layout regressions
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** 5 dividers feel too dense. **Mitigation:** total added vertical space ~250-320px across home page; acceptable. Tunable per-instance via `opacity` prop.
- **Risk:** Divider doesn't visually transition into FeaturedPupSpotlight (Pack Leader card). **Mitigation:** Pack Leader card sits inside a `max-w-hero px-* py-*` wrapper; cyan body bg between divider and card creates a clean buffer.
