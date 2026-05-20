---
phase: 2
title: channels and videos slug fixups
status: completed
priority: P1
effort: 10m
dependencies:
  - 1
---

# Phase 2: channels and videos slug fixups

## Overview

Update slug references in `content/channels.json` and `content/videos.json` so they point to the new Husky slug (`rocky`). Update the one video title that names the Husky character explicitly.

## Requirements

- Functional: every slug reference that was about the Husky character now uses `"rocky"`; video title with "Buddy" in it now uses "Rocky"
- Non-functional: JSON valid; no orphan slug references

## Related Code Files

- Modify: `content/channels.json`
- Modify: `content/videos.json`

## Implementation Steps

1. **`content/channels.json` line 23:**
   - `"characterSlug": "buddy"` → `"characterSlug": "rocky"`

2. **`content/videos.json`** — 4 tag entries + 1 title:
   - Line 9: `"buddy"` (in tags array) → `"rocky"`
   - Line 73: `"buddy"` → `"rocky"`
   - Line 92: `"title": "Buddy and the Backyard Birds"` → `"title": "Rocky and the Backyard Birds"`
   - Line 94: `"buddy"` → `"rocky"`
   - Line 104: `"buddy"` → `"rocky"`

3. Re-grep `content/` for any remaining `"buddy"` references — should be ZERO since the Husky was the only character that used slug `buddy`. (The new Corgi will use `buddy` slug only inside `characters.json`, not in channels/videos refs — unless videos were tagged to the Corgi, which they weren't.)

## Success Criteria

- [ ] `grep -rn '"buddy"' content/` returns ONLY the new Corgi entry in `characters.json` (line 4 area)
- [ ] `grep -rn 'Buddy' content/` returns ONLY the new Corgi `name` line + its bio self-reference
- [ ] Video title says "Rocky and the Backyard Birds"
- [ ] `pnpm typecheck` passes

## Risk Assessment

- **Risk:** A video was tagged to the Corgi originally (not the Husky) — if so, that `"buddy"` tag was actually correct for the OLD Corgi=Oscar character and now means the NEW Corgi=Buddy character — still correct, no change needed
  - **Mitigation:** Read the videos with `buddy` tags before changing; if the video content is about the Husky (per title/description), change tag; if about the Corgi, leave alone. Most likely all 4 are Husky-tagged based on prior changelog context.
- **Risk:** Newer video added since prior scout that also uses `buddy` tag
  - **Mitigation:** Use grep, not line-based edits, to catch all occurrences
