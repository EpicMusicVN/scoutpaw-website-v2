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

Manual visual check across the 4 pages NewsletterCTA appears on (home, characters, top-picks, shop), then update changelog.

## Requirements

**Functional:**
- Dogs visibly sit inside card region, not touching footer
- Clearance between dog feet and footer top is ~80–120px on desktop
- Mobile/tablet behavior unchanged (dogs hidden)
- Changelog entry written

**Non-functional:**
- No content/copy changes; no API changes

## Architecture

Verification only.

## Related Code Files

- **Modify:** `docs/project-changelog.md`

## Implementation Steps

1. **Typecheck + lint** the full project.
2. **Dev server live check** at desktop widths (1280px, 1536px, 1920px):
   - `/` — confirm dogs visible inside newsletter card, clear gap to footer
   - `/characters` — same
   - `/top-picks` — same
   - `/shop` — same
3. **Mobile check** (375px): dogs still hidden (still `lg:block`)
4. **Tablet check** (768px): dogs still hidden
5. **Update changelog**:
   ```markdown
   ## [2026-05-26] - VIP Footer Spacing v2

   ### Overview
   Plan F of the styling iteration. Fixes residual issue from Plan A's VIP spacing: decorative dogs at the newsletter card edge were still overlapping the footer. Moved dogs up inside the card region and bumped section padding for additional footer clearance.

   ### Changes
   - `components/home/newsletter-cta.tsx`:
     - Section padding: `pb-28 md:pb-36` → `pb-32 md:pb-48`
     - Left dog: `-bottom-2 -left-20` → `bottom-8 -left-20`
     - Right dog: `-bottom-1 -right-20` → `bottom-10 -right-20`

   ### Validation
   - typecheck + lint clean
   - Visual check on /, /characters, /top-picks, /shop confirmed dogs no longer overlap footer
   ```

## Success Criteria

- [ ] Visual confirmation across all 4 pages
- [ ] Mobile/tablet unchanged
- [ ] Typecheck + lint clean
- [ ] Changelog entry added

## Risk Assessment

- **Risk:** Gap feels too large on some viewports. *Mitigation:* hot-tune `pb-48` to `pb-44` if needed; minor adjustment.

## Security Considerations

None.
