---
phase: 6
title: Character Detail Pages
status: completed
priority: P2
effort: 3h
dependencies:
  - 3
---

# Phase 6: Character Detail Pages

## Overview
SSG one detail page per character (5 routes): `/characters/[slug]`. Big art, name, tagline, bio, fun facts, "see in videos" links. Future-proofs character schema even though detail pages aren't strictly required for MVP feel — they're cheap to build now and set the data shape.

## Requirements
- Functional: 5 statically generated pages, one per character; 404 for unknown slugs; back-to-home link
- Non-functional: themed by character accent color; LCP < 2.5s; metadata per character (OG, title)

## Architecture
- `app/(marketing)/characters/[slug]/page.tsx` — async server component
- `generateStaticParams` returns all 5 slugs from `getCharacters()`
- `generateMetadata` per character (title, description, OG image)
- Page CSS-vars override accent color from character data → drives section backgrounds, button hovers
- Components reused from Phase 3/4 (Card, motion primitives)

## Related Code Files
- Create: `app/(marketing)/characters/[slug]/page.tsx`
- Create: `app/(marketing)/characters/[slug]/not-found.tsx`
- Create: `components/characters/character-detail.tsx`, `components/characters/character-hero.tsx`, `components/characters/fun-facts-list.tsx`

## Implementation Steps
1. `generateStaticParams`: read `getCharacters()`, return `[{ slug }]` array
2. `generateMetadata({ params })`: per-char title, description, OG image
3. Page component: `getCharacterBySlug(slug)`, throw `notFound()` if missing
4. `CharacterHero`: large image (next/image priority), name, tagline; background uses character accent color via CSS vars
5. `CharacterDetail`: bio paragraph, `FunFactsList` (numbered or bulleted)
6. Optional cross-link: 1–2 related videos featuring character (if videos.json includes characterSlug refs) — skip if data not available
7. "Back to home" CTA at bottom
8. `not-found.tsx`: friendly 404 w/ character art, link home

## Success Criteria
- [ ] All 5 routes statically built (verify in `pnpm build` output)
- [ ] Unknown slug returns 404
- [ ] Each page uses correct accent color
- [ ] Metadata correct per character (verify View Source)
- [ ] LCP < 2.5s on character images
- [ ] Lighthouse perf ≥ 90, a11y ≥ 95

## Risk Assessment
- Character images may be heavy PNGs — convert to WebP/AVIF via next/image automatic optimization
- "Related videos" cross-ref over-engineers MVP — defer if no clean data link
- Bio copy may not exist yet — write placeholder lorem-with-character-tone, flag as unresolved
