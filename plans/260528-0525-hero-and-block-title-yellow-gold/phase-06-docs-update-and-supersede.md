---
phase: 6
title: Docs Update and Supersede
status: completed
priority: P2
effort: 20m
dependencies:
  - 5
---

# Phase 6: Docs Update and Supersede

## Overview

Update `docs/code-standards.md` to reflect the new title-color contract. Append dated entry to `docs/project-changelog.md`. Confirm the superseded plan (`260527-1833-hero-kicker-blue-title-gold`) is correctly marked. Mark this plan `status: completed` via `ck plan` CLI.

## Requirements

- Functional: docs accurately describe the new contract so future PRs / future-self can enforce it without reverse-engineering the source.
- Non-functional: changelog entry follows existing format conventions (date, scope tag, bullet list).

## Architecture

`code-standards.md` already has a "Hero color contract" section (~line 52) describing the Plan-J-reversal state. Replace with the new contract. Add a new "Block title color contract" section listing the tiered rules (large h2 = gradient, mid h2/h3 = solid dark gold, card h3 = ink-blue).

`project-changelog.md` gets a new entry under `## 2026-05-28` heading with bullets covering both scopes.

## Related Code Files

- Modify: `docs/code-standards.md`
- Modify: `docs/project-changelog.md`
- Already-marked: `plans/260527-1833-hero-kicker-blue-title-gold/plan.md` (status: superseded, supersededBy field set — done during plan creation)

## Implementation Steps

1. Update `docs/code-standards.md`:
   - Section "Hero color contract" (~line 52): replace contents with the new contract (kicker = `text-ink-blue`, h1 = `heading-gradient-gold-light`, body = `text-ink-blue` or `text-ink-blue/85`).
   - Add new section "Block title color contract" after the hero section:
     - Large h2 section banners (≥`text-4xl` at any breakpoint) → `heading-gradient-gold-light`
     - Mid h2/h3 sub-headers (`text-2xl`/`text-3xl` base) → `text-brand-gold`
     - Card-level h3 (product/video/character names + menu icon labels, `text-lg`–`text-2xl`) → `text-ink-blue` (UNCHANGED to honor AA at small sizes)
     - Forbidden: pure `text-brand-primary` on cyan/white/cream surfaces — same physics ban as before
   - In "Heading utilities" table, add `.heading-gradient-gold-light` row with usage note.
   - In "Tokens" table, no change (no new tokens added).
2. Update `docs/project-changelog.md`:
   - Add dated entry under (or above) the appropriate heading (follow existing format — check most recent entry for conventions).
   - Bullets:
     - Hero swap: kicker `text-brand-gold` → `text-ink-blue` across 5 components (FullBleedHero, CinematicHero, WatchHero, ComingSoonHero, CharacterDetailHero).
     - Hero h1: `text-navy` → new `.heading-gradient-gold-light` utility across same 5 components.
     - Large h2 sweep: 14 components swapped `text-navy` → `.heading-gradient-gold-light` (full file list in plan).
     - Mid h2/h3 sweep: 6 elements swapped `text-navy` → `text-brand-gold`.
     - Card h3 unchanged: `text-ink-blue` preserved per WCAG AA strict.
     - New CSS utility added to `app/globals.css`: `.heading-gradient-gold-light` (symmetric dark-gold → yellow → dark-gold, no white stops).
     - Supersedes plan `260527-1833-hero-kicker-blue-title-gold` (unimplemented; absorbed here).
3. Verify `plans/260527-1833-hero-kicker-blue-title-gold/plan.md` already has:
   - `status: superseded`
   - `supersededBy: 260528-0525-hero-and-block-title-yellow-gold`
   - Top-of-file banner pointing to this plan
4. Mark each phase completed via `ck plan check <phase-id>` as Phases 1-5 finish (Phase 6 marks itself last).
5. After this phase, optional: run `/ck:journal` to write a session journal entry.

## Success Criteria

- [ ] `docs/code-standards.md` "Hero color contract" rewritten with new tokens
- [ ] `docs/code-standards.md` has a new "Block title color contract" section
- [ ] `docs/code-standards.md` "Heading utilities" table includes `.heading-gradient-gold-light`
- [ ] `docs/project-changelog.md` has dated entry covering both scopes + supersession
- [ ] Superseded plan confirmed marked
- [ ] All 6 phases checked complete via `ck plan check`
- [ ] No stray `text-navy` on hero or banner-title lines anywhere in `components/`

## Risk Assessment

- **Risk:** `code-standards.md` "Audit summary (Plan K)" section may become stale (lists "no violations found" pre-this-plan). **Mitigation:** add a new dated audit row noting that all hero h1s + large h2 banners + mid h2/h3 now follow gold-tier contract; card h3s remain ink-blue.
- **Risk:** Forgetting to update changelog leaves future devs without context for the 4th pivot. **Mitigation:** changelog update is its own success-criteria item — explicit checkbox.
- **Risk:** Future "color X to Y" requests come in cold, triggering pivot #5. **Mitigation:** explicit "Pivot history" note in code-standards section; future change requests must reference the 4-pivot history in the brainstorm/plan before swapping.
