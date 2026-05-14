# Brainstorm — Unify NewsletterCTA Copy Across All Pages

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Standardize "Join the Pack / Become a VIP" copy across all NewsletterCTA usages. Add NewsletterCTA to Watch page. Lift defaults into the component itself for DRY.

---

## Locked Decisions

| # | Item | Decision |
|---|---|---|
| 1 | Standardize copy | "Become a VIP" + standard description + 20,000+ social proof |
| 2 | Coming-soon copy | Use unified copy (drop contextual "Be the first to know") |
| 3 | Watch page | Add `<NewsletterCTA />` BELOW SubscribeCard (keep YouTube subscribe + add email opt-in) |
| 4 | DRY strategy | Update default param values in component; callers omit copy props |

---

## File-by-File Change Set

### 1. `components/home/newsletter-cta.tsx` — Update defaults

```tsx
// Before
export function NewsletterCTA({
  tag = "home-newsletter",
  heading = "Join the Pack.",
  subheading = "Gentle updates from ScoutPaw — new episodes, activities, the occasional treat. No spam, ever.",
  socialProof = "Already 1,200+ pet parents in the family.",
  footerSlot,
}: ...)

// After
export function NewsletterCTA({
  tag = "home-newsletter",
  heading = "Become a VIP",
  subheading = 'Get a front-row seat to the pack! We\'ll send new episodes, cozy activities, and the occasional "digital treat" straight to your inbox. No barks, no spam, just love.',
  socialProof = "Already 20,000+ pet parents in our family!",
  footerSlot,
}: ...)
```

### 2. `app/page.tsx` — Remove redundant explicit copy

Currently passes `heading`, `subheading`, `socialProof` explicitly (matches the new defaults). Can be omitted for cleaner code:
```tsx
// After
<ScrollReveal>
  <NewsletterCTA />
</ScrollReveal>
```

(Default `tag="home-newsletter"` covers it.)

### 3. `app/shop/page.tsx` — Remove custom copy

```tsx
// Before
<NewsletterCTA
  tag="shop-newsletter"
  heading="Stay in the loop."
  subheading="Sign up for new drops, restocks, and shop-only exclusives — straight from the pack."
/>

// After
<NewsletterCTA tag="shop-newsletter" />
```

### 4. `app/coming-soon/[slug]/page.tsx` — Remove custom copy, keep footerSlot

```tsx
// Before
<NewsletterCTA
  tag={page.newsletterTag}
  heading="Be the first to know"
  subheading="We'll send a gentle wag your way the moment this corner of ScoutPaw is ready."
  footerSlot={<Button href="/" variant="outline" size="md">← Back to home</Button>}
/>

// After
<NewsletterCTA
  tag={page.newsletterTag}
  footerSlot={<Button href="/" variant="outline" size="md">← Back to home</Button>}
/>
```

### 5. `app/watch/page.tsx` — Add NewsletterCTA below SubscribeCard

```tsx
import { CloudDivider } from "@/components/ui/cloud-divider";
import { NewsletterCTA } from "@/components/home/newsletter-cta";

// ...

{/* Subscribe CTA */}
<ScrollReveal>
  <SubscribeCard youtubeUrl={youtubeUrl} />
</ScrollReveal>

<CloudDivider />

<ScrollReveal>
  <NewsletterCTA tag="watch-newsletter" />
</ScrollReveal>
```

---

## Phased Execution

| Phase | Item | Effort |
|---|---|---|
| P1 | Update NewsletterCTA defaults | 2m |
| P2 | Strip redundant copy from home/shop/coming-soon callers | 3m |
| P3 | Add NewsletterCTA + CloudDivider to Watch page | 5m |

**Total: ~10m**

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Coming-soon contextual copy ("Be the first to know") was semantically aligned with the page's "not ready" state | Low | User explicitly approved unifying. Page still has its own ComingSoonHero copy that handles the "not ready" message. |
| Watch page now has TWO CTAs (Subscribe + Newsletter) — feels CTA-heavy | Medium | Two different goals: YouTube subscribe vs email list. Spaced via CloudDivider, distinct visual treatment. Acceptable per user direction. |
| `tag` prop must still be unique per page for analytics | Verified | All callers pass `tag` explicitly. Defaults to `"home-newsletter"` for home. |
| Quote escaping in default subheading (contains `"digital treat"`) | Low | Use single-quote string literal (TS allows) or escaped double-quotes. |

---

## Success Criteria

- All NewsletterCTA renders show "Become a VIP" heading + standard description + 20,000+ social proof
- Each caller passes only `tag` (and `footerSlot` for coming-soon)
- Watch page shows SubscribeCard + CloudDivider + NewsletterCTA
- typecheck + lint clean

---

## Out of Scope

- SubscribeCard changes
- New analytics events
- Layout/styling adjustments to NewsletterCTA itself

---

## Unresolved Questions

None.
