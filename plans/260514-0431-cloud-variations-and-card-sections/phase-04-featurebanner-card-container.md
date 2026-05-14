---
phase: 4
title: FeatureBanner Card Container
status: completed
priority: P3
effort: 15m
dependencies:
  - 3
---

# Phase 4: FeatureBanner Card Container

## Overview

Mirror Pack Leader (P3) treatment. Convert FeatureBanner ("Shop the Pack — UNBOX THE MAGIC") from full-bleed to contained rounded card. Keep warm-tan → yellow → peach gradient inside.

## Requirements

- Functional: section renders as a `max-w-hero` container with a rounded card inside
- Visual consistency with Pack Leader card (same radius, border, shadow)

## Related Code Files

- Modify: `components/home/feature-banner.tsx`

## Implementation Steps

1. Replace structure:
   ```tsx
   // Before
   <section className="relative overflow-hidden">
     <SectionCurve position="top" color="var(--bg-base)" variant="wave" height={60} />
     <div className="relative px-4 py-24 md:px-8 md:py-32" style={{ background: "linear-gradient(...)" }}>
       <div className={`relative mx-auto grid max-w-hero items-center gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16 ${reverse ? "..." : ""}`}>
         {/* content */}
       </div>
     </div>
     <SectionCurve position="bottom" color="var(--bg-base)" variant="wave" height={60} />
   </section>

   // After
   <section className="relative mx-auto max-w-hero scroll-mt-24 px-4 py-12 md:px-8 md:py-16">
     <div
       className="relative overflow-hidden rounded-[2.5rem] border border-ink/10 px-4 py-20 shadow-cozy-md md:px-12 md:py-24"
       style={{
         background:
           "linear-gradient(120deg, var(--bg-warm-tan) 0%, var(--brand-primary) 55%, var(--bg-peach) 100%)",
       }}
     >
       <div className={`relative mx-auto grid items-center gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16 ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}>
         {/* content unchanged */}
       </div>
     </div>
   </section>
   ```
2. Remove `SectionCurve` import if no longer used elsewhere in the file.
3. Inner grid loses `max-w-hero` (already on outer section).
4. Run `pnpm typecheck` + `pnpm lint`.
5. Visual smoke: confirm card matches Pack Leader's card style.

## Success Criteria

- [ ] Section renders as a contained rounded card
- [ ] Yellow gradient preserved inside card
- [ ] Card border + shadow match Pack Leader
- [ ] CTA button still readable (dark variant from prior cook)
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Two consecutive yellow cards (Pack Leader → CharacterShowcase → FeatureBanner) feel repetitive. **Mitigation:** CharacterShowcase sits between them with its cyan bg + paw pattern; provides palette break.
- **Risk:** `reverse` prop variant disrupted. **Mitigation:** classes preserved verbatim; reverse still flips `order-2` on first grid child.
