---
phase: 4
title: AEO External Citations
status: completed
priority: P2
effort: 1-2h
dependencies: []
---

# Phase 4: AEO External Citations

## Overview
Satisfy the AEO "2+ external citation links" check by adding a compact, on-brand
"Why calming works" note to the homepage with **two credible outbound links** to authoritative
sources (e.g. peer-reviewed research on music reducing canine stress).

## Requirements
- Functional: homepage contains ≥2 outbound links to distinct credible external domains
  (research publications / industry/veterinary sources), contextually relevant to page content.
- Non-functional: on-brand, unobtrusive copy; links open safely (`rel="noopener noreferrer"`,
  `target="_blank"` consistent with existing external-link convention in the codebase).

## Architecture
Placement: a small note near the video section or within/above the FAQ — the calming-music
theme is the natural bridge to citing research. Reuse existing typography/components; no new
design system.
- Two sources, distinct domains, genuinely authoritative. Candidate themes: studies showing
  music lowers stress/cortisol or barking in kenneled dogs; a recognized veterinary/behavior
  body. **Exact URLs to be confirmed during implementation and surfaced to the user** before
  shipping (must be brand-acceptable + stably hosted).
- Follow the existing external-link pattern (`target="_blank" rel="noopener noreferrer"` — see
  `components/watch/our-channels.tsx`, `components/nav/footer.tsx`).
- Optional AEO bonus: if cheap, reference the sources in JSON-LD `citation` on a WebPage node
  (only if it does not complicate Phase 2's schema — otherwise skip per YAGNI).

## Related Code Files
- Modify: a homepage component near the video/FAQ area, e.g. `app/(frontend)/page.tsx` plus a
  small presentational component, or extend `components/home/faq-section.tsx` /
  `components/home/video-grid.tsx` intro slot. Prefer a tiny dedicated component
  (`components/home/calming-science-note.tsx`) for clarity and to keep files small.
- Content source: copy may come from the content team; wire the structure + links now.

## Implementation Steps
1. Draft a 1–2 sentence "why calming content works" note in brand voice.
2. Select 2 credible sources (distinct domains); confirm URLs with the user before shipping.
3. Add a small component rendering the note + 2 outbound links using the existing external-link
   convention; place near video/FAQ on the homepage.
4. Verify both links resolve and use safe `rel`.
5. View-source: confirm ≥2 outbound external-domain links present in homepage HTML.

## Success Criteria
- [ ] Homepage HTML contains ≥2 outbound links to ≥2 distinct credible external domains.
- [ ] Links contextually relevant, on-brand, and use `rel="noopener noreferrer"`.
- [ ] Source URLs confirmed acceptable with the user.

## Risk Assessment
- **Link rot / weak sources** — pick stable, reputable hosts; confirm with user.
- **Tone mismatch** — the note must read as brand warmth, not academic filler; keep it short.
- **Unconfirmed URLs** — do not ship placeholder/guessed citation URLs; gate on user confirm.
