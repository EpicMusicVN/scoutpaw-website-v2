---
phase: 2
title: Body Text Sweep
status: completed
priority: P1
effort: 2h
dependencies:
  - 1
---

# Phase 2: Body Text Sweep

## Overview

Sweep `text-ink`, `text-warm-text`, `text-warm-muted` body-text usages across the codebase to `text-ink-blue` (or `text-ink-blue/70` for muted variants). Excludes `bg-ink`, `border-ink`, `ring-ink`, and the recently-modified heading h2s (which use `text-navy` from Plan A).

## Requirements

**Functional:**
- All `<p>` body copy uses `text-ink-blue` (or opacity variant)
- All `<span>` body copy inside paragraphs uses `text-ink-blue`
- Kicker text (`uppercase tracking-*` labels) uses `text-ink-blue/70` for softer tone
- `text-warm-text` references → `text-ink-blue`
- `text-warm-muted` references → `text-ink-blue/70`
- `text-ink/85`, `text-ink/65`, `text-ink/45` opacity variants → corresponding `text-ink-blue/N`

**Non-functional:**
- Don't touch: `bg-ink`, `border-ink`, `ring-ink`, `text-ink/15` (paw print decorative)
- Don't touch h1/h2 with Plan A styles (`text-navy`, `heading-gradient-*`)
- Visual hierarchy preserved (kickers stay lighter, body stronger)
- No AA regressions

## Architecture

Mechanical sweep via Grep + Edit. ~89 `text-ink\b` occurrences + ~40 `text-warm-text`/`text-warm-muted`. Most are simple patterns; opacity variants need targeted matching.

## Related Code Files

Sweep targets (per scout findings):

**Heavy hitters (5+ usages):**
- `components/nav/mobile-nav.tsx` — 7
- `components/watch/featured-video.tsx` — 7
- `components/top-picks/offer-card.tsx` — 6
- `components/shop/about-shop.tsx` — 4
- `components/watch/our-channels.tsx` — 4
- `components/shop/product-card.tsx` — 4

**Medium (2–4):**
- `components/home/newsletter-cta.tsx`, `components/home/character-showcase.tsx`, `components/home/menu-cards.tsx`, `components/home/video-grid.tsx`, `components/home/cinematic-hero.tsx`
- `components/watch/watch-library.tsx`, `watch-hero.tsx`, `video-rail.tsx`, `playlist-grid.tsx`, `explore-videos.tsx`, `subscribe-card.tsx`
- `components/shop/explore-products.tsx`, `shop-empty-state.tsx`, `product-grid.tsx`
- `components/characters/character-section.tsx`, `character-detail-hero.tsx`, `character-channel-badge.tsx`, `character-merch-card.tsx`
- `components/top-picks/deal-block.tsx`
- `components/ui/button.tsx`, `filter-chip.tsx`, `paw-print-pattern.tsx`, `back-to-top.tsx`
- `components/nav/footer.tsx`, `nav-links.tsx`

**Single occurrence:** various low-volume files

**Skip (intentional):**
- `bg-ink` references (newsletter submit button background) — stays dark
- `border-ink` references (form input borders) — stays dark
- `ring-ink` references (focus rings) — stays dark
- `text-ink/15` on decorative paw prints — keep as subtle background motif

## Implementation Steps

1. **Audit grep**: run `grep -rn 'text-ink\b' components/ app/ | wc -l` to baseline. Note pre-count.
2. **Sweep `text-warm-text` → `text-ink-blue`**: Read each file with this token, swap.
3. **Sweep `text-warm-muted` → `text-ink-blue/70`**: same pattern.
4. **Sweep `text-ink\b` body usages**: this is the largest. Strategy:
   - For each file, Read + Edit the `text-ink` occurrence(s) in paragraphs/body text (not h1/h2, not buttons)
   - For opacity variants (`text-ink/85`, `text-ink/65`, `text-ink/55`, `text-ink/45`), swap to `text-ink-blue/N` preserving the number
   - For `text-ink/15` decorative paw prints: SKIP (leave dark anchor)
   - For h1/h2 elements with `text-navy` (Plan A): SKIP
   - For h1 with `heading-gradient-tri`: SKIP
5. **Audit grep again**: run baseline grep, confirm count dropped to only the intentional skips (paw print decoratives, button text overrides if any).
6. **Typecheck + lint** after the sweep.

## Success Criteria

- [ ] All body `<p>`/`<span>` copy renders in deep navy across all pages
- [ ] Kickers (uppercase tracking-* labels) read as softer blue (70% opacity)
- [ ] Headings unchanged (still `text-navy` h2 / `heading-gradient-tri` h1)
- [ ] Buttons unchanged (`bg-ink` button still dark, `text-surface` white text)
- [ ] Form input borders unchanged
- [ ] Paw print decoratives still subtly visible
- [ ] No AA regression — manual contrast spot-check on light/cyan/warm-tan/yellow surfaces
- [ ] Typecheck + lint clean

## Risk Assessment

- **Risk:** Missing opacity variants (e.g., `text-ink/55` on placeholder text). *Mitigation:* post-sweep grep audit confirms only intentional `text-ink` patterns remain.
- **Risk:** Sweep accidentally hits button label text. *Mitigation:* Buttons explicitly set `text-surface` or `text-white`; the sweep only targets `text-ink`-prefix patterns.
- **Risk:** Kicker `text-warm-muted` → `text-ink-blue/70` may look too saturated (kickers want subtle). *Mitigation:* adjust opacity to `/60` or `/50` after live review if needed.
- **Risk:** Read-before-Write enforcement requires reading each file. *Mitigation:* batch reads in parallel before Edit batches.

## Security Considerations

None.
