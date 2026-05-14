---
phase: 1
title: Navbar Yellow + Shop Button
status: completed
priority: P1
effort: 30m
dependencies: []
---

# Phase 1: Navbar Yellow + Shop Button

## Overview

Anchor the navbar in brand yellow `#ffd70c`. Style the `Shop` nav item as a prominent white button. Match the mobile drawer to navbar yellow. Re-target `.nav-underline` from yellow to ink (since the bg is now yellow).

## Requirements

- Functional:
  - Navbar wrapper renders yellow bg
  - Shop link renders as white-bg pill button with dark text + shadow
  - Other nav links stay text-link styled, ink text
  - Mobile drawer matches yellow
  - Nav underline (hover/active indicator) switches to ink color
- Non-functional: contrast ≥7:1 for body text; no layout shift; sticky scroll still works.

## Architecture

- `top-nav.tsx` wrapper gets `bg-brand-primary` plus subtle bottom separation.
- `nav-links.tsx` detects Shop item (`item.label === "Shop"`) and renders button variant; other items stay text.
- `mobile-nav.tsx` overlay drawer bg switches cyan → yellow.
- `globals.css` `.nav-underline::after` background switches from `--brand-primary` to `--ink`.

## Related Code Files

- Modify: `components/nav/top-nav.tsx`
- Modify: `components/nav/nav-links.tsx`
- Modify: `components/nav/mobile-nav.tsx`
- Modify: `app/globals.css` (`.nav-underline` background)

## Implementation Steps

1. **`top-nav.tsx`**: add `bg-brand-primary` on the sticky header wrapper. If a scroll-effect class is conditionally swapped, ensure both states use yellow. Add `shadow-cozy` or `border-b border-ink/10` for separation from hero.
2. **`nav-links.tsx`**: detect `item.label === "Shop"` and render with button styling:
   ```tsx
   className={item.label === "Shop"
     ? "rounded-full bg-surface px-4 py-1.5 font-display font-bold text-ink shadow-cozy hover:-translate-y-0.5 transition-transform"
     : /* existing link styling */}
   ```
3. **`mobile-nav.tsx`** line 64: `bg-paper` → `bg-brand-primary`. Verify drawer body text still uses `text-ink`. Check the in-drawer Shop/Newsletter buttons read well on yellow.
4. **`globals.css`** `.nav-underline::after`: `background: var(--brand-primary)` → `background: var(--ink)`.
5. Run `pnpm typecheck` + `pnpm lint`.
6. Visual smoke: scroll behavior, hover states, mobile drawer open/close, Shop button hover.

## Success Criteria

- [ ] Navbar bg is `#ffd70c` site-wide
- [ ] Shop nav item renders as a white button distinct from other items
- [ ] Other nav links remain text-style with ink underline on hover
- [ ] Mobile drawer bg is yellow
- [ ] Sticky scroll behavior preserved
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Logo readability on yellow drops (logo has yellow-glow drop-shadow from prior pass). **Mitigation:** logo PNG is light/text-based; if needed, change drop-shadow color to white or ink in logo wrapper.
- **Risk:** Shop button placement breaks mobile drawer layout. **Mitigation:** keep button styling separate for desktop only; mobile drawer renders Shop as a plain item.
- **Risk:** Disabled nav items (text-ink/45) too dim on yellow. **Mitigation:** test visually; if needed bump to `text-ink/60`.
