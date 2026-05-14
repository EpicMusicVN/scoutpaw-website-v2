---
phase: 6
title: Side Clouds Component
status: completed
priority: P2
effort: 45m
dependencies: []
---

# Phase 6: Side Clouds Component

## Overview

New `<SideClouds>` component renders fixed-position cloud SVGs along the left + right sides of the viewport. Visible only on widescreen (`xl:` ≥1280px) where cyan gutters appear. Provides a soft dreamy frame on widescreen displays.

## Requirements

- Functional:
  - Multiple cloud SVG blobs anchored to viewport left + right at varying heights
  - Fixed positioning (don't scroll with content)
  - Visible only on screens ≥1280px (`xl:block` / `hidden`)
- Non-functional:
  - Zero JS runtime
  - DOM cost minimal (~6 SVGs)
  - Pointer-events-none (don't block content)
  - aria-hidden

## Architecture

- New file: `components/ui/side-clouds.tsx`
- Renders 6 cloud blobs (3 left + 3 right) at hand-tuned positions
- Each cloud = small inline SVG with 4 overlapping ellipses (organic cloud shape)
- Container: `fixed inset-0 pointer-events-none hidden xl:block`
- Placement in `app/layout.tsx` (or a global wrapper) so it appears site-wide

## Related Code Files

- Create: `components/ui/side-clouds.tsx`
- Modify: `app/layout.tsx` (add `<SideClouds />` in the body wrapper)

## Implementation Steps

1. Create `components/ui/side-clouds.tsx`:
   ```tsx
   /**
    * Fixed-position decorative clouds along the viewport's left + right edges.
    * Visible only on widescreens (≥xl / 1280px) where the cyan page bg gutters
    * are wide enough to host atmospheric decoration without overlapping content.
    *
    * Pure decorative; aria-hidden; pointer-events-none.
    */
   export function SideClouds() {
     return (
       <div
         aria-hidden
         className="pointer-events-none fixed inset-0 z-0 hidden xl:block"
       >
         {/* Left side */}
         <CloudBlob className="left-4 top-[18%] h-24 w-32" opacity={0.55} />
         <CloudBlob className="left-2 top-[52%] h-20 w-28" opacity={0.45} />
         <CloudBlob className="left-6 top-[78%] h-16 w-24" opacity={0.4} />
         {/* Right side */}
         <CloudBlob className="right-4 top-[30%] h-24 w-32" opacity={0.5} />
         <CloudBlob className="right-2 top-[60%] h-20 w-28" opacity={0.45} />
         <CloudBlob className="right-6 top-[84%] h-16 w-24" opacity={0.4} />
       </div>
     );
   }

   function CloudBlob({ className, opacity = 0.5 }: { className: string; opacity?: number }) {
     return (
       <svg
         viewBox="0 0 120 60"
         aria-hidden
         className={`absolute ${className}`}
         style={{ opacity }}
       >
         <ellipse cx="30" cy="40" rx="22" ry="14" fill="white" />
         <ellipse cx="55" cy="32" rx="26" ry="18" fill="white" />
         <ellipse cx="82" cy="38" rx="20" ry="13" fill="white" />
         <ellipse cx="100" cy="42" rx="14" ry="10" fill="white" />
       </svg>
     );
   }
   ```
2. In `app/layout.tsx`, import and render `<SideClouds />` inside the body (before `<TopNav />`).
3. Run `pnpm typecheck` + `pnpm lint` + `pnpm build`.
4. Visual smoke at ≥1280px (clouds visible) and <1280px (clouds hidden).

## Success Criteria

- [ ] `<SideClouds>` renders 6 cloud blobs on widescreen (≥1280px)
- [ ] Clouds invisible below 1280px (`hidden xl:block`)
- [ ] Pointer events disabled (clicks pass through)
- [ ] z-0 layer doesn't interfere with navbar (z-30) or content
- [ ] typecheck + lint + build clean

## Risk Assessment

- **Risk:** Fixed positioning conflicts with modal/drawer z-index. **Mitigation:** clouds at z-0 + pointer-events-none — no interaction or stacking conflict.
- **Risk:** Clouds visible behind page bg (under navbar/footer). **Mitigation:** intentional — they frame the page from the sides. Navbar (z-30) + footer (no fixed) sit above clouds visually.
- **Risk:** Cloud positions clash with content edges on 1280-1500px viewports. **Mitigation:** clouds use `left-2/left-4/left-6` (8-24px from edge); content container at 1400px max width means content edge sits at 8% of 1500px viewport ≈ 120px from edge. No overlap.
- **Risk:** Clouds add render cost on every page. **Mitigation:** 6 small SVGs, no JS. Negligible.
