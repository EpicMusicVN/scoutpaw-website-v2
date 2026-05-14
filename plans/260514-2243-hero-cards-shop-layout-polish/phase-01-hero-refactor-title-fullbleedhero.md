---
phase: 1
title: Hero refactor (title + FullBleedHero)
status: completed
priority: P2
effort: 1h
dependencies: []
---

# Phase 1: Hero refactor (title + FullBleedHero)

## Overview

Drop `: Scoutpaw TV` suffix from Home hero title. Refactor `FullBleedHero` desktop overlay so the text card anchors bottom-left (not vertically centered), with a narrower default width and a localized bottom-up gradient under the card area. Shared component → both Home Corgi and Shop merch banner get unobstructed in one change. Mobile in-flow card path stays untouched.

## Requirements

**Functional**
- Home title reads `Discover a happier world of puppies` (no suffix).
- On md/lg/xl viewports: Home Corgi face fully visible (not under card).
- On md/lg/xl viewports: Shop merch products fully visible (not under card).
- Card legibility preserved against image backdrop.

**Non-functional**
- No new design tokens, no new components.
- Mobile (`<md`) path unchanged — already in-flow below banner.
- Focus rings + CTAs intact.

## Architecture

`FullBleedHero` is consumed by both `app/page.tsx` and `app/shop/page.tsx`. One file change cascades to both pages.

**Desktop overlay change (current → new):**

| Aspect | Current | New |
|--------|---------|-----|
| Vertical anchor | `items-center` | `items-end` |
| Inner wrapper padding | `px-8` | `px-8 pb-10 lg:pb-16` |
| Card max-width | `max-w-md` (+`lg:max-w-lg`) | `max-w-sm lg:max-w-md` |
| Backdrop gradient | Left horizontal fade only (`w-2/5 from-paper`) | + bottom-left vertical fade for card backdrop |
| Image `objectPosition` | `70% 50%` | `70% 50%` baseline; bump to `75% 45%` only if Corgi still nicked after QA |

**Pseudo:**

```jsx
{/* Desktop overlay — bottom-left anchored */}
<div className="pointer-events-none absolute inset-0 hidden items-end md:flex">
  <div className="pointer-events-auto mx-auto w-full max-w-hero px-8 pb-10 lg:pb-16">
    <div className="max-w-sm rounded-2xl border border-ink/10 bg-white/85 px-6 py-5 shadow-cozy backdrop-blur-md lg:max-w-md lg:px-7 lg:py-6">
      <CardBody />
    </div>
  </div>
</div>
```

**New bottom-left backdrop gradient** (added alongside existing left/right fades, lines 68-77 area):

```jsx
<div
  aria-hidden
  className="pointer-events-none absolute bottom-0 left-0 hidden h-1/2 w-2/5 bg-gradient-to-t from-paper/60 to-transparent md:block"
/>
```

This sits behind the bottom-left card only — doesn't dim the whole banner, doesn't crop into the character zone.

## Related Code Files

- Modify: `app/page.tsx` (line 16 — title literal)
- Modify: `components/home/full-bleed-hero.tsx` (desktop overlay block lines 87-93; add bottom-up gradient div near lines 68-77; optional `objectPosition` tweak at line 66)

## Implementation Steps

1. Edit `app/page.tsx:16`: change `title="Discover a happier world of puppies: Scoutpaw TV"` to `title="Discover a happier world of puppies"`.
2. In `components/home/full-bleed-hero.tsx`, add a new `aria-hidden` div for bottom-left vertical fade between the existing left/right fade divs (after the right fade, before closing `</div>`).
3. Replace the desktop overlay block (lines 87-93):
   - Change `items-center` → `items-end`.
   - Wrapper: `px-8` → `px-8 pb-10 lg:pb-16`.
   - Inner card: `max-w-md rounded-2xl border border-ink/10 bg-white/85 px-6 py-5 shadow-cozy backdrop-blur-md lg:max-w-lg lg:px-8 lg:py-7` → `max-w-sm rounded-2xl border border-ink/10 bg-white/85 px-6 py-5 shadow-cozy backdrop-blur-md lg:max-w-md lg:px-7 lg:py-6`.
4. Run `pnpm typecheck` to confirm no TS regressions.
5. Boot dev server, verify on `/` and `/shop` at 768/1024/1440. Confirm:
   - Home: Corgi snout/face fully visible above card.
   - Shop: Plush + apparel products fully visible above card.
6. If Corgi face still nicked at md breakpoint, bump `objectPosition: "70% 50%"` → `"75% 45%"` on line 66 and re-verify.

## Success Criteria

- [ ] Home title renders without `: Scoutpaw TV` suffix
- [ ] FullBleedHero desktop overlay anchors to bottom-left at md+
- [ ] Card uses `max-w-sm` default, `max-w-md` at lg
- [ ] Bottom-up gradient div present in component, sits under card area only
- [ ] Corgi face fully visible on Home banner at 768/1024/1440
- [ ] Shop merch fully visible on Shop banner at 768/1024/1440
- [ ] Mobile (`<md`) renders unchanged
- [ ] `pnpm typecheck` clean
- [ ] CTAs (`Watch Now`, `Meet the Pack`, `Explore Collections`) clickable + focusable

## Risk Assessment

- **Card hits CloudDivider seam** — `pb-10` may not be enough on lg; bump to `pb-16` (already in spec for lg) or `pb-20` if seam touches. Visual-verify.
- **Corgi face still nicked at narrow md width** — fallback: bump `objectPosition` to `75% 45%`.
- **Shop banner card backdrop reads weak** — Shop banner has busy merch backdrop. If white-tinted card lacks contrast, increase `bg-white/85` → `bg-white/92`. Hold off unless visually confirmed.
