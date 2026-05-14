# Brainstorm — Fix Character Pose Image Distortion

**Date:** 2026-05-14
**Status:** Design approved by user (mechanical bugfix)
**Scope:** Restore aspect ratio on the 4 character pose decoratives. Bug introduced 9 minutes ago.

---

## Root Cause

PNG assets in `public/assets/characters-position/` are **1280×720 (16:9 landscape)**, not square.

My implementation forced them to fixed-square dimensions:
```tsx
className="absolute bottom-4 -left-10 h-32 w-32 -rotate-6"
                                     ^^^^^^^^^^^
                                     w-32 (128px) + h-32 (128px) = forced square
```

Without `object-contain` or `object-cover`, the image stretched to fill 128×128, squashing the 16:9 source to 1:1.

---

## Fix

Drop forced-square. Use width-only and let height auto-compute. Update `Image` width/height props to match the natural 16:9 ratio for Next.js's optimization.

### `components/home/newsletter-cta.tsx`

```tsx
// Before
<Image src="/assets/characters-position/golden1.png" alt="" width={160} height={160}
       className="absolute bottom-4 -left-10 h-32 w-32 -rotate-6" />
<Image src="/assets/characters-position/husky2.png" alt="" width={160} height={160}
       className="absolute bottom-6 -right-10 h-32 w-32 rotate-6" />

// After
<Image src="/assets/characters-position/golden1.png" alt="" width={320} height={180}
       className="absolute bottom-4 -left-12 h-auto w-44 -rotate-6" />
<Image src="/assets/characters-position/husky2.png" alt="" width={320} height={180}
       className="absolute bottom-6 -right-12 h-auto w-44 rotate-6" />
```

Changes:
- `width={160} height={160}` → `width={320} height={180}` (16:9 intrinsic match → Next.js generates optimized image at correct ratio)
- `h-32 w-32` → `h-auto w-44` (176px wide, height auto = ~99px, preserves 16:9)
- `-left-10` (-40px) → `-left-12` (-48px) slight nudge since image is now wider than tall

### `components/watch/subscribe-card.tsx`

```tsx
// Same pattern
<Image src="/assets/characters-position/corgi1.png" alt="" width={320} height={180}
       className="absolute bottom-2 -left-10 h-auto w-40 -rotate-4" />
<Image src="/assets/characters-position/collie1.png" alt="" width={320} height={180}
       className="absolute bottom-4 -right-10 h-auto w-40 rotate-4" />
```

Changes:
- `width={140} height={140}` → `width={320} height={180}`
- `h-28 w-28` → `h-auto w-40` (160px wide, h auto = ~90px)
- `-left-8 -right-8` → `-left-10 -right-10` to account for wider image

---

## Effort

~3m. Single-class fix per Image (×4 instances) + props update.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Wider images (176/160px) overflow viewport on smaller xl screens (1024-1100px) | Low | Container is `max-w-3xl` (768px) centered. At 1024px viewport, gutter = 128px each side. Image extends `-12` (48px) beyond card edge → 176-48 = 128px sticks out from card = exactly fills gutter. Acceptable. |
| Aspect ratio still wrong if source has internal whitespace | None | Source PNGs are 1280×720 character cutouts; aspect is real, not padded. |
| `h-auto` with `-rotate-6` causes rotation pivot to shift | Low | Rotation pivot defaults to element center; minor visual offset acceptable. |

## Success Criteria

- Character poses render at 16:9 (no squashing)
- Visible character bodies look natural (head/body proportions preserved)
- No layout overflow at ≥lg breakpoint
- typecheck + lint clean

## Unresolved Questions

None.
