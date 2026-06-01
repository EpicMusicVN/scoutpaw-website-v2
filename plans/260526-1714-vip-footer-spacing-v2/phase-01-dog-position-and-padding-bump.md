---
phase: 1
title: Dog Position and Padding Bump
status: completed
priority: P2
effort: 10m
dependencies: []
---

# Phase 1: Dog Position and Padding Bump

## Overview

Two single-line edits in `components/home/newsletter-cta.tsx`: move decorative dogs UP from the section bottom, and increase section bottom padding for footer clearance.

## Requirements

**Functional:**
- Decorative dogs no longer touch or overlap the footer
- Dogs sit cleanly inside the newsletter card visual area
- At least 80px clearance between dog feet and footer top on desktop
- No mobile/tablet regression (dogs still `lg:block` only)

**Non-functional:**
- No new layout shifts
- No changes to form interaction or content

## Architecture

The newsletter card has decorative dog Images positioned absolute inside the outer section. Currently:
- Section: `pb-28 md:pb-36` (112/144px bottom padding from Plan A)
- Dogs: `-bottom-2 / -bottom-1` (8/4px BELOW section content edge — they hang into the padding region)

The dogs are inside the section but positioned outside the card boundary, so they visually float below the card. With section padding pushing the section bottom away from the footer, the dogs sit between the card and the footer — and previously hit the footer.

**Fix targets:**
- Push dogs UP into the card area: `-bottom-2` / `-bottom-1` → `bottom-8` / `bottom-10`
- Push section padding bigger: `pb-28 md:pb-36` → `pb-32 md:pb-48`

## Related Code Files

- **Modify:** `components/home/newsletter-cta.tsx`

## Implementation Steps

1. **Open** `components/home/newsletter-cta.tsx`.
2. **Edit section padding** (line ~67):
   ```diff
   - className="relative mx-auto max-w-3xl scroll-mt-24 px-4 pt-4 pb-28 md:px-8 md:pt-4 md:pb-36"
   + className="relative mx-auto max-w-3xl scroll-mt-24 px-4 pt-4 pb-32 md:px-8 md:pt-4 md:pb-48"
   ```
3. **Edit left dog position** (in decoratives block):
   ```diff
   - className="absolute -bottom-2 -left-20 h-auto w-48 -rotate-6"
   + className="absolute bottom-8 -left-20 h-auto w-48 -rotate-6"
   ```
4. **Edit right dog position**:
   ```diff
   - className="absolute -bottom-1 -right-20 h-auto w-48 rotate-6"
   + className="absolute bottom-10 -right-20 h-auto w-48 rotate-6"
   ```
5. **Save.**
6. **Typecheck + lint** — must pass.

## Success Criteria

- [ ] Section has `pb-32 md:pb-48`
- [ ] Left dog at `bottom-8 -left-20 w-48`
- [ ] Right dog at `bottom-10 -right-20 w-48`
- [ ] Typecheck + lint clean

## Risk Assessment

- **Risk:** Dogs moved too far up, look detached from card. *Mitigation:* `bottom-8`/`bottom-10` (32/40px above section content edge) keeps them visually anchored to the card region.
- **Risk:** Padding too large, gap to footer feels excessive. *Mitigation:* `pb-32 md:pb-48` = 128/192px — generous but not extreme. Tune in Phase 2 if needed.

## Security Considerations

None.
