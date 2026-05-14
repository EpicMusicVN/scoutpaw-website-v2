# Brainstorm — Scroll Sun Fix (Global Fixed + Document Scroll)

**Date:** 2026-05-13
**Status:** Approved, ready for `/ck:plan`
**Scope:** Reverse the prior session's "hero-bound" decision. Sun becomes a global page-wide decoration: position fixed, document-scroll-linked, opacity fade near footer. Lives on home only.

---

## Problem Statement

The previous plan (260513-0134) implemented a **hero-bound** sun per user's explicit choice in that brainstorm. User now reports: "sun stays fixed/stuck on the Hero Banner instead of moving naturally while scrolling." The user wants the sun to remain visible and parallax-travel ACROSS sections, not just within hero.

This is a design reversal, not an implementation defect. The hero-bound architecture works as designed — sun scroll-links within hero's scroll range and scrolls out of view past it. What user wants is a global fixed-position sun that tracks document scroll.

## User-Locked Decisions

- **Mount location**: `app/page.tsx` (home only) — not global layout
- **Opacity behavior**: fade near footer — `[0, 0.85, 1] → [1, 1, 0.3]`
- **Y travel range**: 400 px over full document scroll
- **Position**: `fixed top-[14%] right-[12%]` (lg: `top-[16%] right-[16%]`), `z-[5]`
- **Mobile**: still hidden via `hidden md:block`

## Approaches Evaluated

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| **Global fixed + document scroll + opacity fade** | Matches user intent; visible across sections | Z-index management; renders over content | **Chosen** |
| Stick with hero-bound | No z-index issues | Sun disappears past hero — user-rejected | Rejected |
| Per-section parallax suns | Most variety | YAGNI; high maintenance | Rejected |

## Final Solution

### `components/home/scroll-sun.tsx` (rewrite)

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

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
// SunIcon unchanged
```

### Diff vs current

- Drop `useRef` import + ref variable
- `useScroll({ target: ref })` → `useScroll()` (document)
- Drop outer ref'd `<div>` wrapper — `motion.div` is now the only element
- `absolute inset-0` → `fixed top-[14%] right-[12%] z-[5]`
- Y range 220 → 400 px
- X range -16/+28 → -20/+40 (proportional)
- NEW: `opacity` transform → fades to 0.3 in last 15% of scroll

### Wiring

- **Remove** `import { ScrollSun }` + `<ScrollSun />` from `components/home/full-bleed-hero.tsx`
- **Add** `import { ScrollSun }` + `<ScrollSun />` to `app/page.tsx` (at top of fragment, before `<FullBleedHero>`)

### Z-index map

| Element | z | Above sun? |
|---|---|---|
| Section bgs | default (0) | No |
| Banner image | inside section | No |
| Hero glass card | inside `isolate` section | Yes (scoped stacking context) |
| **ScrollSun** | **z-[5]** | (anchor) |
| Navbar | z-30 | Yes |
| Mobile menu | z-50 | Yes |

## Implementation Considerations

**Order:**
1. Rewrite `scroll-sun.tsx`
2. Remove sun from `full-bleed-hero.tsx`
3. Add sun to `app/page.tsx`
4. `pnpm typecheck` + `pnpm lint`

**Risks:**
- Sun over MenuCards/Featured-Pup/Character-Showcase sections — visible but at top-right corner where content is unlikely to be. Visual QA.
- Hero glass card lives in `isolate` section context. Sun (fixed, z-[5], outside that context) renders behind the glass card when scrolled at hero — desired (card is foreground, sun is atmosphere).
- Short scroll = small parallax. Current home page is ~5 sections; should have plenty of distance.

## Files Touched

```
components/home/scroll-sun.tsx           (rewrite)
components/home/full-bleed-hero.tsx      (remove sun import + render)
app/page.tsx                             (add sun import + render)
```

## Out of Scope

- Sun on other pages (shop/watch/coming-soon) — not affected
- Sun rotation, continuous float — still excluded
- Mobile sun rendering — still hidden

## Success Criteria

- Sun stays in upper-right of viewport during scroll
- Sun translates Y/X smoothly as user scrolls the home page
- Sun fades to ~0.3 opacity near the footer
- No layout shift, no overflow issues
- `pnpm typecheck` + `pnpm lint` clean

## Next Steps

1. `/ck:plan` — phased implementation
2. Cook against plan
3. User visual QA — scroll the home page end-to-end to feel the parallax

## Unresolved Questions

- Sun over the navy footer at 0.3 opacity — should be subtle; if it still feels heavy, bump fade endpoint lower (e.g., 0.2).
- 400 px Y range — adjustable up/down based on visual feel.
- If sun position visually collides with content in any section (e.g., header "Step Into the Pack" h2 is centered, sun is right edge — likely fine), shift top-[14%] lower.
