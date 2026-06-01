---
phase: 1
title: Theme Atmosphere Extension
status: completed
priority: P1
effort: 1h
dependencies: []
---

# Phase 1: Theme Atmosphere Extension

## Overview

Extend the per-character theme model with a new `atmosphere` field so each
detail page can render one signature atmospheric layer (Phase 3) and the scene
figures can pull a consistent decor tint (Phase 2). Foundation phase — keeps the
build green.

## Requirements

- Functional: every character slug resolves to an `atmosphere` id; `DEFAULT_THEME`
  stays total (typed fallback for unknown slugs).
- Non-functional: presentational data only, no copy; `tsc` stays clean.

## Architecture

`lib/content/character-themes.ts` already exposes `CharacterTheme`
(`heroGradient`, `surfaceTint`, `decor`, `motif`) + `getCharacterTheme(slug)`.
Add a new union type + field — no consumer breaks because every theme object
gets the field in the same edit.

Atmosphere → pup mapping (mirrors the brainstorm visual-identity directions):

| Slug | `atmosphere` | Signature layer (rendered in Phase 3) |
|------|--------------|----------------------------------------|
| max | `nightlight` | warm radial night-light glow |
| buddy | `motion` | dynamic speed-line / burst streaks |
| bella | `ribbons` | floating ballet ribbons |
| oscar | `blueprint` | faint blueprint / learning grid |
| rocky | `ridge` | layered mountain-ridge silhouette |

## Related Code Files

- Modify: `lib/content/character-themes.ts`

## Implementation Steps

1. Add exported union type:
   `export type CharacterAtmosphere = "nightlight" | "motion" | "ribbons" | "blueprint" | "ridge";`
2. Add `atmosphere: CharacterAtmosphere;` to the `CharacterTheme` interface, with
   a doc comment ("Signature atmospheric layer rendered by `<CharacterAtmosphere />`").
3. Set `atmosphere` on all 5 entries in `CHARACTER_THEMES` per the table above.
4. Set `atmosphere` on `DEFAULT_THEME` (use `"nightlight"` — matches the existing
   golden fallback).
5. Run `npx tsc --noEmit` — confirm no errors.

## Success Criteria

- [x] `CharacterAtmosphere` union exported; `CharacterTheme.atmosphere` required.
- [x] All 5 themes + `DEFAULT_THEME` have an `atmosphere` value.
- [x] `npx tsc --noEmit` clean.

## Risk Assessment

Low risk. Only risk is forgetting `DEFAULT_THEME` → `tsc` error (intentional
guard — fix it). No runtime behavior change until Phase 3 consumes the field.
