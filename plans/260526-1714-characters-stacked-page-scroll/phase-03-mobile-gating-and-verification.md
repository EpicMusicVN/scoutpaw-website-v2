---
phase: 3
title: Mobile Gating and Verification
status: completed
priority: P2
effort: 1h
dependencies:
  - 1
  - 2
---

# Phase 3: Mobile Gating and Verification

## Overview

Confirm mobile renders gracefully (no sticky, no transforms, plain stacked sections). Full plan verification: typecheck, lint, manual breakpoint walkthrough, iOS Safari sanity check, changelog entry.

## Requirements

**Functional:**
- Mobile (<md): `CharacterSection` shows as plain stacked `h-screen` sections (or `min-h-screen` if content overflows). No sticky pinning. No `motion.div` transforms applied (or transforms are no-op on mobile).
- Desktop (md+): full stacked-scroll choreography
- iOS Safari: scenes render at 100vh without jump-on-address-bar-resize (use `100dvh` if needed)
- `prefers-reduced-motion`: transforms skipped at all breakpoints

**Non-functional:**
- No regressions on other pages
- Performance: ~60fps scroll on a recent laptop; no extreme jank on mid-range mobile

## Architecture

Mobile gating tactics:
- Phase 1 already gated sticky behavior to `md:sticky md:top-0 md:h-screen`. Mobile defaults to relative + no sticky.
- For transforms (set via inline `style` on `motion.div`), they apply at all breakpoints. To no-op on mobile:
  - Option A: detect via `useMediaQuery` hook (would require `use-media` dep or custom hook)
  - Option B: keep transforms always applied; on mobile they're harmless because the scenes aren't sticky (the entire section scrolls naturally — transforms apply but don't read as motion since the user is scrolling past the whole scene anyway)
  - **Choose Option B** — simpler. The transforms tied to `useScroll` only fire as the section enters/leaves viewport; on mobile that's the natural scroll, so effect is minimal/invisible.
- `prefers-reduced-motion` already covered via `useReducedMotion()` in Phase 2.

## Related Code Files

- **Modify (likely no further change):** `components/characters/character-section.tsx`
- **Modify (if iOS issues):** swap `h-screen` for `h-[100dvh]` or `min-h-screen`
- **Modify:** `docs/project-changelog.md`

## Implementation Steps

1. **Mobile verification** (Chrome devtools mobile mode, 375px viewport):
   - Scroll through `/characters` — confirm sections stack naturally, no sticky pinning
   - Confirm pose visible inside section, content readable
   - No horizontal scroll
2. **Tablet verification** (768px):
   - First breakpoint where sticky engages
   - Confirm sticky behavior begins cleanly
3. **Desktop verification** (1280px, 1536px):
   - Full sticky + transform choreography
   - Confirm previous scene subtly scales/fades on next entry
4. **iOS Safari sanity** (BrowserStack or device):
   - Address bar resize: verify 100vh sections don't jump
   - If jump observed: change `h-screen` → `h-[100dvh]` in `character-section.tsx`
5. **`prefers-reduced-motion`** (Chrome DevTools → Rendering → Emulate CSS media feature):
   - Transforms should be flat (no scale/opacity change)
   - Sticky behavior still works
6. **Cross-page regression check**:
   - `/top-picks`: dividers still render (default `trio` variant), unchanged
   - `/shop`: dividers still render
   - Watch pages: dividers still render
   - `/`: home page unchanged
7. **Typecheck + lint** the full project.
8. **Update changelog** — append to `docs/project-changelog.md`:
   ```markdown
   ## [2026-05-26] - Characters Page v3: Stacked 100vh Scroll Scenes

   ### Overview
   Plan E of the styling iteration. Rebuilt /characters as full-viewport sticky scenes with layered scroll choreography. Replaces Plan B's card model and removes Plan C's dividers from /characters (component remains for other pages). Mobile gets plain stacked sections, no sticky/transforms.

   ### Changes
   - `components/characters/character-section.tsx`: converted to client component with framer-motion `useScroll`/`useTransform`. Outer `relative h-screen` contributes scroll height; inner `md:sticky md:top-0 md:h-screen` pins on desktop. Per-character `surfaceTint` fills the scene full-bleed. Subtle scale/opacity tween on outgoing scene. `useReducedMotion` guard. New props: `index`, `total`.
   - `app/characters/page.tsx`: removed `Fragment`, `CloudDivider`, `ScrollReveal` wrapper around character sections, `DIVIDER_VARIANTS`. Added `<div className="relative">` scene stack container. Removed all 5 cloud dividers from this page.

   ### Validation
   - typecheck + lint clean
   - 4-breakpoint manual check (mobile 375, tablet 768, desktop 1280, wide 1536)
   - iOS Safari sticky behavior verified
   - `prefers-reduced-motion` opt-out verified
   - CloudDivider still renders on /top-picks, /shop, watch pages

   ### Trade-Off
   This iteration retires the Plan B rounded-card geometry and removes Plan C's dividers from /characters. Plan C component itself remains for top-picks/shop/watch consumers.
   ```

## Success Criteria

- [ ] Mobile: plain stacked sections, no sticky, content readable
- [ ] Tablet: sticky begins cleanly
- [ ] Desktop: full stacked choreography, ~60fps
- [ ] iOS Safari: no 100vh jump
- [ ] `prefers-reduced-motion`: transforms skipped
- [ ] Other CloudDivider consumers unaffected
- [ ] Typecheck + lint clean
- [ ] Changelog entry added

## Risk Assessment

- **Risk:** iOS Safari needs `100dvh` instead of `100vh`. *Mitigation:* hot-swap if observed; both are supported in modern Safari.
- **Risk:** Mobile transforms still trigger (since not gated by breakpoint). *Mitigation:* per Option B in architecture, they're harmless because section isn't sticky on mobile — transforms apply during natural scroll, effect minimal.
- **Risk:** Long page hurts mobile LCP. *Mitigation:* only first scene `priority`; others lazy-loaded by Next.js Image default.

## Security Considerations

None.
