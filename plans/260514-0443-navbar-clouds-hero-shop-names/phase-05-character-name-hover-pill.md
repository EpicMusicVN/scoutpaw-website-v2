---
phase: 5
title: Character Name Hover Pill
status: completed
priority: P2
effort: 25m
dependencies: []
---

# Phase 5: Character Name Hover Pill

## Overview

Remove the always-visible character name `<p>` below each card. Replace with a hover-reveal pill INSIDE the card at bottom-center. Fade-in + slide-up on card hover.

## Requirements

- Functional:
  - No character name visible at rest
  - On card hover: name pill fades in + slides up from card bottom
  - Card's hover lift + glow ring effects preserved
- Non-functional:
  - No layout shift (removing the always-visible name = less reserved space)
  - No accessibility regression (Link still has `aria-label={`Meet ${name}, the ${breed}`}`)

## Architecture

`components/characters/character-card.tsx`. The pill sits inside the rounded card backdrop, absolute-positioned at bottom-center. Uses `group-hover:` to coordinate with the parent Link's hover state.

## Related Code Files

- Modify: `components/characters/character-card.tsx`

## Implementation Steps

1. Remove the trailing `<p>` element (after the closing `</div>` of the card backdrop):
   ```tsx
   // Delete this block
   <p
     className={`truncate text-center font-display font-bold tracking-[0.05em] text-ink ${nameClass}`}
   >
     {character.name}
   </p>
   ```
2. Inside the card backdrop div (after `<Image />`), add the hover pill:
   ```tsx
   <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition-all duration-300 group-hover:bottom-6 group-hover:opacity-100">
     <span className="inline-flex items-center rounded-full bg-ink/90 px-4 py-1.5 font-display text-sm font-bold text-white shadow-md backdrop-blur-sm md:text-base">
       {character.name}
     </span>
   </div>
   ```
3. Remove the now-unused `nameClass` variable.
4. Run `pnpm typecheck` + `pnpm lint`.
5. Visual smoke: hover each card, confirm pill slides up + fades in.

## Success Criteria

- [ ] No character names visible at rest
- [ ] Hover reveals name pill inside card with smooth fade + slide
- [ ] Card hover lift + glow preserved
- [ ] aria-label still announces character name to screen readers
- [ ] typecheck + lint clean
- [ ] No layout shift

## Risk Assessment

- **Risk:** Name pill clashes with `CardPawScatter` paws near the bottom. **Mitigation:** Pill has `bg-ink/90` opaque enough to read; paws are at `text-white/20` (very faint). No real conflict.
- **Risk:** On touch devices (no hover), names never reveal. **Mitigation:** Tap on card navigates to character detail page (`/characters/[slug]`); name visible there. Acceptable trade-off.
- **Risk:** `nameClass` removal misses a reference. **Mitigation:** grep `nameClass` after removal; it's only used in the deleted `<p>` element.
