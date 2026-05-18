---
title: Watch Hero Autoplay With Sound
description: >-
  Optimistic autoplay-with-sound + graceful muted fallback + persistent audio
  toggle pill on /watch hero video
status: done
priority: P2
branch: main
tags:
  - watch
  - hero
  - video
  - autoplay
  - audio
  - a11y
blockedBy: []
blocks: []
created: '2026-05-15T08:42:23.207Z'
createdBy: 'ck:plan'
source: skill
---

# Watch Hero Autoplay With Sound

## Overview

Enable sound by default on `/watch` hero video. Browser autoplay policies block audio without user gesture, so strategy is: attempt unmuted `play()` on mount; on rejection, fall back to muted autoplay + show a prominent "Tap for sound" pill. Pill is also always present when sound is on (as a mute toggle) for WCAG 1.4.2 compliance.

Brainstorm: [`plans/reports/brainstorm-260515-1535-watch-hero-autoplay-sound.md`](../reports/brainstorm-260515-1535-watch-hero-autoplay-sound.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Implement HeroVideo client component](./phase-01-implement-herovideo-client-component.md) | Completed |
| 2 | [Wire HeroVideo into WatchHero](./phase-02-wire-herovideo-into-watchhero.md) | Completed |
| 3 | [Smoke test and a11y verify](./phase-03-smoke-test-and-a11y-verify.md) | Completed |

## Dependencies

None. Both related prior plans (`260515-0002-glass-blob-watch-hero-video`, `260515-0213-watch-content-newsletter-fix`) are `done`.

## Out of Scope

- Analytics on unmute event
- localStorage preference memory
- Volume slider
- Changes to non-hero videos or other pages
