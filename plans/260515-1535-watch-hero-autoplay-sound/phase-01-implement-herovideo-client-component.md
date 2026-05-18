---
phase: 1
title: Implement HeroVideo client component
status: completed
priority: P2
effort: 1h
dependencies: []
---

# Phase 1: Implement HeroVideo client component

## Overview

Create a new Client Component that owns the `<video>` element, attempts unmuted autoplay on mount, gracefully falls back to muted on rejection, and renders an absolutely-positioned audio toggle pill for user control.

## Requirements

### Functional
- On mount, call `video.play()` with `muted=false`
- If promise rejects, set `muted=true` and retry `play()`
- Track state: `'sound-on' | 'muted'`
- Render toggle pill in bottom-right of video
- Pill click toggles mute state; if currently muted, also calls `play()` (gesture satisfies policy)
- Pill click must NOT bubble — `e.preventDefault(); e.stopPropagation();`

### Non-functional
- File size <100 lines
- Self-contained, no new dependencies
- Reuses existing utilities (`assetUrl`)
- Respects `prefers-reduced-motion` for pulse animation
- Server-component-safe: only this file uses `"use client"`

## Architecture

```
HeroVideo (client)
├─ useRef<HTMLVideoElement>
├─ useState<'sound-on' | 'muted'>('muted')   ← optimistic muted to avoid SSR flash
├─ useEffect(mount):
│    videoRef.current.muted = false
│    play().then(() => setState('sound-on'))
│         .catch(() => { videoRef.current.muted = true; play(); })
├─ <video ref autoPlay loop playsInline preload="metadata" />
└─ <button onClick={togglePill}>
     {state === 'muted' ? "🔊 Tap for sound" : <MuteIcon />}
   </button>
```

State machine:
```
mount → state='muted' (SSR default)
  ↓ effect: try unmuted play()
  ├─ resolve → setState('sound-on')
  └─ reject  → muted=true, retry play() → state stays 'muted'

pill click (state='muted')   → muted=false, play() then setState('sound-on')
pill click (state='sound-on') → muted=true,           setState('muted')
```

## Related Code Files

- **Create:** `components/watch/hero-video.tsx`
- **Read for context:** `components/watch/watch-hero.tsx` (lines 46–57 — current video JSX)
- **Read for context:** `lib/utils/asset-url.ts` (for `assetUrl` signature)

## Implementation Steps

1. Create `components/watch/hero-video.tsx` with `"use client"` directive at top.
2. Define props type:
   ```tsx
   type Props = {
     src: string;          // already passed through assetUrl by parent
     poster?: string;      // already passed through assetUrl by parent
     title: string;        // for aria-label
     className?: string;   // for parent to pass video classes
   };
   ```
3. Set up `useRef<HTMLVideoElement>(null)` and `useState<'sound-on' | 'muted'>('muted')`.
4. `useEffect(() => { ... }, [])`:
   - Guard against `videoRef.current === null`
   - Set `videoRef.current.muted = false`
   - Call `videoRef.current.play()` — `.then` → `setState('sound-on')`; `.catch` → set `muted=true`, call `play()` again (best-effort, ignore second rejection)
5. Render `<video ref={videoRef} src={src} poster={poster} autoPlay loop playsInline preload="metadata" aria-label={...} className={className} />`.
   - Do NOT include `muted` attribute in JSX (controlled via ref to avoid React re-render conflicts).
   - Initial `defaultMuted={false}` to match attempt; if browser ignores, the effect fallback covers it.
6. Render toggle button:
   - Position: `absolute bottom-4 right-4 z-10`
   - When `state === 'muted'`: bg-brand-coral, text-white, "🔊 Tap for sound" with `motion-safe:animate-pulse-subtle` (use existing or `animate-pulse` if no custom variant)
   - When `state === 'sound-on'`: bg-white/70 backdrop-blur, mute icon SVG, sized like a small chip
   - `aria-label`: `"Unmute video"` / `"Mute video"`
   - `aria-pressed`: `state === 'sound-on'`
   - `type="button"`
   - `onClick`: `e.preventDefault(); e.stopPropagation();` then:
     - If muted: set ref muted=false, call play(), setState('sound-on')
     - If sound-on: set ref muted=true, setState('muted')
7. Export named `HeroVideo`.

## Todo List

- [ ] Create file with `"use client"` directive
- [ ] Define `Props` type
- [ ] Implement state + ref + effect
- [ ] Render `<video>` element with attributes
- [ ] Render toggle button with two visual states
- [ ] Wire pill onClick handler with `preventDefault` + `stopPropagation`
- [ ] Verify file compiles (run `pnpm tsc --noEmit` or build)

## Success Criteria

- [ ] `components/watch/hero-video.tsx` exists, <100 lines
- [ ] TypeScript compiles with no errors
- [ ] No ESLint warnings beyond pre-existing
- [ ] Component is a self-contained Client Component (no parent state required)
- [ ] Toggle pill has `aria-label` + `aria-pressed`
- [ ] Click handler stops propagation

## Risk Assessment

| Risk | Mitigation |
|---|---|
| React `muted` attribute conflicts with ref-based control | Don't set `muted` in JSX; control entirely via `videoRef.current.muted` |
| `play()` race condition (mount effect + click handler) | Effect runs once on mount; click handler only fires after mount. No race. |
| iOS Safari ignores `muted=false` between play attempts | Acceptable — we always retry muted as fallback. User can still unmute via gesture-bound pill click. |
| Hydration mismatch from SSR rendering muted=true while client tries unmuted | We default to `state='muted'` in initial render to match SSR; effect upgrades. No mismatch. |

## Security Considerations

None. No user input, no network calls, no auth.
