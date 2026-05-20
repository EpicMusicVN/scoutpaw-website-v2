---
phase: 1
title: characters.json realignment
status: completed
priority: P1
effort: 15m
dependencies: []
---

# Phase 1: characters.json realignment

## Overview

Rewrite `content/characters.json` so every entry has aligned slug + name + breed + bio (with self-references matching the new name). Removes the duplicate `name: "Buddy"` at line 50 (current Corgi entry).

## Requirements

- Functional: 5 entries with `(slug, name, breed)` triplets per locked mapping; bios contain correct name self-references; image + accentColor + funFacts stay with their breed
- Non-functional: file is valid JSON; field order preserved per current schema; `order` field stays 1-5

## Architecture

Final shape:

```json
[
  { slug: "rocky", name: "Rocky", breed: "Husky", bio: "Rocky, our 'Welcome Wag-on'...", image: "characters/husky-bg.png", accentColor: "#5BC0EB", order: 1 },
  { slug: "max",   name: "Max",   breed: "Golden Retriever", bio: "Max is the warm, golden heart...", image: "characters/golden-2.png", accentColor: "#FFB627", order: 2 },
  { slug: "oscar", name: "Oscar", breed: "Collie", bio: "Oscar notices everything...", image: "characters/collie-bg.png", accentColor: "#9C6644", order: 3 },
  { slug: "buddy", name: "Buddy", breed: "Corgi",  bio: "Buddy is the pack's joyful chaos...", image: "characters/corgi-bg.png", accentColor: "#F4A261", order: 4 },
  { slug: "bella", name: "Bella", breed: "Poodle", bio: "Bella is the pack's quiet thinker...", image: "characters/poodle-bg.png", accentColor: "#B8A1D9", order: 5 }
]
```

Note: bio prose stays with each breed (it describes that breed). Only the opening word (the name reference) changes per entry.

## Related Code Files

- Modify: `content/characters.json`

## Implementation Steps

1. Read current `content/characters.json` to confirm exact shape
2. For each of 5 entries:
   - Husky entry: change `slug: "buddy"` → `"rocky"`, `name: "Buddy"` → `"Rocky"`, bio open `"Buddy, our..."` → `"Rocky, our..."`. Keep breed/funFacts/image/accentColor/order=1.
   - Golden entry: unchanged (already aligned)
   - Collie entry: change `slug: "bella"` → `"oscar"`, `name: "Oscar"` (already!), bio open `"Bella notices..."` → `"Oscar notices..."`. Keep breed/funFacts/image/accentColor/order=3.
   - Corgi entry: change `slug: "oscar"` → `"buddy"`, `name: "Buddy"` (already!), bio open `"Oscar is..."` → `"Buddy is..."`. Keep breed/funFacts/image/accentColor/order=4.
   - Poodle entry: change `slug: "rocky"` → `"bella"`, `name: "Bella"` (already!), bio open `"Rocky is..."` → `"Bella is..."`. Keep breed/funFacts/image/accentColor/order=5.
3. Verify JSON parses (`pnpm typecheck` will catch ts schema mismatches if any — content schemas live in `lib/content/schemas.ts`)

## Success Criteria

- [ ] All 5 entries have aligned `(slug, name, breed, bio-self-reference)`
- [ ] No duplicate names across the array
- [ ] No duplicate slugs across the array
- [ ] Order field still 1-5 in the existing visual order
- [ ] `pnpm typecheck` passes (content schema validation)

## Risk Assessment

- **Risk:** Missing a bio self-reference inside the body text (only fixing the opening word)
  - **Mitigation:** Re-read each bio after edit; bios are short (~2 sentences each) — easy visual check
- **Risk:** Breaking JSON syntax (trailing commas, mismatched quotes)
  - **Mitigation:** Use precise Edit operations; `pnpm typecheck` catches it
- **Risk:** Husky funfact mentions "golden snack" (out of scope per brand-copy ownership)
  - **Mitigation:** Documented as deferred in brainstorm; not fixed here
