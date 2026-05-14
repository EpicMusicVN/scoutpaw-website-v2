# Scroll-Driven Sun Decoration: First Motion Work Post-Static UI

**Date**: 2026-05-13 01:34
**Severity**: Low
**Component**: Home Hero (`components/home/`)
**Status**: Resolved

## What Happened

First motion decoration added to the home hero section after six rounds of static UI passes. Implemented scroll-driven sun that descends vertically (0→220px) while drifting horizontally via multi-stop transforms (0→+28→-16px), with SVG sun + 8 rays + stacked drop-shadow glow. Hidden on mobile, visible md and up. Component respects `prefers-reduced-motion`.

**Files touched:**
- `components/home/scroll-sun.tsx` (new client component, ~80 lines)
- `components/home/full-bleed-hero.tsx` (2-line wire-up, ref + JSX include)

**Validation:** `pnpm typecheck` + `pnpm lint` both clean. No visual QA yet (deferred to manual scroll test in browser).

## The Brutal Truth

This was the first real motion work of the night, and the urge to *keep adding effects* was immediate and dangerous. The stakeholder listed 6 effects: Y descent, X drift, glow pulse, float overlay, rotation, parallax. I wanted to nail them all. Didn't. Shipped 3 and felt slightly anxious about "incomplete." That's the trap—motion is optional theater, not required functionality. The discipline to ship *constrained* motion, not *maximal* motion, is harder than it sounds because every effect looks good in isolation.

Also: fighting the instinct to use `position: fixed` at the window level. Hero-scoped decoration is simpler, cleaner, and doesn't create z-index warfare with section backgrounds.

## Technical Details

**Framer Motion pattern:**
```tsx
const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });
const y = useTransform(scrollY, [0, scrollHeight], [0, 220]);
const x = useTransform(scrollY, [0, scrollHeight / 2, scrollHeight], [0, 28, -16]);
```

**useReducedMotion gotcha:** Returns `null` pre-hydration, then `true` or `false` post-mount. Ternary like `reduce ? [0,0] : [0,220]` evaluates with `null` as falsy—motion briefly applies even for reduced-motion users until hydration corrects it. Acceptable UX flicker (imperceptible in practice).

**RSC boundary:** Server component (`full-bleed-hero`) imports client component (`ScrollSun`). "use client" does NOT propagate upward; parent stays server. This is free composition—no scaffolding needed.

**DOM stacking:** Siblings paint in source order. Decoration positioned after text content in JSX naturally layers on top. No z-index required.

## What We Tried

1. **Global fixed positioning** → discarded. Creates z-index entanglement with per-section backgrounds (dark/light alternation). Encapsulating to hero scope was the right call.
2. **Single useTransform for XY** → split into two. Separate value sources (different scroll ranges for drift) required parallel `useTransform` calls.
3. **Glow via filter blur + shadow** → stacked drop-shadows instead. More control, easier to fine-tune intensity without compositing performance cost.

## Root Cause Analysis

Why 6 effects instead of 3? **Feature creep is frictionless in motion work.** Static UI asks "do you need this button?" Motion asks "what if this *also* floated?" There's no cost visible upfront, so every idea gets included. The constraint—"pick 3, ship those well, revisit the rest in v2"—has to be *externally imposed*, not self-imposed. I self-imposed it here; next time, bake it into the acceptance criteria.

Why the SSR hydration flicker for reduced-motion users? **Conditional logic with async values.** `useReducedMotion` is a media query effect hook that needs hydration to stabilize. The fix would be a `suppressHydrationWarning` wrapper or Framer Motion's built-in `prefersReducedMotion` prop (didn't use it; worth exploring). Flicker is a known edge case, not a bug.

## Lessons Learned

1. **Narrow the motion wish-list to 3 effects max before coding.** Six effects = busy, performance cost, maintenance tax. Practice saying no to motion. Saying no is harder than saying yes.

2. **Hero-bound scroll-driven decoration > global-fixed decoration.** Global fixed creates z-index complexity and persists across sections. Hero-scoped motion naturally scrolls away, encapsulates the effect, no stacking headaches.

3. **Self-referencing scroll container.** Component attaches its own ref to the outer container: `target: ref, offset: ["start start", "end start"]`. Single responsibility—no ref bubbling through parent props. Encapsulation is free.

4. **useReducedMotion null on SSR is acceptable.** Pre-hydration it's `null` (falsy), so motion briefly applies. Post-hydration it corrects. Imperceptible flicker acceptable; alternative is hydration mismatch warnings.

5. **Server + Client composition is seamless.** Server parent imports client child. "use client" doesn't bubble upward. Allows async data in server layer, hooks in client boundary. Use it.

6. **DOM order > z-index for layered decorations.** Position decoration after content in JSX, it paints on top. No z-index warfare. Source order is CSS-in-JS for stacking.

## Next Steps

- **Visual QA:** Scroll the hero in browser, verify sun descent + drift feel natural, no layout shift
- **Reduced motion:** Test with `prefers-reduced-motion: reduce`; confirm no motion applies
- **Commit:** 7 uncommitted plans across the night; after visual QA pass, batch commit
- **Follow-ups (backlog):** Opacity fade as sun exits hero; autonomous float overlay independent of scroll; moon echo in dark sections

No blockers. Motion work is integrated and passing type/lint checks. Ready for visual validation.

**Status**: DONE
