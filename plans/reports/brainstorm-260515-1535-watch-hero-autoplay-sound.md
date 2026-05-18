---
type: brainstorm
date: 2026-05-15
time: 15:35
slug: watch-hero-autoplay-sound
status: approved
---

# Brainstorm — Watch Page Hero Video: Autoplay With Sound

## Problem Statement

Enable audio on the `/watch` page hero video so sound plays by default when the page loads.

Current state (`components/watch/watch-hero.tsx:46-57`):
```
<video src={...} poster={...} autoPlay muted loop playsInline preload="metadata" />
```
Video is wrapped in a `<Link>` to YouTube. Click anywhere on video navigates away.

## Critical Constraint

**Browser autoplay policies block audio without user gesture.** Applies to all modern browsers since 2018 (Chrome), 2017 (Safari), 2019 (Firefox). Removing `muted` results in either: video doesn't play at all (Chrome/Firefox), or plays muted anyway (fallback). iOS Safari enforces strictly.

→ "Sound by default" cannot mean "guaranteed sound on first load." Best we can do: try sound, fall back gracefully.

## Approaches Evaluated

| # | Approach | Verdict |
|---|----------|---------|
| 1 | Remove `muted`, hope for the best | **Reject.** Video won't play at all in most browsers on first visit. |
| 2 | Click-to-play with sound (no autoplay) | Loses cinematic loop. User chose to keep autoplay flow. |
| 3 | Unmute on first page gesture | Hostile UX (surprise audio when user scrolls). |
| 4 | Optimistic sound + fallback to muted+toggle | **Selected.** Best-effort sound, no broken state, accessible. |
| 5 | Visible unmute toggle only (always start muted) | Safer but ignores user intent for sound ASAP. |

User decisions:
- True goal: sound ASAP, accept fallback
- Click behavior: keep YouTube link, add unmute button with `stopPropagation`
- Mobile: same approach as desktop (no special-casing)

## Final Solution

**Optimistic autoplay-with-sound + graceful fallback + persistent audio toggle pill.**

### State machine

```
mount
  ↓ try play() with muted=false
  ├─ resolves → "sound-on"  → small mute icon pill (bottom-right)
  └─ rejects  → muted=true, retry play()
                ↓
                "muted" → prominent "Tap for sound" pill (bottom-right)

user clicks pill
  ├─ "muted"    → muted=false, play() → "sound-on"
  └─ "sound-on" → muted=true            → "muted"
```

### Component split

- **New:** `components/watch/hero-video.tsx` — Client Component (~80 lines)
  - `useRef<HTMLVideoElement>`, `useState<'sound-on' | 'muted'>`, `useEffect` for play attempt
  - Renders `<video>` + absolutely-positioned `<button>` toggle pill
- **Modified:** `components/watch/watch-hero.tsx` — stays Server Component
  - Replace lines 46–57 (video JSX) with `<HeroVideo featured={featured} />` and props
  - Preserve `<Link>` wrapper, badges, hover transforms, image fallback path

YAGNI rationale: scope client interactivity to just the video. Hero text, CTAs, badges stay SSR.

### Audio toggle pill

- Position: `absolute bottom-4 right-4` inside the `<Link>`
- Click handler: `e.preventDefault(); e.stopPropagation();` → toggle mute → `play()` if needed
- Two visual states:
  - **muted**: brand-coral background, "🔊 Tap for sound" label, subtle pulse (respects `prefers-reduced-motion`)
  - **sound-on**: white/70 background, mute icon only — present for WCAG 1.4.2
- `<button type="button">`, focus ring, `aria-label`, `aria-pressed`

### Edge cases

| Scenario | Behavior |
|---|---|
| iOS Safari strict block | Falls back to muted + pill; tap (gesture) unmutes |
| Chrome with high MEI | Plays with sound immediately; mute pill present for control |
| User scrolls past | Video continues (unchanged) |
| Click video body | YouTube link fires (unchanged) |
| No `videoSrc` | Image fallback path unchanged |
| `prefers-reduced-motion` | Pulse animation disabled |

## Implementation Considerations

### Files

- **Create:** `components/watch/hero-video.tsx`
- **Edit:** `components/watch/watch-hero.tsx` (~10 line swap)

### Dependencies

- No new packages
- Reuses existing: `assetUrl`, `Image`, Tailwind classes

### Risks

- Chrome MEI surprise on repeat visitors → mitigated by always-visible mute pill
- iOS may ignore programmatic `muted=false` between play attempts on same tick → handled via gesture-bound retry inside click handler
- `stopPropagation` on pill must not break Link click target → standard pattern, low risk

### Out of scope

- Analytics on unmute event
- localStorage preference memory
- Volume slider
- Changes to non-hero video components
- Changes to other pages

## Success Criteria

- Desktop Chrome (warm MEI): sound on page load
- Desktop Chrome (cold): muted autoplay + prominent unmute pill; 1 tap → sound
- iOS Safari: muted autoplay + visible pill; 1 tap → sound
- Click anywhere on video except pill → opens YouTube (unchanged)
- Pill keyboard-focusable, `aria-pressed` reflects state
- No regression to hero text, badges, hover transforms, image fallback

## Validation Methods

- Manual: load `/watch` in cold Chrome incognito → expect muted + pill visible
- Manual: load `/watch` in iOS Safari simulator → expect muted + pill visible
- Manual: click pill → expect sound on
- Manual: click video body → expect YouTube tab opens
- Keyboard: tab to pill → expect visible focus ring, Space/Enter toggles
- Lighthouse accessibility audit: expect no new violations

## Next Steps

1. Optional: `/ck:plan` for phased implementation breakdown
2. Implement `components/watch/hero-video.tsx`
3. Wire into `components/watch/watch-hero.tsx`
4. Smoke test cold Chrome + iOS Safari
5. Code review

## Unresolved Questions

None. Design fully specified.
