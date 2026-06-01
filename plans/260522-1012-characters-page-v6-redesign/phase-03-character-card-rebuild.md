---
phase: 3
title: "Character Card Rebuild"
status: completed
priority: P1
effort: "4h"
dependencies: []
---

# Phase 3: Character Card Rebuild

## Overview

Rebuild `CharacterCarouselCard` as a white content card with the pose PNG
overlapping out of its top edge. The white card holds breed kicker, name,
tagline, a clamped `bio`, and a compact quote. Add a `compact` variant to
`CharacterQuote`.

## Requirements

- Functional: card shows pose + white content card (breed, name, tagline,
  `bio` line-clamp-2, quote); the whole card opens the pup's detail on
  click/Enter/Space; pointer-drag does not trigger a click.
- Non-functional: file < 200 lines; valid HTML; AA contrast on white; visible
  focus ring; pose `priority`-loaded for the first 3 cards.

## Architecture

The v5 card is a single `<button>` of "soft glow only" (pose + tiny label).
The v6 card embeds a `<CharacterQuote>` which renders a `<blockquote>` (flow
content) — a `<button>` may not contain flow content. So the card switches to
the **stretched-button-overlay** pattern:

```
<article class="group relative ...">      ← visual card, semantic content
  <bloom span> <ground-shadow span>
  <pose Image>                            ← overlaps above the white card
  <div white card>                        ← bg-surface, rounded, shadow
    <span breed kicker>
    <h3 name>
    <span tagline>
    <p bio class="line-clamp-2">
    <CharacterQuote compact />            ← <blockquote>, valid here
  </div>
  <button class="absolute inset-0 z-10"   ← transparent click/focus target
          aria-label="Open {name}'s profile" onClick={onSelect} />
</article>
```

The overlay `<button>` is the only interactive element; content beneath is
static. Hover state keys off `group-hover`; focus ring renders on the button
(styled to frame the card). This keeps fully semantic markup (`h3`, `p`,
`blockquote`) and reuses `CharacterQuote` unchanged in semantics.

## Related Code Files

- Modify: `components/characters/character-carousel-card.tsx` (near-total rebuild)
- Modify: `components/characters/character-quote.tsx` (add `compact` prop)
- Read for context: `components/characters/character-detail-card.tsx` (story
  copy treatment to echo), `lib/content/character-themes.ts` (`theme.decor`)

## Implementation Steps

1. **`character-quote.tsx`** — add an optional `compact?: boolean` prop. When
   `compact`: smaller padding (`p-4` vs `p-6 md:p-8`), smaller text
   (`text-sm` vs `text-base md:text-lg`), smaller/repositioned decorative quote
   mark (or omit it). Default (`compact` undefined/false) renders exactly as
   today — no change for the detail view + per-character page consumers.
2. **`character-carousel-card.tsx`** — rebuild. Keep props
   `{ character, theme, priority, onSelect }`; `onSelect` keeps signature
   `(event: React.MouseEvent) => void` (the track reads `event.detail` for
   drag-suppression). Stop `void theme` — `theme.decor` is now used for the quote.
3. Structure (stretched-button-overlay, see Architecture):
   - Root `<article className="group relative h-full ...">`.
   - Themed bloom `<span>` + soft ground-shadow `<span>` (carry over from v5,
     retune positions for the new layout).
   - **Pose** — `next/image` `fill`, `object-contain object-bottom`,
     `priority={priority}`, `sizes` tuned for ~31vw desktop. Positioned to
     occupy the upper ~2/3 and **extend above the white card's top edge**
     (the card overlaps the pose's lower ~1/3).
   - **White card** — `<div className="... rounded-[2rem] bg-surface
     shadow-cozy ...">` positioned at the bottom, overlapping the pose bottom
     third. Inside, stacked:
     - breed — `<span class="block ... uppercase tracking-[0.28em] text-ink/60">`
     - name — `<h3 class="font-display font-bold text-ink ...">{name}</h3>`
     - tagline — `<span class="block uppercase ... text-ink/70">` (skip if
       `tagline` starts with `TODO`)
     - bio — `<p class="line-clamp-2 text-warm-text ...">` (skip if `bio`
       starts with `TODO`)
     - `<CharacterQuote quote={quote} accentColor={theme.decor} compact />`
   - **Overlay button** — `<button type="button" onClick={onSelect}
     aria-label={\`Open ${name}'s profile\`} className="absolute inset-0 z-10
     rounded-[2rem] focus-visible:outline-none focus-visible:ring-2
     focus-visible:ring-ink/45 focus-visible:ring-offset-2 ...">`.
4. Hover micro-interaction — on `group-hover`: gentle card lift
   (`group-hover:-translate-y-1.5`) and/or pose rise; keep
   `transition ... ease-gentle`, durations ~300ms.
5. Verify the composed card height fits within the track's `VIEWPORT_H`
   (Phase 2) — pose + white card must not overflow or clip the quote.
6. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Card renders pose overlapping out the top of a white content card
- [ ] White card shows breed + name + tagline + `bio` (2-line clamp) + compact quote
- [ ] Whole card opens the detail on click + keyboard (Enter/Space); drag does
      not mis-fire a click
- [ ] Valid HTML (no flow content inside a `<button>`); visible focus ring
- [ ] `CharacterQuote` `compact` variant added; default rendering unchanged for
      existing consumers
- [ ] File < 200 lines; `pnpm typecheck` + `pnpm lint` pass

## Risk Assessment

- **Content density at 3-up** → `line-clamp-2` bounds the bio; compact quote +
  tight typography keep it premium. Tune type scale in browser (Phase 5).
- **Pose/white-card overlap math** → use percentage-based absolute positioning
  so it scales with the card; verify across breakpoints.
- **`event.detail` drag-suppression** → the overlay `<button>` still receives
  the same click event; keyboard activation keeps `detail === 0`. No change to
  the track's `handleCardSelect` contract.
