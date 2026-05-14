---
type: brainstorm
date: 2026-05-11
slug: responsive-audit-and-fixes
status: approved
next: ck:plan (for audit phase); fix plans created after audit
---

# Brainstorm — Project C: Full Responsive Audit + Fixes

## Problem

Full-website responsive QA across all pages and breakpoints. User-listed concerns: text scaling, overflow, image cropping, hero responsiveness, navbar, card/grid, spacing, button sizing, touch targets, typography, layout consistency. Stated experience goals: premium, clean, cinematic, playful, fully responsive, visually balanced.

## Scope (Decomposed)

This project was originally part of a single user prompt covering Watch redesign + coming-soon gap + responsive QA. Decomposed earlier into three sub-projects:
- **Project A** — Watch redesign + compact channels — ✓ shipped
- **Project B** — Coming-soon footer gap — ✓ shipped
- **Project C** (this) — Full responsive audit + fixes

This brainstorm covers the AUDIT phase only. Fix plans will be created after audit findings.

## Codebase Inventory

- **8 routes**: `/`, `/shop`, `/watch`, `/characters/[slug]`, `/coming-soon/[slug]`, `/privacy`, `/terms`, + layout
- **44 components** across `analytics, characters, coming-soon, home, motion, nav, shop, ui, watch`
- **Stack**: Next.js 15 + React 19 + Tailwind v3
- **Breakpoints** (Tailwind defaults — no override): `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`
- **Custom**: `max-w-hero` container token

## Locked Decisions

| Decision | Choice |
|----------|--------|
| Methodology | Hybrid — code-static pass + browser-driven viewport pass |
| Output | Single comprehensive audit report; separate fix plans created after |
| Page order | High-traffic first: Home → Shop → Watch → Coming-soon → Characters → Privacy → Terms |
| Scope | Responsive + touch-target a11y (44×44 min); no color/ARIA/perf |
| Screenshot tool | `chrome-devtools` skill (Puppeteer, local) |

## Viewports Tested (7)

| Label | Width × Height | Purpose |
|-------|----------------|---------|
| Mobile small | 360 × 640 | iPhone SE class |
| Mobile standard | 390 × 844 | iPhone 14 class |
| Tablet portrait | 768 × 1024 | iPad portrait |
| Laptop | 1280 × 800 | Common laptop |
| Desktop | 1440 × 900 | MacBook Pro 14 |
| Wide desktop | 1920 × 1080 | Common monitor |
| Ultra-wide | 2560 × 1080 | 21:9 monitor |

Small-height concerns proxied by 360×640. Add tactical 1366×600 captures if landscape issues emerge.

## Pages Audited

1. `/` — Home
2. `/shop` — Shop
3. `/watch` — Watch (post-redesign double-check)
4. `/coming-soon/games` — representative
5. `/characters/buddy` — representative
6. `/privacy` — low stakes
7. `/terms` — low stakes

## Audit Workflow

**Phase A — Code-Static** (~2-3h)
- Read every component
- Per-component checklist:
  - Hardcoded pixel widths/heights (`w-[NNNpx]` >400 likely offender)
  - Missing breakpoint prefixes on type/grid
  - Grid patterns missing `grid-cols-1 md:grid-cols-N`
  - Touch targets <44×44px
  - Overflow risks: `whitespace-nowrap`, fixed widths in flex without `min-w-0`
- Output: per-component finding list w/ severity tags

**Phase B — Browser Screenshots** (~1.5-2h)
- `pnpm dev` background
- Puppeteer drives viewport captures: 7 pages × 7 viewports = ~49 screenshots
- Stored in `plans/{plan-dir}/screenshots/`
- Visual inspection: overflow, image cropping, awkward stacking, hero coverage, navbar collisions

**Phase C — Synthesis + Report** (~1-2h)
- Combine A + B findings into single audit report
- Severity rubric:
  - **Critical**: broken layout, content overflow, unreachable controls at any covered viewport
  - **Major**: awkward stacking, image focal cropping, touch <44px, hero failing
  - **Minor**: spacing roughness, cosmetic
- Group fix recommendations to seed follow-up plans

## Deliverables

- **Audit report**: `plans/reports/audit-260511-1806-responsive-full-website.md`
- **Screenshots**: `plans/260511-1806-responsive-audit-and-fixes/screenshots/`
- **Fix recommendations**: grouped by type at end of audit, ready to seed 1-3 follow-up plans

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Code-static audit | 2-3h |
| Browser screenshots + visual review | 2-3h |
| Synthesis + report writeup | 1-2h |
| **Audit total** | **5-8h** |
| Follow-up fix plans | TBD (likely 2-6h each, 1-3 plans) |

## Risks

| Risk | Mitigation |
|------|------------|
| Dev server hangs / Puppeteer fails | Chunk captures; restart between pages |
| Screenshots bloat plan dir | Viewport-size only (no full-page); ~80% JPEG quality |
| Audit produces 100+ issues | Severity rubric enables cherry-pick fixes |
| Audit finds nothing critical | Acceptable — documents healthy state |
| Bundle size budget regressions from fixes | Track per-route bundle deltas in fix plans |

## Out of Scope

- Color contrast / WCAG color checks
- ARIA semantics (handled case-by-case in prior reviews)
- Focus indicator quality
- Performance / Core Web Vitals
- Mobile gesture support (rails already work)

## Success Metrics

- Per-page findings documented at 7 viewports each
- Severity-tagged issue list (critical/major/minor counts)
- 1-3 actionable fix-plan recommendations seeded for follow-up
- Build/lint/typecheck remain green throughout audit (audit itself is read-only)

## Unresolved Questions

None for the audit phase. Fix-plan questions deferred to post-audit.
