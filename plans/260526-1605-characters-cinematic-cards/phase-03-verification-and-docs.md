---
phase: 3
title: Verification and Docs
status: completed
priority: P2
effort: 30m
dependencies:
  - 1
  - 2
---

# Phase 3: Verification and Docs

## Overview

Final verification of Plan B: typecheck, lint, live render at 4 breakpoints, AA contrast check on heading colors, changelog entry.

## Requirements

**Functional:**
- Plan B end-to-end works on `/characters` — 5 cinematic cards, mobile→desktop responsive, no broken interactions
- Changelog entry written

**Non-functional:**
- No regression on `/`, `/watch`, `/shop`, `/top-picks` (these still use the unchanged NewsletterCTA from Plan A)

## Architecture

Verification only — no architecture changes.

## Related Code Files

- **Modify:** `docs/project-changelog.md`
- **Read only:** Plan B output files

## Implementation Steps

1. **Typecheck + lint:**
   ```
   pnpm typecheck
   pnpm lint
   ```
   Both must pass cleanly.

2. **Dev server live check:**
   - `/characters` at mobile (375px), tablet (768px), desktop (1280px), wide (1536px+)
   - Confirm: 5 standalone cards, cyan canvas between, art overflow on desktop, mobile stacks naturally, zig-zag pattern correct
   - Confirm: character name h2 uses Plan A heading style (gradient or navy)
   - Confirm: atmosphere/motif drift clipped to card edges, no bleed

3. **AA contrast spot-check** — character name on the worst-case tinted bg (probably oscar's warm-tan or rocky's deep tone). Confirm 4.5:1 or better.

4. **Cross-page regression check** — visit `/`, `/watch`, `/shop`, `/top-picks` — confirm nothing changed (only Plan A changes should still be visible).

5. **Update changelog:**
   ```markdown
   ## [YYYY-MM-DD] - Cinematic Character Cards on /characters

   ### Overview
   Rebuilt /characters per-character sections from full-width tinted strips into large standalone rounded cards on the cyan canvas. Each card houses its own tinted background, atmosphere/motif drift, art composition (with cinematic top overflow on desktop), and content. Mobile stacks naturally with no forced viewport-height.

   ### Changes
   - `components/characters/character-section.tsx`: rebuilt as standalone card (`rounded-[2.5rem]`/`md:rounded-[3rem]`, `shadow-cozy-xl`, `min-h-[80vh]` desktop, per-character tint moved inside).
   - `app/characters/page.tsx`: wrapped character map in `space-y-12 md:space-y-20` for inter-card breathing room.

   ### Validation
   - typecheck + lint clean
   - 4-breakpoint visual check
   - AA contrast verified on character name h2 across all 5 tinted backgrounds
   ```

## Success Criteria

- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] `/characters` renders correctly at 4 breakpoints
- [ ] 5 cards, zig-zag, art overflow on desktop, mobile-safe
- [ ] Character name h2 AA-compliant on all 5 tinted bgs
- [ ] No regressions on other pages
- [ ] Changelog entry added

## Risk Assessment

- **Risk:** AA fails on one specific tint+heading combo. *Mitigation:* fall back to solid `text-navy` for that one character, or add `text-shadow-soft` lift. Don't ship without resolving.
- **Risk:** Atmosphere/motif visibility reduced inside card vs. full-width. *Mitigation:* accepted — card is the new design language; the drift still reads as ambient.

## Security Considerations

None.
