---
phase: 4
title: Hero Letterbox Rework
status: completed
priority: P1
effort: 2h
dependencies:
  - 1
  - 3
---

# Phase 4: Hero Letterbox Rework

## Overview

Replace the current glass-card-over-banner composition with a letterbox layout: banner image stays at natural aspect ratio (verified 16:9), centered, max-width capped at 1600px. On wider screens the page bg `#c6e7e9` fills the gutters. Text lives in the left gutter zone (aligned with navbar via `max-w-hero`). On desktop the glass card is removed entirely — text reads against the quiet cyan gutter. Mobile keeps a glass card retinted to the new bg color.

## Requirements

- Functional:
  - Banner image visible in full (characters not covered)
  - Image preserves natural aspect ratio — no stretching
  - Text aligns with the site's `max-w-hero` container (matches navbar)
  - Mobile (< md) keeps current stack-below behavior
- Non-functional: no layout shift; image loads with `priority`; typecheck/lint clean.

## Architecture

- `banner.png` is **2754×1536** = aspect ratio 1.793 ≈ **16:9** (1.778, 0.7% drift, invisible).
- Wrap the `<Image>` in a `mx-auto max-w-[1600px]` div with `md:aspect-[16/9]`.
- Outside the 1600px cap (on screens >1600px), the parent section's `bg-paper` (now cyan) fills the gutters.
- Add a left-edge gradient fade overlay on the image (`bg-gradient-to-r from-paper via-paper/60 to-transparent`, ~33% wide) to soften the seam between image and gutter.
- Desktop text card: keep absolute overlay + `max-w-hero` container from the prior alignment fix, but drop the glass-card chrome (no bg, no blur, no border, no shadow). Text sits over the gradient zone.
- Mobile card: keep glass card structurally; retint to `bg-[#c6e7e9]/85` (new bg color tint) instead of dropped `bg-honey/85`.

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`

## Implementation Steps

1. Wrap the `<Image>` in a max-width container:
   ```tsx
   <div className="relative mx-auto w-full max-w-[1600px] aspect-[4/3] md:aspect-[16/9] md:min-h-0">
     <Image src={image} alt={imageAlt} fill priority
            sizes="(min-width: 1600px) 1600px, 100vw"
            className="object-cover"
            style={{ objectPosition: "60% 50%" }} />
     <div className="hidden md:block absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-paper via-paper/60 to-transparent pointer-events-none" />
   </div>
   ```
2. Remove the `md:min-h-[100svh]` constraint — letterbox aspect now drives height.
3. Update mobile glass card: replace `bg-honey/85` with `bg-[#c6e7e9]/85`.
4. Update desktop card overlay container — drop card chrome:
   - Remove `rounded-3xl border border-white/40 bg-honey/85 shadow-cozy-xl backdrop-blur-xl p-8 lg:p-10`
   - Keep only the `max-w-md lg:max-w-lg` width constraint
   - Add `drop-shadow-sm` to title/kicker for legibility against the soft gradient
5. Preserve `objectPosition: "60% 50%"` — pushes characters slightly right of center, keeping the left gradient zone clear for text.
6. Run `pnpm typecheck` + `pnpm lint`.
7. Visual smoke at: 375px, 768px, 1024px, 1440px, 1920px. Verify characters fully visible at all sizes.

## Success Criteria

- [ ] Banner image visible in full at all breakpoints (no overlay over characters)
- [ ] On screens > 1600px, cyan gutters appear left/right of image
- [ ] Text card aligned with navbar left edge (max-w-hero container)
- [ ] Mobile keeps stack-below-banner pattern with cyan-tinted glass card
- [ ] No layout shift on load
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** `aspect-[16/9]` crops top/bottom of art if banner has tighter framing than expected. **Mitigation:** verified aspect ratio matches the asset (2754×1536); object-cover at 16/9 shows 100% of the art height.
- **Risk:** Text legibility on the gradient zone varies with image content. **Mitigation:** add subtle `drop-shadow-sm` on kicker/h1; tune gradient opacity (`via-paper/60` → `via-paper/75` if needed).
- **Risk:** `objectPosition: "60% 50%"` cuts off characters on portrait viewports. **Mitigation:** mobile stays at aspect-[4/3] which preserves more height; only md+ uses 16:9 + cover.
