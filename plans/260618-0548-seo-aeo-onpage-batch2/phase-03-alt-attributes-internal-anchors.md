---
phase: 3
title: Alt Attributes & Internal Anchors
status: completed
priority: P2
effort: 2-3h
dependencies:
  - 1
---

# Phase 3: Alt Attributes & Internal Anchors

## Overview
Give every meaningful homepage image a descriptive `alt` (empty `alt=""` only for purely
decorative images), and clean up internal anchor text: de-duplicate reused anchors and shorten
overlong ones — all without changing link destinations.

## Requirements
- Functional: no homepage image reported as "missing alt"; no two internal links share
  identical generic anchor text where it's avoidable; no overlong anchor text.
- Non-functional: accessibility preserved/improved; destinations and `aria-label`s intact.

## Architecture
**Alt audit must be runtime, not static grep.** Static grep is unreliable here because the
homepage renders sub-components (`character-showcase`, `video-grid` pull `character-card` /
`video-card`) and — until Phase 1 lands — the hero double-renders. Enumerate the real offenders
from the rendered DOM:
- Run the site (`next start`), `curl` the homepage, extract `<img>` tags lacking `alt` or with
  empty `alt`. Note: the scan tool counts `alt=""` as "no alt content", so decorative images
  flagged may need a judgment call (keep `alt=""` for true decoration; the finding count of 8
  is the target to drive to zero meaningful-alt gaps).
- Known: `components/home/menu-cards.tsx` uses `alt=""` (decorative card art) — decide keep vs
  describe per image role.
- Likely sources of the 8: character thumbnails, video thumbnails, decorative cloud/art images.

**Anchors:** the homepage repeats commercial CTAs ("Shop the Pack" appears as both a banner CTA
and elsewhere). Audit homepage links for (a) identical anchor text → differentiate (e.g.
"Shop the Pack" vs "Browse calming gear") and (b) overlong anchor text → shorten to a concise
phrase while keeping meaning. Preserve `href` and any `aria-label`.

## Related Code Files
- Modify (alt): homepage component tree as enumerated from rendered DOM, likely incl.
  `components/home/menu-cards.tsx`, `components/watch/video-card.tsx`,
  `components/characters/character-card.tsx`, `components/home/featured-pup-spotlight.tsx`,
  decorative art in `components/ui/*` if rendered with `<img>`.
- Modify (anchors): `components/home/feature-banner.tsx`, `components/home/menu-cards.tsx`,
  `components/nav/footer.tsx`, and any homepage CTA with duplicated/overlong text.

## Implementation Steps
1. After Phase 1, run the site and dump the rendered homepage HTML.
2. List every `<img>` with missing/empty `alt`; classify each as meaningful vs decorative.
3. Add descriptive `alt` to meaningful images at their source component; keep `alt=""` only for
   genuine decoration.
4. List homepage internal anchors; flag duplicated and overlong anchor text.
5. Differentiate duplicated anchors and shorten overlong ones; keep destinations + aria intact.
6. Re-dump HTML and confirm no meaningful image lacks alt and anchors are clean.

## Success Criteria
- [ ] Rendered homepage has no meaningful `<img>` without a descriptive `alt`.
- [ ] Decorative images intentionally use `alt=""` (documented choice).
- [ ] No avoidable duplicate internal anchor text on the homepage.
- [ ] No overlong internal anchor text on the homepage.
- [ ] Link destinations and accessibility labels unchanged.

## Risk Assessment
- **Decorative vs meaningful ambiguity** — wrong call hurts a11y or SEO; default to describing
  unless the image is clearly ornamental.
- **Anchor edits changing UX copy** — keep brand voice; route any user-facing copy changes that
  feel substantive past the user rather than silently rewording.
