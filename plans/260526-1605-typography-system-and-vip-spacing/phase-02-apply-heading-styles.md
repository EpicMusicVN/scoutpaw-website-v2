---
phase: 2
title: Apply Heading Styles
status: completed
priority: P1
effort: 2h
dependencies:
  - 1
---

# Phase 2: Apply Heading Styles

## Overview

Apply the new heading color contract to landmark h1/h2 sites across the website. Scope is intentionally limited to high-impact heroes and primary section titles — not every `font-display` usage (133 total).

## Requirements

**Functional:**
- Hero h1 across `/`, `/characters`, `/watch`, `/shop`, `/top-picks` uses `heading-gradient-tri` with `text-shadow-soft` wrapper
- Section h2 on light/cyan/cream backgrounds uses `text-navy` solid (or `heading-gradient-cool` for premium moments)
- Section h2 on tinted character backgrounds uses `text-navy` (stays AA on warm tints)
- Newsletter heading uses `heading-gradient-warm` (yellow→white) when on a warm card surface, or `heading-gradient-tri` if visually motivated
- Body text untouched everywhere

**Non-functional:**
- No AA regressions — spot-check on each modified surface
- Mobile gradient stays legible (Phase 1 media query handles tri-color narrowing)

## Architecture

Two patterns:

**Pattern A — solid navy heading on light bg:**
```jsx
<h2 className="font-display text-5xl font-bold text-navy md:text-6xl">Title</h2>
```

**Pattern B — gradient heading with shadow lift:**
```jsx
<span className="text-shadow-soft">
  <h1 className="heading-gradient-tri font-display text-6xl font-bold md:text-7xl">
    Title
  </h1>
</span>
```

Wrap h1 in span for shadow lift; bare h2s in light surfaces can skip wrapper.

## Related Code Files

**Hero h1s (gradient + shadow wrapper):**
- `components/home/cinematic-hero.tsx`
- `components/home/full-bleed-hero.tsx` (used by characters/watch/shop/top-picks heroes per content config)
- `components/watch/watch-hero.tsx`
- `components/coming-soon/coming-soon-hero.tsx`

**Section h2s (navy solid or cool gradient):**
- `components/home/featured-pup-spotlight.tsx`
- `components/home/character-showcase.tsx`
- `components/home/menu-cards.tsx`
- `components/home/feature-banner.tsx`
- `components/home/video-grid.tsx`
- `components/home/newsletter-cta.tsx` — heading
- `components/characters/character-section.tsx` — `id={slug}-name` h2 (Plan B may rebuild this; keep change minimal)
- `components/characters/character-detail-hero.tsx`
- `components/watch/featured-video.tsx`
- `components/watch/our-channels.tsx`
- `components/shop/about-shop.tsx`
- `components/shop/explore-products.tsx`
- `components/top-picks/top-picks-board.tsx`
- `components/top-picks/deal-block.tsx`

**Verify only (no change):**
- `components/nav/footer.tsx` — footer h3 stays `#fffbe6`; align to `text-[#fffbe6]` or `text-brand-primary` only if visually equivalent
- `app/privacy/page.tsx`, `app/terms/page.tsx` — legal pages, defer

## Implementation Steps

1. **Hero h1 sweep** — for each file in "Hero h1s" list:
   - Locate the primary h1 with `font-display`
   - Wrap in `<span className="text-shadow-soft">`
   - Replace `text-ink` or `text-white` with `heading-gradient-tri`
   - Keep size/weight classes unchanged
2. **Section h2 sweep** — for each file in "Section h2s" list:
   - Locate the primary h2 with `font-display`
   - Replace `text-ink` → `text-navy` (or `heading-gradient-cool` if visually motivated)
   - Do NOT wrap in span unless background is busy
3. **Spot-check** each modified file in browser at desktop + mobile.
4. **Typecheck + lint** after each file (or batch at the end).
5. **Manual AA contrast check** — pick worst-case surface per heading (e.g., navy on cyan bg → 4.6:1 ✓; navy on warm-tan → ~5.5:1 ✓).

## Success Criteria

- [ ] All 4 hero h1 sites use `heading-gradient-tri` with `text-shadow-soft` wrapper
- [ ] All section h2 sites in the listed components use `text-navy` (or motivated gradient)
- [ ] Body text untouched — `text-ink`, `text-warm-text`, `text-warm-muted` references preserved
- [ ] Footer h3 unchanged or aligned to token cleanly
- [ ] No AA regressions confirmed by manual contrast check
- [ ] Typecheck + lint clean
- [ ] No console warnings or visual broken state

## Risk Assessment

- **Risk:** Gradient on h1 over hero video/atmosphere reads muddy. *Mitigation:* `text-shadow-soft` wrapper lifts contrast; if still muddy, fall back to `heading-gradient-cool` (2-color) or solid white with `text-shadow-warm-glow`.
- **Risk:** `character-section.tsx` h2 will be reworked by Plan B; doing it in Plan A is potentially throwaway. *Mitigation:* minimal change in Plan A — just swap `text-ink` → `text-navy`. Plan B will refactor wholesale.
- **Risk:** Edge cases (h2 on a coral/blush legacy bg) may have low contrast with navy. *Mitigation:* only modify components in the list; flag any low-contrast cases for follow-up.

## Security Considerations

None.
