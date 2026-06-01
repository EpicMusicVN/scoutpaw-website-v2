---
title: "Characters Carousel Page"
description: >-
  Redesign /characters as CinematicHero + Embla Focal-Coverflow carousel of the
  5 ScoutPaw pups, with a click-to-expand inline detail card (query-param state,
  framer-motion layoutId morph). Keeps /characters/[slug] pages, retires the
  immersive CharacterScene.
status: completed
priority: P2
branch: "main"
tags:
  - characters
  - carousel
  - ui
blockedBy: []
blocks: []
created: "2026-05-21T00:13:26.284Z"
createdBy: "ck:plan"
source: skill
---

# Characters Carousel Page

## Overview

Replace the immersive full-screen `CharacterScene` on `/characters` with a
premium, cinematic experience: a reused `CinematicHero` above a horizontal
**Focal-Coverflow carousel** (Embla) of the 5 pups. Clicking any card hides the
others and morphs it into a large themed **detail card** (title, subtitle, bio,
quote) — open state tracked via `?pup=<slug>` query param for shareability.
`/characters/[slug]` detail pages stay (SEO/sharing). No content/schema change.

Supersedes the immersive-scene direction (plans `260521-0150`, `260521-0236` —
both completed). Design source: `plans/reports/brainstorm-260521-0655-characters-carousel-page.md`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Setup & Dependencies](./phase-01-setup-dependencies.md) | Complete |
| 2 | [Carousel Coverflow](./phase-02-carousel-coverflow.md) | Complete |
| 3 | [Detail Card & Transition](./phase-03-detail-card-transition.md) | Complete |
| 4 | [Responsive & Accessibility](./phase-04-responsive-accessibility.md) | Complete |
| 5 | [Cleanup & Docs Sync](./phase-05-cleanup-docs-sync.md) | Complete |

## Key Decisions

- Carousel lib: **Embla** (`embla-carousel-react`, ~6kb headless).
- Detail open state: **query param** `?pup=<slug>` via shallow routing.
- Carousel style: **Focal Coverflow** — large center card, dimmed scaled neighbours.
- Hero: reuse **`CinematicHero`** pattern.
- Transition: framer-motion `layoutId` morph (card → detail artwork).

## Key Dependencies

- New npm dep: `embla-carousel-react`.
- Reused components: `CharacterAtmosphere`, `CharacterMotif`, `CharacterQuote`,
  `character-scene-decor`, `character-scene-backdrop`, `getCharacterTheme`,
  `CinematicHero`, `NewsletterCTA`, `ScrollReveal`.
- `useSearchParams()` requires a `<Suspense>` boundary (App Router).

## Dependencies

No cross-plan blockers — prior character plans (`260520-2354`, `260521-0150`,
`260521-0236`) are all `completed`.
