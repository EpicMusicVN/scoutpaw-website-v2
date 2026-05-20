---
title: 'Character Rename: Full Unscramble'
description: >-
  Full character data unscramble triggered by Husky 'Buddy' → 'Rocky' rename
  request. Realigns 5 character entries + parallel mock-products scramble.
status: completed
priority: P2
branch: main
tags:
  - content
  - characters
  - refactor
  - mock-products
blockedBy: []
blocks: []
created: '2026-05-18T23:04:41.681Z'
createdBy: 'ck:plan'
source: skill
---

# Character Rename: Full Unscramble

## Overview

User asked to rename the Husky character from "Buddy" to "Rocky". Audit revealed multi-session data drift: 3 of 5 characters have name/slug/breed mismatches, two characters were named "Buddy", slug "rocky" was already taken by the Poodle, and `lib/shopify/mock-products.ts` has the same scramble pattern.

This plan does the full unscramble in one pass — anything less compounds the drift.

**Brainstorm:** [brainstorm-260519-0544-character-rename-full-unscramble.md](../reports/brainstorm-260519-0544-character-rename-full-unscramble.md)

## Locked Mapping

| Breed | Name | Slug |
|---|---|---|
| Husky | **Rocky** | rocky |
| Golden Retriever | Max | max (unchanged) |
| Collie | **Oscar** | oscar |
| Corgi | **Buddy** | buddy |
| Poodle | **Bella** | bella |

**Pattern:** slug rotation. Each `characters.json` row keeps its breed/bio/image/accentColor (the bio prose describes that breed). Only slug + name change. Bio self-references (e.g., `"Buddy, our..."` → `"Rocky, our..."`) get swapped.

## Key Decisions

- Order field stays 1-5 (preserves visual order: Rocky/Husky first as the captain)
- Old `/characters/buddy` URL now silently loads Corgi page (pre-launch — no inbound traffic, no redirect needed)
- Husky funfact about "golden snack" is brand-copy issue — deferred (not part of refactor scope)
- `mock-products.ts` fix INCLUDED — was previously deferred (per 260518 changelog), now resolved

## Dependencies

None. This is the next iteration on top of the prior content refresh and the just-shipped anti-spam hardening (both unstaged).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [characters.json realignment](./phase-01-characters-json-realignment.md) | Completed |
| 2 | [channels and videos slug fixups](./phase-02-channels-and-videos-slug-fixups.md) | Completed |
| 3 | [UI copy and JSDoc updates](./phase-03-ui-copy-and-jsdoc-updates.md) | Completed |
| 4 | [mock-products realignment](./phase-04-mock-products-realignment.md) | Completed |
| 5 | [Validation](./phase-05-validation.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->
