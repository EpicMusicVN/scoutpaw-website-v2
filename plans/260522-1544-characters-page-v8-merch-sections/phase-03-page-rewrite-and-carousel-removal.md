---
phase: 3
title: "Page Rewrite and Carousel Removal"
status: pending
priority: P1
effort: "2h"
dependencies: [2]
---

# Phase 3: Page Rewrite and Carousel Removal

## Overview

Rewrite `app/characters/page.tsx` to render the 5 `CharacterSection`s, and
delete the now-superseded v7 carousel/detail component chain.

## Requirements

- Functional: `/characters` renders FullBleedHero + 5 alternating character
  sections + NewsletterCTA; Max first; no carousel.
- Non-functional: no dangling imports after the deletions; `pnpm typecheck` +
  `pnpm lint` clean.

## Architecture

The page becomes a simple server component: fetch characters, order them
(Max first), map to `<CharacterSection>` wrapped in `<ScrollReveal>` with an
alternating `flip`. The carousel orchestrator + its component chain are no
longer referenced and are deleted.

## Related Code Files

- Modify: `app/characters/page.tsx` (rewrite)
- Delete: `components/characters/character-carousel.tsx`,
  `character-carousel-track.tsx`, `character-carousel-card.tsx`,
  `character-carousel-arrows.tsx`, `character-carousel-ambient.tsx`,
  `character-detail-card.tsx`, `character-detail-decor.tsx`
- Keep (verify still imported): `character-atmosphere.tsx`, `character-motif.tsx`,
  `character-scene-decor.tsx`, `character-themes.ts`, `character-quote.tsx`,
  `character-card.tsx`

## Implementation Steps

1. **`app/characters/page.tsx`** — rewrite as a server component:
   - Keep the `metadata`, `PAGE_DESCRIPTION`, `PAGE_ORDER`
     (`["max","buddy","bella","oscar","rocky"]`) and the `getCharacters()` +
     order-by-`PAGE_ORDER` logic.
   - Render: `FullBleedHero` (kept, "Meet the ScoutPaw pack") → `CloudDivider`
     → for each ordered character: `<ScrollReveal><CharacterSection
     character theme={getCharacterTheme(slug)} flip={i % 2 === 1}
     priority={i === 0} /></ScrollReveal>` with a `CloudDivider` between
     sections → `NewsletterCTA tag="characters-newsletter"`.
   - Remove the `Suspense` + `CharacterCarousel` import/usage.
2. **Delete** the 7 carousel/detail files listed above.
3. **Grep-verify** — search the repo for each deleted component name and for
   `character-carousel`, `character-detail`, `CharacterCarousel`,
   `CharacterDetailCard` — confirm zero remaining references outside `plans/`
   and `docs/journals/`.
4. Confirm the kept components still have a consumer:
   - `character-atmosphere`/`character-motif`/`character-scene-decor` →
     `CharacterSection` (Phase 2).
   - `character-quote`/`character-card` → `app/characters/[slug]/page.tsx` /
     `components/home/character-showcase.tsx`.
   If any kept file ends up with zero consumers, flag it (do not silently delete
   — note for the QA phase).
5. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] `/characters` renders FullBleedHero + 5 alternating sections + NewsletterCTA
- [ ] The 7 carousel/detail components are deleted
- [ ] No dangling references to any deleted component (grep-verified)
- [ ] Kept components still have a live consumer
- [ ] `pnpm typecheck` + `pnpm lint` pass

## Risk Assessment

- **Dangling import after deletion** → grep before + after; typecheck catches
  any miss.
- **`?pup=` deep-links break** → the old query-param deep-link is gone;
  section `id={slug}` anchors (`/characters#max`) replace it. Acceptable — note
  in the changelog.
- **A kept decor component loses its only consumer** → if `CharacterSection`
  ends up not using atmosphere/motif, those files would be orphaned; verify in
  step 4 and decide (keep if `[slug]` page uses them, else flag).
