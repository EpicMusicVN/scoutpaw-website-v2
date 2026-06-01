---
phase: 1
title: Incoming Opacity Tween and VIP Buffer
status: completed
priority: P1
effort: 45m
dependencies: []
---

# Phase 1: Incoming Opacity Tween and VIP Buffer

## Overview

Add a second `useScroll` + `useTransform` pair to `character-section.tsx` tracking the scene's entry into viewport. Compose with the existing outgoing fade for a crossfade window. Add a `pt-24 md:pt-32` buffer above the newsletter on `/characters`.

## Requirements

**Functional:**
- Scene fades in from `opacity: 0.5` to `1.0` as it enters viewport (first viewport-height of scroll-into-scene)
- Existing outgoing fade `1.0 → 0.85` (Plan E) preserved
- Composite opacity = incoming × outgoing
- `useReducedMotion` short-circuits both — composite stays at 1
- Newsletter on `/characters` has visible breathing space (~96–128px) above it

**Non-functional:**
- File stays under 200 lines
- No regression to existing scroll choreography (scale stays 1 → 0.96)

## Architecture

```tsx
// Existing — outgoing
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start start", "end start"],
});
const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.96]);
const outgoingOpacity = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.85]);

// New — incoming
const { scrollYProgress: enterProgress } = useScroll({
  target: ref,
  offset: ["start end", "start start"],
});
const incomingOpacity = useTransform(enterProgress, [0, 1], reduce ? [1, 1] : [0.5, 1]);

// Composite opacity for full lifecycle
const opacity = useTransform(
  [incomingOpacity, outgoingOpacity],
  (values: number[]) => (values[0] ?? 1) * (values[1] ?? 1),
);
```

The `motion.div` style consumes `{ scale, opacity, backgroundColor }` — opacity is now the composite.

**Note on offsets:**
- `["start end", "start start"]` — tracks from "section's top touches viewport's bottom" → "section's top touches viewport's top". This is the section's ENTRY window (0–100% as it enters).
- `["start start", "end start"]` — tracks from "section's top at viewport's top" → "section's bottom at viewport's top". This is the section's EXIT window.

Together: entry phase fades in, sticky phase holds at 1.0, exit phase fades out.

## Related Code Files

- **Modify:** `components/characters/character-section.tsx` — add second useScroll + composite opacity
- **Modify:** `app/characters/page.tsx` — add `<div className="pt-24 md:pt-32">` wrapper around newsletter ScrollReveal

## Implementation Steps

1. **Open** `components/characters/character-section.tsx` (currently from Plan E).
2. **Add** the incoming scroll + opacity tween after the existing outgoing tween:
   ```tsx
   const { scrollYProgress: enterProgress } = useScroll({
     target: ref,
     offset: ["start end", "start start"],
   });
   const incomingOpacity = useTransform(
     enterProgress,
     [0, 1],
     reduce ? [1, 1] : [0.5, 1],
   );
   ```
3. **Rename** existing `opacity` motion value to `outgoingOpacity`:
   ```diff
   - const opacity = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.85]);
   + const outgoingOpacity = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.85]);
   ```
4. **Add** the composite opacity:
   ```tsx
   const opacity = useTransform(
     [incomingOpacity, outgoingOpacity],
     (values: number[]) => (values[0] ?? 1) * (values[1] ?? 1),
   );
   ```
5. **Confirm** motion.div still uses `style={{ scale, opacity, backgroundColor: theme.surfaceTint }}` — no caller-side change needed (the `opacity` variable name is preserved).
6. **Open** `app/characters/page.tsx`.
7. **Wrap newsletter** in buffer container:
   ```diff
   - <ScrollReveal>
   -   <NewsletterCTA tag="characters-newsletter" />
   - </ScrollReveal>
   + <div className="pt-24 md:pt-32">
   +   <ScrollReveal>
   +     <NewsletterCTA tag="characters-newsletter" />
   +   </ScrollReveal>
   + </div>
   ```
8. **Typecheck + lint** — must pass.
9. **Smoke test** at `/characters` — scroll through, confirm:
   - Each scene fades IN as it enters (not jarring hard cut)
   - Each scene fades OUT as it leaves (Plan E behavior preserved)
   - Newsletter has clear breathing room above it
   - `prefers-reduced-motion` flat-lines transforms

## Success Criteria

- [ ] Each scene crossfades with the next (visible overlap window)
- [ ] Plan E outgoing fade preserved
- [ ] Composite opacity multiplication correct (always 1 under reduced-motion)
- [ ] Newsletter visibly buffered from the last scene
- [ ] Typecheck + lint clean
- [ ] File stays under 200 lines

## Risk Assessment

- **Risk:** Composite opacity `0.5 × 0.85 = 0.425` if both transitions overlap mid-scroll. *Mitigation:* the entry transition completes BEFORE the exit transition begins under normal scroll speed (sticky pinning ensures only one is active at a time). Verify live; tighten incoming range to `[0, 0.5]` of enterProgress if overlap problematic.
- **Risk:** `useTransform` array form TypeScript types. *Mitigation:* the `(values: number[])` annotation handles array signature. Test compile.
- **Risk:** Two `useScroll` instances per scene — perf. *Mitigation:* framer-motion shares scroll source; 10 listeners across 5 scenes is negligible.

## Security Considerations

None.
