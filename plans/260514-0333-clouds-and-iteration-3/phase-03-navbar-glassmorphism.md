---
phase: 3
title: Navbar Glassmorphism
status: completed
priority: P2
effort: 20m
dependencies: []
---

# Phase 3: Navbar Glassmorphism

## Overview

Replace solid yellow navbar with frosted glass: `bg-white/70 + backdrop-blur-md`. Cyan-tinted by page bg below. On scroll, opacity bumps to `bg-white/85`. Apply same treatment to mobile drawer.

## Requirements

- Functional:
  - Navbar wrapper: white at 70% opacity, backdrop blur
  - On scroll (`data-scrolled="true"`): white at 85% opacity, shadow
  - Mobile drawer matches the glass aesthetic
- Non-functional:
  - Backdrop-blur GPU cost acceptable (modern devices)
  - Text legibility ≥7:1 against cyan-tinted glass bg
  - Shop pill button stays visible / contrasted

## Architecture

- `top-nav.tsx` wrapper: swap `bg-brand-primary` → `bg-white/70 backdrop-blur-md`. Add scroll-state opacity bump.
- `mobile-nav.tsx` drawer: swap `bg-brand-primary` → `bg-white/95 backdrop-blur-md` (higher opacity since drawer covers full screen — pure transparency too distracting).
- `nav-underline`: already on ink, no change.
- Shop pill button: white-on-white risks low contrast → bump to `border border-ink/10` for definition.

## Related Code Files

- Modify: `components/nav/top-nav.tsx`
- Modify: `components/nav/mobile-nav.tsx`
- Modify (minor): `components/nav/nav-links.tsx` (Shop pill border for white-on-white separation)

## Implementation Steps

1. `top-nav.tsx`: replace the wrapper className:
   ```tsx
   className="sticky top-0 z-30 w-full overflow-visible bg-white/70 backdrop-blur-md transform-gpu transition-all duration-300 will-change-[box-shadow,background-color] data-[scrolled=true]:bg-white/85 data-[scrolled=true]:shadow-cozy-md"
   ```
2. `mobile-nav.tsx` drawer (line ~64): replace `bg-brand-primary` with `bg-white/95 backdrop-blur-md`.
3. `nav-links.tsx` Shop pill: add `border border-ink/10` (or `ring-1 ring-ink/10`) to give a hairline edge:
   ```tsx
   isShop
     ? "rounded-full bg-surface px-5 py-2 text-ink ring-1 ring-ink/10 shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-md"
     : ...
   ```
4. Run `pnpm typecheck` + `pnpm lint`.
5. Visual smoke:
   - Scroll: navbar gets less transparent + shadow
   - Mobile: open drawer, confirm glass aesthetic
   - Hover Shop button: lift effect works
   - Text legibility at scroll states

## Success Criteria

- [ ] Navbar appears frosted-glass cyan-tinted by page bg below
- [ ] On scroll, navbar opacity increases visibly (more solid white)
- [ ] Mobile drawer matches glass aesthetic
- [ ] Shop pill button has subtle hairline edge for definition
- [ ] All text ≥7:1 contrast against effective bg
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Glass effect washes out brand identity (no more dominant yellow). **Mitigation:** intentional — user explicitly rejected yellow navbar. Yellow now anchors elsewhere (hero zone, FeatureBanner, Newsletter).
- **Risk:** Backdrop-blur cost on older devices. **Mitigation:** standard CSS, GPU-accelerated. If perf issue surfaces, fallback to opaque `bg-white` via `@supports not (backdrop-filter)`.
- **Risk:** White Shop button on white navbar = ghost. **Mitigation:** ring-1 hairline adds edge definition.
