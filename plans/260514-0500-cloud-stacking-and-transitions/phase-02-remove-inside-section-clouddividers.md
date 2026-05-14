---
phase: 2
title: Remove Inside-Section CloudDividers
status: completed
priority: P2
effort: 5m
dependencies:
  - 1
---

# Phase 2: Remove Inside-Section CloudDividers

## Overview

Remove the `<CloudDivider>` calls from inside MenuCards and CharacterShowcase. After this phase, no section embeds a CloudDivider — they live as between-section elements in `app/page.tsx` (P3).

## Requirements

- Functional:
  - MenuCards no longer renders inline clouds (top + bottom)
  - CharacterShowcase no longer renders the top inline cloud
- Non-functional:
  - typecheck clean (resolves the temporary failure from P1)
  - lint clean

## Related Code Files

- Modify: `components/home/menu-cards.tsx`
- Modify: `components/home/character-showcase.tsx`

## Implementation Steps

1. In `menu-cards.tsx`:
   - Remove `<CloudDivider position="top" opacity={0.6} />`
   - Remove `<CloudDivider position="bottom" opacity={0.6} />`
   - Remove the `CloudDivider` import
2. In `character-showcase.tsx`:
   - Remove `<CloudDivider position="top" opacity={0.65} />`
   - Remove the `CloudDivider` import
3. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Zero CloudDivider references inside `components/home/`
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Visual transitions between MenuCards / Pack Leader / CharacterShowcase look abrupt without inline clouds. **Mitigation:** P3 immediately places page-level dividers covering the same transitions.
