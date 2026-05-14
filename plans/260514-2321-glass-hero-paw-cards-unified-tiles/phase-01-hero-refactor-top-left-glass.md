---
phase: 1
title: Hero refactor (top-left glass)
status: completed
priority: P2
effort: 30m
dependencies: []
---

# Phase 1: Hero refactor (top-left glass)

## Overview

Rebase `FullBleedHero` desktop overlay from iter-1's bottom-left opaque card to iteration-2's top-left frosted-glass card. Remove the iter-1 bottom-up gradient div (no longer needed once the card moves to top). Shared component → both Home and Shop pages benefit from one edit.

## Requirements

**Functional**
- Hero card sits top-left, tucked under the navbar with breathing room.
- Card visual style: frosted glass (semi-transparent, blurred, soft border).
- Corgi face (Home) and merch products (Shop) fully visible at md/lg/xl viewports.

**Non-functional**
- Mobile (`<md`) in-flow card path UNCHANGED.
- No new design tokens, no new components.
- Focus rings + CTAs intact.

## Architecture

`components/home/full-bleed-hero.tsx` — desktop overlay block currently at lines 92-101 (post iter-1). Two changes:

**Change 1: Remove the iter-1 bottom-up gradient div.** Currently between the right fade and the closing image-container div (added in iter-1). New plan: delete it cleanly; keep the original left/right horizontal fades.

**Change 2: Refactor desktop overlay card** (current iter-1 → iter-2):

| Aspect | Iter-1 (current) | Iter-2 (new) |
|--------|------------------|--------------|
| Vertical anchor | `items-end` | `items-start` |
| Wrapper padding | `px-8 pb-10 lg:pb-16` | `px-8 pt-12 lg:pt-16` |
| Card max-width | `max-w-sm lg:max-w-md` | `max-w-sm lg:max-w-md` (keep) |
| Card bg | `bg-white/85` | `bg-white/45` |
| Card blur | `backdrop-blur-md` | `backdrop-blur-xl` |
| Card border | `border-ink/10` | `border-white/40` |
| Card padding | `px-6 py-5 lg:px-7 lg:py-6` | `px-6 py-5 lg:px-7 lg:py-6` (keep) |
| Card shadow | `shadow-cozy` | `shadow-cozy` (keep) |

**Pseudo (final state):**

```jsx
<div className="pointer-events-none absolute inset-0 hidden items-start md:flex">
  <div className="pointer-events-auto mx-auto w-full max-w-hero px-8 pt-12 lg:pt-16">
    <div className="max-w-sm rounded-2xl border border-white/40 bg-white/45 px-6 py-5 shadow-cozy backdrop-blur-xl lg:max-w-md lg:px-7 lg:py-6">
      <CardBody />
    </div>
  </div>
</div>
```

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`
  - Delete the iter-1 bottom-up gradient div (added between right fade and image-container close)
  - Replace desktop overlay block

## Implementation Steps

1. Locate the iter-1 bottom-up gradient div: comment line `Bottom-left vertical fade — localized backdrop behind the bottom-anchored card.` Delete the comment + the div together.
2. Replace desktop overlay block — change `items-center`/`items-end` → `items-start`, `pb-10 lg:pb-16` → `pt-12 lg:pt-16`, card classes per the table above.
3. Update the JSX comment above the desktop overlay to reflect new behavior ("Top-left frosted-glass card under the navbar..." instead of "Bottom-left anchored card...").
4. Run `pnpm typecheck`. Halt on errors.
5. Boot dev server, verify on `/` and `/shop` at 768/1024/1440:
   - Home: card sits top-left, glass effect visible, Corgi face unobstructed.
   - Shop: card sits top-left, products visible (some may peek through glass — acceptable).
6. If glass contrast feels weak (text hard to read over busy banner regions), bump `bg-white/45` → `bg-white/55`.
7. If card overlaps the top of the banner imagery on lg (especially upside-down dogs on Home), bump `pt-12 lg:pt-16` → `pt-16 lg:pt-20`.

## Success Criteria

- [ ] Iter-1 bottom-up gradient div removed (no orphan styles)
- [ ] Desktop overlay anchored top-left at md+
- [ ] Card uses `bg-white/45 backdrop-blur-xl border-white/40` (frosted glass)
- [ ] Corgi face fully visible on Home banner at 768/1024/1440
- [ ] Shop merch fully visible (or acceptable glass-overlap) on Shop banner
- [ ] Mobile (`<md`) renders unchanged
- [ ] `pnpm typecheck` clean
- [ ] CTAs clickable + focusable

## Risk Assessment

- **Card collides with upside-down dogs at top of Home banner** — symptom: card top edge overlaps cartoon dogs at center-top. Mitigation: bump `pt-12 lg:pt-16` → `pt-16 lg:pt-20`.
- **Text contrast weak on Shop banner busy left side** — symptom: text reads poorly through glass over patterned merch backdrop. Mitigation: bump `bg-white/45` → `bg-white/55` or `/60`.
- **Glass tint mismatched with navbar yellow zone** — if the navbar is solid yellow and the card sits flush below, the white glass may read jarring. Visual check; may need to add subtle margin-top or accept the contrast as design intent.
- **Mobile path inadvertently affected** — the mobile in-flow card sits below the banner with its own `bg-white/90 backdrop-blur-xl` already glass-like. No change planned, but verify by reading the mobile block in the same file isn't accidentally edited.
