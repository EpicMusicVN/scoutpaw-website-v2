---
phase: 2
title: Browser Screenshot Pass
status: completed
priority: P2
effort: 2-3h
dependencies: []
---

# Phase 2: Browser Screenshot Pass

## Overview

Spin up `pnpm dev` and use `chrome-devtools` skill (Puppeteer, local) to capture 7 viewports × 7 pages = ~49 screenshots. Visual inspection identifies issues invisible to code-static analysis (overflow, image cropping, awkward stacking, hero coverage).

Read-only — no source code changes.

## Requirements

**Functional**
- Dev server running on localhost (default port 3000)
- Screenshots captured for every (page, viewport) pair
- Per-page visual findings recorded with screenshot references

**Non-functional**
- Screenshots stored at `plans/260511-1806-responsive-audit-and-fixes/screenshots/`
- Naming: `{page-slug}-{viewport-label}.png` e.g. `home-360x640.png`
- File size kept reasonable (viewport-only, no full-page; ~80% JPEG quality if needed)

## Architecture

Approach: `chrome-devtools` skill spawns a Puppeteer browser, navigates to each page URL, sets viewport, takes screenshot. Findings recorded in a markdown deliverable.

## Viewports (7)

| Label | W × H | Use case |
|-------|-------|----------|
| 360x640 | 360 × 640 | iPhone SE class |
| 390x844 | 390 × 844 | iPhone 14 class |
| 768x1024 | 768 × 1024 | iPad portrait |
| 1280x800 | 1280 × 800 | Laptop |
| 1440x900 | 1440 × 900 | MacBook Pro 14 |
| 1920x1080 | 1920 × 1080 | Common monitor |
| 2560x1080 | 2560 × 1080 | 21:9 ultra-wide |

## Pages (7)

1. `/` → `home-{viewport}.png`
2. `/shop` → `shop-{viewport}.png`
3. `/watch` → `watch-{viewport}.png`
4. `/coming-soon/games` → `coming-soon-games-{viewport}.png`
5. `/characters/buddy` → `characters-buddy-{viewport}.png`
6. `/privacy` → `privacy-{viewport}.png`
7. `/terms` → `terms-{viewport}.png`

Total: 49 screenshots.

## Visual Inspection Checklist (per page+viewport)

1. Hero coverage — does it fill the viewport per design? Cropping issues?
2. Navbar — collisions, wrapping, hidden items?
3. Content overflow — horizontal scroll appearing?
4. Image focal subject — characters/products visible vs clipped?
5. Card/grid breakpoints — column count appropriate, gaps balanced?
6. Spacing — sections feel proportional, no awkward gaps?
7. Typography — readable at this scale; no overflow lines?
8. CTAs visible without scroll where intended?
9. Footer transitions — gap-free per recent fixes?
10. Touch areas (mobile sizes only) — visible affordances ≥44×44?

## Related Code Files

**Read (visual only)**
- Dev server output of all 7 pages

**Create**
- `plans/260511-1806-responsive-audit-and-fixes/screenshots/*.png` (~49 files)
- `plans/260511-1806-responsive-audit-and-fixes/findings-visual.md`

## Implementation Steps

1. Start dev server in background: `pnpm dev` (background process)
2. Wait for server ready (poll http://localhost:3000)
3. Use `chrome-devtools` skill or `Skill` tool to drive Puppeteer:
   - For each viewport: navigate page, set viewport, screenshot
   - Save to `screenshots/{page}-{viewport}.png`
4. After all captures complete: stop dev server
5. Visual review pass: open each screenshot, apply checklist, record findings
6. Write `findings-visual.md` grouped by page

## Todo List

- [ ] Dev server started, port confirmed
- [ ] Capture all 7 pages × 7 viewports (49 screenshots)
- [ ] Visual review per page applying 10-item checklist
- [ ] Findings written to `findings-visual.md`
- [ ] Dev server stopped
- [ ] Screenshot dir total size <40MB (sanity check)

## Success Criteria

- [ ] 49 screenshots saved with correct naming
- [ ] Visual findings markdown produced
- [ ] Each finding cites screenshot path
- [ ] No source code modifications

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Dev server fails to start | Verify port 3000 free; fall back to alternate port via env |
| Puppeteer/chrome-devtools tool fails | Try `agent-browser` skill as backup; failing that, fall back to manual review of code-static findings only |
| Hydration/SSR mismatch causing console errors | Tolerate at audit-time; note as a finding only if visually impactful |
| Pages with dynamic data (characters, coming-soon) render TODO placeholders | Acceptable for visual audit; document in report that placeholders shown |
| Animations cause inconsistent screenshots | Wait for `domcontentloaded` + small delay (~500ms) before capture |
| 49 PNG files bloat the plan dir | Use viewport-only capture (no full-page); accept ~10-15MB total |
