# Brainstorm — Remove Watch NewsletterCTA + Strip Coming-Soon Card

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Reversal #6 of session (10 min ago we added NewsletterCTA to Watch; now removing). Plus coming-soon hero restyle.

---

## Locked Changes

### 1. `app/watch/page.tsx` — Remove NewsletterCTA + divider

Drop the block added in the prior cook:
```tsx
      // REMOVE THESE LINES:
      <CloudDivider />

      <ScrollReveal>
        <NewsletterCTA tag="watch-newsletter" />
      </ScrollReveal>
```

Also remove `import { NewsletterCTA } from "@/components/home/newsletter-cta";` (no longer used on this page).

Keep `import { CloudDivider }` — still used for other transitions on the page.

After change: SubscribeCard becomes the last section before footer. 4 dividers total on Watch.

### 2. `components/coming-soon/coming-soon-hero.tsx` — Strip card chrome

```tsx
// Before
<section
  className="relative overflow-hidden rounded-[2.5rem] px-6 py-12 text-center md:px-16 md:py-20"
  style={{ backgroundColor: `${character.accentColor}1f` }}
>
  {/* ... character image, eyebrow, h1 (text-4xl/6xl), description (text-lg/xl) ... */}
</section>

// After
<section className="px-4 py-12 text-center md:px-8 md:py-16">
  <div className="relative mx-auto h-48 w-48 md:h-64 md:w-64">
    <Image ... />
  </div>
  <p
    className="mt-4 font-display text-sm font-bold uppercase tracking-widest"
    style={{ color: character.accentColor }}
  >
    Coming Soon
  </p>
  <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-5xl">
    {page.title}
  </h1>
  <p className="mx-auto mt-4 max-w-2xl text-base text-ink/75 md:text-lg">
    {page.tagline}
  </p>
</section>
```

Changes:
- Drop `rounded-[2.5rem]` + `overflow-hidden` + `relative` (no longer a card)
- Drop tinted `backgroundColor` style
- Drop heavy padding `px-6 py-12 md:px-16 md:py-20` → lighter `px-4 py-12 md:px-8 md:py-16`
- Drop `relative overflow-hidden` (no card chrome to contain)
- Title size: `text-4xl md:text-6xl` → `text-3xl md:text-5xl` (softer)
- Description: `text-lg md:text-xl text-ink/80` → `text-base md:text-lg text-ink/75` (softer)
- Character image: unchanged
- "Coming Soon" eyebrow: unchanged (still uses character accent color)

Net: content sits directly on cyan page bg. No card silhouette.

---

## Effort

~5m. Single phase, two files.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Coming-soon page feels under-decorated without the tinted card | Low | NewsletterCTA below (now white card) provides visual weight + structure. Character image + accent eyebrow color carry visual interest. |
| Watch page suddenly ends abruptly at SubscribeCard | Low | SubscribeCard is itself a contained card with shadow — already provides a "page ending" feel. Footer is the natural next stop. |
| Other consumers of ComingSoonHero break | None | Single-purpose component. Only used in `app/coming-soon/[slug]/page.tsx`. |

## Success Criteria

- Watch page no longer renders NewsletterCTA or its CloudDivider
- Coming-soon pages render character image + eyebrow + title + tagline on cyan bg (no card)
- typecheck + lint clean

## Out of Scope

- Other coming-soon page elements (NewsletterCTA below still appears, unchanged)
- Watch page section reordering
- New decoratives

## Unresolved Questions

None.
