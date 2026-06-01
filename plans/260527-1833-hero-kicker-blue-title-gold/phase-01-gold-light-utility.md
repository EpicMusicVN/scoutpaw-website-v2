---
phase: 1
title: "Gold Light Utility"
status: pending
priority: P1
effort: "15m"
dependencies: []
---

# Phase 1: Gold Light Utility

## Overview

Add a single new gradient utility class `.heading-gradient-gold-light` to `app/globals.css` for legible gold-on-light-bg headings. Symmetric dark-gold → brand yellow → dark-gold (no white stops). Mobile fallback included.

## Requirements

- **Functional:** New CSS class produces a gold gradient that reads on light cyan paper bg (`#c6e7e9`) without invisibility zones
- **Functional:** Mobile (<640px) fallback to 3-stop gradient to avoid striping on narrow viewports
- **Non-functional:** Additive only — do NOT modify existing `.heading-gradient-gold` (used elsewhere / kept for future navy-surface use)
- **Non-functional:** Reuses existing CSS vars (`--brand-primary`); no new tokens

## Architecture

Place new utility immediately after the existing `.heading-gradient-gold` block in `app/globals.css` (current location ~line 270). Both utilities coexist; selectors are mutually exclusive — components opt into one via class.

```
@layer utilities {
  ...
  .heading-gradient-gold { ... }              ← existing (navy surface)
  @media (max-width: 639px) { .heading-gradient-gold { ... } }
  .heading-gradient-gold-light { ... }        ← NEW (light surface)
  @media (max-width: 639px) { .heading-gradient-gold-light { ... } }
  ...
}
```

## Related Code Files

- Modify: `app/globals.css`

## Implementation Steps

1. Read `app/globals.css` lines 248–271 to locate the existing `.heading-gradient-gold` block + its mobile fallback
2. Append the new utility immediately after, inside the `@layer utilities { }` block:

```css
/*
 * Yellow gradient for hero h1s on LIGHT surfaces (cyan paper / white).
 * Symmetric — dark gold anchors both ends so no stop fades into the bg.
 * Pair with .text-shadow-soft if extra lift is needed on busy imagery.
 */
.heading-gradient-gold-light {
  background-image: linear-gradient(
    90deg,
    #b8862e 0%,
    #d4a833 25%,
    var(--brand-primary) 50%,
    #d4a833 75%,
    #b8862e 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
@media (max-width: 639px) {
  .heading-gradient-gold-light {
    background-image: linear-gradient(
      90deg,
      #b8862e 0%,
      var(--brand-primary) 50%,
      #b8862e 100%
    );
  }
}
```

3. Verify no Tailwind/PostCSS errors via `pnpm typecheck` (do NOT run `pnpm build` — see plan-level build gate)

## Success Criteria

- [ ] `.heading-gradient-gold-light` class exists in `app/globals.css`
- [ ] Mobile fallback exists for `<640px`
- [ ] Existing `.heading-gradient-gold` untouched
- [ ] `pnpm typecheck` passes (or lint if no typecheck script)
- [ ] No regression: existing pages still render

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Tailwind purges the new class | Class is referenced in JSX (next phase) — Tailwind sees it. Not a concern. |
| Naming collision | Grep confirms `heading-gradient-gold-light` is unused — clean. |
| `var(--brand-primary)` missing | Defined in `:root` at globals.css:15 — verified. |
