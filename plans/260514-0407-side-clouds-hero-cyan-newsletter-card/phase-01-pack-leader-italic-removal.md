---
phase: 1
title: Pack Leader Italic Removal
status: completed
priority: P3
effort: 2m
dependencies: []
---

# Phase 1: Pack Leader Italic Removal

## Overview

Remove italic class from the Pack Leader subtitle. Keep title case (already in place from prior cook).

## Related Code Files

- Modify: `components/home/featured-pup-spotlight.tsx`

## Implementation Steps

1. Find the subtitle paragraph (added italic last cook):
   ```tsx
   <p className="mt-2 font-display text-lg italic tracking-wide text-warm-muted md:text-xl">
   ```
2. Remove `italic`:
   ```tsx
   <p className="mt-2 font-display text-lg tracking-wide text-warm-muted md:text-xl">
   ```
3. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Subtitle renders in plain title case (no italic, no caps)
- [ ] typecheck + lint clean

## Risk Assessment

- None. Single class removed.
