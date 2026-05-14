---
phase: 1
title: CloudDivider Cluster Redesign
status: completed
priority: P3
effort: 5m
dependencies: []
---

# Phase 1: CloudDivider Cluster Redesign

## Overview

Replace the prior wave-SVG inside CloudDivider with a 3-mini-cloud horizontal cluster centered inside `max-w-md`. Removes the `flip` prop (cluster is symmetric).

## Related Code Files

- Modify: `components/ui/cloud-divider.tsx`

## Implementation Steps

1. Replace the file contents with:
   ```tsx
   /**
    * Decorative cloud-cluster divider for between-section placement.
    * 3 mini cloud SVGs in a horizontal row, centered in a max-w-md container.
    * Block-level, pure decorative, aria-hidden.
    */
   export function CloudDivider({
     opacity = 0.7,
     className,
   }: {
     opacity?: number;
     className?: string;
   }) {
     return (
       <div
         aria-hidden
         className={`mx-auto flex max-w-md items-center justify-center gap-3 py-6 md:gap-4 md:py-8 ${className ?? ""}`}
       >
         <MiniCloud className="h-7 w-14 md:h-8 md:w-16" opacity={opacity * 0.6} />
         <MiniCloud className="h-10 w-20 md:h-12 md:w-24" opacity={opacity} />
         <MiniCloud className="h-7 w-14 md:h-8 md:w-16" opacity={opacity * 0.6} />
       </div>
     );
   }

   function MiniCloud({ className, opacity }: { className: string; opacity: number }) {
     return (
       <svg
         viewBox="0 0 80 50"
         aria-hidden
         className={className}
         style={{ opacity }}
       >
         <ellipse cx="20" cy="30" rx="16" ry="11" fill="white" />
         <ellipse cx="45" cy="22" rx="22" ry="16" fill="white" />
         <ellipse cx="65" cy="30" rx="14" ry="10" fill="white" />
       </svg>
     );
   }
   ```
2. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] CloudDivider renders 3 mini clouds in a centered max-w-md row
- [ ] No more wave-SVG path
- [ ] `flip` prop removed (cluster is symmetric)
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Container at `max-w-md` (448px) inside a wider parent may feel small. **Mitigation:** acceptable per user brief ("contained, not edge-to-edge"). Tunable later.
