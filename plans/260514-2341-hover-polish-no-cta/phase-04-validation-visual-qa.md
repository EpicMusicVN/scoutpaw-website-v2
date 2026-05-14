---
phase: 4
title: Validation + visual QA
status: completed
priority: P2
effort: 20m
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Validation + visual QA

## Overview

Verify phases 1–3 land cleanly. Runs typecheck + lint, then an interaction-focused walkthrough confirming the new hover behaviors feel cohesive and stable.

## Requirements

**Functional**
- `pnpm typecheck` exits 0.
- `pnpm lint` exits 0 (no new errors).
- Hero on Home + Shop renders without CTAs.
- Menu card hovers feel unified across all elements.
- Shop tile hovers do NOT cause layout shift or apparent text resizing.
- No console errors.

## Architecture

Read-only validation of:
- `components/home/full-bleed-hero.tsx`
- `app/shop/page.tsx`
- `components/home/menu-cards.tsx`
- `components/shop/explore-products.tsx`
- `tailwind.config.ts` (confirm `ease-gentle` exists)

## Pre-flight

Verify `ease-gentle` is a defined easing token in `tailwind.config.ts`. If missing, this phase HALTS — either add the token or revert phase 2/3 to `ease-out`.

## Implementation Steps

1. Grep `tailwind.config.ts` for `ease-gentle` (or `gentle:` inside `transitionTimingFunction`). Halt if missing.
2. Run `pnpm typecheck`. Halt on errors.
3. Run `pnpm lint`. Halt on new errors.
4. Boot dev server (`pnpm dev`).
5. **Home `/` walkthrough** at 375 / 768 / 1024 / 1440:
   - Hero card renders kicker + title + description only (no buttons).
   - Hover any menu card: whole composition lifts cohesively. Image lifts more than text. Pill arrow slides + shadow grows. All on the same 500ms curve.
   - Move cursor off card: smooth reverse motion, same 500ms curve.
   - Hover text-card area: triggers full composition hover state (group-hover).
6. **Shop `/shop` walkthrough** at same viewports:
   - Hero card renders kicker + title + description only (no buttons).
   - Hover "Find Your Pup's Favourite" tile: card lifts 2px, shadow grows, image scales 5%. Card stays tilted. No text/layout shift.
   - Inspect tile in devtools to confirm `group-hover:rotate-0` is gone.
   - Move cursor off: smooth reverse, layout stable.
7. Keyboard nav: tab through menu cards + shop tiles. Focus rings visible. Pressing Enter navigates.
8. Devtools console: no new errors/warnings.

## Success Criteria

- [ ] `ease-gentle` confirmed in `tailwind.config.ts`
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm lint` exits 0
- [ ] Home + Shop hero render without buttons
- [ ] Menu card hover feels cohesive — all elements move together on same tempo
- [ ] Shop tile hover does NOT shift layout or resize text
- [ ] Hover state reverses smoothly on cursor exit
- [ ] Keyboard nav + focus rings work
- [ ] No new console errors

## Risk Assessment

- **`ease-gentle` token missing** — symptom: classes don't apply, hover uses linear easing or default. Fix: add `gentle: 'cubic-bezier(0.32, 0.72, 0.16, 1)'` (or similar) to `transitionTimingFunction` in `tailwind.config.ts`. Coordinate with phases 2/3 before merge.
- **Combined lift on menu cards feels too much** — drop image card to `-translate-y-1` in phase 2.
- **Tilted-on-hover Shop tile feels static** — accepted per user; revisit only if user objects after seeing it.
- **Hero looks sparse without CTAs** — accepted per user; can re-add prop later if needed.
