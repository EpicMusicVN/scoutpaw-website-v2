---
phase: 2
title: Wire into FullBleedHero
status: completed
priority: P1
effort: 3m
dependencies:
  - 1
---

# Phase 2: Wire into FullBleedHero

## Overview

Import ScrollSun into `components/home/full-bleed-hero.tsx` and render it as a sibling between the banner image div and the glass card div.

## Requirements

- Functional: Sun renders inside hero section on md+.
- Non-functional: full-bleed-hero remains a Server Component (no `"use client"` on it). Allowed because Server Components can import Client Components.

## Architecture

Current hero structure:
```tsx
<section className="relative isolate bg-paper">
  <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[100svh]">
    <Image ... />
  </div>

  <div className="glass card classes...">...</div>
</section>
```

Target — insert `<ScrollSun />` between the banner div and the glass card div. DOM stacking order ensures sun renders above banner image but below glass card without explicit z-index.

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`

## Implementation Steps

1. Add import at top of file (after existing imports):
   ```tsx
   import { ScrollSun } from "@/components/home/scroll-sun";
   ```

2. Inside `<section>`, after the closing `</div>` of the banner wrapper and before the glass card `<div>`, add:
   ```tsx
   <ScrollSun />
   ```

3. Save.

## Success Criteria

- [x] `ScrollSun` import added.
- [x] `<ScrollSun />` rendered between banner div and glass card div.
- [x] full-bleed-hero.tsx stays Server Component (no `"use client"` added).
- [x] No prop drilling — ScrollSun is self-contained.

## Risk Assessment

- **Risk:** Client Component imported in Server Component — supported by React Server Components pattern. Same pattern as other client components in the codebase (e.g. cinematic-hero is a client component imported elsewhere).
- **Risk:** Sun position may visually collide with banner peeker pups. Visual QA decision; shift `top-[14%]` if needed (one-line fix).
