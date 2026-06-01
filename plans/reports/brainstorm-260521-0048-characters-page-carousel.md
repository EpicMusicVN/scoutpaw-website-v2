# Brainstorm — Characters Page Carousel Redesign

**Date:** 2026-05-21 00:48 | **Status:** Agreed | **Scope:** page redesign (supersedes the carousel-relevant parts of plan `260520-2354-characters-page`)

## Problem Statement

Redesign `/characters` as an immersive showcase: hero banner + a horizontal **carousel** of character cards. Each card: large full-body pose image, hover pose-swap + name reveal + animation, click → detail page. Replaces the alternating-sections layout built earlier the same session.

## Scout Findings

- Pose assets exist + confirmed on R2 (`images.scoutpaw.tv`): Max 3 (golden1-3), Rocky 3 (husky1-3), Buddy 3 (corgi1-3), Oscar 2 (collie1-2), Bella 2 (poodle1-2).
- Carousel pattern already in codebase: `components/watch/our-channels.tsx` — scroll-snap rail + `NavArrow` + scroll-state. Reuse this approach.
- Reusable from tonight's build: data model (`quote`/`bio`/`tagline`), `characters.json` copy, `CharacterQuote`, `/characters/[slug]` detail pages.

## Agreed Decisions

| Topic | Decision |
|---|---|
| Page layout | Carousel **replaces** the alternating sections. `/characters` = hero + carousel + newsletter. Storytelling lives on detail pages. |
| Poses | **Pose-swap on hover** — CSS crossfade between two poses, no JS. |
| Old components | **Delete** `character-showcase-section.tsx` + `character-quick-nav.tsx` (uncommitted — no git cost). Detail pages keep current hero+description+quote. |
| "Slideshow" | Scroll-snap **rail** (arrows + swipe), NOT auto-rotating one-at-a-time. |
| Click target | **Same-tab** nav to `/characters/[slug]` (new-tab is for external links only). |
| Name reveal | Always in the link's accessible name; visually hidden-until-hover on pointer devices only (`@media (hover:hover)`); always visible on touch. |

## Final Solution

### Data model
- `CharacterSchema` (`lib/content/schemas.ts`): add `poses: z.array(z.string()).min(1)`. Keep `image` (still used by detail hero, home showcase).
- `content/characters.json`: add `poses` array per character (the `characters-position/*` paths above).

### Page — `app/characters/page.tsx` (rewrite)
`FullBleedHero` (immersive banner) → `CharacterCarousel` → `NewsletterCTA`. Remove the quick-nav + 5 showcase sections.

### New components
- **`character-carousel.tsx`** (`"use client"`) — scroll-snap horizontal rail; `NavArrow` buttons (desktop) + native swipe (mobile); `canScrollLeft/Right` state. Maps characters → cards. Mirrors `our-channels.tsx`.
- **`character-carousel-card.tsx`** (server / CSS-only) — `<Link href={/characters/${slug}}>` wrapping: two stacked `next/image` poses (`poses[0]` default, `poses[1]` hover) crossfading on `group-hover`; full-body large image in a fixed aspect-ratio box; name `<span>` below (always in DOM for SR, `@media (hover:hover)` hides-until-hover, always visible on touch); hover = zoom + float + accent glow.

### Deleted
- `components/characters/character-showcase-section.tsx`
- `components/characters/character-quick-nav.tsx`

## Cross-Cutting

- **Perf:** `next/image` via R2; first card's default pose eager, all others (incl. hover poses) lazy; correct `sizes`.
- **No CLS:** fixed aspect-ratio image boxes.
- **Animations:** CSS hover (zoom/float/glow/pose-crossfade) — auto-neutralized by the global `prefers-reduced-motion` reset in `globals.css`.
- **a11y:** carousel = labeled scroll region; `NavArrow` buttons labeled; cards are keyboard-focusable `<Link>`s; name always in accessible name.

## Risks

- Hover pose-swap loads 2 images/card (10 total) — mitigate with lazy-loading all but the first default pose.
- Pose PNGs may have inconsistent framing/scale — verify they align in a fixed card box; `object-contain` + consistent padding.
- Carousel keyboard UX — ensure focusing an off-screen card scrolls it into view (scroll-snap handles most; verify).

## Success Criteria

- `/characters` renders hero + carousel of 5 cards; arrows + swipe work; cards link to detail pages.
- Hover (pointer): pose crossfade + name reveal + zoom/float/glow. Touch: name always visible.
- `tsc` + `next lint` + `next build` clean; no CLS; reduced-motion respected.

## Unresolved Questions

- Live prod URL still unknown (`scoutpaw.vercel.app` 404) — visual QA limited to local build.
