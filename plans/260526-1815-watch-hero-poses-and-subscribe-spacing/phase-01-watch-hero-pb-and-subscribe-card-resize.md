---
phase: 1
title: Watch Hero PB and Subscribe Card Resize
status: completed
priority: P2
effort: 20m
dependencies: []
---

# Phase 1: Watch Hero PB and Subscribe Card Resize

## Overview

Single phase that handles both targeted fixes (each is a single-file edit).

## Requirements

**Functional:**
- Watch hero flanking poses (`husky1`, `corgi2`) display full body at xl/2xl breakpoints (no half-body cut-off)
- Subscribe-card decoratives (`corgi1`, `collie1`) sized `w-48` (192px), pushed `-left-20/-right-20`, positioned `bottom-8/bottom-10` inside card region
- Subscribe-card section has `pb-32 md:pb-48` for footer clearance
- Mobile/tablet behavior unchanged (poses still `xl:block` / `lg:block` only)

**Non-functional:**
- No layout regression on other watch page sections
- No content/copy changes

## Architecture

Pure CSS class adjustments. No structural changes.

## Related Code Files

- **Modify:** `components/watch/watch-hero.tsx` — text container at lines ~89
- **Modify:** `components/watch/subscribe-card.tsx` — section at line ~7, decoratives at lines ~37-50

## Implementation Steps

### Watch hero fix

1. **Open** `components/watch/watch-hero.tsx`.
2. **Add bottom padding** to the centered text + flanking poses container (line ~89):
   ```diff
   - <div className="relative mt-10 md:mt-12">
   + <div className="relative mt-10 md:mt-12 pb-20 xl:pb-32 2xl:pb-40">
   ```
   - `pb-20` (80px) on `<xl` — but poses are `xl:block` only, so this is harmless extra space below the centered text on smaller viewports
   - `xl:pb-32` (128px) and `2xl:pb-40` (160px) — buffer below text where the `w-56` / `w-72` poses can complete their bodies

### Subscribe-card fix

3. **Open** `components/watch/subscribe-card.tsx`.
4. **Edit section padding** (line ~7):
   ```diff
   - <section className="relative mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
   + <section className="relative mx-auto max-w-3xl px-4 pt-12 pb-32 md:px-8 md:pt-16 md:pb-48">
   ```
5. **Edit left dog** (line ~42):
   ```diff
   - className="absolute bottom-2 -left-14 h-auto w-64 -rotate-4"
   + className="absolute bottom-8 -left-20 h-auto w-48 -rotate-4"
   ```
6. **Edit right dog** (line ~49):
   ```diff
   - className="absolute bottom-4 -right-14 h-auto w-64 rotate-4"
   + className="absolute bottom-10 -right-20 h-auto w-48 rotate-4"
   ```
7. **Save both files.**
8. **Typecheck + lint** — must pass.

## Success Criteria

- [ ] Watch hero poses display full body at xl/2xl (no clipping)
- [ ] Subscribe-card decoratives sized `w-48`
- [ ] Subscribe-card section has `pb-32 md:pb-48`
- [ ] Mobile/tablet renders unchanged
- [ ] Typecheck + lint clean

## Risk Assessment

- **Risk:** `pb-20` on the watch hero text container looks like awkward empty space on `<xl` where no poses are shown. *Mitigation:* poses use `xl:block` so they appear only at xl+. The `pb-20` adds 80px below centered text — minor visual buffer, doesn't read as broken. If problematic, gate the bottom padding to `xl:pb-32` only and drop the base `pb-20`.
- **Risk:** Subscribe-card with `pb-48` (192px) feels tall. *Mitigation:* matches newsletter-cta pattern; consistent with site's footer-clearance design.

## Security Considerations

None.
