---
phase: 1
title: "Hero & Page Shell"
status: completed
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 1: Hero & Page Shell

## Overview

Replace the Characters page hero with the Home page's `FullBleedHero` and adopt
the Home `CloudDivider` section rhythm, so `/characters` reads as part of the
same site.

## Requirements

- Functional: `/characters` renders `FullBleedHero` (not `CinematicHero`);
  `CloudDivider`s separate hero / carousel / newsletter; build passes.
- Non-functional: visually matches Home hero; no TypeScript/lint errors.

## Architecture

`app/characters/page.tsx` (server component) section order:
`FullBleedHero` → `CloudDivider` → `<Suspense>`(`CharacterCarousel`) →
`CloudDivider` → `ScrollReveal`(`NewsletterCTA`).

`FullBleedHero` already defaults `image` to `banner/banner.png` and takes
`kicker` / `title` / `description` — no new props needed.

## Related Code Files

- Modify: `app/characters/page.tsx` — swap hero, add dividers, drop `CinematicHero`/`Button` imports.
- Read for context: `components/home/full-bleed-hero.tsx`, `components/ui/cloud-divider.tsx`, `app/page.tsx`.

## Implementation Steps

1. In `app/characters/page.tsx`, replace the `CinematicHero` block with:
   `<FullBleedHero kicker="CHARACTERS" title="Meet the ScoutPaw pack" description={PAGE_DESCRIPTION} />`.
2. Add `<CloudDivider />` after the hero and after the carousel (before `NewsletterCTA`),
   matching the Home page composition.
3. Remove now-unused imports: `CinematicHero`, `Button`.
4. Keep the existing `metadata`, `PAGE_ORDER`, `getCharacters()` logic and the
   `<Suspense>` boundary around `CharacterCarousel`.
5. Simplify the Suspense fallback to a plain min-height block (the sky backdrop
   is removed in Phase 2 — do not reintroduce it here).
6. Run `pnpm typecheck` + `pnpm build`.

## Success Criteria

- [ ] `/characters` renders `FullBleedHero` identical in style to Home.
- [ ] `CloudDivider`s present; page rhythm matches Home.
- [ ] No unused imports; typecheck + build pass.
- [ ] `/characters` still statically prerendered.

## Risk Assessment

- Same banner image on Home + Characters is intentional (cohesion); leave a
  note that it is swappable via the `FullBleedHero` `image` prop.
- Suspense fallback height should roughly match the carousel section to avoid
  a load-time jump.
