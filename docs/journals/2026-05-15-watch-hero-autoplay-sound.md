# Watch Hero Autoplay with Sound Planning Session

**Date**: 2026-05-15 15:35 UTC  
**Severity**: Low (enhancement, no blocking issues)  
**Component**: /watch hero video  
**Status**: Planned — ready for implementation

## What Happened

Brainstorm + planning session for enabling autoplay-with-sound on /watch hero video. User requested: "Enable the video sound by default when the page loads." Evaluated technical constraints and settled on design.

## Key Technical Constraint

Browser autoplay policies (Chrome 2018+, Safari 2017+, Firefox 2019+) block audio unless user has gestured. iOS Safari is strictest. **"Sound by default" is impossible without interaction.** Best approach: try unmuted → catch rejection → fall back to muted + show unmute affordance.

## Approved Design

1. **Try optimistic unmute**: Call `video.play()` with `muted=false` on mount
2. **Graceful fallback**: On `NotAllowedError`, set `muted=true` and retry
3. **WCAG 1.4.2**: Always show audio toggle pill
   - Muted state: "Tap for sound" (prominent)
   - Unmuted state: subtle mute icon
4. **No link navigation hijack**: Pill uses `preventDefault()` + `stopPropagation()` to block parent `<Link>` click

## Component Architecture

- **Hero Video** (new Client Component): `components/watch/hero-video.tsx` — handles autoplay, muting, pill control, state
- **Watch Hero** (existing Server Component): `components/watch/watch-hero.tsx` — stays Server, imports Hero Video as child

## Plan Details

Location: `plans/260515-1535-watch-hero-autoplay-sound/`

**3 fast-mode phases**:
1. **Setup** — scaffold component, stub audio logic (~25 min)
2. **Audio Handling** — autoplay → fallback → toggle pill (~50 min)
3. **Tests + Polish** — accessibility, mobile UX, edge cases (~30 min)

**Total**: ~1h 45m

**Brainstorm report**: `plans/reports/brainstorm-260515-1535-watch-hero-autoplay-sound.md`

## Dependencies & Context

- Prior related work completed:
  - `260515-0002-glass-blob-watch-hero-video` ✓
  - `260515-0213-watch-content-newsletter-fix` ✓
- No cross-plan blockers

## Implementation Completed — 2026-05-15 15:35 UTC

**Phase 1** — `components/watch/hero-video.tsx` (~115 lines, Client Component)
- Imperative play() control: omit muted/defaultMuted from JSX, control entirely via ref to avoid React fighting `.muted` toggles. Prevents hydration + reconciler bugs.
- Optimistic unmute on mount → catch `NotAllowedError` → fallback to muted + show pill.
- Audio toggle pill: `preventDefault() + stopPropagation()` cleanly overrides parent `<Link>` navigation.

**Phase 2** — `components/watch/watch-hero.tsx` (6-line diff, Server Component unchanged)
- Swapped `<video>` for `<HeroVideo />`, stayed Server Component. Clean boundary.

**Testing**
- tsc ✓ | lint ✓ | build ✓ (automated checks all pass)
- Manual cross-browser smoke testing handed off to user (no Playwright infra in repo).

**Code Review** — APPROVE_WITH_NITS
- All 3 nits applied: used `cn()` helper, removed redundant `autoPlay` attr, skipped effect cleanup (benign in React 19).

**Docs** — `project-changelog.md` updated by docs-manager.

**Status**: Implementation complete, pending user browser test before commit.

## Key Lesson

Controlling audio state imperatively on muted-by-default video: **don't declare muted in JSX**. Let ref control the imperative `.muted` property. Declaring both creates a race with React's reconciler that can cause hydration mismatches and toggle lag.

## Next Steps

1. User tests video in browser (desktop + iOS Safari)
2. If pass: commit with conventional message
3. Close plan + update roadmap
