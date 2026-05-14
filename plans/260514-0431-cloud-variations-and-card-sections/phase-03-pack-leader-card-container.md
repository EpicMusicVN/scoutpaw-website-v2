---
phase: 3
title: Pack Leader Card Container
status: completed
priority: P2
effort: 25m
dependencies: []
---

# Phase 3: Pack Leader Card Container

## Overview

Convert FeaturedPupSpotlight from a full-bleed gradient section to a contained rounded card. Keep the warm-tan → yellow → peach gradient + sun rays INSIDE the card. Drop the top/bottom SectionCurves (no longer needed without full-bleed transition).

## Requirements

- Functional:
  - Section renders as a `max-w-hero` container with a rounded card inside
  - Gradient + sun rays preserved inside the card
  - Internal padding generous but balanced
- Non-functional:
  - Mobile: card pads in from page edges with comfortable margin
  - Desktop: max-w-hero container caps width
  - typecheck + lint clean

## Architecture

Current `featured-pup-spotlight.tsx`:
- Outer section: `relative -mx-4 overflow-hidden md:-mx-8` (full-bleed)
- SectionCurve top + bottom
- Inner div with gradient style + sun rays + content grid

New structure:
- Outer section: `relative mx-auto max-w-hero scroll-mt-24 px-4 py-12 md:px-8 md:py-16`
- No SectionCurves
- Inner div with gradient style + rounded-[2.5rem] + border + shadow + overflow-hidden
- Sun rays + content grid inside

## Related Code Files

- Modify: `components/home/featured-pup-spotlight.tsx`

## Implementation Steps

1. Replace the outer section + SectionCurves + inner gradient div:
   ```tsx
   // Before
   <section className="relative -mx-4 overflow-hidden md:-mx-8">
     <SectionCurve position="top" color="var(--bg-base)" variant="hill" height={70} />
     <div className="relative px-4 py-28 md:px-8 md:py-40" style={{ background: "linear-gradient(...)" }}>
       <SunRays />
       <div className="relative mx-auto grid max-w-hero items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
         {/* content */}
       </div>
     </div>
     <SectionCurve position="bottom" color="var(--bg-base)" variant="hill" height={70} />
   </section>

   // After
   <section className="relative mx-auto max-w-hero scroll-mt-24 px-4 py-12 md:px-8 md:py-16">
     <div
       className="relative overflow-hidden rounded-[2.5rem] border border-ink/10 px-4 py-20 shadow-cozy-md md:px-12 md:py-28"
       style={{
         background:
           "linear-gradient(135deg, var(--bg-warm-tan) 0%, var(--brand-primary) 50%, var(--bg-peach) 100%)",
       }}
     >
       <SunRays />
       <div className="relative mx-auto grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
         {/* content unchanged */}
       </div>
     </div>
   </section>
   ```
2. Remove `SectionCurve` import if no longer used.
3. Internal padding tuned down (was `py-28 md:py-40` full-bleed → now `py-20 md:py-28` inside card).
4. Inner grid loses `max-w-hero` (already wrapped by outer container).
5. Run `pnpm typecheck` + `pnpm lint`.
6. Visual smoke at multiple breakpoints.

## Success Criteria

- [ ] Section renders as a contained rounded card
- [ ] Yellow gradient + sun rays preserved inside card
- [ ] No SectionCurves at top/bottom
- [ ] Card has visible border + shadow (clearly elevated from page bg)
- [ ] Card content unchanged (kicker, h2, subtitle, bio, quote, buttons, character image)
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Mobile card padding too tight after dropping full-bleed. **Mitigation:** outer section has `px-4 md:px-8` which gives 16-32px space outside card.
- **Risk:** SunRays SVG positioning calibrated for full-bleed; may look off inside card. **Mitigation:** `overflow-hidden` on card clips overflow; SunRays uses absolute inset-0 which adapts to container size.
- **Risk:** Removing SectionCurves leaves an abrupt transition into surrounding sections. **Mitigation:** cyan page bg fills the gap — uniform background everywhere except this card. Cleaner than curves.
