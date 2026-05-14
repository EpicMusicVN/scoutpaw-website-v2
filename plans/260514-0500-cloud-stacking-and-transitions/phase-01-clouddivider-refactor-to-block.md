---
phase: 1
title: CloudDivider Refactor to Block
status: completed
priority: P2
effort: 10m
dependencies: []
---

# Phase 1: CloudDivider Refactor to Block

## Overview

Refactor `CloudDivider` from an `absolute`-positioned in-section element to a `block`-level between-section element. Drops the `position` prop in favor of a `flip` boolean. The SVG renders inline as a block, occupies its own height (h-12 / md:h-16), no parent positioning required.

## Requirements

- Functional:
  - Component renders as a block element (no longer absolute)
  - Takes the full width of its parent flow
  - `flip` prop mirrors the wave vertically (rotate-180)
- Non-functional:
  - Backwards-incompatible API: `position` prop removed
  - All current consumers (MenuCards, CharacterShowcase) updated in P2 + P3
  - typecheck + lint clean

## Related Code Files

- Modify: `components/ui/cloud-divider.tsx`

## Implementation Steps

1. Replace component body:
   ```tsx
   export function CloudDivider({
     flip = false,
     opacity = 0.75,
     className,
   }: {
     flip?: boolean;
     opacity?: number;
     className?: string;
   }) {
     return (
       <svg
         aria-hidden
         viewBox="0 0 1440 100"
         preserveAspectRatio="none"
         className={`block w-full h-12 md:h-16 ${flip ? "rotate-180" : ""} ${className ?? ""}`}
       >
         <path
           d="M0,55 C 60,15 130,80 210,45 S 360,5 450,40 S 600,85 700,45 S 870,5 970,45 S 1130,85 1220,45 S 1380,5 1440,40 L1440,100 L0,100 Z"
           fill="white"
           opacity={opacity}
         />
       </svg>
     );
   }
   ```
2. Note the API change:
   - Old: `position="top" | "bottom"` → controlled top/bottom absolute + rotate
   - New: `flip?: boolean` → simple vertical mirror
3. Run `pnpm typecheck`. Existing consumers (`position` prop) will fail type-check; P2 + P3 update them.

## Success Criteria

- [ ] `CloudDivider` renders as a block element with intrinsic height
- [ ] API is `{ flip?, opacity?, className? }`
- [ ] typecheck temporarily fails on existing consumers (resolved in P2/P3)

## Risk Assessment

- **Risk:** API change breaks builds if P2/P3 not completed atomically. **Mitigation:** plan executes phases sequentially; P2 + P3 immediately follow P1.
