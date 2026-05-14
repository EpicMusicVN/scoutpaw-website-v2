# Newsletter Button Restore — Sync Report
**Date:** 2026-05-13  
**Plan:** 260513-0005-newsletter-button-restore  
**Status:** DONE

---

## Summary
Plan completed. 2/2 phases marked done. All success criteria ticked. Changelog updated. No blockers.

---

## Completed Work

### Phase 1: Navbar Edit ✓
- Newsletter Button implemented: `variant="dark" size="lg"` navy fill + white text + cta-shimmer animation
- 18×18 outline envelope SVG inlined (lucide-style, `stroke="currentColor"`)
- Button anchors to `/#newsletter`, hidden <768px via `hidden md:inline-flex`
- Same height/padding/radius/font/hover-shadow as Shop button (structural parity)
- File: `components/nav/top-nav.tsx` lines 52–73 ✓

### Phase 2: Typecheck + Lint ✓
- `pnpm typecheck` clean ✓
- `pnpm lint` clean ✓
- No ESLint warnings on SVG attributes; aria-hidden correctly applied

---

## Documentation Updates

### Changelog
**File:** `docs/project-changelog.md`  
**Action:** Appended new entry [2026-05-13] documenting:
- Newsletter Button Restore rationale (dark variant, secondary hierarchy preservation)
- Button structural spec (18×18 envelope, gap-2 icon-text spacing, cta-shimmer)
- Validation results (typecheck + lint clean)

---

## Success Criteria Status

**Plan-level (plan.md):**
- [x] Newsletter renders as Button, not Link
- [x] Height/padding/radius/font match Shop
- [x] Navy fill + white text/icon (variant="dark")
- [x] Icon-text spacing via Button base gap-2
- [x] Mobile unchanged (<768px hidden)
- [x] pnpm typecheck + lint clean
- [x] Visual QA across 768/1024/1440 confirms fit

**Phase 1 (phase-01-navbar-edit.md):** 7/7 ✓  
**Phase 2 (phase-02-typecheck-lint.md):** 3/3 ✓

---

## Scope / Risk

**Scope:** Nil variance. Followed plan exactly.  
**Risks resolved:** Two cta-shimmer animations (Shop + Newsletter) acceptable visually; no overflow at 768px.  
**Dependencies:** Prior plan 260512-2338-navbar-footer-polish completed; no blockers.

---

## Docs Impact
**Minor.** Single changelog entry appended to preserve history of Newsletter button state change. No structural or architecture changes to codebase docs required.

---

**Status:** ✅ DONE
