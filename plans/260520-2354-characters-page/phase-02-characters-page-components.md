---
phase: 2
title: Characters Page Components
status: completed
priority: P1
effort: 4h
dependencies:
  - 1
---

# Phase 2: Characters Page Components

## Overview

Build the two new UI components the Characters page is composed of:
`CharacterShowcaseSection` (the reusable per-character block) and
`CharacterQuickNav` (the avatar jump-link row).

## Requirements

- Functional: one reusable section component renders any character with an
  alternating image/text layout; quick-nav links jump to each section.
- Non-functional: responsive (desktop 2-col, mobile stacked); animations gated
  by `prefers-reduced-motion`; no client JS unless required; `tsc` clean.

## Architecture

### `components/characters/character-showcase-section.tsx` (server component)
Props: `{ character: Character; index: number; priority?: boolean }`.

- Wrapper: `<section id={`character-${slug}`} aria-labelledby={`character-${slug}-title`} className="scroll-mt-24 ...">`.
- Layout: `grid md:grid-cols-2` — image column + text column. `index % 2 === 1`
  swaps column order (`md:[&>*:first-child]:order-2` or conditional class) →
  alternating L/R. Mobile: single column, image first.
- Image column: `next/image` (`fill`) inside a fixed `aspect-[4/5]` (or
  `aspect-square`) rounded-`[2rem]` box. Background = soft gradient built from
  `accentColor` (e.g. `linear-gradient(135deg, ${accent}33, ${accent}11)`).
  Floating decorative shapes: 2–3 absolutely-positioned blobs / `PawIcon` /
  simple circles tinted with `accentColor`, with a subtle CSS drift animation.
  Image `group-hover:scale-105` transition.
- Text column: `h2` id=`character-${slug}-title` → `"Say hi to {name}"`;
  subtitle = `tagline` rendered uppercase, letter-spaced, accent-tinted;
  description = `bio` paragraph (`text-warm-text`/`ink`); `<CharacterQuote>`;
  `<Button href={`/characters/${slug}`} variant="outline">Meet {name} →</Button>`.
- `priority` prop → passed to the image (`priority` only for the first section).
- Accent used only for tints/decoration — body copy stays `ink` on light surface.

### `components/characters/character-quick-nav.tsx` (server component)
Props: `{ characters: Character[] }`.

- Row of 5 chips, each an anchor `<a href={`#character-${slug}`}>` → relies on
  CSS smooth scroll. Verify `html { scroll-behavior: smooth }` exists in
  `globals.css`; if absent, add it (or add `scroll-smooth` on `<html>`).
- Chip: small circular `next/image` avatar (character `image`) + name label +
  accent-colored ring. `focus-visible` ring for keyboard users.
- Mobile: horizontally scrollable flex row (`overflow-x-auto`, hidden scrollbar),
  matching the `our-channels.tsx` rail pattern. md+: centered inline row.
- No client JS — pure anchor links. (Active-section highlighting is YAGNI; skip.)

## Related Code Files

- Create: `components/characters/character-showcase-section.tsx`,
  `components/characters/character-quick-nav.tsx`
- Read for context: `components/home/featured-pup-spotlight.tsx` (image+decor
  pattern), `components/watch/our-channels.tsx` (mobile rail pattern),
  `components/ui/button.tsx`, `components/ui/paw-icon.tsx`,
  `components/motion/scroll-reveal.tsx`, `app/globals.css` (tokens, scroll-behavior)
- Reuse: `CharacterQuote` (Phase 1), `Button`, `PawIcon`

## Implementation Steps

1. Read the context files above to match existing styling conventions
   (rounded radii, shadow tokens `shadow-cozy*`, `ease-gentle`, spacing).
2. Build `CharacterShowcaseSection` — structure, alternating layout, accent
   gradient, floating shapes, hover-scale. Keep file focused (<200 lines; extract
   a small `FloatingShapes` sub-component inline or as a helper if it grows).
3. Add floating-shape drift `@keyframes` (in `globals.css` or component-scoped);
   wrap motion in `motion-reduce:animate-none` / `motion-safe:` utilities.
4. Build `CharacterQuickNav` — chip row, mobile rail, focus states. Confirm/add
   `scroll-behavior: smooth`.
5. `pnpm exec tsc --noEmit` + `pnpm exec next lint` on the new files.

## Success Criteria

- [ ] `CharacterShowcaseSection` renders alternating L/R layout, stacks on mobile
- [ ] Accent color drives tint/decor only — text contrast remains AA
- [ ] `CharacterQuickNav` renders 5 chips; anchors scroll to correct sections
- [ ] Animations disabled under `prefers-reduced-motion`
- [ ] `tsc --noEmit` + `next lint` clean

## Risk Assessment

- **Component bloat** — section component risks >200 lines. Mitigation: extract
  floating-shapes/decor into a small sub-component.
- **Image PNG edges** — `characters/*-bg.png` may carry baked backgrounds; verify
  they sit cleanly on accent gradients, else use `object-contain` with padding.
