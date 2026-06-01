---
phase: 2
title: Page Wire and Motion Choreography
status: completed
priority: P1
effort: 1.5h
dependencies:
  - 1
---

# Phase 2: Page Wire and Motion Choreography

## Overview

Wire the rebuilt `CharacterSection` (now a scene) into `app/characters/page.tsx`. Remove all `CloudDivider` instances + `space-y-*` wrapper from Plan B/C. Add framer-motion scroll-driven transforms for the layered-paper effect (previous scene scales down + fades slightly as next enters).

## Requirements

**Functional:**
- 5 character scenes rendered consecutively in a scene-stack container
- Each scene passes `index` and `total` props to `CharacterSection`
- No `CloudDivider` on `/characters` page
- No `space-y-*` wrapper from Plan B
- Newsletter card follows the scene stack (regular flow, not sticky)
- Hero (`FullBleedHero`) stays at top, unchanged
- Scroll choreography (desktop only):
  - Active scene: scale 1, opacity 1
  - Outgoing scene (previous): `scale → 0.96`, `opacity → 0.85` (subtle, not dramatic)
  - Incoming scene (next): natural entry via sticky behavior (no explicit motion needed)
- `prefers-reduced-motion`: skip transforms; keep sticky

**Non-functional:**
- 60fps scroll on a modern laptop (no perceptible jank)
- No parent `overflow-hidden` on scene container (would break sticky)
- Page total scroll height ≈ 5 × 100vh + hero + newsletter ≈ 600–650vh
- LCP unchanged or better (first character still `priority`)

## Architecture

**Scroll choreography approach: per-scene `useScroll` + `useTransform` inside the rebuilt component (NOT in the page).**

Move motion logic into a wrapper inside `CharacterSection` rather than the page, so the page stays simple. Or use a thin `motion.div` wrapper exposed via the section.

Pragmatic choice for this plan: put the transform logic INSIDE `character-section.tsx` since each scene needs its own `useScroll` ref. Phase 1 sets up structure; Phase 2 adds the `"use client"` directive (required for `useScroll`) and per-scene motion.

```tsx
"use client";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";

// inside CharacterSection
const ref = useRef<HTMLElement | null>(null);
const reduce = useReducedMotion();
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start start", "end start"],
});
const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.96]);
const opacity = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.85]);

return (
  <section ref={ref} ...>
    <motion.div style={{ scale, opacity }} className="... md:sticky md:top-0 ...">
      ...
    </motion.div>
  </section>
);
```

The `motion.div` is the INNER sticky scene; the outer `section` is the un-transformed scroll anchor. Transform on inner wouldn't break sticky on itself (transforms on the sticky element are fine; what breaks sticky is a transform on a PARENT).

**Page structure (`app/characters/page.tsx`):**

```tsx
<>
  <FullBleedHero ... />

  <div className="relative">
    {ordered.map((character, i) => (
      <CharacterSection
        key={character.slug}
        character={character}
        theme={getCharacterTheme(character.slug)}
        flip={i % 2 === 1}
        priority={i === 0}
        index={i}
        total={ordered.length}
      />
    ))}
  </div>

  <NewsletterCTA tag="characters-newsletter" />
</>
```

- Remove `Fragment` import (not needed)
- Remove `CloudDivider` import (not used on this page)
- Remove `DIVIDER_VARIANTS` const (only used by Plan C wiring, gone)
- Remove `space-y-*` wrapper (replaced by relative container — no padding needed)
- The `relative` on the scene stack container is critical: provides a positioning context for the sticky inner divs

## Related Code Files

- **Modify:** `components/characters/character-section.tsx` — add `"use client"`, `useScroll`/`useTransform`/`useReducedMotion`/`useRef` imports, motion logic
- **Modify:** `app/characters/page.tsx` — remove divider imports/usage, restructure
- **Read only:** `components/motion/scroll-reveal.tsx` — check if ScrollReveal should be removed (it animates entry which fights sticky); likely yes

## Implementation Steps

1. **Open** `components/characters/character-section.tsx` (from Phase 1).
2. **Add `"use client"` at top** (required for framer-motion hooks).
3. **Add imports**: `motion, useScroll, useTransform, useReducedMotion` from `"framer-motion"`; `useRef` from `"react"`.
4. **Add hooks inside component**:
   ```tsx
   const ref = useRef<HTMLElement | null>(null);
   const reduce = useReducedMotion();
   const { scrollYProgress } = useScroll({
     target: ref,
     offset: ["start start", "end start"],
   });
   const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.96]);
   const opacity = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.85]);
   ```
5. **Wire ref** on outer `<section>` and change inner `<div>` to `<motion.div style={{ scale, opacity }}>`.
6. **Open** `app/characters/page.tsx`.
7. **Remove imports**: `Fragment` from react, `CloudDivider` from ui.
8. **Remove `DIVIDER_VARIANTS`** const.
9. **Restructure the map**:
   ```diff
   - <div className="py-8 md:py-12">
   -   {ordered.map((character, i) => (
   -     <Fragment key={character.slug}>
   -       {i > 0 && <CloudDivider variant={DIVIDER_VARIANTS[i % DIVIDER_VARIANTS.length]} />}
   -       <ScrollReveal>
   -         <CharacterSection ... />
   -       </ScrollReveal>
   -     </Fragment>
   -   ))}
   - </div>
   - <CloudDivider variant={DIVIDER_VARIANTS[ordered.length % DIVIDER_VARIANTS.length]} />
   + <div className="relative">
   +   {ordered.map((character, i) => (
   +     <CharacterSection
   +       key={character.slug}
   +       character={character}
   +       theme={getCharacterTheme(character.slug)}
   +       flip={i % 2 === 1}
   +       priority={i === 0}
   +       index={i}
   +       total={ordered.length}
   +     />
   +   ))}
   + </div>
   ```
10. **Remove `ScrollReveal` wrapper** around CharacterSection (it fights sticky). Keep it around `NewsletterCTA` if desired.
11. **Remove unused `ScrollReveal` import** if no longer used in this file.
12. **Typecheck + lint** — must pass.
13. **Dev server live check**:
    - Scroll through `/characters` on desktop
    - Confirm scenes pin and stack like papers
    - Confirm previous scene subtly scales/fades on next entry
    - Confirm no horizontal scrollbars, no jank
    - Confirm `/characters/[slug]` detail pages unaffected

## Success Criteria

- [ ] `CharacterSection` is a `"use client"` component with framer-motion scroll hooks
- [ ] Outer section has ref + h-screen; inner is motion.div with sticky + transforms
- [ ] Page renders 5 scenes back-to-back; first card priority
- [ ] No `CloudDivider` on /characters
- [ ] No `Fragment` import or DIVIDER_VARIANTS const left in `app/characters/page.tsx`
- [ ] Scroll choreography readable on desktop (~60fps)
- [ ] `prefers-reduced-motion` skips transforms (verify in DevTools)
- [ ] `/top-picks`, `/shop`, watch pages still render CloudDivider correctly (regression check)
- [ ] Typecheck + lint clean

## Risk Assessment

- **Risk:** `"use client"` on `CharacterSection` breaks the parent server component pattern. *Mitigation:* `app/characters/page.tsx` is already async (server component) — it can render a client component as a child cleanly.
- **Risk:** `useScroll` ref on outer `<section>` doesn't track correctly because the inner sticky div doesn't move with the section. *Mitigation:* `useScroll({ target: ref, offset: ["start start", "end start"] })` tracks the section's own scroll progress as it leaves the viewport — that's exactly what we want.
- **Risk:** Transform on the motion.div breaks its own sticky behavior. *Mitigation:* CSS spec — transform on the sticky element itself is OK; only transforms on ANCESTORS of a sticky element break sticky. Verify in browser.
- **Risk:** `ScrollReveal` removal loses entry animation polish. *Mitigation:* scene's own scroll choreography replaces it; if missed, can reintroduce on hero/newsletter only.

## Security Considerations

None.
