---
phase: 2
title: Component Prop Additions
status: completed
priority: P2
effort: 20m
dependencies:
  - 1
---

# Phase 2: Component Prop Additions

## Overview

Add a single `subDescription?: string` prop to `FeatureBanner` so the Shop section can render a quote-style sub-line under the body. Pack Leader reuses existing blockquote; Newsletter reuses existing `socialProof`. No prop additions needed for those two.

## Requirements

- **Functional:** `FeatureBanner` accepts and renders an optional sub-description with distinct italic styling.
- **Non-functional:** Prop is optional → no existing callers break. Render style matches the "playful, premium, emotionally warm" voice (italic, slightly smaller than body, warm-muted color).

## Architecture

`FeatureBanner` already renders kicker → title → body → CTA inside a 60/40 layout. New `<p>` slot sits between body and CTA button. Italic + slightly muted to mimic a "stamp" or footnote treatment without competing with the body copy.

## Related Code Files

**Modify:**
- `components/home/feature-banner.tsx` — add `subDescription?: string` to props type + render block

**Create / Delete:** none

## Implementation Steps

1. **`components/home/feature-banner.tsx`** — add prop to destructure + types:
   ```tsx
   export function FeatureBanner({
     kicker,
     title,
     body,
     subDescription,
     cta,
     href,
     image,
     imageAlt,
     reverse = false,
   }: {
     kicker?: string;
     title: string;
     body: string;
     subDescription?: string;
     cta: string;
     href: string;
     image: string;
     imageAlt: string;
     reverse?: boolean;
   }) { ... }
   ```

2. Render block — insert immediately after the body `<p>` (between body and CTA button):
   ```tsx
   <p className="mt-5 max-w-md text-base text-warm-text md:text-lg lg:text-xl">
     {body}
   </p>
   {subDescription && (
     <p className="mt-4 max-w-md text-sm italic text-warm-muted md:text-base">
       {subDescription}
     </p>
   )}
   <div className="mt-8">
     <Button href={href} size="lg" variant="primary">
       {cta}
     </Button>
   </div>
   ```

   Style rationale: `text-sm md:text-base` (smaller than body's `text-base md:text-lg lg:text-xl`), `italic` (matches quote-stamp tone in user spec like `"Warning: May cause..."`), `text-warm-muted` (subdued vs body).

## Success Criteria

- [ ] `FeatureBanner` compiles with new prop type
- [ ] Existing callers (none currently pass `subDescription` — only `app/page.tsx` shop banner will in Phase 4) remain valid
- [ ] No layout regression visible when `subDescription` is omitted (conditional render gates the markup)

## Risk Assessment

- **Risk:** Italic + smaller text may clash visually with the bold body. *Mitigation:* `text-warm-muted` + `italic` softens it; tighter `mt-4` keeps it grouped w/ body, not floating. Adjust during visual QA in Phase 5 if needed.
- **Risk:** Newsletter is tempting to also extend with a prop — resist. The user's "sub-description" for Newsletter is literally the existing `socialProof` semantic (numeric pride line below the form). YAGNI.
