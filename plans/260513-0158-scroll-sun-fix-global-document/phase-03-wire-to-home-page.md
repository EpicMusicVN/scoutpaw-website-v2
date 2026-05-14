---
phase: 3
title: Wire to Home Page
status: completed
priority: P1
effort: 2m
dependencies:
  - 1
---

# Phase 3: Wire to Home Page

## Overview

Add ScrollSun import and render in `app/page.tsx`. Place at the top of the returned fragment so the decoration is declared up-front (position fixed makes JSX order irrelevant for rendering).

## Requirements

- Functional: ScrollSun renders on home page; doesn't appear on other routes.
- Non-functional: home page (Server Component) imports ScrollSun (Client Component) — standard RSC pattern.

## Architecture

Current `app/page.tsx`:
```tsx
export default async function HomePage() {
  return (
    <>
      <FullBleedHero ... />
      <ScrollReveal><MenuCards /></ScrollReveal>
      ...
    </>
  );
}
```

Target:
```tsx
import { ScrollSun } from "@/components/home/scroll-sun";
...
export default async function HomePage() {
  return (
    <>
      <ScrollSun />
      <FullBleedHero ... />
      <ScrollReveal><MenuCards /></ScrollReveal>
      ...
    </>
  );
}
```

## Related Code Files

- Modify: `app/page.tsx`

## Implementation Steps

1. Add import (with other component imports at top):
   ```tsx
   import { ScrollSun } from "@/components/home/scroll-sun";
   ```

2. Render `<ScrollSun />` as the first child of the returned fragment:
   ```tsx
   return (
     <>
       <ScrollSun />
       <FullBleedHero ... />
       ...
     </>
   );
   ```

3. Save.

## Success Criteria

- [x] `app/page.tsx` imports `ScrollSun`.
- [x] `<ScrollSun />` rendered at top of fragment.
- [x] HomePage stays async Server Component.
- [x] Other pages (Shop, Watch, etc.) unaffected.

## Risk Assessment

- **Risk:** ScrollSun position in JSX — `fixed` positioning means render order doesn't matter for visual placement. Top-of-fragment is purely for code readability.
