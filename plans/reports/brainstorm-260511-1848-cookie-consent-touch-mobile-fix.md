---
type: brainstorm
date: 2026-05-11
slug: cookie-consent-touch-mobile-fix
status: approved
audit_seed: Seed 1 from audit-260511-1806-responsive-full-website.md
---

# Brainstorm — Cookie Consent: Touch Targets + Compact Mobile

## Problem

Per responsive audit (Seed 1):
- Cookie banner takes 30-40% of mobile viewport on every page first visit
- Decline button: ~32-36px touch target (sub-44px WCAG floor)
- Accept button: ~36-40px touch target (sub-44px floor)
- On /coming-soon/games at 360x640, banner clips hero title

## Solution (Approach B)

Single-file edit to `components/analytics/cookie-consent.tsx`:

1. **Touch targets**: Add `min-h-[44px] inline-flex items-center` to both buttons. Custom inline (NOT shared `<Button>`) because banner is on dark `bg-ink/95` and shared variants are designed for light page backgrounds.
2. **Mobile compact**: Drop mobile vertical stacking → always single-row `flex items-center`. Tighter mobile padding `p-3 md:p-6`. Pulled closer to bottom edge `bottom-2 md:bottom-4` and `inset-x-3 md:inset-x-4`.
3. **Responsive copy** (two-span):
   - Mobile: "ScoutPaw uses cookies for analytics. OK with you?"
   - md+: full original "ScoutPaw uses cookies for anonymous analytics so we can keep making things our pack loves. OK with you?"

## Rejected Approaches

| Option | Why rejected |
|--------|--------------|
| Migrate to shared `<Button>` | All variants designed for light backgrounds; ghost would flash paper-colored on hover over dark banner |
| Touch-target only (no footprint fix) | Doesn't address the >30% mobile viewport dominance, which is the larger UX issue |
| Full edge-anchored slim strip | Bigger visual departure from current cozy-card brand aesthetic |

## Outcomes

- Touch targets: 44×44 ✓
- Mobile footprint: ~80-100px (was ~250px) — ~60% reduction
- Desktop identity preserved
- No mid-text `hidden` spans (clean DOM, two-span approach)

## Effort
~30 min total (edit + verify build/lint/typecheck + manual mobile check via prod screenshot).

## Unresolved Questions
None.
