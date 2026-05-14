---
phase: 1
title: Navbar Shop Demotion
status: completed
priority: P3
effort: 5m
dependencies: []
---

# Phase 1: Navbar Shop Demotion

## Overview

Revert Shop nav item from white pill button back to plain text link. Matches Watch / Characters / Top Picks / Activities visually. Cleaner navbar.

## Related Code Files

- Modify: `components/nav/nav-links.tsx`

## Implementation Steps

1. In `nav-links.tsx`, remove the `isShop` detection + conditional:
   ```tsx
   // Before
   const isShop = item.label === "Shop";
   ...
   className={cn(
     "relative inline-flex min-h-[44px] items-center font-display text-sm font-bold uppercase tracking-wider transition-all duration-200 md:text-base",
     isShop
       ? "rounded-full bg-surface px-5 py-2 text-ink ring-1 ring-ink/10 shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-md"
       : cn(
           "nav-underline rounded-full px-4 py-2 md:px-5",
           active ? "text-ink" : item.enabled ? "text-ink hover:text-ink" : "text-ink/45 hover:text-ink/70",
         ),
   )}

   // After
   className={cn(
     "nav-underline relative inline-flex min-h-[44px] items-center rounded-full px-4 py-2 font-display text-sm font-bold uppercase tracking-wider transition-colors duration-200 md:px-5 md:text-base",
     active
       ? "text-ink"
       : item.enabled
         ? "text-ink hover:text-ink"
         : "text-ink/45 hover:text-ink/70",
   )}
   ```
2. Remove the `isShop` const if no longer referenced.
3. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Shop renders as a plain nav text link, identical styling to other items
- [ ] Hover state matches (ink underline)
- [ ] typecheck + lint clean

## Risk Assessment

- None. Single conditional removed.
