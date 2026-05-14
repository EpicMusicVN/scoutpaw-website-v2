---
phase: 3
title: Section Decorations
status: completed
priority: P2
effort: 15m
dependencies: []
---

# Phase 3: Section Decorations

## Overview

Add 6 hand-placed SVG dog-themed icons (paw, bone, ball) behind the cards in the "Step Into the Pack" section. Single decoration layer at 10% opacity, varied rotation, pointer-events-none. Three small SVG components inlined at file bottom.

## Requirements

- Functional: Section bg shows subtle dog-themed pattern that doesn't compete with cards or text.
- Non-functional: Single decoration layer; not a tiled CSS pattern. SVGs inline (no new files).

## Architecture

**Section wrapper update:**
- Current: `<section className="mx-auto max-w-hero px-4 py-20 md:px-8 md:py-28">`
- Target: `<section className="relative mx-auto max-w-hero overflow-hidden px-4 py-20 md:px-8 md:py-28">`
- Add `relative` for positioning context; `overflow-hidden` to clip out-of-bounds icons at narrow widths

**Decoration layer (inserted as first child of section, before `<header>`):**
```tsx
<div
  aria-hidden="true"
  className="pointer-events-none absolute inset-0 opacity-[0.10] text-warm-text"
>
  <DecorPaw className="absolute left-[5%] top-[8%] h-10 w-10 -rotate-12" />
  <DecorBone className="absolute right-[8%] top-[14%] h-12 w-12 rotate-[18deg]" />
  <DecorBall className="absolute left-[10%] top-[48%] h-8 w-8 rotate-[8deg]" />
  <DecorPaw className="absolute right-[6%] top-[52%] h-9 w-9 -rotate-[20deg]" />
  <DecorBone className="absolute left-[8%] bottom-[12%] h-10 w-10 -rotate-[8deg]" />
  <DecorPaw className="absolute right-[14%] bottom-[10%] h-12 w-12 rotate-[12deg]" />
</div>
```

**3 inline SVG components at file bottom:**

```tsx
function DecorPaw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="16" cy="22" rx="6.5" ry="5.5" />
      <ellipse cx="7" cy="13" rx="2.5" ry="3.5" />
      <ellipse cx="13" cy="9" rx="2.5" ry="3.5" />
      <ellipse cx="19" cy="9" rx="2.5" ry="3.5" />
      <ellipse cx="25" cy="13" rx="2.5" ry="3.5" />
    </svg>
  );
}

function DecorBone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="6" cy="9" r="4" />
      <circle cx="6" cy="15" r="4" />
      <circle cx="26" cy="17" r="4" />
      <circle cx="26" cy="23" r="4" />
      <path d="M9 11 L23 19 L23 21 L9 13 Z" />
    </svg>
  );
}

function DecorBall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="13" />
      <path d="M5 12 Q16 8 27 12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M5 20 Q16 24 27 20" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}
```

Note ball icon uses `stroke="currentColor"` (not white) so it remains visible at low opacity over cream bg.

## Related Code Files

- Modify: `components/home/menu-cards.tsx`

## Implementation Steps

1. Update section opening:
   ```diff
   - <section className="mx-auto max-w-hero px-4 py-20 md:px-8 md:py-28">
   + <section className="relative mx-auto max-w-hero overflow-hidden px-4 py-20 md:px-8 md:py-28">
   ```

2. Insert decoration layer as first child of section (before `<header>`).

3. Append 3 SVG components (DecorPaw, DecorBone, DecorBall) at the bottom of the file.

4. Verify imports unchanged (no new deps needed — pure inline SVG).

## Success Criteria

- [x] 6 decorations visible at ~10% opacity behind cards.
- [x] Decorations don't interfere with card click/hover (pointer-events-none).
- [x] Decorations don't bleed past section bounds (overflow-hidden).
- [x] At 360px mobile: decorations still visible but don't crowd content.
- [x] At 1440px desktop: decorations sit in negative space around the 3-card row.
- [x] No console warnings or layout shift.

## Risk Assessment

- **Risk:** 10% opacity in `text-warm-text` (`--warm-text` color) may be too faint on cream bg. Mitigation: bump to `opacity-[0.12]` or `opacity-[0.15]`.
- **Risk:** Decorations overlap cards if section is narrow and positions are %-based. `pointer-events-none` ensures cards stay clickable; visually decorations show through if any overlap (still pleasant if subtle).
- **Risk:** Inline SVG component definitions at file bottom — file grows ~30 lines. Acceptable.
- **Risk:** Tailwind arbitrary opacity `opacity-[0.10]` — JIT-supported in v3.4. Verify in lint.
