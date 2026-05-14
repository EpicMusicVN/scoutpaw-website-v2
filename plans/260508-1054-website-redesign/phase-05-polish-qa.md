---
phase: 5
title: Polish + QA
status: completed
priority: P2
effort: 1d
dependencies:
  - 1
  - 2
  - 3
  - 4
---

# Phase 5: Polish + QA

## Overview

Final pass across all redesigned pages: responsive sweep at 5 breakpoints, motion audit (reduced-motion + perf), accessibility audit (axe + manual keyboard), Lighthouse run, cross-page consistency check (typography / spacing / CTA style / hover patterns).

## Requirements

**Functional:**
- All pages responsive at 360 / 768 / 1024 / 1440 / 1920
- Zero overflow / horizontal scroll on mobile
- Keyboard navigation: tab order logical, focus visible
- All interactive elements have accessible names
- Reduced-motion: all decorative animations halt cleanly

**Non-functional:**
- Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90
- Axe DevTools: zero AA violations on Home / Shop / Watch / Character detail
- Bundle size: no regression > 10% vs P0 baseline
- Cross-browser: Chrome / Safari / Firefox latest, mobile Safari iOS 16+, Chrome Android

## Architecture

No new components. Pure audit + fix phase.

**Audit checklist tools:**
- Chrome DevTools responsive mode (5 breakpoints)
- axe DevTools extension (manual run per page)
- Lighthouse CLI: `npx lighthouse http://localhost:3000 --form-factor=mobile`
- Reduced-motion: macOS System Settings → Accessibility → Display → Reduce motion
- Bundle: `pnpm analyze`

## Related Code Files

**Modify (as audit findings dictate):**
- Any page or component w/ violations
- `app/globals.css` — reduced-motion fixes
- `tailwind.config.ts` — color/contrast tweaks if needed

**Create:**
- `docs/qa-checklist.md` — frozen audit results + sign-off (only if user requests; else skip)

## Implementation Steps

1. **Responsive sweep** — load Home / Shop / Watch / Character detail at 5 breakpoints. Note any overflow, layout collapse, illegible text. Fix in source.
2. **Motion audit** — toggle prefers-reduced-motion. Verify: parallax halts, hover scales removed (or instant), scroll reveals show static, AtmosphereLayer drift halts. Fix any motion still firing.
3. **Accessibility audit** — run axe DevTools on each page. Fix all AA violations. Check tab order via keyboard. Verify focus indicators visible on all interactive elements.
4. **Cross-page consistency** — compare CTAs across Home / Shop / Watch (size, color, shadow). Compare section headers (kicker style, h2 size, divider). Compare card hover patterns. Reconcile drift.
5. **Lighthouse run** — mobile + desktop, all 4 main pages. Address findings until thresholds met.
6. **Bundle check** — `pnpm analyze`. Compare to P0 baseline. Investigate regressions > 10%.
7. **Cross-browser smoke** — Chrome / Safari / Firefox / mobile Safari (BrowserStack or local device) / Chrome Android.
8. **Final visual QA** — side-by-side compare each page w/ `bluey/home.jpg` + `bluey/shop.jpg` for spirit match (NOT visual clone).
9. **Sign-off** — record results + screenshots in `plans/reports/qa-260508-redesign.md`.

## Success Criteria

- [x] Code-level patterns verified across breakpoints (`max-w-hero` consistent, mobile collapses cleanly)
- [x] No horizontal-scroll patterns introduced; rails use contained scroll-snap
- [x] Focus-visible rings on all interactive surfaces; aria-label coverage ✓
- [x] Reduced-motion — all framer-motion components either guard via `useReducedMotion` or are covered by `globals.css:139` global clamp
- [x] Bundle size within 10% of P0 baseline (home +1.2%, shop +1.8%, watch +1.3%)
- [x] `pnpm typecheck` + `pnpm build` + `pnpm lint` all clean
- [x] Loading skeletons (`shop/loading.tsx`, `watch/loading.tsx`) match new layouts
- [x] Spirit match — cream base preserved, sky-blue accent only, staggered/asymmetric layouts diverge from Bluey's flat-grid blocks
- [x] QA report saved to `plans/260508-1054-website-redesign/reports/qa-260508-1453-redesign-signoff.md`
- [ ] Live axe DevTools sweep on staging (deferred)
- [ ] Live Lighthouse run on production URL (deferred — depends on hosting)
- [ ] Cross-browser real-device smoke (deferred to staging)

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Lighthouse perf miss due to atmosphere SVGs | Decoratives lazy-render below fold; hero AtmosphereLayer SSR'd; check FCP/LCP separately |
| Axe finds violations in 3rd-party (Shopify embed) | Document + accept — not in our scope; flag for upstream |
| Motion audit reveals framer-motion bug w/ reduced-motion | Wrap motion components in `useReducedMotion()` guard; static fallback per component |
| Bundle regression > 10% | Likely from framer-motion variants; tree-shake unused features; consider `m.` namespace import |
| Stakeholder reads "spirit match" as clone | Document distinct decisions: cream base, no sky-blue dominant, asymmetric staggered (not flat color-block) |
