---
phase: 4
title: Hero Card-Back + Cyan Right Fade
status: completed
priority: P1
effort: 30m
dependencies:
  - 3
---

# Phase 4: Hero Card-Back + Cyan Right Fade

## Overview

4th hero iteration. Bring back a subtle text card (smaller/lighter than v1) for legibility. Change right-side gradient from yellow → cyan (`from-paper`) so banner melts into the page bg on the right.

**Convergence note:** If this still doesn't read as polished, the next conversation is about banner artwork, not gradients.

## Requirements

- Functional:
  - Desktop text wraps in a subtle white/cream card (low opacity, soft blur, light shadow)
  - Right-side gradient overlay uses `from-paper` (cyan) — not yellow
  - Left yellow zone preserved (text card sits on top of yellow)
  - Mobile keeps current yellow-tinted glass card
- Non-functional:
  - Backdrop-blur cost minimal (small element)
  - No layout shift
  - typecheck + lint clean

## Architecture

- `full-bleed-hero.tsx`:
  - Wrap `CardBody` invocation on desktop in a subtle card div
  - Card: `bg-white/55 + backdrop-blur-sm + shadow-cozy + rounded-2xl`
  - Right gradient: `from-paper via-paper/60 to-transparent` (replaces yellow)
  - Left zone: unchanged (yellow from prior iteration)

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`

## Implementation Steps

1. Locate the right-side gradient (currently yellow):
   ```tsx
   <div className="... w-1/4 bg-gradient-to-l from-[#ffd70c] via-[#ffd70c]/55 to-transparent md:block" />
   ```
   Replace with cyan:
   ```tsx
   <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-paper via-paper/60 to-transparent md:block" />
   ```
2. Locate the desktop overlay container (currently chrome-less):
   ```tsx
   <div className="pointer-events-auto mx-auto w-full max-w-hero px-8">
     <div className="max-w-md lg:max-w-lg">
       <CardBody />
     </div>
   </div>
   ```
   Wrap card body in a subtle card div:
   ```tsx
   <div className="pointer-events-auto mx-auto w-full max-w-hero px-8">
     <div className="max-w-md rounded-2xl bg-white/55 px-6 py-5 shadow-cozy backdrop-blur-sm lg:max-w-lg lg:px-8 lg:py-7">
       <CardBody />
     </div>
   </div>
   ```
3. (Optional) widen left yellow zone slightly if text card edge feels close to banner image:
   - `w-2/5` (current) → `w-1/2` (zone extends to 50%)
4. Confirm `objectPosition: "55% 50%"` still appropriate.
5. Run `pnpm typecheck` + `pnpm lint`.
6. Visual smoke at 768px, 1024px, 1440px, 1920px, >1600px:
   - Text card readable
   - Right side cyan blends with page bg
   - Characters fully visible center

## Success Criteria

- [ ] Subtle text card behind hero text (visible but not intrusive)
- [ ] Right-side gradient is cyan (not yellow) — image visually merges into page bg
- [ ] Left yellow zone + text card combination reads cleanly
- [ ] Characters fully visible in center
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Card-back makes the hero look like v1 all over again. **Mitigation:** card is much smaller, less opaque, no border, lighter shadow. Different design point.
- **Risk:** Cyan right fade clashes with yellow left zone. **Mitigation:** asymmetric is intentional per user choice. Both ends communicate "frame" without clashing because they meet through the image center (which dominates visually).
- **Risk:** White card on yellow zone reads pastel — too soft. **Mitigation:** if too soft, bump opacity to `bg-white/70` or add `border border-ink/10`.
