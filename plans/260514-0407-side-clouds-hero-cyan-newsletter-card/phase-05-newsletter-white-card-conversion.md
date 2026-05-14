---
phase: 5
title: Newsletter White Card Conversion
status: completed
priority: P2
effort: 30m
dependencies: []
---

# Phase 5: Newsletter White Card Conversion

## Overview

Convert the NewsletterCTA from a full-bleed yellow gradient band to a "Stay Tuned"-style centered white card. Drops yellow gradient + SectionCurve. Adds `rounded-[2rem] bg-surface border shadow-cozy-md` card inside a `max-w-3xl` container.

## Requirements

- Functional:
  - Newsletter renders as a centered white card with rounded corners
  - Form, social proof, paw corner decoratives preserved
  - CTA button stays dark ink
- Non-functional:
  - Newsletter scrolls into view smoothly (`#newsletter` anchor still works)
  - typecheck + lint clean

## Architecture

`components/home/newsletter-cta.tsx`. Outer section becomes a `max-w-3xl mx-auto` container. Yellow gradient div replaced with a white `bg-surface` card. SectionCurve removed (not needed without gradient transition). CornerPaws stay — they decorate the white card.

## Related Code Files

- Modify: `components/home/newsletter-cta.tsx`
- Modify (if needed): `app/coming-soon/[slug]/page.tsx` (if it uses NewsletterCTA with footerSlot expecting yellow bg)

## Implementation Steps

1. In `newsletter-cta.tsx`, replace the section structure:
   ```tsx
   // Before
   <section id="newsletter" className="relative scroll-mt-24 overflow-hidden">
     <SectionCurve position="top" color="var(--bg-base)" variant="cloud" height={70} />
     <div className="relative px-4 pt-24 pb-12 md:px-8 md:pt-32 md:pb-16" style={{ background: "linear-gradient(180deg, #ffd70c 0%, #ffe968 100%)" }}>
       <CornerPaws />
       <div className="relative mx-auto max-w-2xl text-center">{/* content */}</div>
     </div>
   </section>

   // After
   <section id="newsletter" className="relative mx-auto max-w-3xl scroll-mt-24 px-4 py-16 md:px-8 md:py-20">
     <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-surface px-6 py-10 text-center shadow-cozy-md md:px-12 md:py-14">
       <CornerPaws />
       <div className="relative">{/* content moved here, drop the inner max-w-2xl */}</div>
     </div>
   </section>
   ```
2. Remove `SectionCurve` import if no longer used elsewhere in the file.
3. CornerPaws should now position relative to the inner card (not the full bleed) — verify positioning classes still place them at card corners (likely fine since they use `absolute` + `top/bottom/left/right`).
4. CTA button: stays dark ink (current). Validates against white card.
5. Run `pnpm typecheck` + `pnpm lint`.
6. Visual smoke: scroll to newsletter, confirm card style. Check coming-soon pages that also use NewsletterCTA.

## Success Criteria

- [ ] Newsletter renders as a centered, contained white card
- [ ] No yellow gradient anywhere in NewsletterCTA
- [ ] CornerPaws still visible at card corners
- [ ] Form + CTA still functional
- [ ] `#newsletter` anchor still scrolls correctly
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Newsletter loses visual emphasis without yellow band. **Mitigation:** rounded card + shadow + dark CTA provide structure; sits in cyan page bg with strong contrast.
- **Risk:** `coming-soon/[slug]` page reuses NewsletterCTA with a `footerSlot` ("Back to home" button). The footerSlot was designed for yellow bg. **Mitigation:** footerSlot now sits on white card — verify button variant still readable.
- **Risk:** CornerPaws (currently `text-ink/15`) clash with rounded card corners. **Mitigation:** card has `overflow-hidden` to clip paws within rounded edges.
