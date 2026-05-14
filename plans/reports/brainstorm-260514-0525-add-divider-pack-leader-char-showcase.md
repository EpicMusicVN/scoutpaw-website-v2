# Brainstorm — Add CloudDivider Between Pack Leader & CharShowcase

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Add 1 `<CloudDivider />` in `app/page.tsx` between FeaturedPupSpotlight (Pack Leader) and CharacterShowcase. Single-line change.

---

## Locked Decision

Add one divider at the only currently-uncovered transition. Services both sections (Pack Leader: below + above existing; CharShowcase: above + below existing).

## Single Change

`app/page.tsx`:

```tsx
<ScrollReveal>
  <FeaturedPupSpotlight />
</ScrollReveal>

<CloudDivider />   {/* NEW */}

<ScrollReveal>
  <CharacterShowcase />
</ScrollReveal>
```

Total home-page dividers after this: 6.

## Effort

~2m.

## Risk

| Risk | Severity |
|---|---|
| Adds to overall divider count (6 total) — user previously felt 5 was "too busy" with full-width version | Low — contained cluster is much lighter visually; tunable per-instance via `opacity` prop |
| No other | — |

## Out of Scope

Everything else.

## Unresolved Questions

None.
