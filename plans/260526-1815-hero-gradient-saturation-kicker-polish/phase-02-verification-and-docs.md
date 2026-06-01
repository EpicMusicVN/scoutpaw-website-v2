---
phase: 2
title: Verification and Docs
status: completed
priority: P2
effort: 15m
dependencies:
  - 1
---

# Phase 2: Verification and Docs

## Overview

Verify gradient + kicker changes render correctly across all hero pages; update changelog.

## Implementation Steps

1. **Typecheck + lint** the full project.
2. **Dev server live check** at desktop + mobile:
   - `/` — cinematic-hero h1 gradient
   - `/characters` — full-bleed-hero h1 gradient
   - `/watch` — watch-hero h1 gradient + kicker color (deep navy now)
   - `/shop` — full-bleed-hero h1
   - `/top-picks` — full-bleed-hero h1
   - `/characters/[slug]` (any slug) — character-detail-hero h1
   - Mobile: confirm 2-stop fallback renders cleanly (no stripe artifacts)
3. **AA spot-check** — watch kicker ink-blue on cream/cyan surface should easily clear AA.
4. **Update changelog** — append entry to `docs/project-changelog.md`:
   ```markdown
   ## [2026-05-26] - Hero Gradient Saturation + Watch Kicker Color

   ### Overview
   Plan G of styling iteration 3. Boosted saturation on `.heading-gradient-tri` global utility (deeper navy start `#0f2540`, 5-stop gradient with brand-primary yellow mid) — auto-propagates to all 5 hero h1s site-wide. Watch hero kicker swapped from `text-brand-gold` to `text-ink-blue` for AA-safe brand consistency.

   ### Changes
   - `app/globals.css`: `.heading-gradient-tri` gradient stops updated (3 → 5 stops, deeper navy start, brand-primary yellow mid, warm white penultimate); mobile fallback also deepened.
   - `components/watch/watch-hero.tsx`: kicker `text-brand-gold` → `text-ink-blue`.

   ### Validation
   - typecheck + lint clean
   - All 5 hero h1s render with stronger gradient
   - Watch kicker AA-safe at ~6:1
   ```

## Success Criteria

- [ ] All 5 hero h1s render with new saturation across 4 breakpoints
- [ ] Watch kicker is deep navy
- [ ] Typecheck + lint clean
- [ ] Changelog entry added

## Risk Assessment

- **Risk:** Live review reveals gradient too neon or too dark. *Mitigation:* iterate the 5 stop values; foundational change is easy to tune.

## Security Considerations

None.
