# Brainstorm — Shop Hero Migration + Cloud Dividers on Shop & Watch

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Replace StackedHero with FullBleedHero on shop page. Add 4 CloudDividers each on shop + watch pages. Delete unused StackedHero.

---

## Locked Decisions

| # | Item | Decision |
|---|---|---|
| 1 | Shop Hero | Replace `<StackedHero>` with `<FullBleedHero>` (DRY — single hero component) |
| 2 | StackedHero file | Delete after migration |
| 3 | Shop dividers | 4 placements (all section transitions) |
| 4 | Watch dividers | 4 placements (all section transitions) |
| 5 | WatchHero | No changes (user didn't request) |

---

## File-by-File Change Set

### 1. `app/shop/page.tsx` — Replace hero + add dividers

**Hero replacement:**
```tsx
// Before
<StackedHero
  kicker="ScoutPaw Shop"
  description="Plushes, prints, and apparel — every Buy Now opens our Shopify store in a new tab."
  image="/assets/shop/promotion.png"
  imageAlt="Featured ScoutPaw apparel and accessories"
  actions={<>
    <Button href="#products" size="lg" variant="dark">Browse All</Button>
    <Button href="#explore" size="lg" variant="outline">Explore Collections</Button>
  </>}
/>

// After
<FullBleedHero
  kicker="ScoutPaw Shop"
  title="Bring the pack home."
  description="Plushes, prints, and apparel — every Buy Now opens our Shopify store in a new tab."
  image="/assets/shop/promotion.png"
  imageAlt="Featured ScoutPaw apparel and accessories"
  actions={<>
    <Button href="#products" size="lg" variant="dark">Browse All</Button>
    <Button href="#explore" size="lg" variant="outline">Explore Collections</Button>
  </>}
/>
```

**Title rationale:** "Shop the Pack." is already used as the ProductGrid h2 below. Use "Bring the pack home." as hero title to avoid duplication.

**Add dividers between 4 transitions:**
```tsx
<FullBleedHero ... />
<CloudDivider />   {/* 1. Hero → ExploreProducts */}
<ScrollReveal><ExploreProducts /></ScrollReveal>
<CloudDivider />   {/* 2. Explore → ProductGrid */}
<ScrollReveal>
  <section id="products" ...>...</section>
</ScrollReveal>
<CloudDivider />   {/* 3. ProductGrid → AboutShop */}
<ScrollReveal><AboutShop /></ScrollReveal>
<CloudDivider />   {/* 4. AboutShop → Newsletter */}
<ScrollReveal><NewsletterCTA ... /></ScrollReveal>
```

**Imports to update:**
- Remove `import { StackedHero } from "@/components/shop/stacked-hero";`
- Add `import { FullBleedHero } from "@/components/home/full-bleed-hero";`
- Add `import { CloudDivider } from "@/components/ui/cloud-divider";`

### 2. `app/watch/page.tsx` — Add 4 dividers

```tsx
<WatchHero ... />
<CloudDivider />   {/* 1. Hero → VideoRail */}
<ScrollReveal><VideoRail ... /></ScrollReveal>
<CloudDivider />   {/* 2. Rail → ExploreVideos */}
<ScrollReveal><ExploreVideos ... /></ScrollReveal>
<CloudDivider />   {/* 3. Explore → OurChannels */}
<ScrollReveal><OurChannels ... /></ScrollReveal>
<CloudDivider />   {/* 4. Channels → Subscribe */}
<ScrollReveal><SubscribeCard ... /></ScrollReveal>
```

**Imports:**
- Add `import { CloudDivider } from "@/components/ui/cloud-divider";`

### 3. `components/shop/stacked-hero.tsx` — Delete

Unused after migration. Delete the file.

---

## Phased Execution

| Phase | Item | Effort |
|---|---|---|
| P1 | Shop page: replace StackedHero → FullBleedHero + add 4 dividers | 15m |
| P2 | Watch page: add 4 dividers | 5m |
| P3 | Delete `components/shop/stacked-hero.tsx` | 1m |

**Total: ~20m**

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| FullBleedHero's default banner image fallback overrides Shop's promotion image | None | Shop passes explicit `image` prop |
| Shop hero "Bring the pack home." doesn't fit the brand voice | Low | Tunable — single string. User can rename. |
| StackedHero referenced elsewhere | Verify | Grep first; if zero references outside shop/page.tsx, safe to delete. |
| Watch hero unchanged but page now has cloud dividers — feels inconsistent with shop hero rework | Low | Acceptable. User explicitly didn't request WatchHero changes. |
| 4 dividers per page felt "too busy" earlier in session | Low | Contained cluster version is small; ~80-100px each. Tunable per call. |

---

## Success Criteria

- Shop page renders with FullBleedHero (cyan fades, white card, objectPosition 70%)
- StackedHero file deleted; no orphan imports
- 4 CloudDividers visible on shop between sections
- 4 CloudDividers visible on watch between sections
- typecheck + lint + build clean

---

## Out of Scope

- WatchHero changes
- Coming-soon page dividers
- New cloud shape variants
- Footer / layout / SideClouds changes

---

## Unresolved Questions

1. Title text for Shop hero: "Bring the pack home." default. User can override.
