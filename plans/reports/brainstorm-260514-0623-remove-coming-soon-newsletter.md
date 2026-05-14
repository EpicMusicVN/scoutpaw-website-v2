# Brainstorm — Remove NewsletterCTA from Coming-Soon Pages

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Direct reversal of the coming-soon NewsletterCTA addition from 22 min ago. Drop NewsletterCTA from `/coming-soon/[slug]` template. Keep the "Back to home" button, place it centered below the hero tagline.

---

## Locked Change

### `app/coming-soon/[slug]/page.tsx`

```tsx
// Before
<>
  <div className="mx-auto max-w-5xl px-4 pt-8 md:px-8 md:pt-12">
    <ComingSoonHero page={page} character={character} />
  </div>

  <NewsletterCTA
    tag={page.newsletterTag}
    footerSlot={
      <Button href="/" variant="outline" size="md">
        ← Back to home
      </Button>
    }
  />
</>

// After
<div className="mx-auto max-w-5xl px-4 pt-8 pb-16 md:px-8 md:pt-12 md:pb-24">
  <ComingSoonHero page={page} character={character} />
  <div className="mt-8 flex justify-center md:mt-12">
    <Button href="/" variant="outline" size="md">
      ← Back to home
    </Button>
  </div>
</div>
```

Changes:
- Drop `<NewsletterCTA>` entirely
- Promote the Back-to-home button out of `footerSlot` and place it directly below `<ComingSoonHero>`
- Wrap in `flex justify-center` for centered alignment
- Add `pb-16 md:pb-24` to the outer container so page has comfortable bottom space before footer
- Drop the React Fragment (no longer needed — single root element)

Also remove unused import: `import { NewsletterCTA } from "@/components/home/newsletter-cta";`

Note: `page.newsletterTag` becomes unused but is part of the `ComingSoonPage` schema; OK to ignore (still valid content data).

---

## Effort

~3m. Single-file edit + import cleanup.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Pages feel too short / sparse without NewsletterCTA | Low | Hero + button + cyan body bg with side clouds + dividers (none on coming-soon currently) + footer make for a complete page. Coming-soon is intentionally minimal per the user's design direction. |
| `page.newsletterTag` orphaned in content schema | None | Schema field still valid; just no longer consumed on this page. Could be reused if NewsletterCTA returns. |
| Affects 5 routes: about, games, activities, top-picks, characters | None | Same template handles all five — single edit. |

## Success Criteria

- `/coming-soon/[slug]` pages render ComingSoonHero + centered "Back to home" button + footer
- No NewsletterCTA on coming-soon pages
- typecheck + lint clean

## Out of Scope

- ComingSoonHero changes (already stripped in prior cook)
- Newsletter tag analytics
- Adding alternate CTAs to coming-soon pages

## Unresolved Questions

None.
