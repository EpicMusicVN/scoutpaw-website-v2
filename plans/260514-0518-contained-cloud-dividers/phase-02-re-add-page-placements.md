---
phase: 2
title: Re-add Page Placements
status: completed
priority: P3
effort: 5m
dependencies:
  - 1
---

# Phase 2: Re-add Page Placements

## Overview

Re-add `<CloudDivider />` between the 5 home transitions in `app/page.tsx`. Same positions as the prior (now-removed) full-width version.

## Related Code Files

- Modify: `app/page.tsx`

## Implementation Steps

1. Add `CloudDivider` import.
2. Place 5 instances between:
   - Hero → MenuCards
   - MenuCards → FeaturedPupSpotlight
   - CharacterShowcase → FeatureBanner
   - FeatureBanner → VideoGrid
   - VideoGrid → NewsletterCTA
3. Run `pnpm typecheck` + `pnpm lint`.
4. Visual smoke: 5 cluster dividers visible at scroll between sections.

## Success Criteria

- [ ] 5 `<CloudDivider />` calls in `app/page.tsx`
- [ ] Each renders the cluster (3 mini clouds, centered, max-w-md)
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** 5 dividers feel too dense. **Mitigation:** opacity tunable per call; smaller footprint than wave version.
