---
title: Characters Page Immersive Redesign
description: >-
  Replace the /characters hero + carousel with a code-built immersive scene of
  all 5 ScoutPaw pups (clickable, CSS-hover only, always-visible labels). Add a
  signature per-character atmosphere layer + an integrated YouTube channel badge
  to each detail page.
status: completed
priority: P2
branch: main
tags:
  - characters
  - ui
  - page
  - immersive
blockedBy: []
blocks: []
created: '2026-05-20T18:56:16.422Z'
createdBy: 'ck:plan'
source: skill
---

# Characters Page Immersive Redesign

## Overview

Rebuild `/characters` as a custom **immersive scene** — all 5 pups composited
across a code-built (gradient + SVG) cinematic backdrop, each a clickable link
to its detail page with CSS-only hover (glow/scale/float/shadow, same pose) and
an always-visible name label. Deepen each **detail page** with one signature
atmospheric layer per pup and an integrated YouTube channel badge near the title.

No new image assets, no client JS. Copy + per-character themes already live in
`content/characters.json` and `lib/content/character-themes.ts`.

Authoritative design spec:
`plans/reports/brainstorm-260521-0150-characters-immersive-redesign.md`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Theme Atmosphere Extension](./phase-01-theme-atmosphere-extension.md) | Completed |
| 2 | [Immersive Scene Page](./phase-02-immersive-scene-page.md) | Completed |
| 3 | [Detail Page Signature Layers](./phase-03-detail-page-signature-layers.md) | Completed |
| 4 | [Validation and Docs](./phase-04-validation-and-docs.md) | Completed |

Sequential: P1 extends the theme model (foundation for P2 + P3). P2 builds the
new `/characters` scene + removes hero/carousel. P3 enhances detail pages. P4
validates the build + reconciles docs.

## Key Decisions (from brainstorm, user-approved)

- **Code-built scene** — gradients + inline SVG (clouds/stars/notes/shapes). No
  new image assets. Characters = existing transparent pose PNGs layered on top.
- **Medium detail-page uniqueness** — shared template + ONE signature atmosphere
  layer per pup (nightlight / motion / ribbons / blueprint / ridge).
- **Always-visible name labels** on the scene (touch + a11y friendly).
- **Tall natural-height scene** — generous fixed-aspect stage, not 100vh;
  `NewsletterCTA` stays below.
- **Channel badge near title AND** keep the existing bottom callout.
- **Responsive** — md+ art-directed absolute layout; mobile staggered vertical
  flow. One set of 5 figures, two positioning maps, no image duplication.

## Dependencies

No cross-plan dependencies. Prior plan `260520-2354-characters-page` (iteration
#1, alternating sections) is fully `completed` and superseded by this rebuild.

## Out of Scope

- New character image assets (reuse existing `characters-position/*` poses).
- JSON-LD structured data (semantic HTML + metadata only — YAGNI).
- Home page `character-showcase` / `featured-pup-spotlight` layout changes.
- Copy or theme-palette changes (already finalized in prior iterations).
