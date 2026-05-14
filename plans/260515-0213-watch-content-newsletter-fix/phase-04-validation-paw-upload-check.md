---
phase: 4
title: Validation + paw upload check
status: completed
priority: P2
effort: 20m
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Validation + paw upload check

## Overview

Standard validation (typecheck + lint + visual QA) plus a curl-based smoke test for the new newsletter API and a R2 HEAD check for the user-required `paw-tile.svg` upload.

## Requirements

**Functional**
- `pnpm typecheck` exits 0.
- `pnpm lint` exits 0.
- `POST /api/newsletter` returns 200 for valid email + 400 for invalid.
- `/watch` shows 6 channels in Our Channels rail.
- Community Choice rail shows real YouTube thumbnails (not banner placeholder).
- Watch Hero has no duration badge.
- Empty-category filter doesn't break layout.
- `paw-tile.svg` HEAD check on R2 — 200 (user has uploaded) or final report flags as pending.

## Architecture

Static checks + runtime smoke + R2 verification.

## Implementation Steps

1. `pnpm typecheck`. Halt on errors.
2. `pnpm lint`. Halt on errors.
3. Boot dev server (`pnpm dev`).
4. **Newsletter smoke test** (curl):
   ```bash
   # Valid
   curl -s -X POST http://localhost:3000/api/newsletter \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","tag":"home-newsletter"}'
   # Expect: {"ok":true}

   # Invalid
   curl -s -X POST http://localhost:3000/api/newsletter \
     -H "Content-Type: application/json" \
     -d '{"email":"not-an-email"}'
   # Expect: {"error":"..."}

   # Honeypot
   curl -s -X POST http://localhost:3000/api/newsletter \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","hp":"bot"}'
   # Expect: {"ok":true} silently
   ```
5. **Visual QA** at 375 / 1440 viewports:
   - `/` newsletter form submit → success state renders.
   - `/watch`: hero has no duration badge; Community Choice + Explore Videos render real thumbnails for the 6 real-ID videos; Our Channels rail shows 6 cards.
   - `/watch` ExploreVideos: click "Cats" or "Product Reviews" → no broken grid.
6. **R2 paw-tile check**:
   ```bash
   curl -sI https://images.scoutpaw.tv/assets/patterns/paw-tile.svg | head -1
   ```
   - 200 → ✅ user uploaded.
   - 404 → flag in final report: user still needs to upload `public/assets/patterns/paw-tile.svg` to R2 bucket key `assets/patterns/paw-tile.svg`.

## Success Criteria

- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm lint` exits 0
- [ ] Newsletter curl test passes (200 / 400 / honeypot)
- [ ] Watch hero no duration badge
- [ ] Community Choice thumbnails resolve
- [ ] Our Channels has 6 entries
- [ ] Empty-category filter clean
- [ ] R2 paw-tile status reported (200 or pending user upload)

## Risk Assessment

- **User hasn't uploaded paw-tile.svg yet** — flagged in final report. Not a code blocker.
- **Dev server not booted for curl tests** — script halts; need to start `pnpm dev` first.
- **YouTube thumbnail latency** — first request may take 200-500ms; not a regression.
