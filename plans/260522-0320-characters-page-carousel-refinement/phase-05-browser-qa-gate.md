---
phase: 5
title: Browser QA Gate
status: completed
priority: P1
effort: 2h
dependencies:
  - 4
---

# Phase 5: Browser QA Gate

## Overview

**Blocking gate.** Five prior rebuilds shipped with zero browser renders — this plan is
NOT complete until `/characters` is rendered and verified at three viewports with zero
console errors. This phase is a hard stop, not an optional checklist.

## Requirements

- Functional: verified rendering at desktop 1440, tablet 768, mobile 390.
- Functional: zero console errors / warnings.
- Non-functional: documented evidence (screenshots + written findings in changelog).

## Architecture

QA runs against **local-mode** dev (`.env.local` with empty `NEXT_PUBLIC_R2_BASE_URL`,
set up in Phase 1) so normalized assets render. Use the `chrome-devtools` skill:
`screenshot.js` (per viewport, plus carousel `#meet-the-pack` and `?pup=max` detail) and
`console.js` (error/warn capture). Save to `.claude/chrome-devtools/screenshots/`.

## Verification Checklist

**Desktop 1440:**
- [ ] Characters render large, equal-sized, centered across all 5 cards
- [ ] ≥4 cards visible, ≥3 fully crisp & uncropped
- [ ] Cards = soft glow only — no box / border / gradient rectangle; page bg shows through
- [ ] Edge cards softened but visible (not invisible)
- [ ] Slide transition smooth; no abrupt/jank motion
- [ ] Click card → detail = smooth crossfade, no jump; detail art is a proper hero
- [ ] Back / prev / next flips smooth
- [ ] Vertical rhythm balanced — no cavernous empty bands
- [ ] Title text legible on page background

**Tablet 768:**
- [ ] ~2-3 cards, clean layout, no cropped characters, no overflow

**Mobile 390:**
- [ ] 1 card + peek, character large and centered, no overflow, usable
- [ ] Detail card readable, art not tiny

**All viewports:**
- [ ] Zero console errors AND warnings (`console.js` capture)
- [ ] No layout shift on carousel ↔ detail swap
- [ ] Reduced-motion: animations stilled (toggle `prefers-reduced-motion`)

## Implementation Steps

1. Ensure local-mode dev running (normalized assets visible).
2. Capture screenshots: desktop/tablet/mobile × (carousel + detail).
3. Capture console for each viewport — must be clean.
4. Walk the checklist against screenshots. Any fail → fix in the owning phase, re-render.
5. If a sit/stand pose reads oversized — add a minimal inline nudge (NOT a rebuilt
   tuning system).
6. On full pass: write findings to `docs/project-changelog.md` with specific
   confirmations ("morph smooth", "characters dominant", "console clean"). Update
   `docs/development-roadmap.md`.
7. Restore env: delete the temporary `.env.local`.
8. Hand off: the user uploads the 13 normalized PNGs to R2; commit normalized PNGs +
   code together only after this gate passes.

## Success Criteria

- [ ] Every checklist item above verified against a real render
- [ ] Screenshots saved as evidence
- [ ] Zero console errors/warnings at all three viewports
- [ ] Changelog + roadmap updated with concrete confirmations
- [ ] `.env.local` removed; originals/normalized state clean for commit

## Risk Assessment

- **The historical failure mode is skipping this phase.** Mitigation: it is a named
  blocking phase with dependencies — `/ck:cook` cannot mark the plan done while it is
  pending. Do not mark complete on "looks fine in code".
- **Local-mode misses an R2-only issue** — Mitigation: low risk (assetUrl is the only
  difference); user re-checks once after R2 upload.
