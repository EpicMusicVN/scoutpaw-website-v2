---
phase: 1
title: Create ScrollSun Component
status: completed
priority: P1
effort: 15m
dependencies: []
---

# Phase 1: Create ScrollSun Component

## Overview

Create new client component at `components/home/scroll-sun.tsx`. Uses Framer Motion (already a dep). Renders absolutely-positioned SVG sun that scroll-links Y descent + horizontal drift via useScroll + useTransform.

## Requirements

- Functional: Sun renders at upper-right; transforms as user scrolls hero. Hidden on mobile.
- Non-functional: GPU-accelerated transforms; respects `prefers-reduced-motion`; no new deps; SSR-safe (first paint with default transform values, motion applies post-hydration).

## Architecture

**Client component** (must use `"use client"` directive — uses hooks: `useScroll`, `useTransform`, `useReducedMotion`, `useRef`).

**Self-contained ref:** component owns its own ref attached to a container `<div>`. `useScroll({ target: ref, offset: ["start start", "end start"] })` measures container's scroll progress relative to viewport.

**SVG sun:**
- viewBox 0 0 100 100
- 8 ray lines (4 cardinal + 4 diagonal) via stroke `currentColor`, strokeWidth 3, strokeLinecap round
- Main circle: r=22 at center, filled `currentColor`
- Container color: `text-brand-honey` (#ffc966)

**Glow:** stacked drop-shadow filters via Tailwind arbitrary class:
```
[filter:drop-shadow(0_0_24px_rgba(255,201,102,0.55))_drop-shadow(0_8px_16px_rgba(184,134,46,0.28))]
```

## Related Code Files

- Create: `components/home/scroll-sun.tsx`

## Implementation Steps

1. Create new file at `components/home/scroll-sun.tsx` with full content:

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Decorative sun pinned to the upper-right of the hero. Scroll-linked vertical
 * descent + subtle horizontal sway via Framer Motion's useScroll/useTransform.
 * Hidden below md (mobile saves the perf budget). Respects prefers-reduced-motion.
 */
export function ScrollSun() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 220]);
  const x = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [0, 0, 0] : [0, 28, -16]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden md:block"
    >
      <motion.div
        className="absolute right-[12%] top-[14%] lg:right-[16%] lg:top-[16%]"
        style={{ y, x }}
      >
        <SunIcon className="h-20 w-20 text-brand-honey [filter:drop-shadow(0_0_24px_rgba(255,201,102,0.55))_drop-shadow(0_8px_16px_rgba(184,134,46,0.28))] lg:h-24 lg:w-24" />
      </motion.div>
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="50" y1="6" x2="50" y2="18" />
        <line x1="50" y1="82" x2="50" y2="94" />
        <line x1="6" y1="50" x2="18" y2="50" />
        <line x1="82" y1="50" x2="94" y2="50" />
        <line x1="19" y1="19" x2="28" y2="28" />
        <line x1="72" y1="28" x2="81" y2="19" />
        <line x1="19" y1="81" x2="28" y2="72" />
        <line x1="72" y1="72" x2="81" y2="81" />
      </g>
      <circle cx="50" cy="50" r="22" />
    </svg>
  );
}
```

2. Save. No further setup needed.

## Success Criteria

- [x] File created at `components/home/scroll-sun.tsx`.
- [x] First line is `"use client";`.
- [x] Exports `ScrollSun` component.
- [x] Imports `motion, useReducedMotion, useScroll, useTransform` from `framer-motion` and `useRef` from `react`.
- [x] Container has `hidden md:block` (mobile-hidden).
- [x] Sun SVG inline as private `SunIcon` function in same file.

## Risk Assessment

- **Risk:** Arbitrary `[filter:...]` Tailwind class with multiple drop-shadow funcs — JIT-supported in v3.4. Used elsewhere in codebase (navbar logo, footer wordmark). Verified pattern.
- **Risk:** `useReducedMotion` returns null pre-hydration. `reduce ? ... : ...` evaluates with null = falsy → motion values apply. Post-hydration, true updates correctly. Acceptable brief flicker for reduced-motion users.
- **Risk:** `text-brand-honey` Tailwind utility — verify it maps to `--brand-honey` (#ffc966). Confirmed in globals.css.
