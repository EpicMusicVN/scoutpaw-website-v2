# Brainstorm — Scroll Sun (Hero-Bound, Geometric + Glow)

**Date:** 2026-05-13
**Status:** Approved, ready for `/ck:plan`
**Scope:** Add a decorative sun to the hero that scroll-links downward + drifts horizontally as user scrolls. Hero-bound (lives inside hero section, scrolls away with it). Hidden on mobile.

---

## Problem Statement

User wants a playful scroll-driven motion accent to make the home page feel "magical, calming, cinematic, and playful". The wish-list was broad (vertical + horizontal + glow + float + rotation + parallax); narrowed to 3 effects to avoid visual noise.

## Concerns Surfaced + Resolved

1. **Doing all 5 motion effects = busy.** Narrowed to 3: vertical scroll-link + horizontal drift + soft glow. No rotation, no continuous float, no parallax differential.
2. **"Stay partially visible between sections" vs "subtle, not distracting" conflict.** Global fixed-position sun risks becoming annoying over 5-section scroll. User chose hero-bound — accepts that sun scrolls away with hero.
3. **No new dep.** Framer Motion already in codebase (used in `atmosphere-layer.tsx`, `cinematic-hero.tsx`, etc.). Skip GSAP entirely.
4. **Mobile perf cost.** User chose hide-on-mobile (`hidden md:block`) — simplest perf win, matches "simplify if needed".
5. **6 prior plans tonight on same surface.** Motion layer ON TOP of in-flight visual changes can mask bugs. Surfaced; user accepts.

## User-Locked Decisions

- **Scope:** Hero-bound — sun lives inside hero `<section>`, scroll-link to hero's scroll range
- **Sun design:** Simple geometric — warm filled circle + 8 ray lines, no face
- **Motion set:** Vertical scroll-link (0→220px) + horizontal drift (0→+28→-16 multi-stop) + static soft glow (stacked drop-shadow). No rotation, no float
- **Mobile:** Hidden via `hidden md:block`

## Approaches Evaluated

### Scope

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **Hero-bound** | Simple; no z-index gymnastics; scrolls away naturally | Sun disappears past hero | **Chosen** |
| Global fixed | Always visible | Z-index hell w/ section bgs; annoying-risk | Rejected |
| Section-bound (per-section motion) | Most variety | YAGNI; high maintenance | Rejected |

### Sun design

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **Geometric (circle + rays)** | Cinematic; matches restrained aesthetic | Less playful than face | **Chosen** |
| Cartoon happy face | Most playful | Competes w/ mascots | Rejected |
| Abstract glow orb | Subtlest | Reads as "stray light" not "sun" | Rejected |

### Motion set

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **Vertical + drift + glow** | Clean cinematic; 3 effects max | None | **Chosen** |
| Vertical + float + glow | Adds "alive" feel | Motions fight perceptually | Rejected |
| Vertical + rotation + glow | Stylized | Rotating circle reads weird | Rejected |

## Final Solution

### New file `components/home/scroll-sun.tsx` (~50 lines, client component)

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
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

### Hero integration `components/home/full-bleed-hero.tsx`

Add import and place `<ScrollSun />` as the second child of the section (after banner div, before glass card). Server component status of full-bleed-hero is preserved (RSC allows client child imports).

```tsx
import { ScrollSun } from "@/components/home/scroll-sun";

// Inside <section>:
<div className="banner wrapper ...">...</div>
<ScrollSun />
<div className="glass card ...">...</div>
```

DOM stacking order (no explicit z-index): banner image → sun → glass card. Sun renders above banner image, below glass card.

## Implementation Considerations

**Order:**
1. Create `scroll-sun.tsx`
2. Wire into `full-bleed-hero.tsx`
3. `pnpm typecheck` + `pnpm lint`

**Risks:**
- Sun position upper-right may collide with banner's upside-down peekers. Mitigation: visual QA; shift `top-[14%]` to `top-[8%]` if too close.
- `useReducedMotion` returns null initially → momentary motion before correcting on reduced-motion preference. Acceptable.
- `useScroll` target ref is inside hidden-on-mobile container — hook is fine to run, just no visible output below md.

## Files Touched

```
components/home/scroll-sun.tsx       (NEW, ~50 lines client component)
components/home/full-bleed-hero.tsx  (1 import + 1 JSX line)
```

## Out of Scope

- Other sections / motion decorations (YAGNI)
- Banner asset, navbar, footer, mobile menu
- atmosphere-layer (separate concern)

## Success Criteria

- Sun renders at upper-right of hero on md+
- Scrolls down ~220px + drifts horizontally as user scrolls hero
- Smooth performance (no jank); GPU-accelerated transforms
- Hidden on mobile
- `pnpm typecheck` + `pnpm lint` clean
- Reduced-motion users see static sun (no transforms)

## Next Steps

1. `/ck:plan` — phased plan (likely 2 phases: create component + wire + validate)
2. Cook against plan
3. User visual QA — scroll the hero on dev server to feel the motion

## Unresolved Questions

- Sun starting position visible at scroll=0 may be subtle "what's that?" moment. Could fade in over first 50px scroll if desired (extra useTransform for opacity).
- If sun visually clashes with peekers at md width, shift `top-[14%]` lower or right percentage further. Visual QA decision.
- Future: could echo the sun in footer with a "setting sun" reversal — beyond current scope.
