---
phase: 7
title: Honey Cleanup
status: completed
priority: P3
effort: 45m
dependencies:
  - 1
  - 2
  - 3
  - 4
  - 5
---

# Phase 7: Honey Cleanup

## Overview

Final sweep: grep for all remaining `brand-honey` / `bg-honey` / `text-brand-honey` / `--brand-honey` references and migrate or delete. Then permanently remove the commented-out honey variables from `globals.css` and `tailwind.config.ts`.

## Requirements

- Functional: zero remaining honey references in `app/`, `components/`, `lib/`.
- Non-functional: full typecheck + lint + build pass cleanly.

## Architecture

Grep is the source of truth. Each match either:
- Re-targets to `--brand-primary` (yellow), `--bg-base` (cyan), `text-white`, or `text-ink` depending on context.
- Gets deleted if decorative-only and no longer needed.
- Comments / docs: update inline if they reference the old palette.

## Related Code Files

- Modify: any file with remaining `honey` references (discovered via grep)
- Modify: `app/globals.css` (remove commented variables)
- Modify: `tailwind.config.ts` (remove commented tokens)

## Implementation Steps

1. Grep across the codebase for each pattern:
   ```
   brand-honey
   bg-honey
   text-brand-honey
   border-brand-honey
   --brand-honey
   --bg-honey
   ```
2. For each match outside `globals.css` and `tailwind.config.ts`:
   - **CTA / accent context** → swap to `bg-brand-primary` or `text-brand-primary`
   - **Background surface** → swap to `bg-paper` or `bg-[#c6e7e9]`
   - **Text on dark bg** → swap to `text-white` or `text-[#fffbe6]`
   - **Decorative only, no replacement needed** → delete the class
3. After all references migrated, delete the commented-out variables from `app/globals.css` (lines added in P1).
4. Delete the commented-out tokens from `tailwind.config.ts` (lines touched in P2).
5. Run final validation:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm build`
   - Grep again to confirm zero remaining matches.
6. Visual regression smoke: home, /shop, /watch, /coming-soon/[any].

## Success Criteria

- [ ] Zero matches for `brand-honey`, `bg-honey`, `text-brand-honey`, `border-brand-honey` across `app/`, `components/`, `lib/`
- [ ] Zero matches for `--brand-honey`, `--bg-honey` in `app/globals.css`
- [ ] No `honey` token in `tailwind.config.ts`
- [ ] `pnpm build` passes
- [ ] No visual regressions on home / shop / watch / coming-soon pages

## Risk Assessment

- **Risk:** A migrated class loses semantic meaning (e.g., decorative honey blob → unstyled blob looks broken). **Mitigation:** visual smoke after migration; coral fallback `#ff7a85` or yellow `#ffd70c` for decoratives.
- **Risk:** Grep misses a dynamic class like `bg-${color}-100`. **Mitigation:** also grep `honey` (raw word) for completeness; review hits manually.
