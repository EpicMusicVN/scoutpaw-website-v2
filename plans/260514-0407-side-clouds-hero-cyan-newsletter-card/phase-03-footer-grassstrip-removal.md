---
phase: 3
title: Footer GrassStrip Removal
status: completed
priority: P3
effort: 10m
dependencies: []
---

# Phase 3: Footer GrassStrip Removal

## Overview

Remove `<GrassStrip />` decoration above the footer. Clean up the now-orphan `--grass-strip-top` CSS variable and `body:has(#newsletter)` rule in `globals.css`.

## Requirements

- Functional: footer renders without grass strip; blue bg starts directly.
- Non-functional: no orphan CSS rules; no broken refs.

## Related Code Files

- Modify: `components/nav/footer.tsx` (remove `<GrassStrip />` render + function definition)
- Modify: `app/globals.css` (remove `--grass-strip-top` declaration + `body:has(#newsletter)` rule)

## Implementation Steps

1. In `footer.tsx`:
   - Remove `<GrassStrip />` from the footer JSX (was the first child of `<footer>`).
   - Remove the `function GrassStrip() { ... }` definition.
   - Check for unused imports if any.
2. In `globals.css`:
   - Remove the `--grass-strip-top` variable declaration in `:root` block.
   - Remove the `body:has(#newsletter) { --grass-strip-top: #ffe968; }` rule + its comment.
3. Run `pnpm typecheck` + `pnpm lint`.
4. Visual smoke: scroll to footer, confirm blue starts directly without grass.

## Success Criteria

- [ ] No grass strip above footer
- [ ] Footer blue bg starts directly
- [ ] `--grass-strip-top` variable removed from globals.css
- [ ] `body:has(#newsletter)` rule removed
- [ ] No orphan refs to `GrassStrip` or `--grass-strip-top` anywhere
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Removed CSS variable is referenced elsewhere. **Mitigation:** grep for `--grass-strip-top` before deletion; only used in footer's GrassStrip SVG.
- **Risk:** Removed function still imported. **Mitigation:** GrassStrip is local-only to footer.tsx (function declaration, not imported elsewhere).
