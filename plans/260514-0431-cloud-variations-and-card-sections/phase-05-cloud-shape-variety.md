---
phase: 5
title: Cloud Shape Variety
status: completed
priority: P2
effort: 45m
dependencies: []
---

# Phase 5: Cloud Shape Variety

## Overview

Replace the single `<CloudBlob>` with 4 distinct cloud variants: `LongCloud`, `FluffyCloud`, `StretchedCloud`, `MiniCloud`. Mix them across the left + right flanks to eliminate visual repetition.

## Requirements

- Functional: 4 distinct cloud SVG shapes
- 8 total cloud renders (4 per side), mix of shapes/sizes/opacities
- Same visibility constraint: `hidden xl:block` (≥1280px only)
- All pointer-events-none, aria-hidden

## Architecture

`components/ui/side-clouds.tsx`. Four small SVG components (each ~5-15 ellipses). `<SideClouds>` orchestrates placements. Optional: extract shapes to local helpers — DRY isn't critical here since shapes ARE the differentiation.

## Related Code Files

- Modify: `components/ui/side-clouds.tsx`

## Implementation Steps

1. Replace existing `CloudBlob` with 4 shape components:
   ```tsx
   function LongCloud({ className, opacity }: ...) {
     return (
       <svg viewBox="0 0 180 50" className={`absolute ${className}`} style={{ opacity }} aria-hidden>
         <ellipse cx="30" cy="35" rx="22" ry="12" fill="white" />
         <ellipse cx="65" cy="28" rx="30" ry="18" fill="white" />
         <ellipse cx="105" cy="30" rx="28" ry="15" fill="white" />
         <ellipse cx="145" cy="34" rx="22" ry="13" fill="white" />
         <ellipse cx="170" cy="38" rx="10" ry="8" fill="white" />
       </svg>
     );
   }

   function FluffyCloud({ className, opacity }: ...) {
     return (
       <svg viewBox="0 0 120 80" className={`absolute ${className}`} style={{ opacity }} aria-hidden>
         <ellipse cx="30" cy="55" rx="26" ry="18" fill="white" />
         <ellipse cx="58" cy="40" rx="32" ry="24" fill="white" />
         <ellipse cx="90" cy="50" rx="24" ry="18" fill="white" />
       </svg>
     );
   }

   function StretchedCloud({ className, opacity }: ...) {
     return (
       <svg viewBox="0 0 220 40" className={`absolute ${className}`} style={{ opacity }} aria-hidden>
         <ellipse cx="40" cy="25" rx="32" ry="10" fill="white" />
         <ellipse cx="100" cy="20" rx="40" ry="12" fill="white" />
         <ellipse cx="170" cy="24" rx="35" ry="11" fill="white" />
         <ellipse cx="210" cy="28" rx="12" ry="6" fill="white" />
       </svg>
     );
   }

   function MiniCloud({ className, opacity }: ...) {
     return (
       <svg viewBox="0 0 80 50" className={`absolute ${className}`} style={{ opacity }} aria-hidden>
         <ellipse cx="20" cy="30" rx="16" ry="11" fill="white" />
         <ellipse cx="45" cy="22" rx="22" ry="16" fill="white" />
         <ellipse cx="65" cy="30" rx="14" ry="10" fill="white" />
       </svg>
     );
   }
   ```
2. Update `<SideClouds>` to use a mix of all 4 across both sides:
   ```tsx
   export function SideClouds() {
     return (
       <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden xl:block">
         {/* Left flank */}
         <LongCloud className="left-0 top-[12%] h-16 w-44" opacity={0.5} />
         <FluffyCloud className="left-4 top-[42%] h-24 w-32" opacity={0.6} />
         <MiniCloud className="left-6 top-[68%] h-14 w-24" opacity={0.45} />
         <StretchedCloud className="left-0 top-[88%] h-12 w-52" opacity={0.4} />
         {/* Right flank */}
         <FluffyCloud className="right-2 top-[22%] h-20 w-28" opacity={0.55} />
         <StretchedCloud className="right-0 top-[50%] h-12 w-48" opacity={0.45} />
         <MiniCloud className="right-6 top-[74%] h-14 w-24" opacity={0.5} />
         <LongCloud className="right-0 top-[92%] h-14 w-40" opacity={0.4} />
       </div>
     );
   }
   ```
3. Run `pnpm typecheck` + `pnpm lint`.
4. Visual smoke at 1440px / 1920px: confirm distinct shapes visible.

## Success Criteria

- [ ] 4 distinct cloud SVG shapes defined
- [ ] Both flanks use a mix of all 4 shapes
- [ ] Total 8 clouds (4 left + 4 right)
- [ ] Visible only at ≥1280px (`hidden xl:block`)
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** SVG path complexity adds DOM cost. **Mitigation:** ~25 SVG elements total across 8 instances; negligible.
- **Risk:** Cloud shapes don't visually read as "clouds". **Mitigation:** all use multi-ellipse "bumpy" silhouettes — standard cartoon cloud convention.
- **Risk:** Mix of shapes feels inconsistent. **Mitigation:** all share white fill + same opacity range — unified palette.
