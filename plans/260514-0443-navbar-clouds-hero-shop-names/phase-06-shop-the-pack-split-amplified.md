---
phase: 6
title: Shop The Pack Split Amplified
status: completed
priority: P2
effort: 30m
dependencies: []
---

# Phase 6: Shop The Pack Split Amplified

## Overview

Keep the FeatureBanner card wrap from last cook, but make the text/image split MORE pronounced. Image fills its grid column edge-to-edge of the card (no padding gap, no rotation, no inset-card). Reads as a magazine spread inside the card.

## Requirements

- Functional:
  - Copy block has internal padding on left/top/bottom
  - Image side has zero padding (fills full half)
  - Image uses `object-cover` and fills the entire grid column
  - Card maintains `rounded-[2.5rem] border shadow-cozy-md overflow-hidden`
- Non-functional:
  - Mobile stacks vertically (image becomes top or bottom)
  - typecheck + lint clean

## Architecture

`components/home/feature-banner.tsx`. Move card-level padding to the copy column only. Drop the rotated bg-surface inset wrapper around the image. Image becomes a direct `fill` cover inside its grid cell.

## Related Code Files

- Modify: `components/home/feature-banner.tsx`

## Implementation Steps

1. Replace the inner structure:
   ```tsx
   // Before
   <div
     className="relative overflow-hidden rounded-[2.5rem] border border-ink/10 px-4 py-20 shadow-cozy-md md:px-12 md:py-24"
     style={{ background: "linear-gradient(...)" }}
   >
     <div className={`relative mx-auto grid items-center gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16 ${reverse ? "..." : ""}`}>
       <div className="relative z-10">
         {/* copy */}
       </div>
       <div className="relative aspect-[4/3] w-full md:aspect-auto md:h-[460px] lg:h-[540px]">
         <div className="relative h-full w-full -rotate-1 overflow-hidden rounded-[2.5rem] border border-ink/10 bg-surface shadow-cozy-xl transition-transform duration-500 hover:rotate-0">
           <Image ... className="object-cover" />
         </div>
       </div>
     </div>
   </div>

   // After
   <div
     className="relative overflow-hidden rounded-[2.5rem] border border-ink/10 shadow-cozy-md"
     style={{ background: "linear-gradient(...)" }}
   >
     <div className={`relative grid items-stretch md:grid-cols-[1fr_1.4fr] ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}>
       {/* Copy column — padded */}
       <div className="relative z-10 px-4 py-16 md:py-20 md:pl-12 md:pr-8">
         {/* kicker / h2 / body / subDescription / cta — unchanged */}
       </div>
       {/* Image column — full bleed to card edge */}
       <div className="relative aspect-[4/3] w-full md:aspect-auto md:min-h-[460px] lg:min-h-[540px]">
         <Image
           src={image}
           alt={imageAlt}
           fill
           sizes="(min-width: 768px) 60vw, 100vw"
           className="object-cover"
         />
       </div>
     </div>
   </div>
   ```
2. Changes:
   - Drop outer-div padding (was `px-4 py-20 md:px-12 md:py-24`)
   - Put padding on the copy block: `px-4 py-16 md:py-20 md:pl-12 md:pr-8`
   - Drop the `-rotate-1 bg-surface shadow-cozy-xl rounded-[2.5rem]` wrapper around the Image
   - `<Image>` is now a direct child of the image column, filling it with `fill` + `object-cover`
   - Grid uses `items-stretch` (not `items-center`) so both columns equal height
   - Grid loses `gap-10 md:gap-16` (no gap between text and image) and `mx-auto` (since no max-width to center inside)
3. Run `pnpm typecheck` + `pnpm lint`.
4. Visual smoke at 768/1024/1440: confirm clean split, image edge meets card edge.

## Success Criteria

- [ ] Image fills its grid column edge-to-edge inside the card
- [ ] Copy column has comfortable internal padding
- [ ] No rotated inset around image
- [ ] Card maintains rounded corners + shadow + overflow-hidden
- [ ] Mobile stacks vertically with image first or last (per default grid behavior)
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Image edge meeting yellow gradient feels abrupt. **Mitigation:** card `overflow-hidden` clips. Image is opaque so the seam is clean.
- **Risk:** Removing image rotation removes the playful sticker feel. **Mitigation:** acceptable — user explicitly wants editorial / cinematic. Sticker feel survives on character cards.
- **Risk:** `items-stretch` makes copy column taller than copy content needs. **Mitigation:** content is centered within (kicker/h2/body/cta vertical flow). Whitespace top/bottom is intentional / reads as breathing room.
- **Risk:** `reverse` prop variant still works. **Mitigation:** kept `md:[&>div:first-child]:order-2` selector verbatim.
