---
phase: 1
title: "Setup & Dependencies"
status: pending
priority: P1
effort: "2h"
dependencies: []
---

# Phase 1: Setup & Dependencies

## Overview

Add the carousel dependency and scaffold the new `/characters` page shell so
later phases drop components into a working route. No visual carousel yet.

## Requirements

- Functional: `embla-carousel-react` installed; `/characters` renders
  `CinematicHero` + a placeholder client section + `NewsletterCTA`; build passes.
- Non-functional: zero TypeScript errors; `useSearchParams` Suspense boundary in place.

## Architecture

`app/characters/page.tsx` (server component) composes:
1. `CinematicHero` — characters intro copy.
2. `<Suspense fallback={...}>` → `CharacterCarousel` (client) — placeholder for now.
3. `NewsletterCTA` wrapped in `ScrollReveal` (kept from current page).

`CharacterCarousel` is a `"use client"` component; in this phase it only renders
a static row of cards (no Embla) to confirm data flow + reduced-motion + theme.

## Related Code Files

- Modify: `package.json` — add `embla-carousel-react`.
- Modify: `app/characters/page.tsx` — replace `CharacterScene` with hero + Suspense(carousel) + NewsletterCTA.
- Create: `components/characters/character-carousel.tsx` — client shell (placeholder body).
- Read for context: `components/home/cinematic-hero.tsx`, `lib/content/index.ts`,
  `lib/content/character-themes.ts`, `components/motion/scroll-reveal.tsx`.

## Implementation Steps

1. Install dep: `pnpm add embla-carousel-react` — verify it pins a React 19 compatible version (v8+).
2. Create `components/characters/character-carousel.tsx`:
   - `"use client"`; props `{ characters: Character[] }`.
   - Placeholder body: simple flex row of character names/poses (no Embla).
   - No `useSearchParams` logic yet — keep minimal.
3. Rewrite `app/characters/page.tsx`:
   - Keep `getCharacters()` + `PAGE_ORDER` ordering logic.
   - Render `CinematicHero` with characters copy: kicker `MEET THE PACK`,
     title "The pups behind every ScoutPaw song", description from `PAGE_DESCRIPTION`.
   - Hero image: use `banner/banner.png` (or a group asset) via `assetUrl`; pick `atmosphereVariant`.
   - Wrap `<CharacterCarousel characters={ordered} />` in `<Suspense>` with a lightweight skeleton fallback.
   - Keep `<ScrollReveal><NewsletterCTA tag="characters-newsletter" /></ScrollReveal>`.
   - Keep existing `metadata` export.
4. Do NOT delete `CharacterScene` files yet (Phase 5).
5. Run `pnpm tsc --noEmit` (or project typecheck) + `pnpm build` — fix any errors.

## Success Criteria

- [ ] `embla-carousel-react` in `package.json`, lockfile updated.
- [ ] `/characters` builds + renders hero + placeholder carousel + newsletter.
- [ ] No TypeScript / lint errors; `useSearchParams` Suspense boundary present.
- [ ] `/characters/[slug]` pages still build untouched.

## Risk Assessment

- Embla version vs React 19 — verify peer deps; if mismatch, pin latest v8.x.
- Hero image asset may not exist as a clean group shot — acceptable to use
  `banner/banner.png`; confirm visually, flag if a better asset is needed.
