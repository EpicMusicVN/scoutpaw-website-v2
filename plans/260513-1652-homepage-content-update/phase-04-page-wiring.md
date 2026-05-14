---
phase: 4
title: Page Wiring
status: completed
priority: P2
effort: 15m
dependencies:
  - 2
  - 3
---

# Phase 4: Page Wiring

## Overview

Update `app/page.tsx` to pass the new copy strings into Hero, FeatureBanner (Shop), and NewsletterCTA. Hero kicker preserved; FeatureBanner gets new title/body/`subDescription`; NewsletterCTA gets new heading/subheading/socialProof.

## Requirements

- **Functional:** Page renders verbatim user copy for all three sections.
- **Non-functional:** No prop rename churn; uses the optional `subDescription` prop added in Phase 2.

## Architecture

`app/page.tsx` is a server component that composes home sections by passing literal props. Three of the rendered sections take inline copy from this file (Hero, FeatureBanner, NewsletterCTA); the other four (MenuCards, FeaturedPupSpotlight, CharacterShowcase, VideoGrid) read their copy internally from data or hardcoded literals — those are handled in Phase 3, no changes here.

## Related Code Files

**Modify:**
- `app/page.tsx`

**Create / Delete:** none

## Implementation Steps

1. **Hero block** — replace `title` + `description` props (keep `kicker="SCOUTPAW TV"`):
   ```tsx
   <FullBleedHero
     kicker="SCOUTPAW TV"
     title="Discover a happier world of puppies: Scoutpaw TV"
     description="Max, Buddy, and their friends have curated a calming space with soothing music and select gear, designed for your pup's happiness and relaxation"
   />
   ```

2. **FeatureBanner (Shop the Pack)** — update kicker (keep `"Shop the Pack"` literal), title, body, add `subDescription`:
   ```tsx
   <FeatureBanner
     kicker="Shop the Pack"
     title="UNBOX THE MAGIC"
     body="Ready to bring a piece of the pack home? From high-quality dog essentials to exclusive gear for their humans, our shop is packed with treasures you won't find anywhere else."
     subDescription={'"Warning: May cause extreme tail-wagging and serious \'Add to Cart\' energy."'}
     cta="Shop the Pack"
     href="/shop"
     image="/assets/shop/promotion.png"
     imageAlt="Featured ScoutPaw products"
   />
   ```
   Note: `subDescription` uses single-quote literal because the string contains both `"` curly quotes and `'` apostrophe. Wrap with `{...}` and `'..."` outer / escape inner as shown — or use a `const` above the JSX to keep readable.

3. **NewsletterCTA** — replace `heading`, `subheading`, `socialProof`:
   ```tsx
   <NewsletterCTA
     heading="Become a VIP (Very Important Pup)"
     subheading={"Get a front-row seat to the pack! We'll send new episodes, cozy activities, and the occasional \"digital treat\" straight to your inbox. No barks, no spam, just love."}
     socialProof="Already 20,000+ pet parents in our family!"
   />
   ```
   Newsletter does NOT get a new prop — the `socialProof` field is the natural home for the user's "sub-description" line.

4. **Smart-quote handling** — user copy uses U+2019 `'` and U+201C/D `" "` (curly quotes). Preserve exact chars. For JSX prop strings, prefer `{"..."}` braced form with escaped `\"` if the string contains both single + double quotes, or extract to a const above the return:
   ```tsx
   const heroDescription = "Max, Buddy, and their friends have curated a calming space with soothing music and select gear, designed for your pup's happiness and relaxation";
   ```
   Improves readability over inline-escaped strings.

## Success Criteria

- [ ] `pnpm typecheck` clean (no prop-shape mismatches)
- [ ] Page renders all three sections with verbatim copy
- [ ] No console warnings about unescaped HTML entities
- [ ] Hero, Shop, Newsletter visually match brand spec at md + lg breakpoints (manual check in Phase 5)

## Risk Assessment

- **Risk:** Long Hero title may wrap awkwardly on tablet sizes. *Mitigation:* `font-display text-3xl md:text-4xl lg:text-5xl` already supports word-wrap; verify in Phase 5 visual QA.
- **Risk:** Newsletter heading "Become a VIP (Very Important Pup)" has parentheses — may break line at `(` on narrow viewports. *Mitigation:* No `<br>` injection per brand voice; allow natural wrap.
- **Risk:** Inline string escaping is error-prone with mixed quote styles. *Mitigation:* Extract to typed `const` declarations if the inline form gets ugly.
