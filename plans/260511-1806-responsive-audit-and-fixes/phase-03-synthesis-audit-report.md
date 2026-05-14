---
phase: 3
title: Synthesis & Audit Report
status: completed
priority: P2
effort: 1-2h
dependencies:
  - 1
  - 2
---

# Phase 3: Synthesis & Audit Report

## Overview

Combine Phase 1 (code-static) and Phase 2 (visual) findings into a single comprehensive audit report. Apply severity rubric, group cross-cutting patterns, generate fix-plan recommendations.

Final deliverable: `plans/reports/audit-260511-1806-responsive-full-website.md`.

## Requirements

**Functional**
- Single report consolidates both findings sources
- Severity-tagged: critical / major / minor
- Per-page section with both code-static AND visual findings
- Cross-cutting patterns section
- Touch-target violations table
- Recommended fix-plan groupings (e.g., "overflow fixes", "touch-target fixes")

**Non-functional**
- Report skimmable in ~10 minutes for senior dev
- Each finding actionable (file:line OR screenshot ref + recommended fix)
- Bottom section produces 1-3 concrete fix-plan seeds

## Architecture

Single markdown report file. References screenshots via relative paths into the plan dir. Fix-plan seeds at bottom are structured so they can directly feed `/ck:brainstorm` for follow-up.

## Related Code Files

**Read**
- `plans/260511-1806-responsive-audit-and-fixes/findings-code-static.md`
- `plans/260511-1806-responsive-audit-and-fixes/findings-visual.md`

**Create**
- `plans/reports/audit-260511-1806-responsive-full-website.md`

## Severity Rubric

- **Critical** — Broken layout, content overflow, illegible text, unreachable interactive elements at any covered viewport
- **Major** — Awkward stacking, image focal cropping, touch target <44px, hero failing to fill OR massively over-filling
- **Minor** — Spacing inconsistency, slight breakpoint roughness, cosmetic improvements

## Report Structure

```markdown
# Responsive Audit — Full Website (2026-05-11)

## Methodology
(brief — viewports, pages, tools)

## Per-Page Findings
### / (Home)
  - Critical: ...
  - Major: ...
  - Minor: ...
  - Screenshots: ./260511-1806-responsive-audit-and-fixes/screenshots/home-*

### /shop
...
### /watch
...
(etc, 7 pages)

## Cross-Cutting Patterns
- Pattern 1: ... (affects components X, Y, Z)
- Pattern 2: ...

## Touch-Target Violations
| Component | File | Current | Required |
|-----------|------|---------|----------|

## Fix-Plan Seeds (for follow-up brainstorming)
### Seed 1: "Overflow + horizontal scroll fixes" (3-4 critical items)
### Seed 2: "Touch-target compliance pass" (N major items)
### Seed 3: ... (if applicable)

## Stats
- Total findings: N (X critical / Y major / Z minor)
- Pages with critical issues: list
- Recommended fix order: ...
```

## Implementation Steps

1. Read `findings-code-static.md` (Phase 1 output)
2. Read `findings-visual.md` (Phase 2 output)
3. Merge into per-page sections; deduplicate where the same issue appears in both
4. Apply severity rubric to every finding (escalate visual evidence over code-only when conflicting)
5. Identify cross-cutting patterns (issues affecting 3+ components)
6. Build touch-target violations table
7. Draft 1-3 fix-plan seeds at the bottom
8. Stats summary section
9. Write final report to `plans/reports/audit-260511-1806-responsive-full-website.md`

## Todo List

- [ ] Phase 1 + Phase 2 findings re-read
- [ ] Per-page sections drafted
- [ ] Severity tags applied consistently
- [ ] Cross-cutting patterns identified
- [ ] Touch-target table built
- [ ] Fix-plan seeds drafted
- [ ] Stats summary
- [ ] Report written + saved
- [ ] Verify all screenshot refs resolve

## Success Criteria

- [ ] Single audit report exists at expected path
- [ ] All 7 pages have a section
- [ ] All findings severity-tagged
- [ ] Fix-plan seeds clearly delineated (1-3 seeds)
- [ ] Report file <800 lines (CLAUDE.md `docs.maxLoc` guidance)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Report exceeds 800 lines | Aggressive minor-finding collapse; move detailed enumerations to per-phase findings files (already exist) |
| Findings contradict between code-static and visual | Document conflict; trust visual evidence for severity |
| Fix-plan seeds too vague | Each seed must list 3+ specific findings it addresses |
| Severity calls inconsistent | Re-pass with rubric after first draft to enforce consistency |
