# Brainstorm — Watch Page Channel Renames

**Date:** 2026-05-20 23:24 | **Status:** Done (Approach B) | **Scope:** 3 files

## Problem Statement

Watch page → "The Network / Our Channels": rename 4 channels to drop the character-breed prefix.

## Scout Finding

Card title rendered as `displayPrefix ? "${displayPrefix} - ${name}" : name` (`our-channels.tsx`). The `name` field already held each target string exactly — the breed label lived in a separate `displayPrefix` field. So "rename" = remove `displayPrefix`.

| Channel | Before | After (= existing `name`) |
|---|---|---|
| `puppy-lullaby-tv` | Golden - Puppy Lullaby TV | Puppy Lullaby TV |
| `happy-paws-cartoon` | Husky - Happy Paws Cartoon | Happy Paws Cartoon |
| `magic-paw` | Poodle - Magic Paw - Cartoon For Dogs | Magic Paw - Cartoon For Dogs |
| `doggo-dreams-tv` | Collie - Doggo Dreams TV | Doggo Dreams TV |

## Approach Chosen — B (rename + dead-code cleanup)

Removing `displayPrefix` from all 4 channels leaves it 100% unused → also removed the field + the never-taken render branch.

## Changes

- `content/channels.json` — removed `displayPrefix` from 4 channels
- `lib/content/schemas.ts` — removed `displayPrefix: z.string().optional()` + its comment (drives `Channel` type)
- `components/watch/our-channels.tsx` — ternary simplified to `{channel.name}`

## Validation

- ✅ `channels.json` valid JSON
- ✅ `tsc --noEmit` clean
- ✅ `next lint` clean

## Unresolved

- None.
