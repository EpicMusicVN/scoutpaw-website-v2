# Brainstorm — Character Pose Decoratives (Newsletter + Watch)

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Add 2 corner pose decoratives to Newsletter card. Add 2 corner pose decoratives to Watch SubscribeCard. Migrate pose assets into `public/`.

---

## Asset Inventory

`assets/characters-position/` (needs to move to `public/assets/characters-position/`):

| Breed | Character | Files |
|---|---|---|
| Golden Retriever | Buddy | golden1.png, golden2.png, golden3.png |
| Husky | Max | husky1.png, husky2.png, husky3.png |
| Collie | Bella | collie1.png, collie2.png |
| Corgi | Oscar | corgi1.png, corgi2.png, corgi3.png |
| Poodle | Rocky | poodle1.png, poodle2.png |

13 PNGs total. Files NOT currently web-accessible (Next.js needs `public/`).

---

## Locked Decisions

| # | Item | Decision |
|---|---|---|
| 1 | Scope | Both Newsletter + Watch (SubscribeCard) |
| 2 | Newsletter density | 2 corner poses |
| 3 | Watch density | 2 corner poses on SubscribeCard (mirrors Newsletter pattern) |
| 4 | Mobile behavior | Hidden on mobile (`hidden md:block`) to save space |
| 5 | Interaction | Pure decorative — `pointer-events-none`, `aria-hidden` |

---

## File-by-File Change Set

### 0. Move asset files (P0)

```
mkdir public/assets/characters-position
mv assets/characters-position/*.png public/assets/characters-position/
```

### 1. `components/home/newsletter-cta.tsx` — 2 corner poses

Add 2 character pose images positioned at the bottom corners of the white card, peeking from below the card edge:

```tsx
// Inside the card div (after CornerPaws, before form):
<div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
  {/* Bottom-left: Golden peek */}
  <Image
    src="/assets/characters-position/golden1.png"
    alt=""
    width={140}
    height={140}
    className="absolute -bottom-6 -left-10 h-32 w-32 -rotate-6"
  />
  {/* Bottom-right: Husky peek */}
  <Image
    src="/assets/characters-position/husky2.png"
    alt=""
    width={140}
    height={140}
    className="absolute -bottom-4 -right-10 h-32 w-32 rotate-6"
  />
</div>
```

**Card must allow overflow-visible** for the poses to peek beyond rounded edges:
- Change `overflow-hidden` → keep at outer wrapper for the CornerPaws clipping, but use a separate inner div with `overflow-visible` for the poses
- OR: Move poses OUTSIDE the card div, positioned relative to the section, anchored to the card's bounding box

Simplest path: poses sit at `absolute` inside the SECTION (max-w-3xl wrapper) not the card. They overlap the card edge from outside. Section already has `relative` from prior cook.

Final structure:
```tsx
<section className="relative mx-auto max-w-3xl scroll-mt-24 px-4 pt-4 pb-16 md:px-8 md:pt-4 md:pb-20">
  <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-surface px-6 py-10 text-center shadow-cozy-md md:px-12 md:py-14">
    <CornerPaws />
    <div className="relative">{/* form content */}</div>
  </div>

  {/* Pose decoratives — sit at the section level, anchored to card edges */}
  <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
    <Image src="/assets/characters-position/golden1.png" alt="" width={140} height={140}
           className="absolute bottom-0 -left-8 h-32 w-32 -rotate-6" />
    <Image src="/assets/characters-position/husky2.png" alt="" width={140} height={140}
           className="absolute bottom-2 -right-8 h-32 w-32 rotate-6" />
  </div>
</section>
```

Adjust offsets visually after first render.

### 2. `components/watch/subscribe-card.tsx` — 2 corner poses

Same pattern. Choose different poses for variety (use Corgi + Collie or Poodle + Husky):

```tsx
// At section level, similar to Newsletter
<section className="relative mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
  <div className="rounded-[2rem] border border-ink/10 bg-surface px-6 py-10 text-center shadow-sm md:px-12 md:py-14">
    {/* existing content unchanged */}
  </div>

  <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
    <Image src="/assets/characters-position/corgi1.png" alt="" width={120} height={120}
           className="absolute -bottom-2 -left-6 h-28 w-28 -rotate-4" />
    <Image src="/assets/characters-position/collie1.png" alt="" width={120} height={120}
           className="absolute -bottom-1 -right-6 h-28 w-28 rotate-4" />
  </div>
</section>
```

---

## Phased Execution

| Phase | Item | Effort |
|---|---|---|
| P1 | Move 13 PNGs to `public/assets/characters-position/` | 2m |
| P2 | Add 2 corner poses to NewsletterCTA | 15m |
| P3 | Add 2 corner poses to SubscribeCard | 10m |

**Total: ~25m**

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Poses overflow viewport horizontally on tablet (768-900px) | Medium | Use `hidden md:block` shows from md (768px). At md the card is `max-w-3xl` (768px) — poses' `-left-8 -right-8` (32px) extend total to ~832px, which exceeds 768px viewport. Need to test; may need `lg:block` threshold instead. |
| Pose PNG transparency edges look jagged on cyan body bg | Low | Assets are character cutouts; high-quality PNGs expected. Verify visually. |
| 2 poses per CTA × 2 CTAs feels like 4 characters total stacked vertically when scrolling | Low | They're at different scroll positions; user only sees 2 at a time. |
| Card hover effects (if any) interfere with pose overflow | None | Both NewsletterCTA and SubscribeCard are static (no card-level hover). |
| User reverses this in 10 min like other recent additions | Honest risk | Brutal accepted; user wants to proceed. Easy to revert if needed (just delete the decorative `<div aria-hidden>` blocks). |

---

## Success Criteria

- 13 PNG files in `public/assets/characters-position/`
- NewsletterCTA shows golden1 + husky2 at bottom corners (md+)
- SubscribeCard shows corgi1 + collie1 at bottom corners (md+)
- Mobile: no poses visible
- typecheck + lint + build clean

---

## Out of Scope

- VideoRail / ExploreVideos / OurChannels decoratives
- Hero / home decoratives
- Animation (no float / drift; static decor only)
- Per-character context-aware poses (e.g., "sleeping pose near calming playlist")
- Asset compression / optimization

---

## Unresolved Questions

1. Tablet breakpoint (768-1023px) may be tight — poses peek `-32px` beyond a 768px-wide card. Test visually; bump threshold to `lg:block` (1024px) if overflow causes horizontal scroll.
