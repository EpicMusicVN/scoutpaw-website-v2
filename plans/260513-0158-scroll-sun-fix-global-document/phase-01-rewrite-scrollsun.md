---
phase: 1
title: Rewrite ScrollSun
status: completed
priority: P1
effort: 10m
dependencies: []
---

# Phase 1: Rewrite ScrollSun

## Overview

Rewrite `components/home/scroll-sun.tsx` from hero-bound (absolute, ref'd useScroll target) to global fixed (no ref, document useScroll, opacity fade).

## Requirements

- Functional: Sun stays at upper-right of viewport across all scroll positions; translates Y/X smoothly; fades near document end.
- Non-functional: Single fixed element; GPU-accelerated transforms; respects prefers-reduced-motion; SSR-safe.

## Architecture

**Current (hero-bound):**
- `useRef` + `useScroll({ target: ref, offset: [...] })` measuring hero scroll range
- Outer `<div ref={ref} absolute inset-0 ...>` wrapping motion.div
- motion.div has `absolute right-[12%] top-[14%]`
- Y range 0→220, X range 0→+28→-16
- No opacity

**Target (global fixed):**
- No useRef
- `useScroll()` with no args — tracks full document scroll
- Single `motion.div` (no outer wrapper)
- motion.div has `fixed right-[12%] top-[14%] z-[5]`
- Y range 0→400, X range 0→+40→-20
- Opacity `[0, 0.85, 1] → [1, 1, 0.3]`

## Related Code Files

- Modify: `components/home/scroll-sun.tsx`

## Implementation Steps

1. Replace file contents with:
   ```tsx
   "use client";

   import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

   /**
    * Decorative sun anchored upper-right of viewport. Parallax-travels downward as
    * the user scrolls the home page. `position: fixed` keeps the sun visible
    * across all sections; useScroll() tracks document scroll progress; opacity
    * fades near the footer to avoid clashing with the navy bg.
    * Hidden below md (mobile saves the perf budget). Respects prefers-reduced-motion.
    */
   export function ScrollSun() {
     const reduce = useReducedMotion();
     const { scrollYProgress } = useScroll();

     const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 400]);
     const x = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [0, 0, 0] : [0, 40, -20]);
     const opacity = useTransform(scrollYProgress, [0, 0.85, 1], reduce ? [1, 1, 1] : [1, 1, 0.3]);

     return (
       <motion.div
         aria-hidden="true"
         className="pointer-events-none fixed right-[12%] top-[14%] z-[5] hidden md:block lg:right-[16%] lg:top-[16%]"
         style={{ x, y, opacity }}
       >
         <SunIcon className="h-20 w-20 text-brand-honey [filter:drop-shadow(0_0_24px_rgba(255,201,102,0.55))_drop-shadow(0_8px_16px_rgba(184,134,46,0.28))] lg:h-24 lg:w-24" />
       </motion.div>
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

2. Verify imports: drop `useRef` from react import (not needed anymore).

## Success Criteria

- [x] File rewritten — `"use client";` at top.
- [x] No `useRef` import or usage.
- [x] `useScroll()` called with no args.
- [x] motion.div has class `fixed right-[12%] top-[14%] z-[5] hidden md:block lg:right-[16%] lg:top-[16%]`.
- [x] Y range 0→400; X range [0,0.5,1] → [0,40,-20]; opacity range [0, 0.85, 1] → [1, 1, 0.3].
- [x] Reduced-motion users see static sun (Y/X = 0, opacity = 1).
- [x] SunIcon SVG unchanged.

## Risk Assessment

- **Risk:** `useScroll()` without target — needs document scroll context. Page must scroll for the hook to fire. On home page with 5+ sections, scroll context is guaranteed.
- **Risk:** Sun renders over content in sections beneath. Top-right corner placement minimizes overlap risk. Opacity at full until 85% of scroll keeps presence noticeable.
- **Risk:** z-[5] arbitrary Tailwind value — JIT-supported.
