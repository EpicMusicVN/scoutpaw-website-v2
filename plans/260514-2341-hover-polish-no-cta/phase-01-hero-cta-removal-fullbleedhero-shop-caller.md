---
phase: 1
title: Hero CTA removal (FullBleedHero + Shop caller)
status: completed
priority: P2
effort: 15m
dependencies: []
---

# Phase 1: Hero CTA removal (FullBleedHero + Shop caller)

## Overview

Remove the CTA button row from `FullBleedHero` entirely. Strip the `actions` prop, its default `<Button>` block, and the wrapping `<div>`. Drop the `Button` import. Drop the `actions={...}` prop from `app/shop/page.tsx` and its `Button` import too. Result: hero cards on Home + Shop display only kicker + title + description.

## Requirements

**Functional**
- Hero shows kicker + title + description, no buttons.
- Both Home and Shop pages affected via the shared component.
- No dead code / orphan imports left behind.

**Non-functional**
- No new components, no new tokens.
- Mobile path benefits automatically (CardBody is shared between mobile in-flow card and desktop overlay card).
- Glass card padding/typography unchanged — natural visual rebalance via removed bottom block.

## Architecture

`FullBleedHero` is consumed by `app/page.tsx` (no `actions` passed → uses defaults) and `app/shop/page.tsx` (passes a single `Explore Collections` button). Removing the prop + defaults is safe — no other consumers.

**Changes (`components/home/full-bleed-hero.tsx`):**

1. Remove `actions?: React.ReactNode` from the props interface.
2. Remove `actions,` from destructured args.
3. In `CardBody`, delete:
   ```jsx
   <div className="mt-6 flex flex-wrap gap-3">
     {actions ?? (
       <>
         <Button href="/watch" size="lg" variant="dark">Watch Now</Button>
         <Button href="#meet-the-pack" size="lg" variant="outline">Meet the Pack</Button>
       </>
     )}
   </div>
   ```
4. Remove `import { Button } from "@/components/ui/button";` (no other usages remain in this file).

**Changes (`app/shop/page.tsx`):**

1. Remove the `actions={<Button href="#explore" size="lg" variant="dark">Explore Collections</Button>}` prop on `<FullBleedHero>`.
2. Remove `import { Button } from "@/components/ui/button";` if no other usages remain in this file (grep first).

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`
- Modify: `app/shop/page.tsx`

## Implementation Steps

1. In `components/home/full-bleed-hero.tsx`:
   - Remove `actions?: React.ReactNode;` from props.
   - Remove `actions,` from destructured args at function signature.
   - Delete the `<div className="mt-6 flex flex-wrap gap-3">...</div>` block inside `CardBody`.
   - Remove the `Button` import.
2. In `app/shop/page.tsx`:
   - Remove the `actions={...}` prop on `<FullBleedHero>`.
   - Grep the file for other `<Button` usages. If none, remove the `Button` import.
3. Run `pnpm typecheck` to confirm no broken refs. Halt on errors.
4. Run `pnpm lint`. Halt on new errors.
5. Boot dev server, verify `/` and `/shop` show only kicker + title + description in the hero card.

## Success Criteria

- [ ] `FullBleedHero` props no longer include `actions`
- [ ] CardBody contains only kicker + h1 + description paragraph
- [ ] `Button` import removed from `full-bleed-hero.tsx`
- [ ] `app/shop/page.tsx` no longer passes `actions`
- [ ] `Button` import removed from `app/shop/page.tsx` if unused
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] Home + Shop hero render without buttons at all viewports

## Risk Assessment

- **Hero feels too sparse without CTAs** — user accepts this per design direction. If revisited, easy to re-add prop.
- **Other consumers of `FullBleedHero` I missed** — grep confirmed only `app/page.tsx` + `app/shop/page.tsx` use it. Safe.
- **Empty bottom padding on glass card** — the `py-5 lg:py-6` already provides balanced top/bottom space; description paragraph's natural bottom margin sufficient. No tweak needed.
- **`app/shop/page.tsx` still imports `Button` for other uses** — grep before removing. If `Button` is used elsewhere in that file, leave the import.
