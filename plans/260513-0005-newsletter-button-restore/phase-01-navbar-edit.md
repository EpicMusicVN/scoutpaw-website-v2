---
phase: 1
title: Navbar Edit
status: completed
priority: P1
effort: 5m
dependencies: []
---

# Phase 1: Navbar Edit

## Overview

Single-file change. Replace the current `<Link>` (Newsletter text+SVG from prior session) with a `<Button variant="dark" size="lg">` carrying the same envelope SVG. Verify `Button` import is still present (it is — Shop CTA uses it).

## Requirements

- Functional: Newsletter button anchors to `/#newsletter`. Mobile (<768px) unchanged.
- Non-functional: No new dependencies. SVG inline. SSR-safe (top-nav remains async server component).

## Architecture

**Current `components/nav/top-nav.tsx` (after prior session):**
- Newsletter is a `<Link>` with inline 16×16 envelope SVG + "Newsletter" text, styled `text-ink/75 hover:text-ink text-sm font-medium`
- Shop is `<Button href="/shop" size="lg" variant="primary">Shop</Button>`

**Target:**
- Newsletter becomes `<Button href="/#newsletter" variant="dark" size="lg" className="hidden md:inline-flex">` with 18×18 envelope SVG + "Newsletter" text
- Shop unchanged

**Inherited from Button base + variant=dark + size=lg:**
- Height 48px (min-h-[48px])
- Padding px-6 py-3
- Rounded-full
- Font: font-display semibold text-base
- Hover: `bg-navy/90` + shadow-cozy → shadow-cozy-md lift
- Active: `scale-[0.98]`
- Focus: `ring-2 ring-brand-primary ring-offset-2`
- Animation: `cta-shimmer` (same as Shop primary)
- Icon-text spacing: `gap-2` (no manual spacing needed)
- Icon vertical alignment: `inline-flex items-center justify-center` (no manual alignment)

## Related Code Files

- Modify: `components/nav/top-nav.tsx`

## Implementation Steps

1. Locate the current Newsletter `<Link>` block (added in plan 260512-2338, lines ~52-71 of top-nav.tsx).

2. Replace with:
   ```tsx
   <Button
     href="/#newsletter"
     variant="dark"
     size="lg"
     className="hidden md:inline-flex"
   >
     <svg
       width="18"
       height="18"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
       strokeLinejoin="round"
       aria-hidden="true"
     >
       <rect x="3" y="5" width="18" height="14" rx="2" />
       <path d="m3 7 9 6 9-6" />
     </svg>
     Newsletter
   </Button>
   ```

3. Verify imports unchanged:
   - `Button` still imported (used by Shop)
   - `Link` still imported (used by logo wrapper)

4. Save file.

## Success Criteria

- [x] Newsletter renders as a Button (rounded-full navy pill), not a text link.
- [x] Same height (48px), padding, radius, font-size as Shop button.
- [x] Envelope SVG visible at 18×18, white stroke, positioned left of "Newsletter" text.
- [x] Icon-text spacing visually balanced (gap-2 from Button base).
- [x] Hover shows `bg-navy/90` + shadow lift + shimmer (same hover behavior as Shop primary).
- [x] Mobile (<768px): button hidden via `md:inline-flex`; hamburger unchanged.
- [x] No layout overflow at 768px viewport.

## Risk Assessment

- **Risk:** Width tight at 768px exactly.
  - **Mitigation:** Visual QA. If overflow, reduce nav container `gap-4` to `gap-3` between right-side actions. One-line fix.
- **Risk:** Two `cta-shimmer` animations (Shop primary + Newsletter dark) feel busy.
  - **Mitigation:** Visual judgment after render. If too active, two options:
    - Add `[&]:bg-none` Tailwind override on Newsletter to disable shimmer pseudo-element
    - OR remove `cta-shimmer` from the `dark` variant in `components/ui/button.tsx` (affects all consumers — check usage first)
- **Risk:** "Newsletter" text reads too cold for the playful brand.
  - **Mitigation:** Easy expand to "Join Newsletter" (4 chars more). One-line fix.
