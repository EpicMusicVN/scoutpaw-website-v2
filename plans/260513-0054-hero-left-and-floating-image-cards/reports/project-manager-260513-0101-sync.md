# Sync Report: Hero Left Swap + Floating-Image Pinterest Cards

**Date:** 2026-05-13  
**Plan:** `260513-0054-hero-left-and-floating-image-cards`  
**Status:** ✅ DONE

## Delivery Summary

All 3 phases completed and verified:

| Phase | Work | Status |
|-------|------|--------|
| 1 | Hero glass card position swap: `md:right-12` → `md:left-12`, `lg:right-16` → `lg:left-16` | ✅ Done |
| 2 | Pack cards restructure to Pinterest pin pattern: small centered floating image + full-width text card | ✅ Done |
| 3 | Typecheck + lint validation | ✅ Done |

## Code Changes Verified

**components/home/full-bleed-hero.tsx**
- Glass card positioning swapped right → left (3-character diff)
- Mobile flow (-mt-8 mx-4) unchanged
- All content, copy, styling preserved

**components/home/menu-cards.tsx**
- MenuCard restructured: small centered image card (h-32/md:h-36/lg:h-40 square) floats z-10 on top
- Text card full-width, pulled up via negative margins (-mt-16/md:-mt-[72px]/lg:-mt-20)
- Text padding (pt-24/md:pt-28/lg:pt-32) reserves overlap space
- Coming-soon badge relocates to outer Link wrapper top-right, z-20
- Hover behavior: image lifts + scales, text shadow bumps

**Build Validation**
- `pnpm typecheck`: ✅ Clean
- `pnpm lint`: ✅ Clean

## Documentation Updated

**docs/project-changelog.md**
- Added 2026-05-13 follow-up entry documenting hero left swap + pack cards Pinterest pin restructure
- Linked both changed files with specific class/layout changes

**docs/development-roadmap.md**
- Updated "Hero Glass Card + Pack Cards Restack" milestone with follow-up refinement note
- Documented repositioning logic and new pack card dimensions

## Scope Compliance

No breaking changes. Iterative refinement of prior work on same files (260512-2209, 260512-2338, 260513-0005, 260513-0031 completion). Position-only hero swap; pack card layout inversion preserves Card type and grid behavior.

## Docs Impact

**Status: MINOR**

Changes to changelog (new entry) + roadmap (milestone clarification) only. No codebase overview updates needed.

---

**Success Criteria Met:**
- [x] Hero glass card pinned md:left-12/lg:left-16
- [x] Pack cards: small centered floating image + overlapping text card
- [x] Coming-soon badge z-20 outer wrapper
- [x] Typecheck + lint clean
- [x] Phase files: all success criteria ticked ✅
- [x] Changelog + roadmap synced

**No unresolved questions.**
