---
phase: 5
title: Live Render Verification
status: completed
priority: P1
effort: 60m
dependencies:
  - 1
  - 2
  - 3
  - 4
---

# Phase 5: Live Render Verification

## Overview

Verify the cumulative result of Phases 1-4 via typecheck + lint + live dev-server render across 7 routes + 3 character themes. Per `memory/build-verification-gate.md`: DO NOT run `pnpm build` while a dev server is live. Use `tsc --noEmit` + `eslint` + browser-driven manual check.

## Requirements

- Functional: All routes render without errors. All title elements show solid bright yellow on navy. Body text readable. Cards still readable. No atmosphere artefacts.
- Non-functional: Match the approved mockup (Option A from `comparison.html`) at the per-section level.

## Architecture

7 routes covering all flipped surfaces:

| Route | Verifies |
|---|---|
| `/` (home) | FullBleedHero, MenuCards, CharacterShowcase, FeaturedPupSpotlight, VideoGrid, FeatureBanner, NewsletterCTA |
| `/shop` | FullBleedHero, ExploreProducts, AboutShop, ProductCard (h3 untouched) |
| `/watch` | WatchHero, OurChannels (mid sub-header — UNCHANGED), VideoRail (sub-header — UNCHANGED), PlaylistGrid, ExploreVideos, SubscribeCard (sub-header — UNCHANGED), FeaturedVideo, WatchLibrary (sub-header — UNCHANGED) |
| `/characters` | CinematicHero, CharacterSection (themed bg per Phase 4 decision) |
| `/characters/[slug]` × 3 different pups | CharacterDetailHero with 3 different themes — verify per-theme h1 color decision |
| `/coming-soon/[slug]` | ComingSoonHero |
| `/top-picks` | TopPicksBoard, DealBlock |

## Related Code Files

- No edits unless regression observed. Read-only verification phase.

## Implementation Steps

1. From project root, run `pnpm tsc --noEmit`. Confirm zero errors.
2. Run `pnpm lint`. Confirm zero violations on touched files.
3. Check if dev server already running on port 3000: `netstat -ano | grep ":3000"`. If running, use existing instance. Otherwise: `pnpm dev` in background.
4. For each route, open `http://localhost:3000{route}` in browser:
   - Hard-reload (Ctrl+Shift+R) to bypass any stale CSS cache
   - Confirm hero/banner sections render with navy bg
   - Confirm titles (kicker + h1/h2) render solid bright yellow `#ffd70c`
   - Confirm body text readable (white/85)
   - Confirm cards INSIDE sections still render their light surfaces
   - Confirm mid sub-headers (`our-channels`, `video-rail`, `subscribe-card`, `watch-library`, `shop-empty-state`) UNCHANGED — still `text-ink-blue` on cyan body bg
   - Confirm `bg-paper` body bg between sections still cyan
5. For `/characters/[slug]`, manually test 3 different pups with distinct themes:
   - Verify each pup's hero h1 color renders per Phase 4 decision (yellow vs ink-blue)
   - No catastrophic AA failure on any theme
6. Mobile viewport check (resize browser to ≤639px or use DevTools device mode):
   - Mobile hero card variants render correctly on navy
   - Atmosphere decoratives don't overflow / mis-render
7. Compare visually against `mockups/comparison.html` Option A. Hero section + section banner sample should match the mockup faithfully.
8. Document any regressions found in `plans/260528-0649-pivot-6-solid-yellow-design-decision/reports/verification-notes.md`.
9. Stop dev server when done if started in this phase.

## Success Criteria

- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0
- [ ] All 7 base routes render without console errors
- [ ] 5 hero sections show navy bg + yellow kicker + yellow h1 + light body
- [ ] 13 banner sections show navy bg + yellow kicker + yellow h2 + light body (14th is character-section with themed bg per Phase 4)
- [ ] 5 mid sub-headers UNCHANGED (ink-blue on cyan body bg)
- [ ] Card-level h3 UNCHANGED
- [ ] 3 character themes verified with appropriate h1 color
- [ ] Mobile viewport passes
- [ ] Visual match to mockup Option A confirmed
- [ ] Zero atmosphere artefacts (paw-prints, cloud-dividers, dust readable / not broken)

## Risk Assessment

- **Risk:** Atmosphere artefact found that needs urgent fix (e.g., paw-print pattern invisible). **Mitigation:** Phase 4 should have caught this; if discovered here, file a one-line fix and re-render. Don't block on it — document and ship if cosmetic.
- **Risk:** Per-character theme decision (Phase 4) renders wrong for one pup. **Mitigation:** revert that pup's titleColor + document; pursue follow-up if user pushes back.
- **Risk:** Mobile glass card on `full-bleed-hero` looks broken on navy. **Mitigation:** Phase 1 already updated mobile card bg; verify here.
- **Risk:** `bg-paper` body bg between dark sections feels jarring instead of airy. **Mitigation:** if observed, consider a softer transition (cloud-divider color tuning) — but YAGNI: only if visually wrong.
- **Risk:** Dev server stale cache shows partial state. **Mitigation:** delete `.next/` cache + restart server.
- **Risk:** Stakeholder (you) sees the rendered state and wants pivot #7. **Mitigation:** Mockup-validated decision is sticky per the refined lock mechanism (Phase 6). Any pivot #7 requires a new mockup round, not just text request.
