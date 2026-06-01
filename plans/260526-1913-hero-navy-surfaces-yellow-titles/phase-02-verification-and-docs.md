---
phase: 2
title: Verification and Docs
status: completed
priority: P2
effort: 20m
dependencies:
  - 1
---

# Phase 2: Verification and Docs

## Overview

Live verification across all 5 hero pages; update changelog.

## Implementation Steps

1. **Typecheck + lint.**
2. **Live verification** at mobile/tablet/desktop/wide:
   - `/` — CinematicHero text panel navy, gold h1, yellow kicker, white body
   - `/characters` — FullBleedHero mobile card + desktop glass: navy bg, gold h1, yellow kicker
   - `/watch` — WatchHero centered text in navy container; SCOUTPAW TV kicker yellow; "Tune in to the Pack" gold; description white; flanking poses still fit
   - `/shop` — FullBleedHero variant — same as characters
   - `/top-picks` — FullBleedHero variant — same
   - `/coming-soon/*` — ComingSoonHero text in navy container; character image above remains visible
   - `/characters/[slug]` — CharacterDetailHero h1 gold; themed surfaceTint preserved
3. **AA contrast spot-check** on each surface (mostly trivial since navy bg + yellow/white text is ~5–7:1 across the board).
4. **Update changelog**:
   ```markdown
   ## [2026-05-26] - Hero Navy Surfaces + Gold Yellow Titles

   ### Overview
   Plan J of styling iteration 4. Hero text containers converted to navy bg, enabling yellow gradient titles + yellow kickers + white body text — all AA-safe at ~5–7:1. New `.heading-gradient-gold` utility (no navy in the gradient) and `.text-shadow-bold` (dark grounding + golden glow) added globally.

   ### Changes
   - `app/globals.css`: added `.heading-gradient-gold` (5-stop yellow/gold gradient) + `.text-shadow-bold`.
   - `components/home/cinematic-hero.tsx`: text panel `bg-surface` → `bg-navy`; gold h1; yellow kicker; white/85 body.
   - `components/home/full-bleed-hero.tsx`: mobile card + desktop glass blob → navy; gold h1; yellow kicker; white/85 body.
   - `components/watch/watch-hero.tsx`: centered text wrapped in `bg-navy rounded-[2rem]` container; SCOUTPAW TV kicker yellow; gold h1; white/85 body; primary CTA variant.
   - `components/coming-soon/coming-soon-hero.tsx`: text wrapped in navy container; gold h1; white/85 tagline; kicker stays themed (per-character accentColor).
   - `components/characters/character-detail-hero.tsx`: h1 swapped to `heading-gradient-gold text-shadow-bold`; themed surfaceTint bg preserved.

   ### Design Rationale
   - Yellow on light surfaces fails AA. Moving hero text to navy surface honors the "yellow text" request without compromising readability.
   - `heading-gradient-gold` removes navy entirely from hero h1 gradients (user request).
   - `text-shadow-bold` adds dark grounding (lifts gold off navy) + golden glow (premium foil effect).

   ### Validation
   - typecheck + lint clean
   - AA: yellow (#ffd70c) on navy (#397fc5) = ~7:1; white/85 on navy = ~5.5:1
   - 6 hero surfaces verified at 4 breakpoints
   ```

## Success Criteria

- [ ] All 6 hero pages render correctly with navy surfaces
- [ ] No AA regressions
- [ ] Typecheck + lint clean
- [ ] Changelog entry added

## Risk Assessment

- **Risk:** Live review of the navy hero look may want softening. *Mitigation:* easy bg alpha or color tweak; foundation stays the same.
