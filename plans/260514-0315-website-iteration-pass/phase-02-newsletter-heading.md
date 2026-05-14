---
phase: 2
title: Newsletter Heading
status: completed
priority: P3
effort: 2m
dependencies: []
---

# Phase 2: Newsletter Heading

## Overview

Shorten newsletter heading. Drop the parenthetical "(Very Important Pup)".

## Requirements

- Functional: heading renders as `Become a VIP` (no parenthetical).
- Non-functional: no schema change; no responsive issues introduced.

## Related Code Files

- Modify: `app/page.tsx`

## Implementation Steps

1. In `app/page.tsx:50`, change:
   ```tsx
   heading="Become a VIP (Very Important Pup)"
   ```
   to:
   ```tsx
   heading="Become a VIP"
   ```
2. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Newsletter section renders "Become a VIP" as heading
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** None. Trivial text edit.
