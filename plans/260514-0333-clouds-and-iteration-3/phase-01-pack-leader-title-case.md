---
phase: 1
title: Pack Leader Title Case
status: completed
priority: P3
effort: 5m
dependencies: []
---

# Phase 1: Pack Leader Title Case

## Overview

Change the Pack Leader subtitle from ALL-CAPS+tracked-eyebrow style to softer title-case italic. Per user brief: "softer typography, more premium, more emotional warmth."

## Requirements

- Functional: subtitle renders as "The soulful, golden heart of ScoutPaw" (title case).
- Non-functional: typography reads premium; no visual hierarchy break with surrounding h2/kicker.

## Related Code Files

- Modify: `components/home/featured-pup-spotlight.tsx`

## Implementation Steps

1. Locate the subtitle paragraph (line ~41–43):
   ```tsx
   <p className="mt-2 font-display text-lg uppercase tracking-[0.2em] text-warm-muted md:text-xl">
     THE SOULFUL, GOLDEN HEART OF SCOUTPAW
   </p>
   ```
2. Replace with:
   ```tsx
   <p className="mt-2 font-display text-lg italic tracking-wide text-warm-muted md:text-xl">
     The soulful, golden heart of ScoutPaw
   </p>
   ```
3. Changes:
   - Replace `uppercase` → drop it (text is in actual title case)
   - Replace `tracking-[0.2em]` → `tracking-wide` (subtle tracking, not eyebrow)
   - Add `italic`
   - Title case the JSX content
4. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Subtitle renders in title case (no uppercase)
- [ ] Italic styling applied
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Italic display font may render awkwardly if font has no italic glyph. **Mitigation:** if it renders as fake-oblique, drop `italic` and rely on title-case + softer tracking alone.
