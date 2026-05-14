---
phase: 6
title: Site-Config Palette Sync
status: completed
priority: P3
effort: 5m
dependencies:
  - 1
---

# Phase 6: Site-Config Palette Sync

## Overview

The `palette` block in `content/site-config.json` is documentation-only (not consumed at runtime per scout). Update its values to reflect the new palette so the JSON doesn't drift from reality.

## Requirements

- Functional: hex values in `palette` block match `globals.css` definitions.
- Non-functional: JSON valid; no schema break (zod-validated).

## Architecture

`content/site-config.json:15–23` defines a `palette` object with keys `brandPrimary`, `brandSecondary`, `accentWarm`, `accentCool`, `textDark`, `backgroundCream`, `surface`. Validated by `lib/content/schemas.ts` `SiteConfigSchema`. Runtime usage: only documentation; no component reads it (confirmed by scout).

## Related Code Files

- Modify: `content/site-config.json`

## Implementation Steps

1. Open `content/site-config.json`.
2. Update palette values:
   ```json
   "palette": {
     "brandPrimary": "#FFD70C",
     "brandSecondary": "#397FC5",
     "accentWarm": "#FFE968",
     "accentCool": "#C6E7E9",
     "textDark": "#2B1D10",
     "backgroundCream": "#C6E7E9",
     "surface": "#FFFFFF"
   }
   ```
3. Verify JSON is valid (no trailing commas, balanced braces).
4. Run `pnpm typecheck` (zod will fail if schema mismatch).

## Success Criteria

- [ ] All 7 palette hex values updated
- [ ] JSON parses correctly
- [ ] `pnpm typecheck` clean (zod schema passes)

## Risk Assessment

- **Risk:** Schema expects specific key set or hex format. **Mitigation:** read schema first; current keys preserved; hex format `#RRGGBB` already matches.
- **Risk:** Some component DOES read from this block silently. **Mitigation:** scout confirmed zero runtime usage; verify with grep `palette.brand` before declaring complete.
