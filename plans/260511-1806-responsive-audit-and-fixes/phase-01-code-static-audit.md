---
phase: 1
title: Code-Static Audit
status: completed
priority: P2
effort: 2-3h
dependencies: []
---

# Phase 1: Code-Static Audit

## Overview

Read every component file under `components/` and identify responsive issues from the source alone. Output: per-component findings markdown stored in the plan dir; feeds Phase 3 synthesis.

Read-only — no source code changes.

## Requirements

**Functional**
- Every component in `components/` (44 files) reviewed
- Per-component findings captured with severity tags
- Cross-cutting patterns identified (e.g., recurring fixed-width offenders)

**Non-functional**
- Findings format consistent (file:line + issue + severity)
- Severity rubric applied: critical / major / minor
- No false positives — verify against current Tailwind breakpoint defaults

## Architecture

Single markdown deliverable: `plans/260511-1806-responsive-audit-and-fixes/findings-code-static.md`. Sections per component dir (analytics, characters, coming-soon, home, motion, nav, shop, ui, watch). Each component entry: file path, observed issues with line refs, severity.

## Code Checklist (per component)

1. **Hardcoded pixel widths/heights** — flag `w-[NNNpx]` or `h-[NNNpx]` >400px (likely doesn't scale)
2. **Missing breakpoint prefixes**:
   - Font sizes: `text-Xxl` without smaller mobile counterpart
   - Grid columns: `grid-cols-N` without `grid-cols-1 md:grid-cols-N` pattern
   - Padding/margin: large `p-NN`/`m-NN` without responsive scaling
3. **Touch targets** — anchors/buttons with `min-h-*` < 44px OR no `min-h-*` set
4. **Overflow risks**:
   - `whitespace-nowrap` inside fixed-width parent (no `truncate` or `min-w-0`)
   - Flex items missing `min-w-0` when child has long content
   - `overflow-x-auto` without `[scrollbar-width:none]` cleanup
5. **Image responsiveness** — `<Image>` without `sizes` prop OR `sizes="100vw"` when constrained
6. **Z-index / stacking** at responsive boundaries (gradient overlays clipping content)

## Related Code Files

**Read (no modification)**
- All 44 files under `components/**/*.tsx`

**Create**
- `plans/260511-1806-responsive-audit-and-fixes/findings-code-static.md`

## Implementation Steps

1. List all components: `Glob "components/**/*.tsx"`
2. Read each file (use Read tool; batch up to ~5 files per pass to keep context lean)
3. Apply checklist; record findings with file:line refs
4. Group findings by component dir in the output markdown
5. Add a "Cross-cutting patterns" section at the end (issues affecting >3 components)

## Todo List

- [ ] Enumerate all 44 component files
- [ ] Read + audit `analytics/*`
- [ ] Read + audit `characters/*`
- [ ] Read + audit `coming-soon/*`
- [ ] Read + audit `home/*`
- [ ] Read + audit `motion/*`
- [ ] Read + audit `nav/*`
- [ ] Read + audit `shop/*`
- [ ] Read + audit `ui/*`
- [ ] Read + audit `watch/*`
- [ ] Cross-cutting patterns section
- [ ] Deliverable: `findings-code-static.md` written

## Success Criteria

- [ ] All 44 components reviewed
- [ ] Findings file exists with severity-tagged entries
- [ ] Cross-cutting patterns documented
- [ ] No source code modifications

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Findings list too long to be actionable | Severity rubric forces prioritization; minor issues collapsed under one summary line |
| Subjective severity calls | Use rubric: critical=broken, major=awkward, minor=cosmetic. Document border-line calls explicitly. |
| Tailwind utility false positives (e.g. `h-[500px]` is fine for hero) | Note context per finding — escalate only when no clear breakpoint variant exists |
