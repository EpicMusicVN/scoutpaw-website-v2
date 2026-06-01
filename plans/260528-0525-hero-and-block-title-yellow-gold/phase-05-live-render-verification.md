---
phase: 5
title: Live Render Verification
status: completed
priority: P1
effort: 30m
dependencies:
  - 2
  - 3
  - 4
---

# Phase 5: Live Render Verification

## Overview

Verify the cumulative result of Phases 1-4 via typecheck + lint + live dev-server render. Per `memory/build-verification-gate.md`: DO NOT run `pnpm build` while a dev server is live. Use `tsc --noEmit` + `eslint` + manual browser check.

## Requirements

- Functional: all routes render without runtime errors, all title elements visible with new colors, no AA failures observed on representative samples.
- Non-functional: no regression in non-title elements (body text, buttons, navigation, cards).

## Architecture

7 representative routes to spot-check (covers all hero variants + all block-title-bearing pages):

| Route | Components exercised |
|---|---|
| `/` (home) | FullBleedHero, MenuCards, CharacterShowcase, FeaturedPupSpotlight, VideoGrid, FeatureBanner, NewsletterCTA |
| `/shop` | FullBleedHero, ExploreProducts, AboutShop, ProductCard (h3 untouched) |
| `/watch` | WatchHero, OurChannels, VideoRail, PlaylistGrid, ExploreVideos, SubscribeCard, FeaturedVideo, WatchLibrary, EmptyVideos |
| `/characters` | CinematicHero, CharacterSection |
| `/characters/[slug]` (pick 3 different characters) | CharacterDetailHero with 3 different themed gradients |
| `/coming-soon/[slug]` | ComingSoonHero |
| `/top-picks` | TopPicksBoard, DealBlock |

## Related Code Files

- No edits in this phase. Read-only verification.

## Implementation Steps

1. Run `pnpm tsc --noEmit` from project root. Confirm zero errors.
2. Run `pnpm lint`. Confirm zero violations on touched files.
3. Start dev server in background: `pnpm dev` (Next.js, default port 3000).
4. For each route in the table above, open `http://localhost:3000{route}` (use chrome-devtools or browser).
5. For each hero: confirm kicker is deep navy (`#1a3a5c`), h1 is gold-gradient legible across full glyph width.
6. For each large-h2 banner: confirm gradient renders, no invisible regions, no fade-to-bg.
7. For each mid-h2/h3: confirm solid dark gold (`#b8862e`) reads clean.
8. For card-level h3s (product/video/character names): confirm UNCHANGED — still deep navy.
9. For `/characters/[slug]`, spot-check 3 different characters with distinct theme gradients (pastel pink, pastel blue, pastel green). Note any clash.
10. Mobile viewport check: resize to ≤639px, confirm 3-stop fallback gradient renders without artefacts.
11. Stop dev server when done.

## Success Criteria

- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0 on touched files
- [ ] All 7 routes render without console errors
- [ ] All hero kickers visually deep navy
- [ ] All hero h1s + large h2 banners show gold gradient with no invisible regions
- [ ] All mid h2/h3 elements show solid dark gold
- [ ] All card h3s untouched (still deep navy)
- [ ] Mobile viewport renders 3-stop fallback cleanly
- [ ] Character themes do not break gradient legibility (spot-check 3 themes)

## Risk Assessment

- **Risk:** `pnpm dev` already running and conflicts on port 3000. **Mitigation:** check with `lsof -i :3000` or netstat before starting; if running, reuse the existing instance.
- **Risk:** A theme gradient produces unreadable gold-on-gold contrast (e.g., character with warm/gold accent palette). **Mitigation:** flag in journal; add per-theme inline `style={{ color: theme.titleColor }}` override as a follow-up; do not block this plan.
- **Risk:** Dev cache from prior styling work shows stale styles. **Mitigation:** hard-reload (Ctrl+Shift+R) or delete `.next/` cache and restart dev server.
- **Risk:** Phase 5 verification finds a real legibility regression. **Mitigation:** revert affected swaps to `text-navy` per file; document exception in Phase 6 changelog; do not paper over with text-shadow.
