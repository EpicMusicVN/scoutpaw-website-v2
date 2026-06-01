---
phase: 2
title: Verification and Docs
status: completed
priority: P3
effort: 15m
dependencies:
  - 1
---

# Phase 2: Verification and Docs

## Overview

Verify watch hero pose display + subscribe-card resize + footer clearance; append changelog.

## Implementation Steps

1. **Typecheck + lint** the full project.
2. **Live verification** on `/watch`:
   - xl viewport (1280px): husky/corgi flanking poses display full body, no clipping
   - 2xl viewport (1536px): same with larger pose size
   - <xl (1024px and below): poses hidden, no awkward bottom whitespace
   - Subscribe-card section: dogs visibly smaller (`w-48`), clear footer separation
   - Mobile: subscribe-card content unchanged, dogs hidden
3. **Append changelog**:
   ```markdown
   ## [2026-05-26] - Watch Hero Poses + Subscribe Card Spacing

   ### Overview
   Plan I of styling iteration 3. Fixed watch hero's flanking poses being clipped at half-body (added bottom padding to text container so pose natural height fits inside the section's overflow-hidden bounds). Resized subscribe-card decoratives to match the newsletter-cta pattern from Plan F (w-64 → w-48, pushed further outside the card, moved up inside card region) and bumped section bottom padding for footer clearance.

   ### Changes
   - `components/watch/watch-hero.tsx`: text+poses container `mt-10 md:mt-12` → `mt-10 md:mt-12 pb-20 xl:pb-32 2xl:pb-40` for pose-body clearance at xl+.
   - `components/watch/subscribe-card.tsx`:
     - Section: `py-12 md:py-16` → `pt-12 pb-32 md:pt-16 md:pb-48` (extra footer clearance)
     - Left dog: `bottom-2 -left-14 w-64` → `bottom-8 -left-20 w-48`
     - Right dog: `bottom-4 -right-14 w-64` → `bottom-10 -right-20 w-48`

   ### Validation
   - typecheck + lint clean
   - Watch hero poses display full body at xl/2xl
   - Subscribe-card layout matches newsletter-cta visual pattern
   - Clear footer separation on /watch
   ```

## Success Criteria

- [ ] Watch hero poses display full body at xl/2xl
- [ ] Subscribe-card dogs sized `w-48`
- [ ] Subscribe-card has clear footer separation
- [ ] Typecheck + lint clean
- [ ] Changelog entry added

## Risk Assessment

- **Risk:** Visual review says the pb-20 below watch hero text reads as awkward. *Mitigation:* drop to `xl:pb-32` only, no base `pb-20`.

## Security Considerations

None.
