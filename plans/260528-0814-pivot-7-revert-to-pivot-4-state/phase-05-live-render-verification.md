---
phase: 5
title: Live Render Verification
status: completed
priority: P1
effort: 30m
dependencies:
  - 1
  - 2
  - 3
  - 4
---

# Phase 5: Live Render Verification

## Overview

Verify the cumulative result of Phases 1-4 matches pivot #4 final state (shipped at 06:02 today). Per `memory/build-verification-gate.md`: DO NOT run `pnpm build`. Use `tsc --noEmit` + `eslint` + browser-driven manual check.

## Requirements

- Functional: All routes render without errors. Hero + banner sections back to light surfaces. h1/h2 back to gold gradient. Mid sub-headers back to solid dark gold. Reserved utilities present but unused. No leftover dark-surface artefacts.
- Non-functional: Visual match to the pivot #4 state. User confirms in browser.

## Architecture

7 representative routes:

| Route | Verifies |
|---|---|
| `/` | FullBleedHero, MenuCards, CharacterShowcase, FeaturedPupSpotlight, VideoGrid, FeatureBanner, NewsletterCTA |
| `/shop` | FullBleedHero, ExploreProducts, AboutShop |
| `/watch` | WatchHero, OurChannels (mid solid gold), VideoRail (mid solid gold), PlaylistGrid, ExploreVideos, SubscribeCard (mid solid gold), FeaturedVideo, WatchLibrary (mid solid gold) |
| `/characters` | CinematicHero, CharacterSection |
| `/characters/[slug]` × 3 | CharacterDetailHero with gradient h1 across 3 themes |
| `/coming-soon/[slug]` | ComingSoonHero |
| `/top-picks` | TopPicksBoard, DealBlock |

## Related Code Files

- No edits unless regression observed.

## Implementation Steps

1. From project root, run `pnpm tsc --noEmit`. Confirm exit 0.
2. Run `pnpm lint`. Confirm exit 0.
3. Grep regression checks:
   - `Grep "bg-ink-blue" components/` — should show ≤ ZERO matches in hero + banner section files (only legitimate uses like buttons, badges, focus rings remain).
   - `Grep "text-brand-primary" components/` — should drop significantly (only kicker / pill / button uses remain, not h1/h2).
   - `Grep "heading-gradient-gold-light" components/` — should show ≥19 matches (5 heroes + 14 banners).
   - `Grep "text-shadow-bold" components/` — should show ZERO matches (was added in pivot #6, removed in this revert).
   - `Grep "variant=\"dark-surface\"" components/` — ZERO consumer matches.
   - `Grep "surface=\"dark\"" app/` — ZERO matches.
4. Read `components/ui/button.tsx` to confirm `dark-surface` variant still exists (RESERVED).
5. Read `components/ui/paw-print-pattern.tsx` to confirm `tone` prop still exists (RESERVED).
6. Read `components/ui/cloud-divider.tsx` to confirm `surface` prop still exists (RESERVED).
7. Read `lib/content/character-themes.ts` to confirm `titleColor` field still exists (RESERVED).
8. Spot-check 2-3 hero files to confirm pivot-4-era classes are restored (kicker `text-ink-blue`, h1 `heading-gradient-gold-light`, body `text-ink-blue/85`).
9. Spot-check 2-3 banner files to confirm `bg-ink-blue` dropped and `heading-gradient-gold-light` restored on h2.
10. DO NOT start the dev server — user handles visual verification themselves on the existing dev server they manage.

## Success Criteria

- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0
- [ ] ZERO `bg-ink-blue` in hero + banner sections
- [ ] ≥19 `heading-gradient-gold-light` matches (5 heroes + 14 banners)
- [ ] ZERO `text-shadow-bold` matches (removed)
- [ ] ZERO `variant="dark-surface"` consumers
- [ ] ZERO `surface="dark"` consumers
- [ ] 4 reserved utilities INTACT (button variant, tone prop, surface prop, titleColor field)
- [ ] No regression in non-pivot-related code

## Risk Assessment

- **Risk:** A file may have been missed in Phases 1-4. **Mitigation:** Grep counts will surface anything left dark-themed.
- **Risk:** Reserved utility may have been accidentally deleted. **Mitigation:** explicit Read steps for each reserved file in steps 4-7.
- **Risk:** User views the live result and disagrees again (pivot #8). **Mitigation:** lock mechanism + refined "full-page context" rule from Phase 6 should be sticky going forward. If pivot #8 happens, brainstorm refuses without full-page mockup.
- **Risk:** Dev server caches stale state. **Mitigation:** user hard-reloads or restarts dev server during their manual check.
