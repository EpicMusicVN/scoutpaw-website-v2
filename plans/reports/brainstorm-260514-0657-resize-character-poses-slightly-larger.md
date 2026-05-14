# Brainstorm — Bump Character Pose Size

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Increase character pose widths ~30% on Newsletter + SubscribeCard. Single-class change × 4 instances.

---

## Change

| Component | Current | New | Increase |
|---|---|---|---|
| Newsletter (golden1 + husky2) | `w-44` (176px) | `w-56` (224px) | +27% |
| SubscribeCard (corgi1 + collie1) | `w-40` (160px) | `w-52` (208px) | +30% |

Heights auto-scale (`h-auto`) preserving 16:9.

Negative-offset nudges to keep anchoring tight to card edges:
- Newsletter: `-left-12 / -right-12` (-48px) → `-left-14 / -right-14` (-56px)
- SubscribeCard: `-left-10 / -right-10` (-40px) → `-left-12 / -right-12` (-48px)

`Image` width/height intrinsic props stay `320×180` (Next.js uses for optimization; not the rendered size).

---

## Effort

~2m. Two class swaps per file × 2 files.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Larger image overlaps card body content | Low | Poses sit at `bottom-X` corners. Card padding is `md:px-12 md:py-14`. Image height (~126px at w-56) fits within bottom decorative zone. |
| Wider image overflows viewport at 1024px breakpoint | Low | Each image extends `-14` (56px) beyond card edge. Card is `max-w-3xl` (768px). 768 + 2×56 = 880px. Comfortable at 1024px viewport with 144px gutter total. |
| Need to bump again next round | Honest | Easy reversal — single class swap. |

## Success Criteria

- Newsletter poses render larger but balanced
- SubscribeCard poses render larger but balanced
- No content overlap, no viewport overflow at ≥lg
- typecheck + lint clean

## Unresolved Questions

None.
