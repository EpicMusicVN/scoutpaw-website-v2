---
phase: 3
title: UI tweaks (Watch hero + empty state)
status: completed
priority: P2
effort: 20m
dependencies: []
---

# Phase 3: UI tweaks (Watch hero + empty state)

## Overview

Remove the duration badge from the Watch Hero video card for a cleaner, more cinematic feel. Then audit ExploreVideos to ensure empty categories (cats, product-reviews) don't break the layout — add a placeholder card if needed.

## Requirements

**Functional**
- WatchHero no longer renders the `{featured.duration && (...)}` badge.
- Category + channel badges retained.
- ExploreVideos handles 0-result categories gracefully (either skips empty categories or shows a soft "Coming soon" placeholder).

**Non-functional**
- Minimal scope — don't refactor either component.

## Architecture

### WatchHero duration removal

`components/watch/watch-hero.tsx` — locate the `{featured.duration && (...)}` block inside the absolute-positioned badges layer (around lines 75-78 post-cycle-1). Delete it cleanly (no surrounding refactor).

```diff
- {featured.duration && (
-   <span className="absolute bottom-4 right-4 rounded-full bg-ink/85 px-3 py-1.5 font-display text-sm font-semibold text-surface md:text-base">
-     {featured.duration}
-   </span>
- )}
```

### Empty-category UI

`components/watch/explore-videos.tsx` — inspect first. The component renders filter chips + a grid. If `filtered.length === 0` and the grid renders nothing, the section collapses to header + chips with awkward whitespace.

**Conditional fix (only if needed):**

```jsx
{filtered.length === 0 ? (
  <div className="mx-auto mt-12 max-w-md rounded-3xl border border-ink/10 bg-surface/70 p-10 text-center shadow-cozy">
    <p className="font-display text-base font-semibold text-warm-text md:text-lg">
      Fresh episodes coming soon 🐾
    </p>
  </div>
) : (
  // existing grid render
)}
```

If the component already handles empty gracefully (e.g., chips hide for empty categories, or grid shows no children but section maintains height), leave it.

## Related Code Files

- Modify: `components/watch/watch-hero.tsx`
- Modify (conditional): `components/watch/explore-videos.tsx`

## Implementation Steps

1. Open `components/watch/watch-hero.tsx`. Locate the `{featured.duration && (...)}` span and delete that block.
2. Open `components/watch/explore-videos.tsx`. Look for the grid render. Identify whether empty filtered list produces broken layout. If yes, wrap with conditional + placeholder card.
3. Boot dev server. Navigate to `/watch`:
   - Hero: no duration badge visible (category + channel badges still present).
   - ExploreVideos: click "Cats" or "Product Reviews" filter chip. Verify either a placeholder shows or the section collapses cleanly without weird gaps.
4. Run `pnpm typecheck` + `pnpm lint`. Halt on errors.

## Success Criteria

- [ ] WatchHero no longer renders duration badge
- [ ] Category + channel badges still render
- [ ] Empty-category filter renders cleanly (no broken grid)
- [ ] `pnpm typecheck` + `pnpm lint` clean

## Risk Assessment

- **Duration is the ONLY badge for some videos** — removing it leaves a featured video with no time indicator. Acceptable per user direction (less YouTube-card-y).
- **Empty-state placeholder feels jarring on a busy page** — placeholder card is intentionally soft (`bg-surface/70`, neutral copy). If user dislikes, drop it and let the section be quiet.
- **ExploreVideos already handles empty** — if true, no change needed; phase notes that explicitly.
