---
phase: 1
title: Watch page layout reorder
status: completed
priority: P2
effort: 5m
dependencies: []
---

# Phase 1: Watch page layout reorder

## Overview

Move the `OurChannels` `<ScrollReveal>` block in `app/watch/page.tsx` from its current low-prominence position (between ExploreVideos and SubscribeCard) to immediately below `WatchHero + CloudDivider`.

## Requirements

- Functional: rendered Watch page has OurChannels as the second visible section (after Hero)
- Non-functional: no prop changes; CloudDividers still sit cleanly between every section

## Architecture

**Current order in `app/watch/page.tsx`:**
```
WatchHero → CloudDivider → VideoRail (Community) → CloudDivider
        → ExploreVideos → CloudDivider → OurChannels → CloudDivider
        → SubscribeCard
```

**New order:**
```
WatchHero → CloudDivider → OurChannels → CloudDivider
        → VideoRail → CloudDivider → ExploreVideos → CloudDivider
        → SubscribeCard
```

## Related Code Files

- Modify: `app/watch/page.tsx`

## Implementation Steps

1. Read current `app/watch/page.tsx` (cached from prior brainstorm session — lines 49-95 contain the render block)
2. Move the OurChannels `<ScrollReveal>` block (currently lines ~84-86) plus surrounding CloudDividers to the position right after WatchHero
3. Verify divider count: 4 CloudDividers total (between Hero/OurChannels, OurChannels/VideoRail, VideoRail/ExploreVideos, ExploreVideos/SubscribeCard)
4. `pnpm typecheck` after edit

## Success Criteria

- [ ] OurChannels block immediately follows WatchHero in the JSX tree
- [ ] All 5 sections separated by exactly one CloudDivider each
- [ ] No new imports or prop changes
- [ ] `pnpm typecheck` passes

## Risk Assessment

- **Risk:** Divider stacking creates visual glitch
  - **Mitigation:** Visual inspection in Phase 3 dev smoke test
- **Risk:** ScrollReveal animation timing breaks because element order changed
  - **Mitigation:** ScrollReveal is element-local (no cross-section coordination); should be unaffected
