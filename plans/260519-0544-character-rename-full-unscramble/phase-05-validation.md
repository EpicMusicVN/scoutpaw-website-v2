---
phase: 5
title: Validation
status: completed
priority: P1
effort: 10m
dependencies:
  - 4
---

# Phase 5: Validation

## Overview

Static checks + grep audit + verify all 5 character pages SSG-build under their new slugs.

## Requirements

- Functional: code compiles, lints clean, builds; all 5 new character routes resolve
- Non-functional: no stray "Buddy" / "buddy" references that point to the Husky (only valid use: the new Corgi)

## Implementation Steps

1. **Static checks:**
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm build
   ```
   All three must pass. Build output should show 5 SSG'd character pages:
   - `/characters/rocky`
   - `/characters/max`
   - `/characters/oscar`
   - `/characters/buddy`
   - `/characters/bella`

2. **Cross-cutting grep audit:**
   ```bash
   grep -rn '"buddy"' content/ app/ components/ lib/
   ```
   Expected: ONLY the new Corgi `slug: "buddy"` entry in `content/characters.json`. Zero hits elsewhere.

   ```bash
   grep -rn 'Buddy' app/ components/ lib/
   ```
   Expected: ZERO hits (UI copy and JSDoc all updated; mock-products uses "Buddy" only inside the Corgi product title which is correct).

   ```bash
   grep -rn 'Buddy' content/
   ```
   Expected: ONLY the Corgi entry in `characters.json` (`name: "Buddy"` + bio self-reference).

3. **Local smoke test (`pnpm dev`):**
   - Visit homepage → confirm hero/menu-cards mention "Rocky" not "Buddy"
   - Visit `/characters/rocky` → Husky page loads with correct image + bio
   - Visit `/characters/buddy` → Corgi page loads (intentional URL-meaning shift)
   - Visit `/characters/oscar` → Collie page loads
   - Visit `/characters/bella` → Poodle page loads
   - Visit `/characters/max` → Golden page loads (unchanged)
   - Visit `/shop` → product titles match images (mock-3 shows Husky image with "Rocky the Husky Tee" title, etc.)
   - Visit `/shop` → empty state (if it renders) says "Rocky" not "Buddy"

## Success Criteria

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds with 5 character pages SSG'd
- [ ] Grep audit: zero stray "Buddy"/"buddy" outside Corgi-context
- [ ] All 5 character pages render correctly with correct breed/bio/image
- [ ] Homepage hero + menu-cards + shop empty state all show "Rocky" instead of "Buddy"
- [ ] Shop products show correct character names matching their images

## Risk Assessment

- **Risk:** A character page renders a stale slug (e.g., 404 on `/characters/rocky`)
  - **Mitigation:** Build output is authoritative — if Next.js can't generate the static path, build fails. If build passes, all 5 routes are SSG'd.
- **Risk:** Visual regression on character order in cards/grid
  - **Mitigation:** Order field stays 1-5 in same visual order as before. If order looks weird, sort logic may consume a different field — investigate, but unlikely.

## Next Steps (Post-Validation)

- User commits (manages git themselves)
- No deploy required for plan completion
- If launch goes ahead: consider whether old `/characters/buddy` link semantics matter (was Husky, now Corgi) — pre-launch consensus = no redirect needed
