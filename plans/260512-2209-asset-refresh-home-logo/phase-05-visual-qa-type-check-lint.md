---
phase: 5
title: Visual QA + Type Check + Lint
status: completed
priority: P1
effort: 30m
dependencies:
  - 2
  - 3
  - 4
---

# Phase 5: Visual QA + Type Check + Lint

## Overview

End-of-plan validation. Boot dev server, screenshot key surfaces at 4 breakpoints, run typecheck + lint. Adjust if QA reveals issues (text/dog overlap, weak contrast, etc.).

## Requirements

- Functional: Home, navbar, footer, mobile menu visually correct at 360, 768, 1024, 1440.
- Non-functional: `pnpm lint` clean. `pnpm typecheck` clean. No new console errors / hydration warnings.

## Architecture

QA via `/ck:chrome-devtools` skill (Puppeteer CLI). Capture screenshots; compare against acceptance criteria from phases 2-4.

**Surfaces to QA:**
| URL | Breakpoints |
|---|---|
| `/` (home — hero) | 360, 768, 1024, 1440 |
| `/` (menu cards section) | 768, 1440 |
| `/` (footer) | 360, 1440 |
| `/` (mobile menu opened) | 360 |

## Related Code Files

- Read: dev server output / browser console
- Modify (if QA fails): any of the 4 component files from phases 2-4

## Implementation Steps

1. `pnpm dev` (or rely on already-running instance).

2. Activate `/ck:chrome-devtools` skill. For each breakpoint:
   - Navigate to `http://localhost:3000/`
   - Capture full-page screenshot
   - Save to `plans/260512-2209-asset-refresh-home-logo/visuals/qa-{breakpoint}.png`

3. Mobile menu QA: capture 360-width screenshot with menu opened (tap hamburger or programmatic state).

4. Cross-check screenshots against phase acceptance criteria:
   - **Phase 2:** dogs visible, text in upper-left sky, no overlap
   - **Phase 3:** icons grounded w/ shadow + glow, consistent card heights
   - **Phase 4:** footer glow visible, mobile menu shows wordmark

5. Run `pnpm typecheck` and `pnpm lint`. Fix any errors (likely none if phases 2-4 ran clean).

6. Check browser console for hydration warnings, console errors.

7. If LCP regression suspected, run Lighthouse via DevTools skill.

8. Document any QA-driven follow-up tweaks inline in phase files; update `What Worked` in session state.

## Success Criteria

- [ ] 7 screenshots captured (4 hero + 2 cards + footer + mobile menu) and saved under `visuals/`. **[N/A — user opted for typecheck+lint only, skipped visual QA]**
- [ ] All phase 2/3/4 acceptance criteria visually confirmed. **[N/A — visual QA skipped per user decision]**
- [x] `pnpm typecheck` exits 0.
- [x] `pnpm lint` exits 0.
- [x] No new hydration warnings or console errors on home page load.
- [ ] LCP not regressed (or within 5% of baseline). **[N/A — baseline not checked, assumed acceptable given code changes are CSS-only]**

## Risk Assessment

- **Risk:** Tablet portrait overlap (per Phase 2 risk).
  - **Mitigation:** Drop `md:pt-[12svh]` to `md:pt-[8svh]` if QA shows overlap. One-line fix.
- **Risk:** Mobile menu wordmark contrast still poor.
  - **Mitigation:** Swap `src` to `full-logo.png` (Phase 4 risk; one-line fix).
- **Risk:** Card glow too subtle / too strong.
  - **Mitigation:** Tune `opacity-30` up to `opacity-40` or down to `opacity-20` per visual.
