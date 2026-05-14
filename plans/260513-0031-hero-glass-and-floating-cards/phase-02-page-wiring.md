---
phase: 2
title: Page Wiring
status: completed
priority: P1
effort: 5m
dependencies:
  - 1
---

# Phase 2: Page Wiring

## Overview

Update `app/page.tsx` to pass the new copy into `FullBleedHero` (kicker / title / description props).

## Requirements

- Functional: New 3-tier copy renders.
- Non-functional: No prop signature change to FullBleedHero — same prop names.

## Architecture

`FullBleedHero` already accepts `kicker`, `title`, `description`. Only the values change.

## Related Code Files

- Modify: `app/page.tsx`

## Implementation Steps

1. Locate the `<FullBleedHero>` invocation (top of HomePage component).

2. Update props:
   ```tsx
   // BEFORE
   <FullBleedHero
     kicker="Welcome to ScoutPaw TV"
     title="Calm sounds for your pup's day."
     description="Visual + musical companions designed to keep the whole pack happy, relaxed, and entertained."
   />

   // AFTER
   <FullBleedHero
     kicker="SCOUTPAW TV"
     title="THE ULTIMATE WORKDAY HANGOUT"
     description="Meet the pack! Buddy and Max are leading the way with calming music and animated adventures designed just for us dogs. Together with Bella, Oscar, and Rocky, we're turning your living room into a musical sanctuary. Relax, listen, and watch—we've got your back while the humans are at work!"
   />
   ```

3. Save.

## Success Criteria

- [x] Kicker reads "SCOUTPAW TV"
- [x] Headline reads "THE ULTIMATE WORKDAY HANGOUT"
- [x] Body matches the new 70-word paragraph exactly
- [x] No TS errors

## Risk Assessment

- **Risk:** Apostrophe in "we're", "we've" — must use straight apostrophe `'` not curly `'` in JSX string or wrap in JSX expression. Straight apostrophes in JSX string literals work fine in React; no escape needed. Verify.
- **Risk:** Em-dash in "Relax, listen, and watch—we've got your back" — em-dash unicode `—` (U+2014) is fine in JSX literal.
